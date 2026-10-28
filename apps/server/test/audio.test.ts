import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { count } from 'drizzle-orm';
import { db } from '../src/db';
import { ttsCache } from '../src/db/schema';
import { synthesize } from '../src/services/tts';
import { disposeEnv, getEnv, login } from './helpers';

afterAll(disposeEnv);
afterEach(() => vi.restoreAllMocks());

/** Підміна Google TTS: перевіряємо, що саме надсилається сервісу. */
function mockGoogle() {
  const calls: { text: string; lang: string; voice: string; rate: number }[] = [];
  const realFetch = globalThis.fetch;
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    if (!String(url).startsWith('https://texttospeech.googleapis.com/')) return realFetch(url as never, init);
    const b = JSON.parse(String(init?.body));
    calls.push({ text: b.input.text, lang: b.voice.languageCode, voice: b.voice.name, rate: b.audioConfig.speakingRate });
    return new Response(JSON.stringify({ audioContent: Buffer.from(`MP3:${b.input.text}`).toString('base64') }), { status: 200 });
  });
  return calls;
}

describe('Серверна польська озвучка', () => {
  it('гравець не запускає синтез: без бібліотеки audio.server=false, /api/tts — 404 без звернення до провайдера навіть із ключем', async () => {
    const { env } = await getEnv();
    env.GOOGLE_TTS_API_KEY = 'test-key';
    try {
      const calls = mockGoogle();
      const { call } = await login();
      const me = (await call('GET', '/api/me')).body.audio;
      expect(me).toMatchObject({ server: false, base: null, generation: 'admin_only' });
      const r = await call('GET', '/api/tts?text=dzie%C5%84%20dobry');
      expect(r.status).toBe(404);
      expect(r.body.error).toBe('audio_missing');
      expect(calls).toHaveLength(0);
      // Навіть прямий виклик синтезу від імені гравця відмовляє ще до кешу й провайдера.
      await expect(synthesize('dzień dobry', 'normal')).rejects.toMatchObject({ status: 403, code: 'generation_admin_only' });
      await expect(synthesize('dzień dobry', 'normal', { payer: 'user' })).rejects.toMatchObject({ code: 'generation_admin_only' });
      expect(calls).toHaveLength(0);
    } finally {
      delete env.GOOGLE_TTS_API_KEY;
    }
  });

  it('AUDIO_GENERATION_MODE=off: синтез заборонений і адмінці', async () => {
    const { env } = await getEnv();
    env.GOOGLE_TTS_API_KEY = 'test-key';
    env.AUDIO_GENERATION_MODE = 'off';
    try {
      const calls = mockGoogle();
      await expect(synthesize('dzień dobry', 'normal', { payer: 'admin' })).rejects.toMatchObject({ status: 403, code: 'generation_off' });
      expect(calls).toHaveLength(0);
    } finally {
      delete env.GOOGLE_TTS_API_KEY;
      delete env.AUDIO_GENERATION_MODE;
    }
  });

  it('синтез адмінки (порівняння голосів): оригінальний польський текст з діакритикою, голос pl-PL, кеш у D1', async () => {
    const { env } = await getEnv();
    env.GOOGLE_TTS_API_KEY = 'test-key';
    try {
      const calls = mockGoogle();
      const words = ['siedem', 'dziękuję', 'moja', 'są', 'byłem', 'cześć', 'dzień dobry', 'przepraszam', 'proszę', 'dziewięć', 'dziesięć', 'Wrocław'];
      for (const w of words) {
        const res = await synthesize(w, 'normal', { payer: 'admin' });
        expect(res.mime).toBe('audio/mpeg');
        expect(Buffer.from(res.data).toString()).toBe(`MP3:${w}`);
      }
      expect(calls.map((c) => c.text)).toEqual(words);
      expect(calls.every((c) => c.lang === 'pl-PL' && c.voice.startsWith('pl-PL') && c.rate === 1)).toBe(true);

      // Повторний запит — з кешу, без звернення до сервісу.
      expect((await synthesize('dziękuję', 'normal', { payer: 'admin' })).cached).toBe(true);
      expect(calls).toHaveLength(words.length);

      // Сповільнене — окремий синтез зі швидкістю 0.75.
      await synthesize('dziękuję', 'slow', { payer: 'admin' });
      expect(calls.at(-1)).toMatchObject({ text: 'dziękuję', rate: 0.75 });
      expect((await db.select({ n: count() }).from(ttsCache))[0].n).toBe(words.length + 1);

      // Розкладена діакритика (e + огонек) нормалізується до того ж запису кешу.
      expect((await synthesize('dziękuję', 'normal', { payer: 'admin' })).cached).toBe(true);

      // Довільні тексти іншими письмами не синтезуються (захист ключа).
      await expect(synthesize('привет мир', 'normal', { payer: 'admin' })).rejects.toMatchObject({ status: 400 });
    } finally {
      delete env.GOOGLE_TTS_API_KEY;
    }
  });

  it('ElevenLabs: польський текст іде в сервіс без змін, статус показує провайдера і голос', async () => {
    const { env } = await getEnv();
    env.ELEVENLABS_API_KEY = 'el-key';
    env.ELEVENLABS_VOICE_ID = 'voice123';
    const sent: { url: string; text: string; speed: number }[] = [];
    const realFetch = globalThis.fetch;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      if (!String(url).startsWith('https://api.elevenlabs.io/')) return realFetch(url as never, init);
      const b = JSON.parse(String(init?.body));
      sent.push({ url: String(url), text: b.text, speed: b.voice_settings.speed });
      return new Response('ID3fake', { status: 200, headers: { 'content-type': 'audio/mpeg' } });
    });
    try {
      const { call } = await login();
      const st = await call('GET', '/api/tts/status');
      expect(st.body).toMatchObject({ configured: true, provider: 'elevenlabs', voice: 'voice123/eleven_multilingual_v2', voiceId: 'voice123', model: 'eleven_multilingual_v2', warnings: [] });
      // Гравець: ні синтезу, ні запиту до ElevenLabs.
      expect((await call('GET', `/api/tts?text=${encodeURIComponent('Byłem we Wrocławiu.')}`)).status).toBe(404);
      expect(sent).toHaveLength(0);
      await synthesize('Byłem we Wrocławiu.', 'slow', { payer: 'admin' });
      expect(sent[0]).toMatchObject({ text: 'Byłem we Wrocławiu.', speed: 0.8 });
      expect(sent[0].url).toContain('/v1/text-to-speech/voice123');
    } finally {
      delete env.ELEVENLABS_API_KEY;
      delete env.ELEVENLABS_VOICE_ID;
    }
  });

  it('does not cache an empty provider response or leak provider failure details', async () => {
    const { env } = await getEnv();
    env.GOOGLE_TTS_API_KEY = 'test-key';
    try {
      const realFetch = globalThis.fetch;
      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        if (!String(url).startsWith('https://texttospeech.googleapis.com/')) return realFetch(url as never, init);
        return new Response(JSON.stringify({ audioContent: '' }));
      });
      const before = (await db.select({ n: count() }).from(ttsCache))[0].n;
      await expect(synthesize('Test pustego nagrania.', 'normal', { payer: 'admin' })).rejects.toMatchObject({ status: 502, code: 'tts_failed' });
      expect((await db.select({ n: count() }).from(ttsCache))[0].n).toBe(before);
    } finally {
      delete env.GOOGLE_TTS_API_KEY;
    }
  });
});
