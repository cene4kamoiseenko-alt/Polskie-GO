import { describe, expect, it } from 'vitest';
import { LEAGUE_MIN_XP, LEAGUE_PRIZE_MIN_XP, leaguePrize, leagueWeek, leagueWeekEndsAt } from '../src/league';

describe('недельная лига: призы и неделя', () => {
  it('призы за места: 300 / 200 / 100, 4–10 — по 25, дальше ничего', () => {
    expect([1, 2, 3, 4, 10, 11, 0, -1].map(leaguePrize)).toEqual([300, 200, 100, 25, 25, 0, 0, 0]);
    expect(LEAGUE_MIN_XP).toBe(20);
    expect(LEAGUE_PRIZE_MIN_XP).toBe(100);
  });

  it('неделя считается по Варшаве для всех: воскресенье 23:30 и понедельник 00:30 — разные недели', () => {
    // 2026-11-15 — воскресенье; Варшава зимой UTC+1.
    expect(leagueWeek(new Date('2026-11-15T22:30:00Z'))).toBe('2026-W46'); // вс 23:30 в Варшаве
    expect(leagueWeek(new Date('2026-11-15T23:30:00Z'))).toBe('2026-W47'); // пн 00:30 в Варшаве
  });

  it('конец недели — ближайший понедельник 00:00 по Варшаве', () => {
    expect(leagueWeekEndsAt(new Date('2026-11-12T10:00:00Z')).toISOString()).toBe('2026-11-15T23:00:00.000Z');
    // Летом Варшава UTC+2: неделя 2027-W27 кончается в понедельник 2027-07-12 00:00 = 2027-07-11T22:00Z.
    expect(leagueWeekEndsAt(new Date('2027-07-08T09:00:00Z')).toISOString()).toBe('2027-07-11T22:00:00.000Z');
  });
});
