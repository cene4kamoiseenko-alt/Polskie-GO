/**
 * Підтримка з оплат (/paysupport у боті — вимога Telegram для оплат у Stars).
 * /paysupport відкриває звернення (AWAITING); наступне звичайне повідомлення людини протягом години стає його текстом (OPEN).
 * Адмінка бачить звернення разом із платежами людини, відповідає в бот (DONE) і за потреби повертає зірки.
 */
import { and, desc, eq, gt, inArray } from 'drizzle-orm';
import { db } from '../db';
import { paymentEvents, supportRequests, userSettings, users } from '../db/schema';
import { badRequest, notFound } from '../lib/errors';
import { botApi, TelegramError } from '../lib/telegram';
import { COPY } from '../bot/copy';
import { pickLang } from '../bot/data';

/** Скільки чекаємо на текст звернення після /paysupport. */
export const SUPPORT_WAIT_MS = 60 * 60_000;
const MAX_TEXT = 2000;

/** /paysupport: нове звернення чекає на текст (попереднє незаповнене замінюється). */
export async function openSupport(telegramId: number, userId: string | null, now = new Date()) {
  await db.batch([
    db.delete(supportRequests).where(and(eq(supportRequests.telegramId, telegramId), eq(supportRequests.status, 'AWAITING'))),
    db.insert(supportRequests).values({ telegramId, userId, status: 'AWAITING', createdAt: now, updatedAt: now }),
  ]);
}

/**
 * Кнопка «Підтримка з оплати» на екрані Premium: відкриває звернення і сама надсилає в чат бота підказку «опишіть одним повідомленням»
 * (те саме, що відповідь на /paysupport). Так людина бачить реакцію в чаті, а не покладається на те, що Telegram відкриє посилання
 * на чат бота з-під Mini App (з Bot API 7.0 застосунок не закривається сам, і чат лишається під ним).
 * `sent: false` — Telegram не прийняв повідомлення (бота не запускали або заблокували): застосунок відкриє посилання з параметром
 * start=paysupport, яке запускає ту саму підтримку; звернення вже чекає на текст.
 */
export async function openSupportFromApp(userId: string, now = new Date()): Promise<{ sent: boolean }> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  // Гість (вхід поза Telegram) не має чату з ботом.
  if (!user || user.telegramId <= 0) throw badRequest('no_telegram');
  const settings = await db.query.userSettings.findFirst({ where: eq(userSettings.userId, userId) });
  const lang = pickLang(settings?.uiLanguage, null);
  await openSupport(user.telegramId, userId, now);
  try {
    await botApi('sendMessage', { chat_id: user.telegramId, text: COPY[lang].premium.paySupport });
    return { sent: true };
  } catch (e) {
    // 403 — бота не запускали або заблокували, 400 — чат не знайдено: це не збій, а підстава відкрити посилання зі стартом.
    if (e instanceof TelegramError && (e.code === 403 || e.code === 400)) return { sent: false };
    throw e;
  }
}

/** Звичайне повідомлення: якщо людина щойно відкрила підтримку — це текст звернення. true — повідомлення прийнято. */
export async function captureSupportText(telegramId: number, text: string, now = new Date()): Promise<boolean> {
  const body = text.trim().slice(0, MAX_TEXT);
  if (!body) return false;
  const rows = await db
    .update(supportRequests)
    .set({ text: body, status: 'OPEN', updatedAt: now })
    .where(and(eq(supportRequests.telegramId, telegramId), eq(supportRequests.status, 'AWAITING'), gt(supportRequests.createdAt, new Date(now.getTime() - SUPPORT_WAIT_MS))))
    .returning({ id: supportRequests.id });
  return rows.length > 0;
}

/** Звернення для адмінки (спершу відкриті) з платежами людини. */
export async function listSupport(status: 'OPEN' | 'DONE' | 'all' = 'OPEN') {
  const rows = await db
    .select({ r: supportRequests, firstName: users.firstName, username: users.username })
    .from(supportRequests)
    .leftJoin(users, eq(users.id, supportRequests.userId))
    .where(status === 'all' ? inArray(supportRequests.status, ['OPEN', 'DONE']) : eq(supportRequests.status, status))
    .orderBy(desc(supportRequests.createdAt))
    .limit(100);
  const ids = [...new Set(rows.map((x) => x.r.userId).filter((x): x is string => !!x))];
  const payments = ids.length
    ? await db.select().from(paymentEvents).where(and(inArray(paymentEvents.userId, ids), inArray(paymentEvents.type, ['SUCCESSFUL_PAYMENT', 'REFUND']))).orderBy(desc(paymentEvents.createdAt)).limit(300)
    : [];
  return rows.map(({ r, firstName, username }) => ({
    ...r,
    telegramId: String(r.telegramId),
    user: r.userId ? { id: r.userId, firstName, username } : null,
    payments: payments.filter((p) => p.userId === r.userId).map((p) => ({ type: p.type, planCode: p.planCode, amount: p.amount, chargeId: p.chargeId ?? p.payload, error: p.error, createdAt: p.createdAt })),
  }));
}

/** Відповідь з адмінки: повідомлення в бот і закриття звернення. */
export async function replySupport(id: string, text: string) {
  const body = text.trim();
  if (!body) throw badRequest('empty_reply');
  const r = await db.query.supportRequests.findFirst({ where: eq(supportRequests.id, id) });
  if (!r || r.status === 'AWAITING') throw notFound('support_not_found');
  await botApi('sendMessage', { chat_id: r.telegramId, text: `💬 POLSKI GO\n\n${body.slice(0, 3500)}` });
  await db.update(supportRequests).set({ status: 'DONE', reply: body, updatedAt: new Date() }).where(eq(supportRequests.id, id));
  return { ok: true };
}

/** Закрити без відповіді (вирішено іншим шляхом). */
export async function closeSupport(id: string) {
  await db.update(supportRequests).set({ status: 'DONE', updatedAt: new Date() }).where(and(eq(supportRequests.id, id), eq(supportRequests.status, 'OPEN')));
  return { ok: true };
}
