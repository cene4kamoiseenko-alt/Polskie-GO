/**
 * Міграція 0013 (Premium: таблиця звернень у підтримку з оплат і день щита серії) на копії даних, як 0009–0012.
 * База — до 0012 включно. Лише нова таблиця, два індекси й нова nullable-колонка: наявні рядки не змінюються (нова колонка — NULL),
 * а після міграції щит серії, подарунок і /paysupport працюють на старих даних.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Miniflare } from 'miniflare';
import { buildApp } from '../src/app';
import { bindDb } from '../src/db';
import { setEnv, type Bindings } from '../src/env';
import { buildSeedSql } from '../src/content/seed';
import { signInitData } from '../src/lib/telegram';
import { BOT_TOKEN } from './helpers';

const dir = new URL('../migrations/', import.meta.url);
const files = readdirSync(dir).filter((x) => x.endsWith('.sql')).sort();
const NEW = '0013_premium.sql';
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

async function snapshot() {
  const tables = (await d1.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name`).all<{ name: string }>()).results.map((r) => r.name);
  const out: Record<string, string> = {};
  for (const t of tables) out[t] = JSON.stringify((await d1.prepare(`SELECT * FROM "${t}" ORDER BY rowid`).all()).results);
  return out;
}

const login = async (id: number, languageCode?: string) => {
  const user = { id, first_name: `U${id}`, ...(languageCode ? { language_code: languageCode } : {}) };
  const initData = signInitData({ auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'AAH', user: JSON.stringify(user) }, BOT_TOKEN);
  const res = await call('POST', '/api/auth/telegram', undefined, { initData });
  expect(res.status).toBe(200);
  return res.body.token as string;
};
beforeAll(async () => {
  mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response(null) } }', d1Databases: { DB: `mig13-${Date.now()}` } });
  d1 = (await mf.getD1Database('DB')) as unknown as D1Database;
  expect(files).toContain(NEW);
  // Дані «до 0013» створює нинішній код (вхід через Telegram), тож спершу вся схема, потім 0013 знімається
  // (DROP — лише в тестовій копії) і застосовується знову, як у production.
  for (const f of files) await apply(statements(f));
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

describe('міграція 0013 на копії даних', () => {
  it('0013 — нова таблиця, індекси й колонка; без DROP, UPDATE, DELETE', () => {
    const sql = readFileSync(new URL(NEW, dir), 'utf8');
    const stmts = statements(NEW);
    expect(stmts).toHaveLength(4);
    expect(stmts[0]).toMatch(/^CREATE TABLE `support_requests`/);
    expect(stmts[3]).toBe('ALTER TABLE `player_progress` ADD `streak_shield_day` text;');
    // «ON UPDATE / ON DELETE» у зовнішньому ключі — не зміна даних: перевіряємо початок кожної інструкції.
    expect(stmts.every((x) => /^(CREATE TABLE|CREATE INDEX|ALTER TABLE `player_progress` ADD )/.test(x))).toBe(true);
    expect(sql).not.toMatch(/\b(DROP|INSERT INTO|DELETE FROM)\b|\bUPDATE `/i);
  });

  it('наявні дані ті самі (нова колонка — NULL); після міграції застосунок і Premium-функції працюють', async () => {
    const token = await login(7_713_001, 'ru');
    await login(7_713_002, 'uk');
    await apply(['DROP INDEX `support_requests_tg_status_idx`', 'DROP INDEX `support_requests_status_idx`', 'DROP TABLE `support_requests`', 'ALTER TABLE `player_progress` DROP COLUMN `streak_shield_day`']);
    const before = await snapshot();
    expect(before.support_requests).toBeUndefined();
    await apply(statements(NEW));
    const after = await snapshot();
    for (const [table, rows] of Object.entries(before)) {
      if (table === 'player_progress') {
        const strip = (json: string) => (JSON.parse(json) as Record<string, unknown>[]).map(({ streak_shield_day: s, ...rest }) => ({ rest, s }));
        expect(strip(after[table]).map((r) => r.rest)).toEqual(strip(rows).map((r) => r.rest));
        expect(strip(after[table]).every((r) => r.s === null)).toBe(true);
      } else expect(after[table], table).toBe(rows);
    }
    expect(after.support_requests).toBe('[]');
    expect((await d1.prepare('PRAGMA quick_check').first<{ quick_check: string }>())?.quick_check).toBe('ok');
    expect((await d1.prepare('PRAGMA foreign_key_check').all()).results).toEqual([]);

    const me = await call('GET', '/api/me', token);
    expect(me.status).toBe(200);
    expect((await call('GET', '/api/premium', token)).body.gift).toMatchObject({ ready: false, claimed: false });
    expect((await call('GET', '/api/missions', token)).body.missions.filter((m: { locked: boolean }) => m.locked)).toHaveLength(3);
  });
});
