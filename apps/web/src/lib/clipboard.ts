/**
 * Копирование в буфер обмена (владелец 2026-11-09: «сделай возможность скопировать код нажатием на него»).
 * Сначала современный `navigator.clipboard`; в части WebView (Telegram на Android, старые Chromium) он отказывает или отсутствует,
 * тогда копируем через скрытое поле и `execCommand('copy')`. Вызывать нужно из обработчика нажатия: без жеста браузер не даст записать.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* нет разрешения или небезопасный контекст — пробуем запасной путь */
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const field = document.createElement('textarea');
  field.value = text;
  // readonly — чтобы на телефоне не открылась клавиатура; вне экрана и без прокрутки страницы
  field.setAttribute('readonly', '');
  field.setAttribute('aria-hidden', 'true');
  field.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;user-select:text;-webkit-user-select:text';
  document.body.appendChild(field);
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  let ok = false;
  try {
    field.select();
    field.setSelectionRange(0, text.length);
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  field.remove();
  active?.focus({ preventScroll: true });
  return ok;
}
