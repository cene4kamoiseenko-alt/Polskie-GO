#!/usr/bin/env node
/**
 * Переключение Worker на другую production-базу D1 (1.0, этап 1.1; docs/OPERATIONS_RU.md, раздел 3а): после переезда в Европу
 * и при откате. Имя базы стоит в нескольких местах — пропущенное место значит «выкладка в одну базу, ночная копия другой».
 *
 *   node scripts/d1-switch.mjs <имя> <id>     — вписать имя и id во все места (wrangler.jsonc с комментариями сохраняется)
 *   node scripts/d1-switch.mjs --check        — все места указывают на базу из wrangler.jsonc? (код 1 и список, если нет)
 *   node scripts/d1-switch.mjs --current      — напечатать имя текущей базы (для workflow)
 *   --root <папка> — другой корень (тесты)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
let root = resolve(new URL('..', import.meta.url).pathname);
const ri = args.indexOf('--root');
if (ri >= 0) {
  root = resolve(args[ri + 1]);
  args.splice(ri, 2);
}

const WRANGLER = 'wrangler.jsonc';
const PKG = 'package.json';
const BACKUP = '.github/workflows/d1-backup.yml';
const read = (f) => readFileSync(join(root, f), 'utf8');
const write = (f, s) => writeFileSync(join(root, f), s);

/** Блок привязки DB в wrangler.jsonc: от "binding": "DB" до закрывающей скобки объекта. */
function dbBlock(text) {
  const at = text.search(/"binding"\s*:\s*"DB"/);
  if (at < 0) throw new Error(`${WRANGLER}: нет привязки DB`);
  const start = text.lastIndexOf('{', at);
  const end = text.indexOf('}', at);
  return { start, end, body: text.slice(start, end) };
}

function current() {
  const m = /"database_name"\s*:\s*"([^"]+)"/.exec(dbBlock(read(WRANGLER)).body);
  if (!m) throw new Error(`${WRANGLER}: у привязки DB нет database_name`);
  return m[1];
}

/** Имя базы в командах d1 (`d1 <команда> <имя>`) и `d1 time-travel info <имя>`. */
const D1_CMD = /\bd1 (time-travel info|migrations apply|execute|export) ([\w-]+)/g;

/** Все места, где стоит имя production-базы: [файл, найденные имена]. */
function references() {
  const pkg = JSON.parse(read(PKG));
  const out = [];
  for (const key of ['deploy:cf', 'backup:d1']) out.push([`${PKG} → ${key}`, [...(pkg.scripts[key] ?? '').matchAll(D1_CMD)].map((m) => m[2])]);
  out.push([BACKUP, [...read(BACKUP).matchAll(D1_CMD)].map((m) => m[2])]);
  return out;
}

if (args[0] === '--current') {
  console.log(current());
} else if (args[0] === '--check') {
  const name = current();
  const bad = references().filter(([, names]) => !names.length || names.some((n) => n !== name));
  if (bad.length) {
    console.log(`База в ${WRANGLER}: ${name}. Не совпадают:`);
    for (const [where, names] of bad) console.log(`  • ${where}: ${names.join(', ') || 'имени базы нет'}`);
    process.exit(1);
  }
  console.log(`Все места указывают на базу ${name}: ${WRANGLER}, ${references().map(([w]) => w).join(', ')}.`);
} else {
  const [name, id] = args;
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(name ?? '') || !/^[0-9a-f-]{36}$/.test(id ?? '')) {
    console.error('usage: node scripts/d1-switch.mjs <имя базы> <id базы (uuid)> | --check | --current');
    process.exit(2);
  }
  const old = current();
  // wrangler.jsonc: только внутри блока DB, комментарии и остальное — как были.
  const text = read(WRANGLER);
  const { start, end, body } = dbBlock(text);
  let next = body.replace(/("database_name"\s*:\s*)"[^"]+"/, `$1"${name}"`);
  next = /"database_id"\s*:/.test(next)
    ? next.replace(/("database_id"\s*:\s*)"[^"]+"/, `$1"${id}"`)
    : next.replace(/("database_name"\s*:\s*"[^"]+",)(\s*)/, `$1$2"database_id": "${id}",$2`);
  write(WRANGLER, text.slice(0, start) + next + text.slice(end));
  // Команды: имя старой базы → новое (только в командах d1, не в именах файлов копий).
  const swap = (s) => s.replace(D1_CMD, (m, cmd, db) => (db === old ? `d1 ${cmd} ${name}` : m));
  const pkg = read(PKG);
  write(PKG, pkg.replace(/"(deploy:cf|backup:d1)": "([^"]*)"/g, (m, k, v) => `"${k}": "${swap(v)}"`));
  write(BACKUP, swap(read(BACKUP)));
  console.log(`База: ${old} → ${name} (${id}). Дальше: node scripts/d1-switch.mjs --check, коммит, выкладка, /api/health.`);
}
