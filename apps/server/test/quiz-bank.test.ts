/**
 * Банк вопросов бота (вопрос дня и /quiz): картинки сцен, форма вариантов, «не из приложения», длина подписи.
 */
import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UI_LANGS } from '@polski-go/shared';
import imageVersions from '../src/bot/image-versions.json';
import { QUIZ_SCENES, quizSceneFile, SCENE_LABELS } from '../src/bot/quiz/scenes';
import { QUIZ_QUESTIONS, optionsOf, polishPhrases } from '../src/bot/quiz/questions';
import { CITY_CONTENT, PRE_STANDARD_CONTENT } from '../src/content/seed';
import { MISSIONS } from '../src/content/missions';
import { EXAM_A1, PLACEMENT } from '../src/content/exams';
import { GRAMMAR } from '../src/content/grammar';
import { VOCAB } from '../src/content/vocab';
import { SLANG } from '../src/content/slang';

const PUBLIC_BOT = new URL('../../web/public/bot/', import.meta.url);

describe('картинки вопросов', () => {
  it('16 полноразмерных сцен, у каждой JPG и версия адреса; лишних файлов нет', () => {
    expect(QUIZ_SCENES).toHaveLength(16);
    const versions = imageVersions as Record<string, string>;
    for (const scene of QUIZ_SCENES) {
      const file = quizSceneFile(scene);
      expect(file).toBe(`quiz/${scene}.jpg`);
      expect(existsSync(new URL(file, PUBLIC_BOT)), file).toBe(true);
      expect(versions[file], file).toMatch(/^[0-9a-f]{10}$/);
      for (const lang of ['ru', 'uk', 'en'] as const) expect(SCENE_LABELS[scene][lang].trim().length, `${scene} ${lang}`).toBeGreaterThan(2);
    }
    const files = readdirSync(new URL('quiz/', PUBLIC_BOT)).filter((f) => f.endsWith('.jpg')).sort();
    expect(files).toEqual([...QUIZ_SCENES].map((s) => `${s}.jpg`).sort());
  });

  it('магазины-вырезки (Żabka, Biedronka, Rossmann, InPost, ORLEN) в вопросы не идут', () => {
    for (const cut of ['zabka', 'biedronka', 'rossmann', 'inpost', 'orlen']) expect(QUIZ_SCENES as readonly string[]).not.toContain(cut);
  });
});

/** Нормализация для сравнения фраз: регистр, пунктуация, пробелы. */
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[«»"'„”.,!?…:;()\[\]—–\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Все строки контента приложения (уроки, старые уроки, миссии, тесты, грамматика, словарь, сленг). */
function appStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const v of value) appStrings(v, out);
  else if (value && typeof value === 'object') for (const v of Object.values(value)) appStrings(v, out);
  return out;
}

/** Порог «самый длинный не длиннее самого короткого в 1,6 раза» не применяется к коротким вариантам (предлоги, «w / na / do / z»). */
const RATIO_FLOOR = 6;
const endKind = (s: string) => (/[.]$/.test(s) ? '.' : /[?]$/.test(s) ? '?' : /[!]$/.test(s) ? '!' : 'other');
const firstCase = (s: string) => (/^\p{Lu}/u.test(s) ? 'upper' : /^\p{Ll}/u.test(s) ? 'lower' : 'other');

describe('банк: качество', () => {
  it('структура: уникальные id, картинка из 16 сцен, ровно 4 разных варианта, тексты на трёх языках', () => {
    expect(new Set(QUIZ_QUESTIONS.map((q) => q.id)).size).toBe(QUIZ_QUESTIONS.length);
    for (const q of QUIZ_QUESTIONS) {
      expect(QUIZ_SCENES as readonly string[], `${q.id}: image`).toContain(q.image);
      for (const lang of UI_LANGS) {
        const opts = optionsOf(q, lang);
        expect(opts, `${q.id} ${lang}`).toHaveLength(4);
        expect(new Set(opts.map(norm)).size, `${q.id} ${lang}: одинаковые варианты`).toBe(4);
        expect(opts[q.answer], q.id).toBeTruthy();
        expect(q.prompt[lang].trim().length, `${q.id} prompt ${lang}`).toBeGreaterThan(3);
        expect(q.explain[lang].trim().length, `${q.id} explain ${lang}`).toBeGreaterThan(10);
      }
    }
  });

  it('длины вариантов близки: самый длинный не длиннее самого короткого больше чем в 1,6 раза (или причина в lengthNote)', () => {
    const bad: string[] = [];
    for (const q of QUIZ_QUESTIONS) {
      if (q.lengthNote) continue;
      for (const lang of UI_LANGS) {
        const lens = optionsOf(q, lang).map((o) => o.length);
        const max = Math.max(...lens);
        if (max > RATIO_FLOOR && max / Math.min(...lens) > 1.6) bad.push(`${q.id} ${lang}: ${optionsOf(q, lang).join(' / ')}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('форма одна: у вариантов одинаковые знак в конце и регистр первой буквы; нет «всё перечисленное»', () => {
    const banned = /wszystkie|żadne z|все перечисленн|всі перелічен|ни один из|жоден з|all of the above|none of the above/i;
    const bad: string[] = [];
    for (const q of QUIZ_QUESTIONS) {
      for (const lang of UI_LANGS) {
        const opts = optionsOf(q, lang);
        if (new Set(opts.map(endKind)).size > 1) bad.push(`${q.id} ${lang}: знак в конце — ${opts.join(' / ')}`);
        if (new Set(opts.map(firstCase)).size > 1) bad.push(`${q.id} ${lang}: регистр — ${opts.join(' / ')}`);
        for (const o of opts) if (banned.test(o)) bad.push(`${q.id} ${lang}: «${o}»`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('верный вариант не выдаёт себя длиной: строго самый длинный — не больше чем в 35 % вопросов', () => {
    const longest = QUIZ_QUESTIONS.filter((q) => {
      const opts = optionsOf(q, 'ru');
      const len = opts[q.answer].length;
      return opts.every((o, i) => i === q.answer || o.length < len);
    });
    expect(longest.length / QUIZ_QUESTIONS.length, longest.map((q) => q.id).join(', ')).toBeLessThanOrEqual(0.35);
  });

  it('язык не смешивается: в uk нет ы/э/ъ, в ru нет і/ї/є/ґ, нет латиницы и кириллицы в одном слове', () => {
    const mixed = /(?=\S*[A-Za-z])(?=\S*[А-Яа-яІіЇїЄєҐґ])\S+/;
    for (const q of QUIZ_QUESTIONS) {
      expect(`${q.prompt.uk} ${q.explain.uk}`, q.id).not.toMatch(/[ыэъЫЭЪ]/);
      expect(`${q.prompt.ru} ${q.explain.ru}`, q.id).not.toMatch(/[іїєґІЇЄҐ]/);
      for (const lang of ['ru', 'uk'] as const) {
        for (const word of `${q.prompt[lang]} ${q.explain[lang]}`.split(/\s+/)) expect(mixed.test(word.replace(/[«»"'()!?.,:;—-]/g, '')), `${q.id} ${lang}: ${word}`).toBe(false);
      }
    }
  });

  it('не из приложения: польские фразы от 3 слов не повторяют тексты уроков, миссий, тестов, грамматики и словаря', () => {
    const corpus = ` | ${appStrings([CITY_CONTENT, PRE_STANDARD_CONTENT, MISSIONS, PLACEMENT, EXAM_A1, GRAMMAR, VOCAB, SLANG]).map(norm).join(' | ')} | `;
    expect(corpus.length).toBeGreaterThan(100_000);
    const hits: string[] = [];
    for (const q of QUIZ_QUESTIONS) {
      for (const phrase of polishPhrases(q)) {
        const p = norm(phrase);
        if (p.split(' ').length >= 3 && corpus.includes(` ${p} `)) hits.push(`${q.id}: «${phrase}»`);
      }
    }
    expect(hits).toEqual([]);
  });

  it('polishPhrases: варианты, польские цитаты из вопроса и фраза с подставленным верным ответом', () => {
    const gap = QUIZ_QUESTIONS.find((q) => q.prompt.en.includes('___') && Array.isArray(q.options));
    expect(gap).toBeTruthy();
    const phrases = polishPhrases(gap!);
    const filled = phrases.find((p) => !p.includes('___') && p.includes((gap!.options as string[])[gap!.answer]));
    expect(filled, phrases.join(' | ')).toBeTruthy();
  });
});
