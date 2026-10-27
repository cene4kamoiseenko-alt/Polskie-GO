/**
 * Настройка бота и секрет webhook.
 *  • Страница /telegram/setup: GET — только форма; ключ — заголовком POST, не в адресе; ключ — BOT_SETUP_KEY,
 *    а прежний TELEGRAM_WEBHOOK_SECRET открывает её, только пока сервер не перешёл на свой секрет.
 *  • Первая настройка переводит webhook на серверный секрет (32 случайных байта, его не видит никто, кроме Telegram);
 *    прежний принимается до подтверждения Telegram и ещё 10 минут после. Явный отказ Telegram возвращает прежний секрет,
 *    потерянный ответ оставляет оба, а cron повторяет setWebhook.
 *  • Админка (SUPERADMIN) — проверка, настройка и смена секрета с записью в журнал.
 *  • cron (`maintainBot`) чинит только безопасное: тот же адрес, тот же секрет; секрет меняет один раз — с переменной на серверный.
 * Telegram здесь — подмена fetch (`fakeTelegram`): это проверка кода, а не настоящего бота.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildCalls } from '../scripts/setup-bot.mjs';
import { db } from '../src/db';
import { adminAuditLogs, appState } from '../src/db/schema';
import { BOT_CONFIG_VERSION, maintainBot, readBotConfig } from '../src/bot/maintain';
import { ALLOWED_UPDATES, setupCalls } from '../src/bot/setup';
import { forgetSecretCache, loadSecretState, PREVIOUS_GRACE_MS, verifyWebhookSecret } from '../src/bot/webhook-secret';
import { BOT_TOKEN, disposeEnv, getEnv, request } from './helpers';
import { fakeTelegram, tgError, type TgCall } from './tg-fake';

const ENV_SECRET = 'hook-secret';
const SETUP_KEY = 'setup-key-0123456789abcdef0123456789';
const APP = 'https://polski.example';

beforeAll(async () => {
  const { env } = await getEnv();
  env.WEB_APP_URL = APP;
  env.TELEGRAM_BOT_USERNAME = 'PolskieGoo_bot';
});
afterAll(disposeEnv);
afterEach(async () => {
  vi.unstubAllGlobals();
  const { env } = await getEnv();
  env.WEB_APP_URL = APP;
  env.TELEGRAM_WEBHOOK_SECRET = ENV_SECRET;
  env.TELEGRAM_BOT_TOKEN = BOT_TOKEN;
  env.TELEGRAM_BOT_USERNAME = 'PolskieGoo_bot';
  env.BOT_SETUP_KEY = undefined;
  await db.delete(appState);
  forgetSecretCache();
});

const ME = { id: 123456, username: 'PolskieGoo_bot' };
const reply = (result: unknown) => new Response(JSON.stringify({ ok: true, result }), { headers: { 'content-type': 'application/json' } });
type Info = { url?: string; allowed_updates?: string[]; last_error_message?: string; last_error_date?: number; pending_update_count?: number };
/** Подмена Bot API: getMe и getWebhookInfo отвечают осмысленно, остальное — ok. */
const tg = (script: (call: TgCall, n: number) => Response | Error | undefined = () => undefined, info: Info = { url: `${APP}/telegram/webhook?x=1`, pending_update_count: 2, allowed_updates: ['message', 'pre_checkout_query'] }) =>
  fakeTelegram((call, n) => {
    const own = script(call, n);
    if (own) return own;
    if (call.method === 'getMe') return reply(ME);
    if (call.method === 'getWebhookInfo') return reply(info);
    return undefined;
  });
let ip = 0;
/** POST страницы настройки; у каждого вызова свой адрес клиента, чтобы не упираться в ограничение 10 запросов за 10 минут. */
const setup = (key: string | null, mode?: string, url = '/telegram/setup', from = `10.0.0.${++ip}`) =>
  request('POST', url, mode ? { mode } : {}, { 'cf-connecting-ip': from, ...(key === null ? {} : { 'x-setup-key': key }) });
const hookSecret = (calls: TgCall[]) => calls.find((c) => c.method === 'setWebhook')?.params.secret_token as string | undefined;

describe('страница настройки: доступ', () => {
  it('GET — только форма без секретов; ключ в адресе не принимается', async () => {
    const calls = tg();
    const { app, env } = await getEnv();
    const page = await app.request('/telegram/setup', {}, env);
    expect(page.status).toBe(200);
    expect(page.headers.get('cache-control')).toBe('no-store');
    const html = await page.text();
    expect(html).toContain('<form');
    expect(html).toContain('x-setup-key');
    for (const secret of [ENV_SECRET, BOT_TOKEN]) expect(html).not.toContain(secret);

    const inUrl = await app.request(`/telegram/setup?key=${ENV_SECRET}`, {}, env);
    expect(inUrl.status).toBe(400);
    expect(((await inUrl.json()) as { error: string }).error).toBe('key_in_url');
    const postInUrl = await setup(ENV_SECRET, 'check', `/telegram/setup?key=${ENV_SECRET}`);
    expect(postInUrl.status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it('без ключа и с чужим ключом — 401 и ни одного вызова Telegram', async () => {
    const calls = tg();
    for (const key of [null, '', 'wrong', `${ENV_SECRET}x`]) {
      const r = await setup(key, 'check');
      expect(r.status, String(key)).toBe(401);
      expect(r.body.error).toBe('wrong_key');
    }
    expect(calls).toHaveLength(0);
  });

  it('ни BOT_SETUP_KEY, ни секрета в окружении — 503 с подсказкой, Telegram не вызывается', async () => {
    const { env } = await getEnv();
    env.TELEGRAM_WEBHOOK_SECRET = '';
    const calls = tg();
    const r = await setup('', 'check');
    expect(r.status).toBe(503);
    expect(r.body.error).toBe('setup_key_not_set');
    expect(r.body.hints.join(' ')).toContain('BOT_SETUP_KEY');
    expect(calls).toHaveLength(0);
  });

  it('не больше 10 попыток за 10 минут с одного адреса — дальше 429 (подбор ключа)', async () => {
    tg();
    const codes: number[] = [];
    for (let i = 0; i < 11; i++) codes.push((await setup('wrong', 'check', '/telegram/setup', '10.9.9.9')).status);
    expect(codes.slice(0, 10).every((c) => c === 401)).toBe(true);
    expect(codes[10]).toBe(429);
  });

  it('BOT_SETUP_KEY задан — открывает только он, прежний секрет webhook — нет', async () => {
    const { env } = await getEnv();
    env.BOT_SETUP_KEY = SETUP_KEY;
    tg();
    expect((await setup(ENV_SECRET, 'check')).status).toBe(401);
    expect((await setup(SETUP_KEY, 'check')).status).toBe(200);
  });

  it('прежний TELEGRAM_WEBHOOK_SECRET открывает настройку только до перехода на серверный секрет', async () => {
    tg();
    expect((await setup(ENV_SECRET, 'check')).status).toBe(200);
    expect((await setup(ENV_SECRET, 'setup')).body.secretGeneration).toBe(1);
    const after = await setup(ENV_SECRET, 'check');
    expect(after.status).toBe(503);
    expect(after.body.error).toBe('setup_key_retired');
    expect(after.body.hints.join(' ')).toContain('админк');
  });
});

describe('настройка и серверный секрет', () => {
  it('getMe → команды (ru + uk/pl/en) → кнопка меню → webhook с callback_query и серверным секретом → getWebhookInfo', async () => {
    const calls = tg();
    const r = await setup(ENV_SECRET);
    expect(r.status).toBe(200);
    expect(r.body.ok).toBe(true);
    expect(r.body.bot).toEqual(ME);
    expect(calls.map((c) => c.method)).toEqual(['getMe', 'setMyCommands', 'setMyCommands', 'setMyCommands', 'setMyCommands', 'setChatMenuButton', 'setWebhook', 'getWebhookInfo']);
    for (const forbidden of ['setMyDescription', 'setMyShortDescription', 'setMyName', 'deleteWebhook', 'logOut', 'close']) expect(calls.some((c) => c.method === forbidden)).toBe(false);
    const hook = calls.find((c) => c.method === 'setWebhook')!;
    expect(hook.params.url).toBe(`${APP}/telegram/webhook`);
    expect(hook.params.allowed_updates).toEqual(['message', 'callback_query', 'pre_checkout_query']);
    expect(hook.params.drop_pending_updates).toBe(false);
    // Секрет — новый (не значение из окружения, которое могло утечь) и в формате Telegram: 1–256 знаков A–Z a–z 0–9 _ -.
    const secret = hookSecret(calls)!;
    expect(secret).not.toBe(ENV_SECRET);
    expect(secret).toMatch(/^[A-Za-z0-9_-]{32,256}$/);
    expect(r.body.secretGeneration).toBe(1);
    expect(r.body.secretConfirmed).toBe(true);
    expect(JSON.stringify(r.body)).not.toContain(secret);
    expect(r.body.webhook).toEqual({ url: `${APP}/telegram/webhook`, pending: 2, lastError: null, lastErrorAt: null, allowedUpdates: ['message', 'pre_checkout_query'] });
  });

  it('после смены webhook принимает серверный секрет, прежний — только 10 минут после подтверждения', async () => {
    const calls = tg();
    await setup(ENV_SECRET);
    const secret = hookSecret(calls)!;
    const state = (await loadSecretState(true))!;
    expect(state.confirmedAt).not.toBeNull();
    const now = Date.now();
    expect(await verifyWebhookSecret(secret, now)).toBe(true);
    expect(await verifyWebhookSecret(ENV_SECRET, now)).toBe(true);
    expect(await verifyWebhookSecret(ENV_SECRET, state.confirmedAt! + PREVIOUS_GRACE_MS + 1)).toBe(false);
    expect(await verifyWebhookSecret(secret, state.confirmedAt! + PREVIOUS_GRACE_MS + 1)).toBe(true);
    expect(await verifyWebhookSecret('', now)).toBe(false);
    expect(await verifyWebhookSecret(undefined, now)).toBe(false);
    expect(await verifyWebhookSecret(`${secret}x`, now)).toBe(false);

    // Тот же путь через HTTP: чужой секрет — 401, серверный — 200.
    const update = { update_id: 777_000_001 };
    expect((await request('POST', '/telegram/webhook', update, { 'x-telegram-bot-api-secret-token': 'nope' })).status).toBe(401);
    expect((await request('POST', '/telegram/webhook', update, { 'x-telegram-bot-api-secret-token': secret })).status).toBe(200);
  });

  it('повторная настройка не меняет секрет; rotate — новое поколение, прежнее принимается до подтверждения + 10 минут', async () => {
    let calls = tg();
    await setup(ENV_SECRET);
    const first = hookSecret(calls)!;
    const { env } = await getEnv();
    env.BOT_SETUP_KEY = SETUP_KEY;
    vi.unstubAllGlobals();
    calls = tg();
    expect((await setup(SETUP_KEY)).body.secretGeneration).toBe(1);
    expect(hookSecret(calls)).toBe(first);

    vi.unstubAllGlobals();
    calls = tg();
    const r = await setup(SETUP_KEY, 'rotate');
    expect(r.body.secretGeneration).toBe(2);
    const second = hookSecret(calls)!;
    expect(second).not.toBe(first);
    const state = (await loadSecretState(true))!;
    expect(await verifyWebhookSecret(first, Date.now())).toBe(true);
    expect(await verifyWebhookSecret(first, state.confirmedAt! + PREVIOUS_GRACE_MS + 1)).toBe(false);
    // Переменная окружения после первой смены ничего не открывает.
    expect(await verifyWebhookSecret(ENV_SECRET, Date.now())).toBe(false);
  });

  it('Telegram явно отказал в setWebhook — прежний секрет возвращается, webhook работает как раньше', async () => {
    tg((call) => (call.method === 'setWebhook' ? tgError(400, 'Bad Request: bad webhook') : undefined));
    const r = await setup(ENV_SECRET);
    expect(r.body.ok).toBe(false);
    expect(r.body.secretGeneration).toBe(0);
    expect(await loadSecretState(true)).toBeNull();
    expect(await verifyWebhookSecret(ENV_SECRET)).toBe(true);
  });

  it('ответ Telegram потерялся — новый секрет не подтверждён, работают оба, cron повторяет setWebhook и подтверждает', async () => {
    let calls = tg((call) => (call.method === 'setWebhook' ? new Error('network down') : undefined));
    const r = await setup(ENV_SECRET);
    expect(r.body.ok).toBe(false);
    const state = (await loadSecretState(true))!;
    expect(state.gen).toBe(1);
    expect(state.confirmedAt).toBeNull();
    expect(await verifyWebhookSecret(ENV_SECRET)).toBe(true);
    expect(await verifyWebhookSecret(state.current)).toBe(true);

    vi.unstubAllGlobals();
    calls = tg(undefined, { url: `${APP}/telegram/webhook`, allowed_updates: [...ALLOWED_UPDATES] });
    await maintainBot(new Date());
    expect(hookSecret(calls)).toBe(state.current);
    const confirmed = (await loadSecretState(true))!;
    expect(confirmed.gen).toBe(1);
    expect(confirmed.confirmedAt).not.toBeNull();
    expect(await verifyWebhookSecret(ENV_SECRET, confirmed.confirmedAt! + PREVIOUS_GRACE_MS + 1)).toBe(false);
  });

  it('команды и кнопка меню — те же, что у скрипта setup-bot; webhook скрипт больше не ставит', async () => {
    const calls = tg();
    await setup(ENV_SECRET);
    const sent = calls.filter((c) => ['setMyCommands', 'setChatMenuButton'].includes(c.method));
    const script = buildCalls({ WEB_APP_URL: APP }, {});
    expect(sent).toEqual(script);
    expect(setupCalls(APP, 'x').filter((c) => c.method !== 'setWebhook')).toEqual(script);
    expect(script.some((c: TgCall) => c.method === 'setWebhook')).toBe(false);
  });

  it('в ответе нет ни токена, ни секретов, даже если Telegram повторил их в ошибке', async () => {
    let secret = '';
    tg((call) => {
      if (call.method !== 'setMyCommands') return undefined;
      return tgError(400, `Bad Request: bot ${BOT_TOKEN} env ${ENV_SECRET}`);
    });
    const res = await setup(ENV_SECRET);
    secret = (await loadSecretState(true))?.current ?? '';
    const text = JSON.stringify(res.body);
    expect(text).not.toContain(BOT_TOKEN);
    expect(text).not.toContain(ENV_SECRET);
    if (secret) expect(text).not.toContain(secret);
  });

  it('режим check ничего не меняет: только getMe и getWebhookInfo, секрет не создаётся', async () => {
    const calls = tg();
    const r = await setup(ENV_SECRET, 'check');
    expect(r.body.mode).toBe('check');
    expect(calls.map((c) => c.method)).toEqual(['getMe', 'getWebhookInfo']);
    expect(await loadSecretState(true)).toBeNull();
    expect(r.body.hints.join(' ')).toContain('callback_query');
  });
});

describe('что именно не так — понятная подсказка', () => {
  it('неверный токен (404 в getMe): отчёт останавливается и говорит про TELEGRAM_BOT_TOKEN', async () => {
    const calls = tg((call) => (call.method === 'getMe' ? tgError(404, 'Not Found') : undefined));
    const r = await setup(ENV_SECRET);
    expect(r.status).toBe(200);
    expect(r.body.ok).toBe(false);
    expect(r.body.steps).toEqual([{ step: 'getMe', ok: false, code: 404, error: 'Not Found' }]);
    expect(r.body.hints.join(' ')).toContain('TELEGRAM_BOT_TOKEN');
    expect(calls.map((c) => c.method)).toEqual(['getMe']);
  });

  it('токен не задан: подсказка, Telegram не вызывается', async () => {
    const { env } = await getEnv();
    env.TELEGRAM_BOT_TOKEN = '';
    const calls = tg();
    const r = await setup(ENV_SECRET);
    expect(r.body.ok).toBe(false);
    expect(r.body.steps[0].step).toBe('token');
    expect(calls).toHaveLength(0);
  });

  it('WEB_APP_URL не https: webhook, команды и секрет не трогаются, сказано что исправить', async () => {
    const { env } = await getEnv();
    env.WEB_APP_URL = '';
    const calls = tg();
    const r = await setup(ENV_SECRET);
    expect(r.body.hints.join(' ')).toContain('WEB_APP_URL');
    expect(calls.map((c) => c.method)).toEqual(['getMe', 'getWebhookInfo']);
    expect(await loadSecretState(true)).toBeNull();
  });

  it('токен другого бота: подсказка про имя', async () => {
    const { env } = await getEnv();
    env.TELEGRAM_BOT_USERNAME = 'Other_bot';
    tg();
    const r = await setup(ENV_SECRET, 'check');
    expect(r.body.hints.join(' ')).toContain('@PolskieGoo_bot');
  });

  it('Telegram получает 401 от сервера: подсказка настроить бота заново', async () => {
    tg(undefined, { url: `${APP}/telegram/webhook`, last_error_message: 'Wrong response from the webhook: 401 Unauthorized', last_error_date: Math.floor(Date.now() / 1000) });
    const r = await setup(ENV_SECRET, 'check');
    expect(r.body.webhook.lastError).toContain('401');
    expect(r.body.hints.join(' ')).toContain('секрет webhook');
  });

  it('сбой одной команды не обрывает остальные шаги и помечает отчёт как неуспешный', async () => {
    const calls = tg((call) => (call.method === 'setChatMenuButton' ? tgError(400, 'Bad Request: invalid URL') : undefined));
    const r = await setup(ENV_SECRET);
    expect(r.body.ok).toBe(false);
    expect(r.body.steps.find((s: { step: string }) => s.step === 'setChatMenuButton')).toMatchObject({ ok: false, code: 400 });
    expect(calls.map((c) => c.method)).toContain('setWebhook');
  });
});

describe('админка: раздел «Бот»', () => {
  const adminToken = async () => {
    const r = await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' });
    expect(r.status).toBe(200);
    return { authorization: `Bearer ${r.body.token}` };
  };

  it('без входа — 401; проверка ничего не меняет; настройка и смена секрета пишутся в журнал без секретов', async () => {
    const calls = tg();
    expect((await request('GET', '/api/admin/bot')).status).toBe(401);
    const auth = await adminToken();
    const check = await request('GET', '/api/admin/bot', undefined, auth);
    expect(check.status).toBe(200);
    expect(check.body.report.mode).toBe('check');
    expect(calls.some((c) => c.method === 'setWebhook')).toBe(false);

    const res = await request('POST', '/api/admin/bot/setup', { mode: 'setup' }, auth);
    expect(res.body.secretGeneration).toBe(1);
    const rotated = await request('POST', '/api/admin/bot/setup', { mode: 'rotate' }, auth);
    expect(rotated.body.secretGeneration).toBe(2);
    expect((await request('POST', '/api/admin/bot/setup', { mode: 'drop' }, auth)).status).toBe(400);

    const logs = await db.select().from(adminAuditLogs);
    const actions = logs.map((l) => l.action);
    expect(actions).toContain('bot_setup');
    expect(actions).toContain('bot_rotate_secret');
    const state = (await loadSecretState(true))!;
    const text = JSON.stringify(logs);
    for (const s of [state.current, state.previous ?? 'none', ENV_SECRET, BOT_TOKEN]) expect(text).not.toContain(s);
  });
});

describe('cron: самопроверка бота', () => {
  const at = (iso: string) => new Date(iso);

  it('первый запуск: переходит на серверный секрет, ставит webhook на тот же адрес с callback_query, обновляет меню', async () => {
    const calls = tg(undefined, { url: `${APP}/telegram/webhook`, allowed_updates: ['message', 'pre_checkout_query'] });
    const n = await maintainBot(at('2026-10-27T10:00:00Z'));
    expect(n).toBe(calls.length);
    expect(calls.map((c) => c.method)).toEqual(['getWebhookInfo', 'setWebhook', 'setMyCommands', 'setMyCommands', 'setMyCommands', 'setMyCommands']);
    const hook = calls.find((c) => c.method === 'setWebhook')!;
    expect(hook.params.url).toBe(`${APP}/telegram/webhook`);
    expect(hook.params.allowed_updates).toContain('callback_query');
    expect(hook.params.secret_token).not.toBe(ENV_SECRET);
    const saved = (await readBotConfig())!;
    expect(saved).toMatchObject({ version: BOT_CONFIG_VERSION, webhook: 'ok', callbackQuery: true, secretGeneration: 1, secretConfirmed: true });
    expect(saved.actions).toEqual(['rotated', 'webhook', 'commands']);
    expect(JSON.stringify(saved)).not.toContain(String(hook.params.secret_token));
  });

  it('в течение часа — ни одного вызова; через час, если всё в порядке, — только getWebhookInfo, секрет не меняется', async () => {
    let calls = tg(undefined, { url: `${APP}/telegram/webhook`, allowed_updates: ['message', 'pre_checkout_query'] });
    await maintainBot(at('2026-10-27T10:00:00Z'));
    const secret = hookSecret(calls);
    vi.unstubAllGlobals();
    calls = tg(undefined, { url: `${APP}/telegram/webhook`, allowed_updates: [...ALLOWED_UPDATES] });
    expect(await maintainBot(at('2026-10-27T10:30:00Z'))).toBe(0);
    expect(calls).toHaveLength(0);
    expect(await maintainBot(at('2026-10-27T11:01:00Z'))).toBe(1);
    expect(calls.map((c) => c.method)).toEqual(['getWebhookInfo']);
    expect((await loadSecretState(true))!.current).toBe(secret);
  });

  it('401 после последней настройки — один повтор setWebhook с тем же секретом; та же старая ошибка повтора не вызывает', async () => {
    let calls = tg(undefined, { url: `${APP}/telegram/webhook`, allowed_updates: [...ALLOWED_UPDATES] });
    await maintainBot(at('2026-10-27T10:00:00Z'));
    const secret = hookSecret(calls);
    const errorAt = Math.floor(at('2026-10-27T10:30:00Z').getTime() / 1000);
    const info = { url: `${APP}/telegram/webhook`, allowed_updates: [...ALLOWED_UPDATES], last_error_message: 'Wrong response from the webhook: 401 Unauthorized', last_error_date: errorAt };
    vi.unstubAllGlobals();
    calls = tg(undefined, info);
    await maintainBot(at('2026-10-27T11:01:00Z'));
    expect(calls.map((c) => c.method)).toEqual(['getWebhookInfo', 'setWebhook']);
    expect(hookSecret(calls)).toBe(secret);
    vi.unstubAllGlobals();
    calls = tg(undefined, info);
    await maintainBot(at('2026-10-27T12:02:00Z'));
    expect(calls.map((c) => c.method)).toEqual(['getWebhookInfo']);
  });

  it('webhook не установлен — cron его не ставит и секрет не меняет (адрес задаёт владелец)', async () => {
    const calls = tg(undefined, { url: '' });
    await maintainBot(at('2026-10-27T10:00:00Z'));
    expect(calls.some((c) => c.method === 'setWebhook')).toBe(false);
    expect(await loadSecretState(true)).toBeNull();
    expect((await readBotConfig())!.webhook).toBe('missing');
  });

  it('Telegram недоступен — ошибка записана, секрет остаётся прежним', async () => {
    tg((call) => (call.method === 'getWebhookInfo' ? tgError(502, 'Bad Gateway') : undefined));
    await maintainBot(at('2026-10-27T10:00:00Z'));
    const saved = (await readBotConfig())!;
    expect(saved.webhook).toBe('error');
    expect(saved.error).toContain('502');
    expect(await loadSecretState(true)).toBeNull();
  });
});
