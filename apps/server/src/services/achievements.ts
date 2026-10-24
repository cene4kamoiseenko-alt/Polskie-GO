/** Досягнення: перевіряються після кожної події, що змінює метрики. */
import { and, asc, count, eq, inArray, isNotNull, or } from 'drizzle-orm';
import { db, type Stmt } from '../db';
import { achievements, friendships, userAchievements, userCities, userInventory, userQuests } from '../db/schema';
import { grantItem, grantZlotki, type Progress } from './rewards';

export type Metric = 'LESSONS' | 'STREAK' | 'WORDS' | 'XP' | 'PERFECT_LESSONS' | 'CITIES' | 'PURCHASES' | 'FRIENDS' | 'STORY_QUESTS';

const countsQueries = (userId: string) =>
  [
    db.select({ n: count() }).from(userCities).where(and(eq(userCities.userId, userId), isNotNull(userCities.bossPassedAt))),
    db.select({ n: count() }).from(userInventory).where(and(eq(userInventory.userId, userId), eq(userInventory.source, 'shop'))),
    db
      .select({ n: count() })
      .from(friendships)
      .where(and(eq(friendships.status, 'ACCEPTED'), or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)))),
    db
      .select({ n: count() })
      .from(userQuests)
      .where(and(eq(userQuests.userId, userId), eq(userQuests.periodKey, 'story'), inArray(userQuests.status, ['COMPLETED', 'CLAIMED']))),
  ] as const;

function toMetrics(p: Progress, counts: { n: number }[][], adjust: Partial<Record<Metric, number>>): Record<string, number> {
  const [cities, purchases, friends, stories] = counts.map((r) => r[0]?.n ?? 0);
  const m: Record<Metric, number> = {
    LESSONS: p.lessonsCompleted,
    STREAK: p.streakBest,
    WORDS: p.wordsLearned,
    XP: p.xpTotal,
    PERFECT_LESSONS: p.perfectLessons,
    CITIES: cities,
    PURCHASES: purchases,
    FRIENDS: friends,
    STORY_QUESTS: stories,
  };
  for (const [k, v] of Object.entries(adjust)) m[k as Metric] += v ?? 0;
  return m;
}

export async function achievementMetrics(userId: string, p: Progress) {
  const counts = await db.batch(countsQueries(userId));
  return toMetrics(p, counts as unknown as { n: number }[][], {});
}

/**
 * Нові досягнення та нагороди за них.
 * `p` — прогрес з урахуванням змін поточного запиту; `adjust` — зміни лічильників, ще не записані в БД.
 */
export async function evaluateAchievements(userId: string, p: Progress, adjust: Partial<Record<Metric, number>> = {}) {
  const [all, owned, ...counts] = await db.batch([
    db.select().from(achievements).where(eq(achievements.isActive, true)).orderBy(asc(achievements.order)),
    db.select({ achievementId: userAchievements.achievementId }).from(userAchievements).where(eq(userAchievements.userId, userId)),
    ...countsQueries(userId),
  ]);
  const have = new Set(owned.map((o) => o.achievementId));
  const pending = all.filter((a) => !have.has(a.id));
  const stmts: Stmt[] = [];
  const unlocked: { slug: string; title: unknown; icon: string; zlotki: number }[] = [];
  if (!pending.length) return { unlocked, stmts };
  const metrics = toMetrics(p, counts as unknown as { n: number }[][], adjust);
  for (const a of pending) {
    if ((metrics[a.metric] ?? 0) < a.threshold) continue;
    stmts.push(db.insert(userAchievements).values({ userId, achievementId: a.id }).onConflictDoNothing());
    stmts.push(...grantZlotki(userId, a.zlotkiReward, `achievement:${a.slug}`, `achievement:${userId}:${a.id}`).stmts);
    if (a.rewardItemId) stmts.push(grantItem(userId, a.rewardItemId, 'achievement'));
    unlocked.push({ slug: a.slug, title: a.title, icon: a.icon, zlotki: a.zlotkiReward });
  }
  return { unlocked, stmts };
}
