/**
 * Вибір провайдера TTS (TTS_PROVIDER), ключ кешу з моделлю й версією, перенос старих записів без синтезу,
 * попередження про голоси поза офіційними списками. Мережа підмінена: жодного справжнього платного запиту.
 */
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { ttsCache } from '../src/db/schema';
import { legacyTtsCacheKey, parseTtsChoice, ttsCacheKey, ttsInputText, ttsSelection, voiceWarnings } from '../src/services/tts';
import { BENCHMARK_PHRASES, CANDIDATES, GOOGLE_PL_VOICES, AZURE_PL_VOICES, benchmarkChars } from '../src/services/tts-catalog';
import { benchmarkPlan, blindLabels, runBenchmark } from '../src/services/tts-benchmark';
import { disposeEnv, getEnv, login, request } from './helpers';

afterAll(disposeEnv);
afterEach(() => vi.restoreAllMocks());

const KEYS = ['GOOGLE_TTS_API_KEY', 'AZURE_SPEECH_KEY', 'AZURE_SPEECH_REGION', 'ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID', 'ELEVENLABS_MODEL', 'TTS_PROVIDER', 'GOOGLE_TTS_VOICE'] as const;

/** Підміна всіх трьох провайдерів: рахує виклики, повертає «MP3:<провайдер>:<текст>». */
function mockProviders() {
  const calls: { provider: string; url: string; body: string }[] = [];
  const realFetch = globalThis.fetch;
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    const u = String(url);
    const provider = u.startsWith('https://texttospeech.googleapis.com/') ? 'google' : u.includes('.tts.speech.microsoft.com/') ? 'azure' : u.startsWith('https://api.elevenlabs.io/') ? 'elevenlabs' : null;
    if (!provider) return realFetch(url as never, init);
    const body = String(init?.body ?? '');
    calls.push({ provider, url: u, body });
    if (provider === 'google') return new Response(JSON.stringify({ audioContent: Buffer.from(`MP3:google:${JSON.parse(body).input.text}`).toString('base64') }));
    return new Response(`MP3:${provider}`, { headers: { 'content-type': 'audio/mpeg' } });
  });
  return calls;
}

async function withEnv(vars: Partial<Record<(typeof KEYS)[number], string>>, fn: (ctx: Awaited<ReturnType<typeof getEnv>>) => Promise<void>) {
  const ctx = await getEnv();
  const env = ctx.env as unknown as Record<string, string | undefined>;
  for (const k of KEYS) delete env[k];
  Object.assign(env, vars);
  try { await fn(ctx); } finally { for (const k of KEYS) delete env[k]; }
}

describe('TTS: вибір провайдера', () => {
  it('auto — перший провайдер із ключем (Google → Azure → ElevenLabs), як до V8.1', () => {
    const s = ttsSelection({ GOOGLE_TTS_API_KEY: 'g', AZURE_SPEECH_KEY: 'a', AZURE_SPEECH_REGION: 'westeurope', ELEVENLABS_API_KEY: 'e' });
    expect(s).toMatchObject({ mode: 'auto', requested: 'auto', configured: ['google', 'azure', 'elevenlabs'], fallbackReason: null });
    expect(s.provider?.provider).toBe('google');
  });

  it('явний TTS_PROVIDER перемикає провайдера; без ключа — auto з причиною', () => {
    const env = { GOOGLE_TTS_API_KEY: 'g', AZURE_SPEECH_KEY: 'a', AZURE_SPEECH_REGION: 'westeurope' };
    expect(ttsSelection({ ...env, TTS_PROVIDER: 'azure' })).toMatchObject({ mode: 'explicit', provider: { provider: 'azure', voice: 'pl-PL-ZofiaNeural', model: 'neural' } });
    expect(ttsSelection({ ...env, TTS_PROVIDER: ' Azure ' }).provider?.provider).toBe('azure');
    expect(ttsSelection({ ...env, TTS_PROVIDER: 'elevenlabs' })).toMatchObject({ mode: 'auto', fallbackReason: 'requested_provider_not_configured', provider: { provider: 'google' } });
    expect(ttsSelection({ ...env, TTS_PROVIDER: 'polly' })).toMatchObject({ mode: 'auto', fallbackReason: 'invalid_tts_provider' });
    expect(ttsSelection({ ...env, TTS_PROVIDER: 'off' })).toMatchObject({ mode: 'off', provider: null, fallbackReason: 'disabled' });
    expect(ttsSelection({})).toMatchObject({ provider: null, fallbackReason: 'no_provider_configured' });
    expect(parseTtsChoice(undefined)).toEqual({ choice: 'auto', valid: true });
  });

  it('Azure без коректного регіону не вважається підключеним (регіон іде в адресу запиту)', () => {
    expect(ttsSelection({ AZURE_SPEECH_KEY: 'a', AZURE_SPEECH_REGION: 'evil.example.com/x' }).provider).toBeNull();
  });

  it('off: ключі є, але /api/tts не звертається до провайдера і клієнт знає, що серверного голосу немає', async () => {
    await withEnv({ GOOGLE_TTS_API_KEY: 'g', TTS_PROVIDER: 'off' }, async () => {
      const calls = mockProviders();
      const { call } = await login();
      expect((await call('GET', '/api/me')).body.audio.server).toBe(false);
      expect((await call('GET', '/api/tts?text=kot')).status).toBe(503);
      expect(calls).toHaveLength(0);
    });
  });

  it('явний azure: запит іде в Azure з голосом pl-PL і SSML xml:lang="pl-PL"', async () => {
    await withEnv({ GOOGLE_TTS_API_KEY: 'g', AZURE_SPEECH_KEY: 'a', AZURE_SPEECH_REGION: 'westeurope', TTS_PROVIDER: 'azure' }, async ({ app, env }) => {
      const calls = mockProviders();
      const { token } = await login();
      const res = await app.request(`/api/tts?text=${encodeURIComponent('W Żabce')}`, { headers: { authorization: `Bearer ${token}` } }, env);
      expect(res.status).toBe(200);
      expect(calls.map((c) => c.provider)).toEqual(['azure']);
      expect(calls[0].url).toBe('https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1');
      expect(calls[0].body).toContain('xml:lang="pl-PL"');
      expect(calls[0].body).toContain('<voice name="pl-PL-ZofiaNeural">');
      expect(calls[0].body).toContain('W Żabce');
    });
  });

  it('статус показує провайдера, модель, попередження і не містить ключів', async () => {
    await withEnv({ GOOGLE_TTS_API_KEY: 'secret-google-key' }, async () => {
      const { call } = await login();
      const st = (await call('GET', '/api/tts/status')).body;
      expect(st).toMatchObject({ configured: true, provider: 'google', voice: 'pl-PL-Wavenet-A', model: 'wavenet', selection: 'auto', warnings: ['voice_not_in_official_list'] });
      expect(JSON.stringify(st)).not.toContain('secret-google-key');
    });
  });
});

describe('TTS: кеш', () => {
  it('ключ кешу містить провайдера, модель, голос, швидкість, текст і версію', () => {
    const a = { provider: 'elevenlabs' as const, voice: 'v1', model: 'eleven_multilingual_v2' };
    const base = ttsCacheKey(a, 'normal', 'kot');
    expect(ttsCacheKey({ ...a, model: 'eleven_flash_v2_5' }, 'normal', 'kot')).not.toBe(base);
    expect(ttsCacheKey({ ...a, voice: 'v2' }, 'normal', 'kot')).not.toBe(base);
    expect(ttsCacheKey(a, 'slow', 'kot')).not.toBe(base);
    expect(ttsCacheKey(a, 'normal', 'kot', '2')).not.toBe(base);
    expect(ttsCacheKey({ ...a, provider: 'azure' }, 'normal', 'kot')).not.toBe(base);
  });

  it('інша модель ElevenLabs — окремий синтез, та сама — з кешу', async () => {
    await withEnv({ ELEVENLABS_API_KEY: 'e', ELEVENLABS_VOICE_ID: 'plvoice' }, async ({ app, env }) => {
      const calls = mockProviders();
      const { token } = await login();
      const get = () => app.request(`/api/tts?text=${encodeURIComponent('Dzień dobry, modelu.')}`, { headers: { authorization: `Bearer ${token}` } }, env);
      expect((await get()).headers.get('x-tts-cache')).toBe('miss');
      expect((await get()).headers.get('x-tts-cache')).toBe('hit');
      (env as unknown as Record<string, string>).ELEVENLABS_MODEL = 'eleven_flash_v2_5';
      expect((await get()).headers.get('x-tts-cache')).toBe('miss');
      expect(calls).toHaveLength(2);
      expect(JSON.parse(calls[1].body).model_id).toBe('eleven_flash_v2_5');
    });
  });

  it('запис зі старим ключем (до моделі в ключі) віддається без нового синтезу і переноситься на новий ключ', async () => {
    await withEnv({ GOOGLE_TTS_API_KEY: 'g' }, async ({ app, env }) => {
      const calls = mockProviders();
      const text = 'Stary klucz pamięci.';
      const old = legacyTtsCacheKey('google', 'pl-PL-Wavenet-A', 'normal', text);
      await db.insert(ttsCache).values({ key: old, text, voice: 'google:pl-PL-Wavenet-A', rate: 'normal', mime: 'audio/mpeg', data: Buffer.from('OLD-MP3') });
      const { token } = await login();
      const res = await app.request(`/api/tts?text=${encodeURIComponent(text)}`, { headers: { authorization: `Bearer ${token}` } }, env);
      expect(res.headers.get('x-tts-cache')).toBe('hit');
      expect(Buffer.from(await res.arrayBuffer()).toString()).toBe('OLD-MP3');
      expect(calls).toHaveLength(0);
      const fresh = ttsCacheKey({ provider: 'google', voice: 'pl-PL-Wavenet-A', model: 'wavenet' }, 'normal', text);
      expect(await db.query.ttsCache.findFirst({ where: eq(ttsCache.key, old) })).toBeUndefined();
      expect((await db.query.ttsCache.findFirst({ where: eq(ttsCache.key, fresh) }))?.voice).toBe('v1|google|wavenet|pl-PL-Wavenet-A');
    });
  });

  it('окрема літера озвучується назвою («W» → «wu»), фрази з прийменником — без змін', () => {
    expect(ttsInputText('W')).toBe('wu');
    expect(ttsInputText('ż')).toBe('żet');
    expect(ttsInputText('W Warszawie')).toBe('W Warszawie');
    expect(ttsInputText('w domu')).toBe('w domu');
  });
});

describe('TTS: голоси й бенчмарк', () => {
  it('офіційні списки: Google pl-PL без Wavenet-A, Azure — три голоси', () => {
    expect(GOOGLE_PL_VOICES).toHaveLength(34);
    expect(GOOGLE_PL_VOICES.some((v) => v.name === 'pl-PL-Wavenet-A')).toBe(false);
    expect(AZURE_PL_VOICES.map((v) => v.name).sort()).toEqual(['pl-PL-AgnieszkaNeural', 'pl-PL-MarekNeural', 'pl-PL-ZofiaNeural']);
  });

  it('попередження: голос поза списком, англійський premade, модель без польської', () => {
    expect(voiceWarnings({ provider: 'google', voice: 'pl-PL-Wavenet-A', model: 'wavenet' })).toEqual(['voice_not_in_official_list']);
    expect(voiceWarnings({ provider: 'google', voice: 'pl-PL-Chirp3-HD-Kore', model: 'chirp3-hd' })).toEqual([]);
    expect(voiceWarnings({ provider: 'google', voice: 'en-US-Wavenet-A', model: 'wavenet' })).toEqual(['voice_not_polish']);
    expect(voiceWarnings({ provider: 'azure', voice: 'pl-PL-MarekNeural', model: 'neural' })).toEqual([]);
    expect(voiceWarnings({ provider: 'elevenlabs', voice: '21m00Tcm4TlvDq8ikWAM', model: 'eleven_multilingual_v2' })).toEqual(['premade_english_voice']);
    expect(voiceWarnings({ provider: 'elevenlabs', voice: 'x', model: 'eleven_monolingual_v1' })).toEqual(['model_without_polish']);
  });

  it('кандидати Google і Azure — з офіційних списків (крім позначеного «current» Wavenet-A)', () => {
    for (const c of CANDIDATES) {
      if (c.provider === 'google' && c.role !== 'current') expect(GOOGLE_PL_VOICES.some((v) => v.name === c.voice), c.id).toBe(true);
      if (c.provider === 'azure') expect(AZURE_PL_VOICES.some((v) => v.name === c.voice), c.id).toBe(true);
    }
  });

  it('набір бенчмарку: 30+ фраз, унікальні id і тексти, усі обов\'язкові із завдання', () => {
    expect(BENCHMARK_PHRASES.length).toBeGreaterThanOrEqual(30);
    expect(new Set(BENCHMARK_PHRASES.map((p) => p.id)).size).toBe(BENCHMARK_PHRASES.length);
    expect(new Set(BENCHMARK_PHRASES.map((p) => p.text)).size).toBe(BENCHMARK_PHRASES.length);
    for (const t of ['W Warszawie', 'W Żabce', 'łódź', 'szczęście', 'Jadę tramwajem.', 'Biuro jest na trzecim piętrze.']) expect(BENCHMARK_PHRASES.some((p) => p.text === t), t).toBe(true);
    const { phrases, samples, chars } = benchmarkChars();
    expect(phrases).toBe(BENCHMARK_PHRASES.length);
    expect(samples).toBeGreaterThan(phrases);
    expect(chars).toBeLessThan(5_000);
  });

  it('план (dry-run): прев\'ю запитів без ключів, попередження й ціна одного прогону; без мережі', () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    const plan = benchmarkPlan({ region: 'polandcentral' });
    expect(spy).not.toHaveBeenCalled();
    expect(plan.candidates).toHaveLength(CANDIDATES.length);
    expect(JSON.stringify(plan)).not.toContain('dry-run');
    const by = (id: string) => plan.candidates.find((c) => c.id === id)!;
    expect(by('g-chirp-kore').sample?.url).toBe('https://texttospeech.googleapis.com/v1/text:synthesize?key=<GOOGLE_TTS_API_KEY>');
    expect(by('az-marek').sample?.url).toBe('https://polandcentral.tts.speech.microsoft.com/cognitiveservices/v1');
    expect(by('az-marek').sample?.headers['Ocp-Apim-Subscription-Key']).toBe('<AZURE_SPEECH_KEY>');
    expect(by('g-wavenet-a').warnings).toEqual(['voice_not_in_official_list']);
    expect(by('el-rachel').warnings).toEqual(['premade_english_voice']);
    expect(by('el-pl-1')).toMatchObject({ ready: false, sample: null });
    // Chirp 3: HD — у межах безкоштовного мільйона 0 $, без нього — символи × $30 / 1 млн.
    expect(by('g-chirp-kore').usd).toEqual({ freeTierLeft: 0, freeTierUsed: Math.round(plan.totals.chars * 30 / 1e4) / 100 });
    expect(benchmarkPlan({ voices: { 'el-pl-1': 'plVoiceId' } }).candidates.find((c) => c.id === 'el-pl-1')).toMatchObject({ ready: true, voice: 'plVoiceId', warnings: [] });
  });

  it('сліпі мітки: перестановка A…, та сама при тому самому seed, інша при іншому', () => {
    const ids = CANDIDATES.map((c) => c.id);
    const a = blindLabels(ids, 2026);
    expect(Object.keys(a).sort()).toEqual([...ids].sort());
    expect(new Set(Object.values(a)).size).toBe(ids.length);
    expect(blindLabels(ids, 2026)).toEqual(a);
    expect(blindLabels(ids, 7)).not.toEqual(a);
  });

  it('прогін: лише кандидати з ключем і голосом, кожна фраза на своїх швидкостях, помилки не зупиняють прогін', async () => {
    const calls = mockProviders();
    const phrases = BENCHMARK_PHRASES.filter((p) => ['r01', 'l01'].includes(p.id));
    const written: string[] = [];
    const res = await runBenchmark({
      env: { GOOGLE_TTS_API_KEY: 'g' },
      only: ['g-chirp-kore', 'g-wavenet-f', 'az-zofia', 'el-pl-1'],
      phrases,
      write: (c, p, rate, audio) => { written.push(`${c.id}/${p.id}/${rate}:${Buffer.from(audio).toString()}`); },
    });
    // r01 — дві швидкості, l01 — лише normal: 3 запити на голос, 2 голоси Google.
    expect(calls).toHaveLength(6);
    expect(res).toMatchObject({ made: 6, failed: [], skipped: [{ candidate: 'az-zofia', reason: 'not_configured' }, { candidate: 'el-pl-1', reason: 'no_voice' }] });
    expect(written).toContain('g-chirp-kore/l01/normal:MP3:google:wu');
    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('quota', { status: 429 }));
    const bad = await runBenchmark({ env: { GOOGLE_TTS_API_KEY: 'g' }, only: ['g-chirp-kore'], phrases, write: () => {} });
    expect(bad.made).toBe(0);
    expect(bad.failed).toHaveLength(3);
    expect(bad.failed[0]).toMatchObject({ candidate: 'g-chirp-kore', phrase: 'r01', reason: 'http_429' });
  });
});

describe('TTS: адмінка', () => {
  async function admin() {
    const res = await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' });
    const token = res.body.token as string;
    return (method: 'GET' | 'POST', url: string, payload?: unknown) => request(method, `/api/admin${url}`, payload, { authorization: `Bearer ${token}` });
  }

  it('статус: провайдер, кеш і оцінка прогріву без синтезу й без ключа; план без ключів', async () => {
    await withEnv({ GOOGLE_TTS_API_KEY: 'secret-google-key', GOOGLE_TTS_VOICE: 'pl-PL-Chirp3-HD-Kore' }, async () => {
      const calls = mockProviders();
      const call = await admin();
      const st = await call('GET', '/tts/status');
      expect(st.status).toBe(200);
      expect(st.body).toMatchObject({ provider: 'google', voiceId: 'pl-PL-Chirp3-HD-Kore', model: 'chirp3-hd', warnings: [], runtime: { scope: 'isolate' } });
      expect(st.body.warm.phrases).toBeGreaterThan(100);
      expect(st.body.warm.chars).toBeGreaterThan(st.body.warm.phrases);
      expect(st.body.warm.price.usdPerMillion).toBe(30);
      const plan = await call('GET', '/tts/benchmark');
      expect(plan.body.candidates).toHaveLength(CANDIDATES.length);
      expect(calls).toHaveLength(0);
      expect(JSON.stringify([st.body, plan.body])).not.toContain('secret-google-key');
      expect((await request('GET', '/api/admin/tts/status')).status).toBe(401);
    });
  });

  it('перенос старих ключів кешу частинами без синтезу', async () => {
    await withEnv({ GOOGLE_TTS_API_KEY: 'g' }, async () => {
      const calls = mockProviders();
      const text = 'Przenosimy klucz.';
      const old = legacyTtsCacheKey('google', 'pl-PL-Wavenet-F', 'slow', text);
      await db.insert(ttsCache).values({ key: old, text, voice: 'google:pl-PL-Wavenet-F', rate: 'slow', mime: 'audio/mpeg', data: Buffer.from('OLD') });
      const call = await admin();
      let cursor: string | null = null;
      let migrated = 0;
      for (let i = 0; i < 50; i++) {
        const r = await call('POST', '/tts/migrate-cache', { cursor });
        expect(r.status).toBe(200);
        migrated += r.body.migrated;
        cursor = r.body.next;
        if (r.body.done) break;
      }
      expect(migrated).toBeGreaterThanOrEqual(1);
      const fresh = ttsCacheKey({ provider: 'google', voice: 'pl-PL-Wavenet-F', model: 'wavenet' }, 'slow', text);
      expect((await db.query.ttsCache.findFirst({ where: eq(ttsCache.key, fresh) }))?.voice).toBe('v1|google|wavenet|pl-PL-Wavenet-F');
      expect(calls).toHaveLength(0);
    });
  });
});
