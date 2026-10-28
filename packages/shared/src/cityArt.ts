/**
 * Інвентар фонів міст (apps/web/src/assets/cities/<slug>.webp і <slug>@640.webp).
 * Повна таблиця з джерелами, правами й місцями використання — docs/CITY_ART_INVENTORY.md;
 * тест apps/server/test/city-art.test.ts звіряє цей список з містами seed і з файлами на диску.
 *
 *   final   — фінальна ілюстрація (повнорозмірна панорама власника 2:1 або 3:2 з кадром 2:1, зменшена без розтягування);
 *   interim — тимчасовий кадр із дошки власника (фрагмент без Бобека й підпису, Real-ESRGAN ×4); у застосунку НЕ показується
 *             (мутний; рішення власника 2026-10-27): клієнт малює ілюстрацію з позначкою «скоро», поки немає майстер-файлу;
 *   missing — файлу немає: клієнт малює загальну сцену і пише «Малюнок готується», а не видає її за готовий.
 */
export type CityArtStatus = 'final' | 'interim' | 'missing';

export interface CityArt {
  status: CityArtStatus;
  /** Розмір основного файлу; у missing немає. */
  width?: number;
  height?: number;
  /** Що зображено. */
  shows: string;
  /** Чого бракує до орієнтира з завдання (V9 §6), якщо кадр його не показує. */
  gap?: string;
}

/** Ширина зменшеного варіанта `<slug>@640.webp` для мініатюр і вузьких екранів. */
export const CITY_ART_SMALL = 640;

const board = (width: number, height: number, shows: string, gap?: string): CityArt => ({ status: 'interim', width, height, shows, gap });

export const CITY_ART: Record<string, CityArt> = {
  warszawa: { status: 'final', width: 1440, height: 720, shows: 'Старе місто, Замкова площа, колона Сигізмунда' },
  lodz: { status: 'final', width: 1440, height: 720, shows: 'Piotrkowska: фасади модерну, цегляна фабрична труба' },
  krakow: { status: 'final', width: 1440, height: 720, shows: 'Rynek, Sukiennice, Mariacki' },
  katowice: { status: 'final', width: 1440, height: 720, shows: 'Spodek, шахтний копер і скляні куби Музею Сілезії, цегляний NOSPR, хмарочоси' },
  opole: { status: 'final', width: 1440, height: 720, shows: 'Вежа Пястів, набережна Одри, амфітеатр' },
  wroclaw: { status: 'final', width: 1440, height: 720, shows: 'Rynek: ратуша, кам’яниці, бронзові гноми' },
  poznan: { status: 'final', width: 1440, height: 720, shows: 'Ратуша з козлами на вежі, барвисті кам’яниці Старого Ринку' },
  'zielona-gora': board(1472, 660, 'Ратуша з вежею, площа, виноградна лоза'),
  gorzow: { status: 'final', width: 1440, height: 720, shows: 'Катедра на Варті, набережна, залізничний віадук' },
  szczecin: { status: 'final', width: 1440, height: 720, shows: 'Wały Chrobrego над Одрою: Національний музей, павільйони, Воєводське управління, Філармонія, вітрильник' },
  gdansk: { status: 'final', width: 1440, height: 720, shows: 'Żuraw, фасади Długie Pobrzeże, вітрильник на Мотлаві' },
  gdynia: { status: 'final', width: 1440, height: 720, shows: '«Дар Поморя», Sea Towers, есмінець у порту' },
  bydgoszcz: board(1620, 668, 'Фахверкові зерносховища над Брдою, теплохід'),
  torun: board(1448, 668, 'Готичне Старе місто над Віслою, ратуша'),
  olsztyn: { status: 'final', width: 1440, height: 720, shows: 'Замок вармійської капітули над Линою, Висока брама, міст і старе місто' },
  bialystok: { status: 'final', width: 1440, height: 720, shows: 'Палац Браницьких: барокове крило з вежею, французький сад, фонтани' },
  lublin: { status: 'final', width: 1440, height: 720, shows: 'Краківська брама, площа Старого міста з кав’ярнями, вежі костелів' },
  rzeszow: board(1460, 668, 'Rynek з ратушею і парасольками кав’ярень'),
  kielce: board(1560, 660, 'Палац краківських єпископів'),
  zakopane: board(1640, 688, 'Татри, дерев’яні будинки в снігу'),
};
