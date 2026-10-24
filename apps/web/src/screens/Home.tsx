import { motion } from 'framer-motion';
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

/** Шапка вкладок: аватар-бобер, логотип, нагадування; під ними — серія, Złotki, Premium. */
export function TopStats({ compact }: { compact?: boolean }) {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  if (!me) return <div className="h-14" />;
  const pills = (
    <div className="flex items-center gap-2">
      <button onClick={() => nav('/profile')} aria-label={t('profile_streak')} className="stat-pill">
        <Icon name="flame" size={18} className="text-[#FF8A3D]" filled /> {me.progress.streak}
      </button>
      <button onClick={() => nav('/shop')} aria-label="Złotki" className="stat-pill">
        <Icon name="coin" size={18} className="text-xp" /> {me.zlotki}
      </button>
      <button onClick={() => nav('/premium')} aria-label="Premium" className={cx('stat-pill', me.premium.active ? 'text-xp' : 'text-xp/80')}>
        <Icon name="crown" size={18} filled={me.premium.active} />
      </button>
    </div>
  );
  if (compact) {
    return (
      <div className="safe-top flex items-center gap-2 px-4 pt-2">
        <button onClick={() => nav('/')} aria-label="POLSKI GO" className="text-[19px] font-black italic tracking-tight text-[#2A62C9] dark:text-white">
          POLSKI <span className="text-pl-red">GO</span>
        </button>
        <div className="flex-1" />
        {pills}
      </div>
    );
  }
  return (
    <div className="safe-top space-y-3 px-4 pt-2">
      <div className="flex items-center gap-3">
        <button onClick={() => nav('/profile')} className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-[#FFC44D] bg-gradient-to-b from-[#FFE6BF] to-[#FFC98A] shadow-lg" aria-label={t('nav_profile')}>
          <Beaver size={46} animate={false} vectorOnly outfit={me.outfit.wear} />
        </button>
        <div className="flex-1 text-[26px] font-black italic leading-none tracking-tight text-[#2A62C9] dark:text-white" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.6)' }}>
          POLSKI <span className="text-pl-red">GO</span>
        </div>
        <button onClick={() => nav('/settings')} aria-label={t('profile_settings')} className="grid h-11 w-11 place-items-center rounded-2xl bg-elev text-[#6B7A8A] shadow-[var(--shadow-card)] dark:text-white">
          <Icon name="settings" size={22} />
        </button>
      </div>
      {pills}
    </div>
  );
}

/** Кремова картка профілю: аватар, імʼя, рівень і звання, XP, поточне місто. */
function ProfileCard() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data!;
  const journey = useJourney();
  const city = journey.data?.cities.find((c) => c.id === journey.data?.currentCityId);
  const name = me.profile.displayName || me.firstName || 'Podróżnik';
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={() => nav('/profile')} className="card-cream mx-4 flex w-[calc(100%-2rem)] items-center gap-3 p-3.5 text-left">
      <div className="relative shrink-0">
        {me.photoUrl ? (
          <img src={me.photoUrl} alt="" className="h-16 w-16 rounded-full border-[3px] border-white object-cover shadow" />
        ) : (
          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border-[3px] border-white bg-[#CDEBFF] shadow">
            <Beaver size={58} animate={false} vectorOnly outfit={me.outfit.wear} />
          </div>
        )}
        <span className="absolute -bottom-1 -right-1 grid h-6 min-w-6 place-items-center rounded-full bg-[#2A62C9] px-1 text-[11px] font-black text-white ring-2 ring-white">{me.progress.level}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-lg font-black leading-tight">{name}</div>
        <div className="muted text-xs font-black">{t('level')} {me.progress.level} · {rankFor(me.progress.level)}</div>
        <div className="mt-1.5 flex items-center gap-2">
          <Progress value={me.progress.levelXp} max={me.progress.levelXpNeeded} height={8} color="var(--color-brand)" />
          <span className="whitespace-nowrap text-[11px] font-black">{me.progress.levelXp}/{me.progress.levelXpNeeded} XP</span>
        </div>
        {city && <div className="mt-1 flex items-center gap-1 text-xs font-black text-pl-red"><Icon name="pin" size={13} /> {city.namePl}</div>}
      </div>
    </motion.button>
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
  const daily = quests.data?.daily ?? [];
  const goalDone = me.today.xp >= me.today.goalXp;
  const bubble = goalDone ? t('home_bubble_goal') : next ? t('home_bubble_next', { topic: tr(next.topic) }) : t('home_bubble_done');
  // Три завдання дня: урок, нові слова, аудіо (якщо є серед щоденних квестів), інакше перші три.
  const PICK = ['d-lesson-1', 'd-words-10', 'd-listening-5'];
  const tasks = [...PICK.map((slug) => daily.find((q) => q.slug === slug)).filter(Boolean), ...daily.filter((q) => !PICK.includes(q.slug))].slice(0, 3) as typeof daily;
  const taskAction = (slug: string) =>
    slug === 'd-listening-5' || slug === 'd-reviews-15' ? '/practice/FIVE_MIN' : slug === 'd-dialogue-1' ? '/life' : next ? `/lesson/${next.id}` : '/learn';

  return (
    <div className="space-y-4">
      <TopStats />
      <ProfileCard />

      {/* Сцена поточного міста з Бобеком і кнопкою продовження */}
      <div className="px-4">
        {journey.isLoading ? (
          <Skeleton className="h-[330px]" />
        ) : current ? (
          <div className="overflow-hidden rounded-[28px] border-[3px] border-white shadow-[var(--shadow-card)]" style={{ background: 'var(--bg-elev)' }}>
            <div className="relative">
              <CityBanner slug={current.slug} color={current.color} height={210} shade={false} />
              <div className="absolute left-3 top-3 rounded-2xl bg-white/95 px-3 py-2 text-[#1E3346] shadow-lg">
                <div className="flex items-center gap-1 text-[11px] font-black text-[#6F8293]">
                  <Icon name="pin" size={12} /> {t('home_your_city')}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[26px] font-black leading-tight">{current.namePl}</span>
                  <span className="rounded-lg bg-pl-red px-2 py-0.5 text-xs font-black text-white">{current.cefr}</span>
                </div>
                <div className="mt-1 flex w-36 items-center gap-1.5">
                  <Progress value={current.lessonsDone} max={Math.max(1, current.lessonsTotal)} height={7} color="var(--color-brand)" />
                  <span className="text-[10px] font-black">{current.progress}%</span>
                </div>
              </div>
              <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring' }} className="absolute bottom-4 left-3 max-w-[52%] rounded-2xl rounded-br-sm bg-white px-3 py-2 text-[12px] font-bold leading-snug text-[#1E3346] shadow-lg">
                {bubble}
              </motion.div>
              <div className="absolute -bottom-1 right-1">
                <Beaver mood={goalDone ? 'cheer' : next ? 'wave' : 'travel'} outfit={me.outfit.wear} size={128} />
              </div>
            </div>
            <div className="p-3.5">
              {next && (
                <div className="mb-3 flex items-center gap-2 text-sm">
                  <Icon name={next.kind === 'BOSS' ? 'trophy' : 'book'} size={18} className="shrink-0 text-sky" />
                  <span className="muted shrink-0 font-black">{t('home_next_lesson')}:</span>
                  <span className="truncate font-black">{tr(next.title)}</span>
                </div>
              )}
              <button className="btn btn-red w-full text-lg" onClick={() => { haptic.tap(); nav(next ? `/lesson/${next.id}` : '/map'); }}>
                {next ? t('home_continue_lesson') : t('home_city_done')}
                <Icon name="play" size={20} />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Куди сьогодні? — пастельні плитки основних розділів */}
      <Section title={t('home_where_today')}>
        <div className="grid grid-cols-3 gap-2.5">
          {(
            [
              ['grammar', 'home_tile_grammar', 'home_tile_grammar_d', '/grammar', '#FFF1C9', '#F5B82E'],
              ['dictionary', 'home_tile_dict', 'home_tile_dict_d', '/dictionary', '#FFE1E1', '#F45159'],
              ['ai', 'home_tile_talk', 'home_tile_talk_d', '/ai', '#EDE4FF', '#9568F5'],
              ['story', 'home_tile_slang', 'home_tile_slang_d', '/slang', '#DFF5FF', '#2C9AD6'],
              ['city', 'home_tile_life', 'home_tile_life_d', '/life', '#DDF6EA', '#22A06B'],
              ['exam', 'home_tile_exams', 'home_tile_exams_d', '/exams', '#FFE8D6', '#F2884B'],
            ] as [IconName, TKey, TKey, string, string, string][]
          ).map(([icon, title, sub, to, bg, fg], i) => (
            <motion.button
              key={to}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { haptic.tap(); nav(to); }}
              className="flex flex-col items-center gap-1 rounded-3xl px-1.5 pb-2.5 pt-3 text-center shadow-[0_6px_14px_-8px_rgb(31_51_70/0.35)]"
              style={{ background: `linear-gradient(180deg, #fff 0%, ${bg} 100%)`, boxShadow: `inset 0 -3px 0 ${fg}33, 0 6px 14px -8px rgb(31 51 70 / 0.35)` }}
            >
              <GameIcon name={icon} size={46} />
              <span className="text-[13px] font-black leading-tight text-[#22364A]">{t(title)}</span>
              <span className="text-[10px] font-bold leading-tight" style={{ color: fg }}>{t(sub)}</span>
            </motion.button>
          ))}
        </div>
      </Section>

      {/* Завдання на сьогодні: три короткі дії з прогресом і нагородою */}
      <Section
        title={t('home_today_tasks')}
        action={<span className={cx('text-xs font-black', goalDone ? 'text-brand' : 'muted')}>{t('home_goal_short', { n: Math.min(me.today.xp, me.today.goalXp), total: me.today.goalXp })}</span>}
      >
        <div className="card divide-y divide-[var(--border)] overflow-hidden">
          {tasks.map((q, i) => {
            const done = q.status !== 'ACTIVE';
            return (
              <motion.button
                key={q.slug}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                onClick={() => { haptic.tap(); nav(done ? '/quests' : taskAction(q.slug)); }}
                className="flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-white/5"
              >
                <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full border-2', done ? 'border-brand bg-brand text-white' : 'border-[var(--border)]')}>
                  {done && <Icon name="check" size={16} strokeWidth={3} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={cx('text-[15px] font-black leading-tight', done && 'opacity-70')}>{tr(q.title)}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Progress value={q.progress} max={q.target} height={5} color={done ? 'var(--color-brand)' : 'var(--color-sky)'} />
                    <span className="muted whitespace-nowrap text-[11px] font-black">{Math.min(q.progress, q.target)}/{q.target}</span>
                  </div>
                </div>
                <span className="shrink-0 rounded-lg bg-xp px-2 py-0.5 text-xs font-black text-[#5a3d00]">+{q.xp} XP</span>
              </motion.button>
            );
          })}
          {!tasks.length && <Skeleton className="h-36" />}
        </div>
      </Section>

      {/* 4: місія дня з розділу «Польська в житті» (3–5 хв) */}
      <DailyMission />

      {/* 5: швидкий доступ до помилок і слів */}
      <div className="grid grid-cols-2 gap-3 px-4">
        <QuickTile icon="alert" color="#F45159" title={t('home_fix_mistakes')} sub={me.counters.mistakes ? t('home_mistakes_n', { n: me.counters.mistakes }) : t('home_nothing')} badge={me.counters.mistakes} onClick={() => nav('/practice/MISTAKES')} />
        <QuickTile icon="refresh" color="#35C88A" title={t('home_review_words')} sub={me.counters.dueReviews ? t('home_review_due', { n: me.counters.dueReviews }) : t('home_review_none')} badge={me.counters.dueReviews} onClick={() => nav('/practice/REVIEW')} />
        <QuickTile icon="clock" color="#55BDF4" title={t('home_five')} sub={t('home_five_d')} onClick={() => nav('/practice/FIVE_MIN')} />
        <QuickTile icon="bolt" color="#9568F5" title={t('home_speed')} sub={t('home_speed_d')} onClick={() => nav('/practice/SPEED')} />
      </div>

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
