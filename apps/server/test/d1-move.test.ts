/**
 * Переезд базы D1 (1.0, этап 1.1; docs/OPERATIONS_RU.md, раздел 3а): после загрузки в новую базу её выгружают ещё раз и сравнивают
 * с выгрузкой старой построчно (scripts/d1-dump-diff.mjs): порядок строк не важен, любое отличие значения, лишняя или пропавшая
 * строка, индекс или триггер — ошибка с именем таблицы. Сверка числа строк (d1-compare.mjs) такую подмену значения не видит.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(__dirname, '../../..');
const dir = mkdtempSync(join(tmpdir(), 'd1-move-'));

const OLD = `PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (id text PRIMARY KEY, name text);
INSERT INTO "users" ("id","name") VALUES('u1','Ania');
INSERT INTO "users" ("id","name") VALUES('u2','Bo; ''b''
ek');
CREATE TABLE wallets (user_id text REFERENCES users(id), balance integer);
INSERT INTO "wallets" ("user_id","balance") VALUES('u1',120);
CREATE INDEX wallets_user ON wallets (user_id);
CREATE TRIGGER no_negative BEFORE UPDATE ON wallets WHEN NEW.balance < 0 BEGIN SELECT RAISE(ABORT, 'x'); END;
`;

function diff(a: string, b: string): { code: number; out: string } {
  const fa = join(dir, `a-${Math.random()}.sql`);
  const fb = join(dir, `b-${Math.random()}.sql`);
  writeFileSync(fa, a);
  writeFileSync(fb, b);
  try {
    return { code: 0, out: execFileSync('node', [join(ROOT, 'scripts/d1-dump-diff.mjs'), fa, fb], { encoding: 'utf8' }) };
  } catch (e) {
    const err = e as { status: number; stdout: string; stderr: string };
    return { code: err.status, out: `${err.stdout}${err.stderr}` };
  }
}

describe('сверка выгрузок при переезде базы', () => {
  it('та же база в другом порядке (как после d1-import-order) — совпадает', () => {
    const order = join(dir, 'import.sql');
    const src = join(dir, 'export.sql');
    writeFileSync(src, OLD);
    execFileSync('node', [join(ROOT, 'scripts/d1-import-order.mjs'), src, order]);
    const reordered = require('node:fs').readFileSync(order, 'utf8') as string;
    expect(reordered).not.toBe(OLD);
    const r = diff(OLD, reordered);
    expect(r.out).toContain('Выгрузки совпадают');
    expect(r.code).toBe(0);
  });

  // Найдено сухим прогоном переезда (restore:drill --self-test): выгрузка D1 пишет «DELETE FROM sqlite_sequence;» перед счётчиками
  // AUTOINCREMENT, а перестановка уносила DELETE в конец — после вставки счётчики обнулялись и номера могли повториться.
  it('счётчики AUTOINCREMENT переживают перестановку (DELETE FROM sqlite_sequence — до вставки)', () => {
    const src = join(dir, 'seq.sql');
    const out = join(dir, 'seq-import.sql');
    writeFileSync(src, `${OLD}CREATE TABLE d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name text);\nINSERT INTO "d1_migrations" ("id","name") VALUES(30,'0029.sql');\nDELETE FROM sqlite_sequence;\nINSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',30);\n`);
    execFileSync('node', [join(ROOT, 'scripts/d1-import-order.mjs'), src, out]);
    const text = require('node:fs').readFileSync(out, 'utf8') as string;
    const del = text.indexOf('DELETE FROM sqlite_sequence');
    const ins = text.indexOf('INSERT INTO "sqlite_sequence"');
    expect(del).toBeGreaterThan(-1);
    expect(del).toBeLessThan(ins);
  });

  it('другое значение в строке — ошибка с именем таблицы', () => {
    const r = diff(OLD, OLD.replace("VALUES('u1',120)", "VALUES('u1',121)"));
    expect(r.code).toBe(1);
    expect(r.out).toContain('wallets');
  });

  it('пропавшая строка — ошибка', () => {
    const r = diff(OLD, OLD.replace(`INSERT INTO "users" ("id","name") VALUES('u1','Ania');\n`, ''));
    expect(r.code).toBe(1);
    expect(r.out).toContain('users');
  });

  it('пропавший триггер — ошибка', () => {
    const r = diff(OLD, OLD.replace(/CREATE TRIGGER[^\n]+\n/, ''));
    expect(r.code).toBe(1);
    expect(r.out).toContain('no_negative');
  });
});

/**
 * Переключение на новую базу (scripts/d1-switch.mjs): имя и id базы стоят в нескольких местах — wrangler.jsonc, команды выкладки
 * и копии в package.json, ночная копия. Пропущенное место = выкладка в одну базу, копия другой. --check сверяет все места.
 */
describe('переключение имени production-базы', () => {
  const FILES = ['wrangler.jsonc', 'package.json', '.github/workflows/d1-backup.yml'];
  const run = (args: string[]) => {
    try {
      return { code: 0, out: execFileSync('node', [join(ROOT, 'scripts/d1-switch.mjs'), ...args], { encoding: 'utf8' }) };
    } catch (e) {
      const err = e as { status: number; stdout: string; stderr: string };
      return { code: err.status, out: `${err.stdout}${err.stderr}` };
    }
  };
  const copy = () => {
    const root = mkdtempSync(join(tmpdir(), 'd1-switch-'));
    const fs = require('node:fs') as typeof import('node:fs');
    for (const f of FILES) {
      fs.mkdirSync(join(root, f, '..'), { recursive: true });
      fs.copyFileSync(join(ROOT, f), join(root, f));
    }
    return root;
  };

  it('в репозитории все места указывают на одну базу', () => {
    const r = run(['--check']);
    expect(r.out).toContain('polski-go');
    expect(r.code).toBe(0);
  });

  it('переключение меняет все места разом, комментарии wrangler.jsonc на месте', () => {
    const root = copy();
    const uuid = '11111111-2222-3333-4444-555555555555';
    expect(run(['--root', root, 'polski-go-eu', uuid]).code).toBe(0);
    const fs = require('node:fs') as typeof import('node:fs');
    const cfg = fs.readFileSync(join(root, 'wrangler.jsonc'), 'utf8');
    expect(cfg).toContain('"database_name": "polski-go-eu"');
    expect(cfg).toContain(`"database_id": "${uuid}"`);
    expect(cfg).toContain('// POLSKI GO на Cloudflare Workers');
    const pkg = JSON.parse(fs.readFileSync(join(root, 'package.json'), 'utf8'));
    expect(pkg.scripts['deploy:cf']).toContain('migrations apply polski-go-eu --remote');
    expect(pkg.scripts['deploy:cf']).not.toMatch(/polski-go(?!-eu)\b/);
    expect(fs.readFileSync(join(root, '.github/workflows/d1-backup.yml'), 'utf8')).toContain('d1 export polski-go-eu --remote');
    const check = run(['--root', root, '--check']);
    expect(check.out).toContain('polski-go-eu');
    expect(check.code).toBe(0);
    // Повторное переключение (откат) — то же самое в обратную сторону.
    expect(run(['--root', root, 'polski-go', '99999999-2222-3333-4444-555555555555']).code).toBe(0);
    expect(run(['--root', root, '--check']).code).toBe(0);
  });

  it('место, забытое вручную, ловится проверкой', () => {
    const root = copy();
    const fs = require('node:fs') as typeof import('node:fs');
    const p = join(root, '.github/workflows/d1-backup.yml');
    fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('d1 export polski-go --remote', 'd1 export polski-go-old --remote'));
    const r = run(['--root', root, '--check']);
    expect(r.code).toBe(1);
    expect(r.out).toContain('d1-backup.yml');
  });
});

/**
 * Найдено настоящей копией production-базы (2026-11-28): строка tts_cache с аудио 86 КБ даёт в выгрузке инструкцию 172 КБ, а D1 (и локальная
 * база) не принимает инструкции длиннее 100 КБ — загрузка в новую базу упала бы на ней. Перестановка разбивает такую строку:
 * INSERT с пустым значением + UPDATE … || часть (каждая < 100 КБ), байты те же.
 */
describe('длинные строки при переезде', () => {
  it('значение 250 КБ загружается в D1 по частям, байты совпадают', async () => {
    const { Miniflare } = await import('miniflare');
    const mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response(null) } }', d1Databases: { DB: `big-${Date.now()}` } });
    try {
      const d1 = (await mf.getD1Database('DB')) as unknown as D1Database;
      const bytes = Buffer.alloc(250_000);
      for (let i = 0; i < bytes.length; i++) bytes[i] = (i * 31 + 7) % 256;
      const hex = bytes.toString('hex').toUpperCase();
      const text = "Zażółć gęślą jaźń; ''cytat'' ".repeat(6000);
      const src = join(dir, 'big.sql');
      const out = join(dir, 'big-import.sql');
      writeFileSync(
        src,
        `PRAGMA defer_foreign_keys=TRUE;\nCREATE TABLE \`tts_cache\` (\n\t\`key\` text PRIMARY KEY NOT NULL,\n\t\`text\` text NOT NULL,\n\t\`data\` blob NOT NULL,\n\t\`n\` integer\n);\nINSERT INTO "tts_cache" ("key","text","data","n") VALUES('k1','${text}',X'${hex}',5);\nINSERT INTO "tts_cache" ("key","text","data","n") VALUES('k2','short',X'00FF',6);\n`,
      );
      execFileSync('node', [join(ROOT, 'scripts/d1-import-order.mjs'), src, out]);
      const { splitSql } = await import(join(ROOT, 'scripts/lib/d1-sql.mjs'));
      const stmts = splitSql(require('node:fs').readFileSync(out, 'utf8')) as string[];
      expect(Math.max(...stmts.map((s) => s.length))).toBeLessThan(100_000);
      for (const s of stmts) await d1.prepare(s).run();
      const row = await d1.prepare('SELECT hex(data) AS h, typeof(data) AS t, text, n FROM tts_cache WHERE key = ?').bind('k1').first<{ h: string; t: string; text: string; n: number }>();
      expect(row!.t).toBe('blob');
      expect(row!.h).toBe(hex);
      expect(row!.text).toBe(text.replaceAll("''", "'"));
      expect(row!.n).toBe(5);
      expect((await d1.prepare('SELECT hex(data) AS h FROM tts_cache WHERE key = ?').bind('k2').first<{ h: string }>())!.h).toBe('00FF');
    } finally {
      await mf.dispose();
    }
  }, 120_000);
});
