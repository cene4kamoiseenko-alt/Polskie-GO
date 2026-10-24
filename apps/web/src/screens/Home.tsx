import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { useJourney, useMe, useQuests } from '../lib/queries';
import type { VocabEntry } from '../lib/types';
import { Beaver } from '../components/Beaver';
import { CityBanner } from '../components/Scenery';
import { GameIcon, type IconName } from '../components/GameIcon';
import { Icon, type LineIconName } from '../components/Icon';
import { Progress, Ring, Section, Skeleton, SpeakButton, cx } from '../components/ui';
import { haptic } from '../lib/telegram';
import { MissionCard, missionsQuery } from './Missions';
import { Badge, Item } from '../components/Illustrations';

export const RANKS: [number, string][] = [
  [40, 'Mistrz polszczyzny'],
  [20, 'Znawca Polski'],
  [10, 'Podróżnik'],
  [5, 'Odkrywca Polski'],
  [1, 'Turysta'],
];
export const rankFor = (level: number) => RANKS.find(([l]) => level >= l)![1];

/** Компактна шапка вкладок: логотип, серія, Złotki, Premium, налаштування — один рядок. */
export function TopStats() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  if (!me) return <div className="h-14" />;
  return (
    <div className="safe-top flex items-center gap-2 px-4 pt-2">
      <button onClick={() => nav('/')} aria-label="POLSKI GO" className="text-[19px] font-black italic tracking-tight text-navy dark:text-white">
        POLSKI <span className="text-pl-red">GO</span>
      </button>
      <div className="flex-1" />
      <button onClick={() => nav('/profile')} aria-label={t('profile_streak')} className="stat-pill text-[#E2701F]">
        <Icon name="flame" size={18} /> {me.progress.streak}
      </button>
      <button onClick={() => nav('/shop')} aria-label="Złotki" className="stat-pill text-[#B26A12]">
        <Icon name="coin" size={18} /> {me.zlotki}
      </button>
      <button onClick={() => nav('/premium')} aria-label="Premium" className="grid h-9 w-9 place-items-center rounded-full bg-elev text-xp-dark shadow-[var(--shadow-card)]">
        <Icon name="crown" size={18} />
      </button>
      <button onClick={() => nav('/settings')} aria-label={t('profile_settings')} className="grid h-9 w-9 place-items-center rounded-full bg-elev text-[#6B7A8A] shadow-[var(--shadow-card)]">
        <Icon name="settings" size={18} />
      </button>
    </div>
  );
}

export function HomeScreen() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const me = useMe().data!;
  const journey = useJourney();
  const quests = useQuests();
  const stats = useQuery({ queryKey: ['stats', 7], queryFn: () => api<{ days: { day: string; xp: number }[] }>('/me/stats?days=7') });
  const wod = useQuery({ queryKey: ['wod'], queryFn: () => api<VocabEntry | null>('/vocab/word-of-day'), staleTime: 3600_000 });

  const current = journey.data?.cities.find((c) => c.id === journey.data?.currentCityId);
  const next = journey.data?.nextLesson;
  const lessonsOfCity = current?.routes.flatMap((r) => r.lessons) ?? [];
  const stage = next ? lessonsOfCity.findIndex((l) => l.id === next.id) + 1 : lessonsOfCity.length;
  const daily = quests.data?.daily ?? [];
  const goalDone = me.today.xp >= me.today.goalXp;
  const name = me.profile.displayName || me.firstName || 'Podróżnik';
  const bubble = goalDone ? t('home_bubble_goal') : next ? t('home_bubble_next', { topic: tr(next.topic) }) : t('home_bubble_done');

  return (
    <div className="space-y-4">
      <TopStats />

      {/* Привітання: компактно, без великої картки профілю */}
      <div className="flex items-center gap-3 px-4">
        <button onClick={() => nav('/profile')} className="relative shrink-0" aria-label={t('nav_profile')}>
          {me.photoUrl ? (
            <img src={me.photoUrl} alt="" className="h-11 w-11 rounded-full border-2 border-white object-cover shadow" />
          ) : (
            <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border-2 border-white bg-[#FFE9C7] shadow">
              <Beaver size={40} animate={false} vectorOnly />
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-sky px-1 text-[10px] font-black text-white ring-2 ring-[var(--bg)]">{me.progress.level}</span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-black leading-tight">{t('home_hello', { name })}</div>
          <div className="mt-1 flex items-center gap-2">
            <Progress value={me.progress.levelXp} max={me.progress.levelXpNeeded} height={6} color="var(--color-sky)" />
            <span className="whitespace-nowrap text-[11px] font-black text-[#6B7A8A]">{me.progress.levelXp}/{me.progress.levelXpNeeded} XP</span>
          </div>
        </div>
      </div>

      {/* 1–2–4: поточне місто, етап, наступний урок і бобер у контексті */}
      <div className="px-4">
        {journey.isLoading ? (
          <Skeleton className="h-[330px]" />
        ) : current ? (
          <div className="overflow-hidden rounded-[28px] bg-elev shadow-[var(--shadow-card)]">
            <div className="relative">
              <CityBanner slug={current.slug} color={current.color} height={170} shade={false} />
              {/* Назва міста на суцільній плашці — читається на будь-якій ілюстрації */}
              <div className="absolute left-3 top-3 rounded-2xl bg-white/95 px-3 py-1.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-[#6B7A8A]">
                  <Icon name="pin" size={13} /> {t('home_your_city')}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[22px] font-black leading-tight text-navy">{current.namePl}</span>
                  <span className="rounded-md bg-pl-red px-1.5 text-[11px] font-black text-white">{current.cefr}</span>
                </div>
              </div>
              {/* Репліка бобра — знизу ліворуч, не перекриває назву міста */}
              <div className="absolute bottom-3 left-3 max-w-[52%] rounded-2xl rounded-br-sm bg-white/95 px-3 py-2 text-[12px] font-bold leading-snug text-navy shadow-md">{bubble}</div>
              <div className="absolute -bottom-1 right-2">
                <Beaver mood={goalDone ? 'cheer' : next ? 'wave' : 'travel'} outfit={me.outfit.wear} size={112} />
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2 text-xs font-black text-[#6B7A8A]">
                <span className="whitespace-nowrap">{t('home_stage', { n: Math.max(stage, 1), total: lessonsOfCity.length })}</span>
                <Progress value={current.lessonsDone} max={Math.max(1, current.lessonsTotal)} height={7} color="var(--color-brand)" />
                <span>{current.progress}%</span>
              </div>
              {next ? (
                <button onClick={() => nav(`/lesson/${next.id}`)} className="flex w-full items-center gap-3 rounded-2xl bg-[var(--bg)] p-3 text-left transition active:scale-[0.98]">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/15 text-brand-dark">
                    <Icon name={next.kind === 'BOSS' ? 'trophy' : 'book'} size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-black uppercase tracking-wide text-[#6B7A8A]">{t('home_next_lesson')}</div>
                    <div className="truncate font-black">{tr(next.title)}</div>
                    <div className="truncate text-xs font-bold text-[#6B7A8A]">
                      {tr(next.topic)} · {t('home_minutes', { n: Math.max(3, Math.round(next.exerciseCount * 0.5)) })}
                    </div>
                  </div>
                  <Icon name="chevron-right" size={20} className="text-[#A3AEBB]" />
                </button>
              ) : null}
              <button className="btn btn-red w-full text-lg" onClick={() => { haptic.tap(); nav(next ? `/lesson/${next.id}` : '/map'); }}>
                {next ? t('home_continue_trip') : t('home_city_done')}
                <Icon name="arrow-right" size={22} strokeWidth={2.6} />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* 3: мета дня і серія */}
      <div className="mx-4 rounded-3xl bg-elev p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4">
          <Ring value={Math.min(me.today.xp, me.today.goalXp)} max={me.today.goalXp} size={64} stroke={8} color={goalDone ? 'var(--color-brand)' : 'var(--color-xp)'}>
            {goalDone ? <Icon name="check" size={26} strokeWidth={3} className="text-brand-dark" /> : <span className="text-sm font-black">{Math.round((me.today.xp / Math.max(1, me.today.goalXp)) * 100)}%</span>}
          </Ring>
          <div className="min-w-0 flex-1">
            <div className="font-black">{goalDone ? t('home_goal_done') : t('home_daily_goal')}</div>
            <div className="text-sm font-bold text-[#6B7A8A]">{Math.min(me.today.xp, me.today.goalXp)} / {me.today.goalXp} XP</div>
            <div className="mt-2 flex items-center gap-1.5" aria-label={t('home_week')}>
              {(stats.data?.days ?? Array.from({ length: 7 }, (_, i) => ({ day: String(i), xp: 0 }))).map((d) => (
                <span key={d.day} className={cx('h-2.5 flex-1 rounded-full', d.xp > 0 ? 'bg-[#FF8A3D]' : 'bg-[var(--track)]')} />
              ))}
              <span className="ml-1 flex items-center gap-0.5 text-sm font-black text-[#E2701F]">
                <Icon name="flame" size={16} /> {me.progress.streak}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4: місія дня з розділу «Польська в житті» (3–5 хв) */}
      <DailyMission />

      {/* 5: швидкий доступ до помилок і слів */}
      <div className="grid grid-cols-2 gap-3 px-4">
        <QuickTile icon="alert" color="#F45159" title={t('home_fix_mistakes')} sub={me.counters.mistakes ? t('home_mistakes_n', { n: me.counters.mistakes }) : t('home_nothing')} badge={me.counters.mistakes} onClick={() => nav('/practice/MISTAKES')} />
        <QuickTile icon="refresh" color="#35C88A" title={t('home_review_words')} sub={me.counters.dueReviews ? t('home_review_due', { n: me.counters.dueReviews }) : t('home_review_none')} badge={me.counters.dueReviews} onClick={() => nav('/practice/REVIEW')} />
        <QuickTile icon="clock" color="#55BDF4" title={t('home_five')} sub={t('home_five_d')} onClick={() => nav('/practice/FIVE_MIN')} />
        <QuickTile icon="bolt" color="#9568F5" title={t('home_speed')} sub={t('home_speed_d')} onClick={() => nav('/practice/SPEED')} />
      </div>

      {/* Квести на сьогодні */}
      {daily.length > 0 && (
        <Section title={t('home_today_quests')} action={<button className="text-sm font-black text-pl-red" onClick={() => nav('/quests')}>{t('home_see_all')}</button>}>
          <div className="space-y-2">
            {daily.slice(0, 3).map((q) => (
              <button key={q.id ?? q.slug} onClick={() => nav('/quests')} className="card flex w-full items-center gap-3 p-3 text-left">
                <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-xl', q.status === 'ACTIVE' ? 'bg-xp/20 text-xp-dark' : 'bg-brand/15 text-brand-dark')}>
                  <Icon name={q.status === 'ACTIVE' ? 'target' : q.status === 'COMPLETED' ? 'gift' : 'check'} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black">{tr(q.title)}</div>
                  <Progress value={q.progress} max={q.target} height={6} color={q.status === 'ACTIVE' ? 'var(--color-xp)' : 'var(--color-brand)'} className="mt-1" />
                </div>
                <span className="text-xs font-black text-xp-dark">+{q.xp} XP</span>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Слово дня */}
      {wod.data && (
        <Section title={t('home_word_of_day')}>
          <div className="card flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="text-xl font-black">{wod.data.pl}</div>
              <div className="text-sm font-bold text-[#6B7A8A]">
                {wod.data.pronunciation ? `[${wod.data.pronunciation}] · ` : ''}
                {tr(wod.data.translations)}
              </div>
              {wod.data.examples[0] && <div className="mt-1 text-sm font-semibold italic">„{wod.data.examples[0].pl}”</div>}
            </div>
            <SpeakButton text={wod.data.pl} url={wod.data.audioUrl} />
          </div>
        </Section>
      )}

      {/* Інші розділи */}
      <Section title={t('home_more_sections')}>
        <div className="grid grid-cols-4 gap-2">
          {(
            [
              ['dictionary', 'home_dictionary', '/dictionary'],
              ['grammar', 'home_grammar', '/grammar'],
              ['ai', 'home_ai', '/ai'],
              ['exam', 'home_exams', '/exams'],
              ['wardrobe', 'home_shop', '/shop'],
              ['house', 'home_house', '/house'],
              ['diary', 'home_diary', '/diary'],
              ['leaderboard', 'home_leaderboard', '/social'],
            ] as [IconName, TKey, string][]
          ).map(([icon, key, to]) => (
            <button key={to} onClick={() => { haptic.tap(); nav(to); }} className="flex flex-col items-center gap-1 rounded-2xl py-2 transition active:scale-95">
              <GameIcon name={icon} size={42} />
              <span className="text-center text-[11px] font-black leading-tight">{t(key)}</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

/** Місія дня: перша ще не пройдена місія (або по черзі, якщо пройдено всі) + паспорт і досягнення. */
function DailyMission() {
  const { t } = useT();
  const nav = useNavigate();
  const q = useQuery(missionsQuery);
  const list = q.data?.missions ?? [];
  const day = Math.floor(Date.now() / 86_400_000);
  const pick = list.find((m) => m.inProgress !== null) ?? list.find((m) => !m.completions) ?? list[day % Math.max(1, list.length)];
  return (
    <Section title={t('life_daily')} action={<button className="text-sm font-black text-pl-red" onClick={() => nav('/life')}>{t('home_all_missions')}</button>}>
      {pick ? <MissionCard m={pick} compact onOpen={() => nav(`/life/${pick.slug}`)} /> : <Skeleton className="h-40" />}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button onClick={() => { haptic.tap(); nav('/passport'); }} className="card flex items-center gap-2.5 p-3 text-left active:scale-[0.98]">
          <Item name="map" size={40} />
          <span className="text-sm font-black leading-tight">{t('home_passport')}</span>
        </button>
        <button onClick={() => { haptic.tap(); nav('/achievements'); }} className="card flex items-center gap-2.5 p-3 text-left active:scale-[0.98]">
          <Badge icon="snack-bag" unlocked size={40} />
          <span className="text-sm font-black leading-tight">{t('home_achievements')}</span>
        </button>
      </div>
    </Section>
  );
}

function QuickTile({ icon, color, title, sub, badge, onClick }: { icon: LineIconName; color: string; title: string; sub: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={() => { haptic.tap(); onClick(); }} className="card relative flex min-h-[64px] items-center gap-2.5 p-2.5 text-left transition active:scale-[0.97]">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white" style={{ background: color }}>
        <Icon name={icon} size={19} strokeWidth={2.4} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-black leading-tight">{title}</span>
        <span className="block text-[11px] font-bold leading-tight text-[#6B7A8A]">{sub}</span>
      </span>
      {!!badge && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-pl-red px-1 text-[11px] font-black text-white">{badge}</span>}
    </button>
  );
}
