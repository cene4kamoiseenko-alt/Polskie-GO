/**
 * Аудитория бота в админке: кто писал боту (bot_contacts) и кто открывал Mini App (users) — одним списком.
 * Webhook настоящий (Miniflare D1), Bot API подменён. Проверяется запись из личных сообщений, кнопок и блокировки бота,
 * что группы и боты не записываются, фильтры, поиск, счётчики и права (EDITOR не видит людей).
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { botContacts, users } from '../src/db/schema';
import { disposeEnv, getEnv, login, request } from './helpers';
import { fakeTelegram } from './tg-fake';

beforeAll(async () => {
  const { env } = await getEnv();
  env.WEB_APP_URL = 'https://polski.example/app/';
  env.TELEGRAM_BOT_USERNAME = 'Polski_Go_Bot';
});
afterAll(disposeEnv);
afterEach(() => vi.unstubAllGlobals());

let upd = 90_000;
let nextTg = 7_700_000 + Math.floor(Math.random() * 100_000);
type From = { id: number; first_name: string; last_name?: string; username?: string; language_code?: string; is_bot?: boolean };
const person = (extra: Partial<From> = {}): From => ({ id: nextTg++, first_name: 'Olena', language_code: 'ru', ...extra });
const hook = (body: unknown) => request('POST', '/telegram/webhook', body, { 'x-telegram-bot-api-secret-token': 'hook-secret' });
const say = (f: From, text: string, chatType = 'private') => {
  fakeTelegram();
  return hook({ update_id: ++upd, message: { message_id: upd, chat: { id: chatType === 'private' ? f.id : -100123, type: chatType }, from: f, text } });
};
const member = (f: From, status: 'kicked' | 'member') => {
  fakeTelegram();
  return hook({ update_id: ++upd, my_chat_member: { chat: { id: f.id, type: 'private' }, from: f, date: 1, old_chat_member: { status: 'member' }, new_chat_member: { status } } });
};
const contact = async (id: number) => (await db.select().from(botContacts).where(eq(botContacts.telegramId, id)))[0];

async function admin(role: 'SUPERADMIN' | 'EDITOR' | 'SUPPORT' = 'SUPERADMIN') {
  const login = async (email: string, password: string) => (await request('POST', '/api/admin/login', { email, password })).body.token as string;
  let token = await login('admin@test.dev', 'admin-password-123');
  if (role !== 'SUPERADMIN') {
    const email = `${role.toLowerCase()}-${nextTg++}@test.dev`;
    await request('POST', '/api/admin/admins', { email, name: role, role, password: 'role-password-123' }, { authorization: `Bearer ${token}` });
    token = await login(email, 'role-password-123');
  }
  return (url: string) => request('GET', `/api/admin${url}`, undefined, { authorization: `Bearer ${token}` });
}
type Row = { telegramId: string; userId: string | null; firstName: string; username: string | null; inBot: boolean; appOpened: boolean; startParam: string | null; lastCommand: string | null; blockedAt: number | null; appSince: number | null; language: string | null };
const find = (items: Row[], id: number) => items.find((r) => r.telegramId === String(id));

describe('аудитория бота: запись из webhook', () => {
  it('/start без приложения: человек записан с параметром /start; следующая команда не меняет первый параметр', async () => {
    const f = person({ username: 'olena_pl', last_name: 'K' });
    expect((await say(f, '/start screen_map')).status).toBe(200);
    const first = await contact(f.id);
    expect(first).toMatchObject({ firstName: 'Olena', lastName: 'K', username: 'olena_pl', languageCode: 'ru', startParam: 'screen_map', lastCommand: 'start', blockedAt: null });
    await say({ ...f, first_name: 'Olena M.' }, '/help');
    const second = await contact(f.id);
    expect(second).toMatchObject({ firstName: 'Olena M.', startParam: 'screen_map', lastCommand: 'help' });
    expect(second.firstSeenAt.getTime()).toBe(first.firstSeenAt.getTime());
    expect(second.lastSeenAt.getTime()).toBeGreaterThanOrEqual(first.lastSeenAt.getTime());
  });

  it('обычный текст, кнопка панели и нажатие inline-кнопки тоже обновляют контакт', async () => {
    const f = person();
    await say(f, 'Привет!');
    expect((await contact(f.id)).lastCommand).toBe('text');
    fakeTelegram();
    await hook({ update_id: ++upd, callback_query: { id: 'cb1', from: f, message: { message_id: 1, chat: { id: f.id, type: 'private' } }, data: 'quiz:x' } });
    expect((await contact(f.id)).lastCommand).toBe('button');
  });

  it('блокировка бота: kicked ставит отметку, разблокировка и новое сообщение её снимают', async () => {
    const f = person();
    await say(f, '/start');
    expect((await member(f, 'kicked')).status).toBe(200);
    expect((await contact(f.id)).blockedAt).toBeInstanceOf(Date);
    await member(f, 'member');
    expect((await contact(f.id)).blockedAt).toBeNull();
    await member(f, 'kicked');
    await say(f, '/start');
    expect((await contact(f.id)).blockedAt).toBeNull();
  });

  it('группы, другие боты и чужой секрет webhook не записываются', async () => {
    const g = person();
    await say(g, '/start@Polski_Go_Bot', 'supergroup');
    expect(await contact(g.id)).toBeUndefined();
    const bot = person({ is_bot: true });
    await say(bot, '/start');
    expect(await contact(bot.id)).toBeUndefined();
    const stranger = person();
    fakeTelegram();
    const res = await request('POST', '/telegram/webhook', { update_id: ++upd, message: { message_id: 1, chat: { id: stranger.id, type: 'private' }, from: stranger, text: '/start' } }, { 'x-telegram-bot-api-secret-token': 'wrong' });
    expect(res.status).toBe(401);
    expect(await contact(stranger.id)).toBeUndefined();
  });
});

describe('аудитория бота: список в админке', () => {
  it('бот и приложение одним списком: фильтры, поиск, счётчики', async () => {
    const onlyBot = person({ first_name: 'Taras', username: 'taras_bot_only' });
    await say(onlyBot, '/start ref_ABC');
    const blocked = person({ first_name: 'Iryna' });
    await say(blocked, '/start');
    await member(blocked, 'kicked');
    const app = await login();
    // Пользователь приложения, который потом написал боту, — одна строка, не две.
    const both = await login();
    await say({ id: both.telegramId, first_name: `User${both.telegramId}`, language_code: 'uk' }, '/lesson');

    const get = await admin();
    const all = await get('/audience');
    expect(all.status).toBe(200);
    const rows = all.body.items as Row[];
    // /start ref_… сразу создаёт аккаунт (засчитать приглашение), но приложение человек ещё не открывал.
    expect(find(rows, onlyBot.id)).toMatchObject({ inBot: true, appOpened: false, username: 'taras_bot_only', firstName: 'Taras', startParam: 'ref_ABC' });
    expect(find(rows, onlyBot.id)!.userId).toBeTypeOf('string');
    expect(find(rows, blocked.id)).toMatchObject({ inBot: true, appOpened: false, userId: null });
    expect(find(rows, app.telegramId)).toMatchObject({ inBot: false, appOpened: true, userId: app.user.id, language: 'uk' });
    expect(find(rows, both.telegramId)).toMatchObject({ inBot: true, appOpened: true, userId: both.user.id, lastCommand: 'lesson' });
    expect(rows.filter((r) => r.telegramId === String(both.telegramId))).toHaveLength(1);
    // Новые сверху.
    expect(rows.findIndex((r) => r.telegramId === String(both.telegramId))).toBeLessThan(rows.findIndex((r) => r.telegramId === String(onlyBot.id)));

    const s = all.body.summary;
    expect(s.total).toBe(all.body.total);
    // Каждый — либо открывал приложение, либо только писал боту (аккаунт без приложения бывает лишь у пришедших по ссылке из бота).
    expect(s.total).toBe(s.botOnly + s.app);
    expect(s.bot).toBeGreaterThanOrEqual(3);
    expect(s.blocked).toBeGreaterThanOrEqual(1);
    expect(s.new1).toBe(s.total);
    expect(s.new7).toBe(s.total);

    const botOnly = (await get('/audience?filter=bot_only')).body.items as Row[];
    expect(find(botOnly, onlyBot.id)).toBeDefined();
    expect(find(botOnly, blocked.id)).toBeDefined();
    expect(find(botOnly, both.telegramId)).toBeUndefined();
    expect(find(botOnly, app.telegramId)).toBeUndefined();
    const appRows = (await get('/audience?filter=app')).body.items as Row[];
    expect(find(appRows, app.telegramId)).toBeDefined();
    expect(find(appRows, onlyBot.id)).toBeUndefined();
    expect(appRows.every((r) => r.appOpened)).toBe(true);
    const blockedRows = (await get('/audience?filter=blocked')).body.items as Row[];
    expect(find(blockedRows, blocked.id)?.blockedAt).toBeTypeOf('number');
    expect(blockedRows.every((r) => r.blockedAt)).toBe(true);

    expect(((await get('/audience?search=@taras_bot')).body.items as Row[]).map((r) => r.telegramId)).toEqual([String(onlyBot.id)]);
    expect(((await get(`/audience?search=${blocked.id}`)).body.items as Row[]).map((r) => r.telegramId)).toEqual([String(blocked.id)]);
    expect((await get('/audience?days=1')).body.total).toBe(s.total);
    expect((await get('/audience?days=5')).status).toBe(400);
    expect((await get('/audience?filter=evil')).status).toBe(400);
  });

  it('аккаунт по приглашению из бота становится «открыл приложение», когда человек проходит знакомство', async () => {
    const f = person({ first_name: 'Marta' });
    await say(f, '/start ref_XYZ');
    const get = await admin();
    expect(find((await get(`/audience?search=${f.id}`)).body.items, f.id)).toMatchObject({ inBot: true, appOpened: false });
    await db.update(users).set({ onboardedAt: new Date() }).where(eq(users.telegramId, f.id));
    expect(find((await get(`/audience?search=${f.id}`)).body.items, f.id)).toMatchObject({ inBot: true, appOpened: true });
  });

  it('права: SUPERADMIN и SUPPORT видят аудиторию, EDITOR — нет, без токена — 401', async () => {
    expect((await request('GET', '/api/admin/audience')).status).toBe(401);
    expect((await (await admin('SUPPORT'))('/audience')).status).toBe(200);
    expect((await (await admin('EDITOR'))('/audience')).status).toBe(403);
  });
});
