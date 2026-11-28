/**
 * Повторение слов (жалоба владельца 2026-11-28 со снимками: «очень лёгкие тесты, на уровне даже не A0 — не зная польского, можно ответить»):
 *  • mama → мама, toaleta → туалет, niegazowana → негазированная — ответ слышен по созвучию с русским/украинским;
 *  • неверные варианты из случайных тем («хот-дог» к dziecko, autostrada к «семья») — отсекаются без знания языка.
 * Правила (services/word-review.ts): созвучное слово не даётся как «выбери перевод»; неверные варианты — несозвучные слова той же темы
 * или части речи; у созвучного слова — «как правильно пишется» с ловушками по русскому написанию. Проверка — на всём настоящем словаре.
 */
import { describe, expect, it } from 'vitest';
import type { ChoiceData } from '@polski-go/shared';
import { VOCAB } from '../src/content/vocab';
import { buildWordItem, isCognateWord, misspellings, type VocabWord } from '../src/services/word-review';

const words: VocabWord[] = VOCAB.map((v, i) => ({ id: `v${i}`, pl: v.pl, pos: v.pos, translations: v.tr, topics: v.topics, audioUrl: null }));
const byPl = (pl: string) => words.find((w) => w.pl === pl)!;
const rnd = (seed = 1) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const text = (o: ChoiceData['options'][number]) => (typeof o.text === 'string' ? o.text : o.text.ru);

describe('созвучные слова', () => {
  it('короткие и длинные: mama, kawa, syn, toaleta, niegazowana — созвучны; dziecko, mieć — нет', () => {
    for (const pl of ['mama', 'kawa', 'syn', 'toaleta', 'niegazowana']) expect(isCognateWord(byPl(pl)), pl).toBe(true);
    for (const pl of ['dziecko', 'mieć']) expect(isCognateWord(byPl(pl)), pl).toBe(false);
  });

  it('созвучное слово не бывает заданием «выбери перевод» и «как это по-польски» с переводами', () => {
    for (const pl of ['mama', 'toaleta', 'niegazowana', 'kawa']) {
      for (let v = 0; v < 4; v++) {
        const it = buildWordItem(byPl(pl), words, rnd(v + 3), v);
        if (it.type === 'WORD_TRANSLATION') {
          const d = it.data as ChoiceData & { pl?: string; translation?: unknown };
          // Только «как правильно пишется»: перевод в вопросе, варианты — польские написания.
          expect(d.pl, `${pl} v${v}`).toBeUndefined();
          expect(d.options.every((o) => typeof o.text === 'string'), `${pl} v${v}`).toBe(true);
        }
      }
    }
  });

  it('ловушки написания — по русскому образцу, не совпадают с настоящими словами словаря', () => {
    const all = new Set(words.map((w) => w.pl.toLowerCase()));
    for (const pl of ['toaleta', 'ogórek', 'rzeka', 'chleb', 'mąka']) {
      const w = words.find((x) => x.pl === pl);
      if (!w) continue;
      const m = misspellings(pl);
      expect(m.length, pl).toBeGreaterThanOrEqual(2);
      for (const s of m) {
        expect(s).not.toBe(pl);
        expect(all.has(s.toLowerCase()), `${s} — настоящее слово`).toBe(false);
      }
    }
    expect(misspellings('toaleta')).toContain('tualeta');
  });
});

describe('неверные варианты', () => {
  it('dziecko: варианты — несозвучные слова той же темы (семья), без «хот-дога»', () => {
    const it = buildWordItem(byPl('dziecko'), words, rnd(7), 0);
    expect(it.type).toBe('WORD_TRANSLATION');
    const d = it.data as ChoiceData;
    const wrong = d.options.filter((o) => o.id !== d.answer);
    for (const o of wrong) {
      const w = words.find((x) => x.translations.ru === text(o))!;
      expect(w, text(o)).toBeTruthy();
      expect(isCognateWord(w), `${w.pl} — созвучное`).toBe(false);
      expect(w.topics.includes('family') || w.pos === 'noun', `${w.pl}: ${w.topics}`).toBe(true);
    }
    expect(wrong.map(text)).not.toContain('хот-дог');
  });

  it('по всему словарю: в выборе перевода ни одного созвучного слова среди вариантов, тема или часть речи совпадает в ≥ 90 %', () => {
    let items = 0;
    let related = 0;
    let options = 0;
    for (const [i, w] of words.entries()) {
      for (const v of [0, 1]) {
        const it = buildWordItem(w, words, rnd(i * 2 + v + 11), v);
        if (it.type !== 'WORD_TRANSLATION') continue;
        const d = it.data as ChoiceData & { pl?: string };
        if (!d.pl && !(it.data as { translation?: unknown }).translation) continue;
        const isSpelling = d.options.every((o) => typeof o.text === 'string') && !d.pl && isCognateWord(w);
        if (isSpelling) continue;
        items++;
        for (const o of d.options.filter((x) => x.id !== d.answer)) {
          const other = words.find((x) => (typeof o.text === 'string' ? x.pl === o.text : x.translations.ru === o.text.ru));
          expect(other, JSON.stringify(o.text)).toBeTruthy();
          expect(isCognateWord(other!), `${w.pl}: вариант ${other!.pl} созвучен`).toBe(false);
          options++;
          if (other!.pos === w.pos || other!.topics.some((t) => w.topics.includes(t))) related++;
        }
      }
    }
    expect(items).toBeGreaterThan(500);
    expect(related / options).toBeGreaterThanOrEqual(0.9);
  });

  it('варианты не повторяют перевод верного ответа (синонимы)', () => {
    for (const [i, w] of words.entries()) {
      const it = buildWordItem(w, words, rnd(i + 5), 0);
      if (it.type !== 'WORD_TRANSLATION' || !(it.data as { pl?: string }).pl) continue;
      const texts = (it.data as ChoiceData).options.map(text);
      expect(new Set(texts).size, `${w.pl}: ${texts.join(' / ')}`).toBe(texts.length);
    }
  });
});
