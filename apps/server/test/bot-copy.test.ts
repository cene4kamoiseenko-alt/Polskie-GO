/**
 * Каталог бота без базы и сети: девять команд × четыре языка, экранирование HTML, лимит подписи,
 * соответствие кнопок белому списку экранов, файлы картинок, список команд для BotFather.
 */
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { BOT_SCREENS, UI_LANGS, type UiLang } from '@polski-go/shared';
import { COMMANDS, COMMAND_IMAGES, COMMAND_LANDING, COMMAND_MENU, MENU, REMINDER_IMAGES, RU_COMMAND_IMAGES, RU_START_BACK_IMAGE, commandImage, reminderImage, startBackImage } from '../src/bot/catalog';
import { COPY, daysWord, headlineOf, type Vars } from '../src/bot/copy';
import { escapeHtml, safeName } from '../src/bot/html';
import { pickLang } from '../src/bot/data';
import { parseCommand } from '../src/bot/handler';
import { CAPTION_LIMIT, splitCaption } from '../src/bot/send';
import { buildCalls, DESCRIPTION, LOCALIZED, normalizeUrl } from '../scripts/setup-bot.mjs';
import { normalizeWebAppUrl } from '../src/env';

const IMAGES = new URL('../../web/public/bot/commands/', import.meta.url);
const BOT_PUBLIC = new URL('../../web/public/bot/', import.meta.url);

const FULL: Vars = {
  name: 'A'.repeat(64),
  lesson: { title: 'L'.repeat(80), city: 'C'.repeat(40) },
  profile: { level: 12, xp: 123456, streak: 99, lessons: 345 },
  quests: [1, 2, 3].map((i) => ({ title: `Quest ${i} `.repeat(4), progress: i, target: 5, xp: 30 })),
};

describe('копирайт бота', () => {
  it('есть все девять команд, у каждой четыре языка, кнопки ведут на экраны белого списка', () => {
    for (const lang of UI_LANGS) {
      for (const command of COMMANDS) {
        const card = COPY[lang][command](FULL);
        expect(card.text.length, `${lang}/${command}`).toBeGreaterThan(40);
        expect(card.buttons.length, `${lang}/${command} buttons`).toBeGreaterThanOrEqual(2);
        for (const b of card.buttons) {
          expect(b.label.length).toBeGreaterThan(3);
          expect(b.label.length).toBeLessThanOrEqual(40);
          expect(Object.keys(BOT_SCREENS)).toContain(b.screen);
        }
        // Главная кнопка ведёт на экран команды (как в манифесте комплекта).
        expect(card.buttons[0].screen, `${lang}/${command} landing`).toBe(COMMAND_LANDING[command]);
      }
    }
  });

  it('подпись к фото ≤ 1024 знаков даже с самыми длинными данными', () => {
    for (const lang of UI_LANGS) {
      for (const command of COMMANDS) {
        expect(COPY[lang][command](FULL).text.length, `${lang}/${command}`).toBeLessThanOrEqual(CAPTION_LIMIT);
      }
      expect(COPY[lang].startBack(FULL).text.length).toBeLessThanOrEqual(CAPTION_LIMIT);
    }
  });

  it('язык не смешивается: русская кириллица только в ru, украинские буквы только в uk, у en нет кириллицы', () => {
    const body = (lang: UiLang) => COMMANDS.map((c) => COPY[lang][c](FULL).text + COPY[lang][c](FULL).buttons.map((b) => b.label).join(' ')).join('\n');
    expect(body('en')).not.toMatch(/[А-Яа-яЁёІіЇїЄє]/);
    expect(body('ru')).not.toMatch(/[іїєґ]/i);
    expect(body('uk')).not.toMatch(/[ёъыэ]/i);
  });

  it('имя и названия экранируются под parse_mode=HTML', () => {
    const evil: Vars = { name: '<b>Ann</b> & "x"', lesson: { title: '<i>t</i>', city: 'A&B' }, quests: [{ title: '<u>q</u>', progress: 1, target: 2, xp: 5 }] };
    for (const lang of UI_LANGS) {
      for (const text of [COPY[lang].start(evil).text, COPY[lang].lesson(evil).text, COPY[lang].quests(evil).text, COPY[lang].startBack(evil).text]) {
        expect(text).not.toMatch(/<\/?[biu]>/);
        expect(text).not.toMatch(/&(?!amp;|lt;|gt;)/);
      }
      expect(COPY[lang].start(evil).text).toContain('&lt;b&gt;Ann&lt;/b&gt; &amp; "x"');
    }
    expect(escapeHtml('<a href="x">&</a>')).toBe('&lt;a href="x"&gt;&amp;&lt;/a&gt;');
    expect(safeName('  Ann‮\n  Lee  ')).toBe('Ann Lee');
    expect(Array.from(safeName('я'.repeat(200))).length).toBe(64);
  });

  it('без имени приветствие не ломается: «Cześć!» без запятой и пустого имени', () => {
    for (const lang of UI_LANGS) {
      expect(COPY[lang].start({ name: '' }).text).toMatch(/^🇵🇱 Cześć! 👋/);
      expect(COPY[lang].lesson({ name: null }).text).toMatch(/^📚 Czas na polski! 🦫/);
    }
  });

  it('прогресс — только настоящие значения; без данных нет цифр и нет «0»', () => {
    for (const lang of UI_LANGS) {
      const real = COPY[lang].profile({ name: 'Ola', profile: { level: 3, xp: 250, streak: 4, lessons: 7 } }).text;
      for (const n of ['3', '250', '4', '7']) expect(real).toContain(n);
      const none = COPY[lang].profile({ name: 'Ola', profile: null }).text;
      expect(none).not.toMatch(/⭐|⚡|🔥|XP/);
      expect(none).not.toMatch(/\b0\b/);
      // Сбой чтения прогресса не выдаётся за «ещё нет прогресса».
      expect(COPY[lang].profileUnavailable.text).not.toContain(none.split('\n')[2]);
    }
  });

  it('задания и награды выводятся только из переданных данных', () => {
    for (const lang of UI_LANGS) {
      expect(COPY[lang].quests({ name: 'Ola' }).text).not.toMatch(/XP|•/);
      expect(COPY[lang].quests({ name: 'Ola', quests: [] }).text).not.toMatch(/XP|•/);
      const withData = COPY[lang].quests({ name: 'Ola', quests: [{ title: 'Two lessons', progress: 1, target: 2, xp: 30 }] }).text;
      expect(withData).toContain('• Two lessons — 1/2 · +30 XP');
    }
  });

  it('напоминания: три сценария, три языка, склонение «дней», подсказка /stop', () => {
    expect([1, 2, 5, 11, 21, 22, 25].map((n) => daysWord('ru', n))).toEqual(['день', 'дня', 'дней', 'дней', 'день', 'дня', 'дней']);
    expect([1, 2, 5, 11, 21].map((n) => daysWord('uk', n))).toEqual(['день', 'дні', 'днів', 'днів', 'день']);
    expect([1, 2].map((n) => daysWord('en', n))).toEqual(['day', 'days']);
    expect(COPY.ru.reminder.streak(3).text).toContain('Твоя серия обучения — 3 дня!');
    expect(COPY.ru.reminder.streak(5).text).toContain('5 дней');
    for (const lang of UI_LANGS) {
      const r = COPY[lang].reminder;
      expect(r.lesson().buttons).toEqual([{ label: expect.any(String), screen: 'learn' }]);
      expect(r.streak(7).buttons[0].screen).toBe('learn');
      expect(r.return().buttons[0].screen).toBe('home');
      expect(r.streak(7).text).toContain('7');
      expect(COPY[lang].stopHint).toContain('/stop');
    }
    expect(COPY.ru.reminder.lesson().text).toContain('Бобек уже приготовил для тебя новый урок');
    expect(COPY.ru.reminder.return().text).toContain('Dawno się nie widzieliśmy');
  });

  it('длинный текст делится на короткую подпись и остаток', () => {
    const long = `Заголовок 🦫\n\n${'строка '.repeat(300)}`;
    const { caption, rest } = splitCaption(long);
    expect(caption).toBe('Заголовок 🦫');
    expect(caption.length).toBeLessThanOrEqual(CAPTION_LIMIT);
    expect(rest.startsWith('строка')).toBe(true);
    expect(splitCaption('короткий')).toEqual({ caption: 'короткий', rest: '' });
    expect(headlineOf('a\nb')).toBe('a');
  });
});

describe('команды и картинки', () => {
  it('каждая команда и каждое напоминание имеют файл JPEG 1280×720 в публичной папке', () => {
    const files = [...Object.values(COMMAND_IMAGES), ...Object.values(REMINDER_IMAGES)];
    expect(new Set(files).size).toBeGreaterThanOrEqual(9);
    for (const f of files) {
      const path = new URL(f, IMAGES);
      expect(existsSync(path), f).toBe(true);
      const bytes = readFileSync(path);
      expect([bytes[0], bytes[1]], `${f} is JPEG`).toEqual([0xff, 0xd8]);
      const { width, height } = jpegSize(bytes);
      expect([f, width, height]).toEqual([f, 1280, 720]);
      expect(bytes.length, `${f} < 10 MB`).toBeLessThan(10 * 1024 * 1024);
    }
  });

  it('русские доски: свой файл у каждой сцены, без повторов, JPEG 1280×720 и @640 вариант 640×360; профиль, серия и ответ квиза не подключены', () => {
    const ru = Object.values(RU_COMMAND_IMAGES);
    expect(new Set(ru).size).toBe(ru.length);
    const files = [...ru, RU_START_BACK_IMAGE, 'scenes/ru/shopping.jpg', 'scenes/ru/food.jpg', 'scenes/ru/transport.jpg'];
    const hashes = new Set<string>();
    for (const f of files) {
      for (const [name, size] of [[f, { width: 1280, height: 720 }], [f.replace(/\.jpg$/, '@640.jpg'), { width: 640, height: 360 }]] as const) {
        const path = new URL(name, BOT_PUBLIC);
        expect(existsSync(path), name).toBe(true);
        const bytes = readFileSync(path);
        expect([bytes[0], bytes[1]], `${name} is JPEG`).toEqual([0xff, 0xd8]);
        expect(jpegSize(bytes), name).toEqual(size);
        if (name === f) hashes.add(createHash('md5').update(bytes).digest('hex'));
      }
    }
    expect(hashes.size, 'no two themed images are the same file').toBe(files.length);
    // Доски с живыми данными (+20 XP, +15 XP, «7 дней», штампы городов, образец вопроса) не подключены: нужны версии без них.
    for (const command of ['map', 'quests', 'profile', 'help', 'stop'] as const) expect(RU_COMMAND_IMAGES[command], command).toBeUndefined();
    for (const f of files) expect(f).not.toMatch(/profile|streak|quick|correct|passport|complete/);
    // Старые растянутые кадры `ru/*.jpg` с размытыми полосами удалены и не используются.
    for (const f of [...files, ...Object.values(COMMAND_IMAGES), ...Object.values(REMINDER_IMAGES)]) expect(f).not.toMatch(/^ru\//);
    expect(existsSync(new URL('ru/', BOT_PUBLIC))).toBe(false);
  });

  it('русские надписи — только в русском интерфейсе; uk / en получают кадры без надписей на языке интерфейса', () => {
    for (const command of COMMANDS) {
      for (const lang of ['uk', 'en'] as const) expect(commandImage(command, lang)).toBe(`commands/${COMMAND_IMAGES[command]}`);
      expect(commandImage(command, 'ru')).toBe(RU_COMMAND_IMAGES[command] ?? `commands/${COMMAND_IMAGES[command]}`);
    }
    // Доска «Снова тут?» — только для русского интерфейса и только для приветствия вернувшегося пользователя.
    expect(startBackImage('ru')).toBe('scenes/ru/return.jpg');
    for (const lang of ['uk', 'en'] as const) expect(startBackImage(lang)).toBe(`commands/${COMMAND_IMAGES.start}`);
    // Напоминания не показывают часы «19:00» и серию «7»: во всех языках одни и те же нейтральные кадры.
    expect(reminderImage('lesson')).toBe('commands/reminder-lesson.jpg');
    expect(reminderImage('streak')).toBe('commands/reminder-streak.jpg');
    expect(reminderImage('return')).toBe('commands/reminder-return.jpg');
  });

  it('разбор команд: регистр, @бот, параметр', () => {
    expect(parseCommand('/start')).toEqual({ name: 'start', mention: null, arg: '' });
    expect(parseCommand('/START ref_abc123')).toEqual({ name: 'start', mention: null, arg: 'ref_abc123' });
    expect(parseCommand('/lesson@Polski_Go_Bot')).toEqual({ name: 'lesson', mention: 'Polski_Go_Bot', arg: '' });
    expect(parseCommand('/start@Polski_Go_Bot ref_x extra')).toEqual({ name: 'start', mention: 'Polski_Go_Bot', arg: 'ref_x' });
    expect(parseCommand('привет')).toBeNull();
    expect(parseCommand('')).toBeNull();
  });

  it('выбор языка: настройка → язык Telegram → украинский по умолчанию; польского интерфейса нет, белорусский → русский', () => {
    expect(pickLang('ru', 'pl')).toBe('ru');
    expect(pickLang(null, 'pl-PL')).toBe('uk');
    expect(pickLang('pl', 'en')).toBe('en');
    expect(pickLang(null, 'be')).toBe('ru');
    expect(pickLang(undefined, 'EN')).toBe('en');
    expect(pickLang(null, 'de')).toBe('uk');
    expect(pickLang('xx', undefined)).toBe('uk');
  });
});

describe('setup-bot: что именно уходит в Telegram', () => {
  const env = { WEB_APP_URL: 'https://polski.example/', PUBLIC_URL: 'https://polski.example', TELEGRAM_WEBHOOK_SECRET: 's3cret' };

  it('только команды и кнопка меню: без описания, картинки описания, webhook и токена; --webhook больше не ставит webhook', () => {
    const calls = buildCalls(env, {});
    expect(calls.map((c) => c.method)).toEqual(['setMyCommands', 'setMyCommands', 'setMyCommands', 'setMyCommands', 'setChatMenuButton']);
    const methods = new Set(calls.map((c) => c.method));
    for (const forbidden of ['setMyDescription', 'setMyShortDescription', 'setMyName', 'setWebhook', 'deleteWebhook', 'logOut', 'close']) {
      expect(methods.has(forbidden), forbidden).toBe(false);
    }
    expect(calls.at(-1)!.params).toEqual({ menu_button: { type: 'web_app', text: 'POLSKI GO', web_app: { url: 'https://polski.example/' } } });
    expect(buildCalls(env, { webhook: true }).some((c) => c.method === 'setWebhook')).toBe(false);
  });

  it('девять карточек и /quiz: русские по умолчанию, uk/pl/en локализованы, без повторов', () => {
    const [base, ...localized] = buildCalls(env, {}).filter((c) => c.method === 'setMyCommands');
    expect(base.params.language_code).toBeUndefined();
    expect(base.params.commands.map((c: { command: string }) => c.command)).toEqual(MENU.map((c) => c.command));
    expect(MENU.map((c) => c.command).filter((c) => c !== 'quiz')).toEqual([...COMMANDS]);
    expect(MENU.some((c) => c.command === 'quiz')).toBe(true);
    expect(localized.map((c) => c.params.language_code)).toEqual(LOCALIZED);
    for (const c of buildCalls(env, {}).filter((x) => x.method === 'setMyCommands')) {
      for (const cmd of c.params.commands) {
        expect(cmd.command).toMatch(/^[a-z]{1,32}$/);
        expect(cmd.description.length).toBeGreaterThanOrEqual(3);
        expect(cmd.description.length).toBeLessThanOrEqual(256);
      }
    }
    expect(base.params.commands.find((c: { command: string }) => c.command === 'start').description).toBe('🦫 Начать путешествие');
    const descriptions = (lang: UiLang) => COMMAND_MENU.map((c) => c.description[lang]);
    for (const lang of UI_LANGS) expect(new Set(descriptions(lang)).size).toBe(9);
    expect(new Set([...descriptions('ru'), ...descriptions('uk')]).size).toBe(18);
    for (const lang of UI_LANGS) expect(new Set(MENU.map((c) => c.description[lang])).size).toBe(MENU.length);
  });

  it('описание — только по флагу', () => {
    const desc = buildCalls(env, { description: true }).find((c) => c.method === 'setMyDescription')!;
    expect(desc.params.description).toBe(DESCRIPTION);
  });
});

describe('адрес приложения из переменной окружения', () => {
  const CASES: [string, string][] = [
    ['https://polski.example', 'https://polski.example'],
    ['https://polski.example/app/?v=1', 'https://polski.example/app/?v=1'],
    ['polskie-go.acc.workers.dev', 'https://polskie-go.acc.workers.dev'],
    ['//polskie-go.acc.workers.dev/app', 'https://polskie-go.acc.workers.dev/app'],
    ['http://polskie-go.acc.workers.dev', 'https://polskie-go.acc.workers.dev'],
    ['  https://polski.example \n', 'https://polski.example'],
    ['HTTP://Polski.Example', 'https://Polski.Example'],
    ['localhost:5173', 'http://localhost:5173'],
    ['http://localhost:5173', 'http://localhost:5173'],
    ['http://127.0.0.1:8787/x', 'http://127.0.0.1:8787/x'],
    ['', ''],
    ['   ', ''],
  ];

  it.each(CASES)('«%s» → «%s»', (raw, expected) => {
    expect(normalizeWebAppUrl(raw)).toBe(expected);
    expect(() => new URL(normalizeWebAppUrl(raw) || 'http://localhost')).not.toThrow();
  });

  it('скрипт setup-bot нормализует так же, как сервер', () => {
    for (const [raw] of CASES) expect(normalizeUrl(raw)).toBe(normalizeWebAppUrl(raw));
  });

  it('кнопка меню получает https, даже если адрес задан без схемы', () => {
    const calls = buildCalls({ WEB_APP_URL: 'polski.example' }, {});
    expect(calls.find((c) => c.method === 'setChatMenuButton')!.params.menu_button.web_app.url).toBe('https://polski.example');
  });
});

/** Размер JPEG из маркера SOF (без внешних зависимостей). */
function jpegSize(b: Buffer): { width: number; height: number } {
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) throw new Error('bad jpeg');
    const marker = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  throw new Error('no SOF');
}
