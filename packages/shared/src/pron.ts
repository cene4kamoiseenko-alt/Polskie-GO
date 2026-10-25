/**
 * Підказки вимови польської фрази: широка транскрипція IPA (варшавська норма) і приблизне
 * прочитання кирилицею для україно- та російськомовних. Обидві будуються з написання за правилами:
 *  - диграфи (ch, cz, dz, dź, dż, rz, sz), м'якість перед i (si, ci, zi, ni, dzi; pi → pj; ki → kʲ);
 *  - носові ę/ą: перед p/b → m, перед t/d/c/cz → n, перед ć/dź → ɲ, перед k/g → ŋ, перед l/ł — без носовості,
 *    у кінці слова ę → ɛ, ą → ɔ̃; перед щілинними — носовий голосний;
 *  - уподібнення за дзвінкістю в межах слова і з прийменниками w/z; w/rz після глухого оглушуються;
 *    дзвінкі в кінці слова оглушуються; ł між приголосним і приголосним/кінцем випадає (jabłko, mógł);
 *  - наголос на передостанньому складі (винятки на кшталт muzyka/byliśmy не враховано).
 * Кирилиця — лише наближення (позначається «≈») і ніколи не озвучується польським голосом.
 */

type Seg = { p: string; v: boolean; from?: string };

const VOWELS = new Set(['a', 'ɛ', 'ɔ', 'u', 'i', 'ɨ', 'ɛ̃', 'ɔ̃']);
const LETTER_VOWELS = 'aąeęioóuy';
/** Літера — голосна (порожній рядок у кінці слова — ні: 'abc'.includes('') завжди true). */
const isVowelLetter = (c: string | undefined) => !!c && LETTER_VOWELS.includes(c);
/** Пари за дзвінкістю: глухий ↔ дзвінкий. */
const VOICE: Record<string, string> = {
  p: 'b', t: 'd', k: 'ɡ', kʲ: 'ɡʲ', f: 'v', s: 'z', ʂ: 'ʐ', ɕ: 'ʑ', t͡s: 'd͡z', t͡ʂ: 'd͡ʐ', t͡ɕ: 'd͡ʑ',
};
const DEVOICE: Record<string, string> = Object.fromEntries(Object.entries(VOICE).map(([a, b]) => [b, a]));
const OBSTRUENTS = new Set([...Object.keys(VOICE), ...Object.values(VOICE), 'x', 'xʲ']);
const SONORITY = (p: string) => (OBSTRUENTS.has(p) ? 0 : ['m', 'n', 'ɲ', 'ŋ'].includes(p) ? 1 : ['l', 'r'].includes(p) ? 2 : 3);
const isVowel = (s: Seg | undefined) => !!s && VOWELS.has(s.p);
const isObstruent = (s: Seg | undefined) => !!s && OBSTRUENTS.has(s.p);
const voiceless = (p: string) => p in VOICE || p === 'x' || p === 'xʲ';

const SINGLE: Record<string, string> = {
  a: 'a', ą: 'ɔ̃', b: 'b', c: 't͡s', ć: 't͡ɕ', d: 'd', e: 'ɛ', ę: 'ɛ̃', f: 'f', g: 'ɡ', h: 'x', i: 'i', j: 'j', k: 'k', l: 'l', ł: 'w',
  m: 'm', n: 'n', ń: 'ɲ', o: 'ɔ', ó: 'u', p: 'p', r: 'r', s: 's', ś: 'ɕ', t: 't', u: 'u', w: 'v', y: 'ɨ', z: 'z', ź: 'ʑ', ż: 'ʐ',
  q: 'k', v: 'v',
};
const SOFT_BEFORE_I: Record<string, string> = { dz: 'd͡ʑ', c: 't͡ɕ', s: 'ɕ', z: 'ʑ', n: 'ɲ' };
const DIGRAPHS: [string, string][] = [['dź', 'd͡ʑ'], ['dż', 'd͡ʐ'], ['dz', 'd͡z'], ['ch', 'x'], ['cz', 't͡ʂ'], ['rz', 'ʐ'], ['sz', 'ʂ']];

/** Запозичення, що читаються не за польським написанням (з відмінками): замінюємо польським написанням вимови. */
const RESPELL: [RegExp, string][] = [[/ketchup/g, 'keczup']];

/** Розбір одного слова на звуки (до уподібнень). */
function parse(word: string): Seg[] {
  const w = RESPELL.reduce((acc, [re, to]) => acc.replace(re, to), word.toLowerCase());
  const out: Seg[] = [];
  for (let i = 0; i < w.length; ) {
    const rest = w.slice(i);
    // dzi, ci, si, zi, ni: м'який приголосний; i перед голосним — лише знак м'якості.
    const soft = ['dz', 'c', 's', 'z', 'n'].find((c) => rest.startsWith(c + 'i') && !(c === 'c' && rest.startsWith('ch')) && !(c === 's' && rest.startsWith('sz')) && !(c === 'z' && rest.startsWith('zz')));
    if (soft && !(soft === 'c' && w[i + 1] === 'z') && !(soft === 's' && w[i + 1] === 'z')) {
      out.push({ p: SOFT_BEFORE_I[soft], v: false });
      i += soft.length;
      if (isVowelLetter(w[i + 1])) i += 1; // i лише пом'якшує
      continue;
    }
    const di = DIGRAPHS.find(([g]) => rest.startsWith(g));
    if (di) {
      out.push({ p: di[1], v: false, from: di[0] });
      i += di[0].length;
      continue;
    }
    const ch = w[i];
    if (ch === 'x') { out.push({ p: 'k', v: false }, { p: 's', v: false }); i++; continue; }
    if (ch === 'i') {
      const prev = out[out.length - 1];
      const nextVowel = isVowelLetter(w[i + 1]);
      // ki, gi, chi: пом'якшений приголосний (kʲ); i перед голосним далі не звучить.
      if (prev && ['k', 'ɡ', 'x'].includes(prev.p)) {
        prev.p += 'ʲ';
        if (nextVowel) { i++; continue; }
      } else if (prev && !isVowel(prev) && nextVowel) {
        out.push({ p: 'j', v: false });
        i++;
        continue;
      }
    }
    // au, eu на початку слова (auto, Europa) — нескладовий [w]; усередині (nauka) — окремі склади.
    if (ch === 'u' && i === 1 && (w[0] === 'a' || w[0] === 'e')) { out.push({ p: 'w', v: false, from: 'u' }); i++; continue; }
    const p = SINGLE[ch];
    if (p) out.push({ p, v: VOWELS.has(p), from: ch === 'w' ? 'w' : undefined });
    i++;
  }
  return out;
}

/** Уподібнення, носові, оглушення в межах фонетичного слова (з прийменником w/z). */
function shape(segs: Seg[]): Seg[] {
  let s = segs.map((x) => ({ ...x }));
  // ł після проривного перед приголосним або в кінці випадає: jabłko [ˈjapkɔ], mógł [muk] (але pomysł — [w]).
  const PLOSIVES = ['p', 'b', 't', 'd', 'k', 'ɡ', 'kʲ', 'ɡʲ'];
  s = s.filter((x, i) => !(x.p === 'w' && x.from !== 'u' && s[i - 1] && PLOSIVES.includes(s[i - 1].p) && (!s[i + 1] || !isVowel(s[i + 1]))));
  // n перед k/g → ŋ.
  for (let i = 0; i < s.length - 1; i++) if (s[i].p === 'n' && ['k', 'ɡ', 'kʲ', 'ɡʲ'].includes(s[i + 1].p)) s[i].p = 'ŋ';
  // Носові голосні.
  const out: Seg[] = [];
  for (let i = 0; i < s.length; i++) {
    const x = s[i];
    if (x.p !== 'ɛ̃' && x.p !== 'ɔ̃') { out.push(x); continue; }
    const oral = x.p === 'ɛ̃' ? 'ɛ' : 'ɔ';
    const next = s[i + 1]?.p;
    if (!next) { out.push({ ...x, p: x.p === 'ɛ̃' ? 'ɛ' : 'ɔ̃' }); continue; }
    if (['p', 'b'].includes(next)) out.push({ ...x, p: oral }, { p: 'm', v: false });
    else if (['t', 'd', 't͡s', 'd͡z', 't͡ʂ', 'd͡ʐ'].includes(next)) out.push({ ...x, p: oral }, { p: 'n', v: false });
    else if (['t͡ɕ', 'd͡ʑ'].includes(next)) out.push({ ...x, p: oral }, { p: 'ɲ', v: false });
    else if (['k', 'ɡ', 'kʲ', 'ɡʲ'].includes(next)) out.push({ ...x, p: oral }, { p: 'ŋ', v: false });
    else if (['l', 'w'].includes(next)) out.push({ ...x, p: oral });
    else out.push(x);
  }
  s = out;
  // w і rz після глухого оглушуються (kwiat, przy, twój, chrząszcz).
  for (let i = 1; i < s.length; i++) {
    if ((s[i].from === 'w' || s[i].from === 'rz') && voiceless(s[i - 1].p) && s[i].p in DEVOICE) s[i].p = DEVOICE[s[i].p];
  }
  // Регресивне уподібнення: приголосний набуває дзвінкості наступного шумного (w/rz її не передають).
  for (let i = s.length - 2; i >= 0; i--) {
    const next = s[i + 1];
    if (!isObstruent(s[i]) || !isObstruent(next) || next.from === 'w' || next.from === 'rz') continue;
    if (voiceless(next.p) && s[i].p in DEVOICE) s[i].p = DEVOICE[s[i].p];
    else if (!voiceless(next.p) && s[i].p in VOICE) s[i].p = VOICE[s[i].p];
  }
  // Оглушення в кінці слова (уся кінцева група шумних).
  for (let i = s.length - 1; i >= 0 && isObstruent(s[i]); i--) if (s[i].p in DEVOICE) s[i].p = DEVOICE[s[i].p];
  return s;
}

/** Індекс першого звука наголошеного (передостаннього) складу або -1 для односкладових. */
function stressAt(s: Seg[]): number {
  const vowels = s.map((x, i) => (isVowel(x) ? i : -1)).filter((i) => i >= 0);
  if (vowels.length < 2) return -1;
  const v = vowels[vowels.length - 2];
  const prevV = vowels[vowels.length - 3] ?? -1;
  // Початок складу — найдовша група приголосних перед голосним зі зростанням звучності.
  let start = v;
  while (start - 1 > prevV && !isVowel(s[start - 1])) {
    const c = s[start - 1];
    if (start === v || prevV === -1 || SONORITY(c.p) < SONORITY(s[start].p)) start--;
    else break;
  }
  return start;
}

export type PronWord = { segs: Seg[]; stress: number; parts: number[] };

/** Фонетичні слова: прийменники w/z приєднуються до наступного слова. */
export function polishPron(text: string): PronWord[] {
  const words = text.normalize('NFC').toLowerCase().match(/[\p{L}]+/gu) ?? [];
  const units: string[][] = [];
  for (let i = 0; i < words.length; i++) {
    if ((words[i] === 'w' || words[i] === 'z') && words[i + 1]) {
      units.push([words[i], words[i + 1]]);
      i++;
    } else units.push([words[i]]);
  }
  return units.map((u) => {
    const parsed = u.map(parse);
    const segs = shape(parsed.flat());
    // Межі слів усередині одиниці (для кирилиці з пробілом після прийменника).
    const parts = parsed.length > 1 ? [parsed[0].length] : [];
    return { segs, stress: stressAt(segs), parts };
  });
}

/** Широка транскрипція IPA без дужок: «d͡ʑɛɲ ˈdɔbrɨ». */
export function polishIpa(text: string): string {
  return polishPron(text)
    .map(({ segs, stress }) => segs.map((x, i) => (i === stress ? 'ˈ' : '') + x.p).join(''))
    .join(' ');
}

const ACUTE = '\u0301';

/** Приблизне прочитання кирилицею (ru/uk). Наголос — знаком над голосним. Лише для показу, не для озвучування. */
export function polishCyrillic(text: string, lang: 'ru' | 'uk'): string {
  const ru = lang === 'ru';
  const SOFT = new Set(['ɕ', 'ʑ', 't͡ɕ', 'd͡ʑ', 'ɲ', 'kʲ', 'ɡʲ', 'xʲ']);
  const BASE: Record<string, string> = {
    p: 'п', b: 'б', t: 'т', d: 'д', k: 'к', ɡ: ru ? 'г' : 'ґ', f: 'ф', v: 'в', s: 'с', z: 'з', ʂ: 'ш', ʐ: 'ж', x: 'х',
    t͡s: 'ц', d͡z: 'дз', t͡ʂ: 'ч', d͡ʐ: 'дж', m: 'м', n: 'н', ŋ: 'н', r: 'р', l: 'л',
    ɕ: 'с', ʑ: 'з', t͡ɕ: ru ? 'ч' : 'ц', d͡ʑ: 'дз', ɲ: 'н', kʲ: 'к', ɡʲ: ru ? 'г' : 'ґ', xʲ: 'х',
  };
  const PLAIN: Record<string, string> = { a: 'а', ɛ: ru ? 'э' : 'е', ɔ: 'о', u: 'у', i: ru ? 'и' : 'і', ɨ: ru ? 'ы' : 'и', 'ɛ̃': ru ? 'эн' : 'ен', 'ɔ̃': 'он' };
  // Після j або м'якого приголосного.
  const IOT: Record<string, string> = { a: 'я', ɛ: ru ? 'е' : 'є', ɔ: ru ? 'ё' : 'йо', u: 'ю', i: ru ? 'и' : 'і', ɨ: ru ? 'ы' : 'и', 'ɛ̃': ru ? 'ен' : 'єн', 'ɔ̃': ru ? 'ён' : 'йон' };
  return polishPron(text)
    .map(({ segs, stress, parts }) => {
      let out = '';
      const stressed = stress >= 0 ? segs.findIndex((x, i) => i >= stress && isVowel(x)) : -1;
      for (let i = 0; i < segs.length; i++) {
        if (parts.includes(i)) out += ' ';
        const x = segs[i];
        const prev = segs[i - 1];
        const next = segs[i + 1];
        if (isVowel(x)) {
          const isStressed = i === stressed;
          const o = x.p === 'ɔ' || x.p === 'ɔ̃';
          let letter: string;
          // ru «ч» уже м'який — після нього звичайні голосні.
          if (prev && SOFT.has(prev.p) && !(ru && prev.p === 't͡ɕ')) {
            // М'яке «о»: ru «ё» лише під наголосом (інакше читається наголошеним), решта — «ьо».
            letter = o && !(ru && isStressed) ? 'ьо' + (x.p === 'ɔ̃' ? 'н' : '') : IOT[x.p];
          } else if (prev?.p === 'j') {
            letter = o && ru && !isStressed ? 'йо' + (x.p === 'ɔ̃' ? 'н' : '') : IOT[x.p];
          } else letter = PLAIN[x.p];
          // Знак наголосу — після голосної літери (у «ьо»/«йо» — після «о»; «ё» не позначаємо).
          const at = /^[ьй]/.test(letter) ? 2 : 1;
          out += isStressed && !letter.startsWith('ё') ? letter.slice(0, at) + ACUTE + letter.slice(at) : letter;
          continue;
        }
        if (x.p === 'j') {
          // j перед голосним передає йотована літера; після твердого приголосного — ь (ru) або апостроф (uk, крім «йо»).
          if (isVowel(next)) {
            const iotO = next.p === 'ɔ' || next.p === 'ɔ̃';
            if (prev && !isVowel(prev) && !SOFT.has(prev.p) && !(iotO && !ru)) out += ru ? 'ь' : '’';
          } else out += 'й';
          continue;
        }
        if (x.p === 'w') {
          // ł і нескладове u: ru «у» (перед «у» — «в»), uk «в».
          out += ru && next?.p !== 'u' ? 'у' : 'в';
          continue;
        }
        out += BASE[x.p] ?? '';
        // М'який приголосний без голосного після нього — з м'яким знаком; світле польське l перед приголосним — «ль».
        if ((SOFT.has(x.p) || x.p === 'l') && !isVowel(next)) out += 'ь';
      }
      return out;
    })
    .join(' ');
}
