/**
 * Довідка до растрових сцен місій (SCENE_ART): оригінал і вирізка, рідний розмір, що зображено, відомі вади, кадр для Telegram.
 * Окремо від `sceneArt.ts` (2026-11-03): застосунку ці тексти не потрібні, а в стартовій загрузці вони коштували ≈ 2 КБ (бюджет JS, scripts/perf.ts).
 * Обчислювані експорти позначені `#__PURE__`: якщо клієнт їх не імпортує, збирач викидає цей файл повністю.
 * Користуються: apps/server/test/scene-art.test.ts, scripts/lib/unfinished-assets.ts (docs/UNFINISHED_ASSETS.md), бот (QUESTION_SCENE_IMAGES).
 */
import { SCENE_ART, type SceneArt } from './sceneArt';

export interface SceneArtNotes {
  /** Рідний розмір вирізки 2:1 (все понад це — збільшення). */
  native: [number, number];
  /**
   * Оригінал кадру (шлях від кореня репозиторію) і зсув вирізки 2:1 від верхнього краю оригіналу, px.
   * Немає — вирізка з колажу: docs/design/a11/stores/native/<file>_source_native_2x1.png.
   */
  source?: { file: string; top: number };
  /** Що зображено. */
  shows: string;
  /**
   * Файл кадру для Telegram (apps/web/public/bot, 1280×720) і питання, де він доречний; null — кадру в боті немає.
   * Тимчасові вирізки сюди не потрапляють: у 1280×720 вони збільшені в 2–2,5 раза, і scripts/validate-assets.mjs
   * відхиляє такий файл (детали < 0,44). Biedronka була підключена до питання shop-loyalty і знята 2026-10-27.
   */
  telegram: { file: string; questionIds: string[] } | null;
  /** Відомі вади кадру, які виправить майстер-файл. */
  defects: string[];
}

export type SceneArtFull = SceneArt & SceneArtNotes;

export const SCENE_ART_NOTES: Record<string, SceneArtNotes> = {
  'store-zabka': {
    native: [632, 316],
    shows: 'Фасад Żabka, Бобек із кавою, касир за прилавком',
    telegram: null,
    defects: ['у лапі кава й табличка «Gorąca kawa», а в місії Бобек замовляє хот-дог і воду'],
  },
  'store-biedronka': {
    native: [632, 316],
    shows: 'Фасад Biedronka, Бобек із візком продуктів',
    telegram: null,
    defects: [],
  },
  'store-rossmann': {
    native: [550, 275],
    shows: 'Фасад Rossmann, Бобек із кошиком і флаконом',
    telegram: null,
    defects: ['написи «KOSMETYKI» і «HIGIENA» над стелажами перекручені (читаються як «HIGIEŃYIE»), червона табличка за ними нечитабельна'],
  },
  'parcel-inpost': {
    native: [550, 275],
    shows: 'Поштомат InPost (paczkomat), Бобек з коробкою',
    telegram: null,
    defects: ['панель справа обрізана: слова «Szybko», «Wygodnie» не вміщаються в кадр'],
  },
  'fuel-orlen': {
    native: [644, 322],
    shows: 'Заправка ORLEN, Бобек біля колонки, Stop Cafe',
    telegram: null,
    defects: ['для місії orlen-coffee не підходить: Бобек заправляє авто, а не купує каву'],
  },
  'clinic-registration': {
    native: [1536, 768],
    source: { file: 'docs/design/a12/missions/przychodnia_original.webp', top: 40 },
    shows: 'Реєстратура поліклініки (REJESTRACJA), Бобек подає картку реєстраторці',
    telegram: null,
    defects: [],
  },
  'office-first-day': {
    native: [1536, 768],
    source: { file: 'docs/design/a12/missions/biuro_original.webp', top: 110 },
    shows: 'Офіс, колега з бейджем тисне Бобекові руку, колежанка махає з-за столу',
    telegram: null,
    defects: [
      'за вікном Варшава (Палац культури, колона Сигізмунда), а місія — у Вроцлаві',
      'руку Бобекові тисне колега-чоловік, а зустрічає його в місії керівниця Pani Agnieszka',
    ],
  },
  'street-zapiekanki': {
    native: [1536, 768],
    source: { file: 'docs/design/a12/missions/zapiekanki_original.webp', top: 50 },
    shows: 'Віконце ZAPIEKANKI ввечері, продавець за прилавком, Бобек із запіканкою',
    telegram: null,
    defects: ['на тлі Ринок і Маріацький костел, а місія — на Plac Nowy (Казімєж)'],
  },
  'flat-keys': {
    native: [1536, 768],
    source: { file: 'docs/design/a12/missions/mieszkanie_original.webp', top: 60 },
    shows: 'Світла вітальня, власниця квартири передає Бобекові ключі, тека з договором на столі',
    telegram: null,
    defects: [],
  },
  'bakery-pierniki': {
    native: [1536, 768],
    source: { file: 'docs/design/a12/missions/pierniki_original.webp', top: 60 },
    shows: 'Пряникова крамниця в Торуні (PIERNIKI), продавчиня подає пакет пряників, за вікном цегляна готика',
    telegram: null,
    defects: [],
  },
  'milk-bar': {
    native: [1672, 836],
    source: { file: 'docs/design/a12/missions/bar-mleczny_original.webp', top: 10 },
    shows: 'BAR MLECZNY: роздача, кухарка з черпаком, Бобек із тацею (суп, котлета, картопля)',
    telegram: null,
    defects: [],
  },
  'station-pkp': {
    native: [1536, 768],
    source: { file: 'docs/design/a12/missions/pkp_original.webp', top: 10 },
    shows: 'Каса вокзалу (BILETY, PKP), касирка подає квиток, за склом перон і потяг',
    telegram: null,
    defects: ['над перонами табличка WROCŁAW і вроцлавська готика, а Бобек у місії купує квиток на Warszawa Centralna'],
  },
  'store-lidl': {
    native: [1536, 768],
    source: { file: 'docs/design/a12/missions/lidl_original.webp', top: 150 },
    shows: 'Вхід у Lidl, Бобек зі списком покупок і повним візком (овочі, хліб, молоко)',
    telegram: null,
    defects: ['Бобек біля входу, а в місії він платить на касі самообслуговування'],
  },
  'tram-stop': {
    native: [1536, 768],
    source: { file: 'docs/design/a12/missions/tramwaj_original.webp', top: 80 },
    shows: 'Зупинка у Вроцлаві, Бобек із квитком, під’їжджає трамвай',
    telegram: null,
    defects: [],
  },
  'stop-cafe': {
    native: [1536, 768],
    source: { file: 'docs/design/a16/missions/stop-cafe_original.webp', top: 80 },
    shows: 'Stop Cafe на станції ORLEN: бариста подає каву, Бобек зі стаканчиком, за вікном колонки під навісом',
    telegram: null,
    defects: [],
  },
  'urzad-okienko': {
    native: [1536, 768],
    source: { file: 'docs/design/a16/missions/urzad_original.webp', top: 100 },
    shows: 'Зала обслуговування Urząd Miasta: віконця 1–3, співробітниця за склом, автомат талонів, Бобек із документами',
    telegram: null,
    defects: [],
  },
  'cukiernia-rogale': {
    native: [1536, 768],
    source: { file: 'docs/design/a16/missions/cukiernia_original.webp', top: 80 },
    shows: 'Cukiernia в Познані: вітрина з rogalami świętomarcińskimi, продавчиня, прапорці, за вікном Старий Ринок; Бобек із рогалем',
    telegram: null,
    defects: ['Бобек у фартуху й ковпаку кондитера, а в місії він купує rogale на виніс'],
  },
  'pierogarnia': {
    native: [1536, 768],
    source: { file: 'docs/design/a16/missions/pierogarnia_original.webp', top: 180 },
    shows: 'Затишна pierogarnia з народним декором: żurek на столі, Бобек несе тарілку pierogów, за вікном Краків',
    telegram: null,
    defects: ['Бобек несе тарілку у фартуху, як офіціант, а в місії він замовляє pierogi й żurek'],
  },
  'lotnisko-lot': {
    native: [1536, 768],
    source: { file: 'docs/design/a16/missions/lotnisko-lot_original.webp', top: 150 },
    shows: 'Стійка реєстрації LOT в аеропорту Кракова: працівниця, табло вильотів, літак за склом, Вавель на тлі; Бобек із валізою й посадковим',
    telegram: null,
    defects: [],
  },
  'recepcja-narty': {
    native: [1536, 768],
    source: { file: 'docs/design/a16/missions/recepcja-narty_original.webp', top: 90 },
    shows: 'Рецепція гірського готелю: адміністраторка подає картку, лижі на стійці, за вікном засніжені Татри; Бобек у зимовій куртці',
    telegram: null,
    defects: [],
  },
  'warszawa-starowka': {
    native: [1536, 768],
    source: { file: 'docs/design/a16/missions/warszawa-starowka_original.webp', top: 160 },
    shows: 'Замкова площа у Варшаві: колона Сигізмунда, Королівський замок, кіоск із листівками; Бобек із картою й фотоапаратом',
    telegram: null,
    defects: [],
  },
};

/** SCENE_ART разом із довідкою — для тестів і документів. */
export const SCENE_ART_FULL: Record<string, SceneArtFull> = /*#__PURE__*/ Object.fromEntries(
  Object.entries(SCENE_ART).map(([id, a]) => [id, { ...a, ...SCENE_ART_NOTES[id] }]),
);

/** Кадр Telegram для питання вікторини (question id → файл відносно /bot/); немає запису — картинки до питання немає. */
export const QUESTION_SCENE_IMAGES: Record<string, string> = /*#__PURE__*/ Object.fromEntries(
  Object.values(SCENE_ART_NOTES).flatMap((a) => (a.telegram ? a.telegram.questionIds.map((q) => [q, a.telegram!.file] as const) : [])),
);
