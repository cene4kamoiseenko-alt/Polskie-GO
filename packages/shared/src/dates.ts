/** Ключ дня (YYYY-MM-DD) у часовому поясі користувача. */
export function dayKey(date: Date, timeZone = 'Europe/Warsaw'): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/** Ключ дня, зсунутий на `n` календарних днів (без годинникової арифметики, тож переходи на літній і зимовий час не впливають). */
export function addDays(key: string, n: number): string {
  const d = new Date(Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10) + n));
  return d.toISOString().slice(0, 10);
}

/** Ключі останніх `count` днів у поясі користувача, від найстарішого до сьогодні. */
export function lastDays(now: Date, count: number, timeZone = 'Europe/Warsaw'): string[] {
  const today = dayKey(now, timeZone);
  return Array.from({ length: count }, (_, i) => addDays(today, i - count + 1));
}

/** Зсув пояса від UTC у мілісекундах у момент `t` (місцевий час мінус UTC). */
function zoneOffset(t: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(t));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const local = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return local - Math.floor(t / 1000) * 1000;
}

/** Момент місцевої півночі дня `key` у поясі (з урахуванням переходів часу; невідомий пояс — північ UTC). */
export function zonedDayStart(key: string, timeZone = 'Europe/Warsaw'): Date {
  const utcMidnight = Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10));
  try {
    // Дві ітерації: зсув у момент самої півночі може відрізнятися від зсуву «на око» (день переходу часу).
    let t = utcMidnight - zoneOffset(utcMidnight, timeZone);
    t = utcMidnight - zoneOffset(t, timeZone);
    return new Date(t);
  } catch {
    return new Date(utcMidnight);
  }
}

/** Момент початку наступного місцевого дня (північ у поясі користувача): коли оновлюються щоденні завдання. */
export function nextDayStart(now: Date, timeZone = 'Europe/Warsaw'): Date {
  return zonedDayStart(addDays(dayKey(now, timeZone), 1), timeZone);
}

/** Різниця в днях між двома ключами дня. */
export function dayDiff(fromKey: string, toKey: string): number {
  const a = Date.UTC(+fromKey.slice(0, 4), +fromKey.slice(5, 7) - 1, +fromKey.slice(8, 10));
  const b = Date.UTC(+toKey.slice(0, 4), +toKey.slice(5, 7) - 1, +toKey.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

/** ISO-тиждень у форматі 2026-W43 для ключа дня. */
export function weekKey(dk: string): string {
  const d = new Date(Date.UTC(+dk.slice(0, 4), +dk.slice(5, 7) - 1, +dk.slice(8, 10)));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
