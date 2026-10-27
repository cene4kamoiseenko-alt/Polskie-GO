/**
 * Обработка сообщений бота: девять команд (/start /lesson /map /words /quests /profile /settings /help /stop),
 * неизвестные команды и обычный текст в личном чате получают справку.
 * Язык: настройка пользователя → язык Telegram → язык продукта. Сбой базы не лишает ответа:
 * текст уходит без персональных данных, а /stop и прогресс честно сообщают о неудаче.
 */
import { botApi } from '../lib/telegram';
import { config } from '../env';
import { upsertTelegramUser } from '../services/users';
import { COMMAND_IMAGES, isCommand, type CommandName } from './catalog';
import { COPY, type Card, type Vars } from './copy';
import { activeQuestsOf, disableReminders, findBotUser, nextLessonOf, pickLang, profileOf, type BotUser } from './data';
import { commandForLabel, sendPanel } from './panel';
import { sendCard, type Sent } from './send';

export type BotMessage = {
  message_id?: number;
  chat: { id: number; type?: string };
  from?: { id: number; first_name?: string; last_name?: string; username?: string; language_code?: string; is_bot?: boolean };
  text?: string;
};

/** `/cmd`, `/cmd@Bot`, `/cmd payload`; регистр команды не важен. */
export function parseCommand(text: string | undefined): { name: string; mention: string | null; arg: string } | null {
  const m = /^\/([A-Za-z0-9_]{1,32})(?:@([A-Za-z0-9_]{3,64}))?(?:\s+(\S+))?/.exec((text ?? '').trim());
  return m ? { name: m[1].toLowerCase(), mention: m[2] ?? null, arg: m[3] ?? '' } : null;
}

/** Параметр `/start` по правилам Telegram: латиница, цифры, `_` и `-`, до 64 знаков. */
const startPayload = (arg: string) => (/^[A-Za-z0-9_-]{1,64}$/.test(arg) ? arg : undefined);
const isReferral = (arg: string) => /^ref_[A-Za-z0-9]{1,32}$/.test(arg);

const log = (what: string, e: unknown) => console.warn(`bot: ${what}`, (e as Error)?.message ?? e);

/** Выполняет шаг, который лишь обогащает ответ: сбой не мешает ответить. */
async function soft<T>(what: string, fn: () => Promise<T>, fallback: T): Promise<{ value: T; failed: boolean }> {
  try {
    return { value: await fn(), failed: false };
  } catch (e) {
    log(what, e);
    return { value: fallback, failed: true };
  }
}

export type Handled = { command: CommandName | 'unknown'; sent: Sent | null; ignored?: string };

export async function handleBotMessage(msg: BotMessage, now = new Date()): Promise<Handled> {
  const from = msg.from;
  if (!from || from.is_bot || typeof msg.text !== 'string') return { command: 'unknown', sent: null, ignored: 'no_sender_or_text' };
  const chatType = msg.chat.type ?? 'private';
  const priv = chatType === 'private';
  // Кнопка постоянной панели приходит обычным текстом («🗺 Карта») и обрабатывается как соответствующая команда.
  const labelCommand = priv ? commandForLabel(msg.text) : null;
  const cmd = parseCommand(msg.text) ?? (labelCommand ? { name: labelCommand, mention: null, arg: '' } : null);
  // В группах отвечаем только на команды, адресованные этому боту.
  if (!priv && !cmd) return { command: 'unknown', sent: null, ignored: 'group_text' };
  if (!priv && cmd?.mention && config.botUsernameConfigured && cmd.mention.toLowerCase() !== config.botUsername.toLowerCase()) {
    return { command: 'unknown', sent: null, ignored: 'other_bot' };
  }
  const command: CommandName | 'unknown' = cmd && isCommand(cmd.name) ? cmd.name : 'unknown';
  const arg = cmd?.arg ?? '';

  let { value: user, failed: dbDown } = await soft<BotUser | null>('find user', () => findBotUser(from.id), null);
  // Реферальная ссылка t.me/<бот>?start=ref_CODE: реферера фиксирует сервер по подписанному webhook, а не URL кнопки.
  if (command === 'start' && priv && isReferral(arg) && !dbDown) {
    const reg = await soft<BotUser | null>(
      'referral',
      async () => {
        await upsertTelegramUser({ id: from.id, first_name: from.first_name ?? '', last_name: from.last_name, username: from.username, language_code: from.language_code }, arg);
        return findBotUser(from.id);
      },
      user,
    );
    user = reg.value;
    dbDown = dbDown || reg.failed;
  }
  if (user?.banned) return { command, sent: null, ignored: 'banned' };

  const lang = pickLang(user?.lang, from.language_code);
  const copy = COPY[lang];
  const vars: Vars = { name: from.first_name ?? user?.firstName ?? '' };
  const tz = user?.timezone ?? 'Europe/Warsaw';
  const target = { chatId: msg.chat.id, chatType };
  let card: Card;
  let image: string = COMMAND_IMAGES[command === 'unknown' ? 'help' : command];
  let startapp: string | undefined;

  switch (command) {
    case 'start': {
      startapp = startPayload(arg);
      if (user?.onboarded && !dbDown) {
        vars.lesson = (await soft('next lesson', () => nextLessonOf(user!.id, lang), null)).value;
        card = copy.startBack(vars);
      } else {
        card = copy.start(vars);
      }
      break;
    }
    case 'lesson': {
      if (user && !dbDown) vars.lesson = (await soft('next lesson', () => nextLessonOf(user!.id, lang), null)).value;
      card = copy.lesson(vars);
      break;
    }
    case 'quests': {
      if (user && !dbDown) vars.quests = (await soft('quests', () => activeQuestsOf(user!.id, tz, lang, now), [])).value;
      card = copy.quests(vars);
      break;
    }
    case 'profile': {
      if (dbDown) {
        card = copy.profileUnavailable;
      } else if (!user) {
        card = copy.profile(vars);
      } else {
        const p = await soft('profile', () => profileOf(user!.id, tz, now), null);
        card = p.failed ? copy.profileUnavailable : copy.profile({ ...vars, profile: p.value });
      }
      break;
    }
    case 'stop': {
      // Выключаем только учебные напоминания существующего пользователя; о выполненном сообщаем лишь после успешной записи.
      if (dbDown) return failStop(target.chatId, copy.stopFailed);
      if (user) {
        try {
          await disableReminders(user.id);
        } catch (e) {
          log('stop', e);
          return failStop(target.chatId, copy.stopFailed);
        }
      }
      card = copy.stop(vars);
      break;
    }
    case 'map':
    case 'words':
    case 'settings':
    case 'help':
      card = copy[command](vars);
      break;
    default:
      card = copy.help(vars);
  }

  const sent = await sendCard({ ...target, startapp }, card, image);
  // Быстрая панель внизу ставится после /start и /help в личном чате (после карточки: сбой панели не должен повторять ответ).
  if (priv && (command === 'start' || command === 'help')) await sendPanel(msg.chat.id, lang);
  return { command, sent };
}

async function failStop(chatId: number, text: string): Promise<Handled> {
  await botApi('sendMessage', { chat_id: chatId, text });
  return { command: 'stop', sent: { method: 'sendMessage', messageId: null, photoError: null } };
}
