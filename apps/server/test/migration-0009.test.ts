/**
 * Миграция 0009 (быстрые вопросы, состояние бота) на копии живых данных.
 * База собирается до 0008 включительно — как production сейчас; данные пишет настоящий код приложения
 * (вход, настройки, миссия с XP, Złotki, словами, заданиями и достижениями); затем применяется 0009.
 * Проверяется: каждая прежняя таблица побайтно та же, новые таблицы пусты, целостность и внешние ключи в порядке,
 * а после миграции прогресс читается тем же и бот работает с новыми таблицами.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Miniflare } from 'miniflare';
import { buildApp } from '../src/app';
import { bindDb } from '../src/db';
import { setEnv, type Bindings } from '../src/env';
import { buildSeedSql } from '../src/content/seed';
import { signInitData } from '../src/lib/telegram';
import { MISSIONS } from '../src/content/missions';
import { BOT_TOKEN } from './helpers';

const dir = new URL('../migrations/', import.meta.url);
const files = readdirSync(dir).filter((x) => x.endsWith('.sql')).sort();
const NEW = '0009_bot_quiz.sql';
const NEW_TABLES = ['app_state', 'bot_quiz_players', 'bot_quiz_rounds'];
const ADDITIVE_LATER = ['0013_premium.sql'];
const statements = (f: string) => readFileSync(new URL(f, dir), 'utf8').split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean);

let mf: Miniflare;
let d1: D1Database;
let env: Bindings;
let app: ReturnType<typeof buildApp>;

async function apply(stmts: string[]) {
  for (let i = 0; i < stmts.length; i += 50) await d1.batch(stmts.slice(i, i + 50).map((s) => d1.prepare(s)));
}

async function call(method: string, url: string, token?: string, payload?: unknown) {
  const res = await app.request(url, { method, headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...(payload !== undefined ? { 'content-type': 'application/json' } : {}) }, body: payload !== undefined ? JSON.stringify(payload) : undefined }, env);
  setEnv(env);
  bindDb(d1);
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

/** Все таблицы и содержимое каждой (упорядочено), кроме служебных. */
async function snapshot() {
  const tables = (await d1.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name`).all<{ name: string }>()).results.map((r) => r.name);
  const out: Record<string, string> = {};
  for (const t of tables) out[t] = JSON.stringify((await d1.prepare(`SELECT * FROM "${t}" ORDER BY rowid`).all()).results);
  return out;
}

beforeAll(async () => {
  mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response(null) } }', d1Databases: { DB: `mig-${Date.now()}` } });
  d1 = (await mf.getD1Database('DB')) as unknown as D1Database;
  // 0009 уже в production; позднейшие миграции проверяют свои тесты (migration-0010.test.ts).
  expect(files).toContain(NEW);
  // Плюс пізніші міграції, що лише додають схему й від цієї не залежать (0013: таблиця й колонка Premium), — без них
  // нинішній код, яким тест створює дані, не працює. Сама перевірка — як і раніше: що змінює саме ця міграція.
  for (const f of files.filter((x) => x < NEW || ADDITIVE_LATER.includes(x))) await apply(statements(f));
  await apply(buildSeedSql());
  env = {
    DB: d1, ENVIRONMENT: 'test', SESSION_SECRET: 'test-secret-test-secret-test-secret-123', TELEGRAM_BOT_TOKEN: BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET: 'hook-secret',
    DEV_AUTH: 'false', ANTHROPIC_API_KEY: '', ADMIN_EMAIL: 'admin@test.dev', ADMIN_PASSWORD: 'admin-password-123',
  };
  setEnv(env);
  bindDb(d1);
  app = buildApp();
});
afterAll(async () => {
  await mf?.dispose();
});

describe('миграция 0009 на копии данных', () => {
  it('0009 только добавляет: CREATE TABLE / CREATE INDEX, без DROP, ALTER, UPDATE, DELETE', () => {
    for (const s of statements(NEW)) expect(s).toMatch(/^CREATE (TABLE|INDEX) `/);
    expect(readFileSync(new URL(NEW, dir), 'utf8')).not.toMatch(/\b(DROP|ALTER|UPDATE|DELETE|INSERT)\b/i);
  });

  it('прогресс пользователей до и после 0009 совпадает побайтно; новые таблицы пустые; бот работает', async () => {
    // Живые данные: два ученика, настройки, миссия (XP, Złotki, слова, повторения, задания, достижения).
    const users: { token: string; tg: number }[] = [];
    for (const tg of [7_700_001, 7_700_002]) {
      const initData = signInitData({ auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'AAH', user: JSON.stringify({ id: tg, first_name: `M${tg}`, language_code: 'ru' }) }, BOT_TOKEN);
      const r = await call('POST', '/api/auth/telegram', undefined, { initData });
      expect(r.status).toBe(200);
      users.push({ token: r.body.token, tg });
    }
    await call('PATCH', '/api/me/settings', users[0].token, { uiLanguage: 'ru', reminderHour: 19, timezone: 'Europe/Warsaw' });
    const zabka = MISSIONS.find((m) => m.slug === 'zabka-first-order')!;
    const start = await call('POST', `/api/missions/${zabka.slug}/start`, users[0].token);
    for (const [i, s] of zabka.steps.entries()) {
      const answer = s.kind === 'build' ? { text: s.answer } : { option: s.options!.findIndex((o) => o.ok) };
      expect((await call('POST', `/api/missions/runs/${start.body.runId}/answer`, users[0].token, { step: i, ...answer })).status).toBe(200);
    }
    await call('GET', '/api/quests', users[0].token);
    const meBefore = (await call('GET', '/api/me', users[0].token)).body;
    expect(meBefore.progress.xpTotal).toBeGreaterThan(0);

    const before = await snapshot();
    for (const t of NEW_TABLES) expect(before[t]).toBeUndefined();
    const counts = Object.fromEntries(Object.entries(before).map(([t, rows]) => [t, JSON.parse(rows).length]));
    expect(counts.users).toBe(2);
    expect(counts.xp_events).toBeGreaterThan(0);
    expect(counts.user_quests).toBeGreaterThan(0);

    await apply(statements(NEW));

    const after = await snapshot();
    for (const [table, rows] of Object.entries(before)) expect(after[table], table).toBe(rows);
    for (const t of NEW_TABLES) expect(after[t], t).toBe('[]');
    expect((await d1.prepare('PRAGMA quick_check').first<{ quick_check: string }>())?.quick_check).toBe('ok');
    expect((await d1.prepare('PRAGMA foreign_key_check').all()).results).toEqual([]);

    const meAfter = (await call('GET', '/api/me', users[0].token)).body;
    expect(meAfter.progress).toEqual(meBefore.progress);
    expect(meAfter.wallet ?? null).toEqual(meBefore.wallet ?? null);

    // Бот с новыми таблицами: /quiz создаёт раунд (Telegram подменён — проверка кода, не настоящего бота).
    const realFetch = globalThis.fetch;
    globalThis.fetch = (async () => new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { headers: { 'content-type': 'application/json' } })) as typeof fetch;
    try {
      const r = await call('POST', '/telegram/webhook', undefined, undefined);
      expect(r.status).toBe(401);
      const res = await app.request('/telegram/webhook', { method: 'POST', headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': 'hook-secret' }, body: JSON.stringify({ update_id: 1, message: { message_id: 1, chat: { id: users[0].tg, type: 'private' }, from: { id: users[0].tg, first_name: 'M', language_code: 'ru' }, text: '/quiz' } }) }, env);
      expect(res.status).toBe(200);
    } finally {
      globalThis.fetch = realFetch;
    }
    expect((await d1.prepare('SELECT count(*) AS n FROM bot_quiz_rounds').first<{ n: number }>())?.n).toBe(1);
  });
});
