import { motion } from '../lib/motion';
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { brandAsset, cityArtImage } from '../lib/assets';
import { HomeEvent } from '../components/HomeEvent';
import { SectionDirectory } from '../components/SectionDirectory';
import { useJourney, useMe, useQuests, useRefreshAll } from '../lib/queries';
import type { PassSeason } from '../lib/types';
import { Beaver, type BeaverMood } from '../components/Beaver';
import { Icon } from '../components/Icon';
import { Progress, Section, Sheet, Skeleton, cx, isOfflineError, useToast } from '../components/ui';
import { StreakIndicator } from '../components/StreakCard';
import { Art, type ArtName } from '../components/GameArt';
import { sfx } from '../lib/audio';
import { botCanMessage, haptic, requestWriteAccessResult } from '../lib/telegram';
import { store } from '../lib/storage';
import { missionsQuery } from '../components/MissionCard';
import { Scene } from '../components/Illustrations';
import { SeasonCover } from '../components/MissionScene';
import { readLastCity, rememberCity } from '../lib/lastCity';

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
  return logo ? <img src={logo} alt="POLSKI GO" height={size * 1.36} style={{ height: size * 1.36, width: 'auto' }} draggable={false} /> : <span className="font-black tracking-tight">POLSKI GO</span>;
}

/** Шапка вкладок: логотип, серія, Złotki, Premium. Налаштування — у профілі (без дубля в шапці). */
/**
 * Отступ от шапки Telegram (--safe-t) здесь НЕ добавляется: его уже даёт обёртка приложения (App.tsx, .safe-top). Раньше шапка добавляла его второй раз,
 * и в полноэкранном режиме Telegram на iPhone над логотипом оставалась пустая полоса высотой с саму шапку (владелец 2026-11-11, scripts/safe-area-check.ts).
 */
export function TopStats({ compact, left }: { compact?: boolean; /** Вместо логотипа (карта: прогресс путешествия). */ left?: ReactNode }) {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  if (!me) return <div className="h-14" />;
  const round = 'grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full border border-[var(--border)] bg-elev shadow-[var(--shadow-card)]';
  return (
    <div className="flex items-center gap-1.5 px-4 pt-2">
      {left ?? (
        <button onClick={() => nav('/')} aria-label="POLSKI GO" className="mr-auto min-w-0 shrink">
          <Wordmark size={compact ? 17 : 19} />
        </button>
      )}
      <StreakIndicator />
      <button onClick={() => nav('/shop')} aria-label="Złotki" className="hud-pill">
        <Art name="coin" size={22} /> <span className="text-xp">{me.zlotki}</span>
      </button>
      {me.premium.active && !compact ? (
        <button onClick={() => nav('/premium')} aria-label="Premium" className={round}>
          <Art name="crown" size={24} />
        </button>
      ) : (
        // Золотая плашка с подписью: одна иконка-корона игроки не замечали (владелец 2026-11-15).
        <button onClick={() => { haptic.tap(); nav('/premium'); }} aria-label="Premium" className="premium-pill" data-premium-pill>
          <Art name="crown" size={22} /> <span className="premium-pill-label">Premium</span>
        </button>
      )}
    </div>
  );
}

/** Ілюстрація щоденного завдання за типом. */
const TASK_ART: Record<string, ArtName> = {
  'd-lesson-1': 'book', 'd-lessons-3': 'book', 'd-xp-100': 'star', 'd-words-10': 'chat', 'd-perfect-5': 'target',
  'd-reviews-15': 'books', 'd-dialogue-1': 'chat', 'd-listening-5': 'headphones',
};

/** Рисунки со своей плиткой (значки владельца, 2026-11-02): им плашка не нужна. Остальные ложатся на плашку того же цвета (.icon-plate). */
const TILE_TASK_ART = new Set<ArtName>(['book', 'star', 'target']);

const WA_KEY = 'pg:write-access';
const WA_ASK_AGAIN_MS = 4 * 86_400_000;
/** Спрашивать ли разрешение писать в личные: бот не может написать, пока игрок его не разрешил или не нажал /start в чате с ботом. */
function shouldAskWriteAccess() {
  if (botCanMessage() !== false) return false;
  const v = store.get(WA_KEY);
  if (v === 'granted') return false;
  const asked = Number(v?.startsWith('later:') ? v.slice(6) : 0);
  return !asked || Date.now() - asked > WA_ASK_AGAIN_MS;
}

/** Плашка «разреши Бобеку писать»: без неё вопрос дня и напоминания не доходят до тех, кто открыл игру по ссылке и не нажимал /start. */
function WriteAccessCard() {
  const { t } = useT();
  const toast = useToast();
  const [show, setShow] = useState(shouldAskWriteAccess);
  if (!show) return null;
  const allow = async () => {
    haptic.tap();
    const r = await requestWriteAccessResult();
    if (r === 'allowed') {
      store.set(WA_KEY, 'granted');
      toast(t('wa_done'), '🦫');
    } else store.set(WA_KEY, `later:${Date.now()}`);
    setShow(false);
  };
  const later = () => {
    store.set(WA_KEY, `later:${Date.now()}`);
    setShow(false);
  };
  return (
    <div className="card mx-4 flex items-center gap-3 p-3.5" data-write-access>
      <Beaver mood="happy" size={52} />
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-black leading-tight">{t('wa_title')}</div>
        <div className="muted mt-0.5 text-[12.5px] font-bold leading-snug">{t('wa_body')}</div>
        <div className="mt-2 flex gap-2">
          <button className="btn btn-red !min-h-[40px] flex-1 !px-3 text-[13.5px]" onClick={() => void allow()}>{t('wa_allow')}</button>
          <button className="btn btn-ghost !min-h-[40px] !px-3 text-[13px]" onClick={later}>{t('wa_later')}</button>
        </div>
      </div>
    </div>
  );
}

export function HomeScreen() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const me = useMe().data!;
  const journey = useJourney();
  const quests = useQuests();
  const [sheet, setSheet] = useState<null | 'today' | 'sections'>(null);
  const current = journey.data?.cities.find(city => city.id === journey.data?.currentCityId);
  const next = journey.data?.nextLesson;
  const [last] = useState(readLastCity);
  const shown = current ?? (!journey.data ? me.progress.currentCity ?? last : null);
  useEffect(() => {
    if (current) rememberCity({ slug: current.slug, color: current.color, namePl: current.namePl });
  }, [current?.slug, current?.color, current?.namePl]);
  const citySlug = shown?.slug ?? 'warszawa';
  const photo = cityArtImage(citySlug);
  const goal = Math.min(me.today.xp, me.today.goalXp);
  const chest = quests.data?.chest;
  const daily = quests.data?.daily ?? [];
  const done = chest?.done ?? daily.filter(task => task.status === 'COMPLETED' || task.status === 'CLAIMED').length;
  const total = chest?.total ?? daily.length;
  const ready = !!chest?.ready && !chest.claimed;
  const retryJourney = journey.isError && !journey.data;
  const waitingForJourney = !journey.data && journey.isFetching;
  const continueLearning = () => {
    haptic.tap();
    if (retryJourney) void journey.refetch();
    else nav(next ? `/lesson/${next.id}` : '/learn');
  };

  return <div className="compact-home" data-compact-home>
    <TopStats compact />
    <div className="compact-heading home-heading mx-4"><div><span className="compact-kicker">{t('compact_journey')}</span><h1><button type="button" lang="pl" onClick={() => nav('/map')}>{shown?.namePl ?? 'Warszawa'} <span aria-hidden="true">›</span></button></h1></div><button type="button" onClick={() => setSheet('sections')} data-open-directory>{t('home_all_sections')} <span aria-hidden="true">›</span></button></div>

    <section className="compact-journey mx-4" aria-label={t('compact_journey')} data-home-journey>
      {photo && <img className="compact-journey-photo" src={photo.src} srcSet={photo.srcSet} sizes="(min-width:576px) 544px,calc(100vw - 32px)" width={1440} height={720} alt="" decoding="async" loading="eager" draggable={false} />}
      <div className="journey-action-panel">
        <div className="journey-lesson-row">
          <button type="button" className="journey-look" onClick={() => nav('/profile')} aria-label={t('profile_current_look')}><Beaver size={48} mood="happy" animate={false} /></button>
          <div className="journey-lesson-copy"><span className="compact-kicker">{t(next?.state === 'completed' ? 'compact_repeat' : 'compact_next_step')}</span><h2>{next ? tr(next.title) : t(journey.isError ? 'compact_choose_lesson' : journey.data ? 'compact_explore_lessons' : 'loading')}</h2></div>
        </div>
        <div className="journey-daily-goal"><span>{t('compact_daily_goal')}</span><Progress value={goal} max={me.today.goalXp} height={5} color="linear-gradient(90deg,#71e4bf,#25d79b)" /><b>{goal}/{me.today.goalXp} XP</b></div>
        <button type="button" className="compact-continue btn btn-red" onClick={continueLearning} disabled={waitingForJourney} aria-busy={waitingForJourney} data-home-continue>{t(waitingForJourney ? 'loading' : retryJourney ? 'error_retry' : next ? 'home_continue_lesson' : 'compact_choose_lesson')} <span aria-hidden="true">→</span></button>
        {(me.counters.dueReviews > 0 || me.counters.mistakes > 0) && <div className="home-practice-actions" data-home-practice>
          {me.counters.dueReviews > 0 && <button type="button" onClick={() => nav('/practice/REVIEW')}>{t('home_review_words')} <b>{me.counters.dueReviews}</b><span aria-hidden="true">›</span></button>}
          {me.counters.mistakes > 0 && <button type="button" onClick={() => nav('/practice/MISTAKES')}>{t('home_fix_mistakes')} <b>{me.counters.mistakes}</b><span aria-hidden="true">›</span></button>}
        </div>}
      </div>
    </section>

    <div className="home-today-summary mx-4">
      <button type="button" onClick={() => setSheet('today')} data-open-today><Art name={ready ? 'gift' : 'target'} size={34} /><strong>{t('home_today')}{quests.data && total > 0 ? ` · ${done}/${total}` : ''}</strong><span>{t(ready ? 'compact_reward_ready' : 'compact_tasks_open')}</span><b aria-hidden="true">›</b></button>
    </div>

    <HomeEvent />
    <WriteAccessCard />

    <Sheet open={sheet === 'today'} onClose={() => setSheet(null)} label={t('home_today')}><div className="-mx-4"><TodayTasks lessonId={next?.id} /></div></Sheet>
    <Sheet open={sheet === 'sections'} onClose={() => setSheet(null)} label={t('home_all_sections')}><h2 className="mb-3 text-xl font-black">{t('home_all_sections')}</h2><SectionDirectory /></Sheet>
  </div>;
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
          <SeasonCover season={season} className="absolute inset-0 h-full w-full" />
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
                {TILE_TASK_ART.has(TASK_ART[q.slug] ?? 'star') ? (
                  <Art name={TASK_ART[q.slug] ?? 'star'} size={52} className="shrink-0" />
                ) : (
                  <span className="icon-plate grid h-[52px] w-[52px] shrink-0 place-items-center"><Art name={TASK_ART[q.slug] ?? 'star'} size={38} /></span>
                )}
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
