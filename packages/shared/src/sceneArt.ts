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
  /** Рідний розмір вирізки 2:1 (все понад це — збільшення). */
  native: [number, number];
  /**
   * Оригінал кадру (шлях від кореня репозиторію) і зсув вирізки 2:1 від верхнього краю оригіналу, px.
   * Немає — вирізка з колажу: docs/design/a11/stores/native/<file>_source_native_2x1.png.
   */
  source?: { file: string; top: number };
  /** Бобек намальований у самому кадрі: поверх нього другого Бобека не показуємо. */
  bakedBobek: boolean;
  /** SVG-сцена місії, яку ця картинка замінює (місія з таким `scene` у MISSIONS); без картинки клієнт малює її. */
  fallbackScene: string;
  /** Місії, де сцена доречна за змістом. Ключ — slug місії, а не назва SVG-сцени: Lidl теж у `supermarket`, але це не Biedronka. */
  missions: string[];
  /** object-position для вузьких карток (360–390 px): кадр 2:1 обрізається по висоті, Бобек і вивіска лишаються в кадрі. */
  focus: string;
  /** Що зображено. */
  shows: string;
  /**
   * Файл кадру для Telegram (apps/web/public/bot, 1280×720) і питання, де він доречний; null — кадру в боті немає.
   * Тимчасові вирізки сюди не потрапляють: у 1280×720 вони збільшені в 2–2,5 раза, і scripts/validate-assets.mjs
   * відхиляє такий файл (детали < 0,44). Biedronka була підключена до питання shop-loyalty і знята 2026-10-27 (Opus).
   */
  telegram: { file: string; questionIds: string[] } | null;
  /** Відомі вади кадру, які виправить майстер-файл. */
  defects: string[];
}

/** Ширина зменшеного варіанта `<file>@640.webp` для карток і вузьких екранів. */
export const SCENE_ART_SMALL = 640;

const common = { status: 'interim', width: 1440, height: 720, bakedBobek: true } as const;

export const SCENE_ART: Record<string, SceneArt> = {
  'store-zabka': {
    ...common, id: 'store-zabka', file: 'zabka', brand: 'Żabka', native: [632, 316], fallbackScene: 'shop-corner',
    missions: ['zabka-first-order'], focus: '55% 12%', shows: 'Фасад Żabka, Бобек із кавою, касир за прилавком',
    telegram: null, defects: ['у лапі кава й табличка «Gorąca kawa», а в місії Бобек замовляє хот-дог і воду'],
  },
  'store-biedronka': {
    ...common, id: 'store-biedronka', file: 'biedronka', brand: 'Biedronka', native: [632, 316], fallbackScene: 'supermarket',
    missions: ['biedronka-breakfast'], focus: '15% 10%', shows: 'Фасад Biedronka, Бобек із візком продуктів',
    telegram: null, defects: [],
  },
  'store-rossmann': {
    ...common, id: 'store-rossmann', file: 'rossmann', brand: 'Rossmann', native: [550, 275], fallbackScene: 'drugstore',
    missions: ['rossmann-basics'], focus: '30% 10%', shows: 'Фасад Rossmann, Бобек із кошиком і флаконом',
    telegram: null,
    defects: ['написи «KOSMETYKI» і «HIGIENA» над стелажами перекручені (читаються як «HIGIEŃYIE»), червона табличка за ними нечитабельна'],
  },
  'parcel-inpost': {
    ...common, id: 'parcel-inpost', file: 'inpost', brand: 'InPost', native: [550, 275], fallbackScene: 'parcel-locker',
    missions: ['paczkomat'], focus: '20% 20%', shows: 'Поштомат InPost (paczkomat), Бобек з коробкою',
    telegram: null, defects: ['панель справа обрізана: слова «Szybko», «Wygodnie» не вміщаються в кадр'],
  },
  'fuel-orlen': {
    ...common, id: 'fuel-orlen', file: 'orlen', brand: 'ORLEN', native: [644, 322], fallbackScene: 'petrol-station',
    // orlen-coffee (кава в Stop Cafe) знято 2026-10-27: на кадрі Бобек із пістолетом біля колонки — інша дія; місія показує SVG-сцену.
    missions: ['orlen-pump'], focus: '35% 10%', shows: 'Заправка ORLEN, Бобек біля колонки, Stop Cafe',
    telegram: null, defects: ['для місії orlen-coffee не підходить: Бобек заправляє авто, а не купує каву'],
  },

  // ── Пакет власника 2026-10-28: окремі кадри місій (1536×768 і більше), у застосунку лише зменшені. ──
  'clinic-registration': {
    ...common, id: 'clinic-registration', file: 'przychodnia', brand: 'Przychodnia', native: [1536, 768], fallbackScene: 'clinic',
    source: { file: 'docs/design/a12/missions/przychodnia_original.webp', top: 40 },
    missions: ['doctor-appointment'], focus: '50% 30%', shows: 'Реєстратура поліклініки (REJESTRACJA), Бобек подає картку реєстраторці',
    telegram: null, defects: [],
  },
  'office-first-day': {
    ...common, id: 'office-first-day', file: 'biuro', brand: 'Biuro', native: [1536, 768], fallbackScene: 'work',
    source: { file: 'docs/design/a12/missions/biuro_original.webp', top: 110 },
    missions: ['first-workday'], focus: '45% 30%', shows: 'Офіс, колега з бейджем тисне Бобекові руку, колежанка махає з-за столу',
    telegram: null,
    defects: [
      'за вікном Варшава (Палац культури, колона Сигізмунда), а місія — у Вроцлаві',
      'руку Бобекові тисне колега-чоловік, а зустрічає його в місії керівниця Pani Agnieszka',
    ],
  },
  'street-zapiekanki': {
    ...common, id: 'street-zapiekanki', file: 'zapiekanki', brand: 'Zapiekanki', native: [1536, 768], fallbackScene: 'street-food',
    source: { file: 'docs/design/a12/missions/zapiekanki_original.webp', top: 50 },
    missions: ['kazimierz-zapiekanka'], focus: '45% 40%', shows: 'Віконце ZAPIEKANKI ввечері, продавець за прилавком, Бобек із запіканкою',
    telegram: null, defects: ['на тлі Ринок і Маріацький костел, а місія — на Plac Nowy (Казімєж)'],
  },
  'flat-keys': {
    ...common, id: 'flat-keys', file: 'mieszkanie', brand: 'Mieszkanie', native: [1536, 768], fallbackScene: 'flat',
    source: { file: 'docs/design/a12/missions/mieszkanie_original.webp', top: 60 },
    missions: ['landlord'], focus: '45% 30%', shows: 'Світла вітальня, власниця квартири передає Бобекові ключі, тека з договором на столі',
    telegram: null, defects: [],
  },
  'bakery-pierniki': {
    ...common, id: 'bakery-pierniki', file: 'pierniki', brand: 'Pierniki', native: [1536, 768], fallbackScene: 'bakery',
    source: { file: 'docs/design/a12/missions/pierniki_original.webp', top: 60 },
    missions: ['torun-bakery'], focus: '50% 35%', shows: 'Пряникова крамниця в Торуні (PIERNIKI), продавчиня подає пакет пряників, за вікном цегляна готика',
    telegram: null, defects: [],
  },
  'milk-bar': {
    ...common, id: 'milk-bar', file: 'bar-mleczny', brand: 'Bar mleczny', native: [1672, 836], fallbackScene: 'milk-bar',
    source: { file: 'docs/design/a12/missions/bar-mleczny_original.webp', top: 10 },
    missions: ['bar-mleczny'], focus: '50% 35%', shows: 'BAR MLECZNY: роздача, кухарка з черпаком, Бобек із тацею (суп, котлета, картопля)',
    telegram: null, defects: [],
  },
  'station-pkp': {
    ...common, id: 'station-pkp', file: 'pkp', brand: 'PKP', native: [1536, 768], fallbackScene: 'train-station',
    source: { file: 'docs/design/a12/missions/pkp_original.webp', top: 10 },
    missions: ['train-wroclaw'], focus: '50% 30%', shows: 'Каса вокзалу (BILETY, PKP), касирка подає квиток, за склом перон і потяг',
    telegram: null, defects: ['над перонами табличка WROCŁAW і вроцлавська готика, а Бобек у місії купує квиток на Warszawa Centralna'],
  },
  'store-lidl': {
    ...common, id: 'store-lidl', file: 'lidl', brand: 'Lidl', native: [1536, 768], fallbackScene: 'supermarket',
    source: { file: 'docs/design/a12/missions/lidl_original.webp', top: 150 },
    missions: ['lidl-list'], focus: '30% 40%', shows: 'Вхід у Lidl, Бобек зі списком покупок і повним візком (овочі, хліб, молоко)',
    telegram: null, defects: ['Бобек біля входу, а в місії він платить на касі самообслуговування'],
  },
  'tram-stop': {
    ...common, id: 'tram-stop', file: 'tramwaj', brand: 'Tramwaj', native: [1536, 768], fallbackScene: 'tram-stop',
    source: { file: 'docs/design/a12/missions/tramwaj_original.webp', top: 80 },
    missions: ['first-tram'], focus: '50% 30%', shows: 'Зупинка у Вроцлаві, Бобек із квитком, під’їжджає трамвай',
    telegram: null, defects: [],
  },
  // ── Пакет власника 2026-10-31: чотири кадри 1536×1024 для місій, які досі мали SVG-сцену. ──
  'stop-cafe': {
    ...common, id: 'stop-cafe', file: 'stop-cafe', brand: 'ORLEN Stop Cafe', native: [1536, 768], fallbackScene: 'petrol-station',
    source: { file: 'docs/design/a16/missions/stop-cafe_original.webp', top: 80 },
    missions: ['orlen-coffee'], focus: '45% 35%', shows: 'Stop Cafe на станції ORLEN: бариста подає каву, Бобек зі стаканчиком, за вікном колонки під навісом',
    telegram: null, defects: [],
  },
  'urzad-okienko': {
    ...common, id: 'urzad-okienko', file: 'urzad', brand: 'Urząd', native: [1536, 768], fallbackScene: 'office',
    source: { file: 'docs/design/a16/missions/urzad_original.webp', top: 100 },
    missions: ['urzad-pesel'], focus: '45% 35%', shows: 'Зала обслуговування Urząd Miasta: віконця 1–3, співробітниця за склом, автомат талонів, Бобек із документами',
    telegram: null, defects: [],
  },
  'cukiernia-rogale': {
    ...common, id: 'cukiernia-rogale', file: 'cukiernia', brand: 'Cukiernia', native: [1536, 768], fallbackScene: 'pastry-shop',
    source: { file: 'docs/design/a16/missions/cukiernia_original.webp', top: 80 },
    missions: ['marcin-rogal'], focus: '45% 35%', shows: 'Cukiernia в Познані: вітрина з rogalami świętomarcińskimi, продавчиня, прапорці, за вікном Старий Ринок; Бобек із рогалем',
    telegram: null, defects: ['Бобек у фартуху й ковпаку кондитера, а в місії він купує rogale на виніс'],
  },
  pierogarnia: {
    ...common, id: 'pierogarnia', file: 'pierogarnia', brand: 'Pierogarnia', native: [1536, 768], fallbackScene: 'cafe-pierogi',
    source: { file: 'docs/design/a16/missions/pierogarnia_original.webp', top: 180 },
    missions: ['krakow-pierogi'], focus: '50% 35%', shows: 'Затишна pierogarnia з народним декором: żurek на столі, Бобек несе тарілку pierogów, за вікном Краків',
    telegram: null, defects: ['Бобек несе тарілку у фартуху, як офіціант, а в місії він замовляє pierogi й żurek'],
  },
  // ── Premium-подорожі (content/missions-travel.ts), кадри власника 2026-10-31. ──
  'lotnisko-lot': {
    ...common, id: 'lotnisko-lot', file: 'lotnisko-lot', brand: 'LOT', native: [1536, 768], fallbackScene: 'train-station',
    source: { file: 'docs/design/a16/missions/lotnisko-lot_original.webp', top: 150 },
    missions: ['lotnisko-lot'], focus: '40% 35%', shows: 'Стійка реєстрації LOT в аеропорту Кракова: працівниця, табло вильотів, літак за склом, Вавель на тлі; Бобек із валізою й посадковим',
    telegram: null, defects: [],
  },
  'recepcja-narty': {
    ...common, id: 'recepcja-narty', file: 'recepcja-narty', brand: 'Zakopane', native: [1536, 768], fallbackScene: 'hotel',
    source: { file: 'docs/design/a16/missions/recepcja-narty_original.webp', top: 90 },
    missions: ['zakopane-ferie'], focus: '45% 35%', shows: 'Рецепція гірського готелю: адміністраторка подає картку, лижі на стійці, за вікном засніжені Татри; Бобек у зимовій куртці',
    telegram: null, defects: [],
  },
  'warszawa-starowka': {
    ...common, id: 'warszawa-starowka', file: 'warszawa-starowka', brand: 'Warszawa', native: [1536, 768], fallbackScene: 'castle',
    source: { file: 'docs/design/a16/missions/warszawa-starowka_original.webp', top: 160 },
    missions: ['warszawa-dzien'], focus: '45% 35%', shows: 'Замкова площа у Варшаві: колона Сигізмунда, Королівський замок, кіоск із листівками; Бобек із картою й фотоапаратом',
    telegram: null, defects: [],
  },
};

/** slug місії → scene_id картинки. Місій без запису це не стосується: вони й далі показують SVG-сцену. */
export const MISSION_SCENE_ART: Record<string, string> = Object.fromEntries(
  Object.values(SCENE_ART).flatMap((a) => a.missions.map((m) => [m, a.id] as const)),
);

/** Кадр Telegram для питання вікторини (question id → файл відносно /bot/); немає запису — картинки до питання немає. */
export const QUESTION_SCENE_IMAGES: Record<string, string> = Object.fromEntries(
  Object.values(SCENE_ART).flatMap((a) => (a.telegram ? a.telegram.questionIds.map((q) => [q, a.telegram!.file] as const) : [])),
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
  // ── Premium-подорожі (content/missions-travel.ts) ──
  'lotnisko-lot': { action: 'проходит регистрацию на рейс LOT', background: 'Стойка регистрации LOT в аэропорту Кракова: сотрудница, табло вылетов, самолёт за стеклом, Вавель вдали.' },
  'zakopane-ferie': { action: 'заселяется в горный отель и спрашивает про ски-пасс', background: 'Рецепция горного отеля в Закопане: администратор, лыжи у стойки, за окном заснеженные Татры.' },
  'warszawa-dzien': { action: 'ищет Королевский замок и покупает открытки', background: 'Замковая площадь в Варшаве: колонна Сигизмунда, Королевский замок, киоск с открытками и магнитами.' },
  'park-zguba': { action: 'забирает потерянный телефон в пункте информации', background: 'Пункт информации парка развлечений: стойка с сотрудницей, коробка находок, карта парка на стене без читаемого текста; рядом вход.' },
};
