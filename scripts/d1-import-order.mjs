#!/usr/bin/env node
/**
 * Переезд базы D1 (docs/OPERATIONS_RU.md, «Переезд базы в Европу», 2026-11-23): `wrangler d1 export` пишет таблицы по алфавиту и
 * вставляет строки сразу после своей таблицы — `ai_conversations` раньше, чем создана `users`, на которую она ссылается. D1 проверяет
 * связи, и загрузка такой выгрузки в новую базу падает («no such table: main.users», найдено сухим прогоном).
 *
 * Скрипт переставляет выгрузку: все CREATE TABLE → строки таблиц в порядке связей (родители раньше детей) → индексы, триггеры и
 * прочее в конце (триггеры-охранники не срабатывают на загрузке). Содержимое не меняется — только порядок. Проверяет, что
 * ни одна инструкция не потерялась.
 *
 *   node scripts/d1-import-order.mjs dump.sql import.sql
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [, , src, dst] = process.argv;
if (!src || !dst) {
  console.error('usage: node scripts/d1-import-order.mjs <export.sql> <import.sql>');
  process.exit(2);
}

/** Разбить SQL на инструкции: ; вне строк и имён; у CREATE TRIGGER — только после END. */
export function splitSql(text) {
  const out = [];
  let cur = '';
  let q = null; // ' " `
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    cur += ch;
    if (q) {
      if (ch === q) {
        if (q === "'" && text[i + 1] === "'") {
          cur += text[++i];
          continue;
        }
        q = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      q = ch;
      continue;
    }
    if (ch === ';') {
      const s = cur.trim();
      if (/^CREATE\s+TRIGGER/i.test(s) && !/\bEND\s*;$/i.test(s)) continue;
      out.push(s);
      cur = '';
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter((s) => s && s !== ';');
}

const unq = (n) => n.replace(/^[`"[]|[`"\]]$/g, '');
const stmts = splitSql(readFileSync(src, 'utf8'));
const pragmas = [];
const tables = new Map(); // имя → CREATE TABLE
const inserts = new Map(); // имя → INSERT[]
const tail = [];
for (const s of stmts) {
  let m;
  if (/^PRAGMA\b/i.test(s)) pragmas.push(s);
  else if ((m = s.match(/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"[]?[\w]+[`"\]]?)/i))) tables.set(unq(m[1]), s);
  else if ((m = s.match(/^INSERT\s+INTO\s+([`"[]?[\w]+[`"\]]?)/i))) {
    const t = unq(m[1]);
    if (!inserts.has(t)) inserts.set(t, []);
    inserts.get(t).push(s);
  } else tail.push(s);
}

// Порядок данных: родители (на кого ссылаются REFERENCES) раньше детей; ссылки на себя и циклы не мешают.
const deps = new Map([...tables].map(([t, sql]) => [t, new Set([...sql.matchAll(/REFERENCES\s+[`"[]?(\w+)[`"\]]?/gi)].map((x) => x[1]).filter((d) => d !== t && tables.has(d)))]));
const order = [];
const state = new Map();
const visit = (t) => {
  if (state.get(t) === 2) return;
  if (state.get(t) === 1) return; // цикл: порядок внутри цикла не важен — связи отложены (defer_foreign_keys)
  state.set(t, 1);
  for (const d of deps.get(t) ?? []) visit(d);
  state.set(t, 2);
  order.push(t);
};
for (const t of [...tables.keys()].sort()) visit(t);
// Служебная sqlite_sequence создаётся самой SQLite — её строки в конце данных.
const dataTables = [...order, ...[...inserts.keys()].filter((t) => !tables.has(t))];

const result = [
  ...pragmas.length ? pragmas : ['PRAGMA defer_foreign_keys=TRUE'],
  ...[...tables.values()],
  ...dataTables.flatMap((t) => inserts.get(t) ?? []),
  ...tail,
];
const count = (arr) => arr.length;
const inCount = stmts.length + (pragmas.length ? 0 : 1);
if (count(result) !== inCount) {
  console.error(`потеряны инструкции: было ${inCount}, стало ${count(result)}`);
  process.exit(1);
}
writeFileSync(dst, result.map((s) => (s.endsWith(';') ? s : `${s};`)).join('\n') + '\n');
console.log(`таблиц: ${tables.size}, строк данных: ${[...inserts.values()].reduce((n, a) => n + a.length, 0)}, прочих инструкций (индексы, триггеры): ${tail.length}`);
console.log(`порядок данных: ${dataTables.filter((t) => inserts.has(t)).join(', ')}`);
