/**
 * Аудіобібліотека ElevenLabs: каталог, розрахунок кредитів, пакетна генерація через Worker.
 *
 *   node --import tsx scripts/audio-library.ts catalog            каталог із коду й засіяної копії бази → assets/audio/AUDIO_MANIFEST.json
 *   node --import tsx scripts/audio-library.ts plan [--budget N] [--strategy economy|balanced|quality] [--remote]
 *                                                                 dry-run: черга, символи й кредити; --remote — залишок і готові файли з Worker
 *   node --import tsx scripts/audio-library.ts account            кредити, моделі й голос (через Worker, без синтезу)
 *   node --import tsx scripts/audio-library.ts generate --budget N [--batch 10] [--strategy …] [--yes]
 *                                                                 генерація партіями через Worker: R2 перевіряється до кожного запиту
 *   node --import tsx scripts/audio-library.ts verify             перевірка файлів у R2 (порожні, пошкоджені, чужий голос)
 *
 * Генерація йде всередині Worker (там секрет ELEVENLABS_API_KEY і R2), CLI лише керує партіями й бюджетом.
 * Доступ: POLSKI_GO_URL (https://…workers.dev), ADMIN_EMAIL, ADMIN_PASSWORD — у змінних середовища, не в аргументах.
 * Нічого не генерується автоматично під час запуску застосунку чи деплою.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const MANIFEST = resolve(root, 'assets/audio/AUDIO_MANIFEST.json');
const PROGRESS = resolve(root, 'assets/audio/.generation-progress.json');
const REPORTS = resolve(root, 'assets/audio/reports');

type Unit = { id: string; norm: string; text: string; kind: string; group: number; rank: number; chars: number; usages: string[] };
type Manifest = {
  generated: string;
  libraryVersion: string;
  language: 'pl-PL';
  units: Unit[];
  groups: Record<string, string>;
  models: typeof MODELS;
};

/**
 * Вартість моделей ElevenLabs у кредитах за символ (документація ElevenLabs, тарифи self-serve, станом на 2026):
 * Multilingual v2 — 1 кредит, Flash v2.5 — 0,5 кредиту. Перед генерацією фактичні множники читаються з /v1/models
 * (команда account) — тоді розрахунок plan --remote бере їх.
 */
const MODELS = {
  eleven_multilingual_v2: { label: 'Multilingual v2', creditsPerChar: 1 },
  eleven_flash_v2_5: { label: 'Flash v2.5', creditsPerChar: 0.5 },
} as const;
type ModelId = keyof typeof MODELS;
type Strategy = 'economy' | 'balanced' | 'quality';
const STRATEGIES: Strategy[] = ['economy', 'balanced', 'quality'];

/** Числа, ціни, час і абревіатури: Flash v2.5 не нормалізує їх (вимова ризикована) — завжди Multilingual v2. */
const risky = (text: string) => /\d/.test(text) || /(?<!\p{L})\p{Lu}{2,}(?!\p{L})/u.test(text);

/**
 * economy — Flash v2.5 (0,5 кредиту) для всього, крім чисел і абревіатур;
 * balanced — Multilingual v2 для речень і діалогів, Flash v2.5 для слів, коротких фраз і плиток;
 * quality — Multilingual v2 для всього.
 */
export function modelFor(u: Pick<Unit, 'kind' | 'text'>, strategy: Strategy): ModelId {
  if (strategy === 'quality' || risky(u.text)) return 'eleven_multilingual_v2';
  if (strategy === 'economy') return 'eleven_flash_v2_5';
  return u.kind === 'sentence' || u.kind === 'dialogue' ? 'eleven_multilingual_v2' : 'eleven_flash_v2_5';
}

const args = process.argv.slice(2);
const cmd = args[0] ?? 'help';
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string, def?: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def;
};

function loadManifest(): Manifest {
  if (!existsSync(MANIFEST)) throw new Error('Нет assets/audio/AUDIO_MANIFEST.json: сначала `catalog`.');
  return JSON.parse(readFileSync(MANIFEST, 'utf8'));
}

// ── catalog ──
async function catalog() {
  const { getEnv, disposeEnv } = await import(root + '/apps/server/test/helpers.ts');
  await getEnv();
  try {
    const { buildAudioCatalog, AUDIO_GROUPS } = await import(root + '/apps/server/src/services/audio-catalog.ts');
    const { AUDIO_LIBRARY_VERSION } = await import(root + '/packages/shared/src/audioTexts.ts');
    const units = (await buildAudioCatalog()) as Unit[];
    const manifest: Manifest = { generated: new Date().toISOString().slice(0, 10), libraryVersion: AUDIO_LIBRARY_VERSION, language: 'pl-PL', groups: AUDIO_GROUPS, models: MODELS, units };
    mkdirSync(resolve(root, 'assets/audio'), { recursive: true });
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 0).replace(/},{"id"/g, '},\n{"id"') + '\n');
    console.log(`Каталог: ${units.length} уникальных аудиоединиц → ${MANIFEST}`);
    summary(units);
  } finally {
    await disposeEnv();
  }
}

function summary(units: Unit[], ready = new Set<string>()) {
  const m = (u: Unit, s: Strategy) => u.chars * MODELS[modelFor(u, s)].creditsPerChar;
  const rows = Object.entries(groupBy(units, (u) => String(u.group))).map(([g, us]) => ({
    g,
    units: us.length,
    uses: us.reduce((n, u) => n + u.usages.length, 0),
    chars: us.reduce((n, u) => n + u.chars, 0),
    ready: us.filter((u) => ready.has(u.id)).length,
    economy: Math.ceil(us.reduce((n, u) => n + m(u, 'economy'), 0)),
    balanced: Math.ceil(us.reduce((n, u) => n + m(u, 'balanced'), 0)),
    quality: Math.ceil(us.reduce((n, u) => n + m(u, 'quality'), 0)),
  }));
  console.table(rows);
  return rows;
}

function groupBy<T>(xs: T[], key: (x: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const x of xs) (out[key(x)] ??= []).push(x);
  return out;
}

// ── Worker API ──
async function api<T>(path: string, init: { method?: string; body?: unknown } = {}, token?: string): Promise<T> {
  const base = process.env.POLSKI_GO_URL?.replace(/\/$/, '');
  if (!base) throw new Error('POLSKI_GO_URL не задан (адрес Worker, напр. https://polskie-go.<аккаунт>.workers.dev)');
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(base + path, {
      method: init.method ?? 'GET',
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(120_000),
    }).catch((e: Error) => ({ ok: false, status: 0, statusText: e.message, json: async () => ({}) }) as unknown as Response);
    if (res.ok) return (await res.json()) as T;
    // Тимчасові збої (мережа, 429, 5xx) — повтор із паузою; решта — помилка одразу.
    if ((res.status === 0 || res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
      continue;
    }
    const detail = await res.json().catch(() => ({}));
    throw new Error(`${path}: HTTP ${res.status} ${JSON.stringify(detail)}`);
  }
}

async function login(): Promise<string> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('ADMIN_EMAIL и ADMIN_PASSWORD должны быть в переменных окружения');
  const r = await api<{ token: string }>('/api/admin/login', { method: 'POST', body: { email, password } });
  return r.token;
}

type Account = {
  configured: boolean;
  voice: { id: string; name: string | null; gender: string | null; polishModels: string[]; isKamil: boolean; male: boolean } | null;
  kamilVoices?: { id: string; name: string | null; gender: string | null; polishModels: string[] }[];
  credits: { used: number; limit: number; left: number; resetAt: string | null } | null;
  models: { id: string; name: string; polish: boolean; creditsPerChar: number | null }[];
  library: { r2: boolean; mode: string };
};

async function readyIds(token: string, ids: string[], voice?: string): Promise<Set<string>> {
  const ready = new Set<string>();
  for (let i = 0; i < ids.length; i += 500) {
    const r = await api<{ ready: string[] }>('/api/admin/audio/status', { method: 'POST', body: { ids: ids.slice(i, i + 500), voice } }, token);
    r.ready.forEach((id) => ready.add(id));
  }
  return ready;
}

// ── plan (dry-run) ──
async function plan() {
  const manifest = loadManifest();
  const strategy = (opt('strategy', 'economy') as Strategy) ?? 'economy';
  if (!STRATEGIES.includes(strategy)) throw new Error(`--strategy: ${STRATEGIES.join(' | ')}`);
  let budget = Number(opt('budget', '30000'));
  let ready = new Set<string>();
  let rates: Record<string, number> = Object.fromEntries(Object.entries(MODELS).map(([k, v]) => [k, v.creditsPerChar]));
  if (flag('remote')) {
    const token = await login();
    const acc = await api<Account>('/api/admin/audio/account', {}, token);
    printAccount(acc);
    if (acc.credits) budget = Math.min(budget, acc.credits.left);
    for (const m of acc.models) if (m.creditsPerChar != null && m.id in rates) rates[m.id] = m.creditsPerChar;
    if (acc.voice) ready = await readyIds(token, manifest.units.map((u) => u.id), acc.voice.id);
  }
  const cost = (u: Unit) => u.chars * rates[modelFor(u, strategy)];
  console.log(`\nСтратегия ${strategy}, бюджет ${budget} кредитов`);
  summary(manifest.units, ready);
  const todo = manifest.units.filter((u) => !ready.has(u.id));
  let spent = 0;
  const fits: Unit[] = [];
  for (const u of todo) {
    const c = cost(u);
    if (spent + c > budget) break;
    spent += c;
    fits.push(u);
  }
  const left = todo.slice(fits.length);
  const total = todo.reduce((n, u) => n + cost(u), 0);
  const report = {
    at: new Date().toISOString(),
    strategy,
    rates,
    budget,
    units: manifest.units.length,
    ready: ready.size,
    queue: todo.length,
    fitsInBudget: { units: fits.length, credits: Math.ceil(spent), until: fits.at(-1)?.usages[0] ?? null },
    remaining: { units: left.length, credits: Math.ceil(total - spent) },
    nextQueue: left.slice(0, 50).map((u) => ({ text: u.text, group: u.group, chars: u.chars, model: modelFor(u, strategy) })),
  };
  mkdirSync(REPORTS, { recursive: true });
  const file = resolve(REPORTS, `plan-${report.at.slice(0, 19).replace(/[:T]/g, '-')}.json`);
  writeFileSync(file, JSON.stringify(report, null, 2));
  console.log(`В бюджет входит ${fits.length} из ${todo.length} единиц очереди (${Math.ceil(spent)} кредитов). Останется ${left.length} единиц ≈ ${report.remaining.credits} кредитов.`);
  console.log(`Отчёт: ${file}`);
}

function printAccount(acc: Account) {
  if (!acc.configured) console.log('ELEVENLABS_API_KEY в Worker не задан.');
  const v = acc.voice;
  console.log(v ? `Голос: ${v.name ?? '?'} (${v.id}), пол: ${v.gender ?? '?'}; Kamil: ${v.isKamil ? 'да' : 'НЕТ'}; польский подтверждён для моделей: ${v.polishModels.join(', ') || '—'}` : 'Голос библиотеки не задан (ELEVENLABS_VOICE_ID).');
  for (const k of acc.kamilVoices ?? []) console.log(`Голос Kamil в аккаунте: ${k.name} — ${k.id} (пол: ${k.gender ?? '?'}; польский: ${k.polishModels.join(', ') || '—'})`);
  if (acc.credits) console.log(`Кредиты: использовано ${acc.credits.used} из ${acc.credits.limit}, остаток ${acc.credits.left}, обновление ${acc.credits.resetAt ?? '?'}`);
  console.log(`Модели с польским: ${acc.models.filter((m) => m.polish).map((m) => `${m.id} (${m.creditsPerChar ?? '?'} кр./символ)`).join(', ')}`);
  console.log(`R2: ${acc.library.r2 ? 'подключено' : 'НЕ подключено'}; режим озвучки: ${acc.library.mode}`);
}

async function account() {
  printAccount(await api<Account>('/api/admin/audio/account', {}, await login()));
}

// ── generate ──
type Progress = { started: string; strategy: Strategy; budget: number; spent: number; done: string[]; failed: Record<string, string> };

async function generate() {
  const manifest = loadManifest();
  const strategy = (opt('strategy', 'economy') as Strategy) ?? 'economy';
  const budget = Number(opt('budget'));
  const batch = Math.min(Math.max(Number(opt('batch', '10')), 1), 25);
  if (!Number.isFinite(budget) || budget <= 0) throw new Error('Нужен --budget N (лимит кредитов на этот запуск).');
  const token = await login();
  const acc = await api<Account>('/api/admin/audio/account', {}, token);
  printAccount(acc);
  if (!acc.library.r2) throw new Error('R2 не подключено: сохранять некуда (docs/AUDIO_LIBRARY_RU.md, шаг 1).');
  if (!acc.voice) throw new Error('ELEVENLABS_VOICE_ID в Worker не задан.');
  if (!acc.voice.isKamil || !acc.voice.male) {
    if (!flag('allow-voice')) throw new Error('Голос не Kamil или не мужской: проверьте ELEVENLABS_VOICE_ID (или --allow-voice, если голос осознанно другой).');
  }
  if (acc.credits && budget > acc.credits.left) throw new Error(`Бюджет ${budget} больше остатка ${acc.credits.left}.`);
  const progress: Progress = existsSync(PROGRESS) && !flag('fresh') ? JSON.parse(readFileSync(PROGRESS, 'utf8')) : { started: new Date().toISOString(), strategy, budget, spent: 0, done: [], failed: {} };
  const done = new Set(progress.done);
  const ready = await readyIds(token, manifest.units.map((u) => u.id), acc.voice.id);
  const queue = manifest.units.filter((u) => !ready.has(u.id) && !done.has(u.id));
  // Фактичні множники з /v1/models, якщо акаунт їх віддав; інакше — з документації.
  const rates: Record<string, number> = Object.fromEntries(Object.entries(MODELS).map(([k, v]) => [k, acc.models.find((m) => m.id === k)?.creditsPerChar ?? v.creditsPerChar]));
  const est = (u: Unit) => u.chars * rates[modelFor(u, strategy)];
  let planned = 0;
  const run: Unit[] = [];
  for (const u of queue) {
    if (planned + est(u) > budget) break;
    planned += est(u);
    run.push(u);
  }
  console.log(`\nОчередь: ${queue.length}; этот запуск: ${run.length} единиц ≈ ${Math.ceil(planned)} кредитов (лимит ${budget}). Первые: ${run.slice(0, 5).map((u) => `«${u.text}»`).join(', ')}`);
  if (!run.length) return;
  if (!flag('yes')) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(`Потратить до ${Math.ceil(planned)} кредитов? Напишите «да»: `);
    rl.close();
    if (answer.trim().toLowerCase() !== 'да') return console.log('Отменено.');
  }
  mkdirSync(REPORTS, { recursive: true });
  const report = resolve(REPORTS, `generate-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`);
  let spent = 0;
  for (let i = 0; i < run.length; i += batch) {
    const part = run.slice(i, i + batch);
    if (spent + part.reduce((n, u) => n + est(u), 0) > budget) break;
    const r = await api<{ results: { id: string; status: 'generated' | 'exists' | 'adopted' | 'failed' | 'locked'; credits: number; error?: string }[] }>(
      '/api/admin/audio/generate',
      { method: 'POST', body: { items: part.map((u) => ({ id: u.id, text: u.text, model: modelFor(u, strategy) })), maxCredits: Math.ceil(budget - spent), rates } },
      token,
    );
    for (const x of r.results) {
      spent += x.credits;
      if (x.status === 'failed') progress.failed[x.id] = x.error ?? 'failed';
      else if (x.status !== 'locked') {
        progress.done.push(x.id);
        delete progress.failed[x.id];
      }
    }
    progress.spent += r.results.reduce((n, x) => n + x.credits, 0);
    // Прогрес зберігається після кожної партії: зупинка (Ctrl+C) не втрачає зроблене, наступний запуск продовжить.
    writeFileSync(PROGRESS, JSON.stringify(progress));
    writeFileSync(report, JSON.stringify({ strategy, budget, spent, results: progress }, null, 2));
    const counts = groupBy(r.results, (x) => x.status);
    console.log(`Партия ${i / batch + 1}: ${Object.entries(counts).map(([k, v]) => `${k} ${v.length}`).join(', ')}; потрачено ${Math.ceil(spent)} / ${budget}`);
  }
  console.log(`Готово. Потрачено ≈ ${Math.ceil(spent)} кредитов. Отчёт: ${report}`);
}

// ── verify ──
async function verify() {
  const manifest = loadManifest();
  const token = await login();
  const bad: { id: string; problem: string }[] = [];
  for (let i = 0; i < manifest.units.length; i += 200) {
    const r = await api<{ problems: { id: string; problem: string }[] }>('/api/admin/audio/verify', { method: 'POST', body: { ids: manifest.units.slice(i, i + 200).map((u) => u.id) } }, token);
    bad.push(...r.problems);
  }
  console.log(bad.length ? `Проблемных файлов: ${bad.length}` : 'Проблемных файлов нет.');
  if (bad.length) console.table(bad.slice(0, 50));
}

const commands: Record<string, () => Promise<void>> = { catalog, plan, account, generate, verify };
if (!commands[cmd]) {
  console.log(readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]);
  process.exit(cmd === 'help' ? 0 : 1);
}
commands[cmd]().then(
  () => process.exit(0),
  (e: Error) => {
    console.error(e.message);
    process.exit(1);
  },
);
