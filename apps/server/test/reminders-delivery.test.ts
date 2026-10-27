/**
 * Учебные напоминания как фото с кнопкой Mini App и безопасная доставка:
 * три сценария по реальным данным, ошибка Telegram не оставляет ложного «отправлено», повтор с лимитом попыток,
 * неопределённый результат не дублируется, параллельные cron не шлют дважды, согласие и /stop.
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { notificationLog, playerProgress, userSettings } from '../src/db/schema';
import { NOTIFY_MAX_ATTEMPTS, pickReminderKind, reminderCard, runScheduled, sendReminders } from '../src/jobs';
import { BOT_TOKEN, disposeEnv, getEnv, login, request } from './helpers';
import { fakeTelegram, tgError, type TgCall } from './tg-fake';

const ORIGIN = 'https://polski.example';

beforeAll(async () => {
  const { env } = await getEnv();
  env.WEB_APP_URL = `${ORIGIN}/`;
});
afterAll(disposeEnv);
afterEach(() => vi.unstubAllGlobals());
// Каждый тест работает со своими пользователями: прежние не получают напоминаний.
beforeEach(async () => {
  const { env } = await getEnv();
  await env.DB.prepare('UPDATE user_settings SET notifications_enabled = 0').run();
});

/** 09:05 по Варшаве (CET, зима) выбранного дня. */
const at = (day: string, time = '08:05:00') => new Date(`${day}T${time}Z`);

async function mk(o: { lang?: string; streak?: number; last?: string | null; hour?: number | null } = {}) {
  const u = await login();
  await db
    .update(userSettings)
    .set({ timezone: 'Europe/Warsaw', reminderHour: o.hour === undefined ? 9 : o.hour, notificationsEnabled: true, uiLanguage: o.lang ?? 'ru' })
    .where(eq(userSettings.userId, u.user.id));
  await db.update(playerProgress).set({ streakCurrent: o.streak ?? 0, lastActiveDay: o.last ?? null }).where(eq(playerProgress.userId, u.user.id));
  return u;
}
const logs = (userId: string) => db.select().from(notificationLog).where(eq(notificationLog.userId, userId));
const reminder = async (userId: string) => (await logs(userId)).find((r) => r.kind === 'daily_reminder')!;
const to = (calls: TgCall[], chat: number) => calls.filter((c) => c.params.chat_id === chat);
const button = (call: TgCall) => call.params.reply_markup.inline_keyboard[0][0] as { text: string; web_app: { url: string } };

describe('три сценария: фото, текст и кнопка по реальным данным', () => {
  it('обычное, серия и возвращение; серия в 1 день — обычное нагадування', async () => {
    const day = '2026-11-03';
    const plain = await mk({ lang: 'ru' });
    const streak = await mk({ lang: 'uk', streak: 3, last: '2026-11-02' });
    const comeback = await mk({ lang: 'pl', last: '2026-10-28' });
    const oneDay = await mk({ lang: 'en', streak: 1, last: '2026-11-02' });
    const calls = fakeTelegram();
    expect(await sendReminders(at(day))).toBe(4);

    const p = to(calls, plain.telegramId)[0];
    expect(p.method).toBe('sendPhoto');
    expect(p.params.photo).toBe(`${ORIGIN}/bot/commands/reminder-lesson.jpg`);
    expect(p.params.caption).toMatch(/^🇵🇱 Cześć! Бобек уже приготовил для тебя новый урок! 🦫📚\nНайдёшь пять минут для польского\?/);
    expect(p.params.caption).toContain('/stop — отключить напоминания');
    expect(button(p)).toEqual({ text: '📚 Продолжить урок', web_app: { url: `${ORIGIN}/?bot_screen=learn` } });

    const s = to(calls, streak.telegramId)[0];
    expect(s.params.photo).toBe(`${ORIGIN}/bot/commands/reminder-streak.jpg`);
    expect(s.params.caption).toContain('🔥 Твоя серія навчання — 3 дні!');
    expect(button(s).web_app.url).toBe(`${ORIGIN}/?bot_screen=learn`);

    const r = to(calls, comeback.telegramId)[0];
    expect(r.params.photo).toBe(`${ORIGIN}/bot/commands/reminder-return.jpg`);
    expect(r.params.caption).toContain('Dawno się nie widzieliśmy!');
    expect(button(r).web_app.url).toBe(`${ORIGIN}/`);

    const o = to(calls, oneDay.telegramId)[0];
    expect(o.params.photo).toBe(`${ORIGIN}/bot/commands/reminder-lesson.jpg`);
    expect(o.params.caption).toContain('Bobek has a new lesson ready for you');

    for (const [u, template, lang] of [[plain, 'lesson', 'ru'], [streak, 'streak', 'uk'], [comeback, 'return', 'pl'], [oneDay, 'lesson', 'en']] as const) {
      expect(await reminder(u.user.id)).toMatchObject({ status: 'SENT', template, lang, method: 'sendPhoto', attempts: 1, day, leaseUntil: null, error: null });
      expect((await reminder(u.user.id)).telegramMessageId).toEqual(expect.any(Number));
    }
  });

  it('выбор сценария и текст по данным (без вымышленных наград)', () => {
    expect(pickReminderKind(0, null, '2026-11-03')).toBe('lesson');
    expect(pickReminderKind(1, '2026-11-02', '2026-11-03')).toBe('lesson');
    expect(pickReminderKind(2, '2026-11-02', '2026-11-03')).toBe('streak');
    expect(pickReminderKind(0, '2026-11-01', '2026-11-03')).toBe('lesson'); // два дня паузы — ещё не «возвращение»
    expect(pickReminderKind(0, '2026-10-31', '2026-11-03')).toBe('return');
    expect(pickReminderKind(9, '2026-10-20', '2026-11-03')).toBe('return');
    for (const kind of ['lesson', 'streak', 'return'] as const) {
      for (const lang of ['ru', 'uk', 'pl', 'en', 'xx']) expect(reminderCard(lang, kind, 5).text).not.toMatch(/\+\d+ ?XP|złot/i);
    }
    expect(reminderCard('xx', 'lesson', 0).text).toContain('Бобек уже приготував'); // неизвестный язык → украинский
  });

  it('согласие, час и пояс: без согласия, без часа или не в их час напоминания нет', async () => {
    const day = '2026-11-04';
    const off = await mk();
    await db.update(userSettings).set({ notificationsEnabled: false }).where(eq(userSettings.userId, off.user.id));
    const noHour = await mk({ hour: null });
    const other = await mk({ hour: 18 });
    const calls = fakeTelegram();
    expect(await sendReminders(at(day))).toBe(0);
    expect(calls).toHaveLength(0);
    for (const u of [off, noHour, other]) expect(await logs(u.user.id)).toHaveLength(0);
  });

  it('/stop выключает нагадування: после него cron ничего не шлёт этому пользователю', async () => {
    const day = '2026-11-05';
    const u = await mk();
    const keep = await mk();
    const stop = fakeTelegram();
    const res = await request('POST', '/telegram/webhook', { update_id: 777_001, message: { message_id: 1, chat: { id: u.telegramId, type: 'private' }, from: { id: u.telegramId, first_name: 'X', language_code: 'ru' }, text: '/stop' } }, { 'x-telegram-bot-api-secret-token': 'hook-secret' });
    expect(res.status).toBe(200);
    expect(stop).toHaveLength(1);
    const calls = fakeTelegram();
    expect(await sendReminders(at(day))).toBe(1);
    expect(calls.map((c) => c.params.chat_id)).toEqual([keep.telegramId]);
  });
});

describe('ошибка Telegram не оставляет ложного «отправлено»', () => {
  it('сбой 502: запись FAILED с временем повтора, затем повтор доставляет ровно один раз', async () => {
    const day = '2026-11-06';
    const u = await mk();
    const failing = fakeTelegram(() => tgError(502, 'Bad Gateway'));
    expect(await sendReminders(at(day))).toBe(0);
    expect(failing).toHaveLength(1);
    expect(await reminder(u.user.id)).toMatchObject({ status: 'FAILED', attempts: 1, leaseUntil: null, sentAt: null });
    expect((await reminder(u.user.id)).error).toContain('Bad Gateway');
    expect((await reminder(u.user.id)).nextAttemptAt!.getTime()).toBe(at(day).getTime() + 5 * 60_000);

    // Раньше срока повтора — тишина.
    const early = fakeTelegram();
    expect(await sendReminders(at(day, '08:08:00'))).toBe(0);
    expect(early).toHaveLength(0);

    const ok = fakeTelegram();
    expect(await sendReminders(at(day, '08:20:00'))).toBe(1);
    expect(to(ok, u.telegramId)).toHaveLength(1);
    expect(await reminder(u.user.id)).toMatchObject({ status: 'SENT', attempts: 2, nextAttemptAt: null, error: null });

    const after = fakeTelegram();
    expect(await sendReminders(at(day, '08:35:00'))).toBe(0);
    expect(after).toHaveLength(0);
  });

  it('лимит запросов 429: повтор не раньше retry_after', async () => {
    const day = '2026-11-07';
    const u = await mk();
    fakeTelegram(() => tgError(429, 'Too Many Requests: retry after 3600', 3600));
    await sendReminders(at(day));
    expect((await reminder(u.user.id)).nextAttemptAt!.getTime()).toBe(at(day).getTime() + 3600_000);
  });

  it(`число попыток ограничено (${NOTIFY_MAX_ATTEMPTS}), затем запись остаётся FAILED без повторов`, async () => {
    const day = '2026-11-08';
    const u = await mk();
    const failing = fakeTelegram(() => tgError(500, 'Internal Server Error'));
    for (const time of ['08:05:00', '08:20:00', '08:50:00']) await sendReminders(at(day, time));
    expect(failing).toHaveLength(NOTIFY_MAX_ATTEMPTS);
    expect(await reminder(u.user.id)).toMatchObject({ status: 'FAILED', attempts: NOTIFY_MAX_ATTEMPTS, nextAttemptAt: null });
    const more = fakeTelegram();
    await sendReminders(at(day, '09:20:00'));
    expect(more).toHaveLength(0);
  });

  it('запрос отклонён (400): повторов нет', async () => {
    const day = '2026-11-09';
    const u = await mk();
    const calls = fakeTelegram(() => tgError(400, 'Bad Request: chat not found'));
    await sendReminders(at(day));
    // Фото не ушло из-за запроса — сначала запасной текст; он тоже отклонён.
    expect(calls.map((c) => c.method)).toEqual(['sendPhoto', 'sendMessage']);
    expect(await reminder(u.user.id)).toMatchObject({ status: 'FAILED', attempts: 1, nextAttemptAt: null });
    const later = fakeTelegram();
    await sendReminders(at(day, '08:35:00'));
    expect(later).toHaveLength(0);
  });

  it('бот заблокирован (403): BLOCKED, 30 дней без попыток, потом снова пробуем', async () => {
    const u = await mk();
    const first = fakeTelegram(() => tgError(403, 'Forbidden: bot was blocked by the user'));
    await sendReminders(at('2026-11-10'));
    expect(first).toHaveLength(1);
    expect(await reminder(u.user.id)).toMatchObject({ status: 'BLOCKED', nextAttemptAt: null });
    const quiet = fakeTelegram();
    await sendReminders(at('2026-11-11'));
    await sendReminders(at('2026-12-01'));
    expect(quiet).toHaveLength(0);
    const later = fakeTelegram();
    await sendReminders(at('2026-12-15'));
    expect(to(later, u.telegramId)).toHaveLength(1);
  });

  it('неопределённый результат (обрыв сети): UNKNOWN, автоматически не повторяется; токен в журнал не попадает', async () => {
    const day = '2026-11-12';
    const u = await mk();
    const calls = fakeTelegram(() => new Error(`connect failed: https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`));
    await sendReminders(at(day));
    expect(calls).toHaveLength(1); // запасной текст не пробуем: фото могло дойти
    const row = await reminder(u.user.id);
    expect(row).toMatchObject({ status: 'UNKNOWN', attempts: 1, nextAttemptAt: null });
    expect(row.error).toContain('network');
    expect(row.error).not.toContain(BOT_TOKEN);
    const later = fakeTelegram();
    await sendReminders(at(day, '08:20:00'));
    await sendReminders(at(day, '08:35:00'));
    expect(later).toHaveLength(0);
  });

  it('воркер упал после захвата: прострочена аренда → UNKNOWN без повторной отправки; живая аренда не трогается', async () => {
    const day = '2026-11-13';
    const dead = await mk();
    const live = await mk();
    const now = at(day);
    for (const [u, lease] of [[dead, now.getTime() - 60_000], [live, now.getTime() + 60_000]] as const) {
      await db.insert(notificationLog).values({ userId: u.user.id, kind: 'daily_reminder', day, status: 'PENDING', attempts: 1, leaseUntil: new Date(lease), template: 'lesson', lang: 'ru' });
    }
    const calls = fakeTelegram();
    expect(await sendReminders(now)).toBe(0);
    expect(calls).toHaveLength(0);
    expect(await reminder(dead.user.id)).toMatchObject({ status: 'UNKNOWN', error: 'lease_expired' });
    expect(await reminder(live.user.id)).toMatchObject({ status: 'PENDING' });
  });

  it('фото не ушло из-за картинки (400) — тот же текст и кнопка сообщением; запись SENT с пометкой', async () => {
    const day = '2026-11-14';
    const u = await mk();
    const calls = fakeTelegram((c) => (c.method === 'sendPhoto' ? tgError(400, 'Bad Request: wrong type of the web page content') : undefined));
    expect(await sendReminders(at(day))).toBe(1);
    expect(calls.map((c) => c.method)).toEqual(['sendPhoto', 'sendMessage']);
    expect(calls[1].params.text).toBe(calls[0].params.caption);
    expect(calls[1].params.reply_markup).toEqual(calls[0].params.reply_markup);
    expect(await reminder(u.user.id)).toMatchObject({ status: 'SENT', method: 'sendMessage' });
    expect((await reminder(u.user.id)).error).toContain('photo:');
  });
});

describe('повторы и параллельные запуски', () => {
  it('три одновременных cron-запуска: каждому пользователю ровно одно сообщение и одна запись', async () => {
    const day = '2026-11-15';
    const users = await Promise.all([mk(), mk(), mk(), mk(), mk()]);
    const calls = fakeTelegram();
    const sent = await Promise.all([sendReminders(at(day)), sendReminders(at(day)), sendReminders(at(day))]);
    expect(sent.reduce((a, b) => a + b, 0)).toBe(5);
    expect(calls).toHaveLength(5);
    expect(new Set(calls.map((c) => c.params.chat_id))).toEqual(new Set(users.map((u) => u.telegramId)));
    for (const u of users) {
      const rows = (await logs(u.user.id)).filter((r) => r.kind === 'daily_reminder');
      expect(rows).toHaveLength(1);
      expect(rows[0].status).toBe('SENT');
    }
  });

  it('повтор после сбоя берёт один из двух параллельных запусков', async () => {
    const day = '2026-11-16';
    const u = await mk();
    fakeTelegram(() => tgError(502, 'Bad Gateway'));
    await sendReminders(at(day));
    const calls = fakeTelegram();
    await Promise.all([sendReminders(at(day, '08:20:00')), sendReminders(at(day, '08:20:00'))]);
    expect(to(calls, u.telegramId)).toHaveLength(1);
    expect(await reminder(u.user.id)).toMatchObject({ status: 'SENT', attempts: 2 });
  });

  it('повтор отменяется, если пользователь уже занимался или отозвал согласие', async () => {
    const day = '2026-11-17';
    const learned = await mk();
    const revoked = await mk();
    fakeTelegram(() => tgError(502, 'Bad Gateway'));
    await sendReminders(at(day));
    await db.update(playerProgress).set({ lastActiveDay: day }).where(eq(playerProgress.userId, learned.user.id));
    await db.update(userSettings).set({ notificationsEnabled: false }).where(eq(userSettings.userId, revoked.user.id));
    const calls = fakeTelegram();
    await sendReminders(at(day, '08:20:00'));
    expect(calls).toHaveLength(0);
    expect(await reminder(learned.user.id)).toMatchObject({ status: 'SKIPPED', error: 'already_active', nextAttemptAt: null });
    expect(await reminder(revoked.user.id)).toMatchObject({ status: 'SKIPPED', error: 'consent_withdrawn', nextAttemptAt: null });
  });

  it('вчерашний повтор на следующий день не уходит со старой датой', async () => {
    const day = '2026-11-18';
    const u = await mk();
    fakeTelegram(() => tgError(502, 'Bad Gateway'));
    await sendReminders(at(day));
    // Час напоминания сменили, поэтому нового нагадування в этот день у пользователя нет — остаётся только вчерашний повтор.
    await db.update(userSettings).set({ reminderHour: 3 }).where(eq(userSettings.userId, u.user.id));
    const calls = fakeTelegram();
    await sendReminders(at('2026-11-19', '08:05:00'));
    expect(calls).toHaveLength(0);
    expect(await reminder(u.user.id)).toMatchObject({ status: 'SKIPPED', error: 'day_passed', day });
  });

  it('бюджет считается вызовами Bot API: фото + запасной текст — два вызова', async () => {
    const day = '2026-11-19';
    const a = await mk();
    const b = await mk();
    const calls = fakeTelegram((c) => (c.method === 'sendPhoto' ? tgError(400, 'Bad Request: failed to get HTTP URL content') : undefined));
    expect(await sendReminders(at(day), 2)).toBe(1);
    expect(calls).toHaveLength(2);
    expect(await sendReminders(at(day, '08:20:00'), 35)).toBe(1);
    const sentTo = new Set(calls.filter((c) => c.method === 'sendMessage').map((c) => c.params.chat_id));
    expect(sentTo).toEqual(new Set([a.telegramId, b.telegramId]));
  });

  it('runScheduled чистит старые update_id и не падает без токена', async () => {
    const { env } = await getEnv();
    await env.DB.prepare('INSERT INTO telegram_updates (update_id, created_at) VALUES (1, ?), (2, ?)').bind(Date.now() - 10 * 86_400_000, Date.now()).run();
    fakeTelegram();
    await runScheduled(new Date());
    const rows = (await env.DB.prepare('SELECT update_id FROM telegram_updates WHERE update_id IN (1, 2)').all()).results.map((r) => r.update_id);
    expect(rows).toEqual([2]);
  });
});
