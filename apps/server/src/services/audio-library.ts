/**
 * Аудіобібліотека ElevenLabs у R2: заздалегідь створені MP3 для всіх польських текстів застосунку.
 *
 * Гравець лише отримує готовий файл (GET /api/audio/<відбиток>/<audio_id>.mp3, старі клієнти — /api/tts): синтезу на
 * запит немає ніде; файлу немає → 404, клієнт показує «Озвучка скоро появится» (без голосу пристрою), а натискання
 * потрапляє в audio_misses. Генерація — лише з адмінки або CLI (scripts/audio-library.ts; AUDIO_GENERATION_MODE,
 * services/audio-policy.ts), партіями, з лімітом кредитів і перевіркою voice_id: перед кожним запитом
 * перевіряється R2 і наявний кеш D1 того самого голосу; паралельний запит того самого тексту рядок не захопить.
 *
 * Ключ R2: pl/<версія>/<voice_id>/<aa>/<sha256(audioNorm)>.mp3 — голос у шляху, тож файли іншого голосу (старий жіночий)
 * ніколи не потрапляють у видачу. Повільна швидкість — той самий файл, клієнт грає його з playbackRate 0,75.
 */
import { createHash } from 'node:crypto';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { AUDIO_LIBRARY_VERSION, audioNorm, speechText } from '@polski-go/shared';
import { db } from '../db';
import { audioAssets, audioMisses, ttsCache } from '../db/schema';
import { getBindings, type Bindings } from '../env';
import { HttpError } from '../lib/errors';
import { audioId, audioObjectKey, ttsChars } from './audio-catalog';
import { audioGenerationMode } from './audio-policy';
import { ttsCacheKey, ttsInputText } from './tts';

type Env = Partial<Bindings>;

export const LIBRARY_MODELS = ['eleven_multilingual_v2', 'eleven_flash_v2_5'] as const;
export type LibraryModel = (typeof LIBRARY_MODELS)[number];

/** Кредитів за символ, якщо /v1/models не віддав множник (документація ElevenLabs: Flash/Turbo — половина ціни). */
export const DEFAULT_CREDITS_PER_CHAR: Record<LibraryModel, number> = { eleven_multilingual_v2: 1, eleven_flash_v2_5: 0.5 };

/**
 * Налаштування голосу й формат — ті самі, що в серверному синтезі на звичайній швидкості (services/tts.ts):
 * тому вже оплачені записи цього голосу з кешу D1 переносяться в R2 без нового синтезу.
 */
export const LIBRARY_SETTINGS = { stability: 0.55, similarity_boost: 0.8, speed: 1 } as const;
export const LIBRARY_FORMAT = 'mp3_44100_64';
const settingsJson = JSON.stringify({ ...LIBRARY_SETTINGS, output_format: LIBRARY_FORMAT });

/** Голос бібліотеки — лише явно заданий ELEVENLABS_VOICE_ID (без типового англійського голосу). */
export const libraryVoice = (env: Env = getBindings()) => (env.ELEVENLABS_VOICE_ID ?? '').trim() || null;
export const libraryAvailable = (env: Env = getBindings()) => !!env.AUDIO && !!libraryVoice(env);
/**
 * Режим «лише готові файли» для гравців — завжди, коли є R2 і голос бібліотеки (AUDIO_LIBRARY більше не потрібен):
 * кнопка динаміка не запускає синтез ніколи, навіть якщо бібліотека ще порожня.
 */
export const libraryEnabled = (env: Env = getBindings()) => libraryAvailable(env);
/** Відбиток бібліотеки для ключів кешу клієнта: зміна голосу чи версії — нові ключі, старі записи не грають. */
export const libraryFingerprint = (voice: string) => createHash('sha256').update(`library|elevenlabs|${voice}|${AUDIO_LIBRARY_VERSION}`).digest('hex').slice(0, 12);

const rowKey = (id: string, voice: string) => `${id}:${voice}`;

/** Текст, який іде в ElevenLabs: слова табличок великими літерами читаються як слова («ODJAZDY» → «Odjazdy»), абревіатури — як заведено. */
export function speakForm(text: string): string {
  return text.replace(/(?<![\p{L}\d])(\p{Lu})(\p{Lu}{3,})(?![\p{L}\d])/gu, (w, a: string, rest: string) => (ACRONYMS.has(w) ? w : a + rest.toLocaleLowerCase('pl')));
}
/** Абревіатури, які лишаються великими (синтезатор читає їх по літерах або як прийнято: PESEL, NATO). */
const ACRONYMS = new Set(['PESEL', 'NATO', 'BLIK', 'BHP', 'NFZ', 'ZUS', 'PKP', 'SKM', 'PKS', 'MPK', 'RODO', 'NIP', 'REGON', 'KRS', 'USOS', 'SMS', 'CV', 'IT']);

/** MP3: заголовок ID3 або кадр MPEG (0xFFE…). Порожні й обрізані відповіді не зберігаються. */
export function looksLikeMp3(bytes: Uint8Array): boolean {
  if (bytes.length < 600) return false;
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return true;
  return bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
}

// ── Видача ──

/** Готовий файл для тексту (старі клієнти: /api/tts?text=…) або null. Лише R2 голосу бібліотеки: без кешу D1 і синтезу. */
export async function libraryAudio(rawText: string, env: Env = getBindings()): Promise<{ body: ReadableStream; source: 'library' } | null> {
  const voice = libraryVoice(env);
  if (!env.AUDIO || !voice) return null;
  const norm = audioNorm(rawText);
  if (!norm) return null;
  const obj = await env.AUDIO.get(audioObjectKey(audioId(norm), voice));
  return obj ? { body: obj.body, source: 'library' } : null;
}

/** Готовий файл живе вічно: зміна голосу чи версії дає інший відбиток в адресі, а не новий вміст за старою. */
const IMMUTABLE = 'public, max-age=31536000, immutable';
/** Файлу ще немає: браузер не питає знову 5 хвилин, а після озвучки файл з'явиться без оновлення застосунку. */
const MISSING = 'public, max-age=300';

/**
 * GET /api/audio/<відбиток>/<audio_id>.mp3 — готовий MP3 з приватного R2 через Worker. Без входу: адреса — sha256
 * нормалізованого тексту, а не текст, і нічого, крім уже озвученого, звідси не отримати. ElevenLabs не викликається.
 * Range (iOS Safari просить bytes=0-1, далі шматки) → 206, за межами файлу → 416; If-None-Match → 304; відбиток старого голосу → 404.
 */
export async function serveLibraryFile(req: Request, fingerprint: string, file: string, env: Env = getBindings()): Promise<Response> {
  const missing = (error: string) => Response.json({ error }, { status: 404, headers: { 'cache-control': MISSING } });
  const id = /^([0-9a-f]{64})\.mp3$/.exec(file)?.[1];
  const voice = libraryVoice(env);
  if (!id || !/^[0-9a-f]{12}$/.test(fingerprint)) return missing('not_found');
  if (!env.AUDIO || !voice) return missing('audio_missing');
  if (fingerprint !== libraryFingerprint(voice)) return missing('audio_version');
  const key = audioObjectKey(id, voice);
  const etag = req.headers.get('if-none-match')?.replace(/^W\//, '').replace(/"/g, '').trim();
  const rangeHeader = req.headers.get('range');
  let range: { offset: number; length: number } | undefined;
  let size: number | undefined;
  if (rangeHeader) {
    // Один діапазон bytes=a-b | a- | -n; розмір — з head (запити Range шле лише <audio>, клієнт качає файл цілком).
    const head = await env.AUDIO.head(key);
    if (!head) return missing('audio_missing');
    size = head.size;
    const m = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
    const start = m && m[1] !== '' ? Number(m[1]) : m && m[2] !== '' ? Math.max(0, size - Number(m[2])) : NaN;
    const end = m && m[1] !== '' && m[2] !== '' ? Math.min(Number(m[2]), size - 1) : size - 1;
    if (!m || !Number.isFinite(start) || start >= size || end < start) {
      return new Response(null, { status: 416, headers: { 'content-range': `bytes */${size}`, 'accept-ranges': 'bytes', 'cache-control': MISSING } });
    }
    range = { offset: start, length: end - start + 1 };
  }
  const obj: R2Object | R2ObjectBody | null = await env.AUDIO.get(key, { ...(etag ? { onlyIf: { etagDoesNotMatch: etag } } : {}), ...(range ? { range } : {}) });
  if (!obj) return missing('audio_missing');
  // Заголовки задаються явно (не writeHttpMetadata): усі файли бібліотеки — MP3, і так однаково в Miniflare та Cloudflare.
  const headers = new Headers();
  headers.set('content-type', 'audio/mpeg');
  headers.set('cache-control', IMMUTABLE);
  headers.set('etag', obj.httpEtag);
  headers.set('accept-ranges', 'bytes');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('x-audio-source', 'library');
  if (!('body' in obj)) return new Response(null, { status: 304, headers });
  if (range) {
    headers.set('content-range', `bytes ${range.offset}-${range.offset + range.length - 1}/${size ?? obj.size}`);
    headers.set('content-length', String(range.length));
    return new Response(obj.body, { status: 206, headers });
  }
  headers.set('content-length', String(obj.size));
  return new Response(obj.body, { status: 200, headers });
}

/** Текст, якого немає в бібліотеці: лічильник для адмінки (нові тексти контенту, відповіді ШІ). */
export async function recordMiss(rawText: string) {
  const norm = audioNorm(rawText);
  if (!norm) return;
  const now = Date.now();
  await db
    .insert(audioMisses)
    .values({ unitId: audioId(norm), text: speechText(rawText).slice(0, 300), count: 1, lastAt: now })
    .onConflictDoUpdate({ target: audioMisses.unitId, set: { count: sql`${audioMisses.count} + 1`, lastAt: now } });
}

// ── Облік ──

/** Які з одиниць каталогу вже готові для голосу (id без голосу). Один параметр JSON — без ліміту D1 на 100 параметрів. */
export async function readyUnits(ids: string[], voice: string): Promise<string[]> {
  if (!ids.length) return [];
  const rows = await db
    .select({ id: audioAssets.unitId })
    .from(audioAssets)
    .where(and(eq(audioAssets.voiceId, voice), eq(audioAssets.status, 'ready'), sql`${audioAssets.unitId} IN (SELECT value FROM json_each(${JSON.stringify(ids)}))`));
  return rows.map((r) => r.id);
}

export async function librarySummary(voice: string | null) {
  const byStatus = await db
    .select({ voice: audioAssets.voiceId, status: audioAssets.status, n: sql<number>`count(*)`, credits: sql<number>`coalesce(sum(${audioAssets.credits}), 0)`, bytes: sql<number>`coalesce(sum(${audioAssets.bytes}), 0)`, chars: sql<number>`coalesce(sum(${audioAssets.chars}), 0)` })
    .from(audioAssets)
    .groupBy(audioAssets.voiceId, audioAssets.status);
  const misses = await db.select().from(audioMisses).orderBy(sql`${audioMisses.count} DESC`).limit(50);
  // Черга й помилки голосу бібліотеки: що не готове і чому (останні 50).
  const queue = voice
    ? await db
        .select({ id: audioAssets.unitId, text: audioAssets.text, status: audioAssets.status, model: audioAssets.modelId, error: audioAssets.error, attempts: audioAssets.attempts, at: audioAssets.updatedAt })
        .from(audioAssets)
        .where(and(eq(audioAssets.voiceId, voice), sql`${audioAssets.status} != 'ready'`))
        .orderBy(sql`${audioAssets.updatedAt} DESC`)
        .limit(50)
    : [];
  // Журнал витрат: кредити й нові файли по днях (UTC) — синтез; перенесені з кешу файли кредитів не коштують.
  const spend = voice
    ? await db
        .select({ day: sql<string>`date(${audioAssets.updatedAt} / 1000, 'unixepoch')`, files: sql<number>`count(*)`, credits: sql<number>`coalesce(sum(${audioAssets.credits}), 0)`, chars: sql<number>`coalesce(sum(${audioAssets.chars}), 0)` })
        .from(audioAssets)
        .where(and(eq(audioAssets.voiceId, voice), eq(audioAssets.status, 'ready'), eq(audioAssets.source, 'generated')))
        .groupBy(sql`1`)
        .orderBy(sql`1 DESC`)
        .limit(30)
    : [];
  return { voice, generation: audioGenerationMode(), byStatus, misses, queue, spend };
}

// ── ElevenLabs ──

const API = 'https://api.elevenlabs.io';

/** Код помилки ElevenLabs: http_<статус> і, якщо є, detail.status та текст (без ключа: ElevenLabs його не повертає). */
async function elevenError(res: Response): Promise<string> {
  const detail = ((await res.json().catch(() => null)) as { detail?: { status?: string; message?: string } | string } | null)?.detail;
  const d = typeof detail === 'string' ? { message: detail } : detail ?? {};
  return [`http_${res.status}`, d.status, d.message?.slice(0, 160)].filter(Boolean).join(' ');
}

async function elevenGet<T>(path: string, key: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API + path, { headers: { 'xi-api-key': key }, signal: AbortSignal.timeout(15_000) });
  } catch {
    throw new HttpError(502, 'elevenlabs_unreachable', 'ElevenLabs не отвечает');
  }
  if (!res.ok) throw new HttpError(502, 'elevenlabs_failed', await elevenError(res));
  return (await res.json()) as T;
}

/** Зрозуміла власнику причина відмови ElevenLabs (адмінка показує її замість мовчки вимкнених кнопок). */
function elevenReason(e: unknown, voiceId: string | null): string {
  const m = e instanceof Error ? e.message : String(e);
  const perm = /permission ([a-z]+_[a-z_]+)/.exec(m)?.[1];
  if (/missing_permissions/.test(m)) return `у ключа ElevenLabs нет права${perm ? ` ${perm}` : ''} (ElevenLabs → Developers → API Keys → доступ ключа)`;
  if (/invalid_api_key|http_401/.test(m)) return 'ключ ElevenLabs не принят (ELEVENLABS_API_KEY)';
  if (/voice_not_found|http_404|http_400/.test(m)) return `голос ${voiceId ?? ''} не найден: добавьте Kamil в My Voices и проверьте ELEVENLABS_VOICE_ID`;
  return m;
}

type ElModel = { model_id: string; name?: string; languages?: { language_id: string }[]; model_rates?: { character_cost_multiplier?: number }; token_cost_factor?: number };
type ElVoice = { voice_id: string; name?: string; category?: string; labels?: Record<string, string>; verified_languages?: { language: string; model_id?: string }[] };

/** Стан акаунта ElevenLabs без синтезу: залишок кредитів, моделі з польською та їхня ціна, голос бібліотеки. */
export async function libraryAccount(env: Env = getBindings()) {
  const key = env.ELEVENLABS_API_KEY;
  const voiceId = libraryVoice(env);
  const library = { r2: !!env.AUDIO, mode: libraryEnabled(env) ? 'library' : 'none', generation: audioGenerationMode(env), version: AUDIO_LIBRARY_VERSION, fingerprint: voiceId ? libraryFingerprint(voiceId) : null };
  if (!key) return { configured: false, library, voiceId, voice: null, credits: null, models: [], kamilVoices: [], problems: ['в Worker нет секрета ELEVENLABS_API_KEY'] };
  // Кожен запит окремо: ключ лише з правом синтезу (без user_read, voices_read, models_read) не ламає сторінку —
  // генерації потрібен тільки text-to-speech, а причину відмови власник бачить у problems.
  const problems: string[] = [];
  const settled = await Promise.allSettled([
    elevenGet<{ character_count?: number; character_limit?: number; next_character_count_reset_unix?: number; tier?: string }>('/v1/user/subscription', key),
    elevenGet<ElModel[]>('/v1/models', key),
    voiceId ? elevenGet<ElVoice>(`/v1/voices/${encodeURIComponent(voiceId)}`, key) : Promise.resolve(null),
    // Голоси акаунта з «Kamil» у назві — щоб власник побачив id потрібного голосу для ELEVENLABS_VOICE_ID.
    elevenGet<{ voices?: ElVoice[] }>('/v1/voices', key),
  ]);
  const what = ['кредиты', 'модели', 'голос', 'список голосов'];
  const value = <T,>(i: number): T | null => {
    const r = settled[i];
    if (r.status === 'fulfilled') return r.value as T;
    problems.push(`${what[i]}: ${elevenReason(r.reason, voiceId)}`);
    return null;
  };
  const sub = value<{ character_count?: number; character_limit?: number; next_character_count_reset_unix?: number; tier?: string }>(0);
  const models = value<ElModel[]>(1);
  const voice = value<ElVoice>(2);
  const all = value<{ voices?: ElVoice[] }>(3);
  const describe = (v: ElVoice) => ({
    id: v.voice_id,
    name: v.name ?? null,
    gender: v.labels?.gender ?? null,
    category: v.category ?? null,
    polishModels: (v.verified_languages ?? []).filter((l) => l.language === 'pl').map((l) => l.model_id ?? '?'),
    isKamil: /kamil/i.test(v.name ?? ''),
    male: (v.labels?.gender ?? '').toLowerCase() === 'male',
  });
  const used = sub?.character_count ?? 0;
  const limit = sub?.character_limit ?? 0;
  return {
    configured: true,
    library,
    voiceId,
    problems,
    tier: sub?.tier ?? null,
    credits: sub ? { used, limit, left: Math.max(0, limit - used), resetAt: sub.next_character_count_reset_unix ? new Date(sub.next_character_count_reset_unix * 1000).toISOString() : null } : null,
    models: (Array.isArray(models) ? models : []).map((m) => ({
      id: m.model_id,
      name: m.name ?? m.model_id,
      polish: !!m.languages?.some((l) => l.language_id === 'pl'),
      creditsPerChar: m.model_rates?.character_cost_multiplier ?? m.token_cost_factor ?? (DEFAULT_CREDITS_PER_CHAR as Record<string, number>)[m.model_id] ?? null,
    })),
    voice: voice ? describe(voice) : null,
    kamilVoices: (all?.voices ?? []).filter((v) => /kamil/i.test(v.name ?? '')).map(describe),
  };
}

// ── Генерація ──

/**
 * Перед генерацією — voice_id через API ElevenLabs (GET /v1/voices/{id}), результат пам'ятається 10 хвилин.
 * Голосу немає → відмова; голос є, але не чоловічий Kamil → відмова, якщо адмін явно не підтвердив інший голос.
 * Ключ без права voices_read не може перевірити голос — тоді генерація йде (синтез сам відмовить на чужий id),
 * а адмінка попереджає про це окремо (libraryAccount → problems).
 */
const VOICE_CHECK_MS = 10 * 60_000;
let voiceChecked: { voice: string; at: number; kamil: boolean | null } | null = null;
async function checkLibraryVoice(voice: string, key: string, allowOtherVoice: boolean) {
  if (!voiceChecked || voiceChecked.voice !== voice || Date.now() - voiceChecked.at > VOICE_CHECK_MS) {
    let kamil: boolean | null = null;
    try {
      const v = await elevenGet<ElVoice>(`/v1/voices/${encodeURIComponent(voice)}`, key);
      kamil = /kamil/i.test(v.name ?? '') && (v.labels?.gender ?? '').toLowerCase() === 'male';
    } catch (e) {
      const m = e instanceof Error ? e.message : '';
      if (/voice_not_found|http_404|http_400/.test(m)) throw new HttpError(400, 'voice_not_found', elevenReason(e, voice));
      if (!/missing_permissions|http_401|http_403|unreachable/.test(m) && !(e instanceof HttpError && e.code === 'elevenlabs_unreachable')) throw e;
    }
    voiceChecked = { voice, at: Date.now(), kamil };
  }
  if (voiceChecked.kamil === false && !allowOtherVoice) throw new HttpError(400, 'voice_not_kamil', 'ELEVENLABS_VOICE_ID — не мужской голос Kamil');
}

export type GenerateItem = { id: string; text: string; model: LibraryModel };
export type GenerateResult = { id: string; status: 'generated' | 'adopted' | 'exists' | 'locked' | 'budget' | 'failed'; credits: number; bytes?: number; error?: string; retryable?: boolean };

const LOCK_MS = 3 * 60_000;

/** Захоплення рядка: лише якщо файл ще не готовий і рядок ніхто не обробляє зараз. */
async function claim(item: GenerateItem, voice: string, chars: number): Promise<boolean> {
  const now = Date.now();
  const rows = await db
    .insert(audioAssets)
    .values({ key: rowKey(item.id, voice), unitId: item.id, text: item.text, voiceId: voice, modelId: item.model, settings: settingsJson, version: AUDIO_LIBRARY_VERSION, objectKey: audioObjectKey(item.id, voice), status: 'generating', chars, attempts: 1, lockedUntil: now + LOCK_MS })
    .onConflictDoUpdate({
      target: audioAssets.key,
      set: { status: 'generating', text: item.text, modelId: item.model, lockedUntil: now + LOCK_MS, attempts: sql`${audioAssets.attempts} + 1`, updatedAt: new Date() },
      setWhere: sql`${audioAssets.status} != 'ready' AND (${audioAssets.lockedUntil} IS NULL OR ${audioAssets.lockedUntil} < ${now})`,
    })
    .returning({ key: audioAssets.key });
  return rows.length > 0;
}

const finish = (id: string, voice: string, set: Partial<typeof audioAssets.$inferInsert>) =>
  db.update(audioAssets).set({ ...set, lockedUntil: null, updatedAt: new Date() }).where(eq(audioAssets.key, rowKey(id, voice)));

async function putObject(env: Env, objectKey: string, bytes: Uint8Array, meta: Record<string, string>) {
  await env.AUDIO!.put(objectKey, bytes, { httpMetadata: { contentType: 'audio/mpeg', cacheControl: 'public, max-age=31536000, immutable' }, customMetadata: meta });
}

/**
 * Партія генерації (послідовно, до 25 текстів). maxCredits — стеля витрат цієї партії: текст, що в неї не вміщується,
 * повертається як budget і лишається в черзі. Порядок на кожен текст: R2 → кеш D1 цього голосу → ElevenLabs.
 */
export async function generateBatch(
  items: GenerateItem[],
  maxCredits: number,
  rates: Partial<Record<LibraryModel, number>> = {},
  env: Env = getBindings(),
  opts: { allowOtherVoice?: boolean } = {},
): Promise<GenerateResult[]> {
  const voice = libraryVoice(env);
  const key = env.ELEVENLABS_API_KEY;
  if (audioGenerationMode(env) === 'off') throw new HttpError(403, 'generation_off', 'Генерация озвучки выключена (AUDIO_GENERATION_MODE=off)');
  if (!env.AUDIO) throw new HttpError(400, 'r2_not_configured', 'Немає binding AUDIO (R2)');
  if (!voice || !key) throw new HttpError(400, 'elevenlabs_not_configured', 'Потрібні ELEVENLABS_API_KEY і ELEVENLABS_VOICE_ID');
  await checkLibraryVoice(voice, key, !!opts.allowOtherVoice);
  let left = maxCredits;
  const out: GenerateResult[] = [];
  for (const item of items) {
    const text = speechText(item.text);
    const norm = audioNorm(text);
    if (!norm || audioId(norm) !== item.id) {
      out.push({ id: item.id, status: 'failed', credits: 0, error: 'id_mismatch' });
      continue;
    }
    const chars = ttsChars(text);
    const objectKey = audioObjectKey(item.id, voice);
    if (!(await claim(item, voice, chars))) {
      const row = await db.query.audioAssets.findFirst({ where: eq(audioAssets.key, rowKey(item.id, voice)) });
      out.push({ id: item.id, status: row?.status === 'ready' ? 'exists' : 'locked', credits: 0 });
      continue;
    }
    try {
      const head = await env.AUDIO.head(objectKey);
      if (head && head.size >= 600) {
        await finish(item.id, voice, { status: 'ready', bytes: head.size, source: head.customMetadata?.source ?? 'existing', error: null });
        out.push({ id: item.id, status: 'exists', credits: 0, bytes: head.size });
        continue;
      }
      // Уже оплачений запис цього голосу в кеші D1 (будь-якою з моделей бібліотеки) — переносимо без синтезу.
      const cached = await db.query.ttsCache.findFirst({ where: inArray(ttsCache.key, LIBRARY_MODELS.map((model) => ttsCacheKey({ provider: 'elevenlabs', voice, model }, 'normal', ttsInputText(text)))) });
      if (cached && looksLikeMp3(new Uint8Array(cached.data))) {
        const bytes = new Uint8Array(cached.data);
        const model = cached.voice.split('|')[2] ?? item.model;
        await putObject(env, objectKey, bytes, { text: text.slice(0, 300), voice, model, version: AUDIO_LIBRARY_VERSION, source: 'adopted' });
        await finish(item.id, voice, { status: 'ready', modelId: model, bytes: bytes.length, credits: 0, source: 'adopted', error: null });
        out.push({ id: item.id, status: 'adopted', credits: 0, bytes: bytes.length });
        continue;
      }
      const rate = rates[item.model] ?? DEFAULT_CREDITS_PER_CHAR[item.model];
      const estimate = chars * rate;
      if (estimate > left) {
        await finish(item.id, voice, { status: 'pending' });
        out.push({ id: item.id, status: 'budget', credits: 0 });
        continue;
      }
      const flash = item.model === 'eleven_flash_v2_5';
      const res = await fetch(`${API}/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=${LIBRARY_FORMAT}`, {
        method: 'POST',
        headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' },
        // language_code примушує польську вимову; приймають лише Flash/Turbo v2.5 (Multilingual v2 визначає мову сам).
        body: JSON.stringify({ text: speakForm(text), model_id: item.model, voice_settings: LIBRARY_SETTINGS, ...(flash ? { language_code: 'pl' } : {}) }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) {
        const error = await elevenError(res);
        await finish(item.id, voice, { status: 'failed', error });
        out.push({ id: item.id, status: 'failed', credits: 0, error, retryable: res.status === 429 || res.status >= 500 });
        if (res.status === 401 || res.status === 402 || res.status === 403) break; // ключ, оплата чи доступ — далі сенсу немає
        continue;
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      const header = Number(res.headers.get('character-cost') ?? res.headers.get('x-character-count'));
      const credits = Number.isFinite(header) && header > 0 ? header : estimate;
      left -= credits;
      if (!looksLikeMp3(bytes)) {
        await finish(item.id, voice, { status: 'failed', error: 'bad_audio', credits });
        out.push({ id: item.id, status: 'failed', credits, error: 'bad_audio' });
        continue;
      }
      await putObject(env, objectKey, bytes, { text: text.slice(0, 300), voice, model: item.model, version: AUDIO_LIBRARY_VERSION, source: 'generated' });
      await finish(item.id, voice, { status: 'ready', modelId: item.model, bytes: bytes.length, credits, source: 'generated', requestId: res.headers.get('request-id'), error: null });
      out.push({ id: item.id, status: 'generated', credits, bytes: bytes.length });
    } catch (e) {
      const error = (e as Error)?.name === 'TimeoutError' ? 'timeout' : 'network';
      await finish(item.id, voice, { status: 'failed', error });
      out.push({ id: item.id, status: 'failed', credits: 0, error, retryable: true });
    }
  }
  return out;
}

/** Перевірка файлів: немає в R2, порожній чи не MP3, записаний іншим голосом. */
export async function verifyUnits(ids: string[], env: Env = getBindings()) {
  const voice = libraryVoice(env);
  if (!env.AUDIO || !voice) throw new HttpError(400, 'r2_not_configured');
  const rows = await db.select({ id: audioAssets.unitId, status: audioAssets.status }).from(audioAssets).where(and(eq(audioAssets.voiceId, voice), sql`${audioAssets.unitId} IN (SELECT value FROM json_each(${JSON.stringify(ids)}))`));
  const ready = new Set(rows.filter((r) => r.status === 'ready').map((r) => r.id));
  const problems: { id: string; problem: string }[] = [];
  for (const id of ids) {
    const obj: R2ObjectBody | null = await env.AUDIO.get(audioObjectKey(id, voice), { range: { offset: 0, length: 4 } });
    if (!obj) {
      if (ready.has(id)) problems.push({ id, problem: 'missing_file' });
      continue;
    }
    const head = new Uint8Array(await obj.arrayBuffer());
    if (obj.size < 600) problems.push({ id, problem: 'empty' });
    else if (!(head[0] === 0x49 && head[1] === 0x44 && head[2] === 0x33) && !(head[0] === 0xff && (head[1] & 0xe0) === 0xe0)) problems.push({ id, problem: 'not_mp3' });
    else if (obj.customMetadata?.voice && obj.customMetadata.voice !== voice) problems.push({ id, problem: 'wrong_voice' });
    else if (!ready.has(id)) problems.push({ id, problem: 'not_registered' });
  }
  return problems;
}
