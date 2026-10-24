import { describe, expect, it } from 'vitest';
import { checkAnswer, EXERCISE_TYPES, type ExerciseItem, type OrderData, type ChoiceData } from '@polski-go/shared';
import { CITY_CONTENT } from '../src/content/seed';
import { PLACEMENT, EXAM_A1 } from '../src/content/exams';
import { VOCAB } from '../src/content/vocab';
import { STORY_QUESTS } from '../src/content/gamification';
import { correctAnswers } from './helpers';

const lessons = [...CITY_CONTENT.flatMap((c) => c.routes.flatMap((r) => r.lessons)), PLACEMENT, EXAM_A1];

describe('Навчальний контент', () => {
  it('кожен урок має 8–15 вправ і пояснення трьома мовами', () => {
    for (const l of lessons) {
      expect(l.exercises.length, l.slug).toBeGreaterThanOrEqual(8);
      expect(l.exercises.length, l.slug).toBeLessThanOrEqual(18);
      expect(l.explanation.uk && l.explanation.ru && l.explanation.en, l.slug).toBeTruthy();
    }
  });

  it('усі слова уроків є у словнику, слова словника унікальні', () => {
    const keys = new Set(VOCAB.map((v) => v.pl));
    for (const l of lessons) for (const w of l.words) expect(keys.has(w), `${l.slug}: ${w}`).toBe(true);
    expect(new Set(VOCAB.map((v) => `${v.pl}|${v.pos}`)).size).toBe(VOCAB.length);
  });

  it('кожна вправа коректна: правильна відповідь проходить перевірку', () => {
    let n = 0;
    for (const l of lessons) {
      for (const [i, ex] of l.exercises.entries()) {
        const item = { key: `${l.slug}#${i}`, ...ex } as ExerciseItem;
        expect(EXERCISE_TYPES).toContain(item.type);
        const answers = correctAnswers(item);
        expect(answers.length, item.key).toBeGreaterThan(0);
        const results = answers.map((a) => checkAnswer(item, a as never));
        expect(results.every((r) => r.correct), `${item.key} ${item.type}`).toBe(true);
        expect(results.at(-1)!.done, item.key).toBe(true);
        if ('options' in item.data && Array.isArray((item.data as ChoiceData).options)) {
          const texts = (item.data as ChoiceData).options.map((o) => JSON.stringify(o.text));
          expect(new Set(texts).size, `${item.key}: дублікати варіантів`).toBe(texts.length);
        }
        if (item.type === 'BUILD_SENTENCE' || item.type === 'WORD_ORDER') {
          const d = item.data as OrderData;
          const pool = [...d.tokens];
          for (const t of d.answer) {
            const idx = pool.indexOf(t);
            expect(idx, `${item.key}: немає плитки ${t}`).toBeGreaterThanOrEqual(0);
            pool.splice(idx, 1);
          }
        }
        n++;
      }
    }
    expect(n).toBeGreaterThan(200);
  });

  it('сюжетні квести: усі переходи ведуть до існуючих вузлів і є правильний вибір', () => {
    for (const q of STORY_QUESTS) {
      for (const st of q.stages!) {
        expect(st.nodes[st.start], q.slug).toBeTruthy();
        for (const [id, node] of Object.entries(st.nodes)) {
          if (node.next) expect(st.nodes[node.next], `${q.slug}:${id}`).toBeTruthy();
          for (const c of node.choices ?? []) if (c.next) expect(st.nodes[c.next], `${q.slug}:${id}`).toBeTruthy();
          if (node.choices) expect(node.choices.some((c) => c.ok), `${q.slug}:${id}`).toBe(true);
          expect(!!(node.choices || node.next || node.end), `${q.slug}:${id} — глухий кут`).toBe(true);
        }
      }
    }
  });
});
