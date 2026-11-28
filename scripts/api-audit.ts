/**
 * Аудит скорости API (1.0, этап 1.2): сколько обращений к D1 делает каждый запрос приложения и сколько из них идут друг за другом.
 *
 * Каждое обращение к базе — поход по сети (сейчас база в Океании, ~220 мс). Скрипт поднимает тот же сервер, что и тесты
 * (Miniflare D1, миграции, контент), добавляет к каждому обращению задержку DELAY мс и меряет время ответа:
 * время / DELAY ≈ число последовательных обращений («глубина»). Число всех обращений — из server-timing ответа.
 *
 *   node --import tsx scripts/api-audit.ts [DELAY=40]   → таблица + test-results/api-audit.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { delayedD1 } from './lib/d1-delay';

const root = process.cwd();
const DELAY = Number(process.argv[2] ?? 40);

async function main() {
  const { getEnv, veteran, lessonId } = await import(root + '/apps/server/test/helpers.ts');
  const { app, env } = await getEnv();
  const u = await veteran();
  await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A1', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: 19 });
  const slow = { ...env, DB: delayedD1(env.DB, DELAY) };
  const once = async (e: typeof env, method: string, path: string, body?: unknown) => {
    const init: RequestInit = { method, headers: { authorization: `Bearer ${u.token}`, ...(body ? { 'content-type': 'application/json' } : {}) } };
    if (body) init.body = JSON.stringify(body);
    const t0 = performance.now();
    const res = await app.request(path, init, e);
    const text = await res.text();
    return { res, text, ms: performance.now() - t0 };
  };
  // Прогрев (первый вызов создаёт строки, прогревает кеши) → без задержки (работа сервера) → с задержкой; глубина — по разнице.
  const call = async (method: string, path: string, body?: unknown) => {
    if (method === 'GET') await once(env, method, path, body);
    const base = method === 'GET' ? await once(env, method, path, body) : { ms: 0 };
    const r = await once(slow, method, path, body);
    const st = r.res.headers.get('server-timing') ?? '';
    const calls = Number(/d1;[^,]*desc="(\d+)"/.exec(st)?.[1] ?? NaN);
    return { path: `${method} ${path}`, status: r.res.status, calls, depth: Math.round((r.ms - base.ms) / DELAY), cpuMs: Math.round(base.ms), ms: Math.round(r.ms), kb: +(r.text.length / 1024).toFixed(1), body: r.text };
  };
  const journey = JSON.parse((await call('GET', '/api/journey')).body);
  const rows = [];
  const GETS = ['/api/me', '/api/journey', '/api/quests', '/api/me/stats?days=7', '/api/missions', '/api/shop', '/api/premium', '/api/house', '/api/achievements', '/api/passport', '/api/exams', '/api/friends', '/api/leaderboard?scope=league', '/api/vocab/topics', '/api/vocab', '/api/grammar', '/api/me/diary'];
  for (const p of GETS) rows.push(await call('GET', p));
  // Открытие урока: создать сессию.
  const lesson = journey?.nextLesson?.id ?? (await lessonId('w-1-czesc'));
  rows.push(await call('POST', '/api/sessions', { lessonId: lesson }));
  for (const r of rows) delete (r as { body?: string }).body;
  console.table(rows);
  mkdirSync(resolve(root, 'test-results'), { recursive: true });
  writeFileSync(resolve(root, 'test-results/api-audit.json'), JSON.stringify({ delay: DELAY, at: new Date().toISOString(), rows }, null, 2));
  process.exit(0);
}
void main();
