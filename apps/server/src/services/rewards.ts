/**
 * Нарахування XP, Złotki та предметів. Кожна нагорода має ключ ідемпотентності:
 * повторний виклик з тим самим ключем нічого не нараховує.
 */
import { dayKey, levelFromXp, updateStreak, weekKey } from '@polski-go/shared';
import type { Tx } from '../db';

export function leagueFor(xpTotal: number): string {
  if (xpTotal >= 5000) return 'diamond';
  if (xpTotal >= 2000) return 'gold';
  if (xpTotal >= 500) return 'silver';
  return 'bronze';
}

export async function userTimezone(tx: Tx, userId: string): Promise<string> {
  const s = await tx.userSettings.findUnique({ where: { userId }, select: { timezone: true } });
  return s?.timezone ?? 'Europe/Warsaw';
}

export type XpGrant = { granted: number; levelBefore: number; levelAfter: number };

export async function grantXp(tx: Tx, userId: string, amount: number, reason: string, key: string, now = new Date()): Promise<XpGrant> {
  const progress = await tx.playerProgress.findUniqueOrThrow({ where: { userId } });
  const levelBefore = progress.playerLevel;
  if (amount <= 0) return { granted: 0, levelBefore, levelAfter: levelBefore };
  const tz = await userTimezone(tx, userId);
  const day = dayKey(now, tz);
  const week = weekKey(day);
  const { count } = await tx.xpEvent.createMany({
    data: [{ userId, amount, reason, idempotencyKey: key, day, week }],
    skipDuplicates: true,
  });
  if (count === 0) return { granted: 0, levelBefore, levelAfter: levelBefore };
  const xpTotal = progress.xpTotal + amount;
  const levelAfter = levelFromXp(xpTotal).level;
  await tx.playerProgress.update({ where: { userId }, data: { xpTotal, playerLevel: levelAfter } });
  await tx.dailyActivity.upsert({
    where: { userId_day: { userId, day } },
    create: { userId, day, xp: amount },
    update: { xp: { increment: amount } },
  });
  await tx.leaderboardEntry.upsert({
    where: { userId_periodKey: { userId, periodKey: week } },
    create: { userId, periodKey: week, xp: amount, league: leagueFor(xpTotal) },
    update: { xp: { increment: amount }, league: leagueFor(xpTotal) },
  });
  return { granted: amount, levelBefore, levelAfter };
}

export async function grantZlotki(tx: Tx, userId: string, amount: number, reason: string, key: string): Promise<number> {
  if (amount === 0) return 0;
  const { count } = await tx.walletTransaction.createMany({
    data: [{ userId, amount, reason, idempotencyKey: key }],
    skipDuplicates: true,
  });
  if (count === 0) return 0;
  await tx.gameWallet.upsert({
    where: { userId },
    create: { userId, balance: Math.max(0, amount) },
    update: { balance: { increment: amount } },
  });
  return amount;
}

/** Видати предмет (якщо ще немає). Повертає true, якщо предмет новий. */
export async function grantItem(tx: Tx, userId: string, itemId: string, source: string): Promise<boolean> {
  const { count } = await tx.userInventory.createMany({ data: [{ userId, itemId, source }], skipDuplicates: true });
  return count > 0;
}

/** Відмітити активність дня: серія та агрегати. */
export async function touchActivity(
  tx: Tx,
  userId: string,
  inc: Partial<{ lessons: number; exercises: number; correct: number; newWords: number; reviews: number; seconds: number; practiceXp: number }>,
  now = new Date(),
) {
  const tz = await userTimezone(tx, userId);
  const day = dayKey(now, tz);
  const data = Object.fromEntries(Object.entries(inc).map(([k, v]) => [k, { increment: v ?? 0 }]));
  await tx.dailyActivity.upsert({ where: { userId_day: { userId, day } }, create: { userId, day, ...inc }, update: data });
  const p = await tx.playerProgress.findUniqueOrThrow({ where: { userId } });
  const s = updateStreak({ current: p.streakCurrent, best: p.streakBest, lastDay: p.lastActiveDay }, day);
  if (s.changed) {
    await tx.playerProgress.update({ where: { userId }, data: { streakCurrent: s.current, streakBest: s.best, lastActiveDay: day } });
  }
  return { day, streak: s.current, streakChanged: s.changed };
}
