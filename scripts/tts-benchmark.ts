/**
 * Сліпий тест польських голосів (docs/POLISH_TTS_BENCHMARK.md).
 *   node --import tsx scripts/tts-benchmark.ts                       — план без мережі: кандидати, ціни, приклад запиту без ключа
 *   node --import tsx scripts/tts-benchmark.ts --plan out/tts-plan.json  — те саме у файл
 *   node --import tsx scripts/tts-benchmark.ts --live --confirm-paid --out <тека> [--only id,id] [--voice el-pl-1=<id>] [--seed 2026]
 *     — платний прогін: ключі беруться зі змінних оточення (GOOGLE_TTS_API_KEY, AZURE_SPEECH_KEY + AZURE_SPEECH_REGION,
 *       ELEVENLABS_API_KEY). Запускати лише з дозволу власника. Ключі не друкуються й не пишуться у файли.
 * Результат прогону: <тека>/<мітка>/<фраза>-<швидкість>.mp3, sheet.csv для оцінок і key.json (мітка → голос; не показувати тим, хто слухає).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { BENCHMARK_PHRASES, CANDIDATES } from '../apps/server/src/services/tts-catalog';
import { benchmarkPlan, blindLabels, runBenchmark } from '../apps/server/src/services/tts-benchmark';

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const value = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const voices = Object.fromEntries(
  args.flatMap((a, i) => (args[i - 1] === '--voice' && a.includes('=') ? [a.split('=', 2) as [string, string]] : [])),
);
const only = value('--only')?.split(',').filter(Boolean);
const seed = Number(value('--seed') ?? 2026);

const plan = benchmarkPlan({ region: process.env.AZURE_SPEECH_REGION || undefined, voices });
const shown = plan.candidates.filter((c) => !only || only.includes(c.id));

console.log(`Набір: ${plan.totals.phrases} фраз, ${plan.totals.samples} записів на голос, ${plan.totals.chars} символів на голос. Довідник звірено ${plan.checked}.`);
console.table(
  shown.map((c) => ({
    id: c.id,
    voice: c.voice || '— (вибрати)',
    model: c.model,
    role: c.role,
    warnings: c.warnings.join(', ') || '—',
    '$ (є безкошт. обсяг)': c.usd?.freeTierLeft ?? '?',
    '$ (без нього)': c.usd?.freeTierUsed ?? '?',
  })),
);
const sample = shown.find((c) => c.sample)?.sample;
if (sample) console.log('Приклад запиту (без ключа):', JSON.stringify(sample, null, 2));

const planOut = value('--plan');
if (planOut) {
  mkdirSync(resolve(planOut, '..'), { recursive: true });
  writeFileSync(planOut, JSON.stringify(plan, null, 2));
  console.log(`План записано: ${planOut}`);
}

async function live() {
  if (!flag('--live')) {
    console.log('\nDry-run: жодного запиту до провайдерів. Платний прогін — лише з дозволу власника: --live --confirm-paid --out <тека>.');
    return;
  }
  if (!flag('--confirm-paid')) {
    console.error('--live без --confirm-paid: прогін платний, потрібне явне підтвердження.');
    process.exitCode = 2;
    return;
  }
  const outDir = value('--out');
  if (!outDir) {
    console.error('Потрібна тека результатів: --out <тека>.');
    process.exitCode = 2;
    return;
  }

  const env = {
    GOOGLE_TTS_API_KEY: process.env.GOOGLE_TTS_API_KEY,
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  };
  const ids = CANDIDATES.filter((c) => !only || only.includes(c.id)).map((c) => c.id);
  const labels = blindLabels(ids, seed);
  const ext = (rate: string) => (rate === 'slow' ? 'slow' : 'normal');

  const res = await runBenchmark({
    env,
    only,
    voices,
    write: (c, p, rate, audio) => {
      const dir = join(outDir, labels[c.id]);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, `${p.id}-${ext(rate)}.mp3`), audio);
    },
  });

  const made = new Set(ids.filter((id) => !res.skipped.some((s) => s.candidate === id)));
  const rows = [['label', 'phrase', 'rate', 'text', 'focus', 'clarity_1_5', 'stress_1_5', 'naturalness_1_5', 'errors'].join(',')];
  const csv = (s: string) => `"${s.replace(/"/g, '""')}"`;
  for (const id of [...made].sort((a, b) => labels[a].localeCompare(labels[b]))) {
    for (const p of BENCHMARK_PHRASES) for (const rate of p.rates ?? ['normal', 'slow']) rows.push([labels[id], p.id, rate, csv(p.text), csv(p.focus), '', '', '', ''].join(','));
  }
  writeFileSync(join(outDir, 'sheet.csv'), rows.join('\n'));
  writeFileSync(join(outDir, 'key.json'), JSON.stringify({ seed, labels: Object.fromEntries([...made].map((id) => [labels[id], CANDIDATES.find((c) => c.id === id)])) }, null, 2));
  console.log(`Записів: ${res.made}, символів: ${res.chars}. Пропущено: ${res.skipped.map((s) => `${s.candidate} (${s.reason})`).join(', ') || '—'}.`);
  if (res.failed.length) console.log('Помилки:', res.failed.map((f) => `${f.candidate}/${f.phrase}/${f.rate}: ${f.reason}`).join('; '));
  console.log(`Результат: ${outDir} (sheet.csv — оцінки; key.json — відкривати після оцінювання).`);
}

live().catch((e) => {
  console.error(e);
  process.exit(1);
});
