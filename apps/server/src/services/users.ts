import { randomBytes } from 'node:crypto';
import { uiLangFor } from '@polski-go/shared';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { atomic, db, isUniqueViolation } from '../db';
import { cities, cosmeticItems, friendships, gameWallets, newId, playerProgress, userCities, userInventory, userProfiles, userSettings, users } from '../db/schema';
import type { TelegramUser } from '../lib/telegram';

function newReferralCode() {
  return randomBytes(5).toString('base64url').replace(/[-_]/g, 'x').slice(0, 8);
}

/** Знайти або створити користувача за підтвердженими даними Telegram. */
export async function upsertTelegramUser(tg: TelegramUser, startParam?: string): Promise<typeof users.$inferSelect> {
  const telegramId = tg.id;
  const existing = await db.query.users.findFirst({ where: eq(users.telegramId, telegramId) });
  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        username: tg.username ?? null,
        firstName: tg.first_name ?? '',
        lastName: tg.last_name ?? null,
        photoUrl: tg.photo_url ?? existing.photoUrl,
        languageCode: tg.language_code ?? existing.languageCode,
        lastSeenAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();
    return updated;
  }

  // Реферальне посилання: startapp=ref_<code>
  let referredById: string | null = null;
  if (startParam?.startsWith('ref_')) {
    const ref = await db.query.users.findFirst({ where: eq(users.referralCode, startParam.slice(4)) });
    if (ref) referredById = ref.id;
  }

  const [firstCity, starterItems] = await db.batch([
    db.select().from(cities).where(eq(cities.status, 'PUBLISHED')).orderBy(asc(cities.order)).limit(1),
    db.select().from(cosmeticItems).where(inArray(cosmeticItems.slug, ['hoodie-red', 'backpack-travel', 'bed-basic'])),
  ]);
  const cityId = firstCity[0]?.id ?? null;
  const id = newId();
  try {
    await atomic([
      db.insert(users).values({
        id, telegramId, username: tg.username ?? null, firstName: tg.first_name ?? '', lastName: tg.last_name ?? null,
        photoUrl: tg.photo_url ?? null, languageCode: tg.language_code ?? null, referralCode: newReferralCode(), referredById,
      }),
      db.insert(userSettings).values({ userId: id, uiLanguage: uiLangFor(tg.language_code) }),
      db.insert(userProfiles).values({ userId: id }),
      db.insert(playerProgress).values({ userId: id, currentCityId: cityId }),
      db.insert(gameWallets).values({ userId: id, balance: 0 }),
      cityId ? db.insert(userCities).values({ userId: id, cityId }) : null,
      // Худі — у гардеробі, але не вдягнене: фірмовий вигляд бобра — шарф і рюкзак.
      ...starterItems.map((item) => db.insert(userInventory).values({ userId: id, itemId: item.id, equipped: item.slug !== 'hoodie-red', source: 'starter' })),
      // Запрошений і запрошувач стають друзями автоматично.
      referredById ? db.insert(friendships).values({ requesterId: referredById, addresseeId: id, status: 'ACCEPTED' }) : null,
    ]);
  } catch (e) {
    // Паралельний перший вхід того ж користувача — беремо вже створений запис.
    if (isUniqueViolation(e)) {
      const again = await db.query.users.findFirst({ where: and(eq(users.telegramId, telegramId)) });
      if (again) return again;
    }
    throw e;
  }
  return (await db.query.users.findFirst({ where: eq(users.id, id) }))!;
}
