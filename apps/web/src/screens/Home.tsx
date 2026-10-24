import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { useJourney, useMe, useQuests } from '../lib/queries';
import type { VocabEntry } from '../lib/types';
import { Beaver } from '../components/Beaver';
import { Card, Progress, Ring, Section, Skeleton, SpeakButton, StatPill } from '../components/ui';
import { haptic } from '../lib/telegram';

export const RANKS: [number, string][] = [
  [40, 'Mistrz polszczyzny'],
  [20, 'Znawca Polski'],
  [10, 'Podróżnik'],
  [5, 'Odkrywca Polski'],
  [1, 'Turysta'],
];
export const rankFor = (level: number) => RANKS.find(([l]) => level >= l)![1];

export function TopStats() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  if (!me) return <div className="h-10" />;
  return (
    <div className="flex items-center gap-2 px-4 pt-2">
      <StatPill icon="🔥" value={me.progress.streak} color={me.progress.activeToday ? '#F2994A' : undefined} label={t('profile_streak')} onClick={() => nav('/profile')} />
      <StatPill icon="⭐" value={me.progress.xpTotal} color="#E8A82A" label="XP" onClick={() => nav('/profile')} />
      <StatPill icon="🪙" value={me.zlotki} color="#C8742E" label="Złotki" onClick={() => nav('/shop')} />
      <div className="flex-1" />
      {me.premium.active ? (
        <StatPill icon="👑" value="" label="Premium" onClick={() => nav('/premium')} />
      ) : (
        <StatPill icon="💎" value="" label="Premium" onClick={() => nav('/premium')} />
      )}
      <StatPill icon="⚙️" value="" label={t('profile_settings')} onClick={() => nav('/settings')} />
    </div>
  );
}

function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="relative max-w-[180px] rounded-2xl bg-white px-3 py-2 text-sm font-bold text-ink shadow-md">
      {children}
      <div className="absolute -left-2 bottom-4 h-4 w-4 rotate-45 bg-white" />
    </motion.div>
  );
}

function PracticeTile({ icon, title, sub, color, onClick, badge }: { icon: string; title: string; sub: string; color: string; onClick: () => void; badge?: number }) {
  return (
    <Card onClick={onClick} className="relative flex items-center gap-3 p-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl" style={{ background: `color-mix(in srgb, ${color} 18%, transparent)` }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="truncate font-black">{title}</div>
        <div className="muted truncate text-xs font-bold">{sub}</div>
      </div>
      {!!badge && <span className="absolute right-2 top-2 rounded-full bg-pl-red px-2 text-xs font-black text-white">{badge}</span>}
    </Card>
  );
}

export function HomeScreen() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const me = useMe().data!;
  const journey = useJourney();
  const quests = useQuests();
  const wod = useQuery({ queryKey: ['wod'], queryFn: () => api<VocabEntry | null>('/vocab/word-of-day'), staleTime: 3600_000 });

  const current = journey.data?.cities.find((c) => c.id === journey.data?.currentCityId);
  const next = journey.data?.nextLesson;
  const nextCity = current ? journey.data?.cities.find((c) => c.order === current.order + 1) : undefined;
  const name = me.profile.displayName || me.firstName || 'Podróżnik';
  const goalPct = me.today.goalXp ? me.today.xp / me.today.goalXp : 0;

  const go = () => {
    haptic.tap();
    if (next) nav(`/lesson/${next.id}`);
    else nav('/map');
  };

  const more: { icon: string; key: TKey; to: string }[] = [
    { icon: '📖', key: 'home_dictionary', to: '/dictionary' },
    { icon: '🤖', key: 'home_ai', to: '/ai' },
    { icon: '🎓', key: 'home_exams', to: '/exams' },
    { icon: '🏆', key: 'home_leaderboard', to: '/social' },
    { icon: '👕', key: 'home_shop', to: '/shop' },
    { icon: '🏡', key: 'home_house', to: '/house' },
    { icon: '📔', key: 'home_diary', to: '/diary' },
    { icon: '👥', key: 'home_friends', to: '/social?tab=friends' },
  ];

  return (
    <div className="space-y-5 pb-4">
      <TopStats />

      {/* Привітання */}
      <div className="relative mx-4 overflow-hidden rounded-[28px] px-4 pb-4 pt-4" style={{ background: 'linear-gradient(160deg, #DFF6E8 0%, #BFE8F8 100%)' }}>
        <div className="absolute -right-8 top-6 h-16 w-36 rotate-12 overflow-hidden rounded-lg opacity-25"><div className="h-1/2 bg-white" /><div className="h-1/2 bg-pl-red" /></div>
        <h1 className="text-[26px] font-black leading-tight text-ink">{t('home_hello', { name })}</h1>
        <div className="mt-1 flex items-end gap-2">
          <Beaver mood={me.progress.activeToday ? 'happy' : 'wave'} outfit={me.outfit.wear} size={130} />
          <div className="mb-10">
            <SpeechBubble>
              <span className="text-ink">{goalPct >= 1 ? t('home_goal_done') : t('home_ready')} 🇵🇱</span>
            </SpeechBubble>
          </div>
        </div>
        {/* Рівень */}
        <div className="card flex items-center gap-3 p-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-xp text-xl font-black text-[#5a3d00]">{me.progress.level}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
              <span className="font-black">{t('level')} {me.progress.level}</span>
              <span className="muted text-xs font-bold">{me.progress.levelXp} / {me.progress.levelXpNeeded} XP</span>
            </div>
            <div className="muted mb-1 text-xs font-bold">{rankFor(me.progress.level)}</div>
            <Progress value={me.progress.levelXp} max={me.progress.levelXpNeeded} color="var(--color-xp)" height={10} />
          </div>
        </div>
      </div>

      {/* Поточне місто */}
      <div className="px-4">
        {journey.isLoading ? (
          <Skeleton className="h-36" />
        ) : current ? (
          <Card className="overflow-hidden" onClick={() => nav('/map')}>
            <div className="flex items-center gap-3 p-3">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl text-5xl" style={{ background: `linear-gradient(135deg, ${current.color}33, ${current.color}66)` }}>
                {current.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="muted text-xs font-black uppercase tracking-wide">{t('home_current_city', { city: '' })}</div>
                <div className="truncate text-xl font-black">{current.namePl}</div>
                <div className="muted truncate text-sm font-bold">{tr(current.theme)}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <Progress value={current.progress} height={8} />
                  <span className="text-xs font-black">{current.progress}%</span>
                </div>
              </div>
            </div>
            {nextCity && (
              <div className="border-t border-soft px-3 py-2 text-sm font-bold">
                <span className="muted">→ </span>
                {nextCity.emoji} {nextCity.namePl}
                {!nextCity.unlocked && <span className="muted"> 🔒</span>}
              </div>
            )}
          </Card>
        ) : null}
      </div>

      <div className="px-4">
        <motion.button whileTap={{ scale: 0.97 }} className="btn btn-red w-full text-lg" onClick={go}>
          {next ? (
            <span className="flex flex-col items-center leading-tight">
              <span>{t('home_continue')} →</span>
              <span className="text-xs font-bold opacity-90">{tr(next.title)}</span>
            </span>
          ) : (
            t('home_city_done')
          )}
        </motion.button>
      </div>

      {/* Мета дня */}
      <div className="px-4">
        <Card className="flex items-center gap-4 p-4">
          <Ring value={me.today.xp} max={me.today.goalXp} size={66} color="var(--color-xp)">
            <span className="text-xl">{goalPct >= 1 ? '✅' : '🎯'}</span>
          </Ring>
          <div className="flex-1">
            <div className="font-black">{t('home_daily_goal')}</div>
            <div className="muted text-sm font-bold">
              {me.today.xp} / {me.today.goalXp} XP · 🔥 {t('streak_days', { n: me.progress.streak })}
            </div>
          </div>
        </Card>
      </div>

      {/* Квести */}
      <Section title={t('home_quests')} action={<button className="text-sm font-black text-sky-dark" onClick={() => nav('/quests')}>{t('home_see_all')} →</button>}>
        <Card className="divide-y divide-[var(--border)]">
          {quests.isLoading && <Skeleton className="m-3 h-24" />}
          {quests.data?.daily.map((q) => (
            <button key={q.id} className="flex w-full items-center gap-3 px-3 py-3 text-left" onClick={() => nav('/quests')}>
              <span className="text-2xl">{q.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black">{tr(q.description)}</div>
                <Progress value={q.progress} max={q.target} height={7} className="mt-1" color={q.status === 'ACTIVE' ? 'var(--color-brand)' : 'var(--color-xp)'} />
              </div>
              <span className="text-sm font-black text-brand-dark">{q.status === 'CLAIMED' ? '✓' : `+${q.xp} XP`}</span>
            </button>
          ))}
        </Card>
      </Section>

      {/* Тренування */}
      <Section title={t('home_practice')}>
        <div className="grid grid-cols-2 gap-3">
          <PracticeTile icon="🔁" title={t('home_review')} sub={me.counters.dueReviews ? t('home_review_due', { n: me.counters.dueReviews }) : t('home_review_none')} color="#69C7F4" badge={me.counters.dueReviews} onClick={() => nav('/practice/REVIEW')} />
          <PracticeTile icon="🩹" title={t('home_mistakes')} sub={t('home_mistakes_n', { n: me.counters.mistakes })} color="#E5484D" onClick={() => nav('/practice/MISTAKES')} />
          <PracticeTile icon="⏱️" title={t('home_five')} sub={t('home_five_d')} color="#45C486" onClick={() => nav('/practice/FIVE_MIN')} />
          <PracticeTile icon="⚡" title={t('home_speed')} sub={t('home_speed_d')} color="#FFC857" onClick={() => nav('/practice/SPEED')} />
        </div>
      </Section>

      {/* Слово дня */}
      {wod.data && (
        <Section title={t('home_word_of_day')}>
          <Card className="flex items-center gap-3 p-4" onClick={() => nav(`/dictionary?q=${encodeURIComponent(wod.data!.pl)}`)}>
            <div className="text-4xl">{wod.data.emoji ?? '📖'}</div>
            <div className="min-w-0 flex-1">
              <div className="text-xl font-black">{wod.data.pl}</div>
              <div className="muted text-sm font-bold">[{wod.data.pronunciation}] · {tr(wod.data.translations)}</div>
              {wod.data.examples[0] && <div className="mt-1 text-sm font-semibold italic">„{wod.data.examples[0].pl}”</div>}
            </div>
            <SpeakButton text={wod.data.pl} url={wod.data.audioUrl} />
          </Card>
        </Section>
      )}

      {/* Більше */}
      <Section title={t('home_more')}>
        <div className="grid grid-cols-4 gap-2">
          {more.map((m) => (
            <motion.button key={m.key} whileTap={{ scale: 0.92 }} onClick={() => { haptic.tap(); nav(m.to); }} className="card flex flex-col items-center gap-1 px-1 py-3">
              <span className="text-2xl">{m.icon}</span>
              <span className="text-center text-[11px] font-black leading-tight">{t(m.key)}</span>
            </motion.button>
          ))}
        </div>
      </Section>
    </div>
  );
}
