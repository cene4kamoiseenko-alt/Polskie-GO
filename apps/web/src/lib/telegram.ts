/** Тонка типізована обгортка над офіційним SDK Telegram Mini Apps (telegram-web-app.js). */
type HapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

export type TgWebApp = {
  initData: string;
  initDataUnsafe: { user?: { id: number; first_name: string; photo_url?: string; language_code?: string }; start_param?: string };
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

export function startParam(): string | undefined {
  if (tg?.initDataUnsafe.start_param) return tg.initDataUnsafe.start_param;
  return new URLSearchParams(window.location.search).get('startapp') ?? undefined;
}

export function share(url: string, text: string) {
  const link = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  if (tg) tg.openTelegramLink(link);
  else window.open(link, '_blank');
}
