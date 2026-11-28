/**
 * Мониторинг скорости (1.0, этап 1.2): каждый ответ API несёт `server-timing` — время ответа, время и число обращений к D1.
 * Обращение к D1 — это поход по сети к базе (сейчас в Океании, ~220 мс каждый), поэтому их число на запрос — главный показатель.
 * Тест сверяет то, что сообщает сервер, со своим независимым счётчиком вокруг базы.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { disposeEnv, getEnv, login } from './helpers';

afterAll(disposeEnv);

/** Счётчик снаружи: каждый вызов all/first/run/raw у запроса и каждый batch — одно обращение к базе. */
function counted(d1: D1Database) {
  const n = { calls: 0 };
  const wrapStmt = (s: D1PreparedStatement): D1PreparedStatement =>
    new Proxy(s, {
      get(t, p) {
        if (p === 'bind') return (...a: unknown[]) => wrapStmt(t.bind(...a));
        if (p === 'all' || p === 'first' || p === 'run' || p === 'raw') {
          return (...a: unknown[]) => {
            n.calls++;
            return (t[p] as (...x: unknown[]) => unknown)(...a);
          };
        }
        const v = Reflect.get(t, p, t);
        return typeof v === 'function' ? v.bind(t) : v;
      },
    });
  const originals = new WeakMap<object, D1PreparedStatement>();
  const db = new Proxy(d1, {
    get(t, p) {
      if (p === 'prepare') {
        return (q: string) => {
          const s = t.prepare(q);
          const w = wrapStmt(s);
          originals.set(w, s);
          return w;
        };
      }
      if (p === 'batch') {
        return (list: D1PreparedStatement[]) => {
          n.calls++;
          return t.batch(list);
        };
      }
      const v = Reflect.get(t, p, t);
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { db, n };
}

const parse = (h: string | null) => {
  const out: Record<string, { dur: number; desc?: string }> = {};
  for (const part of (h ?? '').split(',')) {
    const [name, ...params] = part.trim().split(';');
    if (!name) continue;
    const m: { dur: number; desc?: string } = { dur: NaN };
    for (const p of params) {
      const [k, v] = p.split('=');
      if (k === 'dur') m.dur = Number(v);
      if (k === 'desc') m.desc = v.replace(/"/g, '');
    }
    out[name] = m;
  }
  return out;
};

describe('server-timing: время ответа и обращения к D1', () => {
  it('GET /api/me сообщает столько обращений к D1, сколько их было на самом деле', async () => {
    const { app, env } = await getEnv();
    const u = await login();
    const { db, n } = counted(env.DB);
    const res = await app.request('/api/me', { headers: { authorization: `Bearer ${u.token}` } }, { ...env, DB: db });
    expect(res.status).toBe(200);
    const st = parse(res.headers.get('server-timing'));
    expect(st.app?.dur).toBeGreaterThanOrEqual(0);
    expect(st.d1?.dur).toBeGreaterThanOrEqual(0);
    expect(n.calls).toBeGreaterThan(0);
    expect(Number(st.d1?.desc)).toBe(n.calls);
  });

  it('запрос, отбитый до базы (нет входа), — 0 обращений', async () => {
    const { app, env } = await getEnv();
    const res = await app.request('/api/no-such-route', {}, env);
    expect(res.status).toBe(401);
    expect(parse(res.headers.get('server-timing')).d1?.desc).toBe('0');
  });
});

/**
 * Мониторинг (1.0, этап 1.2): выборка запросов API (доля PERF_SAMPLE, медленные и 5xx — всегда), замеры приложения — запуск и открытие урока,
 * ошибки фоновых задач в журнале; админка показывает p50/p95/p99 по маршрутам и ошибки API, бота, приложения и задач.
 */
import { lt as _lt } from 'drizzle-orm';
import { db } from '../src/db';
import { errorLog, perfSamples } from '../src/db/schema';
import { jobError, purgePerf } from '../src/services/perf';
import { request } from './helpers';

const setSample = async (v?: string) => {
  const { env } = await getEnv();
  if (v === undefined) delete (env as { PERF_SAMPLE?: string }).PERF_SAMPLE;
  else (env as { PERF_SAMPLE?: string }).PERF_SAMPLE = v;
};
const settle = () => new Promise((r) => setTimeout(r, 50));

describe('мониторинг скорости', () => {
  it('выборка API: запрос попадает в perf_samples с маршрутом без id, временем и обращениями к D1', async () => {
    const u = await login();
    await setSample('1');
    try {
      await u.call('GET', '/api/me');
      await settle();
    } finally {
      await setSample();
    }
    const rows = await db.select().from(perfSamples);
    const me = rows.find((r) => r.kind === 'api' && r.route === 'GET /api/me');
    expect(me).toBeTruthy();
    expect(me!.status).toBe(200);
    expect(me!.d1Calls).toBeGreaterThan(0);
    expect(me!.ms).toBeGreaterThanOrEqual(0);
  });

  it('доля 0 — обычные запросы не пишутся', async () => {
    const u = await login();
    await setSample('0');
    try {
      const before = (await db.select().from(perfSamples)).length;
      await u.call('GET', '/api/journey');
      await settle();
      expect((await db.select().from(perfSamples)).length).toBe(before);
    } finally {
      await setSample();
    }
  });

  it('замер приложения: запуск и открытие урока; проверка входа и значений', async () => {
    const u = await login();
    expect((await u.call('POST', '/api/metrics', { kind: 'start', ms: 1234, warm: true })).status).toBe(204);
    expect((await u.call('POST', '/api/metrics', { kind: 'lesson', ms: 640 })).status).toBe(204);
    expect((await u.call('POST', '/api/metrics', { kind: 'start', ms: -5 })).status).toBe(400);
    expect((await u.call('POST', '/api/metrics', { kind: 'start', ms: 999_999 })).status).toBe(400);
    expect((await request('POST', '/api/metrics', { kind: 'start', ms: 100 })).status).toBe(401);
    const rows = await db.select().from(perfSamples);
    expect(rows.some((r) => r.kind === 'client_start' && r.route === 'warm' && r.ms === 1234)).toBe(true);
    expect(rows.some((r) => r.kind === 'client_lesson' && r.ms === 640)).toBe(true);
  });

  it('ошибка фоновой задачи попадает в журнал ошибок видом job', async () => {
    jobError('league settle')(new Error('boom 12345'));
    await settle();
    const rows = await db.select().from(errorLog);
    expect(rows.some((r) => r.kind === 'job' && r.path === 'league settle' && r.message.includes('boom'))).toBe(true);
  });

  it('админка: p50/p95/p99 по маршрутам, запуск приложения, ошибки по видам', async () => {
    const u = await login();
    await setSample('1');
    try {
      for (let i = 0; i < 3; i++) await u.call('GET', '/api/me');
      await settle();
    } finally {
      await setSample();
    }
    const token = (await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' })).body.token as string;
    const r = await request('GET', '/api/admin/perf?hours=24', undefined, { authorization: `Bearer ${token}` });
    expect(r.status).toBe(200);
    const me = r.body.api.find((x: { route: string }) => x.route === 'GET /api/me');
    expect(me.n).toBeGreaterThanOrEqual(3);
    for (const k of ['p50', 'p95', 'p99', 'd1p95', 'd1Calls', 'errors']) expect(me).toHaveProperty(k);
    expect(r.body.client.start.warm.n).toBeGreaterThanOrEqual(1);
    expect(r.body.client.lesson.n).toBeGreaterThanOrEqual(1);
    for (const k of ['api', 'bot', 'client', 'job']) expect(r.body.errors).toHaveProperty(k);
    expect(r.body.errors.job).toBeGreaterThanOrEqual(1);
  });

  it('выборка хранится 14 дней', async () => {
    const old = Date.now() - 15 * 86_400_000;
    await db.insert(perfSamples).values({ at: old, kind: 'api', route: 'GET /api/old', status: 200, ms: 1, d1Ms: 0, d1Calls: 0 });
    await purgePerf(new Date());
    expect((await db.select().from(perfSamples).where(_lt(perfSamples.at, Date.now() - 14 * 86_400_000))).length).toBe(0);
  });
});

describe('время базы в server-timing', () => {
  it('параллельные обращения не складываются: две по 60 мс одновременно — около 60 мс, а не 120', async () => {
    const { instrumentD1, withD1Stats } = await import('../src/db/metrics');
    const slow = {
      prepare: () => ({ all: () => new Promise((r) => setTimeout(() => r({ results: [] }), 60)), bind() { return this; } }),
      batch: async () => [],
    } as unknown as D1Database;
    const d1 = instrumentD1(slow);
    const stats = { calls: 0, statements: 0, ms: 0 };
    await withD1Stats(stats, async () => {
      await Promise.all([d1.prepare('select 1').all(), d1.prepare('select 2').all()]);
    });
    expect(stats.calls).toBe(2);
    expect(stats.ms).toBeGreaterThanOrEqual(55);
    expect(stats.ms).toBeLessThan(100);
  });
});
