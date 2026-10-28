/**
 * Миграция 0011 (bot_contacts — аудитория бота для админки) на копии живых данных, как 0009 и 0010.
 * База — до 0010 включительно (как production сейчас); данные пишет настоящий код: вход в Mini App, настройки и /quiz в боте
 * (bot_quiz_players). Потом 0011: каждая прежняя таблица побайтно та же, новая заполнена только теми, кто пользовался /quiz
 * (имя — из users, если человек открывал приложение), целостность в порядке; webhook после миграции пишет в новую таблицу.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Miniflare } from 'miniflare';
import { buildApp } from '../src/app';
import { bindDb } from '../src/db';
import { setEnv, type Bindings } from '../src/env';
import { buildSeedSql } from '../src/content/seed';
import { signInitData } from '../src/lib/telegram';
import { BOT_TOKEN } from './helpers';

const dir = new URL('../migrations/', import.meta.url);
const files = readdirSync(dir).filter((x) => x.endsWith('.sql')).sort();
const NEW = '0011_bot_contacts.sql';
const statements = (f: string) => readFileSync(new URL(f, dir), 'utf8').split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean);

let mf: Miniflare;
let d1: D1Database;
let env: Bindings;
let app: ReturnType<typeof buildApp>;

async function apply(stmts: string[]) {
  for (let i = 0; i < stmts.length; i += 50) await d1.batch(stmts.slice(i, i + 50).map((s) => d1.prepare(s)));
}

async function call(method: string, url: string, token?: string, payload?: unknown, headers: Record<string, string> = {}) {
  const res = await app.request(url, { method, headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}), ...(payload !== undefined ? { 'content-type': 'application/json' } : {}) }, body: payload !== undefined ? JSON.stringify(payload) : undefined }, env);
  setEnv(env);
  bindDb(d1);
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

async function snapshot() {
  const tables = (await d1.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name`).all<{ name: string }>()).results.map((r) => r.name);
  const out: Record<string, string> = {};
  for (const t of tables) out[t] = JSON.stringify((await d1.prepare(`SELECT * FROM "${t}" ORDER BY rowid`).all()).results);
  return out;
}

let upd = 500;
const quiz = (from: { id: number; first_name: string }) =>
  call('POST', '/telegram/webhook', undefined, { update_id: ++upd, message: { message_id: upd, chat: { id: from.id, type: 'private' }, from, text: '/quiz' } }, { 'x-telegram-bot-api-secret-token': 'hook-secret' });

beforeAll(async () => {
  mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response(null) } }', d1Databases: { DB: `mig11-${Date.now()}` } });
  d1 = (await mf.getD1Database('DB')) as unknown as D1Database;
  expect(files).toContain(NEW);
  for (const f of files.filter((x) => x < NEW)) await apply(statements(f));
  await apply(buildSeedSql());
  env = {
    DB: d1, ENVIRONMENT: 'test', SESSION_SECRET: 'test-secret-test-secret-test-secret-123', TELEGRAM_BOT_TOKEN: BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET: 'hook-secret',
    DEV_AUTH: 'false', ANTHROPIC_API_KEY: '', ADMIN_EMAIL: 'admin@test.dev', ADMIN_PASSWORD: 'admin-password-123', WEB_APP_URL: 'https://polski.example/app/', TELEGRAM_BOT_USERNAME: 'Polski_Go_Bot',
  };
  setEnv(env);
  bindDb(d1);
  app = buildApp();
  // Bot API подменён: ответы бота уходят в никуда.
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { headers: { 'content-type': 'application/json' } }));
});
afterAll(async () => {
  vi.restoreAllMocks();
  await mf?.dispose();
});

describe('миграция 0011 на копии данных', () => {
  it('0011 добавляет таблицу и индекс и переносит игроков /quiz; без DROP, ALTER, UPDATE, DELETE', () => {
    const stmts = statements(NEW);
    expect(stmts).toHaveLength(3);
    expect(stmts[0]).toMatch(/^CREATE TABLE `bot_contacts`/);
    expect(stmts[1]).toMatch(/^CREATE INDEX `bot_contacts_first_seen_idx`/);
    expect(stmts[2]).toMatch(/INSERT INTO `bot_contacts`[\s\S]*FROM `bot_quiz_players`/);
    expect(readFileSync(new URL(NEW, dir), 'utf8')).not.toMatch(/\b(DROP|ALTER|UPDATE|DELETE)\b/i);
  });

  it('прежние таблицы побайтно те же; bot_contacts — игроки /quiz с именем из приложения; webhook пишет в неё', async () => {
    // Открывал приложение и играл в /quiz.
    const tgApp = 7_711_001;
    const initData = signInitData({ auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'AAH', user: JSON.stringify({ id: tgApp, first_name: 'Anna', username: 'anna_pl', language_code: 'ru' }) }, BOT_TOKEN);
    const auth = await call('POST', '/api/auth/telegram', undefined, { initData });
    expect(auth.status).toBe(200);
    await call('PATCH', '/api/me/settings', auth.body.token, { uiLanguage: 'ru' });
    expect((await quiz({ id: tgApp, first_name: 'Anna' })).status).toBe(200);
    // Только /quiz в боте, без приложения.
    const tgBot = 7_711_002;
    expect((await quiz({ id: tgBot, first_name: 'Bohdan' })).status).toBe(200);
    // Только приложение.
    const tgOnlyApp = 7_711_003;
    const initData2 = signInitData({ auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'AAH', user: JSON.stringify({ id: tgOnlyApp, first_name: 'Ola' }) }, BOT_TOKEN);
    expect((await call('POST', '/api/auth/telegram', undefined, { initData: initData2 })).status).toBe(200);
    const players = (await d1.prepare('SELECT telegram_id, created_at, updated_at FROM bot_quiz_players ORDER BY telegram_id').all<{ telegram_id: number; created_at: number; updated_at: number }>()).results;
    expect(players.map((p) => p.telegram_id)).toEqual([tgApp, tgBot]);

    const before = await snapshot();
    expect(before.bot_contacts).toBeUndefined();
    await apply(statements(NEW));
    const after = await snapshot();
    for (const [table, rows] of Object.entries(before)) expect(after[table], table).toBe(rows);
    expect((await d1.prepare('PRAGMA quick_check').first<{ quick_check: string }>())?.quick_check).toBe('ok');
    expect((await d1.prepare('PRAGMA foreign_key_check').all()).results).toEqual([]);

    const contacts = (await d1.prepare('SELECT * FROM bot_contacts ORDER BY telegram_id').all()).results;
    expect(contacts).toEqual([
      { telegram_id: tgApp, first_name: 'Anna', last_name: null, username: 'anna_pl', language_code: 'ru', start_param: null, last_command: 'quiz', first_seen_at: players[0].created_at, last_seen_at: players[0].updated_at, blocked_at: null },
      { telegram_id: tgBot, first_name: '', last_name: null, username: null, language_code: null, start_param: null, last_command: 'quiz', first_seen_at: players[1].created_at, last_seen_at: players[1].updated_at, blocked_at: null },
    ]);

    // После миграции webhook дописывает имя и команду; новый человек появляется сам.
    await quiz({ id: tgBot, first_name: 'Bohdan' });
    expect(await d1.prepare('SELECT first_name, last_command FROM bot_contacts WHERE telegram_id = ?').bind(tgBot).first()).toEqual({ first_name: 'Bohdan', last_command: 'quiz' });
    const admin = await call('POST', '/api/admin/login', undefined, { email: 'admin@test.dev', password: 'admin-password-123' });
    const list = await call('GET', '/api/admin/audience', admin.body.token);
    expect(list.status).toBe(200);
    expect(list.body.summary).toMatchObject({ total: 3, bot: 2, app: 2, botOnly: 1, blocked: 0 });
  });
});
