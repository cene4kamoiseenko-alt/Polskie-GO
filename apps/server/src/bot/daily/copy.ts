/**
 * Тексты вопроса дня на ru / uk / en. Тон — Бобек, коротко; польские реплики остаются польскими.
 * Итог ответа (верно / нет, твой и правильный ответ, «Пояснение») берётся из QUIZ_COPY — как у /quiz.
 */
import type { UiLang } from '@polski-go/shared';

export type DailyCopy = {
  header: (category: string, cefr: string) => string;
  choose: string;
  streakLine: (days: number) => string;
  returnLine: string;
  percentLine: (pct: number, level: string) => string;
  xp: (n: number) => string;
  noAccount: string;
  dailyStreak: (days: number) => string;
  lesson: string;
  startApp: string;
  more: string;
  off: string;
  on: string;
  offDone: string;
  onDone: string;
  testNote: string;
};

const ruDays = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'день' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'дня' : 'дней');
const ukDays = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'день' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'дні' : 'днів');

const ru: DailyCopy = {
  header: (c, l) => `🧠 Pytanie dnia · ${c} · ${l}`,
  choose: 'Выбери вариант 👇 Время не ограничено — подумай.',
  streakLine: (n) => `🔥 Серия ${n} ${ruDays(n)} — пройди урок сегодня, чтобы её не потерять.`,
  returnLine: '👋 Давно не виделись — вот вопрос на разминку.',
  percentLine: (p, l) => `📊 Сегодня верно ответили ${p} % игроков уровня ${l}.`,
  xp: (n) => `🎁 +${n} XP`,
  noAccount: '🦫 XP начисляются после первого входа в POLSKI GO.',
  dailyStreak: (n) => `🧠 Вопрос дня: ${n} ${ruDays(n)} подряд!`,
  lesson: '📚 Пройти урок · 5 минут',
  startApp: '🚀 Начать учить польский',
  more: '🧠 Ещё вопрос',
  off: '🔕 Не присылать вопрос дня',
  on: '🔔 Присылать вопрос дня',
  offDone: 'Хорошо, вопрос дня больше не пришлю. Вернуть можно здесь же или в настройках приложения.',
  onDone: 'Готово! Вопрос дня будет приходить раз в день.',
  testNote: '🧪 Пробная отправка из админки',
};

const uk: DailyCopy = {
  header: (c, l) => `🧠 Pytanie dnia · ${c} · ${l}`,
  choose: 'Обери варіант 👇 Час не обмежений — подумай.',
  streakLine: (n) => `🔥 Серія ${n} ${ukDays(n)} — пройди урок сьогодні, щоб її не втратити.`,
  returnLine: '👋 Давно не бачилися — ось питання на розминку.',
  percentLine: (p, l) => `📊 Сьогодні правильно відповіли ${p} % гравців рівня ${l}.`,
  xp: (n) => `🎁 +${n} XP`,
  noAccount: '🦫 XP нараховуються після першого входу в POLSKI GO.',
  dailyStreak: (n) => `🧠 Питання дня: ${n} ${ukDays(n)} поспіль!`,
  lesson: '📚 Пройти урок · 5 хвилин',
  startApp: '🚀 Почати вчити польську',
  more: '🧠 Ще питання',
  off: '🔕 Не надсилати питання дня',
  on: '🔔 Надсилати питання дня',
  offDone: 'Добре, питання дня більше не надсилатиму. Повернути можна тут або в налаштуваннях застосунку.',
  onDone: 'Готово! Питання дня приходитиме раз на день.',
  testNote: '🧪 Пробне надсилання з адмінки',
};

const en: DailyCopy = {
  header: (c, l) => `🧠 Pytanie dnia · ${c} · ${l}`,
  choose: 'Pick an answer 👇 No time limit — think it through.',
  streakLine: (n) => `🔥 ${n}-day streak — do a lesson today so you don't lose it.`,
  returnLine: "👋 Long time no see — here's a warm-up question.",
  percentLine: (p, l) => `📊 ${p}% of ${l} players got it right today.`,
  xp: (n) => `🎁 +${n} XP`,
  noAccount: '🦫 XP starts after your first visit to POLSKI GO.',
  dailyStreak: (n) => `🧠 Question of the day: ${n} ${n === 1 ? 'day' : 'days'} in a row!`,
  lesson: '📚 Take a lesson · 5 min',
  startApp: '🚀 Start learning Polish',
  more: '🧠 Another question',
  off: "🔕 Stop the daily question",
  on: '🔔 Send the daily question',
  offDone: "OK, no more daily questions. You can turn them back on here or in the app settings.",
  onDone: "Done! You'll get one question a day.",
  testNote: '🧪 Test send from the admin panel',
};

export const DAILY_COPY: Record<UiLang, DailyCopy> = { ru, uk, en };
