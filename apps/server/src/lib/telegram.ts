import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config';

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

/** Виклик Telegram Bot API. */
export async function botApi<T = unknown>(method: string, params: Record<string, unknown>): Promise<T> {
  if (!config.botToken) throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  const res = await fetch(`https://api.telegram.org/bot${config.botToken}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
  const body = (await res.json()) as { ok: boolean; result?: T; description?: string };
  if (!body.ok) throw new Error(`Telegram ${method} failed: ${body.description ?? res.status}`);
  return body.result as T;
}
