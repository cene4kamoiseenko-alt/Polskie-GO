/**
 * Траты Złotki на серию (2026-11-16): заморозка (запас до 2, закрывает пропуск, не тратится зря), восстановление серии.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { addDays, dayKey, STREAK_FREEZE_PRICE } from '@polski-go/shared';
import { atomic, db } from '../src/db';
import { gameWallets, playerProgress } from '../src/db/schema';
import { loadCtx, touchActivity } from '../src/services/rewards';
import { disposeEnv, login } from './helpers';

afterAll(disposeEnv);
const today = () => dayKey(new Date(), 'Europe/Warsaw');
const setBalance = (userId: string, balance: number) => db.update(gameWallets).set({ balance }).where(eq(gameWallets.userId, userId));
const wallet = async (userId: string) => (await db.query.gameWallets.findFirst({ where: eq(gameWallets.userId, userId) }))!.balance;
const progress = async (userId: string) => (await db.query.playerProgress.findFirst({ where: eq(playerProgress.userId, userId) }))!;

describe('заморозка и восстановление серии', () => {
  it('покупка: до двух в запасе, третья — отказ без списания; повтор того же нажатия не списывает дважды', async () => {
    const { call, user } = await login();
    await setBalance(user.id, 300);
    expect((await call('POST', '/api/streak/freeze', { key: 'press-1' })).body).toMatchObject({ freezes: 1, balance: 300 - STREAK_FREEZE_PRICE });
    expect((await call('POST', '/api/streak/freeze', { key: 'press-1' })).status).toBe(400);
    expect((await call('POST', '/api/streak/freeze', { key: 'press-2' })).body).toMatchObject({ freezes: 2 });
    const third = await call('POST', '/api/streak/freeze', { key: 'press-3' });
    expect(third.status).toBe(409);
    expect(third.body.error).toBe('freeze_limit');
    expect(await wallet(user.id)).toBe(300 - 2 * STREAK_FREEZE_PRICE);
    const me = (await call('GET', '/api/me')).body;
    expect(me.progress.streakFreezes).toBe(2);
  });

  it('пропущен день: серия жива с заморозкой; занятие продолжает серию и тратит заморозку', async () => {
    const { call, user } = await login();
    await db.update(playerProgress).set({ streakCurrent: 5, streakBest: 5, lastActiveDay: addDays(today(), -2), streakFreezes: 1 }).where(eq(playerProgress.userId, user.id));
    expect((await call('GET', '/api/me')).body.progress).toMatchObject({ streak: 5, streakRepair: null });
    const ctx = await loadCtx(user.id);
    const t = touchActivity(ctx, { lessons: 1, exercises: 5, correct: 5, xp: 20 } as never);
    await atomic(t.stmts);
    const p = await progress(user.id);
    expect(p).toMatchObject({ streakCurrent: 6, streakFreezes: 0, lastActiveDay: today() });
  });

  it('восстановление: серия сгорела вчера — 10 zł за день, «вчера» становится днём занятий; второй раз нельзя', async () => {
    const { call, user } = await login();
    await setBalance(user.id, 500);
    await db.update(playerProgress).set({ streakCurrent: 12, streakBest: 12, lastActiveDay: addDays(today(), -2), streakFreezes: 0 }).where(eq(playerProgress.userId, user.id));
    const me = (await call('GET', '/api/me')).body;
    expect(me.progress.streak).toBe(0);
    expect(me.progress.streakRepair).toEqual({ streak: 12, price: 120 });
    expect((await call('POST', '/api/streak/repair')).body).toMatchObject({ streak: 12, price: 120, balance: 380 });
    expect((await call('GET', '/api/me')).body.progress).toMatchObject({ streak: 12, streakRepair: null });
    expect((await progress(user.id)).lastActiveDay).toBe(addDays(today(), -1));
    expect((await call('POST', '/api/streak/repair')).status).toBe(409);
  });
});
