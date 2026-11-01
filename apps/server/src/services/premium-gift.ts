/**
 * Подарунок Premium раз на місяць (місяць — за поясом учня): Złotki й ексклюзивна річ гардероба Premium, якої в учня ще немає
 * (коли всі такі речі вже є — лише Złotki). Видається один раз на місяць: ключ ідемпотентності `premium-gift:<user>:<YYYY-MM>`.
 * Лояльність: 3-й, 6-й і 12-й отриманий подарунок додають бонус (ключ `premium-loyalty:<user>:<n>`). Суми — з налаштувань нагород
 * (адмінка, `DEFAULT_REWARDS.premium*`). Приветственный бонус и бонус тарифа выдаёт оплата (services/payments.ts).
 */
import { and, asc, count, eq, inArray } from 'drizzle-orm';
import type { RewardConfig } from '@polski-go/shared';
import { atomic, db } from '../db';
import { cosmeticItems, userInventory, walletTransactions } from '../db/schema';
import { badRequest, forbidden } from '../lib/errors';
import { ctxFrom, ctxReads, dayCandidates, grantItem, grantZlotki } from './rewards';
import { getRewards } from './gameConfig';

/** Номера подарков (месяцев с Premium), на которых растёт награда. */
export const LOYALTY_STEPS = [3, 6, 12] as const;
export const loyaltyAmount = (cfg: RewardConfig, at: (typeof LOYALTY_STEPS)[number]) => (at === 3 ? cfg.premiumLoyalty3Zlotki : at === 6 ? cfg.premiumLoyalty6Zlotki : cfg.premiumLoyalty12Zlotki);
export const loyaltyKey = (userId: string, n: number) => `premium-loyalty:${userId}:${n}`;
export const welcomeKey = (userId: string) => `premium-welcome:${userId}`;
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
    db.select({ n: count() }).from(walletTransactions).where(and(eq(walletTransactions.userId, userId), eq(walletTransactions.reason, 'premium-gift'))),
  ] as const;

async function load(userId: string) {
  const now = new Date();
  const [[settings, progress, sub, claimed, items, owned, total], rewards] = await Promise.all([db.batch([...ctxReads(userId, now), ...giftReads(userId, now)]), getRewards()]);
  const ctx = ctxFrom(userId, now, settings, progress, sub);
  const month = monthOf(ctx.day);
  const done = claimed.some((c) => c.key === giftKey(userId, month));
  const have = new Set(owned.map((o) => o.itemId));
  const item = items.find((i) => !have.has(i.id)) ?? null;
  const received = total[0]?.n ?? 0;
  const loyalty = { claimed: received, steps: LOYALTY_STEPS.map((at) => ({ at, zlotki: loyaltyAmount(rewards, at), done: received >= at })) };
  return { ctx, rewards, received, gift: { month, ready: ctx.premium && !done, claimed: done, zlotki: rewards.premiumGiftZlotki, item, loyalty } };
}

/** Стан подарунка цього місяця (без Premium — показується як те, що дає Premium). */
export async function premiumGift(userId: string) {
  return (await load(userId)).gift;
}

export async function claimPremiumGift(userId: string) {
  const { ctx, gift, rewards, received } = await load(userId);
  if (!ctx.premium) throw forbidden('premium_required');
  if (gift.claimed) throw badRequest('already_claimed');
  const zl = grantZlotki(userId, rewards.premiumGiftZlotki, 'premium-gift', giftKey(userId, gift.month), ctx.now);
  // Этот подарок по счёту n-й: на 3-м, 6-м и 12-м добавляется бонус лояльности (один раз на номер).
  const n = received + 1;
  const step = LOYALTY_STEPS.find((at) => at === n);
  const bonus = step ? grantZlotki(userId, loyaltyAmount(rewards, step), 'premium-loyalty', loyaltyKey(userId, n), ctx.now) : { granted: 0, stmts: [] };
  // Повторне натискання нічого не додає: Złotki — за ключем місяця і номера, річ — унікальна в інвентарі.
  await atomic([...zl.stmts, ...bonus.stmts, gift.item && grantItem(userId, gift.item.id, 'premium-gift')]);
  return { zlotki: zl.granted, loyaltyBonus: bonus.granted, loyaltyAt: step ?? null, item: gift.item };
}

/** Бонусы за оплату для экрана Premium: приветственный (был ли получен) и бонус предоплаченных тарифов. */
export async function premiumBonuses(userId: string) {
  const [rewards, got] = await Promise.all([
    getRewards(),
    db.select({ k: walletTransactions.idempotencyKey }).from(walletTransactions).where(eq(walletTransactions.idempotencyKey, welcomeKey(userId))),
  ]);
  return { welcome: { zlotki: rewards.premiumWelcomeZlotki, received: got.length > 0 }, plan: { MONTH_3: rewards.premiumPlan3Zlotki, MONTH_12: rewards.premiumPlan12Zlotki } };
}
