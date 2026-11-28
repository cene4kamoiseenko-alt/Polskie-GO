/**
 * Минимальный показ заставки при запуске (1.0, этап 1.2).
 * Владелец 2026-11-01: заставку не успевали увидеть — держать не меньше 2,4 с. ТЗ 1.0: повторный запуск — не дольше 1,5 с.
 * Правило: минимум — при первом запуске за день (и при первом запуске вообще), повторные запуски в тот же день — без паузы.
 */
export function splashMinMs(lastShownDay: string | null, today: string, min: number): number {
  if (!lastShownDay || !/^\d{4}-\d{2}-\d{2}$/.test(lastShownDay)) return min;
  return lastShownDay === today ? 0 : min;
}
