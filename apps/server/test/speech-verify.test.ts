import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { encodeSpeechWav, type PronunciationData } from '@polski-go/shared';
import { and, eq } from 'drizzle-orm';
import { db } from '../src/db';
import { exerciseAttempts, learningSessions } from '../src/db/schema';
import { issueSpeechAttempt } from '../src/services/speech-attempts';
import { disposeEnv, getEnv, lessonId, login, playSession, sessionItems, verifiedSpeech } from './helpers';

afterAll(disposeEnv);
afterEach(async () => {
  vi.restoreAllMocks();
  const { env } = await getEnv();
  delete env.AZURE_STT_ENABLED;
  delete env.AZURE_SPEECH_KEY;
  delete env.AZURE_SPEECH_REGION;
});

const clip = () => encodeSpeechWav([new Float32Array(3200).fill(0.1)], 16000);

/** Сесія уроку, де є завдання на вимову. */
async function speakingSession() {
  const u = await login();
  const s = await u.call('POST', '/api/sessions', { lessonId: await lessonId('waw-1-czesc') });
  const items = await sessionItems(s.body.sessionId);
  const item = items.find((x) => x.type === 'PRONUNCIATION')!;
  expect(item, 'у першому уроці є вимова').toBeTruthy();
  return { ...u, sessionId: s.body.sessionId as string, item, items, text: (item.data as PronunciationData).text };
}

describe('Вимова: зарахування лише за підтверджену сервером спробу', () => {
  it('транскрипт від клієнта не дає зарахування: тренування без XP і без помилки', async () => {
    const { call, user, sessionId, item, text } = await speakingSession();
    const r = await call('POST', `/api/sessions/${sessionId}/answer`, { key: item.key, answer: { transcript: text } });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ correct: false, skipped: true, practice: true, matched: true });
    expect(r.body.verified).toBeUndefined();
    const s = await db.query.learningSessions.findFirst({ where: eq(learningSessions.id, sessionId) });
    expect((s!.state as { answers: Record<string, { skipped?: boolean; practice?: boolean; mistakes: number }> }).answers[item.key]).toMatchObject({ skipped: true, practice: true, mistakes: 0 });
    // Не потрапляє ні в статистику навичок, ні в «Мої помилки».
    const logged = await db.select().from(exerciseAttempts).where(and(eq(exerciseAttempts.userId, user.id), eq(exerciseAttempts.itemKey, item.key)));
    expect(logged).toHaveLength(0);
  });

  it('серверне розпізнавання з прив\'язкою до сесії дає підписану спробу; її зараховують один раз', async () => {
    const { app, env } = await getEnv();
    env.AZURE_STT_ENABLED = 'true';
    env.AZURE_SPEECH_KEY = 'test';
    env.AZURE_SPEECH_REGION = 'westeurope';
    const { token, call, sessionId, item, text } = await speakingSession();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ RecognitionStatus: 'Success', DisplayText: text })));
    const res = await app.request(`/api/speech/transcribe?session=${sessionId}&item=${encodeURIComponent(item.key)}`, { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: new Blob([new Uint8Array(clip())]) }, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { transcript: string; attempt: string };
    expect(body.transcript).toBe(text);
    expect(body.attempt.length).toBeGreaterThan(40);

    const ok = await call('POST', `/api/sessions/${sessionId}/answer`, { key: item.key, answer: { attempt: body.attempt } });
    expect(ok.body).toMatchObject({ correct: true, verified: true });
    // Повтор тієї ж спроби (replay) відхиляється навіть для повторної відповіді.
    const replay = await call('POST', `/api/sessions/${sessionId}/answer`, { key: item.key, answer: { attempt: body.attempt } });
    expect(replay.status).toBe(400);
    expect(replay.body.error).toBe('speech_attempt_invalid');
    // Після відповіді нова прив'язана спроба для того ж завдання не видається.
    const again = await app.request(`/api/speech/transcribe?session=${sessionId}&item=${encodeURIComponent(item.key)}`, { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: new Blob([new Uint8Array(clip())]) }, env);
    expect(again.status).toBe(400);
  });

  it('спроба не переноситься на інше завдання, іншу сесію чи іншого користувача й не підробляється', async () => {
    const a = await speakingSession();
    const b = await speakingSession();
    const other = a.items.find((x) => x.type !== 'PRONUNCIATION' && x.type !== 'DIALOGUE' && x.type !== 'SITUATION')!;
    const forOther = issueSpeechAttempt({ userId: a.user.id, sessionId: a.sessionId, key: other.key, transcript: a.text });
    const forB = (await verifiedSpeech(b.sessionId, b.item.key, b.text)).attempt;
    const bad = [
      forOther, // інше завдання
      forB, // інша сесія й інший користувач
      issueSpeechAttempt({ userId: a.user.id, sessionId: b.sessionId, key: a.item.key, transcript: a.text }), // чужа сесія
    ];
    const good = (await verifiedSpeech(a.sessionId, a.item.key, a.text)).attempt;
    const [body, sig] = good.split('.');
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    bad.push(`${Buffer.from(JSON.stringify({ ...payload, t: 'zmieniony tekst' })).toString('base64url')}.${sig}`); // змінений текст
    for (const attempt of bad) {
      const r = await a.call('POST', `/api/sessions/${a.sessionId}/answer`, { key: a.item.key, answer: { attempt } });
      expect(r.status, attempt.slice(0, 20)).toBe(400);
      expect(r.body.error).toBe('speech_attempt_invalid');
    }
    // Прострочена (понад 5 хвилин).
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 6 * 60_000);
    const late = await a.call('POST', `/api/sessions/${a.sessionId}/answer`, { key: a.item.key, answer: { attempt: good } });
    vi.restoreAllMocks();
    expect(late.status).toBe(400);
    // Свіжа й правильна — приймається.
    const fine = await a.call('POST', `/api/sessions/${a.sessionId}/answer`, { key: a.item.key, answer: { attempt: good } });
    expect(fine.body).toMatchObject({ correct: true, verified: true });
  });

  it('прив\'язка розпізнавання лише до завдання на вимову у своїй активній сесії', async () => {
    const { app, env } = await getEnv();
    env.AZURE_STT_ENABLED = 'true';
    env.AZURE_SPEECH_KEY = 'test';
    env.AZURE_SPEECH_REGION = 'westeurope';
    const a = await speakingSession();
    const b = await login();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ RecognitionStatus: 'Success', DisplayText: a.text })));
    const notSpeech = a.items.find((x) => x.type !== 'PRONUNCIATION')!;
    const send = (tok: string, item: string) => app.request(`/api/speech/transcribe?session=${a.sessionId}&item=${encodeURIComponent(item)}`, { method: 'POST', headers: { authorization: `Bearer ${tok}` }, body: new Blob([new Uint8Array(clip())]) }, env);
    expect((await send(a.token, notSpeech.key)).status).toBe(400);
    expect((await send(b.token, a.item.key)).status).toBe(404);
    // До провайдера такі запити не доходять.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('урок із лише тренуванням вимови проходиться: тренування не рахується ні в точність, ні в XP', async () => {
    const { call, sessionId, items } = await speakingSession();
    for (const it of items.filter((x) => x.type === 'PRONUNCIATION')) {
      await call('POST', `/api/sessions/${sessionId}/answer`, { key: it.key, answer: { transcript: 'cokolwiek' } });
    }
    const fin = await playSession(call, sessionId);
    expect(fin.status).toBe(200);
    expect(fin.body.passed).toBe(true);
    expect(fin.body.accuracy).toBe(100);
  });
});
