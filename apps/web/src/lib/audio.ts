import { useSyncExternalStore } from 'react';
import { SPEECH_RATES, isLoneLetter, pickPolishVoice, speechText } from '@polski-go/shared';
import { apiBlob, assetUrl } from './api';

/**
 * Польська озвучка.
 * Порядок джерел: записаний аудіофайл → серверний синтез pl-PL (кеш) → польський голос пристрою.
 * Кожен крок при помилці переходить до наступного; лише якщо всі недоступні — зрозумілий стан помилки.
 * Голос іншої мови не використовується ніколи: без польського голосу показується зрозумілий стан.
 * Нове відтворення завжди зупиняє попереднє — черги з накладених голосів не буває.
 */
let enabled = true;
export function setSoundEnabled(v: boolean) {
  enabled = v;
}

let serverTts = false;
/**
 * Голос пристрою, коли система не віддає список голосів (часто в iOS WebView / Telegram):
 *  - 'strict' (за замовчуванням): не говорити — системний запасний голос може бути не польським;
 *  - 'soft': говорити з lang=pl-PL без підтвердженого голосу і позначити стан «голос не підтверджено».
 * Обрано 'strict': доказів, що WebView без списку голосів завжди читає польською, немає (docs/STATUS.md).
 */
export type DeviceVoicePolicy = 'strict' | 'soft';
let deviceVoicePolicy: DeviceVoicePolicy = 'strict';
/** Відбиток серверного голосу (провайдер, модель, голос, версія — /api/me audio.fingerprint): частина ключів кешу, щоб після зміни голосу не грати старі записи. */
let voiceTag = '';
/**
 * Аудіобібліотека (сервер віддає лише готові MP3 голосу бібліотеки): повільна швидкість — той самий файл
 * із playbackRate 0,75 (окремого синтезу немає), а «файлу немає» запам'ятовується до кінця сесії.
 */
let library = false;
export function configureAudio(opts: { server: boolean; deviceVoice?: DeviceVoicePolicy; voice?: string | null; library?: boolean }) {
  serverTts = opts.server;
  if (opts.deviceVoice) deviceVoicePolicy = opts.deviceVoice;
  voiceTag = opts.voice ?? '';
  library = !!opts.library;
}
/** Тексти, для яких у бібліотеці немає файлу (404 audio_missing): одразу голос пристрою, без повторних запитів. */
const missing = new Set<string>();

export type SpeechStatus = 'idle' | 'loading' | 'playing' | 'error';
export type SpeechIssue = 'no_polish_voice' | 'network' | 'blocked' | 'unverified_voice' | null;
type State = { key: string | null; status: SpeechStatus; issue: SpeechIssue };

let state: State = { key: null, status: 'idle', issue: null };
const listeners = new Set<() => void>();
function set(next: State) {
  state = next;
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Стан озвучування конкретного тексту (для кнопки: завантаження, відтворення, помилка). */
export function useSpeechState(text: string, slow = false): { status: SpeechStatus; issue: SpeechIssue } {
  const k = keyOf(text, slow);
  const snap = useSyncExternalStore(subscribe, () => state);
  return snap.key === k ? { status: snap.status, issue: snap.issue } : { status: 'idle', issue: null };
}

const keyOf = (text: string, slow: boolean) => `${slow ? 's' : 'n'}|${speechText(text)}`;

// Один спільний <audio>: «розблоковується» першим дотиком (iOS/Telegram дозволяють потім програвати з коду).
const el: HTMLAudioElement | null = typeof Audio !== 'undefined' ? new Audio() : null;
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
if (el && typeof document !== 'undefined') {
  el.preload = 'auto';
  const unlock = () => {
    if (!el.src) {
      el.src = SILENT;
      void el.play().catch(() => {});
    }
    // iOS дозволяє speechSynthesis лише після першого виклику в обробнику жесту:
    // «розблоковуємо» синтез беззвучною реплікою, тоді наступні фрази звучать і з асинхронного коду.
    try {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        u.lang = 'pl-PL';
        speechSynthesis.speak(u);
      }
    } catch {
      /* синтез недоступний */
    }
  };
  document.addEventListener('pointerdown', unlock, { once: true, capture: true });
}

// ── Кеш серверного синтезу ──
// 1) blobCache — object URL у пам'яті (миттєво в межах сесії);
// 2) Cache Storage — переживає перезапуск Mini App. Будь-яка помилка сховища = промах, не збій озвучки.
// 3) Ключі обох кешів і адреса запиту містять відбиток голосу: старий голос не грає після зміни провайдера.
const TTS_CACHE = 'pg-tts-v2';
const TTS_CACHE_MAX = 800;
const storeKey = (text: string, slow: boolean) => `${location.origin}/__tts/${voiceTag || 'default'}/${slow ? 'slow' : 'normal'}/${encodeURIComponent(speechText(text))}`;
let oldStoreDropped = false;
async function ttsStore(): Promise<Cache | null> {
  try {
    if (typeof caches === 'undefined') return null;
    // Записи pg-tts-v1 не знають, яким голосом зроблені: прибираємо їх один раз.
    // Збій прибирання не заважає відкрити новий кеш.
    if (!oldStoreDropped) {
      oldStoreDropped = true;
      try {
        void caches.delete('pg-tts-v1').catch(() => {});
      } catch {
        /* немає delete — нема чого прибирати */
      }
    }
    return await caches.open(TTS_CACHE);
  } catch {
    return null;
  }
}
async function readStored(text: string, slow: boolean): Promise<Blob | null> {
  try {
    const hit = await (await ttsStore())?.match(storeKey(text, slow));
    const blob = hit ? await hit.blob() : null;
    return blob?.size ? blob : null;
  } catch {
    return null;
  }
}
let stored = 0;
async function writeStored(text: string, slow: boolean, blob: Blob) {
  try {
    const c = await ttsStore();
    if (!c) return;
    await c.put(storeKey(text, slow), new Response(blob, { headers: { 'content-type': blob.type || 'audio/mpeg' } }));
    // Найстаріші записи прибираємо зрідка, щоб не перелічувати кеш на кожну фразу.
    if (++stored % 40 === 0) {
      const keys = await c.keys();
      for (const k of keys.slice(0, Math.max(0, keys.length - TTS_CACHE_MAX))) await c.delete(k);
    }
  } catch {
    /* сховище недоступне або переповнене */
  }
}

// Попереднє завантаження не з'їдає ліміт /tts (120 на хвилину): мережевих запитів наперед — не більше 40 на хвилину.
// Готові файли бібліотеки не коштують кредитів, але ліміт той самий: запити наперед не заважають натисканням.
const PREFETCH_PER_MIN = 40;
const prefetchTimes: number[] = [];
function prefetchBudget(): boolean {
  const now = Date.now();
  while (prefetchTimes.length && now - prefetchTimes[0] > 60_000) prefetchTimes.shift();
  if (prefetchTimes.length >= PREFETCH_PER_MIN) return false;
  prefetchTimes.push(now);
  return true;
}

const blobCache = new Map<string, string>();
const pendingAudio = new Map<string, Promise<string>>();
async function serverAudio(text: string, slowRequested: boolean, prefetch = false): Promise<string> {
  // У бібліотеці один файл на обидві швидкості.
  const slow = library ? false : slowRequested;
  const k = `${voiceTag}|${keyOf(text, slow)}`;
  if (missing.has(k)) throw new Error('audio_missing');
  const hit = blobCache.get(k);
  if (hit) return hit;
  const pending = pendingAudio.get(k);
  if (pending) return pending;
  const task = (async () => {
    let blob = await readStored(text, slow);
    if (!blob) {
      if (prefetch && !prefetchBudget()) throw new Error('prefetch_budget');
      try {
        blob = await apiBlob(`/tts?text=${encodeURIComponent(speechText(text))}&rate=${slow ? 'slow' : 'normal'}${voiceTag ? `&v=${voiceTag}` : ''}`);
      } catch (e) {
        // 404 — у бібліотеці немає файлу цього тексту (сервер його не синтезує): до кінця сесії не питаємо знову.
        if (library && (e as { status?: number }).status === 404) missing.add(k);
        throw e;
      }
      if (!blob.size) throw new Error('empty_audio');
      void writeStored(text, slow, blob);
    }
    const url = URL.createObjectURL(blob);
    blobCache.set(k, url);
    if (blobCache.size > 300) {
      const [first] = blobCache.keys();
      URL.revokeObjectURL(blobCache.get(first)!);
      blobCache.delete(first);
    }
    return url;
  })();
  pendingAudio.set(k, task);
  try { return await task; } finally { pendingAudio.delete(k); }
}

let cancelPlayback: (() => void) | null = null;

function playElement(src: string, rate: number, onStart: () => void): Promise<void> {
  if (!el) return Promise.reject(new Error('no_audio'));
  return new Promise((resolve, reject) => {
    let playing = false;
    const timer = setTimeout(() => { finish(new Error('playback')); el.pause(); }, 15_000);
    let finished = false;
    const finish = (error?: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      el.onended = el.onpause = el.onerror = el.onplaying = el.onloadedmetadata = null;
      cancelPlayback = null;
      error ? reject(error) : resolve();
    };
    cancelPlayback = () => { finish(); el.pause(); };
    el.onended = () => finish();
    // Пауза рахується лише після початку саме цього відтворення (зміна src теж генерує pause).
    el.onpause = () => { if (playing) finish(); };
    el.onerror = () => finish(new Error('playback'));
    el.onplaying = () => {
      playing = true;
      clearTimeout(timer);
      onStart();
    };
    el.src = src;
    el.playbackRate = rate;
    // Safari скидає швидкість після завантаження нового джерела — повторюємо, коли метадані готові.
    el.onloadedmetadata = () => {
      el.playbackRate = rate;
    };
    (el as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
    el.play().catch((e: Error) => finish(e.name === 'NotAllowedError' ? new Error('blocked') : e));
  });
}

export const ttsAvailable = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

// Список голосів починаємо завантажувати одразу при старті — до першого натискання.
if (ttsAvailable()) {
  try {
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener?.('voiceschanged', () => speechSynthesis.getVoices());
  } catch {
    /* немає підтримки */
  }
}

/** Голоси пристрою завантажуються асинхронно — чекаємо подію voiceschanged (до 600 мс, щоб не втратити жест). */
function deviceVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!ttsAvailable()) return Promise.resolve([]);
  const now = speechSynthesis.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => resolve(speechSynthesis.getVoices());
    speechSynthesis.addEventListener('voiceschanged', done, { once: true });
    setTimeout(done, 600);
  });
}

/** Польський голос пристрою (або null) — для діагностики в налаштуваннях. */
export async function devicePolishVoice() {
  return pickPolishVoice(await deviceVoices());
}

async function speakDevice(text: string, slow: boolean, onStart: (unverified: boolean) => void, active: () => boolean): Promise<void> {
  if (!ttsAvailable()) throw new Error('no_polish_voice');
  // Якщо голоси вже завантажені — без await: iOS не втрачає жест користувача.
  const ready = speechSynthesis.getVoices();
  const voices = ready.length ? ready : await deviceVoices();
  const voice = pickPolishVoice(voices);
  // Без підтвердженого польського голосу — помилка: мовний fallback системи може бути чужим.
  // Виняток — «м'яка» політика і порожній список голосів (див. DeviceVoicePolicy): тоді лише pl-PL з позначкою.
  const unverified = !voice && deviceVoicePolicy === 'soft' && voices.length === 0;
  if (!voice && !unverified) throw new Error('no_polish_voice');
  if (!active()) return;
  return new Promise((resolve, reject) => {
    // WebKit іноді «ковтає» репліку, якщо speak() викликати одразу після cancel() під час мовлення.
    const busy = speechSynthesis.speaking || speechSynthesis.pending;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(speechText(text));
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'pl-PL';
    u.rate = slow ? 0.7 : 0.95;
    const timer = setTimeout(() => { finish(new Error('playback')); speechSynthesis.cancel(); }, 15_000);
    let finished = false;
    const finish = (error?: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      u.onstart = u.onend = u.onerror = null;
      cancelPlayback = null;
      error ? reject(error) : resolve();
    };
    cancelPlayback = () => finish();
    u.onstart = () => { clearTimeout(timer); onStart(unverified); };
    u.onend = () => finish();
    u.onerror = (e) => finish(e.error === 'interrupted' || e.error === 'canceled' ? undefined : new Error('playback'));
    if (busy) setTimeout(() => { if (active()) speechSynthesis.speak(u); else finish(); }, 80);
    else if (active()) speechSynthesis.speak(u);
    else finish();
  });
}

/**
 * Попереднє завантаження озвучки (лише сервер, з бюджетом запитів; помилки ігноруються).
 * Без limit — найближчі 6 фраз; урок на старті передає всі свої фрази й більший limit: вони вантажаться по дві,
 * у паузах браузера, щоб не гальмувати інтерфейс.
 */
export function prefetchSpeech(texts: (string | null | undefined)[], limit = 6) {
  if (!serverTts) return;
  const queue = [...new Set(texts.filter((t): t is string => !!t && !!speechText(t) && !isLoneLetter(t)))].slice(0, limit);
  if (limit <= 6) {
    for (const t of queue) void serverAudio(t, false, true).catch(() => {});
    return;
  }
  const idle = (fn: () => void) => ((window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200)))(fn);
  const next = () => {
    const t = queue.shift();
    if (!t) return;
    idle(() => void serverAudio(t, false, true).catch(() => {}).finally(next));
  };
  next();
  next();
}

let seq = 0;

export function stopSpeech() {
  seq++;
  cancelPlayback?.();
  if (ttsAvailable()) speechSynthesis.cancel();
  if (el && !el.paused) el.pause();
  if (state.status !== 'idle') set({ key: null, status: 'idle', issue: null });
}

/** Озвучити польський текст. Повторне натискання перезапускає, а не ставить у чергу. */
/** Звідки реально пішов звук (подія playing / onstart), а не лише «запит успішний». */
export type SpeechSource = 'recording' | 'server' | 'device';
export type SpeechOutcome = { played: boolean; source: SpeechSource | null; issue: SpeechIssue };

export async function speak(text: string, opts: { url?: string | null; slow?: boolean } = {}): Promise<SpeechOutcome> {
  const slow = !!opts.slow;
  const k = keyOf(text, slow);
  // Окрему літеру голос прочитав би як її назву («duże wu»), а не як прийменник — не озвучуємо.
  if (!speechText(text) || isLoneLetter(text)) return { played: false, source: null, issue: null };
  stopSpeech();
  const my = ++seq;
  const mine = () => my === seq;
  set({ key: k, status: 'loading', issue: null });
  let source: SpeechSource | null = null;
  let unverifiedVoice = false;
  const started = (from: SpeechSource, unverified = false) => {
    if (!mine()) return;
    source = from;
    unverifiedVoice = unverified;
    set({ key: k, status: 'playing', issue: unverified ? 'unverified_voice' : null });
  };
  // Серверний синтез → голос пристрою. Якщо сервер був, але не відповів, а голосу пристрою немає, — це мережа.
  const synthesize = async () => {
    if (serverTts) {
      let src: string | null = null;
      try {
        src = await serverAudio(text, slow);
      } catch {
        src = null;
      }
      if (!mine()) return;
      if (src) {
        try {
          await playElement(src, library && slow ? SPEECH_RATES.slow : 1, () => started('server'));
          return;
        } catch (e) {
          // Автовідтворення заборонене — голос пристрою теж не допоможе; інакше пробуємо пристрій.
          if ((e as Error).message === 'blocked' || !mine()) throw e;
        }
      }
      await speakDevice(text, slow, (u) => started('device', u), mine).catch((e: Error) => Promise.reject(e.message === 'no_polish_voice' ? new Error('network') : e));
    } else {
      await speakDevice(text, slow, (u) => started('device', u), mine);
    }
  };
  try {
    if (opts.url) {
      try {
        await playElement(assetUrl(opts.url), slow ? 0.8 : 1, () => started('recording'));
      } catch (e) {
        // Запис не відтворився (немає файлу, мережа, формат) — та сама фраза із синтезу.
        if ((e as Error).message === 'blocked' || !mine()) throw e;
        await synthesize();
      }
    } else {
      await synthesize();
    }
    if (mine()) set({ key: null, status: 'idle', issue: null });
    return { played: source !== null, source, issue: unverifiedVoice ? 'unverified_voice' : null };
  } catch (e) {
    const msg = (e as Error).message;
    const issue: SpeechIssue = msg === 'no_polish_voice' ? 'no_polish_voice' : msg === 'blocked' ? 'blocked' : 'network';
    if (mine()) set({ key: k, status: 'error', issue });
    return { played: source !== null, source, issue };
  }
}

let ctx: AudioContext | null = null;
function tone(freqs: number[], dur = 0.12, type: OscillatorType = 'sine', gain = 0.08) {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    let t = ctx.currentTime;
    for (const f of freqs) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + dur);
      t += dur * 0.8;
    }
  } catch {
    /* аудіо недоступне */
  }
}

export const sfx = {
  correct: () => tone([660, 880], 0.12, 'triangle'),
  wrong: () => tone([220, 180], 0.16, 'square', 0.04),
  tap: () => tone([520], 0.05, 'sine', 0.03),
  win: () => tone([523, 659, 784, 1047], 0.14, 'triangle'),
  coin: () => tone([988, 1319], 0.09, 'square', 0.03),
};

export { recognizePolish, speechRecognitionAvailable } from './recognition';
