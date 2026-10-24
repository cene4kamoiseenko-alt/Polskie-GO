/** Таблиця лідерів, тижневі ліги, друзі. Приватність: show_in_leaderboard / public_profile. */
import { and, desc, eq, inArray, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { dayKey, weekKey } from '@polski-go/shared';
import { atomic, db } from '../db';
import { friendships, leaderboards, playerProgress, userProfiles, userSettings, users } from '../db/schema';
import { badRequest, notFound } from '../lib/errors';
import { evaluateAchievements } from './achievements';
import { leagueFor } from './rewards';

function displayName(u: { firstName: string; username: string | null; displayName: string | null }) {
  return u.displayName || u.firstName || u.username || 'Bóbr';
}

export async function friendIds(userId: string): Promise<string[]> {
  const rows = await db.select().from(friendships).where(and(eq(friendships.status, 'ACCEPTED'), or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId))));
  return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
}

export async function leaderboard(userId: string, scope: 'league' | 'friends' | 'all') {
  const week = weekKey(dayKey(new Date()));
  const me = await db.query.playerProgress.findFirst({ where: eq(playerProgress.userId, userId) });
  const league = leagueFor(me?.xpTotal ?? 0);
  const friends = scope === 'friends' ? [...(await friendIds(userId)), userId] : undefined;
  const entries = await db
    .select({
      userId: leaderboards.userId,
      xp: leaderboards.xp,
      firstName: users.firstName,
      username: users.username,
      photoUrl: users.photoUrl,
      displayName: userProfiles.displayName,
      level: playerProgress.playerLevel,
    })
    .from(leaderboards)
    .innerJoin(users, eq(users.id, leaderboards.userId))
    .leftJoin(userProfiles, eq(userProfiles.userId, leaderboards.userId))
    .leftJoin(playerProgress, eq(playerProgress.userId, leaderboards.userId))
    .leftJoin(userSettings, eq(userSettings.userId, leaderboards.userId))
    .where(
      and(
        eq(leaderboards.periodKey, week),
        scope === 'league' ? eq(leaderboards.league, league) : undefined,
        friends ? inArray(leaderboards.userId, friends) : undefined,
        // Користувачі, що приховали себе з рейтингів, не показуються (крім самого себе).
        or(eq(leaderboards.userId, userId), and(eq(userSettings.showInLeaderboard, true), eq(users.isBanned, false))),
      ),
    )
    .orderBy(desc(leaderboards.xp))
    .limit(50);
  const rows = entries.map((e, i) => ({ rank: i + 1, userId: e.userId, name: displayName(e), photoUrl: e.photoUrl, xp: e.xp, level: e.level ?? 1, isMe: e.userId === userId }));
  if (!rows.some((r) => r.isMe)) {
    const [mine, user] = await Promise.all([
      db.select().from(leaderboards).where(and(eq(leaderboards.userId, userId), eq(leaderboards.periodKey, week))),
      db.select({ firstName: users.firstName, username: users.username, photoUrl: users.photoUrl, displayName: userProfiles.displayName }).from(users).leftJoin(userProfiles, eq(userProfiles.userId, users.id)).where(eq(users.id, userId)),
    ]);
    rows.push({ rank: 0, userId, name: displayName(user[0]), photoUrl: user[0].photoUrl, xp: mine[0]?.xp ?? 0, level: me?.playerLevel ?? 1, isMe: true });
  }
  return { week, league, scope, rows };
}

export async function listFriends(userId: string) {
  const other = alias(users, 'other');
  const rows = await db
    .select({
      f: friendships,
      other: { id: other.id, firstName: other.firstName, username: other.username, photoUrl: other.photoUrl },
      displayName: userProfiles.displayName,
      progress: playerProgress,
      publicProfile: userSettings.publicProfile,
    })
    .from(friendships)
    .innerJoin(other, or(and(eq(friendships.requesterId, userId), eq(other.id, friendships.addresseeId)), and(eq(friendships.addresseeId, userId), eq(other.id, friendships.requesterId))))
    .leftJoin(userProfiles, eq(userProfiles.userId, other.id))
    .leftJoin(playerProgress, eq(playerProgress.userId, other.id))
    .leftJoin(userSettings, eq(userSettings.userId, other.id))
    .where(or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)));
  return rows.map((r) => {
    const visible = r.publicProfile !== false;
    return {
      id: r.f.id,
      status: r.f.status,
      incoming: r.f.addresseeId === userId && r.f.status === 'PENDING',
      user: {
        id: r.other.id,
        name: displayName({ ...r.other, displayName: r.displayName }),
        photoUrl: r.other.photoUrl,
        level: visible ? r.progress?.playerLevel : null,
        xp: visible ? r.progress?.xpTotal : null,
        streak: visible ? r.progress?.streakCurrent : null,
        languageLevel: visible ? r.progress?.languageLevel : null,
      },
    };
  });
}

export async function addFriendByCode(userId: string, code: string) {
  const other = await db.query.users.findFirst({ where: eq(users.referralCode, code) });
  if (!other) throw notFound('user_not_found');
  if (other.id === userId) throw badRequest('self');
  const existing = await db.query.friendships.findFirst({
    where: or(and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, other.id)), and(eq(friendships.requesterId, other.id), eq(friendships.addresseeId, userId))),
  });
  if (existing) {
    // Зустрічний запит — приймаємо.
    if (existing.status === 'PENDING' && existing.addresseeId === userId) {
      await db.update(friendships).set({ status: 'ACCEPTED' }).where(eq(friendships.id, existing.id));
    }
    return { status: existing.addresseeId === userId ? 'ACCEPTED' : existing.status };
  }
  await db.insert(friendships).values({ requesterId: userId, addresseeId: other.id }).onConflictDoNothing();
  return { status: 'PENDING' };
}

export async function respondFriend(userId: string, friendshipId: string, accept: boolean) {
  const f = await db.query.friendships.findFirst({ where: eq(friendships.id, friendshipId) });
  if (!f || (f.addresseeId !== userId && f.requesterId !== userId)) throw notFound();
  if (!accept) {
    await db.delete(friendships).where(eq(friendships.id, f.id));
    return { status: 'REMOVED' };
  }
  if (f.addresseeId !== userId) throw badRequest('not_addressee');
  const progress = await db.select().from(playerProgress).where(inArray(playerProgress.userId, [userId, f.requesterId]));
  const stmts = [db.update(friendships).set({ status: 'ACCEPTED' }).where(eq(friendships.id, f.id))];
  for (const p of progress) {
    const adj: Record<string, number> = f.status === 'ACCEPTED' ? {} : { FRIENDS: 1 };
    stmts.push(...((await evaluateAchievements(p.userId, p, adj)).stmts as never[]));
  }
  await atomic(stmts);
  return { status: 'ACCEPTED' };
}
