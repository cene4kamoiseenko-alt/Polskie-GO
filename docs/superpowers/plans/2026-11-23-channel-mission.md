# Миссия за подписку на канал — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** длинная миссия «Тайна Твардовского» (escape room, Краков) открывается после проверенной ботом подписки на @polskigoo; реклама канала и Instagram в миссиях, на главной, в профиле и в /start бота.

**Architecture:** у миссии новый флаг `channel: true` — как `premium`, но замок снимает `users.channel_joined_at`. Его ставит `POST /channel/verify` после `getChatMember` Bot API. Ссылки на соцсети — общая константа в `@polski-go/shared`, её используют и приложение, и бот.

**Tech Stack:** Hono + Drizzle + D1 (Cloudflare Workers), React 18 + TanStack Query, vitest + Miniflare, Telegram Bot API.

**Spec:** `docs/superpowers/specs/2026-11-23-channel-mission-design.md`

## Global Constraints

- Канал: `@polskigoo`, ссылка `https://t.me/polskigoo`; Instagram: `https://www.instagram.com/polskigoo` (без `bqrl`/`utm`).
- Экономика не меняется: награда за подписку — только доступ к миссии; XP/złotki миссии — как у длинных Premium-сцен (60 XP, 30 zł).
- Доступ после проверки — навсегда, повторной проверки нет.
- Новые шаги миссии — без `listen`; в каждом шаге ровно один верный вариант, у неверных есть `why`.
- Тексты интерфейса — uk/ru/en; польский — без кириллицы.
- Растровые картинки не заменять SVG; у миссии пока SVG-сцена `castle` + бриф фона в `MISSION_BACKGROUND_BRIEF`.
- Пуш — только по слову владельца «пуш».

## Review Focus

1. Бот не админ канала → Telegram `400 member list is inaccessible` → ответ `unavailable` (не «вы не подписаны»), ошибка в журнале — тест в Task 2.
2. Гость вне Telegram (`telegramId < 0`) → `no_telegram` без запроса в Telegram; в приложении вместо «Проверить» — пояснение — тест в Task 2.
3. Вышел из канала / забанен (`left`/`kicked`) → `not_member`; `restricted` с `is_member: true` → подписан — тест в Task 2.
4. Повторная проверка уже подтверждённого → `ok` без вызова Telegram — тест в Task 2.
5. Прямой вход `/life/escape-twardowski` без подписки → сервер `403 channel_required`, приложение открывает панель подписки — тест в Task 2, проверка в браузере в Task 3.

---

### Task 1: Миссия «Тайна Твардовского» и слова в словаре

**Files:**
- Create: `apps/server/src/content/mission-channel.ts`
- Modify: `apps/server/src/content/missions.ts` (тип `Mission` + `channel?: boolean`; `MISSIONS.push(...CHANNEL_MISSIONS)`)
- Modify: `apps/server/src/content/vocab-krakow.ts`, `vocab-katowice.ts`, `vocab-wroclaw.ts`
- Modify: `packages/shared/src/sceneArt.ts` (`MISSION_BACKGROUND_BRIEF['escape-twardowski']`)
- Test: `apps/server/test/channel-mission.test.ts`

**Interfaces:**
- Produces: `CHANNEL_MISSIONS: Mission[]` с одной миссией `slug: 'escape-twardowski'`, `channel: true`, `city: 'krakow'`, `scene: 'castle'`, `category: 'road'`, `minutes: 20`, `xp: 60`, `zlotki: 30`.
- Produces: словарь — `górny` (forms `{ f: 'górna', n: 'górne' }`), `dolny` (`dolna`, `dolne`), `środkowy` (`środkowa`, `środkowe`), `oraz` (conj, B1), `Górny Śląsk` (Катовице), `Dolny Śląsk` (Вроцлав).

- [ ] **Step 1: тест** `channel-mission.test.ts`:
  - миссия одна, `channel === true`, `premium`/`season` не заданы, `minutes === 20`, `steps.length >= 26`, id шагов уникальны;
  - нет `kind: 'listen'`; в каждом шаге с вариантами ровно один `ok`, у неверных есть `why`;
  - слова `words` каждого шага есть в `VOCAB`; у `build` ловушки (`extra`) не входят в ответ;
  - в польских текстах шагов встречаются `górnej`/`górna`, `dolnej`/`dolna`, `środkowej`/`środkowa` и `oraz`;
  - в `VOCAB` есть `górny`, `dolny`, `środkowy`, `oraz`, `Górny Śląsk`, `Dolny Śląsk`.
- [ ] **Step 2:** `cd apps/server && npx vitest run test/channel-mission.test.ts` → FAIL (нет модуля).
- [ ] **Step 3: написать миссию.** Сюжет по спеке: акт I (ресепшен: бронь, правила, рация, название команды, легенда); акт II (библиотека: полки górna/dolna/środkowa, записка с «oraz», кодовый замок числительными, шифр буква→цифра, предлоги места, загадка, вежливая просьба о подсказке); поворот (Куба ошибается кодом, замок на 5 минут, входит «дьявол»); акт III (корчма «Rzym», выход, фото, отзыв, новая бронь). NPC — пан Михал (ведущий), Ола, Куба, Diabeł. Помощники `npc/narr/P/T/choice/build/ph` — как в `missions-premium.ts`. Добавить слова в словари, бриф фона — в `sceneArt.ts`.
- [ ] **Step 4:** тест из Step 1 + `test/scene-art.test.ts test/content.test.ts test/missions.test.ts test/premium-missions.test.ts` → PASS.
- [ ] **Step 5:** `node --import tsx scripts/audio-library.ts catalog` (из корня), коммит.

### Task 2: Сервер — доступ по подписке и проверка

**Files:**
- Create: `apps/server/migrations/0025_channel_joined.sql` — `ALTER TABLE users ADD channel_joined_at integer;`
- Create: `apps/server/src/services/channel.ts`
- Create: `packages/shared/src/social.ts` (+ экспорт из `index.ts`)
- Modify: `apps/server/src/db/schema.ts` (`users.channelJoinedAt: ts('channel_joined_at')`)
- Modify: `apps/server/src/env.ts` (`config.channelChat`, env `CHANNEL_CHAT`, по умолчанию `'@polskigoo'`)
- Modify: `apps/server/src/services/missions.ts` (`summaryOf` → `channel`; `listMissions`: `locked`/`lock`; `startMission`: `403 channel_required`)
- Modify: `apps/server/src/routes/game.ts` (`POST /channel/verify`, `rateLimit(10, 60_000, 'channel')`)
- Modify: `apps/server/src/services/profile.ts` (`getMe` → `channelJoined: boolean`)
- Test: `apps/server/test/channel.test.ts`

**Interfaces:**
- Produces (shared): `SOCIAL_LINKS = { telegram: 'https://t.me/polskigoo', instagram: 'https://www.instagram.com/polskigoo' } as const`.
- Produces: `isChannelMember(m: { status: string; is_member?: boolean }): boolean` — `creator`/`administrator`/`member` → true; `restricted` → `is_member === true`; иначе false.
- Produces: `verifyChannel(userId: string, now?: Date): Promise<{ ok: true } | { ok: false; reason: 'not_member' | 'no_telegram' | 'unavailable' }>`.
- Produces API: `GET /missions` → у каждой миссии `channel: boolean`, `lock: 'premium' | 'channel' | null` (`locked` = `lock !== null`); `POST /channel/verify` → результат `verifyChannel`; `GET /me` → `channelJoined: boolean`; `POST /missions/escape-twardowski/start` без подписки → 403 `channel_required`.

- [ ] **Step 1: тесты** `channel.test.ts` (Miniflare + `fakeTelegram` из `test/tg-fake.ts`, вход через `login()` из helpers):
  - `isChannelMember`: member/administrator/creator → true; left/kicked → false; restricted+is_member → true, restricted без него → false;
  - до проверки: `GET /missions` → у `escape-twardowski` `locked: true, lock: 'channel'`; старт → 403 `channel_required`;
  - verify при `getChatMember` → `{status:'member'}`: `{ok:true}`, вызов с `chat_id: '@polskigoo'` и `user_id` игрока; после — `locked: false`, старт 200, `/me` → `channelJoined: true`;
  - повторный verify → `{ok:true}`, новых вызовов Telegram нет;
  - `{status:'left'}` → `not_member`, доступ закрыт;
  - `tgError(400, 'Bad Request: member list is inaccessible')` → `unavailable`;
  - гость (`telegramId < 0`, через standalone-вход из `standalone.test.ts`) → `no_telegram`, вызовов Telegram нет.
- [ ] **Step 2:** `npx vitest run test/channel.test.ts` → FAIL.
- [ ] **Step 3: реализация** по Interfaces; в `verifyChannel` ошибки Bot API → `recordError({ kind: 'server', message: 'channel verify: …' })` и `unavailable`; запись `channelJoinedAt` — только при `ok`.
- [ ] **Step 4:** тест + `test/missions.test.ts test/premium-missions.test.ts test/pass.test.ts test/security.test.ts` → PASS; `npx tsc --noEmit`.
- [ ] **Step 5:** коммит.

### Task 3: Приложение — замок, панель подписки, главная, профиль

**Files:**
- Create: `apps/web/src/components/ChannelSheet.tsx`
- Modify: `apps/web/src/lib/types.ts` (`MissionSummary.channel`, `MissionListItem.lock`, `Me.channelJoined`)
- Modify: `apps/web/src/components/MissionCard.tsx`, `apps/web/src/screens/Missions.tsx`, `Mission.tsx`, `Home.tsx`, `Profile.tsx`
- Modify: `apps/web/src/i18n/uk.ts`, `ru.ts`, `en.ts`

**Interfaces:**
- Consumes: API из Task 2, `SOCIAL_LINKS`.
- Produces: `<ChannelSheet open onClose onUnlocked={() => void} />` — шаги «Подписаться» (`tg.openTelegramLink(SOCIAL_LINKS.telegram)`, вне Telegram — `window.open`) и «Проверить» (`POST /channel/verify`; кнопка неактивна, пока идёт запрос); сообщения для `not_member` / `unavailable` / `no_telegram`; при `ok` — инвалидировать `['missions']`, `['me']`, тост «Миссия открыта!» и `onUnlocked`.
- `missionHref(m)`: `lock === 'premium'` → `/premium`; `lock === 'channel'` → `/life?channel=1`; иначе `/life/<slug>`.

- [ ] **Step 1:** типы + i18n-ключи (`channel_*`, `social_*`) в трёх языках.
- [ ] **Step 2:** `ChannelSheet` на общем `Sheet` из `components/ui.tsx`.
- [ ] **Step 3:** `MissionCard`: для `channel` — значок Telegram «Для подписчиков»; `Missions.tsx`: миссия канала первой в «Все», `?channel=1` открывает панель; `Mission.tsx`: `channel_required` → `<Navigate to="/life?channel=1" replace />`.
- [ ] **Step 4:** `Home.tsx` — карточка канала, пока `!me.channelJoined` и не закрыта (`localStorage['pg.channelCard.closed']`, чтение/запись в try/catch); `Profile.tsx` — секция «Мы в соцсетях»: Telegram (бейдж «+ миссия», пока не открыта) и Instagram (`tg.openLink`).
- [ ] **Step 5:** `npm run typecheck`, `npm run build:web`; в браузере (Playwright, 390 px) проверить карточку на главной, замок, панель, профиль; коммит.

### Task 4: Бот — кнопка канала в /start

**Files:**
- Modify: `apps/server/src/bot/copy.ts` (`Button = { label; screen } | { label; url }`; кнопка `📣 Канал Polski Go` / `📣 Канал Polski Go` / `📣 Polski Go channel` в `start` и `startBack` трёх языков)
- Modify: `apps/server/src/bot/send.ts` (`buildKeyboard`: кнопка с `url` → `{ text, url }` в любом чате)
- Test: `apps/server/test/bot-webhook.test.ts`

- [ ] **Step 1: тест:** `/start` в личке — последняя кнопка `{ text: '📣 …', url: 'https://t.me/polskigoo' }`; в группе — то же.
- [ ] **Step 2:** FAIL → реализация → `npx vitest run test/bot-webhook.test.ts test/bot-copy.test.ts` PASS; коммит.

### Task 5: Документы, полный прогон

- [ ] `docs/CHANNEL_MISSION_RU.md`: как работает, что сделать владельцу (бот — админ канала), где реклама, как сменить канал (`CHANNEL_CHAT`).
- [ ] Полный прогон сервера (фон, ~30 мин), `npm run typecheck`, `npm run build:web`; коммит. Без пуша.
