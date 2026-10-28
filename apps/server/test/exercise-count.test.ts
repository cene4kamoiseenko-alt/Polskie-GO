import { afterAll, describe, expect, it } from 'vitest';
import { CITY_CONTENT } from '../src/content/seed';
import { disposeEnv, getEnv, login } from './helpers';

afterAll(disposeEnv);

/** Уроки, у яких збережена кількість вправ не збігається з реальною. */
async function mismatches(d1: D1Database) {
  const r = await d1
    .prepare('SELECT count(*) AS n FROM lessons l WHERE l.exercise_count <> (SELECT count(*) FROM exercises e WHERE e.lesson_id = l.id)')
    .first<{ n: number }>();
  return r!.n;
}
const countOf = async (d1: D1Database, lessonId: string) =>
  (await d1.prepare('SELECT exercise_count AS n FROM lessons WHERE id = ?').bind(lessonId).first<{ n: number }>())!.n;

describe('lessons.exercise_count (замість GROUP BY у getJourney)', () => {
  it('після seed збігається з реальною кількістю вправ у кожному уроці', async () => {
    const { env } = await getEnv();
    expect(await mismatches(env.DB)).toBe(0);
    const total = await env.DB.prepare('SELECT sum(exercise_count) AS s, (SELECT count(*) FROM exercises) AS e FROM lessons').first<{ s: number; e: number }>();
    expect(total!.s).toBe(total!.e);
  });

  it('тригери ведуть лічильник при додаванні, перенесенні між уроками й видаленні вправи', async () => {
    const { env } = await getEnv();
    const d1 = env.DB;
    const [a, b] = (await d1.prepare("SELECT id FROM lessons WHERE kind = 'LESSON' ORDER BY id LIMIT 2").all<{ id: string }>()).results.map((r) => r.id);
    const a0 = await countOf(d1, a);
    const b0 = await countOf(d1, b);
    await d1.prepare("INSERT INTO exercises (id, lesson_id, \"order\", type, skill, data) VALUES ('ex_count_probe', ?, 9999, 'TRANSLATE', 'vocab', '{}')").bind(a).run();
    expect(await countOf(d1, a)).toBe(a0 + 1);
    await d1.prepare("UPDATE exercises SET lesson_id = ? WHERE id = 'ex_count_probe'").bind(b).run();
    expect(await countOf(d1, a)).toBe(a0);
    expect(await countOf(d1, b)).toBe(b0 + 1);
    // Зміна інших полів не чіпає лічильник.
    await d1.prepare("UPDATE exercises SET skill = 'grammar' WHERE id = 'ex_count_probe'").run();
    expect(await countOf(d1, b)).toBe(b0 + 1);
    await d1.prepare("DELETE FROM exercises WHERE id = 'ex_count_probe'").run();
    expect(await countOf(d1, b)).toBe(b0);
    expect(await mismatches(d1)).toBe(0);
  });

  it('getJourney віддає ту саму кількість вправ, що й таблиця exercises', async () => {
    const { env } = await getEnv();
    const { call } = await login();
    const j = await call('GET', '/api/journey');
    expect(j.status).toBe(200);
    const lessonsOut = (j.body.cities as { routes: { lessons: { id: string; exerciseCount: number }[] }[] }[]).flatMap((c) => c.routes.flatMap((r) => r.lessons));
    expect(lessonsOut.length).toBe(CITY_CONTENT.flatMap((c) => c.routes.flatMap((r) => r.lessons)).length);
    const real = new Map(
      (await env.DB.prepare('SELECT lesson_id AS id, count(*) AS n FROM exercises GROUP BY lesson_id').all<{ id: string; n: number }>()).results.map((r) => [r.id, r.n]),
    );
    for (const l of lessonsOut) expect(l.exerciseCount, l.id).toBe(real.get(l.id) ?? 0);
  });
});
