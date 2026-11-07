/**
 * Нагрузочный тест: N «телефонов» одновременно (по умолчанию 500) против настоящего Worker (workerd, `wrangler dev --local`) с локальной D1.
 *
 *   node --import tsx scripts/load-test.ts                 — 500 игроков, разгон 5 с
 *   LOAD_USERS=200 LOAD_RAMP_MS=2000 node --import tsx scripts/load-test.ts
 *
 * Что делает каждый виртуальный игрок (как живой, с паузами «подумать»): вход по подписанному initData со своим IP → знакомство →
 * открытие приложения (8 запросов параллельно) → миссия «Żabka» целиком → урок целиком (по ≥ 1 с на задание — антибот сервера) →
 * дневная цель → домашний бонус (двойное нажатие) → второй показ главной. Заодно проверяются гонки: двойной финиш урока, двойное
 * нажатие «забрать бонус», двойной ответ на шаг миссии.
 *
 * После прогона сверяется база: ни одной серверной ошибки в журнале, ни одной двойной награды, баланс каждого игрока = сумма журнала операций.
 * Результат: test-results/load-test.json и docs/LOAD_TEST_RU.md (таблица задержек и перечень ограничений теста).
 *
 * Честно о том, что это значит: тест гоняет код и базу на одном компьютере (4 ядра делятся между генератором нагрузки и Worker), без сети
 * Cloudflare и без настоящей D1 (локальный SQLite быстрее). Он показывает, что логика выдерживает 500 одновременных игроков без гонок и
 * ошибок, и даёт сравнительные числа до/после правок; цифры задержек на production будут другими.
 */
import { spawn, execFileSync, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { ExerciseItem } from '@polski-go/shared';
import { signInitData } from '../apps/server/src/lib/telegram';
import { MISSIONS } from '../apps/server/src/content/missions';
import { correctAnswers } from '../apps/server/test/helpers';

const root = resolve(new URL('..', import.meta.url).pathname);
const N = Number(process.env.LOAD_USERS ?? 500);
const RAMP_MS = Number(process.env.LOAD_RAMP_MS ?? 5000);
const PORT = Number(process.env.LOAD_PORT ?? 8788);
/**
 * LOAD_BASE_URL — прогнать против уже выложенного Worker (staging, docs/STAGING.md) вместо локального: нужны LOAD_BOT_TOKEN (токен тестового бота
 * staging, им подписывается initData) и LOAD_ALLOW_REMOTE=yes. Production не трогать: 500 «игроков» с миссиями и уроками — это 500 настоящих
 * аккаунтов и награды в боевой базе. Сверка базы в этом режиме пропускается (нет доступа к D1), считаются только ответы и задержки.
 */
const REMOTE = process.env.LOAD_BASE_URL?.replace(/\/$/, '') ?? '';
const BASE = REMOTE || `http://127.0.0.1:${PORT}`;
const BOT_TOKEN = process.env.LOAD_BOT_TOKEN ?? '123456:LOAD_TEST_TOKEN';
const SECRET = 'load-test-secret-0123456789abcdef0123456789';
if (REMOTE && process.env.LOAD_ALLOW_REMOTE !== 'yes') {
  console.error(`LOAD_BASE_URL задан (${REMOTE}), но нет LOAD_ALLOW_REMOTE=yes. Это должен быть staging, не production: тест создаёт N настоящих аккаунтов.`);
  process.exit(2);
}
const dir = join(root, '.wrangler', 'loadtest');
const THINK = (min: number, max: number) => new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));

// ── База и сервер ──────────────────────────────────────────────────────────────────────────────────────────────────
const wr = (args: string[], opts: { json?: boolean } = {}) =>
  execFileSync('npx', ['wrangler', ...args], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 512 * 1024 * 1024, env: { ...process.env, CI: '1' } }) as string;
const sql = <T>(query: string): T[] => JSON.parse(wr(['d1', 'execute', 'polski-go', '--local', '--persist-to', dir, '--json', '--command', query]))[0].results as T[];

async function prepare() {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const seed = join(root, 'apps/server/seed.sql');
  if (!existsSync(seed)) throw new Error('Нет apps/server/seed.sql: npm run seed:sql -w @polski-go/server');
  if (!existsSync(join(root, 'dist-cf'))) throw new Error('Нет dist-cf: npm run build');
  console.log('база: миграции…');
  wr(['d1', 'migrations', 'apply', 'polski-go', '--local', '--persist-to', dir]);
  console.log('база: seed…');
  wr(['d1', 'execute', 'polski-go', '--local', '--persist-to', dir, '--yes', '--file', seed]);
}

let server: ChildProcess | null = null;
const serverLog: string[] = [];
async function startServer() {
  // Порт должен быть свободен: иначе здоровый ответ мог бы прийти от чужого (старого) Worker с другой базой.
  if (await fetch(`${BASE}/api/health`).then(() => true, () => false)) throw new Error(`Порт ${PORT} занят: остановите прежний Worker (pkill -f workerd)`);
  server = spawn('npx', ['wrangler', 'dev', '--local', '--persist-to', dir, '--port', String(PORT), '--var', `SESSION_SECRET:${SECRET}`, '--var', `TELEGRAM_BOT_TOKEN:${BOT_TOKEN}`, '--var', 'INIT_DATA_MAX_AGE:86400'], {
    cwd: root, env: { ...process.env, CI: '1', NO_COLOR: '1' }, stdio: ['ignore', 'pipe', 'pipe'], detached: true,
  });
  for (const s of [server.stdout!, server.stderr!]) s.on('data', (b: Buffer) => serverLog.push(b.toString()));
  const t0 = Date.now();
  for (;;) {
    if (Date.now() - t0 > 120_000) throw new Error(`Worker не поднялся за 120 с:\n${serverLog.join('').slice(-2000)}`);
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return;
    } catch {
      /* ещё поднимается */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

// ── Измерения ──────────────────────────────────────────────────────────────────────────────────────────────────────
type Sample = { ep: string; ms: number; status: number };
const samples: Sample[] = [];
const failures: string[] = [];
const fail = (who: number, what: string) => {
  if (failures.length < 50) failures.push(`#${who} ${what}`);
};
const norm = (path: string) => path.replace(/\/(runs|sessions)\/[A-Za-z0-9_-]+/, '/$1/:id').replace(/\?.*/, '');

class Phone {
  token = '';
  constructor(readonly n: number, readonly tgId: number) {}
  get ip() {
    return `10.${(this.n >> 16) & 255}.${(this.n >> 8) & 255}.${this.n & 255}`;
  }
  async call(method: 'GET' | 'POST' | 'PATCH', path: string, payload?: unknown, extra: { ok?: number[] } = {}) {
    const t0 = performance.now();
    let status = 0;
    let body: any = null;
    try {
      const res = await fetch(`${BASE}${path.startsWith('/api') ? path : `/api${path}`}`, {
        method,
        headers: { 'cf-connecting-ip': this.ip, ...(this.token ? { authorization: `Bearer ${this.token}` } : {}), ...(payload !== undefined ? { 'content-type': 'application/json' } : {}) },
        body: payload !== undefined ? JSON.stringify(payload) : undefined,
      });
      status = res.status;
      const text = await res.text();
      body = text ? JSON.parse(text) : null;
    } catch (e) {
      status = -1;
      body = { error: (e as Error).message };
    }
    samples.push({ ep: `${method} ${norm(path.startsWith('/api') ? path.slice(4) : path)}`, ms: performance.now() - t0, status });
    const allowed = extra.ok ?? [200];
    if (!allowed.includes(status)) fail(this.n, `${method} ${path} → ${status} ${JSON.stringify(body).slice(0, 160)}`);
    return { status, body };
  }
}

// ── Знание ответов ─────────────────────────────────────────────────────────────────────────────────────────────────
let exercises: Map<string, ExerciseItem>;
function loadExercises() {
  const rows = sql<{ id: string; type: string; skill: string; data: string }>('SELECT id, type, skill, data FROM exercises');
  exercises = new Map(rows.map((r) => [r.id, { key: r.id, type: r.type, skill: r.skill, data: JSON.parse(r.data) } as unknown as ExerciseItem]));
  console.log(`упражнений в базе: ${exercises.size}`);
}

// ── Виртуальный игрок ──────────────────────────────────────────────────────────────────────────────────────────────
const MISSION = MISSIONS.find((m) => m.slug === 'zabka-first-order')!;
const stats = { logins: 0, onboarded: 0, missionsDone: 0, lessonsDone: 0, bonusClaimed: 0, doubleFinish: 0, doubleFinishReplay: 0, doubleBonus: 0, doubleAnswer: 0 };

async function player(n: number) {
  const tgId = 8_000_000 + n;
  const me = new Phone(n, tgId);
  // 1. Вход: подписанный initData, как из Telegram.
  const initData = signInitData(
    { auth_date: String(Math.floor(Date.now() / 1000)), query_id: `AAH${n}`, user: JSON.stringify({ id: tgId, first_name: `Load${n}`, language_code: n % 3 === 0 ? 'ru' : n % 3 === 1 ? 'uk' : 'en' }) },
    BOT_TOKEN,
  );
  const auth = await me.call('POST', '/auth/telegram', { initData });
  if (auth.status !== 200) return;
  me.token = auth.body.token;
  stats.logins++;
  // 2. Знакомство.
  const ob = await me.call('POST', '/me/onboarding', { uiLanguage: n % 3 === 0 ? 'ru' : n % 3 === 1 ? 'uk' : 'en', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 5, reminderHour: null });
  if (ob.status === 200) stats.onboarded++;
  // 3. Открытие приложения: главная тянет всё сразу.
  const [, journeyRes] = await Promise.all([me.call('GET', '/me'), me.call('GET', '/journey'), me.call('GET', '/quests'), me.call('GET', '/shop'), me.call('GET', '/house'), me.call('GET', '/missions'), me.call('GET', '/achievements'), me.call('GET', '/wallet/transactions')]);
  void journeyRes;
  await THINK(300, 1200);
  // 4. Миссия «Żabka» целиком (бесплатная, 15 шагов).
  const start = await me.call('POST', `/missions/${MISSION.slug}/start`);
  if (start.status === 200) {
    const runId = start.body.runId as string;
    let last: any = null;
    for (const [i, s] of MISSION.steps.entries()) {
      const answer = s.kind === 'build' ? { text: s.answer } : { option: s.options!.findIndex((o) => o.ok) };
      if (i === 3 && n % 5 === 0) {
        // Двойное нажатие: два одинаковых ответа сразу — шаг засчитывается один раз.
        const [a, b] = await Promise.all([me.call('POST', `/missions/runs/${runId}/answer`, { step: i, ...answer }, { ok: [200, 409] }), me.call('POST', `/missions/runs/${runId}/answer`, { step: i, ...answer }, { ok: [200, 409] })]);
        last = a.status === 200 ? a : b;
        stats.doubleAnswer++;
      } else last = await me.call('POST', `/missions/runs/${runId}/answer`, { step: i, ...answer });
      if (last.status !== 200 || !last.body.correct) {
        fail(n, `миссия шаг ${s.id}: ${last.status} ${JSON.stringify(last.body).slice(0, 120)}`);
        break;
      }
      await THINK(150, 500);
    }
    if (last?.body?.finished) stats.missionsDone++;
  }
  // 5. Урок целиком.
  const lessonId = journeyRes.body?.cities?.[0]?.routes?.[0]?.lessons?.[0]?.id as string | undefined;
  if (lessonId) {
    const ses = await me.call('POST', '/sessions', { lessonId });
    if (ses.status === 200) {
      const sid = ses.body.sessionId as string;
      const t0 = Date.now();
      let n_done = 0;
      for (const item of ses.body.items as { key: string; type: string }[]) {
        const full = exercises.get(item.key);
        if (!full) {
          fail(n, `нет упражнения ${item.key} в базе`);
          continue;
        }
        const answers = item.type === 'PRONUNCIATION' ? [{ skipped: true }] : correctAnswers(full);
        for (const a of answers) {
          const r = await me.call('POST', `/sessions/${sid}/answer`, { key: item.key, answer: a });
          if (r.status !== 200) break;
        }
        n_done++;
        // Антибот: не быстрее секунды на задание (MIN_MS_PER_ITEM). Люди медленнее — берём 1,05–1,6 с.
        const target = t0 + n_done * 1050;
        await new Promise((r) => setTimeout(r, Math.max(0, target - Date.now()) + Math.random() * 500));
      }
      if (n % 4 === 0) {
        const [a, b] = await Promise.all([me.call('POST', `/sessions/${sid}/finish`, undefined, { ok: [200, 409, 400] }), me.call('POST', `/sessions/${sid}/finish`, undefined, { ok: [200, 409, 400] })]);
        stats.doubleFinish++;
        if ([a, b].some((x) => x.status === 200)) stats.lessonsDone++;
        else fail(n, `двойной финиш: ${a.status}/${b.status} ${JSON.stringify(a.body).slice(0, 100)}`);
        // Повторный финиш после первого возвращает сохранённый итог урока (идемпотентный повтор, services/sessions.ts → finishResult): оба ответа 200 с одними числами.
        // Это задумано; что награда в базе одна, показывает сверка баланса и журнала ниже.
        if (a.status === 200 && b.status === 200) stats.doubleFinishReplay++;
      } else {
        const fin = await me.call('POST', `/sessions/${sid}/finish`);
        if (fin.status === 200) stats.lessonsDone++;
      }
    }
  }
  await THINK(200, 800);
  // 6. Домашний бонус за цель дня (двойное нажатие у каждого третьего).
  const house = await me.call('GET', '/house');
  if (house.body?.goalDone && !house.body?.claimed) {
    if (n % 3 === 0) {
      const [a, b] = await Promise.all([me.call('POST', '/house/bonus', undefined, { ok: [200, 400] }), me.call('POST', '/house/bonus', undefined, { ok: [200, 400] })]);
      stats.doubleBonus++;
      // Выиграл один (200), опоздавший получает отказ already_claimed (400): второго тоста «+N» быть не должно.
      if ([a, b].filter((x) => x.status === 200).length === 1) stats.bonusClaimed++;
      else fail(n, `двойной бонус: ${a.status}/${b.status}`);
    } else {
      const r = await me.call('POST', '/house/bonus');
      if (r.status === 200) stats.bonusClaimed++;
    }
  }
  // 7. Гардероб и повторная главная.
  await me.call('GET', '/outfit');
  await Promise.all([me.call('GET', '/me'), me.call('GET', '/journey'), me.call('GET', '/quests')]);
}

// ── Прогон и отчёт ─────────────────────────────────────────────────────────────────────────────────────────────────
const pct = (a: number[], p: number) => (a.length ? a[Math.min(a.length - 1, Math.floor((p / 100) * a.length))] : 0);

/**
 * LOAD_MODE=probe: время обслуживания каждого эндпоинта на свободном сервере (один игрок, запросы по очереди, без очереди ожидания).
 * Это ближе всего к «сколько процессорного времени съедает запрос»: на бесплатном плане Cloudflare лимит 10 мс CPU на запрос (платный — 30 с).
 * Локальная D1 (SQLite в том же процессе) входит в это время, настоящая D1 — нет, так что цифры — верхняя оценка CPU Worker.
 */
async function probe() {
  const me = new Phone(1, 9_100_001);
  const initData = signInitData({ auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'AAHp', user: JSON.stringify({ id: me.tgId, first_name: 'Probe', language_code: 'ru' }) }, BOT_TOKEN);
  me.token = (await me.call('POST', '/auth/telegram', { initData })).body.token;
  await me.call('POST', '/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 5, reminderHour: null });
  const paths = ['/me', '/journey', '/quests', '/shop', '/house', '/missions', '/achievements', '/wallet/transactions', '/outfit', '/passport', '/leaderboard', '/premium', '/friends'];
  for (const p of paths) await me.call('GET', p); // прогрев
  samples.length = 0;
  for (let i = 0; i < 30; i++) for (const p of paths) await me.call('GET', p);
  const by = new Map<string, number[]>();
  for (const x of samples) (by.get(x.ep) ?? by.set(x.ep, []).get(x.ep)!).push(x.ms);
  const out = [...by.entries()].map(([ep, v]) => { const a = v.sort((x, y) => x - y); return { ep, p50: +pct(a, 50).toFixed(1), p95: +pct(a, 95).toFixed(1), max: +a.at(-1)!.toFixed(1) }; }).sort((x, y) => y.p50 - x.p50);
  console.table(out);
  writeFileSync(join(root, 'test-results/load-probe.json'), JSON.stringify(out, null, 2));
}

async function main() {
  const t00 = Date.now();
  await prepare();
  loadExercises();
  if (REMOTE) console.log(`Цель: ${REMOTE} (уже выложенный Worker, сверки базы не будет)`);
  else {
    console.log('Worker (wrangler dev --local)…');
    await startServer();
  }
  if (process.env.LOAD_MODE === 'probe') {
    mkdirSync(join(root, 'test-results'), { recursive: true });
    await probe();
    stopServer();
    process.exit(0);
  }
  console.log(`Worker готов за ${((Date.now() - t00) / 1000).toFixed(0)} с. Запуск ${N} игроков, разгон ${RAMP_MS} мс…`);
  const t0 = Date.now();
  let active = 0;
  let peak = 0;
  const run = Array.from({ length: N }, (_, n) =>
    (async () => {
      await new Promise((r) => setTimeout(r, (n / N) * RAMP_MS));
      active++;
      peak = Math.max(peak, active);
      try {
        await player(n);
      } catch (e) {
        fail(n, `исключение: ${(e as Error).message}`);
      } finally {
        active--;
      }
    })(),
  );
  const ticker = setInterval(() => console.log(`  … ${((Date.now() - t0) / 1000).toFixed(0)} с, в игре ${active}, запросов ${samples.length}`), 5000);
  await Promise.all(run);
  clearInterval(ticker);
  const wall = (Date.now() - t0) / 1000;

  // Сверка базы (только локально: к D1 выложенного Worker доступа нет).
  const audit = REMOTE ? null : {
    users: sql<{ n: number }>('SELECT count(*) AS n FROM users')[0].n,
    walletMismatch: sql<{ n: number }>('SELECT count(*) AS n FROM game_wallets w WHERE w.balance <> coalesce((SELECT sum(amount) FROM wallet_transactions t WHERE t.user_id = w.user_id), 0)')[0].n,
    negativeBalance: sql<{ n: number }>('SELECT count(*) AS n FROM game_wallets WHERE balance < 0')[0].n,
    houseBonusRows: sql<{ n: number }>("SELECT count(*) AS n FROM wallet_transactions WHERE reason LIKE 'house:%'")[0].n,
    // Ключ идемпотентности уникален в таблице, поэтому «двойная награда» могла бы проявиться только как две записи одного вида за одну событие-дату: считаем по игроку.
    houseBonusDupes: sql<{ n: number }>("SELECT count(*) AS n FROM (SELECT user_id, count(*) AS c FROM wallet_transactions WHERE reason LIKE 'house:%' GROUP BY user_id HAVING c > 1)")[0].n,
    missionRewards: sql<{ n: number }>("SELECT count(*) AS n FROM wallet_transactions WHERE reason = 'mission'")[0].n,
    missionRewardDupes: sql<{ n: number }>("SELECT count(*) AS n FROM (SELECT user_id, count(*) AS c FROM wallet_transactions WHERE reason = 'mission' GROUP BY user_id HAVING c > 1)")[0].n,
    lessonRewardRows: sql<{ n: number }>("SELECT count(*) AS n FROM wallet_transactions WHERE reason LIKE 'lesson%'")[0].n,
    lessonRewardDupes: sql<{ n: number }>("SELECT count(*) AS n FROM (SELECT user_id, count(*) AS c FROM wallet_transactions WHERE reason LIKE 'lesson%' GROUP BY user_id HAVING c > 1)")[0].n,
    lessonsFinished: sql<{ n: number }>("SELECT count(*) AS n FROM learning_sessions WHERE mode = 'LESSON' AND status = 'FINISHED'")[0].n,
    sessionsPerUserMax: sql<{ n: number }>("SELECT coalesce(max(c), 0) AS n FROM (SELECT count(*) AS c FROM learning_sessions WHERE status = 'FINISHED' GROUP BY user_id)")[0].n,
    serverErrorsLogged: sql<{ n: number }>("SELECT coalesce(sum(count), 0) AS n FROM error_log WHERE kind = 'server'")[0].n,
    serverErrorSamples: sql<{ message: string; path: string }>("SELECT message, path FROM error_log WHERE kind = 'server' ORDER BY count DESC LIMIT 5"),
  };
  const logText = serverLog.join('');
  // Шум самого wrangler (отправка метрик через прокси, предупреждения) — не ошибки нашего кода.
  // Шум трассировки wrangler при сотнях параллельных запросов («trace-stream … destination execution context … canceled», «Request was cancelled») — не ошибки приложения:
  // их считаем отдельно, настоящие исключения (Uncaught, стек нашего кода) остаются в списке.
  const noise = (l: string) => /node_modules\/wrangler|undici|Metrics dispatcher|fetch failed|ECONNRESET|ENOTFOUND|proxy|trace-stream|execution context|Request was cancelled|DOMException/i.test(l);
  const allErr = REMOTE ? [] : logText.split('\n').filter((l) => /Error|Uncaught|exception/i.test(l) && !/^\s*$/.test(l));
  const traceNoise = allErr.filter(noise).length;
  const exLines = allErr.filter((l) => !noise(l));
  const exceptions = exLines.length;
  if (exLines.length) console.log('строки лога Worker с «Error»:\n  ' + [...new Set(exLines.map((l) => l.trim().slice(0, 160)))].slice(0, 6).join('\n  '));
  stopServer();

  // Таблица задержек.
  const byEp = new Map<string, number[]>();
  const statusCount = new Map<number, number>();
  for (const s of samples) {
    (byEp.get(s.ep) ?? byEp.set(s.ep, []).get(s.ep)!).push(s.ms);
    statusCount.set(s.status, (statusCount.get(s.status) ?? 0) + 1);
  }
  const rows = [...byEp.entries()].map(([ep, v]) => {
    const a = v.sort((x, y) => x - y);
    return { ep, n: a.length, p50: Math.round(pct(a, 50)), p95: Math.round(pct(a, 95)), p99: Math.round(pct(a, 99)), max: Math.round(a.at(-1)!) };
  }).sort((x, y) => y.n - x.n);
  const all = samples.map((s) => s.ms).sort((a, b) => a - b);
  const total = { n: all.length, rps: Math.round(all.length / wall), p50: Math.round(pct(all, 50)), p95: Math.round(pct(all, 95)), p99: Math.round(pct(all, 99)), max: Math.round(all.at(-1) ?? 0) };
  const ok = samples.filter((s) => s.status >= 200 && s.status < 300).length;
  const s5xx = samples.filter((s) => s.status >= 500 || s.status === -1).length;
  const s429 = samples.filter((s) => s.status === 429).length;

  console.table(rows);
  if (s5xx) console.log('--- конец лога Worker (были 5xx) ---\n' + logText.slice(-3000) + '\n---');
  console.log('статусы:', Object.fromEntries(statusCount));
  console.log('итого:', total, `успешных ${ok}, 5xx/обрывов ${s5xx}, 429 ${s429}`);
  console.log('игроки:', { запущено: N, пик_одновременно: peak, ...stats });
  console.log('сверка базы:', audit ?? 'пропущена (удалённая цель)');
  console.log(`исключений в логе Worker: ${exceptions} (шум трассировки wrangler: ${traceNoise}); секунд: ${wall.toFixed(1)}`);
  if (failures.length) console.log('первые сбои:\n  ' + failures.slice(0, 15).join('\n  '));

  const a = audit; // null на удалённой цели: проверки базы пропускаются
  const verdicts: Record<string, boolean> = {
    'все игроки вошли': stats.logins === N,
    'ни одного 5xx и обрыва': s5xx === 0,
    'ни одного 429 (ограничитель не мешает живому игроку)': s429 === 0,
    'каждый игрок завершил миссию': stats.missionsDone === N,
    'каждый игрок завершил урок': stats.lessonsDone === N,
    'двойной бонус и двойной финиш: награда один раз (опоздавший с бонусом получает отказ, повторный финиш — тот же итог)': failures.every((f) => !/двойной/.test(f)),
    'нет сбоев сценария': failures.length === 0,
    ...(a
      ? {
          'ни одной серверной ошибки в журнале': a.serverErrorsLogged === 0 && exceptions === 0,
          'баланс = сумма журнала у всех': a.walletMismatch === 0,
          'нет отрицательных балансов': a.negativeBalance === 0,
          'нет двойных наград (урок, миссия, бонус дома: не больше одной записи на игрока)': a.lessonRewardDupes === 0 && a.houseBonusDupes === 0 && a.missionRewardDupes === 0,
          'урок засчитан каждому один раз': a.sessionsPerUserMax <= 1,
        }
      : {}),
  };
  console.table(Object.entries(verdicts).map(([check, ok]) => ({ check, ok })));
  mkdirSync(join(root, 'test-results'), { recursive: true });
  writeFileSync(join(root, 'test-results/load-test.json'), JSON.stringify({ at: new Date().toISOString(), users: N, rampMs: RAMP_MS, wallSeconds: wall, peak, total, rows, status: Object.fromEntries(statusCount), stats, audit, exceptions, verdicts, failures }, null, 2));
  const pass = Object.values(verdicts).every(Boolean);
  console.log(pass ? '\nНагрузочный тест пройден' : '\nНагрузочный тест НЕ пройден');
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  stopServer();
  process.exit(1);
});
process.on('SIGINT', () => {
  stopServer();
  process.exit(130);
});
void readFileSync;

/** Остановить Worker вместе с workerd (отдельная группа процессов: иначе остаётся жить и отвечает на следующем запуске). */
function stopServer() {
  if (!server?.pid) return;
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    server.kill('SIGTERM');
  }
  // miniflare запускает workerd отдельной группой: группа обёртки его не задевает. Скрипт нагрузки — отдельный запуск на отдельной машине,
  // поэтому добиваем оставшиеся workerd по имени (иначе они займут порт и ответят следующему прогону с чужой базой).
  try {
    execFileSync('pkill', ['-f', 'workerd']);
  } catch {
    /* нечего убивать */
  }
}
