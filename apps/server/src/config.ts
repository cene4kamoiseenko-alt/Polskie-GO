/** Конфігурація з env. Секрети живуть лише на сервері. */
const env = process.env;

export const config = {
  port: Number(env.PORT ?? 3000),
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test' || !!env.VITEST,
  webAppUrl: env.WEB_APP_URL ?? 'http://localhost:5173',
  corsOrigins: (env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:5174').split(',').map((s) => s.trim()).filter(Boolean),
  sessionSecret: env.SESSION_SECRET ?? 'dev-secret-change-me',
  botToken: env.TELEGRAM_BOT_TOKEN ?? '',
  botUsername: env.TELEGRAM_BOT_USERNAME ?? 'polski_go_bot',
  appShortName: env.TELEGRAM_APP_SHORT_NAME ?? 'app',
  webhookSecret: env.TELEGRAM_WEBHOOK_SECRET ?? '',
  /** Вхід без Telegram — лише для локальної розробки. У production завжди вимкнено. */
  devAuth: env.DEV_AUTH === 'true' && env.NODE_ENV !== 'production',
  anthropicKey: env.ANTHROPIC_API_KEY ?? '',
  aiModel: env.AI_MODEL ?? 'claude-opus-5-5',
  aiMonthlyOutputTokens: Number(env.AI_MONTHLY_OUTPUT_TOKENS ?? 5_000_000),
  jobsEnabled: env.JOBS_ENABLED === 'true',
  uploadsDir: env.UPLOADS_DIR ?? new URL('../uploads/', import.meta.url).pathname,
  /** Зібраний frontend (віддається тим самим сервером у production). */
  webDist: env.WEB_DIST ?? new URL('../../web/dist/', import.meta.url).pathname,
  adminDist: env.ADMIN_DIST ?? new URL('../../admin/dist/', import.meta.url).pathname,
  initDataMaxAgeSec: Number(env.INIT_DATA_MAX_AGE ?? 86_400),
};

if (config.isProd && (config.sessionSecret === 'dev-secret-change-me' || config.sessionSecret.length < 32)) {
  throw new Error('SESSION_SECRET must be set to a random string of at least 32 characters in production');
}
