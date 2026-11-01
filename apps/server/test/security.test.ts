/**
 * Аудит безопасности 2026-11-01 (docs/SECURITY_AUDIT_2026-11.md): каждое исправление держится тестом.
 *  • лимит запросов нельзя обойти подделкой заголовка Authorization (ключ — подписанная личность или IP);
 *  • подбор пароля админки гасится счётчиком в D1 (по email и по IP), а не только памятью изолята;
 *  • вторую автопродлеваемую подписку Stars оформить нельзя (двойное списание);
 *  • слишком большое тело отклоняется до чтения; файлы /uploads не могут выполнить скрипт; заголовки безопасности стоят.
 */
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { and, count, eq } from 'drizzle-orm';
import { db } from '../src/db';
import { adminAuditLogs, subscriptions, uploads } from '../src/db/schema';
import { resetRateLimits } from '../src/hono';
import { verifyPasswordDummy } from '../src/lib/password';
import { LOGIN_EMAIL_MAX, LOGIN_IP_MAX, LOGIN_WINDOW_MS, assertLoginAllowed, pruneLoginFailures } from '../src/services/admin-guard';
import { disposeEnv, getEnv, login, request } from './helpers';

afterAll(disposeEnv);
afterEach(() => {
  vi.restoreAllMocks();
  resetRateLimits();
});

const failedRows = (email?: string) =>
  db
    .select({ n: count() })
    .from(adminAuditLogs)
    .where(and(eq(adminAuditLogs.entity, 'admin_login'), email ? eq(adminAuditLogs.entityId, email) : undefined))
    .get()
    .then((r) => r?.n ?? 0);

const tryLogin = (email: string, password: string, headers: Record<string, string> = {}) => request('POST', '/api/admin/login', { email, password }, headers);

describe('лимит запросов: ключ — подписанная личность или IP', () => {
  it('подделка заголовка Authorization не даёт новый счётчик на каждый запрос', async () => {
    await getEnv();
    resetRateLimits();
    const codes: number[] = [];
    // Раньше ключом была «хвостовая» часть заголовка: меняя её, можно было слать запросы без предела.
    for (let i = 0; i < 12; i++) codes.push((await tryLogin(`nobody${i}@test.dev`, 'x', { authorization: `Bearer forged-${i}-${'x'.repeat(40)}` })).status);
    expect(codes.slice(0, 10).every((c) => c === 401)).toBe(true);
    expect(codes[10]).toBe(429);
  });

  it('разные пользователи с настоящими токенами считаются отдельно', async () => {
    const a = await login();
    const b = await login();
    resetRateLimits();
    for (let i = 0; i < 120; i++) expect((await a.call('GET', '/api/tts?text=ok')).status).not.toBe(429);
    // Лимит /tts — 120 в минуту на пользователя: сто двадцать первый запрос первого — отказ, у второго счётчик свой.
    expect((await a.call('GET', '/api/tts?text=ok')).status).toBe(429);
    expect((await b.call('GET', '/api/tts?text=ok')).status).not.toBe(429);
  });
});

describe('вход в админку: подбор пароля', () => {
  it('8 неудач на один email за 15 минут — дальше 429 даже с верным паролем; журнал перестаёт расти', async () => {
    const email = 'victim@test.dev';
    for (let i = 0; i < LOGIN_EMAIL_MAX; i++) {
      resetRateLimits();
      // IP разные: защита по email срабатывает независимо от адреса.
      expect((await tryLogin(email, `wrong-${i}`, { 'cf-connecting-ip': `203.0.113.${i + 1}` })).status).toBe(401);
    }
    expect(await failedRows(email)).toBe(LOGIN_EMAIL_MAX);
    resetRateLimits();
    const locked = await tryLogin(email, 'admin-password-123', { 'cf-connecting-ip': '198.51.100.7' });
    expect(locked.status).toBe(429);
    expect(locked.body.error).toBe('too_many_attempts');
    expect(await failedRows(email)).toBe(LOGIN_EMAIL_MAX);
  });

  it('окно 15 минут: позже счётчик снова пустой; старые строки убирает cron', async () => {
    const later = new Date(Date.now() + LOGIN_WINDOW_MS + 60_000);
    await expect(assertLoginAllowed('victim@test.dev', '198.51.100.7', later)).resolves.toBeUndefined();
    await expect(assertLoginAllowed('victim@test.dev', '198.51.100.7')).rejects.toMatchObject({ status: 429 });
    const before = await failedRows();
    expect(before).toBeGreaterThan(0);
    await pruneLoginFailures(new Date(Date.now() + 8 * 86_400_000));
    expect(await failedRows()).toBe(0);
  });

  it('30 неудач с одного IP по разным почтам — дальше 429 (перебор чужих адресов)', async () => {
    const ip = '192.0.2.50';
    for (let i = 0; i < LOGIN_IP_MAX; i++) {
      resetRateLimits();
      expect((await tryLogin(`probe${i}@test.dev`, 'x', { 'cf-connecting-ip': ip })).status).toBe(401);
    }
    resetRateLimits();
    expect((await tryLogin('probe-next@test.dev', 'x', { 'cf-connecting-ip': ip })).status).toBe(429);
    // С другого адреса вход работает: блокируется адрес, а не весь сервис.
    resetRateLimits();
    expect((await tryLogin('admin@test.dev', 'admin-password-123', { 'cf-connecting-ip': '192.0.2.51' })).status).toBe(200);
    await pruneLoginFailures(new Date(Date.now() + 8 * 86_400_000));
  });

  it('неизвестный email проверяется тем же PBKDF2 и отвечает так же, как неверный пароль', async () => {
    await expect(verifyPasswordDummy('anything')).resolves.toBe(false);
    resetRateLimits();
    const unknown = await tryLogin('ghost@test.dev', 'whatever1', { 'cf-connecting-ip': '192.0.2.60' });
    const wrong = await tryLogin('admin@test.dev', 'whatever1', { 'cf-connecting-ip': '192.0.2.61' });
    expect(unknown.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(unknown.body).toEqual(wrong.body);
    await pruneLoginFailures(new Date(Date.now() + 8 * 86_400_000));
  });
});

describe('Premium: вторая автопродлеваемая подписка', () => {
  function mockBot() {
    const realFetch = globalThis.fetch;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      if (!String(url).startsWith('https://api.telegram.org/')) return realFetch(url as never, init);
      const method = String(url).split('/').pop()!;
      return new Response(JSON.stringify({ ok: true, result: method === 'createInvoiceLink' ? 'https://t.me/$invoice' : true }), { status: 200 });
    });
  }

  it('при действующей автопродлеваемой подписке счёт на такой же тариф не создаётся; разовый тариф и отменённая подписка — можно', async () => {
    mockBot();
    const u = await login();
    // Без подписки счёт создаётся.
    expect((await u.call('POST', '/api/premium/invoice', { plan: 'MONTH_1' })).status).toBe(200);
    const row = { userId: u.user.id, planCode: 'MONTH_1', startsAt: new Date(), expiresAt: new Date(Date.now() + 20 * 86_400_000), isRecurring: true, telegramChargeId: `ch_${u.user.id}` } as const;
    await db.insert(subscriptions).values({ ...row, status: 'ACTIVE' });
    const second = await u.call('POST', '/api/premium/invoice', { plan: 'MONTH_1' });
    expect(second.status).toBe(409);
    expect(second.body.error).toBe('already_subscribed');
    // Разовый тариф продлевает срок, двойного списания нет.
    expect((await u.call('POST', '/api/premium/invoice', { plan: 'MONTH_3' })).status).toBe(200);
    // Отменённая подписка (срок ещё идёт): новую оформить можно.
    await db.update(subscriptions).set({ status: 'CANCELLED' }).where(eq(subscriptions.userId, u.user.id));
    expect((await u.call('POST', '/api/premium/invoice', { plan: 'MONTH_1' })).status).toBe(200);
  });
});

describe('размер тела, загруженные файлы, заголовки', () => {
  it('тело больше мегабайта по заявленной длине отклоняется до чтения', async () => {
    const u = await login();
    const r = await request('PATCH', '/api/me/profile', { displayName: 'x' }, { authorization: `Bearer ${u.token}`, 'content-length': '5000000' });
    expect(r.status).toBe(413);
  });

  it('/uploads: sandbox и nosniff — загруженный файл не выполнит скрипт на адресе приложения', async () => {
    const { app, env } = await getEnv();
    const name = `sec-${Date.now().toString(36)}.png`;
    await db.insert(uploads).values({ name, type: 'image/png', data: Buffer.from('<script>alert(1)</script>') });
    const res = await app.request(`/uploads/${name}`, {}, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-security-policy')).toBe("default-src 'none'; sandbox");
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    await db.delete(uploads).where(eq(uploads.name, name));
  });

  it('API отдаёт заголовки безопасности', async () => {
    const { app, env } = await getEnv();
    const res = await app.request('/api/health', {}, env);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
  });
});
