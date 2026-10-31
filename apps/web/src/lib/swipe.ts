import { useEffect, useRef, useState } from 'react';

/**
 * Свайпи (2026-10-31, запит власника «додай свайпи там, де доречно»). Лише сенсорні жести: на комп'ютері лишаються кнопки.
 * Смуга біля лівого краю належить «Назад» (EdgeSwipeBack у components/ui), тому вкладки й каруселі з неї не стартують.
 */
export const EDGE_ZONE = 28;

/** Жест належить вкладеному елементу: поле вводу, повзунок, горизонтальна прокрутка (ряд чипів) або інша зона свайпу. */
function blocked(target: EventTarget | null, zone: HTMLElement): boolean {
  for (let n = target instanceof Element ? target : null; n && n !== zone; n = n.parentElement) {
    if (n.matches('input, textarea, select, [contenteditable="true"], [data-no-swipe], [data-swipe-zone]')) return true;
    if (n.scrollWidth > n.clientWidth + 1) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === 'auto' || ox === 'scroll') return true;
    }
  }
  return false;
}

type Handlers = { onLeft?: () => void; onRight?: () => void };

/**
 * Горизонтальний свайп по зоні. Напрям фіксується після 10 px руху: якщо палець іде вертикально, це прокрутка, і свайп
 * не спрацює. Спрацьовує від 56 px або від швидкого руху (32 px за чверть секунди).
 * Повертає callback-ref: зона може з'явитися лише після завантаження даних.
 */
export function useSwipe(handlers: Handlers, min = 56) {
  const latest = useRef(handlers);
  latest.current = handlers;
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!el) return;
    el.setAttribute('data-swipe-zone', '');
    let g: { x: number; y: number; t: number; axis: 'x' | 'y' | null } | null = null;
    const start = (e: TouchEvent) => {
      g = null;
      if (e.touches.length !== 1) return;
      const p = e.touches[0];
      if (p.clientX <= EDGE_ZONE || blocked(e.target, el)) return;
      g = { x: p.clientX, y: p.clientY, t: e.timeStamp, axis: null };
    };
    const move = (e: TouchEvent) => {
      if (!g || g.axis) return;
      const p = e.touches[0];
      const dx = p.clientX - g.x;
      const dy = p.clientY - g.y;
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      g.axis = Math.abs(dx) > Math.abs(dy) * 1.5 ? 'x' : 'y';
    };
    const end = (e: TouchEvent) => {
      const s = g;
      g = null;
      if (!s || s.axis !== 'x') return;
      const p = e.changedTouches[0];
      const dx = p.clientX - s.x;
      const dy = p.clientY - s.y;
      if (Math.abs(dy) > Math.abs(dx)) return;
      const quick = Math.abs(dx) >= 32 && e.timeStamp - s.t < 250;
      if (Math.abs(dx) < min && !quick) return;
      (dx < 0 ? latest.current.onLeft : latest.current.onRight)?.();
    };
    const cancel = () => {
      g = null;
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: true });
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', cancel);
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
      el.removeEventListener('touchcancel', cancel);
      el.removeAttribute('data-swipe-zone');
    };
  }, [el, min]);
  return setEl;
}

/**
 * Вкладки, що перемикаються свайпом: вліво — наступна, вправо — попередня (по краях — нічого).
 * `enter` — клас короткої появи вмісту з боку, куди перейшли (і для свайпу, і для натискання на вкладку);
 * вміст вкладки варто рендерити з key={вкладка}, щоб анімація запускалась щоразу.
 */
export function useTabSwipe<K extends string>(keys: readonly K[], current: K, select: (k: K) => void) {
  const prev = useRef(current);
  const dir = useRef(0);
  if (prev.current !== current) {
    dir.current = Math.sign(keys.indexOf(current) - keys.indexOf(prev.current));
    prev.current = current;
  }
  const step = (d: number) => {
    const next = keys[keys.indexOf(current) + d];
    if (next) select(next);
  };
  const ref = useSwipe({ onLeft: () => step(1), onRight: () => step(-1) });
  return { ref, enter: dir.current > 0 ? 'tab-enter-next' : dir.current < 0 ? 'tab-enter-prev' : '' };
}
