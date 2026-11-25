/**
 * Тексты карточек бота (docs/superpowers/specs/2026-11-24-engagement-design.md, разделы 3–5) на трёх языках интерфейса.
 * Тон — как у вопроса дня: коротко, по-дружески, без давления; цифры — личные (остаток урока, лучшая серия, слова).
 * У каждой карточки по три варианта текста: человек и день выбирают вариант (views.ts, `cardSeed`), чтобы карточки не повторялись.
 */
import type { UiLang } from '@polski-go/shared';

export type ComebackData = { streakBest: number; words: number; city: string | null; gift: number | null };

/** Сколько вариантов текста у каждой карточки (владелец 2026-11-24: «одни и те же карточки»). */
export const COPY_VARIANTS = 3;

export type EngageCopy = {
  /** Варианты: `v` — номер варианта (берётся по модулю). */
  newcomerStart: (v: number) => string;
  newcomerLeft: (left: number, v: number) => string;
  newcomerStartBtn: string;
  /** Нажал «Старт» в боте, в игру не заходил (2026-11-25): позвать открыть игру. */
  start: (v: number) => string;
  startBtn: string;
  newcomerLeftBtn: string;
  comeback: (d: ComebackData, v: number) => string;
  comebackBtn: string;
  /** Кнопка карточки возвращения без подарка (подарок уже брал в последние 30 дней). */
  comebackBtnPlain: string;
  mission: (title: string, minutes: number, v: number) => string;
  missionBtn: string;
  off: string;
  on: string;
  offDone: string;
  onDone: string;
};

const ruForm = (n: number, one: string, few: string, many: string) =>
  n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many;
const enForm = (n: number, one: string, many: string) => (n === 1 ? one : many);

/** Вариант из списка: номер по модулю, без отрицательных и дробных. */
export function variantOf<T>(list: readonly T[], v: number): T {
  return list[Math.abs(Math.trunc(v)) % list.length];
}

/**
 * Карточка возвращения: приветствие, личные цифры (лучшая серия, слова, город) и концовка — с подарком или без.
 * Приветствие и концовка — по варианту; строка с цифрами одна и та же.
 */
function comebackFrom(c: {
  hello: readonly string[];
  facts: (d: ComebackData) => (string | null)[];
  gift: readonly ((gift: number) => string)[];
  plain: readonly string[];
}): EngageCopy['comeback'] {
  return (d, v) => {
    const facts = c.facts(d).filter(Boolean).join(', ').replace(/^./, (ch) => ch.toUpperCase());
    return [variantOf(c.hello, v), facts ? `${facts}.` : '', d.gift ? variantOf(c.gift, v)(d.gift) : variantOf(c.plain, v)].filter((l) => l.length > 0).join('\n');
  };
}

const RU: EngageCopy = {
  newcomerStart: (v) =>
    variantOf(
      [
        '🦫 Первый урок — 3 минуты. Бобек уже ждёт: несколько коротких заданий, и первая победа твоя.',
        '🦫 Cześć! Первое польское слово — уже сегодня. Короткий урок на 3 минуты, Бобек поможет.',
        '🦫 Польский начинается с одного урока. 3 минуты, простые задания — попробуешь?',
      ],
      v,
    ),
  newcomerLeft: (n, v) => {
    const tasks = `${n} ${ruForm(n, 'задание', 'задания', 'заданий')}`;
    return variantOf(
      [
        `🦫 Ты уже начал первый урок — осталось ${tasks}. Закончишь за пару минут.`,
        `🦫 Бобек сохранил твой урок: осталось ${tasks}. Продолжим с того же места?`,
        `🦫 До первой победы — ${tasks}. Пара минут, и урок пройден.`,
      ],
      v,
    );
  },
  newcomerStartBtn: '🚀 Начать урок',
  start: (v) =>
    variantOf(
      [
        '🦫 Cześć! Я Бобек — твой гид по Польше. Ты заглянул в бот, а в игру ещё не заходил. Первый урок — 3 минуты и бесплатно: научишься здороваться и заказывать кофе по-польски.',
        '🦫 Польский по 5 минут в день — это реально. Открой игру: Варшава, первый урок и твой Бобек уже ждут. Бесплатно.',
        '🦫 Ты нажал «Старт», но до игры не дошёл. Давай начнём с одного короткого урока: 3 минуты, простые задания, первые польские слова.',
      ],
      v,
    ),
  startBtn: '🎮 Открыть игру',
  newcomerLeftBtn: '▶️ Продолжить урок',
  comeback: comebackFrom({
    hello: ['Давно не виделись! 🦫', 'Бобек скучал! 🦫', 'Cześć! Бобек на связи 🦫'],
    facts: ({ streakBest, words, city }) => [
      streakBest > 0 ? `твоя лучшая серия — ${streakBest} ${ruForm(streakBest, 'день', 'дня', 'дней')}` : null,
      words > 0 ? `выучено слов — ${words}` : null,
      city ? `ты в городе ${city}` : null,
    ],
    gift: [
      (g) => `🎁 За возвращение — ${g} злотков, ждут в игре.`,
      (g) => `🎁 Тебя ждёт подарок — ${g} злотков за возвращение.`,
      (g) => `🎁 ${g} злотков за возвращение — забери в игре.`,
    ],
    plain: ['Заглянь на пару минут — продолжим с того места, где остановились.', 'Пять минут сегодня — и польский снова в форме.', 'Один короткий урок — и ты снова в ритме.'],
  }),
  comebackBtn: '🎁 Забрать и продолжить',
  comebackBtnPlain: '▶️ Продолжить',
  mission: (title, minutes, v) => {
    const time = `~${minutes} ${ruForm(minutes, 'минута', 'минуты', 'минут')}`;
    return variantOf(
      [
        `🎭 Миссия недели: «${title}». Живой диалог в Польше, ${time} — можно проходить частями.`,
        `🎭 Миссия недели: «${title}». Как в жизни: ты отвечаешь по-польски, собеседник реагирует. ${time}.`,
        `🎭 Миссия недели: «${title}». Бобек уже на месте и ждёт тебя — ${time}, можно с перерывами.`,
      ],
      v,
    );
  },
  missionBtn: '🎭 Сыграть миссию',
  off: '🔕 Не присылать такие сообщения',
  on: '🔔 Присылать снова',
  offDone: 'Больше не пришлю такие сообщения',
  onDone: 'Снова включено',
};

const UK: EngageCopy = {
  newcomerStart: (v) =>
    variantOf(
      [
        '🦫 Перший урок — 3 хвилини. Бобек уже чекає: кілька коротких завдань, і перша перемога твоя.',
        '🦫 Cześć! Перше польське слово — вже сьогодні. Короткий урок на 3 хвилини, Бобек допоможе.',
        '🦫 Польська починається з одного уроку. 3 хвилини, прості завдання — спробуєш?',
      ],
      v,
    ),
  newcomerLeft: (n, v) => {
    const tasks = `${n} ${ruForm(n, 'завдання', 'завдання', 'завдань')}`;
    return variantOf(
      [
        `🦫 Ти вже почав перший урок — лишилося ${tasks}. Закінчиш за пару хвилин.`,
        `🦫 Бобек зберіг твій урок: лишилося ${tasks}. Продовжимо з того самого місця?`,
        `🦫 До першої перемоги — ${tasks}. Пара хвилин, і урок пройдено.`,
      ],
      v,
    );
  },
  newcomerStartBtn: '🚀 Почати урок',
  start: (v) =>
    variantOf(
      [
        '🦫 Cześć! Я Бобек — твій гід Польщею. Ти зазирнув у бот, а в гру ще не заходив. Перший урок — 3 хвилини й безкоштовно: навчишся вітатися й замовляти каву польською.',
        '🦫 Польська по 5 хвилин на день — це реально. Відкрий гру: Варшава, перший урок і твій Бобек уже чекають. Безкоштовно.',
        '🦫 Ти натиснув «Старт», але до гри не дійшов. Почнімо з одного короткого уроку: 3 хвилини, прості завдання, перші польські слова.',
      ],
      v,
    ),
  startBtn: '🎮 Відкрити гру',
  newcomerLeftBtn: '▶️ Продовжити урок',
  comeback: comebackFrom({
    hello: ['Давно не бачилися! 🦫', 'Бобек сумував! 🦫', "Cześć! Бобек на зв'язку 🦫"],
    facts: ({ streakBest, words, city }) => [
      streakBest > 0 ? `твоя найкраща серія — ${streakBest} ${ruForm(streakBest, 'день', 'дні', 'днів')}` : null,
      words > 0 ? `вивчено слів — ${words}` : null,
      city ? `ти в місті ${city}` : null,
    ],
    gift: [
      (g) => `🎁 За повернення — ${g} злотих, чекають у грі.`,
      (g) => `🎁 На тебе чекає подарунок — ${g} злотих за повернення.`,
      (g) => `🎁 ${g} злотих за повернення — забери у грі.`,
    ],
    plain: ['Зазирни на пару хвилин — продовжимо з того місця, де зупинилися.', "П'ять хвилин сьогодні — і польська знову у формі.", 'Один короткий урок — і ти знову в ритмі.'],
  }),
  comebackBtn: '🎁 Забрати й продовжити',
  comebackBtnPlain: '▶️ Продовжити',
  mission: (title, minutes, v) => {
    const time = `~${minutes} ${ruForm(minutes, 'хвилина', 'хвилини', 'хвилин')}`;
    return variantOf(
      [
        `🎭 Місія тижня: «${title}». Живий діалог у Польщі, ${time} — можна проходити частинами.`,
        `🎭 Місія тижня: «${title}». Як у житті: ти відповідаєш польською, співрозмовник реагує. ${time}.`,
        `🎭 Місія тижня: «${title}». Бобек уже на місці й чекає на тебе — ${time}, можна з перервами.`,
      ],
      v,
    );
  },
  missionBtn: '🎭 Зіграти місію',
  off: '🔕 Не надсилати такі повідомлення',
  on: '🔔 Надсилати знову',
  offDone: 'Більше не надсилатиму такі повідомлення',
  onDone: 'Знову увімкнено',
};

const EN: EngageCopy = {
  newcomerStart: (v) =>
    variantOf(
      [
        '🦫 Your first lesson takes 3 minutes. Bobek is waiting: a few short tasks and your first win.',
        '🦫 Cześć! Your first Polish word — today. A short 3-minute lesson, and Bobek will help.',
        '🦫 Polish starts with one lesson. 3 minutes, easy tasks — want to try?',
      ],
      v,
    ),
  newcomerLeft: (n, v) => {
    const tasks = `${n} ${enForm(n, 'task', 'tasks')}`;
    return variantOf(
      [
        `🦫 You've started your first lesson — ${tasks} left. You'll finish in a couple of minutes.`,
        `🦫 Bobek saved your lesson: ${tasks} left. Pick up right where you stopped?`,
        `🦫 ${tasks} to your first win. A couple of minutes and the lesson is done.`,
      ],
      v,
    );
  },
  newcomerStartBtn: '🚀 Start the lesson',
  start: (v) =>
    variantOf(
      [
        "🦫 Cześć! I'm Bobek, your guide to Poland. You looked into the bot but haven't opened the game yet. The first lesson takes 3 minutes and is free: learn to say hello and order coffee in Polish.",
        '🦫 Polish in 5 minutes a day is doable. Open the game: Warsaw, your first lesson and Bobek are waiting. Free.',
        "🦫 You pressed Start but never reached the game. Let's begin with one short lesson: 3 minutes, simple tasks, your first Polish words.",
      ],
      v,
    ),
  startBtn: '🎮 Open the game',
  newcomerLeftBtn: '▶️ Continue the lesson',
  comeback: comebackFrom({
    hello: ['Long time no see! 🦫', 'Bobek missed you! 🦫', 'Cześć! Bobek here 🦫'],
    facts: ({ streakBest, words, city }) => [
      streakBest > 0 ? `your best streak is ${streakBest} ${enForm(streakBest, 'day', 'days')}` : null,
      words > 0 ? `${words} words learned` : null,
      city ? `you're in ${city}` : null,
    ],
    gift: [
      (g) => `🎁 Welcome-back gift: ${g} złotki waiting in the game.`,
      (g) => `🎁 A gift is waiting: ${g} złotki for coming back.`,
      (g) => `🎁 ${g} złotki for coming back — claim them in the game.`,
    ],
    plain: ["Drop by for a couple of minutes — we'll pick up where you left off.", 'Five minutes today and your Polish is back in shape.', "One short lesson and you're back in the rhythm."],
  }),
  comebackBtn: '🎁 Claim and continue',
  comebackBtnPlain: '▶️ Continue',
  mission: (title, minutes, v) => {
    const time = `~${minutes} ${enForm(minutes, 'minute', 'minutes')}`;
    return variantOf(
      [
        `🎭 Mission of the week: “${title}”. A real conversation in Poland, ${time} — you can play it in parts.`,
        `🎭 Mission of the week: “${title}”. Just like real life: you answer in Polish, they react. ${time}.`,
        `🎭 Mission of the week: “${title}”. Bobek is already there and waiting — ${time}, breaks allowed.`,
      ],
      v,
    );
  },
  missionBtn: '🎭 Play the mission',
  off: "🔕 Don't send messages like this",
  on: '🔔 Send them again',
  offDone: "I won't send messages like this anymore",
  onDone: 'Turned back on',
};

export const ENGAGE_COPY: Record<UiLang, EngageCopy> = { ru: RU, uk: UK, en: EN };
