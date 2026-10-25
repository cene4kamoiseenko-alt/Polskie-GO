/**
 * Компактний DSL для опису навчального контенту.
 * Кожна функція повертає вправу у форматі таблиці `exercises` (з відповіддю).
 * Ідентифікатори варіантів детерміновані, щоб повторний seed не змінював дані.
 */
import type { DialogueStep, ExerciseType, I18n } from '@polski-go/shared';

export type ExerciseSeed = {
  type: ExerciseType;
  skill: string;
  data: Record<string, unknown>;
  explanation?: I18n;
};

/** Переклад трьома мовами: t(uk, ru, en). */
export const t = (uk: string, ru?: string, en?: string): I18n => ({ uk, ru: ru ?? uk, en: en ?? uk });

let counter = 0;
const rid = (prefix: string) => `${prefix}${(++counter).toString(36)}`;
export function resetIds() {
  counter = 0;
}

/** Обери переклад польського слова. options[0] — правильний. */
export function wordChoice(skill: string, pl: string, options: I18n[], explanation?: I18n): ExerciseSeed {
  const opts = options.map((text, i) => ({ id: `o${i}`, text }));
  return { type: 'WORD_TRANSLATION', skill, data: { pl, audioText: pl, options: opts, answer: 'o0' }, explanation };
}

/** Обери польське слово для перекладу. options[0] — правильний. */
export function reverseChoice(skill: string, translation: I18n, options: string[], explanation?: I18n): ExerciseSeed {
  const opts = options.map((text, i) => ({ id: `o${i}`, text }));
  return { type: 'WORD_TRANSLATION', skill, data: { translation, options: opts, answer: 'o0' }, explanation };
}

/** Обери картинку для польського слова (сітка 2×2). options[0] — правильний: [емодзі, переклад]. */
export function pictureChoice(skill: string, pl: string, options: [string, I18n][], explanation?: I18n): ExerciseSeed {
  const opts = options.map(([image, text], i) => ({ id: `o${i}`, text, image }));
  return { type: 'WORD_TRANSLATION', skill, data: { pl, audioText: pl, options: opts, answer: 'o0' }, explanation };
}

/** Встав пропущене слово. Речення містить ___. options[0] — правильний. */
export function fillGap(skill: string, pl: string, options: string[], translation: I18n, explanation?: I18n): ExerciseSeed {
  const opts = options.map((text, i) => ({ id: `o${i}`, text }));
  return { type: 'FILL_GAP', skill, data: { pl, translation, options: opts, answer: 'o0' }, explanation };
}

/** Послухай і обери почуте. options[0] — правильний. */
export function listen(skill: string, audioText: string, options: string[], explanation?: I18n): ExerciseSeed {
  const opts = options.map((text, i) => ({ id: `o${i}`, text }));
  return { type: 'LISTENING', skill, data: { audioText, options: opts, answer: 'o0' }, explanation };
}

/** Слово за картинкою (емодзі як тимчасове зображення). options[0] — правильний. */
export function picture(skill: string, image: string, options: string[], explanation?: I18n): ExerciseSeed {
  const opts = options.map((text, i) => ({ id: `o${i}`, text }));
  return { type: 'PICTURE_WORD', skill, data: { image, options: opts, answer: 'o0' }, explanation };
}

/** Знайди помилку: речення розбите на слова, errorIndex — слово з помилкою. */
export function findError(skill: string, words: string[], errorIndex: number, translation: I18n, explanation: I18n, question?: I18n): ExerciseSeed {
  const opts = words.map((text, i) => ({ id: `w${i}`, text }));
  return { type: 'FIND_ERROR', skill, data: { pl: words.join(' '), translation, options: opts, answer: `w${errorIndex}`, ...(question ? { question } : {}) }, explanation };
}

/** Знайди зайве слово. odd — індекс зайвого. */
export function oddOne(skill: string, words: string[], odd: number, explanation: I18n, question: I18n): ExerciseSeed {
  const opts = words.map((text, i) => ({ id: `w${i}`, text }));
  return { type: 'ODD_ONE_OUT', skill, data: { question, options: opts, answer: `w${odd}` }, explanation };
}

/** Прочитай текст і дай відповідь. options[0] — правильний. */
export function reading(skill: string, passage: string, question: I18n, options: (string | I18n)[], explanation?: I18n): ExerciseSeed {
  const opts = options.map((text, i) => ({ id: `o${i}`, text }));
  return { type: 'READING', skill, data: { passage, question, options: opts, answer: 'o0' }, explanation };
}

/** Переклади речення польською (введення тексту). */
export function translate(skill: string, source: I18n, accepted: string[], explanation?: I18n): ExerciseSeed {
  return { type: 'SENTENCE_TRANSLATION', skill, data: { source, accepted }, explanation };
}

/** Граматичний конструктор: постав слово в правильну форму. */
export function grammar(skill: string, pl: string, base: string, accepted: string[], translation: I18n, explanation: I18n): ExerciseSeed {
  return { type: 'GRAMMAR', skill, data: { pl, base, accepted, translation }, explanation };
}

/** Диктант: послухай і запиши. */
export function dictation(skill: string, audioText: string, translation: I18n, extra: string[] = []): ExerciseSeed {
  return { type: 'DICTATION', skill, data: { audioText, translation, accepted: [audioText, ...extra] } };
}

/** Склади речення з плиток. distractors — зайві плитки. */
export function build(skill: string, sentence: string, translation: I18n, distractors: string[] = [], alternatives: string[] = [], explanation?: I18n): ExerciseSeed {
  const answer = sentence.split(' ');
  return {
    type: 'BUILD_SENTENCE',
    skill,
    data: { translation, tokens: [...answer, ...distractors], answer, alternatives: alternatives.map((a) => a.split(' ')) },
    explanation,
  };
}

/** Виправ порядок слів (без зайвих плиток). */
export function wordOrder(skill: string, sentence: string, translation: I18n, explanation?: I18n, alternatives: string[] = []): ExerciseSeed {
  const answer = sentence.split(' ');
  return {
    type: 'WORD_ORDER',
    skill,
    data: { translation, tokens: answer.slice().reverse(), answer, alternatives: alternatives.map((a) => a.split(' ')) },
    explanation,
  };
}

/** З'єднай пари: [польське, переклад]. */
export function match(skill: string, pairs: [string, I18n][]): ExerciseSeed {
  return {
    type: 'MATCH_PAIRS',
    skill,
    data: { pairs: pairs.map(([pl, tr]) => ({ l: rid('l'), r: rid('r'), pl, tr })) },
  };
}

/** Вимова: скажи вголос. */
export function speak(skill: string, text: string, translation: I18n): ExerciseSeed {
  return { type: 'PRONUNCIATION', skill, data: { text, translation } };
}

type Line =
  | { npc: string; tr: I18n }
  | { npc: string; tr: I18n; choose: [string, I18n][]; feedback: I18n };

/** Діалог або ситуаційна гра. У кожному виборі перший варіант — правильний. */
export function dialogue(
  skill: string,
  npc: { name: string; emoji: string; role?: I18n },
  lines: Line[],
  opts: { situation?: boolean; scene?: I18n } = {},
): ExerciseSeed {
  const steps: DialogueStep[] = lines.map((l, si) => {
    if (!('choose' in l)) return { npc: l.npc, npcTr: l.tr };
    const options = l.choose.map(([text, tr], i) => ({ id: `s${si}o${i}`, text, tr }));
    return { npc: l.npc, npcTr: l.tr, options, answer: options[0].id, feedback: l.feedback };
  });
  return { type: opts.situation ? 'SITUATION' : 'DIALOGUE', skill, data: { npc, scene: opts.scene, steps } };
}
