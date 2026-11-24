/**
 * Начатый и брошенный урок (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 3): «Продолжить урок · осталось N заданий»
 * на главной и в карточке новичка. Урок продолжается с места в течение LESSON_RESUME_MS (раньше — 3 часа: на следующий день урок
 * начинался заново, и 45 из 101 новичка его бросали).
 */
import { and, desc, eq, gt, isNotNull } from 'drizzle-orm';
import { db } from '../db';
import { learningSessions } from '../db/schema';

export const LESSON_RESUME_MS = 7 * 24 * 3600_000;

export type ActiveLesson = { lessonId: string; done: number; total: number };

type Item = { key: string };
type State = { answers?: Record<string, { done?: boolean } | undefined> };

/** Сколько заданий сделано в сеансе урока. */
export function doneCount(items: unknown, state: unknown): number {
  const answers = (state as State | null)?.answers ?? {};
  return ((items as Item[] | null) ?? []).filter((i) => answers[i.key]?.done).length;
}

/** Последний незаконченный урок с хотя бы одним ответом, который ещё можно продолжить; иначе null. */
export async function activeLessonProgress(userId: string, now = new Date()): Promise<ActiveLesson | null> {
  const row = await db
    .select({ lessonId: learningSessions.lessonId, items: learningSessions.items, state: learningSessions.state })
    .from(learningSessions)
    .where(
      and(
        eq(learningSessions.userId, userId),
        eq(learningSessions.status, 'ACTIVE'),
        eq(learningSessions.mode, 'LESSON'),
        isNotNull(learningSessions.lessonId),
        gt(learningSessions.startedAt, new Date(now.getTime() - LESSON_RESUME_MS)),
      ),
    )
    .orderBy(desc(learningSessions.startedAt))
    .limit(1)
    .get();
  if (!row?.lessonId) return null;
  const total = (row.items as unknown[]).length;
  const done = doneCount(row.items, row.state);
  return done > 0 && done < total ? { lessonId: row.lessonId, done, total } : null;
}
