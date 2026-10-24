/** Озвучування польською (Web Speech API), звукові ефекти та розпізнавання мовлення. */
let enabled = true;
export function setSoundEnabled(v: boolean) {
  enabled = v;
}

let plVoice: SpeechSynthesisVoice | null = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  plVoice = voices.find((v) => v.lang?.toLowerCase().startsWith('pl')) ?? null;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

export const ttsAvailable = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Озвучити польський текст. Якщо є записаний аудіофайл — використовується він. */
export function speak(text: string, opts: { url?: string; slow?: boolean } = {}) {
  if (opts.url) {
    void new Audio(opts.url).play().catch(() => speak(text, { slow: opts.slow }));
    return;
  }
  if (!ttsAvailable()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'pl-PL';
  if (plVoice) u.voice = plVoice;
  u.rate = opts.slow ? 0.6 : 0.9;
  speechSynthesis.speak(u);
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
