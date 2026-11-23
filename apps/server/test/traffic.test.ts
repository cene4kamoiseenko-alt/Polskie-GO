/**
 * Источники трафика (2026-11-23, services/traffic.ts, админка «Источники»). Владелец: «Нужно понимать, откуда человек зашёл в бота:
 * с TikTok, с рекламы, из Telegram или по приглашению». Данные настоящие: ссылки из админки, /start в боте, вход в Mini App
 * со startapp, приглашение, гость вне Telegram.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { eq, sql } from 'drizzle-orm';
import { db } from '../src/db';
import { botContacts, userSources } from '../src/db/schema';
import { channelOf, recordTouch } from '../src/services/traffic';
import { signInitData } from '../src/lib/telegram';
import { BOT_TOKEN, disposeEnv, getEnv, login, request } from './helpers';

afterAll(disposeEnv);

let token = '';
const admin = (method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown, tok = token) => request(method, `/api/admin${path}`, body, { authorization: `Bearer ${tok}` });
let tgSeq = 7_700_000;
const start = (id: number, arg?: string) =>
  request('POST', '/telegram/webhook', {
    update_id: Math.floor(Math.random() * 1e9),
    message: { message_id: 1, chat: { id, type: 'private' }, from: { id, first_name: `Bot${id}` }, text: arg ? `/start ${arg}` : '/start' },
  }, { 'x-telegram-bot-api-secret-token': 'hook-secret' });
/** Открыть Mini App человеком с этим id (подписанные initData, как в Telegram). */
const openApp = async (id: number, startParam?: string) => {
  const initData = signInitData({ auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'AAH', user: JSON.stringify({ id, first_name: `App${id}`, language_code: 'ru' }), ...(startParam ? { start_param: startParam } : {}) }, BOT_TOKEN);
  return request('POST', '/api/auth/telegram', { initData });
};
type Report = Awaited<ReturnType<typeof import('../src/services/traffic').trafficReport>>;
const report = async (days = 7) => (await admin('GET', `/traffic?days=${days}`)).body as Report;
const chan = (r: Report, key: string) => r.channels.find((c) => c.key === key)!;

beforeAll(async () => {
  await getEnv();
  token = (await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' })).body.token;
});

describe('канал по метке', () => {
  const links = new Map([['spring', { channel: 'instagram' as const }]]);
  it('ссылка из админки, приглашение, известные начала кодов, метки приложения, гость, без метки', () => {
    expect(channelOf('spring', {}, links)).toBe('instagram');
    expect(channelOf('ref_ABC123', {}, links)).toBe('invite');
    expect(channelOf(null, { referred: true }, links)).toBe('invite');
    expect(channelOf('tt_video5', {}, links)).toBe('tiktok');
    expect(channelOf('tiktok', {}, links)).toBe('tiktok');
    expect(channelOf('ad_meta_nov', {}, links)).toBe('ads');
    expect(channelOf('ads', {}, links)).toBe('ads');
    expect(channelOf('ig_reels', {}, links)).toBe('instagram');
    expect(channelOf('yt_short', {}, links)).toBe('youtube');
    expect(channelOf('tg_post12', {}, links)).toBe('telegram');
    expect(channelOf('screen_map', {}, links)).toBe('telegram');
    expect(channelOf('quiz', {}, links)).toBe('telegram');
    expect(channelOf('address', {}, links)).toBe('other');
    expect(channelOf(null, { guest: true }, links)).toBe('web');
    expect(channelOf(null, {}, links)).toBe('direct');
  });
});

describe('источники трафика', () => {
  let tiktok: { id: string; code: string; urls: { bot: string; app: string; web: string } };
  let before: Report;

  it('владелец создаёт ссылку TikTok: готовые адреса в бота, в приложение и на сайт', async () => {
    before = await report();
    const r = await admin('POST', '/traffic/links', { title: 'TikTok — шапка профиля', channel: 'tiktok', code: 'TT_Bio', cost: 120 });
    expect(r.status).toBe(200);
    tiktok = r.body;
    expect(tiktok.code).toBe('tt_bio');
    expect(tiktok.urls.bot).toMatch(/^https:\/\/t\.me\/\w+\?start=tt_bio$/);
    expect(tiktok.urls.app).toMatch(/^https:\/\/t\.me\/\w+\/\w+\?startapp=tt_bio$/);
    expect(tiktok.urls.web).toMatch(/\?startapp=tt_bio$/);
  });

  it('код ссылки: занятый, служебный (ref_, screen_) и с недопустимыми знаками — отказ', async () => {
    expect((await admin('POST', '/traffic/links', { title: 'x', channel: 'tiktok', code: 'tt_bio' })).body.error).toBe('link_code_taken');
    expect((await admin('POST', '/traffic/links', { title: 'x', channel: 'ads', code: 'ref_x' })).status).toBe(400);
    expect((await admin('POST', '/traffic/links', { title: 'x', channel: 'ads', code: 'screen_map' })).status).toBe(400);
    expect((await admin('POST', '/traffic/links', { title: 'x', channel: 'ads', code: 'реклама' })).status).toBe(400);
    expect((await admin('POST', '/traffic/links', { title: 'x', channel: 'nope', code: 'ok_code' })).status).toBe(400);
  });

  it('пришли: по ссылке TikTok в бота (и открыли приложение), сразу в Mini App по ссылке, по рекламе, по приглашению, гость, без метки', async () => {
    // 1) TikTok → бот → приложение
    const a = ++tgSeq;
    await start(a, 'tt_bio');
    expect((await openApp(a)).status).toBe(200);
    // 2) TikTok → сразу Mini App (startapp), в боте не был
    const b = ++tgSeq;
    expect((await openApp(b, 'tt_bio')).status).toBe(200);
    // 3) реклама: метка без ссылки в админке, только в боте; потом заблокировал бота
    const c = ++tgSeq;
    await start(c, 'ad_meta_nov');
    await request('POST', '/telegram/webhook', { update_id: Math.floor(Math.random() * 1e9), my_chat_member: { chat: { id: c, type: 'private' }, from: { id: c, first_name: 'C' }, date: 1, new_chat_member: { status: 'kicked' } } }, { 'x-telegram-bot-api-secret-token': 'hook-secret' });
    // 4) приглашение друга
    const inviter = await login();
    const d = ++tgSeq;
    expect((await openApp(d, `ref_${inviter.user.referralCode}`)).status).toBe(200);
    // 5) гость вне Telegram с меткой сайта не указан — «сайт / Android»
    expect((await request('POST', '/api/auth/guest', { platform: 'web', language: 'ru' }, { 'cf-connecting-ip': '10.7.7.7' })).status).toBe(200);
    // 6) нашёл бота сам
    const e = ++tgSeq;
    await start(e);

    const r = await report();
    const diff = (key: string, field: 'people' | 'bot' | 'app' | 'blocked') => chan(r, key)[field] - chan(before, key)[field];
    expect(diff('tiktok', 'people')).toBe(2);
    expect(diff('tiktok', 'bot')).toBe(1);
    expect(diff('tiktok', 'app')).toBe(2);
    expect(diff('ads', 'people')).toBe(1);
    expect(diff('ads', 'app')).toBe(0);
    expect(diff('ads', 'blocked')).toBe(1);
    expect(diff('invite', 'people')).toBeGreaterThanOrEqual(1);
    expect(diff('web', 'people')).toBe(1);
    expect(diff('direct', 'people')).toBeGreaterThanOrEqual(1);
    // ссылка: двое за период и за всё время, сегодня в ряду по дням
    const link = r.links.find((l) => l.code === 'tt_bio')!;
    expect(link.period.people).toBe(2);
    expect(link.allTime.people).toBe(2);
    expect(r.daily.find((d) => d.key === 'tiktok')!.values.at(-1)! - before.daily.find((d) => d.key === 'tiktok')!.values.at(-1)!).toBe(2);
    // метка без ссылки видна отдельно, с каналом
    expect(r.loose.find((x) => x.param === 'ad_meta_nov')).toMatchObject({ channel: 'ads', people: 1 });
    // последние пришедшие: канал у каждого
    expect(r.recent.find((x) => x.telegramId === b)).toMatchObject({ channel: 'tiktok', via: 'app' });
    expect(r.recent.find((x) => x.telegramId === c)).toMatchObject({ channel: 'ads', blocked: true });
    // сумма по каналам — все пришедшие за период
    expect(r.channels.reduce((n, x) => n + x.people, 0)).toBe(r.total.people);
  });

  it('метка дописывается только в первые сутки: позже кнопка бота (screen_…) не меняет источник', async () => {
    const id = ++tgSeq;
    const t0 = new Date(Date.now() - 3 * 86_400_000);
    await recordTouch(id, null, 'bot', t0);
    await recordTouch(id, 'screen_map', 'app', new Date());
    expect((await db.query.userSources.findFirst({ where: eq(userSources.telegramId, id) }))!.param).toBeNull();
    const fresh = ++tgSeq;
    await recordTouch(fresh, null, 'bot', new Date(Date.now() - 60_000));
    await recordTouch(fresh, 'tt_bio', 'app', new Date());
    await recordTouch(fresh, 'ig_reels', 'app', new Date());
    expect((await db.query.userSources.findFirst({ where: eq(userSources.telegramId, fresh) }))!.param).toBe('tt_bio');
  });

  it('карточка игрока и «Обзор» называют канал', async () => {
    const id = ++tgSeq;
    await start(id, 'tt_bio');
    await openApp(id);
    const u = await db.query.users.findFirst({ where: (t, { eq: e }) => e(t.telegramId, id) });
    const card = (await admin('GET', `/users/${u!.id}`)).body;
    expect(card.traffic).toMatchObject({ channel: 'tiktok', param: 'tt_bio', link: { title: 'TikTok — шапка профиля' } });
    const ins = (await admin('GET', '/insights?days=7')).body as { channels: { key: string; count: number }[] };
    expect(ins.channels.find((c) => c.key === 'tiktok')!.count).toBeGreaterThanOrEqual(3);
  });

  it('ссылку можно переименовать, поменять канал и расход, убрать в архив', async () => {
    expect((await admin('PATCH', `/traffic/links/${tiktok.id}`, { title: 'TikTok — био', cost: 200, archived: true })).status).toBe(200);
    const l = (await report()).links.find((x) => x.id === tiktok.id)!;
    expect(l).toMatchObject({ title: 'TikTok — био', cost: 200 });
    expect(l.archivedAt).not.toBeNull();
    expect((await admin('PATCH', `/traffic/links/${tiktok.id}`, { archived: false })).status).toBe(200);
    expect((await admin('PATCH', '/traffic/links/nope', { title: 'x' })).status).toBe(404);
  });

  it('отчёт видят суперадмин и поддержка; ссылки создаёт только суперадмин; редактору и без входа — закрыто', async () => {
    const make = async (role: string) => {
      const email = `${role.toLowerCase()}-traffic@test.dev`;
      await admin('POST', '/admins', { email, name: role, role, password: 'role-password-123' });
      return (await request('POST', '/api/admin/login', { email, password: 'role-password-123' })).body.token as string;
    };
    const support = await make('SUPPORT');
    const editor = await make('EDITOR');
    expect((await admin('GET', '/traffic?days=30', undefined, support)).status).toBe(200);
    expect((await admin('POST', '/traffic/links', { title: 'x', channel: 'ads', code: 'ad_support' }, support)).status).toBe(403);
    expect((await admin('GET', '/traffic?days=30', undefined, editor)).status).toBe(403);
    expect((await request('GET', '/api/admin/traffic')).status).toBe(401);
    expect((await admin('GET', '/traffic?days=5')).status).toBe(400);
  });

  it('экспорт данных показывает источник; удаление аккаунта удаляет и его', async () => {
    const id = ++tgSeq;
    await start(id, 'tt_bio');
    const tok = (await openApp(id)).body.token as string;
    const auth = { authorization: `Bearer ${tok}` };
    expect((await request('GET', '/api/me/export', undefined, auth)).body.source).toMatchObject({ telegramId: id, param: 'tt_bio' });
    expect((await request('DELETE', '/api/me', { confirm: 'DELETE' }, auth)).status).toBe(200);
    expect(await db.query.userSources.findFirst({ where: eq(userSources.telegramId, id) })).toBeUndefined();
  });

  it('миграция 0027 заполняет первые касания из бота и приложения (самое раннее время, метка из бота)', async () => {
    const id = ++tgSeq;
    const seen = new Date(Date.now() - 5 * 86_400_000);
    await db.insert(botContacts).values({ telegramId: id, firstName: 'Old', startParam: 'tt_old', firstSeenAt: seen, lastSeenAt: seen });
    const file = readFileSync(resolve(__dirname, '../migrations/0027_traffic_sources.sql'), 'utf8');
    for (const stmt of file.split('--> statement-breakpoint').map((x) => x.trim()).filter((x) => x.startsWith('INSERT'))) await db.run(sql.raw(stmt));
    const row = await db.query.userSources.findFirst({ where: eq(userSources.telegramId, id) });
    expect(row).toMatchObject({ param: 'tt_old', via: 'bot' });
    expect(row!.firstSeenAt.getTime()).toBe(seen.getTime());
  });
});
