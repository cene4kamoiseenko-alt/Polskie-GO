/**
 * Короткий первый урок (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 3): из 101 прошедшего знакомство первый урок
 * (12 заданий, с диктантом, чтением и переводом предложения) закончили 56. Новичку первое занятие урока — до 8 простых заданий; брошенный урок
 * продолжается с места (до 7 дней) и виден на главной как «осталось N»; первое прохождение — «первая победа».
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import type { ExerciseItem } from '@polski-go/shared';
import { db } from '../src/db';
import { dailyActivity, exercises, learningSessions, playerProgress } from '../src/db/schema';
import { FIRST_LESSON_SIZE, FIRST_LESSON_TYPES, firstLessonItems } from '../src/services/first-lesson';
import { correctAnswers, disposeEnv, getEnv, lessonId, login, playSession, sessionItems } from './helpers';

beforeAll(async () => {
  await getEnv();
});
afterAll(disposeEnv);

const item = (type: string, i: number) => ({ key: `k${i}`, type }) as unknown as ExerciseItem;
/** Сколько заданий в уроке сейчас (базовая версия) и сколько из них простых — от контента, а не числом в тесте. */
async function sizes(id: string) {
  const rows = (await db.select({ type: exercises.type, order: exercises.order }).from(exercises).where(eq(exercises.lessonId, id))).filter((r) => r.order < 100);
  const easy = rows.filter((r) => (FIRST_LESSON_TYPES as readonly string[]).includes(r.type)).length;
  return { full: rows.length, short: Math.min(FIRST_LESSON_SIZE, easy) };
}

describe('короткий первый урок', () => {
  it('чистая функция: 8 простых заданий в исходном порядке; если простых мало — урок как есть', () => {
    // Состав waw-1-czesc: 4 перевода слова, 2 аудирования, пары, 3 вставки, 7 других.
    const types = ['WORD_TRANSLATION', 'LISTENING', 'DICTATION', 'WORD_TRANSLATION', 'MATCH_PAIRS', 'FILL_GAP', 'PRONUNCIATION', 'DIALOGUE', 'WORD_TRANSLATION', 'FILL_GAP', 'READING', 'BUILD_SENTENCE', 'LISTENING', 'SENTENCE_TRANSLATION', 'WORD_TRANSLATION', 'SITUATION', 'FILL_GAP'];
    const items = types.map(item);
    const short = firstLessonItems(items);
    expect(FIRST_LESSON_SIZE).toBe(8);
    expect(short).toHaveLength(8);
    for (const s of short) expect(FIRST_LESSON_TYPES as readonly string[]).toContain(s.type);
    const idx = short.map((s) => items.indexOf(s));
    expect(idx).toEqual([...idx].sort((a, b) => a - b));
    const few = ['WORD_TRANSLATION', 'DICTATION', 'READING', 'LISTENING', 'DIALOGUE', 'FILL_GAP'].map(item);
    expect(firstLessonItems(few)).toBe(few);
  });

  it('новичок получает короткий урок (до 8 простых заданий); брошенный урок продолжается теми же; на главной — «осталось»', async () => {
    const u = await login();
    const id = await lessonId('waw-1-czesc');
    const { full, short } = await sizes(id);
    expect(short).toBeGreaterThanOrEqual(5);
    expect(short).toBeLessThan(full);
    const s1 = await u.call('POST', '/api/sessions', { lessonId: id });
    expect(s1.status, JSON.stringify(s1.body)).toBe(200);
    expect(s1.body.items).toHaveLength(short);
    const items = await sessionItems(s1.body.sessionId);
    for (const it of items.slice(0, 3)) for (const a of correctAnswers(it)) await u.call('POST', `/api/sessions/${s1.body.sessionId}/answer`, { key: it.key, answer: a });
    // Вернулся на следующий день (раньше через 3 часа урок начинался заново).
    await db.update(learningSessions).set({ startedAt: new Date(Date.now() - 26 * 3600_000) }).where(eq(learningSessions.id, s1.body.sessionId));
    const me = await u.call('GET', '/api/me');
    expect(me.body.activeLesson).toEqual({ lessonId: id, done: 3, total: short });
    const s2 = await u.call('POST', '/api/sessions', { lessonId: id });
    expect(s2.body.sessionId).toBe(s1.body.sessionId);
    expect(s2.body.items).toHaveLength(short);
    expect(s2.body.resume.done).toHaveLength(3);
  });

  it('урок, продолженный на следующий день: время — по ответам, а не «час» (находка проверки)', async () => {
    const u = await login();
    const id = await lessonId('waw-1-czesc');
    const s1 = await u.call('POST', '/api/sessions', { lessonId: id });
    const items = await sessionItems(s1.body.sessionId);
    for (const it of items) for (const a of correctAnswers(it)) await u.call('POST', `/api/sessions/${s1.body.sessionId}/answer`, { key: it.key, answer: a });
    await db.update(learningSessions).set({ startedAt: new Date(Date.now() - 26 * 3600_000) }).where(eq(learningSessions.id, s1.body.sessionId));
    const fin = await u.call('POST', `/api/sessions/${s1.body.sessionId}/finish`);
    expect(fin.status, JSON.stringify(fin.body)).toBe(200);
    expect(fin.body.durationSec).toBeLessThanOrEqual(items.length * 90);
    const act = await db.select().from(dailyActivity).where(eq(dailyActivity.userId, u.user.id)).get();
    expect(act!.seconds).toBeLessThanOrEqual(items.length * 90);
  });

  it('первое прохождение — «первая победа»; повтор и следующий урок — полные', async () => {
    const u = await login();
    const id = await lessonId('waw-1-czesc');
    const s1 = await u.call('POST', '/api/sessions', { lessonId: id });
    expect(s1.body.items).toHaveLength((await sizes(id)).short);
    const fin = await playSession(u.call, s1.body.sessionId);
    expect(fin.status, JSON.stringify(fin.body)).toBe(200);
    expect(fin.body.passed).toBe(true);
    expect(fin.body.firstWin).toBe(true);
    expect(fin.body.durationSec).toBeLessThanOrEqual(3600);
    expect((await db.select().from(playerProgress).where(eq(playerProgress.userId, u.user.id)).get())!.lessonsCompleted).toBe(1);
    expect((await u.call('GET', '/api/me')).body.activeLesson).toBeNull();

    const again = await u.call('POST', '/api/sessions', { lessonId: id });
    expect(again.body.items).toHaveLength((await sizes(id)).full);
    expect((await playSession(u.call, again.body.sessionId)).body.firstWin).toBe(false);
    const id2 = await lessonId('waw-2-uprzejmosc');
    const next = await u.call('POST', '/api/sessions', { lessonId: id2 });
    expect(next.status, JSON.stringify(next.body)).toBe(200);
    expect(next.body.items).toHaveLength((await sizes(id2)).full);
  });
});
