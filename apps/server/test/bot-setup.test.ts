/**
 * Самонастройка бота из Worker (GET /telegram/setup): доступ только по секрету webhook, токен берётся из окружения,
 * ответ не содержит ни токена, ни секрета; набор вызовов совпадает со скриптом setup-bot.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildCalls } from '../scripts/setup-bot.mjs';
import { setupCalls } from '../src/bot/setup';
import { BOT_TOKEN, disposeEnv, getEnv, request } from './helpers';
import { fakeTelegram, tgError } from './tg-fake';

const SECRET = 'hook-secret';
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
  env.TELEGRAM_WEBHOOK_SECRET = SECRET;
  env.TELEGRAM_BOT_TOKEN = BOT_TOKEN;
  env.TELEGRAM_BOT_USERNAME = 'PolskieGoo_bot';
});

const ME = { ok: true, result: { id: 123456, username: 'PolskieGoo_bot' } };
const reply = (result: unknown) => new Response(JSON.stringify({ ok: true, result }), { headers: { 'content-type': 'application/json' } });
/** Подмена Bot API: getMe и getWebhookInfo отвечают осмысленно, остальное — ok. */
const tg = (script: Parameters<typeof fakeTelegram>[0] = () => undefined) =>
  fakeTelegram((call, n) => {
    const own = script(call, n);
    if (own) return own;
    if (call.method === 'getMe') return reply(ME.result);
    if (call.method === 'getWebhookInfo') return reply({ url: `${APP}/telegram/webhook?x=1`, pending_update_count: 2, allowed_updates: ['message', 'pre_checkout_query'] });
    return undefined;
  });
const open = (query: string) => request('GET', `/telegram/setup${query}`);

describe('доступ', () => {
  it('без ключа и с чужим ключом — 401 и ни одного вызова Telegram', async () => {
    const calls = tg();
    for (const q of ['', '?key=', '?key=wrong', `?key=${SECRET}x`]) {
      const r = await open(q);
      expect(r.status, q).toBe(401);
      expect(r.body.error).toBe('wrong_key');
    }
    expect(calls).toHaveLength(0);
  });

  it('секрет webhook не задан — 503 с подсказкой, Telegram не вызывается', async () => {
    const { env } = await getEnv();
    env.TELEGRAM_WEBHOOK_SECRET = '';
    const calls = tg();
    const r = await open('?key=');
    expect(r.status).toBe(503);
    expect(r.body.error).toBe('webhook_secret_not_set');
    expect(calls).toHaveLength(0);
  });

  it('ключ можно передать заголовком x-setup-key', async () => {
    tg();
    const res = await request('GET', '/telegram/setup?mode=check', undefined, { 'x-setup-key': SECRET });
    expect(res.status).toBe(200);
  });
});

describe('настройка', () => {
  it('getMe → команды (ru + uk/pl/en) → кнопка меню → webhook → getWebhookInfo; описание и картинка не трогаются', async () => {
    const calls = tg();
    const r = await open(`?key=${SECRET}`);
    expect(r.status).toBe(200);
    expect(r.body.ok).toBe(true);
    expect(r.body.bot).toEqual({ id: 123456, username: 'PolskieGoo_bot' });
    expect(calls.map((c) => c.method)).toEqual(['getMe', 'setMyCommands', 'setMyCommands', 'setMyCommands', 'setMyCommands', 'setChatMenuButton', 'setWebhook', 'getWebhookInfo']);
    for (const forbidden of ['setMyDescription', 'setMyShortDescription', 'setMyName', 'deleteWebhook', 'logOut', 'close']) expect(calls.some((c) => c.method === forbidden)).toBe(false);
    const hook = calls.find((c) => c.method === 'setWebhook')!;
    expect(hook.params).toEqual({ url: `${APP}/telegram/webhook`, secret_token: SECRET, allowed_updates: ['message', 'pre_checkout_query'], drop_pending_updates: false });
    expect(r.body.webhook).toEqual({ url: `${APP}/telegram/webhook`, pending: 2, lastError: null, lastErrorAt: null, allowedUpdates: ['message', 'pre_checkout_query'] });
    expect(r.body.steps.every((s: { ok: boolean }) => s.ok)).toBe(true);
  });

  it('тот же набор вызовов, что у скрипта setup-bot', async () => {
    const calls = tg();
    await open(`?key=${SECRET}`);
    const sent = calls.filter((c) => ['setMyCommands', 'setChatMenuButton', 'setWebhook'].includes(c.method));
    const script = buildCalls({ WEB_APP_URL: APP, PUBLIC_URL: APP, TELEGRAM_WEBHOOK_SECRET: SECRET }, { webhook: true });
    expect(sent).toEqual(script);
    expect(setupCalls(APP, SECRET)).toEqual(script);
  });

  it('в ответе нет ни токена, ни секрета', async () => {
    tg((call) => (call.method === 'setWebhook' ? tgError(400, `Bad Request: bot ${BOT_TOKEN} secret ${SECRET}`) : undefined));
    const res = await request('GET', `/telegram/setup?key=${SECRET}`);
    const text = JSON.stringify(res.body);
    expect(text).not.toContain(BOT_TOKEN);
    expect(text).not.toContain(SECRET);
  });

  it('режим check ничего не меняет: только getMe и getWebhookInfo', async () => {
    const calls = tg();
    const r = await open(`?key=${SECRET}&mode=check`);
    expect(r.body.mode).toBe('check');
    expect(calls.map((c) => c.method)).toEqual(['getMe', 'getWebhookInfo']);
  });
});

describe('что именно не так — понятная подсказка', () => {
  it('неверный токен (404 в getMe): отчёт останавливается и говорит про TELEGRAM_BOT_TOKEN', async () => {
    const calls = tg((call) => (call.method === 'getMe' ? tgError(404, 'Not Found') : undefined));
    const r = await open(`?key=${SECRET}`);
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
    const r = await open(`?key=${SECRET}`);
    expect(r.body.ok).toBe(false);
    expect(r.body.steps[0].step).toBe('token');
    expect(calls).toHaveLength(0);
  });

  it('WEB_APP_URL не https: webhook и команды не отправляются, сказано что исправить', async () => {
    const { env } = await getEnv();
    env.WEB_APP_URL = '';
    const calls = tg();
    const r = await open(`?key=${SECRET}`);
    expect(r.body.hints.join(' ')).toContain('WEB_APP_URL');
    expect(calls.map((c) => c.method)).toEqual(['getMe', 'getWebhookInfo']);
  });

  it('секрет с недопустимыми знаками: Telegram не вызывается для webhook, подсказка про формат', async () => {
    const { env } = await getEnv();
    env.TELEGRAM_WEBHOOK_SECRET = 'bad secret!';
    const calls = tg();
    const r = await request('GET', '/telegram/setup?key=bad%20secret!');
    expect(r.status).toBe(200);
    expect(calls.some((c) => c.method === 'setWebhook')).toBe(false);
    expect(r.body.hints.join(' ')).toContain('TELEGRAM_WEBHOOK_SECRET');
  });

  it('токен другого бота: подсказка про имя', async () => {
    const { env } = await getEnv();
    env.TELEGRAM_BOT_USERNAME = 'Other_bot';
    tg();
    const r = await open(`?key=${SECRET}&mode=check`);
    expect(r.body.hints.join(' ')).toContain('@PolskieGoo_bot');
  });

  it('Telegram получает 401 от сервера: подсказка перезапустить настройку', async () => {
    tg((call) => (call.method === 'getWebhookInfo' ? reply({ url: `${APP}/telegram/webhook`, last_error_message: 'Wrong response from the webhook: 401 Unauthorized', last_error_date: 1_700_000_000 }) : undefined));
    const r = await open(`?key=${SECRET}&mode=check`);
    expect(r.body.webhook.lastError).toContain('401');
    expect(r.body.hints.join(' ')).toContain('секрет webhook');
  });

  it('сбой одной команды не обрывает остальные шаги и помечает отчёт как неуспешный', async () => {
    const calls = tg((call) => (call.method === 'setChatMenuButton' ? tgError(400, 'Bad Request: invalid URL') : undefined));
    const r = await open(`?key=${SECRET}`);
    expect(r.body.ok).toBe(false);
    expect(r.body.steps.find((s: { step: string }) => s.step === 'setChatMenuButton')).toMatchObject({ ok: false, code: 400 });
    expect(calls.map((c) => c.method)).toContain('setWebhook');
  });
});
