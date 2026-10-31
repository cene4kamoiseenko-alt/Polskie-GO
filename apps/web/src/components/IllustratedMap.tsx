/**
 * Иллюстрированная карта Польши (ADR-012): живописная картинка 941×1068 + настоящие кнопки городов поверх неё.
 *
 * Подписи, звёзды и Бобек у Кракова впечены в картинку, поэтому поверх рисуются только прозрачные зоны нажатия
 * (по рамкам из MAP_SPOTS), маленькие значки состояния (замок / галочка), кольцо «ты здесь» и маркер Закопане,
 * которого на картинке нет. Камера — один transform у «сцены»: кнопки лежат в тех же координатах, что и картинка,
 * поэтому после перетаскивания и масштаба зона города всегда совпадает с подписью.
 *
 * Жесты: один палец / мышь — перетаскивание (с инерцией), два пальца — масштаб вокруг середины, колесо и трекпад —
 * масштаб вокруг курсора, клавиатура — стрелки, + / −, 0 — к текущему городу. Прогресс и доступ приходят только
 * с сервера (journey): карта ничего не открывает сама, кнопка города лишь выбирает его.
 */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MAP_ART, MAP_SPOTS, mapHitRect, mapStarPoint, type MapSpot } from '@polski-go/shared';
import mapSrc from '../assets/map/poland-map.webp';
import type { JourneyCity } from '../lib/types';
import { useReducedMotion } from '../lib/motion';
import { Icon } from './Icon';
import { cx } from './ui';

const W = MAP_ART.width;
const H = MAP_ART.height;
const MAX_SCALE = 1.6;
/** Размытая превью-копия карты (24 px): видна, пока грузится основной файл, и заполняет поля за краем картинки. */
export const MAP_LQIP =
  'data:image/webp;base64,UklGRmYBAABXRUJQVlA4IFoBAAAwBgCdASoYABsAPtFYpEuoJSOhsAgBABoJbAC1CE37G58Auwb4GkCZxCvdP+DfbXQRh3eltGnEM6wAAOJvBZ/sjL+9Hy4qsYJgWENOfojp0h2C0vHD4UJhvs+gU7TuMRXClfX2DFURMtjUTmLZI3c3AyADMbUt1dqYRDBo13zW78X9rHZGDDvQUdwM0mmA5zoBXdPseRPMbRKvh+2vpX3Oi/Xb6yxSC4BXBE7IumAgEaQIYK9C1BhKl2Q72g3U7aODboRlU6I1rXRhhrlkPPJRNf/a/+h+B7BzdnsdiWrACkq19J/pWrWKfazH7Qg8Kc50rYVmte9LeVtKK6cTAMBa+xQZMmY369yfkqyIBrXGN3x4Xot1Zmcfif4vvYZ9hf6KfBbBXbTECN3V9T55jwJTEqRIoZ3/t16Xe3eB6p+KZS5NoQDSJEAt27S3TARAxCvSK8uckgdrAAAA';
export { mapSrc as MAP_SRC };

export type SpotState = 'current' | 'done' | 'open' | 'locked' | 'none';

/** Состояние точки — только из данных сервера. */
export function spotState(spot: MapSpot, city: JourneyCity | undefined, currentCityId: string | null): SpotState {
  if (!spot.city || !city) return 'none';
  if (city.id === currentCityId) return 'current';
  if (city.completed) return 'done';
  return city.unlocked ? 'open' : 'locked';
}

export type MapHandle = {
  /** Плавно (или сразу) показать точку в видимой части карты. */
  focus(key: string, opts?: { animate?: boolean; scale?: number }): void;
  /** Подвинуть карту, только если город не виден целиком в окне между панелями. */
  reveal(key: string): void;
  zoomBy(factor: number): void;
};

type Props = {
  cities: JourneyCity[];
  currentCityId: string | null;
  selected: string | null;
  onSelect(key: string): void;
  /** Высота панелей поверх карты: видимое окно — между ними. */
  padTop: number;
  padBottom: number;
  ariaLabel: string;
  ariaHint: string;
  spotLabel(spot: MapSpot, state: SpotState, city?: JourneyCity): string;
  zoomLabels: { in: string; out: string; home: string };
  /** Путешествие после экзамена города: маркер едет от одной точки к другой. */
  travel?: { from: string; to: string } | null;
};

type Cam = { s: number; x: number; y: number };

export const IllustratedMap = forwardRef<MapHandle, Props>(function IllustratedMap(props, ref) {
  const { cities, currentCityId, selected, onSelect, padTop, padBottom, travel } = props;
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const traveler = useRef<HTMLDivElement>(null);
  const cam = useRef<Cam>({ s: 0.7, x: 0, y: 0 });
  const pads = useRef({ top: padTop, bottom: padBottom });
  pads.current = { top: padTop, bottom: padBottom };
  const dragged = useRef(false);
  /** Человек уже двигал или масштабировал карту — автоцентрирование больше не вмешивается. */
  const touched = useRef(false);
  const inertia = useRef(0);
  const ready = useRef(false);
  const [zoomState, setZoomState] = useState<{ atMin: boolean; atMax: boolean }>({ atMin: false, atMax: false });

  const byId = useMemo(() => new Map(cities.map((c) => [c.slug, c])), [cities]);
  const currentSlug = cities.find((c) => c.id === currentCityId)?.slug ?? null;
  const currentKey = currentSlug ? Object.keys(MAP_SPOTS).find((k) => MAP_SPOTS[k].city === currentSlug) ?? null : null;
  // Порядок кнопок для Tab — порядок маршрута; точка без этапа (Sopot) — в конце.
  const keys = useMemo(() => {
    const order = (k: string) => byId.get(MAP_SPOTS[k].city ?? '')?.order ?? 999;
    return Object.keys(MAP_SPOTS).sort((a, b) => order(a) - order(b));
  }, [byId]);

  const minScale = useCallback(() => {
    const el = box.current;
    if (!el) return 0.5;
    const win = Math.max(1, el.clientHeight - pads.current.top - pads.current.bottom);
    return Math.min(MAX_SCALE, Math.max(el.clientWidth / W, win / H));
  }, []);

  /** Не даём уйти за край: по ширине карта всегда закрывает экран, по высоте — окно между панелями. */
  const clamp = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const c = cam.current;
    c.s = Math.max(minScale(), Math.min(MAX_SCALE, c.s));
    const w = W * c.s;
    const h = H * c.s;
    const vw = el.clientWidth;
    const top = pads.current.top;
    const bottom = el.clientHeight - pads.current.bottom;
    c.x = w <= vw ? (vw - w) / 2 : Math.min(0, Math.max(vw - w, c.x));
    c.y = h <= bottom - top ? top + (bottom - top - h) / 2 : Math.min(top, Math.max(bottom - h, c.y));
  }, [minScale]);

  const lastZoom = useRef('');
  const draw = useCallback(() => {
    clamp();
    const st = stage.current;
    if (!st) return;
    const c = cam.current;
    st.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) scale(${c.s})`;
    st.style.setProperty('--inv', String(1 / c.s));
    const z = { atMin: c.s <= minScale() + 0.001, atMax: c.s >= MAX_SCALE - 0.001 };
    const key = `${z.atMin}${z.atMax}`;
    if (key !== lastZoom.current) {
      lastZoom.current = key;
      setZoomState(z);
    }
  }, [clamp, minScale]);

  const animated = useCallback((on: boolean) => {
    const st = stage.current;
    if (st) st.style.transition = on && !reduced ? 'transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none';
  }, [reduced]);

  const stopInertia = () => {
    cancelAnimationFrame(inertia.current);
    inertia.current = 0;
  };

  /** Масштаб вокруг точки экрана (px внутри box). */
  const zoomAt = useCallback((next: number, px: number, py: number, animate = false) => {
    touched.current = true;
    const c = cam.current;
    const s = Math.max(minScale(), Math.min(MAX_SCALE, next));
    const wx = (px - c.x) / c.s;
    const wy = (py - c.y) / c.s;
    c.s = s;
    c.x = px - wx * s;
    c.y = py - wy * s;
    animated(animate);
    draw();
  }, [animated, draw, minScale]);

  const windowCenter = () => {
    const el = box.current!;
    return [el.clientWidth / 2, pads.current.top + (el.clientHeight - pads.current.top - pads.current.bottom) / 2] as const;
  };

  const focus = useCallback((key: string, opts: { animate?: boolean; scale?: number } = {}) => {
    const spot = MAP_SPOTS[key];
    const el = box.current;
    if (!spot || !el) return;
    stopInertia();
    const [x0, y0, x1, y1] = mapHitRect(spot);
    const c = cam.current;
    if (opts.scale) c.s = Math.max(minScale(), Math.min(MAX_SCALE, opts.scale));
    const [cx, cy] = windowCenter();
    c.x = cx - ((x0 + x1) / 2) * c.s;
    c.y = cy - ((y0 + y1) / 2) * c.s;
    animated(opts.animate ?? true);
    draw();
  }, [animated, draw, minScale]);

  const reveal = useCallback((key: string) => {
    const spot = MAP_SPOTS[key];
    const el = box.current;
    if (!spot || !el) return;
    const [x0, y0, x1, y1] = mapHitRect(spot);
    const c = cam.current;
    const inside = c.x + x0 * c.s >= 0 && c.x + x1 * c.s <= el.clientWidth && c.y + y0 * c.s >= pads.current.top && c.y + y1 * c.s <= el.clientHeight - pads.current.bottom;
    if (!inside) focus(key);
  }, [focus]);

  useImperativeHandle(ref, () => ({
    focus,
    reveal,
    zoomBy: (f: number) => {
      const [cx, cy] = windowCenter();
      zoomAt(cam.current.s * f, cx, cy, true);
    },
  }), [focus, reveal, zoomAt]);

  // Первый кадр: текущий город в центре окна, масштаб — чтобы подписи читались (не вся карта в крошечном виде).
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || ready.current || !el.clientWidth) return;
    ready.current = true;
    const s = Math.max(minScale(), Math.min(MAX_SCALE, el.clientWidth / 560));
    cam.current.s = s;
    if (currentKey) focus(currentKey, { animate: false, scale: s });
    else draw();
  });

  // Панели поменяли высоту, экран повернули — пересчитать границы. Пока человек сам не двигал карту,
  // текущий город заново ставится в центр окна (высоты шапки и карточки известны только после первого кадра).
  useEffect(() => {
    if (!ready.current) return;
    if (!touched.current && currentKey) focus(currentKey, { animate: false });
    else draw();
  }, [padTop, padBottom, draw]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(el);
    return () => ro.disconnect();
  }, [draw]);

  // ── Жесты ──
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const pts = new Map<number, { x: number; y: number }>();
    let pan: { sx: number; sy: number; cx: number; cy: number; moved: boolean } | null = null;
    let pinch: { d: number; mx: number; my: number; s: number; cx: number; cy: number } | null = null;
    let vel = { x: 0, y: 0, t: 0 };
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const startPan = () => {
      const [p] = pts.values();
      pan = { sx: p.x, sy: p.y, cx: cam.current.x, cy: cam.current.y, moved: pan?.moved ?? false };
    };
    const startPinch = () => {
      const [a, b] = [...pts.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, s: cam.current.s, cx: cam.current.x, cy: cam.current.y };
      dragged.current = true;
    };
    const down = (e: PointerEvent) => {
      if ((e.target as Element).closest('[data-map-ctrl]')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      stopInertia();
      animated(false);
      touched.current = true;
      pts.set(e.pointerId, local(e));
      if (pts.size === 1) {
        dragged.current = false;
        pan = null;
        startPan();
        vel = { x: 0, y: 0, t: performance.now() };
      } else if (pts.size === 2) {
        startPinch();
        pan = null;
      }
    };
    const move = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return;
      const p = local(e);
      const prev = pts.get(e.pointerId)!;
      pts.set(e.pointerId, p);
      if (pts.size >= 2 && pinch) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const s = Math.max(minScale(), Math.min(MAX_SCALE, (pinch.s * d) / pinch.d));
        const wx = (pinch.mx - pinch.cx) / pinch.s;
        const wy = (pinch.my - pinch.cy) / pinch.s;
        cam.current = { s, x: mx - wx * s, y: my - wy * s };
        draw();
        return;
      }
      if (!pan) return;
      const dx = p.x - pan.sx;
      const dy = p.y - pan.sy;
      if (!pan.moved && Math.hypot(dx, dy) > 6) {
        pan.moved = true;
        dragged.current = true;
        el.setPointerCapture?.(e.pointerId);
        el.dataset.dragging = '';
      }
      if (!pan.moved) return;
      const now = performance.now();
      const dt = Math.max(1, now - vel.t);
      vel = { x: 0.8 * ((p.x - prev.x) / dt) + 0.2 * vel.x, y: 0.8 * ((p.y - prev.y) / dt) + 0.2 * vel.y, t: now };
      cam.current.x = pan.cx + dx;
      cam.current.y = pan.cy + dy;
      draw();
    };
    const up = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      delete el.dataset.dragging;
      if (pts.size === 1) {
        // Остался один палец после масштаба — продолжаем перетаскивать от него, без рывка.
        pinch = null;
        pan = { sx: 0, sy: 0, cx: 0, cy: 0, moved: true };
        startPan();
        return;
      }
      if (pts.size > 0) return;
      const wasPan = pan?.moved && !pinch;
      pan = null;
      pinch = null;
      // Клик после перетаскивания не считается нажатием на город (сбрасываем после того, как браузер отдаст click).
      setTimeout(() => { dragged.current = false; }, 0);
      if (!wasPan || reduced || performance.now() - vel.t > 80) return;
      let { x: vx, y: vy } = vel;
      let last = performance.now();
      const step = (now: number) => {
        const dt = Math.min(32, now - last);
        last = now;
        cam.current.x += vx * dt;
        cam.current.y += vy * dt;
        const k = Math.pow(0.93, dt / 16);
        vx *= k;
        vy *= k;
        draw();
        inertia.current = Math.hypot(vx, vy) > 0.02 ? requestAnimationFrame(step) : 0;
      };
      inertia.current = requestAnimationFrame(step);
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      stopInertia();
      touched.current = true;
      const r = el.getBoundingClientRect();
      // Трекпад (ctrlKey) даёт мелкие шаги, колесо мыши — крупные: коэффициент от величины прокрутки.
      const f = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015));
      zoomAt(cam.current.s * f, e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, { passive: false });
    // Фокус на кнопке вне окна заставляет браузер прокрутить контейнер с overflow: hidden — камера тогда съезжает.
    // Прокрутку обнуляем: показ города делает reveal() через transform.
    const noScroll = () => { if (el.scrollTop || el.scrollLeft) { el.scrollTop = 0; el.scrollLeft = 0; } };
    el.addEventListener('scroll', noScroll);
    return () => {
      el.removeEventListener('scroll', noScroll);
      stopInertia();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
    };
  }, [animated, draw, minScale, reduced, zoomAt]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.target !== box.current) return;
    touched.current = true;
    const step = 80;
    const c = cam.current;
    const [cx, cy] = windowCenter();
    const k = e.key;
    if (k === 'ArrowLeft') c.x += step;
    else if (k === 'ArrowRight') c.x -= step;
    else if (k === 'ArrowUp') c.y += step;
    else if (k === 'ArrowDown') c.y -= step;
    else if (k === '+' || k === '=') return void (e.preventDefault(), zoomAt(c.s * 1.25, cx, cy, true));
    else if (k === '-' || k === '_') return void (e.preventDefault(), zoomAt(c.s / 1.25, cx, cy, true));
    else if ((k === '0' || k === 'Home') && currentKey) return void (e.preventDefault(), focus(currentKey));
    else return;
    e.preventDefault();
    animated(true);
    draw();
  };

  // ── Путешествие после экзамена: маркер едет от звезды к звезде, камера следует за ним ──
  useEffect(() => {
    const tk = traveler.current;
    if (!travel || !tk) return;
    const a = MAP_SPOTS[travel.from];
    const b = MAP_SPOTS[travel.to];
    if (!a || !b) return;
    const [ax, ay] = mapStarPoint(a);
    const [bx, by] = mapStarPoint(b);
    const put = (x: number, y: number) => {
      tk.style.left = `${x}px`;
      tk.style.top = `${y}px`;
      tk.dataset.at = `${Math.round(x)},${Math.round(y)}`;
    };
    const follow = (x: number, y: number) => {
      const [cx, cy] = windowCenter();
      cam.current.x = cx - x * cam.current.s;
      cam.current.y = cy - y * cam.current.s;
      animated(false);
      draw();
    };
    if (reduced) {
      put(bx, by);
      tk.dataset.arrived = '';
      focus(travel.to, { animate: false });
      return;
    }
    delete tk.dataset.arrived;
    put(ax, ay);
    follow(ax, ay);
    const t0 = performance.now() + 350;
    const dur = 2600;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - t0) / dur));
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      // Лёгкая дуга, чтобы путь не выглядел линейкой.
      const x = ax + (bx - ax) * e;
      const y = ay + (by - ay) * e - Math.sin(Math.PI * e) * Math.min(90, Math.hypot(bx - ax, by - ay) * 0.18);
      put(x, y);
      follow(x, y);
      if (t < 1) raf = requestAnimationFrame(tick);
      else tk.dataset.arrived = '';
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [travel, reduced, animated, draw, focus]);

  const ctrl = 'grid h-11 w-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--bg-elev)_92%,transparent)] text-2xl font-black shadow-[var(--shadow-card)] ring-1 ring-[var(--border)] active:scale-95 disabled:opacity-40';

  return (
    <div
      ref={box}
      className="map-viewport absolute inset-0"
      style={{ backgroundImage: `url(${MAP_LQIP})` }}
      tabIndex={0}
      role="region"
      aria-label={props.ariaLabel}
      aria-describedby="map-hint"
      data-no-swipe
      data-illustrated-map={MAP_ART.id}
      onKeyDown={onKey}
    >
      <span id="map-hint" className="sr-only">{props.ariaHint}</span>
      <div ref={stage} className="map-stage" style={{ width: W, height: H, backgroundImage: `url(${MAP_LQIP})` }}>
        <img src={mapSrc} width={W} height={H} alt="" className="map-art" draggable={false} decoding="async" {...{ fetchpriority: 'high' }} />
        {/* Закопане: на картинке его нет — маркер в том же стиле, что нарисованные таблички. */}
        {Object.entries(MAP_SPOTS).filter(([, s]) => !s.baked).map(([k, s]) => (
          <span key={k} className="map-pill" style={rectStyle(s.pill)} lang="pl" aria-hidden>
            <span className="map-pill-star" style={{ left: mapStarPoint(s)[0] - s.pill[0], top: mapStarPoint(s)[1] - s.pill[1] }} />
            {s.label}
          </span>
        ))}
        {selected && MAP_SPOTS[selected] && <span className="map-selected" style={rectStyle(pad(MAP_SPOTS[selected].pill, 5))} aria-hidden />}
        {currentKey && (
          <span className="map-here" style={{ left: mapStarPoint(MAP_SPOTS[currentKey])[0], top: mapStarPoint(MAP_SPOTS[currentKey])[1] }} data-map-here={currentKey} aria-hidden>
            <span className="map-here-ring" />
            <span className="map-here-pin"><Icon name="pin" size={15} filled /></span>
          </span>
        )}
        {keys.map((k) => {
          const spot = MAP_SPOTS[k];
          const city = spot.city ? byId.get(spot.city) : undefined;
          const state = spotState(spot, city, currentCityId);
          const [x0, y0, x1, y1] = mapHitRect(spot);
          return (
            <button
              key={k}
              type="button"
              className="map-spot"
              style={{ left: x0, top: y0, width: x1 - x0, height: y1 - y0 }}
              data-spot={k}
              data-city={spot.city ?? undefined}
              data-state={state}
              aria-label={props.spotLabel(spot, state, city)}
              aria-pressed={selected === k}
              onClick={() => { if (!dragged.current) onSelect(k); }}
              onFocus={() => reveal(k)}
            >
              {(state === 'locked' || state === 'done') && (
                <span className={cx('map-badge', state === 'done' ? 'map-badge-done' : 'map-badge-locked')} style={{ left: spot.pill[2] - x0 - 4, top: spot.pill[1] - y0 + 2 }} aria-hidden>
                  <Icon name={state === 'done' ? 'check' : 'lock'} size={11} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
        {travel && (
          <div ref={traveler} className="map-traveler" data-map-traveler aria-hidden>
            <Icon name="pin" size={20} filled />
          </div>
        )}
      </div>
      <div className="absolute right-3 z-[2] flex flex-col gap-2" style={{ top: padTop + 10 }} data-map-ctrl>
        <button type="button" className={ctrl} aria-label={props.zoomLabels.in} disabled={zoomState.atMax} onClick={() => { const [cx, cy] = windowCenter(); zoomAt(cam.current.s * 1.3, cx, cy, true); }}>+</button>
        <button type="button" className={ctrl} aria-label={props.zoomLabels.out} disabled={zoomState.atMin} onClick={() => { const [cx, cy] = windowCenter(); zoomAt(cam.current.s / 1.3, cx, cy, true); }}>−</button>
        {currentKey && (
          <button type="button" className={ctrl} aria-label={props.zoomLabels.home} onClick={() => { focus(currentKey); onSelect(currentKey); }} data-map-home>
            <Icon name="pin" size={20} filled className="text-pl-red" />
          </button>
        )}
      </div>
    </div>
  );
});

const rectStyle = ([x0, y0, x1, y1]: readonly number[]) => ({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 });
const pad = ([x0, y0, x1, y1]: readonly number[], p: number) => [x0 - p, y0 - p, x1 + p, y1 + p] as const;

/** Неподвижная карта (знакомство): та же картинка и кольцо на стартовом городе, без жестов и кнопок. */
export function MapPreview({ currentSlug, className }: { currentSlug: string | null; className?: string }) {
  const key = currentSlug ? Object.keys(MAP_SPOTS).find((k) => MAP_SPOTS[k].city === currentSlug) : undefined;
  const star = key ? mapStarPoint(MAP_SPOTS[key]) : null;
  return (
    <div className={cx('relative w-full overflow-hidden', className)} style={{ aspectRatio: `${W} / ${H}`, backgroundImage: `url(${MAP_LQIP})`, backgroundSize: 'cover' }} data-map-preview>
      <img src={mapSrc} alt="" width={W} height={H} className="absolute inset-0 h-full w-full" draggable={false} decoding="async" />
      {star && (
        <span className="map-here map-here-static" style={{ left: `${(star[0] / W) * 100}%`, top: `${(star[1] / H) * 100}%` }} aria-hidden>
          <span className="map-here-ring" />
        </span>
      )}
    </div>
  );
}
