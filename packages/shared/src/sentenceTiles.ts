/**
 * Переводы предложений и диктанты собираются из слов-плашек, а не печатаются (владелец 2026-11-07: поднимается клавиатура, польские буквы не видно;
 * «чтобы не было этих букв во всех тестах»). Состав плашек строит сервер, клиент получает перемешанный список `tokens` без принятых ответов,
 * а ответ шлёт тем же текстом, что и раньше: проверка (`matchText`) не меняется.
 *
 * Плашки: слова первого принятого ответа + слова из других принятых вариантов («Hej» вместо «Cześć» — тоже верный ответ) + при нехватке пара
 * безобидных слов-приманок. Знаки препинания по краям слова отрезаются: `normalize` всё равно заменяет их пробелами.
 */
import { normalize } from './text';
import type { TextData } from './types';

const EDGE = /^[.,!?;:"„”“«»…()\-–—]+|[.,!?;:"„”“«»…()\-–—]+$/g;

/** Слова фразы без знаков препинания по краям; число и дефис внутри слова сохраняются («10:00», «po-polsku»). */
export function tileWords(sentence: string): string[] {
  return sentence.trim().split(/\s+/).map((w) => w.replace(EDGE, '')).filter(Boolean);
}

/** Короткие слова, которые почти никогда не делают чужую фразу верной; берутся, когда у задания нет других вариантов ответа. */
const FILLERS = ['bardzo', 'tutaj', 'teraz', 'jeszcze', 'tylko', 'dobrze', 'dzisiaj', 'zawsze', 'razem', 'potem'];

const MAX_EXTRA = 3;
const MIN_TILES = 4;

function hash(s: string): number {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/**
 * Плашки для задания: слова ответа в порядке ответа (перемешивает вызывающий). Всегда содержат слова `accepted[0]`, так что верный ответ собирается.
 * Не меньше четырёх плашек и всегда хотя бы одна лишняя: у однословных ответов выбор из четырёх, у длинных — слова фразы и 1–3 лишних.
 */
export function sentenceTiles(d: Pick<TextData, 'accepted'>): string[] {
  const base = tileWords(d.accepted[0] ?? '');
  if (!base.length) return [];
  const have = new Set(base.map((w) => normalize(w)));
  const extra: string[] = [];
  for (const variant of d.accepted.slice(1)) {
    for (const w of tileWords(variant)) {
      const key = normalize(w);
      if (have.has(key) || extra.length >= MAX_EXTRA) continue;
      have.add(key);
      extra.push(w);
    }
  }
  const everyWord = new Set(d.accepted.flatMap((a) => tileWords(a).map((w) => normalize(w))));
  const start = hash(d.accepted[0]);
  for (let i = 0; i < FILLERS.length && (base.length + extra.length < MIN_TILES || !extra.length); i++) {
    const f = FILLERS[(start + i) % FILLERS.length];
    if (everyWord.has(normalize(f)) || have.has(normalize(f))) continue;
    have.add(normalize(f));
    extra.push(f);
  }
  return [...base, ...extra];
}
