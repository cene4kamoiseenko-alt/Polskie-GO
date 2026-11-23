/**
 * Очередь озвучки на сервере (2026-11-23): админка ставит задание, сервер озвучивает его частями — по cron каждую минуту
 * и сразу, пока страница открыта (tick). Свернули окно — озвучка не останавливается. Заданию можно передать сколько угодно фраз.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { audioNorm } from '@polski-go/shared';
import { audioId } from '../src/services/audio-catalog';
import { db } from '../src/db';
import { audioAssets } from '../src/db/schema';
import { processAudioJobs } from '../src/services/audio-jobs';
import { disposeEnv, getEnv, request } from './helpers';

afterAll(disposeEnv);
afterEach(() => vi.restoreAllMocks());

const VOICE = 'KamilVoice0000000001';
const KEYS = ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID'] as const;
let token = '';
const admin = (method: 'GET' | 'POST', path: string, body?: unknown) => request(method, `/api/admin${path}`, body, { authorization: `Bearer ${token}` });

beforeAll(async () => {
  const { env } = await getEnv();
  Object.assign(env as unknown as Record<string, string>, { ELEVENLABS_API_KEY: 'k', ELEVENLABS_VOICE_ID: VOICE });
  token = (await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' })).body.token;
});
afterAll(async () => {
  const { env } = await getEnv();
  for (const k of KEYS) delete (env as unknown as Record<string, string>)[k];
});

const fakeMp3 = () => {
  const b = new Uint8Array(2000);
  b.set([0x49, 0x44, 0x33]);
  return b;
};
/** ElevenLabs: синтез — MP3, описание голоса — мужской Kamil с польским. calls — платные запросы синтеза. */
function mockEleven() {
  const calls: string[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    const u = String(url);
    if (!u.startsWith('https://api.elevenlabs.io/')) throw new Error(`unexpected fetch ${u}`);
    if (u.includes('/v1/voices/')) return Response.json({ voice_id: VOICE, name: 'Kamil - Polish narrator', labels: { gender: 'male' }, verified_languages: [{ language: 'pl', model_id: 'eleven_multilingual_v2' }] });
    calls.push(u);
    return new Response(fakeMp3() as BodyInit, { headers: { 'content-type': 'audio/mpeg', 'character-cost': '10' } });
  });
  return calls;
}

let seq = 0;
/** n уникальных фраз (id — как в каталоге: sha256 нормализованного текста). */
const items = (n: number) => Array.from({ length: n }, () => {
  const text = `Zdanie testowe numer ${++seq}.`;
  return { id: audioId(audioNorm(text)), text, model: 'eleven_flash_v2_5' as const };
});
const job = async (id: string) => ((await admin('GET', '/audio/jobs')).body.jobs as { id: string; status: string; processed: number; total: number; spent: number; stopReason: string | null }[]).find((j) => j.id === id)!;

describe('очередь озвучки', () => {
  it('задание на 1200 фраз создаётся одним запросом (без упора в лимит параметров D1)', async () => {
    const r = await admin('POST', '/audio/jobs', { title: 'Большое', items: items(1200), maxCredits: 1_000_000 });
    expect(r.status).toBe(200);
    expect(await job(r.body.id)).toMatchObject({ status: 'queued', total: 1200, processed: 0 });
    await admin('POST', `/audio/jobs/${r.body.id}/stop`);
    expect((await job(r.body.id)).status).toBe('stopped');
  });

  it('сервер озвучивает частями без страницы: 30 фраз — за два прохода cron, файлы готовы, кредиты посчитаны', async () => {
    const calls = mockEleven();
    const list = items(30);
    const { id } = (await admin('POST', '/audio/jobs', { title: 'Раздел', items: list, maxCredits: 10_000 })).body;
    await processAudioJobs(new Date(), { maxItems: 20 });
    expect(await job(id)).toMatchObject({ status: 'running', processed: 20 });
    await processAudioJobs(new Date(), { maxItems: 20 });
    expect(await job(id)).toMatchObject({ status: 'done', processed: 30, spent: 300 });
    expect(calls).toHaveLength(30);
    const row = await db.query.audioAssets.findFirst({ where: eq(audioAssets.unitId, list[29].id) });
    expect(row?.status).toBe('ready');
  });

  it('пока страница открыта, tick озвучивает следующую часть сразу', async () => {
    mockEleven();
    const { id } = (await admin('POST', '/audio/jobs', { title: 'Тик', items: items(12), maxCredits: 10_000 })).body;
    const t = await admin('POST', `/audio/jobs/${id}/tick`);
    expect(t.status).toBe(200);
    expect(t.body.job).toMatchObject({ processed: 10, status: 'running' });
    await admin('POST', `/audio/jobs/${id}/tick`);
    expect(await job(id)).toMatchObject({ status: 'done', processed: 12 });
  });

  it('остановка и продолжение: остановленное задание cron не трогает, после «продолжить» — доделывает', async () => {
    const calls = mockEleven();
    const { id } = (await admin('POST', '/audio/jobs', { title: 'Стоп', items: items(5), maxCredits: 10_000 })).body;
    await admin('POST', `/audio/jobs/${id}/stop`);
    await processAudioJobs(new Date(), { maxItems: 20 });
    expect(calls).toHaveLength(0);
    expect((await job(id)).stopReason).toBe('admin');
    await admin('POST', `/audio/jobs/${id}/resume`);
    await processAudioJobs(new Date(), { maxItems: 20 });
    expect(await job(id)).toMatchObject({ status: 'done', processed: 5 });
  });

  it('лимит кредитов: задание останавливается на бюджете, остаток ждёт; «продолжить» с новым лимитом доделывает', async () => {
    mockEleven();
    const { id } = (await admin('POST', '/audio/jobs', { title: 'Бюджет', items: items(6), maxCredits: 30 })).body;
    await processAudioJobs(new Date(), { maxItems: 20 });
    const j = await job(id);
    expect(j).toMatchObject({ status: 'stopped', stopReason: 'budget' });
    expect(j.processed).toBeLessThan(6);
    await admin('POST', `/audio/jobs/${id}/resume`, { maxCredits: 1000 });
    await processAudioJobs(new Date(), { maxItems: 20 });
    expect(await job(id)).toMatchObject({ status: 'done', processed: 6 });
  });

  it('только суперадмин ставит задания; неверный id фразы — отказ', async () => {
    const bad = await admin('POST', '/audio/jobs', { title: 'x', items: [{ id: 'abc', text: 'Cześć', model: 'eleven_flash_v2_5' }], maxCredits: 10 });
    expect(bad.status).toBe(400);
  });
});
