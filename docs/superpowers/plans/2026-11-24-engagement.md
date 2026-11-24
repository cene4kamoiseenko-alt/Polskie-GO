# Вовлечённость — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** одно сообщение бота в день по старшинству (возвращение → новичок → миссия недели → вопрос дня), мост «вопрос дня →
разминка», короткий первый урок, экран «С возвращением» с подарком, тур по вкладкам и отчёты в админке.

**Architecture:** карточки едут в той же минутной рассылке вопроса дня (`bot/daily/send.ts`): для каждого человека чистая функция
`pickDailyMessage` выбирает «вопрос» или карточку; захват в `engage_sends` (день, человек) и проверка обеих таблиц не дают
прислать два сообщения. В приложении — короткая версия первого урока в `startSession`, новый режим занятия `WARMUP`, поля
`/api/me` (`comeback`, `activeLesson`, `tourDone`) и экраны.

**Tech Stack:** Cloudflare Workers + Hono + Drizzle + D1, Telegram Bot API, React (web, admin), vitest (Miniflare), Playwright-скрипты.

**Spec:** `docs/superpowers/specs/2026-11-24-engagement-design.md`

## Global Constraints

- Бот пишет человеку **не больше одного** сообщения в личку за день (по старшинству: возвращение, новичок, миссия, вопрос дня).
- Карточки — только тем, кому сегодня полагается вопрос дня (`dailyEligibility(p) === 'ok'`), и только если **сегодня не был в
  приложении** (местный день игрока). Без включённой рассылки вопроса дня или в пропущенный день плана карточек нет.
- Дни: новичок — 1-й и 3-й после регистрации, не больше 2 за всё время; возвращение — 7-й и 14-й день без занятий; миссия —
  суббота (по Варшаве). Две карточки одного вида подряд без нажатия → этот вид 30 дней не приходит.
- Карточки бота **выключены**, пока владелец не включит их в админке (`app_state` ключ `engage`, `{ enabled: false }`).
- Подарок за возвращение — **50 злотков**, не чаще раза в 30 дней, после 7+ дней без занятий.
- Неверный ответ на вопрос дня — **+3 XP** (с аккаунтом); верный — +10, как сейчас.
- Короткий первый урок — **8 заданий** видов `WORD_TRANSLATION`, `PICTURE_WORD`, `LISTENING`, `MATCH_PAIRS`, `FILL_GAP`.
- Разминка — режим `WARMUP`, **5 заданий**.
- Экономика и правила серии не меняются сверх этих трёх пунктов.
- Тексты — uk / ru / en; подпись к фото ≤ 1024 знаков; в украинском нет ы, э, ъ, ё.
- Картинки карточек — `apps/web/public/bot/cards/*.jpg`, ширина 1024, после добавления
  `node scripts/validate-assets.mjs --write-versions`.
- D1: список в `IN (…)` — не больше 90 значений; страж `test/d1-reads.test.ts` проходит.

## Review Focus

1. Два пересёкшихся минутных запуска и человек, которому положена карточка: должно уйти **одно** сообщение (захват + проверка
   второй таблицы) — тест в Task 4.
2. Игрок в другом часовом поясе: «сегодня был в приложении» считается по **его** дню, не по Варшаве — тест в Task 4.
3. Telegram отвечает 403 на карточку: статус `BLOCKED`, `bot_contacts.blocked_at`, вопрос в тот же день не уходит — тест в Task 4.
4. Новичок бросил короткий урок и вернулся: продолжение идёт по тем же 8 заданиям, а не по полным 17 — тест в Task 6.
5. Подарок за возвращение: два нажатия подряд или два устройства — начислено один раз — тест в Task 7.

## Отступления от дизайна (решения при планировании)

- Карточки получают только те, кому идёт вопрос дня; кто выключил вопрос дня, получает, как сейчас, напоминания (в них уже есть
  «давно не виделись»). Причина: так карточка всегда **заменяет** сообщение, а не добавляет второе. Спек поправлен.
- Разминка не подбирается «по теме вопроса»: у уроков нет разметки тем, совпадение по ключевым словам ненадёжно. Разминка — 5
  заданий: слова на повторение, затем задания пройденных уроков (как «5 минут»). Спек поправлен.
- Кнопка карточки миссии открывает вкладку «Миссии» (у бота нет ссылки на конкретную миссию); в карточке названа миссия.

---

### Task 1: Хранилище — таблицы карточек, флаги игрока, режим WARMUP

**Files:**
- Modify: `apps/server/src/db/schema.ts` (рядом с `dailyQuizSends`; `SESSION_MODE` в строке 22)
- Create: `apps/server/migrations/0029_engagement.sql` (drizzle-kit)
- Test: `apps/server/test/engage-store.test.ts`

**Interfaces:**
- Produces:
  - `ENGAGE_KINDS = ['newcomer', 'comeback', 'mission'] as const`, `type EngageKind`
  - `engageSends` (`engage_sends`): `day` text, `telegramId` int, `userId` text?, `kind` enum ENGAGE_KINDS, `variant` text?,
    `lang` text, `status` enum `DAILY_STATUS` default `'PENDING'`, `leaseUntil`, `sentAt`, `openedAt`, `error`, `createdAt`;
    PK (`day`, `telegramId`); индексы `engage_sends_tg_idx (telegram_id, day)`, `engage_sends_kind_day_idx (kind, day)`.
  - `engagePeople` (`engage_people`): `telegramId` PK, `optedOutAt` ts?, `updatedAt`.
  - `userFlags` (`user_flags`): `userId` → users (cascade), `key` text, `at` createdAt; PK (`userId`, `key`).
  - `SESSION_MODE` + `'WARMUP'` (CHECK в базе нет — миграции для режима не нужно).

- [ ] **Step 1: Тест** `engage-store.test.ts`: «карточка — одна на человека в день»: два `insert(engageSends)` с одним
  (`day`, `telegramId`) и `.onConflictDoNothing().returning()` → второй возвращает `[]`; «флаг игрока ставится один раз»: два
  вставки `userFlags` (`u1`, `'tour'`) с `onConflictDoNothing` → в таблице одна строка; «выключатель карточек»: upsert `engagePeople`
  с `optedOutAt` и обратно `null`.
- [ ] **Step 2:** `npx vitest run test/engage-store.test.ts` (в `apps/server`) → FAIL: `engageSends` не экспортирован.
- [ ] **Step 3:** таблицы в `schema.ts`, `'WARMUP'` в `SESSION_MODE`; `cd apps/server && npx drizzle-kit generate --name engagement`
  → `migrations/0029_engagement.sql` (проверить глазами: три `CREATE TABLE`, индексы, без `DROP`).
- [ ] **Step 4:** тест → PASS; `npm run typecheck -w @polski-go/server` → без ошибок.
- [ ] **Step 5: Commit** «Вовлечённость: таблицы карточек, флаги игрока, режим разминки».

### Task 2: Правило «одно сообщение в день» (чистая функция)

**Files:**
- Create: `apps/server/src/bot/engage/pick.ts`
- Test: `apps/server/test/engage-pick.test.ts`

**Interfaces:**
- Consumes: `EngageKind` (Task 1), `dayDiff`, `addDays` из `@polski-go/shared`.
- Produces:
  ```ts
  export type CardHistory = { kind: EngageKind; day: string; opened: boolean };
  export type MissionFacts = { daysSinceMissionStart: number | null; freeMission: { slug: string; title: string; minutes: number; category: string } | null };
  export type PickInput = {
    today: string; weekday: number; enabled: boolean; hasUser: boolean; optedOut: boolean; seenToday: boolean;
    registeredDay: string | null; lessonsCompleted: number; lastActiveDay: string | null;
    history: CardHistory[]; mission: MissionFacts | null;
  };
  export type DailyMessage = { kind: 'quiz' } | { kind: 'newcomer' } | { kind: 'comeback' } | { kind: 'mission'; mission: NonNullable<MissionFacts['freeMission']> };
  export const COMEBACK_DAYS = [7, 14], NEWCOMER_DAYS = [1, 3], NEWCOMER_MAX = 2, MISSION_WEEKDAY = 6, MISSION_QUIET_DAYS = 14, KIND_PAUSE_DAYS = 30;
  export function pickDailyMessage(i: PickInput): DailyMessage;
  export function needsMissionFacts(i: Omit<PickInput, 'history' | 'mission'>): boolean; // суббота, есть аккаунт, занимался в последние 7 дней, lessonsCompleted > 0
  export function kindPaused(history: CardHistory[], kind: EngageKind, today: string): boolean; // две последние карточки вида не открыты и последняя < 30 дней назад
  ```

- [ ] **Step 1: Тесты** (`base` — включено, аккаунт есть, не выключал, не был сегодня, `today = '2026-12-05'` (суббота, weekday 6)):
  - «выключено / нет аккаунта / выключил карточки / сегодня был в игре → вопрос»: каждое из `enabled:false`, `hasUser:false`,
    `optedOut:true`, `seenToday:true` при `lastActiveDay: '2026-11-28'` → `{ kind: 'quiz' }`.
  - «возвращение на 7-й и 14-й день»: `lastActiveDay` `'2026-11-28'` → `comeback`; `'2026-11-21'` → `comeback`; `'2026-11-27'` → `quiz`.
  - «новичок на 1-й и 3-й день, не больше двух»: `lessonsCompleted:0`, `registeredDay:'2026-12-04'` → `newcomer`; `'2026-12-02'` →
    `newcomer`; `'2026-12-03'` → `quiz`; при `history` из двух `newcomer` → `quiz`.
  - «старшинство: возвращение раньше новичка и миссии»: `lessonsCompleted:0`, `registeredDay:'2026-12-04'`, `lastActiveDay:'2026-11-28'` → `comeback`.
  - «миссия недели только в субботу и только активным»: `lastActiveDay:'2026-12-03'`, `lessonsCompleted:3`, `mission` со свободной
    миссией и `daysSinceMissionStart:null` → `mission`; то же в пятницу (`today:'2026-12-04'`, weekday 5) → `quiz`;
    `daysSinceMissionStart: 10` → `quiz`; `freeMission: null` → `quiz`; `mission: null` → `quiz`.
  - «две неоткрытые карточки вида подряд → вид молчит 30 дней»: `kindPaused([{mission,'2026-11-28',false},{mission,'2026-11-21',false}], 'mission', '2026-12-05')` → true;
    если одна из них `opened:true` → false; если последняя `'2026-10-31'` → false.
  - `needsMissionFacts`: суббота + `lastActiveDay` в 6 днях + `lessonsCompleted>0` → true; без аккаунта или `seenToday` → false.
- [ ] **Step 2:** `npx vitest run test/engage-pick.test.ts` → FAIL (нет модуля).
- [ ] **Step 3:** реализовать `pick.ts` по сигнатурам; дни сравнивать через `dayDiff`.
- [ ] **Step 4:** тест → PASS.
- [ ] **Step 5: Commit** «Вовлечённость: правило одного сообщения в день».

### Task 3: Карточки — тексты, картинки, кнопки, выключатель

**Files:**
- Create: `apps/server/src/bot/engage/copy.ts`, `apps/server/src/bot/engage/views.ts`, `apps/server/src/bot/engage/callbacks.ts`
- Create: `apps/web/public/bot/cards/{newcomer-1,newcomer-2,comeback-1,comeback-2,mission,mission-shop,mission-road,mission-home,mission-work}.jpg`
- Modify: `apps/server/src/bot/image-versions.json` (скрипт), `apps/server/src/bot/send.ts` (рядом с `screenUrl`, строка 43),
  `packages/shared/src/botScreens.ts` (`BOT_SCREENS`), `apps/server/src/bot/quiz/engine.ts:365` (разбор нажатий)
- Test: `apps/server/test/engage-cards.test.ts`, `packages/shared/test/botScreens.test.ts`

**Interfaces:**
- Consumes: `EngageKind`, `engagePeople` (Task 1), `MissionFacts['freeMission']` (Task 2).
- Produces:
  ```ts
  export type CardData =
    | { kind: 'newcomer'; left: number | null }                       // null — урок не начат
    | { kind: 'comeback'; streakBest: number; words: number; city: string | null }
    | { kind: 'mission'; slug: string; title: string; minutes: number; category: string };
  export function cardView(d: CardData, lang: UiLang, pick?: number): { text: string; keyboard: InlineKeyboard; image: string };
  export function cardToggle(lang: UiLang, enabled: boolean): { text: string; callback_data: 'eg:off' | 'eg:on' };
  export async function handleEngageCallback(cb: CallbackQuery): Promise<boolean>; // true — нажатие обработано
  export function screenUrlWith(screen: BotScreen, params: Record<string, string>): string; // в bot/send.ts
  ```
  `BOT_SCREENS` + `continue: '/continue'`, `warmup: '/practice/WARMUP'`, `life: '/life'`.
- Кнопки: новичок → `screenUrlWith('continue', { src: 'card_newcomer' })`; возвращение → `screenUrlWith('home', { src: 'card_comeback' })`;
  миссия → `screenUrlWith('life', { src: 'card_mission' })`; вторая строка — `cardToggle(lang, true)`.
- Картинки: новичок — `cards/newcomer-1|2.jpg` (из `zasada-1`, `egzamin-1`), возвращение — `cards/comeback-1|2.jpg` (`brawo-2`,
  `sasiad`), миссия — по категории: `shop` → `mission-shop` (`targ`), `road`/`transport` → `mission-road` (`dworzec-1`), `home` →
  `mission-home` (`mieszkanie`), `work` → `mission-work` (`praca-biuro-1`), иначе `mission` (`lotnisko`). `pick` выбирает вариант
  (`day` по модулю), по умолчанию 0.
- Тексты ru (uk и en — по смыслу так же):
  - новичок, не начат: «🦫 Первый урок — 3 минуты. Бобек ждёт тебя в Варшаве: 8 коротких заданий, и первая победа твоя.» Кнопка «🚀 Начать урок».
  - новичок, `left`: «🦫 Ты уже начал первый урок — осталось {left} {заданий}. Закончишь за пару минут.» Кнопка «▶️ Продолжить урок».
  - возвращение: «Давно не виделись! 🦫\nТвоя лучшая серия — {streakBest} {дней}, выучено слов — {words}{, ты в городе {city}}.\n🎁 За возвращение — 50 злотков, ждут в игре.» Кнопка «🎁 Забрать и продолжить».
  - миссия: «🎭 Миссия недели: «{title}». Живой диалог в Польше, ~{minutes} минут — можно проходить частями.» Кнопка «🎭 Сыграть миссию».
  - выключатель: «🔕 Не присылать такие сообщения» / «🔔 Присылать снова»; тост «Больше не пришлю» / «Снова включено».

- [ ] **Step 1: Тесты** `engage-cards.test.ts`:
  - «подпись влезает и без русских букв в украинском»: для каждого вида, языка и длинных данных (`title` 60 знаков, `city`
    20 знаков) `cardView(...).text.length <= 1024`; в `uk` нет `/[ыэъё]/i`.
  - «кнопка ведёт в нужный экран и несёт метку»: url кнопки новичка содержит `bot_screen=continue` и `src=card_newcomer`;
    возвращения — без `bot_screen` и с `src=card_comeback`; миссии — `bot_screen=life`.
  - «картинка по категории миссии»: `category:'shop'` → `'cards/mission-shop.jpg'`, `'food'` → `'cards/mission.jpg'`.
  - «выключатель»: `handleEngageCallback` с `data:'eg:off'` от `from.id = 777` (fakeTelegram) → `engage_people.optedOutAt` не
    `null`, вызван `editMessageReplyMarkup` с кнопкой `eg:on`, `answerCallbackQuery` с текстом тоста; затем `'eg:on'` → `null`.
  - `botScreens.test.ts`: `botScreenRoute('continue') === '/continue'`, `'warmup' → '/practice/WARMUP'`, `'life' → '/life'`.
- [ ] **Step 2:** тесты → FAIL.
- [ ] **Step 3:** картинки: из `apps/web/public/channel/` уменьшить до 1024×1024 JPG (качество 85) в `public/bot/cards/`;
  `node scripts/validate-assets.mjs --write-versions` → «ошибок нет». Код по сигнатурам; в `engine.ts` нажатия с `eg:` передать
  `handleEngageCallback` до разбора `qa:`/`qz:`.
- [ ] **Step 4:** тесты → PASS; `npm test -w @polski-go/shared` → PASS; `npm run assets` → «ошибок нет».
- [ ] **Step 5: Commit** «Вовлечённость: карточки бота — тексты, картинки, кнопки, выключатель».

### Task 4: Отправка карточек в рассылке вопроса дня

**Files:**
- Create: `apps/server/src/bot/engage/state.ts`, `apps/server/src/bot/engage/send.ts`
- Modify: `apps/server/src/bot/daily/audience.ts` (`DailyPerson`, `toPerson`, `selectPeople`), `apps/server/src/bot/daily/send.ts`
  (`sendTo`, `runDailyQuizTick`)
- Test: `apps/server/test/engage-send.test.ts`, `apps/server/test/d1-reads.test.ts`

**Interfaces:**
- Consumes: Task 1–3.
- Produces:
  ```ts
  // engage/state.ts — app_state, ключ 'engage', как bot/daily/state.ts
  export async function readEngageState(): Promise<{ enabled: boolean }>;
  export async function writeEngageState(p: { enabled: boolean }): Promise<{ enabled: boolean }>;
  // engage/send.ts
  export async function loadCardHistory(telegramIds: number[], since: string): Promise<Map<number, CardHistory[]>>; // куски по 90
  export async function loadMissionFacts(userId: string, now: Date): Promise<MissionFacts>; // listMissions + последний mission_runs.started_at
  export function pickInputFor(p: DailyPerson, now: Date, enabled: boolean, history: CardHistory[], mission: MissionFacts | null): PickInput;
  export async function sendCard(p: DailyPerson, msg: Exclude<DailyMessage, { kind: 'quiz' }>, day: string, now: Date, stats: { calls: number }): Promise<'sent' | 'dup' | 'failed' | 'rate_limited'>;
  ```
  `DailyPerson` + `createdAt: Date | null`, `lessonsCompleted: number`, `cardOptedOutAt: Date | null` (SQL: `u.created_at`,
  `p.lessons_completed`, `LEFT JOIN engage_people e` → `e.opted_out_at`).
- Правила `pickInputFor`: `today`/`weekday` — по Варшаве (`warsawDay`); `seenToday` — `dayKey(appSeenAt, tz) === dayKey(now, tz)`
  (пояс игрока, по умолчанию Europe/Warsaw); `registeredDay` — `dayKey(createdAt, 'Europe/Warsaw')`.
- `sendCard`: если есть `daily_quiz_sends` (day, tg) → `'dup'`; захват `engage_sends` `onConflictDoNothing`; данные: новичок —
  активный сеанс урока (`learning_sessions` ACTIVE, LESSON, моложе `SESSION_TTL_MS`): `left = total − ответов`, иначе `null`;
  возвращение — `player_progress.streak_best`, число выученных слов, текущий город; ошибки Telegram — как в `sendTo`
  (429 снимает захват, 403 → `BLOCKED` + `recordBotBlocked`, нет чата → `NO_CHAT` + `daily_quiz_people.no_chat_at`).
- `sendTo` (вопрос): если есть `engage_sends` (day, tg) → `'dup'`.
- `runDailyQuizTick`: `readEngageState()` один раз; `loadCardHistory` для пачки один раз (`since = today − 60`); для каждого
  `ok`: `mission = needsMissionFacts(...) ? await loadMissionFacts(...) : null`; `pickDailyMessage` → `sendCard` или `sendTo`.

- [ ] **Step 1: Тесты** `engage-send.test.ts` (рассылка включена, `at('2026-12-05','12:00')` по образцу `daily-quiz.test.ts`, fakeTelegram):
  - «карточки выключены — всем вопрос, как раньше»: игрок с `last_active_day` 7 дней назад получает `sendPhoto` с вопросом, в `engage_sends` пусто.
  - «включено: вернувшемуся — карточка вместо вопроса»: тот же игрок → одна `sendPhoto`, подпись содержит «Давно не виделись»,
    строка `engage_sends` `kind='comeback'`, `status='SENT'`; в `daily_quiz_sends` на этот день строки нет.
  - «новичку — карточка с остатком урока»: зарегистрирован вчера, активный сеанс урока 8 заданий, 3 ответа → подпись «осталось 5».
  - «сегодня был в приложении — вопрос, не карточка»: `users.last_seen_at` сегодня 08:00 по его поясу.
  - «другой пояс»: пояс `America/New_York`, `last_seen_at` = `2026-12-05T03:00Z` (там ещё 4 декабря) → карточка уходит.
  - «пересёкшиеся запуски»: заранее вставлена строка `daily_quiz_sends` (day, tg) → тик не шлёт карточку; заранее `engage_sends` →
    тик не шлёт вопрос; в обоих случаях вызовов `sendPhoto` для человека 0.
  - «403 на карточку»: `tgError(403, 'Forbidden: bot was blocked by the user')` → `engage_sends.status='BLOCKED'`,
    `bot_contacts.blocked_at` не `null`, повторный тик в ту же минуту ничего не шлёт.
  - «миссия недели»: суббота, игрок занимался 2 дня назад, `lessons_completed=3`, миссий не начинал → карточка `kind='mission'` с
    названием первой бесплатной миссии.
  - `d1-reads.test.ts`: тик со 100 людьми (из них 10 подходят под карточки) — `rows_read` не больше прежней границы для тика
    рассылки + 300.
- [ ] **Step 2:** тесты → FAIL.
- [ ] **Step 3:** реализовать по Interfaces.
- [ ] **Step 4:** `npx vitest run test/engage-send.test.ts test/daily-quiz.test.ts test/d1-reads.test.ts` → PASS (старые тесты
  вопроса дня не меняются).
- [ ] **Step 5: Commit** «Вовлечённость: карточки идут в рассылке вопроса дня, одно сообщение в день».

### Task 5: Мост «вопрос дня → разминка» и +3 XP за попытку

**Files:**
- Modify: `apps/server/src/services/sessions.ts:186-200` (ветка FIVE_MIN), `apps/server/src/routes/learn.ts:25` (z.enum режимов),
  `apps/server/src/bot/daily/views.ts` (`dailyResultView`), `apps/server/src/bot/daily/copy.ts`, `apps/server/src/bot/daily/answer.ts`
  (`recordDailyAnswer`), `apps/server/src/bot/quiz/engine.ts:319` (`awardXp`)
- Test: `apps/server/test/daily-bridge.test.ts`

**Interfaces:**
- Consumes: `'WARMUP'` (Task 1), `screenUrlWith`, `BOT_SCREENS.warmup` (Task 3).
- Produces: `WARMUP_SIZE = 5` и `DAILY_TRY_XP = 3` (экспорт из `sessions.ts` и `answer.ts`);
  `awardXp(userId: string, roundId: string, now: Date, amount = QUIZ_XP): Promise<number>`;
  `DAILY_COPY[lang].warmup` («🔥 Закрепить · 2 минуты»), `DAILY_COPY[lang].tryXp(n)` («🎁 +3 XP за попытку»).

- [ ] **Step 1: Тесты** `daily-bridge.test.ts`:
  - «разминка — 5 заданий из пройденного»: игрок прошёл урок 1 → `POST /api/sessions { mode: 'WARMUP' }` → `items.length === 5`,
    `mode === 'WARMUP'`; закончил все 5 → `streak >= 1` в ответе завершения.
  - «у новичка без уроков разминка берёт доступный урок»: `items.length` от 1 до 5, не ошибка.
  - «неверный ответ на вопрос дня — +3 XP»: раунд `source:'daily'`, неверный выбор → `recordDailyAnswer` возвращает 3,
    `daily_activity` за сегодня есть; верный — 10.
  - «первая кнопка итога — разминка»: `dailyResultView(..., { hasUser: true, ... })` → первая кнопка `web_app.url` содержит
    `bot_screen=warmup` и `src=quiz_warmup`; без аккаунта первой стоит «🚀 Первый урок — 3 минуты» (`screenUrlWith('continue', …)`).
- [ ] **Step 2:** тесты → FAIL.
- [ ] **Step 3:** ветку FIVE_MIN вынести в функцию с размером, `WARMUP` вызывает её с `WARMUP_SIZE`; `recordDailyAnswer`: при
  `!correct && user` → `awardXp(user.id, round.id, now, DAILY_TRY_XP)`; в итоге строка `tryXp` вместо `xp`, если ответ неверный.
- [ ] **Step 4:** `npx vitest run test/daily-bridge.test.ts test/daily-quiz.test.ts test/bot-quiz.test.ts test/learning.test.ts` → PASS.
- [ ] **Step 5: Commit** «Вопрос дня: разминка после ответа и +3 XP за попытку».

### Task 6: Короткий первый урок, «первая победа», остаток урока

**Files:**
- Create: `apps/server/src/services/first-lesson.ts`
- Modify: `apps/server/src/services/sessions.ts` (`startSession` ~строка 272: в пакет добавить `lessonsCompleted`; после
  `spreadByType`; `finishSession` ~строка 660–700 и ответ ~строка 810), `apps/server/src/services/profile.ts` (`getMe`)
- Test: `apps/server/test/first-lesson.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const FIRST_LESSON_SIZE = 8;
  export const FIRST_LESSON_TYPES = ['WORD_TRANSLATION', 'PICTURE_WORD', 'LISTENING', 'MATCH_PAIRS', 'FILL_GAP'] as const;
  export function firstLessonItems(items: ExerciseItem[]): ExerciseItem[]; // простые по порядку, до 8; простых < 5 — урок как есть
  ```
  Ответ завершения + `firstWin: boolean` (урок, сдан, первое прохождение, `lessons_completed` до записи = 0).
  `getMe` + `activeLesson: { lessonId: string; done: number; total: number } | null` (последний ACTIVE LESSON моложе `SESSION_TTL_MS`).
- Условие короткой версии: `realMode === 'LESSON'`, `lesson.kind === 'LESSON'`, `variant === null`, `lessonsCompleted === 0`.

- [ ] **Step 1: Тесты** `first-lesson.test.ts`:
  - «чистая функция»: набор `waw-1-czesc` (4 WORD_TRANSLATION, 2 LISTENING, 1 MATCH_PAIRS, 3 FILL_GAP, 7 других) → 8 элементов,
    все типы из `FIRST_LESSON_TYPES`, порядок исходный; набор с 3 простыми → возвращён весь.
  - «новичок получает 8 заданий»: новый игрок, `POST /api/sessions { lessonId: 'l_waw-1-czesc' }` → `items.length === 8`.
  - «продолжение — те же 8»: ответил на 3 → снова старт → `resume.done.length === 3`, `items.length === 8`.
  - «остаток в /me»: после 3 ответов `GET /api/me` → `activeLesson` `{ lessonId: 'l_waw-1-czesc', done: 3, total: 8 }`.
  - «первая победа»: ответил верно на все 8, завершение → `passed === true`, `firstWin === true`, `lessons_completed === 1`;
    повтор урока → `firstWin === false`.
  - «у игрока с пройденным уроком — полный урок»: `lessons_completed = 1` → урок 2 `items.length === 17`.
- [ ] **Step 2:** тесты → FAIL.
- [ ] **Step 3:** реализовать по Interfaces.
- [ ] **Step 4:** `npx vitest run test/first-lesson.test.ts test/learning.test.ts test/lesson-levels.test.ts test/placement.test.ts` → PASS.
- [ ] **Step 5: Commit** «Первый урок: короткая версия для новичка, первая победа, остаток урока в профиле».

### Task 7: API приложения — подарок за возвращение, тур, отметка открытия

**Files:**
- Create: `apps/server/src/services/comeback.ts`
- Modify: `apps/server/src/services/profile.ts` (`getMe`), `apps/server/src/routes/public.ts` (группа `me`)
- Test: `apps/server/test/engage-app.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const COMEBACK_GIFT = 50, COMEBACK_AFTER_DAYS = 7, COMEBACK_COOLDOWN_DAYS = 30;
  export async function comebackOffer(userId: string, lastActiveDay: string | null, today: string, now: Date): Promise<{ gift: number } | null>;
  export async function claimComeback(userId: string, now: Date): Promise<{ granted: number }>; // grantZlotki(userId, 50, 'comeback', `comeback:${userId}:${today}`)
  ```
  `getMe` + `comeback: { gift: number } | null`, `tourDone: boolean`.
  Маршруты: `POST /api/comeback/claim` → `{ granted }`; `POST /api/flags/tour` → `{ ok: true }`;
  `POST /api/engage/opened { src: 'card_newcomer' | 'card_comeback' | 'card_mission' }` → ставит `opened_at` у последней
  `SENT`-карточки этого вида за 3 дня (если `opened_at` пусто), `{ ok: true }`.
- `comebackOffer`: `lastActiveDay` есть и `dayDiff(lastActiveDay, today) >= 7`, и нет `wallet_transactions` с `reason='comeback'`
  за 30 дней (индекс `wallet_tx_user_created_idx`).

- [ ] **Step 1: Тесты** `engage-app.test.ts`:
  - «подарок виден после 7 дней и только тогда»: `last_active_day` 7 дней назад → `me.comeback = { gift: 50 }`; 6 дней → `null`;
    новичок без занятий → `null`.
  - «подарок один раз»: два параллельных `POST /api/comeback/claim` (`Promise.all`) → сумма `granted` = 50, кошелёк +50; после
    этого `me.comeback === null`; через 31 день и новую паузу 7 дней — снова `{ gift: 50 }`.
  - «без паузы подарка нет»: claim у активного игрока → `400 comeback_unavailable`.
  - «тур»: `me.tourDone === false` → `POST /api/flags/tour` дважды → `me.tourDone === true`, строка `user_flags` одна.
  - «отметка открытия»: карточка `comeback` `SENT` вчера → `POST /api/engage/opened { src: 'card_comeback' }` → `opened_at` не
    `null`; неизвестный `src` → 400.
- [ ] **Step 2:** тесты → FAIL.
- [ ] **Step 3:** реализовать по Interfaces.
- [ ] **Step 4:** тесты → PASS; `npx vitest run test/premium.test.ts test/housing.test.ts` → PASS (кошелёк не сломан).
- [ ] **Step 5: Commit** «Приложение: подарок за возвращение, отметка тура и открытия карточки».

### Task 8: Админка (сервер) — включение, «прислать себе», отчёты

**Files:**
- Create: `apps/server/src/services/engage-admin.ts`
- Modify: `apps/server/src/routes/admin.ts` (рядом с `/daily-quiz`, ~строка 1059)
- Test: `apps/server/test/engage-admin.test.ts`

**Interfaces:**
- Consumes: Task 1–7.
- Produces:
  ```ts
  export type KindStats = { sent: number; delivered: number; opened: number; studiedSameDay: number; optedOut48h: number; blocked48h: number };
  export type FirstLessonRow = { status: 'ACTIVE' | 'FINISHED' | 'ABANDONED'; total: number; answered: number; lastType: string | null };
  export function firstLessonFunnel(rows: FirstLessonRow[]): { opened: number; answered1: number; reached4: number; reached8: number; finished: number; dropAt: { index: number; type: string; n: number }[] };
  export async function engageOverview(days: number, now: Date): Promise<{ state: { enabled: boolean }; kinds: Record<EngageKind, KindStats>; bridge: { answered: number; warmupStarted: number; warmupFinished: number }; firstLesson: ReturnType<typeof firstLessonFunnel> }>;
  export async function sendEngageTest(telegramId: number, kind: EngageKind, lang: UiLang): Promise<void>; // образец данных, без записи в engage_sends
  ```
  Маршруты: `GET /admin/engage?days=7|30|90` (SUPERADMIN, SUPPORT); `PATCH /admin/engage/state { enabled }` (SUPERADMIN, журнал
  `engage_start` / `engage_stop`); `POST /admin/engage/test { who, kind, lang? }` (SUPERADMIN, SUPPORT; как `/daily-quiz/test`).
- `delivered` = статус `SENT`; `studiedSameDay` = есть `daily_activity` игрока в день карточки; `optedOut48h` / `blocked48h` —
  `engage_people.opted_out_at` / `bot_contacts.blocked_at` в 48 часах после `sent_at`; первый урок — первый LESSON-сеанс новичков
  периода (`users.created_at` в периоде).

- [ ] **Step 1: Тесты** `engage-admin.test.ts`:
  - `firstLessonFunnel` на 4 строках (FINISHED 8/8; ABANDONED 3/8 последний `LISTENING`; ABANDONED 3/8 `LISTENING`; ACTIVE 0/8) →
    `{ opened:4, answered1:3, reached4:1, reached8:1, finished:1 }`, `dropAt[0] = { index: 3, type: 'LISTENING', n: 2 }`.
  - «отчёт по картинкам»: две карточки `comeback` (одна открыта, после неё был урок; вторая — игрок заблокировал бота через 2 часа) →
    `kinds.comeback = { sent:2, delivered:2, opened:1, studiedSameDay:1, optedOut48h:0, blocked48h:1 }`.
  - «включение только у главного админа»: SUPPORT `PATCH /admin/engage/state` → 403; SUPERADMIN → `{ enabled: true }` и запись в журнале.
  - «прислать себе»: fakeTelegram, `POST /admin/engage/test { who: '<tg id>', kind: 'mission' }` → одна `sendPhoto`, `engage_sends` пусто.
- [ ] **Step 2:** тесты → FAIL.
- [ ] **Step 3:** реализовать по Interfaces.
- [ ] **Step 4:** тесты → PASS.
- [ ] **Step 5: Commit** «Админка: карточки бота — включение, пробная отправка, отчёты».

### Task 9: Админка — страница «Карточки бота»

**Files:**
- Create: `apps/admin/src/EngageCards.tsx`
- Modify: `apps/admin/src/App.tsx` (маршрут `/engage`, пункт меню `['/engage', 'Карточки бота', '💌']` в группе с «Вопрос дня»),
  `apps/admin/src/api.ts` (тексты ошибок `comeback_unavailable`, `bot_blocked`), `scripts/admin-screens.ts`, `docs/ADMIN_RU.md`
- Test: `scripts/admin-screens.ts` (снимки 390 и 1280, axe)

**Interfaces:**
- Consumes: `GET /admin/engage`, `PATCH /admin/engage/state`, `POST /admin/engage/test` (Task 8).
- Состав страницы: шапка «Карточки бота: выключены / включены» + кнопка (подтверждение: «одно сообщение в день, вместо вопроса
  дня»); «Как увидит игрок» — 3 карточки (новичок, возвращение, миссия) с картинкой и текстом, язык uk/ru/en, «Прислать себе»;
  таблица по видам (отправлено, дошло, открыли, занимались в тот же день, выключили за 48 ч, заблокировали за 48 ч — последние два
  красным, если > 5 %); «Мост»: `Funnel` (ответили → открыли разминку → закончили); «Первый урок: где бросают»: `Funnel` + список
  «чаще уходят на задании N (вид)».

- [ ] **Step 1:** в `scripts/admin-screens.ts` добавить экран `/engage` (390 и 1280, axe без нарушений) — запуск падает: маршрута нет.
- [ ] **Step 2:** `node --import tsx scripts/admin-screens.ts` → FAIL на `/engage`.
- [ ] **Step 3:** страница по составу выше (компоненты `Card`, `Funnel`, `Segmented` из `charts.tsx`/`ui.tsx`); раздел в
  `docs/ADMIN_RU.md` «Карточки бота»: что это, как включить, что значат столбцы, когда выключать (рост «заблокировали»).
- [ ] **Step 4:** `npm run typecheck -w @polski-go/admin` и `node --import tsx scripts/admin-screens.ts` → без ошибок; снимки
  посмотреть глазами.
- [ ] **Step 5: Commit** «Админка: страница «Карточки бота»».

### Task 10: Приложение — первая победа, «осталось N», /continue, разминка, метка открытия

**Files:**
- Modify: `apps/web/src/lib/types.ts` (`firstWin`, `activeLesson`, `comeback`, `tourDone`), `apps/web/src/screens/Lesson.tsx:609`
  (заголовок итога), `apps/web/src/screens/Home.tsx:452-456` (кнопка продолжения), `apps/web/src/App.tsx:240` (маршрут
  `/continue`), `apps/web/src/lib/launch.ts` (метка `src`), `apps/web/src/i18n/{ru,uk,en}.ts`
- Create: `apps/web/src/screens/Continue.tsx`, `scripts/engagement-check.ts`

**Interfaces:**
- Consumes: `/api/me` поля (Task 6–7), `POST /api/engage/opened` (Task 7), режим `WARMUP` (Task 5), `BOT_SCREENS` (Task 3).
- Produces: `pendingSource(): string | null` в `launch.ts` (читается один раз из `?src=`); ключи i18n `res_title_first_win`
  («Первая победа!»), `res_first_win_text` («Завтра — урок 2. Бобек будет ждать.»), `home_continue_left` («Продолжить · осталось {n}»),
  `mode_warmup` («Разминка»).
- `/continue`: активный урок из `me.activeLesson` → `/lesson/<id>`, иначе `journey.nextLesson` → `/lesson/<id>`, иначе `/learn`
  (с `replace`).

- [ ] **Step 1:** `scripts/engagement-check.ts` по образцу `scripts/gestures-check.ts` (тот же запуск серверов, 390×844), часть A:
  новый игрок после знакомства видит урок из 8 заданий; бросил после 3 → на главной кнопка «Продолжить · осталось 5»; закончил →
  заголовок «Первая победа!»; `/?bot_screen=continue&src=card_newcomer` открывает урок и шлёт один `POST /api/engage/opened`;
  `/?bot_screen=warmup` открывает разминку из 5 заданий.
- [ ] **Step 2:** `node --import tsx scripts/engagement-check.ts` → FAIL.
- [ ] **Step 3:** реализовать по Interfaces.
- [ ] **Step 4:** `npm run typecheck`, `npm run build:web`, скрипт → `ok` по всем строкам части A; снимки посмотреть глазами.
- [ ] **Step 5: Commit** «Приложение: первая победа, остаток урока, переход из карточки, разминка».

### Task 11: Приложение — экран «С возвращением»

**Files:**
- Create: `apps/web/src/components/ComebackSheet.tsx`
- Modify: `apps/web/src/screens/Home.tsx`, `apps/web/src/i18n/{ru,uk,en}.ts`, `scripts/engagement-check.ts`

**Interfaces:**
- Consumes: `me.comeback`, `POST /api/comeback/claim` (Task 7), `me.counters.dueReviews`.
- Шторка на главной, если `me.comeback`: картинка `/channel/brawo-2.jpg`, «С возвращением!», «Подарок за возвращение: 50 злотков»,
  кнопка «🎁 Забрать» → после начисления — «Начнём с короткого повторения» → `/practice/REVIEW` (если `dueReviews > 0`), иначе
  `/practice/WARMUP`; закрыть — до следующего запуска приложения (`sessionStorage`, в try/catch); ошибка — текст из `api.ts`.
  Диалог доступен (фокус, Esc, `role="dialog"`), уважает «уменьшить движение».

- [ ] **Step 1:** часть B в `engagement-check.ts`: игрок с паузой 8 дней видит шторку; «Забрать» → кошелёк +50, шторка
  предлагает повторение; перезапуск → шторки нет; axe на шторке без нарушений.
- [ ] **Step 2:** скрипт → FAIL на части B.
- [ ] **Step 3:** реализовать.
- [ ] **Step 4:** `npm run typecheck`, скрипт → `ok` по частям A и B.
- [ ] **Step 5: Commit** «Приложение: экран «С возвращением» с подарком».

### Task 12: Приложение — тур по вкладкам

**Files:**
- Create: `apps/web/src/components/TabTour.tsx`
- Modify: `apps/web/src/screens/Home.tsx`, `apps/web/src/screens/Profile.tsx` (пункт «Как здесь всё устроено»),
  `apps/web/src/components/ui.tsx` (у `BottomNav` атрибут `data-tab={tab.id}` для привязки подсказок), `apps/web/src/i18n/{ru,uk,en}.ts`,
  `scripts/engagement-check.ts`

**Interfaces:**
- Consumes: `me.tourDone`, `me.progress.lessonsCompleted`, `POST /api/flags/tour` (Task 7).
- Показ: главная, `tourDone === false`, `lessonsCompleted >= 1`, нет шторки «С возвращением». 5 шагов у вкладок `home`, `study`,
  `life`, `quests`, `profile` с текстами: «Сегодня — цель дня и серия», «Учёба — уроки и карта Польши», «Миссии — живые диалоги:
  аптека, вокзал, urząd. ~10 минут, можно частями», «Квесты — задания дня и награды», «Профиль — гардероб скинов Бобека, лига и
  друзья». Кнопки «Дальше» / «Пропустить», «N из 5». Конец или пропуск → `POST /api/flags/tour`. Из профиля — тот же тур без
  записи.

- [ ] **Step 1:** часть C в `engagement-check.ts`: после первого урока на главной подсказка «1 из 5» у вкладки «Сегодня»; «Дальше»
  ×4 доходит до «Профиль»; после конца перезапуск — тура нет; новичок до первого урока тура не видит; «Как здесь всё устроено» в
  профиле показывает тур снова; axe без нарушений; Esc закрывает.
- [ ] **Step 2:** скрипт → FAIL на части C.
- [ ] **Step 3:** реализовать.
- [ ] **Step 4:** `npm run typecheck`, скрипт → `ok` по частям A, B, C; снимки 360 / 390 / 430 посмотреть глазами.
- [ ] **Step 5: Commit** «Приложение: тур по вкладкам после первого урока».

### Task 13: Документы и полная проверка

**Files:**
- Modify: `docs/TELEGRAM_BOT.md` (раздел «Карточки бота»), `docs/RETENTION_AUDIT_RU.md` (пункт 7: что сделано 2026-11-24),
  `docs/superpowers/specs/2026-11-24-engagement-design.md` (статус «сделано», отступления)

- [ ] **Step 1:** документы: кто что получает (таблица из спека), как включить, что смотреть в админке через неделю.
- [ ] **Step 2:** полный прогон в рабочей копии `.wt-head` (`npx vitest run`, `npm test -w @polski-go/shared`), `npm run typecheck`,
  `npm run build`, `npm run assets`, `scripts/engagement-check.ts`, `scripts/admin-screens.ts` → всё зелёное (упавшие тесты
  называются в отчёте поимённо).
- [ ] **Step 3: Commit** «Вовлечённость: документы».
