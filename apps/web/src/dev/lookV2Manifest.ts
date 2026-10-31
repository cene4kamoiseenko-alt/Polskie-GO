/**
 * Art V2 (painted from standalone SVG paths): independent pose and garment layers.
 * A separate opt-in QA manifest. The product manifest remains legacy/pending until art approval.
 */
import { LOOK_PROTOTYPE_MANIFEST } from './lookPrototypeManifest';
import type { LookLayer, LookManifest } from '@polski-go/shared';

const VERSION = 'bobek-v2-art-draft@1';
const CANVAS = { x: 0, y: 0, w: 1024, h: 1024 };

const remap = (layer: LookLayer): LookLayer => ({
  ...layer,
  asset: layer.asset.replace(/^proto\//, 'bobek-v2/'),
});

/**
 * The SVG source for cap and glasses already draws on the *full* 1024 canvas,
 * unlike the cropped proto sprites; never apply their old anchor offsets twice.
 */
const remapItemLayer = (id: string, layer: LookLayer): LookLayer => {
  if (id !== 'cap-red' && id !== 'glasses-round') return remap(layer);
  return {
    ...layer,
    asset: `bobek-v2/idle/${id}`,
    placement: 'registered',
    rect: CANVAS,
    anchor: undefined,
    pivot: undefined,
  };
};

export const LOOK_V2_DRAFT_MANIFEST: LookManifest = {
  ...LOOK_PROTOTYPE_MANIFEST,
  base: {
    ...LOOK_PROTOTYPE_MANIFEST.base,
    version: VERSION,
    layers: LOOK_PROTOTYPE_MANIFEST.base.layers.map(remap),
  },
  items: LOOK_PROTOTYPE_MANIFEST.items.map((item) => ({
    ...item,
    compatibility: item.compatibility ? { ...item.compatibility, baseVersion: VERSION } : null,
    layers: item.layers.map((layer) => remapItemLayer(item.id, layer)),
    note: 'Нова авторська послійна графіка, лише QA чернетка. Не для production.',
  })),
};
