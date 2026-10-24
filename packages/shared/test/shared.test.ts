import { describe, expect, it } from 'vitest';
import {
  checkAnswer,
  toPublicItem,
  matchText,
  nextReview,
  SRS_INITIAL,
  levelFromXp,
  xpForLevel,
  updateStreak,
  effectiveStreak,
  weekKey,
  dayKey,
  lessonReward,
  DEFAULT_REWARDS,
  similarity,
  type ExerciseItem,
} from '../src';

const choice: ExerciseItem = {
  key: 'e1',
  type: 'WORD_TRANSLATION',
  skill: 'vocab.greetings',
  data: { pl: 'Cześć', options: [{ id: 'a', text: { uk: 'Привіт' } }, { id: 'b', text: { uk: 'Дякую' } }], answer: 'a' },
};

describe('перевірка відповідей', () => {
  it('вибір варіанту', () => {
    expect(checkAnswer(choice, { optionId: 'a' }).correct).toBe(true);
    expect(checkAnswer(choice, { optionId: 'b' }).correct).toBe(false);
  });

  it('публічна версія не містить відповіді', () => {
    const pub = toPublicItem(choice);
    expect(JSON.stringify(pub)).not.toContain('"answer"');
    const text: ExerciseItem = { key: 't', type: 'SENTENCE_TRANSLATION', skill: 's', data: { source: { uk: 'Добрий день' }, accepted: ['Dzień dobry'] } };
    expect(JSON.stringify(toPublicItem(text))).not.toContain('Dzień dobry');
  });

  it('текст: регістр, пунктуація, діакритика, одруківки', () => {
    expect(matchText('dzień dobry!', ['Dzień dobry']).match).toBe('exact');
    expect(matchText('dzien dobry', ['Dzień dobry']).match).toBe('diacritics');
    expect(matchText('Mam na imie Ola', ['Mam na imię Ola']).match).toBe('diacritics');
    expect(matchText('Przeprasam', ['Przepraszam']).match).toBe('typo');
    expect(matchText('tak', ['nie']).match).toBe('wrong');
    // Коротке слово з одруківкою — не зараховується
    expect(matchText('kot', ['kod']).match).toBe('wrong');
  });

  it('складання речення з альтернативами', () => {
    const item: ExerciseItem = {
      key: 'o', type: 'BUILD_SENTENCE', skill: 's',
      data: { tokens: ['Mam', 'na', 'imię', 'Anna', 'jest'], answer: ['Mam', 'na', 'imię', 'Anna'], alternatives: [['Anna', 'mam', 'na', 'imię']] },
    };
    expect(checkAnswer(item, { tokens: ['Mam', 'na', 'imię', 'Anna'] }).correct).toBe(true);
    expect(checkAnswer(item, { tokens: ['Anna', 'mam', 'na', 'imię'] }).correct).toBe(true);
    expect(checkAnswer(item, { tokens: ['na', 'Mam', 'imię', 'Anna'] }).correct).toBe(false);
  });

  it('з’єднання пар', () => {
    const item: ExerciseItem = {
      key: 'm', type: 'MATCH_PAIRS', skill: 's',
      data: { pairs: [{ l: 'l1', r: 'x9', pl: 'kot', tr: { uk: 'кіт' } }, { l: 'l2', r: 'q3', pl: 'pies', tr: { uk: 'пес' } }] },
    };
    expect(checkAnswer(item, { pairs: [['l1', 'x9'], ['l2', 'q3']] }).correct).toBe(true);
    expect(checkAnswer(item, { pairs: [['l1', 'q3'], ['l2', 'x9']] }).correct).toBe(false);
    expect(checkAnswer(item, { pairs: [['l1', 'x9'], ['l1', 'x9']] }).correct).toBe(false);
  });

  it('діалог перевіряється покроково', () => {
    const item: ExerciseItem = {
      key: 'd', type: 'DIALOGUE', skill: 's',
      data: {
        npc: { name: 'Ania', emoji: '👩' },
        steps: [
          { npc: 'Cześć!', npcTr: { uk: 'Привіт!' }, options: [{ id: '1', text: 'Cześć!', tr: { uk: 'Привіт!' } }, { id: '2', text: 'Dobranoc', tr: { uk: 'На добраніч' } }], answer: '1' },
          { npc: 'Jak masz na imię?', npcTr: { uk: 'Як тебе звати?' }, options: [{ id: '3', text: 'Mam na imię Olek.', tr: { uk: 'Мене звати Олек.' } }, { id: '4', text: 'Dziękuję.', tr: { uk: 'Дякую.' } }], answer: '3' },
          { npc: 'Miło mi!', npcTr: { uk: 'Приємно!' } },
        ],
      },
    };
    expect(checkAnswer(item, { step: 0, optionId: '2' })).toMatchObject({ correct: false, done: false });
    expect(checkAnswer(item, { step: 0, optionId: '1' })).toMatchObject({ correct: true, done: false });
    expect(checkAnswer(item, { step: 1, optionId: '3' })).toMatchObject({ correct: true, done: true });
  });

  it('вимова — схожість розпізнаного тексту', () => {
    expect(similarity('dzien dobry', 'Dzień dobry')).toBe(1);
    const item: ExerciseItem = { key: 'p', type: 'PRONUNCIATION', skill: 's', data: { text: 'Dziękuję', translation: { uk: 'Дякую' } } };
    expect(checkAnswer(item, { transcript: 'dziękuję' }).correct).toBe(true);
    expect(checkAnswer(item, { transcript: 'proszę' }).correct).toBe(false);
    expect(checkAnswer(item, { skipped: true })).toMatchObject({ skipped: true });
  });
});

describe('інтервальне повторення', () => {
  it('інтервали ростуть, помилка скидає', () => {
    const now = new Date('2026-01-01T10:00:00Z');
    const a = nextReview(SRS_INITIAL, 5, now);
    expect(a.intervalDays).toBe(1);
    const b = nextReview(a, 5, now);
    expect(b.intervalDays).toBe(3);
    const c = nextReview(b, 5, now);
    expect(c.intervalDays).toBeGreaterThan(6);
    const d = nextReview(c, 1, now);
    expect(d.repetitions).toBe(0);
    expect(d.lapses).toBe(1);
    expect(d.dueAt.getTime() - now.getTime()).toBe(10 * 60_000);
  });
});

describe('прогресія', () => {
  it('рівні гравця', () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(xpForLevel(50)).level).toBe(50);
    expect(levelFromXp(xpForLevel(120) + 5).level).toBe(120);
  });

  it('серія днів', () => {
    let s = updateStreak({ current: 0, best: 0, lastDay: null }, '2026-03-01');
    expect(s.current).toBe(1);
    s = updateStreak(s, '2026-03-01');
    expect(s.current).toBe(1);
    s = updateStreak(s, '2026-03-02');
    expect(s.current).toBe(2);
    s = updateStreak(s, '2026-03-05');
    expect(s).toMatchObject({ current: 1, best: 2 });
    expect(effectiveStreak(5, '2026-03-01', '2026-03-03')).toBe(0);
    expect(effectiveStreak(5, '2026-03-02', '2026-03-03')).toBe(5);
  });

  it('тижні та дні', () => {
    expect(weekKey('2026-01-01')).toBe('2026-W01');
    expect(weekKey('2024-12-30')).toBe('2025-W01');
    expect(dayKey(new Date('2026-03-01T23:30:00Z'), 'Europe/Warsaw')).toBe('2026-03-02');
  });

  it('нагорода за урок: повтори обмежені', () => {
    const cfg = DEFAULT_REWARDS;
    const first = lessonReward({ cfg, correct: 10, total: 10, firstCompletion: true, replaysToday: 0, passed: true });
    expect(first).toEqual({ xp: 10 * 5 + 20 + 10, zlotki: 10, perfect: true });
    const replay = lessonReward({ cfg, correct: 10, total: 10, firstCompletion: false, replaysToday: 0, passed: true });
    expect(replay.xp).toBe(Math.round(80 * 0.25));
    expect(replay.zlotki).toBe(0);
    const capped = lessonReward({ cfg, correct: 10, total: 10, firstCompletion: false, replaysToday: 2, passed: true });
    expect(capped.xp).toBe(0);
    expect(lessonReward({ cfg, correct: 2, total: 10, firstCompletion: true, replaysToday: 0, passed: false }).xp).toBe(0);
  });
});
