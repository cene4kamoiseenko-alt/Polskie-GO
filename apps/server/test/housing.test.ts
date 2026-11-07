/**
 * Житло домика Бобека (2026-11-02): чотири цільні кімнати — Pokój в Ополе (безкоштовна, обрана за замовчуванням), kawalerka, mieszkanie, apartament.
 * Покупку й вибір перевіряє сервер; обране і куплене зберігається між сесіями; безкоштовна кімната не купується, а вибирається.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { and, eq, like } from 'drizzle-orm';
import { db } from '../src/db';
import { dailyActivity, gameWallets, userSettings, walletTransactions } from '../src/db/schema';
import { HOUSING_BONUS, HOUSING_PRICES, ITEMS } from '../src/content/gamification';
import { dayKey } from '@polski-go/shared';
import { goalXpFor } from '../src/services/goal';
import { disposeEnv, login } from './helpers';

afterAll(disposeEnv);

const setBalance = (userId: string, b: number) => db.update(gameWallets).set({ balance: b }).where(eq(gameWallets.userId, userId));
const balance = async (userId: string) => (await db.query.gameWallets.findFirst({ where: eq(gameWallets.userId, userId) }))!.balance;
type Item = { id: string; slug: string; slot: string; price: number; owned: boolean; equipped: boolean };
const housing = async (call: Awaited<ReturnType<typeof login>>['call']) => ((await call('GET', '/api/shop')).body.items as Item[]).filter((i) => i.slot === 'HOUSING');

describe('Житло домика', () => {
  it('каталог: чотири кімнати, ціна зростає, безкоштовна — перша; ціни — «кілька тисяч»', () => {
    const rooms = ITEMS.filter((i) => i.slot === 'HOUSING');
    expect(rooms.map((r) => r.slug)).toEqual(['housing-opole', 'housing-lodz', 'housing-krakow', 'housing-warszawa']);
    expect(rooms.map((r) => r.price)).toEqual([0, HOUSING_PRICES['housing-lodz'], HOUSING_PRICES['housing-krakow'], HOUSING_PRICES['housing-warszawa']]);
    expect(rooms[1].price).toBeGreaterThanOrEqual(2000);
    expect(rooms[1].price).toBeLessThan(rooms[2].price);
    expect(rooms[2].price).toBeLessThan(rooms[3].price);
    // не стартові й не нагороди: безкоштовна кімната видається неявно, решта купується
    for (const r of rooms) expect(r.starter ?? false, r.slug).toBe(false);
    for (const r of rooms) expect(r.rewardOnly ?? false, r.slug).toBe(false);
  });

  it('новий гравець: безкоштовна кімната в Ополе обрана й належить йому, решта закриті', async () => {
    const { call } = await login();
    const rooms = await housing(call);
    expect(rooms.map((r) => [r.slug, r.owned, r.equipped])).toEqual([
      ['housing-opole', true, true],
      ['housing-lodz', false, false],
      ['housing-krakow', false, false],
      ['housing-warszawa', false, false],
    ]);
    const me = await call('GET', '/api/me');
    expect(me.body.outfit.home).toBe('housing-opole');
    // житло не потрапляє в розставлені речі й в одяг
    expect(me.body.outfit.house).not.toContain('housing-opole');
    expect(Object.keys(me.body.outfit.wear)).not.toContain('HOUSING');
  });

  it('покупка: без грошей — insufficient_funds, з грошима списує ціну рівно один раз, повторна покупка відхиляється', async () => {
    const { call, user } = await login();
    const lodz = (await housing(call)).find((r) => r.slug === 'housing-lodz')!;
    expect((await call('POST', '/api/shop/buy', { itemId: lodz.id })).body.error).toBe('insufficient_funds');
    expect(await balance(user.id)).toBe(0);

    await setBalance(user.id, 2600);
    const buys = await Promise.all([call('POST', '/api/shop/buy', { itemId: lodz.id }), call('POST', '/api/shop/buy', { itemId: lodz.id })]);
    expect(buys.filter((b) => b.status === 200)).toHaveLength(1);
    // 2600 − 2500 + бонус за першу покупку (досягнення «Модник»), якщо воно є
    const left = await balance(user.id);
    expect(left).toBeGreaterThanOrEqual(100);
    expect(left).toBeLessThanOrEqual(2600 - 2500 + 50);
    expect((await call('POST', '/api/shop/buy', { itemId: lodz.id })).body.error).toBe('already_owned');
  });

  it('безкоштовну кімнату не купують; вибір: лише куплене, одна обрана, перемикання туди й назад, усе зберігається', async () => {
    const { call, user } = await login();
    await setBalance(user.id, 20_000);
    const rooms = await housing(call);
    const [opole, lodz, krakow, warszawa] = rooms;
    expect((await call('POST', '/api/shop/buy', { itemId: opole.id })).body.error).toBe('already_owned');
    // не куплене вибрати не можна
    expect((await call('POST', '/api/inventory/equip', { itemId: krakow.id, equipped: true })).body.error).toBe('not_owned');

    expect((await call('POST', '/api/shop/buy', { itemId: krakow.id })).status).toBe(200);
    expect((await call('POST', '/api/shop/buy', { itemId: warszawa.id })).status).toBe(200);
    // куплене автоматично не вибирається: вибір — окрема дія
    expect((await call('GET', '/api/me')).body.outfit.home).toBe('housing-opole');

    let r = await call('POST', '/api/inventory/equip', { itemId: krakow.id, equipped: true });
    expect(r.body.home).toBe('housing-krakow');
    r = await call('POST', '/api/inventory/equip', { itemId: warszawa.id, equipped: true });
    expect(r.body.home).toBe('housing-warszawa');
    // одна обрана
    const now = await housing(call);
    expect(now.filter((x) => x.equipped).map((x) => x.slug)).toEqual(['housing-warszawa']);
    expect(now.filter((x) => x.owned).map((x) => x.slug)).toEqual(['housing-opole', 'housing-krakow', 'housing-warszawa']);
    expect(now.find((x) => x.slug === 'housing-lodz')!.owned).toBe(false);

    // назад на безкоштовну кімнату
    r = await call('POST', '/api/inventory/equip', { itemId: opole.id, equipped: true });
    expect(r.body.home).toBe('housing-opole');
    expect((await housing(call)).filter((x) => x.equipped).map((x) => x.slug)).toEqual(['housing-opole']);
    // і знову на куплену: покупка нікуди не зникла
    r = await call('POST', '/api/inventory/equip', { itemId: krakow.id, equipped: true });
    expect(r.body.home).toBe('housing-krakow');
    expect((await call('GET', '/api/me')).body.outfit.home).toBe('housing-krakow');
    expect((await housing(call)).find((x) => x.slug === 'housing-lodz')!.equipped).toBe(false);
    void lodz;
  });

  it('вибір житла не чіпає одяг і розставлені речі', async () => {
    const { call, user } = await login();
    await setBalance(user.id, 3000);
    const before = (await call('GET', '/api/me')).body.outfit;
    const lodz = (await housing(call)).find((r) => r.slug === 'housing-lodz')!;
    await call('POST', '/api/shop/buy', { itemId: lodz.id });
    await call('POST', '/api/inventory/equip', { itemId: lodz.id, equipped: true });
    const after = (await call('GET', '/api/me')).body.outfit;
    expect(after.wear).toEqual(before.wear);
    expect(after.house).toEqual(before.house);
    expect(after.home).toBe('housing-lodz');
  });
});

describe('Домашний бонус (2026-11-03)', () => {
  const doGoal = async (userId: string) => {
    await db.update(userSettings).set({ dailyGoalMinutes: 10, timezone: 'Europe/Warsaw' }).where(eq(userSettings.userId, userId));
    const day = dayKey(new Date(), 'Europe/Warsaw');
    await db.insert(dailyActivity).values({ userId, day, xp: goalXpFor(10) }).onConflictDoUpdate({ target: [dailyActivity.userId, dailyActivity.day], set: { xp: goalXpFor(10) } });
  };
  const bonusTx = (userId: string) => db.select().from(walletTransactions).where(and(eq(walletTransactions.userId, userId), like(walletTransactions.idempotencyKey, 'house:%')));

  it('бонус растёт с квартирой; новый игрок — комната в Ополе, цель накопления — kawalerka', async () => {
    expect(HOUSING_BONUS['housing-opole']).toBeLessThan(HOUSING_BONUS['housing-lodz']);
    expect(HOUSING_BONUS['housing-lodz']).toBeLessThan(HOUSING_BONUS['housing-krakow']);
    expect(HOUSING_BONUS['housing-krakow']).toBeLessThan(HOUSING_BONUS['housing-warszawa']);
    const { call } = await login();
    const r = await call('GET', '/api/house');
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ home: 'housing-opole', bonus: HOUSING_BONUS['housing-opole'], goalDone: false, claimed: false, next: { slug: 'housing-lodz', price: HOUSING_PRICES['housing-lodz'], bonus: HOUSING_BONUS['housing-lodz'] } });
  });

  it('без цели дня бонуса нет; с целью — один раз в день, параллельные запросы не удваивают', async () => {
    const { call, user } = await login();
    await setBalance(user.id, 0);
    expect((await call('POST', '/api/house/bonus')).body.error).toBe('goal_not_done');
    await doGoal(user.id);
    expect((await call('GET', '/api/house')).body).toMatchObject({ goalDone: true, claimed: false });
    const claims = await Promise.all([call('POST', '/api/house/bonus'), call('POST', '/api/house/bonus')]);
    // Выиграл один, опоздавший получает тот же отказ, что и при обычном повторе (не второй тост «+5»): найдено нагрузочным тестом 2026-11-07.
    expect(claims.map((c) => c.status).sort()).toEqual([200, 400]);
    expect(claims.find((c) => c.status === 400)!.body.error).toBe('already_claimed');
    expect(claims.find((c) => c.status === 200)!.body.granted).toBe(HOUSING_BONUS['housing-opole']);
    expect(await balance(user.id)).toBe(HOUSING_BONUS['housing-opole']);
    expect(await bonusTx(user.id)).toHaveLength(1);
    expect((await call('POST', '/api/house/bonus')).body.error).toBe('already_claimed');
    expect((await call('GET', '/api/house')).body).toMatchObject({ claimed: true });
  });

  it('купил kawalerkę — бонус больше, цель накопления — mieszkanie', async () => {
    const { call, user } = await login();
    const lodz = (await housing(call)).find((r) => r.slug === 'housing-lodz')!;
    await setBalance(user.id, HOUSING_PRICES['housing-lodz']);
    expect((await call('POST', '/api/shop/buy', { itemId: lodz.id })).status).toBe(200);
    await call('POST', '/api/inventory/equip', { itemId: lodz.id, equipped: true });
    await doGoal(user.id);
    const st = (await call('GET', '/api/house')).body;
    expect(st).toMatchObject({ home: 'housing-lodz', bonus: HOUSING_BONUS['housing-lodz'], next: { slug: 'housing-krakow' } });
    const before = await balance(user.id);
    const r = await call('POST', '/api/house/bonus');
    expect(r.body.granted).toBe(HOUSING_BONUS['housing-lodz']);
    expect(await balance(user.id)).toBe(before + HOUSING_BONUS['housing-lodz']);
  });
});

