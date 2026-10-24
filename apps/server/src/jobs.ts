/**
 * Фонові задачі: навчальні нагадування (перевірка кожні 15 хв, у годину, яку обрав користувач).
 * Надсилаються лише користувачам, які погодилися (notifications_enabled), не частіше разу на день.
 */
import type { FastifyBaseLogger } from 'fastify';
import { dayKey, effectiveStreak } from '@polski-go/shared';
import { prisma } from './db';
import { botApi } from './lib/telegram';
import { config } from './config';

const TEXT: Record<string, (streak: number) => string> = {
  uk: (s) => (s > 0 ? `🔥 Твоя серія — ${s} дн. Не переривай її! Бобек чекає на урок 🦫` : '🦫 Бобек сумує без тебе! 5 хвилин польської?'),
  ru: (s) => (s > 0 ? `🔥 Твоя серия — ${s} дн. Не прерывай её! Бобек ждёт урок 🦫` : '🦫 Бобек скучает! 5 минут польского?'),
  en: (s) => (s > 0 ? `🔥 Your streak is ${s} days. Keep it going! 🦫` : '🦫 Bobek misses you! 5 minutes of Polish?'),
  pl: (s) => (s > 0 ? `🔥 Twoja seria to ${s} dni. Nie przerywaj jej! 🦫` : '🦫 Bobek tęskni! 5 minut polskiego?'),
};

export async function sendReminders(now = new Date(), log?: FastifyBaseLogger) {
  const candidates = await prisma.user.findMany({
    where: { isBanned: false, settings: { notificationsEnabled: true, reminderHour: { not: null } } },
    include: { settings: true, progress: true },
    take: 5000,
  });
  let sent = 0;
  for (const u of candidates) {
    const tz = u.settings!.timezone;
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hourCycle: 'h23' }).format(now));
    if (hour !== u.settings!.reminderHour) continue;
    const today = dayKey(now, tz);
    if (u.progress?.lastActiveDay === today) continue;
    const { count } = await prisma.notificationLog.createMany({ data: [{ userId: u.id, kind: 'daily_reminder', day: today }], skipDuplicates: true });
    if (!count) continue;
    const streak = effectiveStreak(u.progress?.streakCurrent ?? 0, u.progress?.lastActiveDay ?? null, today);
    const text = (TEXT[u.settings!.uiLanguage] ?? TEXT.uk)(streak);
    try {
      await botApi('sendMessage', {
        chat_id: Number(u.telegramId),
        text,
        reply_markup: { inline_keyboard: [[{ text: '🚀 POLSKI GO', web_app: { url: config.webAppUrl } }]] },
      });
      sent++;
    } catch (e) {
      log?.warn({ err: e, userId: u.id }, 'reminder failed');
    }
  }
  return sent;
}

export function startJobs(log: FastifyBaseLogger) {
  const tick = () => sendReminders(new Date(), log).then((n) => n && log.info(`reminders sent: ${n}`)).catch((e) => log.error(e));
  setInterval(tick, 15 * 60 * 1000);
  setTimeout(tick, 10_000);
}
