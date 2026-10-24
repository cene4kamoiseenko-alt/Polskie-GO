/**
 * Інтервальне повторення на основі SM-2.
 * quality: 0..5 (5 — ідеально, <3 — помилка).
 */
export type SrsState = { ease: number; intervalDays: number; repetitions: number; lapses: number };

export const SRS_INITIAL: SrsState = { ease: 2.5, intervalDays: 0, repetitions: 0, lapses: 0 };

export function qualityFrom(correct: boolean, almost = false): number {
  if (!correct) return 1;
  return almost ? 3 : 5;
}

export function nextReview(state: SrsState, quality: number, now: Date = new Date()): SrsState & { dueAt: Date } {
  let { ease, intervalDays, repetitions, lapses } = state;
  if (quality < 3) {
    repetitions = 0;
    lapses += 1;
    // Після помилки — повторити вже сьогодні (через 10 хвилин).
    intervalDays = 0;
    ease = Math.max(1.3, ease - 0.2);
    return { ease, intervalDays, repetitions, lapses, dueAt: new Date(now.getTime() + 10 * 60_000) };
  }
  repetitions += 1;
  if (repetitions === 1) intervalDays = 1;
  else if (repetitions === 2) intervalDays = 3;
  else intervalDays = Math.round(intervalDays * ease);
  ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  intervalDays = Math.min(intervalDays, 365);
  return { ease, intervalDays, repetitions, lapses, dueAt: new Date(now.getTime() + intervalDays * 86_400_000) };
}

/** Слово вважається вивченим після 3 успішних повторень поспіль. */
export function isLearned(state: Pick<SrsState, 'repetitions'>): boolean {
  return state.repetitions >= 3;
}
