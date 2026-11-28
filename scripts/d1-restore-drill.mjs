/**
 * Учебное восстановление базы из резервной копии (docs/OPERATIONS_RU.md, раздел «Проверка восстановления»).
 * Ничего не трогает в Cloudflare: копия заливается в ЛОКАЛЬНУЮ базу D1 (wrangler --local, отдельная папка) и сверяются ключевые таблицы.
 *
 *   node scripts/d1-restore-drill.mjs <копия.sql | копия.sql.gz | копия.sql.gz.gpg>
 *     • .gpg расшифровывается паролем из BACKUP_PASSPHRASE (как в .github/workflows/d1-backup.yml);
 *     • результат — число строк в таблицах игроков и прогресса; код выхода ≠ 0, если копия пустая или не залилась.
 *
 *   node scripts/d1-restore-drill.mjs --self-test
 *     • без доступа к Cloudflare: локальная база из миграций и seed → экспорт (как ночная копия) → восстановление в чистую базу → сверка.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const work = join(root, '.wrangler', 'restore-drill');
const TABLES = ['users', 'player_progress', 'game_wallets', 'user_inventory', 'user_lesson_progress', 'user_missions', 'subscriptions', 'payment_events', 'cosmetic_items', 'lessons', 'exercises'];

/**
 * Каждая база — отдельная папка-«проект» со своим wrangler.jsonc: локальное состояние D1 лежит в <папка>/.wrangler/state,
 * поэтому рабочая локальная база разработчика (.wrangler/state в корне) не затрагивается (экспорт не принимает другой путь к состоянию).
 */
function project(label) {
  const dir = join(work, label);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const cfg = {
    name: `drill-${label}`,
    compatibility_date: '2026-10-01',
    d1_databases: [{ binding: 'DB', database_name: 'polski-go', database_id: '00000000-0000-0000-0000-000000000000', migrations_dir: join(root, 'apps/server/migrations') }],
  };
  writeFileSync(join(dir, 'wrangler.jsonc'), JSON.stringify(cfg, null, 2));
  return dir;
}

const wrangler = (args, dir) =>
  execFileSync('npx', ['wrangler', 'd1', ...args, '--local'], {
    cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024, env: { ...process.env, CI: '1' },
  });

function counts(dir) {
  const out = {};
  for (const t of TABLES) {
    const raw = wrangler(['execute', 'polski-go', '--json', '--command', `SELECT count(*) AS n FROM ${t}`], dir);
    out[t] = JSON.parse(raw)[0].results[0].n;
  }
  return out;
}

function restore(sqlFile, label) {
  const dir = project(label);
  const ordered = join(work, `${label}.ordered.sql`);
  // Тот же порядок, что при переезде (d1-import-order: связи, триггеры в конце, длинные строки по частям — предел D1 100 КБ).
  execFileSync('node', [join(root, 'scripts/d1-import-order.mjs'), sqlFile, ordered], { stdio: 'inherit' });
  wrangler(['execute', 'polski-go', '--yes', '--file', ordered], dir);
  return { ...counts(dir), file: ordered };
}

function readBackup(file) {
  let buf = readFileSync(file);
  if (file.endsWith('.gpg')) {
    const pass = process.env.BACKUP_PASSPHRASE;
    if (!pass) throw new Error('Для .gpg нужен BACKUP_PASSPHRASE');
    buf = execFileSync('gpg', ['--batch', '--yes', '--pinentry-mode', 'loopback', '--passphrase', pass, '--decrypt', file], { maxBuffer: 1024 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  }
  if (file.endsWith('.gz') || file.endsWith('.gz.gpg')) buf = gunzipSync(buf);
  mkdirSync(work, { recursive: true });
  const plain = join(work, 'backup.sql');
  writeFileSync(plain, buf);
  return plain;
}

const arg = process.argv[2];
if (!arg) {
  console.error('Укажите файл копии или --self-test');
  process.exit(2);
}

if (arg === '--self-test') {
  rmSync(work, { recursive: true, force: true });
  const source = project('source');
  // База как на проде: миграции + seed (seed.sql собирает `npm run seed:sql -w @polski-go/server`).
  wrangler(['migrations', 'apply', 'polski-go'], source);
  const seed = join(root, 'apps/server/seed.sql');
  if (!existsSync(seed)) throw new Error('Нет apps/server/seed.sql: npm run seed:sql -w @polski-go/server');
  wrangler(['execute', 'polski-go', '--yes', '--file', seed], source);
  // Немного «игроков», чтобы проверить не только справочники.
  wrangler(['execute', 'polski-go', '--yes', '--command', "INSERT INTO users (id, telegram_id, first_name, referral_code) VALUES ('u_drill_1', 900000001, 'Drill', 'DRILL1'), ('u_drill_2', 900000002, 'Drill2', 'DRILL2')"], source);
  const before = counts(source);
  const dump = join(work, 'export.sql');
  wrangler(['export', 'polski-go', '--output', dump], source);
  const after = restore(dump, 'restored');
  const diff = TABLES.filter((t) => before[t] !== after[t]);
  // Триггер-счётчик заданий урока не должен удвоиться при восстановлении.
  const exerciseCount = (dir) => JSON.parse(wrangler(['execute', 'polski-go', '--json', '--command', 'SELECT sum(exercise_count) AS n FROM lessons'], dir))[0].results[0].n;
  const [srcCount, dstCount] = [exerciseCount(source), exerciseCount(join(work, 'restored'))];
  if (srcCount !== dstCount) diff.push(`lessons.exercise_count ${srcCount} → ${dstCount}`);
  console.table(TABLES.map((t) => ({ table: t, source: before[t], restored: after[t] })));
  // Путь переезда базы (d1-move.yml): выгрузка → d1-import-order → загрузка в пустую базу → новая выгрузка → построчная сверка.
  const moved = project('moved');
  const importSql = join(work, 'import.sql');
  execFileSync('node', [join(root, 'scripts/d1-import-order.mjs'), dump, importSql], { stdio: 'inherit' });
  wrangler(['execute', 'polski-go', '--yes', '--file', importSql], moved);
  const movedDump = join(work, 'moved-export.sql');
  wrangler(['export', 'polski-go', '--output', movedDump], moved);
  try {
    execFileSync('node', [join(root, 'scripts/d1-dump-diff.mjs'), dump, movedDump], { stdio: 'inherit' });
  } catch {
    diff.push('переезд: построчная сверка выгрузок не совпала');
  }
  if (diff.length || !after.users) {
    console.error(`Расхождение после восстановления: ${diff.join(', ') || 'нет игроков'}`);
    process.exit(1);
  }
  console.log('Учебное восстановление: экспорт → чистая база → совпадение по всем таблицам');
} else {
  const plain = readBackup(resolve(arg));
  const got = restore(plain, 'restored');
  // Построчная сверка: восстановленная база, выгруженная заново, совпадает с копией (как проверка переезда).
  const again = join(work, 'restored-export.sql');
  wrangler(['export', 'polski-go', '--output', again], join(work, 'restored'));
  execFileSync('node', [join(root, 'scripts/d1-dump-diff.mjs'), plain, again], { stdio: 'inherit' });
  console.table(TABLES.map((t) => ({ table: t, rows: got[t] })));
  if (!got.users || !got.lessons) {
    console.error('Копия не восстановилась: нет игроков или уроков');
    process.exit(1);
  }
  console.log(`Копия ${arg} восстанавливается: игроков ${got.users}, уроков ${got.lessons}. Локальная база: ${join(work, 'restored', '.wrangler')}`);
  console.log(`Файл в правильном порядке (для новой базы: wrangler d1 execute <база> --remote --file …): ${got.file}`);
}
