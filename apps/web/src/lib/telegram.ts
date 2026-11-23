/** Тонка типізована обгортка над офіційним SDK Telegram Mini Apps (telegram-web-app.js). */
type HapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

export type TgWebApp = {
  initData: string;
  initDataUnsafe: { user?: { id: number; first_name: string; photo_url?: string; language_code?: string; allows_write_to_pm?: boolean }; start_param?: string };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isVersionAtLeast(v: string): boolean;
  ready(): void;
  expand(): void;
  close(): void;
  disableVerticalSwipes?: () => void;
  setHeaderColor?: (c: string) => void;
  setBackgroundColor?: (c: string) => void;
  setBottomBarColor?: (c: string) => void;
  onEvent(e: string, cb: (...a: unknown[]) => void): void;
  offEvent(e: string, cb: (...a: unknown[]) => void): void;
  openInvoice(url: string, cb?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void): void;
  openTelegramLink(url: string): void;
  openLink(url: string): void;
  showConfirm(msg: string, cb: (ok: boolean) => void): void;
  /** Bot API 6.9+: системное окно «разрешить боту писать вам»; callback получает true, если человек разрешил. */
  requestWriteAccess?: (cb?: (allowed: boolean) => void) => void;
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
  HapticFeedback: { impactOccurred(s: HapticStyle): void; notificationOccurred(t: 'error' | 'success' | 'warning'): void; selectionChanged(): void };
};

declare global {
  interface Window {
    Telegram?: { WebApp: TgWebApp };
  }
}

export const tg: TgWebApp | null = typeof window !== 'undefined' && window.Telegram?.WebApp?.initData ? window.Telegram.WebApp : null;
export const inTelegram = !!tg;

export function initTelegram() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  try {
    if (tg.isVersionAtLeast('7.7')) tg.disableVerticalSwipes?.();
  } catch {
    /* старі клієнти */
  }
}

export function setTelegramColors(bg: string) {
  if (!tg) return;
  try {
    if (tg.isVersionAtLeast('6.1')) {
      tg.setHeaderColor?.(bg);
      tg.setBackgroundColor?.(bg);
    }
    if (tg.isVersionAtLeast('7.10')) tg.setBottomBarColor?.(bg);
  } catch {
    /* ігноруємо */
  }
}

export const haptic = {
  tap: () => tg?.HapticFeedback.impactOccurred('light'),
  success: () => tg?.HapticFeedback.notificationOccurred('success'),
  error: () => tg?.HapticFeedback.notificationOccurred('error'),
  select: () => tg?.HapticFeedback.selectionChanged(),
};

/**
 * Разрешение боту писать игроку в личные сообщения (Bot API 6.9+). Нужно тому, кто открыл Mini App по ссылке и не нажимал Start у бота:
 * без него Telegram отвечает 403 «bot can't initiate conversation», и напоминания не доходят. Спрашиваем в тот момент, когда игрок сам
 * выбрал время напоминания (знакомство, настройки). Возвращает false только если человек явно отказал: старый клиент, Android-приложение
 * и браузер (там нечего спрашивать) и зависшее окно считаются «можно». Отказ ничего не ломает — напоминание останется выбранным
 * и заработает, как только игрок напишет боту.
 */
export type WriteAccessResult = 'allowed' | 'denied' | 'unsupported';

/** То же окно, но с подробным ответом: «разрешил», «отказал» или «нечего спрашивать» (старый клиент, браузер, окно не закрыли). */
export function requestWriteAccessResult(): Promise<WriteAccessResult> {
  return new Promise((resolve) => {
    if (!tg || typeof tg.requestWriteAccess !== 'function') return resolve('unsupported');
    try {
      if (!tg.isVersionAtLeast('6.9')) return resolve('unsupported');
    } catch {
      return resolve('unsupported');
    }
    let done = false;
    const finish = (r: WriteAccessResult) => {
      if (done) return;
      done = true;
      resolve(r);
    };
    try {
      tg.requestWriteAccess((allowed) => finish(allowed === false ? 'denied' : 'allowed'));
    } catch {
      finish('unsupported');
    }
    // Окно могут не закрыть ни «разрешить», ни «отклонить» (свернули приложение): интерфейс не должен ждать вечно.
    setTimeout(() => finish('unsupported'), 60_000);
  });
}

export async function requestBotWriteAccess(): Promise<boolean> {
  return (await requestWriteAccessResult()) !== 'denied';
}

/**
 * Может ли бот писать этому игроку в личные сообщения: Telegram передаёт `allows_write_to_pm` в данных запуска. Если нет (человек открыл
 * Mini App по ссылке и не нажимал /start), вопрос дня и напоминания до него не дойдут. Вне Telegram и в старых клиентах — null («не знаем»).
 */
export function botCanMessage(): boolean | null {
  const user = tg?.initDataUnsafe.user;
  if (!tg || !user) return null;
  try {
    if (!tg.isVersionAtLeast('6.9')) return null;
  } catch {
    return null;
  }
  return user.allows_write_to_pm === true;
}

export function startParam(): string | undefined {
  if (tg?.initDataUnsafe.start_param) return tg.initDataUnsafe.start_param;
  return new URLSearchParams(window.location.search).get('startapp') ?? undefined;
}

/**
 * Открыть чат с ботом (с `start` — ссылкой со стартовым параметром, бот получает /start <параметр>) и закрыть Mini App.
 * С Bot API 7.0 openTelegramLink приложение само не закрывает: чат открывается под ним, и человек не видит никакой реакции.
 * Вне Telegram — обычная ссылка в новой вкладке.
 */
export function openBotChat(bot: string, start?: string) {
  const url = `https://t.me/${bot}${start ? `?start=${encodeURIComponent(start)}` : ''}`;
  if (tg) {
    tg.openTelegramLink(url);
    tg.close();
  } else window.open(url, '_blank', 'noopener');
}

/**
 * Открыть ссылку, не закрывая Mini App: t.me — внутри Telegram (канал откроется поверх, игрок вернётся и нажмёт «Проверить»),
 * остальное — во внешнем браузере. Вне Telegram — новая вкладка.
 */
export function openLink(url: string) {
  if (tg) return url.startsWith('https://t.me/') ? tg.openTelegramLink(url) : tg.openLink(url);
  window.open(url, '_blank', 'noopener');
}

export function share(url: string, text: string) {
  const link = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  if (tg) return tg.openTelegramLink(link);
  // Android-приложение и браузер: системное окно «Поделиться» (любой мессенджер); если его нет или оно отказало — окно Telegram.
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    navigator.share({ url, text }).catch((e: unknown) => {
      if ((e as { name?: string })?.name !== 'AbortError') window.open(link, '_blank', 'noopener');
    });
    return;
  }
  window.open(link, '_blank', 'noopener');
}
