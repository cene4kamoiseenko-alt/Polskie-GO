import type { Cefr, CheckResult, I18n, UiLang } from '@polski-go/shared';

export type Outfit = { wear: Partial<Record<string, string>>; house: string[] };

export type Me = {
  id: string;
  firstName: string;
  username: string | null;
  photoUrl: string | null;
  referralCode: string;
  onboarded: boolean;
  createdAt: string;
  settings: {
    uiLanguage: UiLang;
    theme: 'auto' | 'light' | 'dark';
    timezone: string;
    learningGoal: string | null;
    dailyGoalMinutes: number;
    reminderHour: number | null;
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    reducedMotion: boolean;
    /** Може бути відсутнім, якщо сервер старіший за клієнт. */
    pronHint?: 'simple' | 'ipa' | 'off';
    publicProfile: boolean;
    showInLeaderboard: boolean;
  };
  profile: { displayName: string | null; beaverName: string; bio: string | null; selfLevel: Cefr | null; placementLevel: Cefr | null };
  progress: {
    xpTotal: number;
    level: number;
    levelXp: number;
    levelXpNeeded: number;
    languageLevel: Cefr;
    streak: number;
    streakBest: number;
    activeToday: boolean;
    lessonsCompleted: number;
    perfectLessons: number;
    wordsLearned: number;
    currentCity: { id: string; slug: string; namePl: string; name: I18n; emoji: string } | null;
  };
  today: { xp: number; goalXp: number; lessons: number; seconds: number };
  zlotki: number;
  premium: { active: boolean; expiresAt?: string; planCode?: string; recurring?: boolean; cancelled?: boolean };
  outfit: Outfit;
  counters: { dueReviews: number; mistakes: number; unseenAchievements: number };
  ai: { used: number; limit: number };
  /** Може бути відсутнім, якщо сервер старіший за клієнт. */
  rewards?: { exerciseXp: number };
  /** server — серверна польська озвучка доступна. */
  audio?: { server: boolean; provider?: string | null; voice?: string | null; recognition?: { server: boolean; provider?: string | null } };
};

export type LessonState = 'locked' | 'available' | 'completed';
export type JourneyLesson = {
  id: string;
  slug: string;
  kind: 'LESSON' | 'BOSS';
  title: I18n;
  topic: I18n;
  cefr: Cefr;
  difficulty: number;
  isPremium: boolean;
  exerciseCount: number;
  state: LessonState;
  stars: number;
  bestScore: number;
};
export type JourneyCity = {
  id: string;
  slug: string;
  order: number;
  namePl: string;
  name: I18n;
  theme: I18n;
  description: I18n;
  cefr: Cefr;
  mapX: number;
  mapY: number;
  emoji: string;
  color: string;
  hasContent: boolean;
  unlocked: boolean;
  completed: boolean;
  perfect: boolean;
  bossAvailable: boolean;
  lessonsTotal: number;
  lessonsDone: number;
  progress: number;
  /** chest — скриня теми (null — тема без звичайних уроків; відсутня — сервер старіший за клієнт). */
  routes: { id: string; slug: string; title: I18n; description: I18n; icon: string; lessons: JourneyLesson[]; chest?: { state: 'locked' | 'ready' | 'opened'; xp: number; zlotki: number } | null }[];
};
export type Journey = { cities: JourneyCity[]; currentCityId: string | null; nextLesson: JourneyLesson | null };

export type PublicItem = { key: string; type: string; skill: string; data: Record<string, unknown>; explanation?: I18n };

export type SessionStart = {
  sessionId: string;
  mode: string;
  lesson: null | { id: string; slug: string; kind: string; title: I18n; topic: I18n; explanation: I18n; examples: { pl: string; tr: I18n }[]; cefr: Cefr };
  words: { id: string; pl: string; translations: I18n; pronunciation: string | null; emoji: string | null; audioUrl: string | null }[];
  items: PublicItem[];
  /** Де урок на карті: місто, локація, номер уроку в локації. */
  place?: null | { citySlug: string; cityName: string; color: string; routeSlug: string; routeTitle: I18n; routeIcon: string; index: number; count: number };
  timeLimitSec: number | null;
  /** Незавершений урок: уже виконані завдання. */
  resume?: { done: string[] } | null;
};

export type AnswerResult = CheckResult & { explanation: I18n | null; retry: boolean; answered: number; total: number };

export type FinishResult = {
  mode: string;
  passed: boolean;
  perfect: boolean;
  correct: number;
  total: number;
  accuracy: number;
  mistakes: { key: string; type: string; skill: string }[];
  xp: number;
  zlotki: number;
  levelUp: number | null;
  streak: number;
  streakIncreased: boolean;
  newWords: { id: string; pl: string; translations: I18n }[];
  cityCompleted: null | { cityId: string; nextCity: null | { id: string; slug: string; name: I18n; namePl: string; emoji: string; hasLessons: boolean }; rewards: { slug: string; name: I18n; slot: string }[] };
  levelConfirmed: Cefr | null;
  placement: null | { level: Cefr; unlocked: string[] };
  questsCompleted: { id: string; title: I18n; icon: string }[];
  achievements: { slug: string; title: I18n; description?: I18n; icon: string; zlotki: number }[];
  durationSec: number;
};

export type Quest = {
  id: string | null;
  slug: string;
  kind: 'DAILY' | 'WEEKLY' | 'STORY';
  title: I18n;
  description: I18n;
  icon: string;
  progress: number;
  target: number;
  status: 'NEW' | 'ACTIVE' | 'COMPLETED' | 'CLAIMED';
  xp: number;
  zlotki: number;
  available?: boolean;
  stage?: number;
  stages?: number;
};

export type ShopItem = {
  id: string;
  slug: string;
  slot: string;
  name: I18n;
  assetKey: string;
  price: number;
  rarity: string;
  isPremium: boolean;
  rewardOnly: boolean;
  city: { slug: string; name: I18n } | null;
  /** Як отримати предмет-нагороду (з сервера). */
  unlock: { kind: 'mission' | 'city' | 'achievement' | 'quest'; title: I18n; slug?: string } | null;
  owned: boolean;
  equipped: boolean;
  /**
   * Живописний стан предмета (сервер, ADR-005 §12): за Złotki продаються лише `ready`, `legacy-whole-look`
   * і `not-wearable` (домик); `pending` і `unknown` — «візуал готується», купити не можна. Вже отримані такі речі
   * лишаються в гардеробі й надягаються, Бобек їх просто не малює. Старий сервер поля не віддає — див. shopVisualStatus.
   */
  visualStatus?: ShopVisualStatus;
};
export type ShopVisualStatus = 'ready' | 'legacy-whole-look' | 'not-wearable' | 'pending' | 'unknown';

export type VocabEntry = {
  id: string;
  pl: string;
  pos: string;
  translations: I18n;
  pronunciation: string | null;
  forms: Record<string, string>;
  examples: { pl: string; tr: I18n }[];
  cefr: Cefr;
  topics: string[];
  emoji: string | null;
  audioUrl: string | null;
  mine: null | { status: 'NEW' | 'LEARNING' | 'LEARNED'; favorite: boolean; timesCorrect: number; timesWrong: number };
};

// ── Місії «Польська в житті» ──
export type MissionLine = { who: 'npc' | 'beaver' | 'narrator'; pl: string; tr: I18n; hidden?: boolean };
export type MissionStepPublic = {
  id: string;
  kind: 'listen' | 'choice' | 'build';
  line: MissionLine | null;
  task: I18n;
  options?: { id: number; pl: string | null; text: I18n | null }[];
  tokens?: string[];
};
export type MissionSummary = {
  slug: string; category: string; tags: string[]; city: string; scene: string; title: I18n; goal: I18n;
  minutes: number; xp: number; zlotki: number; steps: number;
};
export type MissionListItem = MissionSummary & { completions: number; flawless: boolean; inProgress: number | null };
export type MissionRun = {
  runId: string; step: number; mistakes: number; hints: number;
  mission: MissionSummary & { intro: I18n; note: I18n | null; npc: { name: string; role: I18n }; steps: MissionStepPublic[] };
};
export type MissionFinish = {
  first: boolean; flawless: boolean; mistakes: number; hints: number; xp: number; zlotki: number; levelUp: number | null; streak: number; streakIncreased: boolean;
  phrases: { pl: string; tr: I18n }[]; newWords: { id: string; pl: string; translations: I18n }[];
  achievements: { slug: string; title: never; description: never; icon: string; zlotki: number }[];
};
export type MissionAnswer =
  | { correct: true; firstTry: boolean; line: MissionLine | null; explain: I18n; next: number | null; finished?: MissionFinish }
  | { correct: false; why: I18n; mistakes: number };
