/**
 * Задания повторения слов (жалоба владельца 2026-11-28 со снимками: «очень лёгкие тесты, не зная польского, можно ответить»).
 *
 * Почему было легко:
 *  • созвучные слова (mama → мама, toaleta → туалет, niegazowana → негазированная) давались как «выбери перевод» — ответ слышен;
 *  • неверные варианты брались из случайных слов игрока («хот-дог» к dziecko, autostrada к «семья») — лишнее отсекается без языка,
 *    а созвучный неверный вариант отсекается тем более: игрок видит, что dziecko — не «хот-дог».
 *
 * Правила:
 *  • созвучное слово (по-русски или по-украински) не бывает «выбери перевод»: вместо этого «как правильно пишется» — верное написание
 *    против ловушек по русскому образцу (tualeta, ogurek, żeka), аудирование с похоже звучащими словами или сборка из плашек;
 *  • неверные варианты — только несозвучные слова, сначала той же темы и части речи, той же «длины» (слово к слову, фраза к фразе),
 *    без совпадающих переводов; в «как это по-польски» и аудировании — ещё и похожие по написанию/звучанию;
 *  • набор кандидатов — весь опубликованный словарь (не только слова игрока): у новичка своих слов мало и все из разных тем.
 */
import type { ExerciseItem, I18n } from '@polski-go/shared';
import { cognateScore, cyrSkeleton, levenshtein, plSkeleton, skeletonSimilarity } from '../lib/cognate';

export type VocabWord = { id: string; pl: string; pos: string; translations: I18n; topics: string[]; audioUrl: string | null };

// ── Созвучие ──────────────────────────────────────────────────────────────────────────────────────────────────────────

/** Польское слово → примерное написание кириллицей (для коротких слов, где скелета согласных мало). */
const PL_TO_CYR: [RegExp, string][] = [
  [/szcz/g, 'щ'], [/sz/g, 'ш'], [/cz/g, 'ч'], [/rz/g, 'ж'], [/ch/g, 'х'], [/dż/g, 'дж'], [/dź/g, 'дзь'], [/dz/g, 'дз'],
  [/ą/g, 'он'], [/ę/g, 'ен'], [/ó/g, 'у'], [/ł/g, 'л'], [/ż/g, 'ж'], [/ź/g, 'зь'], [/ś/g, 'сь'], [/ć/g, 'ть'], [/ń/g, 'нь'],
  [/a/g, 'а'], [/b/g, 'б'], [/c/g, 'ц'], [/d/g, 'д'], [/e/g, 'е'], [/f/g, 'ф'], [/g/g, 'г'], [/h/g, 'х'], [/i/g, 'и'], [/j/g, 'й'],
  [/k/g, 'к'], [/l/g, 'л'], [/m/g, 'м'], [/n/g, 'н'], [/o/g, 'о'], [/p/g, 'п'], [/r/g, 'р'], [/s/g, 'с'], [/t/g, 'т'], [/u/g, 'у'],
  [/w/g, 'в'], [/y/g, 'ы'], [/z/g, 'з'],
];
const translit = (pl: string) => PL_TO_CYR.reduce((s, [re, to]) => s.replace(re, to), pl.toLowerCase()).replace(/ь/g, '');
const cyrNorm = (w: string) => w.toLowerCase().replace(/[ьъ]/g, '').replace(/ё/g, 'е').replace(/[іи]/g, 'и').replace(/ї/g, 'йи').replace(/є/g, 'е').replace(/ґ/g, 'г');
const variants = (text: string) => (text.toLowerCase().match(/[\p{L}-]+/gu) ?? []).filter((w) => w.length >= 2);
const ratio = (a: string, b: string) => (Math.max(a.length, b.length) ? 1 - levenshtein(a, b) / Math.max(a.length, b.length) : 0);

const cognateCache = new Map<string, boolean>();

/**
 * Созвучно ли слово русскому или украинскому переводу (угадывается без знания польского). Длинные слова — по скелету согласных
 * (общая эвристика с проверкой вопросов дня), короткие (≤ 2 согласных: mama, kawa, syn) — по написанию кириллицей.
 */
export function isCognateWord(w: Pick<VocabWord, 'pl' | 'translations'>): boolean {
  const key = `${w.pl}|${w.translations.ru}|${w.translations.uk}`;
  const hit = cognateCache.get(key);
  if (hit !== undefined) return hit;
  let yes = false;
  for (const tr of [w.translations.ru, w.translations.uk]) {
    if (!tr) continue;
    if (cognateScore(w.pl, tr) >= 0.7) yes = true;
    for (const p of variants(w.pl)) {
      if (plSkeleton(p).length >= 3) continue;
      const t = translit(p);
      for (const c of variants(tr)) if (cyrSkeleton(c).length < 4 && ratio(t, cyrNorm(c)) >= 0.75) yes = true;
    }
    if (yes) break;
  }
  cognateCache.set(key, yes);
  return yes;
}

// ── Ловушки написания ─────────────────────────────────────────────────────────────────────────────────────────────────

/** Ошибки, которые делает русско- и украиноязычный ученик: пишет «как слышит» или «как по-русски». Одна замена — одна ловушка. */
const TRAPS: [RegExp, string][] = [
  [/o/, 'u'], [/ó/, 'u'], [/u/, 'ó'], [/rz/, 'ż'], [/ż/, 'rz'], [/rz/, 'sz'], [/ch/, 'h'], [/h/, 'ch'], [/ł/, 'l'], [/l/, 'ł'],
  [/ą/, 'on'], [/ą/, 'o'], [/ę/, 'en'], [/ę/, 'e'], [/y/, 'i'], [/i/, 'y'], [/w/, 'f'], [/ś/, 'si'], [/ć/, 'ci'], [/e/, 'ie'],
];

/** Неверные написания слова (без настоящих слов словаря, если он передан), в порядке правдоподобия. */
export function misspellings(pl: string, real?: Set<string>): string[] {
  const out: string[] = [];
  for (const [re, to] of TRAPS) {
    if (!re.test(pl)) continue;
    const s = pl.replace(re, to);
    if (s === pl || out.includes(s) || real?.has(s.toLowerCase())) continue;
    out.push(s);
  }
  return out;
}

// ── Неверные варианты ─────────────────────────────────────────────────────────────────────────────────────────────────

const wordCount = (s: string) => s.trim().split(/\s+/).length;
const trWords = (w: VocabWord) => new Set([...variants(w.translations.ru ?? ''), ...variants(w.translations.uk ?? '')]);

type Mode = 'translation' | 'polish' | 'sound';

/**
 * Переводы созвучных слов: такой перевод в вариантах выдаёт себя, даже если взят у несозвучного синонима (naprawa — «ремонт»):
 * ученик видит «ремонт», думает «по-польски remont» и отбрасывает вариант. Считается один раз на набор кандидатов.
 */
const cognateTrCache = new WeakMap<VocabWord[], Set<string>>();
function cognateTranslations(candidates: VocabWord[]): Set<string> {
  let set = cognateTrCache.get(candidates);
  if (!set) {
    set = new Set<string>();
    for (const c of candidates) if (isCognateWord(c)) for (const t of [c.translations.ru, c.translations.uk]) if (t) set.add(t.toLowerCase().trim());
    cognateTrCache.set(candidates, set);
  }
  return set;
}

/** Два неверных варианта к слову: несозвучные (кроме аудирования), сначала той же темы и части речи, похожие по виду или звучанию. */
export function pickDistractors(w: VocabWord, candidates: VocabWord[], mode: Mode, rnd: () => number, n = 2): VocabWord[] {
  const mine = trWords(w);
  const giveaway = mode === 'translation' ? cognateTranslations(candidates) : null;
  const skel = plSkeleton(w.pl);
  const words = wordCount(w.pl);
  const scored: { c: VocabWord; score: number }[] = [];
  for (const c of candidates) {
    if (c.id === w.id || c.pl.toLowerCase() === w.pl.toLowerCase()) continue;
    // Тот же перевод (синоним) — второй верный ответ.
    if ([...trWords(c)].some((x) => mine.has(x))) continue;
    if (mode !== 'sound' && isCognateWord(c)) continue;
    if (giveaway && [c.translations.ru, c.translations.uk].some((t) => t && giveaway.has(t.toLowerCase().trim()))) continue;
    const sameCount = wordCount(c.pl) === words;
    if (!sameCount && mode !== 'translation') continue;
    let score = 0;
    const sim = skeletonSimilarity(skel, plSkeleton(c.pl));
    if (mode === 'sound') {
      // Аудирование: решает звучание — слова, которые на слух легко спутать (mama / mapa / mała), а не тема.
      score += 8 * sim + (c.pos === w.pos ? 0.5 : 0) + (sameCount ? 1 : 0);
    } else {
      // Часть речи важнее темы: глагол среди существительных выдаёт себя окончанием (-ć).
      if (c.pos === w.pos) score += 3;
      if (c.topics.some((t) => w.topics.includes(t))) score += 2;
      if (sameCount) score += 1;
      if (mode === 'polish') score += 3 * sim;
    }
    // Похожая длина ответа: по длине верный вариант не выделяется.
    const a = mode === 'translation' ? (w.translations.ru ?? '').length : w.pl.length;
    const b = mode === 'translation' ? (c.translations.ru ?? '').length : c.pl.length;
    score -= Math.abs(a - b) / 12;
    scored.push({ c, score: score + rnd() * 0.5 });
  }
  scored.sort((x, y) => y.score - x.score);
  // Из лучших — случайные, чтобы одно и то же слово не шло всегда с одними и теми же соседями.
  const top = scored.slice(0, Math.max(n, 6));
  const out: VocabWord[] = [];
  while (out.length < n && top.length) out.push(top.splice(Math.floor(rnd() * top.length), 1)[0].c);
  return out;
}

// ── Задание ───────────────────────────────────────────────────────────────────────────────────────────────────────────

const shuffle = <T,>(xs: T[], rnd: () => number) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Задание на слово. variant (0…3) выбирает вид: 0 — перевод слова, 1 — «как это по-польски», 2 — аудирование, 3 — сборка.
 * Созвучное слово вместо 0 и 1 получает «как правильно пишется» (или аудирование, если ловушек меньше двух).
 */
export function buildWordItem(w: VocabWord, candidates: VocabWord[], rnd: () => number, variant: number, real?: Set<string>): ExerciseItem {
  const tr = w.translations;
  const key = `w:${w.id}:${variant}`;
  const skill = 'review.vocab';
  const kind = variant % 4;
  const cognate = isCognateWord(w);
  const listening = (): ExerciseItem => {
    const d = pickDistractors(w, candidates, 'sound', rnd);
    return {
      key, type: 'LISTENING', skill: 'review.listening', vocabId: w.id,
      data: { audioText: w.pl, audioUrl: w.audioUrl ?? undefined, options: shuffle([{ id: 'c', text: w.pl }, ...d.map((x, i) => ({ id: `d${i}`, text: x.pl }))], rnd), answer: 'c' },
    };
  };
  if (kind === 2) return listening();
  if (kind === 3) return { key, type: 'DICTATION', skill: 'review.writing', vocabId: w.id, data: { audioText: w.pl, audioUrl: w.audioUrl ?? undefined, translation: tr, accepted: [w.pl] } };
  if (cognate) {
    const traps = misspellings(w.pl, real ?? new Set(candidates.map((c) => c.pl.toLowerCase())));
    if (traps.length < 2) return listening();
    const pick = shuffle(traps.slice(0, 4), rnd).slice(0, 2);
    return {
      key, type: 'WORD_TRANSLATION', skill: 'review.spelling', vocabId: w.id,
      data: { translation: tr, options: shuffle([{ id: 'c', text: w.pl }, ...pick.map((s, i) => ({ id: `d${i}`, text: s }))], rnd), answer: 'c' },
    };
  }
  if (kind === 0) {
    const d = pickDistractors(w, candidates, 'translation', rnd);
    if (d.length < 2) return listening();
    return {
      key, type: 'WORD_TRANSLATION', skill, vocabId: w.id,
      data: { pl: w.pl, audioText: w.pl, options: shuffle([{ id: 'c', text: tr }, ...d.map((x, i) => ({ id: `d${i}`, text: x.translations }))], rnd), answer: 'c' },
    };
  }
  const d = pickDistractors(w, candidates, 'polish', rnd);
  if (d.length < 2) return listening();
  return {
    key, type: 'WORD_TRANSLATION', skill, vocabId: w.id,
    data: { translation: tr, options: shuffle([{ id: 'c', text: w.pl }, ...d.map((x, i) => ({ id: `d${i}`, text: x.pl }))], rnd), answer: 'c' },
  };
}
