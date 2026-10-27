/**
 * Бобек — маскот POLSKI GO. Один живописний персонаж на всіх екранах (ADR-005, §10–§11).
 *
 * - `Beaver` — Бобек користувача: образ з профілю через useLook (lib/look.ts). Екран передає лише стан, ракурс і розмір.
 * - `BeaverLook` — малює готовий ResolvedLook: примірка (tryOn, data-look-preview="true") і QA-галерея.
 *
 * Малюється лише те, що повернув resolveLook: шари на спільному полотні 1024 (`canvas`) або цілісна живописна
 * картинка (`contain`, режими legacy-base і legacy-costume). Річ без живописного шару (pending) не малюється нічим —
 * ні вектором, ні «схожою» картинкою. Векторного тіла Бобека немає.
 *
 * Зовнішній блок — size × size·260/220 (як раніше, без зсуву розкладки), квадратне полотно притиснуте до низу.
 * Анімації — лише на обгортці: дихання (translateY) і коротка зміна пози. Безкінечне дихання — лише в Бобека,
 * якого видно (IntersectionObserver), розміром від 96 px, без «Менше анімацій» / prefers-reduced-motion і не більше
 * одного на екрані (найбільшого).
 */
import { memo, useEffect, useRef, useSyncExternalStore, type CSSProperties } from 'react';
import { LOOK_CANVAS, layerDataAttributes, lookDataAttributes, type LookMood, type LookRenderLayer, type LookView, type ResolvedLook } from '@polski-go/shared';
import { motion, useInView, useReducedMotion } from '../lib/motion';
import { lookAssetUrl, lookDeliveryWidth } from '../lib/assets';
import { useLook } from '../lib/look';

/**
 * Стани: привітання (wave), правильна відповідь (cheer), підтримка після помилки (sad), роздуми (think),
 * урок пройдено (celebrate), нове місто (travel) та інші. Поза для стану — у маніфесті образу; стан без пози
 * показує запасну позу (`data-look-pose`, poseFallback).
 */
export type BeaverMood = LookMood;

/** Висота блока відносно ширини (як у попередньому компоненті: 220 × 260). */
export const BEAVER_BOX_RATIO = 260 / 220;
/** Найменший бобер, у якого лишаються безкінечні рухи (менші — аватарки). */
const LOOP_MIN_SIZE = 96;

// ── «Не більше однієї групи безкінечних анімацій на екрані»: дихає найбільший видимий Бобек.
const loopCandidates = new Map<number, number>();
const loopListeners = new Set<() => void>();
let loopOwner: number | null = null;
let loopSeq = 0;
function recomputeLoopOwner() {
  let best: number | null = null;
  for (const [id, size] of loopCandidates) if (best === null || size > loopCandidates.get(best)!) best = id;
  if (best !== loopOwner) {
    loopOwner = best;
    for (const l of loopListeners) l();
  }
}
const subscribeLoop = (l: () => void) => {
  loopListeners.add(l);
  return () => loopListeners.delete(l);
};
const loopSnapshot = () => loopOwner;

function useLoopSlot(eligible: boolean, size: number): boolean {
  const id = useRef(0);
  if (!id.current) id.current = ++loopSeq;
  const owner = useSyncExternalStore(subscribeLoop, loopSnapshot, () => null);
  useEffect(() => {
    if (!eligible) return;
    const me = id.current;
    loopCandidates.set(me, size);
    recomputeLoopOwner();
    return () => {
      loopCandidates.delete(me);
      recomputeLoopOwner();
    };
  }, [eligible, size]);
  return eligible && owner === id.current;
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

type AssetResolver = (key: string, width: number) => string | null;

/** Один шар: `canvas` — позиція й розмір у відсотках полотна 1024; `contain` — на все полотно. */
function LayerImg({ layer, width, resolve }: { layer: LookRenderLayer; width: number; resolve: AssetResolver }) {
  const src = resolve(layer.asset, width);
  useEffect(() => {
    if (!src && import.meta.env.DEV) console.warn(`[Beaver] немає файлу для шару «${layer.id}» (${layer.asset})`);
  }, [src, layer.id, layer.asset]);
  if (!src) return null;
  const style: CSSProperties = { position: 'absolute', maxWidth: 'none' };
  if (layer.fit === 'canvas' && layer.rect) {
    const { width: cw, height: ch } = LOOK_CANVAS;
    Object.assign(style, { left: pct(layer.rect.x, cw), top: pct(layer.rect.y, ch), width: pct(layer.rect.w, cw), height: pct(layer.rect.h, ch) });
    if (layer.rotate) {
      style.transform = `rotate(${layer.rotate}deg)`;
      if (layer.origin) style.transformOrigin = `${pct(layer.origin.x, layer.rect.w)} ${pct(layer.origin.y, layer.rect.h)}`;
    }
  } else {
    Object.assign(style, { inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom' });
  }
  if (layer.opacity !== undefined) style.opacity = layer.opacity;
  // Рух шару (моргання, змах лапою) — CSS-анімація з index.css; точка повороту — у відсотках rect шару.
  if (layer.motion === 'wave' && layer.motionOrigin && layer.rect) {
    style.transformOrigin = `${pct(layer.motionOrigin.x - layer.rect.x, layer.rect.w)} ${pct(layer.motionOrigin.y - layer.rect.y, layer.rect.h)}`;
  }
  const className = layer.motion ? `look-motion-${layer.motion}` : undefined;
  return <img {...layerDataAttributes(layer)} className={className} src={src} alt="" decoding="async" draggable={false} style={style} />;
}

type ViewProps = {
  size?: number;
  className?: string;
  /** false — без жодних рухів (аватарки, списки). */
  animate?: boolean;
};

/** Малює ResolvedLook. Корінь має атрибути data-look-*, кожен шар — data-look-layer/slot/owner. */
export const BeaverLook = memo(function BeaverLook({
  look,
  size = 160,
  className,
  animate = true,
  resolveAsset = lookAssetUrl,
}: ViewProps & { look: ResolvedLook; /** URL ассета шару; за замовчуванням — src/assets (прототип передає свій). */ resolveAsset?: AssetResolver }) {
  const reduce = useReducedMotion();
  const anim = animate && !reduce;
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { margin: '80px' });
  const loops = useLoopSlot(anim && inView && size >= LOOP_MIN_SIZE, size);
  const width = lookDeliveryWidth(size);
  return (
    <div
      ref={root}
      {...lookDataAttributes(look)}
      className={['beaver-look', loops ? 'is-live' : '', className ?? ''].filter(Boolean).join(' ')}
      style={{ position: 'relative', display: 'inline-block', width: size, height: size * BEAVER_BOX_RATIO, lineHeight: 0, flexShrink: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <motion.div
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: size }}
        animate={loops ? { y: [0, -4, 0] } : { y: 0 }}
        transition={loops ? { repeat: Infinity, duration: 2.6, ease: 'easeInOut' } : { duration: 0.2 }}
      >
        {/* Зміна пози чи образу — коротке «перевтілення» (opacity + scale), без зміни розміру блока. */}
        <motion.div
          key={look.key}
          style={{ position: 'absolute', inset: 0 }}
          initial={anim ? { opacity: 0.35, scale: 0.94 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {look.layers.map((l) => (
            <LayerImg key={l.id} layer={l} width={width} resolve={resolveAsset} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
});

/** Бобек користувача: той самий збережений образ на кожному екрані. */
export const Beaver = memo(function Beaver({ mood = 'happy', view = 'front', ...rest }: ViewProps & { mood?: BeaverMood; view?: LookView }) {
  const look = useLook(mood, view);
  return <BeaverLook look={look} {...rest} />;
});
