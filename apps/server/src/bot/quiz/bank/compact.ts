/**
 * Компактная запись вопроса для больших порций банка: тексты — кортежем [ru, uk, en], верный вариант — первый (answer: 0),
 * переводные варианты — тремя списками [ru[], uk[], en[]]. Получается тот же QuizQuestion, что и в файлах тем.
 */
import type { QuizScene } from '../scenes';
import type { QuizCategory, QuizKind, QuizLevel, QuizQuestion } from './types';

export type T3 = [ru: string, uk: string, en: string];

const l4 = ([ru, uk, en]: T3) => ({ ru, uk, en });

export function cq(
  id: string,
  category: QuizCategory,
  cefr: QuizLevel,
  kind: QuizKind,
  image: QuizScene,
  prompt: T3,
  options: string[] | [ru: string[], uk: string[], en: string[]],
  explain: T3,
  lengthNote?: string,
): QuizQuestion {
  const translated = Array.isArray(options[0]);
  const opts = translated ? { ru: options[0] as string[], uk: options[1] as string[], en: options[2] as string[] } : (options as string[]);
  return { id, category, cefr, kind, image, prompt: l4(prompt), options: opts, answer: 0, explain: l4(explain), ...(lengthNote ? { lengthNote } : {}) };
}
