const DIACRITICS: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
};

/** Нормалізація для порівняння відповідей: регістр, пробіли, пунктуація. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[.,!?;:"„”“«»…()\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripDiacritics(s: string): string {
  return s.replace(/[ąćęłńóśźż]/g, (c) => DIACRITICS[c] ?? c);
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Схожість двох рядків 0..1 (без урахування діакритики). */
export function similarity(a: string, b: string): number {
  const x = stripDiacritics(normalize(a));
  const y = stripDiacritics(normalize(b));
  const max = Math.max(x.length, y.length);
  if (max === 0) return 1;
  return 1 - levenshtein(x, y) / max;
}

export type TextMatch = 'exact' | 'diacritics' | 'typo' | 'wrong';

/** Порівнює введений текст з прийнятими відповідями. */
export function matchText(input: string, accepted: string[]): { match: TextMatch; best: string } {
  const n = normalize(input);
  let best = accepted[0] ?? '';
  for (const a of accepted) if (normalize(a) === n) return { match: 'exact', best: a };
  for (const a of accepted) {
    if (stripDiacritics(normalize(a)) === stripDiacritics(n)) return { match: 'diacritics', best: a };
  }
  for (const a of accepted) {
    const na = normalize(a);
    // Одна одруківка дозволена лише для довших відповідей, щоб не зараховувати інше слово.
    if (na.length >= 8 && levenshtein(stripDiacritics(na), stripDiacritics(n)) <= 1) {
      return { match: 'typo', best: a };
    }
  }
  return { match: 'wrong', best };
}
