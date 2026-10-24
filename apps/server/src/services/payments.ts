/**
 * Premium через Telegram Stars (валюта XTR).
 *  • MONTH_1 — підписка Stars з автопродовженням (subscription_period = 30 днів, єдиний дозволений період);
 *  • MONTH_3 / MONTH_12 — разова оплата, що продовжує Premium на N місяців.
 * Premium активується ЛИШЕ після події successful_payment від Telegram (webhook),
 * з ідемпотентністю за telegram_payment_charge_id.
 */
import { randomBytes } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { tr, type I18n, type UiLang } from '@polski-go/shared';
import { prisma } from '../db';
import { badRequest, notFound } from '../lib/errors';
import { botApi } from '../lib/telegram';

export const STARS_SUBSCRIPTION_PERIOD = 2_592_000; // 30 днів у секундах

export async function listPlans() {
  return prisma.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
}

export async function createInvoice(userId: string, planCode: string, lang: UiLang) {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { code: planCode } });
  if (!plan || !plan.isActive) throw notFound('plan_not_found');
  const payload = `prem:${planCode}:${userId}:${randomBytes(6).toString('hex')}`;
  const title = `POLSKI GO Premium — ${tr(plan.title as I18n, lang)}`;
  const description = tr(
    {
      uk: 'Розширений AI-викладач, рольові ігри, аналітика помилок, додаткові іспити та ексклюзивна косметика бобра.',
      ru: 'Расширенный AI-преподаватель, ролевые игры, аналитика ошибок, дополнительные экзамены и эксклюзивная косметика бобра.',
      en: 'Extended AI tutor, role-plays, mistake analytics, extra mock exams and exclusive beaver cosmetics.',
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
  await prisma.paymentEvent.create({ data: { userId, type: 'INVOICE_CREATED', planCode, amount: plan.priceStars, currency: 'XTR', payload } });
  return { link, payload };
}

type PreCheckoutQuery = { id: string; from: { id: number }; currency: string; total_amount: number; invoice_payload: string };

/** Перевірка перед оплатою: інвойс наш, сума і користувач збігаються. */
export async function handlePreCheckout(q: PreCheckoutQuery) {
  let error: string | null = null;
  const invoice = await prisma.paymentEvent.findFirst({ where: { type: 'INVOICE_CREATED', payload: q.invoice_payload }, include: { user: true } });
  const plan = invoice?.planCode ? await prisma.subscriptionPlan.findUnique({ where: { code: invoice.planCode } }) : null;
  if (!invoice || !invoice.user) error = 'Invoice not found';
  else if (invoice.user.telegramId !== BigInt(q.from.id)) error = 'Invoice belongs to another user';
  else if (q.currency !== 'XTR') error = 'Unsupported currency';
  else if (!plan || q.total_amount !== invoice.amount) error = 'Price changed, please try again';
  else if (invoice.user.isBanned) error = 'Account is blocked';
  await prisma.paymentEvent.create({
    data: { userId: invoice?.userId, type: 'PRE_CHECKOUT', planCode: invoice?.planCode, amount: q.total_amount, currency: q.currency, payload: q.invoice_payload, error, raw: q as unknown as Prisma.InputJsonValue },
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
  return prisma.$transaction(async (tx) => {
    const [, planCode, userId] = p.invoice_payload.split(':');
    const user = await tx.user.findUnique({ where: { id: userId ?? '' } });
    const plan = planCode ? await tx.subscriptionPlan.findUnique({ where: { code: planCode } }) : null;
    // Подія записується першою: повторна доставка того ж платежу нічого не змінить.
    const { count } = await tx.paymentEvent.createMany({
      data: [{
        userId: user?.id ?? null, type: 'SUCCESSFUL_PAYMENT', planCode: planCode ?? null, amount: p.total_amount, currency: p.currency,
        chargeId: p.telegram_payment_charge_id, payload: p.invoice_payload, raw: p as unknown as Prisma.InputJsonValue,
        error: !user ? 'user_not_found' : !plan ? 'plan_not_found' : user.telegramId !== BigInt(fromId) ? 'user_mismatch' : null,
      }],
      skipDuplicates: true,
    });
    if (count === 0) return { duplicate: true };
    if (!user || !plan || user.telegramId !== BigInt(fromId)) return { duplicate: false, error: 'invalid_payment' };

    const now = new Date();
    const current = await tx.subscription.findFirst({
      where: { userId: user.id, status: { in: ['ACTIVE', 'CANCELLED'] }, expiresAt: { gt: now } },
      orderBy: { expiresAt: 'desc' },
    });
    const base = current && current.expiresAt > now ? current.expiresAt : now;
    const expiresAt = p.subscription_expiration_date
      ? new Date(p.subscription_expiration_date * 1000)
      : plan.recurring
        ? new Date(base.getTime() + STARS_SUBSCRIPTION_PERIOD * 1000)
        : addMonths(base, plan.months);

    if (plan.recurring && current?.isRecurring && p.is_recurring && !p.is_first_recurring) {
      // Автопродовження існуючої підписки Stars.
      await tx.subscription.update({ where: { id: current.id }, data: { expiresAt, status: 'ACTIVE', telegramChargeId: p.telegram_payment_charge_id, cancelledAt: null } });
    } else {
      await tx.subscription.create({
        data: { userId: user.id, planCode: plan.code, status: 'ACTIVE', startsAt: now, expiresAt, isRecurring: plan.recurring, telegramChargeId: p.telegram_payment_charge_id },
      });
    }
    return { duplicate: false, expiresAt };
  });
}

export async function handleRefund(chargeId: string) {
  const sub = await prisma.subscription.findUnique({ where: { telegramChargeId: chargeId } });
  await prisma.paymentEvent.create({ data: { userId: sub?.userId, type: 'REFUND', chargeId: null, payload: chargeId } });
  if (sub) await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'REFUNDED', expiresAt: new Date() } });
}

/** Скасувати автопродовження. Premium діє до кінця оплаченого періоду. */
export async function cancelSubscription(userId: string) {
  const sub = await prisma.subscription.findFirst({ where: { userId, status: 'ACTIVE', isRecurring: true, expiresAt: { gt: new Date() } }, orderBy: { expiresAt: 'desc' }, include: { user: true } });
  if (!sub || !sub.telegramChargeId) throw badRequest('no_recurring_subscription');
  await botApi('editUserStarSubscription', { user_id: Number(sub.user.telegramId), telegram_payment_charge_id: sub.telegramChargeId, is_canceled: true });
  await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
  await prisma.paymentEvent.create({ data: { userId, type: 'CANCEL', planCode: sub.planCode, payload: sub.telegramChargeId } });
  return { expiresAt: sub.expiresAt };
}
