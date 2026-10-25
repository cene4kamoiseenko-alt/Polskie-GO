/** Ігрові компоненти дизайн-системи: модалка нагороди, бейджі XP/Złotki. */
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from '../lib/motion';
import { useEffect } from 'react';
import { useT } from '../i18n';
import { Beaver } from './Beaver';
import { GameIcon } from './GameIcon';
import { Badge } from './Illustrations';
import { Confetti } from './ui';

/** Число, що «набігає» від 0 до value. */
function CountUp({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.9, ease: 'easeOut', delay: 0.35 });
    return () => c.stop();
  }, [mv, value]);
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
  return (
    <AnimatePresence>
      {reward && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-6" role="dialog" aria-modal>
          <Confetti run />
          <motion.div className="absolute inset-0 bg-ink/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="relative w-full max-w-sm overflow-hidden rounded-[28px] bg-elev text-center shadow-2xl"
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 16 }}
          >
            <div className="relative h-48 overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 60%, #FFE59A 0%, #FFBD42 45%, #F59E2E 100%)' }}>
              <motion.svg viewBox="-100 -100 200 200" className="absolute left-1/2 top-[60%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 24, ease: 'linear' }} aria-hidden>
                {Array.from({ length: 12 }).map((_, i) => (
                  <path key={i} d="M0 0 L-9 -100 L9 -100 Z" fill="#fff" opacity={0.22} transform={`rotate(${i * 30})`} />
                ))}
              </motion.svg>
              <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2" initial={{ y: 60 }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 12, delay: 0.1 }}>
                <Beaver mood="gift" size={170} />
              </motion.div>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <div className="text-sm font-black uppercase tracking-wide text-xp-dark">{t('reward_title')}</div>
                <div className="text-xl font-black leading-tight">{reward.title}</div>
              </div>
              <div className="flex justify-center gap-3">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25, type: 'spring' }} className="flex items-center gap-2 rounded-2xl bg-xp/20 px-4 py-2 text-2xl font-black text-xp-dark">
                  <GameIcon name="xp" size={34} /> +<CountUp value={reward.xp} />
                </motion.div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring' }} className="flex items-center gap-2 rounded-2xl bg-xp/20 px-4 py-2 text-2xl font-black text-xp">
                  <GameIcon name="coin" size={34} /> +<CountUp value={reward.zlotki} />
                </motion.div>
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
