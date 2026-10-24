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
import { Card, ErrorState, Progress, ScreenSkeleton, Section, cx, useToast } from '../components/ui';
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

  return (
    <div className="space-y-5 pb-4">
      <TopStats />
      <div className="flex items-center gap-3 px-4">
        <Beaver mood="gift" size={90} />
        <div>
          <h1 className="text-2xl font-black">{t('quests_title')}</h1>
          <p className="muted text-sm font-bold">⏳ {t('quests_resets', { t: countdown })}</p>
        </div>
      </div>
      <Section title={`☀️ ${t('quests_daily')}`}>
        <Card className="divide-y divide-[var(--border)]">{q.daily.map((x) => <QuestRow key={x.id} q={x} onClaim={claim} busy={busy} />)}</Card>
      </Section>
      <Section title={`📅 ${t('quests_weekly')}`}>
        <Card className="divide-y divide-[var(--border)]">{q.weekly.map((x) => <QuestRow key={x.id} q={x} onClaim={claim} busy={busy} />)}</Card>
      </Section>
      <Section title={`📜 ${t('quests_story')}`}>
        <div className="space-y-3">
          {q.story.map((s) => (
            <Card key={s.slug} className={cx('overflow-hidden', !s.available && 'opacity-60')}>
              <div className="flex items-start gap-3 p-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: 'linear-gradient(135deg,#FFC85755,#E5484D33)' }}>
                  {s.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black">{tr(s.title)}</div>
                  <div className="muted text-sm font-semibold">{tr(s.description)}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={s.progress} max={s.target} height={8} />
                    <span className="text-xs font-black">{t('quests_stage', { n: Math.min(s.progress + 1, s.target), total: s.target })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-soft px-4 py-2">
                <span className="text-sm font-black text-xp-dark">+{s.xp} XP · +{s.zlotki} 🪙</span>
                {!s.available ? (
                  <span className="text-sm font-bold">🔒 {t('quests_story_locked')}</span>
                ) : s.status === 'COMPLETED' ? (
                  <button className="btn btn-xp min-h-0 px-3 py-1.5 text-sm" disabled={busy} onClick={() => claim(s)}>🎁 {t('quests_claim')}</button>
                ) : s.status === 'CLAIMED' ? (
                  <span className="text-sm font-black text-brand-dark">✓ {t('quests_claimed')}</span>
                ) : (
                  <button className="btn btn-primary min-h-0 px-4 py-1.5 text-sm" onClick={() => nav(`/story/${s.slug}`)}>
                    ▶ {s.status === 'ACTIVE' ? t('quests_resume') : t('quests_play')}
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
