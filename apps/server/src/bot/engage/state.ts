/**
 * Карточки бота: включены ли (app_state, ключ `engage`). По умолчанию выключены — владелец включает их в админке после просмотра
 * (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 8).
 */
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { appState } from '../../db/schema';

const KEY = 'engage';
export type EngageState = { enabled: boolean };

export async function readEngageState(): Promise<EngageState> {
  const row = await db.select({ value: appState.value }).from(appState).where(eq(appState.key, KEY)).get();
  return { enabled: (row?.value as Partial<EngageState> | undefined)?.enabled === true };
}

export async function writeEngageState(patch: Partial<EngageState>): Promise<EngageState> {
  const next = { ...(await readEngageState()), ...patch };
  await db.insert(appState).values({ key: KEY, value: next }).onConflictDoUpdate({ target: appState.key, set: { value: next, updatedAt: new Date() } });
  return next;
}
