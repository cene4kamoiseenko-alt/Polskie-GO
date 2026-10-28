/**
 * Аудіобібліотека ElevenLabs: каталог збігається з контентом і закомічений актуальним, однакова вимова — один файл,
 * у режимі бібліотеки користувач отримує лише готовий MP3 (без синтезу на запит і без файлів іншого голосу),
 * генерація перевіряє R2 і кеш до запиту, тримає бюджет і не дублює паралельні запити. Мережа підмінена.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { audioNorm, exerciseSpeakables } from '@polski-go/shared';
import { db } from '../src/db';
import { audioAssets, audioMisses, ttsCache } from '../src/db/schema';
import { UI_PHRASES, audioId, audioObjectKey, buildAudioCatalog } from '../src/services/audio-catalog';
import { generateBatch, libraryFingerprint, speakForm, verifyUnits } from '../src/services/audio-library';
import { ttsCacheKey } from '../src/services/tts';
import { MISSIONS } from '../src/content/missions';
import { SLANG } from '../src/content/slang';
import { GRAMMAR } from '../src/content/grammar';
import { disposeEnv, getEnv, login, request } from './helpers';

afterAll(disposeEnv);
afterEach(() => vi.restoreAllMocks());

const VOICE = 'KamilVoice0000000001';
const OLD_FEMALE = 'pFZP5JQG7iQjIQuC4Bku';
const KEYS = ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID', 'AUDIO_LIBRARY', 'TTS_PROVIDER'] as const;

async function withEnv(vars: Partial<Record<(typeof KEYS)[number], string>>, fn: (env: Record<string, unknown>) => Promise<void>) {
  const ctx = await getEnv();
  const env = ctx.env as unknown as Record<string, unknown>;
  for (const k of KEYS) delete env[k];
  Object.assign(env, vars);
  try {
    await fn(env);
  } finally {
    for (const k of KEYS) delete env[k];
  }
}

/** Схожий на MP3 вміст (заголовок ID3 і доповнення до розміру справжнього короткого файлу). */
const fakeMp3 = (tag: string) => {
  const b = new Uint8Array(2000);
  b.set([0x49, 0x44, 0x33]);
  b.set(new TextEncoder().encode(tag), 10);
  return b;
};

function mockEleven(opts: { status?: number; body?: Uint8Array | string; cost?: string } = {}) {
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    const u = String(url);
    if (!u.startsWith('https://api.elevenlabs.io/')) throw new Error(`unexpected fetch ${u}`);
    calls.push({ url: u, body: init?.body ? JSON.parse(String(init.body)) : {} });
    if (u.includes('/v1/user/subscription')) return Response.json({ character_count: 1200, character_limit: 30000, next_character_count_reset_unix: 1_800_000_000, tier: 'starter' });
    if (u.endsWith('/v1/models')) {
      return Response.json([
        { model_id: 'eleven_multilingual_v2', name: 'Multilingual v2', languages: [{ language_id: 'pl' }], model_rates: { character_cost_multiplier: 1 } },
        { model_id: 'eleven_flash_v2_5', name: 'Flash v2.5', languages: [{ language_id: 'pl' }], model_rates: { character_cost_multiplier: 0.5 } },
        { model_id: 'eleven_monolingual_v1', name: 'English v1', languages: [{ language_id: 'en' }] },
      ]);
    }
    if (u.endsWith('/v1/voices')) return Response.json({ voices: [{ voice_id: VOICE, name: 'Kamil - Polish narrator', labels: { gender: 'male' }, verified_languages: [{ language: 'pl', model_id: 'eleven_multilingual_v2' }] }, { voice_id: OLD_FEMALE, name: 'Ola', labels: { gender: 'female' } }] });
    if (u.includes('/v1/voices/')) return Response.json({ voice_id: VOICE, name: 'Kamil - Polish narrator', labels: { gender: 'male' }, verified_languages: [{ language: 'pl', model_id: 'eleven_multilingual_v2' }] });
    const body = opts.body ?? fakeMp3(String(calls.length));
    return new Response(body as BodyInit, { status: opts.status ?? 200, headers: { 'content-type': 'audio/mpeg', ...(opts.cost ? { 'character-cost': opts.cost } : {}) } });
  });
  return calls;
}

/** Аудіо-запит без розбору JSON: відповідь — MP3 або JSON помилки. */
async function tts(token: string, text: string, rate = 'normal') {
  const { app, env } = await getEnv();
  const res = await app.request(`/api/tts?text=${encodeURIComponent(text)}&rate=${rate}`, { headers: { authorization: `Bearer ${token}` } }, env);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const json = res.headers.get('content-type')?.includes('json') ? JSON.parse(new TextDecoder().decode(bytes)) : null;
  return { status: res.status, bytes, json, source: res.headers.get('x-tts-source') };
}

const unit = (text: string, model: 'eleven_multilingual_v2' | 'eleven_flash_v2_5' = 'eleven_multilingual_v2') => ({ id: audioId(audioNorm(text)), text, model });

describe('каталог озвучки', () => {
  it('закомічений AUDIO_MANIFEST.json збігається з контентом (інакше: node --import tsx scripts/audio-library.ts catalog)', async () => {
    await getEnv();
    const fresh = await buildAudioCatalog();
    const committed = JSON.parse(readFileSync(new URL('../../../assets/audio/AUDIO_MANIFEST.json', import.meta.url), 'utf8')) as { units: { id: string; text: string }[] };
    const have = new Map(committed.units.map((u) => [u.id, u.text]));
    const missing = fresh.filter((u) => !have.has(u.id)).map((u) => u.text);
    const stale = committed.units.filter((u) => !fresh.some((f) => f.id === u.id)).map((u) => u.text);
    expect(missing, 'нові або змінені тексти поза каталогом').toEqual([]);
    expect(stale, 'тексти, яких у контенті вже немає').toEqual([]);
    for (const u of fresh) {
      expect(u.text, u.id).not.toMatch(/_{2,}|\p{Extended_Pictographic}/u);
      expect(u.chars).toBeLessThanOrEqual(300);
      expect(u.usages.length).toBeGreaterThan(0);
    }
  });

  it('усі джерела в каталозі: словник, уроки, місії, граматика, сленг, паспорт, екрани', async () => {
    const ids = new Set((await buildAudioCatalog()).map((u) => u.id));
    const has = (t: string) => ids.has(audioId(audioNorm(t)));
    for (const m of MISSIONS) for (const s of m.steps) if (s.line) expect(has(s.line.pl), `${m.slug}/${s.id}`).toBe(true);
    for (const s of SLANG) expect(has(s.pl), s.id).toBe(true);
    for (const g of GRAMMAR) for (const e of g.examples) expect(has(e.pl), g.slug).toBe(true);
    for (const p of UI_PHRASES) expect(has(p.text)).toBe(true);
    expect(has('Dzień dobry')).toBe(true);
  });

  it('кнопки прослуховування є лише у відомих файлах клієнта (нова кнопка — доповнити правила audioTexts.ts і каталог)', () => {
    const KNOWN = ['components/ui.tsx', 'exercises/Exercises.tsx', 'screens/Ai.tsx', 'screens/Dictionary.tsx', 'screens/Grammar.tsx', 'screens/Home.tsx', 'screens/Lesson.tsx', 'screens/Mission.tsx', 'screens/Onboarding.tsx', 'screens/Passport.tsx', 'screens/Settings.tsx', 'screens/Slang.tsx', 'screens/Story.tsx'];
    const web = new URL('../../web/src/', import.meta.url);
    const files = (readdirSync(web, { recursive: true }) as string[])
      .filter((f) => /\.tsx?$/.test(f) && f !== 'lib/audio.ts')
      .filter((f) => /SpeakButton|SpeakPill|[^\w.]speak\(/.test(readFileSync(new URL(f, web), 'utf8')))
      .sort();
    expect(files).toEqual(KNOWN);
  });

  it('однакова вимова — одна одиниця; питання й окличне речення — окремі; словоформи не зливаються', () => {
    expect(audioNorm('Tak.')).toBe(audioNorm('tak'));
    expect(audioNorm('„Bursztyn”')).toBe(audioNorm('Bursztyn'));
    expect(audioNorm('Tak?')).not.toBe(audioNorm('Tak'));
    expect(audioNorm('Tak!')).not.toBe(audioNorm('Tak?'));
    expect(audioNorm('kawa')).not.toBe(audioNorm('kawę'));
    expect(audioNorm('Żabka')).toBe('żabka');
  });

  it('правила кнопок: варіанти звучать, «знайди помилку» — ні, однолітерний варіант — у реченні, плитка з прийменником — парою', () => {
    const texts = (type: string, data: Record<string, unknown>) => exerciseSpeakables(type, data).map((s) => `${s.role}:${s.text}`);
    expect(texts('FILL_GAP', { pl: 'Mieszkam ___ Gdańsku.', options: [{ id: 'o0', text: 'w' }, { id: 'o1', text: 'na' }], answer: 'o0' })).toEqual([
      'option:Mieszkam w Gdańsku.', 'option:na', 'feedback:Mieszkam w Gdańsku.',
    ]);
    expect(texts('FIND_ERROR', { pl: 'Ja jest tu', options: [{ id: 'w0', text: 'Ja' }, { id: 'w1', text: 'jest' }], answer: 'w1' })).toEqual([]);
    expect(texts('BUILD_SENTENCE', { tokens: ['Mieszkam', 'w', 'Gdańsku', 'Gdańsk'], answer: ['Mieszkam', 'w', 'Gdańsku'] })).toEqual([
      'token:Mieszkam', 'token:Gdańsku', 'token:Gdańsk', 'combo:w Mieszkam', 'combo:w Gdańsku', 'combo:w Gdańsk', 'feedback:Mieszkam w Gdańsku',
    ]);
    // Діалог: репліки співрозмовника і лише правильна відповідь (неправильна польська не озвучується).
    expect(texts('DIALOGUE', { steps: [{ npc: 'Dzień dobry!', options: [{ id: 's0o0', text: 'Dzień dobry.' }, { id: 's0o1', text: 'Dobry dzień.' }], answer: 's0o0' }] })).toEqual([
      'npc:Dzień dobry!', 'reply:Dzień dobry.',
    ]);
  });
});

describe('видача: режим бібліотеки', () => {
  it('готовий файл голосу бібліотеки — з R2; повільна швидкість — той самий файл; файл іншого голосу не віддається', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, AUDIO_LIBRARY: 'on', ELEVENLABS_API_KEY: 'k' }, async (env) => {
      const bucket = env.AUDIO as R2Bucket;
      const calls = mockEleven();
      const id = audioId(audioNorm('Dzień dobry, poproszę kawę.'));
      await bucket.put(audioObjectKey(id, VOICE), fakeMp3('kamil'));
      const other = audioId(audioNorm('Do widzenia!'));
      await bucket.put(audioObjectKey(other, OLD_FEMALE), fakeMp3('female'));
      const u = await login();
      for (const rate of ['normal', 'slow']) {
        const r = await tts(u.token, 'Dzień dobry, poproszę kawę', rate);
        expect(r.status, rate).toBe(200);
        expect(r.source).toBe('library');
        expect(new TextDecoder().decode(r.bytes.slice(10, 15))).toBe('kamil');
      }
      const miss = await tts(u.token, 'Do widzenia!');
      expect(miss.status).toBe(404);
      expect(JSON.stringify(miss.json)).toContain('audio_missing');
      // Синтез на запит у режимі бібліотеки не викликається ніколи.
      expect(calls).toEqual([]);
      const row = await db.query.audioMisses.findFirst({ where: eq(audioMisses.unitId, other) });
      expect(row?.count).toBe(1);
      const me = await u.call('GET', '/api/me');
      expect(me.body.audio).toMatchObject({ server: true, library: true, fingerprint: libraryFingerprint(VOICE) });
    });
  });

  it('уже оплачений запис голосу бібліотеки в кеші D1 віддається без синтезу', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, AUDIO_LIBRARY: 'on', ELEVENLABS_API_KEY: 'k' }, async () => {
      const calls = mockEleven();
      const text = 'Poproszę bilet do Gdańska.';
      await db.insert(ttsCache).values({ key: ttsCacheKey({ provider: 'elevenlabs', voice: VOICE, model: 'eleven_multilingual_v2' }, 'normal', text), text, voice: `v1|elevenlabs|eleven_multilingual_v2|${VOICE}`, rate: 'normal', mime: 'audio/mpeg', data: Buffer.from(fakeMp3('cache')) });
      const u = await login();
      const r = await tts(u.token, text);
      expect(r.status).toBe(200);
      expect(r.source).toBe('cache');
      expect(calls).toEqual([]);
    });
  });
});

describe('генерація', () => {
  it('R2 → кеш → ElevenLabs; файл із метаданими голосу; повторний запуск не синтезує', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k' }, async (env) => {
      const calls = mockEleven({ cost: '25' });
      const item = unit('Pociąg do Gdańska odjeżdża z peronu trzeciego.');
      const [first] = await generateBatch([item], 100);
      expect(first).toMatchObject({ status: 'generated', credits: 25 });
      expect(calls).toHaveLength(1);
      expect(calls[0].url).toContain(`/v1/text-to-speech/${VOICE}?output_format=mp3_44100_64`);
      expect(calls[0].body).toMatchObject({ model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.55, similarity_boost: 0.8, speed: 1 } });
      expect(calls[0].body.language_code).toBeUndefined();
      const obj = await (env.AUDIO as R2Bucket).head(audioObjectKey(item.id, VOICE));
      expect(obj?.customMetadata).toMatchObject({ voice: VOICE, model: 'eleven_multilingual_v2', source: 'generated' });
      const row = await db.query.audioAssets.findFirst({ where: eq(audioAssets.unitId, item.id) });
      expect(row).toMatchObject({ status: 'ready', credits: 25, voiceId: VOICE });
      const [again] = await generateBatch([item], 100);
      expect(again.status).toBe('exists');
      expect(calls).toHaveLength(1);
    });
  });

  it('Flash отримує language_code=pl; таблички великими літерами читаються словом, абревіатури лишаються', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k' }, async () => {
      const calls = mockEleven();
      await generateBatch([unit('peron', 'eleven_flash_v2_5')], 100);
      expect(calls[0].body).toMatchObject({ model_id: 'eleven_flash_v2_5', language_code: 'pl' });
      expect(speakForm('ODJAZDY. 8:10 Intercity — PKP, PESEL')).toBe('Odjazdy. 8:10 Intercity — PKP, PESEL');
    });
  });

  it('бюджет: текст, що не вміщується, лишається в черзі без запиту', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k' }, async () => {
      const calls = mockEleven();
      const [r] = await generateBatch([unit('Przepraszam, gdzie jest przystanek tramwajowy?')], 10);
      expect(r.status).toBe('budget');
      expect(calls).toEqual([]);
      const row = await db.query.audioAssets.findFirst({ where: eq(audioAssets.unitId, r.id) });
      expect(row?.status).toBe('pending');
    });
  });

  it('паралельні партії з тим самим текстом — один платний запит', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k' }, async () => {
      const calls = mockEleven();
      const item = unit('Ile kosztuje bilet normalny?');
      const [a, b] = await Promise.all([generateBatch([item], 100), generateBatch([item], 100)]);
      expect([a[0].status, b[0].status].sort()).toEqual(['generated', 'locked']);
      expect(calls).toHaveLength(1);
    });
  });

  it('наявний запис цього голосу в кеші D1 переноситься в R2 без кредитів', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k' }, async () => {
      const calls = mockEleven();
      const text = 'Dziękuję bardzo!';
      await db.insert(ttsCache).values({ key: ttsCacheKey({ provider: 'elevenlabs', voice: VOICE, model: 'eleven_flash_v2_5' }, 'normal', text), text, voice: `v1|elevenlabs|eleven_flash_v2_5|${VOICE}`, rate: 'normal', mime: 'audio/mpeg', data: Buffer.from(fakeMp3('old')) });
      const [r] = await generateBatch([unit(text)], 100);
      expect(r).toMatchObject({ status: 'adopted', credits: 0 });
      expect(calls).toEqual([]);
    });
  });

  it('збої: не MP3 — failed bad_audio; 429 — повторюваний; чужий id — відмова', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k' }, async () => {
      mockEleven({ body: 'oops' });
      expect((await generateBatch([unit('Smacznego!')], 100))[0]).toMatchObject({ status: 'failed', error: 'bad_audio' });
      vi.restoreAllMocks();
      mockEleven({ status: 429, body: 'busy' });
      expect((await generateBatch([unit('Na zdrowie!')], 100))[0]).toMatchObject({ status: 'failed', error: 'http_429', retryable: true });
      expect((await generateBatch([{ id: audioId('inny'), text: 'Cześć!', model: 'eleven_flash_v2_5' }], 100))[0]).toMatchObject({ status: 'failed', error: 'id_mismatch' });
    });
  });

  it('перевірка R2: порожній файл, чужий голос у метаданих', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k' }, async (env) => {
      const bucket = env.AUDIO as R2Bucket;
      const empty = audioId(audioNorm('pusty plik'));
      const foreign = audioId(audioNorm('obcy głos'));
      await bucket.put(audioObjectKey(empty, VOICE), new Uint8Array(10));
      await bucket.put(audioObjectKey(foreign, VOICE), fakeMp3('x'), { customMetadata: { voice: OLD_FEMALE } });
      const problems = await verifyUnits([empty, foreign]);
      expect(problems).toEqual([{ id: empty, problem: 'empty' }, { id: foreign, problem: 'wrong_voice' }]);
    });
  });
});

describe('адмінка', () => {
  async function admin() {
    const r = await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' });
    return (method: 'GET' | 'POST', url: string, body?: unknown) => request(method, url, body, { authorization: `Bearer ${r.body.token}` });
  }

  it('акаунт: кредити, моделі з польською та ціна, голос Kamil чоловічий — без синтезу', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k' }, async () => {
      const calls = mockEleven();
      const call = await admin();
      const r = await call('GET', '/api/admin/audio/account');
      expect(r.status).toBe(200);
      expect(r.body.credits).toMatchObject({ used: 1200, limit: 30000, left: 28800 });
      expect(r.body.voice).toMatchObject({ isKamil: true, male: true, polishModels: ['eleven_multilingual_v2'] });
      expect(r.body.kamilVoices.map((v: { id: string }) => v.id)).toEqual([VOICE]);
      expect(r.body.models.filter((m: { polish: boolean }) => m.polish).map((m: { id: string; creditsPerChar: number }) => [m.id, m.creditsPerChar])).toEqual([['eleven_multilingual_v2', 1], ['eleven_flash_v2_5', 0.5]]);
      expect(calls.every((c) => !c.url.includes('/text-to-speech/'))).toBe(true);
    });
  });

  it('генерація через API — лише суперадмін, до 25 текстів; статус повертає готові id', async () => {
    await withEnv({ ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'k' }, async () => {
      mockEleven();
      const call = await admin();
      const item = unit('Gdzie jest dworzec?');
      const g = await call('POST', '/api/admin/audio/generate', { items: [item], maxCredits: 100 });
      expect(g.status).toBe(200);
      expect(g.body.results[0].status).toBe('generated');
      const tooMany = await call('POST', '/api/admin/audio/generate', { items: Array.from({ length: 26 }, () => item), maxCredits: 100 });
      expect(tooMany.status).toBe(400);
      const s = await call('POST', '/api/admin/audio/status', { ids: [item.id, audioId('nie ma')] });
      expect(s.body.ready).toEqual([item.id]);
      const u = await login();
      expect((await u.call('POST', '/api/admin/audio/generate', { items: [item], maxCredits: 1 })).status).toBe(401);
    });
  });
});
