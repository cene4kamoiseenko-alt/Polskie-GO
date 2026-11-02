/**
 * «Бобек дома» — четыре фото владельца (2026-11-02, docs/design/v19/home; сборка — scripts/build-home-art.mjs) вместо векторной сцены MIESZKANIE там, где она стояла фоном:
 * упражнения без своей локации (экзамены, входной тест, тренировки) и маршруты «квартира», вступление к уроку, миниатюры маршрутов «квартира», шапка экрана «Egzaminy».
 * Бобёр нарисован в самих кадрах — поверх второго не рисуем. Отдельный файл: грузится только с этими экранами, не со стартовой загрузкой.
 */
import { artImage } from './assets';

export type HomeShot = 'cook' | 'relax' | 'study' | 'keys';

/** Какая часть кадра 3 : 2 остаётся в окне ~2 : 1 (по вертикали — чтобы морда Бобра была видна). */
const FOCUS: Record<HomeShot, string> = { cook: '50% 28%', relax: '50% 34%', study: '50% 30%', keys: '50% 52%' };

/** Кадр по механике задания: аудирование — в наушниках, разговор — в прихожей с ключами, слова — на кухне, письмо и грамматика — за тетрадью. */
const BY_TYPE: Record<string, HomeShot> = {
  LISTENING: 'relax',
  DICTATION: 'relax',
  PRONUNCIATION: 'keys',
  DIALOGUE: 'keys',
  SITUATION: 'keys',
  WORD_TRANSLATION: 'cook',
  PICTURE_WORD: 'cook',
  ODD_ONE_OUT: 'cook',
  MATCH_PAIRS: 'cook',
};

export function homeShot(kind: HomeShot): { src: string; srcSet: string | undefined; pos: string; kind: HomeShot } | null {
  const a = artImage('home', { file: `home-${kind}`, width: 1200 });
  return a ? { ...a, pos: FOCUS[kind], kind } : null;
}

export const homeShotFor = (type: string) => homeShot(BY_TYPE[type] ?? 'study');

let warmed = false;
/** Подгрузить остальные кадры заранее (после первого задания), чтобы смена кадра между заданиями не мигала пустым фоном. */
export function warmHomeShots(sizes: string) {
  if (warmed || typeof Image === 'undefined') return;
  warmed = true;
  for (const k of ['cook', 'relax', 'study', 'keys'] as HomeShot[]) {
    const a = homeShot(k);
    if (!a) continue;
    const im = new Image();
    if (a.srcSet) im.srcset = a.srcSet;
    im.sizes = sizes;
    im.src = a.src;
  }
}
