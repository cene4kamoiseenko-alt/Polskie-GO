/**
 * Ігрові ефекти: частинки XP до лічильника, число, що «набігає», картка нового досягнення.
 * Усі ефекти короткі, не блокують наступну дію й вимикаються при reduced motion.
 */
import { AnimatePresence, animate, motion, useReducedMotion } from '../lib/motion';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useT } from '../i18n';
import { haptic } from '../lib/telegram';
import { sfx } from '../lib/audio';
import { Badge } from './Illustrations';

/** Число, що плавно зростає від 0 (або від `from`) до `to`. */
export function CountUp({ to, from = 0, duration = 0.9, delay = 0, className }: { to: number; from?: number; duration?: number; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  const [v, setV] = useState(reduced ? to : from);
  useEffect(() => {
    if (reduced) return setV(to);
    const c = animate(from, to, { duration, delay, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [to, from, duration, delay, reduced]);
  return <span className={className}>{v}</span>;
}

/** Частинки, що летять від точки до лічильника (target). Після прильоту лічильник коротко «підстрибує». */
export function XpBurst({ from, target, count = 10, color = '#FFBD42', run, onArrive }: { from: RefObject<HTMLElement | null>; target: RefObject<HTMLElement | null>; count?: number; color?: string; run: boolean; onArrive?: () => void }) {
  const reduced = useReducedMotion();
  const [geo, setGeo] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  useLayoutEffect(() => {
    if (!run || reduced || !from.current || !target.current) return;
    const a = from.current.getBoundingClientRect();
    const b = target.current.getBoundingClientRect();
    setGeo({ x0: a.left + a.width / 2, y0: a.top + a.height / 2, x1: b.left + b.width / 2, y1: b.top + b.height / 2 });
  }, [run, reduced, from, target]);
  useEffect(() => {
    if (!run) return;
    if (reduced) return void onArrive?.();
    const tm = setTimeout(() => onArrive?.(), 750);
    return () => clearTimeout(tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, reduced]);
  if (!geo || reduced) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[80]" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const spread = ((i % 5) - 2) * 26;
        const lift = -40 - (i % 3) * 22;
        return (
          <motion.span
            key={i}
            className="absolute h-3.5 w-3.5 rounded-full"
            style={{ left: geo.x0 - 7, top: geo.y0 - 7, background: color, boxShadow: '0 0 0 2px #fff, 0 2px 6px rgb(0 0 0 / 0.2)' }}
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
            animate={{ x: [0, spread, geo.x1 - geo.x0], y: [0, lift, geo.y1 - geo.y0], scale: [0.4, 1, 0.5], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.7, delay: i * 0.035, ease: [0.45, 0, 0.35, 1], times: [0, 0.35, 1] }}
          />
        );
      })}
    </div>
  );
}

/** Лічильник, що «підстрибує», коли змінюється ключ pulse. */
export function Pulse({ pulse, children, className }: { pulse: number; children: React.ReactNode; className?: string }) {
  return (
    <motion.span key={pulse} className={className} initial={{ scale: pulse ? 1.25 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
      {children}
    </motion.span>
  );
}

export type NewAchievement = { slug: string; title: never; description: never; icon: string; zlotki: number };

/** Черга карток нових досягнень: по одній, з унікальним значком; закривається дотиком. */
export function AchievementQueue({ items, onDone }: { items: NewAchievement[]; onDone?: () => void }) {
  const { t, tr } = useT();
  const [i, setI] = useState(0);
  const cur = items[i];
  const shown = useRef(-1);
  useEffect(() => {
    if (cur && shown.current !== i) {
      shown.current = i;
      haptic.success();
      sfx.coin();
    }
  }, [cur, i]);
  useEffect(() => {
    if (items.length && i >= items.length) onDone?.();
  }, [i, items.length, onDone]);
  return (
    <AnimatePresence>
      {cur && (
        <motion.div key={cur.slug} className="fixed inset-0 z-[75] grid place-items-center bg-black/45 px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setI((x) => x + 1)} role="dialog" aria-label={t('ach_new_title')}>
          <motion.div
            className="card w-full max-w-xs p-6 text-center"
            initial={{ scale: 0.6, y: 40, rotate: -4 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          >
            <div className="text-xs font-black uppercase tracking-widest text-xp-dark">{t('ach_new_title')}</div>
            <motion.div className="mx-auto my-3 w-fit" initial={{ rotate: -20, scale: 0.5 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.1 }}>
              <Badge icon={cur.icon} unlocked size={112} />
            </motion.div>
            <div className="text-xl font-black leading-tight">{tr(cur.title)}</div>
            <p className="muted mt-1 text-sm font-semibold">{tr(cur.description)}</p>
            {cur.zlotki > 0 && <div className="mt-2 font-black text-xp">+{cur.zlotki} Złotki</div>}
            <div className="muted mt-3 text-xs font-bold">{t('tap_to_continue')}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
