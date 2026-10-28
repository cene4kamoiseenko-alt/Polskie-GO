/**
 * Premium через Telegram Stars (валюта XTR).
 *  • MONTH_1 — підписка Stars з автопродовженням (subscription_period = 30 днів, єдиний дозволений період);
 *  • MONTH_3 / MONTH_12 — разова оплата, що продовжує Premium на N місяців.
 * Premium активується ЛИШЕ після події successful_payment від Telegram (webhook),
 * з ідемпотентністю за telegram_payment_charge_id.
 */
import { randomBytes } from 'node:crypto';
import { and, desc, eq, gt, inArray } from 'drizzle-orm';
import { tr, type I18n, type UiLang } from '@polski-go/shared';
import { atomic, db, isUniqueViolation } from '../db';
import { paymentEvents, subscriptionPlans, subscriptions, users } from '../db/schema';
import { badRequest, notFound } from '../lib/errors';
import { botApi } from '../lib/telegram';

export const STARS_SUBSCRIPTION_PERIOD = 2_592_000; // 30 днів у секундах

export async function listPlans() {
  return db.query.subscriptionPlans.findMany({ where: eq(subscriptionPlans.isActive, true), orderBy: (p, { asc }) => asc(p.order) });
}

export async function createInvoice(userId: string, planCode: string, lang: UiLang) {
  const plan = await db.query.subscriptionPlans.findFirst({ where: eq(subscriptionPlans.code, planCode) });
  if (!plan || !plan.isActive) throw notFound('plan_not_found');
  const payload = `prem:${planCode}:${userId}:${randomBytes(6).toString('hex')}`;
  const title = `POLSKI GO Premium — ${tr(plan.title as I18n, lang)}`;
  const description = tr(
    // Лише те, що Premium справді дає (див. /terms у боті та екран Premium).
    {
      uk: 'Захист серії, сцени Premium (оренда, робота, лікар), удвічі більший ліміт XP за тренування, подарунок щомісяця й ексклюзивні речі для Бобека.',
      ru: 'Защита серии, сцены Premium (аренда, работа, врач), вдвое больший лимит XP за тренировки, подарок каждый месяц и эксклюзивные вещи для Бобека.',
      en: 'Streak shield, Premium scenes (renting, work, doctor), double XP limit for practice, a monthly gift and exclusive items for Bobek.',
    },
    lang,
  );
  const params: Record<string, unknown> = {
    title,
    description,
    payload,
    currency: 'XTR',
    prices: [{ label: title, amount: plan.priceStars }],
  };
  if (plan.recurring) params.subscription_period = STARS_SUBSCRIPTION_PERIOD;
  const link = await botApi<string>('createInvoiceLink', params);
  await db.insert(paymentEvents).values({ userId, type: 'INVOICE_CREATED', planCode, amount: plan.priceStars, currency: 'XTR', payload });
  return { link, payload };
}

type PreCheckoutQuery = { id: string; from: { id: number }; currency: string; total_amount: number; invoice_payload: string };

/** Перевірка перед оплатою: інвойс наш, сума і користувач збігаються. */
export async function handlePreCheckout(q: PreCheckoutQuery) {
  let error: string | null = null;
  const invoice = await db
    .select({ ev: paymentEvents, telegramId: users.telegramId, isBanned: users.isBanned })
    .from(paymentEvents)
    .leftJoin(users, eq(users.id, paymentEvents.userId))
    .where(and(eq(paymentEvents.type, 'INVOICE_CREATED'), eq(paymentEvents.payload, q.invoice_payload)))
    .get();
  const plan = invoice?.ev.planCode ? await db.query.subscriptionPlans.findFirst({ where: eq(subscriptionPlans.code, invoice.ev.planCode) }) : null;
  if (!invoice || invoice.telegramId == null) error = 'Invoice not found';
  else if (invoice.telegramId !== q.from.id) error = 'Invoice belongs to another user';
  else if (q.currency !== 'XTR') error = 'Unsupported currency';
  else if (!plan || q.total_amount !== invoice.ev.amount) error = 'Price changed, please try again';
  else if (invoice.isBanned) error = 'Account is blocked';
  await db.insert(paymentEvents).values({
    userId: invoice?.ev.userId ?? null, type: 'PRE_CHECKOUT', planCode: invoice?.ev.planCode ?? null, amount: q.total_amount, currency: q.currency, payload: q.invoice_payload, error, raw: q,
  });
  await botApi('answerPreCheckoutQuery', error ? { pre_checkout_query_id: q.id, ok: false, error_message: error } : { pre_checkout_query_id: q.id, ok: true });
  return { ok: !error, error };
}

export type SuccessfulPayment = {
  currency: string;
  total_amount: number;
  invoice_payload: string;
  telegram_payment_charge_id: string;
  provider_payment_charge_id?: string;
  subscription_expiration_date?: number;
  is_recurring?: boolean;
  is_first_recurring?: boolean;
};

function addMonths(d: Date, months: number) {
  const r = new Date(d);
  r.setUTCMonth(r.getUTCMonth() + months);
  return r;
}

/** Обробка успішного платежу (ідемпотентно за charge id). */
export async function handleSuccessfulPayment(fromId: number, p: SuccessfulPayment) {
  const [, planCode, userId] = p.invoice_payload.split(':');
  const [userRow, planRow, invoiceRow] = await db.batch([
    db.select().from(users).where(eq(users.id, userId ?? '')),
    db.select().from(subscriptionPlans).where(eq(subscriptionPlans.code, planCode ?? '')),
    db.select().from(paymentEvents).where(and(eq(paymentEvents.type, 'INVOICE_CREATED'), eq(paymentEvents.payload, p.invoice_payload))).limit(1),
  ]);
  const user = userRow[0];
  const plan = planRow[0];
  const invoice = invoiceRow[0];
  // Premium — только по нашему счёту: тот же payload, пользователь, тариф, валюта Stars и сумма.
  // Защищает и от подделанного обновления, если секрет webhook когда-либо утечёт.
  const invalid = !user
    ? 'user_not_found'
    : !plan
      ? 'plan_not_found'
      : user.telegramId !== fromId
        ? 'user_mismatch'
        : !invoice || invoice.userId !== user.id || invoice.planCode !== plan.code
          ? 'invoice_not_found'
          : p.currency !== 'XTR'
            ? 'currency_mismatch'
            : p.total_amount !== invoice.amount
              ? 'amount_mismatch'
              : null;
  // Подія з унікальним charge id — першою в пакеті: повторна доставка того ж платежу відкотить пакет.
  const event = db.insert(paymentEvents).values({
    userId: user?.id ?? null, type: 'SUCCESSFUL_PAYMENT', planCode: planCode ?? null, amount: p.total_amount, currency: p.currency,
    chargeId: p.telegram_payment_charge_id, payload: p.invoice_payload, raw: p, error: invalid,
  });
  try {
    if (invalid || !user || !plan) {
      await atomic([event]);
      // Зірки вже списано, а Premium за таким платежем не видаємо (pre_checkout мав його відхилити) — повертаємо їх одразу,
      // щоб людина не заплатила за ніщо. Підроблене оновлення повернення не пройде: такого платежу в Telegram немає.
      const refunded = await botApi('refundStarPayment', { user_id: fromId, telegram_payment_charge_id: p.telegram_payment_charge_id }).then(
        () => true,
        (e) => (console.warn('payment: auto refund failed', (e as Error).message), false),
      );
      if (refunded) {
        await db.insert(paymentEvents).values({ userId: user?.id ?? null, type: 'REFUND', planCode: planCode ?? null, amount: p.total_amount, currency: p.currency, payload: p.telegram_payment_charge_id, error: `auto:${invalid}` });
      }
      return { duplicate: false, error: 'invalid_payment', refunded };
    }
    const now = new Date();
    const current = await db.query.subscriptions.findFirst({
      where: and(eq(subscriptions.userId, user.id), inArray(subscriptions.status, ['ACTIVE', 'CANCELLED']), gt(subscriptions.expiresAt, now)),
      orderBy: desc(subscriptions.expiresAt),
    });
    const base = current && current.expiresAt > now ? current.expiresAt : now;
    const expiresAt = p.subscription_expiration_date
      ? new Date(p.subscription_expiration_date * 1000)
      : plan.recurring
        ? new Date(base.getTime() + STARS_SUBSCRIPTION_PERIOD * 1000)
        : addMonths(base, plan.months);

    const write =
      plan.recurring && current?.isRecurring && p.is_recurring && !p.is_first_recurring
        ? // Автопродовження існуючої підписки Stars.
          db.update(subscriptions).set({ expiresAt, status: 'ACTIVE', telegramChargeId: p.telegram_payment_charge_id, cancelledAt: null }).where(eq(subscriptions.id, current.id))
        : db.insert(subscriptions).values({ userId: user.id, planCode: plan.code, status: 'ACTIVE', startsAt: now, expiresAt, isRecurring: plan.recurring, telegramChargeId: p.telegram_payment_charge_id });
    await atomic([event, write]);
    return { duplicate: false, expiresAt };
  } catch (e) {
    if (isUniqueViolation(e)) return { duplicate: true };
    throw e;
  }
}

/**
 * Зірки за платіж повернуто (refunded_payment від Telegram або повернення з адмінки). Premium за цим платежем знімається одразу:
 * підписка, оплачена саме цим платежем, отримує REFUNDED і закінчується зараз. Повторна доставка нічого не змінює.
 * Автопродовження Stars зберігає charge id останнього платежу — повернення старішого продовження лише записується в журнал.
 */
export async function handleRefund(chargeId: string) {
  const [subRows, paidRows, doneRows] = await db.batch([
    db.select().from(subscriptions).where(eq(subscriptions.telegramChargeId, chargeId)),
    db.select().from(paymentEvents).where(and(eq(paymentEvents.type, 'SUCCESSFUL_PAYMENT'), eq(paymentEvents.chargeId, chargeId))).limit(1),
    db.select({ id: paymentEvents.id }).from(paymentEvents).where(and(eq(paymentEvents.type, 'REFUND'), eq(paymentEvents.payload, chargeId))).limit(1),
  ]);
  const sub = subRows[0];
  const paid = paidRows[0];
  const userId = sub?.userId ?? paid?.userId ?? null;
  const revoke = !!sub && sub.status !== 'REFUNDED';
  if (doneRows.length && !revoke) return { duplicate: true, revoked: false, userId };
  await atomic([
    !doneRows.length && db.insert(paymentEvents).values({ userId, type: 'REFUND', planCode: paid?.planCode ?? sub?.planCode ?? null, amount: paid?.amount ?? null, currency: paid?.currency ?? 'XTR', payload: chargeId }),
    revoke && db.update(subscriptions).set({ status: 'REFUNDED', expiresAt: new Date() }).where(eq(subscriptions.id, sub.id)),
  ]);
  return { duplicate: false, revoked: revoke, userId };
}

/** Повернення з адмінки: Telegram повертає зірки, Premium за платежем знімається (handleRefund). */
export async function refundPayment(chargeId: string) {
  const row = await db
    .select({ ev: paymentEvents, telegramId: users.telegramId })
    .from(paymentEvents)
    .innerJoin(users, eq(users.id, paymentEvents.userId))
    .where(and(eq(paymentEvents.type, 'SUCCESSFUL_PAYMENT'), eq(paymentEvents.chargeId, chargeId)))
    .get();
  if (!row) throw notFound('payment_not_found');
  await botApi('refundStarPayment', { user_id: row.telegramId, telegram_payment_charge_id: chargeId });
  return handleRefund(chargeId);
}

/** Скасувати автопродовження. Premium діє до кінця оплаченого періоду. */
export async function cancelSubscription(userId: string) {
  const row = await db
    .select({ sub: subscriptions, telegramId: users.telegramId })
    .from(subscriptions)
    .innerJoin(users, eq(users.id, subscriptions.userId))
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'ACTIVE'), eq(subscriptions.isRecurring, true), gt(subscriptions.expiresAt, new Date())))
    .orderBy(desc(subscriptions.expiresAt))
    .get();
  if (!row || !row.sub.telegramChargeId) throw badRequest('no_recurring_subscription');
  const { sub } = row;
  await botApi('editUserStarSubscription', { user_id: row.telegramId, telegram_payment_charge_id: sub.telegramChargeId, is_canceled: true });
  await atomic([
    db.update(subscriptions).set({ status: 'CANCELLED', cancelledAt: new Date() }).where(eq(subscriptions.id, sub.id)),
    db.insert(paymentEvents).values({ userId, type: 'CANCEL', planCode: sub.planCode, payload: sub.telegramChargeId }),
  ]);
  return { expiresAt: sub.expiresAt };
}
