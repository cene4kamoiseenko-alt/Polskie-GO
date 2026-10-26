import { blockLevel, encodeSpeechWav, hasVoiceActivity, MAX_SPEECH_SECONDS, MIN_SPEECH_SECONDS } from '@polski-go/shared';
import workletUrl from './recorder.worklet.js?url';
import { transcribeAudio, type Transcription } from './api';
import type { RecognitionRun } from './recognition';
export function microphoneRecordingAvailable() {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof AudioContext !== 'undefined' && typeof AudioWorkletNode !== 'undefined';
}
export type RecordingHooks = {
  /** Мікрофон увімкнено, йде запис (після дозволу й запуску аудіо). */
  onStart?: () => void;
  /** Рівень сигналу 0..1, ≈10 разів на секунду. */
  onLevel?: (level: number) => void;
  /** Запис зупинено, чекаємо на розпізнавання. */
  onProcessing?: () => void;
  /** Завдання уроку, до якого прив'язується серверна спроба (без нього — лише тренування). */
  bind?: { session: string; item: string };
};

/**
 * Explicit recording only; cancellation releases hardware even if permission resolves later.
 * Тиша (немає кадрів із голосом) не надсилається на сервер: помилка 'silence'; запис коротший за MIN_SPEECH_SECONDS — 'too-short'.
 */
export function recognizeRecordedPolish({ onStart, onLevel, onProcessing, bind }: RecordingHooks = {}): RecognitionRun<Transcription> {
  const ctrl = new AbortController();
  let stream: MediaStream | null = null;
  let ctx: AudioContext | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let node: AudioWorkletNode | null = null;
  let done = false, finishing = false, wantStop = false;
  let timer: ReturnType<typeof setTimeout>;
  let settle: (text?: Transcription, error?: Error) => void = () => {};
  const chunks: Float32Array[] = [];
  const cleanup = () => {
    clearTimeout(timer);
    if (node) { node.port.onmessage = null; node.disconnect(); }
    source?.disconnect();
    stream?.getTracks().forEach(t => t.stop());
    if (ctx && ctx.state !== 'closed') void ctx.close().catch(() => {});
  };
  const finish = async () => {
    if (done || finishing) return;
    if (!node || !ctx) { wantStop = true; return; }
    finishing = true;
    const rate = ctx.sampleRate;
    cleanup(); // Release mic before waiting for network.
    onProcessing?.();
    try {
      const seconds = chunks.reduce((n, c) => n + c.length, 0) / rate;
      if (seconds < MIN_SPEECH_SECONDS) throw new Error('too-short');
      if (!hasVoiceActivity(chunks, rate)) throw new Error('silence');
      const wav = encodeSpeechWav(chunks, rate);
      settle(await transcribeAudio(wav, ctrl.signal, bind));
    } catch (e) { settle(undefined, e as Error); }
  };
  const promise = new Promise<Transcription>((resolve, reject) => {
    settle = (text, error) => {
      if (done) return;
      done = true; cleanup();
      error ? reject(error) : resolve(text!);
    };
    // Includes permission/module startup, which may otherwise remain pending forever.
    timer = setTimeout(() => { ctrl.abort(); settle(undefined, new Error('timeout')); }, 40_000);
    void (async () => {
      try {
        if (!microphoneRecordingAvailable()) throw new Error('unsupported');
        ctx = new AudioContext();
        await ctx.resume();
        if (done) return;
        stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true }, video: false });
        if (done) { stream.getTracks().forEach(t => t.stop()); return; }
        await ctx.audioWorklet.addModule(workletUrl);
        if (done) return;
        node = new AudioWorkletNode(ctx, 'speech-capture');
        source = ctx.createMediaStreamSource(stream);
        let samples = 0, peak = 0, lastLevel = 0;
        node.port.onmessage = (e: MessageEvent<Float32Array>) => {
          if (done || finishing) return;
          const remaining = Math.floor(ctx!.sampleRate * MAX_SPEECH_SECONDS) - samples;
          if (remaining <= 0) { void finish(); return; }
          const chunk = e.data.length > remaining ? e.data.slice(0, remaining) : e.data;
          samples += chunk.length; chunks.push(chunk);
          if (onLevel) {
            peak = Math.max(peak, blockLevel(chunk));
            const now = performance.now();
            if (now - lastLevel >= 100) { onLevel(peak); peak = 0; lastLevel = now; }
          }
        };
        source.connect(node); node.connect(ctx.destination);
        onStart?.();
        clearTimeout(timer);
        timer = setTimeout(() => void finish(), MAX_SPEECH_SECONDS * 1000);
        if (wantStop) void finish();
      } catch (e) {
        const error = e as Error;
        settle(undefined, new Error(error.name === 'NotAllowedError' ? 'not-allowed' : error.name === 'NotFoundError' ? 'audio-capture' : error.message));
      }
    })();
  });
  return {
    promise, stop: () => { void finish(); },
    cancel: () => { ctrl.abort(); settle(undefined, new Error('aborted')); },
  };
}
