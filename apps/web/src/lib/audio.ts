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

const blobCache = new Map<string, string>();
const pendingAudio = new Map<string, Promise<string>>();
async function serverAudio(text: string, slow: boolean): Promise<string> {
  const k = keyOf(text, slow);
  const hit = blobCache.get(k);
  if (hit) return hit;
  const pending = pendingAudio.get(k);
  if (pending) return pending;
  const task = (async () => {
    const blob = await apiBlob(`/tts?text=${encodeURIComponent(speechText(text))}&rate=${slow ? 'slow' : 'normal'}`);
    if (!blob.size) throw new Error('empty_audio');
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

async function speakDevice(text: string, slow: boolean, onStart: () => void, active: () => boolean): Promise<void> {
  if (!ttsAvailable()) throw new Error('no_polish_voice');
  // Якщо голоси вже завантажені — без await: iOS не втрачає жест користувача.
  const ready = speechSynthesis.getVoices();
  const voices = ready.length ? ready : await deviceVoices();
  const voice = pickPolishVoice(voices);
  // Без підтвердженого польського голосу показуємо помилку: мовний fallback системи може бути чужим.
  if (!voice) throw new Error('no_polish_voice');
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
    u.onstart = () => { clearTimeout(timer); onStart(); };
    u.onend = () => finish();
    u.onerror = (e) => finish(e.error === 'interrupted' || e.error === 'canceled' ? undefined : new Error('playback'));
    if (busy) setTimeout(() => { if (active()) speechSynthesis.speak(u); else finish(); }, 80);
    else if (active()) speechSynthesis.speak(u);
    else finish();
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
  cancelPlayback?.();
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
      else await speakDevice(text, slow, started, mine).catch((e: Error) => Promise.reject(e.message === 'no_polish_voice' ? new Error('network') : e));
    } else {
      await speakDevice(text, slow, started, mine);
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

export { recognizePolish, speechRecognitionAvailable } from './recognition';
