/**
 * Банк вопросов бота (вопрос дня и /quiz): картинки сцен, форма вариантов, «не из приложения», длина подписи.
 */
import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UI_LANGS } from '@polski-go/shared';
import imageVersions from '../src/bot/image-versions.json';
import { QUIZ_SCENES, quizSceneFile, SCENE_LABELS } from '../src/bot/quiz/scenes';
import { QUIZ_QUESTIONS, optionsOf, polishPhrases } from '../src/bot/quiz/questions';
import { dailyQuestionView, dailyResultView } from '../src/bot/daily/views';
import { CITY_CONTENT, PRE_STANDARD_CONTENT } from '../src/content/seed';
import { MISSIONS } from '../src/content/missions';
import { EXAM_A1, PLACEMENT } from '../src/content/exams';
import { GRAMMAR } from '../src/content/grammar';
import { VOCAB } from '../src/content/vocab';
import { SLANG } from '../src/content/slang';
import { leaks } from './guess';

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
const firstCase = (s: string) => (/^\p{Lu}/u.test(s) ? 'upper' : /^\p{Ll}/u.test(s) ? 'lower' : 'none');

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
        if (new Set(opts.map(firstCase).filter((c) => c !== 'none')).size > 1) bad.push(`${q.id} ${lang}: регистр — ${opts.join(' / ')}`);
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

  it('размер и распределение: не меньше 190 вопросов, на каждом уровне от 55, в каждой теме от 18, каждая сцена занята', () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(190);
    const count = (key: 'cefr' | 'category' | 'image') => {
      const out: Record<string, number> = {};
      for (const q of QUIZ_QUESTIONS) out[q[key]] = (out[q[key]] ?? 0) + 1;
      return out;
    };
    const levels = count('cefr');
    for (const level of ['A1', 'A2', 'B1']) expect(levels[level] ?? 0, level).toBeGreaterThanOrEqual(55);
    const topics = count('category');
    for (const topic of ['shopping', 'food', 'transport', 'city', 'work', 'health', 'everyday', 'grammar', 'talk']) expect(topics[topic] ?? 0, topic).toBeGreaterThanOrEqual(18);
    const scenes = count('image');
    for (const scene of QUIZ_SCENES) expect(scenes[scene] ?? 0, scene).toBeGreaterThanOrEqual(2);
    // На каждом уровне хватает разных картинок и тем, чтобы соседние дни не повторялись.
    for (const level of ['A1', 'A2', 'B1']) {
      const pool = QUIZ_QUESTIONS.filter((q) => q.cefr === level);
      expect(new Set(pool.map((q) => q.image)).size, `${level}: сцен`).toBeGreaterThanOrEqual(8);
      expect(new Set(pool.map((q) => q.category)).size, `${level}: тем`).toBe(9);
    }
  });

  it('формат: верный вариант записан первым; словарных вопросов (значение слова) не больше двух третей, форм и предлогов — не меньше трети', () => {
    for (const q of QUIZ_QUESTIONS) expect(q.answer, q.id).toBe(0);
    const vocab = QUIZ_QUESTIONS.filter((q) => !Array.isArray(q.options)).length;
    expect(vocab / QUIZ_QUESTIONS.length, 'словарных (варианты — переводы)').toBeLessThanOrEqual(0.66);
    expect((QUIZ_QUESTIONS.length - vocab) / QUIZ_QUESTIONS.length, 'с польскими вариантами').toBeGreaterThanOrEqual(0.33);
  });

  /**
   * Измерение «ответ понятен, даже если не знать польского» (владелец 2026-11-14): эвристика из guess.ts ищет вопросы, где верный вариант —
   * единственный, который читается по родственному слову, по подсказке в скобках, по предлогу-двойнику или по цифрам. Для русского и украинского.
   * Исключения — только с причиной; запись, которая перестала срабатывать, удаляется.
   */
  const LEAK_REVIEWED: Record<string, string> = {
    'home-pilot': 'по согласным «pilot» ≈ «пульт», но читается слово как «пилот» (лётчик) — ловушка работает, а не подсказка',
  };

  it('не угадывается без польского: верный вариант не единственный, который читается по родственному слову, подсказке, предлогу или цифрам (ru и uk)', () => {
    const flagged = new Set<string>();
    const lines: string[] = [];
    for (const q of QUIZ_QUESTIONS) {
      for (const lang of ['ru', 'uk'] as const) {
        for (const leak of leaks(q, lang)) {
          flagged.add(q.id);
          lines.push(`${q.id} [${leak.kind}] ${leak.detail}`);
        }
      }
    }
    expect(lines.filter((l) => !(l.split(' ')[0] in LEAK_REVIEWED))).toEqual([]);
    expect([...Object.keys(LEAK_REVIEWED)].filter((id) => !flagged.has(id)), 'исключения, которые больше не нужны').toEqual([]);
    for (const [id, reason] of Object.entries(LEAK_REVIEWED)) expect(reason.length, id).toBeGreaterThan(20);
  });

  it('polishPhrases: варианты, польские цитаты из вопроса и фраза с подставленным верным ответом', () => {
    const gap = QUIZ_QUESTIONS.find((q) => q.prompt.en.includes('___') && Array.isArray(q.options));
    expect(gap).toBeTruthy();
    const phrases = polishPhrases(gap!);
    const filled = phrases.find((p) => !p.includes('___') && p.includes((gap!.options as string[])[gap!.answer]));
    expect(filled, phrases.join(' | ')).toBeTruthy();
  });
});

describe('вопрос дня: вид сообщения', () => {
  const roundId = 'f'.repeat(32);
  const round = (q: (typeof QUIZ_QUESTIONS)[number], lang: 'ru' | 'uk' | 'en', order: number[]) => ({
    id: roundId, telegramId: 1, chatId: 1, messageId: 1, questionId: q.id, optionOrder: order, lang, source: 'daily', status: 'ANSWERED' as const,
    hasPhoto: true, chosen: (q.answer + 1) % 4, correct: false, onTime: true, xp: 10, sentAt: new Date(), answeredAt: new Date(),
  });

  it('худший случай влезает в подпись к фото (≤ 1024 знаков): строка серии, процент, XP, серия вопросов дня; callback_data ≤ 64 байт', () => {
    for (const q of QUIZ_QUESTIONS) {
      for (const lang of UI_LANGS) {
        const order = [3, 2, 1, 0];
        const view = dailyQuestionView(q, order, lang, roundId, { streak: 365, returning: false, hasUser: true });
        expect(view.text.length, `${q.id} ${lang}`).toBeLessThanOrEqual(1024);
        const result = dailyResultView(round(q, lang, order), q, { hasUser: true, xp: 10, percent: 100, dailyStreak: 365, pushEnabled: true });
        expect(result.text.length, `${q.id} ${lang} result`).toBeLessThanOrEqual(1024);
        for (const b of [...view.keyboard.inline_keyboard.flat(), ...result.keyboard.inline_keyboard.flat()]) {
          if ('callback_data' in b) expect(Buffer.byteLength(b.callback_data), q.id).toBeLessThanOrEqual(64);
          expect(b.text.length, b.text).toBeLessThanOrEqual(40);
        }
      }
    }
  });

  it('вопрос: заголовок «Pytanie dnia», 4 варианта кнопками, без таймера; кнопка урока — только со строкой серии', () => {
    const q = QUIZ_QUESTIONS[0];
    const plain = dailyQuestionView(q, [0, 1, 2, 3], 'ru', roundId, { streak: null, returning: false, hasUser: true });
    expect(plain.text).toContain('🧠 Pytanie dnia');
    expect(plain.text).not.toMatch(/секунд/);
    const answers = plain.keyboard.inline_keyboard.flat().filter((b) => 'callback_data' in b && b.callback_data.startsWith('qa:'));
    expect(answers).toHaveLength(4);
    expect(plain.keyboard.inline_keyboard.flat().some((b) => 'web_app' in b)).toBe(false);
    const streak = dailyQuestionView(q, [0, 1, 2, 3], 'ru', roundId, { streak: 5, returning: false, hasUser: true });
    expect(streak.text).toMatch(/🔥 .*5/);
    expect(streak.keyboard.inline_keyboard.flat().filter((b) => 'web_app' in b)).toHaveLength(1);
    expect(dailyQuestionView(q, [0, 1, 2, 3], 'ru', roundId, { streak: null, returning: true, hasUser: true }).text).toMatch(/👋/);
  });

  it('итог: пояснение, процент, XP; без аккаунта — вход в приложение вместо урока; переключатель вопроса дня', () => {
    const q = QUIZ_QUESTIONS[0];
    const r = round(q, 'ru', [0, 1, 2, 3]);
    const withUser = dailyResultView(r, q, { hasUser: true, xp: 10, percent: 80, dailyStreak: 2, pushEnabled: true });
    expect(withUser.text).toContain(q.explain.ru);
    expect(withUser.text).toMatch(/80 %/);
    expect(withUser.text).toContain('+10 XP');
    const flat = withUser.keyboard.inline_keyboard.flat();
    expect(flat.map((b) => ('callback_data' in b ? b.callback_data : 'web_app'))).toEqual(['web_app', 'qz:next', 'qz:daily:0']);
    const guest = dailyResultView({ ...r, xp: 0 }, q, { hasUser: false, xp: 0, percent: null, dailyStreak: 1, pushEnabled: false });
    expect(guest.text).not.toMatch(/%/);
    expect(guest.text).toContain('POLSKI GO');
    const gflat = guest.keyboard.inline_keyboard.flat();
    expect(gflat.at(-1)).toMatchObject({ callback_data: 'qz:daily:1' });
    expect(JSON.stringify(gflat[0])).not.toContain('bot_screen=learn');
  });
});
