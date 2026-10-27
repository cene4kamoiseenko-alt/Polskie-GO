/**
 * Webhook Telegram-бота: команды (фото + текст + кнопки Mini App), платежі Stars і повернення.
 * Повторна доставка того самого update_id не відповідає вдруге; про тимчасові збої Telegram (429, 5xx, мережа)
 * сервер відповідає 503, і Telegram повторює оновлення.
 */
import { Hono } from 'hono';
import { timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { config } from '../env';
import { db } from '../db';
import { telegramUpdates } from '../db/schema';
import { body, type AppEnv } from '../hono';
import { HttpError } from '../lib/errors';
import { botApi, TelegramError } from '../lib/telegram';
import { handleBotMessage, type BotMessage } from '../bot/handler';
import { runSetup } from '../bot/setup';
import { handlePreCheckout, handleRefund, handleSuccessfulPayment, type SuccessfulPayment } from '../services/payments';

type Update = {
  update_id: number;
  message?: BotMessage & {
    successful_payment?: SuccessfulPayment;
    refunded_payment?: { telegram_payment_charge_id: string };
  };
  pre_checkout_query?: { id: string; from: { id: number }; currency: string; total_amount: number; invoice_payload: string };
};

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Зайняти update_id: false — це оновлення вже обробляли. Якщо базу не прочитати, обробляємо без захисту від дубля. */
async function claimUpdate(updateId: number): Promise<boolean> {
  if (!Number.isSafeInteger(updateId)) return true;
  try {
    const rows = await db.insert(telegramUpdates).values({ updateId }).onConflictDoNothing().returning({ id: telegramUpdates.updateId });
    return rows.length > 0;
  } catch (e) {
    console.warn('bot: update dedupe unavailable', (e as Error).message);
    return true;
  }
}

async function releaseUpdate(updateId: number) {
  try {
    await db.delete(telegramUpdates).where(eq(telegramUpdates.updateId, updateId));
  } catch (e) {
    console.warn('bot: cannot release update', (e as Error).message);
  }
}

const isTransient = (e: unknown) => e instanceof TelegramError && (e.code === 0 || e.code === 429 || e.code >= 500);

export const telegramRoutes = new Hono<AppEnv>();

/**
 * Самонастройка для владельца без компьютера: `GET /telegram/setup?key=<TELEGRAM_WEBHOOK_SECRET>` сама ставит команды, кнопку меню
 * и webhook токеном из Cloudflare; `&mode=check` только читает (getMe, getWebhookInfo). Ключ — тот же секрет, что Telegram шлёт в webhook.
 * В ответе нет ни токена, ни секрета. Описание бота и Description Picture не меняются.
 */
telegramRoutes.all('/setup', async (c) => {
  const json = (data: unknown, status: 200 | 401 | 503) => c.body(JSON.stringify(data, null, 2), status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  const secret = config.webhookSecret;
  if (!secret) {
    return json({ ok: false, error: 'webhook_secret_not_set', hints: ['В Cloudflare (Worker polskie-go → Settings → Variables and Secrets) задайте TELEGRAM_WEBHOOK_SECRET: латинские буквы, цифры, _ и -, 32 знака или больше.'] }, 503);
  }
  const key = c.req.query('key') ?? c.req.header('x-setup-key') ?? '';
  if (!safeEqual(key, secret)) {
    return json({ ok: false, error: 'wrong_key', hints: ['Ключ в ссылке (?key=…) не совпал с TELEGRAM_WEBHOOK_SECRET из Cloudflare. Вставьте тот же секрет; после смены секрета в Cloudflare подождите минуту.'] }, 401);
  }
  return json(await runSetup(c.req.query('mode') === 'check' ? 'check' : 'setup'), 200);
});

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

  if (msg && typeof msg.text === 'string' && msg.from) {
    if (!(await claimUpdate(update.update_id))) return c.json({ ok: true, duplicate: true });
    try {
      await handleBotMessage(msg);
    } catch (e) {
      if (isTransient(e)) {
        // Нічого не доставлено через тимчасовий збій: знімаємо мітку й просимо Telegram повторити.
        await releaseUpdate(update.update_id);
        throw new HttpError(503, 'telegram_unavailable');
      }
      // Бота заблоковано (403), запит відхилено або помилка коду: повтор нічого не змінить.
      console.warn('bot: message not handled', (e as Error).message);
    }
  }
  return c.json({ ok: true });
});
