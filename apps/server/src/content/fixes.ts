/**
 * Явні правила оновлення вже засіяного контенту (seed без force не перезаписує рядки).
 * Текст змінюється, лише якщо в БД досі старе значення з коду: правки з адмінки не зачіпаємо.
 */
import { t } from './builders';
import type { I18n } from '@polski-go/shared';

export type TextFix = { table: 'city_routes' | 'lessons'; slug: string; column: 'title' | 'description' | 'icon'; from: I18n | string; to: I18n | string };

/** Перенесення уроку між локаціями — лише якщо урок досі в старій локації (ручне перенесення з адмінки не чіпаємо). */
export type LessonMove = { lesson: string; from: string; to: string; order: number };

export const TEXT_FIXES: TextFix[] = [
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
];

export const LESSON_MOVES: LessonMove[] = [
  // «Як тебе звати?» і «Звідки ти?» тепер у першій локації «Перше знайомство».
  { lesson: 'waw-3-imie', from: 'waw-przedstawianie', to: 'waw-powitania', order: 3 },
  { lesson: 'waw-4-skad', from: 'waw-przedstawianie', to: 'waw-powitania', order: 4 },
];

