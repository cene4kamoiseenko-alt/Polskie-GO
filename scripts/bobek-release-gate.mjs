/**
 * Honest release report for the unified POLSKI GO mascot.
 * Usage: node --import tsx scripts/bobek-release-gate.mjs [--strict] [--json]
 *
 * Non-strict mode is informational (exits 0). Strict mode prevents marking
 * unfinished art as production-ready. No image/face quality claim is inferred
 * from matching filenames; signed visual review is still required.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOOK_MANIFEST, LOOK_MILESTONES } from '../packages/shared/src/look/manifest.ts';
import { SCENE_ART } from '../packages/shared/src/sceneArt.ts';
import { MAP_ART } from '../packages/shared/src/mapArt.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
const json = process.argv.includes('--json');
const base = LOOK_MANIFEST.base;
const items = LOOK_MANIFEST.items.filter((it) => it.domain === 'beaver');
const ready = items.filter((it) => it.status === 'ready' && it.layers.length && it.compatibility?.baseVersion === base.version);
const pending = items.filter((it) => it.status === 'pending');
const legacy = items.filter((it) => it.status === 'legacy-whole-look');
const missingAssets = [];
const makePath = (key) => join(root, 'apps/web/src/assets', key + '.webp');
const files = [...base.layers, ...ready.flatMap((it) => it.layers)];
for (const { asset } of files) {
  if (!existsSync(makePath(asset))) missingAssets.push(asset);
}
const scenes = Object.values(SCENE_ART);
const bakedScenes = scenes.filter((scene) => scene.bakedBobek).map((scene) => scene.id);
const underReview = scenes.filter((scene) => scene.status !== 'final').map((scene) => scene.id);
const requiredViews = ['front', 'three-quarter', 'side', 'back'];
const missingViews = requiredViews.filter((view) => !base.views.includes(view));
const unmetMilestones = LOOK_MILESTONES.map((milestone) => ({
  id: milestone.id,
  missingViews: milestone.views.filter((view) => !base.views.includes(view)),
  missingPoses: milestone.poses.filter((pose) => !base.poses.some((p) => p.id === pose)),
  missingItems: milestone.items.filter((id) => !ready.some((it) => it.id === id)),
})).filter((m) => m.missingViews.length || m.missingPoses.length || m.missingItems.length);
const blockers = [];
if (base.status !== 'ready') blockers.push('base.status не ready — базовый независимый риг не принят');
if (missingViews.length) blockers.push('не хватает ракурсов: ' + missingViews.join(', '));
if (pending.length || legacy.length) blockers.push(`предметы без полноценных слоёв: ${pending.length} pending, ${legacy.length} legacy`);
if (missingAssets.length) blockers.push(`отсутствуют WebP слоёв: ${missingAssets.length}`);
if (bakedScenes.length) blockers.push(`Бобек впечатан в ${bakedScenes.length} сцен`);
if (MAP_ART.baked) blockers.push('Бобек и маркеры впечатаны в карту');
if (underReview.length) blockers.push(`${underReview.length} сцен ещё имеют interim статус`);
const approvalPath = join(root, 'docs/design/BOBEK_ART_APPROVAL.json');
let approval = null;
if (existsSync(approvalPath)) {
  try { approval = JSON.parse(readFileSync(approvalPath, 'utf8')); } catch { blockers.push('ошибка JSON в художественном подтверждении'); }
}
if (approval?.baseVersion !== base.version || approval?.approved !== true || typeof approval?.reviewedBy !== 'string' || !approval.reviewedBy.trim()) {
  blockers.push('нет подтверждённого визуального review модели и анимаций (docs/design/BOBEK_ART_APPROVAL.json)');
}
const report = {
  complete: blockers.length === 0,
  base: { version: base.version, status: base.status, views: base.views.length, poses: base.poses.length },
  wardrobe: { total: items.length, ready: ready.length, pending: pending.length, legacy: legacy.length, pendingIds: pending.map((x) => x.id) },
  scenes: { total: scenes.length, baked: bakedScenes.length, interim: underReview.length, bakedIds: bakedScenes },
  map: { baked: MAP_ART.baked },
  art: { missingAssets, missingViews, unmetMilestones, reviewApproved: !!approval?.approved },
  blockers,
};
if (json) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`BOBEK: ${report.complete ? 'RELEASE READY' : 'NOT READY'}`);
  console.log(`base: ${base.status}, wardrobe: ${ready.length}/${items.length} painted, baked scenes: ${bakedScenes.length}/${scenes.length}, map baked: ${MAP_ART.baked}`);
  for (const blocker of blockers) console.log('BLOCKER ' + blocker);
}
if (strict && !report.complete) process.exitCode = 1;
