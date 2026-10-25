import { afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { CITY_CONTENT, exerciseFixSql } from '../src/content/seed';
import { EXERCISE_FIXES } from '../src/content/exercise-fixes';
import { db } from '../src/db';
import { exercises, lessons } from '../src/db/schema';
import { disposeEnv, getEnv } from './helpers';
const all = CITY_CONTENT.flatMap(c => c.routes.flatMap(r => r.lessons));
afterAll(disposeEnv);
describe('Content corrections', () => {
  it('every odd-one-out exercise has an explicit criterion and explanation', () => {
    for (const l of all) for (const e of l.exercises) if (e.type === 'ODD_ONE_OUT') {
      const q = e.data.question as Record<string, string>;
      for (const lang of ['uk', 'ru', 'en']) expect(q?.[lang], l.slug).toBeTruthy();
      expect(e.explanation, l.slug).toBeTruthy();
    }
  });
  it('there are no exact question-and-data duplicates across city lessons', () => {
    const seen = new Map<string, string>();
    for (const l of all) for (const e of l.exercises) {
      const key = JSON.stringify({ type: e.type, data: e.data });
      expect(seen.get(key), `Duplicate in ${l.slug}`).toBeUndefined();
      seen.set(key, l.slug);
    }
  });
  it('questions differing only by case, punctuation or option order are not duplicated', () => {
    const normalize = (v: any): any => {
      if (typeof v === 'string') return v.toLowerCase().trim().replace(/[.!?]+$/g, '').replace(/\s+/g, ' ');
      if (Array.isArray(v)) return v.map(normalize);
      if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).filter(([k]) => !['id', 'answer', 'alternatives'].includes(k)).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, normalize(x)]));
      return v;
    };
    const seen = new Set<string>();
    for (const l of all) for (const e of l.exercises) {
      const data = normalize(e.data);
      if (data.options) data.options.sort((a: any, b: any) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      const key = JSON.stringify([e.type, data]);
      expect(seen.has(key), `Repeated normalized exercise in ${l.slug}`).toBe(false);
      seen.add(key);
    }
  });
  it('all choice answers point to a unique existing option ID', () => {
    for (const l of all) for (const e of l.exercises) {
      const d = e.data as { options?: { id: string }[]; answer?: string };
      if (!d.options) continue;
      expect(new Set(d.options.map(o => o.id)).size, l.slug).toBe(d.options.length);
      expect(d.options.filter(o => o.id === d.answer).length, l.slug).toBe(1);
    }
  });
  it('targeted DB update corrects old rows, is idempotent and preserves admin edits and IDs', async () => {
    const { env } = await getEnv();
    const fixes = EXERCISE_FIXES.slice(0, 2);
    const rows = [];
    for (const f of fixes) {
      const lesson = (await db.select().from(lessons).where(eq(lessons.slug, f.lesson)))[0];
      const row = (await db.select().from(exercises).where(eq(exercises.lessonId, lesson.id))).find(e => e.order === f.order)!;
      rows.push(row);
    }
    await db.update(exercises).set(fixes[0].from as any).where(eq(exercises.id, rows[0].id));
    const edited = { ...fixes[1].from.data, adminNote: 'Preserve me' };
    await db.update(exercises).set({ ...fixes[1].from, data: edited } as any).where(eq(exercises.id, rows[1].id));
    const apply = async () => {
      let changed = 0;
      for (const sql of exerciseFixSql()) changed += (await env.DB.prepare(sql).run()).meta.changes;
      return changed;
    };
    expect(await apply()).toBe(1);
    expect(await apply()).toBe(0);
    expect((await db.query.exercises.findFirst({ where: eq(exercises.id, rows[0].id) }))?.data).toEqual(fixes[0].to.data);
    expect((await db.query.exercises.findFirst({ where: eq(exercises.id, rows[1].id) }))?.data).toEqual(edited);
  });
});
