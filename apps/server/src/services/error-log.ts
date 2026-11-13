/**
 * Журнал ошибок (2026-11-04, эксплуатация перед релизом): падения сервера, ошибки Mini App у игроков и нарушения CSP (Report-Only).
 *
 * Одна строка — одна ошибка за день: id = день + отпечаток (вид, нормализованное сообщение, место). Повтор только увеличивает счётчик,
 * поэтому поток одинаковых ошибок не раздувает базу. Без персональных данных: в журнал не попадают ни id игрока, ни initData, ни тела запросов;
 * пути нормализуются (длинные id → :id). Хранится 30 дней (jobs.ts → purgeErrors). Админка: /api/admin/dashboard → appErrors.
 * Подробности, падения Worker вне HTTP и логи — Workers Logs в панели Cloudflare (observability включён в wrangler.jsonc).
 */
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { db } from '../db';
import { errorLog } from '../db/schema';

export type ErrorKind = 'server' | 'client' | 'csp';
export const ERROR_KEEP_DAYS = 30;

const clip = (s: string | null | undefined, n: number) => (s ? (s.length > n ? s.slice(0, n) : s) : null);

/** Сообщение без изменчивых частей: длинные числа и id, адреса с параметрами — чтобы одна и та же ошибка давала один отпечаток. */
export function normalizeMessage(m: string): string {
  return m
    .replace(/https?:\/\/[^\s'")]+/g, (u) => u.split(/[?#]/)[0])
    .replace(/\b[0-9a-f]{16,}\b/gi, ':id')
    .replace(/\d{4,}/g, '#')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Путь без id: /api/lessons/l_ab12cd34ef56 → /api/lessons/:id. Запрос (?…) отбрасывается. */
export function normalizePath(p: string): string {
  return p
    .split(/[?#]/)[0]
    .split('/')
    .map((seg) => (/^[0-9]+$/.test(seg) || (seg.length >= 12 && /\d/.test(seg) && /^[A-Za-z0-9_-]+$/.test(seg)) ? ':id' : seg))
    .join('/');
}

async function fingerprint(parts: string[]): Promise<string> {
  const data = new TextEncoder().encode(parts.join('|'));
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
  return [...hash.slice(0, 8)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export type ErrorInput = { kind: ErrorKind; message: string; detail?: string | null; path?: string | null; release?: string | null };

/** Записать ошибку (повтор за день — +1 к счётчику). Сам никогда не бросает: журнал не должен ломать ответ. */
export async function recordError(e: ErrorInput, now = new Date()): Promise<void> {
  try {
    const day = now.toISOString().slice(0, 10);
    const message = clip(normalizeMessage(e.message || 'unknown'), 300)!;
    const path = e.path ? clip(normalizePath(e.path), 200) : null;
    // Место ошибки — первая строка стека с файлом, а не весь стек: разные пути к одному месту — одна ошибка.
    const where = (e.detail ?? '').split('\n').find((l) => /:\d+/.test(l))?.replace(/\?[^:)]*/, '').trim() ?? '';
    const id = `${day}:${await fingerprint([e.kind, message, e.kind === 'server' ? (path ?? '') : where])}`;
    const t = now.getTime();
    await db
      .insert(errorLog)
      .values({ id, day, kind: e.kind, message, detail: clip(e.detail, 2000), path, release: clip(e.release, 60), count: 1, firstAt: t, lastAt: t })
      .onConflictDoUpdate({ target: errorLog.id, set: { count: sql`${errorLog.count} + 1`, lastAt: t } });
  } catch (err) {
    console.warn('error log write failed', (err as Error).message);
  }
}

/**
 * Ошибки за последние `hours` часов (для админки). Одна и та же ошибка в разные дни — одна строка: счётчики складываются, время — последнее.
 * Итоги по видам считаются отдельно и без лимита, поэтому не зависят ни от отбора по виду, ни от длины списка.
 */
export async function recentErrors(now = new Date(), hours = 24, opts: { kind?: ErrorKind | 'all'; limit?: number } = {}) {
  const { kind = 'all', limit = 50 } = opts;
  const since = now.getTime() - hours * 3_600_000;
  const inRange = and(gte(errorLog.day, new Date(since).toISOString().slice(0, 10)), gte(errorLog.lastAt, since));
  const lastAt = sql<number>`max(${errorLog.lastAt})`;
  const [sums, rows] = await Promise.all([
    db.select({ kind: errorLog.kind, n: sql<number>`sum(${errorLog.count})` }).from(errorLog).where(inRange).groupBy(errorLog.kind),
    db
      .select({ kind: errorLog.kind, message: errorLog.message, path: errorLog.path, count: sql<number>`sum(${errorLog.count})`, lastAt, detail: sql<string | null>`max(${errorLog.detail})` })
      .from(errorLog)
      .where(kind === 'all' ? inRange : and(inRange, eq(errorLog.kind, kind)))
      .groupBy(errorLog.kind, errorLog.message, errorLog.path)
      .orderBy(desc(lastAt))
      .limit(limit),
  ]);
  const total = { server: 0, client: 0, csp: 0 } as Record<ErrorKind, number>;
  for (const r of sums) total[r.kind] = Number(r.n) || 0;
  return {
    hours,
    total,
    items: rows.map((r) => ({ kind: r.kind, message: r.message, path: r.path, count: Number(r.count), lastAt: new Date(Number(r.lastAt)).toISOString(), detail: r.detail?.split('\n').slice(0, 4).join('\n') ?? null })),
  };
}

/** Пустой отчёт — только если таблицы журнала ещё нет (база до миграции 0015). Остальные сбои базы не прячем: админка покажет ошибку. */
export function emptyIfNoTable(hours: number) {
  return (e: unknown) => {
    if (/no such table/i.test(String((e as Error)?.message ?? e))) return { hours, total: { server: 0, client: 0, csp: 0 } as Record<ErrorKind, number>, items: [] };
    throw e;
  };
}

/** Удалить записи старше ERROR_KEEP_DAYS (cron каждые 15 минут, запрос по индексу — дешёвый). */
export async function purgeErrors(now = new Date()) {
  const cutoff = new Date(now.getTime() - ERROR_KEEP_DAYS * 86_400_000).toISOString().slice(0, 10);
  await db.delete(errorLog).where(lt(errorLog.day, cutoff));
}
