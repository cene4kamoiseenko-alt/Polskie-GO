# Вопрос дня — план работ

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** раз в день бот присылает всем, кто писал боту, и игрокам приложения вопрос по польскому с фото сцены; после ответа приходит пояснение и кнопка к уроку. Владелец видит в админке план на 30 дней, запускает рассылку сам и видит, кому вопрос дошёл, кто ответил и верно ли.

**Architecture:**
- **База вопросов.** Остаётся в коде (`bot/quiz/bank/*.ts` по темам) и проверяется тестом качества. Выключенные вопросы и план дней хранятся в D1.
- **Отправка.** Отдельный cron раз в минуту (`* * * * *`, отдельный вызов Worker со своим лимитом подзапросов) шлёт порцию до 40 сообщений. Человек получает не больше одного вопроса в день — это держит ключ (день, telegram_id) в `daily_quiz_sends`.
- **Ответ.** Идёт через существующий движок `/quiz` (`bot_quiz_rounds`, источник `daily`) без таймера.
- **Какие люди получают вопрос.** Решает одна функция `dailyEligibility`. Ею пользуются отправка, подсчёт охвата в админке и подавление напоминаний.

**Tech Stack:** Hono, Cloudflare Workers + D1 (Drizzle, `drizzle-kit generate`), Vitest + Miniflare (подмена Bot API `fakeTelegram`), React + Vite + Tailwind 4 (админка), sharp (картинки), Playwright + axe (`scripts/admin-screens.ts`).

**Spec:** `docs/superpowers/specs/2026-11-13-daily-quiz-design.md`

## Global Constraints

- Пуш в ветку `claude/polski-go-telegram-app-r8helf` — выкладка в прод. Рассылка вопроса дня по умолчанию **выключена** (`enabled: false`). Пока владелец не нажал «Запустить», бот ведёт себя как сейчас.
- Время и «день» рассылки считаются по поясу `Europe/Warsaw`. Время отправки по умолчанию — `18:00`, шаг — 15 минут.
- Окно отправки — 4 часа от времени рассылки. После него в этот день больше никому не шлём.
- Ёмкость: не больше 40 вызовов Bot API за минутный запуск. Прежний cron `*/15` и его бюджет (`SEND_BUDGET = 35`) не меняются.
- Ограничения Telegram: подпись к фото ≤ 1024 знаков, `callback_data` ≤ 64 байта. Вариант длиннее 30 знаков идёт в текст сообщения, на кнопке остаётся буква (`BUTTON_TEXT_MAX`).
- Языки интерфейса бота: `ru`, `uk`, `en`. Польские варианты одинаковы для всех языков.
- Вопрос: ровно 4 варианта. Самый длинный вариант не длиннее самого короткого больше чем в 1,6 раза; исключение — поле `lengthNote` с причиной.
- Картинки вопросов — только 16 полноразмерных сцен: `bar-mleczny, biuro, cukiernia, lidl, lotnisko-lot, mieszkanie, pierniki, pierogarnia, pkp, przychodnia, recepcja-narty, stop-cafe, tramwaj, urzad, warszawa-starowka, zapiekanki`. Магазины Żabka, Biedronka, Rossmann, InPost, ORLEN не используются.
- XP за вопрос дня: +10 (`QUIZ_XP`), только с аккаунтом, не расходует дневной лимит наград `/quiz`.
- После 3 неотвеченных вопросов дня подряд — пауза до первого действия человека.
- Процент верных ответов показываем, только если на этом уровне за день ответили не меньше 5 человек.
- План строится на 30 дней вперёд.
- Права в админке:
  - смотреть страницу — `SUPERADMIN` и `SUPPORT`;
  - менять план, запускать и выключать вопросы — только `SUPERADMIN`.
- Коммиты без строк-подписей ИИ (правило владельца). Секреты владельца не коммитить.
- Пока идёт браузерная проверка (`admin-screens`), файлы не правим.

## Review Focus

1. **Человек есть и в `bot_contacts`, и в `users` (один telegram_id).** Ожидается одно сообщение за день: id объединяются при выборке (UNION), ключ отправки — (день, telegram_id). Тест — задача 6, «один человек в боте и в приложении — одно сообщение».
2. **Два минутных запуска пересеклись.** Второй не шлёт тем же людям: место захватывается INSERT … ON CONFLICT DO NOTHING. Тест — задача 6, «два запуска подряд с одним курсором — без повторов».
3. **Напоминания при включённой рассылке.**
   - Игрок с напоминаниями, который выключил вопрос дня, получает напоминание.
   - Игрок, который получает вопрос, напоминание не получает: строка журнала `SKIPPED` с ошибкой `daily_quiz`. Без неё он снова попадал бы в выборку и забирал бюджет у остальных.
   - В пропущенный день («Пропустить день») напоминания идут как обычно.
   - Тест — задача 7.
4. **Владелец правит план, когда рассылка сегодня уже пошла.** Сегодняшний день после начала отправки не меняется (400 `day_locked`). «Остановить» действует со следующего запуска. Тест — задача 9.
5. **Худший случай длины подписи.** Самый длинный вопрос, варианты в тексте, строка серии, процент, XP, серия вопросов дня, на каждом языке — всё ≤ 1024. Тест — задача 2 (по всему банку через настоящие `dailyQuestionView` и `dailyResultView` из задачи 5).

---

### Task 1: Картинки сцен для бота

**Files:**
- Create: `apps/server/src/bot/quiz/scenes.ts`
- Create: `scripts/build-quiz-images.mjs`
- Create: `apps/web/public/bot/quiz/<сцена>.jpg` (16 файлов, генерируются скриптом)
- Modify: `apps/server/src/bot/image-versions.json` (через `node scripts/validate-assets.mjs --write-versions`)
- Test: `apps/server/test/quiz-bank.test.ts` (новый файл; первый блок)

**Interfaces:**
- Produces:
  - `QUIZ_SCENES: readonly QuizScene[]` — 16 id из Global Constraints;
  - `type QuizScene`;
  - `SCENE_LABELS: Record<QuizScene, L4>` — подписи для админки, например `{ ru: 'Бар млечны', … }`;
  - `quizSceneFile(scene: QuizScene): string` → `'quiz/<scene>.jpg'` (путь относительно `/bot/`).

- [ ] **Step 1: тест.** `describe('картинки вопросов')`:
  - для каждой сцены `apps/web/public/bot/quiz/<сцена>.jpg` существует;
  - у файла есть версия в `image-versions.json`;
  - список файлов в папке совпадает с `QUIZ_SCENES` (лишних нет).
- [ ] **Step 2:** `npx vitest run test/quiz-bank.test.ts` в `apps/server` → FAIL (нет модуля).
- [ ] **Step 3: `scenes.ts`.**
- [ ] **Step 4: `build-quiz-images.mjs`.**
  - Источники — оригиналы из `SCENE_ART_NOTES[...].source` (`docs/design/a12|a16/missions/*_original.webp`), карта «сцена → файл и top 2:1-вырезки» записана в скрипте.
  - Оригинал 1536×1024: вырезка 1536×864, `top = clamp(top2x1 − 48, 0, 160)`, затем `resize(1280, 720, lanczos3)`. Bar mleczny (1672×941) — сразу `resize(1280, 720)`.
  - Сохранение: `jpeg({ quality: 88, chromaSubsampling: '4:4:4', mozjpeg: true })`. Только уменьшение, без растяжения.
- [ ] **Step 5:** `node scripts/build-quiz-images.mjs && node scripts/validate-assets.mjs --write-versions && node scripts/validate-assets.mjs` → «ошибок нет» (нет размытых полос, детализация ≥ порога, дублей нет).
- [ ] **Step 6:** тест → PASS. Посмотреть глазами 3–4 кадра: Бобек и вывески не обрезаны.
- [ ] **Step 7: коммит** `Daily quiz: 16 scene pictures for bot questions (1280×720 JPG from full-size masters)`.

### Task 2: Формат банка, проверки качества, переписать 60 старых вопросов

**Files:**
- Create: `apps/server/src/bot/quiz/bank/{shopping,food,transport,city,work,health,everyday,grammar,talk}.ts`
- Modify: `apps/server/src/bot/quiz/questions.ts` — типы, `CATEGORY_NAMES`, сборка `QUIZ_QUESTIONS` из `bank/*`; старые вопросы удалить из файла.
- Modify: `apps/server/src/bot/quiz/engine.ts` — `quizImage`: картинка из `question.image` для всех языков.
- Modify: `apps/server/test/bot-quiz.test.ts` — блок «банк вопросов» больше не требует ровно 60.
- Test: `apps/server/test/quiz-bank.test.ts`

**Interfaces:**
- Consumes: `QuizScene`, `quizSceneFile` (задача 1).
- Produces:
  - у `QuizQuestion` новые поля `image: QuizScene` (обязательное) и `lengthNote?: string`;
  - `answer` по-прежнему индекс верного варианта; авторское правило — верный идёт первым, порядок перемешивается при отправке;
  - `QUIZ_QUESTIONS`, `QUESTION_BY_ID`, `optionsOf` — прежние имена;
  - `polishPhrases(q: QuizQuestion): string[]` — польские фразы вопроса для проверки «не из приложения»:
    - варианты, если `options` — массив;
    - фрагменты `«…»` из `prompt.en`, где есть латиница;
    - для вопросов с `___` — фраза с подставленным верным вариантом.

- [ ] **Step 1: тесты `describe('банк: качество')`.**
  - Структура:
    - id уникальны;
    - `image ∈ QUIZ_SCENES`;
    - ровно 4 варианта на каждом языке, все разные, `opts[answer]` есть;
    - тексты на 3 языках не пустые.
  - Длины вариантов: `max/min ≤ 1.6` либо есть `lengthNote`, на каждом языке.
  - Форма: у польских вариантов одинаковые последний знак (`.`, `?`, `!` или буква) и регистр первой буквы.
  - Нет вариантов из стоп-списка: `/wszystkie|żadne z|все перечисленн|всі перелічен|all of the above|none of the above/i`.
  - Доля вопросов, где верный вариант строго самый длинный, ≤ 0,35 по всему банку.
  - Язык не смешивается — перенести существующую проверку из `bot-quiz.test.ts`.
  - **Не из приложения:**
    - собрать все строки контента: `CITY_CONTENT` (`content/seed`), `MISSIONS`, `PLACEMENT` и `EXAM_*` (`content/exams`) — рекурсивно все string-значения;
    - нормализация: нижний регистр, без `«»"'.,!?…:;()—-`, пробелы схлопнуты;
    - склеить в одну строку через `' | '`;
    - каждая фраза из `polishPhrases` длиной ≥ 3 слов не должна входить в неё как `' ' + фраза + ' '`.
  - Сообщение помещается в подпись — проверка пока по `questionView` и `resultView` движка `/quiz`; в задаче 5 переводится на `dailyQuestionView` и `dailyResultView` с худшим набором строк.
- [ ] **Step 2:** прогон → FAIL (у вопросов нет `image`, варианты отгадываются).
- [ ] **Step 3: перенести 60 вопросов в `bank/<тема>.ts` и переписать.**
  - id сохраняются, у каждого появляется `image` по смыслу.
  - Неверные варианты — того же шаблона и формы: падеж, вид, предлог, ложный друг, похожее слово.
  - Пояснение объясняет, чем плохи остальные варианты.
  - Картинка не подсказывает ответ.
- [ ] **Step 4:** `npx vitest run test/quiz-bank.test.ts test/bot-quiz.test.ts` → PASS. `npm run typecheck` → 0.
- [ ] **Step 5: коммит** `Daily quiz: question bank by topic with quality checks; 60 old questions rewritten (same-form options, pictures)`.

### Task 3: Схема и миграция

**Files:**
- Modify: `apps/server/src/db/schema.ts`
- Create: `apps/server/migrations/0018_daily_quiz.sql` + снимок `meta/` (`npm run db:generate -w @polski-go/server`)
- Test: `apps/server/test/migration-0018.test.ts`

**Interfaces — Produces (Drizzle):**
- `dailyQuizPlan` (`daily_quiz_plan`): `day` (text, `YYYY-MM-DD`), `level` (`'A1'|'A2'|'B1'`), `questionId`, `image`, `skipped` (bool, default false), `editedBy` (text|null, admin id), `updatedAt`. Первичный ключ (day, level).
- `dailyQuizSends` (`daily_quiz_sends`):
  - поля: `day`, `telegramId`, `userId` (null у тех, кто только в боте), `level`, `lang`, `questionId`, `status` (`DAILY_STATUS = ['PENDING','SENT','BLOCKED','NO_CHAT','FAILED','UNKNOWN']`), `roundId`, `error`, `leaseUntil`, `sentAt`, `answeredAt`, `chosen` (индекс варианта в банке), `correct`, `createdAt`;
  - первичный ключ (day, telegram_id);
  - индексы `(day, level, status)`, `(round_id)`, `(telegram_id, day)`.
- `dailyQuizQuestions` (`daily_quiz_questions`): `questionId` (первичный ключ), `disabled` (bool), `updatedBy`, `updatedAt`.
- Новые поля `botQuizPlayers`: `ignoredDaily` (int 0), `lastDailyAt` (ts), `noChatAt` (ts), `dailyStreak` (int 0), `dailyStreakDay` (text).

- [ ] **Step 1: тест.** После миграций в тестовой D1:
  - таблицы есть;
  - вставка двух строк `daily_quiz_sends` с одинаковыми (day, telegram_id) — вторая не проходит (`ON CONFLICT DO NOTHING` → 0 строк);
  - у старой строки `bot_quiz_players` новые поля получили значения по умолчанию.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** схема → `db:generate`. Проверить, что SQL только добавляет: `CREATE TABLE`, `ALTER TABLE … ADD`, без пересоздания таблиц.
- [ ] **Step 4:** PASS. Весь `npm test -w @polski-go/server` — без новых падений (миграция применяется в каждом наборе).
- [ ] **Step 5: коммит** `Daily quiz: schema (plan, sends, question switches, player counters)`.

### Task 4: Состояние рассылки и план на 30 дней

**Files:**
- Create: `apps/server/src/bot/daily/state.ts`, `apps/server/src/bot/daily/plan.ts`
- Test: `apps/server/test/daily-quiz.test.ts` (новый, блок «план»)

**Interfaces — Produces:**
- `DAILY_TZ = 'Europe/Warsaw'`, `PLAN_DAYS = 30`, `DAILY_LEVELS = ['A1','A2','B1'] as const`, `type DailyLevel`.
- `type DailyState = { enabled: boolean; sendAt: string /* 'HH:MM' */; startDay: string | null }`. Хранится в `app_state` под ключом `daily_quiz`.
- `readDailyState(): Promise<DailyState>` — по умолчанию `{ enabled: false, sendAt: '18:00', startDay: null }`.
- `writeDailyState(patch: Partial<DailyState>): Promise<DailyState>`.
- `type DailyRun = { day: string; cursor: number; done: boolean; startedAt: number }` — ключ `daily_quiz_run`.
- `readDailyRun()`, `writeDailyRun(run: DailyRun)`.
- `warsawDay(now: Date): string`.
- `sendWindow(state, day): { from: Date; to: Date }` — от `sendAt` по Варшаве до +4 часа.
- `isSendingDay(state, day): boolean` — `enabled && startDay !== null && day >= startDay`.
- `ensurePlan(today: string, days = PLAN_DAYS): Promise<void>` — дописывает недостающие пары (день, уровень), существующие не трогает.
- `planRange(from: string, n: number): Promise<PlanRow[]>`, где `PlanRow = typeof dailyQuizPlan.$inferSelect`.
- `disabledQuestionIds(): Promise<Set<string>>`.
- `setQuestionDisabled(id: string, disabled: boolean, adminId: string | null, today: string)` — при выключении будущие строки плана с этим вопросом получают замену; сегодняшняя строка после начала отправки не меняется.
- `replacePlanItem(day, level, patch: { questionId?: string; image?: QuizScene }, adminId)`.
- `setDaySkipped(day, skipped, adminId)`.
- `isDayEditable(day, today, run): boolean` — `day > today || (day === today && run?.day !== today)`.

**Алгоритм выбора вопроса** (`pickDaily(level, day, history)`; `history` — строки плана этого уровня за прошлые дни и уже выбранные в этом заполнении):
- кандидаты — вопросы уровня, не выключенные и не стоявшие на этом уровне за последние `min(пул − 1, 60)` дней;
- исключить кандидатов с картинкой вчерашнего дня этого уровня, а если можно — и с той же темой;
- выбрать давно не стоявший: сначала ни разу не стоявшие, при равенстве — меньший `hash(day + level + id)` (детерминированно);
- если после исключений пусто — ослабить правила по одному: тема → картинка → давность.

- [ ] **Step 1: тесты.**
  - `ensurePlan('2026-12-01')` создаёт 90 строк; повторный вызов ничего не меняет.
  - На 30 дней: у каждого уровня нет повторов вопроса и нет одинаковой картинки в соседние дни.
  - Выключенный вопрос не попадает в план; `setQuestionDisabled` заменяет его в будущих днях.
  - `replacePlanItem` с вопросом другого уровня → ошибка `wrong_level`; с неизвестной картинкой → `bad_image`.
  - `isDayEditable`: вчера — false; сегодня до начала отправки — true; после — false.
  - `sendWindow` переходит на летнее время: 18:00 по Варшаве — 17:00 UTC летом и 16:00 UTC в декабре.
- [ ] **Step 2:** FAIL → **Step 3:** реализация → **Step 4:** PASS, typecheck.
- [ ] **Step 5: коммит** `Daily quiz: schedule state and 30-day plan`.

### Task 5: Тексты и вид сообщений вопроса дня

**Files:**
- Create: `apps/server/src/bot/daily/copy.ts`, `apps/server/src/bot/daily/views.ts`
- Modify: `apps/server/src/bot/quiz/engine.ts` — экспорт `sendWithPhoto` (с необязательным `stats`), `InlineKeyboard`, `awardXp`, `showResult`.
- Modify: `apps/server/test/quiz-bank.test.ts` — проверка длины подписи через новые view.

**Interfaces — Produces:**
- `DAILY_COPY: Record<UiLang, DailyCopy>`:
  - `header(cat, cefr)` → `🧠 Pytanie dnia · ${cat} · ${cefr}`;
  - `choose`, `streakLine(n)`, `returnLine`, `percentLine(pct, level)`, `xp(n)`, `noAccount`, `dailyStreak(n)`;
  - `lesson` («📚 Пройти урок · 5 минут»), `startApp` («🚀 Начать учить польский»), `more` («🧠 Ещё вопрос»);
  - `off` («🔕 Не присылать вопрос дня»), `on` («🔔 Присылать вопрос дня»), `offDone`, `onDone`.
  - Тон — Бобек, как в `quiz/copy.ts`. Тексты пишутся на трёх языках.
- `type DailyExtra = { streak: number | null; returning: boolean; hasUser: boolean }`.
- `dailyQuestionView(q, order, lang, roundId, extra: DailyExtra): { text; keyboard }`:
  - строки: заголовок; строка серии (`streak ≥ 2`, сегодня не занимался) или «давно не виделись» (3+ дня без занятий); вопрос; варианты в тексте, если длинные; `choose`;
  - кнопки: варианты `qa:<round>:<i>`; при строке серии — ещё кнопка урока (`web_app` на `screenUrl('learn')`).
- `type DailyResult = { hasUser: boolean; xp: number; percent: number | null; dailyStreak: number; pushEnabled: boolean }`.
- `dailyResultView(round, q, r: DailyResult): { text; keyboard }`:
  - строки: заголовок; вопрос; итог; твой ответ; верный ответ; пояснение; процент (если не null); XP или `noAccount`; серия вопросов дня (если ≥ 2);
  - кнопки: урок (с аккаунтом) или вход в приложение; `qz:next`; `qz:daily:0|1`.

- [ ] **Step 1: тесты.**
  - Для каждого вопроса банка и каждого языка: `dailyQuestionView` с `{ streak: 30, returning: false, hasUser: true }` и `dailyResultView` с `{ xp: 10, percent: 100, dailyStreak: 99 }` при неверном выборе ≤ 1024 знаков.
  - Все `callback_data` ≤ 64 байт.
  - Без аккаунта нет кнопки урока, есть `startApp`.
  - Кнопка урока до ответа есть только со строкой серии.
- [ ] **Step 2:** FAIL → **Step 3:** реализация → **Step 4:** PASS.
- [ ] **Step 5: коммит** `Daily quiz: message copy and views (question, result) in ru/uk/en`.

### Task 6: Кому и как отправляется

**Files:**
- Create: `apps/server/src/bot/daily/audience.ts`, `apps/server/src/bot/daily/send.ts`
- Modify: `wrangler.jsonc` — `"crons": ["*/15 * * * *", "* * * * *"]`.
- Modify: `apps/server/src/worker.ts` — `controller.cron === DAILY_CRON ? runDailyQuizTick(t) : runScheduled(t)`.
- Modify: `apps/server/src/jobs.ts` — в `runScheduled` вызвать `ensurePlan(warsawDay(now))` (с `.catch`, как у очистки раундов).
- Test: `apps/server/test/daily-quiz.test.ts` (блоки «кому», «отправка»)

**Interfaces:**
- Consumes: задачи 3–5; `pickLang` (`bot/data`); `effectiveStreak`, `dayDiff`, `dayKey`, `shuffle` (`@polski-go/shared`).
- Produces:
  - `DAILY_CRON = '* * * * *'`, `DAILY_PER_RUN = 40`, `DAILY_IGNORED_MAX = 3`.
  - `type DailyPerson` — строка выборки: `telegramId`, `userId`, `banned`, `uiLanguage`, `contactLang`, `blockedAt`, `contactSeenAt`, `appSeenAt`, `pushEnabled`, `ignoredDaily`, `lastDailyAt`, `noChatAt`, `languageLevel`, `placementLevel`, `selfLevel`, `streakCurrent`, `lastActiveDay`, `timezone`.
  - `dailyEligibility(p: DailyPerson): 'ok' | 'banned' | 'opted_out' | 'blocked' | 'paused' | 'no_chat'`:
    - `banned` — `banned`;
    - `opted_out` — `pushEnabled === false`;
    - `blocked` — `blockedAt` есть;
    - `no_chat` — `noChatAt` есть и `contactSeenAt` не позже его;
    - `paused` — `ignoredDaily ≥ 3`, и ни `contactSeenAt`, ни `appSeenAt` не позже `lastDailyAt`;
    - иначе `ok`.
  - `quizLevel(languageLevel, placement, self): DailyLevel` — подтверждённый уровень, если он не A0, иначе placement ?? self. A0/A1/нет → A1, A2 → A2, B1 и выше → B1.
  - `scanPeople(afterTelegramId: number, limit: number): Promise<DailyPerson[]>`:
    - SQL: `WITH ids AS (SELECT … FROM (SELECT telegram_id FROM bot_contacts WHERE telegram_id > ? ORDER BY telegram_id LIMIT ?) UNION SELECT … FROM (SELECT telegram_id FROM users WHERE telegram_id > ? ORDER BY telegram_id LIMIT ?) ORDER BY telegram_id LIMIT ?)`;
    - к `ids` — LEFT JOIN `users`, `user_settings`, `bot_contacts`, `bot_quiz_players`, `player_progress`, `user_profiles`.
  - `allPeople(): Promise<DailyPerson[]>` — та же выборка без курсора, для админки.
  - `dailyAudience(): Promise<{ total; byLevel; byLang; excluded: Record<причина, number> }>`.
  - `runDailyQuizTick(now = new Date(), budget = DAILY_PER_RUN): Promise<{ sent: number; calls: number }>`.
  - `sendDailyTest(telegramId: number, lang: UiLang, day: string, level: DailyLevel): Promise<void>` — источник `test`, в статистику не попадает.

**Порядок одного запуска** (`runDailyQuizTick`):
1. Прочитать `state`. Не день рассылки, ещё не время, окно прошло или день пропущен — выйти. Пропуск дня — `skipped` в плане на сегодня.
2. Прочитать `run`; новый день — `{ day, cursor: 0, done: false }`. `done` — выйти.
3. Если на сегодня нет плана — `ensurePlan(today)`.
4. Перевести просроченные `PENDING` (`lease_until < now`) в `UNKNOWN`.
5. Взять кандидатов: `scanPeople(cursor, 100)`. Для каждого, пока вызовов меньше бюджета:
   - не `ok` — пропустить, курсор сдвигается;
   - захват — `INSERT … ON CONFLICT DO NOTHING RETURNING` в `daily_quiz_sends` (`PENDING`, lease 5 минут);
   - раунд (`source: 'daily'`) → `sendWithPhoto` с картинкой из плана;
   - успех — `SENT`, `round_id`, `sent_at`; у игрока `last_daily_at = now`, `ignored_daily` = 1, если с прошлой отправки была активность, иначе `+1`.
6. Ошибки отправки:
   - 403 «blocked» — `BLOCKED` и `bot_contacts.blocked_at` (upsert);
   - 403 «can't initiate» или 400 «chat not found» — `NO_CHAT` и `bot_quiz_players.no_chat_at`;
   - неопределённый результат — `UNKNOWN`;
   - 429 — удалить захват и закончить запуск;
   - остальные — `FAILED`.
   - Неотправленный раунд удаляется.
7. Курсор — последний обработанный telegram_id. Пройдено меньше 100 кандидатов и все обработаны — `done: true`.

- [ ] **Step 1: тесты «кому».**
  - Получают:
    - только писал боту (A1, язык из `language_code`);
    - игрок приложения с выключенными напоминаниями (уровень по `placementLevel`).
  - Не получают:
    - гость (`telegram_id < 0`);
    - заблокированный админом;
    - заблокировавший бота;
    - нажавший «Не присылать»;
    - получивший `NO_CHAT` — пока снова не напишет боту.
  - `dailyAudience().total` равно числу `ok` в `allPeople()`.
- [ ] **Step 2: тесты «отправка»** (Telegram подменён):
  - До запуска, до 18:00, после окна, в пропущенный день — 0 сообщений.
  - После запуска в 18:00 — фото, подпись с заголовком «Pytanie dnia», 4 кнопки; `daily_quiz_sends.status = SENT`.
  - Один человек в боте и в приложении — одно сообщение.
  - Два запуска подряд с одним курсором — без повторов.
  - Бюджет 2 при 5 людях — 2 сообщения, следующий запуск продолжает с курсора.
  - 403 blocked → `BLOCKED` и `blocked_at`; 403 «can't initiate» → `NO_CHAT`; после нового сообщения боту человек снова получает вопрос.
  - Три неотвеченных дня → четвёртый день не приходит; после `/start` — приходит.
- [ ] **Step 3:** FAIL → **Step 4:** реализация → **Step 5:** PASS; `npm test -w @polski-go/server` целиком.
- [ ] **Step 6: коммит** `Daily quiz: audience and minute sender (one per person per day, blocked / no-chat / pause)`.

### Task 7: Ответ, переключатель, /stop, напоминания и приглашения

**Files:**
- Create: `apps/server/src/bot/daily/answer.ts`
- Modify: `apps/server/src/bot/quiz/engine.ts` — ветка `source === 'daily'` в `answerRound` и `resultFor`; кнопка `qz:daily:0|1` в `handleQuizCallback`; при любом ответе `ignoredDaily: 0`; `startQuiz` передаёт в `pickQuestion` выключенные вопросы (`disabledQuestionIds()`), и `/quiz` их не задаёт (тест: выключенный вопрос не выпадает за 200 подборов).
- Modify: `apps/server/src/bot/handler.ts` — `/stop`: `setQuizPush(from.id, false)` для всех, у кого есть только Telegram ID, и выключение напоминаний у игроков приложения. Сбой → `failStop`.
- Modify: `apps/server/src/jobs.ts` — `sendReminders`:
  - если сегодня день рассылки (включена, `startDay` наступил, день не пропущен), то кандидату с `dailyEligibility = 'ok'` вместо отправки пишется строка `notification_log` со статусом `SKIPPED` и ошибкой `daily_quiz`;
  - в запрос кандидатов — LEFT JOIN `bot_quiz_players` и `bot_contacts`;
  - `runScheduled`: `sendQuizInvites` не вызывается, пока рассылка включена.
- Test: `apps/server/test/daily-quiz.test.ts` (блоки «ответ», «напоминания»)

**Interfaces — Produces (`answer.ts`):**
- `setQuizPush(telegramId: number, enabled: boolean, now?: Date)`.
- `recordDailyAnswer(round, chosen, correct, user, now): Promise<void>`:
  - XP через `awardXp` без лимита наград `/quiz`;
  - в `daily_quiz_sends`: `answered_at`, `chosen`, `correct`;
  - у игрока: `answered`, `correct`, `ignoredDaily = 0`, серия вопросов дня (`dailyStreakDay` — вчера → +1, сегодня → без изменений, иначе 1).
- `dailyResultFor(round, q, user): Promise<DailyResult>` — процент за день по уровню из `daily_quiz_sends`, если ответили ≥ 5.

- [ ] **Step 1: тесты «ответ».**
  - Верный ответ с аккаунтом:
    - подпись меняется в том же сообщении (`editMessageCaption`) и показывает пояснение;
    - `+10 XP` в `/api/me`;
    - лимит наград `/quiz` не тронут.
  - Повторное нажатие — без второго XP.
  - Без аккаунта — нет XP, есть подсказка и кнопка входа в приложение.
  - Процент:
    - 4 ответивших — строки нет;
    - 5 ответивших, из них 4 верно — «80 %».
  - Серия вопросов дня — 2 дня подряд, строка «2 дня подряд».
  - `qz:daily:0` выключает рассылку человеку, кнопка меняется на «Присылать».
  - `/stop` от человека без аккаунта выключает вопрос дня.
- [ ] **Step 2: тесты «напоминания».**
  - Рассылка включена:
    - получатель вопроса дня — напоминание не уходит, строка `SKIPPED/daily_quiz`;
    - выключивший вопрос дня — напоминание уходит;
    - в пропущенный день — напоминание уходит всем;
    - приглашения `/quiz` не отправляются.
  - Рассылка выключена — всё как раньше; существующие тесты `reminders-delivery` и `bot-quiz` зелёные.
- [ ] **Step 3:** FAIL → **Step 4:** реализация → **Step 5:** PASS; весь сервер.
- [ ] **Step 6: коммит** `Daily quiz: answers (XP, percent, streak), opt-out button, /stop by Telegram ID, reminders and invites step aside`.

### Task 8: Выключатель «Вопрос дня» в приложении

**Files:**
- Modify: `apps/server/src/routes/public.ts` — `PATCH /me/settings` принимает `dailyQuiz: boolean`. У игрока с `telegram_id > 0` это `setQuizPush`; у гостя — 400 `no_telegram`.
- Modify: `apps/server/src/services/profile.ts` — `getMe` возвращает `dailyQuiz: boolean | null` (null — гость; нет строки — true).
- Modify: `apps/web/src/lib/types.ts`, `apps/web/src/screens/Settings.tsx` — `Toggle` «Вопрос дня в боте» под переключателем напоминаний, только не гостям; i18n-ключи `set_daily_quiz` и `set_daily_quiz_d` на ru/uk/en.
- Test: `apps/server/test/daily-quiz.test.ts` (блок «настройки»)

- [ ] **Step 1: тест.**
  - `PATCH /api/me/settings {dailyQuiz:false}` → `me.dailyQuiz === false`, в `bot_quiz_players.push_enabled` записано 0.
  - У гостя тот же запрос → 400.
- [ ] **Step 2:** FAIL → **Step 3:** реализация → **Step 4:** PASS; `npm run typecheck`; `npm run build -w @polski-go/web`.
- [ ] **Step 5: коммит** `Daily quiz: on/off switch in app settings`.

### Task 9: API админки

**Files:**
- Create: `apps/server/src/services/daily-quiz-admin.ts`
- Modify: `apps/server/src/routes/admin.ts` — маршруты ниже; блок `dailyQuiz` в `GET /users/:id`.
- Test: `apps/server/test/daily-quiz-admin.test.ts`

**Interfaces — Produces (маршруты `/api/admin/...`):**
- `GET /daily-quiz?lang=ru` (`SUPERADMIN`, `SUPPORT`) →
  - `state`, `run`, `today`;
  - `rate`: `{ perRun: 40, perHour }`;
  - `audience` — результат `dailyAudience()`;
  - `scenes`: `[{ id, label, imageUrl }]`;
  - `plan` — 30 дней: `[{ day, sendAt, skipped, editable, items: [{ level, questionId, image, imageUrl, edited, preview: { text, buttons } }] }]`. `preview` — текст `dailyQuestionView` без тегов и подписи кнопок;
  - `history` — 7 прошлых дней: `[{ day, skipped, levels: [{ level, questionId, sent, answered, correct }] }]`.
- `GET /daily-quiz/questions?lang=ru` → весь банк: `{ id, level, category, kind, prompt, options, answer, explain, image, disabled, timesDaily, lastDaily, answered, correctPct }`. Ответы считаются по `daily_quiz_sends` и раундам `/quiz`.
- `PATCH /daily-quiz/state` (`SUPERADMIN`) `{ enabled?, sendAt? /^([01]\d|2[0-3]):(00|15|30|45)$/, startDay? }`. В журнал: `daily_quiz_start`, `daily_quiz_stop` или `daily_quiz_settings`.
- `PATCH /daily-quiz/plan/:day/:level` (`SUPERADMIN`) `{ questionId?, image? }`. Ошибки: `day_locked`, `wrong_level`, `question_disabled`, `bad_image`. В журнал — `daily_quiz_plan`.
- `PATCH /daily-quiz/plan/:day` (`SUPERADMIN`) `{ skipped }`. Ошибка — `day_locked`. В журнал — `daily_quiz_skip`.
- `PATCH /daily-quiz/questions/:id` (`SUPERADMIN`) `{ disabled }`. В журнал — `daily_quiz_question`.
- `POST /daily-quiz/test` (`SUPERADMIN`, `SUPPORT`) `{ who, day, level }` → `findTelegramPlayer` (`services/campaigns`) → `sendDailyTest`. Ответ — `{ sentTo }`.
- `GET /daily-quiz/day/:day?filter=all|answered|not_answered|wrong|failed&after=<telegramId>` →
  - `levels`: `[{ level, questionId, prompt, imageUrl, sent, delivered, blocked, noChat, failed, answered, correct }]`;
  - `rows` (100 на страницу): `{ telegramId, userId, name, username, level, lang, sentAt, status, answeredAt, chosenText, correct }`;
  - `more`.
- `GET /users/:id` → `dailyQuiz: [{ day, questionId, prompt, status, answeredAt, correct }]` за 14 дней.

- [ ] **Step 1: тесты.**
  - Роли:
    - `EDITOR` → 403 везде;
    - `SUPPORT` видит страницу и шлёт себе, а `PATCH` → 403.
  - План: 30 дней по 3 уровня, у каждой позиции есть `preview`.
  - Замена вопроса и картинки сохраняется и пишется в журнал; вопрос не того уровня → 400.
  - Запуск и остановка пишутся в журнал.
  - Отчёт дня:
    - счётчики по уровням;
    - отборы «ответили», «не ответили», «ошиблись», «не дошло»;
    - постраничный вывод по `after`.
  - `GET /users/:id` содержит блок `dailyQuiz`.
  - Выключение вопроса меняет будущий план.
  - День после начала отправки → `day_locked`.
- [ ] **Step 2:** FAIL → **Step 3:** реализация → **Step 4:** PASS.
- [ ] **Step 5: коммит** `Daily quiz: admin API (plan, launch, day report, question stats, player card)`.

### Task 10: Страница «Вопрос дня» в админке

**Files:**
- Create: `apps/admin/src/DailyQuiz.tsx`
- Modify:
  - `apps/admin/src/App.tsx` — пункт меню «🧠 Вопрос дня» в группе «Бот» для `SUPERADMIN` и `SUPPORT`, маршрут `/daily-quiz`, блок «Вопросы дня» в `UserDetail`;
  - `apps/admin/src/System.tsx` — подписи действий в `ACTION_RU` и `ENTITY_RU`;
  - `scripts/admin-screens.ts`.
- Test: `scripts/admin-screens.ts`

**Состав страницы:**
- **Шапка:** состояние «Рассылка вопроса дня: включена / выключена», время, охват, «≈ N ч на отправку» (`audience.total / rate.perHour`). Кнопка «Запустить с <дата>» открывает подтверждение: сколько человек, время, длительность, предупреждение, если отправка не уложится в 4 часа. Кнопка «Остановить».
- **Вкладка «План»:**
  - карточки дней; в каждом дне три уровня: миниатюра, вопрос, варианты с отмеченным верным, пояснение (раскрывается);
  - «Как увидит игрок» — фото, текст `preview` и кнопки;
  - выбор языка ru / uk / en;
  - действия: «Заменить вопрос» (список банка по уровню с темой и «был N дней назад»), «Сменить картинку» (16 сцен), «Пропустить день», «Прислать себе»;
  - прошлые 7 дней — только просмотр.
- **Вкладка «День»:** стрелки по дням; карточки уровней; таблица получателей с отборами и «Показать ещё».
- **Вкладка «Вопросы»:** таблица банка с сортировкой по «% верно»; выше 90 % и ниже 15 % отмечены; выключатель.

- [ ] **Step 1: проверки в `admin-screens.ts`** — подготовка: включённая рассылка, 2 человека получили вопрос, один ответил.
  - План показывает 30 дней.
  - Запуск открывает диалог с числом людей.
  - Замена вопроса сохраняется (toast).
  - Вкладка «День»: в таблице видно «дошло» и «✓».
  - Вкладка «Вопросы»: выключатель работает.
  - Карточка игрока показывает блок.
  - axe без нарушений; на 390 px нет горизонтальной прокрутки.
- [ ] **Step 2:** реализация.
- [ ] **Step 3:** `npm run typecheck`, `npm run build -w @polski-go/admin`, `node --import tsx scripts/admin-screens.ts` → все проверки ok. Посмотреть скриншоты 390 и 1280.
- [ ] **Step 4: коммит** `Daily quiz: admin page (plan before launch, day report, question switches)`, затем **пуш** — первая выкладка, рассылка выключена.

### Task 11–16: Новые вопросы (≈ 200)

Шесть порций по ≈ 33 вопроса, каждая — отдельная задача с одинаковыми шагами:

| Задача | Уровень | Темы порции |
|---|---|---|
| 11 | A1 | shopping, food, transport, everyday, talk |
| 12 | A1 | city, work, health, grammar |
| 13 | A2 | shopping, food, transport, city, talk |
| 14 | A2 | work, health, everyday, grammar |
| 15 | B1 | shopping, food, transport, city, work |
| 16 | B1 | health, everyday, grammar, talk |

**Files:** `apps/server/src/bot/quiz/bank/<тема>.ts`; тест `apps/server/test/quiz-bank.test.ts`.

- [ ] **Step 1: тест распределения** (добавляется в задаче 11 и ужесточается к 16).
  - В конце: всего ≥ 250 вопросов, на каждый уровень ≥ 80, на каждую тему ≥ 20.
  - Промежуточные пороги — по фактическому числу после порции.
- [ ] **Step 2:** написать вопросы порции по правилам спеки:
  - новые ситуации, не из уроков;
  - варианты одного шаблона: падеж, вид, предлог, ложный друг;
  - пояснение разбирает неверные варианты;
  - картинка по смыслу;
  - id: `<тема>-<слово>`.
- [ ] **Step 3:** `npx vitest run test/quiz-bank.test.ts` → PASS. Вопрос, который не прошёл «не из приложения» или длины, переписать, а не ставить исключение.
- [ ] **Step 4:** самопроверка 5 случайных вопросов порции:
  - ровно один верный;
  - неверные варианты правдоподобны;
  - на картинке нет ответа.
- [ ] **Step 5: коммит** `Daily quiz: questions <уровень> part <n>`. Пуш — после задач 13 и 16.

### Task 17: Документы, полный прогон, выкладка

**Files:** `docs/ADMIN_RU.md` (раздел «Вопрос дня»: как смотреть план, запускать, читать отчёт), `PROJECT_PROGRESS.md`, `docs/HANDOFF.md`, `docs/QA_RESULTS.md`.

- [ ] **Step 1: прогон.**
  - `npm run typecheck` → 0;
  - `npm test` → shared и server без падений;
  - `npm run build -w @polski-go/web -w @polski-go/admin`;
  - `node scripts/validate-assets.mjs`;
  - `node --import tsx scripts/admin-screens.ts`.
- [ ] **Step 2:** документы; в `QA_RESULTS.md` строка с числами прогона.
- [ ] **Step 3: коммит** `Daily quiz: docs and full test run`. **Пуш.** Владельцу — ссылка на страницу «Вопрос дня» и что проверить перед «Запустить».
