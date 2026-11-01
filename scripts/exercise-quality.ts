/**
 * Качество заданий: признаки, по которым ответ угадывается без знания языка (отчёт, не блокирует).
 *
 *   node --import tsx scripts/exercise-quality.ts            — сводка по городам
 *   node --import tsx scripts/exercise-quality.ts olsztyn    — + список заданий города
 *   node --import tsx scripts/exercise-quality.ts --strict olsztyn bialystok — код 1, если у этих городов есть замечания
 *
 * Признаки (все измеримы, ни один не заменяет чтение носителем):
 *  • «два варианта» — в шаге диалога всего два варианта: угадать можно с первого раза в половине случаев;
 *  • «самый длинный» — верный вариант заметно длиннее каждого из остальных (длина выдаёт ответ раньше смысла);
 *  • «далёкие дистракторы» — в «Послушай» неверные варианты совсем не похожи на звучащую фразу (различать на слух нечего);
 *  • «одинаковое начало» — в «Вставь слово» верный вариант единственный из вариантов, начинающийся иначе, чем остальные
 *    формы одного слова (признак, что остальные — просто разные части речи, а не соблазнительные формы).
 * Правила для авторов — docs/EXERCISE_QUALITY.md.
 */
import { CITY_CONTENT } from '../apps/server/src/content/seed';

type Opt = { text?: unknown };
const textOf = (o: unknown): string => (typeof o === 'string' ? o : typeof (o as Opt)?.text === 'string' ? ((o as Opt).text as string) : '');
const norm = (s: string) => s.toLowerCase().replace(/[.,!?„”"()]/g, '').trim();

/** Сходство строк 0…1 (1 − расстояние Левенштейна / длину большей). */
function similarity(a: string, b: string): number {
  const x = norm(a);
  const y = norm(b);
  if (!x && !y) return 1;
  const d: number[] = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= y.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (x[i - 1] === y[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return 1 - d[y.length] / Math.max(x.length, y.length);
}

type Finding = { city: string; lesson: string; index: number; kind: string; detail: string };
const findings: Finding[] = [];
const totals: Record<string, { exercises: number; choiceSteps: number; twoOpt: number; longest: number; farListen: number; listen: number; gap: number; sameStart: number }> = {};

for (const city of CITY_CONTENT) {
  const t = (totals[city.city] = { exercises: 0, choiceSteps: 0, twoOpt: 0, longest: 0, farListen: 0, listen: 0, gap: 0, sameStart: 0 });
  for (const lesson of city.routes.flatMap((r) => r.lessons)) {
    lesson.exercises.forEach((ex, index) => {
      t.exercises++;
      const d = ex.data as { options?: unknown[]; answer?: string; steps?: { options?: unknown[]; answer?: string }[]; audioText?: string };
      const add = (kind: string, detail: string) => findings.push({ city: city.city, lesson: lesson.slug, index, kind, detail });

      if ((ex.type === 'DIALOGUE' || ex.type === 'SITUATION') && d.steps) {
        for (const s of d.steps) {
          if (!s.options) continue;
          t.choiceSteps++;
          if (s.options.length === 2) {
            t.twoOpt++;
            add('два варианта', textOf(s.options[0]).slice(0, 60));
          }
        }
        return;
      }
      if (!d.options || !d.answer || ex.type === 'FIND_ERROR' || ex.type === 'ODD_ONE_OUT' || ex.type === 'MATCH_PAIRS') return;
      const right = d.options.find((o) => (o as { id?: string }).id === d.answer);
      if (!right) return;
      const rightText = textOf(right);
      const wrong = d.options.filter((o) => o !== right).map(textOf);
      if (!wrong.length) return;

      if (ex.type === 'READING' || ex.type === 'WORD_TRANSLATION') return;
      const longest = rightText.length >= 12 && wrong.every((w) => rightText.length >= w.length * 1.35);
      if (longest) {
        t.longest++;
        add('самый длинный', rightText.slice(0, 60));
      }
      if (ex.type === 'LISTENING') {
        t.listen++;
        const closest = Math.max(...wrong.map((w) => similarity(rightText, w)));
        if (closest < 0.5) {
          t.farListen++;
          add('далёкие дистракторы', `${rightText.slice(0, 40)}  ≠  ${wrong.map((w) => w.slice(0, 24)).join(' | ')}`);
        }
      }
      if (ex.type === 'FILL_GAP') {
        t.gap++;
        // Приставка naj- — та же форма того же слова (stary / starszy / najstarszy), в начало не считается.
        const first = (s: string) => norm(s).replace(/^naj/, '').slice(0, 2);
        if (wrong.length >= 2 && wrong.every((w) => first(w) === first(wrong[0])) && first(rightText) !== first(wrong[0])) {
          t.sameStart++;
          add('одинаковое начало', `${rightText} | ${wrong.join(' | ')}`);
        }
      }
    });
  }
}

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
if (strict && list.length) {
  const bad = findings.filter((f) => list.includes(f.city));
  if (bad.length) {
    console.error(`\nЗамечаний: ${bad.length}`);
    process.exit(1);
  }
}
