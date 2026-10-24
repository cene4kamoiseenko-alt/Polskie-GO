/**
 * Конфігурація з bindings Cloudflare Worker (vars і secrets).
 * Значення читаються під час запиту: Worker отримує env у кожному виклику fetch/scheduled.
 */
export type Bindings = {
  DB: D1Database;
  /** Завантажені адміністратором файли (зображення, аудіо). */
  UPLOADS?: KVNamespace;
  /** Зібрані Mini App і адмінка (Workers Static Assets). */
  ASSETS?: Fetcher;
  ENVIRONMENT?: string;
  WEB_APP_URL?: string;
  CORS_ORIGINS?: string;
  SESSION_SECRET?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_BOT_USERNAME?: string;
  TELEGRAM_APP_SHORT_NAME?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  DEV_AUTH?: string;
  ANTHROPIC_API_KEY?: string;
  AI_MODEL?: string;
  AI_MONTHLY_OUTPUT_TOKENS?: string;
  INIT_DATA_MAX_AGE?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
};

let env: Partial<Bindings> = {};

export function setEnv(e: Partial<Bindings>) {
  env = e;
}

export function getBindings() {
  return env;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

export const config = {
  get isProd() {
    return str(env.ENVIRONMENT) === 'production';
  },
  get isTest() {
    return str(env.ENVIRONMENT) === 'test';
  },
  get webAppUrl() {
    return str(env.WEB_APP_URL) || 'http://localhost:5173';
  },
  get corsOrigins() {
    return (str(env.CORS_ORIGINS) || 'http://localhost:5173,http://localhost:5174').split(',').map((s) => s.trim()).filter(Boolean);
  },
  get sessionSecret() {
    const s = str(env.SESSION_SECRET);
    if (this.isProd && s.length < 32) throw new Error('SESSION_SECRET must be set to a random string of at least 32 characters');
    return s || 'dev-secret-change-me';
  },
  get botToken() {
    return str(env.TELEGRAM_BOT_TOKEN);
  },
  get botUsername() {
    return str(env.TELEGRAM_BOT_USERNAME) || 'polski_go_bot';
  },
  get appShortName() {
    return str(env.TELEGRAM_APP_SHORT_NAME) || 'app';
  },
  get webhookSecret() {
    return str(env.TELEGRAM_WEBHOOK_SECRET);
  },
  /** Вхід без Telegram — лише для локальної розробки. У production завжди вимкнено. */
  get devAuth() {
    return str(env.DEV_AUTH) === 'true' && !this.isProd;
  },
  get anthropicKey() {
    return str(env.ANTHROPIC_API_KEY);
  },
  get aiModel() {
    return str(env.AI_MODEL) || 'claude-opus-5-5';
  },
  get aiMonthlyOutputTokens() {
    return Number(str(env.AI_MONTHLY_OUTPUT_TOKENS) || 5_000_000);
  },
  get initDataMaxAgeSec() {
    return Number(str(env.INIT_DATA_MAX_AGE) || 86_400);
  },
};
