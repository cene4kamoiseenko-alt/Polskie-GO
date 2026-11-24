/**
 * «Открыл карточку бота» (кнопка карточки ведёт в приложение с меткой `src=card_<вид>`): отметка у последней отправленной карточки
 * этого вида за 3 дня — для отчёта «открыли» в админке и правила «две неоткрытые подряд — 30 дней тишины».
 */
import { and, desc, eq, gte, isNull } from 'drizzle-orm';
import { addDays, dayKey } from '@polski-go/shared';
import { db } from '../../db';
import { engageSends, users, type EngageKind } from '../../db/schema';

export async function markCardOpened(userId: string, kind: EngageKind, now = new Date()): Promise<void> {
  const u = await db.select({ tg: users.telegramId }).from(users).where(eq(users.id, userId)).get();
  if (!u) return;
  const row = await db
    .select({ day: engageSends.day })
    .from(engageSends)
    .where(and(eq(engageSends.telegramId, u.tg), eq(engageSends.kind, kind), eq(engageSends.status, 'SENT'), isNull(engageSends.openedAt), gte(engageSends.day, addDays(dayKey(now, 'Europe/Warsaw'), -3))))
    .orderBy(desc(engageSends.day))
    .limit(1)
    .get();
  if (row) await db.update(engageSends).set({ openedAt: now }).where(and(eq(engageSends.day, row.day), eq(engageSends.telegramId, u.tg)));
}
