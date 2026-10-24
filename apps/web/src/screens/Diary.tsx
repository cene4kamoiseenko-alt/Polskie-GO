import { useQuery } from '@tanstack/react-query';
import { useT } from '../i18n';
import { api } from '../lib/api';
import { Card, EmptyState, ErrorState, Progress, ScreenHeader, ScreenSkeleton } from '../components/ui';
import { ITEM_ICONS } from '../components/Beaver';

type Entry = {
  city: { id: string; slug: string; namePl: string; name: never; emoji: string; color: string; theme: never };
  unlockedAt: string;
  completedAt: string | null;
  progress: number;
  topics: never[];
  quests: { slug: string; title: never; icon: string }[];
  souvenirs: { slug: string; name: never }[];
};

export default function DiaryScreen() {
  const { t, tr, date } = useT();
  const q = useQuery({ queryKey: ['diary'], queryFn: () => api<Entry[]>('/me/diary') });
  if (q.isLoading) return <ScreenSkeleton />;
  if (q.error) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  return (
    <div className="pb-6">
      <ScreenHeader title={t('diary_title')} />
      <div className="space-y-4 px-4">
        {!q.data!.length && <EmptyState text={t('diary_empty')} />}
        {q.data!.map((e, i) => (
          <Card key={e.city.id} className="overflow-hidden">
            <div className="flex items-center gap-3 p-4 text-white" style={{ background: `linear-gradient(135deg, ${e.city.color}, ${e.city.color}aa)`, transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)` }}>
              <span className="text-5xl">{e.city.emoji}</span>
              <div className="flex-1">
                <div className="text-xl font-black">{e.city.namePl}</div>
                <div className="text-sm font-bold opacity-90">{tr(e.city.theme)}</div>
              </div>
              {e.completedAt && <span className="rotate-12 rounded-lg border-2 border-white px-2 py-1 text-xs font-black">✓ 100%</span>}
            </div>
            <div className="space-y-2 p-4 text-sm">
              <div className="muted font-bold">{t('diary_opened', { date: date(e.unlockedAt) })}{e.completedAt && ` · ${t('diary_completed', { date: date(e.completedAt) })}`}</div>
              <Progress value={e.progress} height={8} />
              {e.topics.length > 0 && (
                <div>
                  <b>{t('diary_topics')}:</b> {e.topics.map((x) => tr(x)).join(' · ')}
                </div>
              )}
              {e.quests.length > 0 && (
                <div>
                  <b>{t('diary_quests')}:</b> {e.quests.map((x) => `${x.icon} ${tr(x.title)}`).join(', ')}
                </div>
              )}
              <div className="flex items-center gap-2">
                <b>{t('diary_souvenirs')}:</b>
                {e.souvenirs.length ? e.souvenirs.map((s) => <span key={s.slug} title={tr(s.name)} className="text-2xl">{ITEM_ICONS[s.slug] ?? '🎁'}</span>) : <span className="muted">—</span>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
