/**
 * Картинки к вопросам бота (вопрос дня и /quiz): 16 полноразмерных сцен миссий, без надписей на языке интерфейса.
 * JPG 1280×720 в apps/web/public/bot/quiz/ собирает `node scripts/build-quiz-images.mjs` из оригиналов docs/design/a12|a16/missions.
 * Пять кадров магазинов (Żabka, Biedronka, Rossmann, InPost, ORLEN) — увеличенные вырезки из коллажа: в бот не идут, пока нет мастеров.
 */
import type { UiLang } from '@polski-go/shared';

export const QUIZ_SCENES = [
  'bar-mleczny',
  'biuro',
  'cukiernia',
  'lidl',
  'lotnisko-lot',
  'mieszkanie',
  'pierniki',
  'pierogarnia',
  'pkp',
  'przychodnia',
  'recepcja-narty',
  'stop-cafe',
  'tramwaj',
  'urzad',
  'warszawa-starowka',
  'zapiekanki',
] as const;

export type QuizScene = (typeof QUIZ_SCENES)[number];

/** Подписи сцен для админки (выбор картинки). */
export const SCENE_LABELS: Record<QuizScene, Record<UiLang, string>> = {
  'bar-mleczny': { ru: 'Бар млечны', uk: 'Бар млечни', en: 'Milk bar' },
  biuro: { ru: 'Офис', uk: 'Офіс', en: 'Office' },
  cukiernia: { ru: 'Кондитерская', uk: 'Кондитерська', en: 'Pastry shop' },
  lidl: { ru: 'Супермаркет Lidl', uk: 'Супермаркет Lidl', en: 'Lidl supermarket' },
  'lotnisko-lot': { ru: 'Аэропорт, стойка LOT', uk: 'Аеропорт, стійка LOT', en: 'Airport, LOT desk' },
  mieszkanie: { ru: 'Квартира', uk: 'Квартира', en: 'Flat' },
  pierniki: { ru: 'Пряники в Торуни', uk: 'Пряники в Торуні', en: 'Toruń gingerbread' },
  pierogarnia: { ru: 'Пирожковая', uk: 'Вареничня', en: 'Pierogi place' },
  pkp: { ru: 'Вокзал PKP', uk: 'Вокзал PKP', en: 'PKP station' },
  przychodnia: { ru: 'Поликлиника', uk: 'Поліклініка', en: 'Clinic' },
  'recepcja-narty': { ru: 'Отель в горах', uk: 'Готель у горах', en: 'Mountain hotel' },
  'stop-cafe': { ru: 'Кафе на заправке', uk: 'Кафе на заправці', en: 'Petrol station café' },
  tramwaj: { ru: 'Трамвайная остановка', uk: 'Трамвайна зупинка', en: 'Tram stop' },
  urzad: { ru: 'Ужонд (окошко)', uk: 'Уженд (віконце)', en: 'Public office' },
  'warszawa-starowka': { ru: 'Старый город, Варшава', uk: 'Старе місто, Варшава', en: 'Warsaw Old Town' },
  zapiekanki: { ru: 'Запеканки на улице', uk: 'Запеканки на вулиці', en: 'Zapiekanka stand' },
};

export const isQuizScene = (value: unknown): value is QuizScene => typeof value === 'string' && (QUIZ_SCENES as readonly string[]).includes(value);

/** Путь картинки относительно /bot/ (для botImageUrl). */
export const quizSceneFile = (scene: QuizScene) => `quiz/${scene}.jpg`;
