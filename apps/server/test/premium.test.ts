/**
 * Premium: оплата в Stars і її межі (повторна доставка, повернення, недійсний платіж, скасування, кінець періоду), вимоги Telegram
 * (/paysupport, /terms) і те, що дає Premium: щит серії, удвічі вищий ліміт XP тренувань, сцени Premium, подарунок місяця,
 * значок у рейтингу. Без ключа ШІ застосунок не обіцяє ШІ (ai.configured).
 */
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { and, count, eq } from 'drizzle-orm';
import { addDays, dayKey } from '@polski-go/shared';
import { db } from '../src/db';
import { gameConfig, gameWallets, paymentEvents, playerProgress, subscriptions, supportRequests, userInventory } from '../src/db/schema';
import { disposeEnv, login, playSession, request } from './helpers';

type Call = { method: string; body: Record<string, any> };

function mockBot(fail?: (method: string) => boolean) {
  const calls: Call[] = [];
  const realFetch = globalThis.fetch;
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    if (!String(url).startsWith('https://api.telegram.org/')) return realFetch(url as never, init);
    const method = String(url).split('/').pop()!;
    const body = JSON.parse(String(init?.body ?? '{}'));
    calls.push({ method, body });
    if (fail?.(method)) return new Response(JSON.stringify({ ok: false, error_code: 400, description: 'Bad Request: CHARGE_NOT_FOUND' }), { status: 400 });
    const result = method === 'createInvoiceLink' ? 'https://t.me/$invoice123' : method === 'sendMessage' ? { message_id: 1 } : true;
    return new Response(JSON.stringify({ ok: true, result }), { status: 200 });
  });
  return calls;
}

let upd = 70_000;
const webhook = (payload: Record<string, unknown>) => request('POST', '/telegram/webhook', { update_id: ++upd, ...payload }, { 'x-telegram-bot-api-secret-token': 'hook-secret' });
const say = (telegramId: number, text: string, language_code = 'ru') =>
  webhook({ message: { message_id: upd, chat: { id: telegramId, type: 'private' }, from: { id: telegramId, first_name: 'Ola', language_code }, text } });

/** Повна оплата тарифу через webhook (рахунок → pre_checkout → successful_payment). */
async function pay(u: Awaited<ReturnType<typeof login>>, plan: 'MONTH_1' | 'MONTH_3', charge = `ch_${u.telegramId}_${plan}`) {
  const inv = await u.call('POST', '/api/premium/invoice', { plan });
  const amount = plan === 'MONTH_1' ? 250 : 600;
  await webhook({ pre_checkout_query: { id: `q${upd}`, from: { id: u.telegramId }, currency: 'XTR', total_amount: amount, invoice_payload: inv.body.payload } });
  const p = {
    currency: 'XTR', total_amount: amount, invoice_payload: inv.body.payload, telegram_payment_charge_id: charge,
    ...(plan === 'MONTH_1' ? { subscription_expiration_date: Math.floor(Date.now() / 1000) + 30 * 86400, is_recurring: true, is_first_recurring: true } : {}),
  };
  await webhook({ message: { chat: { id: u.telegramId }, from: { id: u.telegramId, language_code: 'ru' }, successful_payment: p } });
  return { charge, payload: inv.body.payload as string };
}

async function adminLogin() {
  const res = await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' });
  return (method: 'GET' | 'POST', path: string, payload?: unknown) => request(method, `/api/admin${path}`, payload, { authorization: `Bearer ${res.body.token}` });
}

afterEach(() => vi.restoreAllMocks());
afterAll(disposeEnv);

describe('оплата Premium: межі', () => {
  it('повернення зірок одразу вимикає Premium; повторна доставка повернення нічого не змінює; повідомлення — мовою користувача', async () => {
    const calls = mockBot();
    const u = await login();
    const { charge } = await pay(u, 'MONTH_1');
    expect((await u.call('GET', '/api/me')).body.premium.active).toBe(true);
    expect(calls.find((c) => c.method === 'sendMessage' && c.body.chat_id === u.telegramId)?.body.text).toContain('Premium активовано');

    await webhook({ message: { chat: { id: u.telegramId }, from: { id: u.telegramId }, refunded_payment: { currency: 'XTR', total_amount: 250, telegram_payment_charge_id: charge, invoice_payload: 'x' } } });
    expect((await u.call('GET', '/api/me')).body.premium.active).toBe(false);
    expect((await db.select().from(subscriptions).where(eq(subscriptions.userId, u.user.id)))[0].status).toBe('REFUNDED');
    expect(calls.at(-1)).toMatchObject({ method: 'sendMessage', body: { text: expect.stringContaining('Зірки за Premium повернуто') } });

    const before = calls.length;
    await webhook({ message: { chat: { id: u.telegramId }, from: { id: u.telegramId }, refunded_payment: { currency: 'XTR', total_amount: 250, telegram_payment_charge_id: charge, invoice_payload: 'x' } } });
    expect(calls.length).toBe(before);
    expect((await db.select({ n: count() }).from(paymentEvents).where(and(eq(paymentEvents.type, 'REFUND'), eq(paymentEvents.payload, charge))))[0].n).toBe(1);
  });

  it('недійсний платіж (не той користувач) не дає Premium і зірки повертаються автоматично; повернення не вдалося — без запису', async () => {
    const calls = mockBot((m) => m === 'refundStarPayment' && calls.filter((c) => c.method === 'refundStarPayment').length > 1);
    const u = await login();
    const other = await login();
    const inv = await u.call('POST', '/api/premium/invoice', { plan: 'MONTH_1' });
    // Оплатив інший користувач (рахунок переслали): pre_checkout це відхиляє, але якщо платіж таки пройшов — повертаємо.
    await webhook({ message: { chat: { id: other.telegramId }, from: { id: other.telegramId }, successful_payment: { currency: 'XTR', total_amount: 250, invoice_payload: inv.body.payload, telegram_payment_charge_id: `bad_${u.telegramId}` } } });
    expect(calls.find((c) => c.method === 'refundStarPayment')?.body).toEqual({ user_id: other.telegramId, telegram_payment_charge_id: `bad_${u.telegramId}` });
    expect((await u.call('GET', '/api/me')).body.premium.active).toBe(false);
    expect((await other.call('GET', '/api/me')).body.premium.active).toBe(false);
    expect(await db.select({ error: paymentEvents.error }).from(paymentEvents).where(and(eq(paymentEvents.type, 'REFUND'), eq(paymentEvents.payload, `bad_${u.telegramId}`)))).toEqual([{ error: 'auto:user_mismatch' }]);
    expect(calls.at(-1)).toMatchObject({ method: 'sendMessage', body: { chat_id: other.telegramId } });

    // Друге недійсне: Telegram повернення не прийняв (підробка) — у журналі лише сам платіж з помилкою, без REFUND.
    await webhook({ message: { chat: { id: other.telegramId }, from: { id: other.telegramId }, successful_payment: { currency: 'XTR', total_amount: 1, invoice_payload: inv.body.payload, telegram_payment_charge_id: `bad2_${u.telegramId}` } } });
    expect((await db.select({ n: count() }).from(paymentEvents).where(and(eq(paymentEvents.type, 'REFUND'), eq(paymentEvents.payload, `bad2_${u.telegramId}`))))[0].n).toBe(0);
  });

  it('скасоване автопродовження: Premium до кінця періоду, після — вимкнений; разовий тариф без автопродовження не скасовується', async () => {
    mockBot();
    const u = await login();
    await pay(u, 'MONTH_1');
    expect((await u.call('POST', '/api/premium/cancel')).status).toBe(200);
    expect((await u.call('GET', '/api/me')).body.premium).toMatchObject({ active: true, cancelled: true });
    await db.update(subscriptions).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(subscriptions.userId, u.user.id));
    expect((await u.call('GET', '/api/me')).body.premium.active).toBe(false);
    expect((await u.call('GET', '/api/premium')).body.subscription).toBeNull();

    const v = await login();
    await pay(v, 'MONTH_3');
    expect((await v.call('POST', '/api/premium/cancel')).body.error).toBe('no_recurring_subscription');
  });

  it('адмінка: повернення платежу через Telegram знімає Premium (SUPERADMIN)', async () => {
    const calls = mockBot();
    const u = await login();
    const { charge } = await pay(u, 'MONTH_3');
    const admin = await adminLogin();
    const r = await admin('POST', '/payments/refund', { chargeId: charge });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ revoked: true });
    expect(calls.find((c) => c.method === 'refundStarPayment')?.body).toEqual({ user_id: u.telegramId, telegram_payment_charge_id: charge });
    expect((await u.call('GET', '/api/me')).body.premium.active).toBe(false);
    expect((await admin('POST', '/payments/refund', { chargeId: 'nope' })).status).toBe(404);
  });
});

describe('вимоги Telegram: /terms і /paysupport', () => {
  it('/terms — умови; /paysupport — наступне повідомлення стає зверненням, адмінка відповідає в бот і закриває', async () => {
    const calls = mockBot();
    const u = await login();
    await pay(u, 'MONTH_1');
    await say(u.telegramId, '/terms');
    // Мова — з налаштувань користувача (українська), а не з мови Telegram у повідомленні.
    expect(calls.at(-1)!.body.text).toContain('Умови POLSKI GO Premium');
    expect(calls.at(-1)!.body.text).toContain('/paysupport');

    await say(u.telegramId, '/paysupport');
    expect(calls.at(-1)!.body.text).toContain('Підтримка з оплати');
    await say(u.telegramId, 'Оплатил месяц, а Premium пропал');
    expect(calls.at(-1)!.body.text).toContain('Повідомлення передано в підтримку');
    // Наступний текст — уже не звернення, а звичайна відповідь бота.
    await say(u.telegramId, 'привіт');
    expect(calls.at(-1)!.body.text ?? calls.at(-1)!.body.caption).not.toContain('Повідомлення передано');

    const admin = await adminLogin();
    const list = await admin('GET', '/support');
    const req = list.body.items.find((x: { telegramId: string }) => x.telegramId === String(u.telegramId));
    expect(req).toMatchObject({ status: 'OPEN', text: 'Оплатил месяц, а Premium пропал', user: { id: u.user.id } });
    expect(req.payments.map((p: { type: string }) => p.type)).toContain('SUCCESSFUL_PAYMENT');
    expect((await admin('POST', `/support/${req.id}/reply`, { text: 'Проверили: Premium активен до конца месяца.' })).status).toBe(200);
    expect(calls.at(-1)).toMatchObject({ method: 'sendMessage', body: { chat_id: u.telegramId, text: expect.stringContaining('Premium активен до конца месяца') } });
    expect((await db.select().from(supportRequests).where(eq(supportRequests.id, req.id)))[0]).toMatchObject({ status: 'DONE', reply: 'Проверили: Premium активен до конца месяца.' });
  });

  it('текст через час после /paysupport — уже не обращение', async () => {
    mockBot();
    const tg = 7_730_001;
    await say(tg, '/paysupport');
    await db.update(supportRequests).set({ createdAt: new Date(Date.now() - 61 * 60_000) }).where(eq(supportRequests.telegramId, tg));
    await say(tg, 'поздно');
    expect((await db.select().from(supportRequests).where(eq(supportRequests.telegramId, tg)))[0].status).toBe('AWAITING');
  });
});

describe('що дає Premium', () => {
  it('щит серії: з Premium один пропущений день не скидає серію, без Premium — скидає', async () => {
    mockBot();
    const prem = await login();
    await pay(prem, 'MONTH_3');
    const free = await login();
    const today = dayKey(new Date(), 'Europe/Warsaw');
    for (const u of [prem, free]) {
      await db.update(playerProgress).set({ streakCurrent: 5, streakBest: 5, lastActiveDay: addDays(today, -2), streakShieldDay: null }).where(eq(playerProgress.userId, u.user.id));
    }
    expect((await prem.call('GET', '/api/me')).body.progress.streak).toBe(5);
    expect((await prem.call('GET', '/api/me')).body.premium.shield).toMatchObject({ ready: true, usedOn: null });
    expect((await free.call('GET', '/api/me')).body.progress.streak).toBe(0);

    for (const u of [prem, free]) {
      const s = await u.call('POST', '/api/sessions', { mode: 'FIVE_MIN' });
      await playSession(u.call, s.body.sessionId);
    }
    const p = (await db.select().from(playerProgress).where(eq(playerProgress.userId, prem.user.id)))[0];
    expect(p).toMatchObject({ streakCurrent: 6, streakShieldDay: addDays(today, -1), lastActiveDay: today });
    expect((await prem.call('GET', '/api/me')).body.premium.shield).toMatchObject({ ready: false, usedOn: addDays(today, -1), readyOn: addDays(today, 6) });
    expect((await db.select().from(playerProgress).where(eq(playerProgress.userId, free.user.id)))[0].streakCurrent).toBe(1);
  });

  it('ліміт XP тренувань з Premium — удвічі вищий', async () => {
    mockBot();
    const prem = await login();
    await pay(prem, 'MONTH_3');
    await db.update(gameConfig).set({ value: { practiceXpDailyCap: 30 } }).where(eq(gameConfig.key, 'rewards'));
    (await import('../src/services/gameConfig')).invalidateRewards();
    try {
      let xp = 0;
      for (let i = 0; i < 3; i++) {
        const s = await prem.call('POST', '/api/sessions', { mode: 'FIVE_MIN' });
        xp += (await playSession(prem.call, s.body.sessionId)).body.xp;
      }
      expect(xp).toBe(60);
    } finally {
      await db.update(gameConfig).set({ value: {} }).where(eq(gameConfig.key, 'rewards'));
      (await import('../src/services/gameConfig')).invalidateRewards();
    }
  });

  it('сцени Premium: без Premium — замок і 403, з Premium — відкриваються; «скоро» більше немає', async () => {
    mockBot();
    const free = await login();
    const list = (await free.call('GET', '/api/missions')).body;
    const premium = list.missions.filter((m: { premium: boolean }) => m.premium);
    expect(premium.map((m: { slug: string }) => m.slug)).toEqual(['landlord', 'first-workday', 'doctor-appointment']);
    expect(premium.every((m: { locked: boolean; steps: number }) => m.locked && m.steps === 7)).toBe(true);
    expect(list.missions.filter((m: { locked: boolean }) => m.locked)).toHaveLength(3);
    expect(list.soon).toEqual([]);
    expect((await free.call('POST', '/api/missions/landlord/start')).body.error).toBe('premium_required');

    const prem = await login();
    await pay(prem, 'MONTH_3');
    expect((await prem.call('GET', '/api/missions')).body.missions.some((m: { locked: boolean }) => m.locked)).toBe(false);
    const run = await prem.call('POST', '/api/missions/doctor-appointment/start');
    expect(run.status).toBe(200);
    expect(run.body.mission.steps).toHaveLength(7);
  });

  it('подарунок місяця: без Premium — 403; з Premium — 150 Złotki і річ Premium один раз на місяць', async () => {
    mockBot();
    const free = await login();
    expect((await free.call('GET', '/api/premium')).body.gift).toMatchObject({ ready: false, claimed: false, zlotki: 150 });
    expect((await free.call('POST', '/api/premium/gift')).body.error).toBe('premium_required');

    const prem = await login();
    await pay(prem, 'MONTH_3');
    const balance = async () => (await db.select().from(gameWallets).where(eq(gameWallets.userId, prem.user.id)))[0].balance;
    const start = await balance();
    expect((await prem.call('GET', '/api/me')).body.premium.giftReady).toBe(true);
    const gift = (await prem.call('GET', '/api/premium')).body.gift;
    expect(gift).toMatchObject({ ready: true, claimed: false, item: { slug: expect.any(String) } });
    const r = await prem.call('POST', '/api/premium/gift');
    expect(r.body).toMatchObject({ zlotki: 150, item: { slug: gift.item.slug } });
    expect(await balance()).toBe(start + 150);
    expect((await db.select().from(userInventory).where(and(eq(userInventory.userId, prem.user.id), eq(userInventory.itemId, gift.item.id)))).length).toBe(1);
    expect((await prem.call('POST', '/api/premium/gift')).body.error).toBe('already_claimed');
    expect(await balance()).toBe(start + 150);
    expect((await prem.call('GET', '/api/me')).body.premium.giftReady).toBe(false);
  });

  it('значок Premium у рейтингу; без ключа ШІ застосунок не показує ШІ', async () => {
    mockBot();
    const prem = await login();
    await pay(prem, 'MONTH_3');
    const s = await prem.call('POST', '/api/sessions', { mode: 'FIVE_MIN' });
    await playSession(prem.call, s.body.sessionId);
    const board = (await prem.call('GET', '/api/leaderboard?scope=all')).body;
    expect(board.rows.find((r: { isMe: boolean }) => r.isMe)).toMatchObject({ premium: true });
    expect((await prem.call('GET', '/api/me')).body.ai).toMatchObject({ configured: false });
  });
});
