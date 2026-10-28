/**
 * Миграция 0010 (tts_spend — добовий бюджет платного синтезу) на копії живих даних, як 0009.
 * База — до 0009 включно (як production зараз); дані пише справжній код (вхід, налаштування, місія з XP і Złotki);
 * потім 0010. Кожна наявна таблиця побайтно та сама, нова порожня, цілісність у порядку, прогрес читається тим самим,
 * а синтез (Google підмінено) пише облік у нову таблицю.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
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
const NEW = '0010_tts_spend.sql';
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

beforeAll(async () => {
  mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response(null) } }', d1Databases: { DB: `mig10-${Date.now()}` } });
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
  vi.restoreAllMocks();
  await mf?.dispose();
});

describe('міграція 0010 на копії даних', () => {
  it('0010 лише додає таблицю: CREATE TABLE, без DROP, ALTER, UPDATE, DELETE, INSERT', () => {
    const stmts = statements(NEW);
    expect(stmts).toHaveLength(1);
    expect(stmts[0]).toMatch(/^CREATE TABLE `tts_spend`/);
    expect(readFileSync(new URL(NEW, dir), 'utf8')).not.toMatch(/\b(DROP|ALTER|UPDATE|DELETE|INSERT)\b/i);
  });

  it('прогрес до і після 0010 побайтно той самий; tts_spend порожня, потім рахує синтез', async () => {
    const tg = 7_710_001;
    const initData = signInitData({ auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'AAH', user: JSON.stringify({ id: tg, first_name: 'T', language_code: 'ru' }) }, BOT_TOKEN);
    const auth = await call('POST', '/api/auth/telegram', undefined, { initData });
    expect(auth.status).toBe(200);
    const token = auth.body.token as string;
    await call('PATCH', '/api/me/settings', token, { uiLanguage: 'ru', reminderHour: 19, timezone: 'Europe/Warsaw' });
    const zabka = MISSIONS.find((m) => m.slug === 'zabka-first-order')!;
    const start = await call('POST', `/api/missions/${zabka.slug}/start`, token);
    for (const [i, s] of zabka.steps.entries()) {
      const answer = s.kind === 'build' ? { text: s.answer } : { option: s.options!.findIndex((o) => o.ok) };
      expect((await call('POST', `/api/missions/runs/${start.body.runId}/answer`, token, { step: i, ...answer })).status).toBe(200);
    }
    const meBefore = (await call('GET', '/api/me', token)).body;
    expect(meBefore.progress.xpTotal).toBeGreaterThan(0);

    const before = await snapshot();
    expect(before.tts_spend).toBeUndefined();
    await apply(statements(NEW));
    const after = await snapshot();
    for (const [table, rows] of Object.entries(before)) expect(after[table], table).toBe(rows);
    expect(after.tts_spend).toBe('[]');
    expect((await d1.prepare('PRAGMA quick_check').first<{ quick_check: string }>())?.quick_check).toBe('ok');
    expect((await d1.prepare('PRAGMA foreign_key_check').all()).results).toEqual([]);
    expect((await call('GET', '/api/me', token)).body.progress).toEqual(meBefore.progress);

    // Синтез після міграції: Google підмінено, облік — у tts_spend.
    const realFetch = globalThis.fetch;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) =>
      String(url).startsWith('https://texttospeech.googleapis.com/') ? new Response(JSON.stringify({ audioContent: Buffer.from('MP3').toString('base64') })) : realFetch(url as never, init),
    );
    (env as unknown as Record<string, string>).GOOGLE_TTS_API_KEY = 'k';
    const res = await app.request(`/api/tts?text=${encodeURIComponent('Dzień dobry')}`, { headers: { authorization: `Bearer ${token}` } }, env);
    expect(res.status).toBe(200);
    const row = await d1.prepare('SELECT kind, chars, requests FROM tts_spend').first();
    expect(row).toEqual({ kind: 'user', chars: 11, requests: 1 });
  });
});
