/**
 * Каталог бота: команды, иллюстрации и куда ведёт главная кнопка.
 * Картинки — публичные файлы веб-сборки `apps/web/public/bot/commands/<имя>.jpg` (JPEG 1280×720).
 * Часть команд пока делит кадр с соседними (комплект «Bot Full Kit»): позже файл можно заменить без правок кода.
 */
import type { BotScreen } from '@polski-go/shared';
import { config } from '../env';
import commandsJson from './commands.json';
import type { ReminderKind } from './copy';

export const COMMANDS = ['start', 'lesson', 'map', 'words', 'quests', 'profile', 'settings', 'help', 'stop'] as const;
export type CommandName = (typeof COMMANDS)[number];

/** Описания для `setMyCommands`: язык по умолчанию — русский, `uk` / `pl` / `en` — локализации. */
export const COMMAND_MENU = commandsJson.commands as { command: CommandName; description: Record<'ru' | 'uk' | 'pl' | 'en', string> }[];

export const COMMAND_IMAGES: Record<CommandName, string> = {
  start: 'start.jpg',
  lesson: 'lesson.jpg',
  map: 'map.jpg',
  words: 'words.jpg',
  quests: 'quests.jpg',
  profile: 'profile.jpg',
  settings: 'settings.jpg',
  help: 'help.jpg',
  stop: 'stop.jpg',
};

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

export const isCommand = (value: string): value is CommandName => (COMMANDS as readonly string[]).includes(value);

/** Публичный HTTPS-адрес картинки на origin развёрнутого приложения (Telegram скачивает её сам, без авторизации). */
export function botImageUrl(file: string): string {
  return new URL(`/bot/commands/${file}`, new URL(config.webAppUrl).origin).toString();
}
