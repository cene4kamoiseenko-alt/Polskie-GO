/**
 * Счётчик обращений к D1 на запрос (1.0, этап 1.2): каждое обращение — поход по сети к базе, поэтому их число и время на запрос —
 * главные показатели скорости API. Счётчик живёт в AsyncLocalStorage: Worker обслуживает несколько запросов одновременно,
 * у каждого свой. Обращение = вызов all/first/run/raw у запроса, batch целиком или exec.
 *
 * Значения уходят в заголовок `server-timing` (видно в DevTools и в проверках) и в выборку мониторинга (services/perf.ts).
 */
import { AsyncLocalStorage } from 'node:async_hooks';

/** ms — время, когда запрос ждал базу: параллельные обращения не складываются (объединение отрезков времени). */
export type D1Stats = { calls: number; statements: number; ms: number; open?: number; since?: number };

const als = new AsyncLocalStorage<D1Stats>();

/** Счётчик текущего запроса (undefined вне запроса — cron, тесты напрямую). */
export const d1Stats = (): D1Stats | undefined => als.getStore();

/** Выполнить fn со своим счётчиком. */
export function withD1Stats<T>(stats: D1Stats, fn: () => Promise<T>): Promise<T> {
  return als.run(stats, fn);
}

function timed<T>(statements: number, run: () => Promise<T>): Promise<T> {
  const s = als.getStore();
  if (!s) return run();
  s.calls++;
  s.statements += statements;
  // Отрезок «ждём базу» открывается первым обращением и закрывается последним: параллельные не складываются.
  if (!s.open) s.since = performance.now();
  s.open = (s.open ?? 0) + 1;
  return run().finally(() => {
    s.open = (s.open ?? 1) - 1;
    if (!s.open) s.ms += performance.now() - (s.since ?? performance.now());
  });
}

const EXEC = new Set(['all', 'first', 'run', 'raw']);
/** Обёртка → исходный запрос: batch D1 принимает только «родные» запросы. */
const originals = new WeakMap<object, D1PreparedStatement>();

function wrapStatement(stmt: D1PreparedStatement): D1PreparedStatement {
  const w = new Proxy(stmt, {
    get(t, p) {
      if (p === 'bind') return (...args: unknown[]) => wrapStatement(t.bind(...args));
      if (typeof p === 'string' && EXEC.has(p)) return (...args: unknown[]) => timed(1, () => (t[p as 'all'] as (...a: unknown[]) => Promise<unknown>)(...args));
      const v = Reflect.get(t, p, t);
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  originals.set(w, stmt);
  return w;
}

const cache = new WeakMap<D1Database, D1Database>();

/** D1 со счётчиком обращений. Одна обёртка на базу (Drizzle создаётся заново только при смене базы). */
export function instrumentD1(d1: D1Database): D1Database {
  const hit = cache.get(d1);
  if (hit) return hit;
  const w = new Proxy(d1, {
    get(t, p) {
      if (p === 'prepare') return (sql: string) => wrapStatement(t.prepare(sql));
      if (p === 'batch') return (list: D1PreparedStatement[]) => timed(list.length, () => t.batch(list.map((s) => originals.get(s) ?? s)));
      if (p === 'exec') return (sql: string) => timed(1, () => t.exec(sql));
      const v = Reflect.get(t, p, t);
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  cache.set(d1, w);
  return w;
}
