/**
 * Серверний синтез польського мовлення (pl-PL) з кешем у D1.
 * Провайдери: Google Cloud Text-to-Speech (GOOGLE_TTS_API_KEY) або Azure Speech (AZURE_SPEECH_KEY + AZURE_SPEECH_REGION).
 * Ключі зберігаються лише в секретах Worker; клієнт отримує готовий MP3.
 */
import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { SPEECH_RATES, speechText, type SpeechRate } from '@polski-go/shared';
import { db } from '../db';
import { ttsCache } from '../db/schema';
import { getBindings } from '../env';
import { HttpError } from '../lib/errors';

type Provider = { id: 'google' | 'azure' | 'elevenlabs'; voice: string; synth: (text: string, rate: SpeechRate) => Promise<ArrayBuffer> };

export function ttsProvider(): Provider | null {
  const env = getBindings();
  if (env.GOOGLE_TTS_API_KEY) {
    const voice = env.GOOGLE_TTS_VOICE || 'pl-PL-Wavenet-A';
    return {
      id: 'google',
      voice,
      synth: async (text, rate) => {
        const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(env.GOOGLE_TTS_API_KEY!)}`, {
          method: 'POST', signal: AbortSignal.timeout(10_000),
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ input: { text }, voice: { languageCode: 'pl-PL', name: voice }, audioConfig: { audioEncoding: 'MP3', speakingRate: SPEECH_RATES[rate] } }),
        });
        if (!res.ok) throw new HttpError(502, 'tts_failed', `Google TTS ${res.status}`);
        const { audioContent } = (await res.json()) as { audioContent?: string };
        if (typeof audioContent !== 'string' || !audioContent.length) throw new HttpError(502, 'tts_failed');
        return Uint8Array.from(Buffer.from(audioContent, 'base64')).buffer;
      },
    };
  }
  if (env.AZURE_SPEECH_KEY && env.AZURE_SPEECH_REGION) {
    const voice = env.AZURE_SPEECH_VOICE || 'pl-PL-ZofiaNeural';
    return {
      id: 'azure',
      voice,
      synth: async (text, rate) => {
        const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const pct = Math.round((SPEECH_RATES[rate] - 1) * 100);
        const ssml = `<speak version="1.0" xml:lang="pl-PL"><voice name="${voice}"><prosody rate="${pct}%">${esc}</prosody></voice></speak>`;
        const res = await fetch(`https://${env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
          method: 'POST', signal: AbortSignal.timeout(10_000),
          headers: {
            'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY!,
            'content-type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
            'user-agent': 'polski-go',
          },
          body: ssml,
        });
        if (!res.ok) throw new HttpError(502, 'tts_failed', `Azure TTS ${res.status}`);
        return res.arrayBuffer();
      },
    };
  }
  if (env.ELEVENLABS_API_KEY) {
    const voice = env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const model = env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
    return {
      id: 'elevenlabs',
      voice: `${voice}/${model}`,
      synth: async (text, rate) => {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_64`, {
          method: 'POST', signal: AbortSignal.timeout(10_000),
          headers: { 'xi-api-key': env.ELEVENLABS_API_KEY!, 'content-type': 'application/json', accept: 'audio/mpeg' },
          body: JSON.stringify({ text, model_id: model, voice_settings: { stability: 0.55, similarity_boost: 0.8, speed: rate === 'slow' ? 0.8 : 1 } }),
        });
        if (!res.ok) throw new HttpError(502, 'tts_failed', `ElevenLabs ${res.status}`);
        return res.arrayBuffer();
      },
    };
  }
  return null;
}

/** Що реально підключено (без ключів) — для діагностики в налаштуваннях і адмінці. */
export function ttsStatus() {
  const p = ttsProvider();
  return p ? { configured: true, provider: p.id, voice: p.voice } : { configured: false, provider: null, voice: null };
}

export const ttsConfigured = () => !!ttsProvider();

/** Допустимий текст: польські літери, цифри, розділові знаки. Захист від використання ключа для довільних текстів. */
const ALLOWED = /^[\p{Script=Latin}0-9\s.,!?;:'"„”«»…()\-–—/%]+$/u;

export async function synthesize(rawText: string, rate: SpeechRate): Promise<{ data: Uint8Array; mime: string; cached: boolean }> {
  const provider = ttsProvider();
  if (!provider) throw new HttpError(503, 'tts_not_configured', 'Серверну озвучку не підключено');
  const text = speechText(rawText);
  if (!text || !ALLOWED.test(text)) throw new HttpError(400, 'tts_bad_text');
  const key = createHash('sha256').update(`${provider.id}|${provider.voice}|${rate}|${text}`).digest('hex');
  const hit = await db.query.ttsCache.findFirst({ where: eq(ttsCache.key, key) });
  if (hit) return { data: new Uint8Array(hit.data), mime: hit.mime, cached: true };
  let audio: Uint8Array;
  try { audio = new Uint8Array(await provider.synth(text, rate)); }
  catch { throw new HttpError(502, 'tts_failed'); }
  if (!audio.length) throw new HttpError(502, 'tts_failed');
  await db.insert(ttsCache).values({ key, text, voice: `${provider.id}:${provider.voice}`, rate, mime: 'audio/mpeg', data: Buffer.from(audio) }).onConflictDoNothing();
  return { data: audio, mime: 'audio/mpeg', cached: false };
}

/** Усі польські фрази навчального контенту — для попереднього синтезу (прогрів кешу). */
export async function contentPhrases(): Promise<string[]> {
  const { vocabularyEntries, exercises, lessons, questSteps } = await import('../db/schema');
  const [vocab, ex, ls, steps] = await Promise.all([
    db.select({ pl: vocabularyEntries.pl, examples: vocabularyEntries.examples }).from(vocabularyEntries),
    db.select({ type: exercises.type, data: exercises.data }).from(exercises),
    db.select({ examples: lessons.examples }).from(lessons),
    db.select({ data: questSteps.data }).from(questSteps),
  ]);
  const out = new Set<string>();
  const add = (s: unknown) => {
    if (typeof s === 'string' && s.trim() && !s.includes('___')) out.add(speechText(s));
  };
  for (const v of vocab) {
    add(v.pl);
    v.examples.forEach((e) => add(e.pl));
  }
  for (const l of ls) l.examples.forEach((e) => add(e.pl));
  for (const e of ex) {
    const d = e.data as Record<string, unknown>;
    add(d.audioText);
    add(d.text);
    if (e.type !== 'FIND_ERROR' && e.type !== 'FILL_GAP' && e.type !== 'GRAMMAR') add(d.pl);
    for (const o of (d.options as { text: unknown }[] | undefined) ?? []) add(o.text);
    for (const s of (d.steps as { npc?: string; options?: { text: unknown }[] }[] | undefined) ?? []) {
      add(s.npc);
      s.options?.forEach((o) => add(o.text));
    }
  }
  for (const s of steps) {
    for (const n of Object.values(((s.data as { nodes?: Record<string, { pl?: string; choices?: { pl: string }[] }> }).nodes) ?? {})) {
      add(n.pl);
      n.choices?.forEach((c) => add(c.pl));
    }
  }
  return [...out].filter((x) => ALLOWED.test(x)).sort();
}
