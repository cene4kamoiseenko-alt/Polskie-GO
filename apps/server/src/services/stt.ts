import { MAX_SPEECH_BYTES, validSpeechWav } from '@polski-go/shared';
import { getBindings } from '../env';
import { HttpError } from '../lib/errors';
export { MAX_SPEECH_BYTES };
/** Explicit opt-in: adding TTS credentials never enables microphone processing automatically. */
export function sttStatus() {
  const e = getBindings();
  const configured = e.AZURE_STT_ENABLED === 'true' && !!e.AZURE_SPEECH_KEY && /^[a-z0-9-]{2,40}$/.test(e.AZURE_SPEECH_REGION ?? '');
  return { configured, provider: configured ? 'azure' : null, language: 'pl-PL' };
}
export async function transcribeSpeech(bytes: Uint8Array): Promise<{ transcript: string; language: string }> {
  if (!sttStatus().configured) throw new HttpError(503, 'stt_not_configured');
  if (!validSpeechWav(bytes)) throw new HttpError(400, 'stt_bad_audio');
  const e = getBindings();
  let res: Response;
  try {
    res = await fetch(`https://${e.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=pl-PL&format=simple`, {
      method: 'POST', signal: AbortSignal.timeout(12_000),
      headers: { 'Ocp-Apim-Subscription-Key': e.AZURE_SPEECH_KEY!, 'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000', Accept: 'application/json' },
      body: new Blob([new Uint8Array(bytes)]),
    });
  } catch { throw new HttpError(502, 'stt_unavailable'); }
  if (!res.ok) throw new HttpError(502, 'stt_unavailable');
  let data: { RecognitionStatus?: string; DisplayText?: unknown };
  try { data = await res.json(); } catch { throw new HttpError(502, 'stt_unavailable'); }
  if (['NoMatch', 'InitialSilenceTimeout', 'BabbleTimeout'].includes(data.RecognitionStatus ?? '')) throw new HttpError(422, 'stt_no_speech');
  if (data.RecognitionStatus !== 'Success' || typeof data.DisplayText !== 'string' || !data.DisplayText.trim()) throw new HttpError(502, 'stt_unavailable');
  // Recordings and transcripts are not persisted or logged by this service.
  return { transcript: data.DisplayText.normalize('NFC').trim().slice(0, 300), language: 'pl-PL' };
}

/** Bound the actual stream, including requests with a missing or misleading Content-Length. */
export async function readSpeechBody(request: Request): Promise<Uint8Array> {
  const declared = Number(request.headers.get('content-length'));
  if (declared > MAX_SPEECH_BYTES) throw new HttpError(413, 'stt_too_large');
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = []; let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_SPEECH_BYTES) { await reader.cancel(); throw new HttpError(413, 'stt_too_large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const out = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.byteLength; }
  return out;
}
