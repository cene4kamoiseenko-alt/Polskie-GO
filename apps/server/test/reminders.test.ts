import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { sendReminders } from '../src/jobs';
import { disposeEnv, getEnv, login } from './helpers';

afterAll(disposeEnv);
afterEach(() => vi.unstubAllGlobals());

/** Перехоплює виклики Telegram Bot API, нічого не надсилаючи. */
function fakeTelegram() {
  const chats: number[] = [];
  vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
    chats.push(JSON.parse(String(init.body)).chat_id);
    return new Response(JSON.stringify({ ok: true, result: {} }), { headers: { 'content-type': 'application/json' } });
  });
  return chats;
}

describe('Навчальні нагадування (cron кожні 15 хв)', () => {
  it('фільтрує годину й пояс у SQL: лише ті, у кого зараз їхня година, хто сьогодні не вчився; не частіше разу на день', async () => {
    const { env } = await getEnv();
    // 2026-10-25 16:20 UTC = 17:20 у Варшаві (CET), 01:20 наступного дня в Токіо, 12:20 у Нью-Йорку.
    const now = new Date('2026-10-25T16:20:00Z');
    const mk = async (tz: string, hour: number | null, opts: { enabled?: boolean; activeToday?: string } = {}) => {
      const u = await login();
      await env.DB.prepare('UPDATE user_settings SET timezone = ?, reminder_hour = ?, notifications_enabled = ? WHERE user_id = ?')
        .bind(tz, hour, opts.enabled === false ? 0 : 1, u.user.id)
        .run();
      if (opts.activeToday) await env.DB.prepare('UPDATE player_progress SET last_active_day = ? WHERE user_id = ?').bind(opts.activeToday, u.user.id).run();
      return u.telegramId;
    };
    const warsaw = await mk('Europe/Warsaw', 17);
    const tokyo = await mk('Asia/Tokyo', 1);
    const ny = await mk('America/New_York', 12);
    await mk('Europe/Warsaw', 9); // інша година
    await mk('Europe/Warsaw', 17, { activeToday: '2026-10-25' }); // уже вчився сьогодні
    await mk('Europe/Warsaw', 17, { enabled: false }); // не погодився на сповіщення
    await mk('Mars/Olympus', 17); // невідомий пояс — пропускаємо, а не падаємо
    await mk('Asia/Tokyo', 17); // у Токіо вже 01:00

    const chats = fakeTelegram();
    const sent = await sendReminders(now);
    expect(sent).toBe(3);
    expect(chats.sort()).toEqual([warsaw, tokyo, ny].sort());

    // Наступний запуск у ту саму годину — нікому вдруге.
    const again = fakeTelegram();
    expect(await sendReminders(new Date('2026-10-25T16:35:00Z'))).toBe(0);
    expect(again).toEqual([]);
  });

  it('тримає бюджет запитів Worker', async () => {
    const { env } = await getEnv();
    const now = new Date('2026-10-26T08:05:00Z'); // 09:05 у Варшаві
    for (let i = 0; i < 4; i++) {
      const u = await login();
      await env.DB.prepare("UPDATE user_settings SET timezone = 'Europe/Warsaw', reminder_hour = 9, notifications_enabled = 1 WHERE user_id = ?").bind(u.user.id).run();
    }
    const chats = fakeTelegram();
    expect(await sendReminders(now, 2)).toBe(2);
    expect(chats).toHaveLength(2);
    // Решта отримає в наступному запуску тієї ж години.
    const rest = fakeTelegram();
    expect(await sendReminders(new Date('2026-10-26T08:20:00Z'), 35)).toBeGreaterThanOrEqual(2);
    expect(rest.length).toBeGreaterThanOrEqual(2);
  });
});
