/**
 * Інвентар фонів міст (apps/web/src/assets/cities/<slug>.webp і <slug>@640.webp).
 * Повна таблиця з джерелами, правами й місцями використання — docs/CITY_ART_INVENTORY.md;
 * тест apps/server/test/city-art.test.ts звіряє цей список з містами seed і з файлами на диску.
 *
 *   final   — фінальна ілюстрація;
 *   interim — тимчасовий кадр із дошки власника (фрагмент без Бобека й підпису, Real-ESRGAN ×4); замінить майстер-файл;
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
  lodz: board(984, 512, 'Manufaktura: цегляний фасад з вивіскою, пам’ятник', 'Piotrkowska'),
  krakow: { status: 'final', width: 1440, height: 720, shows: 'Rynek, Sukiennice, Mariacki' },
  katowice: board(1176, 488, 'Spodek на тлі хмарочосів'),
  opole: board(1024, 520, 'Ратуша, кам’яниці, міст над Одрою'),
  wroclaw: { status: 'final', width: 1440, height: 720, shows: 'Острів Тумський: собор, Тумський міст, гномик', gap: 'Rynek' },
  poznan: board(1200, 456, 'Ратуша і кам’яниці Старого Ринку', 'козлики на вежі ратуші не видно'),
  'zielona-gora': board(1472, 660, 'Ратуша з вежею, площа, виноградна лоза'),
  gorzow: { status: 'missing', shows: '—', gap: 'Варта і центр міста: на дошках власника цього міста немає' },
  szczecin: board(776, 504, 'Wały Chrobrego над Одрою, кораблі'),
  gdansk: board(896, 576, 'Żuraw над Мотлавою, цегляна брама'),
  gdynia: { status: 'missing', shows: '—', gap: 'Порт: на дошках власника цього міста немає' },
  bydgoszcz: board(1620, 668, 'Фахверкові зерносховища над Брдою, теплохід'),
  torun: board(1448, 668, 'Готичне Старе місто над Віслою, ратуша'),
  olsztyn: board(1480, 660, 'Замок вармійської капітули, озеро з вітрилами'),
  bialystok: board(1440, 668, 'Архикафедральний собор і біла вежа', 'палацу Браницьких на кадрі немає'),
  lublin: board(1000, 448, 'Люблінський замок (неоготичний фасад з брамою)'),
  rzeszow: board(1460, 668, 'Rynek з ратушею і парасольками кав’ярень'),
  kielce: board(1560, 660, 'Палац краківських єпископів'),
  zakopane: board(1640, 688, 'Татри, дерев’яні будинки в снігу'),
};
