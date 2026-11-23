#!/usr/bin/env node
/**
 * Переезд базы D1 (docs/OPERATIONS_RU.md, «Переезд базы в Европу»): сверить две базы после копирования — число строк в каждой таблице,
 * число индексов и триггеров. Любое расхождение — выход с кодом 1 (workflow тогда снимает техработы, приложение остаётся на старой базе).
 *
 *   node scripts/d1-compare.mjs <старая> <новая> [--local -c wrangler.jsonc]   (без --local — удалённые базы, --remote)
 */
import { execFileSync } from 'node:child_process';

const [, , oldDb, newDb, ...rest] = process.argv;
if (!oldDb || !newDb) {
  console.error('usage: node scripts/d1-compare.mjs <old> <new> [--local -c wrangler.jsonc]');
  process.exit(2);
}
const where = rest.includes('--local') ? rest : ['--remote', ...rest];
const run = (db, sql) => {
  const out = execFileSync('npx', ['--yes', 'wrangler@4.152.0', 'd1', 'execute', db, ...where, '--json', '--command', sql], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const json = JSON.parse(out.slice(out.indexOf('[')));
  return json[0].results;
};

const list = (db) => run(db, "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name").map((r) => r.name);
/** Число строк по таблицам: json_object принимает до 127 аргументов — по 40 таблиц за запрос. */
const counts = (db, tables) => {
  const res = {};
  for (let i = 0; i < tables.length; i += 40) {
    const part = tables.slice(i, i + 40);
    const sql = `SELECT json_object(${part.map((t) => `'${t}', (SELECT count(*) FROM "${t}")`).join(', ')}) AS c`;
    Object.assign(res, JSON.parse(run(db, sql)[0].c));
  }
  return res;
};
const kinds = (db) => Object.fromEntries(run(db, "SELECT type, count(*) AS n FROM sqlite_master WHERE type IN ('index','trigger') AND name NOT LIKE 'sqlite_%' GROUP BY type").map((r) => [r.type, r.n]));

const tablesOld = list(oldDb);
const tablesNew = list(newDb);
const missing = tablesOld.filter((t) => !tablesNew.includes(t));
const a = counts(oldDb, tablesOld);
const b = counts(newDb, tablesOld.filter((t) => tablesNew.includes(t)));
const diff = tablesOld.filter((t) => a[t] !== b[t]).map((t) => `${t}: ${a[t]} → ${b[t] ?? 'нет таблицы'}`);
const ka = kinds(oldDb);
const kb = kinds(newDb);
const total = Object.values(a).reduce((s, n) => s + n, 0);
console.log(`таблиц: ${tablesOld.length}, строк: ${total}; индексов ${ka.index ?? 0} → ${kb.index ?? 0}, триггеров ${ka.trigger ?? 0} → ${kb.trigger ?? 0}`);
if (missing.length || diff.length || (ka.index ?? 0) !== (kb.index ?? 0) || (ka.trigger ?? 0) !== (kb.trigger ?? 0)) {
  if (missing.length) console.error(`нет таблиц в новой базе: ${missing.join(', ')}`);
  for (const d of diff) console.error(`расхождение — ${d}`);
  process.exit(1);
}
console.log('базы совпадают');
