/**
 * Приглашение друга картинкой (владелец, 2026-11-15: «приглашение приходит без картинки просто текстом»).
 *
 * Раньше кнопка «Пригласить друга» открывала t.me/share/url: другу уходила голая ссылка с текстом. Теперь сервер сохраняет у бота
 * готовое сообщение (Bot API savePreparedInlineMessage): картинка владельца на языке игрока, подпись и кнопка «Играть вместе» со
 * ссылкой-приглашением. Приложение передаёт его id в Telegram.WebApp.shareMessage — Telegram показывает выбор чата и отправляет
 * сообщение от имени игрока («via @бот»). Если клиент старый (Bot API < 8.0) или сервер не смог — приложение откатывается на
 * прежнюю ссылку (apps/web/src/lib/telegram.ts → shareInvite).
 *
 * Картинки: apps/web/public/bot/invite/{ru,uk}.jpg (исходники docs/design/invite, надпись на языке игрока и по-польски);
 * у английского интерфейса — стартовая картинка бота без надписей.
 */
import { eq } from 'drizzle-orm';
import type { UiLang } from '@polski-go/shared';
import { config } from '../env';
import { db } from '../db';
import { userSettings, users } from '../db/schema';
import { botImageUrl } from '../bot/catalog';
import { botApi } from '../lib/telegram';
import { badRequest, HttpError } from '../lib/errors';

const COPY: Record<UiLang, { caption: string; button: string }> = {
  ru: {
    caption: 'Давай учить польский вместе! 🇵🇱\nКороткие уроки, квесты в городах Польши и лига с призами — в POLSKI GO.',
    button: 'Играть вместе',
  },
  uk: {
    caption: 'Вчімо польську разом! 🇵🇱\nКороткі уроки, квести в містах Польщі й ліга з призами — у POLSKI GO.',
    button: 'Грати разом',
  },
  en: {
    caption: 'Let’s learn Polish together! 🇵🇱\nShort lessons, quests in Polish cities and a league with prizes — in POLSKI GO.',
    button: 'Play together',
  },
};

export function inviteImage(lang: UiLang): string {
  return lang === 'ru' || lang === 'uk' ? `invite/${lang}.jpg` : 'commands/start.jpg';
}

export function inviteLink(referralCode: string): string {
  return `https://t.me/${config.botUsername}/${config.appShortName}?startapp=ref_${referralCode}`;
}

/** Сохранить у бота сообщение-приглашение для этого игрока. Возвращает id для Telegram.WebApp.shareMessage. */
export async function prepareInvite(userId: string): Promise<{ id: string }> {
  const row = await db
    .select({ telegramId: users.telegramId, code: users.referralCode, lang: userSettings.uiLanguage })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .where(eq(users.id, userId))
    .get();
  // Гость или вход вне Telegram: отправить сообщение от имени игрока может только Telegram-аккаунт.
  if (!row || row.telegramId <= 0) throw badRequest('telegram_only');
  const photo = botImageUrl(inviteImage((row.lang ?? 'uk') as UiLang));
  // Telegram скачивает картинку сам и только по HTTPS (локальный стенд — без картинки, приложение откатится на ссылку).
  if (!photo.startsWith('https://')) throw new HttpError(503, 'invite_unavailable');
  const lang = (row.lang && row.lang in COPY ? row.lang : 'uk') as UiLang;
  const copy = COPY[lang];
  const res = await botApi<{ id: string }>('savePreparedInlineMessage', {
    user_id: row.telegramId,
    result: {
      type: 'photo',
      id: `invite-${lang}`,
      photo_url: photo,
      thumbnail_url: photo,
      caption: copy.caption,
      reply_markup: { inline_keyboard: [[{ text: copy.button, url: inviteLink(row.code) }]] },
    },
    allow_user_chats: true,
    allow_group_chats: true,
    allow_channel_chats: true,
    allow_bot_chats: false,
  }).catch(() => {
    throw new HttpError(502, 'invite_unavailable');
  });
  if (!res?.id) throw new HttpError(502, 'invite_unavailable');
  return { id: res.id };
}
