/**
 * База только на чтение на время техработ (MAINTENANCE=on, переезд D1 — docs/OPERATIONS_RU.md, раздел 3а).
 *
 * Запрет записи по методу запроса (app.ts) не ловит GET, которые пишут сами: например, /api/quests заводит задания дня.
 * Такая запись после выгрузки старой базы пропала бы при переключении на новую. Поэтому в техработы Worker получает обёртку над D1:
 * чтение проходит как обычно, любой запрос, меняющий данные, падает с «maintenance:read_only» → 503 maintenance (mapDbError).
 */

/** Первое слово запроса после комментариев и скобок. */
function firstWord(sql: string): string {
  const s = sql.replace(/^(\s+|--[^\n]*\n?|\/\*[\s\S]*?\*\/|\()+/, '');
  return (/^[a-z]+/i.exec(s)?.[0] ?? '').toUpperCase();
}

const WRITES = new Set(['INSERT', 'UPDATE', 'DELETE', 'REPLACE', 'CREATE', 'DROP', 'ALTER', 'PRAGMA', 'VACUUM', 'REINDEX', 'ANALYZE', 'ATTACH', 'DETACH', 'BEGIN', 'COMMIT', 'SAVEPOINT', 'RELEASE']);

/** Меняет ли запрос данные или схему. WITH … INSERT/UPDATE/DELETE считается записью; неизвестное начало — тоже (лучше отказать, чем потерять запись). */
export function isWriteSql(sql: string): boolean {
  const w = firstWord(sql);
  if (w === 'SELECT' || w === 'VALUES' || w === 'EXPLAIN') return false;
  if (w === 'WITH') return /\b(INSERT|UPDATE|DELETE|REPLACE)\b/i.test(sql);
  return WRITES.has(w) || w === '';
}

export const READ_ONLY_ERROR = 'maintenance:read_only';

const cache = new WeakMap<D1Database, D1Database>();

/** Обёртка над D1: prepare/exec запроса на запись сразу бросает ошибку, остальное — как у исходной базы. */
export function readOnlyD1(d1: D1Database): D1Database {
  const hit = cache.get(d1);
  if (hit) return hit;
  const deny = () => {
    throw new Error(READ_ONLY_ERROR);
  };
  const wrapped = new Proxy(d1, {
    get(target, prop) {
      if (prop === 'prepare') return (sql: string) => (isWriteSql(sql) ? deny() : target.prepare(sql));
      if (prop === 'exec') return (sql: string) => (isWriteSql(sql) ? Promise.reject(new Error(READ_ONLY_ERROR)) : target.exec(sql));
      const v = Reflect.get(target, prop, target);
      return typeof v === 'function' ? v.bind(target) : v;
    },
  });
  cache.set(d1, wrapped);
  return wrapped;
}
