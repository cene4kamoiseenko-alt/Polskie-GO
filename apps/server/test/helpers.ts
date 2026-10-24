/**
 * Тестове оточення: справжній D1 (Miniflare/workerd) з міграціями та seed,
 * застосунок Hono викликається напряму через app.request().
 */
import { readFileSync, readdirSync } from 'node:fs';
import { Miniflare } from 'miniflare';
import { eq } from 'drizzle-orm';
import type { ExerciseItem, ChoiceData, TextData, OrderData, MatchData, PronunciationData, DialogueData } from '@polski-go/shared';
import { buildApp } from '../src/app';
import { bindDb, db } from '../src/db';
import { learningSessions, lessons, users } from '../src/db/schema';
import { setEnv, type Bindings } from '../src/env';
import { buildSeedSql } from '../src/content/seed';
import { signInitData } from '../src/lib/telegram';

export const BOT_TOKEN = '123456:TEST_TOKEN';

let state: { mf: Miniflare; env: Bindings; app: ReturnType<typeof buildApp> } | null = null;

async function applySql(d1: D1Database, statements: string[]) {
  for (let i = 0; i < statements.length; i += 50) {
    await d1.batch(statements.slice(i, i + 50).map((s) => d1.prepare(s)));
  }
}

export async function getEnv() {
  if (state) return state;
  const mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response(null) } }', d1Databases: { DB: `test-${Date.now()}` } });
  const d1 = (await mf.getD1Database('DB')) as unknown as D1Database;
  const dir = new URL('../migrations/', import.meta.url);
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.sql')).sort()) {
    const stmts = readFileSync(new URL(f, dir), 'utf8').split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean);
    await applySql(d1, stmts);
  }
  await applySql(d1, buildSeedSql());
  const env: Bindings = {
    DB: d1,
    ENVIRONMENT: 'test',
    SESSION_SECRET: 'test-secret-test-secret-test-secret-123',
    TELEGRAM_BOT_TOKEN: BOT_TOKEN,
    TELEGRAM_WEBHOOK_SECRET: 'hook-secret',
    DEV_AUTH: 'false',
    ANTHROPIC_API_KEY: '',
    ADMIN_EMAIL: 'admin@test.dev',
    ADMIN_PASSWORD: 'admin-password-123',
  };
  setEnv(env);
  bindDb(d1);
  state = { mf, env, app: buildApp() };
  return state;
}

export async function disposeEnv() {
  await state?.mf.dispose();
  state = null;
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

/** HTTP-запит до застосунку. */
export async function request(method: Method, url: string, payload?: unknown, headers: Record<string, string> = {}) {
  const { app, env } = await getEnv();
  const init: RequestInit = { method, headers: { ...headers, ...(payload !== undefined ? { 'content-type': 'application/json' } : {}) } };
  if (payload !== undefined) init.body = JSON.stringify(payload);
  const res = await app.request(url, init, env);
  // Middleware прив'язує env/БД; повертаємо їх для прямих запитів у тестах.
  setEnv(env);
  bindDb(env.DB);
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

let nextId = 5_000_000 + Math.floor(Math.random() * 1_000_000);

/** Створює користувача через справжній вхід Telegram (підписані initData). */
export async function login(extra: Record<string, string> = {}) {
  await getEnv();
  const id = nextId++;
  const initData = signInitData(
    { auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'AAH', user: JSON.stringify({ id, first_name: `User${id}`, language_code: 'uk' }), ...extra },
    BOT_TOKEN,
  );
  const res = await request('POST', '/api/auth/telegram', { initData });
  if (res.status !== 200) throw new Error(JSON.stringify(res.body));
  const token = res.body.token as string;
  const user = (await db.query.users.findFirst({ where: eq(users.telegramId, id) }))!;
  const call = (method: Method, url: string, payload?: unknown) => request(method, url, payload, { authorization: `Bearer ${token}` });
  return { token, user, telegramId: id, call };
}

/** Правильні відповіді для вправи (з серверного знімка сесії). */
export function correctAnswers(item: ExerciseItem): unknown[] {
  const d = item.data;
  switch (item.type) {
    case 'SENTENCE_TRANSLATION':
    case 'DICTATION':
    case 'GRAMMAR':
      return [{ text: (d as TextData).accepted[0] }];
    case 'BUILD_SENTENCE':
    case 'WORD_ORDER':
      return [{ tokens: (d as OrderData).answer }];
    case 'MATCH_PAIRS':
      return [{ pairs: (d as MatchData).pairs.map((p) => [p.l, p.r]) }];
    case 'PRONUNCIATION':
      return [{ transcript: (d as PronunciationData).text }];
    case 'DIALOGUE':
    case 'SITUATION':
      return (d as DialogueData).steps.flatMap((s, i) => (s.options?.length ? [{ step: i, optionId: s.answer }] : []));
    default:
      return [{ optionId: (d as ChoiceData).answer }];
  }
}

export function wrongAnswer(item: ExerciseItem): unknown {
  switch (item.type) {
    case 'SENTENCE_TRANSLATION':
    case 'DICTATION':
    case 'GRAMMAR':
      return { text: 'zzz' };
    case 'BUILD_SENTENCE':
    case 'WORD_ORDER':
      return { tokens: ['zzz'] };
    case 'MATCH_PAIRS':
      return { pairs: [] };
    case 'PRONUNCIATION':
      return { transcript: 'zzz' };
    case 'DIALOGUE':
    case 'SITUATION': {
      const s = (item.data as DialogueData).steps.findIndex((x) => x.options?.length);
      const step = (item.data as DialogueData).steps[s];
      return { step: s, optionId: step.options!.find((o) => o.id !== step.answer)!.id };
    }
    default: {
      const c = item.data as ChoiceData;
      return { optionId: c.options.find((o) => o.id !== c.answer)!.id };
    }
  }
}

export async function sessionItems(sessionId: string) {
  const s = await db.query.learningSessions.findFirst({ where: eq(learningSessions.id, sessionId) });
  return s!.items as ExerciseItem[];
}

/** Пройти сесію повністю (правильно або з помилками), обходячи анти-бот затримку. */
export async function playSession(call: Awaited<ReturnType<typeof login>>['call'], sessionId: string, opts: { wrong?: number } = {}) {
  const items = await sessionItems(sessionId);
  let wrongLeft = opts.wrong ?? 0;
  for (const item of items) {
    if (wrongLeft > 0) {
      wrongLeft--;
      const w = await call('POST', `/api/sessions/${sessionId}/answer`, { key: item.key, answer: wrongAnswer(item) });
      if (w.status !== 200) throw new Error(JSON.stringify(w.body));
      if (item.type === 'DIALOGUE' || item.type === 'SITUATION') {
        for (const a of correctAnswers(item)) await call('POST', `/api/sessions/${sessionId}/answer`, { key: item.key, answer: a });
      }
      continue;
    }
    for (const a of correctAnswers(item)) {
      const r = await call('POST', `/api/sessions/${sessionId}/answer`, { key: item.key, answer: a });
      if (r.status !== 200 || !r.body.correct) throw new Error(`${item.type}: ${JSON.stringify(r.body)}`);
    }
  }
  await db.update(learningSessions).set({ startedAt: new Date(Date.now() - 10 * 60_000) }).where(eq(learningSessions.id, sessionId));
  return call('POST', `/api/sessions/${sessionId}/finish`);
}

export async function lessonId(slug: string) {
  await getEnv();
  return (await db.query.lessons.findFirst({ where: eq(lessons.slug, slug) }))!.id;
}
