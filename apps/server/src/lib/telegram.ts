import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../env';

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
};

export type InitData = { user: TelegramUser; authDate: number; startParam?: string; queryId?: string };

/**
 * Перевірка підпису Telegram Mini App initData.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateInitData(raw: string, botToken: string, maxAgeSec: number, now = Date.now()): InitData {
  if (!botToken) throw new Error('bot_token_missing');
  const params = new URLSearchParams(raw);
  const hash = params.get('hash');
  if (!hash) throw new Error('hash_missing');
  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expected = createHmac('sha256', secret).update(dataCheckString).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error('bad_signature');
  const authDate = Number(params.get('auth_date'));
  if (!authDate || now / 1000 - authDate > maxAgeSec) throw new Error('expired');
  const userRaw = params.get('user');
  if (!userRaw) throw new Error('user_missing');
  const user = JSON.parse(userRaw) as TelegramUser;
  if (typeof user.id !== 'number') throw new Error('user_invalid');
  return { user, authDate, startParam: params.get('start_param') ?? undefined, queryId: params.get('query_id') ?? undefined };
}

/** Підписати initData (для тестів і локальної розробки). */
export function signInitData(fields: Record<string, string>, botToken: string): string {
  const params = new URLSearchParams(fields);
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  params.set('hash', createHmac('sha256', secret).update(dataCheckString).digest('hex'));
  return params.toString();
}

/**
 * Відмова Bot API. code — HTTP-код Telegram (400 запит відхилено, 403 бота заблоковано, 429 ліміт з retryAfter у секундах,
 * 5xx збій Telegram). code = 0 — мережа, тайм-аут або відповідь не JSON: невідомо, чи дійшов запит, а ключа ідемпотентності
 * в Telegram немає, тому такий результат не повторюють автоматично (`ambiguous`).
 */
export class TelegramError extends Error {
  constructor(
    public method: string,
    public code: number,
    public description: string,
    public retryAfter: number | null = null,
  ) {
    super(`Telegram ${method} failed: ${description}`);
  }
  get ambiguous() {
    return this.code === 0;
  }
}

/** Токен бота не має потрапляти в журнали й помилки. */
function scrub(text: string): string {
  const token = config.botToken;
  return token ? text.split(token).join('***') : text;
}

/** Виклик Telegram Bot API. Помилки — TelegramError (підклас Error, повідомлення як раніше). */
export async function botApi<T = unknown>(method: string, params: Record<string, unknown>, timeoutMs = 10_000): Promise<T> {
  if (!config.botToken) throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  let res: Response;
  try {
    res = await fetch(`https://api.telegram.org/bot${config.botToken}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    throw new TelegramError(method, 0, scrub(`network: ${(e as Error).message}`));
  }
  let body: { ok: boolean; result?: T; description?: string; error_code?: number; parameters?: { retry_after?: number } };
  try {
    body = await res.json();
  } catch {
    throw new TelegramError(method, res.status >= 400 ? res.status : 0, `bad response ${res.status}`);
  }
  if (!body.ok) throw new TelegramError(method, body.error_code ?? res.status, scrub(body.description ?? String(res.status)), body.parameters?.retry_after ?? null);
  return body.result as T;
}
