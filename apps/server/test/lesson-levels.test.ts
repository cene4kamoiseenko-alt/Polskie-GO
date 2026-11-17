/**
 * Трудные версии уроков (2026-11-16, docs/LEVELS_RU.md): правила, которые проверяются кодом. Детектор «угадываемости» (два варианта,
 * самый длинный, далёкие варианты, одинаковое начало) проходит по версиям в test/city-quality.test.ts — тот же код, что для обычных уроков.
 */
import { describe, expect, it } from 'vitest';
import { CEFR_LEVELS, checkAnswer, type ExerciseItem, type ExerciseType, type I18n } from '@polski-go/shared';
import { correctAnswers } from './helpers';
import { CITY_CONTENT } from '../src/content/seed';
import { LESSON_LEVELS, withLevels } from '../src/content/levels';
import type { LessonLevel } from '../src/content/types';

/** Города, где у каждого урока и босса должны быть все три версии. */
const COVERED = ['warszawa', 'lodz', 'krakow', 'katowice', 'opole'];
const LEVELS = ['A2', 'B1', 'B2'] as const;
const MIN_TASKS = 8;

const versions = Object.entries(LESSON_LEVELS).flatMap(([slug, lv]) => Object.entries(lv).map(([level, v]) => ({ slug, level, v: v as LessonLevel })));
/** Все строки I18n задания (перевод, объяснение, вопрос, варианты, реплики), кроме польского текста. */
function i18nOf(x: unknown, out: I18n[] = []): I18n[] {
  if (Array.isArray(x)) x.forEach((y) => i18nOf(y, out));
  else if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>;
    if (typeof o.uk === 'string' && typeof o.ru === 'string' && typeof o.en === 'string') out.push(o as unknown as I18n);
    else Object.values(o).forEach((y) => i18nOf(y, out));
  }
  return out;
}

describe('трудные версии уроков', () => {
  // Версия выбирается только выше уровня урока (variantLevel): уроку A1 нужны A2, B1, B2, уроку A2 — B1 и B2.
  const above = (cefr: string) => LEVELS.filter((lv) => CEFR_LEVELS.indexOf(lv) > CEFR_LEVELS.indexOf(cefr as never));
  it.each(COVERED)('%s: у каждого урока и босса есть все версии выше его уровня', (city) => {
    const content = CITY_CONTENT.find((c) => c.city === city)!;
    for (const l of content.routes.flatMap((r) => r.lessons)) expect(Object.keys(l.levels ?? {}).sort(), `${l.slug} (${l.cefr})`).toEqual(above(l.cefr).sort());
  });

  it('нет версий на уровне урока или ниже: такую игрок никогда не получит', () => {
    for (const l of CITY_CONTENT.flatMap((c) => c.routes.flatMap((r) => r.lessons))) {
      for (const lv of Object.keys(l.levels ?? {})) expect(above(l.cefr), `${l.slug} (${l.cefr}) @${lv}`).toContain(lv);
    }
  });

  it('версия: не меньше 8 заданий, не меньше 4 разных механик, без аудирования и диктанта (им нужна озвучка)', () => {
    for (const { slug, level, v } of versions) {
      const where = `${slug}@${level}`;
      expect(v.exercises.length, where).toBeGreaterThanOrEqual(MIN_TASKS);
      expect(new Set(v.exercises.map((e) => e.type)).size, where).toBeGreaterThanOrEqual(4);
      expect(v.exercises.filter((e) => e.type === 'LISTENING' || e.type === 'DICTATION'), where).toEqual([]);
    }
  });

  it('теория версии своя (не теория урока), на трёх языках; не меньше двух примеров', () => {
    const base = new Map(CITY_CONTENT.flatMap((c) => c.routes.flatMap((r) => r.lessons)).map((l) => [l.slug, l]));
    for (const { slug, level, v } of versions) {
      const where = `${slug}@${level}`;
      for (const lang of ['uk', 'ru', 'en'] as const) expect((v.explanation[lang] ?? '').length, `${where} ${lang}`).toBeGreaterThan(80);
      expect(v.explanation.ru, where).not.toBe(v.explanation.uk);
      expect(v.explanation.en, where).not.toBe(v.explanation.uk);
      expect(v.explanation.ru, where).not.toBe(base.get(slug)!.explanation.ru);
      expect(v.examples.length, where).toBeGreaterThanOrEqual(2);
    }
  });

  it('переводы и объяснения заданий — на трёх языках (английский не копия украинского)', () => {
    for (const { slug, level, v } of versions) {
      v.exercises.forEach((e, i) => {
        // Строка целиком из польских слов (без кириллицы) одинакова на всех языках законно.
        for (const s of i18nOf(e)) if (s.uk.length > 14 && /[а-яіїєґ]/i.test(s.uk)) expect(s.en, `${slug}@${level}#${i}: ${s.uk}`).not.toBe(s.uk);
      });
    }
  });

  it('у задания с выбором не меньше трёх вариантов; варианты не повторяются и написаны по-польски; у «Вставь слово» и «Выбери фразу» есть объяснение', () => {
    for (const { slug, level, v } of versions) {
      v.exercises.forEach((e, i) => {
        const where = `${slug}@${level}#${i} ${e.type}`;
        const d = e.data as { options?: { text: unknown }[] };
        if (d.options && e.type !== 'FIND_ERROR' && e.type !== 'ODD_ONE_OUT') {
          expect(d.options.length, where).toBeGreaterThanOrEqual(3);
          // С учётом регистра: в заданиях на прописные буквы «łodzianin / Łodzianin» — разные варианты.
          const texts = d.options.map((o) => JSON.stringify(o.text));
          expect(new Set(texts).size, where).toBe(texts.length);
        }
        if (e.type === 'FILL_GAP' || e.type === 'WORD_TRANSLATION' || e.type === 'FIND_ERROR' || e.type === 'READING') expect(e.explanation, where).toBeTruthy();
        // Строки без перевода (варианты, реплики собеседника) видят все языки интерфейса, и они уходят в озвучку: только польский текст.
        // Транскрипция «[madry] — «мадри»» была вариантом ответа: её не озвучить, а украинский вариант видел бы и русскоязычный игрок.
        const steps = (e.data as { steps?: { npc?: unknown; options?: { text: unknown }[] }[] }).steps ?? [];
        const plain = [...(d.options ?? []), ...steps.flatMap((st) => st.options ?? [])].map((o) => o.text).concat(steps.map((st) => st.npc));
        for (const x of plain) if (typeof x === 'string') expect(x, `${where}: строка без перевода — не по-польски`).not.toMatch(/[а-яёіїєґ]/i);
      });
    }
  });

  it('задания версий одного урока не повторяют друг друга и обычную версию', () => {
    const key = (d: Record<string, unknown>) => JSON.stringify(d.pl ?? d.passage ?? d.translation ?? d.steps ?? d.question ?? d);
    for (const l of CITY_CONTENT.flatMap((c) => c.routes.flatMap((r) => r.lessons))) {
      if (!l.levels) continue;
      // Только задания версий: между собой и против обычной версии (повторы внутри старых уроков — не предмет этой проверки).
      const base = new Set(l.exercises.map((e) => key(e.data)));
      const own = Object.values(l.levels).flatMap((v) => v.exercises).map((e) => key(e.data));
      const dup = own.filter((k, i) => own.indexOf(k) !== i || base.has(k));
      expect(dup, l.slug).toEqual([]);
    }
  });

  it('каждое задание принимает свой верный ответ; в «Собери предложение» лишние плитки не совпадают со словами ответа, а другие верные варианты — из тех же слов', () => {
    const norm = (w: string) => w.toLowerCase().replace(/[.,!?;:„”"]/g, '');
    for (const { slug, level, v } of versions) {
      v.exercises.forEach((e, i) => {
        const where = `${slug}@${level}#${i} ${e.type}`;
        const item = { key: where, type: e.type as ExerciseType, skill: e.skill, data: e.data } as ExerciseItem;
        for (const a of correctAnswers(item)) expect(checkAnswer(item, a as never).correct, where).toBe(true);
        if (e.type === 'BUILD_SENTENCE' || e.type === 'WORD_ORDER') {
          const d = e.data as { tokens: string[]; answer: string[]; alternatives: string[][] };
          const words = d.answer.map(norm);
          for (const x of d.tokens.slice(d.answer.length)) expect(words, `${where}: лишняя плитка «${x}»`).not.toContain(norm(x));
          for (const alt of d.alternatives) expect([...alt].map(norm).sort(), `${where}: ${alt.join(' ')}`).toEqual([...words].sort());
        }
      });
    }
  });

  it('реестр без урока — ошибка (опечатка в slug не пропадёт молча)', () => {
    expect(() => withLevels(CITY_CONTENT, { 'nie-ma-takiej-lekcji': {} })).toThrow(/nie-ma-takiej-lekcji/);
  });
});
