import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { SplashScene } from './components/Splash';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { MotionConfig, motion } from 'framer-motion';
import { I18nProvider, guessLang } from './i18n';
import { tg, setTelegramColors, startParam } from './lib/telegram';
import { useMe } from './lib/queries';
import { configureAudio, setSoundEnabled } from './lib/audio';
import { ApiError } from './lib/api';
import { bootMark } from './lib/boot';
import { BottomNav, ErrorState, ScreenSkeleton, ToastProvider } from './components/ui';
import { Beaver } from './components/Beaver';

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
  // Основна тема POLSKI GO — насичена темно-синя (затверджені референси); світла — за явним вибором.
  void systemDark;
  const dark = pref !== 'light';
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

/** Після старту у вільний час підвантажуємо екрани вкладок — перший перехід без очікування. */
function prefetchScreens() {
  const load = () => {
    for (const f of [() => import('./screens/Map'), () => import('./screens/Learn'), () => import('./screens/Lesson'), () => import('./screens/Quests'), () => import('./screens/Profile'), () => import('./screens/Dictionary'), () => import('./screens/Missions'), () => import('./screens/Mission')]) void f();
  };
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void };
  if (w.requestIdleCallback) w.requestIdleCallback(load, { timeout: 2500 });
  else setTimeout(load, 1200);
}

export function App() {
  const me = useMe();
  const loc = useLocation();
  const nav = useNavigate();
  const lang = me.data?.settings.uiLanguage ?? guessLang(tg?.initDataUnsafe.user?.language_code);
  useTheme(me.data?.settings.theme);
  useEffect(() => {
    setSoundEnabled(me.data?.settings.soundEnabled ?? true);
    configureAudio({ server: !!me.data?.audio?.server });
  }, [me.data?.settings.soundEnabled, me.data?.audio?.server]);

  // Глибокі посилання: startapp=lesson_<id>, story_<slug>, premium
  useEffect(() => {
    const p = startParam();
    if (!me.data?.onboarded || !p) return;
    if (p === 'premium') nav('/premium');
    else if (p.startsWith('story_')) nav(`/story/${p.slice(6)}`);
  }, [me.data?.onboarded, nav]);

  useEffect(() => {
    if (me.data?.onboarded) prefetchScreens();
  }, [me.data?.onboarded]);

  const showNav = TAB_ROUTES.includes(loc.pathname);
  const reduced = me.data?.settings.reducedMotion;
  const badges = useMemo(() => ({ '/quests': 0, '/profile': me.data?.counters.unseenAchievements ?? 0 }), [me.data]);

  useEffect(() => {
    if (me.data) bootMark('profile');
  }, [me.data]);

  let body;
  if (me.isLoading) body = <Splash />;
  else if (me.error) {
    const banned = me.error instanceof ApiError && me.error.code === 'banned';
    body = banned ? <ErrorState error={new Error('banned')} /> : <SplashScene error onRetry={() => me.refetch()} />;
  } else if (me.data && !me.data.onboarded && !loc.pathname.startsWith('/lesson')) {
    body = (
      <Suspense fallback={<Splash />}>
        <BootDone />
        <Onboarding />
      </Suspense>
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
            <Suspense fallback={<ScreenSkeleton />}>
              <BootDone />
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
                <Route path="*" element={<HomeScreen />} />
              </Routes>
            </Suspense>
          </motion.main>
        {showNav && <BottomNav badge={badges} />}
      </>
    );
  }

  return (
    <I18nProvider lang={lang}>
      <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>
        <ToastProvider>
          <div className="safe-top mx-auto min-h-full max-w-xl">{body}</div>
        </ToastProvider>
      </MotionConfig>
    </I18nProvider>
  );
}
