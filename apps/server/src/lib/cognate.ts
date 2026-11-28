/**
 * Созвучие польского слова с русским/украинским (вынесено из test/guess.ts, 2026-11-28): по «скелету согласных» — гласные
 * выброшены, парные согласные склеены (peron ≈ перрон, głęboko ≈ глубоко). Используется проверкой вопросов дня (test/guess.ts)
 * и повторением слов (services/word-review.ts): созвучное слово угадывается без знания польского.
 */
export type Lang = 'ru' | 'uk';

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

export function levenshtein(a: string, b: string): number {
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

