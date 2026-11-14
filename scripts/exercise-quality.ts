/**
 * Качество заданий: признаки, по которым ответ угадывается без знания языка (отчёт; с --strict — код 1, если есть замечания).
 *
 *   node --import tsx scripts/exercise-quality.ts            — сводка по городам
 *   node --import tsx scripts/exercise-quality.ts olsztyn    — + список заданий города
 *   node --import tsx scripts/exercise-quality.ts --strict olsztyn bialystok — код 1, если у этих городов есть замечания
 *   node --import tsx scripts/exercise-quality.ts --strict                 — то же для всех городов
 *
 * Правила (два варианта, самый длинный, далёкие дистракторы в «Послушай», одинаковое начало в «Вставь слово») — в
 * apps/server/src/content/quality.ts; тот же код проверяет тест test/city-quality.test.ts. Правила для авторов — docs/EXERCISE_QUALITY.md.
 */
import { CITY_CONTENT } from '../apps/server/src/content/seed';
import { analyseCities } from '../apps/server/src/content/quality';

const { findings, totals } = analyseCities(CITY_CONTENT);
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const list = args.filter((a) => !a.startsWith('--'));
const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : '–');
console.log('город'.padEnd(14), 'заданий', 'диал.шагов', 'два вар.', 'самый длинный', 'слушание далёк.', 'вставь: начало');
for (const [city, t] of Object.entries(totals)) {
  console.log(
    city.padEnd(14), String(t.exercises).padEnd(7), String(t.choiceSteps).padEnd(10), pct(t.twoOpt, t.choiceSteps).padEnd(8), String(t.longest).padEnd(13),
    `${t.farListen}/${t.listen}`.padEnd(15), `${t.sameStart}/${t.gap}`,
  );
}
for (const city of list) {
  console.log(`\n# ${city}`);
  for (const f of findings.filter((x) => x.city === city)) console.log(`${f.lesson}#${f.index} · ${f.kind}: ${f.detail}`);
}
// `--strict` без названий городов проверяет ВСЕ города (с 2026-11-14 замечаний нет ни у одного: правила docs/EXERCISE_QUALITY.md).
if (strict) {
  const bad = findings.filter((f) => !list.length || list.includes(f.city));
  if (bad.length) {
    console.error(`\nЗамечаний: ${bad.length}`);
    process.exit(1);
  }
}
