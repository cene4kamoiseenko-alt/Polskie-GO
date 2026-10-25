import { motion } from 'framer-motion';
import { Scene } from '../components/Illustrations';
import { Icon } from '../components/Icon';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { api } from '../lib/api';
import { useQuests, useRefreshAll } from '../lib/queries';
import type { Quest } from '../lib/types';
import { sfx } from '../lib/audio';
import { haptic } from '../lib/telegram';
import { Beaver } from '../components/Beaver';
import { GameIcon, type IconName } from '../components/GameIcon';
import { RewardModal, XPBadge, type Reward } from '../components/game';
import { Skyline } from '../components/Scenery';
import { EmptyState, ErrorState, Progress, ScreenSkeleton, cx, useToast } from '../components/ui';
import { TopStats } from './Home';

function useCountdown(to?: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(i);
  }, []);
  if (!to) return '';
  const ms = Math.max(0, new Date(to).getTime() - now);
  return `${Math.floor(ms / 3600_000)}h ${Math.floor((ms % 3600_000) / 60_000)}m`;
}

/** Іконка квесту за його метрикою (закодованою в slug). */
function questIcon(slug: string): IconName {
  if (slug.includes('lesson')) return 'lessons';
  if (slug.includes('xp')) return 'xp';
  if (slug.includes('word')) return 'dictionary';
  if (slug.includes('perfect')) return 'star';
  if (slug.includes('review')) return 'review';
  if (slug.includes('dialogue')) return 'ai';
  if (slug.includes('listening')) return 'mic';
  if (slug.includes('city')) return 'map';
  return 'quests';
}

/** Картка квесту: іконка, прогрес, нагорода або кнопка «Забрати». */
export function QuestCard({ q, onClaim, busy }: { q: Quest; onClaim: (q: Quest) => void; busy: boolean }) {
  const { t, tr } = useT();
  const done = q.status === 'COMPLETED';
  const claimed = q.status === 'CLAIMED';
  return (
    <div className={cx('card flex items-center gap-3 p-3', done && 'ring-2 ring-xp', claimed && 'opacity-60')}>
      <GameIcon name={claimed ? 'check' : questIcon(q.slug)} size={50} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-black">{tr(q.title)}</div>
        <div className="muted truncate text-xs font-bold">{tr(q.description)}</div>
        <div className="mt-1.5 flex items-center gap-2">
          <Progress value={q.progress} max={q.target} height={9} color={done || claimed ? 'var(--color-xp)' : 'var(--color-brand)'} />
          <span className="text-xs font-black">{Math.min(q.progress, q.target)}/{q.target}</span>
        </div>
      </div>
      {done ? (
        <motion.button whileTap={{ scale: 0.9 }} animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} disabled={busy} className="btn btn-xp min-h-0 px-3 py-2 text-sm" onClick={() => onClaim(q)}>
          {t('quests_claim')}
        </motion.button>
      ) : claimed ? (
        <span className="text-xs font-black text-brand-dark">{t('quests_claimed')}</span>
      ) : (
        <div className="flex flex-col items-end gap-0.5 text-xs">
          <XPBadge xp={q.xp} size="sm" />
          <XPBadge zlotki={q.zlotki} size="sm" />
        </div>
      )}
    </div>
  );
}

type Tab = 'daily' | 'weekly' | 'special';

export default function QuestsScreen() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const quests = useQuests();
  const refresh = useRefreshAll();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>('daily');
  const [reward, setReward] = useState<Reward | null>(null);
  const countdown = useCountdown(quests.data?.resetsAt);

  const claim = async (q: Quest) => {
    if (!q.id) return;
    setBusy(true);
    try {
      const r = await api<{ xp: number; zlotki: number; achievements: { title: never; icon: string }[] }>(`/quests/${q.id}/claim`, { body: {} });
      sfx.coin();
      haptic.success();
      setReward({
        title: tr(q.title),
        xp: r.xp,
        zlotki: r.zlotki,
        extra: r.achievements.map((a) => ({ icon: a.icon, text: t('toast_achievement', { name: tr(a.title) }) })),
      });
      await refresh();
    } catch (e) {
      toast(t('toast_error', { msg: (e as Error).message }), '⚠️');
    } finally {
      setBusy(false);
    }
  };

  if (quests.isLoading) return <ScreenSkeleton />;
  if (quests.error) return <ErrorState error={quests.error} onRetry={() => quests.refetch()} />;
  const q = quests.data!;

  const lists: Record<Tab, Quest[]> = { daily: q.daily, weekly: q.weekly, special: q.story };
  const tabs: { key: Tab; label: string; icon: IconName; color: string }[] = [
    { key: 'daily', label: t('quests_daily'), icon: 'timer', color: '#FFBD42' },
    { key: 'weekly', label: t('quests_short_weekly'), icon: 'leaderboard', color: '#55BDF4' },
    { key: 'special', label: t('quests_special'), icon: 'story', color: '#9568F5' },
  ];
  const active = tabs.find((x) => x.key === tab)!;
  const claimable = (list: Quest[]) => list.filter((x) => x.status === 'COMPLETED').length;
  const list = lists[tab];
  const finished = list.filter((x) => x.status === 'COMPLETED' || x.status === 'CLAIMED').length;

  return (
    <div className="space-y-4 pb-4">
      <TopStats compact />

      {/* Герой-сцена */}
      <div className="relative mx-4 h-40 overflow-hidden rounded-[28px] shadow-[var(--shadow-card)]" style={{ background: `linear-gradient(180deg, #8ED3F7 0%, #DDF2FF 60%, ${active.color}66 100%)` }}>
        <Skyline className="absolute inset-x-0 bottom-0 w-full opacity-70" height={110} sky={false} />
        <div className="absolute left-4 top-4 max-w-[58%]">
          <h1 className="text-3xl font-black text-ink drop-shadow-[0_2px_0_rgba(255,255,255,0.8)]">{t('quests_title')}</h1>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-[#10233b]">
            <GameIcon name="timer" size={18} /> {t('quests_resets', { t: countdown })}
          </div>
          <div className="mt-1.5 inline-block rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-black text-[#10233b]">{t('quests_done_of', { n: finished, total: list.length })}</div>
        </div>
        <div className="absolute -bottom-2 right-1">
          <Beaver mood="gift" size={140} />
        </div>
      </div>

      {/* Вхід до місій «Польська в житті» */}
      <button onClick={() => { haptic.tap(); nav('/life'); }} className="card mx-4 flex w-[calc(100%-2rem)] items-center gap-3 overflow-hidden p-0 text-left active:scale-[0.98]">
        <Scene name="shop-corner" className="h-20 w-28 shrink-0" />
        <div className="min-w-0 flex-1 py-2">
          <div className="font-black leading-tight">{t('life_title')}</div>
          <div className="muted line-clamp-2 text-xs font-semibold">{t('life_subtitle')}</div>
        </div>
        <Icon name="chevron-right" size={20} className="mr-3 shrink-0 text-pl-red" />
      </button>

      {/* Вкладки */}
      <div className="grid grid-cols-3 gap-2 px-4" role="tablist">
        {tabs.map((x) => {
          const badge = claimable(lists[x.key]);
          const on = tab === x.key;
          return (
            <motion.button
              key={x.key}
              role="tab"
              aria-selected={on}
              whileTap={{ scale: 0.95 }}
              onClick={() => { haptic.select(); setTab(x.key); }}
              className="relative flex items-center justify-center gap-1.5 rounded-2xl px-1.5 py-2 text-sm font-black"
              style={on ? { background: x.color, color: '#fff', boxShadow: `0 4px 0 color-mix(in srgb, ${x.color} 70%, black)` } : { background: 'var(--bg-elev)', boxShadow: 'var(--shadow-card)' }}
            >
              <GameIcon name={x.icon} size={24} inactive={!on} />
              <span className="truncate">{x.label}</span>
              {badge > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-pl-red px-1 text-[11px] text-white">{badge}</span>}
            </motion.button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState text={t('quests_empty')} />
      ) : tab !== 'special' ? (
        <div className="space-y-2.5 px-4">
          {list.map((x, i) => (
            <motion.div key={x.id ?? x.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <QuestCard q={x} onClaim={claim} busy={busy} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 px-4">
          {list.map((s) => (
            <div key={s.slug} className={cx('card overflow-hidden', !s.available && 'opacity-70')}>
              <div className="relative h-36 overflow-hidden" style={{ background: `linear-gradient(180deg, #BFE8F8 0%, #E9DDFF 55%, ${active.color}55 100%)` }}>
                <Skyline className="absolute inset-x-0 bottom-0 w-full opacity-60" height={100} sky={false} />
                <div className="absolute left-3 top-2 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black text-white" style={{ background: active.color }}>
                  {t('quests_special')}
                </div>
                <div className="absolute bottom-0 left-2">
                  <Beaver size={110} mood={s.status === 'CLAIMED' ? 'celebrate' : 'travel'} animate={false} />
                </div>
                <div className="absolute bottom-3 right-3">
                  <GameIcon name="story" size={56} />
                </div>
                {!s.available && (
                  <div className="absolute inset-0 grid place-items-center bg-[#22364a]/35">
                    <GameIcon name="lock" size={56} />
                  </div>
                )}
              </div>
              <div className="flex gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-black leading-tight">{tr(s.title)}</div>
                  <div className="muted mt-1 text-sm font-semibold">{tr(s.description)}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={s.progress} max={s.target} height={8} color={active.color} />
                    <span className="whitespace-nowrap text-xs font-black">{t('quests_stage', { n: Math.min(s.progress + 1, s.target), total: s.target })}</span>
                  </div>
                </div>
                <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl bg-xp/15 p-2 text-xs">
                  <GameIcon name="rewards" size={34} />
                  <XPBadge xp={s.xp} size="sm" />
                  <XPBadge zlotki={s.zlotki} size="sm" />
                </div>
              </div>
              <div className="px-4 pb-4">
                {!s.available ? (
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-muted py-2.5 text-sm font-bold">
                    <GameIcon name="lock" size={20} /> {t('quests_story_locked')}
                  </div>
                ) : s.status === 'COMPLETED' ? (
                  <button className="btn btn-xp w-full" disabled={busy} onClick={() => claim(s)}>{t('quests_claim')}</button>
                ) : s.status === 'CLAIMED' ? (
                  <div className="text-center text-sm font-black text-brand-dark">{t('quests_claimed')}</div>
                ) : (
                  <button className="btn btn-primary w-full" onClick={() => nav(`/story/${s.slug}`)}>
                    {s.status === 'ACTIVE' ? t('quests_resume') : t('quests_play')} →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <RewardModal reward={reward} onClose={() => setReward(null)} />
    </div>
  );
}
