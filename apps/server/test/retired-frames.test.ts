/**
 * Рамки профиля (золотая и зелёная) убраны из игры (2026-11-14, владелец: «они ничего не дают, их можно убрать»).
 * Каталог и образ больше не знают о рамках. На проде строки рамок остаются в БД: охраняемый seed выключает их, снимает надетые и возвращает
 * Złotki тем, кто покупал рамку (сумма — из журнала покупки), ровно один раз. Строки инвентаря не удаляются.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { and, eq, inArray, sql as dsql } from 'drizzle-orm';
import { LOOK_MANIFEST } from '@polski-go/shared';
import { db } from '../src/db';
import { cosmeticItems, gameWallets, userInventory, walletTransactions } from '../src/db/schema';
import { ITEMS } from '../src/content/gamification';
import { buildSeedSql, retireItemsSql } from '../src/content/seed';
import { outfit } from '../src/services/shop';
import { disposeEnv, login } from './helpers';

afterAll(disposeEnv);

const run = async (sqls: string[]) => {
  for (const s of sqls) await db.run(dsql.raw(s));
};
const names = {
  green: { uk: 'Зелена рамка', ru: 'Зелёная рамка', en: 'Green frame' },
  gold: { uk: 'Золота рамка', ru: 'Золотая рамка', en: 'Gold frame' },
};

/** Как на проде до правки: строки рамок есть и активны (свежий seed их уже не создаёт). */
async function prodFrameRows() {
  await db
    .insert(cosmeticItems)
    .values([
      { id: 'i_frame-green', slug: 'frame-green', slot: 'FRAME', name: names.green, assetKey: 'frame-green', price: 100, order: 9000 },
      { id: 'i_frame-gold', slug: 'frame-gold', slot: 'FRAME', name: names.gold, assetKey: 'frame-gold', price: 150, rarity: 'legendary', isPremium: true, order: 9001 },
    ])
    .onConflictDoNothing();
}

const balance = async (userId: string) => (await db.select().from(gameWallets).where(eq(gameWallets.userId, userId)))[0].balance;
const give = (userId: string, slug: string, source: string, equipped = false) => db.insert(userInventory).values({ userId, itemId: `i_${slug}`, source, equipped }).onConflictDoNothing();
const bought = (userId: string, slug: string, price: number) =>
  db.insert(walletTransactions).values({ userId, amount: -price, reason: `buy:${slug}`, idempotencyKey: `buy:${userId}:i_${slug}` });

describe('рамки профиля убраны', () => {
  it('в каталоге и в манифесте образа рамок больше нет', () => {
    expect(ITEMS.filter((i) => (i.slot as string) === 'FRAME').map((i) => i.slug)).toEqual([]);
    expect(LOOK_MANIFEST.items.filter((i) => /^frame-/.test(i.id)).map((i) => i.id)).toEqual([]);
  });

  it('прод: рамки выключаются, надетые снимаются, купившим возвращаются Złotki — один раз; полученные в подарок Premium не возвращаются', async () => {
    const a = await login(); // купил обе рамки, надета зелёная
    const b = await login(); // золотая — подарок Premium, надета
    const c = await login(); // купил только зелёную
    await prodFrameRows();
    await db.update(gameWallets).set({ balance: 40 }).where(eq(gameWallets.userId, a.user.id));
    await db.update(gameWallets).set({ balance: 10 }).where(eq(gameWallets.userId, b.user.id));
    await db.update(gameWallets).set({ balance: 0 }).where(eq(gameWallets.userId, c.user.id));
    await bought(a.user.id, 'frame-green', 100);
    await bought(a.user.id, 'frame-gold', 150);
    await bought(c.user.id, 'frame-green', 100);
    await give(a.user.id, 'frame-green', 'shop', true);
    await give(a.user.id, 'frame-gold', 'shop');
    await give(b.user.id, 'frame-gold', 'premium-gift', true);
    await give(c.user.id, 'frame-green', 'shop');

    const fix = retireItemsSql();
    // Правка встроена в боевой seed (а не только лежит рядом).
    const seed = buildSeedSql({ force: false });
    for (const s of fix) expect(seed, s.slice(0, 60)).toContain(s);
    for (let k = 0; k < 2; k++) await run(fix); // повторный seed ничего не меняет

    expect(await balance(a.user.id)).toBe(40 + 250);
    expect(await balance(b.user.id)).toBe(10);
    expect(await balance(c.user.id)).toBe(100);
    const refunds = await db.select().from(walletTransactions).where(inArray(walletTransactions.reason, ['refund:buy:frame-green', 'refund:buy:frame-gold']));
    expect(refunds.map((r) => [r.amount]).sort()).toEqual([[100], [100], [150]]);
    // Журнал покупки остался как был: возврат — отдельные записи.
    expect(await db.select().from(walletTransactions).where(inArray(walletTransactions.reason, ['buy:frame-green', 'buy:frame-gold']))).toHaveLength(3);

    const rows = await db.select().from(cosmeticItems).where(inArray(cosmeticItems.slug, ['frame-green', 'frame-gold']));
    expect(rows.map((r) => r.isActive)).toEqual([false, false]);
    expect(await db.select().from(userInventory).where(and(inArray(userInventory.itemId, ['i_frame-green', 'i_frame-gold']), eq(userInventory.equipped, true)))).toHaveLength(0);
    // Строки инвентаря не удалены: данные игроков целы.
    expect(await db.select().from(userInventory).where(inArray(userInventory.itemId, ['i_frame-green', 'i_frame-gold']))).toHaveLength(4);

    // Магазин не предлагает рамки, профиль не отдаёт рамку.
    const shop = await a.call('GET', '/api/shop');
    expect(shop.status).toBe(200);
    expect((shop.body.items as { slot: string }[]).filter((i) => i.slot === 'FRAME')).toEqual([]);
    expect((await outfit(a.user.id)).wear.FRAME).toBeUndefined();
    expect((await a.call('GET', '/api/me')).status).toBe(200);
  });

  it('подарок Premium не выдаёт рамку: когда остальных вещей Premium нет, подарок — только Złotki', async () => {
    const u = await login();
    await prodFrameRows();
    for (const slug of ['crown-gold', 'glasses-star', 'costume-dragon']) await give(u.user.id, slug, 'premium-gift');
    await run(retireItemsSql());
    const gift = (await u.call('GET', '/api/premium')).body.gift as { item: { slug: string } | null };
    expect(gift.item).toBeNull();
  });

  it('надетая рамка (строка осталась в БД) не попадает в образ игрока ни как одежда, ни как вещь домика', async () => {
    const u = await login();
    await prodFrameRows();
    await give(u.user.id, 'frame-gold', 'premium-gift', true);
    const o = await outfit(u.user.id);
    expect(o.wear.FRAME).toBeUndefined();
    expect(o.house).not.toContain('frame-gold');
  });
});
