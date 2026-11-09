/**
 * «Потянуть вниз — обновить» (владелец 2026-11-09: «нужно, чтобы приложение было удобнее: свайпы, копирования, потрясающий функционал»).
 * В Android-приложении и в браузере кнопки «перезагрузить» нет, а системное обновление у нас выключено (overscroll-behavior: none, disableVerticalSwipes
 * в Telegram), поэтому данные обновлялись только перезапуском. Жест — как EdgeSwipeBack: слушает окно, кружок рисуется прямо в DOM без перерисовок React.
 * Грузится лениво после старта (бюджет JS холодного старта, scripts/perf.ts).
 */
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Icon } from './Icon';
import { EDGE_ZONE } from '../lib/swipe';
import { haptic } from '../lib/telegram';

/**
 * Экраны со списками и сводками, где обновление безопасно. Урок, практика, сюжет, миссия, карта, примерочная, домик и настройки не входят:
 * там локальное состояние (ответы, примерка) или собственные жесты, а повторная загрузка посреди задания сбила бы прохождение.
 */
export const REFRESH_ROUTES = ['/', '/learn', '/quests', '/social', '/life', '/profile', '/achievements', '/dictionary', '/exams', '/grammar', '/pass', '/passport', '/diary', '/slang', '/premium'];

/** Сколько нужно протянуть (после «сопротивления» ×0,5), чтобы отпускание обновило страницу. */
export const PULL_TRIGGER = 64;
const PULL_MAX = 88;
/** Не чаще одного настоящего запроса за это время: частые жесты не должны упираться в лимиты сервера (кружок всё равно крутится). */
const COOLDOWN_MS = 4000;
const MIN_SPIN_MS = 700;

type Phase = 'idle' | 'pull' | 'armed' | 'busy';

const scrollTop = () => window.scrollY || document.documentElement.scrollTop || 0;

/** Жест принадлежит вложенному элементу: поле ввода, шторка, карта или прокручиваемый внутри блок, который сейчас не в начале. */
function blocked(target: EventTarget | null): boolean {
  for (let n = target instanceof Element ? target : null; n; n = n.parentElement) {
    if (n.matches('input, textarea, select, [contenteditable="true"], [data-no-swipe], [data-no-ptr]')) return true;
    if (n.scrollTop > 0) {
      const oy = getComputedStyle(n).overflowY;
      if (oy === 'auto' || oy === 'scroll') return true;
    }
  }
  return false;
}

export function PullToRefresh() {
  const qc = useQueryClient();
  const { pathname } = useLocation();
  const enabled = REFRESH_ROUTES.includes(pathname);
  const bubble = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const last = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    let g: { x: number; y: number; live: boolean; armed: boolean } | null = null;
    const paint = (pull: number, phase: Phase) => {
      const el = bubble.current;
      if (!el) return;
      el.style.opacity = phase === 'idle' ? '0' : String(Math.min(1, pull / (PULL_TRIGGER * 0.6)));
      el.style.transform = `translate(-50%, ${Math.round(pull - 20)}px)`;
      const icon = el.firstElementChild as HTMLElement | null;
      if (icon) icon.style.transform = phase === 'busy' ? '' : `rotate(${Math.round(pull * 4)}deg)`;
      el.setAttribute('data-ptr', phase);
    };
    const reset = () => {
      g = null;
      if (!busy.current) paint(0, 'idle');
    };
    const refresh = async () => {
      busy.current = true;
      paint(PULL_TRIGGER * 0.85, 'busy');
      haptic.tap();
      const started = Date.now();
      if (started - last.current >= COOLDOWN_MS) {
        last.current = started;
        // Все активные запросы экрана обновятся, остальные станут «устаревшими» и подгрузятся при открытии.
        await qc.invalidateQueries().catch(() => undefined);
      }
      const left = MIN_SPIN_MS - (Date.now() - started);
      if (left > 0) await new Promise((r) => setTimeout(r, left));
      busy.current = false;
      paint(0, 'idle');
    };
    const start = (e: TouchEvent) => {
      g = null;
      if (busy.current || e.touches.length !== 1) return;
      const p = e.touches[0];
      if (p.clientX <= EDGE_ZONE || scrollTop() > 0 || document.querySelector('[data-modal], [data-sheet]') || blocked(e.target)) return;
      g = { x: p.clientX, y: p.clientY, live: false, armed: false };
    };
    const move = (e: TouchEvent) => {
      if (!g) return;
      const p = e.touches[0];
      const dx = p.clientX - g.x;
      const dy = p.clientY - g.y;
      if (!g.live) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        // только вниз и преимущественно вертикально: вверх — обычная прокрутка, вбок — свайп вкладок
        if (dy <= 0 || dy < Math.abs(dx) * 1.5) {
          g = null;
          return;
        }
        g.live = true;
      }
      if (scrollTop() > 0) return reset();
      const pull = Math.min(PULL_MAX, Math.max(0, dy) * 0.5);
      const armed = pull >= PULL_TRIGGER;
      if (armed !== g.armed) {
        g.armed = armed;
        if (armed) haptic.select();
      }
      paint(pull, armed ? 'armed' : 'pull');
    };
    const end = () => {
      const fire = g?.armed;
      g = null;
      if (fire) void refresh();
      else reset();
    };
    window.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', end);
    window.addEventListener('touchcancel', reset);
    return () => {
      window.removeEventListener('touchstart', start);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
      window.removeEventListener('touchcancel', reset);
      if (!busy.current) paint(0, 'idle');
    };
  }, [enabled, qc]);

  return (
    <div ref={bubble} aria-hidden className="ptr" data-ptr="idle">
      <Icon name="refresh" size={22} strokeWidth={2.6} />
    </div>
  );
}

export default PullToRefresh;
