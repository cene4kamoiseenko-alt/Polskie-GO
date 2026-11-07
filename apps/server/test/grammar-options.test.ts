/**
 * «Поставь слово в правильную форму» (GRAMMAR) — выбор из четырёх форм вместо ввода (владелец 2026-11-07: клавиатура закрывала польские буквы).
 * Таблица неверных форм — packages/shared/src/grammarOptions.ts. Проверяется на всём содержании курса: у каждого задания есть четыре разные формы,
 * неверные не совпадают с принятыми, сервер по-прежнему проверяет текст, а в ответ клиенту правильные формы не попадают.
 */
import { describe, expect, it } from 'vitest';
import { checkAnswer, grammarOptions, grammarOptionsKey, GRAMMAR_DISTRACTORS, normalize, seededRandom, toPublicItem, type ExerciseItem, type TextData } from '@polski-go/shared';
import { CITY_CONTENT } from '../src/content/seed';
import { EXAM_A1, PLACEMENT } from '../src/content/exams';

type Seed = { type: string; skill: string; data: unknown };
const seeds: Seed[] = [];
for (const c of CITY_CONTENT) for (const r of c.routes) for (const l of r.lessons) seeds.push(...(l.exercises as Seed[]));
for (const l of [PLACEMENT, EXAM_A1]) seeds.push(...(l.exercises as Seed[]));
const grammar = seeds.filter((s) => s.type === 'GRAMMAR').map((s) => s.data as TextData);
const asItem = (data: TextData): ExerciseItem => ({ key: 'k', type: 'GRAMMAR', skill: 'grammar.test', data });

describe('выбор формы в заданиях GRAMMAR', () => {
  it('в курсе есть такие задания, и у каждого — четыре разные формы с правильной среди них', () => {
    expect(grammar.length).toBeGreaterThan(100);
    const missing: string[] = [];
    for (const d of grammar) {
      const o = grammarOptions(d);
      if (!o) { missing.push(`${d.pl} → нет записи ${grammarOptionsKey(d)}`); continue; }
      expect(o).toHaveLength(4);
      expect(new Set(o.map((x) => normalize(x))).size, d.pl).toBe(4);
      expect(o[0]).toBe(d.accepted[0]);
    }
    // Сообщение со списком нужно, чтобы автор нового задания сразу видел, какую запись добавить.
    expect(missing, `Добавьте неверные формы в GRAMMAR_DISTRACTORS:\n${missing.join('\n')}`).toEqual([]);
  });

  it('ни одна неверная форма не совпадает с принятой (ни точно, ни без регистра и диакритики): правильный ответ не засчитается как неверный', () => {
    for (const d of grammar) {
      const taken = d.accepted.map((a) => normalize(a));
      for (const w of GRAMMAR_DISTRACTORS[grammarOptionsKey(d)] ?? []) {
        expect(taken, `${d.pl}: «${w}»`).not.toContain(normalize(w));
        expect(checkAnswer(asItem(d), { text: w }).correct, `${d.pl}: «${w}» принято как верное`).toBe(false);
      }
      expect(checkAnswer(asItem(d), { text: d.accepted[0] }).correct, d.pl).toBe(true);
    }
  });

  it('в таблице нет записей без задания (остатков после правок содержания)', () => {
    const used = new Set(grammar.map((d) => grammarOptionsKey(d)));
    expect(Object.keys(GRAMMAR_DISTRACTORS).filter((k) => !used.has(k))).toEqual([]);
  });

  it('клиент получает options без принятых форм; порядок зависит от генератора, состав — нет', () => {
    const d = grammar.find((x) => x.accepted[0] === 'jestem')!;
    const a = toPublicItem(asItem(d), seededRandom(1));
    const b = toPublicItem(asItem(d), seededRandom(1));
    const c = toPublicItem(asItem(d), seededRandom(7));
    const opts = (a.data as { options: string[] }).options;
    expect(opts.slice().sort()).toEqual(['jest', 'jestem', 'jesteś', 'są'].sort());
    expect((b.data as { options: string[] }).options).toEqual(opts);
    expect((c.data as { options: string[] }).options.slice().sort()).toEqual(opts.slice().sort());
    expect(a.data).not.toHaveProperty('accepted');
    expect(a.data).toMatchObject({ pl: d.pl, base: 'być' });
  });

  it('задание без записи в таблице остаётся вводом: options нет, принятых форм тоже нет', () => {
    const odd: TextData = { pl: 'Ona ___ domu.', base: 'szukać', accepted: ['szuka'] };
    const pub = toPublicItem(asItem(odd), seededRandom(1));
    expect(pub.data).not.toHaveProperty('options');
    expect(pub.data).not.toHaveProperty('accepted');
  });

  it('другие текстовые задания (перевод, диктант) выбором не становятся', () => {
    const t: ExerciseItem = { key: 'k', type: 'SENTENCE_TRANSLATION', skill: 's', data: { source: { uk: 'a', ru: 'a', en: 'a' }, accepted: ['jestem'] } };
    expect(toPublicItem(t).data).not.toHaveProperty('options');
  });
});
