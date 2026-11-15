/**
 * Вовлечённость в админке (2026-11-15): сегменты, липкость, глубина, интерес к разделам, «лестница» уроков, самые вовлечённые и
 * «под угрозой»; оценка и сегмент у игрока в списке и карточке; отбор списка по сегменту.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { dayKey } from '@polski-go/shared';
import { db } from '../src/db';
import { dailyActivity, playerProgress } from '../src/db/schema';
import { disposeEnv, getEnv, login, request } from './helpers';

afterAll(disposeEnv);
const DAY = 86_400_000;
const day = (ago: number) => dayKey(new Date(Date.now() - ago * DAY), 'Europe/Warsaw');
let token = '';
const admin = (path: string) => request('GET', `/api/admin${path}`, undefined, { authorization: `Bearer ${token}` });

beforeAll(async () => {
  await getEnv();
  token = (await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' })).body.token;
});

describe('вовлечённость', () => {
  it('ядро, под угрозой, не начал: сегменты, оценка, списки «самые вовлечённые» и «кому написать», отбор игроков', async () => {
    const core = await login();
    const risk = await login();
    const fresh = await login();
    for (const ago of [0, 1, 2, 3, 5]) await db.insert(dailyActivity).values({ userId: core.user.id, day: day(ago), xp: 120, lessons: 2, seconds: 900 });
    for (const ago of [10, 11, 12, 13, 15, 16]) await db.insert(dailyActivity).values({ userId: risk.user.id, day: day(ago), xp: 60, lessons: 1, seconds: 600 });
    await db.update(playerProgress).set({ streakCurrent: 4, lastActiveDay: day(0), lessonsCompleted: 12 }).where(eq(playerProgress.userId, core.user.id));
    await db.update(playerProgress).set({ lessonsCompleted: 6 }).where(eq(playerProgress.userId, risk.user.id));

    const r = await admin('/engagement');
    expect(r.status).toBe(200);
    const e = r.body;
    expect(e.segments.core).toBeGreaterThanOrEqual(1);
    expect(e.segments.at_risk).toBeGreaterThanOrEqual(1);
    expect(e.segments.never).toBeGreaterThanOrEqual(1);
    expect(e.stickiness.dau).toBeGreaterThanOrEqual(1);
    expect(e.stickiness.wau).toBeGreaterThanOrEqual(1);
    expect(e.depth.minutesPerDay).toBeGreaterThan(0);
    expect(e.features.find((f: { key: string }) => f.key === 'lessons').users).toBeGreaterThanOrEqual(1);
    expect(e.hourly).toHaveLength(24);
    expect(e.weekly).toHaveLength(7);
    expect(e.ladder.steps.find((s: { lessons: number }) => s.lessons === 10).users).toBeGreaterThanOrEqual(1);
    expect(e.top.map((x: { id: string }) => x.id)).toContain(core.user.id);
    expect(e.atRisk.map((x: { id: string }) => x.id)).toContain(risk.user.id);

    // Список игроков: оценка и сегмент; отбор «ядро» / «под угрозой» / «не начали».
    const coreList = (await admin('/users?filter=core')).body.items;
    const mine = coreList.find((x: { id: string }) => x.id === core.user.id);
    expect(mine.engagement).toMatchObject({ segment: 'core', activeDays7: 5 });
    expect(mine.engagement.score).toBeGreaterThan(30);
    expect(coreList.map((x: { id: string }) => x.id)).not.toContain(risk.user.id);
    expect((await admin('/users?filter=at_risk')).body.items.map((x: { id: string }) => x.id)).toContain(risk.user.id);
    expect((await admin('/users?filter=never')).body.items.map((x: { id: string }) => x.id)).toContain(fresh.user.id);

    // Карточка: оценка и дни активности.
    const card = (await admin(`/users/${core.user.id}`)).body;
    expect(card.engagement.segment).toBe('core');
    expect(card.activity.length).toBe(5);
  });
});
