import { DEFAULT_REWARDS, type RewardConfig } from '@polski-go/shared';
import { prisma } from '../db';

let cache: { value: RewardConfig; at: number } | null = null;

/** Нагороди та ліміти з адмінки (кеш 30 с). */
export async function getRewards(): Promise<RewardConfig> {
  if (cache && Date.now() - cache.at < 30_000) return cache.value;
  const row = await prisma.gameConfig.findUnique({ where: { key: 'rewards' } });
  const value = { ...DEFAULT_REWARDS, ...((row?.value as Partial<RewardConfig>) ?? {}) };
  cache = { value, at: Date.now() };
  return value;
}

export function invalidateRewards() {
  cache = null;
}
