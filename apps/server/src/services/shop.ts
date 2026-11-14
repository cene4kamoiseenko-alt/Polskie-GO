/** Магазин косметики за Złotki та гардероб/домик бобра. */
import { and, asc, eq, inArray, isNotNull, ne, or, sql } from 'drizzle-orm';
import { LOOK_MANIFEST, canPurchase, equip, findLookItem, type I18n, type LookPurchaseVerdict } from '@polski-go/shared';
import { atomic, db, isUniqueViolation, type Stmt } from '../db';
import { achievements, cities, cosmeticItems, gameWallets, playerProgress, quests, userInventory } from '../db/schema';
import { MISSIONS } from '../content/missions';
import { OUTFIT_BY_SLUG, OUTFIT_COMPONENTS, RETIRED_LOOKS, type Outfit } from '../content/outfits';
import { HttpError, badRequest, forbidden, notFound } from '../lib/errors';
import { evaluateAchievements } from './achievements';
import { isPremium } from './premium';
import { spendZlotki } from './rewards';

/** Житло домика: один обраний фон кімнати. Безкоштовна кімната (ціна 0) обрана за замовчуванням і належить усім без запису в інвентарі. */
const HOUSING_SLOT = 'HOUSING';
const DEFAULT_HOUSING = 'housing-opole';

/**
 * Готові образи (content/outfits.ts, docs/OUTFITS.md): предмет слота OUTFIT — це набір речей. Сам рядок OUTFIT ніколи не «вдягнений»:
 * образ вдягнено, коли вдягнені речі збігаються з набором. Надягання образу знімає весь одяг.
 */
const OUTFIT_SLOT = 'OUTFIT';
const LOOK_WEAR: ('HAT' | 'GLASSES' | 'SCARF' | 'JACKET' | 'BACKPACK' | 'SHOES' | 'ACCESSORY' | 'COSTUME')[] = ['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'COSTUME'];
/** Фірмове худі резолвер малює сам, коли куртки немає: на збіг образу воно не впливає. */
const DEFAULT_TOP = 'hoodie-red';

type OwnedRow = { source: string };
/**
 * Образ свій: стартовий, куплений (рядок OUTFIT) або всі речі набору отримані НЕ через образи — куплені раніше поштучно чи як нагорода.
 * Так колишні покупки не пропадають, а речі з дешевих образів не складаються в дорогий.
 */
function outfitOwned(o: Outfit, hasOutfitRow: boolean, rowBySlug: (slug: string) => OwnedRow | undefined): boolean {
  if (o.starter || hasOutfitRow) return true;
  return o.items.every((slug) => {
    const r = rowBySlug(slug);
    return !!r && r.source !== 'outfit';
  });
}
/** Образ вдягнено: вдягнені речі образу (без худі) — рівно набір. */
function outfitWorn(o: Outfit, worn: ReadonlySet<string>): boolean {
  return o.items.length === worn.size && o.items.every((slug) => worn.has(slug));
}

/** Слоти, де одночасно може бути вдягнений лише один предмет. */
const EXCLUSIVE = new Set(['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'COSTUME']);
/** Слоты убранных из игры предметов (рамки профиля, 2026-11-14): строки в БД остались, но в образ игрока и в домик не попадают. */
const RETIRED_SLOTS = new Set(['FRAME']);

/**
 * Живописний стан предмета для магазину (ADR-005 §8, §12). Купити за Złotki можна лише
 * `ready`, `prerendered`, `legacy-whole-look` і `not-wearable` (домик); `pending` і `unknown` — «скоро».
 * `unknown` — одяг, якого немає в маніфесті образу або з іншим слотом: показати його нічим.
 */
export type ShopVisualStatus = 'ready' | 'prerendered' | 'legacy-whole-look' | 'not-wearable' | 'pending' | 'unknown';

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
  const bySlug = new Map(items.map(({ item }) => [item.slug, item]));
  const rowBySlug = (slug: string) => {
    const id = bySlug.get(slug)?.id;
    return id ? owned.get(id) : undefined;
  };
  const worn = new Set(items.filter(({ item }) => (LOOK_WEAR as string[]).includes(item.slot) && item.slug !== DEFAULT_TOP && owned.get(item.id)?.equipped).map(({ item }) => item.slug));
  // Житло: безкоштовна кімната є в усіх; обране — те, що позначено в інвентарі, інакше кімната за замовчуванням.
  const housing = items.filter(({ item }) => item.slot === HOUSING_SLOT);
  const pickedHousing = housing.find(({ item }) => owned.get(item.id)?.equipped)?.item.slug ?? DEFAULT_HOUSING;
  const isFreeHousing = (i: { slot: string; price: number }) => i.slot === HOUSING_SLOT && i.price === 0;
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
  /** Образ: свій / вдягнений і з чого складається (`wear` — як `outfit.wear` профілю: слот каталогу → asset_key; для примірки на клієнті). */
  const outfitView = (slug: string) => {
    const o = OUTFIT_BY_SLUG.get(slug);
    const row = bySlug.get(slug);
    if (!o || !row) return { owned: false, equipped: false, visualStatus: 'unknown' as ShopVisualStatus, outfit: null };
    const wear: Record<string, string> = {};
    for (const c of o.items) {
      const it = bySlug.get(c);
      if (it) wear[it.slot] = it.assetKey;
    }
    return {
      owned: outfitOwned(o, owned.has(row.id), rowBySlug),
      equipped: outfitWorn(o, worn),
      visualStatus: 'prerendered' as ShopVisualStatus,
      outfit: { wear, hoodie: o.hoodie, starter: !!o.starter, items: [...o.items] },
    };
  };
  return {
    balance: wallet[0]?.balance ?? 0,
    premium,
    // Снятые с продажи повторы показываются только тем, у кого они уже есть.
    items: items.filter(({ item }) => !RETIRED_LOOKS.has(item.slug) || owned.has(item.id)).map(({ item: i, citySlug, cityName }) => ({
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
      ...(i.slot === OUTFIT_SLOT ? outfitView(i.slug) : {
        owned: owned.has(i.id) || isFreeHousing(i),
        equipped: i.slot === HOUSING_SLOT ? i.slug === pickedHousing : owned.get(i.id)?.equipped ?? false,
        visualStatus: shopVisualStatus(lookVerdict(i)),
        outfit: null,
      }),
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
  if (RETIRED_LOOKS.has(item.slug)) throw new HttpError(409, 'retired', 'Этот образ снят с продажи. Złotki не списано');
  if (item.slot === OUTFIT_SLOT) return buyOutfit(userId, item, progress[0] ?? null);
  // Речі наборів продаються лише в складі готових образів (2026-11-02): поштучно набір склався б дешевше за образ.
  if (item.slot !== 'COSTUME' && OUTFIT_COMPONENTS.has(item.slug)) throw new HttpError(409, 'outfit_only', 'Ця річ продається лише в готовому образі. Złotki не списано');
  // Безкоштовне житло не купується: воно вже є в усіх (обрати його можна через equip).
  if (item.slot === HOUSING_SLOT && item.price === 0) throw badRequest('already_owned');
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

/** Речі користувача з slug, слотом і походженням (для образів). */
async function inventoryRows(userId: string) {
  return db
    .select({ itemId: userInventory.itemId, source: userInventory.source, equipped: userInventory.equipped, slug: cosmeticItems.slug, slot: cosmeticItems.slot })
    .from(userInventory)
    .innerJoin(cosmeticItems, eq(cosmeticItems.id, userInventory.itemId))
    .where(eq(userInventory.userId, userId));
}

/** Купівля готового образу: ціна образу одним списанням, рядок OUTFIT і речі набору, яких ще немає (`source: 'outfit'`) — в одному пакеті D1. */
async function buyOutfit(userId: string, item: typeof cosmeticItems.$inferSelect, progress: typeof playerProgress.$inferSelect | null) {
  const o = OUTFIT_BY_SLUG.get(item.slug);
  if (!o) throw notFound('item_not_found');
  const [rows, parts] = await Promise.all([inventoryRows(userId), db.select({ id: cosmeticItems.id, slug: cosmeticItems.slug }).from(cosmeticItems).where(inArray(cosmeticItems.slug, [...o.items]))]);
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  if (outfitOwned(o, false, (slug) => bySlug.get(slug))) throw badRequest('already_owned');
  if (parts.length !== o.items.length) throw new HttpError(409, 'visual_pending', 'Образ ще готується. Złotki не списано');
  if (item.isPremium && !(await isPremium(userId))) throw forbidden('premium_required');
  const ach = await evaluateAchievements(userId, progress, { PURCHASES: 1 });
  try {
    await atomic([
      ...spendZlotki(userId, item.price, `buy:${item.slug}`, `buy:${userId}:${item.id}`),
      db.insert(userInventory).values({ userId, itemId: item.id, source: 'shop' }),
      ...parts.filter((p) => !bySlug.has(p.slug)).map((p) => db.insert(userInventory).values({ userId, itemId: p.id, source: 'outfit' }).onConflictDoNothing()),
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
 * Надягання готового образу: знімається весь одяг (костюм теж), вдягаються рівно речі набору.
 * «Зняти» образ = повернутися до стартового «Podróżnik». Речі набору для купленого чи стартового образу дописуються, якщо їх раптом немає.
 */
async function equipOutfit(userId: string, item: { id: string; slug: string }, equipped: boolean) {
  const target = equipped ? OUTFIT_BY_SLUG.get(item.slug) : [...OUTFIT_BY_SLUG.values()].find((x) => x.starter);
  if (!target) throw notFound('item_not_found');
  const [rows, parts] = await Promise.all([inventoryRows(userId), db.select({ id: cosmeticItems.id, slug: cosmeticItems.slug }).from(cosmeticItems).where(inArray(cosmeticItems.slug, [...target.items]))]);
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const hasRow = rows.some((r) => r.slot === OUTFIT_SLOT && r.slug === target.slug);
  if (!outfitOwned(target, hasRow, (slug) => bySlug.get(slug))) throw forbidden('not_owned');
  const wearIds = db.select({ id: cosmeticItems.id }).from(cosmeticItems).where(inArray(cosmeticItems.slot, LOOK_WEAR));
  await atomic([
    ...parts.filter((p) => !bySlug.has(p.slug)).map((p) => db.insert(userInventory).values({ userId, itemId: p.id, source: target.starter ? 'starter' : 'outfit' }).onConflictDoNothing()),
    db.update(userInventory).set({ equipped: false }).where(and(eq(userInventory.userId, userId), eq(userInventory.equipped, true), inArray(userInventory.itemId, wearIds))),
    ...(parts.length ? [db.update(userInventory).set({ equipped: true }).where(and(eq(userInventory.userId, userId), inArray(userInventory.itemId, parts.map((p) => p.id))))] : []),
  ]);
  return outfit(userId);
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
  // Безкоштовне житло належить усім: при першому виборі записуємо його в інвентар, далі все працює як із купленим.
  const free = await db.select({ slot: cosmeticItems.slot, slug: cosmeticItems.slug, price: cosmeticItems.price, active: cosmeticItems.isActive }).from(cosmeticItems).where(eq(cosmeticItems.id, itemId)).get();
  if (free && free.active && free.slot === OUTFIT_SLOT) return equipOutfit(userId, { id: itemId, slug: free.slug }, equipped);
  if (free && free.active && free.slot === HOUSING_SLOT && free.price === 0) await db.insert(userInventory).values({ userId, itemId, source: 'free' }).onConflictDoNothing();
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
  // Житло: одне обране. Інші вдягнені в цьому слоті знімаються тим самим пакетом.
  if (equipped && inv.slot === HOUSING_SLOT) {
    const housingIds = db.select({ id: cosmeticItems.id }).from(cosmeticItems).where(eq(cosmeticItems.slot, HOUSING_SLOT));
    stmts.push(
      db
        .update(userInventory)
        .set({ equipped: false })
        .where(and(eq(userInventory.userId, userId), eq(userInventory.equipped, true), ne(userInventory.itemId, itemId), inArray(userInventory.itemId, housingIds))),
    );
  }
  stmts.push(db.update(userInventory).set({ equipped }).where(and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId))));
  await atomic(stmts);
  return outfit(userId);
}

/** Вдягнені предмети: { HAT: 'cap-green', ... }, розставлені в домику речі та обране житло (`home`, за замовчуванням безкоштовна кімната). */
export async function outfit(userId: string) {
  const rows = await db
    .select({ slot: cosmeticItems.slot, assetKey: cosmeticItems.assetKey })
    .from(userInventory)
    .innerJoin(cosmeticItems, eq(cosmeticItems.id, userInventory.itemId))
    .where(and(eq(userInventory.userId, userId), eq(userInventory.equipped, true)));
  const wear: Record<string, string> = {};
  const house: string[] = [];
  let home = DEFAULT_HOUSING;
  for (const r of rows) {
    if (RETIRED_SLOTS.has(r.slot)) continue;
    if (r.slot === HOUSING_SLOT) home = r.assetKey;
    else if (EXCLUSIVE.has(r.slot)) wear[r.slot] = r.assetKey;
    else house.push(r.assetKey);
  }
  return { wear, house, home };
}
