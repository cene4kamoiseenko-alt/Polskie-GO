import { randomBytes } from 'node:crypto';
import { UI_LANGS, type UiLang } from '@polski-go/shared';
import { prisma } from '../db';
import type { TelegramUser } from '../lib/telegram';

function newReferralCode() {
  return randomBytes(5).toString('base64url').replace(/[-_]/g, 'x').slice(0, 8);
}

function guessLang(code?: string): UiLang {
  const c = (code ?? '').slice(0, 2);
  return (UI_LANGS as readonly string[]).includes(c) ? (c as UiLang) : 'uk';
}

/** Знайти або створити користувача за підтвердженими даними Telegram. */
export async function upsertTelegramUser(tg: TelegramUser, startParam?: string) {
  const telegramId = BigInt(tg.id);
  const existing = await prisma.user.findUnique({ where: { telegramId } });
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        username: tg.username ?? null,
        firstName: tg.first_name ?? '',
        lastName: tg.last_name ?? null,
        photoUrl: tg.photo_url ?? existing.photoUrl,
        languageCode: tg.language_code ?? existing.languageCode,
        lastSeenAt: new Date(),
      },
    });
  }

  // Реферальне посилання: startapp=ref_<code>
  let referredById: string | undefined;
  if (startParam?.startsWith('ref_')) {
    const ref = await prisma.user.findUnique({ where: { referralCode: startParam.slice(4) } });
    if (ref) referredById = ref.id;
  }

  const firstCity = await prisma.city.findFirst({ where: { status: 'PUBLISHED' }, orderBy: { order: 'asc' } });
  const starterItems = await prisma.cosmeticItem.findMany({ where: { slug: { in: ['hoodie-red', 'backpack-travel', 'bed-basic'] } } });

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        telegramId,
        username: tg.username ?? null,
        firstName: tg.first_name ?? '',
        lastName: tg.last_name ?? null,
        photoUrl: tg.photo_url ?? null,
        languageCode: tg.language_code ?? null,
        referralCode: newReferralCode(),
        referredById,
        settings: { create: { uiLanguage: guessLang(tg.language_code) } },
        profile: { create: {} },
        progress: { create: { currentCityId: firstCity?.id } },
        wallet: { create: { balance: 0 } },
      },
    });
    if (firstCity) await tx.userCity.create({ data: { userId: user.id, cityId: firstCity.id } });
    for (const item of starterItems) {
      await tx.userInventory.create({ data: { userId: user.id, itemId: item.id, equipped: true, source: 'starter' } });
    }
    // Запрошений і запрошувач стають друзями автоматично.
    if (referredById) {
      await tx.friendship.create({ data: { requesterId: referredById, addresseeId: user.id, status: 'ACCEPTED' } });
    }
    return user;
  });
}
