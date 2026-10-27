/**
 * Конфігурація з bindings Cloudflare Worker (vars і secrets).
 * Значення читаються під час запиту: Worker отримує env у кожному виклику fetch/scheduled.
 */
export type Bindings = {
  DB: D1Database;
  /** Зібрані Mini App і адмінка (Workers Static Assets). */
  ASSETS?: Fetcher;
  ENVIRONMENT?: string;
  WEB_APP_URL?: string;
  CORS_ORIGINS?: string;
  SESSION_SECRET?: string;
  TELEGRAM_BOT_TOKEN?: string;
  /**
   * Только для staging (ENVIRONMENT=staging): id отдельного тестового бота — часть токена до «:». Staging принимает токен лишь с этим id,
   * поэтому боевой токен, случайно положенный в staging, игнорируется: ни webhook, ни рассылок, ни входа по initData боевого бота.
   */
  STAGING_BOT_ID?: string;
  TELEGRAM_BOT_USERNAME?: string;
  TELEGRAM_APP_SHORT_NAME?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  /** Ключ ссылки самонастройки `/telegram/setup?key=…`; без него — TELEGRAM_WEBHOOK_SECRET (старый вариант). */
  BOT_SETUP_KEY?: string;
  DEV_AUTH?: string;
  ANTHROPIC_API_KEY?: string;
  AI_MODEL?: string;
  AI_MONTHLY_OUTPUT_TOKENS?: string;
  INIT_DATA_MAX_AGE?: string;
  ADMIN_EMAIL?: string;
  /**
   * Серверна озвучка: auto (типово — перший провайдер із ключем: Google → Azure → ElevenLabs), google, azure, elevenlabs
   * або off (аварійний вимикач витрат). Див. services/tts.ts і docs/POLISH_TTS_BENCHMARK.md.
   */
  TTS_PROVIDER?: string;
  GOOGLE_TTS_API_KEY?: string;
  GOOGLE_TTS_VOICE?: string;
  /** Enable short microphone transcription explicitly; off by default. */
  AZURE_STT_ENABLED?: string;
  AZURE_SPEECH_KEY?: string;
  AZURE_SPEECH_REGION?: string;
  AZURE_SPEECH_VOICE?: string;
  /** Google Speech-to-Text: так само лише явно (`GOOGLE_STT_ENABLED=true`); ключ — окремий або ключ TTS. */
  GOOGLE_STT_ENABLED?: string;
  GOOGLE_STT_API_KEY?: string;
  GOOGLE_STT_MODEL?: string;
  /** auto (типово: Azure, потім Google), azure, google або off. */
  STT_PROVIDER?: string;
  /** Добові квоти на користувача (типово 60 записів і 300 нових фраз синтезу). */
  STT_DAILY_LIMIT?: string;
  TTS_DAILY_LIMIT?: string;
  ELEVENLABS_API_KEY?: string;
  ELEVENLABS_VOICE_ID?: string;
  ELEVENLABS_MODEL?: string;
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

/**
 * Адрес Mini App из переменной окружения приводится к рабочему виду: Telegram открывает только https,
 * а `new URL()` на значении без схемы бросает исключение (бот молчал бы). Пробелы убираются, `//host` и `host` получают `https://`,
 * `http://` на боевом адресе заменяется на `https://`; localhost и 127.0.0.1 остаются на http для разработки.
 */
export function normalizeWebAppUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  const local = (rest: string) => /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:[/?#]|$)/i.test(rest);
  const scheme = /^([a-z][a-z0-9+.-]*):\/\/(.*)$/i.exec(value);
  if (scheme) {
    const [, proto, rest] = scheme;
    return proto.toLowerCase() === 'http' && !local(rest) ? `https://${rest}` : value;
  }
  const bare = value.replace(/^\/\//, '');
  return local(bare) ? `http://${bare}` : `https://${bare}`;
}

/** id бота — часть токена до двоеточия. */
export const botIdOfToken = (token: string) => token.split(':')[0] ?? '';

export const config = {
  get isProd() {
    return str(env.ENVIRONMENT) === 'production';
  },
  /** Отдельная сборка для проверки (docs/STAGING.md): свой Worker, своя D1, без cron и без боевого бота. */
  get isStaging() {
    return str(env.ENVIRONMENT) === 'staging';
  },
  /** Боевые требования к секретам и CORS: production и staging (staging доступен из интернета). */
  get isProdLike() {
    return this.isProd || this.isStaging;
  },
  get environment() {
    return str(env.ENVIRONMENT) || 'development';
  },
  get isTest() {
    return str(env.ENVIRONMENT) === 'test';
  },
  get webAppUrl() {
    return normalizeWebAppUrl(str(env.WEB_APP_URL)) || 'http://localhost:5173';
  },
  get corsOrigins() {
    return (str(env.CORS_ORIGINS) || 'http://localhost:5173,http://localhost:5174').split(',').map((s) => s.trim()).filter(Boolean);
  },
  get sessionSecret() {
    const s = str(env.SESSION_SECRET);
    if (this.isProdLike && s.length < 32) throw new Error('SESSION_SECRET must be set to a random string of at least 32 characters');
    return s || 'dev-secret-change-me';
  },
  /**
   * Токен бота. В staging действует только токен с id из STAGING_BOT_ID, иначе — как будто токена нет: все места, где он нужен
   * (Bot API, webhook, cron, вход по initData, платежи), молчат, и боевой бот остаётся нетронутым.
   */
  get botToken() {
    const token = str(env.TELEGRAM_BOT_TOKEN);
    if (!this.isStaging) return token;
    const allowed = str(env.STAGING_BOT_ID);
    return token && allowed && botIdOfToken(token) === allowed ? token : '';
  },
  /** В staging положен токен, который не принят (нет STAGING_BOT_ID или id не совпал). */
  get botBlockedInStaging() {
    return this.isStaging && !!str(env.TELEGRAM_BOT_TOKEN) && !this.botToken;
  },
  get botUsername() {
    return str(env.TELEGRAM_BOT_USERNAME).replace(/^@/, '') || 'polski_go_bot';
  },
  /** Имя бота задано явно (иначе в группах не фильтруем команды вида /lesson@Bot). */
  get botUsernameConfigured() {
    return !!str(env.TELEGRAM_BOT_USERNAME).replace(/^@/, '');
  },
  get appShortName() {
    return str(env.TELEGRAM_APP_SHORT_NAME) || 'app';
  },
  /** Секрет webhook из окружения: действует, только пока сервер не перешёл на свой секрет (см. bot/webhook-secret.ts). */
  get webhookSecret() {
    return str(env.TELEGRAM_WEBHOOK_SECRET);
  },
  /** Отдельный ключ страницы `/telegram/setup` (необязателен: настройка есть в админке). */
  get botSetupKey() {
    return str(env.BOT_SETUP_KEY);
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
