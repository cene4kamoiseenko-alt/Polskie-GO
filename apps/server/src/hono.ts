/** Спільні типи та помічники Hono. */
import type { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import type { Bindings } from './env';
import { HttpError } from './lib/errors';
import { verifyToken } from './lib/token';

export type AppEnv = {
  Bindings: Bindings;
  Variables: { userId: string; admin?: { id: string; role: 'SUPERADMIN' | 'EDITOR' | 'SUPPORT' } };
};

/** Тіло JSON-запиту (порожній об'єкт, якщо тіла немає). */
export const MAX_BODY_BYTES = 1_000_000;

export async function body(c: Context): Promise<unknown> {
  // Заявленный размер проверяется до чтения: иначе огромное тело сначала целиком попало бы в память.
  if (Number(c.req.header('content-length')) > MAX_BODY_BYTES) throw new HttpError(413, 'payload_too_large');
  const text = await c.req.text();
  if (!text) return {};
  if (text.length > MAX_BODY_BYTES) throw new HttpError(413, 'payload_too_large');
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, 'bad_json');
  }
}

export const query = (c: Context) => c.req.query();

/**
 * Кто делает запрос: личность из ПОДПИСАННОГО токена, иначе IP, который выставляет Cloudflare.
 * Сырой заголовок Authorization ключом быть не может: его подделывают, и каждый запрос получал бы новый счётчик
 * (так обходился бы лимит на вход в админку). Токен с чужой подписью не проходит проверку и считается по IP.
 */
export function requester(c: Context): string {
  const header = c.req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = token ? verifyToken<{ uid?: string; aid?: string }>(token) : null;
  if (typeof payload?.uid === 'string') return `u:${payload.uid}`;
  if (typeof payload?.aid === 'string') return `a:${payload.aid}`;
  return `ip:${c.req.header('cf-connecting-ip') ?? 'anon'}`;
}

/**
 * Обмеження частоти запитів у межах ізоляту Worker (найкраще зусилля, без спільного сховища: гасить сплески).
 * Ключ — requester(). Підбір пароля адмінки додатково захищає D1-лічильник (services/admin-guard.ts).
 */
const buckets = new Map<string, { n: number; reset: number }>();
/**
 * Ограничитель Cloudflare (общий для изолятов) поверх счётчика в памяти: вход по initData, вход в админку, отчёты об ошибках клиента.
 * Ключ — IP из `cf-connecting-ip`. Нет привязки или она недоступна — пропускаем (счётчик в памяти и D1-лимит админки остаются).
 */
export function edgeRateLimit(binding: 'RL_AUTH' | 'RL_ADMIN' | 'RL_REPORT') {
  return createMiddleware<AppEnv>(async (c, next) => {
    const rl = c.env?.[binding];
    if (rl) {
      const ip = c.req.header('cf-connecting-ip') ?? 'anon';
      const verdict = await rl.limit({ key: `${binding}:${ip}` }).catch(() => ({ success: true }));
      if (!verdict.success) throw new HttpError(429, 'rate_limited', 'Too many requests');
    }
    await next();
  });
}

/** Для тестів, які проходять місто повністю швидше, ніж це можливо вручну. */
export const resetRateLimits = () => buckets.clear();
export function rateLimit(max: number, windowMs: number, scope = 'g') {
  return createMiddleware<AppEnv>(async (c, next) => {
    const key = `${scope}:${requester(c)}`;
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || b.reset < now) buckets.set(key, { n: 1, reset: now + windowMs });
    else if (++b.n > max) throw new HttpError(429, 'rate_limited', 'Too many requests');
    if (buckets.size > 10_000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    await next();
  });
}
