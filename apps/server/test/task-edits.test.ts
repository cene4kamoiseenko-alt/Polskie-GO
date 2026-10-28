/**
 * Точкові правки завдань і текстів уроків (task-edits.ts): збігаються з поточним кодом, на чистій БД нічого не змінюють,
 * старий рядок оновлюють за сталим id, правку з адмінки не перезаписують, повтор нічого не змінює.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { CITY_CONTENT, PRE_STANDARD_CONTENT, exerciseKey, taskEditSql } from '../src/content/seed';
import { EXAM_A1, PLACEMENT } from '../src/content/exams';
import { LESSON_EDITS, TASK_EDITS } from '../src/content/task-edits';
import { db } from '../src/db';
import { exercises, lessons } from '../src/db/schema';
import { disposeEnv, getEnv } from './helpers';

afterAll(disposeEnv);

const allLessons = [...[...PRE_STANDARD_CONTENT, ...CITY_CONTENT].flatMap((c) => c.routes.flatMap((r) => r.lessons)), PLACEMENT, EXAM_A1];
/** Завдання з коду за сталим id — як їх вставляє seed. */
const codeTasks = new Map(
  allLessons.flatMap((l) =>
    l.exercises.map((ex, i) => [exerciseKey(l.slug, l.exerciseIds?.[i] ?? i), { type: ex.type, skill: ex.skill, data: ex.data, explanation: ex.explanation ?? null }] as const),
  ),
);
const json = (v: unknown) => JSON.stringify(v);

async function applyEdits(d1: D1Database): Promise<number> {
  const results = await d1.batch(taskEditSql().map((s) => d1.prepare(s)));
  return results.reduce((n, r) => n + (r.meta.changes ?? 0), 0);
}

describe('Правки завдань і текстів уроків (TASK_EDITS, LESSON_EDITS)', () => {
  it('остання правка кожного завдання дорівнює коду, ланцюжок правок без розривів', () => {
    expect(TASK_EDITS.length).toBeGreaterThan(0);
    const last = new Map<string, (typeof TASK_EDITS)[number]>();
    for (const e of TASK_EDITS) {
      const id = exerciseKey(e.lesson, e.n);
      expect(json(e.from), id).not.toBe(json(e.to));
      const prev = last.get(id);
      if (prev) expect(json(e.from), `${id}: друга правка починається там, де скінчилась перша`).toBe(json(prev.to));
      last.set(id, e);
    }
    for (const [id, e] of last) expect(json(e.to), `${e.lesson}#${e.n}`).toBe(json(codeTasks.get(id)));
  });

  it('тексти уроків у правках дорівнюють коду', () => {
    const bySlug = new Map(allLessons.map((l) => [l.slug, l as unknown as Record<string, unknown>]));
    for (const e of LESSON_EDITS) {
      expect(bySlug.has(e.slug), e.slug).toBe(true);
      expect(json(e.to), `${e.slug}.${e.column}`).toBe(json(bySlug.get(e.slug)![e.column]));
    }
  });

  it('у БД оновлюють лише рядки зі старим текстом, правки з адмінки не чіпають, повтор нічого не змінює', async () => {
    const { env } = await getEnv();
    // Свіжий seed уже вставив нові версії.
    expect(await applyEdits(env.DB)).toBe(0);

    const [a, b] = TASK_EDITS;
    const idA = exerciseKey(a.lesson, a.n);
    const idB = exerciseKey(b.lesson, b.n);
    expect(idA).not.toBe(idB);
    await db.update(exercises).set(a.from as never).where(eq(exercises.id, idA));
    const admin = { ...(b.from.data as object), adminNote: 'Preserve me' };
    await db.update(exercises).set({ ...b.from, data: admin } as never).where(eq(exercises.id, idB));
    const lessonEdit = LESSON_EDITS[0];
    await db.update(lessons).set({ [lessonEdit.column]: lessonEdit.from } as never).where(eq(lessons.slug, lessonEdit.slug));

    expect(await applyEdits(env.DB)).toBe(2);
    expect(await applyEdits(env.DB)).toBe(0);
    const rowA = await db.query.exercises.findFirst({ where: eq(exercises.id, idA) });
    expect(json(rowA?.data)).toBe(json(a.to.data));
    expect(rowA?.type).toBe(a.to.type);
    const rowB = await db.query.exercises.findFirst({ where: eq(exercises.id, idB) });
    expect(rowB?.data).toEqual(admin);
    const lesson = await db.query.lessons.findFirst({ where: eq(lessons.slug, lessonEdit.slug) });
    expect(json((lesson as Record<string, unknown>)[lessonEdit.column])).toBe(json(lessonEdit.to));
  });
});
