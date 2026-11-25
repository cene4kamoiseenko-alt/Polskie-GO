/**
 * Какое сообщение бот присылает человеку сегодня (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 1).
 * Цель (владелец 2026-11-25): «чтобы люди, которые не заходят в игру или вообще не заходили, а нажали просто «Старт», зашли в игру».
 * Одно в день, по старшинству:
 *  · «Старт» — нажал «Старт» в боте, в игру не заходил (нет аккаунта): 1-й, 3-й, 7-й день после «Старта», потом раз в неделю, всего 3;
 *  · возвращение — занимался и пропал: 3-й, 7-й, 14-й, 30-й день без занятий, дальше раз в месяц;
 *  · новичок — зашёл в игру, урок не прошёл: 1-й, 3-й, 7-й день после регистрации, потом раз в неделю, всего 3;
 *  · миссия недели — суббота, активный игрок, миссий не открывал 14 дней;
 *  · иначе вопрос дня.
 * Карточки не приходят, пока владелец не включил их в админке, тому, кто их выключил, и тому, кто сегодня уже был в приложении.
 * Три карточки «вернуть в игру» одного вида подряд без нажатия (миссия — две) — этот вид молчит 30 дней.
 * Чистая функция: данные собирает отправка (engage/send.ts).
 */
import { dayDiff } from '@polski-go/shared';
import type { EngageKind } from '../../db/schema';

/** `variant` — для «Миссии недели» это slug миссии (чтобы следующая карточка предложила другую). */
export type CardHistory = { kind: EngageKind; day: string; opened: boolean; variant?: string | null };
export type FreeMission = { slug: string; title: string; minutes: number; category: string };
export type MissionFacts = { daysSinceMissionStart: number | null; freeMission: FreeMission | null };
export type PickInput = {
  /** День по Варшаве (как у вопроса дня). */
  today: string;
  /** День недели по Варшаве: 0 — воскресенье, 6 — суббота. */
  weekday: number;
  enabled: boolean;
  hasUser: boolean;
  optedOut: boolean;
  /** Открывал приложение в свой местный день. */
  seenToday: boolean;
  registeredDay: string | null;
  /** Первый «Старт» в боте (день по Варшаве): для тех, кто в игру не заходил. */
  contactDay: string | null;
  lessonsCompleted: number;
  lastActiveDay: string | null;
  history: CardHistory[];
  mission: MissionFacts | null;
};
export type DailyMessage = { kind: 'quiz' } | { kind: 'start' } | { kind: 'newcomer' } | { kind: 'comeback' } | { kind: 'mission'; mission: FreeMission };

export const COMEBACK_DAYS = [3, 7, 14, 30];
/** Пропал больше 30 дней назад: карточка возвращения раз в столько дней. */
export const COMEBACK_EVERY = 30;
export const NEWCOMER_DAYS = [1, 3, 7];
export const NEWCOMER_MAX = 3;
export const START_DAYS = [1, 3, 7];
export const START_MAX = 3;
/** После первой недели — карточка «Старт» и новичка не чаще раза в столько дней. */
export const WEEKLY = 7;
export const MISSION_WEEKDAY = 6;
export const MISSION_QUIET_DAYS = 14;
/** «Активный на этой неделе» для миссии недели: занимался в последние 7 дней (сегодня и 6 дней до). */
const ACTIVE_WINDOW_DAYS = 6;
export const KIND_PAUSE_DAYS = 30;
/** Сколько неоткрытых карточек вида подряд включают паузу: «вернуть в игру» — три, миссия недели — две. */
const PAUSE_AFTER: Record<EngageKind, number> = { start: 3, newcomer: 3, comeback: 3, mission: 2 };

const QUIZ: DailyMessage = { kind: 'quiz' };

/** Карточки вида, новые первыми. */
const ofKind = (history: CardHistory[], kind: EngageKind) => history.filter((h) => h.kind === kind).sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0));
/** Сколько дней назад была последняя карточка вида (null — не было). */
const daysSinceLast = (history: CardHistory[], kind: EngageKind, today: string) => {
  const last = ofKind(history, kind)[0];
  return last ? dayDiff(last.day, today) : null;
};

/**
 * Карточка «по расписанию первой недели, потом раз в неделю, всего max»: `since` — дней с начала (регистрация или «Старт»).
 * В первую неделю — в дни `days`; позже — если прошлой карточки этого вида не было или она была 7+ дней назад.
 */
function dueWeekly(history: CardHistory[], kind: EngageKind, today: string, since: number | null, days: number[], max: number): boolean {
  if (since === null || since < 1) return false;
  if (ofKind(history, kind).length >= max || kindPaused(history, kind, today)) return false;
  if (since <= WEEKLY) return days.includes(since);
  const last = daysSinceLast(history, kind, today);
  return last === null || last >= WEEKLY;
}

/** Последние карточки вида (3, у миссии — 2) не открыты, и последняя была меньше 30 дней назад. */
export function kindPaused(history: CardHistory[], kind: EngageKind, today: string): boolean {
  const n = PAUSE_AFTER[kind];
  const last = ofKind(history, kind).slice(0, n);
  if (last.length < n || last.some((h) => h.opened)) return false;
  return dayDiff(last[0].day, today) < KIND_PAUSE_DAYS;
}

/** Карточки вообще возможны: включены, есть аккаунт, не выключены, сегодня не был в приложении. */
function cardsAllowed(i: Pick<PickInput, 'enabled' | 'hasUser' | 'optedOut' | 'seenToday'>): boolean {
  return i.enabled && i.hasUser && !i.optedOut && !i.seenToday;
}

const activeThisWeek = (i: Pick<PickInput, 'lastActiveDay' | 'today'>) => !!i.lastActiveDay && dayDiff(i.lastActiveDay, i.today) <= ACTIVE_WINDOW_DAYS;

/** Нужно ли загружать факты о миссиях (лишние запросы к базе — только в субботу и только активным игрокам). */
export function needsMissionFacts(i: Omit<PickInput, 'history' | 'mission'>): boolean {
  return cardsAllowed(i) && i.weekday === MISSION_WEEKDAY && i.lessonsCompleted > 0 && activeThisWeek(i);
}

export function pickDailyMessage(i: PickInput): DailyMessage {
  if (!i.enabled || i.optedOut || i.seenToday) return QUIZ;
  // Нажал «Старт», в игру не заходил (аккаунта нет): позвать в игру.
  if (!i.hasUser) {
    const sinceStart = i.contactDay ? dayDiff(i.contactDay, i.today) : null;
    return dueWeekly(i.history, 'start', i.today, sinceStart, START_DAYS, START_MAX) ? { kind: 'start' } : QUIZ;
  }
  if (!cardsAllowed(i)) return QUIZ;
  const away = i.lastActiveDay ? dayDiff(i.lastActiveDay, i.today) : null;
  if (away !== null && !kindPaused(i.history, 'comeback', i.today)) {
    const last = daysSinceLast(i.history, 'comeback', i.today);
    if (COMEBACK_DAYS.includes(away) || (away > COMEBACK_DAYS[COMEBACK_DAYS.length - 1] && (last === null || last >= COMEBACK_EVERY))) return { kind: 'comeback' };
  }

  const sinceSignup = i.registeredDay ? dayDiff(i.registeredDay, i.today) : null;
  if (i.lessonsCompleted === 0 && dueWeekly(i.history, 'newcomer', i.today, sinceSignup, NEWCOMER_DAYS, NEWCOMER_MAX)) return { kind: 'newcomer' };

  const m = i.mission;
  if (
    m?.freeMission &&
    needsMissionFacts(i) &&
    (m.daysSinceMissionStart === null || m.daysSinceMissionStart > MISSION_QUIET_DAYS) &&
    !kindPaused(i.history, 'mission', i.today)
  ) {
    return { kind: 'mission', mission: m.freeMission };
  }
  return QUIZ;
}

/**
 * Какую миссию предложить в «Миссии недели» (владелец 2026-11-24: «постоянно только за миссию в Жабке»): первую по списку непройденных,
 * которую человеку ещё не присылали; если присылали все — ту, что приходила давнее всех. Так каждая суббота — другая миссия.
 */
export function pickFreeMission(candidates: FreeMission[], history: CardHistory[]): FreeMission | null {
  if (!candidates.length) return null;
  const lastSent = new Map<string, string>();
  for (const h of history) if (h.kind === 'mission' && h.variant && (lastSent.get(h.variant) ?? '') < h.day) lastSent.set(h.variant, h.day);
  const fresh = candidates.find((m) => !lastSent.has(m.slug));
  if (fresh) return fresh;
  return [...candidates].sort((a, b) => (lastSent.get(a.slug)! < lastSent.get(b.slug)! ? -1 : 1))[0];
}
