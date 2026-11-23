/**
 * Трудные версии уроков (2026-11-16, docs/LEVELS_RU.md): по городам, по slug урока. Игрок с уровнем заданий выше уровня урока
 * проходит тот же урок (место, сюжет, герои), но с теорией и заданиями своего уровня.
 *
 * Версии лежат отдельно от уроков, чтобы сокращение города по стандарту (city-standard.ts) и правки уроков их не задевали.
 */
import type { CityContent, LessonLevels } from '../types';
import { WARSZAWA_LEVELS } from './warszawa';
import { LODZ_LEVELS } from './lodz';
import { KRAKOW_LEVELS } from './krakow';
import { KATOWICE_LEVELS } from './katowice';
import { OPOLE_LEVELS } from './opole';
import { WROCLAW_LEVELS } from './wroclaw';
import { POZNAN_LEVELS } from './poznan';
import { ZIELONA_GORA_LEVELS } from './zielona-gora';

export const LESSON_LEVELS: Record<string, LessonLevels> = { ...WARSZAWA_LEVELS, ...LODZ_LEVELS, ...KRAKOW_LEVELS, ...KATOWICE_LEVELS, ...OPOLE_LEVELS, ...WROCLAW_LEVELS, ...POZNAN_LEVELS, ...ZIELONA_GORA_LEVELS };

/** Города с версиями уроков: версия из урока важнее версии из реестра; slug реестра без урока — ошибка (опечатка не пропадёт молча). */
export function withLevels(cities: CityContent[], registry: Record<string, LessonLevels> = LESSON_LEVELS): CityContent[] {
  const known = new Set(cities.flatMap((c) => c.routes.flatMap((r) => r.lessons.map((l) => l.slug))));
  for (const slug of Object.keys(registry)) if (!known.has(slug)) throw new Error(`content/levels: урок ${slug} отсутствует`);
  // Город без версий в реестре остаётся тем же объектом; город с версиями попадает в CITY_CONTENT копией — искать его по slug, не по ссылке.
  return cities.map((c) => {
    const touched = c.routes.some((r) => r.lessons.some((l) => registry[l.slug] && !l.levels));
    if (!touched) return c;
    return {
      ...c,
      routes: c.routes.map((r) => ({
        ...r,
        lessons: r.lessons.map((l) => (registry[l.slug] && !l.levels ? { ...l, levels: registry[l.slug] } : l)),
      })),
    };
  });
}
