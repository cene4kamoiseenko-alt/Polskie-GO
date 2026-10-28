/**
 * Тексты бота на четырёх языках (ru / uk / pl / en): ответы на команды и учебные напоминания.
 * Интонация — Бобек, игровая и тёплая; польские реплики остаются польскими («Cześć», «Jedziemy», «Do dzieła»).
 * Динамические значения (имя, названия урока и города, задания) экранируются под parse_mode=HTML здесь же.
 * Цифры XP, серий, уровней, заданий и наград приходят только из базы; без данных строка просто не выводится.
 */
import type { BotScreen, UiLang } from '@polski-go/shared';
import { escapeHtml as h, safeName } from './html';

export type LessonRef = { title: string; city: string };
export type ProfileRef = { level: number; xp: number; streak: number; lessons: number };
export type QuestRef = { title: string; progress: number; target: number; xp: number };
export type Vars = {
  name?: string | null;
  /** Следующий доступный урок пользователя (название и город из базы) или null. */
  lesson?: LessonRef | null;
  /** Реальный прогресс; null — пользователя нет или у него ещё нет прогресса. */
  profile?: ProfileRef | null;
  /** Не удалось прочитать прогресс (сбой базы): не выдаём это за «ещё нет прогресса». */
  profileUnavailable?: boolean;
  /** Реально назначенные на сегодня активные задания. */
  quests?: QuestRef[] | null;
};
export type Button = { label: string; screen: BotScreen };
export type Card = { text: string; buttons: Button[] };
export type CardKind = 'start' | 'startBack' | 'lesson' | 'map' | 'words' | 'quests' | 'profile' | 'settings' | 'help' | 'stop';
export type ReminderKind = 'lesson' | 'streak' | 'return';

type LangCopy = {
  [K in CardKind]: (v: Vars) => Card;
} & {
  stopFailed: string;
  profileUnavailable: Card;
  reminder: { lesson: () => Card; streak: (days: number) => Card; return: () => Card };
  stopHint: string;
  /** Оплата Premium у Stars: підтвердження, повернення, /paysupport і /terms (вимоги Telegram до оплат у ботах). */
  premium: { activated: string; refunded: string; paySupport: string; supportReceived: string; supportFailed: string; terms: string };
};

const nm = (v: Vars) => {
  const n = safeName(v.name);
  return n ? `, ${n}` : '';
};
const lines = (...parts: (string | null | undefined | false)[]) => parts.filter((p) => p !== null && p !== undefined && p !== false).join('\n');

/** Склонение слова «день» (серия обучения). */
export function daysWord(lang: UiLang, n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  const few = m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14);
  switch (lang) {
    case 'ru':
      return m10 === 1 && m100 !== 11 ? 'день' : few ? 'дня' : 'дней';
    case 'uk':
      return m10 === 1 && m100 !== 11 ? 'день' : few ? 'дні' : 'днів';
    default:
      return n === 1 ? 'day' : 'days';
  }
}

const questLines = (header: string, quests: QuestRef[] | null | undefined) =>
  quests?.length ? lines('', header, ...quests.map((q) => `• ${h(q.title)} — ${q.progress}/${q.target}${q.xp > 0 ? ` · +${q.xp} XP` : ''}`)) : null;

// ───────────────────────────── Русский ─────────────────────────────

const ru: LangCopy = {
  start: (v) => ({
    text: lines(
      `🇵🇱 Cześć${nm(v)}! 👋`,
      '',
      'Я Бобек! 🦫 Твой друг и проводник по Польше.',
      '',
      'Добро пожаловать в POLSKI GO — здесь изучение польского превращается в настоящее приключение!',
      '',
      '🗺 Путешествуй по городам Польши.',
      '📚 Проходи интересные уроки и диалоги.',
      '🎧 Тренируй произношение и слушай польскую речь.',
      '🏆 Зарабатывай XP, собирай достижения и новые костюмы.',
      '☕ Учись говорить в кафе, магазинах и повседневной жизни.',
      '',
      'Gotowy? No to jedziemy! 🚀',
    ),
    buttons: [
      { label: '🚀 Начать путешествие', screen: 'home' },
      { label: '📚 Мои уроки', screen: 'learn' },
      { label: '🗺 Карта Польши', screen: 'map' },
    ],
  }),
  startBack: (v) => ({
    text: lines(
      `🇵🇱 Witaj z powrotem${nm(v)}! 🦫`,
      '',
      'Бобек рад тебя видеть. Продолжим там, где остановились?',
      v.lesson && `📍 Следующий урок: «${h(v.lesson.title)}» — ${h(v.lesson.city)}`,
    ),
    buttons: [
      { label: '▶️ Продолжить обучение', screen: 'learn' },
      { label: '🗺 Карта Польши', screen: 'map' },
      { label: '🚀 Открыть POLSKI GO', screen: 'home' },
    ],
  }),
  lesson: (v) => ({
    text: lines(
      `📚 Czas na polski${nm(v)}! 🦫`,
      '',
      'Бобек уже раскрыл учебник и приготовил новое приключение!',
      '',
      '✨ Небольшие задания, польские фразы и диалоги.',
      '🎧 Слушай, отвечай и постепенно говори увереннее.',
      '',
      'Даже пять минут сегодня — это шаг вперёд!',
      v.lesson && `📍 Следующий урок: «${h(v.lesson.title)}» — ${h(v.lesson.city)}`,
      '',
      'Jedziemy? 🇵🇱',
    ),
    buttons: [
      { label: '▶️ Продолжить обучение', screen: 'learn' },
      { label: '🗺 Выбрать город', screen: 'map' },
      { label: '📖 Повторить слова', screen: 'dictionary' },
    ],
  }),
  map: () => ({
    text: lines(
      '🗺 Odkrywamy Polskę! 🇵🇱',
      '',
      'Сегодня Бобек зовёт тебя в путешествие! 🚂',
      '',
      'Варшава, Краков, Вроцлав, Гданьск и другие города ждут тебя.',
      '',
      '🌆 Знакомься с городами и реальными польскими традициями.',
      '📚 Проходи уроки, чтобы открывать новые этапы.',
      '🏅 Собирай достижения по дороге.',
      '',
      'Какой город ждёт тебя сегодня? 🦫',
    ),
    buttons: [
      { label: '🗺 Открыть карту', screen: 'map' },
      { label: '📚 Мои уроки', screen: 'learn' },
    ],
  }),
  words: () => ({
    text: lines(
      '📖 Słówko na dziś! 🇵🇱',
      '',
      'Бобек знает: чем больше полезных слов, тем легче общаться с поляками!',
      '',
      '💬 Фразы для магазинов, кафе и работы.',
      '🎧 Произношение и тренировка речи.',
      '🧠 Повторение изученного.',
      '😎 Живые польские выражения и настоящий сленг.',
      '',
      'Не зубри — пользуйся языком! 🦫',
    ),
    buttons: [
      { label: '📖 Открыть словарь', screen: 'dictionary' },
      { label: '😎 Польский сленг', screen: 'slang' },
      { label: '🧩 Грамматика', screen: 'grammar' },
    ],
  }),
  quests: (v) => ({
    text: lines(
      `🎯 Nowa misja${nm(v)}! 🦫`,
      '',
      'У Бобека для тебя новые испытания!',
      '',
      '⚡ Проходи уроки и выполняй ежедневные цели.',
      '🔥 Поддерживай свою серию обучения.',
      '🎁 Получай награды за достижения.',
      questLines('Сегодня в списке:', v.quests),
      '',
      'Один маленький шаг сегодня — большой прогресс завтра!',
      '',
      'Do dzieła! 🇵🇱',
    ),
    buttons: [
      { label: '🎯 Мои задания', screen: 'quests' },
      { label: '🏆 Достижения', screen: 'achievements' },
      { label: '📚 Пойти на урок', screen: 'learn' },
    ],
  }),
  profile: (v) => {
    const p = v.profile;
    return {
      text: p
        ? lines(
            `🏆 Twój postęp${nm(v)}! 🦫`,
            '',
            'Посмотри, как растёт твоё польское приключение!',
            '',
            `⭐ Уровень игрока: ${p.level}`,
            `⚡ Всего XP: ${p.xp}`,
            `🔥 Серия дней: ${p.streak}`,
            `📚 Пройдено уроков: ${p.lessons}`,
            '',
            'Продолжай в том же духе — Бобек в тебя верит! 🇵🇱',
          )
        : lines(
            `🏆 Twój postęp${nm(v)}! 🦫`,
            '',
            'Твои достижения появятся после первых уроков. Бобек уже ждёт на старте!',
            '',
            'Пройди первый урок — и здесь появится твой прогресс. 🇵🇱',
          ),
      buttons: [
        { label: '👤 Мой профиль', screen: 'profile' },
        { label: '🏆 Достижения', screen: 'achievements' },
        { label: p ? '📚 Продолжить обучение' : '📚 Начать первый урок', screen: 'learn' },
      ],
    };
  },
  settings: () => ({
    text: lines(
      '⚙️ Ustawienia POLSKI GO 🦫',
      '',
      'Настрой своё путешествие так, как удобно тебе.',
      '',
      '🌍 Язык интерфейса.',
      '🔔 Время учебных напоминаний.',
      '🔊 Звуки и озвучка.',
      '🎨 Оформление и уменьшение анимаций.',
      '',
      'Твоё приключение — твои правила! 🇵🇱',
    ),
    buttons: [
      { label: '⚙️ Открыть настройки', screen: 'settings' },
      { label: '📚 Вернуться к урокам', screen: 'learn' },
    ],
  }),
  help: () => ({
    text: lines(
      '❓ Jak grać? Бобек объяснит! 🦫',
      '',
      'POLSKI GO — игра, в которой ты путешествуешь по Польше и изучаешь польский.',
      '',
      'Команды:',
      '/start — начало путешествия',
      '/lesson — уроки',
      '/quiz — быстрый вопрос с пояснением',
      '/map — карта Польши',
      '/words — словарь и фразы',
      '/quests — ежедневные задания',
      '/profile — прогресс и награды',
      '/settings — настройки',
      '/stop — отключить напоминания',
      '',
      'Нужен следующий шаг? Нажми на кнопку! 🇵🇱',
    ),
    buttons: [
      { label: '🚀 Открыть POLSKI GO', screen: 'home' },
      { label: '📚 Начать урок', screen: 'learn' },
      { label: '⚙️ Настройки', screen: 'settings' },
    ],
  }),
  stop: () => ({
    text: lines(
      '🔕 Напоминания отключены.',
      '',
      'Бобек больше не будет присылать тебе учебные напоминания, пока ты сам не включишь их снова.',
      '',
      'Но он всё равно ждёт тебя в POLSKI GO! 🦫❤️',
      '',
      'Do zobaczenia! 🇵🇱',
    ),
    buttons: [
      { label: '⚙️ Настроить напоминания', screen: 'settings' },
      { label: '📚 Продолжить обучение', screen: 'learn' },
    ],
  }),
  stopFailed: '⚠️ Не получилось отключить напоминания. Попробуй ещё раз чуть позже или выключи их в настройках приложения. Твой прогресс не пострадал.',
  profileUnavailable: {
    text: '🏆 Не удалось загрузить прогресс. Открой профиль в приложении — там всё на месте. 🦫',
    buttons: [{ label: '👤 Мой профиль', screen: 'profile' }],
  },
  reminder: {
    lesson: () => ({
      text: '🇵🇱 Cześć! Бобек уже приготовил для тебя новый урок! 🦫📚\nНайдёшь пять минут для польского?',
      buttons: [{ label: '📚 Продолжить урок', screen: 'learn' }],
    }),
    streak: (n) => ({
      text: `🔥 Твоя серия обучения — ${n} ${daysWord('ru', n)}!\nБобек предлагает закрепить успех небольшим уроком. 🇵🇱`,
      buttons: [{ label: '🔥 Продолжить серию', screen: 'learn' }],
    }),
    return: () => ({
      text: '🦫 Dawno się nie widzieliśmy! Бобек рад снова тебя видеть.\nЗагляни на короткий урок — путешествие продолжается! ❤️',
      buttons: [{ label: '🚀 Вернуться в игру', screen: 'home' }],
    }),
  },
  stopHint: '🔕 /stop — отключить напоминания',
  premium: {
    activated: '👑 Premium активирован! Dziękujemy! 🦫\nЧто входит и условия — /terms. Вопросы по оплате — /paysupport.',
    refunded: '↩️ Звёзды за Premium возвращены, Premium по этому платежу отключён.',
    paySupport: lines(
      '💬 Поддержка по оплате POLSKI GO',
      'Опишите одним сообщением, что случилось: когда платили, какой тариф и что пошло не так. Мы ответим в этом чате.',
      'Если оплата прошла, а Premium не включился, — вернём звёзды.',
    ),
    supportReceived: '✅ Сообщение передано в поддержку. Ответим здесь, обычно в течение суток.',
    supportFailed: '⚠️ Сейчас не получилось открыть обращение. Попробуйте /paysupport ещё раз через пару минут.',
    terms: lines(
      '📄 Условия POLSKI GO Premium',
      '• Оплата — в Telegram Stars. «1 месяц» — подписка с автопродлением каждые 30 дней; «3 месяца» и «12 месяцев» — разовая оплата без автопродления.',
      '• Автопродление можно отменить в любой момент: в приложении (Premium → «Отменить автопродление») или в Telegram (Настройки → Мои звёзды). Premium действует до конца оплаченного периода.',
      '• Что входит: защита серии (один пропуск в неделю), сцены Premium, вдвое больший лимит XP за тренировки, подарок каждый месяц и эксклюзивные вещи для Бобека.',
      '• Уроки городов, карта, словарь и квесты бесплатны всегда.',
      '• Вопросы и возвраты — /paysupport.',
    ),
  },
};

// ───────────────────────────── Українська ─────────────────────────────

const uk: LangCopy = {
  start: (v) => ({
    text: lines(
      `🇵🇱 Cześć${nm(v)}! 👋`,
      '',
      'Я Бобек! 🦫 Твій друг і провідник Польщею.',
      '',
      'Ласкаво просимо до POLSKI GO — тут вивчення польської перетворюється на справжню пригоду!',
      '',
      '🗺 Мандруй містами Польщі.',
      '📚 Проходь цікаві уроки та діалоги.',
      '🎧 Тренуй вимову й слухай живу польську мову.',
      '🏆 Заробляй XP, збирай досягнення та нові костюми.',
      '☕ Вчись говорити в кафе, крамницях і повсякденному житті.',
      '',
      'Gotowy? No to jedziemy! 🚀',
    ),
    buttons: [
      { label: '🚀 Розпочати подорож', screen: 'home' },
      { label: '📚 Мої уроки', screen: 'learn' },
      { label: '🗺 Карта Польщі', screen: 'map' },
    ],
  }),
  startBack: (v) => ({
    text: lines(
      `🇵🇱 Witaj z powrotem${nm(v)}! 🦫`,
      '',
      'Бобек радий тебе бачити. Продовжимо там, де зупинилися?',
      v.lesson && `📍 Наступний урок: «${h(v.lesson.title)}» — ${h(v.lesson.city)}`,
    ),
    buttons: [
      { label: '▶️ Продовжити навчання', screen: 'learn' },
      { label: '🗺 Карта Польщі', screen: 'map' },
      { label: '🚀 Відкрити POLSKI GO', screen: 'home' },
    ],
  }),
  lesson: (v) => ({
    text: lines(
      `📚 Czas na polski${nm(v)}! 🦫`,
      '',
      'Бобек уже розкрив підручник і приготував нову пригоду!',
      '',
      '✨ Невеликі завдання, польські фрази та діалоги.',
      '🎧 Слухай, відповідай і поступово говори впевненіше.',
      '',
      'Навіть п’ять хвилин сьогодні — це крок уперед!',
      v.lesson && `📍 Наступний урок: «${h(v.lesson.title)}» — ${h(v.lesson.city)}`,
      '',
      'Jedziemy? 🇵🇱',
    ),
    buttons: [
      { label: '▶️ Продовжити навчання', screen: 'learn' },
      { label: '🗺 Обрати місто', screen: 'map' },
      { label: '📖 Повторити слова', screen: 'dictionary' },
    ],
  }),
  map: () => ({
    text: lines(
      '🗺 Odkrywamy Polskę! 🇵🇱',
      '',
      'Сьогодні Бобек кличе тебе в подорож! 🚂',
      '',
      'Варшава, Краків, Вроцлав, Гданськ та інші міста чекають на тебе.',
      '',
      '🌆 Знайомся з містами та справжніми польськими традиціями.',
      '📚 Проходь уроки, щоб відкривати нові етапи.',
      '🏅 Збирай досягнення по дорозі.',
      '',
      'Яке місто чекає на тебе сьогодні? 🦫',
    ),
    buttons: [
      { label: '🗺 Відкрити карту', screen: 'map' },
      { label: '📚 Мої уроки', screen: 'learn' },
    ],
  }),
  words: () => ({
    text: lines(
      '📖 Słówko na dziś! 🇵🇱',
      '',
      'Бобек знає: що більше корисних слів, то легше спілкуватися з поляками!',
      '',
      '💬 Фрази для крамниць, кафе та роботи.',
      '🎧 Вимова й тренування мовлення.',
      '🧠 Повторення вивченого.',
      '😎 Живі польські вирази та справжній сленг.',
      '',
      'Не зубри — користуйся мовою! 🦫',
    ),
    buttons: [
      { label: '📖 Відкрити словник', screen: 'dictionary' },
      { label: '😎 Польський сленг', screen: 'slang' },
      { label: '🧩 Граматика', screen: 'grammar' },
    ],
  }),
  quests: (v) => ({
    text: lines(
      `🎯 Nowa misja${nm(v)}! 🦫`,
      '',
      'У Бобека для тебе нові випробування!',
      '',
      '⚡ Проходь уроки й виконуй щоденні цілі.',
      '🔥 Підтримуй свою серію навчання.',
      '🎁 Отримуй нагороди за досягнення.',
      questLines('Сьогодні в списку:', v.quests),
      '',
      'Один маленький крок сьогодні — великий прогрес завтра!',
      '',
      'Do dzieła! 🇵🇱',
    ),
    buttons: [
      { label: '🎯 Мої завдання', screen: 'quests' },
      { label: '🏆 Досягнення', screen: 'achievements' },
      { label: '📚 Піти на урок', screen: 'learn' },
    ],
  }),
  profile: (v) => {
    const p = v.profile;
    return {
      text: p
        ? lines(
            `🏆 Twój postęp${nm(v)}! 🦫`,
            '',
            'Подивись, як росте твоя польська пригода!',
            '',
            `⭐ Рівень гравця: ${p.level}`,
            `⚡ Усього XP: ${p.xp}`,
            `🔥 Серія днів: ${p.streak}`,
            `📚 Пройдено уроків: ${p.lessons}`,
            '',
            'Так тримати — Бобек у тебе вірить! 🇵🇱',
          )
        : lines(
            `🏆 Twój postęp${nm(v)}! 🦫`,
            '',
            'Твої досягнення з’являться після перших уроків. Бобек уже чекає на старті!',
            '',
            'Пройди перший урок — і тут з’явиться твій прогрес. 🇵🇱',
          ),
      buttons: [
        { label: '👤 Мій профіль', screen: 'profile' },
        { label: '🏆 Досягнення', screen: 'achievements' },
        { label: p ? '📚 Продовжити навчання' : '📚 Почати перший урок', screen: 'learn' },
      ],
    };
  },
  settings: () => ({
    text: lines(
      '⚙️ Ustawienia POLSKI GO 🦫',
      '',
      'Налаштуй свою подорож так, як зручно тобі.',
      '',
      '🌍 Мова інтерфейсу.',
      '🔔 Час навчальних нагадувань.',
      '🔊 Звуки й озвучення.',
      '🎨 Оформлення та зменшення анімацій.',
      '',
      'Твоя пригода — твої правила! 🇵🇱',
    ),
    buttons: [
      { label: '⚙️ Відкрити налаштування', screen: 'settings' },
      { label: '📚 Повернутися до уроків', screen: 'learn' },
    ],
  }),
  help: () => ({
    text: lines(
      '❓ Jak grać? Бобек пояснить! 🦫',
      '',
      'POLSKI GO — гра, у якій ти мандруєш Польщею та вивчаєш польську.',
      '',
      'Команди:',
      '/start — початок подорожі',
      '/lesson — уроки',
      '/quiz — швидке питання з поясненням',
      '/map — карта Польщі',
      '/words — словник і фрази',
      '/quests — щоденні завдання',
      '/profile — прогрес і нагороди',
      '/settings — налаштування',
      '/stop — вимкнути нагадування',
      '',
      'Потрібен наступний крок? Натисни на кнопку! 🇵🇱',
    ),
    buttons: [
      { label: '🚀 Відкрити POLSKI GO', screen: 'home' },
      { label: '📚 Почати урок', screen: 'learn' },
      { label: '⚙️ Налаштування', screen: 'settings' },
    ],
  }),
  stop: () => ({
    text: lines(
      '🔕 Нагадування вимкнено.',
      '',
      'Бобек більше не надсилатиме тобі навчальних нагадувань, доки ти сам їх знову не ввімкнеш.',
      '',
      'Але він усе одно чекає на тебе в POLSKI GO! 🦫❤️',
      '',
      'Do zobaczenia! 🇵🇱',
    ),
    buttons: [
      { label: '⚙️ Налаштувати нагадування', screen: 'settings' },
      { label: '📚 Продовжити навчання', screen: 'learn' },
    ],
  }),
  stopFailed: '⚠️ Не вдалося вимкнути нагадування. Спробуй ще раз трохи згодом або вимкни їх у налаштуваннях застосунку. Твій прогрес не постраждав.',
  profileUnavailable: {
    text: '🏆 Не вдалося завантажити прогрес. Відкрий профіль у застосунку — там усе на місці. 🦫',
    buttons: [{ label: '👤 Мій профіль', screen: 'profile' }],
  },
  reminder: {
    lesson: () => ({
      text: '🇵🇱 Cześć! Бобек уже приготував для тебе новий урок! 🦫📚\nЗнайдеш п’ять хвилин для польської?',
      buttons: [{ label: '📚 Продовжити урок', screen: 'learn' }],
    }),
    streak: (n) => ({
      text: `🔥 Твоя серія навчання — ${n} ${daysWord('uk', n)}!\nБобек пропонує закріпити успіх невеликим уроком. 🇵🇱`,
      buttons: [{ label: '🔥 Продовжити серію', screen: 'learn' }],
    }),
    return: () => ({
      text: '🦫 Dawno się nie widzieliśmy! Бобек радий знову тебе бачити.\nЗазирни на короткий урок — подорож триває! ❤️',
      buttons: [{ label: '🚀 Повернутися до гри', screen: 'home' }],
    }),
  },
  stopHint: '🔕 /stop — вимкнути нагадування',
  premium: {
    activated: '👑 Premium активовано! Dziękujemy! 🦫\nЩо входить і умови — /terms. Питання щодо оплати — /paysupport.',
    refunded: '↩️ Зірки за Premium повернуто, Premium за цим платежем вимкнено.',
    paySupport: lines(
      '💬 Підтримка з оплати POLSKI GO',
      'Опишіть одним повідомленням, що сталося: коли платили, який тариф і що пішло не так. Ми відповімо в цьому чаті.',
      'Якщо оплата пройшла, а Premium не ввімкнувся, — повернемо зірки.',
    ),
    supportReceived: '✅ Повідомлення передано в підтримку. Відповімо тут, зазвичай протягом доби.',
    supportFailed: '⚠️ Зараз не вдалося відкрити звернення. Спробуйте /paysupport ще раз за кілька хвилин.',
    terms: lines(
      '📄 Умови POLSKI GO Premium',
      '• Оплата — у Telegram Stars. «1 місяць» — підписка з автопродовженням кожні 30 днів; «3 місяці» і «12 місяців» — разова оплата без автопродовження.',
      '• Автопродовження можна скасувати будь-коли: у застосунку (Premium → «Скасувати автопродовження») або в Telegram (Налаштування → Мої зірки). Premium діє до кінця оплаченого періоду.',
      '• Що входить: захист серії (один пропуск на тиждень), сцени Premium, удвічі більший ліміт XP за тренування, подарунок щомісяця й ексклюзивні речі для Бобека.',
      '• Уроки міст, карта, словник і квести безкоштовні завжди.',
      '• Питання й повернення — /paysupport.',
    ),
  },
};

// ───────────────────────────── English ─────────────────────────────

const en: LangCopy = {
  start: (v) => ({
    text: lines(
      `🇵🇱 Cześć${nm(v)}! 👋`,
      '',
      'I’m Bobek! 🦫 Your friend and guide around Poland.',
      '',
      'Welcome to POLSKI GO — here learning Polish turns into a real adventure!',
      '',
      '🗺 Travel across Polish cities.',
      '📚 Take fun lessons and dialogues.',
      '🎧 Practise your pronunciation and listen to real Polish.',
      '🏆 Earn XP, collect achievements and new outfits.',
      '☕ Learn to speak in cafés, shops and everyday life.',
      '',
      'Gotowy? No to jedziemy! 🚀',
    ),
    buttons: [
      { label: '🚀 Start the journey', screen: 'home' },
      { label: '📚 My lessons', screen: 'learn' },
      { label: '🗺 Map of Poland', screen: 'map' },
    ],
  }),
  startBack: (v) => ({
    text: lines(
      `🇵🇱 Witaj z powrotem${nm(v)}! 🦫`,
      '',
      'Bobek is happy to see you. Shall we pick up where we left off?',
      v.lesson && `📍 Next lesson: “${h(v.lesson.title)}” — ${h(v.lesson.city)}`,
    ),
    buttons: [
      { label: '▶️ Continue learning', screen: 'learn' },
      { label: '🗺 Map of Poland', screen: 'map' },
      { label: '🚀 Open POLSKI GO', screen: 'home' },
    ],
  }),
  lesson: (v) => ({
    text: lines(
      `📚 Czas na polski${nm(v)}! 🦫`,
      '',
      'Bobek has already opened the textbook and prepared a new adventure!',
      '',
      '✨ Short tasks, Polish phrases and dialogues.',
      '🎧 Listen, answer and gradually speak with more confidence.',
      '',
      'Even five minutes today is a step forward!',
      v.lesson && `📍 Next lesson: “${h(v.lesson.title)}” — ${h(v.lesson.city)}`,
      '',
      'Jedziemy? 🇵🇱',
    ),
    buttons: [
      { label: '▶️ Continue learning', screen: 'learn' },
      { label: '🗺 Choose a city', screen: 'map' },
      { label: '📖 Review words', screen: 'dictionary' },
    ],
  }),
  map: () => ({
    text: lines(
      '🗺 Odkrywamy Polskę! 🇵🇱',
      '',
      'Today Bobek invites you on a journey! 🚂',
      '',
      'Warsaw, Kraków, Wrocław, Gdańsk and other cities are waiting for you.',
      '',
      '🌆 Discover cities and real Polish traditions.',
      '📚 Complete lessons to unlock new stages.',
      '🏅 Collect achievements along the way.',
      '',
      'Which city is waiting for you today? 🦫',
    ),
    buttons: [
      { label: '🗺 Open the map', screen: 'map' },
      { label: '📚 My lessons', screen: 'learn' },
    ],
  }),
  words: () => ({
    text: lines(
      '📖 Słówko na dziś! 🇵🇱',
      '',
      'Bobek knows: the more useful words you have, the easier it is to talk with Poles!',
      '',
      '💬 Phrases for shops, cafés and work.',
      '🎧 Pronunciation and speaking practice.',
      '🧠 Review of what you’ve learned.',
      '😎 Real Polish colloquial expressions and slang.',
      '',
      'Don’t cram — use the language! 🦫',
    ),
    buttons: [
      { label: '📖 Open the dictionary', screen: 'dictionary' },
      { label: '😎 Polish slang', screen: 'slang' },
      { label: '🧩 Grammar', screen: 'grammar' },
    ],
  }),
  quests: (v) => ({
    text: lines(
      `🎯 Nowa misja${nm(v)}! 🦫`,
      '',
      'Bobek has new challenges for you!',
      '',
      '⚡ Complete lessons and daily goals.',
      '🔥 Keep your learning streak going.',
      '🎁 Earn rewards for achievements.',
      questLines('On today’s list:', v.quests),
      '',
      'One small step today is big progress tomorrow!',
      '',
      'Do dzieła! 🇵🇱',
    ),
    buttons: [
      { label: '🎯 My tasks', screen: 'quests' },
      { label: '🏆 Achievements', screen: 'achievements' },
      { label: '📚 Go to a lesson', screen: 'learn' },
    ],
  }),
  profile: (v) => {
    const p = v.profile;
    return {
      text: p
        ? lines(
            `🏆 Twój postęp${nm(v)}! 🦫`,
            '',
            'See how your Polish adventure is growing!',
            '',
            `⭐ Player level: ${p.level}`,
            `⚡ Total XP: ${p.xp}`,
            `🔥 Day streak: ${p.streak}`,
            `📚 Lessons completed: ${p.lessons}`,
            '',
            'Keep it up — Bobek believes in you! 🇵🇱',
          )
        : lines(
            `🏆 Twój postęp${nm(v)}! 🦫`,
            '',
            'Your achievements will appear after your first lessons. Bobek is already waiting at the start!',
            '',
            'Finish your first lesson and your progress will show up here. 🇵🇱',
          ),
      buttons: [
        { label: '👤 My profile', screen: 'profile' },
        { label: '🏆 Achievements', screen: 'achievements' },
        { label: p ? '📚 Continue learning' : '📚 Start the first lesson', screen: 'learn' },
      ],
    };
  },
  settings: () => ({
    text: lines(
      '⚙️ Ustawienia POLSKI GO 🦫',
      '',
      'Set up your journey the way that suits you.',
      '',
      '🌍 Interface language.',
      '🔔 Lesson reminder time.',
      '🔊 Sounds and voice.',
      '🎨 Appearance and reduced motion.',
      '',
      'Your adventure — your rules! 🇵🇱',
    ),
    buttons: [
      { label: '⚙️ Open settings', screen: 'settings' },
      { label: '📚 Back to lessons', screen: 'learn' },
    ],
  }),
  help: () => ({
    text: lines(
      '❓ Jak grać? Bobek will explain! 🦫',
      '',
      'POLSKI GO is a game where you learn Polish while travelling around Poland.',
      '',
      'Commands:',
      '/start — begin the journey',
      '/lesson — lessons',
      '/quiz — a quick question with an explanation',
      '/map — map of Poland',
      '/words — dictionary and phrases',
      '/quests — daily tasks',
      '/profile — progress and rewards',
      '/settings — settings',
      '/stop — turn off reminders',
      '',
      'Need the next step? Tap a button! 🇵🇱',
    ),
    buttons: [
      { label: '🚀 Open POLSKI GO', screen: 'home' },
      { label: '📚 Start a lesson', screen: 'learn' },
      { label: '⚙️ Settings', screen: 'settings' },
    ],
  }),
  stop: () => ({
    text: lines(
      '🔕 Reminders turned off.',
      '',
      'Bobek won’t send you learning reminders until you turn them back on.',
      '',
      'But he’s still waiting for you in POLSKI GO! 🦫❤️',
      '',
      'Do zobaczenia! 🇵🇱',
    ),
    buttons: [
      { label: '⚙️ Set up reminders', screen: 'settings' },
      { label: '📚 Continue learning', screen: 'learn' },
    ],
  }),
  stopFailed: '⚠️ Couldn’t turn the reminders off. Please try again in a moment or switch them off in the app settings. Your progress is safe.',
  profileUnavailable: {
    text: '🏆 Couldn’t load your progress. Open your profile in the app — everything is there. 🦫',
    buttons: [{ label: '👤 My profile', screen: 'profile' }],
  },
  reminder: {
    lesson: () => ({
      text: '🇵🇱 Cześć! Bobek has a new lesson ready for you! 🦫📚\nGot five minutes for Polish?',
      buttons: [{ label: '📚 Continue lesson', screen: 'learn' }],
    }),
    streak: (n) => ({
      text: `🔥 Your learning streak is ${n} ${daysWord('en', n)}!\nBobek suggests locking it in with a quick lesson. 🇵🇱`,
      buttons: [{ label: '🔥 Keep the streak going', screen: 'learn' }],
    }),
    return: () => ({
      text: '🦫 Dawno się nie widzieliśmy! Bobek is happy to see you again.\nDrop in for a short lesson — the journey goes on! ❤️',
      buttons: [{ label: '🚀 Back to the game', screen: 'home' }],
    }),
  },
  stopHint: '🔕 /stop — turn off reminders',
  premium: {
    activated: '👑 Premium is on! Dziękujemy! 🦫\nWhat’s included and the terms: /terms. Payment questions: /paysupport.',
    refunded: '↩️ Your Stars for Premium were refunded; Premium from that payment is off.',
    paySupport: lines(
      '💬 POLSKI GO payment support',
      'Describe what happened in one message: when you paid, which plan and what went wrong. We’ll reply in this chat.',
      'If you paid and Premium didn’t turn on, we’ll refund your Stars.',
    ),
    supportReceived: '✅ Your message was sent to support. We’ll reply here, usually within a day.',
    supportFailed: '⚠️ Couldn’t open a request right now. Please try /paysupport again in a few minutes.',
    terms: lines(
      '📄 POLSKI GO Premium terms',
      '• Payment is in Telegram Stars. “1 month” is a subscription renewed every 30 days; “3 months” and “12 months” are one-off payments without renewal.',
      '• You can cancel auto-renewal any time: in the app (Premium → “Cancel auto-renewal”) or in Telegram (Settings → My Stars). Premium stays active until the end of the paid period.',
      '• Included: streak shield (one missed day a week), Premium scenes, double daily XP limit for practice, a monthly gift and exclusive items for Bobek.',
      '• City lessons, the map, the dictionary and quests are always free.',
      '• Questions and refunds: /paysupport.',
    ),
  },
};

export const COPY: Record<UiLang, LangCopy> = { ru, uk, en };

/** Заголовок карточки — первая строка текста (подпись к фото, если весь текст не помещается в 1024 знака). */
export function headlineOf(text: string): string {
  return text.split('\n')[0];
}
