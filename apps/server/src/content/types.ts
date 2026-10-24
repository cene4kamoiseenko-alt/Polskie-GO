import type { Cefr, I18n } from '@polski-go/shared';
import type { ExerciseSeed } from './builders';

export type LessonSeed = {
  slug: string;
  kind?: 'LESSON' | 'BOSS' | 'EXAM' | 'PLACEMENT';
  title: I18n;
  topic: I18n;
  cefr: Cefr;
  difficulty: number;
  /** Пояснення теми. Підтримується **жирний** текст і переноси рядків. */
  explanation: I18n;
  examples: { pl: string; tr: I18n }[];
  /** Нові слова уроку — ключі `pl` зі словника. */
  words: string[];
  exercises: ExerciseSeed[];
};

export type RouteSeed = {
  slug: string;
  title: I18n;
  description: I18n;
  icon: string;
  lessons: LessonSeed[];
};

export type CityContent = { city: string; routes: RouteSeed[] };
