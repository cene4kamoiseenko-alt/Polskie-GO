/**
 * Тексты быстрых вопросов (/quiz) на ru / uk / pl / en. Тон — Бобек, коротко; польские реплики остаются польскими.
 * Числа (XP, сколько ответов сегодня ещё дадут XP) приходят только из сервера.
 */
import type { UiLang } from '@polski-go/shared';

export type QuizCopy = {
  intro: string;
  start: string;
  header: (category: string, cefr: string) => string;
  choose: (seconds: number) => string;
  correct: string;
  wrong: string;
  late: string;
  rightAnswer: (letter: string, text: string) => string;
  yourAnswer: (letter: string, text: string) => string;
  explainTitle: string;
  xp: (n: number) => string;
  noAccount: string;
  /** Сколько верных ответов сегодня ещё дадут XP. */
  rewardsLeft: (n: number) => string;
  /** XP за сегодня получены, тренироваться можно дальше. */
  rewardsDone: string;
  nextNow: string;
  tomorrow: string;
  openLesson: string;
  openApp: string;
  pushOff: string;
  pushOn: string;
  pushOffDone: string;
  pushOnDone: string;
  /** Дневной потолок вопросов (защита от спама). */
  cap: (n: number) => string;
  already: string;
  expired: string;
  notYours: string;
  group: string;
  stopHint: string;
  toastCorrect: (xp: number) => string;
  toastWrong: string;
  toastLate: string;
};

const join = (...parts: (string | false | null | undefined)[]) => parts.filter((p) => p !== false && p !== null && p !== undefined).join('\n');

const ru: QuizCopy = {
  intro: join(
    '🦫 Szybki quiz — 1 pytanie!',
    'Проверим твой польский?',
    '',
    'Один короткий вопрос, который поможет увереннее говорить в реальных ситуациях.',
    '',
    '⏰ Всего 20 секунд',
    '⭐ Сразу объясню ответ',
    '🎁 Маленький бонус за верный ответ',
    '',
    'No to zaczynamy! 🇵🇱',
  ),
  start: '🚀 Начать викторину',
  header: (category, cefr) => `🧠 Szybki quiz · ${category} · ${cefr}`,
  choose: (s) => `Выбери правильный вариант — у тебя ${s} секунд ⏱`,
  correct: '✅ Dobrze! Правильно!',
  wrong: '❌ Не совсем.',
  late: '⏰ Время вышло — XP за этот вопрос не начисляются, но разберём ответ.',
  rightAnswer: (l, t) => `Правильный ответ: ${l} — ${t}`,
  yourAnswer: (l, t) => `Твой ответ: ${l} — ${t}`,
  explainTitle: '💡 Пояснение:',
  xp: (n) => `🎁 +${n} XP`,
  noAccount: '🦫 XP за ответы начисляются после первого входа в POLSKI GO.',
  rewardsLeft: (n) => `🎯 Сегодня XP дадут ещё ${n} ${n === 1 ? 'верный ответ' : 'верных ответа'}.`,
  rewardsDone: '🏁 Бонусы XP на сегодня получены — тренироваться можно дальше, уже без XP.',
  nextNow: '⏭ Следующий вопрос',
  tomorrow: '🌙 Новые вопросы завтра',
  openLesson: '📚 Открыть урок по теме',
  openApp: '🚀 Открыть POLSKI GO',
  pushOff: '🔕 Не присылать вопросы',
  pushOn: '🔔 Присылать вопросы',
  pushOffDone: 'Хорошо, больше не буду присылать вопросы. Спросить можно в любой момент: /quiz',
  pushOnDone: 'Готово! Иногда буду присылать короткий вопрос (не чаще раза в день).',
  cap: (n) => join(`🌙 На сегодня хватит: ${n} вопросов за день — отличная тренировка!`, 'Продолжим завтра. А пока можно пройти урок! 🦫'),
  already: 'Ответ уже засчитан 👍',
  expired: 'Этот вопрос устарел. Новый — по команде /quiz',
  notYours: 'Этот вопрос для другого игрока 🙂',
  group: 'Быстрые вопросы работают в личном чате с ботом 🦫',
  stopHint: '🔕 Отключить напоминания: /stop',
  toastCorrect: (xp) => (xp > 0 ? `Dobrze! +${xp} XP` : 'Dobrze! Правильно!'),
  toastWrong: 'Не совсем — смотри пояснение',
  toastLate: 'Время вышло — смотри пояснение',
};

const uk: QuizCopy = {
  intro: join(
    '🦫 Szybki quiz — 1 pytanie!',
    'Перевіримо твою польську?',
    '',
    'Одне коротке питання, яке допоможе впевненіше говорити в реальних ситуаціях.',
    '',
    '⏰ Лише 20 секунд',
    '⭐ Одразу поясню відповідь',
    '🎁 Маленький бонус за правильну відповідь',
    '',
    'No to zaczynamy! 🇵🇱',
  ),
  start: '🚀 Почати вікторину',
  header: (category, cefr) => `🧠 Szybki quiz · ${category} · ${cefr}`,
  choose: (s) => `Обери правильний варіант — у тебе ${s} секунд ⏱`,
  correct: '✅ Dobrze! Правильно!',
  wrong: '❌ Не зовсім.',
  late: '⏰ Час вийшов — XP за це питання не нараховуються, але розберемо відповідь.',
  rightAnswer: (l, t) => `Правильна відповідь: ${l} — ${t}`,
  yourAnswer: (l, t) => `Твоя відповідь: ${l} — ${t}`,
  explainTitle: '💡 Пояснення:',
  xp: (n) => `🎁 +${n} XP`,
  noAccount: '🦫 XP за відповіді нараховуються після першого входу в POLSKI GO.',
  rewardsLeft: (n) => `🎯 Сьогодні XP дадуть ще ${n} ${n === 1 ? 'правильна відповідь' : 'правильні відповіді'}.`,
  rewardsDone: '🏁 Бонуси XP на сьогодні отримано — тренуватися можна далі, уже без XP.',
  nextNow: '⏭ Наступне питання',
  tomorrow: '🌙 Нові питання завтра',
  openLesson: '📚 Відкрити урок за темою',
  openApp: '🚀 Відкрити POLSKI GO',
  pushOff: '🔕 Не надсилати питання',
  pushOn: '🔔 Надсилати питання',
  pushOffDone: 'Добре, більше не надсилатиму питань. Запитати можна будь-коли: /quiz',
  pushOnDone: 'Готово! Іноді надсилатиму коротке питання (не частіше разу на день).',
  cap: (n) => join(`🌙 На сьогодні досить: ${n} питань за день — чудове тренування!`, 'Продовжимо завтра. А поки можна пройти урок! 🦫'),
  already: 'Відповідь уже зараховано 👍',
  expired: 'Це питання застаріло. Нове — командою /quiz',
  notYours: 'Це питання для іншого гравця 🙂',
  group: 'Швидкі питання працюють в особистому чаті з ботом 🦫',
  stopHint: '🔕 Вимкнути нагадування: /stop',
  toastCorrect: (xp) => (xp > 0 ? `Dobrze! +${xp} XP` : 'Dobrze! Правильно!'),
  toastWrong: 'Не зовсім — дивись пояснення',
  toastLate: 'Час вийшов — дивись пояснення',
};

const en: QuizCopy = {
  intro: join(
    '🦫 Szybki quiz — 1 pytanie!',
    'Shall we check your Polish?',
    '',
    'One short question to help you speak more confidently in real situations.',
    '',
    '⏰ Just 20 seconds',
    "⭐ I'll explain the answer right away",
    '🎁 A small bonus for a correct answer',
    '',
    'No to zaczynamy! 🇵🇱',
  ),
  start: '🚀 Start the quiz',
  header: (category, cefr) => `🧠 Szybki quiz · ${category} · ${cefr}`,
  choose: (s) => `Pick the right answer — you have ${s} seconds ⏱`,
  correct: '✅ Dobrze! Correct!',
  wrong: '❌ Not quite.',
  late: "⏰ Time's up — no XP for this one, but here's the explanation.",
  rightAnswer: (l, t) => `Correct answer: ${l} — ${t}`,
  yourAnswer: (l, t) => `Your answer: ${l} — ${t}`,
  explainTitle: '💡 Why:',
  xp: (n) => `🎁 +${n} XP`,
  noAccount: '🦫 XP for answers starts after your first visit to POLSKI GO.',
  rewardsLeft: (n) => `🎯 ${n} more correct ${n === 1 ? 'answer' : 'answers'} will earn XP today.`,
  rewardsDone: "🏁 Today's XP bonuses are collected — keep practising, just without XP.",
  nextNow: '⏭ Next question',
  tomorrow: '🌙 New questions tomorrow',
  openLesson: '📚 Open a lesson',
  openApp: '🚀 Open POLSKI GO',
  pushOff: "🔕 Don't send questions",
  pushOn: '🔔 Send me questions',
  pushOffDone: "OK, I won't send questions any more. Ask any time: /quiz",
  pushOnDone: "Done! I'll sometimes send a short question (at most once a day).",
  cap: (n) => join(`🌙 That's enough for today: ${n} questions — great practice!`, "Let's continue tomorrow. Meanwhile, how about a lesson? 🦫"),
  already: 'Answer already counted 👍',
  expired: 'This question has expired. Get a new one: /quiz',
  notYours: 'This question is for another player 🙂',
  group: 'Quick questions work in a private chat with the bot 🦫',
  stopHint: '🔕 Turn off reminders: /stop',
  toastCorrect: (xp) => (xp > 0 ? `Dobrze! +${xp} XP` : 'Dobrze! Correct!'),
  toastWrong: 'Not quite — see the explanation',
  toastLate: "Time's up — see the explanation",
};

export const QUIZ_COPY: Record<UiLang, QuizCopy> = { ru, uk, en };
