/**
 * Подписка на канал @polskigoo (2026-11-23, docs/superpowers/specs/2026-11-23-channel-mission-design.md).
 * Бот спрашивает Telegram (getChatMember), состоит ли игрок в канале; подтверждённая подписка пишется в users.channel_joined_at
 * и навсегда открывает миссию канала (content/mission-channel.ts). Повторно Telegram не спрашиваем.
 * getChatMember для канала работает, только если бот — администратор канала (права можно не давать); иначе Telegram отвечает
 * 400 «member list is inaccessible» — это «проверка недоступна», а не «не подписан»: игрок не должен слышать, что он не подписан.
 */
import { eq } from 'drizzle-orm';
import { config } from '../env';
import { db } from '../db';
import { users } from '../db/schema';
import { botApi } from '../lib/telegram';
import { notFound } from '../lib/errors';
import { recordError } from './error-log';

export type ChannelVerify = { ok: true } | { ok: false; reason: 'not_member' | 'no_telegram' | 'unavailable' };

/** Состоит ли в канале: creator/administrator/member; restricted — только с is_member; left/kicked — нет. */
export function isChannelMember(m: { status: string; is_member?: boolean }): boolean {
  if (m.status === 'creator' || m.status === 'administrator' || m.status === 'member') return true;
  return m.status === 'restricted' && m.is_member === true;
}

export async function verifyChannel(userId: string, now = new Date()): Promise<ChannelVerify> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { telegramId: true, channelJoinedAt: true } });
  if (!user) throw notFound('user_not_found');
  if (user.channelJoinedAt) return { ok: true };
  // Гость вне Telegram (services/standalone-auth.ts): id отрицательный, проверять нечего.
  if (user.telegramId < 0) return { ok: false, reason: 'no_telegram' };
  let member: { status: string; is_member?: boolean };
  try {
    member = await botApi<{ status: string; is_member?: boolean }>('getChatMember', { chat_id: config.channelChat, user_id: user.telegramId });
  } catch (e) {
    await recordError({ kind: 'server', message: `channel verify: ${(e as Error).message}`, path: '/api/channel/verify' }).catch(() => {});
    return { ok: false, reason: 'unavailable' };
  }
  if (!isChannelMember(member)) return { ok: false, reason: 'not_member' };
  await db.update(users).set({ channelJoinedAt: now }).where(eq(users.id, userId));
  return { ok: true };
}
