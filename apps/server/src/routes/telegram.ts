/**
 * Webhook Telegram-бота: команды (фото + текст + кнопки Mini App), нажатия inline-кнопок быстрых вопросов (callback_query),
 * платежі Stars і повернення. Заголовок `X-Telegram-Bot-Api-Secret-Token` проверяет `bot/webhook-secret.ts`
 * (серверный секрет; переменная окружения — только до первой смены).
 * Повторна доставка того самого update_id не відповідає вдруге; про тимчасові збої Telegram (429, 5xx, мережа)
 * сервер відповідає 503, і Telegram повторює оновлення.
 */
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { config } from '../env';
import { db } from '../db';
import { telegramUpdates } from '../db/schema';
import { body, rateLimit, type AppEnv } from '../hono';
import { HttpError } from '../lib/errors';
import { botApi, TelegramError } from '../lib/telegram';
import { handleBotCallback, handleBotMessage, parseCommand, type BotMessage } from '../bot/handler';
import { commandForLabel } from '../bot/panel';
import type { CallbackQuery } from '../bot/quiz/engine';
import { runSetup, type SetupMode } from '../bot/setup';
import { loadSecretState, safeEqual, verifyWebhookSecret } from '../bot/webhook-secret';
import { handlePreCheckout, handleRefund, handleSuccessfulPayment, type SuccessfulPayment } from '../services/payments';
import { recordBotBlocked, recordBotContact, type TgFrom } from '../services/bot-audience';

type Update = {
  update_id: number;
  message?: BotMessage & {
    successful_payment?: SuccessfulPayment;
    refunded_payment?: { telegram_payment_charge_id: string };
  };
  pre_checkout_query?: { id: string; from: { id: number }; currency: string; total_amount: number; invoice_payload: string };
  callback_query?: CallbackQuery;
  my_chat_member?: { chat: { id: number; type?: string }; from: TgFrom; new_chat_member?: { status?: string } };
};

/**
 * Аудитория бота (админка): кто писал боту в личном чате и кто его заблокировал. Только личные чаты; сбой записи
 * не мешает ответить — бот важнее учёта.
 */
async function noteContact(update: Update, now = new Date()) {
  try {
    const member = update.my_chat_member;
    if (member && member.chat?.type === 'private' && member.from) {
      const status = member.new_chat_member?.status;
      if (status === 'kicked' || status === 'member') await recordBotBlocked(member.from, status === 'kicked', now);
      return;
    }
    const cb = update.callback_query;
    if (cb?.from && (cb.message?.chat.type ?? 'private') === 'private') return await recordBotContact(cb.from, { command: 'button' }, now);
    const msg = update.message;
    if (!msg?.from || (msg.chat?.type ?? 'private') !== 'private') return;
    const cmd = parseCommand(msg.text);
    const command = cmd?.name ?? (typeof msg.text === 'string' ? (commandForLabel(msg.text) ?? 'text') : msg.successful_payment ? 'payment' : null);
    const startParam = cmd?.name === 'start' && /^[A-Za-z0-9_-]{1,64}$/.test(cmd.arg) ? cmd.arg : null;
    await recordBotContact(msg.from, { command: command?.slice(0, 32) ?? null, startParam }, now);
  } catch (e) {
    console.warn('bot: contact not recorded', (e as Error).message);
  }
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

/** Обработать обновление один раз; при временном сбое Telegram снять метку и попросить повторить (503). */
async function once(updateId: number, what: string, run: () => Promise<unknown>): Promise<boolean> {
  if (!(await claimUpdate(updateId))) return false;
  try {
    await run();
  } catch (e) {
    if (isTransient(e)) {
      // Нічого не доставлено через тимчасовий збій: знімаємо мітку й просимо Telegram повторити.
      await releaseUpdate(updateId);
      throw new HttpError(503, 'telegram_unavailable');
    }
    // Бота заблоковано (403), запит відхилено або помилка коду: повтор нічого не змінить.
    console.warn(`bot: ${what} not handled`, (e as Error).message);
  }
  return true;
}

export const telegramRoutes = new Hono<AppEnv>();

/**
 * Ключ страницы настройки. `BOT_SETUP_KEY`, если задан. Иначе `TELEGRAM_WEBHOOK_SECRET` — только пока сервер не перешёл
 * на свой секрет: это значение могло утечь, и после перехода оно больше ничего не открывает (настройка — из админки).
 */
async function setupKey(): Promise<{ key: string | null; reason?: 'not_set' | 'legacy_retired' }> {
  if (config.botSetupKey) return { key: config.botSetupKey };
  if (!config.webhookSecret) return { key: null, reason: 'not_set' };
  const state = await loadSecretState(true).catch(() => null);
  return state ? { key: null, reason: 'legacy_retired' } : { key: config.webhookSecret };
}

const SETUP_PAGE = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>POLSKI GO — настройка бота</title>
<style>
:root{color-scheme:light dark;--bg:#f6f7fb;--fg:#1d2433;--card:#fff;--line:#d9dee8;--accent:#e0313b}
@media (prefers-color-scheme:dark){:root{--bg:#10141c;--fg:#e8ecf3;--card:#1a202b;--line:#2c3443}}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.45 -apple-system,system-ui,sans-serif}
main{max-width:560px;margin:0 auto;padding:24px 16px}
h1{font-size:22px;margin:0 0 8px}p{margin:0 0 16px;opacity:.85}
form{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;display:grid;gap:12px}
input,select,button{font:inherit;padding:12px;border-radius:12px;border:1px solid var(--line);background:transparent;color:inherit}
button{background:var(--accent);border:0;color:#fff;font-weight:700}
pre{white-space:pre-wrap;word-break:break-word;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;font-size:13px}
</style></head><body><main>
<h1>Настройка бота POLSKI GO</h1>
<p>Ключ вводится здесь и уходит в теле запроса — не в адресе страницы. Удобнее — админка: раздел «Бот».</p>
<form id="f"><input id="k" type="password" autocomplete="off" placeholder="Ключ настройки (BOT_SETUP_KEY)" required>
<select id="m"><option value="check">Проверить (ничего не меняет)</option><option value="setup">Настроить: команды, меню, webhook</option><option value="rotate">Сменить секрет webhook</option></select>
<button>Выполнить</button></form><pre id="out" hidden></pre>
<script>
document.getElementById('f').addEventListener('submit',async(e)=>{e.preventDefault();const out=document.getElementById('out');out.hidden=false;out.textContent='…';
try{const r=await fetch(location.pathname,{method:'POST',headers:{'content-type':'application/json','x-setup-key':document.getElementById('k').value},body:JSON.stringify({mode:document.getElementById('m').value})});
out.textContent=JSON.stringify(await r.json(),null,2)}catch(err){out.textContent=String(err)}});
</script></main></body></html>`;

const noStore = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex', 'referrer-policy': 'no-referrer' };

/** Страница настройки для владельца без компьютера: форма, ключ уходит заголовком POST-запроса. */
telegramRoutes.get('/setup', (c) => {
  if (c.req.query('key')) {
    return c.json({ ok: false, error: 'key_in_url', hints: ['Ключ больше не принимается в адресе (он попадает в историю и журналы). Откройте /telegram/setup без параметров и введите ключ в форму, или настройте бота в админке.'] }, 400, noStore);
  }
  return c.html(SETUP_PAGE, 200, noStore);
});

/**
 * Настройка бота: `mode` check — только чтение (getMe, getWebhookInfo); setup — команды, кнопка меню и webhook
 * (с callback_query), при первой настройке — переход на серверный секрет; rotate — новое поколение секрета.
 * В ответе нет ни токена, ни секретов. Описание бота и Description Picture не меняются.
 */
telegramRoutes.post('/setup', rateLimit(10, 10 * 60_000, 'tg-setup'), async (c) => {
  const json = (data: unknown, status: 200 | 400 | 401 | 503) => c.body(JSON.stringify(data, null, 2), status, { 'content-type': 'application/json; charset=utf-8', ...noStore });
  if (c.req.query('key')) return json({ ok: false, error: 'key_in_url', hints: ['Передайте ключ заголовком x-setup-key, не в адресе.'] }, 400);
  const { key, reason } = await setupKey();
  if (!key) {
    return json(
      {
        ok: false,
        error: reason === 'legacy_retired' ? 'setup_key_retired' : 'setup_key_not_set',
        hints: [
          reason === 'legacy_retired'
            ? 'Бот уже перешёл на серверный секрет, прежнее значение TELEGRAM_WEBHOOK_SECRET больше не открывает настройку. Настраивайте бота в админке (раздел «Бот») или задайте в Cloudflare новый BOT_SETUP_KEY.'
            : 'В Cloudflare (Worker polskie-go → Settings → Variables and Secrets) задайте BOT_SETUP_KEY как Secret: случайная строка из латинских букв и цифр, 32 знака или больше. Или настройте бота в админке.',
        ],
      },
      503,
    );
  }
  const given = c.req.header('x-setup-key') ?? '';
  if (!safeEqual(given, key)) return json({ ok: false, error: 'wrong_key', hints: ['Ключ не совпал. После смены значения в Cloudflare подождите минуту.'] }, 401);
  const raw = ((await body(c).catch(() => ({}))) as { mode?: unknown })?.mode;
  const mode: SetupMode = raw === 'check' || raw === 'rotate' ? raw : 'setup';
  return json(await runSetup(mode), 200);
});

telegramRoutes.post('/webhook', async (c) => {
  if (!(await verifyWebhookSecret(c.req.header('x-telegram-bot-api-secret-token')))) throw new HttpError(401, 'unauthorized');
  const update = (await body(c)) as Update;
  await noteContact(update);
  if (update.my_chat_member) return c.json({ ok: true });

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

  const cb = update.callback_query;
  if (cb && typeof cb.id === 'string' && cb.from && typeof cb.from.id === 'number') {
    const fresh = await once(update.update_id, 'callback', () => handleBotCallback(cb));
    return c.json(fresh ? { ok: true } : { ok: true, duplicate: true });
  }

  if (msg && typeof msg.text === 'string' && msg.from) {
    const fresh = await once(update.update_id, 'message', () => handleBotMessage(msg));
    if (!fresh) return c.json({ ok: true, duplicate: true });
  }
  return c.json({ ok: true });
});
