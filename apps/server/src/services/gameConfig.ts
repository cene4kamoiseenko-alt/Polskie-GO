import { eq } from 'drizzle-orm';
import { DEFAULT_REWARDS, type RewardConfig } from '@polski-go/shared';
import { db } from '../db';
import { gameConfig } from '../db/schema';

let cache: { value: RewardConfig; at: number } | null = null;

/** Нагороди та ліміти з адмінки (кеш 30 с у межах ізоляту Worker). */
export async function getRewards(): Promise<RewardConfig> {
  if (cache && Date.now() - cache.at < 30_000) return cache.value;
  const row = await db.query.gameConfig.findFirst({ where: eq(gameConfig.key, 'rewards') });
  const value = { ...DEFAULT_REWARDS, ...((row?.value as Partial<RewardConfig>) ?? {}) };
  cache = { value, at: Date.now() };
  return value;
}

export function invalidateRewards() {
  cache = null;
}
