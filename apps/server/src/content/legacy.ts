/**
 * Уроки міст до розширення курсу (версія 3.x). Хто пройшов їх усі, зберігає доступ до іспиту міста,
 * навіть якщо після розширення в місті з'явилися нові уроки: оновлення не закриває вже заслужений іспит.
 * Нові уроки лишаються доступними для проходження; відкриті міста (user_cities) не змінюються.
 */
export const LEGACY_CITY_LESSONS: Record<string, string[]> = {
  warszawa: ['waw-1-czesc', 'waw-2-uprzejmosc', 'waw-3-imie', 'waw-4-skad', 'waw-5-liczby', 'waw-6-wiek'],
  krakow: ['krk-1-rodzina', 'krk-2-mam', 'krk-3-dom', 'krk-4-tydzien', 'krk-5-byc'],
};
