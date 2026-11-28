/**
 * Мониторинг скорости (1.0, этап 1.2): выборка запросов API и замеры приложения у игроков → админка «Скорость».
 *
 *  • API: доля config.perfSample (по умолчанию 5 %) всех запросов /api/*, плюс всегда — медленные (≥ SLOW_MS) и ответы 5xx.
 *    Строка: маршрут без id, статус, время ответа, время и число обращений к D1 (db/metrics.ts).
 *  • Приложение: запуск (cold — файлы с сети, warm — из кеша) и открытие урока; выборку делает само приложение.
 *  • Фоновые задачи: ошибки cron пишутся в журнал ошибок видом job (раньше — только console.warn, владелец их не видел).
 *
 * Записи D1 — лимит бесплатного плана (100 тыс. строк в сутки), поэтому выборка, а не каждый запрос. Персональных данных нет.
 * В техработы ничего не пишется (база только на чтение). Хранится 14 дней (jobs.ts → purgePerf).
 */
import { and, gte, lt, sql } from 'drizzle-orm';
import { db } from '../db';
import { errorLog, perfSamples } from '../db/schema';
import { config } from '../env';
import { normalizePath, recordError } from './error-log';

export const PERF_KEEP_DAYS = 14;
/** Медленный ответ — в выборку всегда. */
export const SLOW_MS = 1500;

export type ApiSample = { method: string; path: string; status: number; ms: number; d1Ms: number; d1Calls: number };

/** Попадает ли запрос в выборку: доля, медленные и 5xx — всегда; health и сами замеры — нет. */
export function shouldSample(s: Pick<ApiSample, 'path' | 'status' | 'ms'>, rnd = Math.random()): boolean {
  if (!s.path.startsWith('/api/') || s.path === '/api/health' || s.path === '/api/metrics') return false;
  if (config.maintenance) return false;
  return s.status >= 500 || s.ms >= SLOW_MS || rnd < config.perfSample;
}

export async function recordApiSample(s: ApiSample, now = new Date()): Promise<void> {
  try {
    await db.insert(perfSamples).values({
      at: now.getTime(),
      kind: 'api',
      route: `${s.method} ${normalizePath(s.path)}`.slice(0, 120),
      status: s.status,
      ms: Math.round(s.ms),
      d1Ms: Math.round(s.d1Ms),
      d1Calls: s.d1Calls,
    });
  } catch (e) {
    console.warn('perf sample write failed', (e as Error).message);
  }
}

export async function recordClientSample(kind: 'start' | 'lesson', ms: number, warm: boolean | undefined, now = new Date()): Promise<void> {
  await db.insert(perfSamples).values({
    at: now.getTime(),
    kind: kind === 'start' ? 'client_start' : 'client_lesson',
    route: kind === 'start' ? (warm ? 'warm' : 'cold') : 'lesson',
    ms: Math.round(ms),
  });
}

/** Обработчик ошибки фоновой задачи: console.warn (журнал Worker) и журнал ошибок видом job — его видно в админке. */
export function jobError(job: string) {
  return (e: unknown) => {
    const err = e as Error;
    console.warn(`${job} failed`, err?.message ?? String(e));
    void recordError({ kind: 'job', message: err?.message ?? String(e), detail: err?.stack ?? null, path: job });
  };
}

export async function purgePerf(now = new Date()): Promise<void> {
  await db.delete(perfSamples).where(lt(perfSamples.at, now.getTime() - PERF_KEEP_DAYS * 86_400_000));
}

/** Перцентиль p (0…100) по отсортированному списку; пусто — null. */
export function percentile(sorted: number[], p: number): number | null {
  if (!sorted.length) return null;
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))];
}

const stats = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return { n: s.length, p50: percentile(s, 50), p95: percentile(s, 95), p99: percentile(s, 99) };
};

/** Сводка для админки за `hours` часов: маршруты API, запуск и урок в приложении, ошибки по видам (бот — серверные ошибки /telegram/). */
export async function perfSummary(hours: number, now = new Date()) {
  const since = now.getTime() - hours * 3_600_000;
  // Выборка ограничена: при 5 % и нынешнем трафике за месяц это единицы тысяч строк.
  const rows = await db
    .select({ kind: perfSamples.kind, route: perfSamples.route, status: perfSamples.status, ms: perfSamples.ms, d1Ms: perfSamples.d1Ms, d1Calls: perfSamples.d1Calls })
    .from(perfSamples)
    .where(gte(perfSamples.at, since))
    .limit(50_000);
  const byRoute = new Map<string, typeof rows>();
  for (const r of rows.filter((x) => x.kind === 'api')) {
    if (!byRoute.has(r.route)) byRoute.set(r.route, []);
    byRoute.get(r.route)!.push(r);
  }
  const api = [...byRoute].map(([route, list]) => {
    const d1 = [...list.map((x) => x.d1Ms ?? 0)].sort((a, b) => a - b);
    return {
      route,
      ...stats(list.map((x) => x.ms)),
      d1p95: percentile(d1, 95),
      d1Calls: Math.round((list.reduce((n, x) => n + (x.d1Calls ?? 0), 0) / list.length) * 10) / 10,
      errors: list.filter((x) => (x.status ?? 0) >= 500).length,
    };
  });
  api.sort((a, b) => (b.p95 ?? 0) - (a.p95 ?? 0));
  const ms = (kind: string, route?: string) => rows.filter((x) => x.kind === kind && (!route || x.route === route)).map((x) => x.ms);
  const all = stats(rows.filter((x) => x.kind === 'api').map((x) => x.ms));
  const errRows = await db
    .select({ kind: errorLog.kind, path: errorLog.path, n: sql<number>`sum(${errorLog.count})` })
    .from(errorLog)
    .where(and(gte(errorLog.lastAt, since)))
    .groupBy(errorLog.kind, errorLog.path)
    .catch(() => [] as { kind: string; path: string | null; n: number }[]);
  const errors = { api: 0, bot: 0, client: 0, job: 0, csp: 0 };
  for (const e of errRows) {
    const n = Number(e.n) || 0;
    if (e.kind === 'server') errors[(e.path ?? '').startsWith('/telegram/') ? 'bot' : 'api'] += n;
    else if (e.kind in errors) errors[e.kind as keyof typeof errors] += n;
  }
  return {
    hours,
    sampleRate: config.perfSample,
    total: all,
    api,
    client: { start: { cold: stats(ms('client_start', 'cold')), warm: stats(ms('client_start', 'warm')) }, lesson: stats(ms('client_lesson')) },
    errors,
  };
}
