/** Ігрові компоненти дизайн-системи: модалка нагороди, бейджі XP/Złotki. */
import { AnimatePresence, animate, motion, useMotionValue, useTransform, useReducedMotion } from '../lib/motion';
import { useCallback, useEffect, useRef } from 'react';
import { useT } from '../i18n';
import { Beaver } from './Beaver';
import { GameIcon } from './GameIcon';
import { Badge } from './Illustrations';
import { Confetti, useBackButton } from './ui';

/** Число, що «набігає» від 0 до value. */
function CountUp({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    if (reduced) { mv.set(value); return; }
    const c = animate(mv, value, { duration: 0.9, ease: 'easeOut', delay: 0.35 });
    return () => c.stop();
  }, [mv, value, reduced]);
  if (reduced) return <span>{value}</span>;
  return <motion.span>{text}</motion.span>;
}

export function XPBadge({ xp, zlotki, size = 'md' }: { xp?: number; zlotki?: number; size?: 'sm' | 'md' }) {
  const icon = size === 'sm' ? 18 : 24;
  return (
    <div className="flex items-center gap-1.5 font-black">
      {xp != null && (
        <span className="flex items-center gap-0.5 text-xp-dark">
          <GameIcon name="xp" size={icon} /> +{xp}
        </span>
      )}
      {zlotki != null && (
        <span className="flex items-center gap-0.5 text-xp">
          <GameIcon name="coin" size={icon} /> +{zlotki}
        </span>
      )}
    </div>
  );
}

export type Reward = { title: string; xp: number; zlotki: number; extra?: { icon: string; text: string }[] };

/**
 * Модалка отримання нагороди: промені, Бобек із подарунком, лічильники XP/Złotki.
 * Показує лише ті значення, які повернув сервер.
 */
export function RewardModal({ reward, onClose }: { reward: Reward | null; onClose: () => void }) {
  const { t } = useT();
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const close = useCallback(() => closeRef.current(), []);
  const open = !!reward;
  useBackButton(open ? close : null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      if (event.key === 'Tab') {
        const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
        const first = buttons?.[0], last = buttons?.[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', key);
      if (previous?.isConnected) previous.focus();
    };
  }, [open, close]);
  return (
    <AnimatePresence>
      {reward && (
        <div ref={dialog} className="fixed inset-0 z-[60] grid place-items-center p-6" role="dialog" aria-modal="true" aria-label={reward.title} data-reward-modal>
          <Confetti run />
          <motion.div className="absolute inset-0 bg-ink/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="relative w-full max-w-sm overflow-hidden rounded-[28px] bg-elev text-center shadow-2xl"
            initial={reduced ? false : { scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={reduced ? undefined : { scale: 0.98, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', damping: 24, stiffness: 280 }}
          >
            <div className="relative h-48 overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 60%, #FFE59A 0%, #FFBD42 45%, #F59E2E 100%)' }}>
              <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2" initial={reduced ? false : { y: 16 }} animate={{ y: 0 }} transition={reduced ? { duration: 0 } : { type: 'spring', damping: 24, delay: 0.08 }}>
                <Beaver mood="gift" size={170} />
              </motion.div>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <div className="text-sm font-black uppercase tracking-wide text-xp-dark">{t('reward_title')}</div>
                <div className="text-xl font-black leading-tight">{reward.title}</div>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {reward.xp > 0 && <motion.div initial={reduced ? false : { scale: .9 }} animate={{ scale: 1 }} transition={{ delay: reduced ? 0 : .15, type: 'spring' }} className="flex items-center gap-2 rounded-2xl bg-xp/20 px-4 py-2 text-2xl font-black text-xp-dark" data-reward-xp>
                  <GameIcon name="xp" size={34} /> +<CountUp value={reward.xp} />
                </motion.div>}
                {reward.zlotki > 0 && <motion.div initial={reduced ? false : { scale: .9 }} animate={{ scale: 1 }} transition={{ delay: reduced ? 0 : .2, type: 'spring' }} className="flex items-center gap-2 rounded-2xl bg-xp/20 px-4 py-2 text-2xl font-black text-xp" data-reward-zlotki>
                  <GameIcon name="coin" size={34} /> +<CountUp value={reward.zlotki} />
                </motion.div>}
              </div>
              {reward.extra?.map((e) => (
                <div key={e.text} className="flex items-center justify-center gap-2 rounded-2xl bg-muted px-3 py-2 text-sm font-black">
                  <Badge icon={e.icon} unlocked size={28} /> {e.text}
                </div>
              ))}
              <button className="btn btn-primary w-full text-lg" onClick={onClose} autoFocus>
                {t('reward_ok')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
