/** Webhook Telegram-бота: /start, платежі Stars. */
import { Hono } from 'hono';
import { timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { config } from '../env';
import { db } from '../db';
import { userSettings, users } from '../db/schema';
import { body, type AppEnv } from '../hono';
import { HttpError } from '../lib/errors';
import { botApi } from '../lib/telegram';
import { handlePreCheckout, handleRefund, handleSuccessfulPayment, type SuccessfulPayment } from '../services/payments';

type Update = {
  update_id: number;
  message?: {
    chat: { id: number };
    from?: { id: number; first_name?: string; language_code?: string };
    text?: string;
    successful_payment?: SuccessfulPayment;
    refunded_payment?: { telegram_payment_charge_id: string };
  };
  pre_checkout_query?: { id: string; from: { id: number }; currency: string; total_amount: number; invoice_payload: string };
};

const WELCOME: Record<string, string> = {
  uk: '🦫 Cześć! Я бобер Бобек. Разом подорожуватимемо Польщею і вивчатимемо польську!\n\nВивчай польську. Подорожуй. Перемагай!',
  ru: '🦫 Cześć! Я бобр Бобек. Вместе будем путешествовать по Польше и учить польский!',
  en: '🦫 Cześć! I\'m Bobek the beaver. Let\'s travel around Poland and learn Polish together!',
  pl: '🦫 Cześć! Jestem bóbr Bobek. Razem będziemy podróżować po Polsce i uczyć się polskiego!',
};

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const telegramRoutes = new Hono<AppEnv>();

telegramRoutes.post('/webhook', async (c) => {
  const secret = c.req.header('x-telegram-bot-api-secret-token');
  if (!config.webhookSecret || typeof secret !== 'string' || !safeEqual(secret, config.webhookSecret)) {
    throw new HttpError(401, 'unauthorized');
  }
  const update = (await body(c)) as Update;

  if (update.pre_checkout_query) {
    await handlePreCheckout(update.pre_checkout_query);
    return c.json({ ok: true });
  }
  const msg = update.message;
  if (msg?.successful_payment && msg.from) {
    const res = await handleSuccessfulPayment(msg.from.id, msg.successful_payment);
    if (!res.duplicate && !('error' in res && res.error)) {
      await botApi('sendMessage', { chat_id: msg.chat.id, text: '👑 Premium активовано! Dziękujemy! 🦫' }).catch(() => {});
    }
    return c.json({ ok: true });
  }
  if (msg?.refunded_payment) {
    await handleRefund(msg.refunded_payment.telegram_payment_charge_id);
    return c.json({ ok: true });
  }
  if (msg?.text?.startsWith('/start')) {
    const param = msg.text.split(' ')[1];
    const lang = (msg.from?.language_code ?? 'uk').slice(0, 2);
    const url = new URL(config.webAppUrl);
    if (param) url.searchParams.set('startapp', param);
    await botApi('sendMessage', {
      chat_id: msg.chat.id,
      text: WELCOME[lang] ?? WELCOME.uk,
      reply_markup: { inline_keyboard: [[{ text: '🚀 POLSKI GO', web_app: { url: url.toString() } }]] },
    });
    return c.json({ ok: true });
  }
  if (msg?.text === '/stop' && msg.from) {
    // Відмова від нагадувань.
    const user = await db.query.users.findFirst({ where: eq(users.telegramId, msg.from.id) });
    if (user) await db.update(userSettings).set({ notificationsEnabled: false }).where(eq(userSettings.userId, user.id));
    await botApi('sendMessage', { chat_id: msg.chat.id, text: '🔕 Нагадування вимкнено.' });
  }
  return c.json({ ok: true });
});
