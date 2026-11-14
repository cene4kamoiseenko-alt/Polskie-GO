/**
 * «Можно ли угадать ответ, не зная польского» — проверка вопросов для носителя русского или украинского (владелец 2026-11-14:
 * «вопросы очень лёгкие, ответ понятен, даже если не знать польского»). Польский для славянина прозрачен по корням, поэтому вопрос
 * считается угадываемым, если верный вариант — единственный, который «читается» через родственное слово или подсказку в самом вопросе:
 *
 *  • cognate — в вопросе «что значит «…»» верный перевод заметно ближе по звучанию к польским словам из цитаты, чем неверные
 *    (przerwa ≈ перерыв, podpisać ≈ подписать, jednorazowy ≈ одноразовый);
 *  • gloss — в скобках стоит перевод верного слова («(пироги)» → pierogi, «(остановка)» → przystanek): ответ находится сравнением на глаз;
 *  • preposition — в вопросе на предлог русский «двойник» верного предлога («(без сахара)» → bez) и нет такого же двойника у неверного;
 *  • number — цифры из цитаты есть только в верном варианте.
 *
 * Сравнение — по «скелету согласных» (гласные выброшены, парные согласные склеены): peron ≈ перрон, głęboko ≈ глубоко. Это эвристика:
 * она ловит очевидные случаи и не заменяет чтения вопроса глазами, но не пропускает новые «лёгкие» вопросы.
 */
import { optionsOf, type QuizQuestion } from '../src/bot/quiz/questions';

type Lang = 'ru' | 'uk';

const PL_CLASS: Record<string, string> = {
  b: 'p', p: 'p', w: 'v', f: 'v', g: 'k', k: 'k', d: 't', t: 't', ć: 't', z: 's', s: 's', ś: 's', ź: 's', ż: 'S', S: 'S', C: 'C', c: 'C',
  h: 'h', l: 'l', ł: 'l', m: 'm', n: 'n', ń: 'n', r: 'r',
};
const CYR_CLASS: Record<string, string> = {
  б: 'p', п: 'p', в: 'v', ф: 'v', г: 'k', ґ: 'k', к: 'k', д: 't', т: 't', з: 's', с: 's', ж: 'S', ш: 'S', щ: 'S', ц: 'C', ч: 'C',
  х: 'h', л: 'l', м: 'm', н: 'n', р: 'r',
};
const SOFT = '(?=[aeiouyąęó])';

/** Польское слово → скелет согласных по классам звуков. */
export function plSkeleton(word: string): string {
  let s = word.toLowerCase();
  s = s
    .replace(new RegExp(`dzi${SOFT}`, 'g'), 't')
    .replace(new RegExp(`ci${SOFT}`, 'g'), 't')
    .replace(new RegExp(`si${SOFT}`, 'g'), 's')
    .replace(new RegExp(`zi${SOFT}`, 'g'), 's')
    .replace(new RegExp(`ni${SOFT}`, 'g'), 'n')
    .replace(/szcz/g, 'S')
    .replace(/sz/g, 'S')
    .replace(/cz/g, 'C')
    .replace(/ch/g, 'h')
    .replace(/dż/g, 'S')
    .replace(/dz/g, 't')
    .replace(/rz/g, 'r');
  return [...s].map((c) => PL_CLASS[c] ?? '').join('');
}

/** Русское или украинское слово → тот же скелет. */
export function cyrSkeleton(word: string): string {
  return [...word.toLowerCase()].map((c) => CYR_CLASS[c] ?? '').join('');
}

function levenshtein(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

export function skeletonSimilarity(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  return max ? 1 - levenshtein(a, b) / max : 0;
}

const words = (text: string, min = 4) => (text.toLowerCase().match(/[\p{L}]+/gu) ?? []).filter((w) => w.length >= min);
const isCyr = (w: string) => /[а-яіїєґё]/i.test(w);

/** Насколько слова текста `b` (русского/украинского) звучат как слова польского текста `a`: лучшая пара слов, 0…1. */
export function cognateScore(polish: string, cyrillic: string): number {
  const pl = words(polish).map(plSkeleton).filter((s) => s.length >= 3);
  const cy = words(cyrillic).filter(isCyr).map(cyrSkeleton).filter((s) => s.length >= 3);
  let best = 0;
  for (const p of pl) for (const c of cy) best = Math.max(best, skeletonSimilarity(p, c));
  return best;
}

/** Польский предлог → его русский и украинский «двойник» (то, что человек увидит в подсказке и подставит на глаз). */
const PREPOSITION_TWIN: Record<string, string[]> = {
  bez: ['без'], do: ['до'], na: ['на'], od: ['от', 'од'], za: ['за'], po: ['по'], o: ['о', 'об'], w: ['в', 'у'], z: ['с', 'из', 'зі', 'із'], u: ['у'],
  przez: ['через', 'крізь'], dla: ['для'], przed: ['перед'], nad: ['над'], pod: ['под', 'під'], jako: ['как', 'як'],
};

export type Leak = { kind: 'cognate' | 'gloss' | 'preposition' | 'number'; detail: string };

const MARGIN = 0.15;
const MIN_SCORE = 0.7;

/** Цитаты «…» с польским текстом (по английскому тексту вопроса: он одинаков для всех языков). */
function quotes(q: QuizQuestion): string[] {
  return [...q.prompt.en.matchAll(/«([^»]+)»/g)].map((m) => m[1]).filter((f) => /[a-ząćęłńóśźż]/i.test(f));
}

/** Текст вопроса вне цитат «…» и вне скобок — то, что человек читает по-русски/по-украински. */
const gloss = (text: string) => text.match(/\(([^)]+)\)/)?.[1] ?? '';

function uniqueBest(scores: number[], answer: number): boolean {
  const others = scores.filter((_, i) => i !== answer);
  return scores[answer] >= MIN_SCORE && scores[answer] - Math.max(...others) >= MARGIN;
}

export function leaks(q: QuizQuestion, lang: Lang): Leak[] {
  const out: Leak[] = [];
  const options = optionsOf(q, lang);
  const polishOptions = Array.isArray(q.options);
  const prompt = q.prompt[lang];

  if (!polishOptions) {
    // Варианты — переводы: сравниваем польскую цитату с каждым переводом.
    const polish = quotes(q).join(' ');
    if (polish) {
      const scores = options.map((o) => cognateScore(polish, o));
      if (uniqueBest(scores, q.answer)) out.push({ kind: 'cognate', detail: `${lang}: «${options[q.answer]}» (${scores.map((s) => s.toFixed(2)).join(' / ')})` });
      // Цифры: число из цитаты есть только в верном варианте.
      const digits = polish.match(/\d+/g) ?? [];
      for (const d of digits) {
        const has = options.map((o) => o.includes(d));
        if (has[q.answer] && has.filter(Boolean).length === 1) out.push({ kind: 'number', detail: `${lang}: «${d}» только в верном варианте` });
      }
    }
    return out;
  }

  // Варианты — польские: подсказка в скобках сравнивается с каждым вариантом.
  const hint = gloss(prompt);
  if (hint) {
    if (q.kind === 'preposition') {
      const twins = (o: string) => (PREPOSITION_TWIN[o.toLowerCase().split(/\s+/)[0]] ?? []).some((t) => new RegExp(`(^|[^\\p{L}])${t}([^\\p{L}]|$)`, 'u').test(hint.toLowerCase()));
      const hits = options.map(twins);
      if (hits[q.answer] && hits.filter(Boolean).length === 1) out.push({ kind: 'preposition', detail: `${lang}: подсказка «(${hint})» совпадает с «${options[q.answer]}»` });
    } else {
      const scores = options.map((o) => cognateScore(o, hint));
      if (uniqueBest(scores, q.answer)) out.push({ kind: 'gloss', detail: `${lang}: «(${hint})» ≈ «${options[q.answer]}» (${scores.map((s) => s.toFixed(2)).join(' / ')})` });
    }
  }
  return out;
}
