export const LOCALIZED: string[];
export const DESCRIPTION: string;
export type BotCall = { method: string; params: Record<string, any> };
export function buildCalls(env: Record<string, string | undefined>, flags?: { webhook?: boolean; description?: boolean }): BotCall[];
