/**
 * Профіль (референси «Профіль» і «Статистика»): картка мандрівника з містом, рівень польської
 * (лише через іспити), лічильники, гардероб, швидкі розділи, медалі за рівнями,
 * статистика 7/30/90 днів за реальними даними, шість навичок та історія занять.
 */
import { useState } from 'react';
import { motion } from '../lib/motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge, achTier } from '../components/Illustrations';
import { Icon, type LineIconName } from '../components/Icon';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { useJourney, useMe, useShop } from '../lib/queries';
import { haptic } from '../lib/telegram';
import { Beaver } from '../components/Beaver';
import { Art, type ArtName } from '../components/GameArt';
import { CityHero } from '../components/CityHero';
import { LEVEL_COLORS } from './Onboarding';
import { XpChart } from '../components/XpChart';
import { EmptyState, Progress, Section, Skeleton, cx } from '../components/ui';
import { rankFor, TopStats } from './Home';
import { inkOn } from '../lib/color';

type Stats = {
  days: { day: string; xp: number; lessons: number; minutes: number; correct: number; exercises: number }[];
  totals: { xp: number; lessons: number; minutes: number; accuracy: number };
  skills: { skill: string; mastery: number; attempts: number; accuracy: number }[];
  vocabulary: Record<string, number>;
  history: { id: string; mode: string; lesson: { title: never; kind: string } | null; correct: number; total: number; xp: number; finishedAt: string }[];
};
type Ach = { slug: string; title: never; description: never; icon: string; threshold: number; progress: number; unlockedAt: string | null; isNew: boolean; zlotki: number };

/** Шість навичок: групи вправ зводяться до основних мовних умінь. */
const SKILLS: { id: string; key: TKey; groups: string[]; icon: LineIconName; color: string }[] = [
  { id: 'vocab', key: 'sk_vocab', groups: ['vocab', 'review'], icon: 'book', color: '#F2884B' },
  { id: 'grammar', key: 'sk_grammar', groups: ['grammar', 'usage'], icon: 'layers', color: '#9D69FF' },
  { id: 'listening', key: 'sk_listening', groups: ['listening'], icon: 'headphones', color: '#FF5265' },
  { id: 'speaking', key: 'sk_speaking', groups: ['speaking', 'dialogue', 'situation'], icon: 'chat', color: '#25D79B' },
  { id: 'reading', key: 'sk_reading', groups: ['reading'], icon: 'book', color: '#36B9FF' },
  { id: 'writing', key: 'sk_writing', groups: ['writing'], icon: 'target', color: '#FFC857' },
];

export default function ProfileScreen() {
  const { t, tr, date } = useT();
  const nav = useNavigate();
  const me = useMe().data!;
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const stats = useQuery({ queryKey: ['stats', range], queryFn: () => api<Stats>(`/me/stats?days=${range}`) });
  const ach = useQuery({ queryKey: ['achievements'], queryFn: () => api<Ach[]>('/achievements') });
  const name = me.profile.displayName || me.firstName;
  const journey = useJourney();
  const shop = useShop();
  const citiesDone = journey.data?.cities.filter((c) => c.completed).length ?? 0;
  const city = me.progress.currentCity;
  const cityRow = journey.data?.cities.find((c) => c.slug === city?.slug);
  const WEAR = ['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'COSTUME'];
  const owned = (shop.data?.items ?? []).filter((i) => i.owned && WEAR.includes(i.slot)).sort((a, b) => Number(b.equipped) - Number(a.equipped));

  const skillValue = (groups: string[]) => {
    const rows = (stats.data?.skills ?? []).filter((s) => groups.includes(s.skill.split('.')[0]));
    return rows.length ? Math.round(rows.reduce((s, r) => s + r.mastery, 0) / rows.length) : 0;
  };
  const medals = [...(ach.data ?? [])]
    .sort((a, b) => Number(!!b.unlockedAt) - Number(!!a.unlockedAt) || b.progress / b.threshold - a.progress / a.threshold)
    .slice(0, 4);

  return (
    <div className="space-y-5 pb-4">
      <TopStats compact />

      {/* Картка мандрівника */}
      <div className="hero-card relative mx-4">
        <CityHero slug={city?.slug ?? 'krakow'} color={cityRow?.color ?? '#36B9FF'} name="" sign={false} evening skyline height={150} className="absolute inset-0 !h-full" />
        {/* затемнення під текстом (AA для підписів), праворуч місто просвічує */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(48,34,112,0.96) 0%, rgba(36,62,150,0.92) 56%, rgba(20,50,110,0.8) 78%, rgba(20,50,110,0.4) 100%)' }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(70% 90% at 92% 10%, rgba(255,200,130,0.28), transparent 60%)' }} />
        <div className="relative flex items-center gap-3 p-3.5 pr-12">
          <button onClick={() => { haptic.tap(); nav('/shop'); }} className="relative shrink-0" aria-label={t('profile_wardrobe')}>
            <span className={cx('block h-[84px] w-[84px] overflow-hidden rounded-full border-[3px] bg-gradient-to-b from-dawn-sky to-dawn-sand shadow-lg', me.outfit.wear.FRAME === 'frame-gold' ? 'border-xp' : me.outfit.wear.FRAME === 'frame-green' ? 'border-brand' : 'border-white')}>
              {me.photoUrl ? <img src={me.photoUrl} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-end justify-center"><Beaver size={78} outfit={me.outfit.wear} animate={false} /></span>}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-sky text-night shadow">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20l4-1 10-10-3-3L5 16z" /></svg>
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className={cx('line-clamp-2 break-words font-black leading-[1.1] text-white drop-shadow', name.length > 18 ? 'text-[18px]' : name.length > 12 ? 'text-[21px]' : 'text-[24px]')}>{name}</h1>
            <div className="text-[14px] font-black leading-tight text-mist">{t('home_level_n', { n: me.progress.level })} · <span className="text-sky">{rankFor(me.progress.level)}</span></div>
            <div className="mt-1.5 flex items-center gap-2">
              <Progress value={me.progress.levelXp} max={me.progress.levelXpNeeded} height={9} color="linear-gradient(90deg,#25D79B,#7CF0C3)" />
              <span className="shrink-0 text-[11px] font-black text-white">{me.progress.levelXp}/{me.progress.levelXpNeeded}</span>
            </div>
            {city && <div className="mt-1 flex items-center gap-1 text-[13px] font-bold text-white"><Icon name="pin" size={14} className="text-coral" filled /> {city.namePl}</div>}
          </div>
          <button onClick={() => nav('/settings')} className="glass-card absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center !rounded-full text-white" aria-label={t('profile_settings')}>
            <Icon name="settings" size={18} />
          </button>
          {me.premium.active && <span className="absolute left-2 top-1"><Art name="crown" size={24} /></span>}
        </div>
      </div>

      {/* Рівень польської — лише за іспитами */}
      <button onClick={() => nav('/exams')} className="stat-card mx-4 w-[calc(100%-2rem)] !gap-3 !p-3">
        <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-[22px] font-black shadow-[inset_0_-4px_0_rgb(0_0_0/0.2)]" style={{ background: LEVEL_COLORS[me.progress.languageLevel], color: inkOn(LEVEL_COLORS[me.progress.languageLevel]) }}>
          {me.progress.languageLevel}
          <span className="absolute -right-2 -top-3"><Art name="grad" size={26} /></span>
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-[16px] font-black">{t('profile_language')}</span>
          <span className="muted block text-[12px] font-bold">{t('profile_language_note')}</span>
        </span>
        <Art name="book" size={44} />
      </button>

      {/* Лічильники */}
      <div className="grid grid-cols-4 gap-2 px-4">
        {(
          [
            ['flame', me.progress.streak, t('profile_streak'), '#FF8A3D'],
            ['book', me.progress.lessonsCompleted, t('profile_lessons'), '#25D79B'],
            ['star', me.progress.wordsLearned, t('profile_words'), '#FFC857'],
            ['trophy', citiesDone, t('profile_cities'), '#FF5265'],
          ] as [ArtName, number, string, string][]
        ).map(([art, v, l, c]) => (
          <div key={l} className="relative overflow-hidden rounded-[18px] border px-1 pb-2 pt-2.5 text-center" style={{ borderColor: `${c}55`, background: `linear-gradient(180deg, ${c}26 0%, var(--bg-elev) 70%)`, boxShadow: `0 0 16px -8px ${c}` }}>
            <div className="flex justify-center"><Art name={art} size={30} /></div>
            <div className="text-[20px] font-black leading-tight">{v}</div>
            <div className="muted text-[10.5px] font-bold leading-tight">{l}</div>
          </div>
        ))}
      </div>

      {/* Мій гардероб */}
      <Section title={t('profile_my_wardrobe')} action={<button className="flex items-center gap-1 text-sm font-black text-sky" onClick={() => nav('/shop')}>{t('home_see_all')} <Icon name="arrow-right" size={16} /></button>}>
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
          <button onClick={() => nav('/shop')} className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[20px] border-2 border-brand bg-gradient-to-b from-dawn-sky to-dawn-mint shadow-[0_0_14px_-4px_rgb(37_215_155/0.8)]" aria-label={t('profile_current_look')}>
            <span className="absolute inset-x-0 bottom-0 flex justify-center"><Beaver size={84} outfit={me.outfit.wear} animate={false} /></span>
            <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-brand text-night"><Icon name="check" size={12} strokeWidth={3.2} /></span>
          </button>
          {/* Образи — костюми, що вже є в гардеробі (кожен помітно відрізняється силуетом) */}
          {owned.filter((i) => i.slot === 'COSTUME').slice(0, 4).map((i) => (
            <button key={i.id} onClick={() => nav('/shop')} className={cx('section-tile relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[20px]', i.equipped && 'ring-2 ring-brand')} aria-label={tr(i.name)}>
              <span className="absolute inset-x-0 bottom-0 flex justify-center"><Beaver size={84} outfit={{ COSTUME: i.assetKey }} animate={false} /></span>
            </button>
          ))}
          <button onClick={() => nav('/shop')} className="grid h-[92px] w-[92px] shrink-0 place-items-center rounded-[20px] border-2 border-dashed border-[var(--border)] text-3xl font-black text-[var(--text-muted)]">+</button>
        </div>
      </Section>

      {/* Великий гардероб + швидкі розділи */}
      <div className="grid grid-cols-[1.05fr_1fr] gap-2.5 px-4">
        <button onClick={() => { haptic.tap(); nav('/shop'); }} className="hero-card relative h-[212px] text-left">
          <CityHero slug={city?.slug ?? 'krakow'} color={cityRow?.color ?? '#36B9FF'} name="" sign={false} height={212} className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-10 flex justify-center"><Beaver size={116} outfit={me.outfit.wear} mood="wave" /></div>
          <div className="absolute inset-x-2.5 bottom-2 flex items-center gap-1.5">
            <Icon name="user" size={18} className="text-sky" />
            <span className="flex-1 text-[18px] font-black text-white">{t('profile_wardrobe')}</span>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-night/70 text-white"><Icon name="chevron-right" size={16} /></span>
          </div>
        </button>
        <div className="flex flex-col gap-2">
          {(
            [
              ['passport', '/passport', t('passport_title')],
              ['house', '/house', t('profile_house')],
              ['diary', '/diary', t('profile_diary')],
              ['trophy', '/social', t('home_leaderboard')],
            ] as [ArtName, string, string][]
          ).map(([art, to, label]) => (
            <button key={to} onClick={() => { haptic.tap(); nav(to); }} className="stat-card !min-h-[47px] !gap-2 !px-2 !py-1.5">
              <Art name={art} size={30} />
              <span className="min-w-0 flex-1 text-left text-[13px] font-black leading-tight">{label}</span>
              <Icon name="chevron-right" size={16} className="shrink-0 text-[var(--text-muted)]" />
            </button>
          ))}
        </div>
      </div>

      {/* Досягнення */}
      <Section title={t('profile_achievements')} action={<button className="flex items-center gap-1 text-sm font-black text-sky" onClick={() => nav('/achievements')}>{t('home_see_all')} <Icon name="arrow-right" size={16} /></button>}>
        {ach.isLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {medals.map((a, i) => (
              <motion.button
                key={a.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => nav('/achievements')}
                className={cx('task-card flex flex-col items-center gap-1 px-1 pb-2 pt-2 text-center', a.unlockedAt && 'is-done')}
              >
                <Badge icon={a.icon} unlocked={!!a.unlockedAt} size={56} tier={achTier(a.zlotki)} />
                <span className="line-clamp-2 text-[11.5px] font-black leading-tight">{tr(a.title)}</span>
                <span className="muted line-clamp-2 text-[9.5px] font-bold leading-tight">{tr(a.description)}</span>
              </motion.button>
            ))}
          </div>
        )}
      </Section>

      {/* Статистика */}
      <Section
        title={t('profile_stats')}
        action={
          <div className="flex rounded-full border border-[var(--border)] bg-elev p-0.5">
            {([7, 30, 90] as const).map((d) => (
              <button key={d} onClick={() => { haptic.select(); setRange(d); }} className={cx('rounded-full px-2.5 py-1 text-[12px] font-black transition-colors', range === d ? 'bg-sky text-night shadow-[0_0_12px_-2px_rgb(54_185_255/0.8)]' : 'text-[var(--text-muted)]')}>
                {t(`stats_${d}` as 'stats_7')}
              </button>
            ))}
          </div>
        }
      >
        {stats.isLoading ? (
          <Skeleton className="h-56" />
        ) : stats.data && stats.data.totals.xp > 0 ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ['flame', `${stats.data.totals.xp} XP`, t('stats_xp_period')],
                  ['clock', t('stats_min_n', { n: stats.data.totals.minutes }), t('stats_time')],
                  ['target', `${stats.data.totals.accuracy}%`, t('stats_acc')],
                ] as [ArtName, string, string][]
              ).map(([art, v, l]) => (
                <div key={l} className="stat-card !gap-1.5 !px-2">
                  <Art name={art} size={28} />
                  <span className="min-w-0"><span className="block truncate text-[15px] font-black leading-tight">{v}</span><span className="muted block text-[10px] font-bold leading-tight">{l}</span></span>
                </div>
              ))}
            </div>
            <div className="stat-card !block !p-3">
              <XpChart days={stats.data.days} unit="XP" />
            </div>
          </div>
        ) : (
          <div className="stat-card !block"><EmptyState text={t('stats_empty')} /></div>
        )}
      </Section>

      {/* Навички */}
      <Section title={t('profile_skills')}>
        <div className="stat-card !items-stretch !gap-3 !p-3">
          <div className="min-w-0 flex-1 space-y-2.5">
            {SKILLS.map((s) => {
              const v = skillValue(s.groups);
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white shadow-[inset_0_-2px_0_rgb(0_0_0/0.2)]" style={{ background: s.color }}><Icon name={s.icon} size={15} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-[12.5px] font-black leading-tight">{t(s.key)}</span>
                      <span className="shrink-0 text-[12.5px] font-black">{v}</span>
                    </span>
                    <span className="mt-1 block"><Progress value={v} height={7} color={s.color} /></span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex w-[80px] shrink-0 flex-col items-center justify-center border-l border-[var(--border)] pl-2 text-center">
            <div className="relative"><Art name="books" size={60} /><span className="absolute -right-2 -top-3"><Art name="grad" size={30} /></span></div>
            <div className="mt-1 text-[11px] font-black leading-tight">{stats.data?.vocabulary.LEARNED ?? 0} {t('profile_vocab_learned')}</div>
            <div className="muted text-[11px] font-bold leading-tight">{stats.data?.vocabulary.LEARNING ?? 0} {t('profile_vocab_learning')}</div>
          </div>
        </div>
      </Section>

      {/* Історія */}
      {stats.data && stats.data.history.length > 0 && (
        <Section title={t('profile_history')}>
          <div className="stat-card !block divide-y divide-[var(--border)] !p-0">
            {stats.data.history.slice(0, 8).map((h) => {
              const kind = h.mode === 'LESSON' ? 'hist_lesson' : h.mode === 'EXAM' || h.mode === 'PLACEMENT' ? 'hist_test' : 'hist_practice';
              return (
                <div key={h.id} className="flex items-center gap-2.5 px-3 py-2.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: kind === 'hist_lesson' ? '#2C7BE5' : kind === 'hist_test' ? '#9D69FF' : '#25A87A' }}>
                    <Icon name={kind === 'hist_lesson' ? 'book' : kind === 'hist_test' ? 'layers' : 'refresh'} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block line-clamp-2 text-[14px] font-black leading-tight">{h.lesson ? tr(h.lesson.title) : t(kind as TKey)}</span>
                    <span className="muted block text-[11px] font-bold">{t(kind as TKey)} · {date(h.finishedAt)}</span>
                  </span>
                  <span className="text-[14px] font-black">{h.correct}/{h.total}</span>
                  <span className={cx('rounded-full px-2 py-0.5 text-[12px] font-black', h.xp > 0 ? 'bg-brand/20 text-brand' : 'bg-elev text-[var(--text-muted)]')}>+{h.xp} XP</span>
                </div>
              );
            })}
          </div>
        </Section>
      )}
      {me.premium.active && me.premium.expiresAt && <p className="muted px-4 text-center text-sm font-bold">{t('profile_premium_until', { date: date(me.premium.expiresAt) })}</p>}
    </div>
  );
}
