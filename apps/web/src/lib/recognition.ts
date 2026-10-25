/** Browser speech recognition: text matching, not a phonetic pronunciation score. */
type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type Constructor = new () => Recognition;
function constructor(): Constructor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { SpeechRecognition?: Constructor; webkitSpeechRecognition?: Constructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}
export function speechRecognitionAvailable() {
  return !!constructor();
}
export type RecognitionRun<T = string> = { promise: Promise<T>; stop: () => void; cancel: () => void };
export function recognizePolish(): RecognitionRun {
  const Ctor = constructor();
  if (!Ctor) return { promise: Promise.reject(new Error('unsupported')), stop() {}, cancel() {} };
  let rec: Recognition;
  try { rec = new Ctor(); } catch { return { promise: Promise.reject(new Error('unsupported')), stop() {}, cancel() {} }; }
  rec.lang = 'pl-PL';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  let settle: (text?: string, error?: string) => void = () => {};
  const promise = new Promise<string>((resolve, reject) => {
    let done = false;
    const timer = setTimeout(() => {
      settle(undefined, 'timeout');
      try { rec.abort(); } catch { /* already ended */ }
    }, 30_000);
    settle = (text, error) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      rec.onresult = rec.onerror = rec.onend = null;
      if (error) reject(new Error(error));
      else if (!text?.trim()) reject(new Error('no-speech'));
      else resolve(text.trim());
    };
    rec.onresult = (e) => settle(e.results[0]?.[0]?.transcript);
    rec.onerror = (e) => settle(undefined, e.error);
    rec.onend = () => settle(undefined, 'no-speech');
    try { rec.start(); } catch { settle(undefined, 'start-failed'); }
  });
  return {
    promise,
    stop: () => { try { rec.stop(); } catch { settle(undefined, 'start-failed'); } },
    cancel: () => {
      settle(undefined, 'aborted');
      try { rec.abort(); } catch { /* already ended */ }
    },
  };
}
