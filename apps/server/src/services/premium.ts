import type { Tx } from '../db';
import { prisma } from '../db';

/** Активна підписка: оплачена і не прострочена (скасована діє до кінця періоду). */
export async function activeSubscription(userId: string, db: Tx = prisma) {
  return db.subscription.findFirst({
    where: { userId, status: { in: ['ACTIVE', 'CANCELLED'] }, expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: 'desc' },
  });
}

export async function isPremium(userId: string, db: Tx = prisma): Promise<boolean> {
  return !!(await activeSubscription(userId, db));
}
