/**
 * Недельная лига (вариант А, 2026-11-15): общая таблица недели с порогом 20 XP, неделя по Варшаве, итоги с призами
 * 300 / 200 / 100 / 25 zł (от 100 XP), один раз; поздравление в боте; награда в /me до отметки «видел».
 * Синтетические недели 2031 года — чтобы строки других тестов этой базы не попадали в таблицу.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { dayKey, leagueWeek, weekKey } from '@polski-go/shared';
import { atomic, db } from '../src/db';
import { gameWallets, leaderboards, leagueAwards, leagueWeeks, playerProgress, userSettings } from '../src/db/schema';
import { leaderboard } from '../src/services/social';
import { sendLeagueAwardMessages, settleDueLeagueWeek, settleLeagueWeek } from '../src/services/league';
import { grantXp } from '../src/services/rewards';
import { getEnv, login } from './helpers';
import { fakeTelegram } from './tg-fake';

afterEach(() => vi.unstubAllGlobals());

type Player = Awaited<ReturnType<typeof login>>;

/** Игрок с XP за неделю `week` (и общим XP — от него значок лиги). `at` — когда XP набран (для ничьих). */
async function player(week: string, xp: number, opts: { total?: number; at?: Date; hidden?: boolean } = {}): Promise<Player> {
  const p = await login();
  await db.insert(leaderboards).values({ userId: p.user.id, periodKey: week, league: 'bronze', xp, updatedAt: opts.at ?? new Date('2031-03-05T10:00:00Z') });
  if (opts.total !== undefined) await db.update(playerProgress).set({ xpTotal: opts.total }).where(eq(playerProgress.userId, p.user.id));
  if (opts.hidden) await db.update(userSettings).set({ showInLeaderboard: false }).where(eq(userSettings.userId, p.user.id));
  return p;
}

const wallet = async (p: Player) => (await db.select().from(gameWallets).where(eq(gameWallets.userId, p.user.id)))[0].balance;

describe('таблица недели', () => {
  // Среда 2031-03-05, неделя 2031-W10.
  const now = new Date('2031-03-05T12:00:00Z');
  const week = leagueWeek(now);

  it('видны все с 20 XP за неделю, без деления на лиги; значок лиги — по общему XP; приз — за место', async () => {
    const top = await player(week, 300, { total: 6000 });
    const novice = await player(week, 150, { total: 100 });
    const quiet = await player(week, 10, { total: 50 });
    const board = await leaderboard(top.user.id, 'league', now);
    const ids = board.rows.map((r) => r.userId);
    expect(ids).toContain(top.user.id);
    expect(ids).toContain(novice.user.id);
    expect(ids).not.toContain(quiet.user.id);
    const a = board.rows.find((r) => r.userId === top.user.id)!;
    const b = board.rows.find((r) => r.userId === novice.user.id)!;
    expect(a.rank).toBeLessThan(b.rank);
    expect(a.league).toBe('diamond');
    expect(b.league).toBe('bronze');
    expect(a.prize).toBeGreaterThan(0);
    expect(board.minXp).toBe(20);
    expect(board.prizeMinXp).toBe(100);
    expect(board.prizes.slice(0, 4)).toEqual([300, 200, 100, 25]);
    expect(new Date(board.endsAt).toISOString()).toBe('2031-03-09T23:00:00.000Z');
  });

  it('игрок ниже порога видит себя отдельно (место 0) и сколько XP не хватает до порога', async () => {
    const quiet = await player(week, 12);
    const board = await leaderboard(quiet.user.id, 'league', now);
    const me = board.rows.find((r) => r.isMe)!;
    expect(me.rank).toBe(0);
    expect(board.me.weekXp).toBe(12);
    expect(board.me.toJoin).toBe(8);
  });

  it('ничья по XP: выше тот, кто набрал раньше', async () => {
    const w = '2031-W11';
    const n = new Date('2031-03-12T12:00:00Z');
    const late = await player(w, 500, { at: new Date('2031-03-12T09:00:00Z') });
    const early = await player(w, 500, { at: new Date('2031-03-11T09:00:00Z') });
    const board = await leaderboard(late.user.id, 'league', n);
    expect(board.rows.map((r) => r.userId).slice(0, 2)).toEqual([early.user.id, late.user.id]);
  });

  it('XP идёт в неделю по Варшаве, даже если у игрока в поясе уже понедельник', async () => {
    const p = await login();
    // Воскресенье 21:00 в Варшаве = понедельник 05:00 в Токио.
    const at = new Date('2031-03-16T20:00:00Z');
    const day = dayKey(at, 'Asia/Tokyo');
    const progress = (await db.select().from(playerProgress).where(eq(playerProgress.userId, p.user.id)))[0];
    const g = grantXp({ userId: p.user.id, now: at, tz: 'Asia/Tokyo', day, week: weekKey(day), progress, premium: false }, 40, 'test', `league-tz-${p.user.id}`);
    await atomic(g.stmts);
    const rows = await db.select().from(leaderboards).where(eq(leaderboards.userId, p.user.id));
    expect(rows.map((r) => r.periodKey)).toEqual([leagueWeek(at)]);
    expect(leagueWeek(at)).not.toBe(weekKey(day));
  });
});

describe('итоги недели', () => {
  it('призы 300 / 200 / 100 / 25 за места 1–10, только от 100 XP; скрытые не занимают место; второй раз — ничего', async () => {
    const week = '2031-W20';
    const xps = [900, 800, 700, 600, 500, 400, 300, 200, 150, 90, 60];
    const ps: Player[] = [];
    for (const [i, xp] of xps.entries()) ps.push(await player(week, xp, { at: new Date(Date.UTC(2031, 4, 13, 10, i)) }));
    const hidden = await player(week, 5000, { hidden: true });
    const before = await Promise.all(ps.map(wallet));
    const hiddenBefore = await wallet(hidden);
    const first = await settleLeagueWeek(week, new Date('2031-05-19T00:10:00Z'));
    expect(first.settled).toBe(true);
    const gained = (await Promise.all(ps.map(wallet))).map((b, i) => b - before[i]);
    // 10-е место набрало 90 XP (< 100) — приза нет; 11-е — вне призов.
    expect(gained).toEqual([300, 200, 100, 25, 25, 25, 25, 25, 25, 0, 0]);
    expect(await wallet(hidden)).toBe(hiddenBefore);
    const awards = await db.select().from(leagueAwards).where(eq(leagueAwards.week, week));
    expect(awards.map((a) => a.rank).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(awards.some((a) => a.userId === hidden.user.id)).toBe(false);

    const second = await settleLeagueWeek(week, new Date('2031-05-19T00:25:00Z'));
    expect(second.settled).toBe(false);
    expect((await Promise.all(ps.map(wallet))).map((b, i) => b - before[i])).toEqual(gained);
  });

  it('по расписанию подводится только прошедшая неделя, текущая — нет', async () => {
    const now = new Date('2031-06-04T12:00:00Z'); // среда
    const current = leagueWeek(now);
    const previous = leagueWeek(new Date(now.getTime() - 7 * 86_400_000));
    await player(previous, 400, { at: new Date('2031-05-28T10:00:00Z') });
    await player(current, 400, { at: new Date('2031-06-03T10:00:00Z') });
    await settleDueLeagueWeek(now);
    const settled = (await db.select().from(leagueWeeks)).map((w) => w.week);
    expect(settled).toContain(previous);
    expect(settled).not.toContain(current);
  });

  it('бот поздравляет призёра один раз; награда видна в /me, пока не отмечена «видел»', async () => {
    const { env } = await getEnv();
    // Telegram скачивает фото сам и только по HTTPS (bot/send.ts): адрес приложения — как в продакшене.
    env.WEB_APP_URL = 'https://polski.example/';
    const week = '2031-W30';
    const winner = await player(week, 640, { at: new Date('2031-07-22T10:00:00Z') });
    await db.update(userSettings).set({ notificationsEnabled: true, uiLanguage: 'ru' }).where(eq(userSettings.userId, winner.user.id));
    await settleLeagueWeek(week, new Date('2031-07-28T00:05:00Z'));

    const calls = fakeTelegram();
    await sendLeagueAwardMessages(new Date('2031-07-28T00:20:00Z'), 50);
    // Призёр 1–3 места с русским интерфейсом — постер своего места (надписи на постере по-русски) с подписью и кнопкой.
    const mine = calls.filter((c) => Number(c.params.chat_id) === winner.telegramId);
    expect(mine).toHaveLength(1);
    expect(mine[0].method).toBe('sendPhoto');
    expect(String(mine[0].params.photo)).toContain('/bot/league/ru/place-1.jpg');
    expect(String(mine[0].params.caption)).toContain('300');
    expect(mine[0].params.reply_markup?.inline_keyboard?.[0]?.[0]?.web_app?.url).toContain('bot_screen=league');
    await sendLeagueAwardMessages(new Date('2031-07-28T00:35:00Z'), 50);
    expect(calls.filter((c) => Number(c.params.chat_id) === winner.telegramId)).toHaveLength(1);

    const me = (await winner.call('GET', '/api/me')).body;
    expect(me.leagueAward).toMatchObject({ week, rank: 1, zlotki: 300, xp: 640 });
    expect((await winner.call('POST', '/api/leaderboard/award/seen', { week })).status).toBe(200);
    expect((await winner.call('GET', '/api/me')).body.leagueAward).toBeNull();
    const row = (await db.select().from(leagueAwards).where(and(eq(leagueAwards.week, week), eq(leagueAwards.userId, winner.user.id))))[0];
    expect(row.seenAt).not.toBeNull();
  });

  it('постер на языке игрока: 2-е место по-украински — украинский постер; английский интерфейс и 4-е место — текстом', async () => {
    const { env } = await getEnv();
    env.WEB_APP_URL = 'https://polski.example/';
    const week = '2031-W31';
    const at = (m: number) => new Date(Date.UTC(2031, 6, 30, 10, m));
    const first = await player(week, 900, { at: at(0) });
    const second = await player(week, 800, { at: at(1) });
    const third = await player(week, 700, { at: at(2) });
    const fourth = await player(week, 600, { at: at(3) });
    const langs: [Player, string][] = [[first, 'en'], [second, 'uk'], [third, 'ru'], [fourth, 'ru']];
    for (const [p, lang] of langs) await db.update(userSettings).set({ notificationsEnabled: true, uiLanguage: lang }).where(eq(userSettings.userId, p.user.id));
    await settleLeagueWeek(week, new Date('2031-08-04T00:05:00Z'));
    const calls = fakeTelegram();
    await sendLeagueAwardMessages(new Date('2031-08-04T00:20:00Z'), 50);
    const to = (p: Player) => calls.filter((c) => Number(c.params.chat_id) === p.telegramId);
    expect(to(first).map((c) => c.method)).toEqual(['sendMessage']);
    expect(to(second).map((c) => c.method)).toEqual(['sendPhoto']);
    expect(String(to(second)[0].params.photo)).toContain('/bot/league/uk/place-2.jpg');
    expect(String(to(second)[0].params.caption)).toMatch(/місце/);
    expect(String(to(third)[0].params.photo)).toContain('/bot/league/ru/place-3.jpg');
    expect(to(fourth).map((c) => c.method)).toEqual(['sendMessage']);
    expect(String(to(fourth)[0].params.text)).toContain('25');
  });
});
