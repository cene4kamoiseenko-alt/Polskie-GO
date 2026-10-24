/** Денна мета: хвилини, обрані користувачем → XP за день. */
const GOAL_XP: Record<number, number> = { 5: 30, 10: 50, 15: 80, 20: 120 };
export const goalXpFor = (minutes: number) => GOAL_XP[minutes] ?? Math.max(20, minutes * 5);
