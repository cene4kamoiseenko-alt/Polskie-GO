/**
 * Прямі посилання на сторінки адмінки (/admin/users, /admin/audio) відкривають адмінку, а не Mini App:
 * статичні файли працюють у режимі SPA застосунку й на будь-який невідомий шлях віддають 200 з index.html Mini App.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { disposeEnv, getEnv } from './helpers';

afterAll(disposeEnv);

describe('адмінка: маршрути SPA', () => {
  it('маршрут адмінки — її index.html; файли збірки — як є', async () => {
    const { app, env } = await getEnv();
    const asked: string[] = [];
    const ASSETS = {
      fetch: async (req: Request) => {
        const path = new URL(req.url).pathname;
        asked.push(path);
        if (path === '/admin/') return new Response('<title>POLSKI GO · Админка</title>');
        if (path === '/admin/assets/index.js') return new Response('js');
        return new Response('<title>POLSKI GO</title>'); // SPA-режим Mini App: 200 на будь-який шлях
      },
    } as unknown as Fetcher;
    const get = async (path: string) => (await app.request(path, {}, { ...env, ASSETS })).text();
    expect(await get('/admin/users')).toContain('Админка');
    expect(await get('/admin/audio')).toContain('Админка');
    expect(await get('/admin/r/lessons/abc')).toContain('Админка');
    expect(await get('/admin/assets/index.js')).toBe('js');
    expect(asked).toEqual(['/admin/', '/admin/', '/admin/', '/admin/assets/index.js']);
  });
});
