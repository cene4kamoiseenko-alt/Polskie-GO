/**
 * Правила екіпірування (ADR-005): нормалізація ключів, конфлікти слотів, equip/unequip.
 * Усі функції чисті: не мутують вхід, однаковий вхід → однаковий результат (відсортовані масиви).
 */
import { LOOK_MANIFEST } from './manifest';
import { LOOK_CATALOG_PRIORITY, LOOK_SLOT_RULES } from './spec';
import type { LookLegacyWear, LookEquipment, LookItem, LookManifest, VisualStatus, LookWearSlot } from './types';

type Index = { byKey: ReadonlyMap<string, LookItem> };
const indexes = new WeakMap<LookManifest, Index>();

function indexOf(m: LookManifest): Index {
  let idx = indexes.get(m);
  if (!idx) {
    const byKey = new Map<string, LookItem>();
    for (const it of m.items) {
      byKey.set(it.id, it);
      if (it.assetKey) byKey.set(it.assetKey, it);
    }
    idx = { byKey };
    indexes.set(m, idx);
  }
  return idx;
}

/** Ключ предмета → slug: прибирає префікс id з БД (`i_<slug>`) і пробіли. */
export function toLookItemId(raw: string): string {
  const s = String(raw ?? '').trim();
  return s.startsWith('i_') ? s.slice(2) : s;
}

/** Знайти предмет маніфесту за slug, asset_key або id з БД. Невідомий ключ → null. */
export function findLookItem(raw: string, manifest: LookManifest = LOOK_MANIFEST): LookItem | null {
  const key = toLookItemId(raw);
  return key ? (indexOf(manifest).byKey.get(key) ?? null) : null;
}

/** Старий `me.outfit.wear` ({ SLOT: assetKey }) → список предметів. 'none' і порожні значення пропускаються. */
export function equipmentFromWear(wear: LookLegacyWear | null | undefined): string[] {
  if (!wear) return [];
  return sortedUniqueIds(Object.values(wear).filter((v): v is string => typeof v === 'string' && v !== '' && v !== 'none'));
}

/**
 * Прийняти обидва формати (список предметів або старий `wear`) і звести до канонічних slug.
 * Невідомі ключі зберігаються як є (без префікса `i_`).
 */
export function toEquipmentList(eq: LookEquipment | LookLegacyWear | null | undefined, manifest: LookManifest = LOOK_MANIFEST): string[] {
  if (!eq) return [];
  const raw = Array.isArray(eq) ? (eq as readonly unknown[]).filter((x): x is string => typeof x === 'string') : equipmentFromWear(eq as LookLegacyWear);
  return sortedUniqueIds(raw.map((r) => findLookItem(r, manifest)?.id ?? toLookItemId(r)).filter(Boolean));
}

export function sortedUniqueIds(xs: Iterable<string>): string[] {
  return [...new Set(xs)].sort();
}

/** Слоти, які предмет займає разом із заблокованими за LOOK_SLOT_RULES. */
export function effectiveSlots(item: LookItem): LookWearSlot[] {
  const out = new Set<LookWearSlot>(item.occupies);
  for (const rule of LOOK_SLOT_RULES) if (out.has(rule.slot)) for (const b of rule.blocks) out.add(b);
  return [...out].sort();
}

/** Конфлікт: той самий слот каталогу (як на сервері) або перетин зайнятих слотів з урахуванням правил. */
export function itemsConflict(a: LookItem, b: LookItem): boolean {
  if (a.id === b.id) return false;
  if (a.catalogSlot === b.catalogSlot) return true;
  const sa = effectiveSlots(a);
  const sb = new Set(effectiveSlots(b));
  return sa.some((s) => sb.has(s));
}

/** Порядок перемоги при конфліктах у старих даних: ширший предмет, потім пріоритет слота каталогу, потім id. */
export function lookPrecedence(a: LookItem, b: LookItem): number {
  return (
    effectiveSlots(b).length - effectiveSlots(a).length ||
    LOOK_CATALOG_PRIORITY.indexOf(a.catalogSlot) - LOOK_CATALOG_PRIORITY.indexOf(b.catalogSlot) ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );
}

export type LookEquipResult = {
  /** Новий список надітого (відсортований). Вхідний масив не змінюється. */
  equipment: string[];
  changed: boolean;
  /** Надітий предмет (slug) або null, якщо ключ невідомий. */
  item: string | null;
  status: VisualStatus | 'unknown';
  /** Що знято через конфлікт. */
  evicted: string[];
  error?: 'unknown-item';
};

/**
 * Надіти предмет: знімає все, що з ним конфліктує. Невідомі ключі у вхідному списку зберігаються
 * (можуть бути предметами новішої версії каталогу). Перевірку володіння робить сервер.
 */
export function equip(current: LookEquipment | LookLegacyWear, itemRef: string, manifest: LookManifest = LOOK_MANIFEST): LookEquipResult {
  const list = toEquipmentList(current, manifest);
  const item = findLookItem(itemRef, manifest);
  if (!item) return { equipment: list, changed: false, item: null, status: 'unknown', evicted: [], error: 'unknown-item' };
  const evicted: string[] = [];
  const kept: string[] = [];
  for (const id of list) {
    const other = findLookItem(id, manifest);
    if (other && other.id !== item.id && itemsConflict(item, other)) evicted.push(other.id);
    else if (!other || other.id !== item.id) kept.push(id);
  }
  const equipment = sortedUniqueIds([...kept, item.id]);
  const changed = equipment.length !== list.length || equipment.some((x, i) => x !== list[i]);
  return { equipment, changed, item: item.id, status: item.status, evicted: sortedUniqueIds(evicted) };
}

export type LookUnequipResult = { equipment: string[]; changed: boolean; removed: string | null };

/** Зняти предмет. Нічого іншого не змінює; фірмове худі після зняття знову показується як `default`. */
export function unequip(current: LookEquipment | LookLegacyWear, itemRef: string, manifest: LookManifest = LOOK_MANIFEST): LookUnequipResult {
  const list = toEquipmentList(current, manifest);
  const id = findLookItem(itemRef, manifest)?.id ?? toLookItemId(itemRef);
  const equipment = list.filter((x) => x !== id);
  const changed = equipment.length !== list.length;
  return { equipment, changed, removed: changed ? id : null };
}
