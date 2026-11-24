/**
 * Тексты карточек бота (docs/superpowers/specs/2026-11-24-engagement-design.md, разделы 3–5) на трёх языках интерфейса.
 * Тон — как у вопроса дня: коротко, по-дружески, без давления; цифры — личные (остаток урока, лучшая серия, слова).
 */
import type { UiLang } from '@polski-go/shared';
import { COMEBACK_GIFT } from '../../services/comeback';

export type EngageCopy = {
  newcomerStart: string;
  newcomerLeft: (left: number) => string;
  newcomerStartBtn: string;
  newcomerLeftBtn: string;
  comeback: (d: { streakBest: number; words: number; city: string | null }) => string;
  comebackBtn: string;
  mission: (title: string, minutes: number) => string;
  missionBtn: string;
  off: string;
  on: string;
  offDone: string;
  onDone: string;
};

const ruForm = (n: number, one: string, few: string, many: string) =>
  n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many;

const RU: EngageCopy = {
  newcomerStart: '🦫 Первый урок — 3 минуты. Бобек ждёт тебя в Варшаве: 8 коротких заданий, и первая победа твоя.',
  newcomerLeft: (n) => `🦫 Ты уже начал первый урок — осталось ${n} ${ruForm(n, 'задание', 'задания', 'заданий')}. Закончишь за пару минут.`,
  newcomerStartBtn: '🚀 Начать урок',
  newcomerLeftBtn: '▶️ Продолжить урок',
  comeback: ({ streakBest, words, city }) =>
    [
      'Давно не виделись! 🦫',
      [
        streakBest > 0 ? `Твоя лучшая серия — ${streakBest} ${ruForm(streakBest, 'день', 'дня', 'дней')}` : null,
        words > 0 ? `выучено слов — ${words}` : null,
        city ? `ты в городе ${city}` : null,
      ]
        .filter(Boolean)
        .join(', ')
        .replace(/^./, (c) => c.toUpperCase()),
      `🎁 За возвращение — ${COMEBACK_GIFT} злотков, ждут в игре.`,
    ]
      .filter((l) => l.length > 0)
      .map((l, i) => (i === 1 && !l.endsWith('.') ? `${l}.` : l))
      .join('\n'),
  comebackBtn: '🎁 Забрать и продолжить',
  mission: (title, minutes) => `🎭 Миссия недели: «${title}». Живой диалог в Польше, ~${minutes} минут — можно проходить частями.`,
  missionBtn: '🎭 Сыграть миссию',
  off: '🔕 Не присылать такие сообщения',
  on: '🔔 Присылать снова',
  offDone: 'Больше не пришлю такие сообщения',
  onDone: 'Снова включено',
};

const UK: EngageCopy = {
  newcomerStart: '🦫 Перший урок — 3 хвилини. Бобек чекає на тебе у Варшаві: 8 коротких завдань, і перша перемога твоя.',
  newcomerLeft: (n) => `🦫 Ти вже почав перший урок — лишилося ${n} ${ruForm(n, 'завдання', 'завдання', 'завдань')}. Закінчиш за пару хвилин.`,
  newcomerStartBtn: '🚀 Почати урок',
  newcomerLeftBtn: '▶️ Продовжити урок',
  comeback: ({ streakBest, words, city }) =>
    [
      'Давно не бачилися! 🦫',
      [
        streakBest > 0 ? `Твоя найкраща серія — ${streakBest} ${ruForm(streakBest, 'день', 'дні', 'днів')}` : null,
        words > 0 ? `вивчено слів — ${words}` : null,
        city ? `ти в місті ${city}` : null,
      ]
        .filter(Boolean)
        .join(', ')
        .replace(/^./, (c) => c.toUpperCase()),
      `🎁 За повернення — ${COMEBACK_GIFT} злотих, чекають у грі.`,
    ]
      .filter((l) => l.length > 0)
      .map((l, i) => (i === 1 && !l.endsWith('.') ? `${l}.` : l))
      .join('\n'),
  comebackBtn: '🎁 Забрати й продовжити',
  mission: (title, minutes) => `🎭 Місія тижня: «${title}». Живий діалог у Польщі, ~${minutes} хвилин — можна проходити частинами.`,
  missionBtn: '🎭 Зіграти місію',
  off: '🔕 Не надсилати такі повідомлення',
  on: '🔔 Надсилати знову',
  offDone: 'Більше не надсилатиму такі повідомлення',
  onDone: 'Знову увімкнено',
};

const EN: EngageCopy = {
  newcomerStart: '🦫 Your first lesson takes 3 minutes. Bobek is waiting for you in Warsaw: 8 short tasks and your first win.',
  newcomerLeft: (n) => `🦫 You've started your first lesson — ${n} ${n === 1 ? 'task' : 'tasks'} left. You'll finish in a couple of minutes.`,
  newcomerStartBtn: '🚀 Start the lesson',
  newcomerLeftBtn: '▶️ Continue the lesson',
  comeback: ({ streakBest, words, city }) =>
    [
      'Long time no see! 🦫',
      [
        streakBest > 0 ? `Your best streak is ${streakBest} ${streakBest === 1 ? 'day' : 'days'}` : null,
        words > 0 ? `${words} words learned` : null,
        city ? `you're in ${city}` : null,
      ]
        .filter(Boolean)
        .join(', ')
        .replace(/^./, (c) => c.toUpperCase()),
      `🎁 Welcome-back gift: ${COMEBACK_GIFT} złotki waiting in the game.`,
    ]
      .filter((l) => l.length > 0)
      .map((l, i) => (i === 1 && !l.endsWith('.') ? `${l}.` : l))
      .join('\n'),
  comebackBtn: '🎁 Claim and continue',
  mission: (title, minutes) => `🎭 Mission of the week: “${title}”. A real conversation in Poland, ~${minutes} minutes — you can play it in parts.`,
  missionBtn: '🎭 Play the mission',
  off: "🔕 Don't send messages like this",
  on: '🔔 Send them again',
  offDone: "I won't send messages like this anymore",
  onDone: 'Turned back on',
};

export const ENGAGE_COPY: Record<UiLang, EngageCopy> = { ru: RU, uk: UK, en: EN };
