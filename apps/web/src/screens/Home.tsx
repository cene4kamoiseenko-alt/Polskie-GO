import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { useJourney, useMe, useQuests } from '../lib/queries';
import type { VocabEntry } from '../lib/types';
import { Beaver } from '../components/Beaver';
import { CityBanner, Skyline } from '../components/Scenery';
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

/** Шапка вкладок: серія, XP, Złotki, нагадування, налаштування (компактна — з логотипом). */
export function TopStats({ compact }: { compact?: boolean }) {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  if (!me) return <div className="h-14" />;
  const round = 'grid h-10 w-10 shrink-0 place-items-center rounded-full bg-elev text-[#6B7A8A] shadow-[var(--shadow-card)]';
  return (
    <div className="safe-top flex items-center gap-2 px-4 pt-2">
      {compact && (
        <button onClick={() => nav('/')} aria-label="POLSKI GO" className="mr-1 text-[19px] font-black italic tracking-tight text-[#2A62C9] dark:text-white">
          POLSKI <span className="text-pl-red">GO</span>
        </button>
      )}
      <button onClick={() => nav('/profile')} aria-label={t('profile_streak')} className="stat-pill">
        <Icon name="flame" size={18} className="text-[#FF8A3D]" filled /> {compact ? me.progress.streak : t('home_days_n', { n: me.progress.streak })}
      </button>
      {!compact && (
        <button onClick={() => nav('/profile')} aria-label="XP" className="stat-pill">
          <Icon name="star" size={18} className="text-xp" filled /> {me.progress.xpTotal}
        </button>
      )}
      <button onClick={() => nav('/shop')} aria-label="Złotki" className="stat-pill">
        <Icon name="coin" size={18} className="text-xp-dark" /> {me.zlotki}
      </button>
      <div className="flex-1" />
      {!compact && (
        <button onClick={() => nav('/settings')} aria-label={t('set_notifications')} className={round}>
          <Icon name="clock" size={19} />
        </button>
      )}
      <button onClick={() => nav(compact ? '/premium' : '/settings')} aria-label={compact ? 'Premium' : t('profile_settings')} className={cx(round, compact && 'text-xp-dark')}>
        <Icon name={compact ? 'crown' : 'settings'} size={19} filled={compact && me.premium.active} />
      </button>
    </div>
  );
}

/** Іконки щоденних завдань за типом. */
const TASK_ICONS: Record<string, [IconName]> = {
  'd-lesson-1': ['lessons'], 'd-lessons-3': ['lessons'], 'd-xp-100': ['xp'], 'd-words-10': ['dictionary'], 'd-perfect-5': ['star'],
  'd-reviews-15': ['review'], 'd-dialogue-1': ['ai'], 'd-listening-5': ['mic'],
};

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

      {/* Привітання: великий Бобек з реплікою на тлі міста */}
      <div className="relative mx-4 overflow-hidden rounded-[28px]" style={{ background: 'linear-gradient(180deg, #CDEBFF 0%, #EAF6FF 55%, #FFF3E0 100%)' }}>
        <Skyline className="absolute inset-x-0 bottom-0 w-full opacity-60" height={120} sky={false} />
        <div className="relative flex min-h-[176px] items-end">
          <div className="z-10 flex-1 self-start p-4 pr-0">
            <h1 className="text-[26px] font-black leading-tight text-[#22364A]">{t('home_hero_hello', { name: me.profile.displayName || me.firstName || t('home_traveller') })}</h1>
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.25, type: 'spring' }} className="relative mt-3 inline-block max-w-[190px] rounded-2xl rounded-br-sm bg-white px-3 py-2 text-[13px] font-bold leading-snug text-[#22364A] shadow-md">
              {bubble}
            </motion.div>
          </div>
          <div className="-mb-1 -mr-1 shrink-0">
            <Beaver mood={goalDone ? 'cheer' : 'wave'} outfit={me.outfit.wear} size={150} />
          </div>
        </div>
      </div>

      {/* Рівень гравця */}
      <motion.button whileTap={{ scale: 0.98 }} onClick={() => nav('/profile')} className="card mx-4 flex w-[calc(100%-2rem)] items-center gap-3 p-3 text-left">
        <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#FFE6BF] to-[#FFC98A]">
          <Beaver size={52} animate={false} vectorOnly outfit={me.outfit.wear} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg font-black">{t('home_level_n', { n: me.progress.level })}</span>
            <span className="muted text-xs font-black">{me.progress.levelXp} / {me.progress.levelXpNeeded} XP</span>
          </div>
          <div className="muted mb-1.5 text-xs font-bold">{rankFor(me.progress.level)}</div>
          <Progress value={me.progress.levelXp} max={me.progress.levelXpNeeded} height={10} color="var(--color-xp)" />
        </div>
      </motion.button>

      {/* Поточне місто й наступна ціль */}
      {current && (
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => nav('/learn')} className="card mx-4 flex w-[calc(100%-2rem)] items-center gap-3 overflow-hidden p-2 pr-3 text-left">
          <CityBanner slug={current.slug} color={current.color} height={64} shade={false} className="w-24 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1">
            <div className="font-black">{t('home_now_in', { city: current.namePl })}</div>
            <div className="muted truncate text-xs font-bold">
              {(() => { const nc = journey.data?.cities.filter((c) => c.order > (current?.order ?? 0)).sort((x, y) => x.order - y.order)[0]; return nc ? t('home_next_goal', { city: nc.namePl }) : tr(current.theme); })()}
            </div>
            <Progress value={current.lessonsDone} max={Math.max(1, current.lessonsTotal)} height={6} color="var(--color-brand)" className="mt-1.5" />
          </div>
          <Icon name="chevron-right" size={20} className="shrink-0 text-[#A3AEBB]" />
        </motion.button>
      )}

      <div className="px-4">
        <button className="btn btn-red w-full text-lg" onClick={() => { haptic.tap(); nav(next ? `/lesson/${next.id}` : '/map'); }}>
          {next ? t('home_continue_learning') : t('home_city_done')}
          <Icon name="arrow-right" size={22} strokeWidth={2.6} />
        </button>
      </div>

      {/* Сьогоднішні завдання */}
      <Section title={t('home_today_tasks')} action={<button className="text-sm font-black text-sky-dark" onClick={() => nav('/quests')}>{t('home_see_all')}</button>}>
        <div className="card divide-y divide-[var(--border)] overflow-hidden">
          {tasks.map((q, i) => {
            const done = q.status !== 'ACTIVE';
            const [icon] = TASK_ICONS[q.slug] ?? (['quests'] as [IconName]);
            return (
              <motion.button
                key={q.slug}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                onClick={() => { haptic.tap(); nav(done ? '/quests' : taskAction(q.slug)); }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left active:bg-black/5"
              >
                <span className="relative shrink-0">
                  <GameIcon name={icon} size={38} inactive={done} />
                  {done && <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-brand text-white ring-2 ring-white"><Icon name="check" size={12} strokeWidth={3} /></span>}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={cx('text-[15px] font-black leading-tight', done && 'opacity-60')}>{tr(q.title)}</div>
                  <div className="muted text-[11px] font-black">{Math.min(q.progress, q.target)}/{q.target}</div>
                </div>
                <span className="shrink-0 text-sm font-black text-brand-dark">+{q.xp} XP</span>
                <Icon name="chevron-right" size={18} className="shrink-0 text-[#A3AEBB]" />
              </motion.button>
            );
          })}
          {!tasks.length && <Skeleton className="h-36" />}
        </div>
      </Section>

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
