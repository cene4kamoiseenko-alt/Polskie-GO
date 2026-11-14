/**
 * «Mistrz wymowy» убрано (2026-11-14): проверки речи в приложении отключены, фразы больше не «распознаются правильно».
 * Каталог не содержит достижения; на проде строка остаётся в БД выключенной, поэтому галерея и подсчёт его не знают,
 * а полученные Złotki и запись о получении не трогаются.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { eq, sql as dsql } from 'drizzle-orm';
import { db } from '../src/db';
import { achievements, userAchievements } from '../src/db/schema';
import { ACHIEVEMENTS } from '../src/content/gamification';
import { RETIRED_ACHIEVEMENT_SLUGS, retireAchievementsSql } from '../src/content/seed';
import { disposeEnv, login } from './helpers';

afterAll(disposeEnv);

describe('достижение «Mistrz wymowy» снято', () => {
  it('в каталоге нет достижений по заданиям на вымову', () => {
    expect(ACHIEVEMENTS.map((a) => a.slug)).not.toContain('mistrz-wymowy');
    expect(ACHIEVEMENTS.filter((a) => a.metric.includes('PRONUNCIATION'))).toEqual([]);
    expect([...RETIRED_ACHIEVEMENT_SLUGS]).toEqual(['mistrz-wymowy']);
  });

  it('прод: строка выключается один раз, галерея его не показывает, запись о получении остаётся', async () => {
    const { call, user } = await login();
    // Как на проде до правки: достижение есть и включено, игрок получил его под старой проверкой.
    await db
      .insert(achievements)
      .values({ id: 'a_mistrz-wymowy', slug: 'mistrz-wymowy', title: { uk: 'Mistrz wymowy' }, description: { uk: 'старе' }, icon: 'headphones', metric: 'TYPE_OK:PRONUNCIATION', threshold: 15, zlotkiReward: 50, order: 9999 })
      .onConflictDoNothing();
    await db.insert(userAchievements).values({ userId: user.id, achievementId: 'a_mistrz-wymowy' }).onConflictDoNothing();
    const slugs = async () => ((await call('GET', '/api/achievements')).body as { slug: string }[]).map((a) => a.slug);
    expect(await slugs()).toContain('mistrz-wymowy');

    for (const s of retireAchievementsSql()) await db.run(dsql.raw(s));
    expect(await slugs()).not.toContain('mistrz-wymowy');
    expect((await db.select().from(achievements).where(eq(achievements.slug, 'mistrz-wymowy')))[0].isActive).toBe(false);
    expect(await db.select().from(userAchievements).where(eq(userAchievements.achievementId, 'a_mistrz-wymowy'))).toHaveLength(1);

    // Повторный seed ничего не меняет.
    for (const s of retireAchievementsSql()) await db.run(dsql.raw(s));
    expect((await db.select().from(achievements).where(eq(achievements.slug, 'mistrz-wymowy')))[0].isActive).toBe(false);
  });
});
