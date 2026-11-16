/**
 * Траты Złotki на серию (владелец 2026-11-16: «Оставляем только серию и заморозки»; титулы и открытки отменены):
 *  • заморозка серии — 75 zł, в запасе до двух, закрывает пропущенный день (rewards.ts → updateStreak);
 *  • восстановление серии — серия сгорела 1–2 дня назад: 10 zł за день серии (100–500), «вчера» становится днём занятий.
 * Списание и выдача — одним пакетом D1: CHECK баланса и запаса заморозок и ключ журнала кошелька
 * откатывают всё вместе (двойное нажатие не спишет дважды).
 */
import { and, eq, sql } from 'drizzle-orm';
import { addDays, dayKey, effectiveStreak, STREAK_FREEZE_MAX, STREAK_FREEZE_PRICE, streakRepairOffer } from '@polski-go/shared';
import { atomic, db, isUniqueViolation } from '../db';
import { gameWallets, playerProgress, userSettings } from '../db/schema';
import { badRequest, HttpError, notFound } from '../lib/errors';
import { isPremium } from './premium';
import { spendZlotki } from './rewards';

async function balance(userId: string) {
  return (await db.query.gameWallets.findFirst({ where: eq(gameWallets.userId, userId) }))?.balance ?? 0;
}
async function progressOf(userId: string) {
  const p = await db.query.playerProgress.findFirst({ where: eq(playerProgress.userId, userId) });
  if (!p) throw notFound('progress_not_found');
  return p;
}
async function todayOf(userId: string, now: Date) {
  const s = await db.query.userSettings.findFirst({ where: eq(userSettings.userId, userId), columns: { timezone: true } });
  return dayKey(now, s?.timezone ?? 'Europe/Warsaw');
}

/** Купить заморозку серии. */
export async function buyStreakFreeze(userId: string, requestKey: string) {
  const p = await progressOf(userId);
  if (p.streakFreezes >= STREAK_FREEZE_MAX) throw new HttpError(409, 'freeze_limit', 'Заморозок уже две');
  try {
    await atomic([
      ...spendZlotki(userId, STREAK_FREEZE_PRICE, 'streak_freeze', `freeze:${userId}:${requestKey}`),
      // +1 в самой базе: два одновременных нажатия не купят одну заморозку за двойную цену, а третью отсечёт CHECK (0–2).
      db.update(playerProgress).set({ streakFreezes: sql`${playerProgress.streakFreezes} + 1` }).where(eq(playerProgress.userId, userId)),
    ]);
  } catch (e) {
    if (isUniqueViolation(e)) throw badRequest('already_done');
    throw e;
  }
  return { freezes: (await progressOf(userId)).streakFreezes, balance: await balance(userId) };
}

/** Восстановить сгоревшую серию (1–2 пропущенных дня): «вчера» становится последним днём занятий. */
export async function repairStreak(userId: string, now = new Date()) {
  const [p, premium, today] = await Promise.all([progressOf(userId), isPremium(userId), todayOf(userId, now)]);
  const alive = effectiveStreak(p.streakCurrent, p.lastActiveDay, today, { premium, shieldDay: p.streakShieldDay, freezes: p.streakFreezes });
  const offer = streakRepairOffer(p.streakCurrent, p.lastActiveDay, today, alive);
  if (!offer) throw new HttpError(409, 'repair_unavailable', 'Серию сейчас нельзя восстановить');
  try {
    await atomic([
      ...spendZlotki(userId, offer.price, 'streak_repair', `repair:${userId}:${today}`),
      // Условие на прежний день — повтор или параллельный запрос ничего не изменит.
      db.update(playerProgress).set({ lastActiveDay: addDays(today, -1) }).where(and(eq(playerProgress.userId, userId), eq(playerProgress.lastActiveDay, p.lastActiveDay!))),
    ]);
  } catch (e) {
    if (isUniqueViolation(e)) throw badRequest('already_done');
    throw e;
  }
  return { streak: offer.streak, price: offer.price, balance: await balance(userId) };
}
