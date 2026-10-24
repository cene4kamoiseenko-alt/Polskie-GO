/** «Польська в житті»: список місій-історій з реальних ситуацій у Польщі. */
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { haptic } from '../lib/telegram';
import type { I18n } from '@polski-go/shared';
import type { MissionListItem } from '../lib/types';
import { ErrorState, ScreenHeader, ScreenSkeleton, cx } from '../components/ui';
import { Icon } from '../components/Icon';
import { Scene } from '../components/Illustrations';

type Data = { missions: MissionListItem[]; soon: { slug: string; category: string; scene: string; title: I18n }[] };

const CATS: { id: string; key: TKey }[] = [
  { id: 'all', key: 'life_cat_all' },
  { id: 'shop', key: 'life_cat_shop' },
  { id: 'food', key: 'life_cat_food' },
  { id: 'road', key: 'life_cat_road' },
  { id: 'transport', key: 'life_cat_transport' },
  { id: 'home', key: 'life_cat_home' },
];

export const missionsQuery = { queryKey: ['missions'], queryFn: () => api<Data>('/missions') };

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

export default function MissionsScreen() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const [cat, setCat] = useState('all');
  const q = useQuery(missionsQuery);
  if (q.isLoading) return <ScreenSkeleton />;
  if (q.error) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const { missions, soon } = q.data!;
  const list = missions.filter((m) => cat === 'all' || m.category === cat);
  const done = missions.filter((m) => m.completions > 0).length;
  return (
    <div className="pb-6">
      <ScreenHeader title={t('life_title')} subtitle={t('life_progress', { n: done, total: missions.length })} />
      <p className="muted px-4 text-sm font-semibold">{t('life_subtitle')}</p>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATS.map((c) => (
          <button key={c.id} onClick={() => { haptic.select(); setCat(c.id); }} className={cx('chip shrink-0 !py-1.5 transition-colors', cat === c.id && '!bg-ink text-white')} aria-pressed={cat === c.id}>
            {t(c.key)}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-3 px-4">
        {list.map((m) => <MissionCard key={m.slug} m={m} onOpen={() => nav(`/life/${m.slug}`)} />)}
      </div>
      {cat === 'all' && soon.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="mb-2 text-lg font-black">{t('life_soon')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {soon.map((s) => (
              <div key={s.slug} className="card overflow-hidden" aria-disabled>
                <Scene name={s.scene} className="block h-20 w-full" dim />
                <div className="flex items-center gap-1.5 p-2.5 text-sm font-black leading-tight">
                  <Icon name="lock" size={16} className="shrink-0 opacity-60" /> <span className="opacity-70">{tr(s.title)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <p className="muted mx-4 mt-6 rounded-2xl bg-muted p-3 text-xs font-semibold leading-snug">{t('life_disclaimer')}</p>
    </div>
  );
}
