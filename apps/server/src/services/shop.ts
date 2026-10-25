/** Магазин косметики за Złotki та гардероб/домик бобра. */
import { and, asc, eq, inArray, isNotNull } from 'drizzle-orm';
import type { I18n } from '@polski-go/shared';
import { atomic, db, isUniqueViolation } from '../db';
import { achievements, cities, cosmeticItems, gameWallets, playerProgress, quests, userInventory } from '../db/schema';
import { MISSIONS } from '../content/missions';
import { badRequest, forbidden, notFound } from '../lib/errors';
import { evaluateAchievements } from './achievements';
import { isPremium } from './premium';
import { spendZlotki } from './rewards';

/** Слоти, де одночасно може бути вдягнений лише один предмет. */
const EXCLUSIVE = new Set(['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'COSTUME', 'FRAME']);

/** Як отримати предмет-нагороду: місія, іспит міста, досягнення або квест. */
export type Unlock = { kind: 'mission' | 'city' | 'achievement' | 'quest'; title: I18n; slug?: string };

export async function listShop(userId: string) {
  const [items, inv, wallet, achRows, questRows] = await Promise.all([
    db
      .select({ item: cosmeticItems, citySlug: cities.slug, cityName: cities.name })
      .from(cosmeticItems)
      .leftJoin(cities, eq(cities.id, cosmeticItems.cityId))
      .where(eq(cosmeticItems.isActive, true))
      .orderBy(asc(cosmeticItems.slot), asc(cosmeticItems.order)),
    db.select().from(userInventory).where(eq(userInventory.userId, userId)),
    db.select().from(gameWallets).where(eq(gameWallets.userId, userId)),
    db.select({ itemId: achievements.rewardItemId, title: achievements.title }).from(achievements).where(and(isNotNull(achievements.rewardItemId), eq(achievements.isActive, true))),
    db.select({ itemId: quests.rewardItemId, title: quests.title }).from(quests).where(and(isNotNull(quests.rewardItemId), eq(quests.status, 'PUBLISHED'))),
  ]);
  const premium = await isPremium(userId);
  const owned = new Map(inv.map((i) => [i.itemId, i]));
  const unlockOf = (itemId: string, slug: string, city: { name: I18n | null } | null): Unlock | null => {
    const m = MISSIONS.find((x) => x.rewardItem === slug);
    if (m) return { kind: 'mission', title: m.title, slug: m.slug };
    const a = achRows.find((x) => x.itemId === itemId);
    if (a) return { kind: 'achievement', title: a.title };
    const q = questRows.find((x) => x.itemId === itemId);
    if (q) return { kind: 'quest', title: q.title };
    if (city?.name) return { kind: 'city', title: city.name };
    return null;
  };
  return {
    balance: wallet[0]?.balance ?? 0,
    premium,
    items: items.map(({ item: i, citySlug, cityName }) => ({
      id: i.id,
      slug: i.slug,
      slot: i.slot,
      name: i.name,
      assetKey: i.assetKey,
      price: i.price,
      rarity: i.rarity,
      isPremium: i.isPremium,
      rewardOnly: i.rewardOnly,
      city: citySlug ? { slug: citySlug, name: cityName } : null,
      unlock: i.rewardOnly ? unlockOf(i.id, i.slug, citySlug ? { name: cityName } : null) : null,
      owned: owned.has(i.id),
      equipped: owned.get(i.id)?.equipped ?? false,
    })),
  };
}

export async function buyItem(userId: string, itemId: string) {
  const [itemRow, have, progress] = await db.batch([
    db.select().from(cosmeticItems).where(eq(cosmeticItems.id, itemId)),
    db.select().from(userInventory).where(and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId))),
    db.select().from(playerProgress).where(eq(playerProgress.userId, userId)),
  ]);
  const item = itemRow[0];
  if (!item || !item.isActive) throw notFound('item_not_found');
  if (item.rewardOnly) throw badRequest('reward_only', 'Цей предмет можна лише заробити');
  if (item.isPremium && !(await isPremium(userId))) throw forbidden('premium_required');
  if (have.length) throw badRequest('already_owned');
  const ach = await evaluateAchievements(userId, progress[0], { PURCHASES: 1 });
  try {
    // Списання й видача в одному пакеті: CHECK balance >= 0 і унікальний ключ покупки відкотять усе разом.
    await atomic([
      ...spendZlotki(userId, item.price, `buy:${item.slug}`, `buy:${userId}:${itemId}`),
      db.insert(userInventory).values({ userId, itemId, source: 'shop' }),
      ...ach.stmts,
    ]);
  } catch (e) {
    if (isUniqueViolation(e)) throw badRequest('already_owned');
    throw e;
  }
  const wallet = await db.query.gameWallets.findFirst({ where: eq(gameWallets.userId, userId) });
  return { balance: wallet?.balance ?? 0, achievements: ach.unlocked };
}

export async function equipItem(userId: string, itemId: string, equipped: boolean) {
  const inv = await db
    .select({ inv: userInventory, slot: cosmeticItems.slot })
    .from(userInventory)
    .innerJoin(cosmeticItems, eq(cosmeticItems.id, userInventory.itemId))
    .where(and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId)))
    .get();
  if (!inv) throw forbidden('not_owned');
  const stmts = [];
  if (equipped && EXCLUSIVE.has(inv.slot)) {
    const sameSlot = db.select({ id: cosmeticItems.id }).from(cosmeticItems).where(eq(cosmeticItems.slot, inv.slot));
    stmts.push(db.update(userInventory).set({ equipped: false }).where(and(eq(userInventory.userId, userId), eq(userInventory.equipped, true), inArray(userInventory.itemId, sameSlot))));
  }
  stmts.push(db.update(userInventory).set({ equipped }).where(and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId))));
  await atomic(stmts);
  return outfit(userId);
}

/** Вдягнені предмети: { HAT: 'cap-green', ... } та розставлені в домику. */
export async function outfit(userId: string) {
  const rows = await db
    .select({ slot: cosmeticItems.slot, assetKey: cosmeticItems.assetKey })
    .from(userInventory)
    .innerJoin(cosmeticItems, eq(cosmeticItems.id, userInventory.itemId))
    .where(and(eq(userInventory.userId, userId), eq(userInventory.equipped, true)));
  const wear: Record<string, string> = {};
  const house: string[] = [];
  for (const r of rows) {
    if (EXCLUSIVE.has(r.slot)) wear[r.slot] = r.assetKey;
    else house.push(r.assetKey);
  }
  return { wear, house };
}
