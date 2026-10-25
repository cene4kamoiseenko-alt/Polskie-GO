/** Галерея досягнень: унікальні значки, точні умови, прогрес і дата отримання. */
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { haptic } from '../lib/telegram';
import { ErrorState, Progress, ScreenHeader, ScreenSkeleton, Sheet, cx } from '../components/ui';
import { Badge, achTier, type Tier } from '../components/Illustrations';
import { Icon } from '../components/Icon';

type Ach = { slug: string; title: never; description: never; icon: string; metric: string; threshold: number; progress: number; unlockedAt: string | null; isNew: boolean; zlotki: number };

const LIFE = /^(MISSION|MISSIONS_TAG|FLAWLESS_TAG|STEPS_TAG|DISHES|PIEROGI|DIALOGS)/;
const TRAVEL = /^(SECTIONS|CITIES|STORY_QUESTS)/;
const groupOf = (a: Ach): 'life' | 'travel' | 'learning' => (LIFE.test(a.metric) ? 'life' : TRAVEL.test(a.metric) ? 'travel' : 'learning');
const GROUPS: { id: 'life' | 'learning' | 'travel'; key: TKey }[] = [
  { id: 'life', key: 'ach_group_life' },
  { id: 'learning', key: 'ach_group_learning' },
  { id: 'travel', key: 'ach_group_travel' },
];

const TIER_STYLE: Record<Tier, [string, string]> = {
  bronze: ['#C06A33', '#F6C29A'],
  silver: ['#7D8DA3', '#F4F8FC'],
  gold: ['#E39A14', '#FFE38A'],
  legendary: ['#7A4CF0', '#E3D3FF'],
};

function TierChip({ tier }: { tier: Tier }) {
  const { t } = useT();
  const [bg, fg] = TIER_STYLE[tier];
  return <span className="rounded-full px-1.5 py-px text-[9.5px] font-black uppercase tracking-wide" style={{ background: `${bg}33`, color: fg, border: `1px solid ${bg}88` }}>{t(`tier_${tier}` as TKey)}</span>;
}

export default function AchievementsScreen() {
  const { t, tr, date } = useT();
  const q = useQuery({ queryKey: ['achievements'], queryFn: () => api<Ach[]>('/achievements') });
  const [open, setOpen] = useState<Ach | null>(null);
  if (q.isLoading) return <ScreenSkeleton />;
  if (q.error) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const list = q.data!;
  return (
    <div className="pb-8">
      <ScreenHeader title={t('achievements_title')} subtitle={t('achievements_unlocked', { n: list.filter((a) => a.unlockedAt).length, total: list.length })} />
      {GROUPS.map((g) => {
        const items = list.filter((a) => groupOf(a) === g.id).sort((a, b) => Number(!!b.unlockedAt) - Number(!!a.unlockedAt));
        if (!items.length) return null;
        return (
          <section key={g.id} className="mt-3 px-4">
            <h2 className="mb-2 flex items-baseline justify-between text-lg font-black">
              {t(g.key)} <span className="muted text-sm font-bold">{items.filter((a) => a.unlockedAt).length}/{items.length}</span>
            </h2>
            <div className="grid grid-cols-3 gap-2.5">
              {items.map((a, i) => (
                <motion.button
                  key={a.slug}
                  className={cx('card relative flex flex-col items-center gap-1 px-1.5 pb-2.5 pt-3 text-center', a.isNew && 'ring-2 ring-xp')}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 9) * 0.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { haptic.tap(); setOpen(a); }}
                >
                  <Badge icon={a.icon} unlocked={!!a.unlockedAt} size={64} tier={achTier(a.zlotki)} />
                  <TierChip tier={achTier(a.zlotki)} />
                  <div className="line-clamp-2 text-[13px] font-black leading-tight">{tr(a.title)}</div>
                  {/* умова — коротко на самій картці, повністю у деталях */}
                  <div className="muted line-clamp-3 min-h-[2.4em] px-0.5 text-[10.5px] font-bold leading-tight">{tr(a.description)}</div>
                  {a.unlockedAt ? (
                    <div className="text-[11px] font-black text-brand-dark">{date(a.unlockedAt)}</div>
                  ) : (
                    <div className="w-full px-1">
                      <Progress value={a.progress} max={a.threshold} height={6} />
                      <div className="muted mt-0.5 text-[11px] font-black">{a.progress}/{a.threshold}</div>
                    </div>
                  )}
                  {a.isNew && <span className="absolute right-1.5 top-1.5 rounded-full bg-xp px-1.5 text-[10px] font-black text-xp-ink">{t('new')}</span>}
                </motion.button>
              ))}
            </div>
          </section>
        );
      })}
      <Sheet open={!!open} onClose={() => setOpen(null)}>
        {open && (
          <div className="flex flex-col items-center pb-4 text-center">
            <Badge icon={open.icon} unlocked={!!open.unlockedAt} size={120} tier={achTier(open.zlotki)} />
            <div className="mt-1"><TierChip tier={achTier(open.zlotki)} /></div>
            <h2 className="mt-2 text-2xl font-black leading-tight">{tr(open.title)}</h2>
            <div className="card mt-4 w-full p-4 text-left">
              <div className="muted text-xs font-black uppercase tracking-wide">{t('ach_condition')}</div>
              <p className="mt-0.5 font-bold leading-snug">{tr(open.description)}</p>
              <div className="muted mt-3 text-xs font-black uppercase tracking-wide">{t('ach_progress')}</div>
              {open.unlockedAt ? (
                <p className="mt-0.5 flex items-center gap-1.5 font-black text-brand-dark"><Icon name="check" size={18} strokeWidth={3} /> {t('ach_received', { date: date(open.unlockedAt) })}</p>
              ) : (
                <div className="mt-1">
                  <Progress value={open.progress} max={open.threshold} height={10} />
                  <div className="mt-1 text-sm font-black">{open.progress} / {open.threshold}</div>
                </div>
              )}
              {open.zlotki > 0 && (
                <>
                  <div className="muted mt-3 text-xs font-black uppercase tracking-wide">{t('ach_reward')}</div>
                  <p className="mt-0.5 font-black text-xp">+{open.zlotki} Złotki</p>
                </>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
