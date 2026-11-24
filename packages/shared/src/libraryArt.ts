/**
 * Библиотека картинок Бобека (картинки канала владельца, `apps/web/public/channel/<файл>.jpg`; для приложения — WebP в
 * `apps/web/src/assets/library`, scripts/build-library-art.ts) и правила, какая картинка стоит над шагами миссии и урока
 * (docs/superpowers/specs/2026-11-24-living-missions-design.md, «Какие картинки где»).
 *
 * Одна картинка — на всю миссию или весь урок. Бобек нарисован в каждом кадре: второго поверх не рисуют.
 * «Экзаменационные» egzamin-* не используются (Бобек на них волнуется); rozmowa-1/2 — собеседование, только тема «работа».
 * Новая картинка владельца попадает в оборот одной строкой здесь: имя файла и темы.
 */

export type LibraryTheme = 'shop' | 'work' | 'transport' | 'home' | 'food' | 'talk' | 'listen' | 'speak' | 'study' | 'celebrate' | 'general';

const FOCUS = '50% 35%';
const art = (themes: LibraryTheme[], focus = FOCUS) => ({ themes, focus });

/** Имя файла (без `.jpg`) → темы и точка фокуса кадра (object-position). Порядок важен: первые в теме — самые подходящие. */
export const LIBRARY_ART: Record<string, { themes: LibraryTheme[]; focus: string }> = {
  sklep: art(['shop']),
  targ: art(['shop', 'food']),
  'apteka-1': art(['shop']),
  paczka: art(['shop']),
  'apteka-2': art(['shop']),
  finanse: art(['shop', 'general']),
  bank: art(['shop']),
  'praca-biuro-3': art(['work']),
  'praca-biuro-1': art(['work']),
  'rozmowa-1': art(['work']),
  'budowa-1': art(['work']),
  'urzad-1': art(['work']),
  'praca-biuro-2': art(['work']),
  'rozmowa-2': art(['work']),
  'budowa-2': art(['work']),
  'urzad-2': art(['work']),
  'tramwaj-1': art(['transport']),
  'dworzec-1': art(['transport']),
  'tramwaj-2': art(['transport']),
  'dworzec-2': art(['transport']),
  lotnisko: art(['transport', 'general']),
  mieszkanie: art(['home']),
  kuchnia: art(['home', 'food']),
  pralnia: art(['home']),
  sasiad: art(['home', 'talk']),
  pierogi: art(['food']),
  kawiarnia: art(['food', 'talk', 'celebrate']),
  restauracja: art(['food'], '50% 30%'),
  lekcja: art(['talk', 'study']),
  sluchanie: art(['listen']),
  nauka: art(['listen', 'study']),
  'wymowa-1': art(['speak']),
  'wymowa-2': art(['speak']),
  'wymowa-3': art(['speak']),
  'zasada-1': art(['study']),
  'uniwersytet-1': art(['study', 'general']),
  'zasada-2': art(['study']),
  'uniwersytet-2': art(['study', 'general']),
  'zasada-3': art(['study']),
  biblioteka: art(['study', 'general']),
  'brawo-1': art(['celebrate']),
  'brawo-2': art(['celebrate']),
  muzeum: art(['general']),
  'straz-pozarna': art(['general'], '30% 40%'),
  akwarium: art(['general'], '45% 30%'),
  kino: art(['general']),
};

/** Иконка маршрута города (`city_routes.icon`) → тема. Иконок «прогулка по городу», «экзамен» нет: там панорама города. */
export const ROUTE_ICON_THEME: Record<string, LibraryTheme> = {
  shopping: 'shop',
  basket: 'shop',
  'receipt-check': 'shop',
  office: 'work',
  transport: 'transport',
  'train-ticket': 'transport',
  tram: 'transport',
  house: 'home',
  cafe: 'food',
  food: 'food',
  dishes: 'food',
  dialog: 'talk',
  speech: 'talk',
  headphones: 'listen',
  pronunciation: 'speak',
  writing: 'study',
  'book-clock': 'study',
  lessons: 'study',
  gift: 'celebrate',
};

/** Категория миссии → тема (запасная картинка, если у миссии нет своей сцены и обложки сезона). */
export const MISSION_CATEGORY_THEME: Record<string, LibraryTheme> = {
  shop: 'shop',
  food: 'food',
  road: 'transport',
  transport: 'transport',
  home: 'home',
  work: 'work',
};

/** Картинки темы в порядке реестра. */
export function libraryPool(theme: LibraryTheme): string[] {
  return Object.keys(LIBRARY_ART).filter((file) => LIBRARY_ART[file].themes.includes(theme));
}

/** FNV-1a (32 бит): стабильный номер строки — одинаковый в приложении, на сервере и в тестах. */
function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/**
 * Картинка урока города по теме маршрута; `null` — панорама города (прогулка, экзамен, тема без картинок).
 * `lessonIndex` — номер урока в маршруте (1…): соседние уроки получают соседние картинки темы, то есть разные.
 */
export function lessonLibraryArt(routeIcon: string | null | undefined, routeSlug: string, lessonIndex: number): string | null {
  const theme = routeIcon ? ROUTE_ICON_THEME[routeIcon] : undefined;
  const pool = theme ? libraryPool(theme) : [];
  if (!pool.length) return null;
  return pool[(fnv1a(routeSlug) + Math.max(0, Math.trunc(lessonIndex))) % pool.length];
}

/** Запасная картинка миссии: тема категории или общий набор «жизнь в Польше». */
export function missionLibraryArt(category: string, slug: string): string {
  const pool = libraryPool(MISSION_CATEGORY_THEME[category] ?? 'general');
  return pool[fnv1a(slug) % pool.length];
}
