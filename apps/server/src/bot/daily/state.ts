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
/** Время по умолчанию — 12:00 по Варшаве (владелец 2026-11-15: рассылку ждут в 12). Рассылка выключена, пока её не запустят из админки. */
export const DEFAULT_STATE: DailyState = { enabled: false, sendAt: '12:00', startDay: null };
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

const TICK_KEY = 'daily_quiz_tick';
/** Пульс минутного cron: пишется раз в 5 минут, чтобы админка показывала, работает ли расписание вообще (раньше это было не видно). */
export async function recordDailyTick(at: Date) {
  if (at.getUTCMinutes() % 5 !== 0) return;
  await writeKey(TICK_KEY, { at: at.getTime() });
}
export async function readDailyTick(): Promise<number | null> {
  const v = await readKey<{ at?: number }>(TICK_KEY);
  return typeof v?.at === 'number' ? v.at : null;
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

export type DailyDiag = {
  /** Последний пульс cron (мс) или null — расписание не срабатывало ни разу. */
  tickAt: number | null;
  /** Окно отправки сегодня: с времени рассылки на 4 часа (мс). */
  window: { from: number; to: number; phase: 'before' | 'open' | 'closed' };
  /** Когда уйдёт ближайшая рассылка (мс), null — рассылка выключена. */
  nextSendAt: number | null;
  /** Включена, но сегодня уже не уйдёт: окно закрылось, а отправка не начиналась (запустили слишком поздно). */
  missedToday: boolean;
};

export function dailyDiag(state: DailyState, run: DailyRun | null, tickAt: number | null, now: Date): DailyDiag {
  const today = warsawDay(now);
  const { from, to } = sendWindow(state, today);
  const phase = now < from ? 'before' : now < to ? 'open' : 'closed';
  let nextSendAt: number | null = null;
  if (state.enabled && state.startDay) {
    const first = state.startDay > today ? state.startDay : today;
    nextSendAt = first > today || phase !== 'closed' ? zonedTime(first, state.sendAt).getTime() : zonedTime(addDays(today, 1), state.sendAt).getTime();
  }
  const sendingToday = isSendingDay(state, today);
  return { tickAt, window: { from: from.getTime(), to: to.getTime(), phase }, nextSendAt, missedToday: sendingToday && phase === 'closed' && run?.day !== today };
}

/** Будущий день менять можно; сегодняшний — пока отправка не началась; прошедшие — только смотреть. */
export function isDayEditable(day: string, today: string, run: DailyRun | null): boolean {
  return day > today || (day === today && run?.day !== today);
}
