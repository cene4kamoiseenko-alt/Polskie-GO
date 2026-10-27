/**
 * Явні правила оновлення вже засіяного контенту (seed без force не перезаписує рядки).
 * Текст змінюється, лише якщо в БД досі старе значення з коду: правки з адмінки не зачіпаємо.
 */
import { t } from './builders';
import type { I18n } from '@polski-go/shared';

export type TextFix = { table: 'city_routes' | 'lessons'; slug: string; column: 'title' | 'description' | 'icon' | 'topic' | 'explanation'; from: I18n | string; to: I18n | string };

/** Перенесення уроку між локаціями — лише якщо урок досі в старій локації (ручне перенесення з адмінки не чіпаємо). */
export type LessonMove = { lesson: string; from: string; to: string; order: number };

export const TEXT_FIXES: TextFix[] = [
  // Катовіце: назви перших двох уроків були польськими в усіх мовах (аудит 2026-10-27).
  {
    table: 'lessons', slug: 'kat-1-transport', column: 'title',
    from: t('Jadę tramwajem', 'Jadę tramwajem', 'Jadę tramwajem'),
    to: t('Їду трамваєм', 'Еду на трамвае', 'I go by tram'),
  },
  {
    table: 'lessons', slug: 'kat-2-isc-jechac', column: 'title',
    from: t('Iść, chodzić, jechać, jeździć', 'Iść, chodzić, jechać, jeździć', 'Iść, chodzić, jechać, jeździć'),
    to: t('Іти, ходити, їхати, їздити', 'Идти, ходить, ехать, ездить', 'Walking and going by vehicle'),
  },
  // Ополе: назва локації «Żywy polski» була польською в усіх мовах (аудит 2026-10-27).
  {
    table: 'city_routes', slug: 'opo-zywy', column: 'title',
    from: t('Żywy polski', 'Żywy polski', 'Żywy polski'),
    to: t('Живий польський', 'Живой польский', 'Living Polish'),
  },
  // Квиток з іспиту веде до наступного міста маршруту (Warszawa → Łódź → Kraków → Katowice → Opole → Wrocław → Poznań).
  {
    table: 'city_routes', slug: 'waw-egzamin', column: 'description',
    from: t('Фінальне випробування: пройди, щоб отримати квиток до Кракова', 'Финальное испытание: пройди, чтобы получить билет в Краков', 'Final challenge: pass it to get a ticket to Kraków'),
    to: t('Фінальне випробування: пройди, щоб отримати квиток до Лодзі', 'Финальное испытание: пройди, чтобы получить билет в Лодзь', 'Final challenge: pass it to get a ticket to Łódź'),
  },
  {
    table: 'city_routes', slug: 'krk-egzamin', column: 'description',
    from: t('Пройди, щоб отримати квиток до Вроцлава', 'Пройди, чтобы получить билет во Вроцлав', 'Pass to get a ticket to Wrocław'),
    to: t('Пройди, щоб отримати квиток до Катовіце', 'Пройди, чтобы получить билет в Катовице', 'Pass to get a ticket to Katowice'),
  },
  {
    table: 'city_routes', slug: 'wro-egzamin', column: 'description',
    from: t('Пройди, щоб отримати квиток до Гданська', 'Пройди, чтобы получить билет в Гданьск', 'Pass to get a ticket to Gdańsk'),
    to: t('Пройди, щоб отримати квиток до Познані', 'Пройди, чтобы получить билет в Познань', 'Pass to get a ticket to Poznań'),
  },
  // Варшава 4.0: шість локацій замість трьох тем.
  {
    table: 'city_routes', slug: 'waw-powitania', column: 'title',
    from: t('Привітання', 'Приветствия', 'Greetings'),
    to: t('Перше знайомство', 'Первое знакомство', 'First meeting'),
  },
  {
    table: 'city_routes', slug: 'waw-powitania', column: 'description',
    from: t('Перші польські слова: як привітатися і попрощатися', 'Первые польские слова: как поздороваться и попрощаться', 'First Polish words: hello and goodbye'),
    to: t('Привітання, ввічливість, ім\'я та звідки ти — перша розмова у Варшаві', 'Приветствия, вежливость, имя и откуда ты — первый разговор в Варшаве', 'Greetings, politeness, your name and where you\'re from — your first chat in Warsaw'),
  },
  {
    table: 'city_routes', slug: 'waw-przedstawianie', column: 'title',
    from: t('Знайомство', 'Знакомство', 'Introductions'),
    to: t('Warszawa Centralna й транспорт', 'Warszawa Centralna и транспорт', 'Warszawa Centralna & transport'),
  },
  {
    table: 'city_routes', slug: 'waw-przedstawianie', column: 'description',
    from: t('Розкажи, як тебе звати і звідки ти', 'Расскажи, как тебя зовут и откуда ты', 'Say your name and where you are from'),
    to: t('Вокзал, квитки, метро M1 і M2 та пересадка', 'Вокзал, билеты, метро M1 и M2 и пересадка', 'The station, tickets, metro lines M1 and M2, transfers'),
  },
  { table: 'city_routes', slug: 'waw-przedstawianie', column: 'icon', from: '🤝', to: '🚇' },
  {
    table: 'city_routes', slug: 'waw-liczby', column: 'title',
    from: t('Числа', 'Числа', 'Numbers'),
    to: t('Числа й прості покупки', 'Числа и простые покупки', 'Numbers & simple shopping'),
  },
  {
    table: 'city_routes', slug: 'waw-liczby', column: 'description',
    from: t('Рахуємо до двадцяти і називаємо вік', 'Считаем до двадцати и называем возраст', 'Count to twenty and say your age'),
    to: t('Числа до 100, ціни, ринок і крамниця біля дому', 'Числа до 100, цены, рынок и магазин у дома', 'Numbers to 100, prices, the market and the local shop'),
  },
  { table: 'city_routes', slug: 'waw-liczby', column: 'icon', from: '🔢', to: '🛒' },
  // Іспит Варшави тепер охоплює всі шість локацій.
  {
    table: 'lessons', slug: 'waw-boss', column: 'topic',
    from: t('Привітання, ввічливість, знайомство, числа', 'Приветствия, вежливость, знакомство, числа', 'Greetings, politeness, introductions, numbers'),
    to: t('Знайомство, транспорт, покупки, Старе Місто, кав\'ярня, сусіди', 'Знакомство, транспорт, покупки, Старый город, кафе, соседи', 'Introductions, transport, shopping, the Old Town, cafés, neighbours'),
  },
  {
    table: 'lessons', slug: 'waw-boss', column: 'explanation',
    from: t(
      'Фінальний іспит Варшави. Потрібно **70%** правильних відповідей.\nПовтори привітання, «чарівні слова», знайомство та числа. Powodzenia! (Успіхів!)',
      'Финальный экзамен Варшавы. Нужно **70%** правильных ответов.\nПовтори приветствия, «волшебные слова», знакомство и числа. Powodzenia! (Удачи!)',
      'The final Warsaw exam. You need **70%** correct answers.\nReview greetings, magic words, introductions and numbers. Powodzenia! (Good luck!)',
    ),
    to: t(
      'Фінальний іспит Варшави. Потрібно **70%** правильних відповідей.\nПовтори знайомство й «чарівні слова», квитки й метро, ціни, дорогу Старим Містом, замовлення в кав\'ярні й розмову із сусідами. Powodzenia! (Успіхів!)',
      'Финальный экзамен Варшавы. Нужно **70%** правильных ответов.\nПовтори знакомство и «волшебные слова», билеты и метро, цены, дорогу по Старому городу, заказ в кафе и разговор с соседями. Powodzenia! (Удачи!)',
      'The final Warsaw exam. You need **70%** correct answers.\nReview introductions and magic words, tickets and the metro, prices, finding your way in the Old Town, ordering at a café and chatting with neighbours. Powodzenia! (Good luck!)',
    ),
  },
  // Лодзь, друге розширення (уроки 9–16): іспит охоплює нові теми; пояснення без роду («Перевір усе з Лодзі»).
  {
    table: 'city_routes', slug: 'lodz-egzamin', column: 'description',
    from: t('Звуки, być і oni/one', 'Звуки, być и oni/one', 'Sounds, być and oni/one'),
    to: t('Звуки, być, робота, час і здоров\'я', 'Звуки, być, работа, время и здоровье', 'Sounds, być, work, time and health'),
  },
  {
    table: 'lessons', slug: 'lodz-boss', column: 'topic',
    from: t('Звуки, професії, oni/one', 'Звуки, профессии, oni/one', 'Sounds, jobs, oni/one'),
    to: t('Звуки, професії, oni/one, графік, час, здоров\'я', 'Звуки, профессии, oni/one, график, время, здоровье', 'Sounds, jobs, oni/one, rotas, time, health'),
  },
  {
    table: 'lessons', slug: 'lodz-boss', column: 'explanation',
    from: t('Перевір усе, що вивчив у Лодзі: літери, наголос, być + орудний відмінок, oni / one.', 'Проверь всё, что изучил в Лодзи: буквы, ударение, być + творительный падеж, oni / one.', 'Check everything from Łódź: letters, stress, być + instrumental, oni / one.'),
    to: t('Перевір усе з Лодзі: літери, наголос, być + орудний відмінок, oni / one, робота й графік, котра година, ранок, самопочуття, поліклініка й аптека.', 'Проверь всё из Лодзи: буквы, ударение, być + творительный падеж, oni / one, работа и график, который час, утро, самочувствие, поликлиника и аптека.', 'Check everything from Łódź: letters, stress, być + instrumental, oni / one, work and rotas, telling the time, mornings, health, the clinic and the pharmacy.'),
  },
];

export const LESSON_MOVES: LessonMove[] = [
  // «Як тебе звати?» і «Звідки ти?» тепер у першій локації «Перше знайомство».
  { lesson: 'waw-3-imie', from: 'waw-przedstawianie', to: 'waw-powitania', order: 3 },
  { lesson: 'waw-4-skad', from: 'waw-przedstawianie', to: 'waw-powitania', order: 4 },
];

/** Іконки локацій: емодзі → ключ іконки з листа «Іконки без емодзі» (лише якщо в БД досі емодзі з коду). */
export const ROUTE_ICON_FIXES: TextFix[] = [
  { table: 'city_routes', slug: 'waw-powitania', column: 'icon', from: '👋', to: 'dialog' },
  { table: 'city_routes', slug: 'waw-przedstawianie', column: 'icon', from: '🚇', to: 'transport' },
  { table: 'city_routes', slug: 'waw-liczby', column: 'icon', from: '🛒', to: 'shopping' },
  { table: 'city_routes', slug: 'waw-stare-miasto', column: 'icon', from: '🏰', to: 'explore' },
  { table: 'city_routes', slug: 'waw-kawiarnia', column: 'icon', from: '☕', to: 'cafe' },
  { table: 'city_routes', slug: 'waw-sasiedzi', column: 'icon', from: '🏘️', to: 'house' },
  { table: 'city_routes', slug: 'waw-egzamin', column: 'icon', from: '🏆', to: 'achievements' },
  { table: 'city_routes', slug: 'lodz-dzwieki', column: 'icon', from: '🔤', to: 'pronunciation' },
  { table: 'city_routes', slug: 'lodz-ludzie', column: 'icon', from: '🧑‍🤝‍🧑', to: 'dialog' },
  { table: 'city_routes', slug: 'lodz-egzamin', column: 'icon', from: '🏆', to: 'achievements' },
  { table: 'city_routes', slug: 'krk-dworzec', column: 'icon', from: '🚉', to: 'transport' },
  { table: 'city_routes', slug: 'krk-zabka', column: 'icon', from: '🐸', to: 'shopping' },
  { table: 'city_routes', slug: 'krk-rynek', column: 'icon', from: '⛪', to: 'explore' },
  { table: 'city_routes', slug: 'krk-restauracja', column: 'icon', from: '🥟', to: 'food' },
  { table: 'city_routes', slug: 'krk-tramwaj', column: 'icon', from: '🚋', to: 'transport' },
  { table: 'city_routes', slug: 'krk-hotel', column: 'icon', from: '🏨', to: 'house' },
  { table: 'city_routes', slug: 'krk-uniwersytet', column: 'icon', from: '🎓', to: 'lessons' },
  { table: 'city_routes', slug: 'krk-rodzina', column: 'icon', from: '👨‍👩‍👧', to: 'house' },
  { table: 'city_routes', slug: 'krk-dom', column: 'icon', from: '🏠', to: 'house' },
  { table: 'city_routes', slug: 'krk-dzien', column: 'icon', from: '📅', to: 'writing' },
  { table: 'city_routes', slug: 'krk-egzamin', column: 'icon', from: '🏆', to: 'achievements' },
  { table: 'city_routes', slug: 'kat-ruch', column: 'icon', from: '🚋', to: 'transport' },
  { table: 'city_routes', slug: 'kat-pary', column: 'icon', from: '⚖️', to: 'dictionary' },
  { table: 'city_routes', slug: 'kat-egzamin', column: 'icon', from: '🏆', to: 'achievements' },
  { table: 'city_routes', slug: 'opo-zywy', column: 'icon', from: '💬', to: 'dialog' },
  { table: 'city_routes', slug: 'opo-egzamin', column: 'icon', from: '🏆', to: 'achievements' },
  { table: 'city_routes', slug: 'wro-kawiarnia', column: 'icon', from: '☕', to: 'cafe' },
  { table: 'city_routes', slug: 'wro-sklep', column: 'icon', from: '🛒', to: 'shopping' },
  { table: 'city_routes', slug: 'wro-restauracja', column: 'icon', from: '🍽️', to: 'food' },
  { table: 'city_routes', slug: 'wro-egzamin', column: 'icon', from: '🏆', to: 'achievements' },
];
