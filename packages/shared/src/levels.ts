/**
 * Свой уровень на общей дороге (владелец 2026-11-16: «человек начинает там же, где и все, но вопросы его уровня»).
 *  • У урока есть обычная версия (уровень города) и трудные версии A2/B1/B2; игрок получает версию под свой уровень заданий.
 *  • Входной тест — блоки A0…B2 по 3 вопроса: блок сдан при 2 из 3, несданный блок заканчивает тест.
 *  • Автоподстройка: три лёгких урока своего уровня подряд — выше, два трудных — ниже.
 * docs/superpowers/specs/2026-11-16-levels-design.md
 */
import { CEFR_LEVELS, type Cefr } from './types';

/** Уровни трудных версий уроков; NULL у игрока — обычные версии. */
export const STUDY_LEVELS = ['A2', 'B1', 'B2'] as const;
export type StudyLevel = (typeof STUDY_LEVELS)[number];

const idx = (c: Cefr) => CEFR_LEVELS.indexOf(c);

/** Версия урока: наибольший уровень из доступных версий, выше уровня урока и не выше уровня игрока; null — обычная версия. */
export function variantLevel(lessonCefr: Cefr, studyLevel: StudyLevel | null, available: readonly Cefr[]): Cefr | null {
  if (!studyLevel) return null;
  const fit = available.filter((l) => idx(l) > idx(lessonCefr) && idx(l) <= idx(studyLevel));
  return fit.length ? fit.reduce((a, b) => (idx(b) > idx(a) ? b : a)) : null;
}

/** Блоки входного теста по возрастанию трудности. */
export const PLACEMENT_BLOCKS = ['A0', 'A1', 'A2', 'B1', 'B2'] as const satisfies readonly Cefr[];
export const PLACEMENT_BLOCK_SIZE = 3;
export const PLACEMENT_BLOCK_PASS = 2;

/**
 * Ход входного теста по ответам (по порядку; correct: null — «Не знаю» или пропуск, считается неверным).
 * stop — тест закончен (блок не сдан или все блоки пройдены); level — последний сданный блок, ни одного — A0.
 */
export function placementProgress(answers: readonly { level: Cefr; correct: boolean | null }[]): { stop: boolean; level: Cefr } {
  let level: Cefr = 'A0';
  for (const block of PLACEMENT_BLOCKS) {
    const got = answers.filter((a) => a.level === block);
    if (got.length < PLACEMENT_BLOCK_SIZE) return { stop: false, level };
    if (got.filter((a) => a.correct === true).length < PLACEMENT_BLOCK_PASS) return { stop: true, level };
    level = block;
  }
  return { stop: true, level };
}

/** Уровень заданий по итогу теста: трудные версии — с A2; A0–A1 — обычные версии (уровень города). */
export function studyLevelFor(level: Cefr): StudyLevel | null {
  return (STUDY_LEVELS as readonly string[]).includes(level) ? (level as StudyLevel) : null;
}

export const ADAPT_UP_ACCURACY = 0.9;
export const ADAPT_DOWN_ACCURACY = 0.5;
export const ADAPT_UP_RUN = 3;
export const ADAPT_DOWN_RUN = 2;

/**
 * Автоподстройка после урока. Считаются только уроки в версии уровня игрока (variant === level): обычный урок у знающего
 * (версии ещё нет) ничего не говорит о его уровне.
 */
export function adaptLevel(
  st: { level: StudyLevel | null; up: number; down: number },
  accuracy: number,
  variant: Cefr | null,
): { level: StudyLevel | null; up: number; down: number; changed: 'up' | 'down' | null } {
  if (!st.level || variant !== st.level) return { ...st, changed: null };
  const up = accuracy >= ADAPT_UP_ACCURACY ? st.up + 1 : 0;
  const down = accuracy < ADAPT_DOWN_ACCURACY ? st.down + 1 : 0;
  const i = STUDY_LEVELS.indexOf(st.level);
  if (up >= ADAPT_UP_RUN) {
    if (i === STUDY_LEVELS.length - 1) return { level: st.level, up: 0, down: 0, changed: null };
    return { level: STUDY_LEVELS[i + 1], up: 0, down: 0, changed: 'up' };
  }
  if (down >= ADAPT_DOWN_RUN) return { level: i > 0 ? STUDY_LEVELS[i - 1] : null, up: 0, down: 0, changed: 'down' };
  return { level: st.level, up, down, changed: null };
}
