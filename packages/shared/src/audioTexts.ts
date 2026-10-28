/**
 * Аудіобібліотека: які польські тексти клієнт реально озвучує і як однакові фрази зводяться до одного файлу.
 * Правила повторюють кнопки прослуховування застосунку (apps/web/src/exercises/Exercises.tsx, Lesson.tsx, Mission.tsx,
 * Dictionary.tsx, Slang.tsx, Story.tsx …): якщо кнопка з'являється чи зникає, правило тут змінюється разом із нею, —
 * тест apps/server/test/audio-library.test.ts звіряє каталог із контентом.
 */
import { isLoneLetter, speechText } from './speech';

/** Роль тексту в завданні: впливає на пріоритет генерації, а не на звук. */
export type SpeakRole = 'prompt' | 'option' | 'feedback' | 'token' | 'pair' | 'npc' | 'reply' | 'passage' | 'alt' | 'combo';
export type Speakable = { text: string; role: SpeakRole };

type Opt = { id?: string; text?: unknown };
type Step = { npc?: string; options?: Opt[]; answer?: string };

const str = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

/**
 * Усе, що клієнт може озвучити в одному завданні (дані з бази, data вправи).
 *  - кнопка «слухати» біля польського слова чи фрази (audioText ?? pl), аудіювання, диктант, вимова, текст для читання;
 *  - варіант-рядок звучить при виборі (крім «знайди помилку» й читання); однолітерний варіант — у реченні з пропуском;
 *  - плитки речення звучать по одній; однолітерний прийменник — разом із наступною плиткою («w domu»);
 *  - після помилки — правильна польська відповідь (речення з заповненим пропуском, відповідь, найближчий прийнятий варіант);
 *  - діалог: репліки співрозмовника й правильні відповіді (неправильні не озвучуються).
 * Тексти тут сирі: speechText / audioNorm застосовуються вже в каталозі.
 */
export function exerciseSpeakables(type: string, data: Record<string, unknown>): Speakable[] {
  const out: Speakable[] = [];
  const add = (text: unknown, role: SpeakRole) => {
    if (str(text) && !isLoneLetter(text)) out.push({ text, role });
  };
  const options = (Array.isArray(data.options) ? data.options : []) as Opt[];
  const pl = str(data.pl) ? data.pl : undefined;
  const answerOpt = options.find((o) => o.id === data.answer);

  if (type === 'WORD_TRANSLATION' || options.some((o) => str((o as { image?: unknown }).image))) add(data.audioText ?? pl, 'prompt');
  if (type === 'LISTENING' || type === 'DICTATION') add(data.audioText, 'prompt');
  if (type === 'PRONUNCIATION') add(data.text, 'prompt');
  if (type === 'READING') add(data.passage, 'passage');

  if (type !== 'FIND_ERROR' && type !== 'READING') {
    for (const o of options) {
      if (!str(o.text)) continue;
      if (isLoneLetter(o.text)) {
        if (pl?.includes('___')) add(pl.replace(/_{2,}/, o.text), 'option');
      } else add(o.text, 'option');
    }
  }

  if (type === 'FILL_GAP' && pl && answerOpt && str(answerOpt.text)) add(pl.replace('___', answerOpt.text), 'feedback');

  if (type === 'BUILD_SENTENCE' || type === 'WORD_ORDER') {
    const tokens = (Array.isArray(data.tokens) ? data.tokens : []).filter(str);
    const lone = tokens.filter((t) => isLoneLetter(t));
    for (const t of tokens) add(t, 'token');
    // Однолітерна плитка чекає на наступну: звучить пара «прийменник + слово» (у будь-якому порядку натискань).
    for (const l of lone) for (const t of tokens) if (!isLoneLetter(t)) add(`${l} ${t}`, 'combo');
    if (Array.isArray(data.answer)) add((data.answer as string[]).join(' '), 'feedback');
  }

  if (type === 'SENTENCE_TRANSLATION' || type === 'GRAMMAR' || type === 'DICTATION') {
    const accepted = (Array.isArray(data.accepted) ? data.accepted : []).filter(str);
    // Після помилки звучить найближчий прийнятий варіант — найчастіше перший; решта — запасна черга.
    accepted.forEach((a, i) => add(a, i === 0 ? 'feedback' : 'alt'));
  }

  if (type === 'MATCH_PAIRS') {
    for (const p of (Array.isArray(data.pairs) ? data.pairs : []) as { pl?: unknown }[]) add(p.pl, 'pair');
  }

  if (type === 'DIALOGUE' || type === 'SITUATION') {
    for (const s of (Array.isArray(data.steps) ? data.steps : []) as Step[]) {
      add(s.npc, 'npc');
      const ok = s.options?.find((o) => o.id === s.answer);
      if (ok) add(ok.text, 'reply');
    }
  }
  return out;
}

/**
 * Ключ однакової вимови: speechText, без лапок і крапки в кінці, малими літерами (pl).
 * «Tak.» і «tak» — один файл; «Tak?» і «Tak!» — окремі (інша інтонація). Різні словоформи не зливаються:
 * літери й діакритика не змінюються.
 */
export function audioNorm(raw: string): string {
  return speechText(raw)
    .replace(/[„”“"«»]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[\s.]+$/u, '')
    .trim()
    .toLocaleLowerCase('pl');
}

/** Версія бібліотеки: входить у шлях R2. Підвищується лише для свідомої повної перегенерації (новий запит, налаштування). */
export const AUDIO_LIBRARY_VERSION = 'v1';

/** Тип аудіоодиниці за формою тексту: для звітів і вибору моделі. */
export function audioKind(text: string, role?: SpeakRole): 'word' | 'phrase' | 'sentence' | 'dialogue' {
  if (role === 'npc' || role === 'reply') return 'dialogue';
  const words = speechText(text).split(' ').filter(Boolean).length;
  if (words <= 1) return 'word';
  if (words <= 3 && !/[.!?…]$/.test(text.trim())) return 'phrase';
  return 'sentence';
}
