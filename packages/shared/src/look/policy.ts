/**
 * Політика показу й покупки (ADR-005).
 * Не списуємо Złotki за одяг, який технічно не можна показати: `pending` → покупку заборонено.
 * Нагороди (квест, місто, досягнення) видаються без списання — володіння зберігається, річ «скоро».
 */
import { LOOK_MANIFEST } from './manifest';
import { findLookItem, toEquipmentList, toLookItemId } from './rules';
import type { LookInventory, LookManifest, VisualStatus } from './types';
import { LOOK_CATALOG_HOUSE_SLOTS, LOOK_CATALOG_WEAR_SLOTS } from './types';

export function visualStatusOf(ref: string, manifest: LookManifest = LOOK_MANIFEST): VisualStatus | 'unknown' {
  return findLookItem(ref, manifest)?.status ?? 'unknown';
}

/** Чи можна показати річ живописно (шарами або цілісною картинкою). */
export function canShowItem(ref: string, manifest: LookManifest = LOOK_MANIFEST): boolean {
  const s = visualStatusOf(ref, manifest);
  return s === 'ready' || s === 'legacy-whole-look';
}

export type LookPurchaseVerdict =
  | { ok: true; status: VisualStatus | 'not-wearable' }
  | { ok: false; reason: 'already-owned' | 'visual-pending' | 'unknown-wearable' | 'slot-mismatch' | 'unknown-slot'; status: VisualStatus | 'unknown' };

/**
 * Візуальна частина перевірки покупки для сервера. Ціну, баланс, rewardOnly і Premium
 * перевіряє `buyItem` — тут лише те, чи можна показати річ.
 * @param item `{ id, slot }` з `cosmetic_items` (id може бути `i_<slug>`).
 */
export function canPurchase(item: { id: string; slot: string }, ctx: { inventory?: LookInventory } = {}, manifest: LookManifest = LOOK_MANIFEST): LookPurchaseVerdict {
  const found = findLookItem(item.id, manifest);
  const id = found?.id ?? toLookItemId(item.id);
  if (ctx.inventory && toEquipmentList(ctx.inventory, manifest).includes(id)) return { ok: false, reason: 'already-owned', status: found?.status ?? 'unknown' };
  if ((LOOK_CATALOG_HOUSE_SLOTS as readonly string[]).includes(item.slot)) return { ok: true, status: 'not-wearable' };
  if (!(LOOK_CATALOG_WEAR_SLOTS as readonly string[]).includes(item.slot)) return { ok: false, reason: 'unknown-slot', status: 'unknown' };
  if (!found) return { ok: false, reason: 'unknown-wearable', status: 'unknown' };
  if (found.catalogSlot !== item.slot) return { ok: false, reason: 'slot-mismatch', status: found.status };
  if (found.status === 'pending') return { ok: false, reason: 'visual-pending', status: 'pending' };
  return { ok: true, status: found.status };
}
