/**
 * Уроки міст до розширення курсу. Хто пройшов їх усі ДО розширення (раніше за created_at першого нового
 * уроку міста), зберігає доступ до іспиту: оновлення не закриває вже заслужений іспит. Хто проходить старі
 * уроки після розширення, відкриває іспит звичайним квитком (усі звичайні уроки міста).
 * Нові уроки лишаються доступними для проходження; відкриті міста (user_cities) не змінюються.
 * Розширення Лодзі (тема lodz-praca) — 2026-10.
 */
export const LEGACY_CITY_LESSONS: Record<string, string[]> = {
  warszawa: ['waw-1-czesc', 'waw-2-uprzejmosc', 'waw-3-imie', 'waw-4-skad', 'waw-5-liczby', 'waw-6-wiek'],
  krakow: ['krk-1-rodzina', 'krk-2-mam', 'krk-3-dom', 'krk-4-tydzien', 'krk-5-byc'],
  lodz: ['lodz-1-alfabet', 'lodz-2-dwuznaki', 'lodz-3-zawody', 'lodz-4-oni-one'],
};
