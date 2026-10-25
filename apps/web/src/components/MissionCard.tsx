/** Картка місії «Польська в житті» і спільний запит списку (головна + екран місій; екран місій вантажиться ліниво). */
import { motion } from 'framer-motion';
import type { I18n } from '@polski-go/shared';
import { useT } from '../i18n';
import { api } from '../lib/api';
import { haptic } from '../lib/telegram';
import type { MissionListItem } from '../lib/types';
import { cx } from './ui';
import { Icon } from './Icon';
import { Scene } from './Illustrations';

export type MissionsData = { missions: MissionListItem[]; soon: { slug: string; category: string; scene: string; title: I18n }[] };

export const missionsQuery = { queryKey: ['missions'], queryFn: () => api<MissionsData>('/missions') };

export function MissionCard({ m, onOpen, compact }: { m: MissionListItem; onOpen: () => void; compact?: boolean }) {
  const { t, tr } = useT();
  const done = m.completions > 0;
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={() => { haptic.tap(); onOpen(); }} className="card block w-full overflow-hidden text-left">
      <div className="relative">
        <Scene name={m.scene} className={cx('block w-full', compact ? 'h-24' : 'h-32')} />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="chip !px-2.5 !py-0.5 text-xs"><Icon name="clock" size={14} /> {t('life_minutes', { n: m.minutes })}</span>
          <span className="chip !px-2.5 !py-0.5 text-xs text-xp-dark"><Icon name="star" size={14} /> +{m.xp} XP</span>
        </div>
        {done && (
          <span className={cx('absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black text-white', m.flawless ? 'bg-xp-dark' : 'bg-brand-dark')}>
            <Icon name={m.flawless ? 'star' : 'check'} size={14} /> {t(m.flawless ? 'life_flawless' : 'life_done')}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 p-3.5">
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-black leading-tight">{tr(m.title)}</div>
          {!compact && <div className="muted mt-0.5 line-clamp-2 text-sm font-semibold">{tr(m.goal)}</div>}
          {m.inProgress !== null && <div className="mt-1 text-xs font-black text-sky-dark">{t('life_continue', { n: m.inProgress + 1, total: m.steps })}</div>}
        </div>
        <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-full text-white', done ? 'bg-brand' : 'bg-pl-red')}>
          <Icon name={done ? 'refresh' : 'play'} size={18} />
        </span>
      </div>
    </motion.button>
  );
}

