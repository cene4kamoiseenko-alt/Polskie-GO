import { useSyncExternalStore } from 'react';
import { SPEECH_RATES, audioNorm, isLoneLetter, speechText } from '@polski-go/shared';
import { API_BASE, api, assetUrl } from './api';

/**
 * Польська озвучка — лише готові MP3 аудіобібліотеки (голос Kamil) з R2 через Worker (docs/AUDIO_LIBRARY_RU.md).
 * Натискання динаміка: audio_id = sha256(audioNorm(текст)) → {base}{audio_id}.mp3 → відтворення. Повтор — той самий
 * файл: пам'ять сесії → Cache Storage (переживає перезапуск Mini App) → HTTP-кеш браузера (файл незмінний).
 * Файлу немає → «Озвучка скоро появится», кнопка приглушена. Синтезу немає ніде: ні серверного на запит, ні голосу
 * пристрою (speechSynthesis), ні підміни іншим голосом. Записи, завантажені в адмінці (url), грають як є.
 * Нове відтворення завжди зупиняє попереднє — черги з накладених голосів не буває.
 */
let enabled = true;
export function setSoundEnabled(v: boolean) {
  enabled = v;
}

/** Адреса файлів бібліотеки з профілю (/api/audio/<відбиток>/): відбиток голосу й версії — частина адреси й ключів кешу. */
let base: string | null = null;
export function configureAudio(opts: { base?: string | null }) {
  const next = opts.base ?? null;
  if (next === base) return;
  // Інший голос чи версія — інші файли: забуваємо «файлу немає» й object URL старого голосу, кнопки перемальовуються.
  base = next;
  missing.clear();
  for (const url of blobCache.values()) URL.revokeObjectURL(url);
  blobCache.clear();
  missingVersion++;
  emit();
}

export type SpeechStatus = 'idle' | 'loading' | 'playing' | 'error';
/** missing — файлу ще немає («Озвучка скоро появится»); network — не завантажився; blocked — браузер не дав грати. */
export type SpeechIssue = 'missing' | 'network' | 'blocked' | null;
type State = { key: string | null; status: SpeechStatus; issue: SpeechIssue };

let state: State = { key: null, status: 'idle', issue: null };
/** Тексти (audioNorm), для яких у бібліотеці немає файлу: кнопка приглушена, повторних запитів до кінця сесії немає. */
const missing = new Set<string>();
let missingVersion = 0;
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function set(next: State) {
  state = next;
  emit();
}
function markMissing(norm: string) {
  if (missing.has(norm)) return;
  missing.add(norm);
  missingVersion++;
  emit();
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

/** Чи відомо, що для тексту ще немає готового файлу (кнопка приглушена ще до натискання). */
export function useAudioMissing(text: string): boolean {
  useSyncExternalStore(subscribe, () => missingVersion);
  return !base || missing.has(audioNorm(text));
}

const keyOf = (text: string, slow: boolean) => `${slow ? 's' : 'n'}|${speechText(text)}`;

/** audio_id — як у каталозі (services/audio-catalog.ts): sha256 нормалізованого тексту, 64 шістнадцяткові символи. */
export async function audioIdOf(text: string): Promise<string | null> {
  const norm = audioNorm(text);
  if (!norm || typeof crypto === 'undefined' || !crypto.subtle) return null;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(norm));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

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
  };
  document.addEventListener('pointerdown', unlock, { once: true, capture: true });
}

// ── Кеш готових файлів ──
// 1) blobCache — object URL у пам'яті (миттєво в межах сесії);
// 2) Cache Storage — переживає перезапуск Mini App. Будь-яка помилка сховища = промах, не збій озвучки.
// Ключ — адреса файлу з відбитком голосу: файли іншого голосу чи версії не грають.
const AUDIO_CACHE = 'pg-audio-v3';
const AUDIO_CACHE_MAX = 1500;
let oldStoresDropped = false;
async function audioStore(): Promise<Cache | null> {
  try {
    if (typeof caches === 'undefined') return null;
    // Старі кеші синтезу на запит (pg-tts-v1/v2) могли містити інший голос: прибираємо один раз.
    if (!oldStoresDropped) {
      oldStoresDropped = true;
      for (const name of ['pg-tts-v1', 'pg-tts-v2']) {
        try {
          void caches.delete(name).catch(() => {});
        } catch {
          /* немає delete — нема чого прибирати */
        }
      }
    }
    return await caches.open(AUDIO_CACHE);
  } catch {
    return null;
  }
}
async function readStored(url: string): Promise<Blob | null> {
  try {
    const hit = await (await audioStore())?.match(url);
    const blob = hit ? await hit.blob() : null;
    return blob?.size ? blob : null;
  } catch {
    return null;
  }
}
let stored = 0;
async function writeStored(url: string, blob: Blob) {
  try {
    const c = await audioStore();
    if (!c) return;
    await c.put(url, new Response(blob, { headers: { 'content-type': 'audio/mpeg' } }));
    // Найстаріші записи прибираємо зрідка, щоб не перелічувати кеш на кожну фразу.
    if (++stored % 40 === 0) {
      const keys = await c.keys();
      for (const k of keys.slice(0, Math.max(0, keys.length - AUDIO_CACHE_MAX))) await c.delete(k);
    }
  } catch {
    /* сховище недоступне або переповнене */
  }
}

// Попереднє завантаження — не більше 40 запитів на хвилину, щоб не заважати натисканням.
const PREFETCH_PER_MIN = 40;
const prefetchTimes: number[] = [];
function prefetchBudget(): boolean {
  const now = Date.now();
  while (prefetchTimes.length && now - prefetchTimes[0] > 60_000) prefetchTimes.shift();
  if (prefetchTimes.length >= PREFETCH_PER_MIN) return false;
  prefetchTimes.push(now);
  return true;
}

class AudioMissing extends Error {
  constructor() {
    super('audio_missing');
  }
}

const blobCache = new Map<string, string>();
const pendingAudio = new Map<string, Promise<string>>();
/** Object URL готового файлу тексту. Немає адреси бібліотеки, id чи файлу (404) → AudioMissing; мережа → Error. */
async function libraryAudio(text: string, prefetch = false): Promise<string> {
  const norm = audioNorm(text);
  if (!base || !norm || missing.has(norm)) throw new AudioMissing();
  const hit = blobCache.get(norm);
  if (hit) return hit;
  const pending = pendingAudio.get(norm);
  if (pending) return pending;
  const task = (async () => {
    const id = await audioIdOf(text);
    if (!id) throw new AudioMissing();
    const url = `${API_BASE}${base}${id}.mp3`;
    let blob = await readStored(url);
    if (!blob) {
      if (prefetch && !prefetchBudget()) throw new Error('prefetch_budget');
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 30_000);
      let res: Response;
      try {
        res = await fetch(url, { signal: ctl.signal });
      } finally {
        clearTimeout(timer);
      }
      if (res.status === 404) {
        markMissing(norm);
        throw new AudioMissing();
      }
      if (!res.ok) throw new Error('network');
      blob = await res.blob();
      if (!blob.size) throw new Error('network');
      void writeStored(url, blob);
    }
    const objectUrl = URL.createObjectURL(blob);
    blobCache.set(norm, objectUrl);
    if (blobCache.size > 300) {
      const [first] = blobCache.keys();
      URL.revokeObjectURL(blobCache.get(first)!);
      blobCache.delete(first);
    }
    return objectUrl;
  })();
  pendingAudio.set(norm, task);
  try {
    return await task;
  } finally {
    pendingAudio.delete(norm);
  }
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

/**
 * Попереднє завантаження готових файлів (помилки ігноруються; відсутні файли позначаються — кнопки приглушуються
 * ще до натискання). Без limit — найближчі 6 фраз; урок на старті передає всі свої фрази й більший limit:
 * вони вантажаться по дві, у паузах браузера, щоб не гальмувати інтерфейс. Синтезу тут немає.
 */
export function prefetchSpeech(texts: (string | null | undefined)[], limit = 6) {
  if (!base) return;
  const queue = [...new Set(texts.filter((t): t is string => !!t && !!speechText(t) && !isLoneLetter(t)))].slice(0, limit);
  if (limit <= 6) {
    for (const t of queue) void libraryAudio(t, true).catch(() => {});
    return;
  }
  const idle = (fn: () => void) => ((window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200)))(fn);
  const next = () => {
    const t = queue.shift();
    if (!t) return;
    idle(() => void libraryAudio(t, true).catch(() => {}).finally(next));
  };
  next();
  next();
}

let seq = 0;

export function stopSpeech() {
  seq++;
  cancelPlayback?.();
  if (el && !el.paused) el.pause();
  if (state.status !== 'idle') set({ key: null, status: 'idle', issue: null });
}

/** Натискання на текст без файлу — у лічильник «Просили, но файла нет» адмінки (раз за сесію на текст). */
const reported = new Set<string>();
function reportMissing(text: string) {
  const norm = audioNorm(text);
  if (!norm || reported.has(norm) || !base) return;
  reported.add(norm);
  void api('/audio/miss', { body: { text: speechText(text).slice(0, 300) } }).catch(() => {});
}

/** Звідки реально пішов звук (подія playing), а не лише «запит успішний». */
export type SpeechSource = 'recording' | 'library';
export type SpeechOutcome = { played: boolean; source: SpeechSource | null; issue: SpeechIssue };

/** Озвучити польський текст готовим файлом. Повторне натискання перезапускає, а не ставить у чергу. */
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
  const started = (from: SpeechSource) => {
    if (!mine()) return;
    source = from;
    set({ key: k, status: 'playing', issue: null });
  };
  // Повільно — той самий файл із меншою швидкістю (окремого синтезу немає).
  const fromLibrary = async () => {
    const src = await libraryAudio(text);
    if (!mine()) return;
    await playElement(src, slow ? SPEECH_RATES.slow : 1, () => started('library'));
  };
  try {
    if (opts.url) {
      try {
        await playElement(assetUrl(opts.url), slow ? 0.8 : 1, () => started('recording'));
      } catch (e) {
        // Запис не відтворився (немає файлу, мережа, формат) — та сама фраза з бібліотеки.
        if ((e as Error).message === 'blocked' || !mine()) throw e;
        await fromLibrary();
      }
    } else {
      await fromLibrary();
    }
    if (mine()) set({ key: null, status: 'idle', issue: null });
    return { played: source !== null, source, issue: null };
  } catch (e) {
    const issue: SpeechIssue = e instanceof AudioMissing ? 'missing' : (e as Error).message === 'blocked' ? 'blocked' : 'network';
    if (issue === 'missing') reportMissing(text);
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
