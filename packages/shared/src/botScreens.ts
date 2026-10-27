/**
 * Переходы из Telegram-бота в Mini App. Кнопки бота открывают Mini App с параметром `bot_screen=<имя>`,
 * клиент превращает имя в маршрут React Router по этому белому списку (произвольные пути не принимаются).
 * Для чатов, где `web_app`-кнопки недоступны, работает прямая ссылка `t.me/<bot>/<app>?startapp=screen_<имя>`.
 * Параметр не пересекается с `startapp` / `ref_` / `story_` / `premium`.
 */
export const BOT_SCREENS = {
  home: '/',
  learn: '/learn',
  map: '/map',
  dictionary: '/dictionary',
  slang: '/slang',
  quests: '/quests',
  profile: '/profile',
  achievements: '/achievements',
  settings: '/settings',
  grammar: '/grammar',
} as const;

export type BotScreen = keyof typeof BOT_SCREENS;

export const BOT_SCREEN_PARAM = 'bot_screen';
export const BOT_SCREEN_START_PREFIX = 'screen_';

export function isBotScreen(value: unknown): value is BotScreen {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(BOT_SCREENS, value);
}

/** Имя экрана → маршрут, либо null, если имени нет в белом списке. */
export function botScreenRoute(name: string | null | undefined): string | null {
  return isBotScreen(name) ? BOT_SCREENS[name] : null;
}

/**
 * Куда вести пользователя при запуске Mini App: `?bot_screen=` в адресе или `startapp=screen_<имя>`.
 * Возвращает маршрут или null (обычный запуск). `search` — `window.location.search`.
 */
export function resolveLaunchRoute(search: string, startParam?: string | null): string | null {
  const fromQuery = botScreenRoute(new URLSearchParams(search).get(BOT_SCREEN_PARAM));
  if (fromQuery) return fromQuery;
  if (startParam?.startsWith(BOT_SCREEN_START_PREFIX)) return botScreenRoute(startParam.slice(BOT_SCREEN_START_PREFIX.length));
  return null;
}

/**
 * Адрес Mini App для кнопки бота. Сохраняет путь и уже заданные параметры базового адреса;
 * для `home` параметр не добавляется (обычный запуск: новичок — знакомство, игрок — главная).
 */
export function withBotScreen(baseUrl: string, screen: BotScreen, extra: Record<string, string> = {}): string {
  const url = new URL(baseUrl);
  for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v);
  if (screen !== 'home') url.searchParams.set(BOT_SCREEN_PARAM, screen);
  return url.toString();
}
