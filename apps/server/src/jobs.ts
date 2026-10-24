/**
 * Фонові задачі (Cron Trigger кожні 15 хв):
 *  • навчальні нагадування — у годину, яку обрав користувач, не частіше разу на день;
 *  • розсилки з адмінки — частинами, щоб не перевищити ліміт підзапитів Worker.
 * Надсилається лише користувачам, які погодилися на сповіщення (notifications_enabled).
 */
import { and, asc, eq, gt, isNotNull } from 'drizzle-orm';
import { dayKey, effectiveStreak } from '@polski-go/shared';
import { db } from './db';
import { notificationCampaigns, notificationLog, playerProgress, userSettings, users } from './db/schema';
import { botApi } from './lib/telegram';
import { config } from './env';

/** Безкоштовний Worker має ліміт 50 підзапитів за виклик — лишаємо запас на запити до БД. */
const SEND_BUDGET = 35;

const TEXT: Record<string, (streak: number) => string> = {
  uk: (s) => (s > 0 ? `🔥 Твоя серія — ${s} дн. Не переривай її! Бобек чекає на урок 🦫` : '🦫 Бобек сумує без тебе! 5 хвилин польської?'),
  ru: (s) => (s > 0 ? `🔥 Твоя серия — ${s} дн. Не прерывай её! Бобек ждёт урок 🦫` : '🦫 Бобек скучает! 5 минут польского?'),
  en: (s) => (s > 0 ? `🔥 Your streak is ${s} days. Keep it going! 🦫` : '🦫 Bobek misses you! 5 minutes of Polish?'),
  pl: (s) => (s > 0 ? `🔥 Twoja seria to ${s} dni. Nie przerywaj jej! 🦫` : '🦫 Bobek tęskni! 5 minut polskiego?'),
};

const openButton = () => ({ inline_keyboard: [[{ text: '🚀 POLSKI GO', web_app: { url: config.webAppUrl } }]] });

export async function sendReminders(now = new Date(), budget = SEND_BUDGET) {
  const candidates = await db
    .select({ id: users.id, telegramId: users.telegramId, s: userSettings, p: playerProgress })
    .from(users)
    .innerJoin(userSettings, eq(userSettings.userId, users.id))
    .leftJoin(playerProgress, eq(playerProgress.userId, users.id))
    .where(and(eq(users.isBanned, false), eq(userSettings.notificationsEnabled, true), isNotNull(userSettings.reminderHour)))
    .limit(5000);
  let sent = 0;
  for (const u of candidates) {
    if (sent >= budget) break;
    const tz = u.s.timezone;
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hourCycle: 'h23' }).format(now));
    if (hour !== u.s.reminderHour) continue;
    const today = dayKey(now, tz);
    if (u.p?.lastActiveDay === today) continue;
    const inserted = await db.insert(notificationLog).values({ userId: u.id, kind: 'daily_reminder', day: today }).onConflictDoNothing().returning({ id: notificationLog.id });
    if (!inserted.length) continue;
    const streak = effectiveStreak(u.p?.streakCurrent ?? 0, u.p?.lastActiveDay ?? null, today);
    const text = (TEXT[u.s.uiLanguage] ?? TEXT.uk)(streak);
    try {
      await botApi('sendMessage', { chat_id: u.telegramId, text, reply_markup: openButton() });
      sent++;
    } catch (e) {
      console.warn('reminder failed', u.id, (e as Error).message);
    }
  }
  return sent;
}

/** Наступна порція активної розсилки (статус SENDING). */
export async function sendCampaignChunk(budget = SEND_BUDGET) {
  const c = await db.query.notificationCampaigns.findFirst({ where: eq(notificationCampaigns.status, 'SENDING'), orderBy: asc(notificationCampaigns.createdAt) });
  if (!c) return 0;
  const batch = await db
    .select({ id: users.id, telegramId: users.telegramId, lang: userSettings.uiLanguage })
    .from(users)
    .innerJoin(userSettings, eq(userSettings.userId, users.id))
    .where(and(eq(users.isBanned, false), eq(userSettings.notificationsEnabled, true), c.cursor ? gt(users.id, c.cursor) : undefined))
    .orderBy(asc(users.id))
    .limit(budget);
  let sent = 0;
  for (const u of batch) {
    const text = c.message[u.lang] ?? c.message.uk;
    try {
      await botApi('sendMessage', { chat_id: u.telegramId, text, reply_markup: openButton() });
      sent++;
    } catch {
      /* користувач міг заблокувати бота */
    }
  }
  const done = batch.length < budget;
  await db
    .update(notificationCampaigns)
    .set({ sentCount: c.sentCount + sent, cursor: batch.at(-1)?.id ?? c.cursor, ...(done ? { status: 'SENT', sentAt: new Date() } : {}) })
    .where(eq(notificationCampaigns.id, c.id));
  return sent;
}

export async function runScheduled(now = new Date()) {
  if (!config.botToken) return;
  const campaign = await sendCampaignChunk();
  await sendReminders(now, SEND_BUDGET - campaign);
}
