/**
 * Образ Бобека у вебі (ADR-005, §10): один джерело для всіх екранів.
 * Надіте береться з профілю (`me.outfit.wear`) і розбирається ядром resolveLook з @polski-go/shared.
 * Екрани передають лише стан, ракурс і розмір; ручні `outfit={{ … }}` і підміни костюма за назвою заборонені.
 * Сценічні добавки — лише примірка (`tryOn`, `data-look-preview="true"`), вона нічого не зберігає.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { canPurchase, resolveLook, tryOn, type LookLegacyWear, type LookPreview, type LookView, type ResolvedLook } from '@polski-go/shared';
import type { Me, ShopItem, ShopVisualStatus } from './types';

type Wear = Me['outfit']['wear'];
const NO_WEAR: LookLegacyWear = Object.freeze({});
const selectWear = (me: Me): Wear => me.outfit.wear;

/**
 * Надіте з кешу профілю ['me']. Підписка пасивна (`enabled: false`): власного запиту немає — профіль вантажить App,
 * а Бобек, що монтується в кожному завданні уроку, не повинен щоразу перезапитувати /me. Без профілю — порожньо
 * (тоді ядро показує фірмовий образ).
 */
export function useWear(): LookLegacyWear {
  const { data } = useQuery<Me, Error, Wear>({ queryKey: ['me'], enabled: false, select: selectWear });
  return data ?? NO_WEAR;
}

/** Образ користувача для стану й ракурсу. Власність не перевіряється (inventory = null): сервер віддає лише своє. */
export function useLook(mood: string = 'happy', view: LookView = 'front'): ResolvedLook {
  const wear = useWear();
  return useMemo(() => resolveLook(null, wear, { mood, view }), [wear, mood, view]);
}

/**
 * Живописний стан предмета магазину: поле сервера (`visualStatus`), а якщо його немає (старий сервер під час
 * деплою) — те саме правило ядра canPurchase, що й на сервері. `pending`/`unknown` — «візуал готується».
 */
export function shopVisualStatus(item: Pick<ShopItem, 'assetKey' | 'slot' | 'visualStatus'>): ShopVisualStatus {
  if (item.visualStatus) return item.visualStatus;
  const v = canPurchase({ id: item.assetKey, slot: item.slot });
  return v.ok ? v.status : v.reason === 'visual-pending' ? 'pending' : 'unknown';
}
export const isVisualPending = (s: ShopVisualStatus) => s === 'pending' || s === 'unknown';

/** Примірка речі поверх поточного образу (нічого не зберігає). `null` — примірки немає. */
export function useTryOn(candidate: string | null | undefined, mood: string = 'happy', view: LookView = 'front'): LookPreview | null {
  const wear = useWear();
  return useMemo(() => (candidate ? tryOn(wear, candidate, { mood, view }) : null), [wear, candidate, mood, view]);
}
