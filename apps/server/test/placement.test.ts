/**
 * Свой уровень на общей дороге (владелец 2026-11-16: «человек начинает там же, где и все, но вопросы его уровня»;
 * «входной тест не должен быть слишком лёгким, чтобы методом исключения нельзя было понять ответ»).
 *  • Входной тест v2: блоки A0…B2 по 3 вопроса, «Не знаю», остановка после несданного блока, итог — уровень заданий; города не открываются.
 *  • Версии урока: игрок с уровнем B1 получает версию B1, без уровня — обычную; счётчик заданий урока — только обычная версия.
 *  • Автоподстройка: три лёгких урока своего уровня — выше; два трудных — ниже.
 *  • Вопросы теста не решаются через родной язык: в «Вставь слово» — формы одного слова, в переводе слова верный ответ не «созвучный».
 * docs/superpowers/specs/2026-11-16-levels-design.md
 */
import { afterAll, describe, expect, it } from 'vitest';
import { and, eq, gte, lt } from 'drizzle-orm';
import type { ExerciseItem } from '@polski-go/shared';
import { db } from '../src/db';
import { exercises, learningSessions, lessons, playerProgress } from '../src/db/schema';
import { resetRateLimits } from '../src/hono';
import { PLACEMENT_V2 } from '../src/content/exams';
import { WARSZAWA_LEVELS } from '../src/content/levels/warszawa';
import { similarity } from '../src/content/quality';
import { cognateScore } from './guess';

/** Польское слово «на глаз» кириллицей (для сравнения начала слова: uroda → урода ≈ урод). */
const PL_CYR: [RegExp, string][] = [[/szcz/g, 'щ'], [/sz/g, 'ш'], [/cz/g, 'ч'], [/rz/g, 'ж'], [/ch/g, 'х'], [/ó/g, 'у'], [/ł/g, 'л'], [/[ęe]/g, 'е'], [/[ąa]/g, 'а'], [/ż|ź/g, 'ж'], [/[ćc]/g, 'ц'], [/[śs]/g, 'с'], [/ń/g, 'н'], [/w/g, 'в'], [/y/g, 'ы'], [/j/g, 'й'], [/b/g, 'б'], [/d/g, 'д'], [/f/g, 'ф'], [/g/g, 'г'], [/h/g, 'х'], [/i/g, 'и'], [/k/g, 'к'], [/l/g, 'л'], [/m/g, 'м'], [/n/g, 'н'], [/o/g, 'о'], [/p/g, 'п'], [/r/g, 'р'], [/t/g, 'т'], [/u/g, 'у'], [/z/g, 'з']];
const toCyr = (w: string) => PL_CYR.reduce((s, [re, c]) => s.replace(re, c), w.toLowerCase());
/** Насколько вариант «звучит как» польское слово: родственное слово по скелету согласных или общее начало (uroda → урод…). */
function soundsLike(pl: string, option: string): number {
  const plw = pl.toLowerCase().match(/[\p{L}]+/gu) ?? [];
  const cyw = option.toLowerCase().match(/[\p{L}]+/gu) ?? [];
  let prefix = 0;
  for (const p of plw.filter((w) => w.length >= 3)) {
    const c = toCyr(p);
    for (const o of cyw.filter((w) => w.length >= 3)) {
      let k = 0;
      while (k < Math.min(c.length, o.length) && c[k] === o[k]) k++;
      prefix = Math.max(prefix, k >= 3 ? k / c.length : 0);
    }
  }
  return Math.max(prefix, cognateScore(pl, option));
}
import { disposeEnv, lessonId, login, playSession, sessionItems } from './helpers';

afterAll(disposeEnv);

type Call = Awaited<ReturnType<typeof login>>['call'];
const progress = async (userId: string) => (await db.query.playerProgress.findFirst({ where: eq(playerProgress.userId, userId) }))!;
const DONT_KNOW = { optionId: '__dont_know' };
const RIGHT = { optionId: 'o0' };

/** Пройти входной тест: plan — ответы по блокам (true — верно, false — «Не знаю»). Возвращает ответы сервера и итог. */
async function takeTest(plan: boolean[][]) {
  resetRateLimits();
  const u = await login();
  const exams = (await u.call('GET', '/api/exams')).body.exams as { id: string; kind: string }[];
  const tests = exams.filter((e) => e.kind === 'PLACEMENT');
  expect(tests).toHaveLength(1);
  const s = await u.call('POST', '/api/sessions', { lessonId: tests[0].id });
  expect(s.status).toBe(200);
  const items = await sessionItems(s.body.sessionId);
  const flat = plan.flat();
  const replies: { stop?: boolean; correct: boolean }[] = [];
  for (const [i, ok] of flat.entries()) {
    const r = await u.call('POST', `/api/sessions/${s.body.sessionId}/answer`, { key: items[i].key, answer: ok ? RIGHT : DONT_KNOW });
    expect(r.status).toBe(200);
    replies.push(r.body);
  }
  await db.update(learningSessions).set({ startedAt: new Date(Date.now() - 10 * 60_000) }).where(eq(learningSessions.id, s.body.sessionId));
  const fin = await u.call('POST', `/api/sessions/${s.body.sessionId}/finish`);
  return { u, items, replies, fin };
}

describe('входной тест v2', () => {
  it('один тест в списке, 15 вопросов строго по блокам A0…B2; старый — в архиве', async () => {
    const u = await login();
    const tests = ((await u.call('GET', '/api/exams')).body.exams as { id: string; kind: string }[]).filter((e) => e.kind === 'PLACEMENT');
    expect(tests).toHaveLength(1);
    const items: ExerciseItem[] = await sessionItems((await u.call('POST', '/api/sessions', { lessonId: tests[0].id })).body.sessionId);
    expect(items.map((i) => i.level)).toEqual(['A0', 'A0', 'A0', 'A1', 'A1', 'A1', 'A2', 'A2', 'A2', 'B1', 'B1', 'B1', 'B2', 'B2', 'B2']);
    const old = await db.query.lessons.findFirst({ where: eq(lessons.slug, 'placement-test') });
    expect(old?.status).toBe('ARCHIVED');
  });

  it('знающий B1: блок B2 не сдан — тест останавливается, уровень заданий B1, города не открываются', async () => {
    const { u, replies, fin } = await takeTest([[true, true, true], [true, true, false], [true, false, true], [true, true, false], [false, false, true]]);
    expect(replies.slice(0, 14).every((r) => !r.stop)).toBe(true);
    expect(replies[14].stop).toBe(true);
    expect(fin.status).toBe(200);
    expect(fin.body.placement).toMatchObject({ level: 'B1', studyLevel: 'B1', unlocked: [] });
    const me = (await u.call('GET', '/api/me')).body;
    expect(me.progress.studyLevel).toBe('B1');
    expect(me.levelTest).toMatchObject({ done: true, placementLevel: 'B1' });
    const j = (await u.call('GET', '/api/journey')).body as { cities: { slug: string; unlocked: boolean }[] };
    expect(j.cities.filter((c) => c.unlocked).map((c) => c.slug)).toEqual(['warszawa']);
  });

  it('новичок: «Не знаю» в первом блоке — тест закончен после трёх вопросов, обычные версии уроков', async () => {
    const { u, replies, fin } = await takeTest([[false, true, false]]);
    expect(replies[2].stop).toBe(true);
    expect(fin.status).toBe(200);
    expect(fin.body.placement).toMatchObject({ level: 'A0', studyLevel: null });
    expect((await u.call('GET', '/api/me')).body.progress.studyLevel).toBeNull();
  });

  it('три быстрых «Не знаю» подряд — итог сразу, без «слишком быстро» (тест наград не даёт)', async () => {
    resetRateLimits();
    const u = await login();
    const test = ((await u.call('GET', '/api/exams')).body.exams as { id: string; kind: string }[]).find((e) => e.kind === 'PLACEMENT')!;
    const s = await u.call('POST', '/api/sessions', { lessonId: test.id });
    const items = await sessionItems(s.body.sessionId);
    for (const it of items.slice(0, 3)) await u.call('POST', `/api/sessions/${s.body.sessionId}/answer`, { key: it.key, answer: DONT_KNOW });
    const fin = await u.call('POST', `/api/sessions/${s.body.sessionId}/finish`);
    expect(fin.status).toBe(200);
    expect(fin.body).toMatchObject({ xp: 0, zlotki: 0, placement: { level: 'A0' } });
  });

  it('A2: блок B1 не сдан на втором неверном ответе ещё не известен — останавливается после третьего вопроса блока', async () => {
    const { replies, fin } = await takeTest([[true, true, true], [true, true, true], [true, false, true], [false, false, false]]);
    expect(replies[10].stop).toBeFalsy();
    expect(replies[11].stop).toBe(true);
    expect(fin.body.placement).toMatchObject({ level: 'A2', studyLevel: 'A2' });
  });
});

describe('версии урока под уровень заданий', () => {
  const W1 = WARSZAWA_LEVELS['waw-1-czesc'];

  it('B1 получает версию B1 с её теорией и без слов A0; без уровня — обычную; счётчик заданий урока — только обычная версия', async () => {
    const id = await lessonId('waw-1-czesc');
    const lesson = (await db.query.lessons.findFirst({ where: eq(lessons.id, id) }))!;
    const base = await db.select({ id: exercises.id }).from(exercises).where(and(eq(exercises.lessonId, id), lt(exercises.order, 100)));
    expect(lesson.exerciseCount).toBe(base.length);
    expect(Object.keys(lesson.levelTexts ?? {}).sort()).toEqual(['A2', 'B1', 'B2']);

    const plain = await login();
    const a = await plain.call('POST', '/api/sessions', { lessonId: id });
    expect(a.status).toBe(200);
    expect(a.body.lesson).toMatchObject({ cefr: lesson.cefr, variant: null, explanation: lesson.explanation });
    expect(a.body.words.length).toBeGreaterThan(0);
    expect((await sessionItems(a.body.sessionId)).every((i) => !i.level)).toBe(true);

    const strong = await login();
    expect((await strong.call('PATCH', '/api/me/study-level', { level: 'B1' })).body.progress.studyLevel).toBe('B1');
    const b = await strong.call('POST', '/api/sessions', { lessonId: id });
    expect(b.body.lesson).toMatchObject({ cefr: 'B1', variant: 'B1', explanation: W1.B1!.explanation, examples: W1.B1!.examples });
    expect(b.body.words).toEqual([]);
    const items = await sessionItems(b.body.sessionId);
    expect(items).toHaveLength(W1.B1!.exercises.length);
    expect(items.every((i) => i.level === 'B1')).toBe(true);

    for (const level of ['A2', 'B2'] as const) {
      await strong.call('PATCH', '/api/me/study-level', { level });
      expect((await strong.call('POST', '/api/sessions', { lessonId: id })).body.lesson.variant).toBe(level);
    }
  });

  it('версии B2 нет — игрок B2 получает ближайшую ниже (B1)', async () => {
    const id = await lessonId('waw-1-czesc');
    const b2 = await db.select().from(exercises).where(and(eq(exercises.lessonId, id), gte(exercises.order, 300)));
    expect(b2.length).toBe(W1.B2!.exercises.length);
    await db.delete(exercises).where(and(eq(exercises.lessonId, id), gte(exercises.order, 300)));
    try {
      const u = await login();
      await u.call('PATCH', '/api/me/study-level', { level: 'B2' });
      expect((await u.call('POST', '/api/sessions', { lessonId: id })).body.lesson.variant).toBe('B1');
    } finally {
      await db.insert(exercises).values(b2);
    }
  });

  it('автоподстройка: три урока своего уровня без ошибок — уровень выше; два трудных — ниже', async () => {
    const id = await lessonId('waw-1-czesc');
    const u = await login();
    await u.call('PATCH', '/api/me/study-level', { level: 'B1' });
    const play = async (wrong: number) => {
      resetRateLimits();
      const s = await u.call('POST', '/api/sessions', { lessonId: id });
      return (await playSession(u.call, s.body.sessionId, { wrong })).body;
    };
    expect((await play(0)).studyLevelChange).toBeNull();
    await play(0);
    const third = await play(0);
    expect(third.studyLevelChange).toEqual({ from: 'B1', to: 'B2', dir: 'up' });
    expect((await progress(u.user.id)).studyLevel).toBe('B2');
    await play(99);
    const down = await play(99);
    expect(down.studyLevelChange).toEqual({ from: 'B2', to: 'B1', dir: 'down' });
    expect((await progress(u.user.id)).studyLevel).toBe('B1');
  });

  it('ручной выбор уровня: только A2/B1/B2 или обычные версии', async () => {
    const u = await login();
    expect((await u.call('PATCH', '/api/me/study-level', { level: 'C1' })).status).toBe(400);
    expect((await u.call('PATCH', '/api/me/study-level', { level: null })).body.progress.studyLevel).toBeNull();
  });
});

describe('вопросы теста не решаются через родной язык', () => {
  const textOf = (o: { text: unknown }) => (typeof o.text === 'string' ? o.text : (o.text as { ru: string }).ru);

  it('«Вставь слово»: у верного ответа минимум две похожие формы среди неверных (выбор по смыслу невозможен)', () => {
    for (const ex of PLACEMENT_V2.exercises.filter((e) => e.type === 'FILL_GAP')) {
      const opts = (ex.data.options as { text: string }[]).map((o) => o.text);
      const close = opts.slice(1).filter((o) => similarity(o, opts[0]) >= 0.45);
      expect(close.length, `${ex.data.pl}: ${opts.join(' / ')}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('перевод слова: верный перевод не самый «созвучный» польскому (ложные друзья, а не родственные слова)', () => {
    for (const ex of PLACEMENT_V2.exercises.filter((e) => e.type === 'WORD_TRANSLATION')) {
      const pl = String(ex.data.pl);
      const sims = (ex.data.options as { text: unknown }[]).map((o) => soundsLike(pl, textOf(o as { text: unknown })));
      // Ловушка есть (неверный вариант «звучит как» польское слово), а верный звучит заметно меньше.
      expect(Math.max(...sims.slice(1)), `${pl}: ${sims.map((x) => x.toFixed(2)).join(' / ')}`).toBeGreaterThan(sims[0] + 0.15);
    }
  });

  it('у каждого вопроса 3–4 варианта, у каждого блока 3 вопроса, верный ответ не самый длинный в большинстве вопросов', () => {
    const counts = new Map<string, number>();
    let longest = 0;
    for (const ex of PLACEMENT_V2.exercises) {
      counts.set(ex.level!, (counts.get(ex.level!) ?? 0) + 1);
      const opts = (ex.data.options as { text: unknown }[]).map((o) => textOf(o as { text: unknown }));
      expect(opts.length).toBeGreaterThanOrEqual(3);
      expect(opts.length).toBeLessThanOrEqual(4);
      if (opts.slice(1).every((o) => opts[0].length > o.length)) longest++;
    }
    expect([...counts.values()]).toEqual([3, 3, 3, 3, 3]);
    expect(longest).toBeLessThanOrEqual(5);
  });
});

