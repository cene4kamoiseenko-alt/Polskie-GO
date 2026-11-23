/**
 * Файл экрана не загрузился после выкладки (shared/chunk.ts): приложение один раз перезагружается само — открывается тот же адрес
 * уже с новой версией. Не чаще раза в минуту (метка в sessionStorage): если и после этого не грузится, экран показывает кнопку.
 */
import { shouldAutoReload } from '@polski-go/shared';

const KEY = 'pg.chunkReloadAt';

/** true — перезагрузка запущена; false — уже перезагружались недавно (показать экран с кнопкой). */
export function recoverFromChunkError(): boolean {
  let last: number | null = null;
  try {
    const v = sessionStorage.getItem(KEY);
    last = v ? Number(v) : null;
  } catch {
    /* без хранилища — одна попытка за загрузку страницы */
  }
  if (!shouldAutoReload(last, Date.now())) return false;
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* ничего */
  }
  location.reload();
  return true;
}
