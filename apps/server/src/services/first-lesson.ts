/**
 * Короткий первый урок (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 3): у игрока без пройденных уроков первое
 * занятие урока — до 8 простых заданий (слово, картинка, аудирование, пары, вставка) вместо 12 с диктантом, чтением и переводом предложения.
 * Пройдено — урок засчитан; остальные виды заданий новичок встречает со второго урока.
 */
import type { ExerciseItem } from '@polski-go/shared';

export const FIRST_LESSON_SIZE = 8;
export const FIRST_LESSON_TYPES = ['WORD_TRANSLATION', 'PICTURE_WORD', 'LISTENING', 'MATCH_PAIRS', 'FILL_GAP'] as const;
/** Если простых заданий меньше — урок остаётся полным (короткая версия не должна быть «урок из двух заданий»). */
const MIN_EASY = 5;

export function firstLessonItems(items: ExerciseItem[]): ExerciseItem[] {
  const easy = items.filter((i) => (FIRST_LESSON_TYPES as readonly string[]).includes(i.type));
  return easy.length < MIN_EASY ? items : easy.slice(0, FIRST_LESSON_SIZE);
}
