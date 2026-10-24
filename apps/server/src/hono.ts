/** Спільні типи та помічники Hono. */
import type { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import type { Bindings } from './env';
import { HttpError } from './lib/errors';

export type AppEnv = {
  Bindings: Bindings;
  Variables: { userId: string; admin?: { id: string; role: 'SUPERADMIN' | 'EDITOR' | 'SUPPORT' } };
};

/** Тіло JSON-запиту (порожній об'єкт, якщо тіла немає). */
export async function body(c: Context): Promise<unknown> {
  const text = await c.req.text();
  if (!text) return {};
  if (text.length > 1_000_000) throw new HttpError(413, 'payload_too_large');
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, 'bad_json');
  }
}

export const query = (c: Context) => c.req.query();

/**
 * Обмеження частоти запитів у межах ізоляту Worker (найкраще зусилля, без спільного сховища).
 * Ключ — токен авторизації або IP.
 */
const buckets = new Map<string, { n: number; reset: number }>();
export function rateLimit(max: number, windowMs: number, scope = 'g') {
  return createMiddleware<AppEnv>(async (c, next) => {
    const who = (c.req.header('authorization') ?? c.req.header('cf-connecting-ip') ?? 'anon').slice(-48);
    const key = `${scope}:${who}`;
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || b.reset < now) buckets.set(key, { n: 1, reset: now + windowMs });
    else if (++b.n > max) throw new HttpError(429, 'rate_limited', 'Too many requests');
    if (buckets.size > 10_000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    await next();
  });
}
