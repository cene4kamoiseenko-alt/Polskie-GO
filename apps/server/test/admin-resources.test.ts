/**
 * Универсальные списки админки (routes/admin.ts, /resources/:name) на полном курсе.
 * D1 принимает не больше 100 параметров в запросе: «IN (…)» по маршрутам урока со страницы в 500 уроков падал
 * («Failed query: select "id", "slug" from "city_routes" where "city_routes"."id" in (?, …)», журнал ошибок 2026-11-22).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { disposeEnv, getEnv, request } from './helpers';

afterAll(disposeEnv);

let token = '';
const admin = (path: string) => request('GET', `/api/admin${path}`, undefined, { authorization: `Bearer ${token}` });

beforeAll(async () => {
  await getEnv();
  token = (await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' })).body.token;
});

describe('списки админки на полном курсе', () => {
  it('уроки страницей в 500 (500 id в подсчёте упражнений, ~100 маршрутов) — без ошибки, у каждого урока маршрут и число упражнений', async () => {
    const r = await admin('/resources/lessons?take=500');
    expect(r.status).toBe(200);
    const items = r.body.items as { routeId: string | null; route: { slug: string } | null; _count: { exercises: number } }[];
    expect(items.length).toBeGreaterThan(100);
    expect(new Set(items.map((l) => l.routeId).filter(Boolean)).size).toBeGreaterThan(90);
    for (const l of items) if (l.routeId) expect(l.route, l.routeId).not.toBeNull();
    expect(items.filter((l) => l._count.exercises > 0).length).toBeGreaterThan(100);
  });

  it('маршруты страницей в 500: число уроков у каждого', async () => {
    const r = await admin('/resources/routes?take=500');
    expect(r.status).toBe(200);
    const items = r.body.items as { city: { namePl: string } | null; _count: { lessons: number } }[];
    expect(items.length).toBeGreaterThan(90);
    expect(items.every((x) => x.city && x._count.lessons > 0)).toBe(true);
  });
});
