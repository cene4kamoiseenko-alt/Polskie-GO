/**
 * Приглашение друга картинкой (2026-11-15): сервер сохраняет у бота сообщение (savePreparedInlineMessage) — картинка владельца на
 * языке игрока, подпись и кнопка со ссылкой-приглашением; приложение отдаёт id в Telegram.WebApp.shareMessage.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { userSettings, users } from '../src/db/schema';
import { getEnv, login } from './helpers';
import { fakeTelegram, tgError } from './tg-fake';

afterEach(() => vi.unstubAllGlobals());

const prepared = (id: string) => new Response(JSON.stringify({ ok: true, result: { id, expiration_date: 2_000_000_000 } }), { headers: { 'content-type': 'application/json' } });

describe('приглашение друга картинкой', () => {
  it('русский интерфейс — русская картинка, подпись и кнопка «Играть вместе» с реферальной ссылкой', async () => {
    const { env } = await getEnv();
    env.WEB_APP_URL = 'https://polski.example/';
    const p = await login();
    await db.update(userSettings).set({ uiLanguage: 'ru' }).where(eq(userSettings.userId, p.user.id));
    const calls = fakeTelegram((c) => (c.method === 'savePreparedInlineMessage' ? prepared('pm-ru-1') : undefined));
    const res = await p.call('POST', '/api/friends/invite/prepare', {});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'pm-ru-1' });

    const call = calls.find((c) => c.method === 'savePreparedInlineMessage')!;
    expect(Number(call.params.user_id)).toBe(p.telegramId);
    expect(call.params.result.type).toBe('photo');
    expect(call.params.result.photo_url).toMatch(/^https:\/\/polski\.example\/bot\/invite\/ru\.jpg\?v=/);
    expect(call.params.result.caption).toMatch(/польский/);
    const button = call.params.result.reply_markup.inline_keyboard[0][0];
    expect(button.text).toBe('Играть вместе');
    const friends = (await p.call('GET', '/api/friends')).body;
    expect(button.url).toBe(friends.inviteLink);
    expect(button.url).toMatch(/startapp=ref_/);
    expect(call.params.allow_user_chats).toBe(true);
  });

  it('украинский — украинская картинка; английский — картинка без надписей', async () => {
    const { env } = await getEnv();
    env.WEB_APP_URL = 'https://polski.example/';
    const uk = await login();
    const en = await login();
    await db.update(userSettings).set({ uiLanguage: 'uk' }).where(eq(userSettings.userId, uk.user.id));
    await db.update(userSettings).set({ uiLanguage: 'en' }).where(eq(userSettings.userId, en.user.id));
    const calls = fakeTelegram((c) => (c.method === 'savePreparedInlineMessage' ? prepared('pm') : undefined));
    await uk.call('POST', '/api/friends/invite/prepare', {});
    await en.call('POST', '/api/friends/invite/prepare', {});
    const sent = calls.filter((c) => c.method === 'savePreparedInlineMessage');
    expect(sent[0].params.result.photo_url).toContain('/bot/invite/uk.jpg');
    expect(sent[0].params.result.reply_markup.inline_keyboard[0][0].text).toBe('Грати разом');
    expect(sent[1].params.result.photo_url).toContain('/bot/commands/start.jpg');
  });

  it('Telegram отказал или вход не через Telegram — ошибка, приложение отправит обычную ссылку', async () => {
    const { env } = await getEnv();
    env.WEB_APP_URL = 'https://polski.example/';
    const p = await login();
    fakeTelegram((c) => (c.method === 'savePreparedInlineMessage' ? tgError(400, 'Bad Request: USER_ID_INVALID') : undefined));
    expect((await p.call('POST', '/api/friends/invite/prepare', {})).status).toBe(502);

    const guest = await login();
    await db.update(users).set({ telegramId: -Math.abs(guest.telegramId) }).where(eq(users.id, guest.user.id));
    expect((await guest.call('POST', '/api/friends/invite/prepare', {})).status).toBe(400);
  });
});
