/**
 * Недельная лига (вариант А владельца, 2026-11-15): одна общая таблица недели для всех игроков с порогом входа,
 * призы Złotki за места в конце недели, поздравление в боте и окно награды в игре.
 *
 * Неделя — по Варшаве для всех (`leagueWeek`). Порядок мест: XP недели по убыванию, при равенстве выше тот, кто набрал раньше.
 * Скрытые из рейтинга (настройка) и заблокированные не видны и призов не получают.
 */
import { and, asc, desc, eq, gt, gte, isNull, sql } from 'drizzle-orm';
import { LEAGUE_MIN_XP, LEAGUE_PRIZE_MIN_XP, LEAGUE_TZ, leaguePrize, leagueWeek, localHour } from '@polski-go/shared';
import { atomic, db, type Stmt } from '../db';
import { leaderboards, leagueAwards, leagueWeeks, userSettings, users } from '../db/schema';
import { sendCard } from '../bot/send';
import { notMuted } from '../bot/mute';
import { grantZlotki } from './rewards';

/** Видимые в таблице недели: не скрылись из рейтинга и не заблокированы. */
export const visibleInLeague = and(eq(userSettings.showInLeaderboard, true), eq(users.isBanned, false));

/** Таблица недели: игроки с XP недели от порога, по местам. */
export async function rankedWeek(week: string, limit = 50) {
  return db
    .select({ userId: leaderboards.userId, xp: leaderboards.xp })
    .from(leaderboards)
    .innerJoin(users, eq(users.id, leaderboards.userId))
    .innerJoin(userSettings, eq(userSettings.userId, leaderboards.userId))
    .where(and(eq(leaderboards.periodKey, week), gte(leaderboards.xp, LEAGUE_MIN_XP), visibleInLeague))
    .orderBy(desc(leaderboards.xp), asc(leaderboards.updatedAt))
    .limit(limit);
}

/** Призёры прошлой недели (для экрана рейтинга): места и суммы из итогов. */
export async function weekWinners(week: string, limit = 3) {
  return db.select().from(leagueAwards).where(eq(leagueAwards.week, week)).orderBy(asc(leagueAwards.rank)).limit(limit);
}

/**
 * Подвести неделю: призы за места 1–10 (от LEAGUE_PRIZE_MIN_XP за неделю), строки итогов, отметка «неделя подведена».
 * Повторный вызов ничего не делает: неделя уже подведена; а если два запуска совпали — начисления защищены ключами идемпотентности.
 */
export async function settleLeagueWeek(week: string, now = new Date()) {
  const done = await db.select({ week: leagueWeeks.week }).from(leagueWeeks).where(eq(leagueWeeks.week, week));
  if (done.length) return { settled: false as const, awards: [] };
  const ranked = await rankedWeek(week, 10);
  const awards = ranked
    .map((r, i) => ({ userId: r.userId, rank: i + 1, xp: r.xp, zlotki: r.xp >= LEAGUE_PRIZE_MIN_XP ? leaguePrize(i + 1) : 0 }))
    .filter((a) => a.zlotki > 0);
  const players = (await rankedWeek(week, 100_000)).length;
  const stmts: Stmt[] = [db.insert(leagueWeeks).values({ week, settledAt: now, players }).onConflictDoNothing()];
  for (const a of awards) {
    stmts.push(...grantZlotki(a.userId, a.zlotki, 'league_prize', `league:${week}:${a.userId}`, now).stmts);
    stmts.push(db.insert(leagueAwards).values({ week, userId: a.userId, rank: a.rank, xp: a.xp, zlotki: a.zlotki, createdAt: now }).onConflictDoNothing());
  }
  await atomic(stmts);
  return { settled: true as const, awards };
}

/** По расписанию: подвести прошедшую неделю (неделя, в которую попадал момент ровно семь суток назад). Текущая неделя не трогается. */
export async function settleDueLeagueWeek(now = new Date()) {
  const previous = leagueWeek(new Date(now.getTime() - 7 * 86_400_000));
  if (previous === leagueWeek(now)) return { settled: false as const, awards: [] };
  return settleLeagueWeek(previous, now);
}

const AWARD_TEXT: Record<string, (a: { rank: number; xp: number; zlotki: number }) => { text: string; button: string }> = {
  ru: (a) => ({
    text: `🏆 Итоги недели в POLSKI GO: твоё место — ${a.rank} (${a.xp} XP).\nНаграда +${a.zlotki} zł уже в кошельке.\n\nНовая неделя началась — поборись за 1-е место!`,
    button: 'Открыть рейтинг',
  }),
  uk: (a) => ({
    text: `🏆 Підсумки тижня в POLSKI GO: твоє місце — ${a.rank} (${a.xp} XP).\nНагорода +${a.zlotki} zł уже в гаманці.\n\nНовий тиждень почався — поборися за 1-ше місце!`,
    button: 'Відкрити рейтинг',
  }),
  en: (a) => ({
    text: `🏆 Week results in POLSKI GO: you placed #${a.rank} (${a.xp} XP).\nYour +${a.zlotki} zł reward is in your wallet.\n\nA new week has started — go for 1st place!`,
    button: 'Open the leaderboard',
  }),
};
/** Постер призёру (apps/web/public/bot/league, scripts/build-league-art.mjs): только 1–3 место и только ru / uk — на постере надписи на этом языке. */
export function leaguePoster(rank: number, lang: string): string | null {
  return rank >= 1 && rank <= 3 && (lang === 'ru' || lang === 'uk') ? `league/${lang}/place-${rank}.jpg` : null;
}

/** Поздравляем только со свежими итогами: старые (после простоя) остаются в игре окном, без сообщения. */
const NOTIFY_WINDOW_MS = 3 * 86_400_000;

/**
 * Поздравление — только днём по времени игрока (владелец, 2026-11-15: «не нужно присылать ночью, лучше утром, чтобы не будить»).
 * Итоги подводятся в понедельник около полуночи и Złotki приходят сразу, а сообщение ждёт 9:00 у игрока (пояс из настроек).
 * Окно до 21:00 — запас, если расписание пропустило утро; ночью сообщение не уходит никогда.
 */
export const LEAGUE_NOTIFY_HOURS = { from: 9, to: 21 } as const;
export function leagueNotifyDaytime(now: Date, timeZone: string | null): boolean {
  const h = localHour(now, timeZone ?? LEAGUE_TZ) ?? localHour(now, LEAGUE_TZ) ?? 12;
  return h >= LEAGUE_NOTIFY_HOURS.from && h < LEAGUE_NOTIFY_HOURS.to;
}

/**
 * Поздравить призёров в боте (порция в пределах `budget` вызовов Bot API). Каждый призёр — один раз (`notified_at`).
 * Как у напоминаний: только те, кому бот может писать (не гость, уведомления включены, без паузы после 403).
 * Только днём по времени игрока (`leagueNotifyDaytime`): ночью призёр пропускается без отметки и получит сообщение утром.
 */
export async function sendLeagueAwardMessages(now = new Date(), budget = 50, stats = { calls: 0 }) {
  if (budget <= 0) return 0;
  const due = await db
    .select({
      week: leagueAwards.week, userId: leagueAwards.userId, rank: leagueAwards.rank, xp: leagueAwards.xp, zlotki: leagueAwards.zlotki,
      telegramId: users.telegramId, lang: userSettings.uiLanguage, tz: userSettings.timezone,
      // Как у напоминаний: не гость, не заблокирован, уведомления включены, нет паузы после отказа Telegram (bot/mute.ts).
      reachable: sql<number>`CASE WHEN ${and(eq(users.isBanned, false), gt(users.telegramId, 0), eq(userSettings.notificationsEnabled, true), notMuted(now))} THEN 1 ELSE 0 END`,
    })
    .from(leagueAwards)
    .innerJoin(users, eq(users.id, leagueAwards.userId))
    .innerJoin(userSettings, eq(userSettings.userId, leagueAwards.userId))
    .where(and(isNull(leagueAwards.notifiedAt), gt(leagueAwards.createdAt, new Date(now.getTime() - NOTIFY_WINDOW_MS))))
    .orderBy(asc(leagueAwards.rank))
    // Призёров за неделю не больше десяти, окно — три дня: запас, чтобы ночные (пропущенные) не заняли место дневных.
    .limit(Math.max(budget, 100));
  let sent = 0;
  for (const a of due) {
    if (stats.calls >= budget) break;
    if (!leagueNotifyDaytime(now, a.tz)) continue;
    // Отметка до отправки: при сбое посередине сообщение не уйдёт второй раз (поздравление — не обязательство, окно в игре всё равно покажет награду).
    await db.update(leagueAwards).set({ notifiedAt: now }).where(and(eq(leagueAwards.week, a.week), eq(leagueAwards.userId, a.userId)));
    if (!a.reachable) continue;
    const copy = (AWARD_TEXT[a.lang] ?? AWARD_TEXT.uk)(a);
    try {
      // 1–3 место с русским или украинским интерфейсом — постер владельца своего места (надписи на постере на языке игрока);
      // фото не ушло из-за самой картинки — тот же текст сообщением (sendCard). Остальным — текст.
      await sendCard({ chatId: Number(a.telegramId), stats }, { text: copy.text, buttons: [{ label: copy.button, screen: 'league' }] }, leaguePoster(a.rank, a.lang));
      sent++;
    } catch {
      /* игрок мог заблокировать бота — награда уже в кошельке и в окне игры */
    }
  }
  return sent;
}

/** Последняя непросмотренная награда за неделю (окно в игре). Старше четырёх недель — не показываем. */
export async function unseenLeagueAward(userId: string, now = new Date()) {
  const since = leagueWeek(new Date(now.getTime() - 28 * 86_400_000));
  const rows = await db
    .select({ week: leagueAwards.week, rank: leagueAwards.rank, xp: leagueAwards.xp, zlotki: leagueAwards.zlotki })
    .from(leagueAwards)
    .where(and(eq(leagueAwards.userId, userId), isNull(leagueAwards.seenAt), gte(leagueAwards.week, since)))
    .orderBy(desc(leagueAwards.week))
    .limit(1);
  return rows[0] ?? null;
}

export async function markLeagueAwardSeen(userId: string, week: string, now = new Date()) {
  await db.update(leagueAwards).set({ seenAt: now }).where(and(eq(leagueAwards.userId, userId), eq(leagueAwards.week, week), isNull(leagueAwards.seenAt)));
}
