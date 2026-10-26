/**
 * DOM-контракт `data-look` (ADR-005). Функції повертають звичайні об'єкти атрибутів —
 * сам пакет DOM не чіпає. Компонент Бобека розгортає їх на корінь і на кожен шар;
 * e2e порівнює `data-look-items`/`data-look-equipped` між екранами («один образ всюди»).
 */
import type { LookRenderLayer, ResolvedLook } from './types';

export const LOOK_ROOT_ATTRS = [
  'data-look',
  'data-look-mode',
  'data-look-base',
  'data-look-view',
  'data-look-pose',
  'data-look-equipped',
  'data-look-items',
  'data-look-pending',
  'data-look-hidden',
  'data-look-legacy',
  'data-look-preview',
] as const;
export const LOOK_LAYER_ATTRS = ['data-look-layer', 'data-look-slot', 'data-look-owner'] as const;

export type LookRootAttrs = Record<(typeof LOOK_ROOT_ATTRS)[number], string>;
export type LookLayerAttrs = Record<(typeof LOOK_LAYER_ATTRS)[number], string>;

const list = (xs: readonly string[]) => xs.join(' ');

export function lookDataAttributes(look: ResolvedLook): LookRootAttrs {
  return {
    'data-look': look.key,
    'data-look-mode': look.mode,
    'data-look-base': look.baseRef,
    'data-look-view': look.view,
    'data-look-pose': look.pose,
    'data-look-equipped': list(look.equipped),
    'data-look-items': list(look.drawn),
    'data-look-pending': list(look.pending),
    'data-look-hidden': list(look.hidden.map((h) => h.id)),
    'data-look-legacy': String(look.legacy),
    'data-look-preview': String(look.preview),
  };
}

export function layerDataAttributes(layer: LookRenderLayer): LookLayerAttrs {
  return { 'data-look-layer': layer.id, 'data-look-slot': layer.slot, 'data-look-owner': layer.owner };
}
