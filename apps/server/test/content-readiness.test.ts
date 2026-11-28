/**
 * Отчёт готовности контента (1.0, этап 2; services: content/readiness.ts, GET /api/admin/content-readiness, админка «Контент → Готовность»).
 * Считается из того же CITY_CONTENT, что идёт в игру: какие версии уроков есть, каких не хватает, сколько в них заданий, есть ли
 * замечания детектора качества. Тот же отчёт печатает `npm run content:readiness` (scripts/content-readiness.ts).
 */
import { afterAll, describe, expect, it } from 'vitest';
import { CITY_CONTENT } from '../src/content/seed';
import { CITIES } from '../src/content/cities';
import { contentReadiness } from '../src/content/readiness';
import { disposeEnv, getEnv, request } from './helpers';

afterAll(disposeEnv);

describe('отчёт готовности контента', () => {
  const r = contentReadiness(CITY_CONTENT);

  it('все города игры, в порядке карты, с названием и уровнем города', () => {
    expect(r.cities.map((c) => c.city)).toEqual(CITIES.filter((c) => CITY_CONTENT.some((x) => x.city === c.slug)).map((c) => c.slug));
    expect(r.cities).toHaveLength(CITY_CONTENT.length);
    const gdynia = r.cities.find((c) => c.city === 'gdynia')!;
    expect(gdynia.name).toBe('Gdynia');
    expect(gdynia.cefr).toBe('A2');
  });

  it('нужные версии = есть + не хватает; уроку A2 нужны B1 и B2, уроку B2 — ничего', () => {
    for (const c of r.cities) {
      expect(c.have + c.missing.length, c.city).toBe(c.need);
      expect(c.ready, c.city).toBe(c.missing.length === 0);
    }
    const gdynia = r.cities.find((c) => c.city === 'gdynia')!;
    expect(gdynia.need).toBe(18);
    expect(r.cities.find((c) => c.city === 'zakopane')!.need).toBe(0);
  });

  it('недостающие версии считаются по урокам: у незаконченного города (сейчас — только города B1) не хватает лишь B2', () => {
    const pending = r.cities.filter((c) => !c.ready);
    for (const c of pending) {
      expect(c.cefr, c.city).toBe('B1');
      expect(new Set(c.missing.map((m) => m.level)), c.city).toEqual(new Set(['B2']));
    }
    expect(r.totals.cities).toBe(20);
    expect(r.totals.ready).toBe(20 - pending.length);
    expect(r.totals.missing).toBe(pending.reduce((s, c) => s + c.missing.length, 0));
    expect(r.totals.need).toBe(r.totals.have + r.totals.missing);
  });

  it('задания версий посчитаны; замечаний детектора качества нет', () => {
    const gdynia = r.cities.find((c) => c.city === 'gdynia')!;
    expect(gdynia.tasks).toBeGreaterThanOrEqual(18 * 8);
    expect(r.totals.tasks).toBe(r.cities.reduce((s, c) => s + c.tasks, 0));
    expect(r.cities.filter((c) => c.findings > 0).map((c) => c.city)).toEqual([]);
  });

  it('админка: тот же отчёт по GET /api/admin/content-readiness; без входа — 401', async () => {
    await getEnv();
    expect((await request('GET', '/api/admin/content-readiness')).status).toBe(401);
    const token = (await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' })).body.token as string;
    const res = await request('GET', '/api/admin/content-readiness', undefined, { authorization: `Bearer ${token}` });
    expect(res.status).toBe(200);
    expect(res.body.totals).toEqual(r.totals);
    expect(res.body.cities.map((c: { city: string }) => c.city)).toEqual(r.cities.map((c) => c.city));
  });
});
