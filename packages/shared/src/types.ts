/** Мови інтерфейсу. Польська — і мова інтерфейсу, і мова, яку вивчають. */
export const UI_LANGS = ['uk', 'ru', 'en', 'pl'] as const;
export type UiLang = (typeof UI_LANGS)[number];

/** Текст, перекладений мовами інтерфейсу. `uk` — обов'язковий (основна мова). */
export type I18n = { uk: string; ru?: string; en?: string; pl?: string };

export const CEFR_LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2'] as const;
export type Cefr = (typeof CEFR_LEVELS)[number];

/**
 * Типи вправ. Частина типів поділяє однакову механіку (вибір варіанту, введення
 * тексту, впорядкування), але має власну подачу в інтерфейсі.
 * «Швидкий раунд» і «Практичний іспит» — це режими сесії, а не окремі типи вправ.
 */
export const EXERCISE_TYPES = [
  'WORD_TRANSLATION',
  'SENTENCE_TRANSLATION',
  'BUILD_SENTENCE',
  'FILL_GAP',
  'LISTENING',
  'PRONUNCIATION',
  'DIALOGUE',
  'MATCH_PAIRS',
  'FIND_ERROR',
  'GRAMMAR',
  'READING',
  'SITUATION',
  'PICTURE_WORD',
  'DICTATION',
  'ODD_ONE_OUT',
  'WORD_ORDER',
] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export const CHOICE_TYPES: ExerciseType[] = [
  'WORD_TRANSLATION',
  'FILL_GAP',
  'LISTENING',
  'FIND_ERROR',
  'READING',
  'PICTURE_WORD',
  'ODD_ONE_OUT',
];
export const TEXT_TYPES: ExerciseType[] = ['SENTENCE_TRANSLATION', 'DICTATION', 'GRAMMAR'];
export const ORDER_TYPES: ExerciseType[] = ['BUILD_SENTENCE', 'WORD_ORDER'];
export const DIALOGUE_TYPES: ExerciseType[] = ['DIALOGUE', 'SITUATION'];

/** Варіант відповіді: польський рядок або переклад мовами інтерфейсу. */
export type ChoiceOption = { id: string; text: string | I18n };

export type ChoiceData = {
  /** Питання/інструкція мовою інтерфейсу (необов'язково — є стандартна за типом). */
  question?: I18n;
  /** Головний польський текст: слово, речення з ___, речення для пошуку помилки. */
  pl?: string;
  /** Переклад головного тексту (підказка). */
  translation?: I18n;
  /** Текст для читання (READING). */
  passage?: string;
  /** Текст, який треба озвучити (LISTENING). */
  audioText?: string;
  audioUrl?: string;
  /** Емодзі або URL зображення (PICTURE_WORD). */
  image?: string;
  options: ChoiceOption[];
  answer: string;
};

export type TextData = {
  /** Що перекласти (SENTENCE_TRANSLATION). */
  source?: I18n;
  /** Речення з пропуском ___ (GRAMMAR). */
  pl?: string;
  /** Базова форма, яку треба змінити (GRAMMAR), напр. "być". */
  base?: string;
  /** Текст для диктанту (DICTATION). */
  audioText?: string;
  audioUrl?: string;
  translation?: I18n;
  accepted: string[];
};

export type OrderData = {
  translation?: I18n;
  /** Усі плитки (включно з зайвими), у довільному порядку. */
  tokens: string[];
  answer: string[];
  alternatives?: string[][];
};

export type MatchData = {
  pairs: { l: string; r: string; pl: string; tr: I18n }[];
};

export type PronunciationData = {
  text: string;
  translation: I18n;
  audioUrl?: string;
};

export type DialogueStep = {
  npc: string;
  npcTr: I18n;
  options?: { id: string; text: string; tr: I18n }[];
  answer?: string;
  feedback?: I18n;
};
export type DialogueData = {
  npc: { name: string; emoji: string; role?: I18n };
  scene?: I18n;
  steps: DialogueStep[];
};

export type ExerciseData = ChoiceData | TextData | OrderData | MatchData | PronunciationData | DialogueData;

export type ExerciseItem = {
  key: string;
  type: ExerciseType;
  skill: string;
  data: ExerciseData;
  explanation?: I18n;
  exerciseId?: string;
  vocabId?: string;
};

export type CheckResult = {
  correct: boolean;
  /** Відповідь зараховано, але з дрібною неточністю (діакритика, одруківка). */
  almost?: boolean;
  /** Для діалогів: чи завершено всю вправу. */
  done: boolean;
  /** Правильна відповідь для показу користувачу. */
  correctAnswer?: string | string[] | Record<string, string>;
  /** Для вимови: схожість розпізнаного тексту, 0..1. */
  similarity?: number;
  skipped?: boolean;
  feedback?: I18n;
};
