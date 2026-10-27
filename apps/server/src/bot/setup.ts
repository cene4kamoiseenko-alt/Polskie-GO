/**
 * Самонастройка бота из Worker: тот же набор вызовов, что и `scripts/setup-bot.mjs` (команды ru + uk/pl/en, кнопка меню, webhook),
 * но токен берётся из переменных Cloudflare, а не из ссылки. Нужна владельцу без компьютера: `GET /telegram/setup?key=<секрет webhook>`.
 * Описание бота, Description Picture и токен не затрагиваются; ответ не содержит ни токена, ни секрета.
 */
import { config } from '../env';
import { botApi, TelegramError } from '../lib/telegram';
import { COMMAND_MENU } from './catalog';

export type SetupCall = { method: string; params: Record<string, unknown> };

/** Telegram принимает секрет webhook из 1–256 знаков `A-Za-z0-9_-`. */
export const SECRET_FORMAT = /^[A-Za-z0-9_-]{1,256}$/;

export const LOCALIZED = ['uk', 'pl', 'en'] as const;

/** Вызовы по порядку: команды (русские по умолчанию, затем локализации), кнопка меню, webhook. Совпадает с `buildCalls(env, { webhook: true })` скрипта. */
export function setupCalls(webAppUrl: string, secret: string): SetupCall[] {
  const origin = new URL(webAppUrl).origin;
  const list = (lang: 'ru' | 'uk' | 'pl' | 'en') => COMMAND_MENU.map((c) => ({ command: c.command, description: c.description[lang] }));
  return [
    { method: 'setMyCommands', params: { commands: list('ru') } },
    ...LOCALIZED.map((lang) => ({ method: 'setMyCommands', params: { commands: list(lang), language_code: lang } })),
    { method: 'setChatMenuButton', params: { menu_button: { type: 'web_app', text: 'POLSKI GO', web_app: { url: webAppUrl } } } },
    {
      method: 'setWebhook',
      params: { url: `${origin}/telegram/webhook`, secret_token: secret, allowed_updates: ['message', 'pre_checkout_query'], drop_pending_updates: false },
    },
  ];
}

export type SetupStep = { step: string; ok: boolean; code?: number; error?: string };
export type SetupReport = {
  ok: boolean;
  mode: 'setup' | 'check';
  bot?: { id: number; username: string };
  steps: SetupStep[];
  webhook?: { url: string; pending: number; lastError: string | null; lastErrorAt: string | null; allowedUpdates: string[] };
  hints: string[];
};

type WebhookInfo = { url?: string; pending_update_count?: number; last_error_message?: string; last_error_date?: number; allowed_updates?: string[] };

/** Токен вычищает `botApi`; секрет webhook вычищаем здесь: текст ошибки уходит владельцу в браузер. */
const redact = (text: string) => (config.webhookSecret ? text.split(config.webhookSecret).join('***') : text);

const fail = (step: string, e: unknown): SetupStep => {
  if (e instanceof TelegramError) return { step, ok: false, code: e.code, error: redact(e.description) };
  return { step, ok: false, error: redact((e as Error).message) };
};

/** Путь без параметров: в отчёт не должно попасть ничего секретного. */
const safeUrl = (raw: string) => {
  try {
    const u = new URL(raw);
    return `${u.origin}${u.pathname}`;
  } catch {
    return '';
  }
};

/**
 * mode `check` — только getMe и getWebhookInfo (ничего не меняет); `setup` — ещё и команды, кнопка меню и webhook.
 * Ошибки Telegram не прерывают отчёт: каждая попадает в `steps` с кодом и сообщением, а в `hints` — что сделать.
 */
export async function runSetup(mode: 'setup' | 'check'): Promise<SetupReport> {
  const report: SetupReport = { ok: true, mode, steps: [], hints: [] };
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

  if (mode === 'setup') {
    const secret = config.webhookSecret;
    const webAppUrl = config.webAppUrl;
    const https = /^https:\/\//.test(webAppUrl);
    if (!https) report.hints.push('WEB_APP_URL не задан или не https: впишите адрес приложения целиком, например https://polskie-go.<поддомен>.workers.dev.');
    if (!SECRET_FORMAT.test(secret)) report.hints.push('TELEGRAM_WEBHOOK_SECRET должен состоять из латинских букв, цифр, _ и - (1–256 знаков), без пробелов.');
    if (https) {
      for (const call of setupCalls(webAppUrl, secret)) {
        if (call.method === 'setWebhook' && !SECRET_FORMAT.test(secret)) {
          bad({ step: 'setWebhook', ok: false, error: 'webhook secret has an unsupported format' });
          continue;
        }
        const label = call.method === 'setMyCommands' ? `setMyCommands${call.params.language_code ? `:${call.params.language_code}` : ''}` : call.method;
        try {
          await botApi(call.method, call.params);
          report.steps.push({ step: label, ok: true });
        } catch (e) {
          bad(fail(label, e));
        }
      }
    }
  }

  try {
    const info = await botApi<WebhookInfo>('getWebhookInfo', {});
    report.steps.push({ step: 'getWebhookInfo', ok: true });
    report.webhook = {
      url: safeUrl(info.url ?? ''),
      pending: info.pending_update_count ?? 0,
      lastError: info.last_error_message ?? null,
      lastErrorAt: info.last_error_date ? new Date(info.last_error_date * 1000).toISOString() : null,
      allowedUpdates: info.allowed_updates ?? [],
    };
    if (!report.webhook.url) report.hints.push('Webhook не установлен: откройте эту же ссылку без `&mode=check`.');
    if (report.webhook.lastError && /401/.test(report.webhook.lastError)) {
      report.hints.push('Telegram получает 401 от сервера: секрет webhook в Telegram не совпадает с TELEGRAM_WEBHOOK_SECRET. Откройте ссылку настройки ещё раз (без `&mode=check`): она поставит webhook с текущим секретом.');
    }
  } catch (e) {
    bad(fail('getWebhookInfo', e));
  }
  return report;
}
