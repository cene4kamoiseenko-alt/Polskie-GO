#!/usr/bin/env node
/**
 * Сверка двух выгрузок D1 построчно (1.0, этап 1.1; docs/OPERATIONS_RU.md, раздел 3а): старая база до переезда и новая после загрузки.
 * d1-compare.mjs сверяет число строк; этот скрипт — содержимое: каждая строка каждой таблицы, схема таблиц, индексы, триггеры.
 * Порядок строк не важен (выгрузку переставляет d1-import-order.mjs, база отдаёт строки в своём порядке).
 *
 *   node scripts/d1-dump-diff.mjs old.sql new.sql    → «совпадает», код 0; любое отличие — список таблиц и объектов, код 1.
 * Значения в отчёт не попадают (там данные игроков) — только имена таблиц и число строк.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { classify, splitSql } from './lib/d1-sql.mjs';

const [, , a, b] = process.argv;
if (!a || !b) {
  console.error('usage: node scripts/d1-dump-diff.mjs <old.sql> <new.sql>');
  process.exit(2);
}

const norm = (s) => s.replace(/\s+/g, ' ').trim();

/** Выгрузка → таблица: { rows: сортированные INSERT, digest } и схема: имя объекта → нормализованный текст. */
function load(file) {
  const rows = new Map();
  const schema = new Map();
  for (const s of splitSql(readFileSync(file, 'utf8'))) {
    const { kind, name } = classify(s);
    if (kind === 'insert') {
      if (!rows.has(name)) rows.set(name, []);
      rows.get(name).push(s);
    } else if (kind === 'table' || kind === 'index' || kind === 'trigger') schema.set(`${kind} ${name}`, norm(s));
  }
  const tables = new Map();
  for (const [t, list] of rows) {
    list.sort();
    tables.set(t, { n: list.length, digest: createHash('sha256').update(list.join('\n')).digest('hex') });
  }
  return { tables, schema };
}

const A = load(a);
const B = load(b);
const problems = [];
for (const key of new Set([...A.schema.keys(), ...B.schema.keys()])) {
  if (!B.schema.has(key)) problems.push(`нет в новой: ${key}`);
  else if (!A.schema.has(key)) problems.push(`лишнее в новой: ${key}`);
  else if (A.schema.get(key) !== B.schema.get(key)) problems.push(`отличается: ${key}`);
}
let rows = 0;
for (const t of [...new Set([...A.tables.keys(), ...B.tables.keys()])].sort()) {
  const x = A.tables.get(t) ?? { n: 0, digest: '' };
  const y = B.tables.get(t) ?? { n: 0, digest: '' };
  rows += x.n;
  if (x.n !== y.n) problems.push(`таблица ${t}: строк было ${x.n}, стало ${y.n}`);
  else if (x.digest !== y.digest) problems.push(`таблица ${t}: ${x.n} строк, содержимое отличается`);
}

if (problems.length) {
  console.log(`Выгрузки НЕ совпадают (${problems.length}):`);
  for (const p of problems) console.log(`  • ${p}`);
  process.exit(1);
}
console.log(`Выгрузки совпадают: ${A.tables.size} таблиц с данными, ${rows} строк, ${A.schema.size} объектов схемы.`);
