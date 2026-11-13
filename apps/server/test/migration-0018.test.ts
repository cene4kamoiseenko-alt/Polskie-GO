/**
 * Миграция 0018 (вопрос дня): только новые таблицы и индексы — прежние таблицы не меняются (старые тесты миграций гоняют /quiz
 * на прежней схеме, а production применяет миграцию к живой базе). Ключ отправки (день, telegram_id) — одно сообщение в день.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { disposeEnv, getEnv } from './helpers';

const dir = new URL('../migrations/', import.meta.url);
const file = readdirSync(dir).find((f) => f.startsWith('0018_'));

beforeAll(async () => {
  await getEnv();
});
afterAll(disposeEnv);

describe('миграция 0018: вопрос дня', () => {
  it('только CREATE TABLE и CREATE INDEX — без ALTER, DROP, UPDATE, DELETE', () => {
    expect(file).toBeTruthy();
    const stmts = readFileSync(new URL(file!, dir), 'utf8').split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean);
    for (const s of stmts) expect(s, s.slice(0, 80)).toMatch(/^CREATE (TABLE|INDEX|UNIQUE INDEX) /);
    expect(stmts.join('\n')).not.toMatch(/\b(ALTER|DROP|UPDATE|DELETE)\b/);
  });

  it('таблицы плана, отправок, выключенных вопросов и счётчиков людей есть; второй захват того же дня не проходит', async () => {
    const { env } = await getEnv();
    const tables = (await env.DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'daily_quiz_%' ORDER BY name").all<{ name: string }>()).results.map((r) => r.name);
    expect(tables).toEqual(['daily_quiz_people', 'daily_quiz_plan', 'daily_quiz_questions', 'daily_quiz_sends']);
    const claim = () =>
      env.DB.prepare("INSERT INTO daily_quiz_sends (day, telegram_id, level, lang, question_id, status, created_at) VALUES ('2026-12-01', 777, 'A1', 'ru', 'shop-bag', 'PENDING', 1) ON CONFLICT DO NOTHING").run();
    expect((await claim()).meta.changes).toBe(1);
    expect((await claim()).meta.changes).toBe(0);
    await env.DB.prepare("INSERT INTO daily_quiz_people (telegram_id, updated_at) VALUES (777, 1)").run();
    expect(await env.DB.prepare('SELECT ignored, streak FROM daily_quiz_people WHERE telegram_id = 777').first()).toEqual({ ignored: 0, streak: 0 });
  });
});
