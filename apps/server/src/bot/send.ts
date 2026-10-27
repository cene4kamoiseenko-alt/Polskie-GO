/**
 * Отправка карточки бота: фото + подпись + настоящая inline-клавиатура.
 *  • Кнопки — `web_app` (в личном чате) и открывают нужную вкладку Mini App через `bot_screen`;
 *    в группах `web_app` недоступен, там обычная ссылка `t.me/<бот>/<приложение>?startapp=screen_<имя>`.
 *  • Подпись к фото не длиннее 1024 знаков: длинный текст делится на короткую подпись и отдельное сообщение с кнопками.
 *  • Фото не ушло из-за самой картинки (400/404: адрес недоступен, не JPEG) — тот же текст и те же кнопки обычным сообщением.
 *    Блокировка бота (403), лимит (429), сбой Telegram и неопределённый результат сети в текст не превращаются.
 */
import { BOT_SCREEN_START_PREFIX, withBotScreen, type BotScreen } from '@polski-go/shared';
import { config } from '../env';
import { botApi, TelegramError } from '../lib/telegram';
import { botImageUrl } from './catalog';
import { headlineOf, type Button, type Card } from './copy';

export const CAPTION_LIMIT = 1024;

export type InlineButton = { text: string; web_app: { url: string } } | { text: string; url: string };
export type InlineKeyboard = { inline_keyboard: InlineButton[][] };

export type SendOptions = {
  chatId: number;
  /** private | group | supergroup | channel; без значения считаем личным чатом. */
  chatType?: string;
  /** Параметр `/start <payload>`: уходит в `startapp` кнопки главного экрана (реферальные ссылки продолжают работать). */
  startapp?: string;
  /** Счётчик вызовов Bot API (для бюджета подзапросов Worker). */
  stats?: { calls: number };
};

export type Sent = { method: 'sendPhoto' | 'sendMessage'; messageId: number | null; photoError: string | null };

export function buildKeyboard(buttons: Button[], opts: Pick<SendOptions, 'chatType' | 'startapp'> = {}): InlineKeyboard {
  const priv = !opts.chatType || opts.chatType === 'private';
  return {
    inline_keyboard: buttons.map((b) => [priv ? { text: b.label, web_app: { url: screenUrl(b.screen, opts.startapp) } } : { text: b.label, url: groupLink(b.screen) }]),
  };
}

/** Адрес Mini App для кнопки: базовый WEB_APP_URL (путь и параметры сохраняются) + `bot_screen`. */
export function screenUrl(screen: BotScreen, startapp?: string): string {
  return withBotScreen(config.webAppUrl, screen, screen === 'home' && startapp ? { startapp } : {});
}

/** Прямая ссылка на Mini App для чатов без `web_app`-кнопок. */
export function groupLink(screen: BotScreen): string {
  const base = `https://t.me/${config.botUsername}/${config.appShortName}`;
  return screen === 'home' ? base : `${base}?startapp=${BOT_SCREEN_START_PREFIX}${screen}`;
}

/** Делит текст на короткую подпись к фото и остаток (по первому абзацу). */
export function splitCaption(text: string): { caption: string; rest: string } {
  if (text.length <= CAPTION_LIMIT) return { caption: text, rest: '' };
  const first = headlineOf(text);
  const caption = first.length <= CAPTION_LIMIT ? first : first.slice(0, CAPTION_LIMIT - 1) + '…';
  return { caption, rest: text.slice(first.length).replace(/^\s+/, '') };
}

/** Ошибка самой картинки: можно отправить тот же текст без фото. */
export function isPhotoProblem(e: unknown): boolean {
  return e instanceof TelegramError && e.code >= 400 && e.code < 500 && ![401, 403, 429].includes(e.code);
}

/** Отправить карточку. Бросает TelegramError, если не удалось доставить ни фото, ни текст. */
export async function sendCard(opts: SendOptions, card: Card, imageFile: string | null): Promise<Sent> {
  const reply_markup = buildKeyboard(card.buttons, opts);
  const stats = opts.stats ?? { calls: 0 };
  const photo = imageFile ? botImageUrl(imageFile) : null;
  let photoError: string | null = null;

  // Telegram скачивает фото по адресу сам и принимает только HTTPS.
  if (photo && photo.startsWith('https://')) {
    try {
      const { caption, rest } = splitCaption(card.text);
      stats.calls++;
      const msg = await botApi<{ message_id: number }>('sendPhoto', { chat_id: opts.chatId, photo, caption, parse_mode: 'HTML', ...(rest ? {} : { reply_markup }) });
      if (!rest) return { method: 'sendPhoto', messageId: msg?.message_id ?? null, photoError };
      stats.calls++;
      const more = await botApi<{ message_id: number }>('sendMessage', { chat_id: opts.chatId, text: rest, parse_mode: 'HTML', reply_markup });
      return { method: 'sendPhoto', messageId: more?.message_id ?? msg?.message_id ?? null, photoError };
    } catch (e) {
      if (!isPhotoProblem(e)) throw e;
      photoError = (e as Error).message;
    }
  } else if (photo) {
    photoError = 'image url is not https';
  }

  stats.calls++;
  const msg = await botApi<{ message_id: number }>('sendMessage', { chat_id: opts.chatId, text: card.text, parse_mode: 'HTML', reply_markup });
  return { method: 'sendMessage', messageId: msg?.message_id ?? null, photoError };
}
