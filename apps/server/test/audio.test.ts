import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { count } from 'drizzle-orm';
import { db } from '../src/db';
import { ttsCache } from '../src/db/schema';
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
  it('без ключа — 503 і прапорець audio.server=false (клієнт не підставляє чужий голос)', async () => {
    const { call } = await login();
    expect((await call('GET', '/api/me')).body.audio.server).toBe(false);
    expect((await call('GET', '/api/tts?text=dzie%C5%84%20dobry')).status).toBe(503);
  });

  it('надсилає оригінальний польський текст з діакритикою, голос pl-PL, кешує в D1', async () => {
    const { env } = await getEnv();
    env.GOOGLE_TTS_API_KEY = 'test-key';
    try {
      const calls = mockGoogle();
      const { call, token } = await login();
      expect((await call('GET', '/api/me')).body.audio.server).toBe(true);
      const words = ['siedem', 'dziękuję', 'moja', 'są', 'byłem', 'cześć', 'dzień dobry', 'przepraszam', 'proszę', 'dziewięć', 'dziesięć', 'Wrocław'];
      const { app } = await getEnv();
      for (const w of words) {
        const res = await app.request(`/api/tts?text=${encodeURIComponent(w)}`, { headers: { authorization: `Bearer ${token}` } }, env);
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toBe('audio/mpeg');
        expect(Buffer.from(await res.arrayBuffer()).toString()).toBe(`MP3:${w}`);
      }
      expect(calls.map((c) => c.text)).toEqual(words);
      expect(calls.every((c) => c.lang === 'pl-PL' && c.voice.startsWith('pl-PL') && c.rate === 1)).toBe(true);

      // Повторне прослуховування — з кешу, без звернення до сервісу.
      const again = await app.request(`/api/tts?text=${encodeURIComponent('dziękuję')}`, { headers: { authorization: `Bearer ${token}` } }, env);
      expect(again.headers.get('x-tts-cache')).toBe('hit');
      expect(calls).toHaveLength(words.length);

      // Сповільнене — окремий синтез зі швидкістю 0.75 (не прискорене відтворення на клієнті).
      await app.request(`/api/tts?text=${encodeURIComponent('dziękuję')}&rate=slow`, { headers: { authorization: `Bearer ${token}` } }, env);
      expect(calls.at(-1)).toMatchObject({ text: 'dziękuję', rate: 0.75 });
      expect((await db.select({ n: count() }).from(ttsCache))[0].n).toBe(words.length + 1);

      // Розкладена діакритика (e + огонек) нормалізується до того ж запису кешу.
      const decomposed = await app.request(`/api/tts?text=${encodeURIComponent('dziękuję')}`, { headers: { authorization: `Bearer ${token}` } }, env);
      expect(decomposed.headers.get('x-tts-cache')).toBe('hit');

      // Довільні тексти іншими письмами не синтезуються (захист ключа).
      expect((await call('GET', `/api/tts?text=${encodeURIComponent('привет мир')}`)).status).toBe(400);
      // Без авторизації — ні.
      expect((await app.request('/api/tts?text=kot', {}, env)).status).toBe(401);
    } finally {
      delete env.GOOGLE_TTS_API_KEY;
    }
  });

  it('ElevenLabs: польський текст іде в сервіс без змін, статус показує провайдера і голос', async () => {
    const { env, app } = await getEnv();
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
      const { call, token } = await login();
      const st = await call('GET', '/api/tts/status');
      expect(st.body).toEqual({ configured: true, provider: 'elevenlabs', voice: 'voice123/eleven_multilingual_v2' });
      const res = await app.request(`/api/tts?text=${encodeURIComponent('Byłem we Wrocławiu.')}&rate=slow`, { headers: { authorization: `Bearer ${token}` } }, env);
      expect(res.status).toBe(200);
      expect(sent[0]).toMatchObject({ text: 'Byłem we Wrocławiu.', speed: 0.8 });
      expect(sent[0].url).toContain('/v1/text-to-speech/voice123');
    } finally {
      delete env.ELEVENLABS_API_KEY;
      delete env.ELEVENLABS_VOICE_ID;
    }
  });
  it('does not cache an empty provider response or leak provider failure details', async () => {
    const { env } = await getEnv(); env.GOOGLE_TTS_API_KEY = 'test-key';
    try {
      const realFetch = globalThis.fetch;
      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        if (!String(url).startsWith('https://texttospeech.googleapis.com/')) return realFetch(url as never, init);
        return new Response(JSON.stringify({ audioContent: '' }));
      });
      const { call } = await login();
      const before = (await db.select({ n: count() }).from(ttsCache))[0].n;
      const response = await call('GET', `/api/tts?text=${encodeURIComponent('Test pustego nagrania.')}`);
      expect(response.status).toBe(502);
      expect(response.body.error).toBe('tts_failed');
      expect((await db.select({ n: count() }).from(ttsCache))[0].n).toBe(before);
    } finally { delete env.GOOGLE_TTS_API_KEY; }
  });

});
