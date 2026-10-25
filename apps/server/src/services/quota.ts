/**
 * Добові квоти платних звернень на користувача, у D1 (спільні для всіх ізолятів Worker).
 * rateLimit у hono.ts лише гасить сплески в межах одного ізоляту; гроші захищає ця квота.
 * Лічильник росте атомарно й не перевищує ліміт: умовне оновлення без рядка у відповіді — квоту вичерпано.
 */
import { lt, sql } from 'drizzle-orm';
import { db } from '../db';
import { usageCounters } from '../db/schema';
import { getBindings } from '../env';
import { HttpError } from '../lib/errors';

export type QuotaKind = 'stt' | 'tts';
/** Розпізнавання — за кожен запис; синтез — лише за фрази, яких ще немає в кеші. */
export const QUOTA_DEFAULTS: Record<QuotaKind, number> = { stt: 60, tts: 300 };

export function quotaLimit(kind: QuotaKind): number {
  const e = getBindings();
  const raw = Number(kind === 'stt' ? e.STT_DAILY_LIMIT : e.TTS_DAILY_LIMIT);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : QUOTA_DEFAULTS[kind];
}

const dayOf = (now: Date) => now.toISOString().slice(0, 10);

export async function consumeQuota(userId: string, kind: QuotaKind, now = new Date()): Promise<{ used: number; limit: number }> {
  const limit = quotaLimit(kind);
  const rows = await db
    .insert(usageCounters)
    .values({ userId, kind, day: dayOf(now), count: 1 })
    .onConflictDoUpdate({
      target: [usageCounters.userId, usageCounters.kind, usageCounters.day],
      set: { count: sql`${usageCounters.count} + 1` },
      setWhere: sql`${usageCounters.count} < ${limit}`,
    })
    .returning({ count: usageCounters.count });
  if (!rows.length) throw new HttpError(429, 'quota_exceeded', 'Daily limit reached');
  return { used: rows[0].count, limit };
}

/** Старі лічильники не потрібні: зберігаємо тиждень для розбору. */
export async function pruneUsage(now = new Date()) {
  const cutoff = dayOf(new Date(now.getTime() - 7 * 86_400_000));
  await db.delete(usageCounters).where(lt(usageCounters.day, cutoff));
}
