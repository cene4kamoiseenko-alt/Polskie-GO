import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useT } from '../i18n';
import { api } from '../lib/api';
import { useMe } from '../lib/queries';
import { Beaver } from '../components/Beaver';
import { XpChart } from '../components/XpChart';
import { Card, EmptyState, Progress, Section, Skeleton, cx } from '../components/ui';
import { rankFor, TopStats } from './Home';

type Stats = {
  days: { day: string; xp: number; lessons: number; minutes: number; correct: number; exercises: number }[];
  totals: { xp: number; lessons: number; minutes: number; accuracy: number };
  skills: { skill: string; mastery: number; attempts: number; accuracy: number }[];
  vocabulary: Record<string, number>;
  history: { id: string; mode: string; lesson: { title: never; kind: string } | null; correct: number; total: number; xp: number; finishedAt: string }[];
};
type Ach = { slug: string; title: never; icon: string; unlockedAt: string | null; isNew: boolean };

const SKILL_ICONS: Record<string, string> = { vocab: '📖', grammar: '🧩', listening: '🎧', speaking: '🎤', writing: '✍️', reading: '📰', dialogue: '💬', situation: '🎭', usage: '🗣️', review: '🔁' };

export default function ProfileScreen() {
  const { t, tr, date } = useT();
  const nav = useNavigate();
  const me = useMe().data!;
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const stats = useQuery({ queryKey: ['stats', range], queryFn: () => api<Stats>(`/me/stats?days=${range}`) });
  const ach = useQuery({ queryKey: ['achievements'], queryFn: () => api<Ach[]>('/achievements') });
  const name = me.profile.displayName || me.firstName;

  // Агрегуємо навички за групою (vocab.*, grammar.* …), показуємо найслабші першими.
  const skillGroups = Object.entries(
    (stats.data?.skills ?? []).reduce<Record<string, { sum: number; n: number }>>((acc, s) => {
      const g = s.skill.split('.')[0];
      acc[g] ??= { sum: 0, n: 0 };
      acc[g].sum += s.mastery;
      acc[g].n += 1;
      return acc;
    }, {}),
  ).map(([g, v]) => ({ g, mastery: Math.round(v.sum / v.n) }));

  return (
    <div className="space-y-5 pb-4">
      <TopStats />
      <div className="mx-4 flex items-center gap-4 rounded-[28px] p-4" style={{ background: 'linear-gradient(135deg,#FFE3E3,#FFF4D6)' }}>
        <div className="relative">
          {me.photoUrl ? (
            <img src={me.photoUrl} alt="" className={cx('h-20 w-20 rounded-full border-4 object-cover', me.outfit.wear.FRAME === 'frame-gold' ? 'border-xp' : me.outfit.wear.FRAME === 'frame-green' ? 'border-brand' : 'border-white')} />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-white">
              <Beaver size={60} outfit={me.outfit.wear} animate={false} />
            </div>
          )}
          {me.premium.active && <span className="absolute -right-1 -top-1 text-2xl">👑</span>}
        </div>
        <div className="min-w-0 flex-1 text-ink">
          <h1 className="truncate text-2xl font-black">{name}</h1>
          {me.username && <div className="text-sm font-bold opacity-70">@{me.username}</div>}
          <div className="text-sm font-black">{rankFor(me.progress.level)}</div>
          {me.progress.currentCity && <div className="text-sm font-bold">{me.progress.currentCity.emoji} {me.progress.currentCity.namePl}</div>}
        </div>
        <button onClick={() => nav('/settings')} className="self-start text-2xl" aria-label={t('profile_settings')}>⚙️</button>
      </div>

      {/* Рівні */}
      <div className="grid grid-cols-2 gap-3 px-4">
        <Card className="p-3">
          <div className="muted text-xs font-black uppercase">{t('profile_level')}</div>
          <div className="text-3xl font-black">{me.progress.level}</div>
          <Progress value={me.progress.levelXp} max={me.progress.levelXpNeeded} color="var(--color-xp)" height={8} />
        </Card>
        <Card className="p-3" onClick={() => nav('/exams')}>
          <div className="muted text-xs font-black uppercase">{t('profile_language')}</div>
          <div className="text-3xl font-black text-pl-red">{me.progress.languageLevel}</div>
          <div className="muted text-[11px] font-bold">{t('profile_language_note')} →</div>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-2 px-4">
        {[
          ['🔥', me.progress.streak, t('profile_streak')],
          ['⭐', me.progress.xpTotal, t('profile_xp_total')],
          ['📖', me.progress.wordsLearned, t('profile_words')],
          ['📘', me.progress.lessonsCompleted, t('profile_lessons')],
        ].map(([icon, v, l]) => (
          <Card key={String(l)} className="px-1 py-3 text-center">
            <div className="text-xl">{icon}</div>
            <div className="text-lg font-black">{v}</div>
            <div className="muted text-[10px] font-bold leading-tight">{l}</div>
          </Card>
        ))}
      </div>

      {/* Бобер і швидкі переходи */}
      <div className="mx-4 flex items-center gap-3">
        <Card className="grid flex-1 place-items-center py-2" onClick={() => nav('/shop')}>
          <Beaver size={120} outfit={me.outfit.wear} mood="happy" />
          <div className="pb-1 font-black">👕 {t('profile_wardrobe')}</div>
        </Card>
        <div className="flex flex-1 flex-col gap-3">
          <Card className="p-3 font-black" onClick={() => nav('/house')}>🏡 {t('profile_house')}</Card>
          <Card className="p-3 font-black" onClick={() => nav('/diary')}>📔 {t('profile_diary')}</Card>
          <Card className="p-3 font-black" onClick={() => nav('/social')}>🏆 {t('home_leaderboard')}</Card>
        </div>
      </div>

      {/* Досягнення */}
      <Section title={t('profile_achievements')} action={<button className="text-sm font-black text-sky-dark" onClick={() => nav('/achievements')}>{t('home_see_all')} →</button>}>
        {ach.isLoading ? (
          <Skeleton className="h-24" />
        ) : (
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {ach.data?.map((a) => (
              <div key={a.slug} className={cx('flex w-20 shrink-0 flex-col items-center gap-1 text-center', !a.unlockedAt && 'opacity-35 grayscale')}>
                <div className="relative grid h-16 w-16 place-items-center rounded-full text-3xl" style={{ background: a.unlockedAt ? 'radial-gradient(circle,#FFE8A3,#FFC857)' : 'var(--bg-muted)' }}>
                  {a.icon}
                  {a.isNew && <span className="absolute -right-1 -top-1 rounded-full bg-pl-red px-1.5 text-[10px] font-black text-white">{t('new')}</span>}
                </div>
                <div className="text-[11px] font-black leading-tight">{tr(a.title)}</div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Статистика */}
      <Section
        title={t('profile_stats')}
        action={
          <div className="flex gap-1">
            {([7, 30, 90] as const).map((d) => (
              <button key={d} onClick={() => setRange(d)} className={cx('chip px-2.5 py-0.5 text-xs', range === d && 'bg-brand text-white')}>
                {t(`stats_${d}` as 'stats_7')}
              </button>
            ))}
          </div>
        }
      >
        <Card className="p-4">
          {stats.isLoading ? (
            <Skeleton className="h-40" />
          ) : stats.data && stats.data.totals.xp > 0 ? (
            <>
              <div className="mb-2 grid grid-cols-3 text-center">
                <div><div className="text-xl font-black">{stats.data.totals.xp}</div><div className="muted text-xs font-bold">{t('stats_xp')}</div></div>
                <div><div className="text-xl font-black">{stats.data.totals.minutes}</div><div className="muted text-xs font-bold">{t('stats_minutes')}</div></div>
                <div><div className="text-xl font-black">{stats.data.totals.accuracy}%</div><div className="muted text-xs font-bold">{t('stats_accuracy')}</div></div>
              </div>
              <XpChart days={stats.data.days} unit="XP" />
            </>
          ) : (
            <EmptyState text={t('stats_empty')} />
          )}
        </Card>
      </Section>

      {skillGroups.length > 0 && (
        <Section title={t('profile_skills')}>
          <Card className="space-y-3 p-4">
            {skillGroups.map((s) => (
              <div key={s.g} className="flex items-center gap-3">
                <span className="w-8 text-xl">{SKILL_ICONS[s.g] ?? '•'}</span>
                <span className="w-24 truncate text-sm font-black capitalize">{s.g}</span>
                <Progress value={s.mastery} height={10} color={s.mastery < 40 ? 'var(--color-coral)' : 'var(--color-brand)'} />
                <span className="w-10 text-right text-sm font-black">{s.mastery}</span>
              </div>
            ))}
            <div className="muted text-xs font-bold">
              📖 {stats.data?.vocabulary.LEARNED ?? 0} {t('profile_vocab_learned')} · {stats.data?.vocabulary.LEARNING ?? 0} {t('profile_vocab_learning')}
            </div>
          </Card>
        </Section>
      )}

      {stats.data && stats.data.history.length > 0 && (
        <Section title={t('profile_history')}>
          <Card className="divide-y divide-[var(--border)]">
            {stats.data.history.slice(0, 8).map((h) => (
              <div key={h.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span>{h.mode === 'LESSON' ? '📘' : h.mode === 'EXAM' ? '🎓' : '🔁'}</span>
                <span className="flex-1 truncate font-bold">{h.lesson ? tr(h.lesson.title) : h.mode}</span>
                <span className="font-black">{h.correct}/{h.total}</span>
                <span className="w-14 text-right font-black text-xp-dark">+{h.xp}</span>
              </div>
            ))}
          </Card>
        </Section>
      )}
      {me.premium.active && me.premium.expiresAt && <p className="muted px-4 text-center text-sm font-bold">👑 {t('profile_premium_until', { date: date(me.premium.expiresAt) })}</p>}
    </div>
  );
}
