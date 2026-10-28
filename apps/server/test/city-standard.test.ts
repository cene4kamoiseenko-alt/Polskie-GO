/**
 * Стандарт міста (рішення власника 2026-10-28): у кожному місті 8 уроків та іспит, у кожному по 12 завдань.
 * Зміст — для всіх міст з уроками. Міграція — на БД, засіяній до стандарту (як production зараз), зі справжніми
 * учнями: вхід, незавершений урок, прогрес у містах, що скорочуються. Потім новий seed: нічого не видалено,
 * опубліковане збігається з чистою БД, прогрес на місці, незавершена сесія доходить до кінця, повтор нічого не змінює.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Miniflare } from 'miniflare';
import { buildApp } from '../src/app';
import { bindDb } from '../src/db';
import { setEnv, type Bindings } from '../src/env';
import { CITY_PLANS, CITY_LESSONS, LESSON_TASKS, keptIndexes } from '../src/content/city-standard';
import { CITY_CONTENT, PRE_STANDARD_CONTENT, TASK_ARCHIVE, archiveOrder, buildSeedSql } from '../src/content/seed';
import { signInitData } from '../src/lib/telegram';
import { BOT_TOKEN, playSession } from './helpers';

type Row = Record<string, unknown>;
type City = { slug: string; completed: boolean; unlocked: boolean; bossAvailable: boolean; lessonsTotal: number; routes: { slug: string; lessons: { slug: string; kind: string; state: string; exerciseCount: number }[] }[] };

describe('стандарт міста: зміст', () => {
  it('у кожному місті 8 уроків та іспит останнім; у кожному уроці й іспиті — 12 завдань', () => {
    for (const c of CITY_CONTENT) {
      const all = c.routes.flatMap((r) => r.lessons);
      expect(all.filter((l) => (l.kind ?? 'LESSON') === 'LESSON'), c.city).toHaveLength(CITY_LESSONS);
      expect(all.filter((l) => l.kind === 'BOSS').map((l) => l.slug), c.city).toEqual([all.at(-1)!.slug]);
      expect(c.routes.at(-1)!.lessons, c.city).toHaveLength(1);
      for (const l of all) {
        expect(l.exercises, l.slug).toHaveLength(LESSON_TASKS);
        expect(new Set(l.exercises.map((e) => e.type)).size, `${l.slug}: мало механік`).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it('скорочені уроки беруть завдання старих уроків без змін і зі старими номерами; нові — в кінці, без match()', () => {
    for (const [full, plan] of CITY_PLANS) {
      const std = CITY_CONTENT.find((c) => c.city === full.city)!;
      for (const l of std.routes.flatMap((r) => r.lessons)) {
        const old = full.routes.flatMap((r) => r.lessons).find((x) => x.slug === l.slug)!;
        const kept = keptIndexes(old, plan);
        const added = plan.add?.[l.slug] ?? [];
        expect(l.exerciseIds, l.slug).toEqual([...kept, ...added.map((_, i) => old.exercises.length + i)]);
        kept.forEach((n, i) => expect(l.exercises[i], `${l.slug}#${n}`).toBe(old.exercises[n]));
        // match() нумерує пари глобальним лічильником: нове завдання з ним зсунуло б ідентифікатори пар у вже записаних.
        for (const e of added) expect(e.type, l.slug).not.toBe('MATCH_PAIRS');
      }
    }
  });

  it('прибрані завдання отримують різні позиції в архівному уроці', () => {
    const orders: number[] = [];
    for (const [full, plan] of CITY_PLANS) {
      for (const l of full.routes.flatMap((r) => r.lessons)) {
        if (plan.keep[l.slug] === undefined) continue;
        const kept = keptIndexes(l, plan);
        for (const n of l.exercises.keys()) if (!kept.includes(n)) orders.push(archiveOrder(l.slug, n));
      }
    }
    expect(orders.length).toBeGreaterThan(100);
    expect(new Set(orders).size).toBe(orders.length);
  });
});

// ── Міграція на БД до стандарту ──

const dir = new URL('../migrations/', import.meta.url);
const migrations = readdirSync(dir).filter((x) => x.endsWith('.sql')).sort();
const statements = (f: string) => readFileSync(new URL(f, dir), 'utf8').split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean);
const env = (d1: D1Database): Bindings => ({
  DB: d1, ENVIRONMENT: 'test', SESSION_SECRET: 'test-secret-test-secret-test-secret-123', TELEGRAM_BOT_TOKEN: BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET: 'hook-secret',
  DEV_AUTH: 'false', ANTHROPIC_API_KEY: '', ADMIN_EMAIL: 'admin@test.dev', ADMIN_PASSWORD: 'admin-password-123',
});

let mf: Miniflare;
let old: D1Database;
let fresh: D1Database;
let app: ReturnType<typeof buildApp>;

async function apply(d1: D1Database, stmts: string[]) {
  for (let i = 0; i < stmts.length; i += 50) await d1.batch(stmts.slice(i, i + 50).map((s) => d1.prepare(s)));
}
const all = async (d1: D1Database, sql: string, ...args: unknown[]) => (await d1.prepare(sql).bind(...args).all<Row>()).results;
const one = async (d1: D1Database, sql: string, ...args: unknown[]) => (await all(d1, sql, ...args))[0];

function use(d1: D1Database) {
  setEnv(env(d1));
  bindDb(d1);
}

async function call(method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE', url: string, token: string, payload?: unknown) {
  const res = await app.request(url, { method, headers: { authorization: `Bearer ${token}`, ...(payload !== undefined ? { 'content-type': 'application/json' } : {}) }, body: payload !== undefined ? JSON.stringify(payload) : undefined }, env(old));
  use(old);
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

async function signIn(tg: number) {
  const initData = signInitData({ auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'AAH', user: JSON.stringify({ id: tg, first_name: `T${tg}`, language_code: 'ru' }) }, BOT_TOKEN);
  const res = await app.request('/api/auth/telegram', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ initData }) }, env(old));
  use(old);
  const body = (await res.json()) as { token: string };
  const user = (await one(old, 'SELECT id FROM users WHERE telegram_id = ?', tg))!;
  const token = body.token;
  return { token, userId: user.id as string, call: (m: Parameters<typeof call>[0], url: string, payload?: unknown) => call(m, url, token, payload) };
}

/** Опублікований зміст: уроки опублікованих тем міст з уроками і їхні завдання (без службових колонок). */
async function published(d1: D1Database) {
  const lessons = await all(
    d1,
    `SELECT l.slug, l.kind, l.exercise_count, r.slug AS route, r."order" AS route_order, c.slug AS city, c.ticket_lessons FROM lessons l
     JOIN city_routes r ON r.id = l.route_id JOIN cities c ON c.id = r.city_id
     WHERE l.status = 'PUBLISHED' AND r.status = 'PUBLISHED' ORDER BY c."order", r."order", l."order"`,
  );
  const exercises = await all(
    d1,
    `SELECT l.slug AS lesson, e.id, e."order", e.type, e.skill, e.data, e.explanation FROM exercises e JOIN lessons l ON l.id = e.lesson_id
     JOIN city_routes r ON r.id = l.route_id WHERE l.status = 'PUBLISHED' AND r.status = 'PUBLISHED' ORDER BY l.slug, e."order"`,
  );
  return { lessons, exercises };
}

/** Знімок для повторного seed: зміст, архів і прогрес. */
async function contentSnapshot(d1: D1Database) {
  return JSON.stringify({
    lessons: await all(d1, 'SELECT slug, status, route_id, "order", exercise_count FROM lessons ORDER BY slug'),
    routes: await all(d1, 'SELECT slug, status, "order" FROM city_routes ORDER BY slug'),
    exercises: await all(d1, 'SELECT id, lesson_id, "order", type, data FROM exercises ORDER BY id'),
    cities: await all(d1, 'SELECT slug, ticket_lessons FROM cities ORDER BY slug'),
    progress: await all(d1, 'SELECT * FROM user_lesson_progress ORDER BY user_id, lesson_id'),
  });
}

const STD_CITIES = CITY_PLANS.map(([full]) => full.city);
const oldLessons = PRE_STANDARD_CONTENT.flatMap((c) => c.routes.flatMap((r) => r.lessons));
const exercisesOf = (d1: D1Database) => all(d1, `SELECT e.id, l.slug FROM exercises e JOIN lessons l ON l.id = e.lesson_id`);

let before: { exercises: Row[]; progress: Row[]; attempts: Row[] };
let learner: Awaited<ReturnType<typeof signIn>>;
let traveller: Awaited<ReturnType<typeof signIn>>;
let veteran: Awaited<ReturnType<typeof signIn>>;
let openSession: { id: string; total: number };

beforeAll(async () => {
  mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response(null) } }', d1Databases: { OLD: `std-old-${Date.now()}`, FRESH: `std-fresh-${Date.now()}` } });
  old = (await mf.getD1Database('OLD')) as unknown as D1Database;
  fresh = (await mf.getD1Database('FRESH')) as unknown as D1Database;
  for (const f of migrations) {
    await apply(old, statements(f));
    await apply(fresh, statements(f));
  }
  await apply(fresh, buildSeedSql());
  await apply(old, buildSeedSql({ preStandard: true }));
  use(old);
  app = buildApp();

  // Учень Варшави: перший урок пройдено, другий почато (17 завдань у старому уроці) і не закінчено.
  learner = await signIn(8_801_001);
  const first = (await one(old, `SELECT id FROM lessons WHERE slug = 'waw-1-czesc'`))!.id as string;
  const s1 = await learner.call('POST', '/api/sessions', { lessonId: first });
  expect(s1.status).toBe(200);
  expect((await playSession(learner.call, s1.body.sessionId)).body.passed).toBe(true);
  const second = (await one(old, `SELECT id FROM lessons WHERE slug = 'waw-2-uprzejmosc'`))!.id as string;
  const s2 = await learner.call('POST', '/api/sessions', { lessonId: second });
  expect(s2.status).toBe(200);
  openSession = { id: s2.body.sessionId, total: s2.body.items.length };
  expect(openSession.total).toBe(17);

  // Мандрівник у Кракові: пройдено 12 старих уроків (вокзал, Żabka, частину Ринку) — до стандарту іспит ще далеко.
  traveller = await signIn(8_801_002);
  const krakow = (await one(old, `SELECT id FROM cities WHERE slug = 'krakow'`))!.id as string;
  await old.prepare(`INSERT INTO user_cities (user_id, city_id, source) VALUES (?, ?, 'journey')`).bind(traveller.userId, krakow).run();
  const doneKrk = ['krk-d1-powitanie', 'krk-d2-gdzie', 'krk-d3-bilet', 'krk-d4-peron', 'krk-d5-misja', 'krk-z1-produkty', 'krk-z2-ceny', 'krk-z3-kasa', 'krk-z4-hotdog', 'krk-z5-misja', 'krk-r1-miasto', 'krk-r2-orientacja'];
  for (const slug of doneKrk) {
    await old
      .prepare(`INSERT INTO user_lesson_progress (user_id, lesson_id, stars, best_score, completions, first_completed_at, last_completed_at) SELECT ?, id, 3, 100, 1, 1760000000000, 1760000000000 FROM lessons WHERE slug = ?`)
      .bind(traveller.userId, slug)
      .run();
  }

  // Учень Лодзі: пройшов уроки 1–8 після першого розширення (5–8) і до другого (9–16) — іспит відкрився лише за знімком 1–8.
  // Історія як у production: уроки 9–16 засіяно на 10 днів пізніше. Уроки 6 і 7 підуть в архів.
  veteran = await signIn(8_801_003);
  const lodz = (await one(old, `SELECT id FROM cities WHERE slug = 'lodz'`))!.id as string;
  await old.prepare(`INSERT INTO user_cities (user_id, city_id, source) VALUES (?, ?, 'journey')`).bind(veteran.userId, lodz).run();
  const secondWave = ['9-ktora-godzina', '10-poranek', '11-grafik', '12-urlop', '13-boli-mnie', '14-przychodnia', '15-apteka', '16-plany'].map((n) => `'lodz-${n}'`).join(', ');
  await old.prepare(`UPDATE lessons SET created_at = created_at + ${10 * 86_400_000} WHERE slug IN (${secondWave})`).run();
  const firstExpansion = (await one(old, `SELECT min(created_at) AS t FROM lessons WHERE slug = 'lodz-5-gdzie-pracujesz'`))!.t as number;
  for (const n of ['1-alfabet', '2-dwuznaki', '3-zawody', '4-oni-one', '5-gdzie-pracujesz', '6-szukam-pracy', '7-rozmowa', '8-pierwszy-dzien']) {
    await old
      .prepare(`INSERT INTO user_lesson_progress (user_id, lesson_id, stars, best_score, completions, first_completed_at, last_completed_at) SELECT ?, id, 3, 100, 1, ?, ? FROM lessons WHERE slug = ?`)
      .bind(veteran.userId, firstExpansion + 86_400_000, firstExpansion + 86_400_000, `lodz-${n}`)
      .run();
  }
  const lodzBefore = ((await veteran.call('GET', '/api/journey')).body.cities as City[]).find((c) => c.slug === 'lodz')!;
  expect(lodzBefore.bossAvailable).toBe(true);

  before = {
    exercises: await exercisesOf(old),
    progress: await all(old, 'SELECT * FROM user_lesson_progress ORDER BY user_id, lesson_id'),
    attempts: await all(old, 'SELECT * FROM exercise_attempts ORDER BY rowid'),
  };
  await apply(old, buildSeedSql());
}, 300_000);

afterAll(async () => {
  await mf?.dispose();
});

describe('стандарт міста: міграція наявної БД', () => {
  it('опубліковане після міграції збігається з чистою БД: теми, уроки, завдання, їхні ідентифікатори й позиції', async () => {
    const a = await published(old);
    const b = await published(fresh);
    expect(a.lessons).toEqual(b.lessons);
    expect(a.exercises).toEqual(b.exercises);
    for (const city of [...STD_CITIES, 'poznan', 'zielona-gora', 'gorzow', 'szczecin', 'gdansk']) {
      const ls = a.lessons.filter((l) => l.city === city);
      expect(ls.filter((l) => l.kind === 'LESSON'), city).toHaveLength(CITY_LESSONS);
      expect(ls.at(-1)!.kind, city).toBe('BOSS');
      for (const l of ls) expect(l.exercise_count, String(l.slug)).toBe(LESSON_TASKS);
      expect(ls[0].ticket_lessons, city).toBe(CITY_LESSONS);
    }
  });

  it('жодне завдання не видалено: прибрані — в архівному уроці, архівні уроки — з усіма завданнями', async () => {
    const after = await exercisesOf(old);
    const ids = new Set(after.map((e) => e.id));
    for (const e of before.exercises) expect(ids.has(e.id), String(e.id)).toBe(true);
    const archive = (await one(old, `SELECT id, status, route_id FROM lessons WHERE slug = ?`, TASK_ARCHIVE))!;
    expect(archive.status).toBe('ARCHIVED');
    expect(archive.route_id).toBeNull();
    let dropped = 0;
    for (const [full, plan] of CITY_PLANS) {
      for (const l of full.routes.flatMap((r) => r.lessons)) {
        if (plan.keep[l.slug] === undefined) {
          expect((await one(old, `SELECT status FROM lessons WHERE slug = ?`, l.slug))!.status, l.slug).toBe('ARCHIVED');
          expect(after.filter((e) => e.slug === l.slug), l.slug).toHaveLength(l.exercises.length);
        } else dropped += l.exercises.length - keptIndexes(l, plan).length;
      }
      for (const r of full.routes.filter((x) => !plan.routes.includes(x.slug))) {
        expect((await one(old, `SELECT status FROM city_routes WHERE slug = ?`, r.slug))!.status, r.slug).toBe('ARCHIVED');
      }
    }
    expect(after.filter((e) => e.slug === TASK_ARCHIVE)).toHaveLength(dropped);
    expect(await all(old, 'SELECT * FROM user_lesson_progress ORDER BY user_id, lesson_id')).toEqual(before.progress);
    expect(await all(old, 'SELECT * FROM exercise_attempts ORDER BY rowid')).toEqual(before.attempts);
    expect(await all(old, `SELECT slug FROM lessons l WHERE exercise_count <> (SELECT count(*) FROM exercises e WHERE e.lesson_id = l.id)`)).toEqual([]);
  });

  it('учень Варшави: пройдений урок зарахований, незавершений урок продовжується і завершується зі своїми 17 завданнями', async () => {
    const j = (await learner.call('GET', '/api/journey')).body as { cities: City[]; nextLesson: { slug: string } };
    const waw = j.cities.find((c) => c.slug === 'warszawa')!;
    expect(waw.lessonsTotal).toBe(CITY_LESSONS + 1);
    const lessons = waw.routes.flatMap((r) => r.lessons);
    expect(lessons.find((l) => l.slug === 'waw-1-czesc')!.state).toBe('completed');
    expect(lessons.find((l) => l.slug === 'waw-2-uprzejmosc')!.state).toBe('available');
    expect(lessons.every((l) => l.exerciseCount === LESSON_TASKS)).toBe(true);
    expect(j.nextLesson.slug).toBe('waw-2-uprzejmosc');
    // Сесія почалася до скорочення: знімок завдань у сесії, тож урок доходить до кінця.
    const fin = await playSession(learner.call, openSession.id);
    expect(fin.status).toBe(200);
    expect(fin.body.passed).toBe(true);
    const after = (await learner.call('GET', '/api/journey')).body as { cities: City[] };
    expect(after.cities.find((c) => c.slug === 'warszawa')!.routes.flatMap((r) => r.lessons).find((l) => l.slug === 'waw-2-uprzejmosc')!.state).toBe('completed');
    // Новий урок — уже 12 завдань.
    const third = (await one(old, `SELECT id FROM lessons WHERE slug = 'waw-3-imie'`))!.id as string;
    const s3 = await learner.call('POST', '/api/sessions', { lessonId: third });
    expect(s3.status).toBe(200);
    expect(s3.body.items).toHaveLength(LESSON_TASKS);
  });

  it('мандрівник у Кракові: пройдені уроки, що лишилися, зараховані; іспит — після 8 уроків нового Кракова', async () => {
    const j = (await traveller.call('GET', '/api/journey')).body as { cities: City[] };
    const krk = j.cities.find((c) => c.slug === 'krakow')!;
    const lessons = krk.routes.flatMap((r) => r.lessons);
    expect(krk.routes.map((r) => r.slug)).toEqual(['krk-rodzina', 'krk-dom', 'krk-dzien', 'krk-rynek', 'krk-egzamin']);
    expect(lessons.filter((l) => l.state === 'completed').map((l) => l.slug)).toEqual(['krk-r1-miasto', 'krk-r2-orientacja']);
    expect(lessons.find((l) => l.slug === 'krk-1-rodzina')!.state).toBe('available');
    expect(krk.bossAvailable).toBe(false);
    // Архівні уроки не відкриваються, навіть пройдені.
    const archived = (await one(old, `SELECT id FROM lessons WHERE slug = 'krk-d1-powitanie'`))!.id as string;
    expect((await traveller.call('POST', '/api/sessions', { lessonId: archived })).status).toBe(404);
  });

  it('учень Лодзі, якому іспит відкрився за старими уроками, зберігає доступ, хоча уроки 6 і 7 тепер в архіві', async () => {
    const j = (await veteran.call('GET', '/api/journey')).body as { cities: City[] };
    const lodz = j.cities.find((c) => c.slug === 'lodz')!;
    expect(lodz.bossAvailable).toBe(true);
    const lessons = lodz.routes.flatMap((r) => r.lessons);
    expect(lessons.find((l) => l.slug === 'lodz-9-ktora-godzina')!.state).toBe('available');
    expect(lessons.find((l) => l.kind === 'BOSS')!.state).toBe('available');
  });

  it('повторний seed нічого не змінює', async () => {
    const a = await contentSnapshot(old);
    await apply(old, buildSeedSql());
    expect(await contentSnapshot(old)).toBe(a);
  });

  it('старі уроки в seed більше не з’являються, а міста без стандарту не зачеплені', () => {
    const now = new Set(CITY_CONTENT.flatMap((c) => c.routes.flatMap((r) => r.lessons.map((l) => l.slug))));
    expect(oldLessons.filter((l) => !now.has(l.slug)).length).toBeGreaterThan(60);
    expect(CITY_CONTENT.map((c) => c.city)).toEqual([...STD_CITIES, 'poznan', 'zielona-gora', 'gorzow', 'szczecin', 'gdansk']);
  });
});
