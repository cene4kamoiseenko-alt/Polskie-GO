import { MAX_SPEECH_BYTES, validSpeechWav } from '@polski-go/shared';
import { getBindings } from '../env';
import { HttpError } from '../lib/errors';
export { MAX_SPEECH_BYTES };
type SttProvider = 'azure' | 'google';
const AZURE_REGION = /^[a-z0-9-]{2,40}$/;

/**
 * Explicit opt-in: adding TTS credentials never enables microphone processing automatically.
 * Azure — `AZURE_STT_ENABLED=true` + key + region; Google — `GOOGLE_STT_ENABLED=true` + `GOOGLE_STT_API_KEY`
 * (or the TTS key, but only after the explicit flag). `STT_PROVIDER`: auto (Azure, then Google), azure, google, off.
 */
function sttProvider(): SttProvider | null {
  const e = getBindings();
  const ready: Record<SttProvider, boolean> = {
    azure: e.AZURE_STT_ENABLED === 'true' && !!e.AZURE_SPEECH_KEY && AZURE_REGION.test(e.AZURE_SPEECH_REGION ?? ''),
    google: e.GOOGLE_STT_ENABLED === 'true' && !!(e.GOOGLE_STT_API_KEY || e.GOOGLE_TTS_API_KEY),
  };
  const choice = (e.STT_PROVIDER ?? 'auto').trim().toLowerCase();
  if (choice === 'off') return null;
  if (choice === 'azure' || choice === 'google') return ready[choice] ? choice : null;
  return ready.azure ? 'azure' : ready.google ? 'google' : null;
}

export function sttStatus() {
  const provider = sttProvider();
  return { configured: !!provider, provider, language: 'pl-PL' };
}

/** meter — облік платного звернення (квота); викликається лише для справжнього запиту до провайдера. */
export async function transcribeSpeech(bytes: Uint8Array, opts: { meter?: () => Promise<unknown> } = {}): Promise<{ transcript: string; language: string }> {
  const provider = sttProvider();
  if (!provider) throw new HttpError(503, 'stt_not_configured');
  if (!validSpeechWav(bytes)) throw new HttpError(400, 'stt_bad_audio');
  await opts.meter?.();
  const text = provider === 'google' ? await recognizeGoogle(bytes) : await recognizeAzure(bytes);
  // Recordings and transcripts are not persisted or logged by this service.
  return { transcript: text.normalize('NFC').trim().slice(0, 300), language: 'pl-PL' };
}

async function call(url: string, init: RequestInit): Promise<object> {
  let res: Response;
  try { res = await fetch(url, { ...init, method: 'POST', signal: AbortSignal.timeout(12_000) }); } catch { throw new HttpError(502, 'stt_unavailable'); }
  if (!res.ok) throw new HttpError(502, 'stt_unavailable');
  let data: unknown;
  try { data = await res.json(); } catch { throw new HttpError(502, 'stt_unavailable'); }
  if (!data || typeof data !== 'object') throw new HttpError(502, 'stt_unavailable');
  return data;
}

async function recognizeAzure(bytes: Uint8Array): Promise<string> {
  const e = getBindings();
  const data = (await call(`https://${e.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=pl-PL&format=simple`, {
    headers: { 'Ocp-Apim-Subscription-Key': e.AZURE_SPEECH_KEY!, 'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000', Accept: 'application/json' },
    body: new Blob([new Uint8Array(bytes)]),
  })) as { RecognitionStatus?: string; DisplayText?: unknown };
  if (['NoMatch', 'InitialSilenceTimeout', 'BabbleTimeout'].includes(data.RecognitionStatus ?? '')) throw new HttpError(422, 'stt_no_speech');
  if (data.RecognitionStatus !== 'Success' || typeof data.DisplayText !== 'string' || !data.DisplayText.trim()) throw new HttpError(502, 'stt_unavailable');
  return data.DisplayText;
}

/**
 * Google Speech-to-Text v1 `speech:recognize` (синхронний, до 1 хв — наші записи до 30 с).
 * Ключ — у заголовку X-Goog-Api-Key, не в адресі. Аудіо — той самий перевірений WAV PCM16 mono 16 кГц;
 * LINEAR16 з WAV-заголовком Google читає сам. Порожні results — тиша або нерозбірлива мова.
 * Модель типово не задається (Google обирає стандартну для pl-PL); `GOOGLE_STT_MODEL` (напр. latest_short) —
 * лише після перевірки, що модель підтримує pl-PL, інакше кожен запит поверне 400.
 */
async function recognizeGoogle(bytes: Uint8Array): Promise<string> {
  const e = getBindings();
  const model = /^[a-z_]{3,40}$/.test(e.GOOGLE_STT_MODEL ?? '') ? e.GOOGLE_STT_MODEL : undefined;
  const data = (await call('https://speech.googleapis.com/v1/speech:recognize', {
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': (e.GOOGLE_STT_API_KEY || e.GOOGLE_TTS_API_KEY)! },
    body: JSON.stringify({
      config: { encoding: 'LINEAR16', sampleRateHertz: 16_000, audioChannelCount: 1, languageCode: 'pl-PL', maxAlternatives: 1, ...(model ? { model } : {}) },
      audio: { content: Buffer.from(bytes).toString('base64') },
    }),
  })) as { results?: { alternatives?: { transcript?: unknown }[] }[] };
  const parts = (Array.isArray(data.results) ? data.results : []).map((r) => r.alternatives?.[0]?.transcript).filter((t): t is string => typeof t === 'string' && !!t.trim());
  if (!parts.length) throw new HttpError(422, 'stt_no_speech');
  return parts.join(' ');
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
