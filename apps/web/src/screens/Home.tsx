import { AnimatePresence, motion, useReducedMotion } from '../lib/motion';
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { brandAsset } from '../lib/assets';
import { useJourney, useMe, useQuests, useRefreshAll } from '../lib/queries';
import { ComebackSheet } from '../components/ComebackSheet';
import type { Me, PassSeason } from '../lib/types';
import { Beaver, type BeaverMood } from '../components/Beaver';
import { GameIcon, type IconName } from '../components/GameIcon';
import { Icon } from '../components/Icon';
import { ChannelHomeCard } from '../components/SocialPromo';
import { Confetti, Progress, Section, Sheet, Skeleton, cx, isOfflineError, useToast } from '../components/ui';
import { HouseCard } from '../components/HouseCard';
import { Art, type ArtName } from '../components/GameArt';
import { levelTestPath } from '../lib/levelTest';
import { CityHero } from '../components/CityHero';
import { HeroBeaver } from '../components/HeroBeaver';
import { StreakCard, StreakIndicator } from '../components/StreakCard';
import { RewardModal } from '../components/game';
import { sfx } from '../lib/audio';
import { botCanMessage, haptic, requestWriteAccessResult } from '../lib/telegram';
import { store } from '../lib/storage';
import { missionsQuery } from '../components/MissionCard';
import { Scene } from '../components/Illustrations';
import { SeasonCover } from '../components/MissionScene';
import { readLastCity, rememberCity } from '../lib/lastCity';
import { todayBanner } from '../lib/premiumBanner';

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
/**
 * Отступ от шапки Telegram (--safe-t) здесь НЕ добавляется: его уже даёт обёртка приложения (App.tsx, .safe-top). Раньше шапка добавляла его второй раз,
 * и в полноэкранном режиме Telegram на iPhone над логотипом оставалась пустая полоса высотой с саму шапку (владелец 2026-11-11, scripts/safe-area-check.ts).
 */
export function TopStats({ compact, left }: { compact?: boolean; /** Вместо логотипа (карта: прогресс путешествия). */ left?: ReactNode }) {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  void compact;
  if (!me) return <div className="h-14" />;
  const round = 'grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full border border-[var(--border)] bg-elev shadow-[var(--shadow-card)]';
  return (
    <div className="flex items-center gap-1.5 px-4 pt-2">
      {left ?? (
        <button onClick={() => nav('/')} aria-label="POLSKI GO" className="mr-auto min-w-0 shrink">
          <Wordmark size={19} />
        </button>
      )}
      {/* Огонёк серии открывает панель серии (календарь недели, рекорд, ближайшая цель), а не профиль (владелец 2026-11-15). */}
      <StreakIndicator />
      <button onClick={() => nav('/shop')} aria-label="Złotki" className="hud-pill">
        <Art name="coin" size={22} /> <span className="text-xp">{me.zlotki}</span>
      </button>
      {/* Золотая плашка с подписью — и без подписки, и с ней: одну круглую корону не замечали (владелец 2026-11-15, дважды). */}
      <button onClick={() => { haptic.tap(); nav('/premium'); }} aria-label="Premium" className={cx('premium-pill', me.premium.active && 'is-active')} data-premium-pill>
        <Art name="crown" size={22} /> <span className="premium-pill-label">Premium</span>
      </button>
    </div>
  );
}

/** Ілюстрація щоденного завдання за типом. */
export const TASK_ART: Record<string, ArtName> = {
  'd-lesson-1': 'book', 'd-lessons-3': 'book', 'd-xp-100': 'star', 'd-words-10': 'chat', 'd-perfect-5': 'target',
  'd-reviews-15': 'books', 'd-dialogue-1': 'chat', 'd-listening-5': 'headphones',
};

/** Рисунки со своей плиткой (значки владельца, 2026-11-02): им плашка не нужна. Остальные ложатся на плашку того же цвета (.icon-plate). */
export const TILE_TASK_ART = new Set<ArtName>(['book', 'star', 'target']);

/** Розмір Бобека на банері: 44% ширини банера (екран мінус поля 2×16, не ширше колонки 576), у межах 144–186 px; праворуч колонка 50% — між ними зазор на 360–430. */
function heroBeaverFor(width: number) {
  const banner = Math.min(width, 576) - 32;
  return Math.round(Math.min(186, Math.max(144, banner * 0.44)));
}
function useHeroBeaverSize() {
  const [size, setSize] = useState(() => heroBeaverFor(typeof window === 'undefined' ? 390 : window.innerWidth));
  useEffect(() => {
    const on = () => setSize(heroBeaverFor(window.innerWidth));
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return size;
}

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

type WeekDay = { day: string; xp: number };
/**
 * Неделя игрока под баннером: серия, цель дня и семь последних дней (занимался / нет / сегодня). Данные — та же статистика, что в профиле
 * (кеш общий). Пока данных нет, блок держит высоту и рисует пустые кружки: главная не прыгает.
 */
const LEVEL_TEST_HIDDEN = 'pg_level_test_hidden';

/**
 * Карточка теста уровня (2026-11-16, «не потерять тех, кто знает основы»): задания уроков станут уровня игрока. Не показывается
 * тем, кто начинает с нуля (самооценка A0), уже прошёл новый тест или сам выбрал уровень, и после «Скрыть» на этом устройстве.
 */
function LevelTestCard() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(LEVEL_TEST_HIDDEN) === '1';
    } catch {
      return false;
    }
  });
  if (!me || hidden || me.levelTest?.done !== false || me.progress.studyLevel || me.profile.selfLevel === 'A0') return null;
  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(LEVEL_TEST_HIDDEN, '1');
    } catch {
      /* без хранилища карточка просто вернётся при следующем входе */
    }
  };
  return (
    <div className="card mx-4 flex items-start gap-3 p-3.5" data-level-test-card>
      <Art name="target" size={46} />
      <div className="min-w-0 flex-1">
        <div className="text-[16px] font-black">{t('home_level_test_title')}</div>
        <div className="muted text-[13px] font-bold leading-snug">{t('home_level_test_text')}</div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <button className="btn btn-primary min-h-0 px-3.5 py-2 text-[14px]" data-start-level-test onClick={() => { haptic.tap(); void levelTestPath().then((path) => path && nav(path)); }}>
            {t('ob_placement_yes')}
          </button>
          <button className="btn btn-ghost min-h-0 px-3.5 py-2 text-[14px]" onClick={hide}>
            {t('home_level_test_hide')}
          </button>
        </div>
      </div>
    </div>
  );
}

function WeekStrip() {
  const { t, lang } = useT();
  const me = useMe().data!;
  const reduce = useReducedMotion();
  const stats = useQuery({ queryKey: ['stats', 7], queryFn: () => api<{ days: WeekDay[] }>('/me/stats?days=7') });
  const days: (WeekDay | null)[] = stats.data?.days.slice(-7) ?? Array.from({ length: 7 }, () => null);
  const goalDone = me.today.xp >= me.today.goalXp;
  const streak = me.progress.streak;
  const [picked, setPicked] = useState<number | null>(null);
  // Раньше нажатие вело в профиль, где о серии почти ничего нет (владелец 2026-11-15) — теперь панель серии прямо здесь.
  const [streakOpen, setStreakOpen] = useState(false);
  const toast = useToast();
  const fmt = (day: string, weekday: 'short' | 'long') => new Intl.DateTimeFormat(lang, { weekday, timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));
  const letter = (day: string) => fmt(day, 'short').slice(0, 2);

  // Пик дня: цель выполнена — один раз за день конфетти и вибрация, когда игрок видит главную (обычно сразу после урока).
  const [party, setParty] = useState(false);
  useEffect(() => {
    if (!goalDone) return;
    const today = new Date().toISOString().slice(0, 10);
    if (store.get(GOAL_PARTY_KEY) === today) return;
    store.set(GOAL_PARTY_KEY, today);
    haptic.success();
    toast(t('home_week_goal_hit'), '✨');
    if (reduce) return;
    setParty(true);
    const tm = setTimeout(() => setParty(false), 3200);
    return () => clearTimeout(tm);
  }, [goalDone, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const caption = (() => {
    if (picked === null) return null;
    const d = days[picked];
    if (!d) return null;
    const name = fmt(d.day, 'long');
    const day = name.charAt(0).toUpperCase() + name.slice(1);
    if (picked === days.length - 1) return goalDone ? t('home_week_today_done', { xp: me.today.xp }) : t('home_week_today_left', { xp: me.today.goalXp - me.today.xp });
    return d.xp > 0 ? t('home_week_day_xp', { day, xp: d.xp }) : t('home_week_day_none', { day });
  })();

  return (
    <div className="week-card mx-4" data-home-week>
      <Confetti run={party} />
      <Sheet open={streakOpen} onClose={() => setStreakOpen(false)} label={t('streak_title')}><div className="-mx-4"><StreakCard /></div></Sheet>
      <button type="button" onClick={() => { haptic.tap(); setStreakOpen(true); }} className="flex w-full items-center gap-3 text-left" aria-haspopup="dialog" aria-expanded={streakOpen} aria-label={`${streak > 0 ? t('home_week_streak', { n: streak }) : t('home_week_start')}. ${t('home_week_open_stats')}`} data-open-streak-card>
        <motion.span
          className="shrink-0"
          animate={party ? { scale: [1, 1.35, 0.95, 1.12, 1], rotate: [0, -8, 6, -3, 0] } : streak > 0 && !reduce ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={party ? { duration: 0.9 } : { repeat: streak > 0 ? Infinity : 0, duration: 2.2 }}
        >
          <Art name="flame" size={40} className={streak > 0 || goalDone ? undefined : 'opacity-45 grayscale'} />
        </motion.span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-black leading-tight">{streak > 0 ? t('home_week_streak', { n: streak }) : t('home_week_start')}</span>
          <span className="mt-1 flex items-center gap-2">
            <Progress value={Math.min(me.today.xp, me.today.goalXp)} max={me.today.goalXp} height={7} color={goalDone ? 'linear-gradient(90deg,#25D79B,#7CF0C3)' : 'linear-gradient(90deg,#FFB13D,#FFD98A)'} />
            <span className="muted shrink-0 text-[11.5px] font-black tabular-nums">{goalDone ? t('home_goal_done') : t('home_goal_today', { xp: me.today.xp, goal: me.today.goalXp })}</span>
          </span>
        </span>
        <Icon name="chevron-right" size={18} className="shrink-0 text-[var(--text-muted)]" />
      </button>
      {/* Семь дней: нажатие показывает, сколько XP было в тот день */}
      <div className="mt-3 grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const today = i === days.length - 1;
          const on = !!d && d.xp > 0;
          const sel = picked === i;
          return (
            <button
              key={d?.day ?? i}
              type="button"
              disabled={!d}
              onClick={() => { haptic.select(); setPicked(sel ? null : i); }}
              className="flex flex-col items-center gap-1 rounded-xl py-0.5"
              aria-pressed={sel}
              aria-label={d ? `${fmt(d.day, 'long')}: ${d.xp} XP` : undefined}
            >
              <motion.span
                className={cx('week-dot', on && 'is-on', today && 'is-today', sel && 'is-picked')}
                initial={reduce || !d ? false : { scale: 0.55, opacity: 0 }}
                animate={{ scale: sel ? 1.12 : 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 22, delay: stats.data && !sel ? i * 0.045 : 0 }}
              >
                {on && <Icon name="check" size={14} strokeWidth={3.4} />}
              </motion.span>
              <span className={cx('text-[10.5px] font-black uppercase leading-none', today || sel ? 'text-[var(--text)]' : 'muted')}>{d ? letter(d.day) : '·'}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence initial={false}>
        {caption && (
          <motion.div
            key={caption}
            className="week-caption"
            role="status"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
          >
            {caption}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const GOAL_PARTY_KEY = 'pg:goal-party';

/** Узкий баннер Premium на главной — только для тех, у кого его нет: картинка дня владельца, что даёт подписка и кнопка «Открыть». */
function PremiumTeaser() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  if (!me || me.premium.active) return null;
  const banner = todayBanner();
  // Постер владельца — готовая реклама со своими надписями: показываем его целиком (верх кадра, 16:9), без нашего текста поверх.
  // Раньше подпись ложилась на надписи постера («Пропуск месяца», «Длинные сцены») — текст на тексте.
  if (banner) {
    return (
      <motion.button
        whileTap={{ scale: 0.985 }}
        onClick={() => { haptic.tap(); nav('/premium'); }}
        className="premium-poster relative mx-4 block w-[calc(100%-2rem)] overflow-hidden rounded-[24px] text-left"
        aria-label={`Premium. ${t('home_premium_teaser')}`}
        data-premium-teaser
      >
        <img src={banner.src} srcSet={banner.srcSet} sizes="(min-width: 576px) 544px, calc(100vw - 32px)" alt="" className="block aspect-[16/9] w-full object-cover object-top" loading="lazy" decoding="async" draggable={false} />
        <span className="premium-poster-cta absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-black">
          {t('home_premium_open')} <Icon name="arrow-right" size={15} strokeWidth={2.6} />
        </span>
      </motion.button>
    );
  }
  return (
    <button
      onClick={() => { haptic.tap(); nav('/premium'); }}
      className="relative mx-4 block w-[calc(100%-2rem)] overflow-hidden rounded-[24px] border-2 border-[#F5C451]/70 bg-night text-left shadow-[var(--shadow-card)] active:scale-[0.99]"
      data-premium-teaser
    >
      <span className="relative flex items-center gap-3 px-3.5 py-3.5">
        <Art name="crown" size={36} />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-black text-white">Premium</span>
          <span className="block text-[12px] font-bold leading-snug text-white/90">{t('home_premium_teaser')}</span>
        </span>
        <span className="shrink-0 rounded-full bg-[#F5C451] px-3 py-1.5 text-[12.5px] font-black text-[#5A3B00]">{t('home_premium_open')} →</span>
      </span>
    </button>
  );
}

/**
 * Итоги недели лиги: призёру при входе — окно с наградой (Złotki уже начислены сервером в понедельник ночью).
 * Закрытие отмечает награду просмотренной; если отметка не дошла, в этой сессии окно больше не всплывает.
 */
function LeagueAwardModal() {
  const { t } = useT();
  const qc = useQueryClient();
  const award = useMe().data?.leagueAward ?? null;
  const [closed, setClosed] = useState<string | null>(null);
  const open = award && closed !== award.week ? award : null;
  return (
    <RewardModal
      reward={open ? { title: t('league_award_title', { rank: open.rank }), xp: 0, zlotki: open.zlotki, extra: [{ icon: 'trophy', text: t('league_award_xp', { xp: open.xp }) }] } : null}
      onClose={() => {
        if (!open) return;
        setClosed(open.week);
        void api('/leaderboard/award/seen', { body: { week: open.week } })
          .then(() => qc.setQueryData<Me>(['me'], (m) => (m ? { ...m, leagueAward: null } : m)))
          .catch(() => {});
      }}
    />
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
  // Пока приходит маршрут, баннер рисуется по последнему городу этого устройства (а не «Варшавой» с последующей подменой кадра).
  const loadingJourney = !journey.data;
  const [last] = useState(readLastCity);
  const shown = current ?? (loadingJourney ? last : null);
  useEffect(() => {
    if (current) rememberCity({ slug: current.slug, color: current.color, namePl: current.namePl });
  }, [current?.slug, current?.color, current?.namePl]); // eslint-disable-line react-hooks/exhaustive-deps
  const rank = rankFor(me.progress.level);
  // Розмір Бобека: блок 44% ширини банера (144–186 px), щоб праворуч лишалось місце карткам і кнопці без накладання.
  const heroBeaver = useHeroBeaverSize();

  // Головна (варіант A): один головний крок — «Продовжити урок»; далі «Сьогодні», пропуск місяця й «Учитися далі».
  // Решта розділів — у шторці «Усі розділи» та в нижній панелі (без дублів на головній).
  return (
    <div className="space-y-5 pb-2">
      <TopStats />
      <LeagueAwardModal />
      <ComebackSheet />

      {/* Герой: ілюстроване поточне місто, бобер-мандрівник, місто, рівень і головна дія.
          Композиція (2026-11-15): Бобек цілком у кадрі (хвіст і лапи не обрізані), праворуч одна скляна картка
          «місто + рівень», кнопка під нею — ніщо не накриває персонажа. Дерев'яний покажчик прибрано: він заходив у вухо Бобека. */}
      <div className="hero-card home-hero mx-4">
        <CityHero slug={shown?.slug ?? 'warszawa'} color={shown?.color ?? '#36B9FF'} name={shown?.namePl ?? 'Warszawa'} height={272} eager>
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 12% -10%, rgba(255,196,120,0.34), transparent 55%)' }} />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[60%] bg-gradient-to-l from-night/55 via-night/25 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-night/55 to-transparent" />
          {/* Бобек у поточному образі: тап — стрибок і фраза польською */}
          <motion.div className="home-hero-beaver absolute bottom-1.5 left-1.5" initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
            <HeroBeaver size={heroBeaver} />
          </motion.div>
          <div className="glass-card home-hero-info absolute right-2.5 top-2.5 w-[50%] overflow-hidden">
            <button onClick={() => { haptic.tap(); nav('/map'); }} className="flex w-full items-center gap-1.5 px-2.5 pb-1.5 pt-2 text-left active:bg-white/10">
              <span className="min-w-0 flex-1">
                <span className="block text-[10.5px] font-black uppercase tracking-[0.08em] text-white/70">{t('home_cur_city')}</span>
                <span className="flex min-w-0 items-center gap-1 text-[19px] font-black leading-tight text-white">
                  <Icon name="pin" size={16} className="shrink-0 text-coral" filled />
                  <span className="min-w-0 truncate" lang="pl" style={{ fontSize: (shown?.namePl.length ?? 0) > 10 ? 15.5 : undefined }}>{shown?.namePl ?? '—'}</span>
                </span>
              </span>
              <Icon name="chevron-right" size={18} className="shrink-0 text-white/70" />
            </button>
            <div className="mx-2.5 h-px bg-white/15" aria-hidden />
            <button onClick={() => { haptic.tap(); nav('/profile'); }} className="flex w-full items-center gap-2 px-2 pb-2 pt-1.5 text-left active:bg-white/10">
              <Art name="shield" size={30} label={String(me.progress.level)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-black leading-tight text-white">{t('home_level_n', { n: me.progress.level })} · <span className="text-sky">{rank}</span></span>
                <span className="mt-1 flex items-center gap-1.5">
                  <Progress value={me.progress.levelXp} max={me.progress.levelXpNeeded} height={6} color="linear-gradient(90deg,#25D79B,#7CF0C3)" />
                  <span className="shrink-0 text-[10.5px] font-black tabular-nums text-white/75">{me.progress.levelXp}/{me.progress.levelXpNeeded}</span>
                </span>
              </span>
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => { haptic.tap(); nav(me.activeLesson ? `/lesson/${me.activeLesson.lessonId}` : next ? `/lesson/${next.id}` : loadingJourney ? '/learn' : '/map'); }}
            className="home-continue btn btn-red btn-glow absolute bottom-3 right-2.5 w-[50%] !min-h-[52px] !gap-1 !px-2 text-[clamp(13px,3.75vw,15px)] leading-tight"
          >
            <Icon name="play" size={16} filled className="shrink-0" /> <span className="min-w-0 text-center">{me.activeLesson ? t('home_continue_left', { n: me.activeLesson.total - me.activeLesson.done }) : next || loadingJourney ? t('home_continue_lesson') : t('home_city_done')}</span> <Icon name="chevron-right" size={16} className="shrink-0" />
          </motion.button>
        </CityHero>
      </div>

      {/* Неделя: серия, цель дня и семь последних дней */}
      <WeekStrip />

      {/* Знающим польский — тест уровня: задания станут их уровня (2026-11-16) */}
      <LevelTestCard />

      {/* Сьогодні: щоденні завдання + велика нагорода */}
      <TodayTasks lessonId={next?.id} />

      {/* Разрешение боту писать: без него не доходят вопрос дня и напоминания */}
      <WriteAccessCard />

      {/* Канал @polskigoo: подписка открывает секретную миссию (2026-11-23); пока не подписан и не скрыл */}
      <ChannelHomeCard />

      {/* Premium: для тех, у кого его нет — заметный баннер (раньше был только значок-корона в шапке) */}
      <PremiumTeaser />

      {/* Пропуск місяця: сезонна локація з власними місіями */}
      <PassCard />

      {/* Домик Бобека: день игрока (ждёт урок / отдыхает / спит), домашний бонус за цель дня и накопление на следующую квартиру */}
      <HouseCard />

      {/* Учитися далі: тренування, «Польська в житті», граматика, словник; решта — у шторці */}
      <Section
        title={t('home_learn_more')}
        action={<button className="flex items-center gap-1 text-sm font-black text-sky" onClick={() => { haptic.tap(); setSheet('sections'); }}>{t('home_all_sections')} <Icon name="arrow-right" size={16} /></button>}
      >
        <div className="grid grid-cols-4 gap-2">
          <SectionTile icon="review" label={t('home_practice')} badge={me.counters.mistakes + me.counters.dueReviews} onClick={() => setSheet('practice')} />
          <SectionTile icon="grammar" label={t('home_tile_grammar')} onClick={() => nav('/grammar')} />
          <SectionTile icon="dictionary" label={t('home_tile_dict')} onClick={() => nav('/dictionary')} />
          <SectionTile icon="exam" label={t('home_tile_exams')} onClick={() => nav('/exams')} />
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
              ['wardrobe', 'home_shop', '/shop'],
              ['house', 'home_tile_house', '/house'],
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
        <div className="today-group" data-today={allDone ? 'done' : 'active'}>
          {daily.map((q, i) => {
            const done = isDone(q.status);
            return (
              <motion.button
                key={q.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                onClick={() => { haptic.tap(); nav(done ? '/quests' : taskAction(q.slug)); }}
                className={cx('task-card flex w-full items-center gap-3 text-left', done && 'is-done')}
              >
                {TILE_TASK_ART.has(TASK_ART[q.slug] ?? 'star') ? (
                  <Art name={TASK_ART[q.slug] ?? 'star'} size={46} className="shrink-0" />
                ) : (
                  <span className="icon-plate grid h-[46px] w-[46px] shrink-0 place-items-center"><Art name={TASK_ART[q.slug] ?? 'star'} size={34} /></span>
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
                    <Icon name="chevron-right" size={18} className="opacity-50" />
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
            className={cx('chest-card flex w-full items-center gap-3 text-left', chest?.ready && !chest.claimed && 'is-ready')}
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
