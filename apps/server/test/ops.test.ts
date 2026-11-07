/**
 * Эксплуатация (2026-11-04): журнал ошибок (клиент, CSP, сервер), ограничитель Cloudflare на вход, очистка журнала.
 * Устройство — services/error-log.ts, app.ts (/api/client-errors, /api/csp-report, onError), hono.ts (edgeRateLimit), docs/OPERATIONS_RU.md.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { errorLog } from '../src/db/schema';
import { normalizeMessage, normalizePath, purgeErrors, recordError } from '../src/services/error-log';
import { BOT_TOKEN, disposeEnv, getEnv, request } from './helpers';
import { signInitData } from '../src/lib/telegram';

afterAll(disposeEnv);

async function adminCall() {
  const res = await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' });
  const token = res.body.token as string;
  return (url: string) => request('GET', `/api/admin${url}`, undefined, { authorization: `Bearer ${token}` });
}

describe('журнал ошибок', () => {
  it('ошибка Mini App без входа: 204, повтор склеивается в одну строку со счётчиком; видна в админке', async () => {
    const msg = `TypeError: Cannot read properties of undefined (reading 'xp') ${Date.now()}`;
    const payload = { message: msg, detail: 'at Home (https://app.example/assets/index-abc.js?v=1:12:34)\nat x', path: '/lesson/l_0123456789abcdef' };
    expect((await request('POST', '/api/client-errors', payload)).status).toBe(204);
    expect((await request('POST', '/api/client-errors', payload)).status).toBe(204);
    const rows = (await db.select().from(errorLog).where(eq(errorLog.kind, 'client'))).filter((r) => r.message.startsWith('TypeError: Cannot read properties of undefined'));
    expect(rows).toHaveLength(1);
    expect(rows[0].count).toBe(2);
    // Изменчивые части убраны: число в конце сообщения и id в пути.
    expect(rows[0].message).toMatch(/\(reading 'xp'\) #$/);
    expect(rows[0].path).toBe('/lesson/:id');
    const admin = await adminCall();
    const dash = (await admin('/dashboard')).body;
    expect(dash.appErrors.total.client).toBeGreaterThanOrEqual(2);
    expect(dash.appErrors.items.some((i: { kind: string; message: string }) => i.kind === 'client' && i.message.startsWith('TypeError'))).toBe(true);
  });

  it('отчёт CSP обоих форматов записывается как «csp» с директивой и источником', async () => {
    const old = { 'csp-report': { 'document-uri': 'https://app.example/shop?x=1', 'violated-directive': 'script-src-elem', 'effective-directive': 'script-src-elem', 'blocked-uri': 'https://evil.example/x.js' } };
    expect((await request('POST', '/api/csp-report', old)).status).toBe(204);
    const modern = [{ type: 'csp-violation', body: { documentURL: 'https://app.example/', effectiveDirective: 'img-src', blockedURL: 'https://cdn.example/a.png' } }];
    expect((await request('POST', '/api/csp-report', modern)).status).toBe(204);
    const csp = await db.select().from(errorLog).where(eq(errorLog.kind, 'csp'));
    expect(csp.map((r) => r.message).sort()).toEqual(expect.arrayContaining(['img-src https://cdn.example', 'script-src-elem https://evil.example']));
    expect(csp.find((r) => r.message.startsWith('script-src'))!.path).toBe('/shop');
  });

  it('слишком длинное или пустое сообщение — 400, журнал не растёт', async () => {
    const before = (await db.select().from(errorLog)).length;
    expect((await request('POST', '/api/client-errors', { message: 'x'.repeat(1001) })).status).toBe(400);
    expect((await request('POST', '/api/client-errors', { message: '' })).status).toBe(400);
    expect((await db.select().from(errorLog)).length).toBe(before);
  });

  it('нормализация: адреса без параметров, длинные id и числа заменены', () => {
    expect(normalizeMessage('Failed to fetch https://x.dev/api/a?token=SECRET#h for 1234567')).toBe('Failed to fetch https://x.dev/api/a for #');
    expect(normalizePath('/api/missions/run/9f8e7d6c5b4a3210/answer?x=1')).toBe('/api/missions/run/:id/answer');
    expect(normalizePath('/api/shop')).toBe('/api/shop');
  });

  it('ошибка сервера записывается; записи старше 30 дней удаляет cron', async () => {
    const now = new Date('2026-11-04T12:00:00Z');
    await recordError({ kind: 'server', message: 'Error: boom', detail: 'Error: boom\n    at handler (worker.js:1:2)', path: '/api/me' }, now);
    await recordError({ kind: 'server', message: 'Error: old', path: '/api/me' }, new Date('2026-09-01T12:00:00Z'));
    await purgeErrors(now);
    const server = await db.select().from(errorLog).where(eq(errorLog.kind, 'server'));
    expect(server.map((r) => r.message)).toContain('Error: boom');
    expect(server.map((r) => r.message)).not.toContain('Error: old');
  });
});

describe('ограничитель Cloudflare (Workers Rate Limiting)', () => {
  it('отказ ограничителя — 429 на входе по initData и в админку; без привязки вход работает', async () => {
    const { app, env } = await getEnv();
    const deny = { limit: async () => ({ success: false }) } as unknown as RateLimit;
    const keys: string[] = [];
    const allow = { limit: async ({ key }: { key: string }) => (keys.push(key), { success: true }) } as unknown as RateLimit;
    const initData = signInitData({ auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'AAH', user: JSON.stringify({ id: 7_100_001, first_name: 'Rl', language_code: 'uk' }) }, BOT_TOKEN);
    const post = (url: string, payload: unknown, e: object) =>
      app.request(url, { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.7' }, body: JSON.stringify(payload) }, { ...env, ...e });
    expect((await post('/api/auth/telegram', { initData }, { RL_AUTH: deny })).status).toBe(429);
    expect((await post('/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' }, { RL_ADMIN: deny })).status).toBe(429);
    expect((await post('/api/client-errors', { message: 'x' }, { RL_REPORT: deny })).status).toBe(429);
    const ok = await post('/api/auth/telegram', { initData }, { RL_AUTH: allow });
    expect(ok.status).toBe(200);
    expect(keys).toEqual(['RL_AUTH:203.0.113.7']);
    // Ограничитель упал (сбой Cloudflare) — вход не блокируется.
    const broken = { limit: async () => { throw new Error('down'); } } as unknown as RateLimit;
    expect((await post('/api/auth/telegram', { initData }, { RL_AUTH: broken })).status).toBe(200);
  });
});
