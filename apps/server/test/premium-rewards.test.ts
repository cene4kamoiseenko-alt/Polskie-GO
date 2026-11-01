/**
 * Premium v2 (docs/PREMIUM_LOGIC_V2.md): награды в Złotki, которые выдаёт сервер и которыми владелец управляет в админке.
 *  • приветственный бонус — один раз на человека, при первой оплате;
 *  • бонус предоплаченного тарифа — за каждую оплату на 3 / 12 месяцев, повторная доставка платежа ничего не добавляет;
 *  • лояльность — на 3-м, 6-м и 12-м полученном подарке месяца;
 *  • суммы берутся из настроек нагород (game_config), а не зашиты в код;
 *  • /premium сообщает, можно ли купить: при действующей автопродлеваемой подписке — нет (двойное списание).
 */
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { DEFAULT_REWARDS } from '@polski-go/shared';
import { db } from '../src/db';
import { gameConfig, gameWallets, subscriptions, walletTransactions } from '../src/db/schema';
import { invalidateRewards } from '../src/services/gameConfig';
import { giftKey } from '../src/services/premium-gift';
import { disposeEnv, login, request } from './helpers';

afterAll(disposeEnv);
afterEach(async () => {
  vi.restoreAllMocks();
  await db.delete(gameConfig).where(eq(gameConfig.key, 'rewards'));
  invalidateRewards();
});

function mockBot() {
  const realFetch = globalThis.fetch;
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    if (!String(url).startsWith('https://api.telegram.org/')) return realFetch(url as never, init);
    const method = String(url).split('/').pop()!;
    return new Response(JSON.stringify({ ok: true, result: method === 'createInvoiceLink' ? 'https://t.me/$invoice' : method === 'sendMessage' ? { message_id: 1 } : true }), { status: 200 });
  });
}

let upd = 91_000;
const webhook = (payload: Record<string, unknown>) => request('POST', '/telegram/webhook', { update_id: ++upd, ...payload }, { 'x-telegram-bot-api-secret-token': 'hook-secret' });
const PRICE = { MONTH_1: 250, MONTH_3: 600, MONTH_12: 1800 } as const;

/** Полная оплата тарифа через webhook (счёт → pre_checkout → successful_payment). Повтор того же charge — повторная доставка. */
async function pay(u: Awaited<ReturnType<typeof login>>, plan: keyof typeof PRICE, charge: string, deliveries = 1) {
  const inv = await u.call('POST', '/api/premium/invoice', { plan });
  expect(inv.status, JSON.stringify(inv.body)).toBe(200);
  const amount = PRICE[plan];
  await webhook({ pre_checkout_query: { id: `q${upd}`, from: { id: u.telegramId }, currency: 'XTR', total_amount: amount, invoice_payload: inv.body.payload } });
  const p = {
    currency: 'XTR', total_amount: amount, invoice_payload: inv.body.payload, telegram_payment_charge_id: charge,
    ...(plan === 'MONTH_1' ? { subscription_expiration_date: Math.floor(Date.now() / 1000) + 30 * 86400, is_recurring: true, is_first_recurring: true } : {}),
  };
  for (let i = 0; i < deliveries; i++) await webhook({ message: { chat: { id: u.telegramId }, from: { id: u.telegramId, language_code: 'ru' }, successful_payment: p } });
}

const balance = async (userId: string) => (await db.query.gameWallets.findFirst({ where: eq(gameWallets.userId, userId) }))!.balance;
const grantPremium = (userId: string, days = 20) =>
  db.insert(subscriptions).values({ userId, planCode: 'ADMIN_GRANT', status: 'ACTIVE', startsAt: new Date(), expiresAt: new Date(Date.now() + days * 86_400_000) });

describe('Premium: награды за оплату', () => {
  it('первая оплата: приветственный бонус один раз; предоплаченный тариф — свой бонус за каждый платёж; повторная доставка ничего не добавляет', async () => {
    mockBot();
    const u = await login();
    const start = await balance(u.user.id);
    expect((await u.call('GET', '/api/premium')).body.bonuses.welcome.received).toBe(false);

    await pay(u, 'MONTH_3', `r1_${u.telegramId}`, 2);
    expect(await balance(u.user.id)).toBe(start + DEFAULT_REWARDS.premiumWelcomeZlotki + DEFAULT_REWARDS.premiumPlan3Zlotki);
    expect((await u.call('GET', '/api/premium')).body.bonuses.welcome.received).toBe(true);

    // Второй платёж (продление): приветственного бонуса уже нет, бонус тарифа — снова.
    const mid = await balance(u.user.id);
    await pay(u, 'MONTH_3', `r2_${u.telegramId}`);
    expect(await balance(u.user.id)).toBe(mid + DEFAULT_REWARDS.premiumPlan3Zlotki);
  });

  it('тариф на 12 месяцев — свой бонус; месячная подписка — только приветственный', async () => {
    mockBot();
    const year = await login();
    const y0 = await balance(year.user.id);
    await pay(year, 'MONTH_12', `y_${year.telegramId}`);
    expect(await balance(year.user.id)).toBe(y0 + DEFAULT_REWARDS.premiumWelcomeZlotki + DEFAULT_REWARDS.premiumPlan12Zlotki);

    const month = await login();
    const m0 = await balance(month.user.id);
    await pay(month, 'MONTH_1', `m_${month.telegramId}`);
    expect(await balance(month.user.id)).toBe(m0 + DEFAULT_REWARDS.premiumWelcomeZlotki);
  });

  it('суммы берутся из настроек нагород: владелец меняет их в админке без выкладки; 0 отключает награду', async () => {
    mockBot();
    await db.insert(gameConfig).values({ key: 'rewards', value: { premiumWelcomeZlotki: 0, premiumPlan3Zlotki: 10 } });
    invalidateRewards();
    const u = await login();
    const start = await balance(u.user.id);
    await pay(u, 'MONTH_3', `cfg_${u.telegramId}`);
    expect(await balance(u.user.id)).toBe(start + 10);
  });
});

describe('Premium: лояльность и подарок месяца', () => {
  /** Подарки прошлых месяцев уже получены: пишем их как обычные начисления, чтобы проверить номер текущего подарка. */
  const priorGifts = async (userId: string, n: number) => {
    for (let i = 0; i < n; i++) {
      await db.insert(walletTransactions).values({ userId, amount: DEFAULT_REWARDS.premiumGiftZlotki, reason: 'premium-gift', idempotencyKey: giftKey(userId, `2020-${String(i + 1).padStart(2, '0')}`) });
    }
  };

  it('1-й и 2-й подарок — без бонуса; 3-й, 6-й, 12-й добавляют бонус лояльности ровно один раз', async () => {
    for (const [prior, bonus] of [[0, 0], [1, 0], [2, DEFAULT_REWARDS.premiumLoyalty3Zlotki], [5, DEFAULT_REWARDS.premiumLoyalty6Zlotki], [11, DEFAULT_REWARDS.premiumLoyalty12Zlotki]] as const) {
      const u = await login();
      await grantPremium(u.user.id);
      await priorGifts(u.user.id, prior);
      const before = await balance(u.user.id);
      const r = await u.call('POST', '/api/premium/gift', {});
      expect(r.status, `подарок №${prior + 1}`).toBe(200);
      expect(r.body.loyaltyBonus).toBe(bonus);
      expect(await balance(u.user.id)).toBe(before + DEFAULT_REWARDS.premiumGiftZlotki + bonus);
      // Повторное получение в этом же месяце: отказ, баланс не меняется (бонус не удваивается).
      expect((await u.call('POST', '/api/premium/gift', {})).status).toBe(400);
      expect(await balance(u.user.id)).toBe(before + DEFAULT_REWARDS.premiumGiftZlotki + bonus);
    }
  });

  it('экран Premium показывает прогресс лояльности и сумму подарка из настроек', async () => {
    await db.insert(gameConfig).values({ key: 'rewards', value: { premiumGiftZlotki: 200, premiumLoyalty3Zlotki: 111 } });
    invalidateRewards();
    const u = await login();
    await grantPremium(u.user.id);
    await priorGifts(u.user.id, 2);
    const state = (await u.call('GET', '/api/premium')).body;
    expect(state.gift.zlotki).toBe(200);
    expect(state.gift.loyalty.claimed).toBe(2);
    expect(state.gift.loyalty.steps).toEqual([
      { at: 3, zlotki: 111, done: false },
      { at: 6, zlotki: DEFAULT_REWARDS.premiumLoyalty6Zlotki, done: false },
      { at: 12, zlotki: DEFAULT_REWARDS.premiumLoyalty12Zlotki, done: false },
    ]);
    const before = await balance(u.user.id);
    expect((await u.call('POST', '/api/premium/gift', {})).body).toMatchObject({ zlotki: 200, loyaltyBonus: 111, loyaltyAt: 3 });
    expect(await balance(u.user.id)).toBe(before + 200 + 111);
    expect((await u.call('GET', '/api/premium')).body.gift.loyalty.steps[0].done).toBe(true);
  });

  it('без Premium подарок не выдаётся и бонус лояльности тоже', async () => {
    const u = await login();
    const before = await balance(u.user.id);
    expect((await u.call('POST', '/api/premium/gift', {})).status).toBe(403);
    expect(await balance(u.user.id)).toBe(before);
  });
});

describe('Premium: можно ли купить', () => {
  it('без подписки — можно; с автопродлеваемой — нет; после отмены и с разовым тарифом — можно (срок прибавляется)', async () => {
    const u = await login();
    expect((await u.call('GET', '/api/premium')).body.canBuy).toBe(true);
    await db.insert(subscriptions).values({
      userId: u.user.id, planCode: 'MONTH_1', status: 'ACTIVE', startsAt: new Date(), expiresAt: new Date(Date.now() + 20 * 86_400_000), isRecurring: true, telegramChargeId: `cb_${u.telegramId}`,
    });
    expect((await u.call('GET', '/api/premium')).body.canBuy).toBe(false);
    await db.update(subscriptions).set({ status: 'CANCELLED' }).where(eq(subscriptions.userId, u.user.id));
    expect((await u.call('GET', '/api/premium')).body.canBuy).toBe(true);

    const once = await login();
    await db.insert(subscriptions).values({ userId: once.user.id, planCode: 'MONTH_3', status: 'ACTIVE', startsAt: new Date(), expiresAt: new Date(Date.now() + 40 * 86_400_000), isRecurring: false });
    expect((await once.call('GET', '/api/premium')).body.canBuy).toBe(true);
  });
});
