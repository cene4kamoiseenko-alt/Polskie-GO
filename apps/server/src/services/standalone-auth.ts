/**
 * Вход вне Telegram: Android-приложение (Google Play, оболочка TWA) и обычный веб.
 *
 * Модель простая и без внешних сервисов:
 *  · «гость» — аккаунт, созданный на устройстве. У него отрицательный `users.telegram_id` (настоящие id Telegram положительные), поэтому ограничения таблицы
 *    остаются прежними, а бот, напоминания и рассылки гостей не трогают (`telegram_id > 0`);
 *  · вход устройства — случайный ключ (256 бит), на сервере лежит только его sha-256; ключ хранится в памяти приложения на устройстве;
 *  · перенос — одноразовый код на 10 минут: игрок получает его в Telegram (или на любом уже вошедшем устройстве) и вводит на новом устройстве — оно входит
 *    в тот же аккаунт. Так прогресс и покупки общие у Telegram и Android, а чужой Telegram id аккаунту не присваивается.
 * Платежи Telegram Stars к гостям не относятся: покупка Premium в Android-версии — через Google Play Billing (docs/ANDROID_RU.md).
 */
import { createHash, randomBytes, randomInt } from 'node:crypto';
import { and, eq, gt, isNull, lt, sql } from 'drizzle-orm';
import { config } from '../env';
import { db } from '../db';
import { deviceCredentials, linkCodes, users } from '../db/schema';
import { HttpError } from '../lib/errors';
import { upsertTelegramUser } from './users';

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

/** Платформа, с которой пришёл клиент (для журнала устройств): только известные значения. */
export type Platform = 'web' | 'twa';
export const PLATFORMS: readonly Platform[] = ['web', 'twa'];

export const LINK_CODE_TTL_MS = 10 * 60_000;
/** Сколько неистёкших кодов может держать один игрок (защита от накопления). */
export const MAX_ACTIVE_CODES = 5;
/** Алфавит кода без похожих знаков (0/O, 1/I): код вводят руками. */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Гость-аккаунт: свежий пользователь с отрицательным telegram_id. */
export async function createGuest(opts: { language?: string; startParam?: string }) {
  // Суточный потолок: бесплатный план D1 — 100 тыс. записей в сутки, а гость стоит около десятка. Достигнут — отказ, пока не пройдут сутки.
  const recent = await db
    .select({ n: sql<number>`count(*)` })
    .from(users)
    .where(and(lt(users.telegramId, 0), gt(users.createdAt, new Date(Date.now() - 86_400_000))));
  if ((recent[0]?.n ?? 0) >= config.guestDailyLimit) throw new HttpError(503, 'guests_busy', 'Too many new accounts today');
  for (let attempt = 0; attempt < 4; attempt++) {
    // 48 бит: отрицательное целое в безопасном диапазоне JS и SQLite; занятый номер (редкость) — выбираем другой.
    const id = -(randomBytes(6).readUIntBE(0, 6) + 1);
    if (await db.query.users.findFirst({ where: eq(users.telegramId, id), columns: { id: true } })) continue;
    const user = await upsertTelegramUser({ id, first_name: 'Podróżnik', language_code: opts.language }, opts.startParam);
    // Защита от гонки двух одинаковых случайных id: чужой аккаунт с ключом устройства гостю не отдаём.
    const existing = await db.select({ n: sql<number>`count(*)` }).from(deviceCredentials).where(eq(deviceCredentials.userId, user.id));
    if ((existing[0]?.n ?? 0) === 0) return user;
  }
  throw new HttpError(503, 'guest_unavailable');
}

/** Выдать устройству ключ входа для аккаунта. Ключ показывается один раз — потом только хэш. */
export async function issueDeviceKey(userId: string, platform: Platform): Promise<string> {
  const key = `pgd_${randomBytes(32).toString('base64url')}`;
  await db.insert(deviceCredentials).values({ userId, keyHash: sha256(key), platform });
  return key;
}

/** Вход по ключу устройства; неизвестный ключ — 401, заблокированный аккаунт — 403. */
export async function loginWithDevice(key: string) {
  const row = await db
    .select({ id: deviceCredentials.id, user: users })
    .from(deviceCredentials)
    .innerJoin(users, eq(users.id, deviceCredentials.userId))
    .where(eq(deviceCredentials.keyHash, sha256(key)))
    .get();
  if (!row) throw new HttpError(401, 'invalid_device_key');
  if (row.user.isBanned) throw new HttpError(403, 'banned');
  await db.update(deviceCredentials).set({ lastUsedAt: new Date() }).where(eq(deviceCredentials.id, row.id));
  await db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, row.user.id));
  return row.user;
}

/** Нормализация введённого кода: регистр и разделители не важны. */
export const normalizeCode = (raw: string) => raw.toUpperCase().replace(/[^A-Z0-9]/g, '');

/** Новый код переноса для игрока. Старые истёкшие чистятся здесь же. */
export async function createLinkCode(userId: string, now = new Date()) {
  await db.delete(linkCodes).where(and(eq(linkCodes.userId, userId), lt(linkCodes.expiresAt, now)));
  const active = await db
    .select({ n: sql<number>`count(*)` })
    .from(linkCodes)
    .where(and(eq(linkCodes.userId, userId), isNull(linkCodes.usedAt), gt(linkCodes.expiresAt, now)));
  if ((active[0]?.n ?? 0) >= MAX_ACTIVE_CODES) throw new HttpError(429, 'too_many_codes', 'Too many active codes');
  const code = Array.from({ length: 8 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');
  const expiresAt = new Date(now.getTime() + LINK_CODE_TTL_MS);
  await db.insert(linkCodes).values({ userId, codeHash: sha256(code), expiresAt });
  return { code: `${code.slice(0, 4)}-${code.slice(4)}`, expiresAt: expiresAt.toISOString() };
}

/**
 * Погасить код: устройство получает ключ входа в аккаунт владельца кода. Код одноразовый; параллельные запросы с одним кодом — успешен ровно один
 * (условный UPDATE … used_at IS NULL).
 */
export async function redeemLinkCode(raw: string, platform: Platform, now = new Date()) {
  const code = normalizeCode(raw);
  if (code.length !== 8) throw new HttpError(400, 'invalid_code');
  const claimed = await db
    .update(linkCodes)
    .set({ usedAt: now })
    .where(and(eq(linkCodes.codeHash, sha256(code)), isNull(linkCodes.usedAt), gt(linkCodes.expiresAt, now)))
    .returning({ userId: linkCodes.userId });
  if (!claimed.length) throw new HttpError(400, 'invalid_code');
  const user = await db.query.users.findFirst({ where: eq(users.id, claimed[0].userId) });
  if (!user) throw new HttpError(400, 'invalid_code');
  if (user.isBanned) throw new HttpError(403, 'banned');
  return { user, deviceKey: await issueDeviceKey(user.id, platform) };
}

/** Раз в сутки (jobs.ts): истёкшие и использованные коды не нужны. */
export async function purgeLinkCodes(now = new Date()) {
  await db.delete(linkCodes).where(lt(linkCodes.expiresAt, new Date(now.getTime() - 86_400_000)));
}
