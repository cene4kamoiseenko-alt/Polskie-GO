import { useSyncExternalStore } from 'react';
import { pickPolishVoice, speechText } from '@polski-go/shared';
import { apiBlob, assetUrl } from './api';

/**
 * Польська озвучка.
 * Порядок джерел: записаний аудіофайл → серверний синтез pl-PL (кеш) → польський голос пристрою.
 * Голос іншої мови не використовується ніколи: без польського голосу показується зрозумілий стан.
 * Нове відтворення завжди зупиняє попереднє — черги з накладених голосів не буває.
 */
let enabled = true;
export function setSoundEnabled(v: boolean) {
  enabled = v;
}

let serverTts = false;
export function configureAudio(opts: { server: boolean }) {
  serverTts = opts.server;
}

export type SpeechStatus = 'idle' | 'loading' | 'playing' | 'error';
export type SpeechIssue = 'no_polish_voice' | 'network' | 'blocked' | null;
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
    if (el.src) return;
    el.src = SILENT;
    void el.play().catch(() => {});
  };
  document.addEventListener('pointerdown', unlock, { once: true, capture: true });
}

const blobCache = new Map<string, string>();
async function serverAudio(text: string, slow: boolean): Promise<string> {
  const k = keyOf(text, slow);
  const hit = blobCache.get(k);
  if (hit) return hit;
  const blob = await apiBlob(`/tts?text=${encodeURIComponent(speechText(text))}&rate=${slow ? 'slow' : 'normal'}`);
  const url = URL.createObjectURL(blob);
  blobCache.set(k, url);
  if (blobCache.size > 300) {
    const [first] = blobCache.keys();
    URL.revokeObjectURL(blobCache.get(first)!);
    blobCache.delete(first);
  }
  return url;
}

function playElement(src: string, rate: number, onStart: () => void): Promise<void> {
  if (!el) return Promise.reject(new Error('no_audio'));
  return new Promise((resolve, reject) => {
    let playing = false;
    el.onended = () => resolve();
    // Пауза рахується лише після початку саме цього відтворення (зміна src теж генерує pause).
    el.onpause = () => playing && resolve();
    el.onerror = () => reject(new Error('playback'));
    el.onplaying = () => {
      playing = true;
      onStart();
    };
    el.src = src;
    el.playbackRate = rate;
    (el as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
    el.play().catch((e: Error) => reject(e.name === 'NotAllowedError' ? new Error('blocked') : e));
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

async function speakDevice(text: string, slow: boolean, onStart: () => void): Promise<void> {
  if (!ttsAvailable()) throw new Error('no_polish_voice');
  const voices = await deviceVoices();
  const voice = pickPolishVoice(voices);
  // Список голосів не порожній, але польського немає — не читаємо чужим голосом.
  // Порожній список (iOS WebView не завжди його віддає) — просимо систему саме pl-PL.
  if (!voice && voices.length) throw new Error('no_polish_voice');
  return new Promise((resolve, reject) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(speechText(text));
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'pl-PL';
    u.rate = slow ? 0.7 : 0.95;
    u.onstart = onStart;
    u.onend = () => resolve();
    u.onerror = (e) => (e.error === 'interrupted' || e.error === 'canceled' ? resolve() : reject(new Error('playback')));
    speechSynthesis.speak(u);
  });
}

/** Попереднє завантаження озвучки найближчих фраз (лише серверний синтез; помилки ігноруються). */
export function prefetchSpeech(texts: (string | null | undefined)[]) {
  if (!serverTts) return;
  for (const t of texts.slice(0, 6)) if (t && speechText(t)) void serverAudio(t, false).catch(() => {});
}

let seq = 0;

export function stopSpeech() {
  seq++;
  if (ttsAvailable()) speechSynthesis.cancel();
  if (el && !el.paused) el.pause();
  if (state.status !== 'idle') set({ key: null, status: 'idle', issue: null });
}

/** Озвучити польський текст. Повторне натискання перезапускає, а не ставить у чергу. */
export async function speak(text: string, opts: { url?: string | null; slow?: boolean } = {}): Promise<void> {
  const slow = !!opts.slow;
  const k = keyOf(text, slow);
  if (!speechText(text)) return;
  stopSpeech();
  const my = ++seq;
  const mine = () => my === seq;
  set({ key: k, status: 'loading', issue: null });
  const started = () => mine() && set({ key: k, status: 'playing', issue: null });
  try {
    if (opts.url) {
      await playElement(assetUrl(opts.url), slow ? 0.8 : 1, started);
    } else if (serverTts) {
      let src: string | null = null;
      try {
        src = await serverAudio(text, slow);
      } catch {
        src = null;
      }
      if (!mine()) return;
      if (src) await playElement(src, 1, started);
      else await speakDevice(text, slow, started).catch((e: Error) => Promise.reject(e.message === 'no_polish_voice' ? new Error('network') : e));
    } else {
      await speakDevice(text, slow, started);
    }
    if (mine()) set({ key: null, status: 'idle', issue: null });
  } catch (e) {
    if (!mine()) return;
    const msg = (e as Error).message;
    set({ key: k, status: 'error', issue: msg === 'no_polish_voice' ? 'no_polish_voice' : msg === 'blocked' ? 'blocked' : 'network' });
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

type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export function speechRecognitionAvailable() {
  const w = window as unknown as Record<string, unknown>;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

/** Розпізнати польське мовлення. Це розпізнавання тексту, не фонетична оцінка вимови. */
export function recognizePolish(): { promise: Promise<string>; stop: () => void } {
  const w = window as unknown as Record<string, new () => Recognition>;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return { promise: Promise.reject(new Error('unsupported')), stop: () => {} };
  const rec = new Ctor();
  rec.lang = 'pl-PL';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  const promise = new Promise<string>((resolve, reject) => {
    let done = false;
    rec.onresult = (e) => {
      done = true;
      resolve(e.results[0]?.[0]?.transcript ?? '');
    };
    rec.onerror = (e) => {
      done = true;
      reject(new Error(e.error));
    };
    rec.onend = () => {
      if (!done) resolve('');
    };
  });
  rec.start();
  return { promise, stop: () => rec.stop() };
}
