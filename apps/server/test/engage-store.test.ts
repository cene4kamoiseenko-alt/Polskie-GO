/**
 * Хранилище вовлечённости (docs/superpowers/specs/2026-11-24-engagement-design.md): карточка бота — одна на человека в день,
 * флаг игрока (тур по вкладкам) ставится один раз, выключатель карточек сохраняется и снимается.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db } from '../src/db';
import { engagePeople, engageSends, userFlags, users } from '../src/db/schema';
import { disposeEnv, getEnv } from './helpers';

beforeAll(async () => {
  await getEnv();
});
afterAll(disposeEnv);

describe('хранилище карточек бота', () => {
  it('карточка — одна на человека в день', async () => {
    const row = { day: '2026-12-05', telegramId: 9_100_001, kind: 'comeback' as const, lang: 'ru' };
    const first = await db.insert(engageSends).values(row).onConflictDoNothing().returning({ day: engageSends.day });
    const second = await db.insert(engageSends).values({ ...row, kind: 'newcomer' }).onConflictDoNothing().returning({ day: engageSends.day });
    expect(first).toHaveLength(1);
    expect(second).toEqual([]);
    const [saved] = await db.select().from(engageSends).where(and(eq(engageSends.day, row.day), eq(engageSends.telegramId, row.telegramId)));
    expect(saved.kind).toBe('comeback');
    expect(saved.status).toBe('PENDING');
    expect(saved.openedAt).toBeNull();
  });

  it('флаг игрока ставится один раз', async () => {
    const [u] = await db.insert(users).values({ telegramId: 9_100_002, firstName: 'Ola', referralCode: 'FLAG9100' }).returning({ id: users.id });
    await db.insert(userFlags).values({ userId: u.id, key: 'tour' }).onConflictDoNothing();
    await db.insert(userFlags).values({ userId: u.id, key: 'tour' }).onConflictDoNothing();
    const rows = await db.select().from(userFlags).where(eq(userFlags.userId, u.id));
    expect(rows).toHaveLength(1);
    expect(rows[0].key).toBe('tour');
    expect(rows[0].at).toBeInstanceOf(Date);
  });

  it('выключатель карточек: выключить и включить обратно', async () => {
    const tg = 9_100_003;
    const now = new Date('2026-12-05T11:00:00Z');
    await db.insert(engagePeople).values({ telegramId: tg, optedOutAt: now }).onConflictDoUpdate({ target: engagePeople.telegramId, set: { optedOutAt: now } });
    expect((await db.select().from(engagePeople).where(eq(engagePeople.telegramId, tg)))[0].optedOutAt?.getTime()).toBe(now.getTime());
    await db.insert(engagePeople).values({ telegramId: tg, optedOutAt: null }).onConflictDoUpdate({ target: engagePeople.telegramId, set: { optedOutAt: null } });
    expect((await db.select().from(engagePeople).where(eq(engagePeople.telegramId, tg)))[0].optedOutAt).toBeNull();
  });
});
