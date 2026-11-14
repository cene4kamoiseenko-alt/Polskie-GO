/**
 * Удержание в админке (services/admin-insights.ts → retentionReport, GET /api/admin/dashboard → retention). Владелец 2026-11-14:
 * «проверь удержание». Прежний расчёт брал день регистрации по UTC, а D7 считал «активность в любой день с седьмого»: рядом с полуночью
 * регистрация в первые часы местных суток давала ложное «вернулся» на следующий день, а D7 был завышен. Теперь — точные D1 / D7 / D30
 * по дню регистрации в Варшаве, день входит в основу, только когда он уже закончился, плюс таблица по неделям регистрации.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { dailyActivity, users } from '../src/db/schema';
import { resetRateLimits } from '../src/hono';
import { retentionReport } from '../src/services/admin-insights';
import { disposeEnv, getEnv, login, request } from './helpers';

afterAll(disposeEnv);

/** Суббота, 13:00 по Варшаве (CET, зима): сегодня — 2026-11-14, понедельник этой недели — 2026-11-09. */
const NOW = new Date('2026-11-14T12:00:00Z');

/** Игрок, зарегистрированный в `createdAt`, с активностью в перечисленные дни (день игрока — местный). */
async function player(createdAt: string, activeDays: string[]) {
  resetRateLimits();
  const u = await login();
  await db.update(users).set({ createdAt: new Date(createdAt) }).where(eq(users.id, u.user.id));
  for (const day of activeDays) await db.insert(dailyActivity).values({ userId: u.user.id, day, lessons: 1 });
  return u;
}

describe('удержание D1 / D7 / D30 по неделям регистрации', () => {
  it('точные дни по Варшаве; ещё не закончившийся день в основу не входит; пустые недели — нулями', async () => {
    await getEnv();
    await player('2026-09-01T10:00:00Z', ['2026-09-02']); // вне окна из восьми недель
    await player('2026-10-10T09:00:00Z', ['2026-10-11', '2026-10-18', '2026-11-09']); // D1 да; D7 нет (пришёл на 8-й день, не на 7-й); D30 да
    await player('2026-11-01T10:00:00Z', ['2026-11-02', '2026-11-08']); // D1 да; D7 да; D30 ещё не наступил
    // 00:30 2 ноября по Варшаве (по UTC ещё 1 ноября): день регистрации — 2 ноября, поэтому занятие в тот же вечер — это день 0, а не «вернулся»
    await player('2026-11-01T23:30:00Z', ['2026-11-02']);
    await player('2026-11-10T09:00:00Z', ['2026-11-11']); // D1 да; D7 ещё не наступил
    await player('2026-11-13T09:00:00Z', ['2026-11-14']); // зарегистрирован вчера: сегодняшний день не закончился — в основу D1 не входит

    const r = await retentionReport(NOW);
    expect(r.tz).toBe('Europe/Warsaw');
    expect(r.weeks).toHaveLength(8);
    expect(r.weeks[0].week).toBe('2026-09-21');
    expect(r.weeks.at(-1)!.week).toBe('2026-11-09');
    const week = (monday: string) => r.weeks.find((w) => w.week === monday);
    expect(week('2026-10-05')).toEqual({ week: '2026-10-05', signups: 1, d1: { n: 1, base: 1 }, d7: { n: 0, base: 1 }, d30: { n: 1, base: 1 } });
    expect(week('2026-10-26')).toEqual({ week: '2026-10-26', signups: 1, d1: { n: 1, base: 1 }, d7: { n: 1, base: 1 }, d30: { n: 0, base: 0 } });
    expect(week('2026-11-02')).toEqual({ week: '2026-11-02', signups: 1, d1: { n: 0, base: 1 }, d7: { n: 0, base: 1 }, d30: { n: 0, base: 0 } });
    expect(week('2026-11-09')).toEqual({ week: '2026-11-09', signups: 2, d1: { n: 1, base: 1 }, d7: { n: 0, base: 0 }, d30: { n: 0, base: 0 } });
    // Недели без регистраций есть в ряду (нулями), а не пропущены — график и таблица не «прыгают».
    expect(r.weeks.filter((w) => w.signups === 0).map((w) => w.week)).toEqual(['2026-09-21', '2026-09-28', '2026-10-12', '2026-10-19']);
    expect(r.total).toEqual({ d1: { n: 3, base: 4 }, d7: { n: 1, base: 3 }, d30: { n: 1, base: 1 } });
  });

  it('дашборд админки отдаёт D1 / D7 / D30 в процентах (null, пока нужный день ни у кого не закончился) и таблицу по неделям', async () => {
    const signIn = await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' });
    expect(signIn.status).toBe(200);
    const res = await request('GET', '/api/admin/dashboard', undefined, { authorization: `Bearer ${signIn.body.token}` });
    expect(res.status).toBe(200);
    const { retention } = res.body as { retention: { d1: number | null; d7: number | null; d30: number | null; weeks: { week: string; signups: number }[] } };
    expect(retention.weeks).toHaveLength(8);
    expect(retention.weeks.reduce((n, w) => n + w.signups, 0)).toBeGreaterThanOrEqual(0);
    // Недавние регистрации, давние (пять-шесть недель назад) — настоящие «сейчас» этого прогона: показатели либо число 0…100, либо null.
    for (const v of [retention.d1, retention.d7, retention.d30]) expect(v === null || (v >= 0 && v <= 100)).toBe(true);
  });
});
