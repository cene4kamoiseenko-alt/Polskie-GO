/**
 * Готові образи — товар гардероба (2026-11-02, docs/OUTFITS.md): рівні Osiedle / Starówka / Wawel, ціна образу, покупка видає весь набір,
 * надягання ставить рівно набір, речі наборів поштучно не продаються, речі з дешевих образів не складаються в дорогий, колишні покупки не пропадають.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { and, eq, sql as dsql } from 'drizzle-orm';
import { LOOK_VARIANTS } from '@polski-go/shared';
import { db } from '../src/db';
import { cosmeticItems, gameWallets, userInventory, walletTransactions } from '../src/db/schema';
import { COSTUME_PRICES, ITEMS } from '../src/content/gamification';
import { OUTFITS, RETIRED_LOOKS, STARTER_OUTFIT } from '../src/content/outfits';
import { buildSeedSql } from '../src/content/seed';
import { disposeEnv, login } from './helpers';

afterAll(disposeEnv);

const setBalance = (userId: string, b: number) => db.update(gameWallets).set({ balance: b }).where(eq(gameWallets.userId, userId));
const balance = async (userId: string) => (await db.query.gameWallets.findFirst({ where: eq(gameWallets.userId, userId) }))!.balance;
type Item = { id: string; slug: string; slot: string; price: number; rarity: string; owned: boolean; equipped: boolean; outfit: { wear: Record<string, string>; hoodie: boolean; starter: boolean; items: string[] } | null };
type Call = Awaited<ReturnType<typeof login>>['call'];
const shop = async (call: Call) => (await call('GET', '/api/shop')).body.items as Item[];
const by = async (call: Call) => new Map((await shop(call)).map((i) => [i.slug, i]));
const grant = async (userId: string, slug: string, source: string, equipped = false) => {
  const item = (await db.select({ id: cosmeticItems.id }).from(cosmeticItems).where(eq(cosmeticItems.slug, slug)))[0];
  await db.insert(userInventory).values({ userId, itemId: item.id, source, equipped }).onConflictDoNothing();
};
const wearOf = async (call: Call) => (await call('GET', '/api/me')).body.outfit.wear as Record<string, string>;

describe('Готові образи: каталог', () => {
  it('31 образ: стартовий + 30 на продаж; кожен — наявна картинка LOOK_VARIANTS; рівні й ціни зростають', () => {
    expect(OUTFITS).toHaveLength(31);
    const ids = new Set(LOOK_VARIANTS.list.map((v) => v.id));
    for (const o of OUTFITS) {
      expect(ids.has(o.variant), o.variant).toBe(true);
      expect([...o.items].sort(), o.slug).toEqual(LOOK_VARIANTS.list.find((v) => v.id === o.variant)!.items);
      expect(o.name.length, o.slug).toBeGreaterThan(2);
    }
    const sale = OUTFITS.filter((o) => !o.starter);
    const tier = (t: string) => sale.filter((o) => o.tier === t).map((o) => o.price);
    expect(tier('rare').length).toBeGreaterThanOrEqual(8);
    expect(tier('epic').length).toBeGreaterThanOrEqual(8);
    expect(tier('legendary').length).toBeGreaterThanOrEqual(5);
    // «Не супер дешёвые»: самый простой образ дороже прежней поштучной вещи в разы; уровни не пересекаются по цене.
    expect(Math.min(...tier('rare'))).toBeGreaterThanOrEqual(200);
    expect(Math.max(...tier('rare'))).toBeLessThan(Math.min(...tier('epic')));
    expect(Math.max(...tier('epic'))).toBeLessThan(Math.min(...tier('legendary')));
    // В каталоге: предмет слота OUTFIT на каждый образ, с ценой и уровнем образа.
    for (const o of OUTFITS) {
      const it = ITEMS.find((i) => i.slug === o.slug)!;
      expect(it, o.slug).toBeTruthy();
      expect(it.slot).toBe('OUTFIT');
      expect(it.price).toBe(o.price);
    }
    // Костюмы — тоже готовые образы по уровням.
    for (const [slug, c] of Object.entries(COSTUME_PRICES)) {
      const it = ITEMS.find((i) => i.slug === slug)!;
      expect(it.price, slug).toBe(c.price);
      expect(it.rarity, slug).toBe(c.rarity);
    }
  });

  it('прод: seed без force меняет цену костюма только там, где ещё прежняя', () => {
    const sql = buildSeedSql({ force: false }).join('\n');
    expect(sql).toContain("UPDATE cosmetic_items SET price = 550, rarity = 'epic' WHERE slug = 'costume-winter' AND price = 120 AND rarity = 'rare';");
    expect(sql).toContain("UPDATE cosmetic_items SET price = 1200, rarity = 'legendary' WHERE slug = 'costume-street' AND price = 400 AND rarity = 'legendary';");
    expect(sql).toMatch(/INSERT INTO "?cosmetic_items"?[^;]*'outfit-hoodie-cap'/);
  });

  it('прод: ковпак гнома, камізелька й обважанек стають костюмами; надіті знімаються один раз (2026-11-04)', async () => {
    const { user } = await login();
    const slotOf = async (slug: string) => (await db.select({ slot: cosmeticItems.slot }).from(cosmeticItems).where(eq(cosmeticItems.slug, slug)))[0].slot;
    const equippedOf = async (slug: string) =>
      (await db.select({ e: userInventory.equipped }).from(userInventory).innerJoin(cosmeticItems, eq(cosmeticItems.id, userInventory.itemId)).where(and(eq(userInventory.userId, user.id), eq(cosmeticItems.slug, slug))))[0].e;
    expect(await slotOf('hat-krasnal')).toBe('COSTUME');
    // Как на проде до правки: ковпак в слоте HAT и надет.
    await db.update(cosmeticItems).set({ slot: 'HAT' }).where(eq(cosmeticItems.slug, 'hat-krasnal'));
    await grant(user.id, 'hat-krasnal', 'achievement', true);
    const fix = buildSeedSql({ force: false }).filter((s) => s.startsWith('UPDATE') && s.includes("'hat-krasnal'"));
    expect(fix).toHaveLength(2);
    for (const s of fix) await db.run(dsql.raw(s));
    expect([await slotOf('hat-krasnal'), await equippedOf('hat-krasnal')]).toEqual(['COSTUME', false]);
    // Повторный сид (каждый деплой) ничего не трогает: надетый уже костюмом ковпак остаётся надетым.
    await db.update(userInventory).set({ equipped: true }).where(eq(userInventory.userId, user.id));
    for (const s of fix) await db.run(dsql.raw(s));
    expect([await slotOf('hat-krasnal'), await equippedOf('hat-krasnal')]).toEqual(['COSTUME', true]);
  });
});

describe('Готові образи: гравець', () => {
  it('новий гравець: стартовий «Podróżnik» свій і вдягнений, решта не свої', async () => {
    const { call } = await login();
    const m = await by(call);
    const starter = m.get(STARTER_OUTFIT)!;
    expect([starter.owned, starter.equipped, starter.price, starter.outfit?.starter]).toEqual([true, true, 0, true]);
    for (const o of OUTFITS.filter((x) => !x.starter)) expect([m.get(o.slug)!.owned, m.get(o.slug)!.equipped], o.slug).toEqual([false, false]);
    expect(m.get('outfit-denim-cap')!.outfit).toMatchObject({ wear: { JACKET: 'jacket-denim', HAT: 'cap-red' }, hoodie: false });
    expect(m.get('outfit-hoodie-cap-pack')!.outfit).toMatchObject({ wear: { HAT: 'cap-red', BACKPACK: 'backpack-travel' }, hoodie: true });
  });

  it('речі наборів поштучно не продаються: 409 outfit_only, Złotki не списано', async () => {
    const { call, user } = await login();
    await setBalance(user.id, 1000);
    const m = await by(call);
    for (const slug of ['cap-red', 'glasses-round', 'scarf-pl', 'jacket-denim', 'jacket-rain', 'beanie-red']) {
      const r = await call('POST', '/api/shop/buy', { itemId: m.get(slug)!.id });
      expect([r.status, r.body.error], slug).toEqual([409, 'outfit_only']);
    }
    expect(await balance(user.id)).toBe(1000);
  });

  it('покупка образу: одне списання ціни образу, рядок OUTFIT і речі набору; повтор і паралельні запити — без другого списання', async () => {
    const { call, user } = await login();
    const m = await by(call);
    const look = m.get('outfit-denim-beanie')!;
    expect((await call('POST', '/api/shop/buy', { itemId: look.id })).body.error).toBe('insufficient_funds');
    await setBalance(user.id, look.price);
    const buys = await Promise.all([call('POST', '/api/shop/buy', { itemId: look.id }), call('POST', '/api/shop/buy', { itemId: look.id })]);
    expect(buys.filter((b) => b.status === 200)).toHaveLength(1);
    const tx = await db.select().from(walletTransactions).where(and(eq(walletTransactions.userId, user.id), eq(walletTransactions.reason, 'buy:outfit-denim-beanie')));
    expect(tx.map((t) => t.amount)).toEqual([-look.price]);
    const after = await by(call);
    expect([after.get('outfit-denim-beanie')!.owned, after.get('outfit-denim-beanie')!.equipped]).toEqual([true, false]);
    const inv = await db.select({ slug: cosmeticItems.slug, source: userInventory.source }).from(userInventory).innerJoin(cosmeticItems, eq(cosmeticItems.id, userInventory.itemId)).where(eq(userInventory.userId, user.id));
    expect(inv.filter((r) => ['jacket-denim', 'beanie-red', 'outfit-denim-beanie'].includes(r.slug)).map((r) => `${r.slug}:${r.source}`).sort()).toEqual(['beanie-red:outfit', 'jacket-denim:outfit', 'outfit-denim-beanie:shop']);
    expect((await call('POST', '/api/shop/buy', { itemId: look.id })).body.error).toBe('already_owned');
  });

  it('надягання образу: рівно набір (худі — за замовчуванням), костюм знімається, рамка лишається; «зняти» — назад у стартовий', async () => {
    const { call, user } = await login();
    await grant(user.id, 'costume-artist', 'shop', true);
    await grant(user.id, 'frame-green', 'shop', true);
    const m = await by(call);
    await setBalance(user.id, 2000);
    expect((await call('POST', '/api/shop/buy', { itemId: m.get('outfit-hoodie-cap-glasses-pack')!.id })).status).toBe(200);
    const r = await call('POST', '/api/inventory/equip', { itemId: m.get('outfit-hoodie-cap-glasses-pack')!.id, equipped: true });
    expect(r.status).toBe(200);
    expect(r.body.wear).toEqual({ HAT: 'cap-red', GLASSES: 'glasses-round', BACKPACK: 'backpack-travel', FRAME: 'frame-green' });
    const now = await by(call);
    expect(now.get('outfit-hoodie-cap-glasses-pack')!.equipped).toBe(true);
    expect(now.get(STARTER_OUTFIT)!.equipped).toBe(false);
    expect(now.get('costume-artist')!.equipped).toBe(false);

    // куртка-образ: худі не вдягається, куртка стає верхом
    expect((await call('POST', '/api/shop/buy', { itemId: m.get('outfit-rain-cap')!.id })).status).toBe(200);
    await call('POST', '/api/inventory/equip', { itemId: m.get('outfit-rain-cap')!.id, equipped: true });
    expect(await wearOf(call)).toEqual({ JACKET: 'jacket-rain', HAT: 'cap-red', FRAME: 'frame-green' });

    // зняти образ — стартовий «Podróżnik»
    await call('POST', '/api/inventory/equip', { itemId: m.get('outfit-rain-cap')!.id, equipped: false });
    expect(await wearOf(call)).toEqual({ BACKPACK: 'backpack-travel', FRAME: 'frame-green' });
    expect((await by(call)).get(STARTER_OUTFIT)!.equipped).toBe(true);
  });

  it('речі з дешевих образів не складаються в дорогий; чужий образ надягнути не можна', async () => {
    const { call, user } = await login();
    const m = await by(call);
    await setBalance(user.id, 2000);
    for (const slug of ['outfit-hoodie-cap', 'outfit-hoodie-glasses']) expect((await call('POST', '/api/shop/buy', { itemId: m.get(slug)!.id })).status, slug).toBe(200);
    const now = await by(call);
    expect(now.get('outfit-hoodie-cap-glasses')!.owned).toBe(false);
    expect(now.get('outfit-hoodie-cap-glasses-pack')!.owned).toBe(false);
    const r = await call('POST', '/api/inventory/equip', { itemId: m.get('outfit-hoodie-cap-glasses')!.id, equipped: true });
    expect([r.status, r.body.error]).toEqual([403, 'not_owned']);
  });

  it('колишні покупки не пропадають: речі, куплені поштучно раніше, дають свої образи', async () => {
    const { call, user } = await login();
    await grant(user.id, 'cap-red', 'shop');
    await grant(user.id, 'glasses-round', 'shop');
    const m = await by(call);
    for (const slug of ['outfit-hoodie-cap', 'outfit-hoodie-glasses', 'outfit-hoodie-cap-glasses', 'outfit-hoodie-cap-glasses-pack']) expect(m.get(slug)!.owned, slug).toBe(true);
    expect(m.get('outfit-hoodie-cap-scarf')!.owned).toBe(false);
    const r = await call('POST', '/api/inventory/equip', { itemId: m.get('outfit-hoodie-cap-glasses')!.id, equipped: true });
    expect(r.status).toBe(200);
    expect(r.body.wear).toEqual({ HAT: 'cap-red', GLASSES: 'glasses-round' });
    expect((await call('POST', '/api/shop/buy', { itemId: m.get('outfit-hoodie-cap-glasses')!.id })).body.error).toBe('already_owned');
  });

  it('повторы костюмов сняты с продажи: в магазине их нет, купить нельзя; у купивших — остаются и надеваются', async () => {
    const { call, user } = await login();
    await setBalance(user.id, 5000);
    const m = await by(call);
    for (const slug of RETIRED_LOOKS) expect(m.has(slug), slug).toBe(false);
    for (const slug of ['costume-street', 'costume-puffer', 'costume-duffle']) expect(m.has(slug), slug).toBe(true);
    const id = (await db.select({ id: cosmeticItems.id }).from(cosmeticItems).where(eq(cosmeticItems.slug, 'costume-sherpa')))[0].id;
    const r = await call('POST', '/api/shop/buy', { itemId: id });
    expect([r.status, r.body.error]).toEqual([409, 'retired']);
    expect(await balance(user.id)).toBe(5000);
    await grant(user.id, 'costume-sherpa', 'shop');
    const mine = await by(call);
    expect(mine.get('costume-sherpa')?.owned).toBe(true);
    expect((await call('POST', '/api/inventory/equip', { itemId: id, equipped: true })).status).toBe(200);
    expect((await wearOf(call)).COSTUME).toBe('costume-sherpa');
  });
});
