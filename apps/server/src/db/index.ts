/**
 * Доступ до D1 через Drizzle.
 * D1 не має інтерактивних транзакцій, тому зміни групуються в атомарні пакети (`atomic`):
 * якщо будь-який запит пакета падає (тригер-охоронець, CHECK, UNIQUE), D1 відкочує весь пакет.
 * Увага: запити з JOIN не можна читати через db.batch — Drizzle плутає однойменні колонки; для них Promise.all.
 */
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import type { BatchItem } from 'drizzle-orm/batch';
import { HttpError, badRequest } from '../lib/errors';
import * as schema from './schema';

export type DB = DrizzleD1Database<typeof schema>;
export type Stmt = BatchItem<'sqlite'>;

let current: DB | null = null;
let bound: D1Database | null = null;

export function bindDb(d1: D1Database) {
  if (bound !== d1) {
    current = drizzle(d1, { schema });
    bound = d1;
  }
}

/** Поточне з'єднання (прив'язується на початку кожного запиту). */
export const db = new Proxy({} as DB, {
  get(_t, prop) {
    if (!current) throw new Error('Database is not bound');
    const v = Reflect.get(current, prop, current);
    return typeof v === 'function' ? v.bind(current) : v;
  },
});

function errorText(e: unknown): string {
  const parts: string[] = [];
  let cur: unknown = e;
  for (let i = 0; cur && i < 5; i++) {
    parts.push(String((cur as Error).message ?? cur));
    cur = (cur as { cause?: unknown }).cause;
  }
  return parts.join(' | ');
}

/** Порушення унікальності (повторна подія з тим самим ключем). */
export function isUniqueViolation(e: unknown) {
  return /UNIQUE constraint failed/i.test(errorText(e));
}

/** Перетворює помилки охоронців БД на зрозумілі HTTP-відповіді. */
export function mapDbError(e: unknown): unknown {
  const text = errorText(e);
  if (text.includes('conflict:session')) return new HttpError(409, 'conflict', 'Сесію змінено паралельним запитом');
  if (text.includes('conflict:claimed')) return badRequest('already_claimed');
  if (text.includes('game_wallets_balance_non_negative')) return badRequest('insufficient_funds', 'Недостатньо Złotki');
  return e;
}

type Preparable = { _prepare(): { getQuery(): { sql: string; params: unknown[] } } };

/**
 * Виконати пакет змін атомарно.
 * Запити компілюються Drizzle, а виконуються напряму через D1 batch
 * (Drizzle не підтримує сирі `db.run(sql)` з параметрами всередині batch).
 */
export async function atomic(stmts: (Stmt | null | undefined | false)[]) {
  const list = stmts.filter(Boolean) as Stmt[];
  if (!list.length) return;
  if (!bound) throw new Error('Database is not bound');
  const d1 = bound;
  const prepared = list.map((q) => {
    const { sql, params } = (q as unknown as Preparable)._prepare().getQuery();
    return d1.prepare(sql).bind(...params);
  });
  try {
    await d1.batch(prepared);
  } catch (e) {
    throw mapDbError(e);
  }
}

export { schema };

/** Розбити рядки на частини для багаторядкових INSERT (D1: не більше 100 параметрів на запит). */
export function chunks<T>(rows: T[], size = 6): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}
