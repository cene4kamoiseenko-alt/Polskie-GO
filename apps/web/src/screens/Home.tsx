import { motion } from '../lib/motion';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { brandAsset } from '../lib/assets';
import { useJourney, useMe, useQuests, useRefreshAll } from '../lib/queries';
import type { PassSeason } from '../lib/types';
import { Beaver, type BeaverMood } from '../components/Beaver';
import { GameIcon, type IconName } from '../components/GameIcon';
import { Icon } from '../components/Icon';
import { Progress, Section, Sheet, Skeleton, cx, isOfflineError, useToast } from '../components/ui';
import { Art, type ArtName } from '../components/GameArt';
import { CityHero } from '../components/CityHero';
import { sfx } from '../lib/audio';
import { haptic } from '../lib/telegram';
import { missionsQuery } from '../components/MissionCard';
import { Scene } from '../components/Illustrations';

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
  const logo = brandAsset('logo');
  if (logo) return <img src={logo} alt="POLSKI GO" height={size * 1.36} style={{ height: size * 1.36, width: 'auto' }} draggable={false} />;
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

/** Шапка вкладок: логотип, серія, Złotki, Premium. Налаштування — у профілі (без дубля в шапці). */
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
    </div>
  );
}

/** Ілюстрація щоденного завдання за типом. */
const TASK_ART: Record<string, ArtName> = {
  'd-lesson-1': 'book', 'd-lessons-3': 'book', 'd-xp-100': 'star', 'd-words-10': 'chat', 'd-perfect-5': 'target',
  'd-reviews-15': 'books', 'd-dialogue-1': 'chat', 'd-listening-5': 'headphones',
};

/** Дерев'яний покажчик з назвою поточного міста (як на макеті головної). */
function CitySign({ name }: { name: string }) {
  return (
    <span className="city-sign" aria-hidden>
      <span className="city-sign-post" />
      <span className="city-sign-board" lang="pl">{name.toUpperCase()}</span>
    </span>
  );
}

export function HomeScreen() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data!;
  const journey = useJourney();
  const [sheet, setSheet] = useState<null | 'practice' | 'sections'>(null);

  const current = journey.data?.cities.find((c) => c.id === journey.data?.currentCityId);
  const next = journey.data?.nextLesson;
  const rank = rankFor(me.progress.level);
  // Розмір бобра — від ширини екрана (360 → 176, 430 → 200), щоб картки праворуч не перекривали персонажа.
  const heroBeaver = 188;

  // Головна (варіант A): один головний крок — «Продовжити урок»; далі «Сьогодні», пропуск місяця й «Учитися далі».
  // Решта розділів — у шторці «Усі розділи» та в нижній панелі (без дублів на головній).
  return (
    <div className="space-y-5 pb-2">
      <TopStats />

      {/* Герой: ілюстроване поточне місто, бобер-мандрівник, місто, рівень і головна дія */}
      <div className="hero-card mx-4">
        <CityHero slug={current?.slug ?? 'warszawa'} color={current?.color ?? '#36B9FF'} name={current?.namePl ?? 'Warszawa'} height={256} eager>
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 12% -10%, rgba(255,196,120,0.38), transparent 55%)' }} />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[58%] bg-gradient-to-l from-night/45 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-night/50 to-transparent" />
          {/* Покажчик міста позаду бобра */}
          <CitySign name={current?.namePl ?? 'Warszawa'} />
          {/* Бобек у поточному образі — головний персонаж банера, картки його не закривають */}
          <motion.div className="home-hero-beaver absolute bottom-0 -left-1" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
            <Beaver mood="happy" size={heroBeaver} />
          </motion.div>
          <div className="absolute right-2.5 top-2.5 w-[52%] space-y-2">
            <button onClick={() => { haptic.tap(); nav('/map'); }} className="glass-card flex w-full items-center gap-1.5 px-2.5 py-2 text-left">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black text-mist">{t('home_cur_city')}</div>
                <div className="flex min-w-0 items-center gap-1 text-[18px] font-black leading-tight text-white">
                  <Icon name="pin" size={17} className="shrink-0 text-coral" filled /> <span className="min-w-0" lang="pl" style={{ fontSize: (current?.namePl.length ?? 0) > 10 ? 15 : undefined }}>{current?.namePl ?? '—'}</span>
                </div>
              </div>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/25 text-white"><Icon name="chevron-right" size={16} /></span>
            </button>
            <button onClick={() => { haptic.tap(); nav('/profile'); }} className="glass-card flex w-full items-center gap-2 px-2 py-2 text-left">
              <Art name="shield" size={34} label={String(me.progress.level)} />
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-black leading-tight text-white">{t('home_level_n', { n: me.progress.level })} · <span className="text-sky">{rank}</span></div>
                <div className="mt-1 flex items-center gap-1.5">
                  <Progress value={me.progress.levelXp} max={me.progress.levelXpNeeded} height={7} color="linear-gradient(90deg,#25D79B,#7CF0C3)" />
                  <span className="shrink-0 text-[10.5px] font-black text-mist">{me.progress.levelXp}/{me.progress.levelXpNeeded}</span>
                </div>
              </div>
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -1 }}
            onClick={() => { haptic.tap(); nav(next ? `/lesson/${next.id}` : '/map'); }}
            className="home-continue btn btn-red btn-glow absolute bottom-3 right-2.5 w-[57%] !min-h-[50px] !gap-1 !px-2 text-[clamp(13px,3.75vw,15px)] leading-tight"
          >
            <Icon name="play" size={16} filled className="shrink-0" /> <span className="min-w-0 text-center">{next ? t('home_continue_lesson') : t('home_city_done')}</span> <Icon name="chevron-right" size={16} className="shrink-0" />
          </motion.button>
        </CityHero>
      </div>

      {/* Сьогодні: щоденні завдання + велика нагорода */}
      <TodayTasks lessonId={next?.id} />

      {/* Пропуск місяця: сезонна локація з власними місіями */}
      <PassCard />

      {/* Учитися далі: тренування, «Польська в житті», граматика, словник; решта — у шторці */}
      <Section
        title={t('home_learn_more')}
        action={<button className="flex items-center gap-1 text-sm font-black text-sky" onClick={() => { haptic.tap(); setSheet('sections'); }}>{t('home_all_sections')} <Icon name="arrow-right" size={16} /></button>}
      >
        <div className="grid grid-cols-4 gap-2">
          <SectionTile icon="review" label={t('home_practice')} badge={me.counters.mistakes + me.counters.dueReviews} onClick={() => setSheet('practice')} />
          <SectionTile icon="city" label={t('home_tile_life')} onClick={() => nav('/life')} />
          <SectionTile icon="grammar" label={t('home_tile_grammar')} onClick={() => nav('/grammar')} />
          <SectionTile icon="dictionary" label={t('home_tile_dict')} onClick={() => nav('/dictionary')} />
        </div>
      </Section>

      {/* Подарунок місяця Premium — лише коли його можна забрати */}
      {me.premium.active && me.premium.giftReady && (
        <button onClick={() => { haptic.tap(); nav('/premium'); }} className="card mx-4 flex w-[calc(100%-2rem)] items-center gap-3 p-3.5 text-left ring-4 ring-xp">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-xp/30 text-xp-dark"><Icon name="gift" size={24} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-black">{t('home_gift_ready')}</span>
            <span className="muted block text-sm font-bold">{t('home_gift_ready_d')}</span>
          </span>
          <Icon name="chevron-right" size={20} className="shrink-0 opacity-60" />
        </button>
      )}

      <Sheet open={sheet === 'practice'} onClose={() => setSheet(null)} label={t('home_practice')}>
        <h2 className="mb-3 text-xl font-black">{t('home_practice')}</h2>
        <div className="grid grid-cols-2 gap-2.5" data-home-sheet="practice">
          <SheetTile icon="mistakes" title={t('home_fix_mistakes')} sub={me.counters.mistakes ? t('home_mistakes_n', { n: me.counters.mistakes }) : t('home_nothing')} badge={me.counters.mistakes} onClick={() => nav('/practice/MISTAKES')} />
          <SheetTile icon="review" title={t('home_review_words')} sub={me.counters.dueReviews ? t('home_review_due', { n: me.counters.dueReviews }) : t('home_review_none')} badge={me.counters.dueReviews} onClick={() => nav('/practice/REVIEW')} />
          <SheetTile icon="timer" title={t('home_five')} sub={t('home_five_d')} onClick={() => nav('/practice/FIVE_MIN')} />
          <SheetTile icon="speed" title={t('home_speed')} sub={t('home_speed_d')} onClick={() => nav('/practice/SPEED')} />
        </div>
      </Sheet>

      <Sheet open={sheet === 'sections'} onClose={() => setSheet(null)} label={t('home_all_sections')}>
        <h2 className="mb-3 text-xl font-black">{t('home_all_sections')}</h2>
        <div className="grid grid-cols-3 gap-2" data-home-sheet="sections">
          {(
            [
              ['story', 'home_tile_slang', '/slang'],
              ['exam', 'home_tile_exams', '/exams'],
              // ШІ-співрозмовник — лише коли його підключено на сервері.
              ...(me.ai.configured ? [['ai', 'home_tile_talk', '/ai']] : []),
              ['wardrobe', 'home_shop', '/shop'],
              ['map', 'home_passport', '/passport'],
              ['rewards', 'home_achievements', '/achievements'],
              ['leaderboard', 'home_leaderboard', '/social'],
              ['premium', 'home_tile_premium', '/premium'],
              ['settings', 'profile_settings', '/settings'],
            ] as [IconName, TKey, string][]
          ).map(([icon, key, to]) => (
            <SectionTile key={to} icon={icon} label={t(key)} onClick={() => nav(to)} />
          ))}
        </div>
      </Sheet>
    </div>
  );
}

/** Плитка розділу: велика ігрова іконка й підпис; бейдж — скільки чекає (помилки, повторення). */
function SectionTile({ icon, label, badge, onClick }: { icon: IconName; label: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={() => { haptic.tap(); onClick(); }} className="section-tile relative flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2.5 transition active:scale-95">
      <GameIcon name={icon} size={40} />
      <span className="text-center text-[11.5px] font-black leading-tight">{label}</span>
      {!!badge && <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-pl-red px-1 text-[11px] font-black text-white">{badge > 99 ? '99+' : badge}</span>}
    </button>
  );
}

/** Режим тренування в шторці: іконка, назва, підказка й бейдж. */
function SheetTile({ icon, title, sub, badge, onClick }: { icon: IconName; title: string; sub: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={() => { haptic.tap(); onClick(); }} className="section-tile relative flex min-h-[72px] items-center gap-2.5 rounded-2xl p-2.5 text-left transition active:scale-[0.97]">
      <GameIcon name={icon} size={36} />
      <span className="min-w-0">
        <span className="block text-[13.5px] font-black leading-tight">{title}</span>
        <span className="muted block text-[11.5px] font-bold leading-tight">{sub}</span>
      </span>
      {!!badge && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-pl-red px-1 text-[11px] font-black text-white">{badge}</span>}
    </button>
  );
}

/**
 * Пропуск місяця на головній: поточний сезон (прогрес, скільки днів лишилось) або найближчий майбутній.
 * Дані — з того самого запиту /missions, що й екран місій (окремого запиту головна не робить).
 */
export function PassCard() {
  const { t, tr, date } = useT();
  const nav = useNavigate();
  const q = useQuery(missionsQuery);
  const pass = q.data?.pass;
  if (!pass) return q.isLoading ? <div className="px-4"><Skeleton className="h-[112px]" /></div> : null;
  const season: PassSeason | undefined = pass.current ?? pass.upcoming[0];
  if (!season) return null;
  const active = season.state === 'active';
  return (
    <div className="px-4">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => { haptic.tap(); nav('/pass'); }}
        className="pass-card relative flex min-h-[112px] w-full items-stretch overflow-hidden text-left"
        style={{ ['--pass' as string]: season.color }}
        data-pass={season.state}
      >
        <span className="relative w-[38%] shrink-0 overflow-hidden">
          <Scene name={season.scene} className="absolute inset-0 h-full w-full" evening={season.slug === 'swieta'} />
          <span className="pass-card-fade absolute inset-0" />
        </span>
        <span className="relative min-w-0 flex-1 py-3 pl-2 pr-8">
          <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-xp"><Art name="crown" size={16} /> {t('pass_title')}</span>
          <span className="mt-0.5 block text-[17px] font-black leading-tight text-white">{tr(season.title)}</span>
          {active ? (
            <>
              <span className="mt-1.5 flex items-center gap-2">
                <Progress value={season.done} max={season.total} height={7} color="linear-gradient(90deg,#FFC857,#FFE08A)" />
                <span className="shrink-0 text-[11px] font-black text-mist">{season.done}/{season.total}</span>
              </span>
              <span className="mt-1 block text-[11.5px] font-bold leading-snug text-mist">{t('pass_days_left', { n: season.daysLeft ?? 0 })} · {pass.premium ? t('pass_all_open') : t('pass_first_free')}</span>
            </>
          ) : (
            <span className="mt-1 block text-[12px] font-bold leading-snug text-mist">{t('pass_starts', { date: date(`${season.start}T12:00:00`) })}</span>
          )}
        </span>
        <Icon name="chevron-right" size={18} className="absolute bottom-3 right-2.5 text-white/70" />
      </motion.button>
    </div>
  );
}

/**
 * «Сьогодні»: три щоденні завдання й скриня. Кожен стан окремий — завантаження, немає зв'язку,
 * помилка з повтором, порожній день, усе виконано, — щоб на головній не висіли вічні скелетони.
 */
function TodayTasks({ lessonId }: { lessonId?: string }) {
  const { t, tr } = useT();
  const nav = useNavigate();
  const toast = useToast();
  const refresh = useRefreshAll();
  const quests = useQuests();
  const [claiming, setClaiming] = useState(false);
  const taskAction = (slug: string) =>
    slug === 'd-listening-5' || slug === 'd-reviews-15' ? '/practice/FIVE_MIN' : slug === 'd-dialogue-1' ? '/life' : lessonId ? `/lesson/${lessonId}` : '/learn';

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

  const data = quests.data;
  const daily = data?.daily.slice(0, 3) ?? [];
  const chest = data?.chest;
  const isDone = (status: string) => status !== 'ACTIVE' && status !== 'NEW';
  const allDone = daily.length > 0 && daily.every((q) => isDone(q.status));
  const hours = data ? Math.max(1, Math.ceil((new Date(data.resetsAt).getTime() - Date.now()) / 3600_000)) : 0;

  let body: ReactNode;
  if (!data) {
    // Без даних: помилка (з повтором), запит на паузі без мережі (повториться сам), або справжнє завантаження.
    body = quests.isError ? (
      <TodayNote state="error" mood="sad" text={isOfflineError(quests.error) ? t('home_today_offline') : t('home_today_error')} onRetry={() => void quests.refetch()} />
    ) : quests.isPaused ? (
      <TodayNote state="offline" mood="sleep" text={t('home_today_offline')} />
    ) : (
      <div className="grid gap-2" data-today="loading" aria-busy="true">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[68px]" />)}
      </div>
    );
  } else if (!daily.length) {
    body = (
      <TodayNote
        state="empty"
        mood="think"
        text={t('home_today_empty')}
        action={<button className="mt-1.5 text-sm font-black text-sky" onClick={() => nav(lessonId ? `/lesson/${lessonId}` : '/learn')}>{t('home_continue_lesson')} →</button>}
      />
    );
  } else {
    body = (
      <>
        <div className="grid gap-2" data-today={allDone ? 'done' : 'active'}>
          {daily.map((q, i) => {
            const done = isDone(q.status);
            return (
              <motion.button
                key={q.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                onClick={() => { haptic.tap(); nav(done ? '/quests' : taskAction(q.slug)); }}
                className={cx('task-card flex w-full items-center gap-3 px-3 py-2.5 text-left', done && 'is-done')}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-black/15"><Art name={TASK_ART[q.slug] ?? 'star'} size={38} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-black leading-tight">{tr(q.title)}</span>
                  <span className="muted mt-0.5 line-clamp-2 block text-[12px] font-bold leading-snug">{tr(q.description)}</span>
                </span>
                {done ? (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-night"><Icon name="check" size={20} strokeWidth={3.2} /></span>
                ) : (
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="text-[13px] font-black tabular-nums">{Math.min(q.progress, q.target)}/{q.target}</span>
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--border)]"><Icon name="chevron-right" size={16} /></span>
                  </span>
                )}
              </motion.button>
            );
          })}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            onClick={() => (chest?.ready && !chest.claimed ? void claimChest() : nav('/quests'))}
            className={cx('chest-card flex w-full items-center gap-3 px-3 py-2.5 text-left', chest?.ready && !chest.claimed && 'is-ready')}
            aria-label={t('home_big_reward')}
          >
            <motion.span className="shrink-0" animate={chest?.ready && !chest.claimed ? { rotate: [0, -8, 8, -4, 0], scale: [1, 1.08, 1] } : undefined} transition={{ repeat: Infinity, duration: 1.6, repeatDelay: 0.6 }}>
              <Art name="gift" size={44} />
            </motion.span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-black leading-tight text-white">{t('home_big_reward')}</span>
              <span className="mt-0.5 block text-[12px] font-bold leading-snug text-mist">
                {chest?.claimed ? `✓ ${t('home_claimed')}` : `${chest?.done ?? 0}/${chest?.total ?? daily.length} · ${t('home_big_reward_d')}`}
              </span>
            </span>
            {chest?.ready && !chest.claimed && <span className="btn btn-xp shrink-0 !min-h-[36px] !px-3 text-sm">{t('home_claim')}</span>}
          </motion.button>
        </div>
        {allDone && (
          <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-bold leading-tight" role="status">
            <Icon name="check" size={15} strokeWidth={3} className="shrink-0 text-brand" />
            <span>{t('home_today_done')} <span className="muted">{t('home_today_next', { h: hours })}</span></span>
          </p>
        )}
      </>
    );
  }

  return (
    <Section title={t('home_today')} action={<button className="flex items-center gap-1 text-sm font-black text-sky" onClick={() => nav('/quests')}>{t('home_all_tasks')} <Icon name="arrow-right" size={16} /></button>}>
      {body}
    </Section>
  );
}

/** Компактне повідомлення в секції головної: бобер, текст і, за потреби, дія або повтор. */
function TodayNote({ state, mood, text, action, onRetry }: { state?: string; mood: BeaverMood; text: string; action?: ReactNode; onRetry?: () => void }) {
  const { t } = useT();
  return (
    <div className="card flex items-center gap-3 p-3" data-today={state} role="status">
      <Beaver mood={mood} size={64} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold leading-snug">{text}</p>
        {action}
        {onRetry && (
          <button className="btn btn-primary mt-2 !min-h-[38px] !px-4 text-sm" onClick={onRetry}>
            {t('error_retry')}
          </button>
        )}
      </div>
    </div>
  );
}
