import { afterAll, describe, expect, it } from 'vitest';
import { disposeEnv, login, playSession } from './helpers';
import { resetRateLimits } from '../src/hono';

afterAll(disposeEnv);

type Route = { id: string; chest: { state: string; xp: number; zlotki: number } | null; lessons: { id: string; kind: string; state: string }[] };

describe('Скрині тем міста', () => {
  it('готова лише після всіх уроків теми, відкривається один раз, нагорода на сервері', async () => {
    const { call } = await login();
    const routes = async () => (await call('GET', '/api/journey')).body.cities[0].routes as Route[];
    const first = (await routes())[0];
    expect(first.chest).toMatchObject({ state: 'locked', xp: 30, zlotki: 15 });
    expect((await call('POST', `/api/journey/routes/${first.id}/chest`)).body.error).toBe('not_completed');

    for (const l of first.lessons.filter((x) => x.kind === 'LESSON')) {
      resetRateLimits();
      const s = await call('POST', '/api/sessions', { lessonId: l.id });
      expect((await playSession(call, s.body.sessionId)).status).toBe(200);
    }
    expect((await routes())[0].chest?.state).toBe('ready');
    expect((await routes())[1].chest?.state).toBe('locked');

    const before = (await call('GET', '/api/me')).body;
    const [a, b] = await Promise.all([call('POST', `/api/journey/routes/${first.id}/chest`), call('POST', `/api/journey/routes/${first.id}/chest`)]);
    const ok = [a, b].filter((r) => r.status === 200);
    expect(ok.length).toBeGreaterThanOrEqual(1);
    expect(ok[0].body).toMatchObject({ xp: 30, zlotki: 15 });
    const after = (await call('GET', '/api/me')).body;
    // Навіть при двох одночасних запитах нагорода нарахована один раз.
    expect(after.progress.xpTotal - before.progress.xpTotal).toBe(30);
    expect(after.zlotki - before.zlotki).toBe(15);
    expect((await routes())[0].chest?.state).toBe('opened');
    expect((await call('POST', `/api/journey/routes/${first.id}/chest`)).body.error).toBe('already_claimed');
  });

  it('неіснуюча тема — 404', async () => {
    const { call } = await login();
    expect((await call('POST', '/api/journey/routes/nope/chest')).status).toBe(404);
  });
});
