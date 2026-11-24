/**
 * Подарок за возвращение (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 4; решение владельца 2026-11-24 — 50 злотков):
 * после 7+ дней без занятий, не чаще раза в 30 дней. Экран «С возвращением» в приложении показывает его при первом входе после паузы.
 */
import { and, eq, gt } from 'drizzle-orm';
import { dayDiff, dayKey } from '@polski-go/shared';
import { atomic, db } from '../db';
import { playerProgress, userFlags, userSettings, walletTransactions } from '../db/schema';
import { badRequest } from '../lib/errors';
import { grantZlotki } from './rewards';

export const COMEBACK_GIFT = 50;
export const COMEBACK_AFTER_DAYS = 7;
export const COMEBACK_COOLDOWN_DAYS = 30;
const REASON = 'comeback';

/** Подарок доступен: пауза 7+ дней и подарка не было 30 дней. */
export async function comebackOffer(userId: string, lastActiveDay: string | null, today: string, now: Date): Promise<{ gift: number } | null> {
  if (!lastActiveDay || dayDiff(lastActiveDay, today) < COMEBACK_AFTER_DAYS) return null;
  const recent = await db
    .select({ id: walletTransactions.id })
    .from(walletTransactions)
    .where(and(eq(walletTransactions.userId, userId), eq(walletTransactions.reason, REASON), gt(walletTransactions.createdAt, new Date(now.getTime() - COMEBACK_COOLDOWN_DAYS * 86_400_000))))
    .limit(1)
    .get();
  return recent ? null : { gift: COMEBACK_GIFT };
}

/** Забрать подарок. Два нажатия сразу (или два устройства): захват отметки дня — начисляет только первое. */
export async function claimComeback(userId: string, now = new Date()): Promise<{ granted: number }> {
  const [p, s] = await Promise.all([
    db.select({ lastActiveDay: playerProgress.lastActiveDay }).from(playerProgress).where(eq(playerProgress.userId, userId)).get(),
    db.select({ tz: userSettings.timezone }).from(userSettings).where(eq(userSettings.userId, userId)).get(),
  ]);
  const today = dayKey(now, s?.tz ?? 'Europe/Warsaw');
  if (!(await comebackOffer(userId, p?.lastActiveDay ?? null, today, now))) throw badRequest('comeback_unavailable');
  const claimed = await db.insert(userFlags).values({ userId, key: `comeback:${today}`, at: now }).onConflictDoNothing().returning({ key: userFlags.key });
  if (!claimed.length) return { granted: 0 };
  const g = grantZlotki(userId, COMEBACK_GIFT, REASON, `comeback:${userId}:${today}`, now);
  await atomic(g.stmts);
  return { granted: g.granted };
}

/** Отметка «тур по вкладкам пройден» (один раз на аккаунт). */
export async function markTourDone(userId: string, now = new Date()): Promise<void> {
  await db.insert(userFlags).values({ userId, key: 'tour', at: now }).onConflictDoNothing();
}
