/**
 * Отправка карточки бота вместо вопроса дня (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 1). Вызывается из минутной
 * рассылки (bot/daily/send.ts) для человека, которому сегодня полагается вопрос: правило (pick.ts) выбирает карточку или вопрос.
 * Одно сообщение в день: захват строки engage_sends (день, человек) и проверка, что вопрос дня ему сегодня ещё не ушёл.
 */
import { and, count, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { dayDiff, dayKey, type UiLang } from '@polski-go/shared';
import { db } from '../../db';
import { cities, engageSends, missionRuns, playerProgress, userVocabulary, type EngageKind } from '../../db/schema';
import { activeLessonProgress } from '../../services/active-lesson';
import { comebackOffer } from '../../services/comeback';
import { listMissions } from '../../services/missions';
import { sendWithPhoto } from '../quiz/engine';
import { personLang, type DailyPerson } from '../daily/audience';
import { failStatus, noteDeliveryFailure } from '../daily/delivery';
import type { Outcome } from '../daily/send';
import { warsawDay } from '../daily/state';
import { needsMissionFacts, pickDailyMessage, type CardHistory, type DailyMessage, type MissionFacts, type PickInput } from './pick';
import { cardView, type CardData } from './views';

const LEASE_MS = 5 * 60_000;
/** Список в IN (…) — не больше 90 значений (лимит D1 — 100 параметров на запрос). */
const IN_CHUNK = 90;

/** Отправленные карточки людей пачки с дня `since` (одна выборка на запуск, кусками по 90). */
export async function loadCardHistory(telegramIds: number[], since: string): Promise<Map<number, CardHistory[]>> {
  const out = new Map<number, CardHistory[]>();
  for (let i = 0; i < telegramIds.length; i += IN_CHUNK) {
    const chunk = telegramIds.slice(i, i + IN_CHUNK);
    const rows = await db
      .select({ telegramId: engageSends.telegramId, kind: engageSends.kind, day: engageSends.day, openedAt: engageSends.openedAt })
      .from(engageSends)
      .where(and(inArray(engageSends.telegramId, chunk), gte(engageSends.day, since), eq(engageSends.status, 'SENT')));
    for (const r of rows) {
      const list = out.get(r.telegramId) ?? [];
      list.push({ kind: r.kind, day: r.day, opened: !!r.openedAt });
      out.set(r.telegramId, list);
    }
  }
  return out;
}

/** День недели по Варшаве (0 — воскресенье). */
const weekdayOf = (day: string) => new Date(`${day}T12:00:00Z`).getUTCDay();

/** Данные игрока для правила (кроме миссий: их загружают только когда нужно). */
export function pickInputFor(p: DailyPerson, now: Date, enabled: boolean, history: CardHistory[], mission: MissionFacts | null): PickInput {
  const today = warsawDay(now);
  const tz = p.timezone ?? 'Europe/Warsaw';
  return {
    today,
    weekday: weekdayOf(today),
    enabled,
    hasUser: !!p.userId,
    optedOut: !!p.cardOptedOutAt,
    // «Сегодня был в игре»: вход сегодня или занятие сегодня (вход обновляется не при каждом открытии — приложение держит токен днями).
    seenToday: (!!p.appSeenAt && dayKey(p.appSeenAt, tz) === dayKey(now, tz)) || p.lastActiveDay === dayKey(now, tz),
    registeredDay: p.createdAt ? dayKey(p.createdAt, 'Europe/Warsaw') : null,
    lessonsCompleted: p.lessonsCompleted,
    lastActiveDay: p.lastActiveDay,
    history,
    mission,
  };
}

/** Бесплатная непройденная миссия (по порядку списка) и сколько дней назад игрок последний раз начинал миссию. */
export async function loadMissionFacts(userId: string, lang: UiLang, now: Date): Promise<MissionFacts> {
  const [list, last] = await Promise.all([
    listMissions(userId, now),
    db.select({ startedAt: missionRuns.startedAt }).from(missionRuns).where(eq(missionRuns.userId, userId)).orderBy(desc(missionRuns.startedAt)).limit(1).get(),
  ]);
  const m = list.missions.find((x) => !x.locked && x.completions === 0);
  return {
    daysSinceMissionStart: last ? dayDiff(dayKey(last.startedAt, 'Europe/Warsaw'), warsawDay(now)) : null,
    freeMission: m ? { slug: m.slug, title: m.title[lang] || m.title.ru || m.slug, minutes: m.minutes, category: m.category } : null,
  };
}

/** Что прислать человеку сегодня (рассылка уже решила, что ему положен вопрос дня, и карточки включены). */
export async function messageFor(p: DailyPerson, now: Date, history: CardHistory[]): Promise<DailyMessage> {
  const base = pickInputFor(p, now, true, history, null);
  const mission = p.userId && needsMissionFacts(base) ? await loadMissionFacts(p.userId, personLang(p), now) : null;
  return pickDailyMessage({ ...base, mission });
}

async function cardData(p: DailyPerson, msg: Exclude<DailyMessage, { kind: 'quiz' }>, now: Date): Promise<{ data: CardData; variant: string | null }> {
  if (msg.kind === 'mission') {
    const m = msg.mission;
    return { data: { kind: 'mission', slug: m.slug, title: m.title, minutes: m.minutes, category: m.category }, variant: m.slug };
  }
  if (msg.kind === 'newcomer') {
    const active = p.userId ? await activeLessonProgress(p.userId, now) : null;
    return { data: { kind: 'newcomer', left: active ? active.total - active.done : null }, variant: active ? 'left' : 'start' };
  }
  const [progress, words] = await Promise.all([
    db.select({ streakBest: playerProgress.streakBest, city: cities.namePl }).from(playerProgress).leftJoin(cities, eq(cities.id, playerProgress.currentCityId)).where(eq(playerProgress.userId, p.userId!)).get(),
    db.select({ n: count() }).from(userVocabulary).where(eq(userVocabulary.userId, p.userId!)).get(),
  ]);
  // Подарок обещаем, только если приложение его действительно даст (не брал в последние 30 дней).
  const offer = await comebackOffer(p.userId!, p.lastActiveDay, dayKey(now, p.timezone ?? 'Europe/Warsaw'), now);
  return {
    data: { kind: 'comeback', streakBest: progress?.streakBest ?? 0, words: words?.n ?? 0, city: progress?.city ?? null, gift: offer?.gift ?? null },
    variant: offer ? 'gift' : 'no_gift',
  };
}

/**
 * Захват карточки на (день, человек) — одной командой вместе с проверкой, что вопрос дня ему сегодня не захвачен. Запись в D1 идёт
 * по одной, поэтому из двух пересёкшихся запусков (один выбрал карточку, другой — вопрос) второй увидит строку первого.
 */
export async function claimCard(day: string, p: { telegramId: number; userId: string | null }, kind: EngageKind, variant: string | null, lang: string, now: Date): Promise<boolean> {
  const rows = await db.all<{ day: string }>(sql`
    INSERT INTO engage_sends (day, telegram_id, user_id, kind, variant, lang, status, lease_until, created_at)
    SELECT ${day}, ${p.telegramId}, ${p.userId}, ${kind}, ${variant}, ${lang}, 'PENDING', ${now.getTime() + LEASE_MS}, ${now.getTime()}
    WHERE NOT EXISTS (SELECT 1 FROM daily_quiz_sends WHERE day = ${day} AND telegram_id = ${p.telegramId})
    ON CONFLICT DO NOTHING
    RETURNING day`);
  return rows.length > 0;
}

export async function sendCard(p: DailyPerson, msg: Exclude<DailyMessage, { kind: 'quiz' }>, day: string, now: Date, stats: { calls: number }): Promise<Outcome> {
  const lang = personLang(p);
  const { data, variant } = await cardData(p, msg, now);
  if (!(await claimCard(day, p, msg.kind, variant, lang, now))) return 'dup';
  const where = and(eq(engageSends.day, day), eq(engageSends.telegramId, p.telegramId));
  const view = cardView(data, lang, Number(day.slice(8, 10)));
  try {
    await sendWithPhoto(p.telegramId, view.text, view.keyboard, view.image, stats);
    await db.update(engageSends).set({ status: 'SENT', sentAt: now, leaseUntil: null }).where(where);
    return 'sent';
  } catch (e) {
    const status = failStatus(e);
    if (status === 'RATE_LIMITED') {
      await db.delete(engageSends).where(where).catch(() => {});
      return 'rate_limited';
    }
    console.warn('engage card: not delivered', p.telegramId, status, (e as Error).message);
    await db.update(engageSends).set({ status, error: String((e as Error).message ?? e).slice(0, 200), leaseUntil: null }).where(where).catch(() => {});
    await noteDeliveryFailure(p, status, now);
    return 'failed';
  }
}
