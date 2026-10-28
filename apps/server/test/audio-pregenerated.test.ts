/**
 * PRE-GENERATED AUDIO ONLY (docs/PROMPT_AUDIO_PREGENERATED.md): кнопка динаміка ніколи не викликає ElevenLabs.
 * Гравець отримує лише готовий MP3 з R2 через Worker (GET /api/audio/<відбиток>/<audio_id>.mp3): перше й повторні
 * відтворення, повторне відкриття застосунку, відсутній файл — нуль запитів до ElevenLabs. Генерація — лише адмінка
 * (AUDIO_GENERATION_MODE=admin_only), з перевіркою voice_id. Мережа підмінена: будь-який запит до ElevenLabs рахується.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { audioNorm } from '@polski-go/shared';
import { audioId, audioObjectKey } from '../src/services/audio-catalog';
import { libraryFingerprint } from '../src/services/audio-library';
import { MISSIONS } from '../src/content/missions';
import { disposeEnv, getEnv, login, request } from './helpers';

afterAll(disposeEnv);
afterEach(() => vi.restoreAllMocks());

const VOICE = 'KamilVoice0000000002';
const FEMALE = 'FemaleVoice000000009';
const KEYS = ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID', 'AUDIO_LIBRARY', 'AUDIO_GENERATION_MODE', 'TTS_PROVIDER', 'GOOGLE_TTS_API_KEY'] as const;

async function withEnv(vars: Partial<Record<(typeof KEYS)[number], string>>, fn: (env: Record<string, unknown>) => Promise<void>) {
  const env = (await getEnv()).env as unknown as Record<string, unknown>;
  for (const k of KEYS) delete env[k];
  Object.assign(env, vars);
  try {
    await fn(env);
  } finally {
    for (const k of KEYS) delete env[k];
  }
}

/** Схожий на MP3 вміст розміром справжнього короткого файлу. */
const mp3 = (tag: string, size = 4000) => {
  const b = new Uint8Array(size);
  b.set([0x49, 0x44, 0x33]);
  b.set(new TextEncoder().encode(tag), 10);
  for (let i = 40; i < size; i++) b[i] = i % 251;
  return b;
};

/** Кожен запит до ElevenLabs (і до будь-якого провайдера озвучки) — у списку; синтез повертає MP3. */
function spyProviders(voiceInfo: { name: string; gender: string } = { name: 'Kamil', gender: 'male' }) {
  const calls: string[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    const u = String(url);
    calls.push(u);
    if (u.includes('/v1/voices/')) return Response.json({ voice_id: VOICE, name: voiceInfo.name, labels: { gender: voiceInfo.gender } });
    if (u.includes('/text-to-speech/')) return new Response(mp3('new') as BodyInit, { headers: { 'content-type': 'audio/mpeg' } });
    return new Response('{}', { status: 404 });
  });
  return calls;
}

const fp = () => libraryFingerprint(VOICE);
const urlOf = (text: string) => `/api/audio/${fp()}/${audioId(audioNorm(text))}.mp3`;
async function get(url: string, headers: Record<string, string> = {}) {
  const { app, env } = await getEnv();
  const res = await app.request(url, { headers }, env);
  return { res, bytes: new Uint8Array(await res.arrayBuffer()) };
}
async function put(env: Record<string, unknown>, text: string, body: Uint8Array, voice = VOICE) {
  await (env.AUDIO as R2Bucket).put(audioObjectKey(audioId(audioNorm(text)), voice), body, { httpMetadata: { contentType: 'audio/mpeg', cacheControl: 'public, max-age=31536000, immutable' } });
}

describe('кнопка динаміка — лише готовий MP3', () => {
  it('перше відтворення готового MP3: файл з R2 із правильними заголовками — 0 запитів до ElevenLabs', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k' }, async (env) => {
      const calls = spyProviders();
      const body = mp3('kamil');
      await put(env, 'Dzień dobry!', body);
      const { res, bytes } = await get(urlOf('Dzień dobry!'));
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('audio/mpeg');
      expect(res.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
      expect(res.headers.get('accept-ranges')).toBe('bytes');
      expect(res.headers.get('content-length')).toBe(String(body.length));
      expect(res.headers.get('etag')).toBeTruthy();
      expect(bytes).toEqual(body);
      expect(calls).toEqual([]);
    });
  });

  it('20 повторних відтворень і повторне відкриття застосунку — 0 запитів; той самий файл; If-None-Match → 304', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k', TTS_PROVIDER: 'elevenlabs' }, async (env) => {
      const calls = spyProviders();
      await put(env, 'Poproszę kawę.', mp3('kawa'));
      const first = await get(urlOf('Poproszę kawę.'));
      const etag = first.res.headers.get('etag')!;
      for (let i = 0; i < 20; i++) {
        const again = await get(urlOf('Poproszę kawę.'));
        expect(again.res.status).toBe(200);
        expect(again.bytes).toEqual(first.bytes);
        expect(again.res.headers.get('etag')).toBe(etag);
      }
      const cached = await get(urlOf('Poproszę kawę.'), { 'if-none-match': etag });
      expect(cached.res.status).toBe(304);
      // Повторне відкриття Mini App: вхід, профіль, урок — жодного звернення до ElevenLabs.
      const u = await login();
      const me = await u.call('GET', '/api/me');
      expect(me.body.audio).toMatchObject({ server: true, base: `/api/audio/${fp()}/` });
      await u.call('GET', '/api/tts/status');
      await request('GET', '/api/health');
      expect(calls).toEqual([]);
    });
  });

  it('одне слово в різних місцях (місія, словник): та сама адреса й той самий MP3', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k' }, async (env) => {
      const calls = spyProviders();
      const mission = MISSIONS.find((m) => m.slug === 'zabka-first-order')!;
      const fromMission = mission.phrases.find((p) => audioNorm(p.pl) === audioNorm('woda niegazowana'))!.pl;
      expect(fromMission).not.toBe('woda niegazowana'); // інше написання: велика літера й крапка
      expect(urlOf(fromMission)).toBe(urlOf('woda niegazowana'));
      expect(urlOf('„Woda niegazowana”')).toBe(urlOf('woda niegazowana'));
      await put(env, 'woda niegazowana', mp3('woda'));
      const a = await get(urlOf(fromMission));
      const b = await get(urlOf('woda niegazowana'));
      expect(a.res.status).toBe(200);
      expect(a.bytes).toEqual(b.bytes);
      expect(calls).toEqual([]);
    });
  });

  it('відсутній MP3: 404 «скоро з’явиться» з коротким кешем — 0 запитів до ElevenLabs, і старий /api/tts теж не синтезує', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k', TTS_PROVIDER: 'elevenlabs', GOOGLE_TTS_API_KEY: 'g' }, async (env) => {
      const calls = spyProviders();
      const { res } = await get(urlOf('Nie ma takiego nagrania.'));
      expect(res.status).toBe(404);
      expect(res.headers.get('cache-control')).toBe('public, max-age=300');
      // Файл старого жіночого голосу з тим самим текстом не віддається голосом Kamil.
      await put(env, 'Do zobaczenia!', mp3('female'), FEMALE);
      expect((await get(urlOf('Do zobaczenia!'))).res.status).toBe(404);
      const u = await login();
      expect((await u.call('GET', `/api/tts?text=${encodeURIComponent('Nie ma takiego nagrania.')}`)).status).toBe(404);
      // Натискання без файлу — лише лічильник для адмінки.
      expect((await u.call('POST', '/api/audio/miss', { text: 'Nie ma takiego nagrania.' })).status).toBe(200);
      expect(calls).toEqual([]);
    });
  });

  it('Range для мобільного відтворення (iOS просить bytes=0-1): 206 з Content-Range; за межами — 416', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE }, async (env) => {
      const body = mp3('range', 3000);
      await put(env, 'Na zdrowie!', body);
      const url = urlOf('Na zdrowie!');
      const two = await get(url, { range: 'bytes=0-1' });
      expect(two.res.status).toBe(206);
      expect(two.res.headers.get('content-range')).toBe('bytes 0-1/3000');
      expect(two.res.headers.get('content-length')).toBe('2');
      expect(two.bytes).toEqual(body.slice(0, 2));
      const tail = await get(url, { range: 'bytes=2900-' });
      expect(tail.res.status).toBe(206);
      expect(tail.res.headers.get('content-range')).toBe('bytes 2900-2999/3000');
      expect(tail.bytes).toEqual(body.slice(2900));
      const suffix = await get(url, { range: 'bytes=-100' });
      expect(suffix.res.status).toBe(206);
      expect(suffix.res.headers.get('content-range')).toBe('bytes 2900-2999/3000');
      expect(suffix.bytes).toEqual(body.slice(2900));
      const beyond = await get(url, { range: 'bytes=5000-6000' });
      expect(beyond.res.status).toBe(416);
      expect(beyond.res.headers.get('content-range')).toBe('bytes */3000');
    });
  });

  it('версіоновані адреси: відбиток іншого голосу чи версії й неправильний id — 404, без звернення до R2-ключа іншого голосу', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE }, async (env) => {
      await put(env, 'Smacznego!', mp3('x'));
      const id = audioId(audioNorm('Smacznego!'));
      expect((await get(`/api/audio/${libraryFingerprint(FEMALE)}/${id}.mp3`)).res.status).toBe(404);
      expect((await get(`/api/audio/${fp()}/${id.slice(0, 40)}.mp3`)).res.status).toBe(404);
      expect((await get(`/api/audio/${fp()}/../${id}.mp3`)).res.status).not.toBe(200);
      expect((await get(`/api/audio/${fp()}/${id}.mp3`)).res.status).toBe(200);
    });
  });

  it('audio_id клієнта (WebCrypto SHA-256 від audioNorm) збігається з id каталогу', async () => {
    for (const text of ['Dzień dobry!', 'żółć', 'Wrocław Główny', '„Bursztyn”', 'Tak?', 'ODJAZDY']) {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(audioNorm(text)));
      const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
      expect(hex, text).toBe(audioId(audioNorm(text)));
    }
  });
});

describe('клієнт не синтезує', () => {
  it('у коді Mini App немає speechSynthesis і синтезу за текстом; динамік бере {base}{audio_id}.mp3', () => {
    const web = new URL('../../web/src/', import.meta.url);
    const files = (readdirSync(web, { recursive: true }) as string[]).filter((f) => /\.tsx?$/.test(f));
    for (const f of files) {
      const src = readFileSync(new URL(f, web), 'utf8').replace(/^\s*(\/\/|\*).*$/gm, '');
      expect(/speechSynthesis|SpeechSynthesisUtterance/.test(src), f).toBe(false);
      expect(/['"`]\/tts\?/.test(src), f).toBe(false);
    }
    const audio = readFileSync(new URL('lib/audio.ts', web), 'utf8');
    expect(audio).toContain("crypto.subtle.digest('SHA-256'");
    expect(audio).toContain('`${API_BASE}${base}${id}.mp3`');
  });
});

describe('генерація — лише адмінка', () => {
  async function admin() {
    const r = await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' });
    return (method: 'GET' | 'POST', url: string, body?: unknown) => request(method, url, body, { authorization: `Bearer ${r.body.token}` });
  }
  const item = (text: string) => ({ id: audioId(audioNorm(text)), text, model: 'eleven_multilingual_v2' });

  it('звичайний користувач і запит без входу не мають доступу до адмінської генерації', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k' }, async () => {
      const calls = spyProviders();
      const u = await login();
      const body = { items: [item('Dzień dobry!')], maxCredits: 100 };
      expect((await u.call('POST', '/api/admin/audio/generate', body)).status).toBe(401);
      expect((await request('POST', '/api/admin/audio/generate', body)).status).toBe(401);
      expect((await u.call('GET', '/api/admin/audio/account')).status).toBe(401);
      // Синтезу довільного тексту для гравця немає ніде: ні /api/tts, ні /api/audio.
      expect((await u.call('GET', `/api/tts?text=${encodeURIComponent('Dowolny tekst gracza')}`)).status).toBe(404);
      expect(calls).toEqual([]);
    });
  });

  it('AUDIO_GENERATION_MODE=off — генерація заборонена і суперадміну; admin_only — дозволена з перевіркою голосу', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k', AUDIO_GENERATION_MODE: 'off' }, async (env) => {
      const calls = spyProviders();
      const call = await admin();
      const off = await call('POST', '/api/admin/audio/generate', { items: [item('Wyłączone.')], maxCredits: 100 });
      expect(off.status).toBe(403);
      expect(off.body.error).toBe('generation_off');
      expect(calls).toEqual([]);
      env.AUDIO_GENERATION_MODE = 'admin_only';
      const ok = await call('POST', '/api/admin/audio/generate', { items: [item('Włączone.')], maxCredits: 100 });
      expect(ok.body.results[0].status).toBe('generated');
      expect(calls.filter((u) => u.includes('/v1/voices/'))).toHaveLength(1);
      expect(calls.filter((u) => u.includes('/text-to-speech/'))).toHaveLength(1);
      // Готовий файл — не генерується вдруге.
      const again = await call('POST', '/api/admin/audio/generate', { items: [item('Włączone.')], maxCredits: 100 });
      expect(again.body.results[0].status).toBe('exists');
      expect(calls.filter((u) => u.includes('/text-to-speech/'))).toHaveLength(1);
    });
  });

  it('перед генерацією voice_id перевіряється: не Kamil — відмова без синтезу, доки адмін явно не підтвердить', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: 'OtherVoice0000000003', ELEVENLABS_API_KEY: 'k' }, async () => {
      const calls = spyProviders({ name: 'Ola', gender: 'female' });
      const call = await admin();
      const no = await call('POST', '/api/admin/audio/generate', { items: [item('Głos Oli.')], maxCredits: 100 });
      expect(no.status).toBe(400);
      expect(no.body.error).toBe('voice_not_kamil');
      expect(calls.filter((u) => u.includes('/text-to-speech/'))).toHaveLength(0);
      const yes = await call('POST', '/api/admin/audio/generate', { items: [item('Głos Oli.')], maxCredits: 100, allowOtherVoice: true });
      expect(yes.body.results[0].status).toBe('generated');
    });
  });

  it('журнал витрат і черга помилок — у підсумку адмінки', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k' }, async () => {
      spyProviders();
      const call = await admin();
      await call('POST', '/api/admin/audio/generate', { items: [item('Dziennik wydatków.')], maxCredits: 100 });
      const s = await call('GET', '/api/admin/audio/summary');
      expect(s.body.generation).toBe('admin_only');
      const today = new Date().toISOString().slice(0, 10);
      expect(s.body.spend.find((d: { day: string }) => d.day === today)).toMatchObject({ files: expect.any(Number), credits: expect.any(Number) });
      expect(Array.isArray(s.body.queue)).toBe(true);
    });
  });
});
