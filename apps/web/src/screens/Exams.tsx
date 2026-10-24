import { useQuery } from '@tanstack/react-query';
import { Icon } from '../components/Icon';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { api } from '../lib/api';
import { useMe } from '../lib/queries';
import { Beaver } from '../components/Beaver';
import { Card, ErrorState, ScreenHeader, ScreenSkeleton, Section } from '../components/ui';

type Exam = { id: string; slug: string; kind: string; title: never; topic: never; cefr: string; isPremium: boolean; exerciseCount: number; bestScore: number | null; passed: boolean };

export default function ExamsScreen() {
  const { t, tr, date } = useT();
  const nav = useNavigate();
  const me = useMe().data!;
  const q = useQuery({ queryKey: ['exams'], queryFn: () => api<{ exams: Exam[]; history: { id: string; lessonId: string; correct: number; total: number; finishedAt: string }[] }>('/exams') });
  if (q.isLoading) return <ScreenSkeleton />;
  if (q.error) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const { exams, history } = q.data!;
  return (
    <div className="space-y-5 pb-6">
      <ScreenHeader title={t('exams_title')} subtitle={t('exams_subtitle')} />
      <div className="mx-4 flex items-center gap-3 rounded-3xl bg-muted p-4">
        <Beaver size={80} mood="think" outfit={{ ...me.outfit.wear, GLASSES: 'glasses-round' }} animate={false} />
        <div>
          <div className="text-sm font-black">{t('profile_language')}: <span className="text-2xl text-pl-red">{me.progress.languageLevel}</span></div>
          <p className="muted text-xs font-bold">{t('exams_disclaimer')}</p>
        </div>
      </div>
      <div className="space-y-3 px-4">
        {exams.map((e) => (
          <Card key={e.id} className="flex items-center gap-3 p-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sky/20 text-2xl font-black text-sky-dark">{e.kind === 'PLACEMENT' ? '🧭' : e.cefr}</div>
            <div className="min-w-0 flex-1">
              <div className="font-black">{tr(e.title)}</div>
              <div className="muted text-xs font-bold">{tr(e.topic)}</div>
              <div className="mt-1 text-xs font-black">
                {e.passed && e.kind === 'EXAM' && <span className="text-brand-dark">{t('exams_passed')} · </span>}
                {e.bestScore !== null && t('exams_best', { n: e.bestScore })}
              </div>
            </div>
            <button className="btn btn-primary min-h-0 px-4 py-2 text-sm" onClick={() => (e.isPremium && !me.premium.active ? nav('/premium') : nav(`/lesson/${e.id}`))}>
              {e.isPremium && !me.premium.active ? <Icon name="crown" size={18} filled /> : t('exams_start')}
            </button>
          </Card>
        ))}
      </div>
      <Section title={t('exams_state_title')}>
        <Card className="space-y-2 p-4 text-sm font-semibold">
          <p>{t('exams_state_text')}</p>
          <p className="font-black text-sky-dark">{t('exams_sections')}</p>
          {!me.premium.active ? (
            <button className="btn btn-xp w-full" onClick={() => nav('/premium')}><Icon name="crown" size={20} filled /> {t('prem_f3')}</button>
          ) : (
            <button className="btn btn-sky w-full" onClick={() => nav('/ai')}><Icon name="chat" size={20} /> {t('prem_f3')}</button>
          )}
        </Card>
      </Section>
      {history.length > 0 && (
        <Section title={t('exams_history')}>
          <Card className="divide-y divide-[var(--border)]">
            {history.map((h) => (
              <div key={h.id} className="flex justify-between px-4 py-2 text-sm font-bold">
                <span>{exams.find((e) => e.id === h.lessonId) ? tr(exams.find((e) => e.id === h.lessonId)!.title) : '—'}</span>
                <span>{Math.round((h.correct / Math.max(1, h.total)) * 100)}% · {date(h.finishedAt)}</span>
              </div>
            ))}
          </Card>
        </Section>
      )}
    </div>
  );
}
