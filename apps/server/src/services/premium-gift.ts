/**
 * Подарунок Premium раз на місяць (місяць — за поясом учня): Złotki й ексклюзивна річ гардероба Premium, якої в учня ще немає
 * (коли всі такі речі вже є — лише Złotki). Видається один раз на місяць: ключ ідемпотентності `premium-gift:<user>:<YYYY-MM>`.
 */
import { and, asc, eq, inArray } from 'drizzle-orm';
import { atomic, db } from '../db';
import { cosmeticItems, userInventory, walletTransactions } from '../db/schema';
import { badRequest, forbidden } from '../lib/errors';
import { ctxFrom, ctxReads, dayCandidates, grantItem, grantZlotki } from './rewards';

export const PREMIUM_GIFT_ZLOTKI = 150;
export const giftKey = (userId: string, month: string) => `premium-gift:${userId}:${month}`;
const monthOf = (day: string) => day.slice(0, 7);

/** Ключі подарунка за всіма місяцями, якими може бути «зараз» у будь-якому поясі (для читання до того, як відомий пояс). */
export const giftKeys = (userId: string, now: Date) => [...new Set(dayCandidates(now).map(monthOf))].map((m) => giftKey(userId, m));

const giftReads = (userId: string, now: Date) =>
  [
    db.select({ key: walletTransactions.idempotencyKey }).from(walletTransactions).where(inArray(walletTransactions.idempotencyKey, giftKeys(userId, now))),
    db
      .select({ id: cosmeticItems.id, slug: cosmeticItems.slug, slot: cosmeticItems.slot, name: cosmeticItems.name })
      .from(cosmeticItems)
      .where(and(eq(cosmeticItems.isPremium, true), eq(cosmeticItems.isActive, true)))
      .orderBy(asc(cosmeticItems.order)),
    db.select({ itemId: userInventory.itemId }).from(userInventory).where(eq(userInventory.userId, userId)),
  ] as const;

async function load(userId: string) {
  const now = new Date();
  const [settings, progress, sub, claimed, items, owned] = await db.batch([...ctxReads(userId, now), ...giftReads(userId, now)]);
  const ctx = ctxFrom(userId, now, settings, progress, sub);
  const month = monthOf(ctx.day);
  const done = claimed.some((c) => c.key === giftKey(userId, month));
  const have = new Set(owned.map((o) => o.itemId));
  const item = items.find((i) => !have.has(i.id)) ?? null;
  return { ctx, gift: { month, ready: ctx.premium && !done, claimed: done, zlotki: PREMIUM_GIFT_ZLOTKI, item } };
}

/** Стан подарунка цього місяця (без Premium — показується як те, що дає Premium). */
export async function premiumGift(userId: string) {
  return (await load(userId)).gift;
}

export async function claimPremiumGift(userId: string) {
  const { ctx, gift } = await load(userId);
  if (!ctx.premium) throw forbidden('premium_required');
  if (gift.claimed) throw badRequest('already_claimed');
  const zl = grantZlotki(userId, PREMIUM_GIFT_ZLOTKI, 'premium-gift', giftKey(userId, gift.month), ctx.now);
  // Повторне натискання нічого не додає: Złotki — за ключем місяця, річ — унікальна в інвентарі.
  await atomic([...zl.stmts, gift.item && grantItem(userId, gift.item.id, 'premium-gift')]);
  return { zlotki: zl.granted, item: gift.item };
}
