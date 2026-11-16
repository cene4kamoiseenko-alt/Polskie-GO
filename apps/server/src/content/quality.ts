/**
 * Измеримые признаки «ответ угадывается без знания языка» (docs/EXERCISE_QUALITY.md). Одни и те же правила — в отчёте
 * `scripts/exercise-quality.ts` и в тесте `test/city-quality.test.ts` (все города, а не только новые). Ни один признак не заменяет
 * чтения носителем: они ловят лишь то, что можно измерить.
 *
 *  • «два варианта» — в шаге диалога всего два варианта: угадать можно с первого раза в половине случаев;
 *  • «самый длинный» — верный вариант заметно длиннее каждого из остальных (длина выдаёт ответ раньше смысла);
 *  • «далёкие дистракторы» — в «Послушай» неверные варианты совсем не похожи на звучащую фразу (различать на слух нечего):
 *    сходство букв < 0,5 и нет общего начала/конца (рифма pięć / dziewięć тоже считается похожей);
 *  • «одинаковое начало» — в «Вставь слово» верный вариант единственный из вариантов, начинающийся иначе, чем остальные
 *    формы одного слова (остальные — просто другая часть речи, а не соблазнительные формы).
 */
import type { ExerciseSeed } from './builders';
import type { CityContent, LessonSeed } from './types';

/** Обычная версия урока и его трудные версии (`slug@B1`): правила качества одни для всех. */
export function lessonVersions(lesson: LessonSeed): { slug: string; exercises: ExerciseSeed[] }[] {
  return [
    { slug: lesson.slug, exercises: lesson.exercises },
    ...Object.entries(lesson.levels ?? {}).map(([lv, v]) => ({ slug: `${lesson.slug}@${lv}`, exercises: v.exercises })),
  ];
}

type Opt = { text?: unknown };
const textOf = (o: unknown): string => (typeof o === 'string' ? o : typeof (o as Opt)?.text === 'string' ? ((o as Opt).text as string) : '');
const norm = (s: string) => s.toLowerCase().replace(/[.,!?„”"()]/g, '').trim();
/** Без польских знаков: ó/o, ł/l, ą/a — для сравнения начал слов (mój / moja — одна и та же форма). */
const plain = (s: string) => norm(s).replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Сходство строк 0…1 (1 − расстояние Левенштейна / длину большей). */
export function similarity(a: string, b: string): number {
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

/**
 * Общее начало или общий конец (рифма: pięć / dziewięć / dziesięć) — на слух такие слова путают так же, как слова с похожими буквами,
 * а по Левенштейну коротким словам до порога 0,5 не дотянуться. Нужно ≥ 3 общих букв и ≥ 60 % короткой фразы.
 */
export function edgeShare(a: string, b: string): number {
  const x = plain(a);
  const y = plain(b);
  let p = 0;
  while (p < x.length && p < y.length && x[p] === y[p]) p++;
  let s = 0;
  while (s < x.length - p && s < y.length - p && x[x.length - 1 - s] === y[y.length - 1 - s]) s++;
  const common = Math.max(p, s);
  return common >= 3 ? common / Math.min(x.length, y.length) : 0;
}

/** Неверный вариант «Послушай» достаточно похож на звучащую фразу: различать нужно на слух, а не по первому звуку. */
export const soundsAlike = (heard: string, other: string) => similarity(heard, other) >= 0.5 || edgeShare(heard, other) >= 0.6;

export type QualityKind = 'два варианта' | 'самый длинный' | 'далёкие дистракторы' | 'одинаковое начало';
export type Finding = { city: string; lesson: string; index: number; kind: QualityKind; detail: string };
export type CityTotals = { exercises: number; choiceSteps: number; twoOpt: number; longest: number; farListen: number; listen: number; gap: number; sameStart: number };

/** Замечания по всем заданиям городов и счётчики по каждому городу. */
export function analyseCities(cities: readonly CityContent[]): { findings: Finding[]; totals: Record<string, CityTotals> } {
  const findings: Finding[] = [];
  const totals: Record<string, CityTotals> = {};
  for (const city of cities) {
    const t = (totals[city.city] = { exercises: 0, choiceSteps: 0, twoOpt: 0, longest: 0, farListen: 0, listen: 0, gap: 0, sameStart: 0 });
    for (const lesson of city.routes.flatMap((r) => r.lessons).flatMap(lessonVersions)) {
      lesson.exercises.forEach((ex, index) => {
        t.exercises++;
        const d = ex.data as { options?: unknown[]; answer?: string; steps?: { options?: unknown[]; answer?: string }[]; audioText?: string };
        const add = (kind: QualityKind, detail: string) => findings.push({ city: city.city, lesson: lesson.slug, index, kind, detail });

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
          if (!wrong.some((w) => soundsAlike(rightText, w))) {
            t.farListen++;
            add('далёкие дистракторы', `${rightText.slice(0, 40)}  ≠  ${wrong.map((w) => w.slice(0, 24)).join(' | ')}`);
          }
        }
        if (ex.type === 'FILL_GAP') {
          t.gap++;
          // Приставка naj- — та же форма того же слова (stary / starszy / najstarszy), в начало не считается.
          const first = (s: string) => plain(s).replace(/^naj/, '').slice(0, 2);
          if (wrong.length >= 2 && wrong.every((w) => first(w) === first(wrong[0])) && first(rightText) !== first(wrong[0])) {
            t.sameStart++;
            add('одинаковое начало', `${rightText} | ${wrong.join(' | ')}`);
          }
        }
      });
    }
  }
  return { findings, totals };
}

/** Шаги диалогов города: сколько всего, сколько с менее чем тремя вариантами, у скольких неверный без пояснения, в скольких верный — самый длинный. */
export function dialogueStats(city: CityContent) {
  const out = { steps: 0, fewOptions: [] as string[], noExplanation: [] as string[], longest: 0 };
  for (const lesson of city.routes.flatMap((r) => r.lessons).flatMap(lessonVersions)) {
    lesson.exercises.forEach((ex, i) => {
      if (ex.type !== 'DIALOGUE' && ex.type !== 'SITUATION') return;
      const data = ex.data as { steps: { options?: { id: string; text: string; tr?: unknown }[]; answer?: string }[] };
      for (const st of data.steps) {
        if (!st.options) continue;
        out.steps++;
        const where = `${lesson.slug}#${i}`;
        if (st.options.length < 3) out.fewOptions.push(where);
        const right = st.options.find((o) => o.id === st.answer);
        if (!right) continue;
        const others = st.options.filter((o) => o !== right);
        for (const o of others) if (!o.tr) out.noExplanation.push(where);
        if (others.every((o) => right.text.length > o.text.length)) out.longest++;
      }
    });
  }
  return out;
}
