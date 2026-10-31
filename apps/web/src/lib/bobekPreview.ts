/**
 * Безпечний opt-in для QA єдиного Бобека.
 *
 * Прототипний комплект існує лише в localStorage. Ні покупки, ні профіль на
 * сервері не змінюються; production-модель залишається основною до фінального арту.
 * Зміна в цьому табі сповіщає підписників (подія storage тут не спрацьовує).
 */
export const BOBEK_PREVIEW_FLAG = 'pg_bobek_layers_preview';
export const BOBEK_PROTOTYPE_STORE = 'pg_look_prototype_v1';
const EVENT = 'polski-go:bobek-preview-changed';
const DEFAULT_ITEMS = ['hoodie-red', 'backpack-travel'];

export function getBobekPreviewSnapshot(): string {
  if (typeof window === 'undefined') return '';
  try {
    return `${localStorage.getItem(BOBEK_PREVIEW_FLAG) === '1' ? '1' : '0'}\n${localStorage.getItem(BOBEK_PROTOTYPE_STORE) ?? ''}`;
  } catch {
    return '';
  }
}

export function subscribeBobekPreview(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', listener);
  window.addEventListener(EVENT, listener);
  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener(EVENT, listener);
  };
}

export function notifyBobekPreviewChanged(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT));
}

export function setBobekPreviewEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem(BOBEK_PREVIEW_FLAG, '1');
    else localStorage.removeItem(BOBEK_PREVIEW_FLAG);
  } catch {
    // ІOS private mode: QA перемикач просто недоступний.
  }
  notifyBobekPreviewChanged();
}

export function readBobekPreviewEquipment(snapshot: string): string[] | null {
  if (!snapshot.startsWith('1\n')) return null;
  const raw = snapshot.slice(2);
  if (!raw) return [...DEFAULT_ITEMS];
  try {
    const data = JSON.parse(raw) as { equipment?: unknown };
    if (!Array.isArray(data.equipment)) return [...DEFAULT_ITEMS];
    return data.equipment.filter((id): id is string => typeof id === 'string');
  } catch {
    return [...DEFAULT_ITEMS];
  }
}
