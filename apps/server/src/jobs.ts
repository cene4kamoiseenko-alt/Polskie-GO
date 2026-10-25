/**
 * Фонові задачі (Cron Trigger кожні 15 хв):
 *  • навчальні нагадування — у годину, яку обрав користувач, не частіше разу на день;
 *  • розсилки з адмінки — частинами, щоб не перевищити ліміт підзапитів Worker.
 * Надсилається лише користувачам, які погодилися на сповіщення (notifications_enabled).
 */
import { and, asc, eq, gt, isNotNull, isNull, ne, notExists, or, sql } from 'drizzle-orm';
import { dayKey, effectiveStreak } from '@polski-go/shared';
import { db } from './db';
import { notificationCampaigns, notificationLog, playerProgress, userSettings, users } from './db/schema';
import { botApi } from './lib/telegram';
import { config } from './env';
import { pruneUsage } from './services/quota';

/** Безкоштовний Worker має ліміт 50 підзапитів за виклик — лишаємо запас на запити до БД. */
const SEND_BUDGET = 35;

const TEXT: Record<string, (streak: number) => string> = {
  uk: (s) => (s > 0 ? `🔥 Твоя серія — ${s} дн. Не переривай її! Бобек чекає на урок 🦫` : '🦫 Бобек сумує без тебе! 5 хвилин польської?'),
  ru: (s) => (s > 0 ? `🔥 Твоя серия — ${s} дн. Не прерывай её! Бобек ждёт урок 🦫` : '🦫 Бобек скучает! 5 минут польского?'),
  en: (s) => (s > 0 ? `🔥 Your streak is ${s} days. Keep it going! 🦫` : '🦫 Bobek misses you! 5 minutes of Polish?'),
  pl: (s) => (s > 0 ? `🔥 Twoja seria to ${s} dni. Nie przerywaj jej! 🦫` : '🦫 Bobek tęskni! 5 minut polskiego?'),
};

const openButton = () => ({ inline_keyboard: [[{ text: '🚀 POLSKI GO', web_app: { url: config.webAppUrl } }]] });

/** Місцева година й ключ дня в поясі користувача; невідомий пояс — null (такого користувача пропускаємо). */
function localClock(now: Date, timeZone: string): { hour: number; day: string } | null {
  try {
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', hourCycle: 'h23' }).format(now));
    return { hour, day: dayKey(now, timeZone) };
  } catch {
    return null;
  }
}

/** D1 приймає до 100 параметрів на запит; на один пояс їх 5. */
const TZ_PER_QUERY = 16;

export async function sendReminders(now = new Date(), budget = SEND_BUDGET) {
  if (budget <= 0) return 0;
  // 1) Які пояси зараз у годині нагадування: DISTINCT (пояс, година) — кілька рядків замість тисяч користувачів.
  const pairs = await db
    .selectDistinct({ tz: userSettings.timezone, hour: userSettings.reminderHour })
    .from(userSettings)
    .where(and(eq(userSettings.notificationsEnabled, true), isNotNull(userSettings.reminderHour)));
  const due = new Map<string, { hour: number; day: string }>();
  for (const p of pairs) {
    const clock = localClock(now, p.tz);
    if (clock && clock.hour === p.hour) due.set(p.tz, clock);
  }
  // 2) Лише ті, кому саме зараз: їхня година в їхньому поясі, сьогодні ще не вчилися й не отримували нагадування.
  const tzs = [...due.keys()];
  let sent = 0;
  for (let i = 0; i < tzs.length && sent < budget; i += TZ_PER_QUERY) {
    const byZone = tzs.slice(i, i + TZ_PER_QUERY).map((tz) => {
      const { hour, day } = due.get(tz)!;
      return and(
        eq(userSettings.timezone, tz),
        eq(userSettings.reminderHour, hour),
        or(isNull(playerProgress.lastActiveDay), ne(playerProgress.lastActiveDay, day)),
        notExists(
          db
            .select({ x: sql`1` })
            .from(notificationLog)
            .where(and(eq(notificationLog.userId, users.id), eq(notificationLog.kind, 'daily_reminder'), eq(notificationLog.day, day))),
        ),
      );
    });
    const candidates = await db
      .select({ id: users.id, telegramId: users.telegramId, tz: userSettings.timezone, lang: userSettings.uiLanguage, p: playerProgress })
      .from(users)
      .innerJoin(userSettings, eq(userSettings.userId, users.id))
      .leftJoin(playerProgress, eq(playerProgress.userId, users.id))
      .where(and(eq(users.isBanned, false), eq(userSettings.notificationsEnabled, true), or(...byZone)))
      .limit(budget - sent);
    for (const u of candidates) {
      if (sent >= budget) break;
      const today = due.get(u.tz)!.day;
      // Дедуплікація лишається на рівні журналу: паралельний запуск не надішле вдруге.
      const inserted = await db.insert(notificationLog).values({ userId: u.id, kind: 'daily_reminder', day: today }).onConflictDoNothing().returning({ id: notificationLog.id });
      if (!inserted.length) continue;
      const streak = effectiveStreak(u.p?.streakCurrent ?? 0, u.p?.lastActiveDay ?? null, today);
      const text = (TEXT[u.lang] ?? TEXT.uk)(streak);
      try {
        await botApi('sendMessage', { chat_id: u.telegramId, text, reply_markup: openButton() });
        sent++;
      } catch (e) {
        console.warn('reminder failed', u.id, (e as Error).message);
      }
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
  await pruneUsage(now);
  if (!config.botToken) return;
  const campaign = await sendCampaignChunk();
  await sendReminders(now, SEND_BUDGET - campaign);
}
