/**
 * Добові квоти платних звернень на користувача, у D1 (спільні для всіх ізолятів Worker).
 * rateLimit у hono.ts лише гасить сплески в межах одного ізоляту; гроші захищає ця квота.
 * Лічильник росте атомарно й не перевищує ліміт: умовне оновлення без рядка у відповіді — квоту вичерпано.
 */
import { gte, lt, sql } from 'drizzle-orm';
import { db } from '../db';
import { ttsSpend, usageCounters } from '../db/schema';
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

/** Старі лічильники не потрібні: зберігаємо тиждень для розбору (витрати на озвучку — 62 дні, щоб бачити місяць). */
export async function pruneUsage(now = new Date()) {
  const cutoff = dayOf(new Date(now.getTime() - 7 * 86_400_000));
  await db.delete(usageCounters).where(lt(usageCounters.day, cutoff));
  await db.delete(ttsSpend).where(lt(ttsSpend.day, dayOf(new Date(now.getTime() - 62 * 86_400_000))));
}

// ── Платний синтез на весь проєкт (tts_spend) ──
/** Типовий добовий ліміт символів синтезу на запит гравців: 30 000 × 31 день < 1 млн безкоштовних символів Chirp 3: HD на місяць. */
export const TTS_GLOBAL_DAILY_DEFAULT = 30_000;

export function ttsGlobalLimit(): number {
  const raw = Number(getBindings().TTS_GLOBAL_DAILY_CHARS);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : TTS_GLOBAL_DAILY_DEFAULT;
}

/**
 * Резерв символів перед платним запитом до провайдера (рахується й невдалий запит — оцінка з запасом).
 * user — атомарно й не вище ліміту: без рядка у відповіді — 429 tts_budget_exceeded, провайдер не викликається;
 * admin — лише облік: прогрів і порівняння голосів власник запускає сам після оцінки ціни.
 */
export async function reserveTtsChars(kind: 'user' | 'admin', chars: number, now = new Date()): Promise<{ used: number; limit: number }> {
  const limit = ttsGlobalLimit();
  const n = Math.max(0, Math.floor(chars));
  if (kind === 'user' && n > limit) throw new HttpError(429, 'tts_budget_exceeded', 'Daily speech budget reached');
  const rows = await db
    .insert(ttsSpend)
    .values({ day: dayOf(now), kind, chars: n, requests: 1 })
    .onConflictDoUpdate({
      target: [ttsSpend.day, ttsSpend.kind],
      set: { chars: sql`${ttsSpend.chars} + ${n}`, requests: sql`${ttsSpend.requests} + 1` },
      setWhere: kind === 'user' ? sql`${ttsSpend.chars} + ${n} <= ${limit}` : undefined,
    })
    .returning({ chars: ttsSpend.chars });
  if (!rows.length) throw new HttpError(429, 'tts_budget_exceeded', 'Daily speech budget reached');
  return { used: rows[0].chars, limit };
}

/** Витрати на синтез: сьогодні (за видами) і за останні 30 днів — для адмінки, порівняти з безкоштовним обсягом. */
export async function ttsSpendSummary(now = new Date()) {
  const today = dayOf(now);
  const from = dayOf(new Date(now.getTime() - 29 * 86_400_000));
  const rows = await db.select().from(ttsSpend).where(gte(ttsSpend.day, from));
  const pick = (kind: 'user' | 'admin', day?: string) => rows.filter((r) => r.kind === kind && (!day || r.day === day)).reduce((a, r) => ({ chars: a.chars + r.chars, requests: a.requests + r.requests }), { chars: 0, requests: 0 });
  return { day: today, limit: ttsGlobalLimit(), today: { user: pick('user', today), admin: pick('admin', today) }, last30: { user: pick('user'), admin: pick('admin') } };
}

