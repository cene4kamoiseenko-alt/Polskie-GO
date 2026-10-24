import { useQuery } from '@tanstack/react-query';
import { useT } from '../i18n';
import { api } from '../lib/api';
import { Card, ErrorState, Progress, ScreenHeader, ScreenSkeleton, cx } from '../components/ui';

type Ach = { slug: string; title: never; description: never; icon: string; threshold: number; progress: number; unlockedAt: string | null; zlotki: number };

export default function AchievementsScreen() {
  const { t, tr, date } = useT();
  const q = useQuery({ queryKey: ['achievements'], queryFn: () => api<Ach[]>('/achievements') });
  if (q.isLoading) return <ScreenSkeleton />;
  if (q.error) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const list = q.data!;
  return (
    <div className="pb-6">
      <ScreenHeader title={t('achievements_title')} subtitle={t('achievements_unlocked', { n: list.filter((a) => a.unlockedAt).length, total: list.length })} />
      <div className="grid grid-cols-2 gap-3 px-4">
        {list.map((a) => (
          <Card key={a.slug} className={cx('flex flex-col items-center gap-1 p-4 text-center', !a.unlockedAt && 'opacity-70')}>
            <div className={cx('grid h-16 w-16 place-items-center rounded-full text-3xl', !a.unlockedAt && 'grayscale')} style={{ background: a.unlockedAt ? 'radial-gradient(circle,#FFE8A3,#FFC857)' : 'var(--bg-muted)' }}>
              {a.icon}
            </div>
            <div className="font-black leading-tight">{tr(a.title)}</div>
            <div className="muted text-xs font-semibold">{tr(a.description)}</div>
            {a.unlockedAt ? (
              <div className="text-xs font-black text-brand-dark">✓ {date(a.unlockedAt)}</div>
            ) : (
              <div className="w-full">
                <Progress value={a.progress} max={a.threshold} height={6} />
                <div className="mt-0.5 text-[11px] font-black">{a.progress}/{a.threshold}</div>
              </div>
            )}
            {a.zlotki > 0 && <div className="text-xs font-black text-[#C8742E]">+{a.zlotki} 🪙</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}
