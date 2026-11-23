/**
 * Фонові задачі (Cron Trigger кожні 15 хв):
 *  • навчальні нагадування — картинка + текст + кнопка Mini App, у годину, яку обрав користувач, не частіше разу на день;
 *  • розсилки з адмінки — частинами, щоб не перевищити ліміт підзапитів Worker;
 *  • запрошення до швидкого питання (`bot/quiz/invites.ts`) — не частіше разу на день і лише тим, хто вже відповідав;
 *  • самоперевірка бота (`bot/maintain.ts`): webhook, callback_query, меню команд — раз на годину;
 *  • прибирання: оброблені update_id (3 дні), раунди швидких питань (30 днів).
 * Надсилається лише користувачам, які погодилися на сповіщення (notifications_enabled).
 *
 * Доставка нагадування (таблиця notification_log, ключ (user_id, kind, day)):
 *  1. Рядок PENDING створює той запуск, чий INSERT виконався першим (унікальний ключ), — паралельний cron пропускає користувача.
 *  2. Telegram прийняв — SENT. Явна відмова (429, 5xx) — FAILED з next_attempt_at і не більше NOTIFY_MAX_ATTEMPTS спроб
 *     в межах того ж місцевого дня; 400/401/404 — FAILED без повтору; 403 — BLOCKED (тиша до 30 днів, але вона знімається, щойно
 *     гравець напише боту чи збереже налаштування — `bot/mute.ts`).
 *  3. Невідомий результат (тайм-аут, обрив мережі, воркер упав після відправки, lease прострочено) — UNKNOWN: Telegram не має
 *     ключа ідемпотентності, тому таке нагадування не повторюється автоматично (краще пропустити день, ніж надіслати двічі).
 */
import { processAudioJobs } from './services/audio-jobs';
import { purgeErrors } from './services/error-log';
import { sendLeagueAwardMessages, settleDueLeagueWeek } from './services/league';
import { purgeLinkCodes } from './services/standalone-auth';
import { campaignMarkup, campaignRecipients, campaignText } from './services/campaigns';
import { and, asc, eq, gt, isNotNull, isNull, lt, lte, ne, notExists, or, sql } from 'drizzle-orm';
import { dayDiff, dayKey, effectiveStreak } from '@polski-go/shared';
import { atomic, db } from './db';
import { appState, botQuizRounds, notificationCampaigns, notificationLog, playerProgress, telegramUpdates, userSettings, users } from './db/schema';
import { botApi, TelegramError } from './lib/telegram';
import { config } from './env';
import { pruneUsage } from './services/quota';
import { pruneLoginFailures } from './services/admin-guard';
import { reminderImage } from './bot/catalog';
import { COPY, type Card, type ReminderKind } from './bot/copy';
import { pickLang } from './bot/data';
import { maintainBot } from './bot/maintain';
import { notMuted } from './bot/mute';
import { sendQuizInvites } from './bot/quiz/invites';
import { sendCard } from './bot/send';
import { ensurePlan } from './bot/daily/plan';
import { readDailyState, warsawDay } from './bot/daily/state';
import { dailyEligibility, personByTelegramId } from './bot/daily/audience';
import { dailyReplacesReminders } from './bot/daily/send';

/** Безкоштовний Worker має ліміт 50 підзапитів за виклик: бюджет рахується у викликах Bot API (фото + запасний текст — два). */
const SEND_BUDGET = 35;
/** Скільки воркер володіє рядком PENDING, поки надсилає; після цього результат вважається невідомим. */
const LEASE_MS = 5 * 60_000;
export const NOTIFY_MAX_ATTEMPTS = 3;
/** Пауза перед повтором після 1-ї та 2-ї спроби (якщо Telegram не вказав retry_after). */
const RETRY_DELAY_MS = [5 * 60_000, 20 * 60_000];
/** Скільки днів без занять — і нагадування стає «повернення». */
const RETURN_AFTER_DAYS = 3;
/** Серія від цього значення — окреме нагадування про серію (серія в 1 день — звичайне нагадування). */
const STREAK_MIN = 2;
const UPDATES_KEEP_MS = 3 * 86_400_000;
const QUIZ_ROUNDS_KEEP_MS = 30 * 86_400_000;

const REMINDER_KINDS: readonly ReminderKind[] = ['lesson', 'streak', 'return'];

/** Який із трьох сценаріїв пасує користувачеві (лише реальні дані: серія й остання активність). */
export function pickReminderKind(streak: number, lastActiveDay: string | null, today: string): ReminderKind {
  if (lastActiveDay && dayDiff(lastActiveDay, today) >= RETURN_AFTER_DAYS) return 'return';
  return streak >= STREAK_MIN ? 'streak' : 'lesson';
}

/** Картка нагадування: текст сценарію, кнопка Mini App і підказка, як вимкнути нагадування. */
export function reminderCard(lang: string, kind: ReminderKind, streak: number): Card {
  const copy = COPY[pickLang(lang, null)];
  const card = kind === 'streak' ? copy.reminder.streak(streak) : kind === 'return' ? copy.reminder.return() : copy.reminder.lesson();
  return { ...card, text: `${card.text}\n\n${copy.stopHint}` };
}

/** Місцева година й ключ дня в поясі користувача; невідомий пояс — null (такого користувача пропускаємо). */
function localClock(now: Date, timeZone: string): { hour: number; day: string } | null {
  try {
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', hourCycle: 'h23' }).format(now));
    return { hour, day: dayKey(now, timeZone) };
  } catch {
    return null;
  }
}

/** D1 приймає до 100 параметрів на запит; на один пояс їх 5. */
const TZ_PER_QUERY = 16;

type Target = { logId: string; telegramId: number; lang: string; kind: ReminderKind; streak: number; attempt: number; hour: number | null };

/** Надіслати й записати результат у журнал. true — Telegram прийняв повідомлення. */
async function deliver(t: Target, now: Date, stats: { calls: number }): Promise<boolean> {
  try {
    const sent = await sendCard({ chatId: t.telegramId, stats }, reminderCard(t.lang, t.kind, t.streak), reminderImage(t.kind));
    await db
      .update(notificationLog)
      .set({ status: 'SENT', method: sent.method, telegramMessageId: sent.messageId, sentAt: now, leaseUntil: null, nextAttemptAt: null, error: sent.photoError ? `photo: ${sent.photoError}`.slice(0, 200) : null, updatedAt: now })
      .where(and(eq(notificationLog.id, t.logId), eq(notificationLog.status, 'PENDING')));
    return true;
  } catch (e) {
    await recordFailure(t, e, now);
    return false;
  }
}

async function recordFailure(t: Target, e: unknown, now: Date) {
  let status: 'FAILED' | 'BLOCKED' | 'UNKNOWN' = 'FAILED';
  let retryAt: Date | null = null;
  if (e instanceof TelegramError) {
    if (e.code === 403) status = 'BLOCKED';
    else if (e.ambiguous) status = 'UNKNOWN';
    else if ((e.code === 429 || e.code >= 500) && t.attempt < NOTIFY_MAX_ATTEMPTS) {
      const delay = Math.max((e.retryAfter ?? 0) * 1000, RETRY_DELAY_MS[Math.min(t.attempt, RETRY_DELAY_MS.length) - 1]);
      retryAt = new Date(now.getTime() + delay);
    }
  }
  console.warn('reminder failed', t.logId, status, (e as Error).message);
  try {
    await db
      .update(notificationLog)
      .set({ status, error: String((e as Error).message ?? e).slice(0, 200), leaseUntil: null, nextAttemptAt: retryAt, updatedAt: now })
      .where(and(eq(notificationLog.id, t.logId), eq(notificationLog.status, 'PENDING')));
  } catch (dbError) {
    // Рядок лишиться PENDING: після закінчення lease стане UNKNOWN, без повторної відправки.
    console.warn('reminder log update failed', t.logId, (dbError as Error).message);
  }
}

/** Прострочені lease: воркер міг упасти після відправки — результат невідомий, не повторюємо. */
async function expireLeases(now: Date) {
  await db
    .update(notificationLog)
    .set({ status: 'UNKNOWN', error: 'lease_expired', leaseUntil: null, updatedAt: now })
    .where(and(eq(notificationLog.kind, 'daily_reminder'), eq(notificationLog.status, 'PENDING'), lt(notificationLog.leaseUntil, now)));
}

/** Повтор після явної відмови Telegram: лише в той самий місцевий день і поки користувач згоден та ще не вчився. */
async function retryFailed(now: Date, budget: number, stats: { calls: number }): Promise<number> {
  const rows = await db
    .select({
      log: notificationLog,
      telegramId: users.telegramId,
      banned: users.isBanned,
      lang: userSettings.uiLanguage,
      tz: userSettings.timezone,
      enabled: userSettings.notificationsEnabled,
      hour: userSettings.reminderHour,
      p: playerProgress,
    })
    .from(notificationLog)
    .innerJoin(users, eq(users.id, notificationLog.userId))
    .innerJoin(userSettings, eq(userSettings.userId, users.id))
    .leftJoin(playerProgress, eq(playerProgress.userId, users.id))
    .where(
      and(
        eq(notificationLog.kind, 'daily_reminder'),
        eq(notificationLog.status, 'FAILED'),
        isNotNull(notificationLog.nextAttemptAt),
        lte(notificationLog.nextAttemptAt, now),
        lt(notificationLog.attempts, NOTIFY_MAX_ATTEMPTS),
      ),
    )
    .orderBy(asc(notificationLog.nextAttemptAt))
    .limit(Math.max(1, budget));
  let sent = 0;
  for (const r of rows) {
    if (stats.calls >= budget) break;
    const today = dayKey(now, r.tz);
    const skip = r.log.day !== today ? 'day_passed' : !r.enabled || r.banned ? 'consent_withdrawn' : r.p?.lastActiveDay === today ? 'already_active' : null;
    const gate = skip
      ? { status: 'SKIPPED' as const, error: skip, nextAttemptAt: null }
      : { status: 'PENDING' as const, attempts: r.log.attempts + 1, leaseUntil: new Date(now.getTime() + LEASE_MS), nextAttemptAt: null };
    // Захоплення повтору: лише той запуск, який побачив цей стан рядка (attempts), отримає його.
    const claimed = await db
      .update(notificationLog)
      .set({ ...gate, updatedAt: now })
      .where(and(eq(notificationLog.id, r.log.id), eq(notificationLog.status, 'FAILED'), eq(notificationLog.attempts, r.log.attempts)))
      .returning({ id: notificationLog.id });
    if (!claimed.length || skip) continue;
    const kind = REMINDER_KINDS.find((k) => k === r.log.template) ?? 'lesson';
    const streak = effectiveStreak(r.p?.streakCurrent ?? 0, r.p?.lastActiveDay ?? null, today, { premium: false, shieldDay: null, freezes: r.p?.streakFreezes ?? 0 });
    if (await deliver({ logId: r.log.id, telegramId: r.telegramId, lang: r.lang, kind, streak, attempt: r.log.attempts + 1, hour: r.hour }, now, stats)) sent++;
  }
  return sent;
}

/** Повертає кількість нагадувань, які Telegram прийняв. `budget` — найбільше викликів Bot API за запуск. */
/**
 * stats.complete — после прохода не осталось никого, кому напоминание положено сейчас (все кандидаты разобраны, бюджет не кончился).
 * runScheduled по нему до конца часа не перебирает пояса и кандидатов заново (лимит чтения D1, 2026-11-23); opts.scan = false —
 * только снять зависшие захваты и повторить неудачные отправки.
 */
export async function sendReminders(now = new Date(), budget = SEND_BUDGET, stats: { calls: number; complete?: boolean } = { calls: 0 }, opts: { scan?: boolean } = {}) {
  stats.complete = false;
  if (budget <= 0) return 0;
  // Пока идёт рассылка вопроса дня, напоминание получают только те, кому вопрос не придёт (выключили его, пауза, нет чата):
  // одно сообщение в день. Таблиц вопроса дня может ещё не быть (миграция 0018) — тогда всё как раньше.
  const dailyOn = await dailyReplacesReminders(now).catch(() => false);
  await expireLeases(now);
  let sent = await retryFailed(now, budget, stats);
  if (opts.scan === false) return sent;
  let complete = true;
  // 1) Які пояси зараз у годині нагадування: DISTINCT (пояс, година) — кілька рядків замість тисяч користувачів.
  const pairs = await db
    .selectDistinct({ tz: userSettings.timezone, hour: userSettings.reminderHour })
    .from(userSettings)
    .where(and(eq(userSettings.notificationsEnabled, true), isNotNull(userSettings.reminderHour)));
  const due = new Map<string, { hour: number; day: string }>();
  for (const p of pairs) {
    const clock = localClock(now, p.tz);
    if (clock && clock.hour === p.hour) due.set(p.tz, clock);
  }
  // 2) Лише ті, кому саме зараз: їхня година в їхньому поясі, сьогодні ще не вчилися й не отримували нагадування.
  const tzs = [...due.keys()];
  for (let i = 0; i < tzs.length && stats.calls < budget; i += TZ_PER_QUERY) {
    const byZone = tzs.slice(i, i + TZ_PER_QUERY).map((tz) => {
      const { hour, day } = due.get(tz)!;
      return and(
        eq(userSettings.timezone, tz),
        eq(userSettings.reminderHour, hour),
        or(isNull(playerProgress.lastActiveDay), ne(playerProgress.lastActiveDay, day)),
        notExists(
          db
            .select({ x: sql`1` })
            .from(notificationLog)
            .where(and(eq(notificationLog.userId, users.id), eq(notificationLog.kind, 'daily_reminder'), eq(notificationLog.day, day))),
        ),
      );
    });
    const candidates = await db
      .select({ id: users.id, telegramId: users.telegramId, tz: userSettings.timezone, lang: userSettings.uiLanguage, hour: userSettings.reminderHour, p: playerProgress })
      .from(users)
      .innerJoin(userSettings, eq(userSettings.userId, users.id))
      .leftJoin(playerProgress, eq(playerProgress.userId, users.id))
      .where(
        and(
          eq(users.isBanned, false),
          // Гості (вхід вне Telegram, telegram_id < 0) бота не мають: напоминания им не шлём.
          gt(users.telegramId, 0),
          eq(userSettings.notificationsEnabled, true),
          // Після відмови Telegram (403) мовчимо до 30 днів, але не довше, ніж гравець не писав боту й не зберігав налаштування (bot/mute.ts).
          notMuted(now),
          or(...byZone),
        ),
      )
      .limit(Math.max(1, budget - stats.calls));
    if (candidates.length >= Math.max(1, budget - stats.calls)) complete = false;
    for (const u of candidates) {
      if (stats.calls >= budget) break;
      const today = due.get(u.tz)!.day;
      // Купленные заморозки держат серию после пропуска — напоминание «не потеряй серию», а не «начни заново» (2026-11-16).
      const streak = effectiveStreak(u.p?.streakCurrent ?? 0, u.p?.lastActiveDay ?? null, today, { premium: false, shieldDay: null, freezes: u.p?.streakFreezes ?? 0 });
      const kind = pickReminderKind(streak, u.p?.lastActiveDay ?? null, today);
      // Захоплення дня: унікальний ключ (користувач, нагадування, день) — паралельний запуск не надішле вдруге.
      const claimed = await db
        .insert(notificationLog)
        .values({ userId: u.id, kind: 'daily_reminder', day: today, status: 'PENDING', template: kind, lang: u.lang, attempts: 1, leaseUntil: new Date(now.getTime() + LEASE_MS), createdAt: now, updatedAt: now })
        .onConflictDoNothing()
        .returning({ id: notificationLog.id });
      if (!claimed.length) continue;
      if (dailyOn) {
        const person = await personByTelegramId(u.telegramId).catch(() => null);
        if (person && dailyEligibility(person) === 'ok') {
          // Вместо напоминания придёт вопрос дня (со строкой о серии); строка журнала закрывает день — кандидат не вернётся.
          await db.update(notificationLog).set({ status: 'SKIPPED', error: 'daily_quiz', leaseUntil: null, updatedAt: now }).where(eq(notificationLog.id, claimed[0].id));
          continue;
        }
      }
      if (await deliver({ logId: claimed[0].id, telegramId: u.telegramId, lang: u.lang, kind, streak, attempt: 1, hour: u.hour }, now, stats)) sent++;
    }
  }
  stats.complete = complete && stats.calls < budget;
  return sent;
}

/** Наступна порція активної розсилки (статус SENDING). */
export async function sendCampaignChunk(budget = SEND_BUDGET) {
  if (budget <= 0) return 0;
  const c = await db.query.notificationCampaigns.findFirst({ where: eq(notificationCampaigns.status, 'SENDING'), orderBy: asc(notificationCampaigns.createdAt) });
  if (!c) return 0;
  const batch = await db
    .select({ id: users.id, telegramId: users.telegramId, lang: userSettings.uiLanguage })
    .from(users)
    .innerJoin(userSettings, eq(userSettings.userId, users.id))
    .where(campaignRecipients(c.cursor))
    .orderBy(asc(users.id))
    .limit(budget);
  let sent = 0;
  for (const u of batch) {
    const text = campaignText(c.message, u.lang);
    try {
      await botApi('sendMessage', { chat_id: u.telegramId, text, reply_markup: campaignMarkup() });
      sent++;
    } catch {
      /* користувач міг заблокувати бота */
    }
  }
  const done = batch.length < budget;
  // Счётчик прибавляется к текущему значению в базе; «отправлена» — только если её не остановили из админки, пока шла эта порция.
  await atomic([
    db
      .update(notificationCampaigns)
      .set({ sentCount: sql`${notificationCampaigns.sentCount} + ${sent}`, cursor: batch.at(-1)?.id ?? c.cursor })
      .where(eq(notificationCampaigns.id, c.id)),
    done && db.update(notificationCampaigns).set({ status: 'SENT', sentAt: new Date() }).where(and(eq(notificationCampaigns.id, c.id), eq(notificationCampaigns.status, 'SENDING'))),
  ]);
  return sent;
}

export async function runScheduled(now = new Date()) {
  await pruneUsage(now);
  await pruneLoginFailures(now);
  await purgeErrors(now).catch((e) => console.warn('error log cleanup failed', (e as Error).message));
  await purgeLinkCodes(now).catch((e) => console.warn('link code cleanup failed', (e as Error).message));
  await db.delete(telegramUpdates).where(lt(telegramUpdates.createdAt, new Date(now.getTime() - UPDATES_KEEP_MS)));
  // Таблиці з міграції 0009: до її застосування запит упаде — це не повинно зупиняти нагадування.
  await db
    .delete(botQuizRounds)
    .where(lt(botQuizRounds.sentAt, new Date(now.getTime() - QUIZ_ROUNDS_KEEP_MS)))
    .catch((e) => console.warn('quiz rounds cleanup failed', (e as Error).message));
  // План вопроса дня на 30 днів уперед: дописується сам, навіть поки розсилка вимкнена (адмінка показує його до запуску).
  await ensurePlan(warsawDay(now)).catch((e) => console.warn('daily quiz plan failed', (e as Error).message));
  // Итоги недельной лиги: в понедельник ночью (по Варшаве) прошедшая неделя подводится один раз — призы в кошельки (сервисы/league.ts).
  await settleDueLeagueWeek(now).catch((e) => console.warn('league settle failed', (e as Error).message));
  // Очередь озвучки админки: следующая часть самого старого задания — даже когда админка закрыта (services/audio-jobs.ts).
  await processAudioJobs(now).catch((e) => console.warn('audio jobs failed', (e as Error).message));
  if (!config.botToken) return;
  // Бюджет — виклики Bot API за запуск: самоперевірка бота, розсилка, нагадування, запрошення до питань.
  let left = SEND_BUDGET - (await maintainBot(now).catch(() => 0));
  // Поздравления призёров недели — до напоминаний: их немного (до десяти в неделю), и они важнее.
  {
    const st = { calls: 0 };
    await sendLeagueAwardMessages(now, Math.max(0, Math.min(left, 20)), st).catch((e) => console.warn('league messages failed', (e as Error).message));
    left -= st.calls;
  }
  left -= await sendCampaignChunk(Math.max(0, left));
  // Лимит чтения D1 (2026-11-23): раньше каждую минуту перебирались все настройки игроков и кандидаты на напоминание (~10 тыс. строк
  // в минуту — 75 % суточного лимита к утру). Теперь, когда в этом часу (UTC) все кандидаты разобраны и настройки игроков с тех пор не
  // менялись, перебор пропускается до следующего часа; повторы неудачных отправок идут каждую минуту, как раньше.
  const hour = now.toISOString().slice(0, 13);
  const marks = await readCronMarks();
  const settingsAt = await settingsStamp();
  const stats: { calls: number; complete?: boolean } = { calls: 0 };
  const scan = !(marks.reminders?.hour === hour && marks.reminders.settingsAt === settingsAt);
  await sendReminders(now, left, stats, { scan });
  left -= stats.calls;
  const next: CronMarks = { ...marks };
  if (scan && stats.complete) next.reminders = { hour, settingsAt };
  // Приглашения к /quiz — только пока рассылка вопроса дня выключена (иначе два сообщения в день); тоже раз в час, пока есть кому.
  const daily = await readDailyState().catch(() => null);
  if (!daily?.enabled && !(marks.invites?.hour === hour && marks.invites.settingsAt === settingsAt)) {
    const out: { complete?: boolean } = {};
    await sendQuizInvites(now, left, out).catch((e) => console.warn('quiz invites failed', (e as Error).message));
    if (out.complete) next.invites = { hour, settingsAt };
  }
  if (JSON.stringify(next) !== JSON.stringify(marks)) await writeCronMarks(next);
}

/** Метки «в этом часу перебор уже сделан» (app_state): час UTC и отпечаток настроек игроков на тот момент. */
type CronMarks = { reminders?: { hour: string; settingsAt: number }; invites?: { hour: string; settingsAt: number } };
const CRON_MARKS = 'cron_marks';
async function readCronMarks(): Promise<CronMarks> {
  const row = await db.select({ value: appState.value }).from(appState).where(eq(appState.key, CRON_MARKS)).get().catch(() => undefined);
  return (row?.value as CronMarks | undefined) ?? {};
}
async function writeCronMarks(m: CronMarks) {
  await db
    .insert(appState)
    .values({ key: CRON_MARKS, value: m })
    .onConflictDoUpdate({ target: appState.key, set: { value: m, updatedAt: new Date() } })
    .catch((e) => console.warn('cron marks not saved', (e as Error).message));
}
/** Последнее изменение настроек игроков (новый игрок, включил напоминания, сменил час или пояс) — по индексу, одна строка. */
async function settingsStamp(): Promise<number> {
  const [r] = await db.select({ at: sql<number | null>`max(${userSettings.updatedAt})` }).from(userSettings).catch(() => [{ at: null }]);
  return Number(r?.at ?? 0);
}
