/**
 * Каталог бота: команды, иллюстрации и куда ведёт главная кнопка.
 * Картинки — публичные файлы веб-сборки `apps/web/public/bot/...`:
 *  • `commands/<имя>.jpg` (JPEG 1280×720) — без надписей на языке интерфейса, подходят всем языкам;
 *  • `scenes/ru/<имя>.jpg` (JPEG 1280×720, рядом `<имя>@640.jpg` 640×360) — полнокадровые доски владельца (docs/design/a10/telegram)
 *    с русскими заголовками, поэтому только для русского интерфейса и только там, где на доске нет живых данных
 *    (+XP, серия «7», штампы городов, образец вопроса не используются). Сборка: `node scripts/build-bot-images.mjs`.
 */
import type { BotScreen, UiLang } from '@polski-go/shared';
import { config } from '../env';
import commandsJson from './commands.json';
import imageVersions from './image-versions.json';
import type { ReminderKind } from './copy';

export const COMMANDS = ['start', 'lesson', 'map', 'words', 'quests', 'profile', 'settings', 'help', 'stop'] as const;
export type CommandName = (typeof COMMANDS)[number];

/** Команды меню Telegram: девять карточек и быстрый вопрос `/quiz`. */
export type MenuCommand = CommandName | 'quiz';
type MenuEntry = { command: MenuCommand; description: Record<UiLang, string> };

/** Описания для `setMyCommands`: язык по умолчанию — русский, `uk` / `en` — локализации (Telegram на польском получает `uk`). */
export const MENU = commandsJson.commands as MenuEntry[];
/** Только девять карточек (без `/quiz`). */
export const COMMAND_MENU = MENU.filter((c): c is MenuEntry & { command: CommandName } => c.command !== 'quiz');

export const COMMAND_IMAGES: Record<CommandName, string> = {
  start: 'start.jpg',
  lesson: 'lesson.jpg',
  map: 'map.jpg',
  words: 'words.jpg',
  quests: 'quests.jpg',
  // Кадры владельца 2026-10-29 (docs/design/a12/bot): Бобек с паспортом путешественника — без текста, подходит всем языкам.
  profile: 'profile.jpg',
  settings: 'settings.jpg',
  help: 'help.jpg',
  stop: 'stop.jpg',
};

/**
 * Тематические кадры с русскими заголовками («УРОКИ», «СЛОВА»…). Только полнокадровые доски владельца.
 * Для карты, заданий, профиля, справки и /stop досок нет: там остаются нейтральные кадры `commands/*` (резкие, без размытых полос),
 * а не старые растянутые `ru/*.jpg`. См. assets/telegram/asset-manifest.json, раздел blocked_scenes.
 */
export const RU_COMMAND_IMAGES: Partial<Record<CommandName, string>> = {
  start: 'scenes/ru/start.jpg',
  lesson: 'scenes/ru/lesson.jpg',
  words: 'scenes/ru/words.jpg',
  settings: 'scenes/ru/settings.jpg',
};

/** «Снова тут? Приятно, что ты вернулся!» — кадр для приветствия вернувшегося пользователя, не для рассылки. */
export const RU_START_BACK_IMAGE = 'scenes/ru/return.jpg';

/** Картинка карточки: тематический русский кадр для русского интерфейса, иначе нейтральный. */
export function commandImage(command: CommandName, lang: UiLang): string {
  return (lang === 'ru' && RU_COMMAND_IMAGES[command]) || `commands/${COMMAND_IMAGES[command]}`;
}

/** Главный экран команды (первая кнопка карточки ведёт туда). */
export const COMMAND_LANDING: Record<CommandName, BotScreen> = {
  start: 'home',
  lesson: 'learn',
  map: 'map',
  words: 'dictionary',
  quests: 'quests',
  profile: 'profile',
  settings: 'settings',
  help: 'home',
  stop: 'settings',
};

export const REMINDER_IMAGES: Record<ReminderKind, string> = {
  lesson: 'reminder-lesson.jpg',
  streak: 'reminder-streak.jpg',
  return: 'reminder-return.jpg',
};

/** Картинка карточки `/start` для вернувшегося пользователя: русская доска «Снова тут?» или обычный кадр старта. */
export function startBackImage(lang: UiLang): string {
  return lang === 'ru' ? RU_START_BACK_IMAGE : commandImage('start', lang);
}

/** Напоминания: кадры без надписей на языке интерфейса и без живых данных. Часов «19:00» и «серии 7» на них нет. */
export function reminderImage(kind: ReminderKind): string {
  return `commands/${REMINDER_IMAGES[kind]}`;
}

export const isCommand = (value: string): value is CommandName => (COMMANDS as readonly string[]).includes(value);

const VERSIONS: Record<string, string> = imageVersions;

/**
 * Публичный HTTPS-адрес картинки на origin развёрнутого приложения (Telegram скачивает её сам, без авторизации).
 * `?v=` — хэш содержимого (apps/server/src/bot/image-versions.json, `node scripts/validate-assets.mjs --write-versions`):
 * Telegram кэширует картинку по адресу, и новый кадр под старым именем без версии мог бы прийти старым.
 */
export function botImageUrl(file: string): string {
  const url = new URL(`/bot/${file}`, new URL(config.webAppUrl).origin);
  const version = VERSIONS[file];
  if (version) url.searchParams.set('v', version);
  return url.toString();
}
