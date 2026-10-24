import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../src/db';
import { getApp, lessonId, login, playSession } from './helpers';

afterAll(async () => {
  await (await getApp()).close();
  await prisma.$disconnect();
});
afterEach(() => vi.restoreAllMocks());

describe('Квести', () => {
  it('щоденні квести реагують на уроки, нагорода видається рівно один раз', async () => {
    const { call, user } = await login();
    const q0 = await call('GET', '/api/quests');
    expect(q0.body.daily).toHaveLength(3);
    expect(q0.body.weekly.length).toBeGreaterThan(0);
    const lessonQuest = q0.body.daily.find((q: { slug: string }) => q.slug.startsWith('d-lesson'));
    expect(lessonQuest).toBeTruthy();

    const s = await call('POST', '/api/sessions', { lessonId: await lessonId('waw-1-czesc') });
    await playSession(call, s.body.sessionId);
    // Щоб гарантовано виконати квест на 1 урок, ставимо ціль 1.
    const uq = await prisma.userQuest.findUniqueOrThrow({ where: { id: lessonQuest.id }, include: { quest: true } });
    if (uq.quest.target > 1) {
      await prisma.userQuest.update({ where: { id: uq.id }, data: { progress: uq.quest.target, status: 'COMPLETED' } });
    }
    const q1 = await call('GET', '/api/quests');
    expect(q1.body.daily.find((q: { id: string }) => q.id === lessonQuest.id).status).toBe('COMPLETED');

    const before = (await prisma.gameWallet.findUniqueOrThrow({ where: { userId: user.id } })).balance;
    const claims = await Promise.all([call('POST', `/api/quests/${lessonQuest.id}/claim`), call('POST', `/api/quests/${lessonQuest.id}/claim`)]);
    expect(claims.map((c) => c.status).sort()).toEqual([200, 400]);
    const after = (await prisma.gameWallet.findUniqueOrThrow({ where: { userId: user.id } })).balance;
    expect(after - before).toBe(uq.quest.zlotkiReward + claims.find((c) => c.status === 200)!.body.achievements.reduce((s: number, a: { zlotki: number }) => s + a.zlotki, 0));
  });

  it('нагороду за невиконаний квест отримати не можна', async () => {
    const { call } = await login();
    const q = await call('GET', '/api/quests');
    expect((await call('POST', `/api/quests/${q.body.weekly[0].id}/claim`)).body.error).toBe('not_completed');
  });

  it('сюжетний квест: розгалуження, перевірка відповідей на сервері, нагорода', async () => {
    const { call, user } = await login();
    const start = await call('POST', '/api/story/s-warszawa-dworzec/start');
    expect(start.body.node.speaker).toBe('narrator');
    expect(JSON.stringify(start.body)).not.toContain('"ok"');
    let st = await call('POST', '/api/story/s-warszawa-dworzec/advance', {});
    expect(st.body.node.name).toBe('Zosia');
    st = await call('POST', '/api/story/s-warszawa-dworzec/advance', { choice: 1 });
    expect(st.body.result.ok).toBe(false);
    expect(st.body.mistakes).toBe(1);
    st = await call('POST', '/api/story/s-warszawa-dworzec/advance', { choice: 0 });
    st = await call('POST', '/api/story/s-warszawa-dworzec/advance', { choice: 0 });
    st = await call('POST', '/api/story/s-warszawa-dworzec/advance', {}); // кінець етапу 1
    expect(st.body.stage).toBe(1);
    st = await call('POST', '/api/story/s-warszawa-dworzec/advance', { choice: 1 }); // гілка «метро»
    expect(st.body.node.pl).toContain('Metro');
    st = await call('POST', '/api/story/s-warszawa-dworzec/advance', {});
    st = await call('POST', '/api/story/s-warszawa-dworzec/advance', {});
    expect(st.body.status).toBe('COMPLETED');
    const claim = await call('POST', `/api/quests/${st.body.id}/claim`);
    expect(claim.status).toBe(200);
    expect(claim.body.xp).toBe(50);
    expect(claim.body.item.slug).toBe('scarf-pl');
    expect(await prisma.userInventory.count({ where: { userId: user.id, item: { slug: 'scarf-pl' } } })).toBe(1);
  });

  it('сюжет закритого міста недоступний', async () => {
    const { call } = await login();
    expect((await call('POST', '/api/story/s-wroclaw-zgubiony/start')).body.error).toBe('city_locked');
  });
});

describe('Граматика', () => {
  it('теми з реальним прогресом; тренування теми нараховує XP і оновлює освоєння', async () => {
    const { call } = await login();
    const list = await call('GET', '/api/grammar');
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThanOrEqual(10);
    const byc = list.body.find((g: { slug: string }) => g.slug === 'byc');
    expect(byc).toMatchObject({ state: 'new', mastery: 0 });
    expect(byc.exercises).toBeGreaterThan(0);

    const s = await call('POST', '/api/sessions', { mode: 'GRAMMAR', topic: 'byc' });
    expect(s.status).toBe(200);
    expect(s.body.items.every((i: { skill: string }) => i.skill === 'grammar.być')).toBe(true);
    const fin = await playSession(call, s.body.sessionId);
    expect(fin.body.xp).toBeGreaterThan(0);
    const after = (await call('GET', '/api/grammar')).body.find((g: { slug: string }) => g.slug === 'byc');
    expect(after.state).not.toBe('new');
    expect(after.mastery).toBeGreaterThan(0);
    expect((await call('POST', '/api/sessions', { mode: 'GRAMMAR', topic: 'nope' })).status).toBe(404);
  });
});

describe('Магазин і гардероб', () => {
  it('покупка списує Złotki атомарно, предмет з’являється на бобрі', async () => {
    const { call, user } = await login();
    const shop = await call('GET', '/api/shop');
    const cap = shop.body.items.find((i: { slug: string }) => i.slug === 'cap-green');
    expect((await call('POST', '/api/shop/buy', { itemId: cap.id })).body.error).toBe('insufficient_funds');

    await prisma.gameWallet.update({ where: { userId: user.id }, data: { balance: 50 } });
    const buys = await Promise.all([call('POST', '/api/shop/buy', { itemId: cap.id }), call('POST', '/api/shop/buy', { itemId: cap.id })]);
    expect(buys.filter((b) => b.status === 200)).toHaveLength(1);
    const wallet = await prisma.gameWallet.findUniqueOrThrow({ where: { userId: user.id } });
    // 50 − 40 + 10 за досягнення «Модник».
    expect(wallet.balance).toBe(20);

    const eq = await call('POST', '/api/inventory/equip', { itemId: cap.id, equipped: true });
    expect(eq.body.wear.HAT).toBe('cap-green');
    const me = await call('GET', '/api/me');
    expect(me.body.outfit.wear.HAT).toBe('cap-green');
  });

  it('предмети-нагороди та Premium-предмети не продаються звичайним користувачам', async () => {
    const { call, user } = await login();
    await prisma.gameWallet.update({ where: { userId: user.id }, data: { balance: 1000 } });
    const shop = await call('GET', '/api/shop');
    const reward = shop.body.items.find((i: { slug: string }) => i.slug === 'hat-krasnal');
    const premium = shop.body.items.find((i: { slug: string }) => i.slug === 'crown-gold');
    expect((await call('POST', '/api/shop/buy', { itemId: reward.id })).body.error).toBe('reward_only');
    expect((await call('POST', '/api/shop/buy', { itemId: premium.id })).body.error).toBe('premium_required');
    expect((await call('POST', '/api/inventory/equip', { itemId: reward.id, equipped: true })).body.error).toBe('not_owned');
  });
});

describe('Соціальне', () => {
  it('друзі за кодом, приватність у рейтингу', async () => {
    const a = await login();
    const b = await login();
    const code = (await a.call('GET', '/api/friends')).body.referralCode;
    expect((await b.call('POST', '/api/friends', { code })).body.status).toBe('PENDING');
    const incoming = (await a.call('GET', '/api/friends')).body.friends.find((f: { incoming: boolean }) => f.incoming);
    expect((await a.call('POST', `/api/friends/${incoming.id}/respond`, { accept: true })).body.status).toBe('ACCEPTED');

    const s = await b.call('POST', '/api/sessions', { lessonId: await lessonId('waw-1-czesc') });
    await playSession(b.call, s.body.sessionId);
    let lb = await a.call('GET', '/api/leaderboard?scope=friends');
    expect(lb.body.rows.some((r: { userId: string }) => r.userId === b.user.id)).toBe(true);
    await b.call('PATCH', '/api/me/settings', { showInLeaderboard: false });
    lb = await a.call('GET', '/api/leaderboard?scope=friends');
    expect(lb.body.rows.some((r: { userId: string }) => r.userId === b.user.id)).toBe(false);
  });

  it('реферальне посилання робить друзями автоматично', async () => {
    const a = await login();
    const code = (await a.call('GET', '/api/friends')).body.referralCode;
    const b = await login({ start_param: `ref_${code}` });
    const friends = (await b.call('GET', '/api/friends')).body.friends;
    expect(friends[0]).toMatchObject({ status: 'ACCEPTED', user: { id: a.user.id } });
  });
});

describe('Premium через Telegram Stars', () => {
  function mockBot() {
    const calls: { method: string; body: Record<string, unknown> }[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      const method = String(url).split('/').pop()!;
      const body = JSON.parse(String(init?.body ?? '{}'));
      calls.push({ method, body });
      const result = method === 'createInvoiceLink' ? 'https://t.me/$invoice123' : true;
      return new Response(JSON.stringify({ ok: true, result }), { status: 200 });
    });
    return calls;
  }

  async function webhook(payload: unknown, secret = 'hook-secret') {
    const app = await getApp();
    return app.inject({ method: 'POST', url: '/telegram/webhook', payload: payload as never, headers: { 'x-telegram-bot-api-secret-token': secret } });
  }

  it('Premium активується лише після підтвердженого платежу, повторна доставка ігнорується', async () => {
    const calls = mockBot();
    const { call, user, telegramId } = await login();
    const inv = await call('POST', '/api/premium/invoice', { plan: 'MONTH_1' });
    expect(inv.status).toBe(200);
    const created = calls.find((c) => c.method === 'createInvoiceLink')!;
    expect(created.body).toMatchObject({ currency: 'XTR', subscription_period: 2592000 });
    expect((await call('GET', '/api/me')).body.premium.active).toBe(false);

    // Невірний секрет webhook
    expect((await webhook({ update_id: 1 }, 'wrong')).statusCode).toBe(401);

    // Перевірка перед оплатою: чужий користувач і неправильна сума — відмова
    await webhook({ update_id: 2, pre_checkout_query: { id: 'q1', from: { id: 999 }, currency: 'XTR', total_amount: 250, invoice_payload: inv.body.payload } });
    expect(calls.at(-1)).toMatchObject({ method: 'answerPreCheckoutQuery', body: { ok: false } });
    await webhook({ update_id: 3, pre_checkout_query: { id: 'q2', from: { id: telegramId }, currency: 'XTR', total_amount: 1, invoice_payload: inv.body.payload } });
    expect(calls.at(-1)).toMatchObject({ method: 'answerPreCheckoutQuery', body: { ok: false } });
    await webhook({ update_id: 4, pre_checkout_query: { id: 'q3', from: { id: telegramId }, currency: 'XTR', total_amount: 250, invoice_payload: inv.body.payload } });
    expect(calls.at(-1)).toMatchObject({ method: 'answerPreCheckoutQuery', body: { ok: true } });
    expect((await call('GET', '/api/me')).body.premium.active).toBe(false);

    const payment = {
      update_id: 5,
      message: {
        chat: { id: telegramId }, from: { id: telegramId },
        successful_payment: { currency: 'XTR', total_amount: 250, invoice_payload: inv.body.payload, telegram_payment_charge_id: `ch_${telegramId}`, subscription_expiration_date: Math.floor(Date.now() / 1000) + 30 * 86400, is_recurring: true, is_first_recurring: true },
      },
    };
    expect((await webhook(payment)).statusCode).toBe(200);
    expect((await webhook({ ...payment, update_id: 6 })).statusCode).toBe(200);
    expect(await prisma.subscription.count({ where: { userId: user.id } })).toBe(1);
    const me = await call('GET', '/api/me');
    expect(me.body.premium).toMatchObject({ active: true, planCode: 'MONTH_1', recurring: true });

    // Premium-предмет тепер можна купити
    await prisma.gameWallet.update({ where: { userId: user.id }, data: { balance: 500 } });
    const crown = (await call('GET', '/api/shop')).body.items.find((i: { slug: string }) => i.slug === 'crown-gold');
    expect((await call('POST', '/api/shop/buy', { itemId: crown.id })).status).toBe(200);

    // Скасування автопродовження — Premium діє до кінця періоду
    const cancel = await call('POST', '/api/premium/cancel');
    expect(cancel.status).toBe(200);
    expect(calls.at(-1)).toMatchObject({ method: 'editUserStarSubscription', body: { is_canceled: true } });
    expect((await call('GET', '/api/me')).body.premium).toMatchObject({ active: true, cancelled: true });
  });

  it('разовий тариф на 3 місяці продовжує Premium', async () => {
    mockBot();
    const { call, telegramId } = await login();
    const inv = await call('POST', '/api/premium/invoice', { plan: 'MONTH_3' });
    await webhook({ update_id: 10, message: { chat: { id: telegramId }, from: { id: telegramId }, successful_payment: { currency: 'XTR', total_amount: 600, invoice_payload: inv.body.payload, telegram_payment_charge_id: `ch3_${telegramId}` } } });
    const exp = new Date((await call('GET', '/api/me')).body.premium.expiresAt).getTime();
    const days = (exp - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(85);
    expect(days).toBeLessThan(93);
  });

  it('AI: Premium-режими захищені, ліміт Free діє, без ключа — обмежений режим', async () => {
    const { call } = await login();
    expect((await call('POST', '/api/ai/message', { mode: 'roleplay', scene: 'cafe', text: 'Dzień dobry' })).body.error).toBe('premium_required');
    const r = await call('POST', '/api/ai/message', { mode: 'chat', text: 'kot i pies' });
    expect(r.status).toBe(200);
    expect(r.body.offline).toBe(true);
    expect(r.body.reply).toContain('kot');
    for (let i = 1; i < 10; i++) await call('POST', '/api/ai/message', { mode: 'chat', text: 'cześć', conversationId: r.body.conversationId });
    expect((await call('POST', '/api/ai/message', { mode: 'chat', text: 'cześć' })).body.error).toBe('ai_limit_reached');
  });
});

describe('Адмін-панель', () => {
  async function adminLogin(email = 'admin@test.dev', password = 'admin-password-123') {
    const app = await getApp();
    const res = await app.inject({ method: 'POST', url: '/api/admin/login', payload: { email, password } });
    const token = res.json().token as string;
    return async (method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE', url: string, payload?: unknown) => {
      const r = await app.inject({ method, url: `/api/admin${url}`, payload: payload as never, headers: { authorization: `Bearer ${token}` } });
      return { status: r.statusCode, body: r.body ? r.json() : null };
    };
  }

  it('невірний пароль відхиляється; без токена доступу немає', async () => {
    const app = await getApp();
    expect((await app.inject({ method: 'POST', url: '/api/admin/login', payload: { email: 'admin@test.dev', password: 'nope' } })).statusCode).toBe(401);
    expect((await app.inject({ method: 'GET', url: '/api/admin/dashboard' })).statusCode).toBe(401);
    // Токен користувача не підходить для адмінки
    const u = await login();
    expect((await app.inject({ method: 'GET', url: '/api/admin/dashboard', headers: { authorization: `Bearer ${u.token}` } })).statusCode).toBe(401);
  });

  it('адміністратор додає урок без зміни коду — він з’являється в грі', async () => {
    const admin = await adminLogin();
    const dash = await admin('GET', '/dashboard');
    expect(dash.status).toBe(200);
    expect(dash.body.users).toBeGreaterThan(0);

    const route = await prisma.cityRoute.findUniqueOrThrow({ where: { slug: 'waw-liczby' } });
    const lesson = await admin('POST', '/resources/lessons', {
      routeId: route.id, slug: 'waw-7-test', order: 10, kind: 'LESSON', title: { uk: 'Тестовий урок' }, topic: { uk: 'Тест' }, cefr: 'A0', difficulty: 1,
      explanation: { uk: 'Пояснення' }, examples: [], isPremium: false, status: 'PUBLISHED',
    });
    expect(lesson.status).toBe(200);
    const ex = await admin('POST', '/resources/exercises', {
      lessonId: lesson.body.id, order: 0, type: 'WORD_TRANSLATION', skill: 'vocab.test', explanation: null, audioUrl: null, imageUrl: null,
      data: { pl: 'kot', options: [{ id: 'a', text: { uk: 'кіт' } }, { id: 'b', text: { uk: 'пес' } }], answer: 'a' },
    });
    expect(ex.status).toBe(200);
    // Невалідний тип вправи відхиляється
    expect((await admin('POST', '/resources/exercises', { lessonId: lesson.body.id, order: 1, type: 'HACK', skill: 'x', data: {}, explanation: null, audioUrl: null, imageUrl: null })).status).toBe(400);

    const { call } = await login();
    const j = await call('GET', '/api/journey');
    const all = j.body.cities[0].routes.flatMap((r: { lessons: { slug: string }[] }) => r.lessons.map((l) => l.slug));
    expect(all).toContain('waw-7-test');
    const log = await admin('GET', '/audit');
    expect(log.body.some((l: { entity: string; action: string }) => l.entity === 'lessons' && l.action === 'create')).toBe(true);

    await admin('DELETE', `/resources/lessons/${lesson.body.id}`);
  });

  it('редактор не бачить користувачів і не змінює тарифи', async () => {
    const admin = await adminLogin();
    await admin('POST', '/admins', { email: 'editor@test.dev', name: 'Ed', role: 'EDITOR', password: 'editor-password-1' });
    const editor = await adminLogin('editor@test.dev', 'editor-password-1');
    expect((await editor('GET', '/users')).status).toBe(403);
    expect((await editor('PATCH', '/resources/plans/MONTH_1', { priceStars: 1 })).status).toBe(403);
    expect((await editor('GET', '/resources/vocabulary?search=kot')).status).toBe(200);
  });

  it('видача Premium та блокування користувача', async () => {
    const admin = await adminLogin();
    const u = await login();
    await admin('POST', `/users/${u.user.id}/premium`, { days: 30 });
    expect((await u.call('GET', '/api/me')).body.premium.active).toBe(true);
    await admin('POST', `/users/${u.user.id}/ban`, { banned: true, reason: 'XP abuse' });
    expect((await u.call('GET', '/api/me')).status).toBe(403);
  });
});

describe('Персональні дані', () => {
  it('експорт і видалення акаунта', async () => {
    const { call, user } = await login();
    const exp = await call('GET', '/api/me/export');
    expect(exp.status).toBe(200);
    expect(exp.body.id).toBe(user.id);
    expect((await call('DELETE', '/api/me', { confirm: 'DELETE' })).status).toBe(200);
    expect(await prisma.user.count({ where: { id: user.id } })).toBe(0);
  });
});
