/**
 * Техработы (2026-11-23, переезд базы D1 в Европу, docs/OPERATIONS_RU.md): секрет MAINTENANCE=on — запись в базу запрещена, чтобы копия
 * была полной; чтение работает; webhook бота отвечает 503 — Telegram повторит сообщения после работ. Без секрета всё как обычно.
 */
import { afterAll, afterEach, describe, expect, it } from 'vitest';
import { disposeEnv, getEnv, login, request } from './helpers';

afterAll(disposeEnv);
const set = async (v?: string) => {
  const { env } = await getEnv();
  if (v === undefined) delete (env as { MAINTENANCE?: string }).MAINTENANCE;
  else (env as { MAINTENANCE?: string }).MAINTENANCE = v;
};
afterEach(() => set());

describe('техработы', () => {
  it('чтение работает, запись — 503 maintenance; webhook бота — 503', async () => {
    const u = await login();
    await set('on');
    expect((await request('GET', '/api/health')).status).toBe(200);
    expect((await u.call('GET', '/api/me')).status).toBe(200);
    const w = await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A1', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: 19 });
    expect(w.status).toBe(503);
    expect(w.body.error).toBe('maintenance');
    const hook = await request('POST', '/telegram/webhook', { update_id: 1, message: { message_id: 1, chat: { id: 1, type: 'private' }, from: { id: 1, first_name: 'X' }, text: '/start' } }, { 'x-telegram-bot-api-secret-token': 'hook-secret' });
    expect(hook.status).toBe(503);
  });

  it('без секрета (или off) — запись работает как обычно', async () => {
    const u = await login();
    await set('off');
    expect((await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A1', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: 19 })).status).toBe(200);
  });
});
