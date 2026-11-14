import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { usageCounters } from '../src/db/schema';
import { consumeQuota, pruneUsage, QUOTA_DEFAULTS, quotaLimit } from '../src/services/quota';
import { resetRateLimits } from '../src/hono';
import { disposeEnv, getEnv, login } from './helpers';

afterAll(disposeEnv);
afterEach(async () => {
  vi.restoreAllMocks();
  const { env } = await getEnv();
  delete env.TTS_DAILY_LIMIT;
  resetRateLimits();
});

describe('Добові квоти платних звернень (D1, спільні для всіх ізолятів)', () => {
  it('рахує до ліміту, далі 429 quota_exceeded; лічильник не росте понад ліміт', async () => {
    const { env } = await getEnv();
    env.TTS_DAILY_LIMIT = '3';
    const { user } = await login();
    const day = new Date('2026-10-25T10:00:00Z');
    for (let i = 1; i <= 3; i++) expect((await consumeQuota(user.id, 'tts', day)).used).toBe(i);
    await expect(consumeQuota(user.id, 'tts', day)).rejects.toMatchObject({ status: 429, code: 'quota_exceeded' });
    const rows = await db.select().from(usageCounters).where(eq(usageCounters.userId, user.id));
    expect(rows).toEqual([expect.objectContaining({ kind: 'tts', day: '2026-10-25', count: 3 })]);
  });

  it('квота окрема для користувача й доби; старі лічильники прибираються', async () => {
    const { env } = await getEnv();
    env.TTS_DAILY_LIMIT = '1';
    const a = await login();
    const b = await login();
    const d1 = new Date('2026-10-01T12:00:00Z');
    await consumeQuota(a.user.id, 'tts', d1);
    await expect(consumeQuota(a.user.id, 'tts', d1)).rejects.toMatchObject({ code: 'quota_exceeded' });
    await expect(consumeQuota(b.user.id, 'tts', d1)).resolves.toMatchObject({ used: 1 });
    await expect(consumeQuota(a.user.id, 'tts', new Date('2026-10-02T00:00:01Z'))).resolves.toMatchObject({ used: 1 });
    await pruneUsage(new Date('2026-10-20T00:00:00Z'));
    expect(await db.select().from(usageCounters).where(eq(usageCounters.userId, a.user.id))).toEqual([]);
  });

  it('неправильне значення ліміту в оточенні — типовий ліміт', async () => {
    const { env } = await getEnv();
    env.TTS_DAILY_LIMIT = 'abc';
    expect(quotaLimit('tts')).toBe(QUOTA_DEFAULTS.tts);
  });

  it('розпізнавання мовлення вимкнено: маршрутів /api/speech/* немає', async () => {
    const { app, env } = await getEnv();
    const { token } = await login();
    for (const [method, path] of [['GET', '/api/speech/status'], ['POST', '/api/speech/transcribe']] as const) {
      const res = await app.request(path, { method, headers: { authorization: `Bearer ${token}` } }, env);
      expect(res.status, path).toBe(404);
    }
  });
});
