/**
 * Разрешение писать игроку (allows_write_to_pm) и приглашение в игру из вопроса дня:
 *  • вход через Telegram запоминает, что бот может писать (bot_write_access), и не сбрасывает это, пока флаг не пришёл снова;
 *  • «нет чата с ботом» у рассылки снимается этим разрешением (правило dailyEligibility проверено в daily-quiz.test.ts);
 *  • вопрос дня всегда зовёт в игру: кнопка под вариантами и строка-приглашение;
 *  • диагностика админки: окно отправки, ближайшая отправка, «сегодня не уйдёт».
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { botWriteAccess } from '../src/db/schema';
import { upsertTelegramUser } from '../src/services/users';
import { dailyDiag, zonedTime, type DailyState } from '../src/bot/daily/state';
import { dailyQuestionView } from '../src/bot/daily/views';
import { DAILY_COPY } from '../src/bot/daily/copy';
import { QUIZ_QUESTIONS } from '../src/bot/quiz/questions';
import { disposeEnv, getEnv, login } from './helpers';

beforeAll(async () => {
  const { env } = await getEnv();
  env.WEB_APP_URL = 'https://polski.example/app/';
});
afterAll(disposeEnv);

let tg = 6_600_000 + Math.floor(Math.random() * 100_000);
const writeAllowed = async (id: number) => (await db.select({ at: botWriteAccess.allowedAt }).from(botWriteAccess).where(eq(botWriteAccess.telegramId, id)))[0]?.at ?? null;

describe('вход через Telegram запоминает, что боту можно писать', () => {
  it('новый игрок с allows_write_to_pm — отмечен; без флага — нет; флаг запоминается при следующем входе и не пропадает без него', async () => {
    const yes = tg++;
    const no = tg++;
    await upsertTelegramUser({ id: yes, first_name: 'Yes', allows_write_to_pm: true });
    await upsertTelegramUser({ id: no, first_name: 'No' });
    expect(await writeAllowed(yes)).toBeInstanceOf(Date);
    expect(await writeAllowed(no)).toBeNull();
    // Игрок разрешил позже, в окне приложения: при следующем входе Telegram присылает флаг.
    await upsertTelegramUser({ id: no, first_name: 'No', allows_write_to_pm: true });
    const granted = await writeAllowed(no);
    expect(granted).toBeInstanceOf(Date);
    // Вход без флага (старый клиент) уже полученное разрешение не стирает; частые входы запись не перезаписывают (не чаще раза в 6 часов).
    await upsertTelegramUser({ id: no, first_name: 'No' });
    await upsertTelegramUser({ id: no, first_name: 'No', allows_write_to_pm: true });
    expect((await writeAllowed(no))?.getTime()).toBe(granted!.getTime());
  });
});

describe('удаление аккаунта', () => {
  it('убирает и запись о разрешении писать (она привязана к Telegram id)', async () => {
    const id = 5_500_000 + Math.floor(Math.random() * 100_000);
    const u = await login({ user: JSON.stringify({ id, first_name: 'Gone', language_code: 'uk', allows_write_to_pm: true }) });
    expect(await writeAllowed(id)).toBeInstanceOf(Date);
    const res = await u.call('DELETE', '/api/me', { confirm: 'DELETE' });
    expect(res.status).toBe(200);
    expect(await writeAllowed(id)).toBeNull();
  });
});

describe('вопрос дня приглашает в игру', () => {
  const q = QUIZ_QUESTIONS[0];
  const buttons = (kb: ReturnType<typeof dailyQuestionView>['keyboard']) => kb.inline_keyboard.flat();
  // Последняя строка — «🔕 Не присылать вопрос дня» (отказ без ответа, 2026-11-16), приглашение в игру — перед ней.
  it('у игрока приложения после ответов — «пройти урок» (web_app на learn), без серии тоже; у человека без аккаунта — «начать учить» на главную', () => {
    for (const lang of ['ru', 'uk', 'en'] as const) {
      const mine = dailyQuestionView(q, [0, 1, 2, 3], lang, 'r1', { streak: null, returning: false, hasUser: true });
      const invite = buttons(mine.keyboard).at(-2)!;
      expect(invite).toHaveProperty('web_app');
      expect((invite as { web_app: { url: string } }).web_app.url).toContain('learn');
      expect(buttons(mine.keyboard).at(-1)).toEqual({ text: DAILY_COPY[lang].off, callback_data: 'qz:daily:0' });
      expect(mine.text).toContain('🎮');
      const guest = dailyQuestionView(q, [0, 1, 2, 3], lang, 'r2', { streak: null, returning: false, hasUser: false });
      const home = (buttons(guest.keyboard).at(-2) as { web_app: { url: string } }).web_app.url;
      expect(home).not.toContain('learn'); // главный экран приложения, без перехода на вкладку уроков
      expect(buttons(guest.keyboard).at(-1)).toEqual({ text: DAILY_COPY[lang].off, callback_data: 'qz:daily:0' });
    }
  });
  it('кнопки ответов по-прежнему идут первыми (callback), затем приглашение, последней — отказ от рассылки', () => {
    const v = dailyQuestionView(q, [0, 1, 2, 3], 'ru', 'r3', { streak: 5, returning: false, hasUser: true });
    const all = buttons(v.keyboard);
    expect(all.slice(0, 4).every((b) => 'callback_data' in b && b.callback_data.startsWith('qa:'))).toBe(true);
    expect(all.filter((b) => 'web_app' in b)).toHaveLength(1);
    expect('web_app' in all[4]).toBe(true);
    expect(all[5]).toEqual({ text: '🔕 Не присылать вопрос дня', callback_data: 'qz:daily:0' });
    expect(all).toHaveLength(6);
  });
});

describe('диагностика рассылки для админки', () => {
  const day = '2027-01-12';
  const state: DailyState = { enabled: true, sendAt: '12:00', startDay: day };
  const at = (utc: string) => new Date(`${day}T${utc}:00Z`);
  it('до окна: ближайшая отправка сегодня в 12:00 по Варшаве; внутри окна — открыто; после — завтра и «сегодня не уйдёт», если отправка не шла', () => {
    const noon = zonedTime(day, '12:00').getTime();
    const before = dailyDiag(state, null, null, at('10:30')); // 11:30 по Варшаве
    expect(before.window.phase).toBe('before');
    expect(before.nextSendAt).toBe(noon);
    expect(before.missedToday).toBe(false);
    expect(before.tickAt).toBeNull();
    expect(dailyDiag(state, null, 123, at('12:00')).window.phase).toBe('open'); // 13:00 по Варшаве
    const late = dailyDiag(state, null, null, at('16:30')); // 17:30 по Варшаве — окно (до 16:00) закрыто
    expect(late.window.phase).toBe('closed');
    expect(late.missedToday).toBe(true);
    expect(late.nextSendAt).toBe(zonedTime('2027-01-13', '12:00').getTime());
    // Отправка сегодня шла — «не уйдёт» не показываем.
    expect(dailyDiag(state, { day, cursor: 5, done: true, startedAt: noon }, null, at('16:30')).missedToday).toBe(false);
    // Выключена: ближайшей отправки нет, предупреждения нет.
    const off = dailyDiag({ ...state, enabled: false }, null, null, at('16:30'));
    expect(off.nextSendAt).toBeNull();
    expect(off.missedToday).toBe(false);
    // Запуск с будущего дня: ближайшая отправка — в день старта.
    expect(dailyDiag({ ...state, startDay: '2027-01-15' }, null, null, at('10:30')).nextSendAt).toBe(zonedTime('2027-01-15', '12:00').getTime());
  });
});
