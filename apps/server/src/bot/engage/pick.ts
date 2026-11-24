/**
 * Какое сообщение бот присылает человеку сегодня (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 1).
 * Одно в день, по старшинству: возвращение (7-й и 14-й день без занятий) → новичок (1-й и 3-й день после регистрации, урок не пройден,
 * не больше двух) → миссия недели (суббота, активный игрок, миссий не открывал 14 дней) → вопрос дня. Карточки не приходят, пока
 * владелец не включил их в админке, без аккаунта, тому, кто их выключил, и тому, кто сегодня уже был в приложении. Две карточки
 * одного вида подряд без нажатия — этот вид молчит 30 дней. Чистая функция: данные собирает отправка (engage/send.ts).
 */
import { dayDiff } from '@polski-go/shared';
import type { EngageKind } from '../../db/schema';

export type CardHistory = { kind: EngageKind; day: string; opened: boolean };
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
  lessonsCompleted: number;
  lastActiveDay: string | null;
  history: CardHistory[];
  mission: MissionFacts | null;
};
export type DailyMessage = { kind: 'quiz' } | { kind: 'newcomer' } | { kind: 'comeback' } | { kind: 'mission'; mission: FreeMission };

export const COMEBACK_DAYS = [7, 14];
export const NEWCOMER_DAYS = [1, 3];
export const NEWCOMER_MAX = 2;
export const MISSION_WEEKDAY = 6;
export const MISSION_QUIET_DAYS = 14;
/** «Активный на этой неделе» для миссии недели: занимался в последние 7 дней (сегодня и 6 дней до). */
const ACTIVE_WINDOW_DAYS = 6;
export const KIND_PAUSE_DAYS = 30;

const QUIZ: DailyMessage = { kind: 'quiz' };

/** Две последние карточки вида не открыты, и последняя была меньше 30 дней назад. */
export function kindPaused(history: CardHistory[], kind: EngageKind, today: string): boolean {
  const last = history.filter((h) => h.kind === kind).sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0)).slice(0, 2);
  if (last.length < 2 || last.some((h) => h.opened)) return false;
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
  if (!cardsAllowed(i)) return QUIZ;
  const away = i.lastActiveDay ? dayDiff(i.lastActiveDay, i.today) : null;
  if (away !== null && COMEBACK_DAYS.includes(away) && !kindPaused(i.history, 'comeback', i.today)) return { kind: 'comeback' };

  const sinceSignup = i.registeredDay ? dayDiff(i.registeredDay, i.today) : null;
  const newcomerSent = i.history.filter((h) => h.kind === 'newcomer').length;
  if (i.lessonsCompleted === 0 && sinceSignup !== null && NEWCOMER_DAYS.includes(sinceSignup) && newcomerSent < NEWCOMER_MAX && !kindPaused(i.history, 'newcomer', i.today)) {
    return { kind: 'newcomer' };
  }

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
