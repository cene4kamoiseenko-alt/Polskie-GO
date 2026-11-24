/**
 * Админка «Карточки бота» (docs/superpowers/specs/2026-11-24-engagement-design.md, разделы 7–8): включение — только главный админ,
 * с записью в журнал; «прислать себе» не пишет в статистику; отчёт по видам карточек со сторожем «отпугиваем?» (выключили и
 * заблокировали бота за 48 часов); воронка первого урока — где новички бросают.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../src/db';
import { adminAuditLogs, botContacts, dailyActivity, engageSends } from '../src/db/schema';
import { firstLessonFunnel } from '../src/services/engage-admin';
import { disposeEnv, getEnv, login, request } from './helpers';
import { fakeTelegram } from './tg-fake';

afterAll(disposeEnv);
afterEach(() => vi.unstubAllGlobals());

let seq = 0;
let rootToken = '';
const signIn = async (email: string, password: string) => (await request('POST', '/api/admin/login', { email, password })).body;
type Call = (method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown) => ReturnType<typeof request>;
const as = (token: string): Call => (method, path, body) => request(method, `/api/admin${path}`, body, { authorization: `Bearer ${token}` });
async function makeAdmin(role: 'SUPERADMIN' | 'SUPPORT') {
  const email = `${role.toLowerCase()}-engage-${++seq}@test.dev`;
  expect((await as(rootToken)('POST', '/admins', { email, name: `${role} ${seq}`, role, password: 'role-password-123' })).status).toBe(200);
  return as((await signIn(email, 'role-password-123')).token);
}
beforeAll(async () => {
  const { env } = await getEnv();
  env.WEB_APP_URL = 'https://polski.example/app/';
  env.TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN || 'test-token';
  rootToken = (await signIn('admin@test.dev', 'admin-password-123')).token;
});

describe('воронка первого урока', () => {
  it('где бросают: номер и вид задания', () => {
    const f = firstLessonFunnel([
      { status: 'FINISHED', total: 8, answered: 8, lastType: 'FILL_GAP' },
      { status: 'ABANDONED', total: 8, answered: 3, lastType: 'LISTENING' },
      { status: 'ABANDONED', total: 8, answered: 3, lastType: 'LISTENING' },
      { status: 'ACTIVE', total: 8, answered: 0, lastType: null },
    ]);
    expect(f).toMatchObject({ opened: 4, answered1: 3, reached4: 1, finished: 1 });
    expect(f.dropAt[0]).toEqual({ index: 3, type: 'LISTENING', n: 2 });
  });
});

describe('карточки бота в админке', () => {
  it('отчёт по видам: отправлено, дошло, открыли, занимались в тот же день, выключили и заблокировали за 48 часов', async () => {
    const day = '2026-11-20';
    const sent = new Date('2026-11-20T11:05:00Z');
    const a = await login();
    const b = await login();
    await db.insert(engageSends).values([
      { day, telegramId: a.telegramId, userId: a.user.id, kind: 'comeback', lang: 'ru', status: 'SENT', sentAt: sent, openedAt: new Date('2026-11-20T12:00:00Z') },
      { day, telegramId: b.telegramId, userId: b.user.id, kind: 'comeback', lang: 'ru', status: 'SENT', sentAt: sent },
    ]);
    await db.insert(dailyActivity).values({ userId: a.user.id, day, xp: 10 }).onConflictDoNothing();
    await db
      .insert(botContacts)
      .values({ telegramId: b.telegramId, firstName: 'B', languageCode: 'ru', firstSeenAt: sent, lastSeenAt: sent, blockedAt: new Date('2026-11-20T13:00:00Z') })
      .onConflictDoUpdate({ target: botContacts.telegramId, set: { blockedAt: new Date('2026-11-20T13:00:00Z') } });
    const support = await makeAdmin('SUPPORT');
    const r = await support('GET', '/engage?days=90');
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    expect(r.body.state).toEqual({ enabled: false });
    expect(r.body.kinds.comeback).toMatchObject({ sent: 2, delivered: 2, opened: 1, studiedSameDay: 1, optedOut48h: 0, blocked48h: 1 });
    expect(r.body.kinds.newcomer).toMatchObject({ sent: 0 });
    expect(r.body.bridge).toMatchObject({ answered: expect.any(Number), warmupStarted: expect.any(Number), warmupFinished: expect.any(Number) });
    expect(r.body.firstLesson).toMatchObject({ opened: expect.any(Number) });
  });

  it('включить может только главный админ; включение — в журнале', async () => {
    const support = await makeAdmin('SUPPORT');
    expect((await support('PATCH', '/engage/state', { enabled: true })).status).toBe(403);
    const boss = await makeAdmin('SUPERADMIN');
    const r = await boss('PATCH', '/engage/state', { enabled: true });
    expect(r.status).toBe(200);
    expect(r.body.state).toEqual({ enabled: true });
    const log = await db.select().from(adminAuditLogs).where(eq(adminAuditLogs.action, 'engage_start')).orderBy(desc(adminAuditLogs.createdAt)).limit(1);
    expect(log).toHaveLength(1);
    await boss('PATCH', '/engage/state', { enabled: false });
  });

  it('«прислать себе» шлёт карточку и не пишет её в статистику', async () => {
    const me = await login();
    const boss = await makeAdmin('SUPERADMIN');
    const calls = fakeTelegram();
    const r = await boss('POST', '/engage/test', { who: String(me.telegramId), kind: 'mission', lang: 'ru' });
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    const photo = calls.filter((c) => c.method === 'sendPhoto' && c.params.chat_id === me.telegramId);
    expect(photo).toHaveLength(1);
    expect(photo[0].params.caption).toContain('Миссия недели');
    expect(await db.select().from(engageSends).where(and(eq(engageSends.telegramId, me.telegramId)))).toHaveLength(0);
  });
});
