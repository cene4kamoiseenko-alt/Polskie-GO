/**
 * Секрет webhook Telegram, которым управляет сам сервер.
 *
 * Telegram присылает секрет в заголовке `X-Telegram-Bot-Api-Secret-Token`. Кто его знает, может подделать любое обновление:
 * сообщения от чужого имени, оплату Stars, ответы на быстрые вопросы. Поэтому секрет:
 *  • генерирует сервер (32 случайных байта, base64url) и хранит только в D1 (`app_state`, ключ `webhook_secret`);
 *  • отдаёт только Telegram (setWebhook): ни в ответах, ни в журналах, ни в адресах его нет, человеку он не нужен;
 *  • меняется поколениями: новое действует сразу, прежнее принимается, пока Telegram не подтвердил новое (setWebhook ответил ok),
 *    и ещё `PREVIOUS_GRACE_MS` после подтверждения (обновления «в пути»). Если ответ Telegram потерялся (сеть, 5xx),
 *    новое поколение остаётся неподтверждённым, оба секрета работают, а cron повторяет setWebhook и подтверждает его.
 *    Если Telegram явно отказал (4xx) — прежнее состояние возвращается (`restoreSecret`).
 * Переменная `TELEGRAM_WEBHOOK_SECRET` принимается как секрет webhook, только пока сервер ни разу не менял секрет (поколение 0).
 * Первую смену делает cron (`bot/maintain.ts`), админка или `/telegram/setup`; после неё старое значение больше ничего не открывает.
 */
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { config } from '../env';
import { db } from '../db';
import { appState } from '../db/schema';

export const SECRET_KEY = 'webhook_secret';
/** Сколько после смены ещё принимается прежний секрет (Telegram мог уже отправить обновление со старым). */
export const PREVIOUS_GRACE_MS = 10 * 60_000;
/** Пока Telegram не подтвердил новый секрет, прежний принимается до 6 часов (cron успеет повторить setWebhook). */
export const UNCONFIRMED_GRACE_MS = 6 * 3600_000;
/** Сколько процесс помнит прочитанное из D1 состояние (при несовпадении перечитывает сразу). */
const CACHE_MS = 60_000;

export type SecretState = {
  gen: number;
  current: string;
  previous: string | null;
  previousUntil: number | null;
  /** До какого времени ещё принимается `TELEGRAM_WEBHOOK_SECRET` (только сразу после первой смены). */
  legacyUntil: number | null;
  rotatedAt: number;
  /** Когда Telegram принял этот секрет (setWebhook ok). null — ещё не подтверждён. */
  confirmedAt: number | null;
};

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const newSecret = () => randomBytes(32).toString('base64url');

let cache: { state: SecretState | null; at: number } | null = null;

/** Для тестов и после записи: следующий запрос прочитает D1 заново. */
export function forgetSecretCache() {
  cache = null;
}

const isMissingTable = (e: unknown) => /no such table/i.test(String((e as Error)?.message ?? e) + String((e as { cause?: Error })?.cause?.message ?? ''));

/**
 * Текущее состояние секрета. null — сервер ещё не менял секрет (или миграция 0009 ещё не применена): действует переменная окружения.
 * Ошибка чтения D1, кроме отсутствия таблицы, пробрасывается: откатываться к старому секрету при сбое базы нельзя.
 */
export async function loadSecretState(fresh = false): Promise<SecretState | null> {
  if (!fresh && cache && Date.now() - cache.at < CACHE_MS) return cache.state;
  try {
    const row = await db.select({ value: appState.value }).from(appState).where(eq(appState.key, SECRET_KEY)).get();
    const value = row?.value as Partial<SecretState> | undefined;
    const state = value && typeof value.current === 'string' && typeof value.gen === 'number' ? (value as SecretState) : null;
    cache = { state, at: Date.now() };
    return state;
  } catch (e) {
    if (isMissingTable(e)) {
      cache = { state: null, at: Date.now() };
      return null;
    }
    if (cache) return cache.state;
    throw e;
  }
}

function matches(state: SecretState | null, given: string, now: number): boolean {
  if (!state) return !!config.webhookSecret && safeEqual(given, config.webhookSecret);
  if (safeEqual(given, state.current)) return true;
  if (state.previous && state.previousUntil && now < state.previousUntil && safeEqual(given, state.previous)) return true;
  return !!(state.legacyUntil && now < state.legacyUntil && config.webhookSecret && safeEqual(given, config.webhookSecret));
}

/** Проверка заголовка webhook. При несовпадении состояние перечитывается из D1 (другой процесс мог только что сменить секрет). */
export async function verifyWebhookSecret(given: string | undefined, now = Date.now()): Promise<boolean> {
  if (typeof given !== 'string' || !given) return false;
  const state = await loadSecretState();
  if (matches(state, given, now)) return true;
  return matches(await loadSecretState(true), given, now);
}

/** Секрет, который надо сообщить Telegram в setWebhook (без смены поколения). */
export async function currentSecret(): Promise<string | null> {
  const state = await loadSecretState(true);
  return state?.current ?? (config.webhookSecret || null);
}

/**
 * Новое поколение секрета. Запись условная: из двух одновременных смен проходит одна (вторая получит null и ничего не меняет).
 * Возвращает новое и прежнее состояние — прежнее нужно, чтобы вернуть его, если Telegram не принял setWebhook.
 */
export type Rotated = { next: SecretState; prev: SecretState | null };

export async function rotateSecret(now = Date.now()): Promise<Rotated | null> {
  const prev = await loadSecretState(true);
  const next: SecretState = {
    gen: (prev?.gen ?? 0) + 1,
    current: newSecret(),
    previous: prev?.current ?? null,
    previousUntil: prev ? now + UNCONFIRMED_GRACE_MS : null,
    legacyUntil: prev ? null : now + UNCONFIRMED_GRACE_MS,
    rotatedAt: now,
    confirmedAt: null,
  };
  const written = await writeIf(prev?.gen ?? null, next);
  forgetSecretCache();
  return written ? { next, prev } : null;
}

/**
 * Telegram принял текущий секрет: прежний (или переменная окружения) принимается ещё `PREVIOUS_GRACE_MS` и перестаёт работать.
 * Ничего не делает, если поколение уже сменилось.
 */
export async function confirmSecret(state: SecretState, now = Date.now()): Promise<SecretState> {
  if (state.confirmedAt) return state;
  const until = now + PREVIOUS_GRACE_MS;
  const next: SecretState = {
    ...state,
    confirmedAt: now,
    previousUntil: state.previous ? Math.min(state.previousUntil ?? until, until) : null,
    legacyUntil: state.legacyUntil ? Math.min(state.legacyUntil, until) : null,
  };
  const written = await writeIf(state.gen, next);
  forgetSecretCache();
  return written ? next : state;
}

/** Вернуть прежнее состояние, если Telegram не принял новый секрет (иначе webhook остался бы со старым, а сервер ждал бы новый). */
export async function restoreSecret(rotated: Rotated) {
  if (rotated.prev) await writeIf(rotated.next.gen, rotated.prev);
  else await db.delete(appState).where(sql`${appState.key} = ${SECRET_KEY} AND json_extract(${appState.value}, '$.gen') = ${rotated.next.gen}`);
  forgetSecretCache();
}

/** Записать состояние, только если в базе сейчас поколение `expectedGen` (null — записи ещё нет). */
async function writeIf(expectedGen: number | null, state: SecretState): Promise<boolean> {
  if (expectedGen === null) {
    const rows = await db.insert(appState).values({ key: SECRET_KEY, value: state }).onConflictDoNothing().returning({ key: appState.key });
    return rows.length > 0;
  }
  const rows = await db
    .update(appState)
    .set({ value: state, updatedAt: new Date() })
    .where(sql`${appState.key} = ${SECRET_KEY} AND json_extract(${appState.value}, '$.gen') = ${expectedGen}`)
    .returning({ key: appState.key });
  return rows.length > 0;
}
