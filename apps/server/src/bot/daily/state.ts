/**
 * Вопрос дня: состояние рассылки (включена ли, время, с какого дня) и ход сегодняшней отправки — в app_state.
 * «День» рассылки — по Варшаве: одно время для всех. Отправка идёт частями от времени рассылки в течение SEND_WINDOW_HOURS.
 */
import { eq } from 'drizzle-orm';
import { dayKey } from '@polski-go/shared';
import { db } from '../../db';
import { appState, DAILY_LEVELS } from '../../db/schema';

export const DAILY_TZ = 'Europe/Warsaw';
export const PLAN_DAYS = 30;
/** После времени рассылки отправка идёт не дольше 4 часов: поздно вечером вопросов не шлём. */
export const SEND_WINDOW_HOURS = 4;
export { DAILY_LEVELS };
export type DailyLevel = (typeof DAILY_LEVELS)[number];

export type DailyState = { enabled: boolean; sendAt: string; startDay: string | null };
export type DailyRun = { day: string; cursor: number; done: boolean; startedAt: number };

const STATE_KEY = 'daily_quiz';
const RUN_KEY = 'daily_quiz_run';
export const DEFAULT_STATE: DailyState = { enabled: false, sendAt: '18:00', startDay: null };
export const SEND_AT_RE = /^([01]\d|2[0-3]):(00|15|30|45)$/;
export const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

async function readKey<T>(key: string): Promise<T | null> {
  const row = await db.select({ value: appState.value }).from(appState).where(eq(appState.key, key)).get();
  return (row?.value as T | undefined) ?? null;
}

async function writeKey(key: string, value: Record<string, unknown>) {
  await db.insert(appState).values({ key, value }).onConflictDoUpdate({ target: appState.key, set: { value, updatedAt: new Date() } });
}

export async function readDailyState(): Promise<DailyState> {
  const v = await readKey<Partial<DailyState>>(STATE_KEY);
  return {
    enabled: v?.enabled === true,
    sendAt: typeof v?.sendAt === 'string' && SEND_AT_RE.test(v.sendAt) ? v.sendAt : DEFAULT_STATE.sendAt,
    startDay: typeof v?.startDay === 'string' && DAY_RE.test(v.startDay) ? v.startDay : null,
  };
}

export async function writeDailyState(patch: Partial<DailyState>): Promise<DailyState> {
  const next = { ...(await readDailyState()), ...patch };
  await writeKey(STATE_KEY, next);
  return next;
}

export async function readDailyRun(): Promise<DailyRun | null> {
  return readKey<DailyRun>(RUN_KEY);
}

export async function writeDailyRun(run: DailyRun) {
  await writeKey(RUN_KEY, run);
}

export const warsawDay = (now: Date) => dayKey(now, DAILY_TZ);

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Смещение пояса (мс) в момент `at`: местное время = UTC + смещение. */
function offsetAt(at: number, timeZone: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      .formatToParts(new Date(at))
      .map((x) => [x.type, x.value]),
  );
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - Math.floor(at / 60_000) * 60_000;
}

/** Местные дата и время в поясе → момент UTC (летнее и зимнее время учитываются). */
export function zonedTime(day: string, hhmm: string, timeZone = DAILY_TZ): Date {
  const naive = Date.parse(`${day}T${hhmm}:00Z`);
  const first = naive - offsetAt(naive, timeZone);
  return new Date(naive - offsetAt(first, timeZone));
}

export function sendWindow(state: Pick<DailyState, 'sendAt'>, day: string): { from: Date; to: Date } {
  const from = zonedTime(day, state.sendAt);
  return { from, to: new Date(from.getTime() + SEND_WINDOW_HOURS * 3600_000) };
}

/** Рассылка в этот день идёт: включена и день не раньше дня запуска. Пропуск дня проверяется по плану. */
export function isSendingDay(state: DailyState, day: string): boolean {
  return state.enabled && state.startDay !== null && day >= state.startDay;
}

/** Будущий день менять можно; сегодняшний — пока отправка не началась; прошедшие — только смотреть. */
export function isDayEditable(day: string, today: string, run: DailyRun | null): boolean {
  return day > today || (day === today && run?.day !== today);
}
