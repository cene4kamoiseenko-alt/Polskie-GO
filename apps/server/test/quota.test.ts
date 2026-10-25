import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { encodeSpeechWav } from '@polski-go/shared';
import { db } from '../src/db';
import { usageCounters } from '../src/db/schema';
import { consumeQuota, pruneUsage, QUOTA_DEFAULTS, quotaLimit } from '../src/services/quota';
import { resetRateLimits } from '../src/hono';
import { disposeEnv, getEnv, login } from './helpers';

afterAll(disposeEnv);
afterEach(async () => {
  vi.restoreAllMocks();
  const { env } = await getEnv();
  for (const k of ['AZURE_STT_ENABLED', 'AZURE_SPEECH_KEY', 'AZURE_SPEECH_REGION', 'STT_DAILY_LIMIT', 'TTS_DAILY_LIMIT'] as const) delete env[k];
  resetRateLimits();
});

describe('Добові квоти платних звернень (D1, спільні для всіх ізолятів)', () => {
  it('рахує до ліміту, далі 429 quota_exceeded; лічильник не росте понад ліміт', async () => {
    const { env } = await getEnv();
    env.STT_DAILY_LIMIT = '3';
    const { user } = await login();
    const day = new Date('2026-10-25T10:00:00Z');
    for (let i = 1; i <= 3; i++) expect((await consumeQuota(user.id, 'stt', day)).used).toBe(i);
    await expect(consumeQuota(user.id, 'stt', day)).rejects.toMatchObject({ status: 429, code: 'quota_exceeded' });
    const rows = await db.select().from(usageCounters).where(eq(usageCounters.userId, user.id));
    expect(rows).toEqual([expect.objectContaining({ kind: 'stt', day: '2026-10-25', count: 3 })]);
  });

  it('квота окрема для виду звернення, користувача й доби; старі лічильники прибираються', async () => {
    const { env } = await getEnv();
    env.STT_DAILY_LIMIT = '1';
    const a = await login();
    const b = await login();
    const d1 = new Date('2026-10-01T12:00:00Z');
    await consumeQuota(a.user.id, 'stt', d1);
    await expect(consumeQuota(a.user.id, 'stt', d1)).rejects.toMatchObject({ code: 'quota_exceeded' });
    await expect(consumeQuota(a.user.id, 'tts', d1)).resolves.toMatchObject({ used: 1, limit: QUOTA_DEFAULTS.tts });
    await expect(consumeQuota(b.user.id, 'stt', d1)).resolves.toMatchObject({ used: 1 });
    await expect(consumeQuota(a.user.id, 'stt', new Date('2026-10-02T00:00:01Z'))).resolves.toMatchObject({ used: 1 });
    await pruneUsage(new Date('2026-10-20T00:00:00Z'));
    expect(await db.select().from(usageCounters).where(eq(usageCounters.userId, a.user.id))).toEqual([]);
  });

  it('неправильне значення ліміту в оточенні — типовий ліміт', async () => {
    const { env } = await getEnv();
    env.TTS_DAILY_LIMIT = 'abc';
    expect(quotaLimit('tts')).toBe(QUOTA_DEFAULTS.tts);
  });

  it('розпізнавання: понад квоту провайдера не викликаємо; невалідний запис квоту не витрачає', async () => {
    const { app, env } = await getEnv();
    Object.assign(env, { AZURE_STT_ENABLED: 'true', AZURE_SPEECH_KEY: 'test', AZURE_SPEECH_REGION: 'westeurope', STT_DAILY_LIMIT: '2' });
    const provider = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ RecognitionStatus: 'Success', DisplayText: 'Dzień dobry' })));
    const { token } = await login();
    const post = (body: Uint8Array) => app.request('/api/speech/transcribe', { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'audio/wav' }, body: new Blob([new Uint8Array(body)]) }, env);
    expect((await post(new Uint8Array(100))).status).toBe(400);
    const clip = encodeSpeechWav([new Float32Array(3200).fill(0.1)], 16000);
    expect((await post(clip)).status).toBe(200);
    expect((await post(clip)).status).toBe(200);
    const third = await post(clip);
    expect(third.status).toBe(429);
    expect(((await third.json()) as { error: string }).error).toBe('quota_exceeded');
    expect(provider).toHaveBeenCalledTimes(2);
  });
});
