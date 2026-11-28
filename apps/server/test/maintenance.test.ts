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

  // Переезд базы (1.0, этап 1.1): после выгрузки старая база не должна меняться, иначе запись пропадёт при переключении.
  // Запрет по методу запроса не ловит GET, которые пишут сами (отметка визита, ежедневные задания и т. п.), поэтому
  // в техработы база подключается только на чтение: любой INSERT/UPDATE/DELETE — 503 maintenance.
  it('GET-запросы приложения в техработы не меняют базу', async () => {
    const { env } = await getEnv();
    const u = await login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A1', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: 19 });
    const snapshot = async () => {
      const tables = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name").all<{ name: string }>();
      const out: Record<string, string> = {};
      for (const { name } of tables.results) out[name] = JSON.stringify((await env.DB.prepare(`SELECT * FROM "${name}" ORDER BY rowid`).all()).results);
      return out;
    };
    await set('on');
    const before = await snapshot();
    const paths = ['/api/me', '/api/me/stats', '/api/journey', '/api/quests', '/api/achievements', '/api/passport', '/api/shop', '/api/premium', '/api/profile', '/api/pass', '/api/missions', '/api/friends', '/api/vocab', '/api/vocab/topics'];
    for (const p of paths) {
      const r = await u.call('GET', p);
      expect([200, 404, 503], `${p} → ${r.status}`).toContain(r.status);
    }
    const after = await snapshot();
    const changed = Object.keys(after).filter((t) => after[t] !== before[t]);
    expect(changed).toEqual([]);
  });

  it('без секрета (или off) — запись работает как обычно', async () => {
    const u = await login();
    await set('off');
    expect((await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A1', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: 19 })).status).toBe(200);
  });
});
