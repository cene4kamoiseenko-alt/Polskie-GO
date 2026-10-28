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
  /**
   * Номер завдання в ідентифікаторі (`e_<урок>_<номер>`) для кожного завдання, якщо він не збігається з позицією:
   * урок скорочено за стандартом міста (city-standard.ts), а завдання зберігають свої старі ідентифікатори.
   */
  exerciseIds?: number[];
};

export type RouteSeed = {
  slug: string;
  title: I18n;
  description: I18n;
  icon: string;
  lessons: LessonSeed[];
};

export type CityContent = { city: string; routes: RouteSeed[] };
