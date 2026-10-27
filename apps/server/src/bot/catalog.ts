/**
 * Каталог бота: команды, иллюстрации и куда ведёт главная кнопка.
 * Картинки — публичные файлы веб-сборки `apps/web/public/bot/...`:
 *  • `commands/<имя>.jpg` (JPEG 1280×720) — без надписей на языке интерфейса, подходят всем языкам;
 *  • `ru/<имя>.jpg` (JPEG 640×360, комплект владельца «16 images») — с русскими заголовками, поэтому только для русского интерфейса
 *    и только там, где на картинке нет живых данных (профиль с чужими цифрами, серия «7 дней», имя, готовый ответ квиза не используются).
 */
import type { BotScreen, UiLang } from '@polski-go/shared';
import { config } from '../env';
import commandsJson from './commands.json';
import type { ReminderKind } from './copy';

export const COMMANDS = ['start', 'lesson', 'map', 'words', 'quests', 'profile', 'settings', 'help', 'stop'] as const;
export type CommandName = (typeof COMMANDS)[number];

/** Команды меню Telegram: девять карточек и быстрый вопрос `/quiz`. */
export type MenuCommand = CommandName | 'quiz';
type MenuEntry = { command: MenuCommand; description: Record<'ru' | 'uk' | 'pl' | 'en', string> };

/** Описания для `setMyCommands`: язык по умолчанию — русский, `uk` / `pl` / `en` — локализации. */
export const MENU = commandsJson.commands as MenuEntry[];
/** Только девять карточек (без `/quiz`). */
export const COMMAND_MENU = MENU.filter((c): c is MenuEntry & { command: CommandName } => c.command !== 'quiz');

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

/**
 * Тематические кадры с русскими заголовками («УРОКИ», «КАРТА»…). Профиль (выдуманные уровень и XP), серия («7 дней»),
 * возвращение (чужое имя) и кадры квиза с готовым ответом сюда намеренно не входят.
 */
export const RU_COMMAND_IMAGES: Partial<Record<CommandName, string>> = {
  start: 'ru/welcome.jpg',
  lesson: 'ru/lessons.jpg',
  map: 'ru/map.jpg',
  words: 'ru/words.jpg',
  quests: 'ru/quests.jpg',
  settings: 'ru/settings.jpg',
  help: 'ru/help.jpg',
};

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

/** На русском кадре напоминания нарисованы часы «19:00»: показываем его только тем, у кого напоминание на 19:00. */
export const RU_REMINDER_LESSON = { file: 'ru/reminder.jpg', hour: 19 };

export function reminderImage(kind: ReminderKind, lang: UiLang, hour: number | null): string {
  if (kind === 'lesson' && lang === 'ru' && hour === RU_REMINDER_LESSON.hour) return RU_REMINDER_LESSON.file;
  return `commands/${REMINDER_IMAGES[kind]}`;
}

export const isCommand = (value: string): value is CommandName => (COMMANDS as readonly string[]).includes(value);

/** Публичный HTTPS-адрес картинки на origin развёрнутого приложения (Telegram скачивает её сам, без авторизации). */
export function botImageUrl(file: string): string {
  return new URL(`/bot/${file}`, new URL(config.webAppUrl).origin).toString();
}
