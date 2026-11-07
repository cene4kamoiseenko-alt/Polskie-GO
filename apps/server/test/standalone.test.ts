/**
 * Вход вне Telegram (Android-приложение, веб): гости, ключ устройства, коды переноса и публичные страницы для Google Play.
 * Устройство — services/standalone-auth.ts; страницы и assetlinks — site.ts.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db } from '../src/db';
import { deviceCredentials, linkCodes, userInventory, users } from '../src/db/schema';
import { setEnv } from '../src/env';
import { createLinkCode, LINK_CODE_TTL_MS, MAX_ACTIVE_CODES, normalizeCode, redeemLinkCode } from '../src/services/standalone-auth';
import { disposeEnv, getEnv, login, request } from './helpers';

afterAll(disposeEnv);

/** Каждому «устройству» свой IP: счётчик создания гостей (10/мин с одного адреса) в тестах не мешает. */
let ip = 1;
const guest = async (extra: Record<string, unknown> = {}) => {
  const r = await request('POST', '/api/auth/guest', { platform: 'twa', language: 'ru', ...extra }, { 'cf-connecting-ip': `10.1.${Math.floor(ip / 250)}.${ip++ % 250}` });
  expect(r.status).toBe(200);
  return r.body as { token: string; deviceKey: string; guest: boolean };
};
const meOf = (token: string) => request('GET', '/api/me', undefined, { authorization: `Bearer ${token}` });

describe('гость и ключ устройства', () => {
  it('гость получает токен и ключ; профиль открывается, telegram_id отрицательный, стартовые вещи на месте', async () => {
    const g = await guest();
    expect(g.guest).toBe(true);
    expect(g.deviceKey).toMatch(/^pgd_[A-Za-z0-9_-]{43}$/);
    const me = await meOf(g.token);
    expect(me.status).toBe(200);
    const id = me.body.user?.id ?? me.body.id;
    const row = (await db.select().from(users).where(eq(users.id, id)))[0];
    expect(row.telegramId).toBeLessThan(0);
    expect(row.firstName).toBe('Podróżnik');
    const inv = await db.select().from(userInventory).where(eq(userInventory.userId, id));
    expect(inv.length).toBeGreaterThanOrEqual(3);
  });

  it('профиль: guest=true у гостя, guest=false у игрока Telegram и у устройства, вошедшего по коду', async () => {
    const g = await guest();
    const gm = await meOf(g.token);
    expect((gm.body.user ?? gm.body).guest).toBe(true);

    const tgUser = await login();
    expect(((await tgUser.call('GET', '/api/me')).body.user ?? (await tgUser.call('GET', '/api/me')).body).guest).toBe(false);
    const made = await tgUser.call('POST', '/api/me/link-code');
    const inn = await request('POST', '/api/auth/link', { code: made.body.code, platform: 'twa' });
    const linked = await meOf(inn.body.token);
    expect((linked.body.user ?? linked.body).guest).toBe(false);
  });

  it('в базе только sha-256 ключа, а не сам ключ', async () => {
    const g = await guest();
    const rows = await db.select().from(deviceCredentials);
    expect(rows.some((r) => r.keyHash === g.deviceKey)).toBe(false);
    expect(rows.every((r) => /^[0-9a-f]{64}$/.test(r.keyHash))).toBe(true);
  });

  it('вход по ключу возвращает тот же аккаунт; чужой или неверный ключ — 401', async () => {
    const g = await guest();
    const a = await request('POST', '/api/auth/device', { deviceKey: g.deviceKey });
    expect(a.status).toBe(200);
    const m1 = await meOf(g.token);
    const m2 = await meOf(a.body.token);
    expect(m2.body.user?.id ?? m2.body.id).toBe(m1.body.user?.id ?? m1.body.id);
    expect((await request('POST', '/api/auth/device', { deviceKey: `pgd_${'x'.repeat(43)}` })).status).toBe(401);
    expect((await request('POST', '/api/auth/device', { deviceKey: 'short' })).status).toBe(400);
  });

  it('заблокированный гость не входит', async () => {
    const g = await guest();
    const id = (await meOf(g.token)).body.user?.id ?? (await meOf(g.token)).body.id;
    await db.update(users).set({ isBanned: true, banReason: 'test' }).where(eq(users.id, id));
    expect((await request('POST', '/api/auth/device', { deviceKey: g.deviceKey })).status).toBe(403);
  });

  it('удаление аккаунта убирает и ключи устройств', async () => {
    const g = await guest();
    const id = (await meOf(g.token)).body.user?.id ?? (await meOf(g.token)).body.id;
    const del = await request('DELETE', '/api/me', { confirm: 'DELETE' }, { authorization: `Bearer ${g.token}` });
    expect(del.status).toBe(200);
    expect(await db.select().from(deviceCredentials).where(eq(deviceCredentials.userId, id))).toHaveLength(0);
    expect((await request('POST', '/api/auth/device', { deviceKey: g.deviceKey })).status).toBe(401);
  });

  it('без STANDALONE_AUTH=on (так в production по умолчанию) гостей, входа по ключу и переноса нет', async () => {
    const off = async (url: string, body: unknown) => {
      const { app, env } = await getEnv();
      const res = await app.request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }, { ...env, STANDALONE_AUTH: '' });
      setEnv(env);
      return res.status;
    };
    expect(await off('/api/auth/guest', {})).toBe(404);
    expect(await off('/api/auth/device', { deviceKey: `pgd_${'y'.repeat(43)}` })).toBe(404);
    expect(await off('/api/auth/link', { code: 'ABCD-EFGH' })).toBe(404);
  });
});

describe('суточный потолок гостей', () => {
  it('когда за сутки создано GUEST_DAILY_LIMIT гостей, новый получает 503 guests_busy; Telegram-игроки не затронуты', async () => {
    const { app, env } = await getEnv();
    const res = await app.request('/api/auth/guest', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }, { ...env, GUEST_DAILY_LIMIT: '0' });
    setEnv(env);
    expect(res.status).toBe(503);
    expect(((await res.json()) as { error: string }).error).toBe('guests_busy');
    // Вход игрока Telegram потолком не ограничен.
    await login();
    // Обычный лимит пропускает.
    expect((await request('POST', '/api/auth/guest', {}, { 'cf-connecting-ip': '10.9.9.9' })).status).toBe(200);
  });
});

describe('код переноса: войти на новом устройстве в тот же аккаунт', () => {
  it('игрок Telegram получает код, устройство вводит его и входит как он; код одноразовый', async () => {
    const { call, user } = await login();
    const made = await call('POST', '/api/me/link-code');
    expect(made.status).toBe(200);
    expect(made.body.code).toMatch(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
    expect(new Date(made.body.expiresAt).getTime() - Date.now()).toBeLessThanOrEqual(LINK_CODE_TTL_MS);

    const hashes = await db.select().from(linkCodes).where(eq(linkCodes.userId, user.id));
    expect(hashes).toHaveLength(1);
    expect(made.body.code.replace('-', '')).not.toBe(hashes[0].codeHash);

    // Ввод в другом регистре и с пробелом — тот же код.
    const typed = made.body.code.toLowerCase().replace('-', ' ');
    const inn = await request('POST', '/api/auth/link', { code: typed, platform: 'twa' });
    expect(inn.status).toBe(200);
    expect(inn.body.guest).toBe(false);
    const me = await meOf(inn.body.token);
    expect(me.body.user?.id ?? me.body.id).toBe(user.id);
    // Ключ устройства теперь привязан к аккаунту Telegram-игрока.
    expect((await request('POST', '/api/auth/device', { deviceKey: inn.body.deviceKey })).status).toBe(200);
    expect(await db.select().from(deviceCredentials).where(eq(deviceCredentials.userId, user.id))).toHaveLength(1);

    // Повторный ввод — отказ.
    expect((await request('POST', '/api/auth/link', { code: made.body.code })).status).toBe(400);
  });

  it('параллельный ввод одного кода: успешен ровно один запрос', async () => {
    const { call } = await login();
    const { body } = await call('POST', '/api/me/link-code');
    const rs = await Promise.all([1, 2, 3, 4].map(() => request('POST', '/api/auth/link', { code: body.code, platform: 'web' })));
    expect(rs.filter((r) => r.status === 200)).toHaveLength(1);
    expect(rs.filter((r) => r.status === 400)).toHaveLength(3);
  });

  it('неверный, просроченный и слишком короткий код — 400; код другого игрока чужому не открывает аккаунт', async () => {
    const { user } = await login();
    expect((await request('POST', '/api/auth/link', { code: 'AAAA-BBBB' })).status).toBe(400);
    expect((await request('POST', '/api/auth/link', { code: 'AB' })).status).toBe(400);
    const now = new Date();
    const { code } = await createLinkCode(user.id, new Date(now.getTime() - LINK_CODE_TTL_MS - 1000));
    await expect(redeemLinkCode(code, 'web', now)).rejects.toMatchObject({ status: 400, code: 'invalid_code' });
    expect(normalizeCode('ab-12 cd.')).toBe('AB12CD');
  });

  it('не больше пяти действующих кодов; гость тоже может выдать код для другого устройства', async () => {
    const g = await guest();
    const auth = { authorization: `Bearer ${g.token}` };
    for (let i = 0; i < MAX_ACTIVE_CODES; i++) expect((await request('POST', '/api/me/link-code', undefined, auth)).status).toBe(200);
    const sixth = await request('POST', '/api/me/link-code', undefined, auth);
    expect(sixth.status).toBe(429);
    expect(sixth.body.error).toBe('too_many_codes');
  });

  it('код без входа не выдаётся', async () => {
    expect((await request('POST', '/api/me/link-code')).status).toBe(401);
  });

  it('гость не получает напоминаний и рассылок: условие telegram_id > 0 есть в запросах задач', async () => {
    const g = await guest();
    const id = (await meOf(g.token)).body.user?.id ?? (await meOf(g.token)).body.id;
    const row = (await db.select().from(users).where(and(eq(users.id, id))))[0];
    expect(row.telegramId).toBeLessThan(0);
    const { readFileSync } = await import('node:fs');
    const jobs = readFileSync(new URL('../src/jobs.ts', import.meta.url), 'utf8');
    expect(jobs.match(/gt\(users\.telegramId, 0\)/g)).toHaveLength(2);
  });
});

describe('платежи', () => {
  it('Telegram Stars гостю недоступны: счёт не создаётся (409), Premium в Android-версии — через Google Play', async () => {
    const g = await guest();
    const plans = await request('GET', '/api/premium/plans', undefined, { authorization: `Bearer ${g.token}` });
    const code = plans.body?.plans?.[0]?.code ?? plans.body?.[0]?.code ?? 'MONTH_1';
    const r = await request('POST', '/api/premium/invoice', { plan: code }, { authorization: `Bearer ${g.token}` });
    expect(r.status).toBe(409);
    expect(r.body.error).toBe('stars_unavailable');
  });
});

describe('страницы для Google Play и Digital Asset Links', () => {
  const get = async (url: string, headers: Record<string, string> = {}, over: Record<string, string> = {}) => {
    const { app, env } = await getEnv();
    const res = await app.request(url, { headers }, { ...env, ...over });
    setEnv(env);
    return { status: res.status, type: res.headers.get('content-type') ?? '', text: await res.text() };
  };

  it('/privacy: три языка, выбор через ?lang=, без внешних скриптов; в тексте — что реально собирается', async () => {
    for (const [lang, marker] of [['uk', 'Політика конфіденційності'], ['ru', 'Политика конфиденциальности'], ['en', 'Privacy Policy']] as const) {
      const r = await get(`/privacy?lang=${lang}`);
      expect(r.status).toBe(200);
      expect(r.type).toContain('text/html');
      expect(r.text).toContain(marker);
      expect(r.text).not.toMatch(/<script/i);
      expect(r.text).toMatch(/Telegram/);
    }
    // Язык по заголовку, по умолчанию украинский.
    expect((await get('/privacy', { 'accept-language': 'en-US,en;q=0.9' })).text).toContain('Privacy Policy');
    expect((await get('/privacy')).text).toContain('Політика конфіденційності');
    // Контакт по умолчанию — бот, а не придуманный адрес.
    expect((await get('/privacy?lang=en')).text).toContain('t.me/');
  });

  it('/terms: три языка; правила для имён и фото, жалобы и модерация, оплата только в Telegram; без скриптов', async () => {
    for (const [lang, title, reports] of [['uk', 'Умови використання', 'Скарги та модерація'], ['ru', 'Условия использования', 'Жалобы и модерация'], ['en', 'Terms of Use', 'Reports and moderation']] as const) {
      const r = await get(`/terms?lang=${lang}`);
      expect(r.status).toBe(200);
      expect(r.type).toContain('text/html');
      expect(r.text).toContain(title);
      expect(r.text).toContain(reports);
      expect(r.text).not.toMatch(/<script/i);
    }
    expect((await get('/terms?lang=ru')).text).toContain('/paysupport');
  });

  it('/privacy сообщает про жалобы на игроков', async () => {
    expect((await get('/privacy?lang=ru')).text).toContain('Жалобы:');
    expect((await get('/privacy?lang=en')).text).toContain('Reports:');
  });

  it('/delete-account описывает путь в приложении и ручное удаление', async () => {
    const ru = await get('/delete-account?lang=ru');
    expect(ru.status).toBe(200);
    expect(ru.text).toContain('Удалить аккаунт');
    expect(ru.text).toContain('Экспорт данных');
  });

  it('контакт из SUPPORT_CONTACT: e-mail и ссылка экранируются; чужой HTML не вставляется', async () => {
    expect((await get('/privacy?lang=en', {}, { SUPPORT_CONTACT: 'help@polskigo.example' })).text).toContain('mailto:help@polskigo.example');
    const bad = (await get('/privacy?lang=en', {}, { SUPPORT_CONTACT: '<img src=x onerror=alert(1)>' })).text;
    expect(bad).not.toContain('<img');
    expect(bad).toContain('&lt;img');
  });

  it('assetlinks.json: без отпечатков — пустой список, с отпечатками — запись для Android-приложения', async () => {
    const empty = await get('/.well-known/assetlinks.json');
    expect(empty.status).toBe(200);
    expect(empty.type).toContain('application/json');
    expect(JSON.parse(empty.text)).toEqual([]);
    const full = JSON.parse((await get('/.well-known/assetlinks.json', {}, { ANDROID_PACKAGE_NAME: 'app.polskigo.android', ANDROID_SHA256_FINGERPRINTS: 'aa:bb:cc, DD:EE:FF' })).text);
    expect(full).toEqual([
      { relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: 'app.polskigo.android', sha256_cert_fingerprints: ['AA:BB:CC', 'DD:EE:FF'] } },
    ]);
  });
});
