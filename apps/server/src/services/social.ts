/** Таблиця лідерів, тижневі ліги, друзі. Приватність: show_in_leaderboard / public_profile. */
import { dayKey, weekKey } from '@polski-go/shared';
import { prisma } from '../db';
import { badRequest, notFound } from '../lib/errors';
import { evaluateAchievements } from './achievements';
import { leagueFor } from './rewards';

function displayName(u: { firstName: string; username: string | null; profile: { displayName: string | null } | null }) {
  return u.profile?.displayName || u.firstName || u.username || 'Bóbr';
}

export async function friendIds(userId: string): Promise<string[]> {
  const rows = await prisma.friendship.findMany({ where: { status: 'ACCEPTED', OR: [{ requesterId: userId }, { addresseeId: userId }] } });
  return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
}

export async function leaderboard(userId: string, scope: 'league' | 'friends' | 'all') {
  const week = weekKey(dayKey(new Date()));
  const me = await prisma.playerProgress.findUniqueOrThrow({ where: { userId } });
  const league = leagueFor(me.xpTotal);
  const friends = scope === 'friends' ? [...(await friendIds(userId)), userId] : undefined;
  const entries = await prisma.leaderboardEntry.findMany({
    where: {
      periodKey: week,
      ...(scope === 'league' ? { league } : {}),
      ...(friends ? { userId: { in: friends } } : {}),
      // Користувачі, що приховали себе з рейтингів, не показуються (крім самого себе).
      OR: [{ userId }, { user: { settings: { showInLeaderboard: true }, isBanned: false } }],
    },
    orderBy: { xp: 'desc' },
    take: 50,
    include: { user: { include: { profile: true, progress: true } } },
  });
  const rows = entries.map((e, i) => ({
    rank: i + 1,
    userId: e.userId,
    name: displayName(e.user),
    photoUrl: e.user.photoUrl,
    xp: e.xp,
    level: e.user.progress?.playerLevel ?? 1,
    isMe: e.userId === userId,
  }));
  if (!rows.some((r) => r.isMe)) {
    const mine = await prisma.leaderboardEntry.findUnique({ where: { userId_periodKey: { userId, periodKey: week } } });
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { profile: true } });
    rows.push({ rank: 0, userId, name: displayName(user), photoUrl: user.photoUrl, xp: mine?.xp ?? 0, level: me.playerLevel, isMe: true });
  }
  return { week, league, scope, rows };
}

export async function listFriends(userId: string) {
  const rows = await prisma.friendship.findMany({
    where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
    include: { requester: { include: { profile: true, progress: true, settings: true } }, addressee: { include: { profile: true, progress: true, settings: true } } },
  });
  return rows.map((r) => {
    const other = r.requesterId === userId ? r.addressee : r.requester;
    const visible = other.settings?.publicProfile !== false;
    return {
      id: r.id,
      status: r.status,
      incoming: r.addresseeId === userId && r.status === 'PENDING',
      user: {
        id: other.id,
        name: displayName(other),
        photoUrl: other.photoUrl,
        level: visible ? other.progress?.playerLevel : null,
        xp: visible ? other.progress?.xpTotal : null,
        streak: visible ? other.progress?.streakCurrent : null,
        languageLevel: visible ? other.progress?.languageLevel : null,
      },
    };
  });
}

export async function addFriendByCode(userId: string, code: string) {
  const other = await prisma.user.findUnique({ where: { referralCode: code } });
  if (!other) throw notFound('user_not_found');
  if (other.id === userId) throw badRequest('self');
  const existing = await prisma.friendship.findFirst({
    where: { OR: [{ requesterId: userId, addresseeId: other.id }, { requesterId: other.id, addresseeId: userId }] },
  });
  if (existing) {
    // Зустрічний запит — приймаємо.
    if (existing.status === 'PENDING' && existing.addresseeId === userId) {
      await prisma.friendship.update({ where: { id: existing.id }, data: { status: 'ACCEPTED' } });
    }
    return { status: existing.addresseeId === userId ? 'ACCEPTED' : existing.status };
  }
  await prisma.friendship.create({ data: { requesterId: userId, addresseeId: other.id } });
  return { status: 'PENDING' };
}

export async function respondFriend(userId: string, friendshipId: string, accept: boolean) {
  const f = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!f || (f.addresseeId !== userId && f.requesterId !== userId)) throw notFound();
  if (!accept) {
    await prisma.friendship.delete({ where: { id: f.id } });
    return { status: 'REMOVED' };
  }
  if (f.addresseeId !== userId) throw badRequest('not_addressee');
  await prisma.friendship.update({ where: { id: f.id }, data: { status: 'ACCEPTED' } });
  await prisma.$transaction(async (tx) => {
    await evaluateAchievements(tx, userId);
    await evaluateAchievements(tx, f.requesterId);
  });
  return { status: 'ACCEPTED' };
}
