/**
 * Где запущено приложение: Telegram Mini App, Android-приложение из Google Play (оболочка TWA) или обычный браузер.
 * От этого зависят вход (initData Telegram / ключ устройства) и оплата (Stars только в Telegram; в Android-версии — Google Play, docs/ANDROID_RU.md).
 */
import { inTelegram } from './telegram';

export type Platform = 'telegram' | 'android' | 'web';

const search = typeof location === 'undefined' ? new URLSearchParams() : new URLSearchParams(location.search);

/** Локальная разработка и тесты: вход через /api/auth/dev. `?standalone=1` включает вход как в настоящем приложении (для проверки на localhost). */
export const isLocalDev =
  typeof location !== 'undefined' && ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) && !search.has('standalone');

/**
 * Приложение Google Play открывает адрес запуска с `?source=twa` (twa-manifest.json → startUrl); метка запоминается на время сессии, потому что
 * переходы внутри приложения строку адреса меняют. Запасные признаки: заголовок referrer `android-app://` и режим окна standalone на Android.
 */
function fromAndroidApp(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (search.get('source') === 'twa') {
      sessionStorage.setItem('pg_twa', '1');
      return true;
    }
    if (sessionStorage.getItem('pg_twa') === '1') return true;
  } catch {
    /* хранилище недоступно */
  }
  if (document.referrer.startsWith('android-app://')) return true;
  return /Android/i.test(navigator.userAgent) && !!window.matchMedia?.('(display-mode: standalone)').matches;
}

export const platform: Platform = inTelegram ? 'telegram' : fromAndroidApp() ? 'android' : 'web';

/** Вне Telegram и не локальная разработка: вход по ключу устройства, оплаты Stars нет. */
export const isStandalone = !inTelegram && !isLocalDev;

/** Значение для API (`platform` в /auth/guest и /auth/link). */
export const apiPlatform: 'twa' | 'web' = platform === 'android' ? 'twa' : 'web';
