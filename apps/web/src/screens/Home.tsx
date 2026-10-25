import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { useJourney, useMe, useQuests, useRefreshAll } from '../lib/queries';
import type { VocabEntry } from '../lib/types';
import { Beaver } from '../components/Beaver';
import { GameIcon, type IconName } from '../components/GameIcon';
import { Icon, type LineIconName } from '../components/Icon';
import { Progress, Section, Skeleton, SpeakButton, cx, useToast } from '../components/ui';
import { Art, type ArtName } from '../components/GameArt';
import { CityHero } from '../components/CityHero';
import { sfx } from '../lib/audio';
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

/** Логотип-вордмарк для шапки: POLSKI GO з прапорцем. */
export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 150 30" height={size * 1.36} aria-label="POLSKI GO" role="img">
      <g fontFamily="Nunito, ui-rounded, system-ui, sans-serif" fontWeight="900" fontStyle="italic" fontSize="24" letterSpacing="-0.6">
        <text x="2" y="24" fill="#0E2758" stroke="#0E2758" strokeWidth="5" strokeLinejoin="round">POLSKI</text>
        <text x="2" y="22" fill="#FFFFFF" stroke="#2B6CD6" strokeWidth="1.2" paintOrder="stroke">POLSKI</text>
        <text x="91" y="24" fill="#0E2758" stroke="#0E2758" strokeWidth="5" strokeLinejoin="round">GO</text>
        <text x="91" y="22" fill="#FF5265" stroke="#FFFFFF" strokeWidth="1.4" paintOrder="stroke">GO</text>
      </g>
      <g transform="translate(126 6)">
        <path d="M0 2 Q6 -1 12 2 T22 2 V14 Q16 17 12 14 T0 14 Z" fill="#E5383B" stroke="#0E2758" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M0 2 Q6 -1 12 2 T22 2 V8 Q16 11 12 8 T0 8 Z" fill="#fff" />
      </g>
    </svg>
  );
}

/** Шапка вкладок: логотип, серія, Złotki, Premium, налаштування. */
export function TopStats({ compact }: { compact?: boolean }) {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  void compact;
  if (!me) return <div className="h-14" />;
  const round = 'grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full border border-[var(--border)] bg-elev shadow-[var(--shadow-card)]';
  return (
    <div className="safe-top flex items-center gap-1.5 px-4 pt-2">
      <button onClick={() => nav('/')} aria-label="POLSKI GO" className="mr-auto min-w-0 shrink">
        <Wordmark size={19} />
      </button>
      <button onClick={() => nav('/profile')} aria-label={t('profile_streak')} className="hud-pill">
        <Art name="flame" size={22} /> <span className="text-coral">{me.progress.streak}</span>
      </button>
      <button onClick={() => nav('/shop')} aria-label="Złotki" className="hud-pill">
        <Art name="coin" size={22} /> <span className="text-xp">{me.zlotki}</span>
      </button>
      <button onClick={() => nav('/premium')} aria-label="Premium" className={round}>
        <Art name="crown" size={24} />
      </button>
      <button onClick={() => nav('/settings')} aria-label={t('profile_settings')} className={cx(round, 'text-[var(--text-muted)]')}>
        <Icon name="settings" size={20} />
      </button>
    </div>
  );
}

/** Ілюстрація щоденного завдання за типом. */
const TASK_ART: Record<string, ArtName> = {
  'd-lesson-1': 'book', 'd-lessons-3': 'book', 'd-xp-100': 'star', 'd-words-10': 'chat', 'd-perfect-5': 'target',
  'd-reviews-15': 'books', 'd-dialogue-1': 'chat', 'd-listening-5': 'gamepad',
};

export function HomeScreen() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const toast = useToast();
  const refresh = useRefreshAll();
  const me = useMe().data!;
  const journey = useJourney();
  const quests = useQuests();
  const wod = useQuery({ queryKey: ['wod'], queryFn: () => api<VocabEntry | null>('/vocab/word-of-day'), staleTime: 3600_000 });
  const [claiming, setClaiming] = useState(false);

  const current = journey.data?.cities.find((c) => c.id === journey.data?.currentCityId);
  const next = journey.data?.nextLesson;
  const daily = quests.data?.daily ?? [];
  const chest = quests.data?.chest;
  const taskAction = (slug: string) =>
    slug === 'd-listening-5' || slug === 'd-reviews-15' ? '/practice/FIVE_MIN' : slug === 'd-dialogue-1' ? '/life' : next ? `/lesson/${next.id}` : '/learn';
  const day = Math.floor(Date.now() / 86_400_000);
  const cityPool = journey.data?.cities.filter((c) => c.hasContent) ?? [];
  const cityOfDay = cityPool.length ? cityPool[day % cityPool.length] : undefined;
  const rank = rankFor(me.progress.level);

  const claimChest = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      const r = await api<{ xp: number; zlotki: number }>('/quests/daily-chest/claim', { body: {} });
      haptic.success();
      sfx.win();
      toast(t('home_chest_got', { xp: r.xp, zl: r.zlotki }), '🎁');
      await refresh();
    } catch {
      await refresh();
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-5 pb-2">
      <TopStats />

      {/* Герой: ілюстроване поточне місто, бобер-мандрівник, місто, рівень і головна дія */}
      <div className="hero-card mx-4">
        <CityHero slug={current?.slug ?? 'warszawa'} color={current?.color ?? '#36B9FF'} name={current?.namePl ?? 'Warszawa'} height={236}>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[64%] bg-gradient-to-l from-[#07182c]/55 to-transparent" />
          <motion.div className="absolute -bottom-2 left-0" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
            <Beaver mood="map" size={148} outfit={me.outfit.wear} />
          </motion.div>
          <div className="absolute right-2.5 top-2.5 w-[58%] space-y-2">
            <button onClick={() => { haptic.tap(); nav('/map'); }} className="glass-card flex w-full items-center gap-2 px-3 py-2 text-left">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black text-[#cfe0f2]">{t('home_cur_city')}</div>
                <div className="flex items-center gap-1 truncate text-[22px] font-black leading-tight text-white">
                  <Icon name="pin" size={18} className="shrink-0 text-coral" filled /> {current?.namePl ?? '—'}
                </div>
              </div>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/25 text-white"><Icon name="chevron-right" size={16} /></span>
            </button>
            <button onClick={() => { haptic.tap(); nav('/profile'); }} className="glass-card flex w-full items-center gap-2 px-2.5 py-2 text-left">
              <Art name="shield" size={36} label={String(me.progress.level)} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-black text-white">{t('home_level_n', { n: me.progress.level })} · <span className="text-sky">{rank}</span></div>
                <div className="mt-1 flex items-center gap-2">
                  <Progress value={me.progress.levelXp} max={me.progress.levelXpNeeded} height={8} color="linear-gradient(90deg,#25D79B,#7CF0C3)" />
                  <span className="shrink-0 text-[11px] font-black text-[#cfe0f2]">{me.progress.levelXp}/{me.progress.levelXpNeeded}</span>
                </div>
              </div>
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { haptic.tap(); nav(next ? `/lesson/${next.id}` : '/map'); }}
            className="btn btn-red absolute bottom-3 right-2.5 w-[64%] !min-h-[50px] !gap-1.5 !px-2.5 text-[15px]"
          >
            <Icon name="play" size={16} filled /> <span className="truncate">{next ? t('home_continue_lesson') : t('home_city_done')}</span> <Icon name="chevron-right" size={16} className="shrink-0" />
          </motion.button>
        </CityHero>
      </div>

      {/* Три лічильники */}
      <div className="grid grid-cols-3 gap-2 px-4">
        <button onClick={() => nav('/profile')} className="stat-card">
          <Art name="flame" size={30} />
          <span className="min-w-0 text-left"><span className="block text-[20px] font-black leading-none">{me.progress.streak}</span><span className="muted block text-[10.5px] font-bold leading-tight">{t('home_stat_streak')}</span></span>
        </button>
        <button onClick={() => nav('/shop')} className="stat-card">
          <Art name="coin" size={30} />
          <span className="min-w-0 flex-1 text-left"><span className="block text-[20px] font-black leading-none">{me.zlotki}</span><span className="muted block text-[10.5px] font-bold leading-tight">{t('home_stat_zlotki')}</span></span>
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[var(--border)] text-xs font-black">+</span>
        </button>
        <button onClick={() => nav('/profile')} className="stat-card">
          <Art name="crown" size={28} />
          <span className="min-w-0 text-left"><span className="block text-[20px] font-black leading-none">{me.progress.level}</span><span className="muted block text-[10.5px] font-bold leading-tight">{rank}</span></span>
        </button>
      </div>

      {/* Сьогодні: щоденні завдання + велика нагорода */}
      <Section title={t('home_today')} action={<button className="flex items-center gap-1 text-sm font-black text-sky" onClick={() => nav('/quests')}>{t('home_all_tasks')} <Icon name="arrow-right" size={16} /></button>}>
        <div className="relative grid grid-cols-4 gap-2">
          <div className="pointer-events-none absolute left-[8%] right-[33%] top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand/70 to-sky/40" />
          {daily.slice(0, 3).map((q, i) => {
            const done = q.status !== 'ACTIVE' && q.status !== 'NEW';
            return (
              <motion.button
                key={q.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i }}
                onClick={() => { haptic.tap(); nav(done ? '/quests' : taskAction(q.slug)); }}
                className={cx('task-card relative flex flex-col items-center gap-1 px-1 pb-2 pt-3 text-center', done && 'is-done')}
              >
                <span className={cx('absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full border-2', done ? 'border-brand bg-brand text-[#07182c]' : 'border-white/40')}>
                  {done && <Icon name="check" size={12} strokeWidth={3.2} />}
                </span>
                <Art name={TASK_ART[q.slug] ?? 'star'} size={40} />
                <span className="line-clamp-2 min-h-[28px] text-[11.5px] font-black leading-tight">{tr(q.title)}</span>
                <span className="flex items-center gap-0.5 rounded-full bg-[#07182c]/60 px-1.5 py-0.5 text-[11px] font-black text-xp"><Art name="coin" size={13} />+{q.zlotki}</span>
              </motion.button>
            );
          })}
          {!daily.length && [0, 1, 2].map((i) => <Skeleton key={i} className="h-[118px]" />)}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => (chest?.ready && !chest.claimed ? void claimChest() : nav('/quests'))}
            className={cx('chest-card relative flex flex-col items-center px-1 pb-2 pt-1.5 text-center', chest?.ready && !chest.claimed && 'is-ready')}
            aria-label={t('home_big_reward')}
          >
            <motion.span animate={chest?.ready && !chest.claimed ? { rotate: [0, -8, 8, -4, 0], scale: [1, 1.08, 1] } : undefined} transition={{ repeat: Infinity, duration: 1.6, repeatDelay: 0.6 }}>
              <Art name="gift" size={48} />
            </motion.span>
            <span className="text-[11px] font-black leading-tight text-white">{t('home_big_reward')}</span>
            <span className="mt-0.5 text-[9.5px] font-bold leading-tight text-[#cfe0f2]">
              {chest?.claimed ? `✓ ${t('home_claimed')}` : chest?.ready ? t('home_claim') : `${chest?.done ?? 0}/${chest?.total ?? 3} · ${t('home_big_reward_d')}`}
            </span>
          </motion.button>
        </div>
      </Section>

      {/* Швидкий старт */}
      <Section title={t('home_quick_start')}>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ['book', 'home_qs_lessons', 'home_qs_lessons_d', '/learn', 'linear-gradient(160deg,#FF6A8A 0%,#B8325F 55%,#5B1E52 100%)'],
              ['scroll', 'home_qs_quests', 'home_qs_quests_d', '/quests', 'linear-gradient(160deg,#B48CFF 0%,#6B45D8 55%,#2E2273 100%)'],
              ['map-pin', 'home_qs_map', 'home_qs_map_d', '/map', 'linear-gradient(160deg,#5CC8FF 0%,#2A7BD8 55%,#173E7A 100%)'],
            ] as [ArtName, TKey, TKey, string, string][]
          ).map(([art, title, sub, to, bg], i) => (
            <motion.button
              key={to}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { haptic.tap(); nav(to); }}
              className="qs-tile relative h-[104px] overflow-hidden rounded-[20px] p-2.5 text-left"
              style={{ background: bg }}
            >
              <svg viewBox="0 0 120 40" className="absolute inset-x-0 bottom-0 w-full opacity-25" aria-hidden><path d="M0 40 V26 h10 v-8 h8 v8 h10 V14 l6 -8 l6 8 v12 h12 v-10 h10 v10 h14 V10 l4 -6 l4 6 v16 h12 v-6 h12 V40 Z" fill="#07182c" /></svg>
              <span className="absolute -right-1 -top-1"><Art name={art} size={52} /></span>
              <span className="absolute bottom-2 left-2.5 right-8">
                <span className="block text-[17px] font-black leading-tight text-white drop-shadow">{t(title)}</span>
                <span className="block truncate text-[10.5px] font-bold text-white/85">{t(sub)}</span>
              </span>
              <span className="absolute bottom-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-black/25 text-white"><Icon name="chevron-right" size={14} /></span>
            </motion.button>
          ))}
        </div>
      </Section>

      {/* Місто дня + слово дня */}
      <div className="grid grid-cols-[1.12fr_1fr] gap-2.5 px-4">
        {cityOfDay ? (
          <button onClick={() => { haptic.tap(); nav('/map'); }} className="hero-card relative block h-[150px] overflow-hidden text-left">
            <CityHero slug={cityOfDay.slug} color={cityOfDay.color} name="" height={150} evening sign={false} className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07182c] via-[#07182c]/30 to-transparent" />
            <div className="absolute left-2.5 top-2 flex items-center gap-1 text-[12px] font-black text-white"><Art name="star" size={18} /> {t('home_city_of_day')}</div>
            <div className="absolute inset-x-2.5 bottom-2">
              <div className="text-[22px] font-black leading-none text-white">{cityOfDay.namePl}</div>
              <div className="line-clamp-2 text-[11px] font-bold leading-tight text-[#cfe0f2]">{tr(cityOfDay.theme)}</div>
            </div>
          </button>
        ) : (
          <Skeleton className="h-[150px]" />
        )}
        <div className="wod-card relative h-[150px] overflow-hidden p-2.5">
          <div className="flex items-center gap-1 text-[12px] font-black text-white"><Art name="book" size={18} /> {t('home_word_of_day')}</div>
          {wod.data ? (
            <>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="truncate text-[22px] font-black leading-none text-white">{wod.data.pl}</span>
                <SpeakButton text={wod.data.pl} url={wod.data.audioUrl} size="sm" />
              </div>
              <div className="mt-1 line-clamp-2 pr-10 text-[12px] font-bold leading-tight text-[#cfe0f2]">{tr(wod.data.translations)}</div>
            </>
          ) : (
            <Skeleton className="mt-2 h-10" />
          )}
          <span className="absolute -bottom-1 -right-1"><Art name="suitcase" size={58} /></span>
        </div>
      </div>

      {/* Місія дня з розділу «Польська в житті» (3–5 хв) */}
      <DailyMission />

      {/* Тренування: помилки, повторення, 5 хвилин, швидкий раунд */}
      <Section title={t('home_more_practice')}>
        <div className="grid grid-cols-2 gap-2.5">
          <QuickTile icon="alert" color="#FF5265" title={t('home_fix_mistakes')} sub={me.counters.mistakes ? t('home_mistakes_n', { n: me.counters.mistakes }) : t('home_nothing')} badge={me.counters.mistakes} onClick={() => nav('/practice/MISTAKES')} />
          <QuickTile icon="refresh" color="#25D79B" title={t('home_review_words')} sub={me.counters.dueReviews ? t('home_review_due', { n: me.counters.dueReviews }) : t('home_review_none')} badge={me.counters.dueReviews} onClick={() => nav('/practice/REVIEW')} />
          <QuickTile icon="clock" color="#36B9FF" title={t('home_five')} sub={t('home_five_d')} onClick={() => nav('/practice/FIVE_MIN')} />
          <QuickTile icon="bolt" color="#9D69FF" title={t('home_speed')} sub={t('home_speed_d')} onClick={() => nav('/practice/SPEED')} />
        </div>
      </Section>

      {/* Розділи */}
      <Section title={t('home_more_sections')}>
        <div className="grid grid-cols-4 gap-2">
          {(
            [
              ['grammar', 'home_tile_grammar', '/grammar'],
              ['dictionary', 'home_tile_dict', '/dictionary'],
              ['ai', 'home_tile_talk', '/ai'],
              ['story', 'home_tile_slang', '/slang'],
              ['city', 'home_tile_life', '/life'],
              ['exam', 'home_tile_exams', '/exams'],
              ['wardrobe', 'home_shop', '/shop'],
              ['leaderboard', 'home_leaderboard', '/social'],
            ] as [IconName, TKey, string][]
          ).map(([icon, key, to]) => (
            <button key={to} onClick={() => { haptic.tap(); nav(to); }} className="section-tile flex flex-col items-center gap-1 rounded-2xl px-1 py-2.5 transition active:scale-95">
              <GameIcon name={icon} size={40} />
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
        <span className="muted block text-[11px] font-bold leading-tight">{sub}</span>
      </span>
      {!!badge && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-pl-red px-1 text-[11px] font-black text-white">{badge}</span>}
    </button>
  );
}
