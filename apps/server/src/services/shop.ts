/** Магазин косметики за Złotki та гардероб/домик бобра. */
import { and, asc, eq, inArray, isNotNull, ne, or, sql } from 'drizzle-orm';
import { LOOK_MANIFEST, canPurchase, equip, findLookItem, type I18n, type LookPurchaseVerdict } from '@polski-go/shared';
import { atomic, db, isUniqueViolation, type Stmt } from '../db';
import { achievements, cities, cosmeticItems, gameWallets, playerProgress, quests, userInventory } from '../db/schema';
import { MISSIONS } from '../content/missions';
import { HttpError, badRequest, forbidden, notFound } from '../lib/errors';
import { evaluateAchievements } from './achievements';
import { isPremium } from './premium';
import { spendZlotki } from './rewards';

/** Слоти, де одночасно може бути вдягнений лише один предмет. */
const EXCLUSIVE = new Set(['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'COSTUME', 'FRAME']);

/**
 * Живописний стан предмета для магазину (ADR-005 §8, §12). Купити за Złotki можна лише
 * `ready`, `legacy-whole-look` і `not-wearable` (домик); `pending` і `unknown` — «скоро».
 * `unknown` — одяг, якого немає в маніфесті образу або з іншим слотом: показати його нічим.
 */
export type ShopVisualStatus = 'ready' | 'legacy-whole-look' | 'not-wearable' | 'pending' | 'unknown';

/**
 * Вердикт ядра образу. Ідентичність предмета для образу — `asset_key`: саме його клієнт отримує
 * в `outfit.wear` і за ним резолвер малює Бобека (у seed `asset_key` = slug).
 */
const lookVerdict = (item: { assetKey: string; slot: string }): LookPurchaseVerdict => canPurchase({ id: item.assetKey, slot: item.slot });

function shopVisualStatus(v: LookPurchaseVerdict): ShopVisualStatus {
  if (v.ok) return v.status;
  return v.reason === 'visual-pending' ? 'pending' : 'unknown';
}

const LOOK_ITEM_IDS = LOOK_MANIFEST.items.map((i) => i.id);

/**
 * `asset_key` усіх предметів каталогу образу, які знімає надягання цього: `equip()` ядра над
 * усім маніфестом, тобто те саме правило, що й у примірці (`tryOn`). Невідомий маніфесту предмет — [].
 */
function evictedKeys(assetKey: string): string[] {
  const r = equip(LOOK_ITEM_IDS, assetKey);
  if (!r.item) return [];
  return [...new Set(r.evicted.flatMap((id) => [id, findLookItem(id)?.assetKey ?? id]))].sort();
}

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
      visualStatus: shopVisualStatus(lookVerdict(i)),
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
  if (have.length) throw badRequest('already_owned');
  // ADR-005 §12: не списуємо Złotki за річ, яку Бобек не може вдягнути (немає живописного зображення).
  // Перевірка до Premium: не можна вести купувати Premium заради речі, яку все одно не продамо.
  if (!lookVerdict(item).ok) throw new HttpError(409, 'visual_pending', 'Цю річ ще малюють — купити можна буде, щойно вона з’явиться. Złotki не списано');
  if (item.isPremium && !(await isPremium(userId))) throw forbidden('premium_required');
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

/**
 * Надіти або зняти предмет зі свого інвентарю (ADR-005 §12).
 *
 * Надягання одягу знімає все, що з ним конфліктує за правилом `equip()` ядра (костюм знімає куртку,
 * шапку й шарф, які він займає; рюкзак костюм не знімає ніколи), плюс старе правило «один предмет
 * на слот каталогу» — воно прибирає й предмети, невідомі маніфесту. Зняття стосується лише цього
 * предмета — як `unequip()` ядра (фірмове худі резолвер покаже сам, запис не потрібен).
 *
 * Конфлікти знімаються умовою всередині того самого пакета D1, а не за прочитаним раніше знімком:
 * D1 не має інтерактивних транзакцій, і два паралельні запити так не залишать надітими дві
 * несумісні речі. Предмети `pending` надягати можна: володіння чесне, Бобек їх просто не малює.
 */
export async function equipItem(userId: string, itemId: string, equipped: boolean) {
  const inv = await db
    .select({ slot: cosmeticItems.slot, assetKey: cosmeticItems.assetKey })
    .from(userInventory)
    .innerJoin(cosmeticItems, eq(cosmeticItems.id, userInventory.itemId))
    .where(and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId)))
    .get();
  if (!inv) throw forbidden('not_owned');
  const stmts: Stmt[] = [];
  if (equipped && EXCLUSIVE.has(inv.slot)) {
    const keys = evictedKeys(inv.assetKey);
    const sameSlot = eq(cosmeticItems.slot, inv.slot);
    // Один JSON-параметр замість IN (?, ?, …): D1 обмежує кількість параметрів запиту.
    const conflicting = db
      .select({ id: cosmeticItems.id })
      .from(cosmeticItems)
      .where(keys.length ? or(sameSlot, sql`${cosmeticItems.assetKey} IN (SELECT value FROM json_each(${JSON.stringify(keys)}))`) : sameSlot);
    stmts.push(
      db
        .update(userInventory)
        .set({ equipped: false })
        .where(and(eq(userInventory.userId, userId), eq(userInventory.equipped, true), ne(userInventory.itemId, itemId), inArray(userInventory.itemId, conflicting))),
    );
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
