/**
 * Домик Бобека как дневной цикл (владелец 2026-11-03: «домик по сути бессмысленный, кнопку тяжело найти»), docs/HOUSING.md:
 * выполнил цель дня — домик даёт «домашний бонус» Złotki; чем лучше квартира, тем больше бонус (HOUSING_BONUS). Так квартира — вложение, а не картинка.
 * Бонус — раз в день по местной дате игрока, ключ идемпотентности `house:<user>:<день>` (два одновременных запроса не дадут двух начислений).
 */
import { and, eq } from 'drizzle-orm';
import { dayKey } from '@polski-go/shared';
import { atomic, db } from '../db';
import { cosmeticItems, dailyActivity, gameWallets, userInventory, userSettings, walletTransactions } from '../db/schema';
import { HOUSING_BONUS, HOUSING_PRICES } from '../content/gamification';
import { badRequest } from '../lib/errors';
import { goalXpFor } from './goal';
import { grantZlotki } from './rewards';

const DEFAULT_HOUSING = 'housing-opole';
const bonusKey = (userId: string, day: string) => `house:${userId}:${day}`;

export type HouseState = {
  /** Выбранная квартира (slug). */
  home: string;
  /** Домашний бонус этой квартиры, Złotki в день. */
  bonus: number;
  /** Цель дня выполнена (XP за сегодня ≥ цели). */
  goalDone: boolean;
  /** Бонус за сегодня уже получен. */
  claimed: boolean;
  /** XP сегодня и цель — для подписи «осталось N XP». */
  xp: number;
  goalXp: number;
  /** Самая дешёвая некупленная квартира (цель накопления) или null, если куплены все. */
  next: { slug: string; price: number; bonus: number } | null;
  /** Бонус каждой квартиры (для подписи «+N в день» в списке). */
  bonuses: Record<string, number>;
};

export async function houseState(userId: string, now = new Date()): Promise<HouseState & { day: string }> {
  const [settings, housing] = await Promise.all([
    db.select({ tz: userSettings.timezone, goal: userSettings.dailyGoalMinutes }).from(userSettings).where(eq(userSettings.userId, userId)).get(),
    db
      .select({ slug: cosmeticItems.slug, equipped: userInventory.equipped })
      .from(userInventory)
      .innerJoin(cosmeticItems, eq(cosmeticItems.id, userInventory.itemId))
      .where(and(eq(userInventory.userId, userId), eq(cosmeticItems.slot, 'HOUSING'))),
  ]);
  const day = dayKey(now, settings?.tz ?? 'Europe/Warsaw');
  const [act, tx] = await Promise.all([
    db.select({ xp: dailyActivity.xp }).from(dailyActivity).where(and(eq(dailyActivity.userId, userId), eq(dailyActivity.day, day))).get(),
    db.select({ id: walletTransactions.id }).from(walletTransactions).where(eq(walletTransactions.idempotencyKey, bonusKey(userId, day))).get(),
  ]);
  const home = housing.find((h) => h.equipped)?.slug ?? DEFAULT_HOUSING;
  const owned = new Set([DEFAULT_HOUSING, ...housing.map((h) => h.slug)]);
  const next = (Object.entries(HOUSING_PRICES) as [keyof typeof HOUSING_PRICES, number][])
    .filter(([slug, price]) => price > 0 && !owned.has(slug))
    .sort((a, b) => a[1] - b[1])[0];
  const xp = act?.xp ?? 0;
  const goalXp = goalXpFor(settings?.goal ?? 10);
  return {
    day,
    home,
    bonus: HOUSING_BONUS[home as keyof typeof HOUSING_BONUS] ?? HOUSING_BONUS[DEFAULT_HOUSING],
    goalDone: xp >= goalXp,
    claimed: !!tx,
    xp,
    goalXp,
    next: next ? { slug: next[0], price: next[1], bonus: HOUSING_BONUS[next[0]] } : null,
    bonuses: { ...HOUSING_BONUS },
  };
}

/** Забрать домашний бонус за сегодня: только при выполненной цели дня, один раз в день. */
export async function claimHouseBonus(userId: string, now = new Date()) {
  const st = await houseState(userId, now);
  if (!st.goalDone) throw badRequest('goal_not_done', 'Сначала выполни цель дня');
  if (st.claimed) throw badRequest('already_claimed');
  await atomic(grantZlotki(userId, st.bonus, `house:${st.home}`, bonusKey(userId, st.day), now).stmts);
  const wallet = await db.select({ balance: gameWallets.balance }).from(gameWallets).where(eq(gameWallets.userId, userId)).get();
  const { day: _day, ...state } = await houseState(userId, now);
  return { granted: st.bonus, balance: wallet?.balance ?? 0, house: state };
}
