/**
 * Сліпий тест польських голосів: план (dry-run) і прогін.
 * План — без мережі й без ключів: які запити підуть до провайдерів (у прев'ю замість ключа — назва змінної),
 * скільки символів і орієнтовна ціна. Прогін — платні запити, лише з дозволу власника (scripts/tts-benchmark.ts --live).
 * Протокол оцінки — docs/POLISH_TTS_BENCHMARK.md.
 */
import type { SpeechRate } from '@polski-go/shared';
import type { Bindings } from '../env';
import { BENCHMARK_PHRASES, CANDIDATES, TTS_CATALOG_CHECKED, benchmarkChars, estimateUsd, priceFor, type BenchmarkPhrase, type Candidate, type Price } from './tts-catalog';
import { TtsProviderError, buildProvider, callProvider, ttsInputText, voiceWarnings, type RequestPreview, type TtsWarning } from './tts';

/** Підставні ключі для прев'ю: preview() їх не містить, вони потрібні лише, щоб зібрати провайдера. */
const PLACEHOLDER_ENV = { GOOGLE_TTS_API_KEY: 'dry-run', AZURE_SPEECH_KEY: 'dry-run', ELEVENLABS_API_KEY: 'dry-run' };

export type CandidatePlan = Candidate & {
  /** Голос вибрано (у ElevenLabs ID ще треба взяти з Voice Library). */
  ready: boolean;
  warnings: TtsWarning[];
  price: Price | null;
  /** Один повний прогін набору: якщо безкоштовний місячний обсяг ще не витрачено / вже витрачено. */
  usd: { freeTierLeft: number; freeTierUsed: number } | null;
  /** Перший запит прогону без ключа. */
  sample: RequestPreview | null;
};

/** voices — ID голосів для кандидатів без них (ElevenLabs): { 'el-pl-1': '<voice_id>' }. */
export function benchmarkPlan(opts: { region?: string; voices?: Record<string, string> } = {}) {
  const totals = benchmarkChars();
  const region = opts.region ?? 'westeurope';
  const candidates: CandidatePlan[] = CANDIDATES.map((base) => {
    const c = withVoice(base, opts.voices);
    const ready = !!c.voice;
    const p = ready ? buildProvider({ provider: c.provider, voice: c.voice, model: c.model }, { ...PLACEHOLDER_ENV, AZURE_SPEECH_REGION: region }) : null;
    const price = priceFor(c.provider, c.model);
    return {
      ...c,
      ready,
      warnings: ready ? voiceWarnings(c) : [],
      price,
      usd: price ? { freeTierLeft: estimateUsd(totals.chars, price), freeTierUsed: estimateUsd(totals.chars, price, price.freeCharsPerMonth) } : null,
      sample: p ? p.preview(ttsInputText(BENCHMARK_PHRASES[0].text), 'normal') : null,
    };
  });
  return { checked: TTS_CATALOG_CHECKED, totals, phrases: BENCHMARK_PHRASES, candidates };
}

const withVoice = (c: Candidate, voices?: Record<string, string>): Candidate => (c.voice || !voices?.[c.id] ? c : { ...c, voice: voices[c.id] });

/** Детермінований порядок для сліпого тесту: id кандидатів → мітки A, B, C… (той самий seed — ті самі мітки). */
export function blindLabels(ids: string[], seed: number): Record<string, string> {
  let s = seed >>> 0;
  const rnd = () => {
    // mulberry32
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const order = [...ids];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const label = (i: number) => (i < 26 ? String.fromCharCode(65 + i) : `Z${i - 25}`);
  return Object.fromEntries(order.map((id, i) => [id, label(i)]));
}

export type RunFailure = { candidate: string; phrase: string; rate: SpeechRate; reason: string };

/**
 * Прогін набору: кожен готовий кандидат з ключем провайдера × кожна фраза × її швидкості, послідовно.
 * Кандидати без ключа чи без голосу пропускаються з причиною. Кеш D1 не використовується: це порівняння, а не робота застосунку.
 */
export async function runBenchmark(opts: {
  env: Partial<Bindings>;
  write: (candidate: Candidate, phrase: BenchmarkPhrase, rate: SpeechRate, audio: Uint8Array) => Promise<void> | void;
  only?: string[];
  voices?: Record<string, string>;
  phrases?: BenchmarkPhrase[];
}) {
  const phrases = opts.phrases ?? BENCHMARK_PHRASES;
  const skipped: { candidate: string; reason: 'no_voice' | 'not_configured' }[] = [];
  const failed: RunFailure[] = [];
  let made = 0;
  let chars = 0;
  for (const base of CANDIDATES) {
    if (opts.only && !opts.only.includes(base.id)) continue;
    const c = withVoice(base, opts.voices);
    if (!c.voice) { skipped.push({ candidate: c.id, reason: 'no_voice' }); continue; }
    const p = buildProvider({ provider: c.provider, voice: c.voice, model: c.model }, opts.env);
    if (!p) { skipped.push({ candidate: c.id, reason: 'not_configured' }); continue; }
    for (const phrase of phrases) {
      for (const rate of phrase.rates ?? (['normal', 'slow'] as const)) {
        const text = ttsInputText(phrase.text);
        try {
          const audio = new Uint8Array(await callProvider(p, text, rate));
          if (!audio.length) throw new TtsProviderError('empty_audio');
          chars += [...text].length;
          made++;
          await opts.write(c, phrase, rate, audio);
        } catch (e) {
          failed.push({ candidate: c.id, phrase: phrase.id, rate, reason: e instanceof TtsProviderError ? e.reason : (e as Error).name || 'error' });
        }
      }
    }
  }
  return { made, chars, skipped, failed };
}
