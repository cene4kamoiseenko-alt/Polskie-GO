/** Таблиця лідерів, тижневі ліги, друзі. Приватність: show_in_leaderboard / public_profile. */
import { and, asc, desc, eq, gt, gte, inArray, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { LEAGUE_MIN_XP, LEAGUE_PRIZE_MIN_XP, LEAGUE_PRIZES, leaguePrize, leagueWeek, leagueWeekEndsAt } from '@polski-go/shared';
import { atomic, db } from '../db';
import { friendships, leaderboards, playerProgress, userProfiles, userSettings, users } from '../db/schema';
import { badRequest, notFound } from '../lib/errors';
import { evaluateAchievements } from './achievements';
import { leagueFor } from './rewards';
import { isPremium } from './premium';
import { visibleInLeague, weekWinners } from './league';

function displayName(u: { firstName: string; username: string | null; displayName: string | null }) {
  return u.displayName || u.firstName || u.username || 'Bóbr';
}

export async function friendIds(userId: string): Promise<string[]> {
  const rows = await db.select().from(friendships).where(and(eq(friendships.status, 'ACCEPTED'), or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId))));
  return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
}

/**
 * Рейтинг недели (вариант А, 2026-11-15). `league` (и прежний `all`) — одна общая таблица недели для всех, у кого за неделю от
 * LEAGUE_MIN_XP: раньше игроки делились на четыре лиги по опыту за всё время, и в каждой оказывалось по 3–5 человек.
 * Значок лиги у строки остаётся (по общему XP). `friends` — друзья и я, у кого есть XP за неделю.
 * Неделя — по Варшаве (`leagueWeek`). Порядок: XP по убыванию, при равенстве — кто набрал раньше.
 */
export async function leaderboard(userId: string, scope: 'league' | 'friends' | 'all', now = new Date()) {
  const week = leagueWeek(now);
  const me = await db.query.playerProgress.findFirst({ where: eq(playerProgress.userId, userId) });
  const xpTotal = me?.xpTotal ?? 0;
  const league = leagueFor(xpTotal);
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
      xpTotal: playerProgress.xpTotal,
      // Значок Premium у рейтингу: активна (або скасована, але ще оплачена) підписка.
      premium: sql<number>`EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = ${leaderboards.userId} AND s.status IN ('ACTIVE', 'CANCELLED') AND s.expires_at > ${now.getTime()})`,
    })
    .from(leaderboards)
    .innerJoin(users, eq(users.id, leaderboards.userId))
    .leftJoin(userProfiles, eq(userProfiles.userId, leaderboards.userId))
    .leftJoin(playerProgress, eq(playerProgress.userId, leaderboards.userId))
    .innerJoin(userSettings, eq(userSettings.userId, leaderboards.userId))
    .where(
      and(
        eq(leaderboards.periodKey, week),
        friends ? and(inArray(leaderboards.userId, friends), gt(leaderboards.xp, 0)) : gte(leaderboards.xp, LEAGUE_MIN_XP),
        // Користувачі, що приховали себе з рейтингів, не показуються (крім самого себе).
        or(eq(leaderboards.userId, userId), visibleInLeague),
      ),
    )
    .orderBy(desc(leaderboards.xp), asc(leaderboards.updatedAt))
    .limit(50);
  const rows = entries.map((e, i) => ({
    rank: i + 1, userId: e.userId, name: displayName(e), photoUrl: e.photoUrl, xp: e.xp, level: e.level ?? 1, premium: !!e.premium, isMe: e.userId === userId,
    league: leagueFor(e.xpTotal ?? 0),
    // Приз, который место даст в конце недели (если набрано от LEAGUE_PRIZE_MIN_XP); в таблице друзей мест-призов нет.
    prize: scope !== 'friends' && e.xp >= LEAGUE_PRIZE_MIN_XP ? leaguePrize(i + 1) : 0,
  }));
  const mineRow = await db.select().from(leaderboards).where(and(eq(leaderboards.userId, userId), eq(leaderboards.periodKey, week)));
  const weekXp = mineRow[0]?.xp ?? 0;
  if (!rows.some((r) => r.isMe)) {
    const [user, premium] = await Promise.all([
      db.select({ firstName: users.firstName, username: users.username, photoUrl: users.photoUrl, displayName: userProfiles.displayName }).from(users).leftJoin(userProfiles, eq(userProfiles.userId, users.id)).where(eq(users.id, userId)),
      isPremium(userId),
    ]);
    rows.push({ rank: 0, userId, name: displayName(user[0]), photoUrl: user[0].photoUrl, xp: weekXp, level: me?.playerLevel ?? 1, premium, isMe: true, league, prize: 0 });
  }
  const myRank = rows.find((r) => r.isMe)?.rank ?? 0;
  // Сколько не хватает: до порога таблицы и до 3-го места (обогнать: при равенстве выше тот, кто набрал раньше).
  const onPodium = myRank > 0 && myRank <= 3;
  // Чтобы стать третьим, надо обогнать третьего из остальных игроков; если их меньше трёх — достаточно призового порога.
  const third = rows.filter((r) => !r.isMe && r.rank > 0)[2];
  const toPodium = onPodium || scope === 'friends' ? 0 : Math.max((third?.xp ?? 0) + 1, LEAGUE_PRIZE_MIN_XP) - weekXp;
  // Наступна ліга — за загальним XP (пороги як у leagueFor).
  const ladder: [string, number][] = [['silver', 500], ['gold', 2000], ['diamond', 5000]];
  const nxt = ladder.find(([, at]) => xpTotal < at);
  const lastWeek = leagueWeek(new Date(now.getTime() - 7 * 86_400_000));
  const winners = scope === 'friends' ? [] : await weekWinners(lastWeek).catch(() => []);
  const winnerNames = winners.length
    ? await db.select({ id: users.id, firstName: users.firstName, username: users.username, photoUrl: users.photoUrl, displayName: userProfiles.displayName }).from(users).leftJoin(userProfiles, eq(userProfiles.userId, users.id)).where(inArray(users.id, winners.map((w) => w.userId)))
    : [];
  return {
    week,
    endsAt: leagueWeekEndsAt(now).toISOString(),
    league,
    scope,
    minXp: LEAGUE_MIN_XP,
    prizeMinXp: LEAGUE_PRIZE_MIN_XP,
    prizes: [...LEAGUE_PRIZES],
    rows,
    me: {
      xpTotal, weekXp, rank: myRank,
      toJoin: Math.max(0, LEAGUE_MIN_XP - weekXp),
      toPodium: Math.max(0, toPodium),
      next: nxt ? { league: nxt[0], at: nxt[1] } : null,
    },
    lastWeek: winners.map((w) => {
      const u = winnerNames.find((n) => n.id === w.userId);
      return { rank: w.rank, xp: w.xp, zlotki: w.zlotki, name: u ? displayName(u) : 'Bóbr', photoUrl: u?.photoUrl ?? null, isMe: w.userId === userId };
    }),
  };
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
