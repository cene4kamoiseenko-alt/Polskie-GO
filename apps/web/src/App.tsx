import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { SplashScene } from './components/Splash';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { LazyMotion, MotionConfig, loadMotionFeatures, motion } from './lib/motion';
import { I18nProvider, profileLang } from './i18n';
import { tg, setTelegramColors, startParam } from './lib/telegram';
import { peekLaunchRoute, takeLaunchRoute } from './lib/launch';
import { useMe } from './lib/queries';
import { configureAudio, setSoundEnabled, stopSpeech } from './lib/audio';
import { ApiError } from './lib/api';
import { bootMark } from './lib/boot';
import { BottomNav, ErrorState, ScreenSkeleton, ToastProvider } from './components/ui';
import { Beaver } from './components/Beaver';
import { ScreenBoundary } from './components/ScreenBoundary';

import { HomeScreen } from './screens/Home';

const Onboarding = lazy(() => import('./screens/Onboarding'));
const MapScreen = lazy(() => import('./screens/Map'));
const LearnScreen = lazy(() => import('./screens/Learn'));
const LessonScreen = lazy(() => import('./screens/Lesson'));
const QuestsScreen = lazy(() => import('./screens/Quests'));
const StoryScreen = lazy(() => import('./screens/Story'));
const ProfileScreen = lazy(() => import('./screens/Profile'));
const ShopScreen = lazy(() => import('./screens/Shop'));
const HouseScreen = lazy(() => import('./screens/House'));
const DiaryScreen = lazy(() => import('./screens/Diary'));
const DictionaryScreen = lazy(() => import('./screens/Dictionary'));
const AiScreen = lazy(() => import('./screens/Ai'));
const ExamsScreen = lazy(() => import('./screens/Exams'));
const SocialScreen = lazy(() => import('./screens/Social'));
const PremiumScreen = lazy(() => import('./screens/Premium'));
const SettingsScreen = lazy(() => import('./screens/Settings'));
const AchievementsScreen = lazy(() => import('./screens/Achievements'));
const GrammarScreen = lazy(() => import('./screens/Grammar'));
const MissionsScreen = lazy(() => import('./screens/Missions'));
const MissionScreen = lazy(() => import('./screens/Mission'));
const PassportScreen = lazy(() => import('./screens/Passport'));
const SlangScreen = lazy(() => import('./screens/Slang'));
const PassScreen = lazy(() => import('./screens/Pass'));

const TAB_ROUTES = ['/', '/map', '/learn', '/quests', '/profile'];

function useTheme(pref: 'auto' | 'light' | 'dark' | undefined) {
  const [systemDark, setSystemDark] = useState(() => (tg ? tg.colorScheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches));
  useEffect(() => {
    if (tg) {
      const h = () => setSystemDark(tg!.colorScheme === 'dark');
      tg.onEvent('themeChanged', h);
      return () => tg?.offEvent('themeChanged', h);
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const h = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  // «Авто» — як у Telegram (або системі); явний вибір має пріоритет.
  const dark = pref === 'dark' ? true : pref === 'light' ? false : systemDark;
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
    setTelegramColors(dark ? '#07182C' : '#fff7ec');
  }, [dark]);
}

function Splash() {
  return <SplashScene loading />;
}

/** Перший справжній екран змонтовано — запуск завершено. */
function BootDone() {
  useEffect(() => bootMark('screen'), []);
  return null;
}

/**
 * Після старту у вільний час підвантажуємо екрани двома хвилями: спершу найімовірніші переходи
 * з головної (урок, карта, навчання), потім решта вкладок. Хвиля вантажиться паралельно —
 * послідовне завантаження під повільним CPU не встигало до першого натискання (perf: вкладки ×2 довше).
 * У режимі заощадження трафіку або на 2G нічого наперед не вантажимо.
 */
const PREFETCH_WAVES = [
  [() => import('./screens/Lesson'), () => import('./screens/Map'), () => import('./screens/Learn')],
  [() => import('./screens/Quests'), () => import('./screens/Profile'), () => import('./screens/Missions'), () => import('./screens/Mission'), () => import('./screens/Dictionary')],
];
let prefetched = false;
function prefetchScreens() {
  if (prefetched) return;
  prefetched = true;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? '')) return;
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void };
  const idle = (cb: () => void) => (w.requestIdleCallback ? w.requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 300));
  const wave = (i: number) => {
    const loads = PREFETCH_WAVES[i];
    if (!loads) return;
    // Помилку не показуємо: це лише попереднє завантаження, справжній перехід обробить ScreenBoundary.
    void Promise.allSettled(loads.map((load) => load())).then(() => idle(() => wave(i + 1)));
  };
  idle(() => wave(0));
}

export function App() {
  const me = useMe();
  const loc = useLocation();
  const nav = useNavigate();
  useEffect(() => () => stopSpeech(), [loc.pathname]);
  const lang = profileLang(me.data?.settings.uiLanguage, tg?.initDataUnsafe.user?.language_code);
  useTheme(me.data?.settings.theme);
  useEffect(() => {
    setSoundEnabled(me.data?.settings.soundEnabled ?? true);
    configureAudio({ base: me.data?.audio?.base ?? null });
  }, [me.data?.settings.soundEnabled, me.data?.audio?.base]);

  // Глибокі посилання: startapp=lesson_<id>, story_<slug>, premium
  useEffect(() => {
    const p = startParam();
    if (!me.data?.onboarded || !p) return;
    if (p === 'premium') nav('/premium');
    else if (p.startsWith('story_')) nav(`/story/${p.slice(6)}`);
  }, [me.data?.onboarded, nav]);

  // Кнопки Telegram-бота: ?bot_screen=<екран> (або startapp=screen_<екран> у чатах без web_app-кнопок).
  // Лише білий список маршрутів, один перехід після входу; новичок спершу проходить знайомство (його завершення бере маршрут сам).
  const launching = !!peekLaunchRoute() && !!me.data?.onboarded;
  useEffect(() => {
    if (!me.data?.onboarded) return;
    const route = takeLaunchRoute();
    if (route) nav(route, { replace: true });
  }, [me.data?.onboarded, nav]);

  // Передзавантаження екранів — лише коли перший екран отримав свої дані: 600 мс поспіль без запитів у польоті.
  // Між відповіддю /me і запитами головної теж є «тиша» — без паузи чанки уроку й карти (≈100 КБ) змагалися б
  // за мережу із запитами головної (замір npm run perf, 2026-10-31).
  const fetching = useIsFetching();
  useEffect(() => {
    if (!me.data?.onboarded || fetching > 0) return;
    const timer = setTimeout(prefetchScreens, 600);
    return () => clearTimeout(timer);
  }, [me.data?.onboarded, fetching]);

  const showNav = TAB_ROUTES.includes(loc.pathname);
  const reduced = me.data?.settings.reducedMotion;
  // Налаштування «Менше анімацій» діє і на CSS-анімації (MotionConfig керує лише framer-motion).
  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', !!reduced);
  }, [reduced]);
  const badges = useMemo(() => ({ '/quests': 0, '/profile': me.data?.counters.unseenAchievements ?? 0 }), [me.data]);

  useEffect(() => {
    if (me.data) bootMark('profile');
  }, [me.data]);

  // Профіль не завантажився через мережу — коли зв'язок повернеться, пробуємо знову самі.
  const failed = !!me.error;
  useEffect(() => {
    if (!failed) return;
    const retry = () => void me.refetch();
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [failed]); // eslint-disable-line react-hooks/exhaustive-deps

  let body;
  if (me.isLoading) body = <SplashScene loading onRetry={() => void me.refetch()} />;
  else if (me.error) {
    const banned = me.error instanceof ApiError && me.error.code === 'banned';
    body = banned ? <ErrorState error={new Error('banned')} /> : <SplashScene error onRetry={() => me.refetch()} />;
  } else if (me.data && !me.data.onboarded && !loc.pathname.startsWith('/lesson')) {
    body = (
      <ScreenBoundary resetKey="onboarding">
        <Suspense fallback={<Splash />}>
          <BootDone />
          <Onboarding />
        </Suspense>
      </ScreenBoundary>
    );
  } else {
    body = (
      <>
        {/* Новий екран з'являється одразу (без очікування анімації виходу попереднього). */}
        <motion.main
            key={loc.pathname}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12 }}
            className={showNav ? 'nav-pad' : ''}
          >
            <ScreenBoundary resetKey={loc.pathname}>
            <Suspense fallback={<ScreenSkeleton />}>
              <BootDone />
              {launching ? <ScreenSkeleton /> : (
              <Routes location={loc}>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/map" element={<MapScreen />} />
                <Route path="/learn" element={<LearnScreen />} />
                <Route path="/lesson/:lessonId" element={<LessonScreen />} />
                <Route path="/practice/:mode" element={<LessonScreen />} />
                <Route path="/quests" element={<QuestsScreen />} />
                <Route path="/story/:slug" element={<StoryScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/achievements" element={<AchievementsScreen />} />
                <Route path="/shop" element={<ShopScreen />} />
                <Route path="/house" element={<HouseScreen />} />
                <Route path="/diary" element={<DiaryScreen />} />
                <Route path="/dictionary" element={<DictionaryScreen />} />
                <Route path="/ai" element={<AiScreen />} />
                <Route path="/exams" element={<ExamsScreen />} />
                <Route path="/grammar" element={<GrammarScreen />} />
                <Route path="/social" element={<SocialScreen />} />
                <Route path="/premium" element={<PremiumScreen />} />
                <Route path="/settings" element={<SettingsScreen />} />
                <Route path="/life" element={<MissionsScreen />} />
                <Route path="/life/:slug" element={<MissionScreen />} />
                <Route path="/passport" element={<PassportScreen />} />
                <Route path="/slang" element={<SlangScreen />} />
                <Route path="/pass" element={<PassScreen />} />
                <Route path="*" element={<HomeScreen />} />
              </Routes>
              )}
            </Suspense>
            </ScreenBoundary>
          </motion.main>
        {showNav && <BottomNav badge={badges} />}
      </>
    );
  }

  return (
    <I18nProvider lang={lang}>
      <LazyMotion features={loadMotionFeatures}>
        <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>
          <ToastProvider>
            <div className="safe-top mx-auto min-h-full max-w-xl">{body}</div>
          </ToastProvider>
        </MotionConfig>
      </LazyMotion>
    </I18nProvider>
  );
}
