const DIACRITICS: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
};

/** Нормалізація для порівняння відповідей: регістр, пробіли, пунктуація. */
export function normalize(s: string): string {
  return s
    .normalize('NFC')
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
export function matchText(input: string, accepted: string[], opts: { allowTypos?: boolean } = {}): { match: TextMatch; best: string } {
  const n = normalize(input);
  let best = accepted[0] ?? '';
  for (const a of accepted) if (normalize(a) === n) return { match: 'exact', best: a };
  // Пропущені польські знаки (czesc замість cześć) — «майже», з підказкою.
  // Зайвий або інший знак (część замість cześć) — це інше слово, тому відповідь неправильна.
  for (const a of accepted) {
    if (onlyMissingDiacritics(normalize(a), n)) return { match: 'diacritics', best: a };
  }
  if (opts.allowTypos !== false) for (const a of accepted) {
    const expected = stripDiacritics(normalize(a)).split(' ');
    const actual = stripDiacritics(n).split(' ');
    if (expected.length !== actual.length) continue;
    const changed = expected.map((word, i) => ({ word, input: actual[i] })).filter(x => x.word !== x.input);
    if (changed.length !== 1) continue;
    const { word, input: typed } = changed[0];
    // Tolerate one internal typo in a long word, never a changed number,
    // a short grammatical word, a dropped word or a changed inflectional ending.
    if (word.length >= 8 && typed.length >= 7 && !/\d/.test(word + typed)
      && word[0] === typed[0] && word.slice(-2) === typed.slice(-2)
      && levenshtein(word, typed) === 1) return { match: 'typo', best: a };
  }
  return { match: 'wrong', best };
}

/** true, якщо введення відрізняється від зразка лише відсутніми діакритичними знаками. */
export function onlyMissingDiacritics(expected: string, input: string): boolean {
  const e = [...expected], i = [...input];
  if (e.length !== i.length || expected === input) return false;
  return e.every((ch, k) => ch === i[k] || (stripDiacritics(ch) === i[k] && stripDiacritics(i[k]) === i[k]));
}

/** Speech matching must not accept an opposite meaning or a changed written number. */
export function sameSpeechPolarityAndNumbers(a: string, b: string): boolean {
  const words = (s: string) => normalize(s).split(' ');
  const negations = new Set(['nie', 'nigdy', 'nikt', 'nic', 'nikogo', 'nigdzie', 'żaden', 'żadna', 'żadne']);
  const negatives = (s: string) => words(s).filter(w => negations.has(w)).sort().join('|');
  const numbers = (s: string) => s.match(/\d+/g)?.join('|') ?? '';
  const x = numbers(a), y = numbers(b);
  // A recognizer may spell a number out or render it as digits; compare digits only when both use them.
  return negatives(a) === negatives(b) && (!x || !y || x === y);
}

export type WordMark = { w: string; st: 'ok' | 'near' | 'miss' };

/**
 * Розмітка слів фрази за розпізнаним текстом — вирівнювання послідовностей (найбільша зважена
 * спільна підпослідовність), а не пошук слова будь-де: «A B» проти «B A» дає одне зелене слово,
 * повтор у фразі зараховується лише стільки разів, скільки його почуто, а «czesc» замість «cześć» —
 * «near» (без польських знаків). Це підказка про розпізнаний текст, а не фонетична оцінка.
 * extra — почуті слова, яким немає місця у фразі (зайві або сказані не на своєму місці).
 */
export function alignSpeechWords(target: string, heard: string): { words: WordMark[]; extra: string[] } {
  const key = (w: string) => normalize(w).replace(/ /g, '');
  const tw = target.split(/\s+/).filter((w) => key(w));
  const hw = heard.split(/\s+/).filter((w) => key(w));
  const tk = tw.map(key), hk = hw.map(key);
  const gain = (i: number, j: number) => (tk[i] === hk[j] ? 2 : stripDiacritics(tk[i]) === stripDiacritics(hk[j]) ? 1 : 0);
  // best[i][j] — найкращий рахунок для суфіксів tw[i..] і hw[j..].
  const best = Array.from({ length: tw.length + 1 }, () => new Array<number>(hw.length + 1).fill(0));
  for (let i = tw.length - 1; i >= 0; i--) {
    for (let j = hw.length - 1; j >= 0; j--) {
      const g = gain(i, j);
      best[i][j] = Math.max(best[i + 1][j], best[i][j + 1], g ? g + best[i + 1][j + 1] : 0);
    }
  }
  const words: WordMark[] = [];
  const extra: string[] = [];
  let i = 0, j = 0;
  while (i < tw.length && j < hw.length) {
    const g = gain(i, j);
    if (g && best[i][j] === g + best[i + 1][j + 1]) {
      words.push({ w: tw[i], st: g === 2 ? 'ok' : 'near' });
      i++; j++;
    } else if (best[i][j] === best[i + 1][j]) {
      words.push({ w: tw[i], st: 'miss' });
      i++;
    } else {
      extra.push(hw[j]);
      j++;
    }
  }
  for (; i < tw.length; i++) words.push({ w: tw[i], st: 'miss' });
  for (; j < hw.length; j++) extra.push(hw[j]);
  return { words, extra };
}
