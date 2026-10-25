import {
  CHOICE_TYPES,
  DIALOGUE_TYPES,
  ORDER_TYPES,
  TEXT_TYPES,
  type ChoiceData,
  type CheckResult,
  type DialogueData,
  type ExerciseItem,
  type MatchData,
  type OrderData,
  type PronunciationData,
  type TextData,
} from './types';
import { matchText, normalize, similarity, sameSpeechPolarityAndNumbers } from './text';

export type AnswerPayload =
  | { optionId: string }
  | { text: string }
  | { tokens: string[] }
  | { pairs: [string, string][] }
  | { transcript?: string; skipped?: boolean }
  | { step: number; optionId: string };

/** Поріг схожості для зарахування вимови (розпізнавання мовлення, не фонетична оцінка). */
export const SPEECH_THRESHOLD = 0.75;

export function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Детермінований генератор псевдовипадкових чисел (mulberry32). */
export function seededRandom(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export type PublicItem = Omit<ExerciseItem, 'data' | 'exerciseId'> & { data: Record<string, unknown> };

/**
 * Готує вправу для клієнта: прибирає правильні відповіді, перемішує варіанти.
 * Перевірка завжди виконується на сервері.
 */
export function toPublicItem(item: ExerciseItem, rnd: () => number = Math.random): PublicItem {
  const { exerciseId: _e, ...rest } = item;
  const t = item.type;
  if (CHOICE_TYPES.includes(t)) {
    const { answer: _a, ...d } = item.data as ChoiceData;
    // Для пошуку помилки порядок слів у реченні важливий — не перемішуємо.
    const options = t === 'FIND_ERROR' ? d.options : shuffle(d.options, rnd);
    return { ...rest, data: { ...d, options } };
  }
  if (TEXT_TYPES.includes(t)) {
    const { accepted: _a, ...d } = item.data as TextData;
    return { ...rest, data: d };
  }
  if (ORDER_TYPES.includes(t)) {
    const { answer: _a, alternatives: _alt, ...d } = item.data as OrderData;
    return { ...rest, data: { ...d, tokens: shuffle(d.tokens, rnd) } };
  }
  if (t === 'MATCH_PAIRS') {
    const d = item.data as MatchData;
    return {
      ...rest,
      data: {
        left: shuffle(d.pairs.map((p) => ({ id: p.l, text: p.pl })), rnd),
        right: shuffle(d.pairs.map((p) => ({ id: p.r, text: p.tr })), rnd),
      },
    };
  }
  if (t === 'PRONUNCIATION') return { ...rest, data: { ...(item.data as PronunciationData) } };
  if (DIALOGUE_TYPES.includes(t)) {
    const d = item.data as DialogueData;
    return {
      ...rest,
      data: {
        npc: d.npc,
        scene: d.scene,
        steps: d.steps.map((s) => ({
          npc: s.npc,
          npcTr: s.npcTr,
          options: s.options ? shuffle(s.options, rnd) : undefined,
        })),
      },
    };
  }
  return { ...rest, data: item.data as Record<string, unknown> };
}

function optionText(d: ChoiceData, id: string): string {
  const o = d.options.find((x) => x.id === id);
  if (!o) return '';
  return typeof o.text === 'string' ? o.text : o.text.uk;
}

/** Індекс останнього кроку діалогу, де користувач має обрати відповідь. */
export function lastChoiceStep(d: DialogueData): number {
  for (let i = d.steps.length - 1; i >= 0; i--) if (d.steps[i].options?.length) return i;
  return -1;
}

export function checkAnswer(item: ExerciseItem, payload: AnswerPayload): CheckResult {
  const t = item.type;
  const p = payload as Record<string, unknown>;

  // Аудіювання й диктант, коли звук недоступний: пропуск без XP і без помилки (не вгадування за текстом).
  if ((t === 'LISTENING' || t === 'DICTATION') && p.skipped === true) {
    const correctAnswer = t === 'LISTENING' ? (item.data as ChoiceData).answer : (item.data as TextData).accepted[0];
    return { correct: false, skipped: true, done: true, correctAnswer };
  }

  if (CHOICE_TYPES.includes(t)) {
    const d = item.data as ChoiceData;
    const correct = typeof p.optionId === 'string' && p.optionId === d.answer;
    return { correct, done: true, correctAnswer: d.answer };
  }

  if (TEXT_TYPES.includes(t)) {
    const d = item.data as TextData;
    const input = typeof p.text === 'string' ? p.text.slice(0, 500) : '';
    const { match, best } = matchText(input, d.accepted, { allowTypos: t !== 'GRAMMAR' });
    return { correct: match !== 'wrong', almost: match === 'diacritics' || match === 'typo', done: true, correctAnswer: best };
  }

  if (ORDER_TYPES.includes(t)) {
    const d = item.data as OrderData;
    const tokens = Array.isArray(p.tokens) ? (p.tokens as unknown[]).map(String) : [];
    const given = normalize(tokens.join(' '));
    const options = [d.answer, ...(d.alternatives ?? [])];
    const correct = options.some((o) => normalize(o.join(' ')) === given);
    return { correct, done: true, correctAnswer: d.answer.join(' ') };
  }

  if (t === 'MATCH_PAIRS') {
    const d = item.data as MatchData;
    const pairs = Array.isArray(p.pairs) ? (p.pairs as [string, string][]) : [];
    const expected = new Map(d.pairs.map((x) => [x.l, x.r]));
    const seen = new Set<string>();
    let ok = pairs.length === d.pairs.length;
    for (const pair of pairs) {
      if (!Array.isArray(pair) || expected.get(pair[0]) !== pair[1] || seen.has(pair[0])) ok = false;
      seen.add(String(pair[0]));
    }
    return { correct: ok, done: true, correctAnswer: Object.fromEntries(expected) };
  }

  if (t === 'PRONUNCIATION') {
    const d = item.data as PronunciationData;
    if (p.skipped === true) return { correct: false, skipped: true, done: true, correctAnswer: d.text };
    const transcript = typeof p.transcript === 'string' ? p.transcript.slice(0, 300) : '';
    const sim = similarity(transcript, d.text);
    return { correct: !!transcript.trim() && sim >= SPEECH_THRESHOLD && sameSpeechPolarityAndNumbers(transcript, d.text), similarity: Math.round(sim * 100) / 100, done: true, correctAnswer: d.text };
  }

  if (DIALOGUE_TYPES.includes(t)) {
    const d = item.data as DialogueData;
    const stepIdx = typeof p.step === 'number' ? p.step : -1;
    const step = d.steps[stepIdx];
    if (!step || !step.options?.length) return { correct: false, done: false };
    const correct = p.optionId === step.answer;
    const done = correct && stepIdx === lastChoiceStep(d);
    const ans = step.options.find((o) => o.id === step.answer);
    return { correct, done, correctAnswer: ans?.text, feedback: correct ? undefined : step.feedback };
  }

  return { correct: false, done: true };
}

/** Людський вигляд правильної відповіді для варіантів-вибору. */
export function describeChoiceAnswer(item: ExerciseItem): string {
  return optionText(item.data as ChoiceData, (item.data as ChoiceData).answer);
}

/**
 * Порядок завдань без довгих серій однієї механіки: не більше `maxRun` однакових типів поспіль.
 * Стабільно й детерміновано: завдання лише зсуваються вперед-назад, жодне не губиться.
 */
export function spreadByType<T extends { type: string }>(items: T[], maxRun = 3): T[] {
  const rest = items.slice();
  const out: T[] = [];
  while (rest.length) {
    const tail = out.slice(-maxRun);
    const blocked = tail.length === maxRun && tail.every((x) => x.type === tail[0].type) ? tail[0].type : null;
    let idx = 0;
    if (blocked !== null && rest[0].type === blocked) {
      const alt = rest.findIndex((x) => x.type !== blocked);
      if (alt > 0) idx = alt;
    }
    out.push(rest.splice(idx, 1)[0]);
  }
  return out;
}
