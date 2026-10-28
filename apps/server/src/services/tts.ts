/**
 * Серверний синтез польського мовлення (pl-PL) з кешем у D1.
 * Провайдери: Google Cloud Text-to-Speech, Azure Speech, ElevenLabs. Вибір — змінна TTS_PROVIDER:
 *  - auto (типово): перший провайдер із ключем у порядку Google → Azure → ElevenLabs. Це поведінка до V8.1:
 *    наявні ключі не змінюють голос і не скидають кеш (новий голос = новий платний синтез усіх фраз);
 *  - google | azure | elevenlabs: явний вибір; якщо ключа цього провайдера немає — auto, причина видна в діагностиці;
 *  - off: серверну озвучку вимкнено (аварійний вимикач витрат), клієнт говорить польським голосом пристрою.
 * Ключі зберігаються лише в секретах Worker; клієнт отримує готовий MP3, діагностика ключів не показує.
 */
import { createHash } from 'node:crypto';
import { and, asc, count, eq, gt, sql } from 'drizzle-orm';
import { SPEECH_RATES, isLoneLetter, speechText, type SpeechRate } from '@polski-go/shared';
import { db, readBatch } from '../db';
import { ttsCache } from '../db/schema';
import { getBindings, type Bindings } from '../env';
import { HttpError } from '../lib/errors';
import { reserveTtsChars } from './quota';
import { AZURE_PL_VOICES, ELEVENLABS_PL_MODELS, ELEVENLABS_PREMADE_ENGLISH, GOOGLE_PL_VOICES } from './tts-catalog';

export const TTS_PROVIDER_IDS = ['google', 'azure', 'elevenlabs'] as const;
export type TtsProviderId = (typeof TTS_PROVIDER_IDS)[number];
export type TtsChoice = TtsProviderId | 'auto' | 'off';

/**
 * Версія конвеєра синтезу: нормалізація тексту, тіло запиту, формат аудіо. Входить у ключ кешу.
 * Підвищувати лише разом зі зміною запиту — і пам'ятати, що це новий платний синтез усіх фраз.
 * Версія 1 — запити, як до V8.1, тому записи зі старим ключем (без моделі й версії) переносяться без синтезу.
 */
export const TTS_PIPELINE_VERSION = '1';
const LEGACY_COMPATIBLE_VERSION = '1';

/** Типові голоси, як до V8.1. Google pl-PL-Wavenet-A немає в офіційному списку від 2026-10-22 — див. voiceWarnings. */
export const DEFAULT_VOICES: Record<TtsProviderId, string> = { google: 'pl-PL-Wavenet-A', azure: 'pl-PL-ZofiaNeural', elevenlabs: '21m00Tcm4TlvDq8ikWAM' };
export const DEFAULT_ELEVENLABS_MODEL = 'eleven_multilingual_v2';

export type TtsVoiceSpec = { provider: TtsProviderId; voice: string; model: string };
export type RequestPreview = { method: 'POST'; url: string; headers: Record<string, string>; body: string };

export type TtsProvider = TtsVoiceSpec & {
  /** Голос у форматі старого ключа кешу (до моделі й версії в ключі): ElevenLabs — «id/model». */
  legacyVoice: string;
  /** Справжній запит із ключем: не логувати і не повертати клієнту. */
  request(text: string, rate: SpeechRate): { url: string; init: RequestInit };
  /** Той самий запит без секретів — для dry-run і діагностики. */
  preview(text: string, rate: SpeechRate): RequestPreview;
  parse(res: Response): Promise<ArrayBuffer>;
};

type Env = Partial<Bindings>;

/** Помилка провайдера з короткою причиною для діагностики (без тексту відповіді провайдера). */
export class TtsProviderError extends HttpError {
  constructor(public reason: string) {
    super(502, 'tts_failed');
  }
}

/** Модель Google визначається назвою голосу: pl-PL-Chirp3-HD-Kore → chirp3-hd, pl-PL-Wavenet-F → wavenet. */
export function googleModel(voice: string): string {
  const m = /^[a-z]{2,3}-[A-Z]{2}-(Chirp3-HD|Chirp-HD|Neural2|Wavenet|Standard|Studio|Polyglot|News)-/i.exec(voice);
  return m ? m[1].toLowerCase() : 'unknown';
}
export const azureModel = (voice: string) => (/DragonHD/i.test(voice) ? 'neural-hd' : 'neural');

const AZURE_REGION = /^[a-z0-9]{2,40}$/;

function hasCredentials(id: TtsProviderId, env: Env): boolean {
  if (id === 'google') return !!env.GOOGLE_TTS_API_KEY;
  if (id === 'azure') return !!env.AZURE_SPEECH_KEY && AZURE_REGION.test(env.AZURE_SPEECH_REGION ?? '');
  return !!env.ELEVENLABS_API_KEY;
}

/** Провайдери, для яких задано ключі (самі ключі не повертаються). */
export function configuredProviders(env: Env = getBindings()): TtsProviderId[] {
  return TTS_PROVIDER_IDS.filter((id) => hasCredentials(id, env));
}

function googleProvider(voice: string, key: string): TtsProvider {
  // Ключ — в заголовке, не в адресе: адреса попадают в журналы прокси и сообщения об ошибках.
  const url = 'https://texttospeech.googleapis.com/v1/text:synthesize';
  const headers = (k: string) => ({ 'content-type': 'application/json', 'X-Goog-Api-Key': k });
  const body = (text: string, rate: SpeechRate) =>
    JSON.stringify({ input: { text }, voice: { languageCode: 'pl-PL', name: voice }, audioConfig: { audioEncoding: 'MP3', speakingRate: SPEECH_RATES[rate] } });
  return {
    provider: 'google', voice, model: googleModel(voice), legacyVoice: voice,
    request: (text, rate) => ({ url, init: { method: 'POST', headers: headers(key), body: body(text, rate) } }),
    preview: (text, rate) => ({ method: 'POST', url, headers: headers('<GOOGLE_TTS_API_KEY>'), body: body(text, rate) }),
    parse: async (res) => {
      const { audioContent } = (await res.json()) as { audioContent?: string };
      if (typeof audioContent !== 'string' || !audioContent.length) throw new TtsProviderError('empty_audio');
      return Uint8Array.from(Buffer.from(audioContent, 'base64')).buffer;
    },
  };
}

function azureProvider(voice: string, key: string, region: string): TtsProvider {
  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const headers = (k: string) => ({ 'Ocp-Apim-Subscription-Key': k, 'content-type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'user-agent': 'polski-go' });
  const ssml = (text: string, rate: SpeechRate) => {
    const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const pct = Math.round((SPEECH_RATES[rate] - 1) * 100);
    return `<speak version="1.0" xml:lang="pl-PL"><voice name="${voice}"><prosody rate="${pct}%">${esc}</prosody></voice></speak>`;
  };
  return {
    provider: 'azure', voice, model: azureModel(voice), legacyVoice: voice,
    request: (text, rate) => ({ url, init: { method: 'POST', headers: headers(key), body: ssml(text, rate) } }),
    preview: (text, rate) => ({ method: 'POST', url, headers: headers('<AZURE_SPEECH_KEY>'), body: ssml(text, rate) }),
    parse: (res) => res.arrayBuffer(),
  };
}

function elevenLabsProvider(voice: string, model: string, key: string): TtsProvider {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_64`;
  const headers = (k: string) => ({ 'xi-api-key': k, 'content-type': 'application/json', accept: 'audio/mpeg' });
  const body = (text: string, rate: SpeechRate) =>
    JSON.stringify({ text, model_id: model, voice_settings: { stability: 0.55, similarity_boost: 0.8, speed: rate === 'slow' ? 0.8 : 1 } });
  return {
    provider: 'elevenlabs', voice, model, legacyVoice: `${voice}/${model}`,
    request: (text, rate) => ({ url, init: { method: 'POST', headers: headers(key), body: body(text, rate) } }),
    preview: (text, rate) => ({ method: 'POST', url, headers: headers('<ELEVENLABS_API_KEY>'), body: body(text, rate) }),
    parse: (res) => res.arrayBuffer(),
  };
}

/** Голос і модель провайдера з оточення (або типові). */
export function envVoice(id: TtsProviderId, env: Env = getBindings()): { voice: string; model: string } {
  if (id === 'google') {
    const voice = env.GOOGLE_TTS_VOICE || DEFAULT_VOICES.google;
    return { voice, model: googleModel(voice) };
  }
  if (id === 'azure') {
    const voice = env.AZURE_SPEECH_VOICE || DEFAULT_VOICES.azure;
    return { voice, model: azureModel(voice) };
  }
  return { voice: env.ELEVENLABS_VOICE_ID || DEFAULT_VOICES.elevenlabs, model: env.ELEVENLABS_MODEL || DEFAULT_ELEVENLABS_MODEL };
}

/** Провайдер із заданим голосом (сліпий тест, services/tts-benchmark.ts) або з голосом з оточення. Без ключа — null. */
export function buildProvider(spec: { provider: TtsProviderId; voice?: string; model?: string }, env: Env = getBindings()): TtsProvider | null {
  if (!hasCredentials(spec.provider, env)) return null;
  const fromEnv = envVoice(spec.provider, env);
  const voice = spec.voice || fromEnv.voice;
  if (spec.provider === 'google') return googleProvider(voice, env.GOOGLE_TTS_API_KEY!);
  if (spec.provider === 'azure') return azureProvider(voice, env.AZURE_SPEECH_KEY!, env.AZURE_SPEECH_REGION!);
  return elevenLabsProvider(voice, spec.model || fromEnv.model, env.ELEVENLABS_API_KEY!);
}

export type TtsFallbackReason = 'invalid_tts_provider' | 'requested_provider_not_configured' | 'no_provider_configured' | 'disabled';
export type TtsSelection = {
  requested: TtsChoice;
  mode: 'auto' | 'explicit' | 'off';
  configured: TtsProviderId[];
  provider: TtsProvider | null;
  fallbackReason: TtsFallbackReason | null;
};

export function parseTtsChoice(raw: unknown): { choice: TtsChoice; valid: boolean } {
  const v = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (!v) return { choice: 'auto', valid: true };
  if (v === 'auto' || v === 'off' || (TTS_PROVIDER_IDS as readonly string[]).includes(v)) return { choice: v as TtsChoice, valid: true };
  return { choice: 'auto', valid: false };
}

/** Який провайдер реально обслуговує /api/tts і чому. */
export function ttsSelection(env: Env = getBindings()): TtsSelection {
  const { choice, valid } = parseTtsChoice(env.TTS_PROVIDER);
  const configured = configuredProviders(env);
  if (choice === 'off') return { requested: 'off', mode: 'off', configured, provider: null, fallbackReason: 'disabled' };
  if (choice !== 'auto' && configured.includes(choice)) {
    return { requested: choice, mode: 'explicit', configured, provider: buildProvider({ provider: choice }, env), fallbackReason: null };
  }
  const first = configured[0];
  const fallbackReason: TtsFallbackReason | null = !valid ? 'invalid_tts_provider' : choice !== 'auto' ? 'requested_provider_not_configured' : first ? null : 'no_provider_configured';
  return { requested: choice, mode: 'auto', configured, provider: first ? buildProvider({ provider: first }, env) : null, fallbackReason };
}

export const ttsProvider = (): TtsProvider | null => ttsSelection().provider;
export const ttsConfigured = () => !!ttsProvider();

export type TtsWarning = 'voice_not_in_official_list' | 'voice_not_polish' | 'premade_english_voice' | 'model_without_polish';

/** Попередження про голос: не з офіційного списку, не польський, англійський premade, модель без польської. */
export function voiceWarnings(spec: TtsVoiceSpec): TtsWarning[] {
  const out: TtsWarning[] = [];
  const polish = /^pl-PL-/i.test(spec.voice);
  if (spec.provider === 'google') {
    if (!polish) out.push('voice_not_polish');
    else if (!GOOGLE_PL_VOICES.some((v) => v.name === spec.voice)) out.push('voice_not_in_official_list');
  } else if (spec.provider === 'azure') {
    if (!polish && !/Multilingual/i.test(spec.voice)) out.push('voice_not_polish');
    else if (polish && !AZURE_PL_VOICES.some((v) => v.name === spec.voice)) out.push('voice_not_in_official_list');
  } else {
    if (ELEVENLABS_PREMADE_ENGLISH.includes(spec.voice)) out.push('premade_english_voice');
    if (!(ELEVENLABS_PL_MODELS as readonly string[]).includes(spec.model)) out.push('model_without_polish');
  }
  return out;
}

// ── Діагностика роботи (в межах ізоляту Worker: ізолятів багато, лічильники приблизні) ──
export type TtsOutcome = 'hit' | 'legacy_hit' | 'miss' | 'error';
export type TtsEvent = { at: string; provider: TtsProviderId; voice: string; model: string; rate: SpeechRate; outcome: TtsOutcome; chars: number; reason?: string; ms?: number };

const runtime = { since: new Date().toISOString(), hits: 0, legacyHits: 0, misses: 0, errors: 0, recent: [] as TtsEvent[], lastError: null as TtsEvent | null, lastOkAt: null as string | null };

function track(e: Omit<TtsEvent, 'at'>) {
  const ev: TtsEvent = { at: new Date().toISOString(), ...e };
  if (e.outcome === 'hit') runtime.hits++;
  else if (e.outcome === 'legacy_hit') runtime.legacyHits++;
  else if (e.outcome === 'miss') runtime.misses++;
  else runtime.errors++;
  if (e.outcome === 'error') runtime.lastError = ev;
  else runtime.lastOkAt = ev.at;
  runtime.recent.unshift(ev);
  runtime.recent.length = Math.min(runtime.recent.length, 20);
}

/** Лічильники й останні події цього ізоляту — для адмінки. Тексти фраз не зберігаються. */
export function ttsRuntime() {
  return { scope: 'isolate' as const, ...runtime, recent: [...runtime.recent] };
}
export function resetTtsRuntime() {
  Object.assign(runtime, { since: new Date().toISOString(), hits: 0, legacyHits: 0, misses: 0, errors: 0, recent: [], lastError: null, lastOkAt: null });
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

/** Короткий відбиток голосу: клієнт може додати його до ключа свого кешу, щоб після зміни голосу не грати старі записи. */
export const ttsFingerprint = (spec: TtsVoiceSpec, version = TTS_PIPELINE_VERSION) => sha256(`${spec.provider}|${spec.model}|${spec.voice}|${version}`).slice(0, 12);

/** Що реально підключено (без ключів) — для діагностики в налаштуваннях і адмінці. */
export function ttsStatus() {
  const s = ttsSelection();
  const p = s.provider;
  const last = runtime.lastError;
  return {
    configured: !!p,
    provider: p?.provider ?? null,
    /** Як і раніше: назва голосу; для ElevenLabs — «id/model». */
    voice: p?.legacyVoice ?? null,
    voiceId: p?.voice ?? null,
    model: p?.model ?? null,
    /** auto — перший провайдер із ключем; explicit — TTS_PROVIDER; off — вимкнено. */
    selection: s.mode,
    requested: s.requested,
    fallbackReason: s.fallbackReason,
    warnings: p ? voiceWarnings(p) : [],
    cacheVersion: TTS_PIPELINE_VERSION,
    fingerprint: p ? ttsFingerprint(p) : null,
    /** Порядок джерел у клієнті: запис → серверний синтез → польський голос пристрою. */
    chain: p ? ['recording', 'server', 'device'] : ['recording', 'device'],
    /** Остання помилка провайдера в цьому ізоляті (без тексту відповіді провайдера). */
    lastError: last ? { at: last.at, provider: last.provider, reason: last.reason ?? 'unknown' } : null,
    lastOkAt: runtime.lastOkAt,
  };
}

/** Назви літер польської абетки: окрема літера озвучується назвою («wu»), а не «duże wu». */
const LETTER_NAMES: Record<string, string> = {
  a: 'a', ą: 'ą', b: 'be', c: 'ce', ć: 'cie', d: 'de', e: 'e', ę: 'ę', f: 'ef', g: 'gie', h: 'ha', i: 'i', j: 'jot', k: 'ka', l: 'el', ł: 'eł',
  m: 'em', n: 'en', ń: 'eń', o: 'o', ó: 'o z kreską', p: 'pe', q: 'ku', r: 'er', s: 'es', ś: 'eś', t: 'te', u: 'u', v: 'fau', w: 'wu', x: 'iks',
  y: 'igrek', z: 'zet', ź: 'ziet', ż: 'żet',
};

/**
 * Текст, який іде провайдеру: speechText (NFC, без «___», до 300 символів) і назва літери для окремої літери.
 * Фрази з прийменником («W Warszawie», «w domu») не змінюються: прийменник звучить разом зі словом.
 */
export function ttsInputText(raw: string): string {
  const text = speechText(raw);
  if (!isLoneLetter(text)) return text;
  const letter = text.replace(/[.,!?;:…"„”«»()]/g, '').trim().toLocaleLowerCase('pl');
  return LETTER_NAMES[letter] ?? text;
}

/** Ключ кешу: hash(text|provider|model|voice|rate|version). */
export function ttsCacheKey(spec: TtsVoiceSpec, rate: SpeechRate, text: string, version = TTS_PIPELINE_VERSION) {
  return sha256(`${text}|${spec.provider}|${spec.model}|${spec.voice}|${rate}|${version}`);
}
/** Старий ключ (до V8.1): sha256(provider|voice|rate|text), для ElevenLabs voice — «id/model». */
export function legacyTtsCacheKey(provider: TtsProviderId, legacyVoice: string, rate: string, text: string) {
  return sha256(`${provider}|${legacyVoice}|${rate}|${text}`);
}
/** Підпис запису кешу (колонка voice): версія, провайдер, модель, голос. Старі записи мають вигляд «provider:voice». */
export const cacheLabel = (spec: TtsVoiceSpec, version = TTS_PIPELINE_VERSION) => `v${version}|${spec.provider}|${spec.model}|${spec.voice}`;

/** Перенос запису зі старим ключем на новий без синтезу. Якщо новий ключ уже є (паралельний запит) — нічого не робить. */
function adoptStatement(oldKey: string, newKey: string, spec: TtsVoiceSpec) {
  return db
    .update(ttsCache)
    .set({ key: newKey, voice: cacheLabel(spec, LEGACY_COMPATIBLE_VERSION) })
    .where(and(eq(ttsCache.key, oldKey), sql`NOT EXISTS (SELECT 1 FROM tts_cache WHERE key = ${newKey})`))
    .returning({ key: ttsCache.key });
}

/** Допустимий текст: польські літери, цифри, розділові знаки. Захист від використання ключа для довільних текстів. */
const ALLOWED = /^[\p{Script=Latin}0-9\s.,!?;:'"„”«»…()\-–—/%]+$/u;
/** Чи піде цей текст провайдеру (інакше /api/tts — 400 tts_bad_text і клієнт говорить голосом пристрою). */
export const ttsTextAllowed = (raw: string) => {
  const text = ttsInputText(raw);
  return !!text && ALLOWED.test(text);
};

export type SynthResult = { data: Uint8Array; mime: string; cached: boolean; legacy: boolean; provider: TtsProviderId; voice: string; model: string; version: string };

function failureReason(e: unknown): string {
  if (e instanceof TtsProviderError) return e.reason;
  const name = (e as Error)?.name;
  if (name === 'TimeoutError' || name === 'AbortError') return 'timeout';
  if (name === 'SyntaxError') return 'bad_response';
  return 'network';
}

/** Один запит до провайдера (10 с). Помилки — TtsProviderError з причиною http_<код> / empty_audio. */
export async function callProvider(p: TtsProvider, text: string, rate: SpeechRate): Promise<ArrayBuffer> {
  const { url, init } = p.request(text, rate);
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new TtsProviderError(`http_${res.status}`);
  return p.parse(res);
}

/**
 * Синтез з кешем. Порядок: новий ключ → старий ключ (перенос без синтезу) → платний синтез.
 * meter — облік платного синтезу (квота користувача); кешовані фрази не рахуються.
 * payer — чий це платний запит у добовому бюджеті проєкту (tts_spend): user (типово) — у межах
 * TTS_GLOBAL_DAILY_CHARS, понад нього 429; admin — прогрів і порівняння голосів, лише облік.
 * provider — інший голос; типово — вибраний TTS_PROVIDER.
 */
export async function synthesize(rawText: string, rate: SpeechRate, opts: { meter?: () => Promise<unknown>; payer?: 'user' | 'admin'; provider?: TtsProvider | null } = {}): Promise<SynthResult> {
  const provider = opts.provider ?? ttsProvider();
  if (!provider) throw new HttpError(503, 'tts_not_configured', 'Серверну озвучку не підключено');
  const text = ttsInputText(rawText);
  if (!text || !ALLOWED.test(text)) throw new HttpError(400, 'tts_bad_text');
  const spec = { provider: provider.provider, voice: provider.voice, model: provider.model };
  const base = { ...spec, version: TTS_PIPELINE_VERSION };
  const ev = { ...spec, rate, chars: [...text].length };
  const key = ttsCacheKey(spec, rate, text);
  const hit = await db.query.ttsCache.findFirst({ where: eq(ttsCache.key, key) });
  if (hit) {
    track({ ...ev, outcome: 'hit' });
    return { ...base, data: new Uint8Array(hit.data), mime: hit.mime, cached: true, legacy: false };
  }
  if (TTS_PIPELINE_VERSION === LEGACY_COMPATIBLE_VERSION) {
    const old = await db.query.ttsCache.findFirst({ where: eq(ttsCache.key, legacyTtsCacheKey(provider.provider, provider.legacyVoice, rate, text)) });
    if (old) {
      await adoptStatement(old.key, key, spec);
      track({ ...ev, outcome: 'legacy_hit' });
      return { ...base, data: new Uint8Array(old.data), mime: old.mime, cached: true, legacy: true };
    }
  }
  await opts.meter?.();
  await reserveTtsChars(opts.payer ?? 'user', ev.chars);
  const started = Date.now();
  let audio: Uint8Array;
  try {
    audio = new Uint8Array(await callProvider(provider, text, rate));
    if (!audio.length) throw new TtsProviderError('empty_audio');
  } catch (e) {
    track({ ...ev, outcome: 'error', reason: failureReason(e), ms: Date.now() - started });
    throw new HttpError(502, 'tts_failed');
  }
  await db.insert(ttsCache).values({ key, text, voice: cacheLabel(spec), rate, mime: 'audio/mpeg', data: Buffer.from(audio) }).onConflictDoNothing();
  track({ ...ev, outcome: 'miss', ms: Date.now() - started });
  return { ...base, data: audio, mime: 'audio/mpeg', cached: false, legacy: false };
}

/** Старий підпис «provider:voice» → голос і модель. Для нових записів («v1|…») — null. */
export function parseLegacyLabel(label: string): (TtsVoiceSpec & { legacyVoice: string }) | null {
  const m = /^(google|azure|elevenlabs):(.+)$/.exec(label);
  if (!m) return null;
  const provider = m[1] as TtsProviderId;
  const legacyVoice = m[2];
  if (provider === 'elevenlabs') {
    const i = legacyVoice.lastIndexOf('/');
    if (i <= 0 || i === legacyVoice.length - 1) return null;
    return { provider, voice: legacyVoice.slice(0, i), model: legacyVoice.slice(i + 1), legacyVoice };
  }
  return { provider, voice: legacyVoice, model: provider === 'google' ? googleModel(legacyVoice) : azureModel(legacyVoice), legacyVoice };
}

/**
 * Перенос усіх записів зі старим ключем на новий формат без синтезу, частинами (один пакет D1 на частину).
 * Запис вважається старим, лише якщо його ключ збігається з перерахованим старим ключем з колонок text/voice/rate.
 */
export async function migrateLegacyCacheKeys(opts: { cursor?: string | null; limit?: number } = {}) {
  const limit = Math.min(Math.max(Math.floor(opts.limit ?? 100), 1), 400);
  const rows = await db
    .select({ key: ttsCache.key, text: ttsCache.text, voice: ttsCache.voice, rate: ttsCache.rate })
    .from(ttsCache)
    .where(opts.cursor ? gt(ttsCache.key, opts.cursor) : undefined)
    .orderBy(asc(ttsCache.key))
    .limit(limit);
  let current = 0;
  let unknown = 0;
  const updates: ReturnType<typeof adoptStatement>[] = [];
  for (const r of rows) {
    const spec = parseLegacyLabel(r.voice);
    if (!spec) {
      if (r.voice.startsWith('v')) current++;
      else unknown++;
      continue;
    }
    if ((r.rate !== 'normal' && r.rate !== 'slow') || legacyTtsCacheKey(spec.provider, spec.legacyVoice, r.rate, r.text) !== r.key) {
      unknown++;
      continue;
    }
    updates.push(adoptStatement(r.key, ttsCacheKey(spec, r.rate, r.text, LEGACY_COMPATIBLE_VERSION), spec));
  }
  const results = updates.length ? await readBatch(updates) : [];
  const migrated = results.filter((x) => x.length > 0).length;
  return { scanned: rows.length, migrated, conflicts: updates.length - migrated, current, unknown, next: rows.at(-1)?.key ?? null, done: rows.length < limit };
}

/** Розмір кешу за голосами і швидкостями (без читання самих аудіо: length() бере розмір із заголовка запису). */
export async function ttsCacheStats() {
  const rows = await db
    .select({ label: ttsCache.voice, rate: ttsCache.rate, rows: count(), bytes: sql<number>`coalesce(sum(length(${ttsCache.data})), 0)`, chars: sql<number>`coalesce(sum(length(${ttsCache.text})), 0)` })
    .from(ttsCache)
    .groupBy(ttsCache.voice, ttsCache.rate);
  const groups = rows.map((r) => ({ ...r, legacy: !!parseLegacyLabel(r.label) }));
  const sum = (f: (g: (typeof groups)[number]) => number) => groups.reduce((a, g) => a + f(g), 0);
  return { rows: sum((g) => g.rows), bytes: sum((g) => g.bytes), chars: sum((g) => g.chars), legacyRows: sum((g) => (g.legacy ? g.rows : 0)), groups };
}

export type ListedVoice = { id: string; name: string; gender: string | null; model: string | null; locale: string | null };

/**
 * Список польських голосів у провайдера (не синтез: за символи не тарифікується). Лише для адмінки.
 * Google voices.list, Azure voices/list, ElevenLabs shared-voices (Voice Library, мова pl, без голосів з особливим тарифом).
 */
export async function listPolishVoices(provider: TtsProviderId, env: Env = getBindings()): Promise<ListedVoice[]> {
  if (!hasCredentials(provider, env)) throw new HttpError(400, 'provider_not_configured');
  const get = async (url: string, headers: Record<string, string> = {}) => {
    let res: Response;
    try {
      res = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
    } catch (e) {
      throw new HttpError(502, 'voices_failed', failureReason(e));
    }
    if (!res.ok) throw new HttpError(502, 'voices_failed', `http_${res.status}`);
    return (await res.json()) as Record<string, unknown>;
  };
  if (provider === 'google') {
    // Ключ у заголовку, як і в синтезі: адреса потрапляє в журнали проксі й повідомлення про помилки.
    const j = await get('https://texttospeech.googleapis.com/v1/voices?languageCode=pl-PL', { 'X-Goog-Api-Key': env.GOOGLE_TTS_API_KEY! });
    return ((j.voices as { name: string; ssmlGender?: string; languageCodes?: string[] }[]) ?? [])
      .map((v) => ({ id: v.name, name: v.name, gender: v.ssmlGender ?? null, model: googleModel(v.name), locale: v.languageCodes?.[0] ?? null }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }
  if (provider === 'azure') {
    const list = (await get(`https://${env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/voices/list`, { 'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY! })) as unknown as {
      ShortName: string; Gender?: string; Locale?: string; VoiceType?: string; SecondaryLocaleList?: string[];
    }[];
    return (Array.isArray(list) ? list : [])
      .filter((v) => v.Locale === 'pl-PL' || v.SecondaryLocaleList?.includes('pl-PL'))
      .map((v) => ({ id: v.ShortName, name: v.ShortName, gender: v.Gender ?? null, model: v.VoiceType ?? azureModel(v.ShortName), locale: v.Locale ?? null }));
  }
  const j = await get('https://api.elevenlabs.io/v1/shared-voices?language=pl&page_size=50&include_custom_rates=false&sort=usage_character_count_1y', { 'xi-api-key': env.ELEVENLABS_API_KEY! });
  return ((j.voices as { voice_id: string; name: string; gender?: string; accent?: string; descriptive?: string; locale?: string; language?: string }[]) ?? []).map((v) => ({
    id: v.voice_id,
    name: [v.name, v.accent, v.descriptive].filter(Boolean).join(' · '),
    gender: v.gender ?? null,
    model: null,
    locale: v.locale ?? v.language ?? null,
  }));
}

/** Усі польські фрази навчального контенту — для попереднього синтезу (прогрів кешу). */
export async function contentPhrases(): Promise<string[]> {
  return (await allContentPhrases()).filter((x) => ALLOWED.test(x));
}

/**
 * Те саме без фільтра ALLOWED: тест перевіряє, що жодна фраза контенту не випадає з серверної озвучки.
 * Лише опубліковані уроки: архівні (стандарт міста, city-standard.ts) прогрів не синтезує — платні символи на них не витрачаються.
 */
export async function allContentPhrases(): Promise<string[]> {
  const { vocabularyEntries, exercises, lessons, questSteps } = await import('../db/schema');
  const [vocab, ex, ls, steps] = await Promise.all([
    db.select({ pl: vocabularyEntries.pl, examples: vocabularyEntries.examples }).from(vocabularyEntries),
    db.select({ type: exercises.type, data: exercises.data }).from(exercises).innerJoin(lessons, eq(lessons.id, exercises.lessonId)).where(eq(lessons.status, 'PUBLISHED')),
    db.select({ examples: lessons.examples }).from(lessons).where(eq(lessons.status, 'PUBLISHED')),
    db.select({ data: questSteps.data }).from(questSteps),
  ]);
  const out = new Set<string>();
  const add = (s: unknown) => {
    if (typeof s === 'string' && s.trim() && !s.includes('___')) out.add(speechText(s));
  };
  for (const v of vocab) {
    add(v.pl);
    v.examples.forEach((e) => add(e.pl));
  }
  for (const l of ls) l.examples.forEach((e) => add(e.pl));
  for (const e of ex) {
    const d = e.data as Record<string, unknown>;
    add(d.audioText);
    add(d.text);
    if (e.type !== 'FIND_ERROR' && e.type !== 'FILL_GAP' && e.type !== 'GRAMMAR') add(d.pl);
    for (const o of (d.options as { text: unknown }[] | undefined) ?? []) add(o.text);
    for (const s of (d.steps as { npc?: string; options?: { text: unknown }[] }[] | undefined) ?? []) {
      add(s.npc);
      s.options?.forEach((o) => add(o.text));
    }
  }
  for (const s of steps) {
    for (const n of Object.values(((s.data as { nodes?: Record<string, { pl?: string; choices?: { pl: string }[] }> }).nodes) ?? {})) {
      add(n.pl);
      n.choices?.forEach((c) => add(c.pl));
    }
  }
  return [...out].sort();
}
