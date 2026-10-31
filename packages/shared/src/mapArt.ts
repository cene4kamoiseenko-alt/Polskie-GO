/**
 * Иллюстрированная карта Польши (пакет владельца POLSKI_GO_MAP_ASSETS, 2026-10-31).
 *
 * Картинка `map_full` 941×1068 px — живописная 2.5D-карта. В неё уже впечены подписи городов, звёзды и Бобек у Кракова,
 * поэтому поверх картинки рисуются только прозрачные кнопки-зоны (hitbox) и маленькие значки состояния, а не вторые подписи.
 * Координаты — пиксели этой картинки, не GPS. Прогресс, доступ и уроки приходят только с сервера (journey), из картинки не берутся.
 *
 * Рамки подписей (`pill`) измерены по самой картинке (кремовые таблички); `pack` — точка из `data/cities.json` пакета, по ней
 * тест проверяет, что зона города совпадает с разметкой художника. Когда появится чистый фон без подписей (`baked: false`),
 * те же рамки станут местами настоящих динамических маркеров.
 */

export type MapRect = readonly [x0: number, y0: number, x1: number, y1: number];

export type MapSpot = {
  /** Подпись на картинке (польское название). */
  label: string;
  /** Город приложения (slug из CITIES). null — точка есть на картинке, но этапа маршрута нет. */
  city: string | null;
  /** Кремовая табличка с названием. */
  pill: MapRect;
  /** big — золотой круг со звездой слева от таблички; small — синяя звёздочка над табличкой. */
  kind: 'big' | 'small';
  /** Подпись нарисована в картинке. false — маркер рисует приложение (города, которых нет на картинке). */
  baked: boolean;
  /** id точки в data/cities.json пакета и её координаты. */
  pack?: { id: string; x: number; y: number };
  /** Почему у точки нет этапа (city: null). */
  note?: 'not_in_route';
};

export const MAP_ART = {
  id: 'poland-2026-10',
  width: 941,
  height: 1068,
  /** Подписи, звёзды и Бобек впечены в картинку (MVP). Чистый фон без них — следующий шаг, см. docs/MAP_V17.md. */
  baked: true,
  /** Впечённый Бобек у Кракова: зона, где второго Бобека не рисуем. */
  bakedBobek: [585, 760, 745, 935] as MapRect,
  /** Исходники пакета (в приложение не попадают). */
  source: 'docs/design/map-v17/map_full.png',
} as const;

const S = (label: string, city: string | null, pill: MapRect, kind: MapSpot['kind'], pack?: MapSpot['pack']): MapSpot => ({ label, city, pill, kind, baked: true, pack });

/** Все точки карты по порядку сверху вниз. Ключ — slug города приложения (или id точки пакета, если этапа нет). */
export const MAP_SPOTS: Record<string, MapSpot> = {
  gdynia: S('Gdynia', 'gdynia', [261, 120, 340, 149], 'small', { id: 'gdynia', x: 300, y: 126 }),
  sopot: { ...S('Sopot', null, [372, 145, 443, 175], 'small', { id: 'sopot', x: 408, y: 158 }), note: 'not_in_route' },
  gdansk: S('Gdańsk', 'gdansk', [523, 131, 623, 163], 'big', { id: 'gdansk', x: 547, y: 144 }),
  szczecin: S('Szczecin', 'szczecin', [107, 278, 196, 308], 'small', { id: 'szczecin', x: 147, y: 285 }),
  bydgoszcz: S('Bydgoszcz', 'bydgoszcz', [308, 267, 414, 297], 'small', { id: 'bydgoszcz', x: 360, y: 277 }),
  olsztyn: S('Olsztyn', 'olsztyn', [591, 267, 676, 297], 'small', { id: 'olsztyn', x: 618, y: 275 }),
  bialystok: S('Białystok', 'bialystok', [772, 351, 865, 381], 'small', { id: 'bialystok', x: 804, y: 360 }),
  gorzow: S('Gorzów Wielkopolski', 'gorzow', [64, 405, 172, 452], 'small', { id: 'gorzow_wielkopolski', x: 118, y: 417 }),
  poznan: S('Poznań', 'poznan', [311, 428, 409, 461], 'big', { id: 'poznan', x: 328, y: 433 }),
  torun: S('Toruń', 'torun', [457, 411, 533, 441], 'small', { id: 'torun', x: 489, y: 424 }),
  warszawa: S('Warszawa', 'warszawa', [660, 462, 785, 495], 'big', { id: 'warszawa', x: 691, y: 466 }),
  'zielona-gora': S('Zielona Góra', 'zielona-gora', [93, 555, 215, 585], 'small', { id: 'zielona_gora', x: 151, y: 560 }),
  lodz: S('Łódź', 'lodz', [478, 569, 550, 600], 'small', { id: 'lodz', x: 505, y: 577 }),
  lublin: S('Lublin', 'lublin', [807, 614, 885, 645], 'small', { id: 'lublin', x: 832, y: 620 }),
  wroclaw: S('Wrocław', 'wroclaw', [293, 656, 398, 689], 'big', { id: 'wroclaw', x: 329, y: 663 }),
  kielce: S('Kielce', 'kielce', [616, 704, 692, 735], 'small', { id: 'kielce', x: 654, y: 708 }),
  katowice: S('Katowice', 'katowice', [444, 774, 548, 805], 'small', { id: 'katowice', x: 484, y: 779 }),
  opole: S('Opole', 'opole', [292, 803, 368, 834], 'small', { id: 'opole', x: 330, y: 811 }),
  rzeszow: S('Rzeszów', 'rzeszow', [768, 827, 871, 858], 'small', { id: 'rzeszow', x: 818, y: 824 }),
  krakow: S('Kraków', 'krakow', [560, 956, 686, 995], 'big', { id: 'krakow', x: 591, y: 958 }),
  // Закопане — финал маршрута, на картинке его нет: маркер рисует приложение в горах к юго-западу от Кракова (справа — уже граница).
  zakopane: { label: 'Zakopane', city: 'zakopane', pill: [404, 996, 498, 1026], kind: 'small', baked: false },
};

/** Соответствие id точек пакета (data/cities.json) и slug городов приложения там, где они расходятся. */
export const MAP_PACK_ALIASES: Record<string, string> = { gorzow_wielkopolski: 'gorzow', zielona_gora: 'zielona-gora' };

/** Зона нажатия в пикселях картинки: табличка + звезда + поля (на стартовом масштабе 360 px — не меньше 44 px). */
export function mapHitRect(spot: MapSpot): MapRect {
  const [x0, y0, x1, y1] = spot.pill;
  return spot.kind === 'big' ? [x0 - 54, y0 - 20, x1 + 8, y1 + 18] : [x0 - 8, y0 - 36, x1 + 8, y1 + 10];
}

/** Центр звезды города: сюда ставятся кольцо «ты здесь» и маршрут путешествия. */
export function mapStarPoint(spot: MapSpot): [number, number] {
  const [x0, y0, x1, y1] = spot.pill;
  return spot.kind === 'big' ? [x0 - 24, (y0 + y1) / 2] : [(x0 + x1) / 2 - 6, y0 - 15];
}

/** Точка карты для города приложения (по slug). */
export function mapSpotForCity(slug: string): MapSpot | undefined {
  return Object.values(MAP_SPOTS).find((s) => s.city === slug);
}
