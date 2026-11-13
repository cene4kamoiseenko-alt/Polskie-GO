/**
 * Рассылки из админки. Кому уходит рассылка, каким текстом и с какой кнопкой — одно правило для настоящей отправки (jobs.ts, частями по cron),
 * для подсчёта охвата перед отправкой и для пробного сообщения себе: что админ проверил на себе, то и получат игроки.
 */
import { and, count, eq, gt, or, sql, type SQL } from 'drizzle-orm';
import { db } from '../db';
import { userSettings, users } from '../db/schema';
import { config } from '../env';
import { badRequest } from '../lib/errors';
import { botApi, TelegramError } from '../lib/telegram';

/** Получатели: в Telegram (не гости), не заблокированы, сами включили уведомления. Таблица userSettings должна быть в join. */
export function campaignRecipients(after?: string | null): SQL {
  return and(eq(users.isBanned, false), gt(users.telegramId, 0), eq(userSettings.notificationsEnabled, true), after ? gt(users.id, after) : undefined)!;
}

/** Текст на языке игрока; нет перевода — украинский (обязательный язык рассылки). */
export const campaignText = (message: Record<string, string>, lang: string) => message[lang] || message.uk;

export const campaignMarkup = () => ({ inline_keyboard: [[{ text: '🚀 POLSKI GO', web_app: { url: config.webAppUrl } }]] });

/** Сколько человек получат рассылку и на каком языке (для предпросмотра в админке). */
export async function campaignAudience() {
  const rows = await db
    .select({ lang: userSettings.uiLanguage, n: count() })
    .from(users)
    .innerJoin(userSettings, eq(userSettings.userId, users.id))
    .where(campaignRecipients())
    .groupBy(userSettings.uiLanguage);
  const byLang = Object.fromEntries(rows.map((r) => [r.lang, Number(r.n)]));
  return { total: rows.reduce((a, r) => a + Number(r.n), 0), byLang };
}

/** Игрок по Telegram ID, @username или имени пользователя без @ — только из Telegram (у гостей нет чата с ботом). */
export async function findTelegramPlayer(who: string) {
  const s = who.trim().replace(/^@/, '');
  if (!s) throw badRequest('player_not_found');
  const byId = /^\d{1,15}$/.test(s) ? eq(users.telegramId, Number(s)) : undefined;
  const [u] = await db
    .select({ id: users.id, telegramId: users.telegramId, firstName: users.firstName, username: users.username, lang: userSettings.uiLanguage })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    // @username в Telegram не зависит от регистра: @Olena и @olena — один человек.
    .where(and(gt(users.telegramId, 0), byId ? or(byId, sql`lower(${users.username}) = ${s.toLowerCase()}`) : sql`lower(${users.username}) = ${s.toLowerCase()}`))
    .limit(1);
  if (!u) throw badRequest('player_not_found');
  return u;
}

/** Сообщение игроку от бота. Заблокировал бота — понятная ошибка, а не 500. */
export async function sendBotText(telegramId: number, text: string, withButton = true) {
  try {
    await botApi('sendMessage', { chat_id: telegramId, text, ...(withButton ? { reply_markup: campaignMarkup() } : {}) });
  } catch (e) {
    if (e instanceof TelegramError && (e.code === 403 || (e.code === 400 && /chat not found/i.test(e.description)))) throw badRequest('bot_blocked');
    throw e;
  }
}
