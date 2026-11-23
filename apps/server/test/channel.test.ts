/**
 * Миссия за подписку на канал @polskigoo (docs/superpowers/specs/2026-11-23-channel-mission-design.md):
 * замок у миссии канала, проверка подписки через Bot API getChatMember, доступ навсегда после проверки.
 */
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { isChannelMember } from '../src/services/channel';
import { disposeEnv, login, request } from './helpers';
import { fakeTelegram, tgError } from './tg-fake';

afterAll(disposeEnv);
afterEach(() => vi.unstubAllGlobals());

const SLUG = 'escape-twardowski';
const member = (status: string, extra: Record<string, unknown> = {}) =>
  new Response(JSON.stringify({ ok: true, result: { status, user: { id: 1 }, ...extra } }), { headers: { 'content-type': 'application/json' } });
const missionOf = async (call: Awaited<ReturnType<typeof login>>['call']) =>
  ((await call('GET', '/api/missions')).body.missions as { slug: string; locked: boolean; lock: string | null; channel: boolean }[]).find((m) => m.slug === SLUG)!;

describe('isChannelMember', () => {
  it('member, administrator, creator — подписан; left, kicked — нет; restricted — по is_member', () => {
    for (const status of ['member', 'administrator', 'creator']) expect(isChannelMember({ status }), status).toBe(true);
    for (const status of ['left', 'kicked']) expect(isChannelMember({ status }), status).toBe(false);
    expect(isChannelMember({ status: 'restricted', is_member: true })).toBe(true);
    expect(isChannelMember({ status: 'restricted', is_member: false })).toBe(false);
    expect(isChannelMember({ status: 'restricted' })).toBe(false);
  });
});

describe('Миссия канала: замок и проверка подписки', () => {
  it('до проверки: в списке замок «channel», старт — 403 channel_required; у Premium-сцены замок «premium»', async () => {
    const { call } = await login();
    const m = await missionOf(call);
    expect(m).toMatchObject({ channel: true, locked: true, lock: 'channel' });
    const landlord = ((await call('GET', '/api/missions')).body.missions as { slug: string; lock: string | null }[]).find((x) => x.slug === 'landlord')!;
    expect(landlord.lock).toBe('premium');
    const start = await call('POST', `/api/missions/${SLUG}/start`);
    expect(start.status).toBe(403);
    expect(start.body.error).toBe('channel_required');
    expect((await call('GET', '/api/me')).body.channelJoined).toBe(false);
  });

  it('подписан: verify → ok, спрашивает @polskigoo про этого игрока; миссия открыта навсегда, повтор без запроса в Telegram', async () => {
    const { call, telegramId } = await login();
    const calls = fakeTelegram((c) => (c.method === 'getChatMember' ? member('member') : undefined));
    expect((await call('POST', '/api/channel/verify')).body).toEqual({ ok: true });
    expect(calls.filter((c) => c.method === 'getChatMember')).toEqual([{ method: 'getChatMember', params: { chat_id: '@polskigoo', user_id: telegramId } }]);
    expect(await missionOf(call)).toMatchObject({ locked: false, lock: null });
    expect((await call('POST', `/api/missions/${SLUG}/start`)).status).toBe(200);
    expect((await call('GET', '/api/me')).body.channelJoined).toBe(true);
    expect((await call('POST', '/api/channel/verify')).body).toEqual({ ok: true });
    expect(calls.filter((c) => c.method === 'getChatMember')).toHaveLength(1);
  });

  it('вышел из канала или забанен — not_member, миссия закрыта', async () => {
    for (const status of ['left', 'kicked']) {
      const { call } = await login();
      fakeTelegram((c) => (c.method === 'getChatMember' ? member(status) : undefined));
      expect((await call('POST', '/api/channel/verify')).body, status).toEqual({ ok: false, reason: 'not_member' });
      expect((await missionOf(call)).locked, status).toBe(true);
    }
  });

  it('бот не админ канала (Telegram 400) — unavailable, а не «не подписан»; миссия закрыта', async () => {
    const { call } = await login();
    fakeTelegram((c) => (c.method === 'getChatMember' ? tgError(400, 'Bad Request: member list is inaccessible') : undefined));
    expect((await call('POST', '/api/channel/verify')).body).toEqual({ ok: false, reason: 'unavailable' });
    expect((await missionOf(call)).locked).toBe(true);
  });

  it('гость вне Telegram — no_telegram, без запроса в Telegram', async () => {
    const g = await request('POST', '/api/auth/guest', { platform: 'twa', language: 'ru' }, { 'cf-connecting-ip': '10.9.9.9' });
    const auth = { authorization: `Bearer ${g.body.token}` };
    const calls = fakeTelegram();
    expect((await request('POST', '/api/channel/verify', undefined, auth)).body).toEqual({ ok: false, reason: 'no_telegram' });
    expect(calls).toHaveLength(0);
  });
});
