/**
 * Явні правила оновлення вже засіяного контенту (seed без force не перезаписує рядки).
 * Текст змінюється, лише якщо в БД досі старе значення з коду: правки з адмінки не зачіпаємо.
 */
import { t } from './builders';
import type { I18n } from '@polski-go/shared';

export type TextFix = { table: 'city_routes' | 'lessons'; slug: string; column: 'title' | 'description'; from: I18n; to: I18n };

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
];
