import { encodeSpeechWav, MAX_SPEECH_SECONDS } from '@polski-go/shared';
import workletUrl from './recorder.worklet.js?url';
import { transcribeAudio } from './api';
import type { RecognitionRun } from './recognition';
export function microphoneRecordingAvailable() {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof AudioContext !== 'undefined' && typeof AudioWorkletNode !== 'undefined';
}
/** Explicit recording only; cancellation releases hardware even if permission resolves later. */
export function recognizeRecordedPolish(onProcessing: () => void): RecognitionRun {
  const ctrl = new AbortController();
  let stream: MediaStream | null = null;
  let ctx: AudioContext | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let node: AudioWorkletNode | null = null;
  let done = false, finishing = false, wantStop = false;
  let timer: ReturnType<typeof setTimeout>;
  let settle: (text?: string, error?: Error) => void = () => {};
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
    onProcessing();
    try {
      const wav = encodeSpeechWav(chunks, rate);
      if (wav.length < 3244) throw new Error('no-speech');
      const transcript = await transcribeAudio(wav, ctrl.signal);
      settle(transcript);
    } catch (e) { settle(undefined, e as Error); }
  };
  const promise = new Promise<string>((resolve, reject) => {
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
        let samples = 0;
        node.port.onmessage = (e: MessageEvent<Float32Array>) => {
          if (done || finishing) return;
          const remaining = Math.floor(ctx!.sampleRate * MAX_SPEECH_SECONDS) - samples;
          if (remaining <= 0) { void finish(); return; }
          const chunk = e.data.length > remaining ? e.data.slice(0, remaining) : e.data;
          samples += chunk.length; chunks.push(chunk);
        };
        source.connect(node); node.connect(ctx.destination);
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
