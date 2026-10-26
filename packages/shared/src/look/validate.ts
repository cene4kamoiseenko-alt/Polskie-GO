/**
 * Перевірка маніфесту й список відсутніх ассетів (ADR-005).
 * Ті самі функції використовують тести й скрипти імпорту листів (пайплайн ассетів).
 */
import { LOOK_MANIFEST, LOOK_MILESTONES } from './manifest';
import { effectiveSlots } from './rules';
import { LOOK_ALLOWED_BANDS, LOOK_BASE_TEMPLATE, LOOK_FROM_CATALOG, LOOK_SLOT_TEMPLATES, type LookPartTemplate } from './spec';
import type { LookAnchorId, LookItem, LookLayer, LookManifest, LookSlot, LookView, LookZBand } from './types';
import { LOOK_BASE_PARTS, LOOK_WEAR_SLOTS } from './types';

export type LookIssue = { level: 'error' | 'warning'; code: string; ref: string; message: string };

const posesOf = (m: LookManifest, view: LookView) => m.base.poses.filter((p) => p.view === view).map((p) => p.id);

function hasPart(layers: readonly LookLayer[], part: string, view: LookView, pose: string | '*'): boolean {
  return layers.some((l) => l.part === part && l.view === view && (pose === '*' ? l.poses === '*' : l.poses === '*' || l.poses.includes(pose)));
}

function templatesFor(item: LookItem): LookPartTemplate[] {
  const seen = new Set<string>();
  const out: LookPartTemplate[] = [];
  for (const slot of item.occupies) for (const t of LOOK_SLOT_TEMPLATES[slot]) if (!seen.has(t.part)) (seen.add(t.part), out.push(t));
  return out;
}

export function validateManifest(m: LookManifest = LOOK_MANIFEST): LookIssue[] {
  const issues: LookIssue[] = [];
  const err = (code: string, ref: string, message: string) => issues.push({ level: 'error', code, ref, message });
  const warn = (code: string, ref: string, message: string) => issues.push({ level: 'warning', code, ref, message });
  const { width, height } = m.canvas;
  const poseIds = new Set(m.base.poses.map((p) => p.id));
  const itemIds = new Set<string>();
  const layerIds = new Set<string>();

  const checkLayer = (l: LookLayer, owner: string, allowedSlots: readonly LookSlot[]) => {
    if (layerIds.has(l.id)) err('duplicate-layer', l.id, 'Повторний id шару.');
    layerIds.add(l.id);
    if (!allowedSlots.includes(l.slot)) err('layer-slot', l.id, `Шар у слоті ${l.slot}, а ${owner} його не займає.`);
    if (owner !== 'base' && (l.band === 'head' || l.band === 'face')) err('touches-face', l.id, 'Предмет не може малювати в смугах голови й морди.');
    else if (!LOOK_ALLOWED_BANDS[l.slot].includes(l.band)) err('band', l.id, `Смуга ${l.band} не дозволена для слота ${l.slot}.`);
    if (l.poses !== '*') for (const p of l.poses) if (!poseIds.has(p)) err('unknown-pose', l.id, `Невідома поза ${p}.`);
    if (l.rect.w <= 0 || l.rect.h <= 0) err('rect', l.id, 'Порожній прямокутник.');
    if (l.placement !== 'anchored' && (l.rect.x < 0 || l.rect.y < 0 || l.rect.x + l.rect.w > width || l.rect.y + l.rect.h > height)) err('rect', l.id, 'Шар виходить за полотно.');
    if (l.placement === 'anchored' && (!l.anchor || !m.anchors[l.view]?.[l.anchor])) err('anchor', l.id, 'Немає якоря для прикріпленого шару.');
  };

  // База
  for (const l of m.base.layers) {
    checkLayer(l, 'base', ['base']);
    if (!(LOOK_BASE_PARTS as readonly string[]).includes(l.part)) err('base-part', l.id, `Невідома частина бази ${l.part}.`);
  }
  for (const [mood, pose] of Object.entries(m.base.moods)) if (pose && !poseIds.has(pose)) err('mood-pose', mood, `Поза ${pose} не існує.`);
  for (const [view, pose] of Object.entries(m.base.defaultPose)) if (pose && !poseIds.has(pose)) err('default-pose', view, `Поза ${pose} не існує.`);
  if (m.base.status === 'ready') {
    for (const view of m.base.views)
      for (const t of LOOK_BASE_TEMPLATE)
        for (const pose of t.perPose ? posesOf(m, view) : ['*'])
          if (!hasPart(m.base.layers, t.part, view, pose)) err('missing-part', `base:${t.part}`, `Немає частини ${t.part} (${view}, ${pose}).`);
  }

  // Цілісний базовий образ
  const lb = m.legacyBase;
  if (!lb.poses[lb.fallbackPose]) err('legacy-pose', lb.id, `Немає запасної пози ${lb.fallbackPose}.`);
  for (const [mood, key] of Object.entries(lb.moods)) if (key && !lb.poses[key]) err('legacy-pose', mood, `Немає пози ${key}.`);
  for (const [view, key] of Object.entries(lb.views)) if (key && !lb.poses[key]) err('legacy-pose', view, `Немає пози ${key}.`);

  // Предмети
  for (const it of m.items) {
    if (itemIds.has(it.id)) err('duplicate-id', it.id, 'Повторний id предмета.');
    itemIds.add(it.id);
    if ((it.occupies as readonly string[]).includes('base')) err('occupies-base', it.id, 'Слот base займає лише базова модель.');
    if (it.domain === 'profile-frame') {
      if (it.catalogSlot !== 'FRAME' || it.occupies.length) err('frame', it.id, 'Рамка не займає слотів Бобека.');
      continue;
    }
    if (!it.occupies.length) err('no-slots', it.id, 'Предмет на Бобеку має займати хоча б один слот.');
    if (it.catalogSlot === 'COSTUME' && it.occupies.includes('backpack'))
      err('costume-backpack', it.id, 'Костюм не займає слот backpack: рюкзак лишається за гравцем.');
    if (it.catalogSlot === 'FRAME') err('frame', it.id, 'FRAME — лише домен profile-frame.');
    else if (it.catalogSlot !== 'COSTUME') {
      const expected = LOOK_FROM_CATALOG[it.catalogSlot];
      if (it.occupies.length !== 1 || it.occupies[0] !== expected) err('slot-mismatch', it.id, `Слот каталогу ${it.catalogSlot} → ${expected}.`);
    }
    const slots = effectiveSlots(it);
    for (const l of it.layers) checkLayer(l, it.id, it.occupies);

    if (it.status === 'ready') {
      if (!it.compatibility) err('compat', it.id, 'Готовий предмет без сумісності.');
      else {
        if (it.compatibility.baseVersion !== m.base.version) err('base-version', it.id, `Шари для ${it.compatibility.baseVersion}, база ${m.base.version}.`);
        if (m.base.status !== 'ready') warn('base-not-ready', it.id, 'Шари готові, але база ще ні — предмет не малюється.');
        for (const view of it.compatibility.views)
          for (const t of templatesFor(it)) {
            if (t.optional) continue;
            if (!t.perPose && it.layers.some((l) => l.part === t.part && l.view === view && l.poses !== '*'))
              err('per-pose-variant', it.id, `Частина ${t.part} має бути однією на ракурс (поза '*').`);
            for (const pose of t.perPose ? posesOf(m, view) : ['*'])
              if (!hasPart(it.layers, t.part, view, pose)) err('missing-part', `${it.id}:${t.part}`, `Немає частини ${t.part} (${view}, ${pose}).`);
          }
      }
    } else if (it.status === 'legacy-whole-look') {
      if (it.legacy) {
        for (const [slot, shown] of Object.entries(it.legacy.shows) as [LookSlot, string][]) {
          if (slots.includes(slot as never)) err('shows-overlap', it.id, `Слот ${slot} — частина самого костюма.`);
          if (!shown.startsWith('prop:') && !m.items.some((x) => x.id === shown)) err('shows-unknown', it.id, `Невідомий предмет ${shown}.`);
        }
      } else if (it.fallback !== 'legacy-base' || !Object.values(lb.includes).includes(it.id)) {
        err('legacy-missing', it.id, 'Немає цілісної картинки й предмета немає в legacy-base.');
      }
    } else if (it.layers.length) {
      warn('pending-has-layers', it.id, 'Частина шарів є, але предмет ще pending — не малюється.');
    }
  }

  for (const [slot, id] of Object.entries(m.signatureDefaults)) {
    const it = m.items.find((x) => x.id === id);
    if (!it || !it.occupies.includes(slot as never)) err('signature', String(id), `Фірмовий предмет має займати слот ${slot}.`);
  }
  for (const s of Object.values(lb.includes)) if (s && !itemIds.has(s)) err('legacy-includes', s, 'Невідомий предмет у legacy-base.');
  return issues;
}

export type LookMissingAsset = {
  owner: string;
  part: string;
  slot: LookSlot;
  view: LookView;
  pose: string;
  band: LookZBand;
  anchor?: LookAnchorId;
  placement: 'registered' | 'anchored';
  optional: boolean;
};

/**
 * Що треба намалювати: база (усі частини для кожної пози) і предмети за шаблонами слотів.
 * Детермінований порядок: база → предмети в порядку `items`.
 */
export function missingAssets(
  m: LookManifest = LOOK_MANIFEST,
  scope: { base?: boolean; items?: readonly string[]; views?: readonly LookView[]; poses?: readonly string[] } = {},
): LookMissingAsset[] {
  const out: LookMissingAsset[] = [];
  const views = scope.views ?? m.base.views;
  const posesFor = (view: LookView) => posesOf(m, view).filter((p) => !scope.poses || scope.poses.includes(p));
  if (scope.base !== false) {
    for (const view of views)
      for (const t of LOOK_BASE_TEMPLATE)
        for (const pose of t.perPose ? posesFor(view) : ['*'])
          if (!hasPart(m.base.layers, t.part, view, pose))
            out.push({ owner: 'base', part: t.part, slot: 'base', view, pose, band: t.band, anchor: t.anchor, placement: t.placement, optional: !!t.optional });
  }
  for (const id of scope.items ?? m.items.filter((x) => x.domain === 'beaver').map((x) => x.id)) {
    const it = m.items.find((x) => x.id === id);
    if (!it || it.domain !== 'beaver') continue;
    for (const view of views)
      for (const slot of LOOK_WEAR_SLOTS.filter((s) => it.occupies.includes(s)))
        for (const t of LOOK_SLOT_TEMPLATES[slot])
          for (const pose of t.perPose ? posesFor(view) : ['*'])
            if (!hasPart(it.layers, t.part, view, pose))
              out.push({ owner: it.id, part: t.part, slot, view, pose, band: t.band, anchor: t.anchor, placement: t.placement, optional: !!t.optional });
  }
  return out;
}

/** Відсутні ассети етапу (etalon-1, etalon-2…). Невідомий етап → []. */
export function missingForMilestone(id: string, m: LookManifest = LOOK_MANIFEST): LookMissingAsset[] {
  const ms = LOOK_MILESTONES.find((x) => x.id === id);
  if (!ms) return [];
  return missingAssets(m, { base: ms.base, items: ms.items, views: ms.views as LookView[], poses: ms.poses });
}
