/**
 * POLSKI GO — схема бази даних (Cloudflare D1 / SQLite, Drizzle ORM).
 * Таблиці й колонки — snake_case, поля в коді — camelCase.
 * Усі нагороди, прогрес і покупки зберігаються лише сервером.
 */
import { relations, sql } from 'drizzle-orm';
import { blob, check, index, integer, primaryKey, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import type { I18n } from '@polski-go/shared';

export const newId = () => crypto.randomUUID().replace(/-/g, '');

const id = () => text('id').primaryKey().$defaultFn(newId);
const ts = (name: string) => integer(name, { mode: 'timestamp_ms' });
const createdAt = (name = 'created_at') => ts(name).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`).$defaultFn(() => new Date());
const updatedAt = () => createdAt('updated_at').$onUpdateFn(() => new Date());
const bool = (name: string) => integer(name, { mode: 'boolean' });
const json = <T>(name: string) => text(name, { mode: 'json' }).$type<T>();

export const CEFR = ['A0', 'A1', 'A2', 'B1', 'B2'] as const;
export const CONTENT_STATUS = ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'] as const;
export const LESSON_KIND = ['LESSON', 'BOSS', 'EXAM', 'PLACEMENT'] as const;
export const SESSION_MODE = ['LESSON', 'REVIEW', 'MISTAKES', 'FIVE_MIN', 'SPEED', 'EXAM', 'PLACEMENT', 'GRAMMAR'] as const;
export const SESSION_STATUS = ['ACTIVE', 'FINISHED', 'ABANDONED'] as const;
export const VOCAB_STATUS = ['NEW', 'LEARNING', 'LEARNED'] as const;
export const QUEST_KIND = ['DAILY', 'WEEKLY', 'STORY', 'EVENT'] as const;
export const QUEST_STATUS = ['ACTIVE', 'COMPLETED', 'CLAIMED'] as const;
export const ITEM_SLOT = ['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'COSTUME', 'FURNITURE', 'DECOR', 'SOUVENIR', 'FRAME'] as const;
export const FRIENDSHIP_STATUS = ['PENDING', 'ACCEPTED'] as const;
export const SUBSCRIPTION_STATUS = ['ACTIVE', 'CANCELLED', 'EXPIRED', 'REFUNDED'] as const;
export const ADMIN_ROLE = ['SUPERADMIN', 'EDITOR', 'SUPPORT'] as const;

// ───────────────────────── Користувачі ─────────────────────────

export const users = sqliteTable(
  'users',
  {
    id: id(),
    telegramId: integer('telegram_id').notNull().unique(),
    username: text('username'),
    firstName: text('first_name').notNull().default(''),
    lastName: text('last_name'),
    photoUrl: text('photo_url'),
    languageCode: text('language_code'),
    referralCode: text('referral_code').notNull().unique(),
    referredById: text('referred_by_id'),
    isBanned: bool('is_banned').notNull().default(false),
    banReason: text('ban_reason'),
    onboardedAt: ts('onboarded_at'),
    createdAt: createdAt(),
    lastSeenAt: createdAt('last_seen_at'),
  },
  (t) => [index('users_created_at_idx').on(t.createdAt), index('users_last_seen_at_idx').on(t.lastSeenAt)],
);

export const userSettings = sqliteTable('user_settings', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  uiLanguage: text('ui_language').notNull().default('uk'),
  theme: text('theme').notNull().default('auto'),
  timezone: text('timezone').notNull().default('Europe/Warsaw'),
  learningGoal: text('learning_goal'),
  dailyGoalMinutes: integer('daily_goal_minutes').notNull().default(10),
  reminderHour: integer('reminder_hour'),
  notificationsEnabled: bool('notifications_enabled').notNull().default(false),
  soundEnabled: bool('sound_enabled').notNull().default(true),
  reducedMotion: bool('reduced_motion').notNull().default(false),
  /** Підказка вимови: simple — приблизно кирилицею (лише ru/uk), ipa — транскрипція IPA, off — без підказки. */
  pronHint: text('pron_hint', { enum: ['simple', 'ipa', 'off'] }).notNull().default('simple'),
  publicProfile: bool('public_profile').notNull().default(true),
  showInLeaderboard: bool('show_in_leaderboard').notNull().default(true),
  updatedAt: updatedAt(),
});

export const userProfiles = sqliteTable('user_profiles', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name'),
  bio: text('bio'),
  beaverName: text('beaver_name').notNull().default('Bobek'),
  /** Самооцінка рівня під час онбордингу (не підтверджений рівень). */
  selfLevel: text('self_level', { enum: CEFR }),
  /** Результат вхідного тесту (рекомендація, не сертифікація). */
  placementLevel: text('placement_level', { enum: CEFR }),
  updatedAt: updatedAt(),
});

export const playerProgress = sqliteTable(
  'player_progress',
  {
    userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    xpTotal: integer('xp_total').notNull().default(0),
    playerLevel: integer('player_level').notNull().default(1),
    /** Підтверджений рівень польської (тільки через іспити). */
    languageLevel: text('language_level', { enum: CEFR }).notNull().default('A0'),
    currentCityId: text('current_city_id').references(() => cities.id, { onDelete: 'set null' }),
    streakCurrent: integer('streak_current').notNull().default(0),
    streakBest: integer('streak_best').notNull().default(0),
    lastActiveDay: text('last_active_day'),
    lessonsCompleted: integer('lessons_completed').notNull().default(0),
    perfectLessons: integer('perfect_lessons').notNull().default(0),
    wordsLearned: integer('words_learned').notNull().default(0),
    exercisesCorrect: integer('exercises_correct').notNull().default(0),
    updatedAt: updatedAt(),
  },
  (t) => [index('player_progress_xp_idx').on(t.xpTotal)],
);

export const languageSkills = sqliteTable(
  'language_skills',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    skill: text('skill').notNull(),
    mastery: integer('mastery').notNull().default(0),
    attempts: integer('attempts').notNull().default(0),
    correct: integer('correct').notNull().default(0),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('language_skills_user_skill').on(t.userId, t.skill)],
);

/** Агрегат активності за день — для графіків прогресу та щоденної мети. */
export const dailyActivity = sqliteTable(
  'daily_activity',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    day: text('day').notNull(),
    xp: integer('xp').notNull().default(0),
    lessons: integer('lessons').notNull().default(0),
    exercises: integer('exercises').notNull().default(0),
    correct: integer('correct').notNull().default(0),
    newWords: integer('new_words').notNull().default(0),
    reviews: integer('reviews').notNull().default(0),
    seconds: integer('seconds').notNull().default(0),
    practiceXp: integer('practice_xp').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

// ───────────────────────── Контент: карта, міста, уроки ─────────────────────────

export const cities = sqliteTable('cities', {
  id: id(),
  slug: text('slug').notNull().unique(),
  order: integer('order').notNull().unique(),
  namePl: text('name_pl').notNull(),
  name: json<I18n>('name').notNull(),
  theme: json<I18n>('theme').notNull(),
  description: json<I18n>('description').notNull(),
  cefr: text('cefr', { enum: CEFR }).notNull(),
  mapX: real('map_x').notNull(),
  mapY: real('map_y').notNull(),
  emoji: text('emoji').notNull().default('🏙️'),
  color: text('color').notNull().default('#45C486'),
  /** Скільки уроків треба пройти, щоб отримати квиток до наступного міста. */
  ticketLessons: integer('ticket_lessons').notNull().default(0),
  status: text('status', { enum: CONTENT_STATUS }).notNull().default('DRAFT'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const cityRoutes = sqliteTable(
  'city_routes',
  {
    id: id(),
    cityId: text('city_id').notNull().references(() => cities.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull().unique(),
    order: integer('order').notNull(),
    title: json<I18n>('title').notNull(),
    description: json<I18n>('description').notNull(),
    icon: text('icon').notNull().default('📘'),
    status: text('status', { enum: CONTENT_STATUS }).notNull().default('DRAFT'),
  },
  (t) => [uniqueIndex('city_routes_city_order').on(t.cityId, t.order)],
);

export const lessons = sqliteTable(
  'lessons',
  {
    id: id(),
    routeId: text('route_id').references(() => cityRoutes.id, { onDelete: 'set null' }),
    slug: text('slug').notNull().unique(),
    order: integer('order').notNull().default(0),
    kind: text('kind', { enum: LESSON_KIND }).notNull().default('LESSON'),
    title: json<I18n>('title').notNull(),
    topic: json<I18n>('topic').notNull(),
    cefr: text('cefr', { enum: CEFR }).notNull().default('A0'),
    difficulty: integer('difficulty').notNull().default(1),
    /** Коротке пояснення граматики/теми перед вправами. */
    explanation: json<I18n>('explanation').notNull(),
    /** Приклади: [{pl, tr: I18n}] */
    examples: json<{ pl: string; tr: I18n }[]>('examples').notNull().default([]),
    isPremium: bool('is_premium').notNull().default(false),
    status: text('status', { enum: CONTENT_STATUS }).notNull().default('DRAFT'),
    /** Кількість вправ уроку. Підтримують тригери на exercises (міграція 0005), seed перераховує;
     *  getJourney читає це поле замість GROUP BY по всій таблиці вправ. */
    exerciseCount: integer('exercise_count').notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('lessons_route_order_idx').on(t.routeId, t.order)],
);

export const lessonWords = sqliteTable(
  'lesson_words',
  {
    lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
    entryId: text('entry_id').notNull().references(() => vocabularyEntries.id, { onDelete: 'cascade' }),
    order: integer('order').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.lessonId, t.entryId] })],
);

export const exercises = sqliteTable(
  'exercises',
  {
    id: id(),
    lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    type: text('type').notNull(),
    skill: text('skill').notNull(),
    /** Дані вправи, включно з правильною відповіддю. Ніколи не надсилаються клієнту повністю. */
    data: json<Record<string, unknown>>('data').notNull(),
    explanation: json<I18n>('explanation'),
    audioUrl: text('audio_url'),
    imageUrl: text('image_url'),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('exercises_lesson_order').on(t.lessonId, t.order), index('exercises_skill_idx').on(t.skill)],
);

export const exerciseAttempts = sqliteTable(
  'exercise_attempts',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    sessionId: text('session_id').notNull().references(() => learningSessions.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').references(() => exercises.id, { onDelete: 'set null' }),
    itemKey: text('item_key').notNull(),
    type: text('type').notNull(),
    skill: text('skill').notNull(),
    answer: json<unknown>('answer').notNull(),
    isCorrect: bool('is_correct').notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index('attempts_user_created_idx').on(t.userId, t.createdAt),
    index('attempts_user_correct_idx').on(t.userId, t.isCorrect),
    index('attempts_exercise_correct_idx').on(t.exerciseId, t.isCorrect),
  ],
);

export const userLessonProgress = sqliteTable(
  'user_lesson_progress',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
    completions: integer('completions').notNull().default(0),
    bestScore: integer('best_score').notNull().default(0),
    stars: integer('stars').notNull().default(0),
    firstCompletedAt: ts('first_completed_at'),
    lastCompletedAt: ts('last_completed_at'),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

export const userCities = sqliteTable(
  'user_cities',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    cityId: text('city_id').notNull().references(() => cities.id, { onDelete: 'cascade' }),
    unlockedAt: createdAt('unlocked_at'),
    completedAt: ts('completed_at'),
    bossPassedAt: ts('boss_passed_at'),
    /** journey — відкрито квитком; placement — відкрито за вхідним тестом (усі уроки доступні) */
    source: text('source').notNull().default('journey'),
  },
  (t) => [primaryKey({ columns: [t.userId, t.cityId] })],
);

export const learningSessions = sqliteTable(
  'learning_sessions',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id').references(() => lessons.id, { onDelete: 'set null' }),
    mode: text('mode', { enum: SESSION_MODE }).notNull(),
    status: text('status', { enum: SESSION_STATUS }).notNull().default('ACTIVE'),
    /** Знімок вправ сесії з відповідями (серверний). */
    items: json<unknown[]>('items').notNull(),
    /** Стан проходження: відповіді, кроки діалогів. */
    state: json<Record<string, unknown>>('state').notNull().default({}),
    /** Версія для оптимістичного блокування (тригер у міграції). */
    version: integer('version').notNull().default(0),
    correct: integer('correct').notNull().default(0),
    total: integer('total').notNull().default(0),
    xpAwarded: integer('xp_awarded').notNull().default(0),
    zlotkiAwarded: integer('zlotki_awarded').notNull().default(0),
    startedAt: createdAt('started_at'),
    finishedAt: ts('finished_at'),
  },
  (t) => [index('sessions_user_started_idx').on(t.userId, t.startedAt), index('sessions_user_lesson_idx').on(t.userId, t.lessonId, t.finishedAt)],
);

// ───────────────────────── Словник ─────────────────────────

export const vocabularyEntries = sqliteTable(
  'vocabulary_entries',
  {
    id: id(),
    pl: text('pl').notNull(),
    pos: text('pos').notNull(),
    translations: json<I18n>('translations').notNull(),
    pronunciation: text('pronunciation'),
    /** Граматичні форми: {"gen":"kota", ...} */
    forms: json<Record<string, string>>('forms').notNull().default({}),
    /** Приклади: [{pl, tr: I18n}] */
    examples: json<{ pl: string; tr: I18n }[]>('examples').notNull().default([]),
    cefr: text('cefr', { enum: CEFR }).notNull().default('A0'),
    topics: json<string[]>('topics').notNull().default([]),
    emoji: text('emoji'),
    audioUrl: text('audio_url'),
    imageUrl: text('image_url'),
    status: text('status', { enum: CONTENT_STATUS }).notNull().default('PUBLISHED'),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('vocab_pl_pos').on(t.pl, t.pos), index('vocab_cefr_idx').on(t.cefr)],
);

export const userVocabulary = sqliteTable(
  'user_vocabulary',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    entryId: text('entry_id').notNull().references(() => vocabularyEntries.id, { onDelete: 'cascade' }),
    status: text('status', { enum: VOCAB_STATUS }).notNull().default('NEW'),
    favorite: bool('favorite').notNull().default(false),
    timesSeen: integer('times_seen').notNull().default(0),
    timesCorrect: integer('times_correct').notNull().default(0),
    timesWrong: integer('times_wrong').notNull().default(0),
    addedAt: createdAt('added_at'),
    lastSeenAt: ts('last_seen_at'),
  },
  (t) => [primaryKey({ columns: [t.userId, t.entryId] }), index('user_vocab_status_idx').on(t.userId, t.status)],
);

export const reviewSchedule = sqliteTable(
  'review_schedule',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    /** WORD — слово словника, EXERCISE — вправа з помилкою */
    itemType: text('item_type').notNull(),
    itemId: text('item_id').notNull(),
    ease: real('ease').notNull().default(2.5),
    intervalDays: integer('interval_days').notNull().default(0),
    repetitions: integer('repetitions').notNull().default(0),
    lapses: integer('lapses').notNull().default(0),
    dueAt: ts('due_at').notNull(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('review_user_item').on(t.userId, t.itemType, t.itemId), index('review_user_due_idx').on(t.userId, t.dueAt)],
);

// ───────────────────────── Квести та досягнення ─────────────────────────

export const quests = sqliteTable('quests', {
  id: id(),
  slug: text('slug').notNull().unique(),
  kind: text('kind', { enum: QUEST_KIND }).notNull(),
  title: json<I18n>('title').notNull(),
  description: json<I18n>('description').notNull(),
  /** Метрика прогресу: LESSONS, XP, NEW_WORDS, REVIEWS, PERFECT_STREAK, DIALOGUES, LISTENING, CITY_COMPLETED, STORY */
  metric: text('metric').notNull(),
  target: integer('target').notNull().default(1),
  xpReward: integer('xp_reward').notNull().default(0),
  zlotkiReward: integer('zlotki_reward').notNull().default(0),
  rewardItemId: text('reward_item_id'),
  cityId: text('city_id').references(() => cities.id, { onDelete: 'set null' }),
  icon: text('icon').notNull().default('⭐'),
  isPremium: bool('is_premium').notNull().default(false),
  status: text('status', { enum: CONTENT_STATUS }).notNull().default('PUBLISHED'),
  order: integer('order').notNull().default(0),
});

export const questSteps = sqliteTable(
  'quest_steps',
  {
    id: id(),
    questId: text('quest_id').notNull().references(() => quests.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    /** Граф сцени: {title, start, nodes: {id: {speaker, pl, tr, choices:[...]}}} */
    data: json<Record<string, unknown>>('data').notNull(),
  },
  (t) => [uniqueIndex('quest_steps_quest_order').on(t.questId, t.order)],
);

export const userQuests = sqliteTable(
  'user_quests',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    questId: text('quest_id').notNull().references(() => quests.id, { onDelete: 'cascade' }),
    /** Період: день (2026-10-24), тиждень (2026-W43) або "story". */
    periodKey: text('period_key').notNull(),
    progress: integer('progress').notNull().default(0),
    status: text('status', { enum: QUEST_STATUS }).notNull().default('ACTIVE'),
    state: json<Record<string, unknown>>('state').notNull().default({}),
    completedAt: ts('completed_at'),
    claimedAt: ts('claimed_at'),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('user_quests_period').on(t.userId, t.questId, t.periodKey), index('user_quests_user_period_idx').on(t.userId, t.periodKey)],
);

export const achievements = sqliteTable('achievements', {
  id: id(),
  slug: text('slug').notNull().unique(),
  title: json<I18n>('title').notNull(),
  description: json<I18n>('description').notNull(),
  icon: text('icon').notNull(),
  /** Метрика: LESSONS, STREAK, WORDS, XP, PERFECT_LESSONS, CITIES, PURCHASES, FRIENDS, STORY_QUESTS */
  metric: text('metric').notNull(),
  threshold: integer('threshold').notNull(),
  zlotkiReward: integer('zlotki_reward').notNull().default(0),
  rewardItemId: text('reward_item_id'),
  order: integer('order').notNull().default(0),
  isActive: bool('is_active').notNull().default(true),
});

export const userAchievements = sqliteTable(
  'user_achievements',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    achievementId: text('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
    unlockedAt: createdAt('unlocked_at'),
    seen: bool('seen').notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.userId, t.achievementId] })],
);

// ───────────────────────── Гардероб, домик, гаманець ─────────────────────────

export const cosmeticItems = sqliteTable('cosmetic_items', {
  id: id(),
  slug: text('slug').notNull().unique(),
  slot: text('slot', { enum: ITEM_SLOT }).notNull(),
  name: json<I18n>('name').notNull(),
  description: json<I18n>('description'),
  /** Ключ ассета для рендеру на бобрі/в домику. */
  assetKey: text('asset_key').notNull(),
  price: integer('price').notNull().default(0),
  rarity: text('rarity').notNull().default('common'),
  isPremium: bool('is_premium').notNull().default(false),
  /** Не продається — лише нагорода (досягнення, квест, місто). */
  rewardOnly: bool('reward_only').notNull().default(false),
  cityId: text('city_id').references(() => cities.id, { onDelete: 'set null' }),
  isActive: bool('is_active').notNull().default(true),
  order: integer('order').notNull().default(0),
});

export const userInventory = sqliteTable(
  'user_inventory',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    itemId: text('item_id').notNull().references(() => cosmeticItems.id, { onDelete: 'cascade' }),
    equipped: bool('equipped').notNull().default(false),
    source: text('source').notNull().default('shop'),
    acquiredAt: createdAt('acquired_at'),
  },
  (t) => [primaryKey({ columns: [t.userId, t.itemId] })],
);

export const gameWallets = sqliteTable(
  'game_wallets',
  {
    userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    balance: integer('balance').notNull().default(0),
    updatedAt: updatedAt(),
  },
  // Баланс не може стати від'ємним: списання понад залишок відкочує весь пакет запитів.
  (t) => [check('game_wallets_balance_non_negative', sql`${t.balance} >= 0`)],
);

export const walletTransactions = sqliteTable(
  'wallet_transactions',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(),
    reason: text('reason').notNull(),
    /** Ключ ідемпотентності: одна нагорода за подію нараховується один раз. */
    idempotencyKey: text('idempotency_key').notNull().unique(),
    createdAt: createdAt(),
  },
  (t) => [index('wallet_tx_user_created_idx').on(t.userId, t.createdAt)],
);

/** Журнал нарахувань XP (з ключем ідемпотентності). */
export const xpEvents = sqliteTable(
  'xp_events',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(),
    reason: text('reason').notNull(),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    day: text('day').notNull(),
    week: text('week').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('xp_events_user_day_idx').on(t.userId, t.day), index('xp_events_week_idx').on(t.week)],
);

// ───────────────────────── Соціальне ─────────────────────────

export const friendships = sqliteTable(
  'friendships',
  {
    id: id(),
    requesterId: text('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    addresseeId: text('addressee_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', { enum: FRIENDSHIP_STATUS }).notNull().default('PENDING'),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('friendships_pair').on(t.requesterId, t.addresseeId), index('friendships_addressee_idx').on(t.addresseeId)],
);

/** Тижневі ліги: XP за тиждень. */
export const leaderboards = sqliteTable(
  'leaderboards',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    periodKey: text('period_key').notNull(),
    league: text('league').notNull().default('bronze'),
    xp: integer('xp').notNull().default(0),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.periodKey] }), index('leaderboards_period_xp_idx').on(t.periodKey, t.xp)],
);

// ───────────────────────── Монетизація ─────────────────────────

export const subscriptionPlans = sqliteTable('subscription_plans', {
  code: text('code').primaryKey(),
  months: integer('months').notNull(),
  priceStars: integer('price_stars').notNull(),
  /** true — щомісячна підписка Telegram Stars з автопродовженням. */
  recurring: bool('recurring').notNull().default(false),
  title: json<I18n>('title').notNull(),
  isActive: bool('is_active').notNull().default(true),
  order: integer('order').notNull().default(0),
  updatedAt: updatedAt(),
});

export const subscriptions = sqliteTable(
  'subscriptions',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    planCode: text('plan_code').notNull(),
    status: text('status', { enum: SUBSCRIPTION_STATUS }).notNull().default('ACTIVE'),
    startsAt: ts('starts_at').notNull(),
    expiresAt: ts('expires_at').notNull(),
    isRecurring: bool('is_recurring').notNull().default(false),
    telegramChargeId: text('telegram_charge_id').unique(),
    cancelledAt: ts('cancelled_at'),
    grantedByAdminId: text('granted_by_admin_id'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('subscriptions_user_expires_idx').on(t.userId, t.expiresAt)],
);

/** Журнал платіжних подій. Унікальний charge id захищає від повторної обробки. */
export const paymentEvents = sqliteTable(
  'payment_events',
  {
    id: id(),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    type: text('type').notNull(),
    planCode: text('plan_code'),
    amount: integer('amount'),
    currency: text('currency'),
    chargeId: text('charge_id').unique(),
    payload: text('payload'),
    raw: json<unknown>('raw'),
    error: text('error'),
    createdAt: createdAt(),
  },
  (t) => [index('payment_events_user_idx').on(t.userId, t.createdAt), index('payment_events_type_idx').on(t.type, t.createdAt), index('payment_events_payload_idx').on(t.payload)],
);

// ───────────────────────── AI ─────────────────────────

export const aiConversations = sqliteTable(
  'ai_conversations',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    mode: text('mode').notNull().default('chat'),
    title: text('title'),
    messages: json<{ role: 'user' | 'assistant'; content: string; at: string }[]>('messages').notNull().default([]),
    tokensIn: integer('tokens_in').notNull().default(0),
    tokensOut: integer('tokens_out').notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('ai_conv_user_updated_idx').on(t.userId, t.updatedAt)],
);

/** Лічильник AI-запитів за день (ліміти та контроль витрат). */
export const aiUsage = sqliteTable(
  'ai_usage',
  {
    userId: text('user_id').notNull(),
    day: text('day').notNull(),
    requests: integer('requests').notNull().default(0),
    tokensIn: integer('tokens_in').notNull().default(0),
    tokensOut: integer('tokens_out').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

// ───────────────────────── Адміністрування ─────────────────────────

export const adminUsers = sqliteTable('admin_users', {
  id: id(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: ADMIN_ROLE }).notNull().default('EDITOR'),
  isActive: bool('is_active').notNull().default(true),
  createdAt: createdAt(),
  lastLoginAt: ts('last_login_at'),
});

export const adminAuditLogs = sqliteTable(
  'admin_audit_logs',
  {
    id: id(),
    adminId: text('admin_id').references(() => adminUsers.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id'),
    details: json<unknown>('details'),
    createdAt: createdAt(),
  },
  (t) => [index('audit_created_idx').on(t.createdAt)],
);

/** Налаштування гри, що редагуються в адмінці (нагороди, ліміти). */
export const gameConfig = sqliteTable('game_config', {
  key: text('key').primaryKey(),
  value: json<Record<string, unknown>>('value').notNull(),
  updatedAt: updatedAt(),
});

export const notificationCampaigns = sqliteTable('notification_campaigns', {
  id: id(),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  message: json<Record<string, string>>('message').notNull(),
  status: text('status').notNull().default('DRAFT'),
  sentCount: integer('sent_count').notNull().default(0),
  /** Курсор розсилки: id останнього користувача, якому надіслано (розсилка частинами по cron). */
  cursor: text('cursor'),
  scheduledAt: ts('scheduled_at'),
  sentAt: ts('sent_at'),
  createdAt: createdAt(),
});

/** Файли, завантажені в адмінці (зображення, аудіо, Lottie). Рядок D1 вміщує до 2 МБ. */
export const uploads = sqliteTable('uploads', {
  name: text('name').primaryKey(),
  type: text('type').notNull(),
  data: blob('data', { mode: 'buffer' }).notNull(),
  createdAt: createdAt(),
});

/** Кеш серверного синтезу польського мовлення: кожна фраза синтезується один раз. */
export const ttsCache = sqliteTable('tts_cache', {
  /** sha256(провайдер|голос|швидкість|текст) */
  key: text('key').primaryKey(),
  text: text('text').notNull(),
  voice: text('voice').notNull(),
  rate: text('rate').notNull(),
  mime: text('mime').notNull(),
  data: blob('data', { mode: 'buffer' }).notNull(),
  createdAt: createdAt(),
});

/**
 * Стан доставки навчального нагадування.
 *  • PENDING — запис створено перед надсиланням, воркер тримає lease (`lease_until`);
 *  • SENT — Telegram прийняв повідомлення; FAILED — не доставлено (повтор до `NOTIFY_MAX_ATTEMPTS`, поки `next_attempt_at` задано);
 *  • BLOCKED — 403, користувач заблокував бота; SKIPPED — повтор уже не потрібен (інший день, згоду вимкнено, користувач вчився);
 *  • UNKNOWN — результат невідомий (тайм-аут або обрив після відправки, lease прострочено): автоматично не повторюється,
 *    щоб не надіслати двічі; LEGACY — рядки до міграції 0008 (записувалися перед надсиланням).
 */
export const NOTIFY_STATUS = ['PENDING', 'SENT', 'FAILED', 'BLOCKED', 'SKIPPED', 'UNKNOWN', 'LEGACY'] as const;

/**
 * Журнал навчальних нагадувань і ключ ідемпотентності: унікальний (user_id, kind, day) — одне нагадування на день користувача.
 * Рядок створює той воркер, чий INSERT виконався першим; решта паралельних запусків cron пропускає користувача.
 */
export const notificationLog = sqliteTable(
  'notification_log',
  {
    id: id(),
    userId: text('user_id').notNull(),
    kind: text('kind').notNull(),
    day: text('day').notNull(),
    createdAt: createdAt(),
    status: text('status', { enum: NOTIFY_STATUS }).notNull().default('LEGACY'),
    /** Сценарій тексту й картинки: lesson | streak | return. */
    template: text('template'),
    lang: text('lang'),
    /** Фактичний метод: sendPhoto або sendMessage (без картинки, якщо фото не пішло). */
    method: text('method'),
    attempts: integer('attempts').notNull().default(0),
    leaseUntil: ts('lease_until'),
    nextAttemptAt: ts('next_attempt_at'),
    sentAt: ts('sent_at'),
    telegramMessageId: integer('telegram_message_id'),
    error: text('error'),
    updatedAt: ts('updated_at'),
  },
  (t) => [uniqueIndex('notification_log_unique').on(t.userId, t.kind, t.day), index('notification_log_status_idx').on(t.status, t.nextAttemptAt)],
);

/** Оброблені update_id вебхука Telegram: повторна доставка того самого оновлення не відповідає вдруге. Старі рядки прибирає cron. */
export const telegramUpdates = sqliteTable('telegram_updates', {
  updateId: integer('update_id').primaryKey(),
  createdAt: createdAt(),
});

/**
 * Службовий стан сервера (ключ → JSON): секрет webhook і його покоління, версія налаштування бота в Telegram,
 * результат останньої перевірки webhook. Адмінка й API користувача цю таблицю не віддають.
 */
export const appState = sqliteTable('app_state', {
  key: text('key').primaryKey(),
  value: json<Record<string, unknown>>('value').notNull(),
  updatedAt: updatedAt(),
});

// ───────────────────────── Швидкі питання в боті (/quiz) ─────────────────────────

/**
 * Учасник швидких питань — за telegram_id: вікторина працює й до першого входу в Mini App (XP — лише з акаунтом).
 * day / day_count — ліміт на місцевий день, last_question_at — пауза між питаннями, recent — останні питання (без повторів).
 */
export const botQuizPlayers = sqliteTable('bot_quiz_players', {
  telegramId: integer('telegram_id').primaryKey(),
  pushEnabled: bool('push_enabled').notNull().default(true),
  /** Місцевий день і скільки питань за нього надіслано (захист від спаму, не обмеження навчання). */
  day: text('day'),
  dayCount: integer('day_count').notNull().default(0),
  lastQuestionAt: ts('last_question_at'),
  /** Місцевий день і скільки відповідей за нього отримали XP (не більше трьох). */
  rewardDay: text('reward_day'),
  rewardCount: integer('reward_count').notNull().default(0),
  answered: integer('answered').notNull().default(0),
  correct: integer('correct').notNull().default(0),
  /** Скільки запрошень поспіль користувач не відкрив: після двох запрошення зупиняються, доки він сам не відповість. */
  ignoredPushes: integer('ignored_pushes').notNull().default(0),
  recent: json<string[]>('recent').notNull().default([]),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const QUIZ_ROUND_STATUS = ['OPEN', 'ANSWERED'] as const;

/** Одне надіслане питання: порядок варіантів, відповідь і нагорода. Відповідь приймається один раз (OPEN → ANSWERED). */
export const botQuizRounds = sqliteTable(
  'bot_quiz_rounds',
  {
    id: id(),
    telegramId: integer('telegram_id').notNull(),
    chatId: integer('chat_id').notNull(),
    messageId: integer('message_id'),
    questionId: text('question_id').notNull(),
    /** Індекси варіантів у порядку показу (A, B, C, D). */
    optionOrder: json<number[]>('option_order').notNull(),
    lang: text('lang').notNull(),
    /** command | push | next */
    source: text('source').notNull(),
    status: text('status', { enum: QUIZ_ROUND_STATUS }).notNull().default('OPEN'),
    hasPhoto: bool('has_photo').notNull().default(false),
    chosen: integer('chosen'),
    correct: bool('correct'),
    onTime: bool('on_time'),
    xp: integer('xp').notNull().default(0),
    sentAt: ts('sent_at').notNull(),
    answeredAt: ts('answered_at'),
  },
  (t) => [index('bot_quiz_rounds_tg_idx').on(t.telegramId, t.sentAt)],
);

// ───────────────────────── Місії «Польська в житті» ─────────────────────────

/** Проходження місії. Відповіді перевіряє сервер; version захищає від паралельних запитів. */
export const missionRuns = sqliteTable(
  'mission_runs',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    missionSlug: text('mission_slug').notNull(),
    step: integer('step').notNull().default(0),
    /** Помилки та підказки за все проходження. */
    mistakes: integer('mistakes').notNull().default(0),
    hints: integer('hints').notNull().default(0),
    /** Поточний крок уже мав помилку чи підказку (тоді він не «з першої спроби»). */
    stepFailed: bool('step_failed').notNull().default(false),
    status: text('status', { enum: SESSION_STATUS }).notNull().default('ACTIVE'),
    version: integer('version').notNull().default(0),
    startedAt: createdAt('started_at'),
    finishedAt: ts('finished_at'),
  },
  (t) => [index('mission_runs_user_idx').on(t.userId, t.missionSlug, t.status)],
);

/** Підсумок місій користувача: скільки разів пройдено, скільки — без помилок і підказок. */
export const userMissions = sqliteTable(
  'user_missions',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    missionSlug: text('mission_slug').notNull(),
    completions: integer('completions').notNull().default(0),
    flawless: integer('flawless').notNull().default(0),
    bestMistakes: integer('best_mistakes').notNull().default(0),
    firstCompletedAt: ts('first_completed_at'),
    lastCompletedAt: ts('last_completed_at'),
  },
  (t) => [primaryKey({ columns: [t.userId, t.missionSlug] })],
);

/** Розв'язані кроки місій («ситуації») — для досягнень на кшталт «5 різних ситуацій у транспорті». */
export const userMissionSteps = sqliteTable(
  'user_mission_steps',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    /** slug місії:id кроку */
    stepKey: text('step_key').notNull(),
    firstTry: bool('first_try').notNull().default(false),
    solvedAt: createdAt('solved_at'),
  },
  (t) => [primaryKey({ columns: [t.userId, t.stepKey] })],
);

// ───────────────────────── Зв'язки (для db.query) ─────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  settings: one(userSettings, { fields: [users.id], references: [userSettings.userId] }),
  profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
  progress: one(playerProgress, { fields: [users.id], references: [playerProgress.userId] }),
  wallet: one(gameWallets, { fields: [users.id], references: [gameWallets.userId] }),
  subscriptions: many(subscriptions),
  payments: many(paymentEvents),
  cities: many(userCities),
  sessions: many(learningSessions),
  xpEvents: many(xpEvents),
  transactions: many(walletTransactions),
  achievements: many(userAchievements),
}));
export const userSettingsRelations = relations(userSettings, ({ one }) => ({ user: one(users, { fields: [userSettings.userId], references: [users.id] }) }));
export const userProfilesRelations = relations(userProfiles, ({ one }) => ({ user: one(users, { fields: [userProfiles.userId], references: [users.id] }) }));
export const playerProgressRelations = relations(playerProgress, ({ one }) => ({
  user: one(users, { fields: [playerProgress.userId], references: [users.id] }),
  currentCity: one(cities, { fields: [playerProgress.currentCityId], references: [cities.id] }),
}));
export const gameWalletsRelations = relations(gameWallets, ({ one }) => ({ user: one(users, { fields: [gameWallets.userId], references: [users.id] }) }));
export const citiesRelations = relations(cities, ({ many }) => ({ routes: many(cityRoutes) }));
export const cityRoutesRelations = relations(cityRoutes, ({ one, many }) => ({
  city: one(cities, { fields: [cityRoutes.cityId], references: [cities.id] }),
  lessons: many(lessons),
}));
export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  route: one(cityRoutes, { fields: [lessons.routeId], references: [cityRoutes.id] }),
  exercises: many(exercises),
  words: many(lessonWords),
}));
export const exercisesRelations = relations(exercises, ({ one }) => ({ lesson: one(lessons, { fields: [exercises.lessonId], references: [lessons.id] }) }));
export const lessonWordsRelations = relations(lessonWords, ({ one }) => ({
  lesson: one(lessons, { fields: [lessonWords.lessonId], references: [lessons.id] }),
  entry: one(vocabularyEntries, { fields: [lessonWords.entryId], references: [vocabularyEntries.id] }),
}));
export const userCitiesRelations = relations(userCities, ({ one }) => ({
  user: one(users, { fields: [userCities.userId], references: [users.id] }),
  city: one(cities, { fields: [userCities.cityId], references: [cities.id] }),
}));
export const learningSessionsRelations = relations(learningSessions, ({ one }) => ({
  user: one(users, { fields: [learningSessions.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [learningSessions.lessonId], references: [lessons.id] }),
}));
export const questsRelations = relations(quests, ({ many }) => ({ steps: many(questSteps) }));
export const questStepsRelations = relations(questSteps, ({ one }) => ({ quest: one(quests, { fields: [questSteps.questId], references: [quests.id] }) }));
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({ user: one(users, { fields: [subscriptions.userId], references: [users.id] }) }));
export const paymentEventsRelations = relations(paymentEvents, ({ one }) => ({ user: one(users, { fields: [paymentEvents.userId], references: [users.id] }) }));
export const xpEventsRelations = relations(xpEvents, ({ one }) => ({ user: one(users, { fields: [xpEvents.userId], references: [users.id] }) }));
export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({ user: one(users, { fields: [walletTransactions.userId], references: [users.id] }) }));
export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, { fields: [userAchievements.userId], references: [users.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));
export const adminAuditLogsRelations = relations(adminAuditLogs, ({ one }) => ({ admin: one(adminUsers, { fields: [adminAuditLogs.adminId], references: [adminUsers.id] }) }));

/**
 * Постійні добові лічильники платних звернень користувача (розпізнавання мовлення, синтез без кешу).
 * Обмеження в пам'яті ізоляту Worker (rateLimit) — лише від сплесків: ізолятів багато, і вони перезапускаються.
 */
export const usageCounters = sqliteTable(
  'usage_counters',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['stt', 'tts'] }).notNull(),
    /** Доба UTC, YYYY-MM-DD. */
    day: text('day').notNull(),
    count: integer('count').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.kind, t.day] }), index('usage_counters_day_idx').on(t.day)],
);

/**
 * Платний синтез озвучки на весь проєкт за добу UTC (символи, що пішли провайдеру; кеш не рахується).
 *  • user — синтез на запит гравця (/api/tts): обмежений TTS_GLOBAL_DAILY_CHARS, понад нього — голос пристрою;
 *  • admin — прогрів і порівняння голосів в адмінці: лише облік (кожен запуск власник підтверджує з оцінкою ціни).
 * Захищає гроші, коли квот на користувача замало: багато акаунтів × usage_counters.tts.
 */
export const ttsSpend = sqliteTable(
  'tts_spend',
  {
    day: text('day').notNull(),
    kind: text('kind', { enum: ['user', 'admin'] }).notNull(),
    chars: integer('chars').notNull().default(0),
    requests: integer('requests').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.day, t.kind] })],
);
