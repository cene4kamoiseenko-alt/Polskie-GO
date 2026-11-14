/**
 * resolveLook / tryOn (ADR-005): єдине джерело того, як виглядає Бобек.
 * Екрани не підміняють одяг за назвою: вони отримують ResolvedLook і малюють `layers`.
 */
import { LOOK_MANIFEST } from './manifest';
import { itemsConflict, effectiveSlots, equip, equipmentFromWear, findLookItem, lookPrecedence, sortedUniqueIds, toEquipmentList, toLookItemId } from './rules';
import { lookZ } from './spec';
import type {
  LookItemOutcome,
  LookItemReason,
  LookLegacyWear,
  LookEquipment,
  LookInventory,
  LookItem,
  LookLayer,
  LookManifest,
  LookMode,
  LookPose,
  LookVariant,
  LookVariantPose,
  LookView,
  LookRenderLayer,
  ResolvedLook,
  LookSlotOutcome,
  LookSlotState,
  VisualStatus,
  LookWearSlot,
} from './types';
import { LOOK_WEAR_SLOTS } from './types';

export type ResolveOptions = {
  /** Стан Бобека (BeaverMood). Невідомий стан → поза за замовчуванням, `poseFallback = true`. */
  mood?: string;
  view?: LookView;
  manifest?: LookManifest;
  /** Показувати фірмовий образ у вільних слотах. За замовчуванням — так. */
  signatureDefaults?: boolean;
  /** Позначка примірки (data-look-preview). */
  preview?: boolean;
};

const emptySlots = <T>(v: T): Record<LookWearSlot, T> => Object.fromEntries(LOOK_WEAR_SLOTS.map((s) => [s, v])) as Record<LookWearSlot, T>;
const matchesPose = (l: LookLayer, pose: string) => l.poses === '*' || l.poses.includes(pose);
/** Лише власні ключі: стан на кшталт 'constructor' не повинен знайти властивість прототипу. */
const own = <T>(rec: Partial<Record<string, T>>, key: string): T | undefined => (Object.prototype.hasOwnProperty.call(rec, key) ? rec[key] : undefined);

function isLegacyOnly(it: LookItem) {
  return it.status === 'legacy-whole-look' && !it.legacy;
}

const sameIds = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * Який готовий образ малювати для надітого. Набір — предмети з осей образів, які опинилися в пулі (надіті й фірмові), без
 * худі (воно на кожній картинці). Точний збіг — його картинка; немає точного — найбільший образ, що вміщується в набір, а серед
 * однаково великих — з важливішими речами за `variants.priority` (решта предметів позначається `no-variant`). Стартовий набір (худі + рюкзак) лишається цілісним базовим образом з 14 позами,
 * тому тут `null`.
 */
function pickVariant(m: LookManifest, pool: readonly LookItem[]): LookVariant | null {
  const vs = m.variants;
  if (!vs || !vs.list.length) return null;
  const axis = new Set(vs.list.flatMap((v) => v.items));
  const set = sortedUniqueIds(pool.filter((it) => it.status === 'prerendered' && axis.has(it.id)).map((it) => it.id));
  const included = new Set(Object.values(vs.includes));
  const starter = sortedUniqueIds(Object.values(m.legacyBase.includes).filter((id): id is string => !!id && !included.has(id)));
  if (sameIds(set, starter)) return null;
  const exact = vs.list.find((v) => sameIds(v.items, set));
  if (exact) return exact;
  // Немає точного: найбільший образ, що вміщується в набір; серед однаково великих — з важливішими речами (куртка, потім голова…).
  const rank = (id: string) => {
    const i = vs.priority ? vs.priority.indexOf(id) : -1;
    return i < 0 ? 0 : vs.priority!.length - i;
  };
  const score = (v: LookVariant) => v.items.reduce((sum, id) => sum + rank(id), 0);
  let best: LookVariant | null = null;
  for (const v of vs.list) {
    if (!v.items.every((id) => set.includes(id))) continue;
    if (!best || v.items.length > best.items.length || (v.items.length === best.items.length && score(v) > score(best))) best = v;
  }
  return best;
}

/** Розмістити шар: `registered` — як намальовано; `anchored` — точкою pivot на якір пози. */
function placeLayer(l: LookLayer, owner: string, pose: LookPose | null, m: LookManifest): LookRenderLayer {
  const base: LookRenderLayer = { id: l.id, asset: l.asset, owner, slot: l.slot, z: lookZ(l.band, l.z ?? 0), fit: 'canvas', rect: { ...l.rect } };
  if (l.opacity !== undefined) base.opacity = l.opacity;
  if (l.motion) base.motion = l.motion;
  if (l.motionOrigin) base.motionOrigin = { ...l.motionOrigin };
  if (l.placement !== 'anchored' || !l.anchor) return base;
  const a = pose?.anchors?.[l.anchor] ?? m.anchors[l.view]?.[l.anchor];
  if (!a) return base;
  const pivot = l.pivot ?? { x: l.rect.w / 2, y: l.rect.h / 2 };
  base.rect = { x: a.x - pivot.x, y: a.y - pivot.y, w: l.rect.w, h: l.rect.h };
  const rot = pose?.rotations?.[l.anchor];
  if (rot) {
    base.rotate = rot;
    base.origin = { ...pivot };
  }
  return base;
}

/**
 * Який вигляд має Бобек.
 * @param inventory предмети у власності; `null` — невідомо (чужий профіль), володіння не перевіряється.
 * @param equipment надіте: список slug/`i_<slug>` або старий `me.outfit.wear`.
 */
export function resolveLook(inventory: LookInventory, equipment: LookEquipment | LookLegacyWear, options: ResolveOptions = {}): ResolvedLook {
  const m = options.manifest ?? LOOK_MANIFEST;
  const view: LookView = options.view ?? 'front';
  const mood = options.mood ?? 'happy';
  const owned = inventory ? new Set(toEquipmentList(inventory, m)) : null;

  const outcomes = new Map<string, LookItemOutcome>();
  const note = (it: LookItem, drawn: boolean, reason: LookItemReason, by?: string) => {
    const o: LookItemOutcome = { id: it.id, status: it.status, drawn, reason };
    if (by) o.by = by;
    outcomes.set(it.id, o);
  };

  // 1. Нормалізація: невідомі ключі не ламають, а потрапляють у `unknown`.
  const rawList = Array.isArray(equipment)
    ? (equipment as readonly unknown[]).filter((x): x is string => typeof x === 'string')
    : equipmentFromWear(equipment as LookLegacyWear);
  const unknown: string[] = [];
  const seen = new Set<string>();
  const candidates: LookItem[] = [];
  for (const raw of sortedUniqueIds(rawList.map(toLookItemId).filter(Boolean))) {
    const it = findLookItem(raw, m);
    if (!it) {
      unknown.push(raw);
      continue;
    }
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    if (owned && !owned.has(it.id)) {
      note(it, false, 'not-owned');
      continue;
    }
    candidates.push(it);
  }

  // 2. Конфлікти в старих даних: детермінований переможець (ширший предмет, пріоритет слота, id).
  const accepted: LookItem[] = [];
  for (const it of [...candidates].sort(lookPrecedence)) {
    const winner = accepted.find((a) => itemsConflict(a, it));
    if (winner) note(it, false, 'slot-conflict', winner.id);
    else accepted.push(it);
  }

  const wanted = emptySlots<string | null>(null);
  for (const it of accepted) for (const s of effectiveSlots(it)) wanted[s] = it.id;

  // 3. Фірмовий образ у вільних слотах.
  const defaultCandidates: LookItem[] = [];
  if (options.signatureDefaults !== false) {
    for (const [slot, id] of Object.entries(m.signatureDefaults) as [LookWearSlot, string][]) {
      const it = findLookItem(id, m);
      if (!it || seen.has(it.id) || wanted[slot]) continue;
      if (owned && !owned.has(it.id)) continue;
      if (accepted.some((a) => itemsConflict(a, it)) || effectiveSlots(it).some((s) => wanted[s])) continue;
      defaultCandidates.push(it);
    }
  }
  const pool = [...accepted, ...defaultCandidates];

  // 4. Режим малювання.
  const costume = accepted.find((it) => it.status === 'legacy-whole-look' && it.legacy && it.legacy.view === view) ?? null;
  const baseReady = m.base.status === 'ready' && m.base.views.includes(view);
  const lb = m.legacyBase;
  const legacyPoseKey = view === 'front' ? (own(lb.moods, mood) ?? lb.fallbackPose) : own(lb.views, view);
  // Готові образи — лише для фронтального виду (інших ракурсів у них немає: там стартова картинка, як раніше).
  const variant = !costume && view === 'front' ? pickVariant(m, pool) : null;
  let mode: LookMode;
  if (costume) mode = 'legacy-costume';
  else if (baseReady && !pool.some(isLegacyOnly)) mode = 'layered';
  else if (variant) mode = 'variant';
  else if (legacyPoseKey && own(lb.poses, legacyPoseKey)) mode = 'legacy-base';
  else mode = 'empty';

  const shown = emptySlots<string | null>(null);
  const layers: LookRenderLayer[] = [];
  let pose = 'none';
  let poseFallback = true;
  let baseRef = 'none';
  let cover: string | null = null;
  const drawable = new Set<string>();

  if (mode === 'legacy-costume' && costume?.legacy) {
    const art = costume.legacy;
    baseRef = `legacy:${costume.id}`;
    pose = 'costume';
    poseFallback = mood !== 'happy';
    cover = costume.id;
    layers.push({ id: `legacy:${costume.id}`, asset: art.asset, owner: costume.id, slot: 'base', z: 0, fit: 'contain', rect: null });
    for (const s of effectiveSlots(costume)) shown[s] = costume.id;
    for (const [s, id] of Object.entries(art.shows) as [LookWearSlot, string][]) if (!shown[s]) shown[s] = id;
  } else if (mode === 'variant' && variant && m.variants) {
    const vs = m.variants;
    const wantedPose: LookVariantPose = own(vs.moods, mood) ?? vs.defaultPose;
    const poseKey: LookVariantPose | undefined = variant.images[wantedPose] ? wantedPose : variant.images[vs.defaultPose] ? vs.defaultPose : (Object.keys(variant.images)[0] as LookVariantPose | undefined);
    const asset = poseKey ? variant.images[poseKey] : undefined;
    if (asset && poseKey) {
      baseRef = vs.id;
      pose = poseKey;
      // «Своя» поза — тільки якщо стан має запис у таблиці й для цього набору є саме ця картинка.
      poseFallback = !(own(vs.moods, mood) && poseKey === wantedPose);
      layers.push({ id: `variant:${variant.id}:${poseKey}`, asset, owner: vs.id, slot: 'base', z: 0, fit: 'contain', rect: null });
      for (const [s, id] of Object.entries(vs.includes) as [LookWearSlot, string][]) shown[s] = id;
      for (const id of variant.items) {
        const it = findLookItem(id, m);
        if (it) for (const s of effectiveSlots(it)) shown[s] = it.id;
      }
    }
  } else if (mode === 'legacy-base' && legacyPoseKey) {
    const img = lb.poses[legacyPoseKey];
    baseRef = lb.id;
    pose = legacyPoseKey;
    poseFallback = view === 'front' ? !own(lb.moods, mood) : false;
    cover = lb.id;
    layers.push({ id: `legacy-base:${legacyPoseKey}`, asset: img.asset, owner: lb.id, slot: 'base', z: 0, fit: 'contain', rect: null });
    for (const [s, id] of Object.entries(lb.includes) as [LookWearSlot, string][]) shown[s] = id;
  } else if (mode === 'layered') {
    const wantedPose = own(m.base.moods, mood);
    const spec =
      m.base.poses.find((p) => p.id === wantedPose && p.view === view) ??
      m.base.poses.find((p) => p.id === m.base.defaultPose[view]) ??
      m.base.poses.find((p) => p.view === view) ??
      null;
    pose = spec?.id ?? 'none';
    poseFallback = !spec || spec.id !== wantedPose;
    baseRef = m.base.version;
    const ready = pool.filter(
      (it) =>
        it.status === 'ready' &&
        it.compatibility?.baseVersion === m.base.version &&
        it.compatibility.views.includes(view) &&
        it.layers.some((l) => l.view === view && matchesPose(l, pose)),
    );
    const removed = new Set<string>();
    for (const it of ready) for (const part of [...(it.replaces ?? []), ...(it.hides ?? [])]) removed.add(part);
    for (const l of m.base.layers) {
      if (l.view === view && matchesPose(l, pose) && !removed.has(l.part)) layers.push(placeLayer(l, 'base', spec, m));
    }
    for (const it of ready) {
      drawable.add(it.id);
      for (const s of effectiveSlots(it)) shown[s] = it.id;
      for (const l of it.layers) if (l.view === view && matchesPose(l, pose)) layers.push(placeLayer(l, it.id, spec, m));
    }
  }
  layers.sort((a, b) => a.z - b.z || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  // 5. Що з надітого реально видно.
  const isShown = (it: LookItem) => drawable.has(it.id) || (mode !== 'layered' && effectiveSlots(it).every((s) => shown[s] === it.id));
  for (const it of accepted) {
    if (isShown(it)) note(it, true, 'drawn');
    else if (it.status === 'pending') note(it, false, 'visual-pending');
    else if (it.status === 'prerendered' && (mode === 'variant' || mode === 'legacy-base')) note(it, false, mode === 'variant' ? 'no-variant' : 'view-unsupported');
    else if (mode === 'layered' || mode === 'empty' || (it.legacy && it.legacy.view !== view)) note(it, false, 'view-unsupported');
    else note(it, false, 'covered-by-whole-look', cover ?? undefined);
  }
  const defaults: string[] = [];
  for (const it of defaultCandidates) {
    if (isShown(it)) {
      note(it, true, 'default');
      defaults.push(it.id);
    }
  }

  // pending — надіте й не намальоване через відсутність зображення (ковпак на картинці кухаря — намальований).
  const pendingIds = new Set(accepted.filter((it) => outcomes.get(it.id)?.reason === 'visual-pending').map((it) => it.id));
  const defaultIds = new Set(defaults);
  const slots = {} as Record<LookWearSlot, LookSlotState>;
  const extraneous: { slot: LookWearSlot; id: string }[] = [];
  for (const s of LOOK_WEAR_SLOTS) {
    const w = wanted[s];
    const sh = shown[s];
    let outcome: LookSlotOutcome;
    if (!w && !sh) outcome = 'empty';
    else if (w && w === sh) outcome = 'drawn';
    else if (!w && sh && defaultIds.has(sh)) outcome = 'default';
    else if (w && pendingIds.has(w)) outcome = 'pending';
    else if (w) outcome = 'hidden';
    else outcome = 'extraneous';
    slots[s] = { wanted: w, shown: sh, outcome };
    if (sh && sh !== w && outcome !== 'default') extraneous.push({ slot: s, id: sh });
  }

  const items = [...outcomes.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const drawn = sortedUniqueIds(items.filter((o) => o.drawn).map((o) => o.id));
  return {
    key: `look1|${mode}|${baseRef}|${view}|${pose}|${drawn.join('+')}`,
    mode,
    baseRef,
    view,
    mood,
    pose,
    poseFallback,
    layers,
    slots,
    equipped: sortedUniqueIds(accepted.map((it) => it.id)),
    drawn,
    pending: [...pendingIds].sort(),
    hidden: items.filter((o) => !o.drawn && o.reason !== 'visual-pending'),
    extraneous,
    defaults: defaults.sort(),
    unknown,
    items,
    legacy: mode !== 'layered',
    preview: options.preview === true,
  };
}

export type TryOnOptions = Omit<ResolveOptions, 'preview'> & { inventory?: LookInventory };

export type LookPreview = {
  /** Примірка нічого не зберігає: запис робить лише підтвердження (POST /inventory/equip). */
  persisted: false;
  candidate: string;
  known: boolean;
  status: VisualStatus | 'unknown';
  /** Чи видно саме обрану річ. Ні — інтерфейс показує причину («скоро», «закрито костюмом»), а не чужу картинку. */
  candidateVisible: boolean;
  candidateReason: LookItemReason | 'unknown-item';
  /** Список надітого, якщо підтвердити. */
  equipment: string[];
  added: string[];
  removed: string[];
  changedSlots: LookWearSlot[];
  before: ResolvedLook;
  after: ResolvedLook;
};

/** Приміряти річ: чиста функція, вхід не змінюється, нічого не зберігається. */
export function tryOn(current: LookEquipment | LookLegacyWear, candidate: string, options: TryOnOptions = {}): LookPreview {
  const { inventory = null, ...rest } = options;
  const m = rest.manifest ?? LOOK_MANIFEST;
  const currentList = toEquipmentList(current, m);
  const before = resolveLook(inventory, currentList, rest);
  const r = equip(currentList, candidate, m);
  if (!r.item) {
    const after = resolveLook(inventory, currentList, { ...rest, preview: true });
    return {
      persisted: false, candidate: toLookItemId(candidate), known: false, status: 'unknown', candidateVisible: false,
      candidateReason: 'unknown-item', equipment: currentList, added: [], removed: [], changedSlots: [], before, after,
    };
  }
  const id = r.item;
  const previewInventory = inventory ? sortedUniqueIds([...inventory, id]) : null;
  const after = resolveLook(previewInventory, r.equipment, { ...rest, preview: true });
  const outcome = after.items.find((o) => o.id === id);
  return {
    persisted: false,
    candidate: id,
    known: true,
    status: r.status,
    candidateVisible: after.drawn.includes(id),
    candidateReason: outcome?.reason ?? 'visual-pending',
    equipment: r.equipment,
    added: r.equipment.filter((x) => !currentList.includes(x)),
    removed: currentList.filter((x) => !r.equipment.includes(x)),
    changedSlots: LOOK_WEAR_SLOTS.filter((s) => before.slots[s].shown !== after.slots[s].shown || before.slots[s].wanted !== after.slots[s].wanted),
    before,
    after,
  };
}
