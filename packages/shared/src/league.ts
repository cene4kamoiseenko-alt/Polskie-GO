/**
 * Недельная лига (решение владельца 2026-11-15, вариант А): одна общая таблица недели, награды Złotki за места.
 * Неделя — по Варшаве для всех игроков (общее соревнование: у всех одна граница недели).
 */
import { dayKey, weekKey } from './dates';

export const LEAGUE_TZ = 'Europe/Warsaw';
/** С какого XP за неделю игрок виден в таблице (примерно один урок). */
export const LEAGUE_MIN_XP = 20;
/** С какого XP за неделю выдаётся приз за место. */
export const LEAGUE_PRIZE_MIN_XP = 100;
/** Призы за места: индекс — место − 1. */
export const LEAGUE_PRIZES = [300, 200, 100, 25, 25, 25, 25, 25, 25, 25] as const;

/** Приз в Złotki за место (1…10), иначе 0. */
export function leaguePrize(rank: number): number {
  return Number.isInteger(rank) && rank >= 1 ? (LEAGUE_PRIZES[rank - 1] ?? 0) : 0;
}

/** Ключ недели лиги, например «2026-W46». */
export function leagueWeek(now: Date): string {
  return weekKey(dayKey(now, LEAGUE_TZ));
}

/** Когда кончается неделя лиги, в которую попадает `now`: первый момент следующей недели (понедельник 00:00 по Варшаве). */
export function leagueWeekEndsAt(now: Date): Date {
  const week = leagueWeek(now);
  // Граница недели монотонна: двоичный поиск первой минуты другой недели в пределах восьми суток (учитывает переход на летнее время).
  let lo = Math.floor(now.getTime() / 60_000);
  let hi = lo + 8 * 24 * 60;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (leagueWeek(new Date(mid * 60_000)) === week) lo = mid;
    else hi = mid;
  }
  return new Date(hi * 60_000);
}
