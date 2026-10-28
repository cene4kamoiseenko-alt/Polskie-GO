/**
 * Міграція 0012 (польської мови інтерфейсу більше немає) на копії даних, як 0009–0011.
 * База — до 0011 включно (як production зараз). Профілі з польською мовою інтерфейсу отримують мову за мовою Telegram
 * (те саме правило, що uiLangFor): ru/be/kk → ru, en → en, решта → uk. Інші рядки й таблиці не змінюються, повтор нічого не робить,
 * і після міграції ці користувачі відкривають застосунок звичайно.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Miniflare } from 'miniflare';
import { uiLangFor } from '@polski-go/shared';
import { buildApp } from '../src/app';
import { bindDb } from '../src/db';
import { setEnv, type Bindings } from '../src/env';
import { buildSeedSql } from '../src/content/seed';
import { signInitData } from '../src/lib/telegram';
import { BOT_TOKEN } from './helpers';

const dir = new URL('../migrations/', import.meta.url);
const files = readdirSync(dir).filter((x) => x.endsWith('.sql')).sort();
const NEW = '0012_ui_language_no_pl.sql';
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
const langOf = async (id: number) =>
  (await d1.prepare('SELECT s.ui_language AS l FROM user_settings s JOIN users u ON u.id = s.user_id WHERE u.telegram_id = ?').bind(id).first<{ l: string }>())!.l;

beforeAll(async () => {
  mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response(null) } }', d1Databases: { DB: `mig12-${Date.now()}` } });
  d1 = (await mf.getD1Database('DB')) as unknown as D1Database;
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

describe('міграція 0012 на копії даних', () => {
  it('0012 — лише UPDATE мови інтерфейсу з польської; без DROP, ALTER, DELETE', () => {
    const sql = readFileSync(new URL(NEW, dir), 'utf8');
    expect(statements(NEW)).toHaveLength(1);
    expect(statements(NEW)[0]).toMatch(/UPDATE `user_settings` SET `ui_language`[\s\S]*WHERE `ui_language` = 'pl';$/);
    expect(sql).not.toMatch(/\b(DROP|ALTER|DELETE|INSERT)\b/i);
  });

  it('польська → мова за Telegram (як uiLangFor); інші профілі й таблиці не змінюються; повтор нічого не робить', async () => {
    // Профілі, де до 0012 була польська (обрана вручну або за мовою Telegram «pl»).
    const legacy: [number, string | undefined][] = [[7_712_001, 'uk'], [7_712_002, 'ru'], [7_712_003, 'be'], [7_712_004, 'en-GB'], [7_712_005, 'pl'], [7_712_006, 'de'], [7_712_007, undefined]];
    const tokens: string[] = [];
    for (const [id, code] of legacy) {
      tokens.push(await login(id, code));
      await d1.prepare("UPDATE user_settings SET ui_language = 'pl' WHERE user_id = (SELECT id FROM users WHERE telegram_id = ?)").bind(id).run();
    }
    // Свідомий вибір, не польська: лишається як є, навіть коли мова Telegram інша.
    await login(7_712_010, 'uk');
    await d1.prepare("UPDATE user_settings SET ui_language = 'en' WHERE user_id = (SELECT id FROM users WHERE telegram_id = 7712010)").run();

    const before = await snapshot();
    await apply(statements(NEW));
    const after = await snapshot();
    for (const [table, rows] of Object.entries(before)) if (table !== 'user_settings') expect(after[table], table).toBe(rows);

    for (const [id, code] of legacy) expect(await langOf(id), String(code)).toBe(uiLangFor(code));
    expect(legacy.map(([, code]) => uiLangFor(code))).toEqual(['uk', 'ru', 'ru', 'en', 'uk', 'uk', 'uk']);
    expect(await langOf(7_712_010)).toBe('en');
    expect((await d1.prepare("SELECT count(*) AS n FROM user_settings WHERE ui_language = 'pl'").first<{ n: number }>())!.n).toBe(0);

    // Змінилася лише колонка мови: решта полів user_settings та сама.
    const strip = (json: string) => (JSON.parse(json) as Record<string, unknown>[]).map(({ ui_language: _, ...rest }) => rest);
    expect(strip(after.user_settings)).toEqual(strip(before.user_settings));

    const again = await snapshot();
    await apply(statements(NEW));
    expect(await snapshot()).toEqual(again);
    expect((await d1.prepare('PRAGMA quick_check').first<{ quick_check: string }>())?.quick_check).toBe('ok');

    // Після міграції застосунок відкривається, а повернути польську не можна.
    const me = await call('GET', '/api/me', tokens[2]);
    expect(me.status).toBe(200);
    expect(me.body.settings.uiLanguage).toBe('ru');
    expect((await call('PATCH', '/api/me/settings', tokens[2], { uiLanguage: 'pl' })).status).toBe(400);
    expect((await call('PATCH', '/api/me/settings', tokens[2], { uiLanguage: 'en' })).status).toBe(200);
  });

  it('нові користувачі: польська мова Telegram → українська, білоруська → російська', async () => {
    await login(7_712_020, 'pl');
    await login(7_712_021, 'be');
    expect(await langOf(7_712_020)).toBe('uk');
    expect(await langOf(7_712_021)).toBe('ru');
  });
});
