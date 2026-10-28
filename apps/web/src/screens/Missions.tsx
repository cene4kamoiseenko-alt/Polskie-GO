/** «Польська в житті»: список місій-історій з реальних ситуацій у Польщі. */
import { useQuery } from '@tanstack/react-query';
import { motion } from '../lib/motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, type TKey } from '../i18n';
import { haptic } from '../lib/telegram';
import { ErrorState, ScreenHeader, ScreenSkeleton, cx } from '../components/ui';
import { Icon } from '../components/Icon';
import { MissionCard, missionHref, missionsQuery } from '../components/MissionCard';
import { Scene } from '../components/Illustrations';

const CATS: { id: string; key: TKey }[] = [
  { id: 'all', key: 'life_cat_all' },
  { id: 'shop', key: 'life_cat_shop' },
  { id: 'food', key: 'life_cat_food' },
  { id: 'road', key: 'life_cat_road' },
  { id: 'transport', key: 'life_cat_transport' },
  { id: 'home', key: 'life_cat_home' },
  { id: 'work', key: 'life_cat_work' },
];

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
        {list.map((m) => <MissionCard key={m.slug} m={m} onOpen={() => nav(missionHref(m))} />)}
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
