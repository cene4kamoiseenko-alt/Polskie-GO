import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { api } from '../lib/api';
import { useQuests, useRefreshAll } from '../lib/queries';
import type { Quest } from '../lib/types';
import { sfx } from '../lib/audio';
import { haptic } from '../lib/telegram';
import { Beaver } from '../components/Beaver';
import { Card, ErrorState, Progress, ScreenSkeleton, cx, useToast } from '../components/ui';
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

function QuestRow({ q, onClaim, busy }: { q: Quest; onClaim: (q: Quest) => void; busy: boolean }) {
  const { t, tr } = useT();
  const done = q.status === 'COMPLETED';
  const claimed = q.status === 'CLAIMED';
  return (
    <div className={cx('flex items-center gap-3 px-3 py-3', claimed && 'opacity-60')}>
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted text-2xl">{q.icon}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-black">{tr(q.title)}</div>
        <div className="muted truncate text-xs font-bold">{tr(q.description)}</div>
        <div className="mt-1 flex items-center gap-2">
          <Progress value={q.progress} max={q.target} height={8} color={done || claimed ? 'var(--color-xp)' : 'var(--color-brand)'} />
          <span className="text-xs font-black">{q.progress}/{q.target}</span>
        </div>
      </div>
      {done ? (
        <motion.button whileTap={{ scale: 0.9 }} animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} disabled={busy} className="btn btn-xp min-h-0 px-3 py-2 text-sm" onClick={() => onClaim(q)}>
          🎁 {t('quests_claim')}
        </motion.button>
      ) : claimed ? (
        <span className="text-sm font-black text-brand-dark">✓ {t('quests_claimed')}</span>
      ) : (
        <div className="text-right text-xs font-black">
          <div className="text-xp-dark">+{q.xp} XP</div>
          <div className="text-[#C8742E]">+{q.zlotki} 🪙</div>
        </div>
      )}
    </div>
  );
}

export default function QuestsScreen() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const quests = useQuests();
  const refresh = useRefreshAll();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'daily' | 'story' | 'weekly'>('daily');
  const countdown = useCountdown(quests.data?.resetsAt);

  const claim = async (q: Quest) => {
    if (!q.id) return;
    setBusy(true);
    try {
      const r = await api<{ xp: number; zlotki: number; achievements: { title: never; icon: string }[] }>(`/quests/${q.id}/claim`, { body: {} });
      sfx.coin();
      haptic.success();
      toast(`+${r.xp} XP · +${r.zlotki} 🪙`, '🎁');
      for (const a of r.achievements) toast(t('toast_achievement', { name: tr(a.title) }), a.icon);
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

  const tabs = [
    { key: 'daily', label: t('quests_daily'), icon: '☀️', color: '#F2994A' },
    { key: 'story', label: t('quests_story'), icon: '📜', color: '#9B6BFF' },
    { key: 'weekly', label: t('quests_weekly'), icon: '🏆', color: '#3A7BD5' },
  ] as const;
  const active = tabs.find((x) => x.key === tab)!;
  const doneCount = (list: Quest[]) => list.filter((x) => x.status === 'COMPLETED').length;

  return (
    <div className="space-y-4 pb-4">
      <TopStats />
      <div className="flex items-center gap-3 px-4">
        <Beaver mood="gift" size={84} />
        <div>
          <h1 className="text-2xl font-black">{t('quests_title')}</h1>
          <p className="muted text-sm font-bold">⏳ {t('quests_resets', { t: countdown })}</p>
        </div>
      </div>

      {/* Вкладки */}
      <div className="grid grid-cols-3 gap-2 px-4">
        {tabs.map((x) => {
          const badge = x.key === 'daily' ? doneCount(q.daily) : x.key === 'weekly' ? doneCount(q.weekly) : doneCount(q.story);
          return (
            <motion.button
              key={x.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => { haptic.select(); setTab(x.key); }}
              className="relative rounded-2xl px-2 py-2.5 text-sm font-black"
              style={tab === x.key ? { background: x.color, color: '#fff', boxShadow: `0 4px 0 color-mix(in srgb, ${x.color} 70%, black)` } : { background: 'var(--bg-elev)', border: '2px solid var(--border)' }}
            >
              {x.icon} {x.label.split(' ')[0]}
              {badge > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-pl-red px-1 text-[11px] text-white">{badge}</span>}
            </motion.button>
          );
        })}
      </div>

      {tab !== 'story' ? (
        <div className="px-4">
          <Card className="divide-y divide-[var(--border)]" >
            {(tab === 'daily' ? q.daily : q.weekly).map((x) => <QuestRow key={x.id} q={x} onClaim={claim} busy={busy} />)}
          </Card>
        </div>
      ) : (
        <div className="space-y-4 px-4">
          {q.story.map((s) => (
            <Card key={s.slug} className={cx('overflow-hidden', !s.available && 'opacity-60')}>
              <div className="relative h-36 overflow-hidden" style={{ background: `linear-gradient(180deg, #BFE8F8 0%, #E9DDFF 55%, ${active.color}55 100%)` }}>
                <div className="absolute left-3 top-2 rounded-full px-3 py-1 text-xs font-black text-white" style={{ background: active.color }}>📜 {t('quests_story')}</div>
                <div className="absolute bottom-2 right-4 text-[72px] leading-none">{s.icon}</div>
                <div className="absolute bottom-0 left-2">
                  <Beaver size={96} mood={s.status === 'CLAIMED' ? 'celebrate' : 'travel'} animate={false} />
                </div>
                {!s.available && <div className="absolute inset-0 grid place-items-center bg-black/30 text-4xl">🔒</div>}
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
                <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-xp/20 p-2 text-center">
                  <span className="text-2xl">🎁</span>
                  <span className="text-sm font-black text-xp-dark">{s.xp} XP</span>
                  <span className="text-xs font-black text-[#C8742E]">+{s.zlotki} 🪙</span>
                </div>
              </div>
              <div className="px-4 pb-4">
                {!s.available ? (
                  <div className="rounded-2xl bg-muted py-2.5 text-center text-sm font-bold">🔒 {t('quests_story_locked')}</div>
                ) : s.status === 'COMPLETED' ? (
                  <button className="btn btn-xp w-full" disabled={busy} onClick={() => claim(s)}>🎁 {t('quests_claim')}</button>
                ) : s.status === 'CLAIMED' ? (
                  <div className="text-center text-sm font-black text-brand-dark">✓ {t('quests_claimed')}</div>
                ) : (
                  <button className="btn btn-primary w-full" onClick={() => nav(`/story/${s.slug}`)}>
                    {s.status === 'ACTIVE' ? t('quests_resume') : t('quests_play')} →
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
