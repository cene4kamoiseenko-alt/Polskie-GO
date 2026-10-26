/**
 * Магазин і гардероб за ядром образу (ADR-005 §12, етап M3):
 * - `buyItem` не списує Złotki за річ без живописного зображення (`canPurchase` → `visual-pending`);
 * - `equipItem` знімає конфлікти за `equip()` ядра в одному атомарному пакеті D1;
 * - уже куплені й нагородні `pending`-речі лишаються у власності й надягаються.
 */
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { and, count, eq, like } from 'drizzle-orm';
import { LOOK_MANIFEST, equip, equipmentFromWear, resolveLook, unequip } from '@polski-go/shared';
import { atomic, db } from '../src/db';
import { cosmeticItems, gameWallets, playerProgress, userAchievements, userInventory, walletTransactions } from '../src/db/schema';
import { evaluateAchievements } from '../src/services/achievements';
import { disposeEnv, getEnv, login } from './helpers';

afterAll(disposeEnv);
afterEach(() => vi.restoreAllMocks());

type Call = Awaited<ReturnType<typeof login>>['call'];
type Wear = Record<string, string>;

const itemId = (slug: string) => `i_${slug}`;
const balance = async (userId: string) => (await db.query.gameWallets.findFirst({ where: eq(gameWallets.userId, userId) }))!.balance;
const setBalance = (userId: string, b: number) => db.update(gameWallets).set({ balance: b }).where(eq(gameWallets.userId, userId));

/** Інвентар як є в БД: предмет, надітий, джерело (відсортовано). */
async function inventory(userId: string) {
  const rows = await db.select({ itemId: userInventory.itemId, equipped: userInventory.equipped, source: userInventory.source }).from(userInventory).where(eq(userInventory.userId, userId));
  return rows.sort((a, b) => (a.itemId < b.itemId ? -1 : 1));
}

/** Надіте в БД (asset_key, відсортовано) — разом із дублікатами слота, яких не видно у `outfit.wear`. */
async function equippedKeys(userId: string) {
  const rows = await db
    .select({ key: cosmeticItems.assetKey })
    .from(userInventory)
    .innerJoin(cosmeticItems, eq(cosmeticItems.id, userInventory.itemId))
    .where(and(eq(userInventory.userId, userId), eq(userInventory.equipped, true)));
  return rows.map((r) => r.key).sort();
}

/** Видати предмет напряму, як це робили покупки до M3 або нагороди (квест, місто, досягнення). */
const grant = (userId: string, slug: string, opts: { equipped?: boolean; source?: string } = {}) =>
  db.insert(userInventory).values({ userId, itemId: itemId(slug), equipped: opts.equipped ?? false, source: opts.source ?? 'shop' });

const wearOf = async (call: Call) => (await call('GET', '/api/outfit')).body.wear as Wear;
const putOn = (call: Call, slug: string, equipped = true) => call('POST', '/api/inventory/equip', { itemId: itemId(slug), equipped });

const txCount = async (userId: string, reasonPrefix = '') =>
  (await db.select({ n: count() }).from(walletTransactions).where(and(eq(walletTransactions.userId, userId), like(walletTransactions.reason, `${reasonPrefix}%`))))[0].n;
const achCount = async (userId: string) => (await db.select({ n: count() }).from(userAchievements).where(eq(userAchievements.userId, userId)))[0].n;

/** Конфлікти, які резолвер бачить у списку надітого (переможений позначається `slot-conflict`). */
const slotConflicts = (list: string[]) => resolveLook(null, list).hidden.filter((h) => h.reason === 'slot-conflict').map((h) => h.id);

describe('Каталог магазину: visualStatus', () => {
  it('кожен предмет має visualStatus, наявні поля відповіді не змінені', async () => {
    const { call } = await login();
    const shop = await call('GET', '/api/shop');
    expect(shop.status).toBe(200);
    const by = new Map<string, Record<string, unknown>>(shop.body.items.map((i: { slug: string }) => [i.slug, i]));
    for (const i of by.values()) {
      expect(Object.keys(i).sort()).toEqual(
        ['assetKey', 'city', 'equipped', 'id', 'isPremium', 'name', 'owned', 'price', 'rarity', 'rewardOnly', 'slot', 'slug', 'unlock', 'visualStatus'].sort(),
      );
    }
    expect(by.get('cap-green')!.visualStatus).toBe('pending');
    expect(by.get('crown-gold')!.visualStatus).toBe('pending');
    expect(by.get('costume-syrenka')!.visualStatus).toBe('pending');
    expect(by.get('costume-artist')!.visualStatus).toBe('legacy-whole-look');
    expect(by.get('hoodie-red')!.visualStatus).toBe('legacy-whole-look');
    expect(by.get('frame-green')!.visualStatus).toBe('ready');
    expect(by.get('plant')!.visualStatus).toBe('not-wearable');

    // Що з одягу клієнт може запропонувати купити за Złotki (як у тесті «маніфест ↔ каталог»).
    const sellable = [...by.values()]
      .filter((i) => !i.rewardOnly && (i.price as number) > 0 && i.visualStatus !== 'not-wearable' && i.visualStatus !== 'pending' && i.visualStatus !== 'unknown')
      .map((i) => i.slug)
      .sort();
    expect(sellable).toEqual(['costume-artist', 'costume-dragon', 'costume-winter', 'frame-gold', 'frame-green']);
  });
});

describe('Покупка за ядром образу', () => {
  it('pending-річ: 409 visual_pending, баланс, гаманець, досягнення й інвентар без змін', async () => {
    const { call, user } = await login();
    await setBalance(user.id, 1000);
    const inv0 = await inventory(user.id);
    const tx0 = await txCount(user.id);
    const ach0 = await achCount(user.id);
    // crown-gold — Premium і pending: відмова visual_pending, а не premium_required (не ведемо купувати Premium заради неї).
    for (const slug of ['cap-green', 'jacket-denim', 'sneakers-white', 'backpack-map', 'crown-gold', 'glasses-star']) {
      const r = await call('POST', '/api/shop/buy', { itemId: itemId(slug) });
      expect(r.status, slug).toBe(409);
      expect(r.body.error, slug).toBe('visual_pending');
      expect(typeof r.body.message, slug).toBe('string');
    }
    expect(await balance(user.id)).toBe(1000);
    expect(await txCount(user.id)).toBe(tx0);
    expect(await achCount(user.id)).toBe(ach0);
    expect(await inventory(user.id)).toEqual(inv0);
  });

  it('нагорода лишається нагородою: reward_only раніше за visual_pending', async () => {
    const { call, user } = await login();
    await setBalance(user.id, 1000);
    // hat-krasnal і costume-syrenka — нагороди без зображення: причина відмови — «лише заробити».
    for (const slug of ['hat-krasnal', 'costume-syrenka']) expect((await call('POST', '/api/shop/buy', { itemId: itemId(slug) })).body.error, slug).toBe('reward_only');
    expect(await balance(user.id)).toBe(1000);
  });

  it('річ із зображенням купується: списання рівно один раз, повтор — already_owned', async () => {
    const { call, user } = await login();
    await setBalance(user.id, 200);
    const r = await call('POST', '/api/shop/buy', { itemId: itemId('costume-artist') });
    expect(r.status).toBe(200);
    // 200 − 180 + 10 за досягнення «Модник».
    expect(r.body.balance).toBe(30);
    expect(await balance(user.id)).toBe(30);
    expect((await inventory(user.id)).find((i) => i.itemId === itemId('costume-artist'))).toMatchObject({ equipped: false, source: 'shop' });

    const again = await call('POST', '/api/shop/buy', { itemId: itemId('costume-artist') });
    expect(again.status).toBe(400);
    expect(again.body.error).toBe('already_owned');
    expect(await balance(user.id)).toBe(30);
    expect(await txCount(user.id, 'buy:')).toBe(1);

    // Рамка (домен профілю, `ready`) теж продається.
    await setBalance(user.id, 100);
    expect((await call('POST', '/api/shop/buy', { itemId: itemId('frame-green') })).status).toBe(200);
    expect(await balance(user.id)).toBe(0);
    expect(await txCount(user.id, 'buy:')).toBe(2);
  });

  it('куплене до M3 і нагородне pending лишається у власності й надягається', async () => {
    const { call, user } = await login();
    await grant(user.id, 'cap-green', { source: 'shop' });
    await grant(user.id, 'costume-syrenka', { source: 'city' });
    // Нагорода за досягнення видається як раніше, без перевірки зображення: streak-7 → glasses-sun (pending).
    await db.update(playerProgress).set({ streakBest: 7 }).where(eq(playerProgress.userId, user.id));
    await atomic((await evaluateAchievements(user.id, null)).stmts);
    const inv0 = await inventory(user.id);
    expect(inv0.find((i) => i.itemId === itemId('glasses-sun'))).toMatchObject({ source: 'achievement' });

    for (const slug of ['cap-green', 'glasses-sun', 'costume-syrenka']) expect((await putOn(call, slug)).status, slug).toBe(200);
    const wear = await wearOf(call);
    expect(wear).toMatchObject({ HAT: 'cap-green', GLASSES: 'glasses-sun', COSTUME: 'costume-syrenka', BACKPACK: 'backpack-travel' });

    const shop = (await call('GET', '/api/shop')).body.items as { slug: string; owned: boolean; equipped: boolean; visualStatus: string }[];
    for (const slug of ['cap-green', 'glasses-sun', 'costume-syrenka']) {
      expect(shop.find((i) => i.slug === slug), slug).toMatchObject({ owned: true, equipped: true, visualStatus: 'pending' });
    }
    // Нічого не видалено з інвентарю.
    expect((await inventory(user.id)).map((i) => i.itemId)).toEqual(inv0.map((i) => i.itemId));
  });
});

describe('Надягання за ядром образу', () => {
  /** По одній речі на кожен слот каталогу, крім костюма; рюкзак — стартовий (уже надітий). */
  const FULL_SET = ['cap-red', 'glasses-round', 'scarf-green', 'jacket-denim', 'sneakers-white', 'flag-pl', 'frame-green'];
  const COSTUMES = LOOK_MANIFEST.items.filter((i) => i.catalogSlot === 'COSTUME').map((i) => i.id);

  it('костюм знімає надіті куртку й шапку, рюкзак лишається; інвентар цілий', async () => {
    const { call, user } = await login();
    await grant(user.id, 'jacket-denim', { equipped: true });
    await grant(user.id, 'cap-red', { equipped: true });
    await grant(user.id, 'glasses-round', { equipped: true });
    await setBalance(user.id, 200);
    expect((await call('POST', '/api/shop/buy', { itemId: itemId('costume-artist') })).status).toBe(200);
    const inv0 = await inventory(user.id);

    const r = await putOn(call, 'costume-artist');
    expect(r.status).toBe(200);
    // Формат відповіді не змінився: { wear: { SLOT: assetKey }, house: [...] }.
    expect(Object.keys(r.body).sort()).toEqual(['house', 'wear']);
    expect(r.body.wear).toEqual({ COSTUME: 'costume-artist', BACKPACK: 'backpack-travel', GLASSES: 'glasses-round' });
    expect(r.body.house).toEqual(['bed-basic']);
    const inv = await inventory(user.id);
    expect(inv.map((i) => i.itemId)).toEqual(inv0.map((i) => i.itemId));
    expect(inv.filter((i) => i.equipped).map((i) => i.itemId)).toEqual(['i_backpack-travel', 'i_bed-basic', 'i_costume-artist', 'i_glasses-round']);
  });

  it('кожен костюм: результат на сервері = equip() ядра (те, що обіцяє примірка); рюкзак не знімається ніколи', async () => {
    for (const costume of COSTUMES) {
      const { call, user } = await login();
      for (const slug of FULL_SET) await grant(user.id, slug, { equipped: true });
      await grant(user.id, costume, { source: 'reward' });
      const before = await wearOf(call);
      expect(equipmentFromWear(before), costume).toEqual([...FULL_SET, 'backpack-travel'].sort());

      const r = await putOn(call, costume);
      expect(r.status, costume).toBe(200);
      const expected = equip(before, costume);
      expect(equipmentFromWear(r.body.wear), costume).toEqual(expected.equipment);
      // У БД (з урахуванням можливих дублікатів слота) — те саме; ліжко домика до образу не належить.
      expect((await equippedKeys(user.id)).filter((k) => k !== 'bed-basic'), costume).toEqual(expected.equipment);
      expect(r.body.wear.BACKPACK, costume).toBe('backpack-travel');
      expect(slotConflicts(expected.equipment), costume).toEqual([]);
    }
  });

  it('правила ADR-005 §6: дракон знімає худі й кепку, але не рюкзак; кухар сумісний з ковпаком; куртка знімає кухаря', async () => {
    const { call, user } = await login();
    await grant(user.id, 'cap-red', { equipped: true });
    await grant(user.id, 'costume-dragon', { source: 'shop' });
    await grant(user.id, 'costume-chef', { source: 'mission' });
    await grant(user.id, 'hat-chef', { source: 'shop' });
    await grant(user.id, 'jacket-rain', { source: 'shop' });
    expect((await putOn(call, 'hoodie-red')).body.wear).toEqual({ JACKET: 'hoodie-red', HAT: 'cap-red', BACKPACK: 'backpack-travel' });

    expect((await putOn(call, 'costume-dragon')).body.wear).toEqual({ COSTUME: 'costume-dragon', BACKPACK: 'backpack-travel' });
    expect((await putOn(call, 'costume-chef')).body.wear).toEqual({ COSTUME: 'costume-chef', BACKPACK: 'backpack-travel' });
    expect((await putOn(call, 'hat-chef')).body.wear).toEqual({ COSTUME: 'costume-chef', HAT: 'hat-chef', BACKPACK: 'backpack-travel' });
    expect((await putOn(call, 'jacket-rain')).body.wear).toEqual({ JACKET: 'jacket-rain', HAT: 'hat-chef', BACKPACK: 'backpack-travel' });
    // Шапка теж знімає костюм, що займає головний убір.
    await putOn(call, 'costume-dragon');
    expect((await putOn(call, 'cap-red')).body.wear).toEqual({ HAT: 'cap-red', BACKPACK: 'backpack-travel' });
  });

  it('конфліктні старі дані після equip приходять в узгоджений стан', async () => {
    const { call, user } = await login();
    // До M3 сервер дозволяв: дві шапки (ручна правка/гонка) і костюм разом із курткою та шапкою.
    for (const slug of ['cap-green', 'cap-red', 'costume-artist', 'jacket-denim']) await grant(user.id, slug, { equipped: true });
    expect(slotConflicts(await equippedKeys(user.id)).length).toBeGreaterThan(0);

    // Надягти одну з двох шапок: друга шапка й костюм (займає головний убір) знімаються.
    const r = await putOn(call, 'cap-red');
    expect(r.status).toBe(200);
    expect(await equippedKeys(user.id)).toEqual(['backpack-travel', 'bed-basic', 'cap-red', 'jacket-denim']);
    expect(slotConflicts(await equippedKeys(user.id))).toEqual([]);
    expect(r.body.wear).toEqual({ HAT: 'cap-red', JACKET: 'jacket-denim', BACKPACK: 'backpack-travel' });

    // Знову конфлікт костюм + куртка: надягання куртки знімає костюм.
    await db.update(userInventory).set({ equipped: true }).where(and(eq(userInventory.userId, user.id), eq(userInventory.itemId, itemId('costume-artist'))));
    expect((await putOn(call, 'jacket-denim')).body.wear).toEqual({ HAT: 'cap-red', JACKET: 'jacket-denim', BACKPACK: 'backpack-travel' });
    expect(slotConflicts(await equippedKeys(user.id))).toEqual([]);
  });

  it('зняття — лише цей предмет, як unequip() ядра', async () => {
    const { call, user } = await login();
    await grant(user.id, 'costume-winter', { equipped: true });
    await grant(user.id, 'glasses-round', { equipped: true });
    const before = await wearOf(call);
    const r = await putOn(call, 'costume-winter', false);
    expect(r.status).toBe(200);
    expect(equipmentFromWear(r.body.wear)).toEqual(unequip(before, 'costume-winter').equipment);
    expect(r.body.wear).toEqual({ GLASSES: 'glasses-round', BACKPACK: 'backpack-travel' });
    // Повторне зняття нічого не ламає.
    expect((await putOn(call, 'costume-winter', false)).body.wear).toEqual({ GLASSES: 'glasses-round', BACKPACK: 'backpack-travel' });
  });

  it('надіти чужу або неіснуючу річ не можна', async () => {
    const a = await login();
    const b = await login();
    await grant(a.user.id, 'costume-artist');
    const invA = await inventory(a.user.id);
    const invB = await inventory(b.user.id);

    for (const equipped of [true, false]) {
      const r = await b.call('POST', '/api/inventory/equip', { itemId: itemId('costume-artist'), equipped });
      expect(r.status).toBe(403);
      expect(r.body.error).toBe('not_owned');
    }
    expect((await b.call('POST', '/api/inventory/equip', { itemId: 'i_no-such-item', equipped: true })).body.error).toBe('not_owned');
    expect(await inventory(a.user.id)).toEqual(invA);
    expect(await inventory(b.user.id)).toEqual(invB);
  });

  it('пакет атомарний: збій надягання відкочує зняття конфліктних речей', async () => {
    const { env } = await getEnv();
    const { call, user } = await login();
    await grant(user.id, 'cap-red', { equipped: true });
    await grant(user.id, 'jacket-denim', { equipped: true });
    await grant(user.id, 'costume-artist');
    const before = await equippedKeys(user.id);
    expect(/^[a-z0-9]+$/.test(user.id)).toBe(true);

    // Тестовий тригер: оновлення «надіти костюм» падає. Зняття конфліктів іде в тому ж пакеті перед ним.
    await env.DB.prepare(
      `CREATE TRIGGER test_equip_abort BEFORE UPDATE OF equipped ON user_inventory
       WHEN NEW.user_id = '${user.id}' AND NEW.item_id = 'i_costume-artist' AND NEW.equipped = 1
       BEGIN SELECT RAISE(ABORT, 'test:equip-abort'); END`,
    ).run();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const r = await putOn(call, 'costume-artist');
      expect(r.status).toBe(500);
      expect(await equippedKeys(user.id)).toEqual(before);
    } finally {
      await env.DB.prepare('DROP TRIGGER IF EXISTS test_equip_abort').run();
    }
    // Без збою той самий запит проходить і знімає обидві речі.
    expect((await putOn(call, 'costume-artist')).body.wear).toEqual({ COSTUME: 'costume-artist', BACKPACK: 'backpack-travel' });
  });

  it('паралельні надягання несумісних речей не лишають конфлікту в БД', async () => {
    const { call, user } = await login();
    await grant(user.id, 'costume-dragon');
    await grant(user.id, 'jacket-denim');
    await grant(user.id, 'cap-green');
    for (let round = 0; round < 3; round++) {
      const rs = await Promise.all([putOn(call, 'costume-dragon'), putOn(call, 'jacket-denim'), putOn(call, 'cap-green')]);
      expect(rs.map((r) => r.status)).toEqual([200, 200, 200]);
      expect(slotConflicts(await equippedKeys(user.id)), `round ${round}`).toEqual([]);
    }
  });
});
