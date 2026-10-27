/**
 * Самообслуживание бота из cron: ничего не требует от владельца и не трогает адрес webhook.
 *
 * Раз в `CHECK_EVERY_MS` (и сразу после выкладки новой версии настройки) Worker:
 *  1. читает getWebhookInfo; если webhook не установлен — ничего не меняет (его ставит владелец ссылкой настройки);
 *  2. если секрет webhook ещё из переменной окружения (поколение 0, его значение могло утечь) — один раз переходит на серверный;
 *     если Telegram не получает нажатия кнопок (`callback_query`), получает 401 после последней настройки или ещё не подтвердил
 *     текущий секрет — повторяет setWebhook на ТОТ ЖЕ адрес с ТЕМ ЖЕ секретом. Секрет cron больше не меняет: только админка.
 *  3. после выкладки новой версии (`BOT_CONFIG_VERSION`) обновляет меню команд (ru + uk/pl/en);
 *  4. записывает итог в `app_state.bot_config` (без секретов): его показывают `/api/health/details` и админка.
 * Каждый шаг — не больше нескольких вызовов Bot API; число вызовов возвращается, чтобы cron вычел их из бюджета напоминаний.
 */
import { eq } from 'drizzle-orm';
import { config } from '../env';
import { db } from '../db';
import { appState } from '../db/schema';
import { botApi, TelegramError } from '../lib/telegram';
import { ALLOWED_UPDATES, commandCalls, installWebhook, isRejected, safeUrl, type WebhookInfo } from './setup';
import { loadSecretState, rotateSecret } from './webhook-secret';

/** 2 — команда /quiz, callback_query в webhook, серверный секрет webhook. Увеличивать при каждом изменении меню или webhook. */
export const BOT_CONFIG_VERSION = 2;
export const CONFIG_KEY = 'bot_config';
const CHECK_EVERY_MS = 60 * 60_000;

export type BotConfigState = {
  version: number;
  checkedAt: number;
  /** ok — webhook стоит и получает всё нужное; missing — не установлен; error — Telegram недоступен или отказал. */
  webhook: 'ok' | 'missing' | 'error';
  url: string;
  callbackQuery: boolean;
  pending: number;
  lastErrorAt: string | null;
  secretGeneration: number;
  secretConfirmed: boolean;
  /** Когда cron последний раз ставил webhook (ошибки Telegram до этого момента уже не повод повторять). */
  webhookSetAt: number | null;
  /** Что сделано в последней проверке: rotated, webhook, commands. */
  actions: string[];
  error: string | null;
};

export async function readBotConfig(): Promise<BotConfigState | null> {
  try {
    const row = await db.select({ value: appState.value }).from(appState).where(eq(appState.key, CONFIG_KEY)).get();
    return (row?.value as BotConfigState | undefined) ?? null;
  } catch {
    return null;
  }
}

async function saveBotConfig(state: BotConfigState) {
  await db
    .insert(appState)
    .values({ key: CONFIG_KEY, value: state })
    .onConflictDoUpdate({ target: appState.key, set: { value: state, updatedAt: new Date() } });
}

const has401 = (info: WebhookInfo, since: number) => !!info.last_error_message && /401/.test(info.last_error_message) && (info.last_error_date ?? 0) * 1000 >= since;

/** Проверка и починка настройки бота. Возвращает число вызовов Bot API. */
export async function maintainBot(now = new Date()): Promise<number> {
  if (!config.botToken) return 0;
  const saved = await readBotConfig();
  if (saved && saved.version >= BOT_CONFIG_VERSION && now.getTime() - saved.checkedAt < CHECK_EVERY_MS) return 0;

  let calls = 0;
  const actions: string[] = [];
  const result: BotConfigState = {
    version: saved?.version ?? 0, checkedAt: now.getTime(), webhook: 'error', url: '', callbackQuery: false, pending: 0, lastErrorAt: null,
    secretGeneration: 0, secretConfirmed: false, webhookSetAt: saved?.webhookSetAt ?? null, actions, error: null,
  };
  try {
    calls++;
    const info = await botApi<WebhookInfo>('getWebhookInfo', {});
    const url = info.url ?? '';
    result.url = safeUrl(url);
    result.pending = info.pending_update_count ?? 0;
    result.lastErrorAt = info.last_error_date ? new Date(info.last_error_date * 1000).toISOString() : null;
    const allowed = info.allowed_updates ?? [];
    // Пустой список у Telegram означает «все, кроме chat_member…» — callback_query туда входит.
    result.callbackQuery = !allowed.length || allowed.includes('callback_query');

    let state = await loadSecretState(true);
    if (!url) {
      result.webhook = 'missing';
    } else if (!/^https:\/\//.test(url)) {
      result.webhook = 'error';
      result.error = 'webhook url is not https';
    } else {
      const lacks = ALLOWED_UPDATES.some((u) => allowed.length > 0 && !allowed.includes(u));
      const unauthorized = has401(info, Math.max(state?.rotatedAt ?? 0, result.webhookSetAt ?? 0));
      const unconfirmed = !!state && !state.confirmedAt;
      if (!state || lacks || unauthorized || unconfirmed) {
        const rotated = state ? null : await rotateSecret(now.getTime());
        if (rotated) {
          state = rotated.next;
          actions.push('rotated');
        }
        if (state) {
          try {
            calls++;
            state = await installWebhook(url, state, rotated);
            actions.push('webhook');
            result.callbackQuery = true;
            result.webhookSetAt = now.getTime();
          } catch (e) {
            // Явный отказ Telegram: прежний секрет уже возвращён. Потерянный ответ: оба секрета работают, повторим через час.
            if (rotated && isRejected(e)) {
              state = rotated.prev;
              actions.splice(actions.indexOf('rotated'), 1);
            }
            result.secretGeneration = state?.gen ?? 0;
            throw e;
          }
        }
      }
      result.webhook = result.callbackQuery ? 'ok' : 'error';
    }
    result.secretGeneration = state?.gen ?? 0;
    result.secretConfirmed = !!state?.confirmedAt;

    if (result.version < BOT_CONFIG_VERSION) {
      for (const call of commandCalls()) {
        calls++;
        await botApi(call.method, call.params);
      }
      actions.push('commands');
      result.version = BOT_CONFIG_VERSION;
    }
  } catch (e) {
    result.webhook = result.webhook === 'missing' ? 'missing' : 'error';
    result.error = e instanceof TelegramError ? `${e.method} ${e.code}` : String((e as Error).message ?? e).slice(0, 120);
    console.warn('bot maintain failed', result.error);
  }
  await saveBotConfig(result).catch((e) => console.warn('bot maintain: state not saved', (e as Error).message));
  return calls;
}
