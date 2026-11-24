/**
 * Приложение и вовлечённость (docs/superpowers/specs/2026-11-24-engagement-design.md, разделы 4, 6, 7): подарок 50 злотков после
 * 7+ дней без занятий (один раз, не чаще раза в 30 дней), отметка «тур пройден», отметка «открыл карточку бота».
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { addDays, dayKey } from '@polski-go/shared';
import { db } from '../src/db';
import { engageSends, gameWallets, playerProgress, userFlags, walletTransactions } from '../src/db/schema';
import { disposeEnv, getEnv, login } from './helpers';

beforeAll(async () => {
  await getEnv();
});
afterAll(disposeEnv);

const today = () => dayKey(new Date(), 'Europe/Warsaw');
const away = (userId: string, days: number) => db.update(playerProgress).set({ lastActiveDay: addDays(today(), -days) }).where(eq(playerProgress.userId, userId));
const balance = async (userId: string) => (await db.select().from(gameWallets).where(eq(gameWallets.userId, userId)).get())!.balance;

describe('подарок за возвращение', () => {
  it('виден после 7 дней без занятий и только тогда', async () => {
    const u = await login();
    expect((await u.call('GET', '/api/me')).body.comeback).toBeNull();
    await away(u.user.id, 6);
    expect((await u.call('GET', '/api/me')).body.comeback).toBeNull();
    await away(u.user.id, 7);
    expect((await u.call('GET', '/api/me')).body.comeback).toEqual({ gift: 50 });
  });

  it('два нажатия сразу — начислено один раз; потом подарка нет; через 30+ дней и новую паузу — снова', async () => {
    const u = await login();
    await away(u.user.id, 9);
    const before = await balance(u.user.id);
    const [a, b] = await Promise.all([u.call('POST', '/api/comeback/claim'), u.call('POST', '/api/comeback/claim')]);
    const granted = [a, b].map((r) => (r.status === 200 ? r.body.granted : 0));
    expect(granted.reduce((x, y) => x + y, 0)).toBe(50);
    expect(await balance(u.user.id)).toBe(before + 50);
    expect((await u.call('GET', '/api/me')).body.comeback).toBeNull();
    // Подарок был 31 день назад, игрок снова не занимался 8 дней.
    await db.update(walletTransactions).set({ createdAt: new Date(Date.now() - 31 * 86_400_000) }).where(and(eq(walletTransactions.userId, u.user.id), eq(walletTransactions.reason, 'comeback')));
    await away(u.user.id, 8);
    expect((await u.call('GET', '/api/me')).body.comeback).toEqual({ gift: 50 });
  });

  it('без паузы подарка нет', async () => {
    const u = await login();
    await away(u.user.id, 1);
    const r = await u.call('POST', '/api/comeback/claim');
    expect(r.status).toBe(400);
    expect(r.body.error).toBe('comeback_unavailable');
  });
});

describe('тур по вкладкам', () => {
  it('отметка ставится один раз', async () => {
    const u = await login();
    expect((await u.call('GET', '/api/me')).body.tourDone).toBe(false);
    expect((await u.call('POST', '/api/flags/tour')).status).toBe(200);
    expect((await u.call('POST', '/api/flags/tour')).status).toBe(200);
    expect((await u.call('GET', '/api/me')).body.tourDone).toBe(true);
    expect(await db.select().from(userFlags).where(and(eq(userFlags.userId, u.user.id), eq(userFlags.key, 'tour')))).toHaveLength(1);
  });
});

describe('открытие карточки бота', () => {
  it('отмечается у последней отправленной карточки этого вида; чужой src — ошибка', async () => {
    const u = await login();
    const day = addDays(today(), -1);
    await db.insert(engageSends).values({ day, telegramId: u.telegramId, userId: u.user.id, kind: 'comeback', lang: 'ru', status: 'SENT', sentAt: new Date() });
    expect((await u.call('POST', '/api/engage/opened', { src: 'card_comeback' })).status).toBe(200);
    const row = await db.select().from(engageSends).where(and(eq(engageSends.day, day), eq(engageSends.telegramId, u.telegramId))).get();
    expect(row!.openedAt).toBeInstanceOf(Date);
    expect((await u.call('POST', '/api/engage/opened', { src: 'evil' })).status).toBe(400);
    // Карточки нет — ничего не ломается.
    expect((await u.call('POST', '/api/engage/opened', { src: 'card_mission' })).status).toBe(200);
  });
});
