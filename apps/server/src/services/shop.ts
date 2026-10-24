/** Магазин косметики за Złotki та гардероб/домик бобра. */
import { prisma } from '../db';
import { badRequest, forbidden, notFound } from '../lib/errors';
import { evaluateAchievements } from './achievements';
import { isPremium } from './premium';

/** Слоти, де одночасно може бути вдягнений лише один предмет. */
const EXCLUSIVE = new Set(['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'COSTUME', 'FRAME']);

export async function listShop(userId: string) {
  const [items, inv, wallet, premium] = await Promise.all([
    prisma.cosmeticItem.findMany({ where: { isActive: true }, orderBy: [{ slot: 'asc' }, { order: 'asc' }], include: { city: { select: { slug: true, name: true } } } }),
    prisma.userInventory.findMany({ where: { userId } }),
    prisma.gameWallet.findUnique({ where: { userId } }),
    isPremium(userId),
  ]);
  const owned = new Map(inv.map((i) => [i.itemId, i]));
  return {
    balance: wallet?.balance ?? 0,
    premium,
    items: items.map((i) => ({
      id: i.id,
      slug: i.slug,
      slot: i.slot,
      name: i.name,
      assetKey: i.assetKey,
      price: i.price,
      rarity: i.rarity,
      isPremium: i.isPremium,
      rewardOnly: i.rewardOnly,
      city: i.city,
      owned: owned.has(i.id),
      equipped: owned.get(i.id)?.equipped ?? false,
    })),
  };
}

export async function buyItem(userId: string, itemId: string) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.cosmeticItem.findUnique({ where: { id: itemId } });
    if (!item || !item.isActive) throw notFound('item_not_found');
    if (item.rewardOnly) throw badRequest('reward_only', 'Цей предмет можна лише заробити');
    if (item.isPremium && !(await isPremium(userId, tx))) throw forbidden('premium_required');
    const have = await tx.userInventory.findUnique({ where: { userId_itemId: { userId, itemId } } });
    if (have) throw badRequest('already_owned');
    // Атомарне списання: не дозволяє піти в мінус навіть при паралельних запитах.
    const spent = await tx.gameWallet.updateMany({ where: { userId, balance: { gte: item.price } }, data: { balance: { decrement: item.price } } });
    if (spent.count === 0) throw badRequest('insufficient_funds', 'Недостатньо Złotki');
    await tx.walletTransaction.create({ data: { userId, amount: -item.price, reason: `buy:${item.slug}`, idempotencyKey: `buy:${userId}:${itemId}` } });
    await tx.userInventory.create({ data: { userId, itemId, source: 'shop' } });
    const achievements = await evaluateAchievements(tx, userId);
    const wallet = await tx.gameWallet.findUniqueOrThrow({ where: { userId } });
    return { balance: wallet.balance, achievements };
  });
}

export async function equipItem(userId: string, itemId: string, equipped: boolean) {
  return prisma.$transaction(async (tx) => {
    const inv = await tx.userInventory.findUnique({ where: { userId_itemId: { userId, itemId } }, include: { item: true } });
    if (!inv) throw forbidden('not_owned');
    if (equipped && EXCLUSIVE.has(inv.item.slot)) {
      await tx.userInventory.updateMany({ where: { userId, equipped: true, item: { slot: inv.item.slot } }, data: { equipped: false } });
    }
    await tx.userInventory.update({ where: { userId_itemId: { userId, itemId } }, data: { equipped } });
    return outfit(userId, tx);
  });
}

/** Вдягнені предмети: { HAT: 'cap-green', ... } та розставлені в домику. */
export async function outfit(userId: string, db: Pick<typeof prisma, 'userInventory'> = prisma) {
  const rows = await db.userInventory.findMany({ where: { userId, equipped: true }, include: { item: true } });
  const wear: Record<string, string> = {};
  const house: string[] = [];
  for (const r of rows) {
    if (EXCLUSIVE.has(r.item.slot)) wear[r.item.slot] = r.item.assetKey;
    else house.push(r.item.assetKey);
  }
  return { wear, house };
}
