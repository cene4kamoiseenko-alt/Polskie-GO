/**
 * Удлинение сюжетных квестов (2026-11-02) на «проде»: база уже засеяна первыми главами, обычный сид не перезаписывает существующее.
 * Проверяем, что релиз докладывает новые главы и один раз обновляет число этапов, награду и описание, что повтор ничего не меняет
 * и что строка, изменённая в админке (другое число этапов), не перезаписывается.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { buildSeedSql } from '../src/content/seed';
import { STORY_QUESTS, STORY_TARGET_BEFORE } from '../src/content/gamification';
import { disposeEnv, getEnv } from './helpers';

afterAll(disposeEnv);

const OLD_DESCRIPTION = JSON.stringify({ uk: 'старий опис', ru: 'старое описание', en: 'old description' });
const questSql = () => buildSeedSql().filter((s) => /^(INSERT INTO quest_steps|INSERT INTO quests |UPDATE quests SET target)/.test(s));

async function apply(d1: D1Database, statements: string[]) {
  for (let i = 0; i < statements.length; i += 50) await d1.batch(statements.slice(i, i + 50).map((s) => d1.prepare(s)));
}
const row = async (d1: D1Database, slug: string) =>
  (await d1.prepare(`SELECT target, xp_reward AS xp, zlotki_reward AS zlotki, description, (SELECT COUNT(*) FROM quest_steps s WHERE s.quest_id = quests.id) AS steps FROM quests WHERE slug = ?`).bind(slug).first()) as {
    target: number; xp: number; zlotki: number; description: string; steps: number;
  };

describe('Сюжетные квесты: обновление уже засеянной базы', () => {
  it('до релиза на проде 1–2 этапа и награда 50 / 30; после сида — 5 этапов, 100 / 60, новое описание; первые главы не тронуты', async () => {
    const { env } = await getEnv();
    const d1 = env.DB;
    const firstChapter: Record<string, string> = {};
    for (const q of STORY_QUESTS) {
      const before = STORY_TARGET_BEFORE[q.slug];
      expect([1, 2], q.slug).toContain(before);
      // Состояние «как на проде до этого релиза»: первые главы, старая награда и описание.
      await d1.prepare(`UPDATE quests SET target = ?, xp_reward = 50, zlotki_reward = 30, description = ? WHERE slug = ?`).bind(before, OLD_DESCRIPTION, q.slug).run();
      await d1.prepare(`DELETE FROM quest_steps WHERE quest_id = (SELECT id FROM quests WHERE slug = ?) AND "order" >= ?`).bind(q.slug, before).run();
      expect((await row(d1, q.slug)).steps, q.slug).toBe(before);
      firstChapter[q.slug] = JSON.stringify((await d1.prepare(`SELECT data FROM quest_steps WHERE quest_id = (SELECT id FROM quests WHERE slug = ?) AND "order" = 0`).bind(q.slug).first())!);
    }

    await apply(d1, questSql());

    for (const q of STORY_QUESTS) {
      const r = await row(d1, q.slug);
      expect(r.target, q.slug).toBe(5);
      expect(r.xp, q.slug).toBe(100);
      expect(r.zlotki, q.slug).toBe(60);
      expect(r.description, q.slug).not.toBe(OLD_DESCRIPTION);
      expect(r.description, q.slug).toContain(q.description.ru);
      expect(r.steps, `${q.slug}: добавлены главы`).toBe(5);
      const first = JSON.stringify((await d1.prepare(`SELECT data FROM quest_steps WHERE quest_id = (SELECT id FROM quests WHERE slug = ?) AND "order" = 0`).bind(q.slug).first())!);
      expect(first, `${q.slug}: первая глава не менялась`).toBe(firstChapter[q.slug]);
    }
  });

  it('повторный сид ничего не меняет, а правка из админки (другое число этапов) не перезаписывается', async () => {
    const { env } = await getEnv();
    const d1 = env.DB;
    const slug = 's-krakow-mieszkanie';
    const snapshot = JSON.stringify(await row(d1, slug));
    await apply(d1, questSql());
    expect(JSON.stringify(await row(d1, slug)), 'повтор').toBe(snapshot);

    await d1.prepare(`UPDATE quests SET target = 7, xp_reward = 120 WHERE slug = ?`).bind(slug).run();
    await apply(d1, questSql());
    const r = await row(d1, slug);
    expect(r.target).toBe(7);
    expect(r.xp).toBe(120);
  });
});
