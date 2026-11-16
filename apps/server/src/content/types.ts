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
  /**
   * Трудные версии урока для игрока выше уровня урока (2026-11-16): тот же сюжет и тема, задания уровня A2/B1/B2.
   * Порядок в БД — 100+/200+/300+ (VARIANT_ORDER, seed.ts), идентификатор — `e_<урок>_<порядок>`.
   */
  levels?: Partial<Record<'A2' | 'B1' | 'B2', ExerciseSeed[]>>;
};

export type RouteSeed = {
  slug: string;
  title: I18n;
  description: I18n;
  icon: string;
  lessons: LessonSeed[];
};

export type CityContent = { city: string; routes: RouteSeed[] };
