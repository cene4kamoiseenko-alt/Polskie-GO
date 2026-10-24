import { and, desc, eq, gt, inArray } from 'drizzle-orm';
import { db } from '../db';
import { subscriptions } from '../db/schema';

/** Умова «активна підписка»: оплачена і не прострочена (скасована діє до кінця періоду). */
export const activeSubWhere = (userId: string, now = new Date()) =>
  and(eq(subscriptions.userId, userId), inArray(subscriptions.status, ['ACTIVE', 'CANCELLED']), gt(subscriptions.expiresAt, now));

export async function activeSubscription(userId: string) {
  return (await db.query.subscriptions.findFirst({ where: activeSubWhere(userId), orderBy: desc(subscriptions.expiresAt) })) ?? null;
}

export async function isPremium(userId: string): Promise<boolean> {
  return !!(await activeSubscription(userId));
}
