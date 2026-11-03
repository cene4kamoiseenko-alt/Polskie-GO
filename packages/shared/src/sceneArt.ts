/**
 * Інвентар растрових сцен місій (apps/web/src/assets/scenes/<file>.webp і <file>@640.webp).
 * Повна таблиця — docs/SCENE_ART_INVENTORY.md; тест apps/server/test/scene-art.test.ts звіряє її з цим списком,
 * з місіями й файлами на диску.
 *
 * Усі сцени — ТИМЧАСОВІ (interim), бо Бобек намальований у самому кадрі (у старому образі — червоне худі «PL»):
 *   - п’ять магазинів (2026-10-26) вирізані з одного згенерованого колажу (рідний розмір ~550–640 px по ширині,
 *     у застосунку збільшені);
 *   - вісім сцен місій (пакет власника 2026-10-28) — окремі кадри 1536–1672 px, у застосунку лише зменшені;
 *     оригінали — docs/design/a12/missions/.
 * Тому:
 *   - клієнт не малює поверх них другого Бобека (bakedBobek → без накладеного <Beaver>);
 *   - статус 'final' заборонений, доки bakedBobek === true (тест); фінальні версії — без Бобека, під окремий рендерер образу;
 *   - написи на кадрі — декор: ні задання, ні ціни, ні довідкові дані з них не береться.
 */
export type SceneArtStatus = 'interim' | 'final';

/**
 * Що потрібно застосунку, щоб показати кадр. Довідкові поля (оригінал і вирізка, рідний розмір, що зображено, вади, кадр для бота) —
 * у `sceneArtNotes.ts` (SCENE_ART_NOTES / SCENE_ART_FULL): клієнтові вони не потрібні й не потрапляють у стартову загрузку (бюджет JS, scripts/perf.ts).
 */
export interface SceneArt {
  /** Стабільний scene_id. Не перейменовується: на нього посилаються тести, документ і майбутні фінальні майстри. */
  id: string;
  /** Ім’я файлів у assets/scenes: `<file>.webp` (основний) і `<file>@640.webp`. */
  file: string;
  brand: string;
  status: SceneArtStatus;
  /** Розмір основного файлу. */
  width: number;
  height: number;
  /** Бобек намальований у самому кадрі: поверх нього другого Бобека не показуємо. */
  bakedBobek: boolean;
  /** SVG-сцена місії, яку ця картинка замінює (місія з таким `scene` у MISSIONS); без картинки клієнт малює її. */
  fallbackScene: string;
  /** Місії, де сцена доречна за змістом. Ключ — slug місії, а не назва SVG-сцени: Lidl теж у `supermarket`, але це не Biedronka. */
  missions: string[];
  /** object-position для вузьких карток (360–390 px): кадр 2:1 обрізається по висоті, Бобек і вивіска лишаються в кадрі. */
  focus: string;
}

/** Ширина зменшеного варіанта `<file>@640.webp` для карток і вузьких екранів. */
export const SCENE_ART_SMALL = 640;

const common = { status: 'interim', width: 1440, height: 720, bakedBobek: true } as const;

export const SCENE_ART: Record<string, SceneArt> = {
  'store-zabka': {
    ...common, id: 'store-zabka', file: 'zabka', brand: 'Żabka', fallbackScene: 'shop-corner',
    missions: ['zabka-first-order'], focus: '55% 12%',
  },
  'store-biedronka': {
    ...common, id: 'store-biedronka', file: 'biedronka', brand: 'Biedronka', fallbackScene: 'supermarket',
    missions: ['biedronka-breakfast'], focus: '15% 10%',
  },
  'store-rossmann': {
    ...common, id: 'store-rossmann', file: 'rossmann', brand: 'Rossmann', fallbackScene: 'drugstore',
    missions: ['rossmann-basics'], focus: '30% 10%',
  },
  'parcel-inpost': {
    ...common, id: 'parcel-inpost', file: 'inpost', brand: 'InPost', fallbackScene: 'parcel-locker',
    missions: ['paczkomat'], focus: '20% 20%',
  },
  'fuel-orlen': {
    ...common, id: 'fuel-orlen', file: 'orlen', brand: 'ORLEN', fallbackScene: 'petrol-station',
    // orlen-coffee (кава в Stop Cafe) знято 2026-10-27: на кадрі Бобек із пістолетом біля колонки — інша дія; місія показує SVG-сцену.
    missions: ['orlen-pump'], focus: '35% 10%',
  },

  // ── Пакет власника 2026-10-28: окремі кадри місій (1536×768 і більше), у застосунку лише зменшені. ──
  'clinic-registration': {
    ...common, id: 'clinic-registration', file: 'przychodnia', brand: 'Przychodnia', fallbackScene: 'clinic',
    missions: ['doctor-appointment'], focus: '50% 30%',
  },
  'office-first-day': {
    ...common, id: 'office-first-day', file: 'biuro', brand: 'Biuro', fallbackScene: 'work',
    missions: ['first-workday'], focus: '45% 30%',
  },
  'street-zapiekanki': {
    ...common, id: 'street-zapiekanki', file: 'zapiekanki', brand: 'Zapiekanki', fallbackScene: 'street-food',
    missions: ['kazimierz-zapiekanka'], focus: '45% 40%',
  },
  'flat-keys': {
    ...common, id: 'flat-keys', file: 'mieszkanie', brand: 'Mieszkanie', fallbackScene: 'flat',
    missions: ['landlord'], focus: '45% 30%',
  },
  'bakery-pierniki': {
    ...common, id: 'bakery-pierniki', file: 'pierniki', brand: 'Pierniki', fallbackScene: 'bakery',
    missions: ['torun-bakery'], focus: '50% 35%',
  },
  'milk-bar': {
    ...common, id: 'milk-bar', file: 'bar-mleczny', brand: 'Bar mleczny', fallbackScene: 'milk-bar',
    missions: ['bar-mleczny'], focus: '50% 35%',
  },
  'station-pkp': {
    ...common, id: 'station-pkp', file: 'pkp', brand: 'PKP', fallbackScene: 'train-station',
    missions: ['train-wroclaw'], focus: '50% 30%',
  },
  'store-lidl': {
    ...common, id: 'store-lidl', file: 'lidl', brand: 'Lidl', fallbackScene: 'supermarket',
    missions: ['lidl-list'], focus: '30% 40%',
  },
  'tram-stop': {
    ...common, id: 'tram-stop', file: 'tramwaj', brand: 'Tramwaj', fallbackScene: 'tram-stop',
    missions: ['first-tram'], focus: '50% 30%',
  },
  // ── Пакет власника 2026-10-31: чотири кадри 1536×1024 для місій, які досі мали SVG-сцену. ──
  'stop-cafe': {
    ...common, id: 'stop-cafe', file: 'stop-cafe', brand: 'ORLEN Stop Cafe', fallbackScene: 'petrol-station',
    missions: ['orlen-coffee'], focus: '45% 35%',
  },
  'urzad-okienko': {
    ...common, id: 'urzad-okienko', file: 'urzad', brand: 'Urząd', fallbackScene: 'office',
    missions: ['urzad-pesel'], focus: '45% 35%',
  },
  'cukiernia-rogale': {
    ...common, id: 'cukiernia-rogale', file: 'cukiernia', brand: 'Cukiernia', fallbackScene: 'pastry-shop',
    missions: ['marcin-rogal'], focus: '45% 35%',
  },
  pierogarnia: {
    ...common, id: 'pierogarnia', file: 'pierogarnia', brand: 'Pierogarnia', fallbackScene: 'cafe-pierogi',
    missions: ['krakow-pierogi'], focus: '50% 35%',
  },
  // ── Premium-подорожі (content/missions-premium.ts), кадри власника 2026-10-31. ──
  'lotnisko-lot': {
    ...common, id: 'lotnisko-lot', file: 'lotnisko-lot', brand: 'LOT', fallbackScene: 'train-station',
    missions: ['lotnisko-lot'], focus: '40% 35%',
  },
  'recepcja-narty': {
    ...common, id: 'recepcja-narty', file: 'recepcja-narty', brand: 'Zakopane', fallbackScene: 'hotel',
    missions: ['zakopane-ferie'], focus: '45% 35%',
  },
  'warszawa-starowka': {
    ...common, id: 'warszawa-starowka', file: 'warszawa-starowka', brand: 'Warszawa', fallbackScene: 'castle',
    missions: ['warszawa-dzien'], focus: '45% 35%',
  },
};

/** slug місії → scene_id картинки. Місій без запису це не стосується: вони й далі показують SVG-сцену. */
export const MISSION_SCENE_ART: Record<string, string> = Object.fromEntries(
  Object.values(SCENE_ART).flatMap((a) => a.missions.map((m) => [m, a.id] as const)),
);


/**
 * Що має показувати фон кожної місії (14 активних, 3 сцени Premium, 9 місій пропуску місяця): дія гравця і фон БЕЗ Бобека.
 * Шари екрана місії: фон (цей опис; поки нема — тимчасовий кадр SCENE_ART або SVG-сцена) + Бобек із вибраним образом
 * (<Beaver>, накладається праворуч унизу, ~30 % ширини) + інтерфейс (кнопка «закрити» зліва вгорі, текст під кадром).
 * Тому на фоні: правий нижній кут вільний, жодного персонажа-бобра, жодного тексту, крім справжніх вивісок закладу.
 * Тест apps/server/test/scene-art.test.ts звіряє ключі з MISSIONS і MISSIONS_SOON; docs/UNFINISHED_ASSETS.md будується звідси.
 */
export const MISSION_BACKGROUND_BRIEF: Record<string, { action: string; background: string }> = {
  'zabka-first-order': { action: 'заказывает хот-дог и воду у кассы', background: 'Интерьер Żabki: касса с гриль-витриной хот-догов, холодильник с водой, кассирша за прилавком; вечерний свет с улицы.' },
  'krakow-pierogi': { action: 'заказывает pierogi в pierogarni', background: 'Маленькая pierogarnia у Рынка в Кракове: прилавок с тарелками pierogów, меню-доска без читаемых цен, повар в окне выдачи.' },
  'biedronka-breakfast': { action: 'ищет parówki и сравнивает цены за килограмм', background: 'Зал Biedronki: холодильная полка с parówkami и сыром, ценники без цифр, тележка на переднем плане слева.' },
  'orlen-coffee': { action: 'покупает кофе с собой в Stop Cafe', background: 'Стойка Stop Cafe внутри станции ORLEN: кофемашина, стаканчики навынос, кассир; за окном колонки и дорога на Гданьск.' },
  'orlen-pump': { action: 'заправил машину на колонке № 3 и идёт платить', background: 'Колонки ORLEN, на одной заметен номер 3, машина с открытым лючком; вход в кассу на заднем плане.' },
  paczkomat: { action: 'забирает посылку из ячейки по коду', background: 'Paczkomat InPost целиком в кадре: экран с полем кода, одна открытая ячейка с коробкой; без обрезанных надписей.' },
  'first-tram': { action: 'покупает билет в автомате на трамвайной остановке во Вроцлаве', background: 'Остановка во Вроцлаве: билетный автомат, табло прибытия без читаемого времени, подъезжает сине-белый трамвай.' },
  'train-wroclaw': { action: 'покупает билет до Вроцлава в кассе вокзала', background: 'Касса Warszawa Centralna: окошко с кассиршей, табло отправлений без читаемых часов, перрон за стеклом.' },
  'bar-mleczny': { action: 'заказывает обед в молочном баре', background: 'Bar mleczny: окно выдачи, подносы, тарелки с супом и pierogami, меню-доска без цен; простые столы.' },
  'torun-bakery': { action: 'покупает пряники и булочки в пекарне Торуня', background: 'Пекарня-кондитерская в Торуне: витрина с piernikami и булками, продавщица за прилавком, кирпичная готика за окном.' },
  'kazimierz-zapiekanka': { action: 'заказывает zapiekankę на Plac Nowy', background: 'Окошко с zapiekankami на Plac Nowy в Кракове вечером: круглый павильон, гирлянды, очередь без лиц крупным планом.' },
  'lidl-list': { action: 'покупает продукты по списку и платит на кассе самообслуживания', background: 'Lidl: касса самообслуживания с экраном и сканером, корзина с продуктами из списка; полки на заднем плане.' },
  'rossmann-basics': { action: 'покупает средства гигиены после переезда', background: 'Зал Rossmann: полки с гелями, зубной пастой, шампунями; вывески отделов написаны правильно или без текста.' },
  'urzad-pesel': { action: 'подаёт документы на PESEL сотруднице в окошке', background: 'Urząd: окошко обслуживания с сотрудницей, талон очереди в автомате, бланк заявления на стойке; не городская площадь и не фасад.' },
  landlord: { action: 'разговаривает с хозяйкой о квартире', background: 'Гостиная съёмной квартиры: ключи на столе, счётчики в коридоре, хозяйка с папками у двери.' },
  'first-workday': { action: 'первый день на работе', background: 'Офис или склад: стойка ресепшена, бейдж и шкафчик для вещей, коллега показывает дорогу.' },
  'doctor-appointment': { action: 'записывается к врачу в регистратуре', background: 'Регистратура поликлиники: окошко, календарь записи без читаемых дат, скамейка ожидания; не аптека.' },
  // ── Пропуск месяца (apps/server/src/content/seasons.ts, ADR-011) ──
  'marcin-rogal': { action: 'покупает rogale świętomarcińskie на вынос', background: 'Кондитерская в Познани 11 ноября: витрина с большими рогалями в глазури и орехах, продавщица за прилавком, бело-красные флажки, осенний вечер за окном.' },
  'listopad-swieto': { action: 'говорит с соседом о Дне независимости', background: 'Двор старого дома в Познани: соседний балкон с бело-красным флагом, ноябрьские деревья, на заднем плане улица Święty Marcin с флагами.' },
  'andrzejki-wosk': { action: 'льёт воск через ключ на андрейках', background: 'Уютная комната вечером: миска с холодной водой, большой ключ, свеча, тень фигурки из воска на стене, подруга за столом.' },
  'jarmark-oscypek': { action: 'покупает oscypek с клюквой на рождественской ярмарке', background: 'Деревянный домик ярмарки на Rynku Głównym в Кракове: гриль с oscypkami, баночки клюквы, гирлянды, Мариацкий костёл в снегу за ним.' },
  'wigilia-kolacja': { action: 'делится облаткой за столом Wigilii', background: 'Праздничный стол в польском доме: белая скатерть, облатка на тарелке, barszcz с uszkami, карп, одно свободное место с прибором, ёлка и первая звезда в окне.' },
  'sylwester-impreza': { action: 'встречает Новый год с друзьями', background: 'Квартира с видом на ночной город: фейерверки за окном, часы около полуночи без читаемых цифр, серпантин, бокалы с соком на столе.' },
  'park-bilety': { action: 'покупает билеты в кассе парка развлечений', background: 'Вход в большой парк развлечений летом: кассы с окошками, турникеты, вдали американские горки и колесо обозрения; без логотипов парка.' },
  'park-kolejka': { action: 'стоит в очереди на американские горки', background: 'Очередь к американским горкам: ограждение-змейка, ростомер у входа, шкафчики для рюкзаков, вагончики горок над головой.' },
  // ── Premium-подорожі (content/missions-premium.ts) ──
  'lotnisko-lot': { action: 'проходит регистрацию на рейс LOT', background: 'Стойка регистрации LOT в аэропорту Кракова: сотрудница, табло вылетов, самолёт за стеклом, Вавель вдали.' },
  'zakopane-ferie': { action: 'заселяется в горный отель и спрашивает про ски-пасс', background: 'Рецепция горного отеля в Закопане: администратор, лыжи у стойки, за окном заснеженные Татры.' },
  'warszawa-dzien': { action: 'ищет Королевский замок и покупает открытки', background: 'Замковая площадь в Варшаве: колонна Сигизмунда, Королевский замок, киоск с открытками и магнитами.' },
  'park-zguba': { action: 'забирает потерянный телефон в пункте информации', background: 'Пункт информации парка развлечений: стойка с сотрудницей, коробка находок, карта парка на стене без читаемого текста; рядом вход.' },
};
