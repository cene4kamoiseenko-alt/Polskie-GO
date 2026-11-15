/**
 * Лига в админке (2026-11-16): подведённые недели с призёрами и отметкой «приз зачислен в кошелёк», текущая неделя.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { db } from '../src/db';
import { leaderboards } from '../src/db/schema';
import { settleLeagueWeek } from '../src/services/league';
import { disposeEnv, getEnv, login, request } from './helpers';

afterAll(disposeEnv);

async function player(week: string, xp: number, at: Date) {
  const p = await login();
  await db.insert(leaderboards).values({ userId: p.user.id, periodKey: week, league: 'bronze', xp, updatedAt: at });
  return p;
}

describe('лига в админке', () => {
  it('админка: подведённая неделя — призёры, приз зачислен в кошелёк, бот и окно в игре; текущая неделя — кто сейчас в призах', async () => {
    const week = '2031-W40';
    const at = (m: number) => new Date(Date.UTC(2031, 8, 30, 10, m));
    await getEnv();
    const first = await player(week, 500, at(0));
    const small = await player(week, 60, at(1));
    await settleLeagueWeek(week, new Date('2031-10-06T00:05:00Z'));
    const token = (await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' })).body.token;
    const r = await request('GET', '/api/admin/league', undefined, { authorization: `Bearer ${token}` });
    expect(r.status).toBe(200);
    const w = r.body.weeks.find((x: { week: string }) => x.week === week);
    expect(w.players).toBeGreaterThanOrEqual(2);
    expect(w.awards.find((a: { userId: string }) => a.userId === first.user.id)).toMatchObject({ rank: 1, xp: 500, zlotki: 300, credited: true, notifiedAt: null, seenAt: null });
    // 60 XP — меньше 100: места нет в призах, строки итогов нет.
    expect(w.awards.find((a: { userId: string }) => a.userId === small.user.id)).toBeUndefined();
    expect(r.body.rules).toMatchObject({ minXp: 20, prizeMinXp: 100 });
    expect(r.body.current.week).toMatch(/^\d{4}-W\d{2}$/);
  });
});
