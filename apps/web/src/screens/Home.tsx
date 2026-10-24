import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { useJourney, useMe, useQuests } from '../lib/queries';
import type { VocabEntry } from '../lib/types';
import { Beaver } from '../components/Beaver';
import { CityBanner } from '../components/Scenery';
import { GameIcon, ICON_COLORS, type IconName } from '../components/GameIcon';
import { Progress, Section, Skeleton, SpeakButton } from '../components/ui';
import { haptic } from '../lib/telegram';

export const RANKS: [number, string][] = [
  [40, 'Mistrz polszczyzny'],
  [20, 'Znawca Polski'],
  [10, 'Podróżnik'],
  [5, 'Odkrywca Polski'],
  [1, 'Turysta'],
];
export const rankFor = (level: number) => RANKS.find(([l]) => level >= l)![1];

/** Компактна панель показників для вкладок (серія, XP, Złotki, Premium, налаштування). */
export function TopStats() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  if (!me) return <div className="h-12" />;
  const pill = (icon: IconName, value: number | string, onClick: () => void, label: string, color?: string) => (
    <button onClick={onClick} aria-label={label} className="flex items-center gap-1 rounded-full bg-elev py-1 pl-1 pr-3 text-[15px] font-black shadow-[0_3px_10px_-4px_rgba(34,54,74,0.35)]" style={{ color }}>
      <GameIcon name={icon} size={26} />
      {value}
    </button>
  );
  return (
    <div className="flex items-center gap-2 px-4 pt-2">
      {pill('fire', me.progress.streak, () => nav('/profile'), t('profile_streak'), '#E2701F')}
      {pill('star', me.progress.xpTotal, () => nav('/profile'), 'XP', '#D98A00')}
      {pill('coin', me.zlotki, () => nav('/shop'), 'Złotki', '#B26A12')}
      <div className="flex-1" />
      <button onClick={() => nav('/premium')} aria-label="Premium">
        <GameIcon name="premium" size={34} />
      </button>
      <button onClick={() => nav('/settings')} aria-label={t('profile_settings')}>
        <GameIcon name="settings" size={34} />
      </button>
    </div>
  );
}

/** Шапка гравця на головному екрані. */
function PlayerHeader() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data!;
  const name = me.profile.displayName || me.firstName || 'Podróżnik';
  return (
    <div className="mx-4 mt-2 flex items-center gap-3 rounded-3xl bg-elev p-3 shadow-[var(--shadow-card)]">
      <button onClick={() => nav('/profile')} className="relative shrink-0" aria-label={t('nav_profile')}>
        {me.photoUrl ? (
          <img src={me.photoUrl} alt="" className="h-14 w-14 rounded-2xl border-[3px] border-xp object-cover" />
        ) : (
          <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border-[3px] border-xp bg-[#FFE9C7]">
            <Beaver size={54} outfit={me.outfit.wear} animate={false} vectorOnly />
          </div>
        )}
        <span className="absolute -bottom-1.5 -right-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-sky px-1 text-[11px] font-black text-white ring-2 ring-white">{me.progress.level}</span>
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-lg font-black leading-tight">{name}</div>
        <div className="muted truncate text-xs font-bold">
          {t('level')} {me.progress.level} · {rankFor(me.progress.level)}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Progress value={me.progress.levelXp} max={me.progress.levelXpNeeded} height={8} color="var(--color-pl-red)" />
          <span className="whitespace-nowrap text-[10px] font-black opacity-70">
            {me.progress.levelXp}/{me.progress.levelXpNeeded} XP
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 text-sm font-black">
        <span className="flex items-center gap-1 text-[#E2701F]">
          <GameIcon name="fire" size={22} /> {me.progress.streak}
        </span>
        <button onClick={() => nav('/shop')} className="flex items-center gap-1 text-[#B26A12]">
          <GameIcon name="coin" size={22} /> {me.zlotki}
        </button>
      </div>
    </div>
  );
}

type Tile = { icon: IconName; title: TKey; desc: string; to: string; badge?: number };

function CategoryTile({ tile, delay }: { tile: Tile; delay: number }) {
  const { t } = useT();
  const nav = useNavigate();
  const c = ICON_COLORS[tile.icon];
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileTap={{ scale: 0.95 }}
      onClick={() => { haptic.tap(); nav(tile.to); }}
      className="relative flex flex-col items-center gap-1.5 rounded-3xl px-2 pb-3 pt-4 text-center"
      style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${c} 14%, white), color-mix(in srgb, ${c} 26%, white))`, boxShadow: `0 4px 0 color-mix(in srgb, ${c} 30%, white), 0 10px 18px -12px ${c}` }}
    >
      <GameIcon name={tile.icon} size={46} />
      <span className="text-[15px] font-black leading-tight text-navy">{t(tile.title)}</span>
      <span className="text-[11px] font-bold leading-tight text-navy/60">{tile.desc}</span>
      {!!tile.badge && <span className="absolute right-2 top-2 grid h-6 min-w-6 place-items-center rounded-full bg-pl-red px-1.5 text-xs font-black text-white">{tile.badge}</span>}
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
  const claimable = [...daily, ...(quests.data?.weekly ?? []), ...(quests.data?.story ?? [])].filter((q) => q.status === 'COMPLETED');
  // Найближча нагорода: готова до отримання або квест, найближчий до виконання.
  const nearest =
    claimable[0] ??
    [...daily, ...(quests.data?.weekly ?? [])].filter((q) => q.status === 'ACTIVE').sort((a, b) => b.progress / b.target - a.progress / a.target)[0];

  const tiles: Tile[] = [
    { icon: 'quests', title: 'quests_title', desc: t('home_daily_d', { done: daily.filter((q) => q.status !== 'ACTIVE').length, total: daily.length }), to: '/quests', badge: claimable.length },
    { icon: 'dictionary', title: 'home_dictionary', desc: t('home_dictionary_d', { n: me.progress.wordsLearned }), to: '/dictionary' },
    { icon: 'ai', title: 'home_ai', desc: t('home_ai_d'), to: '/ai' },
    { icon: 'grammar', title: 'home_grammar', desc: t('home_grammar_d'), to: '/grammar' },
    { icon: 'exam', title: 'home_exams', desc: t('home_exams_d'), to: '/exams' },
    { icon: 'review', title: 'home_review', desc: me.counters.dueReviews ? t('home_review_due', { n: me.counters.dueReviews }) : t('home_review_none'), to: '/practice/REVIEW', badge: me.counters.dueReviews },
  ];

  return (
    <div className="space-y-5 pb-4">
      <PlayerHeader />

      {/* Мета дня */}
      <div className="mx-4 flex items-center gap-3 rounded-3xl bg-elev px-4 py-3 shadow-[var(--shadow-card)]">
        <GameIcon name={me.today.xp >= me.today.goalXp ? 'check' : 'timer'} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-black">{me.today.xp >= me.today.goalXp ? t('home_goal_done') : t('home_daily_goal')}</span>
            <span className="whitespace-nowrap text-xs font-black text-xp-dark">{Math.min(me.today.xp, me.today.goalXp)}/{me.today.goalXp} XP</span>
          </div>
          <Progress value={me.today.xp} max={me.today.goalXp} height={9} color="var(--color-xp)" className="mt-1.5" />
        </div>
      </div>

      {/* Поточне місто — ілюстрована картка-локація */}
      <div className="px-4">
        {journey.isLoading ? (
          <Skeleton className="h-64" />
        ) : current ? (
          <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="overflow-hidden rounded-[28px] bg-elev shadow-[var(--shadow-card)]">
            <CityBanner slug={current.slug} color={current.color} height={190}>
              <div className="absolute left-4 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-navy shadow">
                <GameIcon name="map" size={20} /> {t('home_your_city')}
              </div>
              <div className="absolute bottom-3 left-4 text-white">
                <div className="text-3xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">{current.namePl}</div>
                <div className="text-sm font-bold drop-shadow">{tr(current.theme)}</div>
              </div>
              <div className="absolute -bottom-2 right-2">
                <Beaver mood={me.progress.activeToday ? 'happy' : 'wave'} outfit={me.outfit.wear} size={118} />
              </div>
            </CityBanner>
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <Progress value={current.progress} height={12} />
                <span className="text-sm font-black">{current.progress}%</span>
              </div>
              {next && (
                <div className="muted truncate text-sm font-bold">
                  {t('home_next_lesson')}: <span className="text-navy dark:text-white">{tr(next.title)}</span>
                </div>
              )}
              <button className="btn btn-red w-full text-lg" onClick={() => { haptic.tap(); nav(next ? `/lesson/${next.id}` : '/map'); }}>
                {next ? t('home_continue_trip') : t('home_city_done')} →
              </button>
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* Категорії */}
      <Section title={t('home_categories')}>
        <div className="grid grid-cols-3 gap-3">
          {tiles.map((tile, i) => (
            <CategoryTile key={tile.to} tile={tile} delay={0.04 * i} />
          ))}
        </div>
      </Section>

      {/* Найближча нагорода */}
      {nearest && (
        <div className="px-4">
          <button onClick={() => nav('/quests')} className="flex w-full items-center gap-3 overflow-hidden rounded-3xl p-4 text-left text-navy shadow-[var(--shadow-card)]" style={{ background: 'linear-gradient(120deg, #FFF3D0, #FFE2A6)' }}>
            <motion.div animate={nearest.status === 'COMPLETED' ? { rotate: [0, -8, 8, -4, 0] } : undefined} transition={{ repeat: Infinity, duration: 1.6, repeatDelay: 1 }}>
              <GameIcon name="rewards" size={52} />
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black uppercase tracking-wide text-[#B26A12]">{t('home_next_reward')}</div>
              <div className="truncate font-black">{tr(nearest.title)}</div>
              <div className="mt-1 flex items-center gap-2">
                <Progress value={nearest.progress} max={nearest.target} height={8} color="var(--color-xp)" />
                <span className="text-xs font-black">{nearest.progress}/{nearest.target}</span>
              </div>
            </div>
            <div className="rounded-2xl bg-white/80 px-2.5 py-1.5 text-center text-sm font-black text-[#D98A00]">
              +{nearest.xp}
              <div className="text-[10px]">XP</div>
            </div>
          </button>
        </div>
      )}

      {/* Швидкі тренування */}
      <Section title={t('home_practice')}>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              ['mistakes', 'home_mistakes', '/practice/MISTAKES', me.counters.mistakes],
              ['timer', 'home_five', '/practice/FIVE_MIN', 0],
              ['speed', 'home_speed', '/practice/SPEED', 0],
            ] as [IconName, TKey, string, number][]
          ).map(([icon, key, to, badge]) => (
            <button key={to} onClick={() => nav(to)} className="card relative flex flex-col items-center gap-1.5 px-2 py-3">
              <GameIcon name={icon} size={40} />
              <span className="text-xs font-black leading-tight">{t(key)}</span>
              {!!badge && <span className="absolute right-2 top-2 rounded-full bg-pl-red px-1.5 text-[11px] font-black text-white">{badge}</span>}
            </button>
          ))}
        </div>
      </Section>

      {/* Слово дня */}
      {wod.data && (
        <Section title={t('home_word_of_day')}>
          <div className="card flex items-center gap-3 p-4">
            <div className="icon-tile bg-[#FFF1D6] text-3xl">{wod.data.emoji ?? '📖'}</div>
            <div className="min-w-0 flex-1">
              <div className="text-xl font-black">{wod.data.pl}</div>
              <div className="muted text-sm font-bold">
                [{wod.data.pronunciation}] · {tr(wod.data.translations)}
              </div>
              {wod.data.examples[0] && <div className="mt-1 text-sm font-semibold italic">„{wod.data.examples[0].pl}”</div>}
            </div>
            <SpeakButton text={wod.data.pl} url={wod.data.audioUrl} />
          </div>
        </Section>
      )}

      {/* Ще розділи */}
      <Section title={t('home_more')}>
        <div className="grid grid-cols-4 gap-2">
          {(
            [
              ['wardrobe', 'home_shop', '/shop'],
              ['house', 'home_house', '/house'],
              ['diary', 'home_diary', '/diary'],
              ['leaderboard', 'home_leaderboard', '/social'],
            ] as [IconName, TKey, string][]
          ).map(([icon, key, to]) => (
            <button key={to} onClick={() => { haptic.tap(); nav(to); }} className="flex flex-col items-center gap-1 py-1">
              <GameIcon name={icon} size={44} />
              <span className="text-center text-[11px] font-black leading-tight">{t(key)}</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}
