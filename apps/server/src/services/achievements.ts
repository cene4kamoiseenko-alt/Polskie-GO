/** Досягнення: перевіряються після кожної події, що змінює метрики. */
import type { Tx } from '../db';
import { grantItem, grantZlotki } from './rewards';

export async function achievementMetrics(tx: Tx, userId: string): Promise<Record<string, number>> {
  const [p, cities, purchases, friends, stories] = await Promise.all([
    tx.playerProgress.findUniqueOrThrow({ where: { userId } }),
    tx.userCity.count({ where: { userId, bossPassedAt: { not: null } } }),
    tx.userInventory.count({ where: { userId, source: 'shop' } }),
    tx.friendship.count({ where: { status: 'ACCEPTED', OR: [{ requesterId: userId }, { addresseeId: userId }] } }),
    tx.userQuest.count({ where: { userId, periodKey: 'story', status: { in: ['COMPLETED', 'CLAIMED'] } } }),
  ]);
  return {
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
}

/** Видає нові досягнення та нагороди за них. Повертає щойно відкриті. */
export async function evaluateAchievements(tx: Tx, userId: string) {
  const [all, owned] = await Promise.all([
    tx.achievement.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    tx.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);
  const have = new Set(owned.map((o) => o.achievementId));
  const pending = all.filter((a) => !have.has(a.id));
  if (!pending.length) return [];
  const metrics = await achievementMetrics(tx, userId);
  const unlocked = [];
  for (const a of pending) {
    if ((metrics[a.metric] ?? 0) < a.threshold) continue;
    const { count } = await tx.userAchievement.createMany({ data: [{ userId, achievementId: a.id }], skipDuplicates: true });
    if (!count) continue;
    await grantZlotki(tx, userId, a.zlotkiReward, `achievement:${a.slug}`, `achievement:${userId}:${a.id}`);
    if (a.rewardItemId) await grantItem(tx, userId, a.rewardItemId, 'achievement');
    unlocked.push({ slug: a.slug, title: a.title, icon: a.icon, zlotki: a.zlotkiReward });
  }
  return unlocked;
}
