/** Worker-проксі: усі запити йдуть в один екземпляр контейнера з API. */
import { Container, getContainer } from '@cloudflare/containers';

type Env = {
  API: DurableObjectNamespace<ApiContainer>;
  [key: string]: unknown;
};

/** Змінні, які контейнер отримує при старті (vars + секрети Worker). */
const PASSED = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_BOT_USERNAME',
  'TELEGRAM_APP_SHORT_NAME',
  'TELEGRAM_WEBHOOK_SECRET',
  'WEB_APP_URL',
  'CORS_ORIGINS',
  'ANTHROPIC_API_KEY',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'JOBS_ENABLED',
];

export class ApiContainer extends Container<Env> {
  defaultPort = 3000;
  // Після 30 хв без запитів контейнер засинає; наступний запит розбудить його (холодний старт ~10–20 с).
  sleepAfter = '30m';
  enableInternet = true;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    const vars: Record<string, string> = { NODE_ENV: 'production', PORT: '3000' };
    for (const k of PASSED) if (typeof env[k] === 'string' && env[k]) vars[k] = env[k] as string;
    this.envVars = vars;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return getContainer(env.API).fetch(request);
  },
};
