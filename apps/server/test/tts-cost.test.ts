/**
 * Google TTS: захист грошей і ключа, порівняння голосів в адмінці, вимова на справжньому контенті.
 *  • гравці не витрачають символів зовсім: /api/tts лише віддає готові файли бібліотеки (AUDIO_GENERATION_MODE=admin_only),
 *    платний синтез — тільки адмінка, і він іде в облік admin (tts_spend);
 *  • ключ Google не потрапляє в адресу (ні в синтезі, ні в списку голосів);
 *  • жодна фраза контенту не випадає з серверної озвучки (емодзі прибираються);
 *  • /api/admin/tts/sample синтезує лише голоси з офіційного списку і фрази бенчмарку/контенту, облік — admin.
 * Мережа підмінена: жодного справжнього платного запиту.
 */
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { BENCHMARK_PHRASES } from '../src/services/tts-catalog';
import { allContentPhrases, contentPhrases, listPolishVoices, synthesize, ttsTextAllowed } from '../src/services/tts';
import { pronunciationRisks } from '../src/services/tts-pronunciation';
import { ttsSpendSummary } from '../src/services/quota';
import { disposeEnv, getEnv, login, request } from './helpers';

afterAll(disposeEnv);
afterEach(() => vi.restoreAllMocks());

const KEYS = ['GOOGLE_TTS_API_KEY', 'GOOGLE_TTS_VOICE', 'TTS_PROVIDER', 'TTS_GLOBAL_DAILY_CHARS'] as const;
const KEY = 'secret-google-key-123';

/** Підміна Google: запам'ятовує адресу, заголовки й тіло; синтез повертає «MP3:<голос>:<текст>». */
function mockGoogle() {
  const calls: { url: string; headers: Record<string, string>; body: string }[] = [];
  const realFetch = globalThis.fetch;
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    const u = String(url);
    if (!u.startsWith('https://texttospeech.googleapis.com/')) return realFetch(url as never, init);
    const body = String(init?.body ?? '');
    calls.push({ url: u, headers: { ...(init?.headers as Record<string, string>) }, body });
    if (u.includes('/voices')) return new Response(JSON.stringify({ voices: [{ name: 'pl-PL-Chirp3-HD-Kore', ssmlGender: 'FEMALE', languageCodes: ['pl-PL'] }] }));
    const j = JSON.parse(body);
    return new Response(JSON.stringify({ audioContent: Buffer.from(`MP3:${j.voice.name}:${j.input.text}`).toString('base64') }));
  });
  return calls;
}

async function withEnv(vars: Partial<Record<(typeof KEYS)[number], string>>, fn: (ctx: Awaited<ReturnType<typeof getEnv>>) => Promise<void>) {
  const ctx = await getEnv();
  const env = ctx.env as unknown as Record<string, string | undefined>;
  for (const k of KEYS) delete env[k];
  Object.assign(env, vars);
  try {
    await fn(ctx);
  } finally {
    for (const k of KEYS) delete env[k];
  }
}

async function admin() {
  const res = await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' });
  return res.body.token as string;
}

describe('Google TTS: добовий бюджет проєкту', () => {
  it('гравці не витрачають бюджет: /api/tts — 404 без запиту до Google; прогрів адмінки рахується як admin', async () => {
    await withEnv({ GOOGLE_TTS_API_KEY: KEY, GOOGLE_TTS_VOICE: 'pl-PL-Chirp3-HD-Kore', TTS_GLOBAL_DAILY_CHARS: '25' }, async ({ app, env }) => {
      const calls = mockGoogle();
      const a = await login();
      const tts = (token: string, text: string) => app.request(`/api/tts?text=${encodeURIComponent(text)}`, { headers: { authorization: `Bearer ${token}` } }, env);
      for (const text of ['Dzień dobry!', 'Do widzenia', 'Dobranoc']) expect((await tts(a.token, text)).status).toBe(404);
      expect(calls).toHaveLength(0);
      let spend = await ttsSpendSummary();
      expect(spend).toMatchObject({ limit: 25, today: { user: { chars: 0, requests: 0 } } });
      // Прогрів адмінки (без бібліотеки R2): власник підтвердив ціну — облік admin, гравцям символи не списуються.
      const token = await admin();
      const warm = await request('POST', '/api/admin/tts/warm', { offset: 0 }, { authorization: `Bearer ${token}` });
      expect(warm.status).toBe(200);
      expect(warm.body.synthesized).toBeGreaterThan(0);
      spend = await ttsSpendSummary();
      expect(spend.today.user.chars).toBe(0);
      expect(spend.today.admin.chars).toBeGreaterThan(0);
      const st = await request('GET', '/api/admin/tts/status', undefined, { authorization: `Bearer ${token}` });
      expect(st.body.spend).toMatchObject({ limit: 25, today: { user: { chars: 0 } } });
      expect(JSON.stringify(st.body)).not.toContain(KEY);
    });
  });

  it('без TTS_GLOBAL_DAILY_CHARS — 30 000 символів на добу (≈ безкоштовний 1 млн/міс Chirp 3: HD)', async () => {
    await withEnv({ GOOGLE_TTS_API_KEY: KEY }, async () => {
      expect((await ttsSpendSummary()).limit).toBe(30_000);
    });
  });
});

describe('Google TTS: ключ не в адресі', () => {
  it('синтез і список голосів передають ключ заголовком X-Goog-Api-Key', async () => {
    await withEnv({ GOOGLE_TTS_API_KEY: KEY, GOOGLE_TTS_VOICE: 'pl-PL-Chirp3-HD-Kore' }, async () => {
      const calls = mockGoogle();
      await login();
      expect((await synthesize('Klucz w nagłówku.', 'normal', { payer: 'admin' })).data.length).toBeGreaterThan(0);
      const voices = await listPolishVoices('google');
      expect(voices.map((v) => v.id)).toEqual(['pl-PL-Chirp3-HD-Kore']);
      expect(calls).toHaveLength(2);
      for (const c of calls) {
        expect(c.url).not.toContain(KEY);
        expect(c.url).not.toContain('key=');
        expect(c.headers['X-Goog-Api-Key']).toBe(KEY);
      }
    });
  });
});

describe('Вимова на справжньому контенті', () => {
  it('жодна фраза контенту не випадає з серверної озвучки (раніше — дві фрази з емодзі-стрілками)', async () => {
    await getEnv();
    const all = await allContentPhrases();
    expect(all.length).toBeGreaterThan(2000);
    expect(all.filter((p) => !ttsTextAllowed(p))).toEqual([]);
    expect(await contentPhrases()).toEqual(all);
    expect(all).toContain('(Iść prosto i skręcić w lewo)');
  });

  it('ризиковані фрази: час, ціни, лінії, абревіатури, скорочення, числа, окремі літери — з реального контенту', async () => {
    await getEnv();
    const risks = pronunciationRisks(await allContentPhrases(), 5);
    const ids = risks.map((r) => r.id);
    // Лінії метро (M1/M2) були лише в архівному уроці waw-c3-metro (стандарт міста): детектор «code» перевіряє pick нижче.
    expect(ids).toEqual(expect.arrayContaining(['time', 'price', 'number']));
    for (const r of risks) {
      expect(r.items.length).toBeLessThanOrEqual(5);
      expect(r.count).toBeGreaterThanOrEqual(r.items.length);
    }
    const pick = (texts: string[]) => Object.fromEntries(pronunciationRisks(texts).map((r) => [r.id, r.items]));
    expect(pick(['10:30', '4,40 zł', 'złoty', 'linia M2', 'Mam PESEL.', 'ul. Freta', 'na 75 minut', 'W', 'Dzień dobry'])).toEqual({
      time: ['10:30'], price: ['4,40 zł'], code: ['linia M2'], acronym: ['Mam PESEL.'], abbr: ['ul. Freta'], number: ['na 75 minut'], letter: ['W'],
    });
  });
});

describe('Адмінка: порівняння голосів на слух', () => {
  it('compare: голоси лише провайдерів із ключем, фрази бенчмарку, ризиковані фрази; без ключа — порожньо', async () => {
    await withEnv({}, async () => {
      const token = await admin();
      const r = await request('GET', '/api/admin/tts/compare', undefined, { authorization: `Bearer ${token}` });
      expect(r.body.voices).toEqual([]);
    });
    await withEnv({ GOOGLE_TTS_API_KEY: KEY }, async () => {
      const token = await admin();
      const r = await request('GET', '/api/admin/tts/compare', undefined, { authorization: `Bearer ${token}` });
      expect(r.status).toBe(200);
      expect(r.body.voices.length).toBe(35); // 34 з офіційного списку + поточний типовий pl-PL-Wavenet-A (немає в списку)
      expect(r.body.voices.filter((v: { current: boolean }) => v.current).map((v: { voice: string }) => v.voice)).toEqual(['pl-PL-Wavenet-A']);
      expect(r.body.phrases).toHaveLength(BENCHMARK_PHRASES.length);
      expect(r.body.risks.length).toBeGreaterThan(3);
      expect(JSON.stringify(r.body)).not.toContain(KEY);
      expect((await request('GET', '/api/admin/tts/compare')).status).toBe(401);
    });
  });

  it('sample: голос з офіційного списку + фраза бенчмарку → MP3 цим голосом; повтор з кешу; облік admin; довільний текст і чужий голос — 400', async () => {
    await withEnv({ GOOGLE_TTS_API_KEY: KEY, TTS_GLOBAL_DAILY_CHARS: '5' }, async ({ app, env }) => {
      const calls = mockGoogle();
      const token = await admin();
      const sample = (body: unknown) => app.request('/api/admin/tts/sample', { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(body) }, env);
      const text = BENCHMARK_PHRASES.find((p) => p.id === 'r04')!.text;
      const res = await sample({ provider: 'google', voice: 'pl-PL-Chirp3-HD-Charon', text, rate: 'slow' });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('audio/mpeg');
      expect(Buffer.from(await res.arrayBuffer()).toString()).toBe(`MP3:pl-PL-Chirp3-HD-Charon:${text}`);
      expect(JSON.parse(calls[0].body).audioConfig.speakingRate).toBe(0.75);
      const again = await sample({ provider: 'google', voice: 'pl-PL-Chirp3-HD-Charon', text, rate: 'slow' });
      expect(again.headers.get('x-tts-cache')).toBe('hit');
      expect(calls).toHaveLength(1);
      // Бюджет гравців (5 символів) на адмінку не діє, але символи враховано як admin.
      const spend = await ttsSpendSummary();
      expect(spend.today.admin.chars).toBeGreaterThanOrEqual([...text].length);
      // Фраза з контенту теж можна.
      const content = (await contentPhrases()).find((p) => p.includes('zł'))!;
      expect((await sample({ provider: 'google', voice: 'pl-PL-Wavenet-F', text: content })).status).toBe(200);
      const bad = async (body: unknown, code: string) => {
        const r = await sample(body);
        expect(r.status).toBe(400);
        expect(((await r.json()) as { error: string }).error).toBe(code);
      };
      await bad({ provider: 'google', voice: 'pl-PL-Chirp3-HD-Charon', text: 'Dowolny tekst, którego nie ma w kursie.' }, 'text_not_allowed');
      await bad({ provider: 'google', voice: 'en-US-Chirp3-HD-Kore', text }, 'voice_not_allowed');
      await bad({ provider: 'azure', voice: 'pl-PL-MarekNeural', text }, 'provider_not_configured');
      expect(calls).toHaveLength(2);
    });
  });

  it('TTS_PROVIDER=off + ключ: гравці без синтезу, а власник уже порівнює голоси (безпечний перший крок підключення)', async () => {
    await withEnv({ GOOGLE_TTS_API_KEY: KEY, TTS_PROVIDER: 'off' }, async ({ app, env }) => {
      const calls = mockGoogle();
      const { token: user } = await login();
      // Гравець: лише готові файли бібліотеки (тут бібліотеки немає) — 404, синтезу немає.
      expect((await app.request(`/api/tts?text=${encodeURIComponent('Dzień dobry')}`, { headers: { authorization: `Bearer ${user}` } }, env)).status).toBe(404);
      const token = await admin();
      const cmp = await request('GET', '/api/admin/tts/compare', undefined, { authorization: `Bearer ${token}` });
      expect(cmp.body.voices.length).toBe(34);
      const text = BENCHMARK_PHRASES.find((p) => p.id === 'r01')!.text;
      const res = await app.request('/api/admin/tts/sample', { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ provider: 'google', voice: 'pl-PL-Chirp3-HD-Kore', text }) }, env);
      expect(res.status).toBe(200);
      expect(calls).toHaveLength(1);
      // Прогрів усього контенту — лише коли озвучку ввімкнено для гравців.
      expect((await request('POST', '/api/admin/tts/warm', { offset: 0 }, { authorization: `Bearer ${token}` })).status).toBe(400);
    });
  });
});
