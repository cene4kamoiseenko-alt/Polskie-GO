/**
 * Рабочие разделы админки (обновление 2026-11-13): деньги за период, числа «ждёт ответа» на меню, журнал действий с отбором и страницами,
 * управление администраторами, рассылки (охват, пробное сообщение, остановка), сообщение игроку от бота.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { adminAuditLogs, notificationCampaigns, paymentEvents, playerReports, supportRequests, userSettings, users } from '../src/db/schema';
import { sendCampaignChunk } from '../src/jobs';
import { disposeEnv, getEnv, login, request } from './helpers';
import { fakeTelegram, tgError } from './tg-fake';

afterAll(disposeEnv);
afterEach(() => vi.unstubAllGlobals());

let seq = 0;
let rootToken = '';
let rootId = '';
const signIn = async (email: string, password: string) => (await request('POST', '/api/admin/login', { email, password })).body;
type Call = (method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown) => ReturnType<typeof request>;
const as = (token: string): Call => (method, path, body) => request(method, `/api/admin${path}`, body, { authorization: `Bearer ${token}` });

/** Ещё один администратор с ролью: вход ограничен 10 попытками за 5 минут, поэтому главный входит один раз. */
async function makeAdmin(role: 'SUPERADMIN' | 'EDITOR' | 'SUPPORT') {
  const email = `${role.toLowerCase()}-ops-${++seq}@test.dev`;
  const r = await as(rootToken)('POST', '/admins', { email, name: `${role} ${seq}`, role, password: 'role-password-123' });
  expect(r.status).toBe(200);
  const s = await signIn(email, 'role-password-123');
  return { id: r.body.id as string, call: as(s.token), email };
}

let root: Call;
beforeAll(async () => {
  await getEnv();
  const s = await signIn('admin@test.dev', 'admin-password-123');
  rootToken = s.token;
  rootId = s.admin.id;
  root = as(rootToken);
});

describe('деньги за период', () => {
  it('выручка по дням, возвраты вычитаются из чистой суммы, платёж с ошибкой не считается', async () => {
    const before = (await root('GET', '/payments/summary?days=7')).body;
    const u = await login();
    const charge = `ch_${Date.now()}`;
    await db.insert(paymentEvents).values([
      { userId: u.user.id, type: 'INVOICE_CREATED', planCode: 'PREMIUM_1M', amount: 250, currency: 'XTR', payload: `inv_${charge}` },
      { userId: u.user.id, type: 'SUCCESSFUL_PAYMENT', planCode: 'PREMIUM_1M', amount: 250, currency: 'XTR', chargeId: charge, payload: `inv_${charge}` },
      { userId: u.user.id, type: 'SUCCESSFUL_PAYMENT', planCode: 'PREMIUM_1M', amount: 999, currency: 'XTR', chargeId: `${charge}_bad`, error: 'amount_mismatch' },
      { userId: u.user.id, type: 'REFUND', planCode: 'PREMIUM_1M', amount: 100, currency: 'XTR', payload: `${charge}_other` },
    ]);
    const r = await root('GET', '/payments/summary?days=7');
    expect(r.status).toBe(200);
    expect(r.body.daily.days).toHaveLength(7);
    expect(r.body.daily.stars).toHaveLength(7);
    expect(r.body.totals.stars.now - before.totals.stars.now).toBe(250);
    expect(r.body.totals.payments.now - before.totals.payments.now).toBe(1);
    expect(r.body.totals.refundStars - before.totals.refundStars).toBe(100);
    expect(r.body.totals.net - before.totals.net).toBe(150);
    expect(r.body.totals.failed - before.totals.failed).toBe(1);
    expect(r.body.totals.invoices - before.totals.invoices).toBe(1);
    expect(r.body.daily.stars.at(-1) - before.daily.stars.at(-1)).toBe(250);
    expect(r.body.plans.find((p: { plan: string }) => p.plan === 'PREMIUM_1M').stars).toBeGreaterThanOrEqual(250);
    expect((await root('GET', '/payments/summary?days=5')).status).toBe(400);
  });

  it('журнал платежей: отбор по игроку, отметка «уже возвращён» по всему журналу, без сырых данных Telegram', async () => {
    const u = await login();
    const charge = `ch_ref_${Date.now()}`;
    await db.insert(paymentEvents).values({ userId: u.user.id, type: 'SUCCESSFUL_PAYMENT', planCode: 'PREMIUM_1M', amount: 250, currency: 'XTR', chargeId: charge, raw: { secret: 1 } });
    let list = (await root('GET', `/payments?user=${u.user.id}`)).body;
    expect(list.items).toHaveLength(1);
    expect(list.items[0]).toMatchObject({ chargeId: charge, refunded: false });
    expect(list.items[0].raw).toBeUndefined();
    await db.insert(paymentEvents).values({ userId: u.user.id, type: 'REFUND', planCode: 'PREMIUM_1M', amount: 250, currency: 'XTR', payload: charge });
    list = (await root('GET', `/payments?user=${u.user.id}&type=SUCCESSFUL_PAYMENT`)).body;
    expect(list.items).toHaveLength(1);
    expect(list.items[0].refunded).toBe(true);
    expect((await root('GET', '/payments?type=WHATEVER')).status).toBe(400);
  });

  it('редактору контента деньги не видны', async () => {
    const editor = await makeAdmin('EDITOR');
    expect((await editor.call('GET', '/payments/summary')).status).toBe(403);
    expect((await editor.call('GET', '/attention')).status).toBe(403);
  });
});

describe('числа на меню', () => {
  it('открытые обращения и игроки с жалобами (несколько жалоб на одного — один)', async () => {
    const before = (await root('GET', '/attention')).body;
    const [a, b, target] = [await login(), await login(), await login()];
    await db.insert(supportRequests).values({ telegramId: a.telegramId, userId: a.user.id, status: 'OPEN', text: 'Не пришёл Premium' });
    await db.insert(playerReports).values([
      { reporterId: a.user.id, reportedId: target.user.id, reason: 'name' },
      { reporterId: b.user.id, reportedId: target.user.id, reason: 'photo' },
    ]);
    const after = (await root('GET', '/attention')).body;
    expect(after.support - before.support).toBe(1);
    expect(after.reports - before.reports).toBe(1);
    expect(typeof after.errors).toBe('number');
  });
});

describe('журнал действий', () => {
  it('отбор по администратору и действию; страницы без пропусков при одинаковом времени записей', async () => {
    const support = await makeAdmin('SUPPORT');
    const at = new Date(Date.now() - 60_000);
    const rows = Array.from({ length: 130 }, (_, i) => ({ adminId: support.id, action: 'bulk_probe', entity: 'probe', entityId: `p${i}`, createdAt: at }));
    for (let i = 0; i < rows.length; i += 10) await db.insert(adminAuditLogs).values(rows.slice(i, i + 10));
    const first = (await root('GET', `/audit?admin=${support.id}&action=bulk_probe`)).body;
    expect(first.items).toHaveLength(100);
    expect(first.more).toBeTruthy();
    expect(first.items.every((x: { action: string; admin: { email: string } }) => x.action === 'bulk_probe' && x.admin.email === support.email)).toBe(true);
    const second = (await root('GET', `/audit?admin=${support.id}&action=bulk_probe&before=${first.more}`)).body;
    expect(second.items).toHaveLength(30);
    expect(second.more).toBeNull();
    const ids = new Set([...first.items, ...second.items].map((x: { entityId: string }) => x.entityId));
    expect(ids.size).toBe(130);
    expect(first.actions).toContain('bulk_probe');
    expect(first.admins.some((x: { id: string }) => x.id === support.id)).toBe(true);
    expect((await root('GET', '/audit?before=bad')).status).toBe(400);
    expect((await support.call('GET', '/audit')).status).toBe(403);
  });
});

describe('администраторы', () => {
  it('роль и доступ меняются; отключённый сразу теряет вход; себя не отключить', async () => {
    const editor = await makeAdmin('EDITOR');
    expect((await editor.call('GET', '/me')).status).toBe(200);
    expect((await root('PATCH', `/admins/${editor.id}`, { role: 'SUPPORT', name: 'Поддержка' })).status).toBe(200);
    expect((await editor.call('GET', '/attention')).status).toBe(200); // роль читается при каждом запросе
    expect((await root('PATCH', `/admins/${editor.id}`, { isActive: false })).status).toBe(200);
    expect((await editor.call('GET', '/me')).status).toBe(401);
    expect((await root('PATCH', `/admins/${rootId}`, { isActive: false })).body.error).toBe('cannot_change_self');
    expect((await root('PATCH', `/admins/${rootId}`, { role: 'EDITOR' })).body.error).toBe('cannot_change_self');
    const log = (await root('GET', `/audit?entity=admin`)).body.items as { entityId: string; action: string }[];
    expect(log.some((x) => x.entityId === editor.id && x.action === 'update')).toBe(true);
  });

  it('другого главного администратора можно отключить и понизить, себя — нет', async () => {
    const other = await makeAdmin('SUPERADMIN');
    expect((await other.call('PATCH', `/admins/${other.id}`, { role: 'EDITOR' })).body.error).toBe('cannot_change_self');
    expect((await root('PATCH', `/admins/${other.id}`, { role: 'EDITOR' })).status).toBe(200);
    expect((await other.call('GET', '/admins')).status).toBe(403);
    expect((await root('PATCH', `/admins/${other.id}`, { role: 'SUPERADMIN' })).status).toBe(200);
    expect((await root('PATCH', `/admins/${other.id}`, { isActive: false })).status).toBe(200);
    expect((await other.call('GET', '/me')).status).toBe(401);
    expect((await root('PATCH', '/admins/no-such-admin', { isActive: false })).status).toBe(404);
  });

  it('новый пароль и повтор email', async () => {
    const support = await makeAdmin('SUPPORT');
    expect((await root('POST', `/admins/${support.id}/password`, { password: 'short' })).status).toBe(400);
    expect((await root('POST', `/admins/${support.id}/password`, { password: 'new-password-123' })).status).toBe(200);
    expect((await signIn(support.email, 'new-password-123')).token).toBeTruthy();
    expect((await root('POST', '/admins', { email: support.email, name: 'x', role: 'EDITOR', password: 'role-password-123' })).body.error).toBe('duplicate');
  });
});

describe('рассылки', () => {
  it('охват, пробное сообщение себе, отправка, правка после отправки запрещена, остановка', async () => {
    const before = (await root('GET', '/campaigns')).body.audience;
    const me = await login();
    await db.update(userSettings).set({ notificationsEnabled: true, uiLanguage: 'ru' }).where(eq(userSettings.userId, me.user.id));
    const after = (await root('GET', '/campaigns')).body.audience;
    expect(after.total - before.total).toBe(1);
    expect((after.byLang.ru ?? 0) - (before.byLang.ru ?? 0)).toBe(1);

    const created = await root('POST', '/resources/campaigns', { title: 'Новые уроки', kind: 'new_lessons', message: { uk: 'Нові уроки!', ru: 'Новые уроки!' } });
    expect(created.status).toBe(200);
    const id = created.body.id as string;
    expect((await root('POST', '/resources/campaigns', { title: 'x', kind: 'event', message: { uk: 'я'.repeat(4001) } })).status).toBe(400);

    const calls = fakeTelegram();
    const test = await root('POST', `/campaigns/${id}/test`, { who: String(me.telegramId) });
    expect(test.status).toBe(200);
    expect(test.body.lang).toBe('ru');
    expect(calls).toHaveLength(1);
    expect(calls[0].params).toMatchObject({ chat_id: me.telegramId, text: 'Новые уроки!' });
    expect(calls[0].params.reply_markup.inline_keyboard[0][0].web_app).toBeTruthy();
    expect((await root('POST', `/campaigns/${id}/test`, { who: '@nobody_here_123' })).body.error).toBe('player_not_found');
    // @username без учёта регистра и язык по выбору
    await db.update(users).set({ username: 'Olena_Test' }).where(eq(users.id, me.user.id));
    const byName = await root('POST', `/campaigns/${id}/test`, { who: '@olena_test', lang: 'uk' });
    expect(byName.body).toMatchObject({ ok: true, lang: 'uk' });
    expect(calls.at(-1)!.params.text).toBe('Нові уроки!');
    expect((await root('GET', '/campaigns')).body.items.find((x: { id: string }) => x.id === id).status).toBe('DRAFT');

    expect((await root('POST', `/campaigns/${id}/send`, {})).status).toBe(200);
    expect((await root('POST', `/campaigns/${id}/send`, {})).body.error).toBe('already_sent');
    expect((await root('PATCH', `/resources/campaigns/${id}`, { title: 'Другое' })).body.error).toBe('already_sent');
    expect((await root('DELETE', `/resources/campaigns/${id}`)).body.error).toBe('already_sent');
    expect((await root('POST', `/campaigns/${id}/cancel`, {})).status).toBe(200);
    expect((await root('POST', `/campaigns/${id}/cancel`, {})).body.error).toBe('not_sending');
    const row = (await db.select().from(notificationCampaigns).where(eq(notificationCampaigns.id, id)))[0];
    expect(row.status).toBe('CANCELLED');
    // Остановленная рассылка больше не отправляется.
    const n = calls.length;
    await sendCampaignChunk(10);
    expect(calls.slice(n).some((c) => c.params.text === 'Новые уроки!')).toBe(false);
  });

  it('остановка во время порции не превращается в «отправлена»', async () => {
    const created = await root('POST', '/resources/campaigns', { title: 'Порция', kind: 'event', message: { uk: 'Порція' } });
    const id = created.body.id as string;
    await db.update(notificationCampaigns).set({ status: 'SENDING' }).where(eq(notificationCampaigns.id, id));
    const u = await login();
    await db.update(userSettings).set({ notificationsEnabled: true }).where(eq(userSettings.userId, u.user.id));
    // Пока идёт отправка, админ нажимает «Остановить»: отмена записывается в базу до конца порции.
    vi.stubGlobal('fetch', async () => {
      await db.update(notificationCampaigns).set({ status: 'CANCELLED' }).where(eq(notificationCampaigns.id, id));
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { headers: { 'content-type': 'application/json' } });
    });
    // Другие отправляемые рассылки могли остаться от прошлых тестов — порция берёт самую старую; гоним, пока не дойдёт до нашей.
    for (let i = 0; i < 20; i++) {
      const row = (await db.select().from(notificationCampaigns).where(eq(notificationCampaigns.id, id)))[0];
      if (row.status !== 'SENDING') break;
      await sendCampaignChunk(1000);
    }
    const row = (await db.select().from(notificationCampaigns).where(eq(notificationCampaigns.id, id)))[0];
    expect(row.status).toBe('CANCELLED');
  });

  it('поддержке и редактору рассылки недоступны', async () => {
    const support = await makeAdmin('SUPPORT');
    expect((await support.call('GET', '/campaigns')).status).toBe(403);
  });
});

describe('сообщение игроку от бота', () => {
  it('уходит в чат без кнопки; гостю — понятный отказ; заблокировал бота — понятный отказ', async () => {
    const u = await login();
    const calls = fakeTelegram();
    const r = await root('POST', `/users/${u.user.id}/message`, { text: '  Здравствуйте! Premium уже включён.  ' });
    expect(r.status).toBe(200);
    expect(calls[0]).toMatchObject({ method: 'sendMessage', params: { chat_id: u.telegramId, text: 'Здравствуйте! Premium уже включён.' } });
    expect(calls[0].params.reply_markup).toBeUndefined();
    expect((await root('POST', `/users/${u.user.id}/message`, { text: '   ' })).status).toBe(400);

    const g = await request('POST', '/api/auth/guest', { platform: 'twa', language: 'en' }, { 'cf-connecting-ip': '10.9.9.77' });
    const guest = (await request('GET', '/api/me', undefined, { authorization: `Bearer ${g.body.token}` })).body;
    const guestId = (guest.user ?? guest).id as string;
    expect(guestId).toBeTruthy();
    expect((await root('POST', `/users/${guestId}/message`, { text: 'hi' })).body.error).toBe('no_telegram');

    fakeTelegram(() => tgError(403, 'Forbidden: bot was blocked by the user'));
    expect((await root('POST', `/users/${u.user.id}/message`, { text: 'hi' })).body.error).toBe('bot_blocked');

    const log = (await root('GET', `/audit?entity=user&action=message`)).body.items as { entityId: string }[];
    expect(log.some((x) => x.entityId === u.user.id)).toBe(true);
    const editor = await makeAdmin('EDITOR');
    expect((await editor.call('POST', `/users/${u.user.id}/message`, { text: 'hi' })).status).toBe(403);
  });
});
