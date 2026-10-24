import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { I18nProvider, guessLang } from './i18n';
import { tg, setTelegramColors, startParam } from './lib/telegram';
import { useMe } from './lib/queries';
import { configureAudio, setSoundEnabled } from './lib/audio';
import { ApiError } from './lib/api';
import { BottomNav, ErrorState, ScreenSkeleton, ToastProvider } from './components/ui';
import { Beaver } from './components/Beaver';
import { Logo, Skyline } from './components/Scenery';
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
  const dark = pref === 'dark' || ((pref ?? 'auto') === 'auto' && systemDark);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    setTelegramColors(dark ? '#13202b' : '#fff9f0');
  }, [dark]);
}

function Splash() {
  return (
    <div className="relative grid h-full min-h-[100dvh] place-items-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #7CC8F5 0%, #CDEBFF 60%, #FFF9F0 100%)' }}>
      <Skyline className="absolute inset-x-0 bottom-0 w-full" height={240} sky={false} />
      <div className="relative -mt-24 flex flex-col items-center gap-3">
        <Logo size={46} />
        <Beaver mood="wave" size={160} outfit={{ JACKET: 'hoodie-red', BACKPACK: 'backpack-travel' }} />
      </div>
    </div>
  );
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

  const showNav = TAB_ROUTES.includes(loc.pathname);
  const reduced = me.data?.settings.reducedMotion;
  const badges = useMemo(() => ({ '/quests': 0, '/profile': me.data?.counters.unseenAchievements ?? 0 }), [me.data]);

  let body;
  if (me.isLoading) body = <Splash />;
  else if (me.error) {
    const banned = me.error instanceof ApiError && me.error.code === 'banned';
    body = <ErrorState error={banned ? new Error('banned') : me.error} onRetry={() => me.refetch()} />;
  } else if (me.data && !me.data.onboarded && !loc.pathname.startsWith('/lesson')) {
    body = (
      <Suspense fallback={<Splash />}>
        <Onboarding />
      </Suspense>
    );
  } else {
    body = (
      <>
        <AnimatePresence mode="wait">
          <motion.main
            key={loc.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={showNav ? 'pb-24' : ''}
          >
            <Suspense fallback={<ScreenSkeleton />}>
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
                <Route path="*" element={<HomeScreen />} />
              </Routes>
            </Suspense>
          </motion.main>
        </AnimatePresence>
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
