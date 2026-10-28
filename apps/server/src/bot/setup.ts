/**
 * Настройка бота из Worker: команды ru + uk/pl/en, кнопка меню Mini App и webhook (с callback_query для быстрых вопросов).
 * Токен берётся из переменных Cloudflare, секрет webhook — серверный (`bot/webhook-secret.ts`): человек его не видит и не вводит.
 * Вызывается из админки (SUPERADMIN, кнопки «Проверить» / «Настроить» / «Сменить секрет»), страницей `/telegram/setup`
 * (ключ вводится в форму и уходит в теле POST, не в адресе) и из cron (`maintain.ts`, только безопасная починка).
 * Описание бота, Description Picture и токен не затрагиваются; ответ не содержит ни токена, ни секрета.
 */
import { config } from '../env';
import { botApi, TelegramError } from '../lib/telegram';
import { MENU } from './catalog';
import { confirmSecret, loadSecretState, restoreSecret, rotateSecret, type Rotated, type SecretState } from './webhook-secret';

export type SetupCall = { method: string; params: Record<string, unknown> };

export const LOCALIZED = ['uk', 'pl', 'en'] as const;

/** Какие обновления присылает Telegram: сообщения и команды, нажатия inline-кнопок (быстрые вопросы), проверка оплаты Stars. */
/** my_chat_member — блокировка и разблокировка бота (аудитория в админке). */
export const ALLOWED_UPDATES = ['message', 'callback_query', 'pre_checkout_query', 'my_chat_member'] as const;

/** Команды бота: русские описания по умолчанию, затем локализации. Совпадает с `buildCalls` скрипта setup-bot. */
export function commandCalls(): SetupCall[] {
  const list = (lang: 'ru' | 'uk' | 'pl' | 'en') => MENU.map((c) => ({ command: c.command, description: c.description[lang] }));
  return [
    { method: 'setMyCommands', params: { commands: list('ru') } },
    ...LOCALIZED.map((lang) => ({ method: 'setMyCommands', params: { commands: list(lang), language_code: lang } })),
  ];
}

export function webhookCall(url: string, secret: string): SetupCall {
  return { method: 'setWebhook', params: { url, secret_token: secret, allowed_updates: [...ALLOWED_UPDATES], drop_pending_updates: false } };
}

/** Вызовы по порядку: команды (русские по умолчанию, затем локализации), кнопка меню, webhook. */
export function setupCalls(webAppUrl: string, secret: string): SetupCall[] {
  const origin = new URL(webAppUrl).origin;
  return [
    ...commandCalls(),
    { method: 'setChatMenuButton', params: { menu_button: { type: 'web_app', text: 'POLSKI GO', web_app: { url: webAppUrl } } } },
    webhookCall(`${origin}/telegram/webhook`, secret),
  ];
}

/** Явный отказ Telegram (4xx, кроме 429): новый секрет точно не принят — можно вернуть прежний. Сеть, 429 и 5xx — исход неизвестен. */
export const isRejected = (e: unknown) => e instanceof TelegramError && e.code >= 400 && e.code < 500 && e.code !== 429;

/**
 * setWebhook с секретом `state`. Успех — секрет подтверждён (прежний перестанет приниматься через 10 минут).
 * Явный отказ сразу после смены — прежнее состояние возвращается. Потерянный ответ — новое поколение остаётся
 * неподтверждённым: сервер принимает оба секрета, а cron повторит setWebhook. Ошибка пробрасывается вызывающему.
 */
export async function installWebhook(url: string, state: SecretState, rotated: Rotated | null): Promise<SecretState> {
  const call = webhookCall(url, state.current);
  try {
    await botApi(call.method, call.params);
  } catch (e) {
    if (rotated && isRejected(e)) await restoreSecret(rotated).catch((err) => console.warn('bot: cannot restore webhook secret', (err as Error).message));
    throw e;
  }
  return confirmSecret(state);
}

export type SetupMode = 'setup' | 'check' | 'rotate';
export type SetupStep = { step: string; ok: boolean; code?: number; error?: string };
export type SetupReport = {
  ok: boolean;
  mode: SetupMode;
  bot?: { id: number; username: string };
  steps: SetupStep[];
  webhook?: { url: string; pending: number; lastError: string | null; lastErrorAt: string | null; allowedUpdates: string[] };
  /** Поколение серверного секрета webhook (0 — ещё действует переменная окружения). Сам секрет не показывается. */
  secretGeneration?: number;
  /** Telegram подтвердил текущий секрет (setWebhook ответил ok). */
  secretConfirmed?: boolean;
  hints: string[];
};

export type WebhookInfo = { url?: string; pending_update_count?: number; last_error_message?: string; last_error_date?: number; allowed_updates?: string[] };

/** Токен вычищает `botApi`; секреты webhook (переменная и серверные) вычищаем здесь: текст ошибки уходит владельцу в браузер. */
export function redactSecrets(text: string, state: SecretState | null = null): string {
  let out = text;
  for (const s of [config.webhookSecret, state?.current, state?.previous]) if (s) out = out.split(s).join('***');
  return out;
}

/** Путь без параметров: в отчёт не должно попасть ничего секретного. */
export const safeUrl = (raw: string) => {
  try {
    const u = new URL(raw);
    return `${u.origin}${u.pathname}`;
  } catch {
    return '';
  }
};

/**
 * mode `check` — только getMe и getWebhookInfo (ничего не меняет); `setup` — ещё команды, кнопка меню и webhook;
 * `rotate` — то же, что setup, но с новым поколением секрета webhook. Первая настройка (секрет ещё из переменной окружения)
 * всегда переходит на серверный секрет. Ошибки Telegram не прерывают отчёт: каждая попадает в `steps`, а в `hints` — что сделать.
 */
export async function runSetup(mode: SetupMode): Promise<SetupReport> {
  const report: SetupReport = { ok: true, mode, steps: [], hints: [] };
  let state = await loadSecretState(true).catch(() => null);
  const fail = (step: string, e: unknown): SetupStep =>
    e instanceof TelegramError ? { step, ok: false, code: e.code, error: redactSecrets(e.description, state) } : { step, ok: false, error: redactSecrets((e as Error).message, state) };
  const bad = (step: SetupStep) => {
    report.steps.push(step);
    report.ok = false;
  };

  if (!config.botToken) {
    bad({ step: 'token', ok: false, error: 'TELEGRAM_BOT_TOKEN is not set' });
    report.hints.push('В Cloudflare (Worker polskie-go → Settings → Variables and Secrets) не задан TELEGRAM_BOT_TOKEN: впишите токен из BotFather (/mybots → бот → API Token) как Secret.');
    return report;
  }

  try {
    const me = await botApi<{ id: number; username: string }>('getMe', {});
    report.bot = { id: me.id, username: me.username };
    report.steps.push({ step: 'getMe', ok: true });
    if (config.botUsernameConfigured && me.username.toLowerCase() !== config.botUsername.toLowerCase()) {
      report.hints.push(`Токен принадлежит боту @${me.username}, а TELEGRAM_BOT_USERNAME = ${config.botUsername}: поправьте имя или токен.`);
    }
  } catch (e) {
    bad(fail('getMe', e));
    const code = e instanceof TelegramError ? e.code : 0;
    report.hints.push(
      code === 401 || code === 404
        ? 'Telegram не принимает токен из Cloudflare (TELEGRAM_BOT_TOKEN): он неверный или записан с лишними знаками. Возьмите его в BotFather (/mybots → бот → API Token) и впишите заново как Secret, без пробелов и слова bot.'
        : 'Не удалось связаться с Telegram. Попробуйте ещё раз через минуту.',
    );
    return report;
  }

  if (mode !== 'check') {
    const webAppUrl = config.webAppUrl;
    const https = /^https:\/\//.test(webAppUrl);
    if (!https) report.hints.push('WEB_APP_URL не задан или не https: впишите адрес приложения целиком, например https://polskie-go.<поддомен>.workers.dev.');
    if (https) {
      // Секрет из переменной окружения (поколение 0) мог утечь через ссылку настройки: переходим на серверный.
      let rotated: Rotated | null = null;
      if (mode === 'rotate' || !state) {
        try {
          rotated = await rotateSecret();
          if (!rotated) throw new Error('secret was rotated by another request, try again');
          state = rotated.next;
        } catch (e) {
          bad(fail('rotateSecret', e));
        }
      }
      for (const call of setupCalls(webAppUrl, state?.current ?? '')) {
        const label = call.method === 'setMyCommands' ? `setMyCommands${call.params.language_code ? `:${call.params.language_code}` : ''}` : call.method;
        if (call.method === 'setWebhook') {
          if (!state) {
            bad({ step: 'setWebhook', ok: false, error: 'server webhook secret is not available' });
            continue;
          }
          try {
            state = await installWebhook(String(call.params.url), state, rotated);
            report.steps.push({ step: label, ok: true });
          } catch (e) {
            bad(fail(label, e));
            // Telegram явно не принял новый секрет: прежний уже возвращён в D1.
            if (rotated && isRejected(e)) state = rotated.prev;
          }
          continue;
        }
        try {
          await botApi(call.method, call.params);
          report.steps.push({ step: label, ok: true });
        } catch (e) {
          bad(fail(label, e));
        }
      }
    }
  }
  report.secretGeneration = state?.gen ?? 0;
  report.secretConfirmed = !!state?.confirmedAt;

  try {
    const info = await botApi<WebhookInfo>('getWebhookInfo', {});
    report.steps.push({ step: 'getWebhookInfo', ok: true });
    report.webhook = {
      url: safeUrl(info.url ?? ''),
      pending: info.pending_update_count ?? 0,
      lastError: info.last_error_message ? redactSecrets(info.last_error_message, state) : null,
      lastErrorAt: info.last_error_date ? new Date(info.last_error_date * 1000).toISOString() : null,
      allowedUpdates: info.allowed_updates ?? [],
    };
    if (!report.webhook.url) report.hints.push('Webhook не установлен: нажмите «Настроить бота».');
    else if (report.webhook.allowedUpdates.length && !report.webhook.allowedUpdates.includes('callback_query')) {
      report.hints.push('Webhook не получает нажатия кнопок (callback_query): нажмите «Настроить бота» — быстрые вопросы /quiz без этого не работают.');
    }
    if (report.webhook.lastError && /401/.test(report.webhook.lastError) && (info.last_error_date ?? 0) * 1000 >= (state?.confirmedAt ?? 0)) {
      report.hints.push('Telegram получает 401 от сервера: секрет webhook в Telegram не совпадает с серверным. Нажмите «Настроить бота»: webhook встанет с текущим секретом.');
    }
  } catch (e) {
    bad(fail('getWebhookInfo', e));
  }
  return report;
}
