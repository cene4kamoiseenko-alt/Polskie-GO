# Живые миссии и уроки (вариант А) — план

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** на каждом шаге миссии и урока — картинка места сверху с движением и живой реакцией на ответ (вариант А).

**Architecture:** реестр библиотеки картинок (имя файла → темы, точка фокуса) и правила выбора живут в `packages/shared`
(чистые функции, юнит-тесты). Сжатые WebP-копии библиотеки собираются скриптом в `apps/web/src/assets/library`.
Экран миссии получает постоянную «сцену» (картинка + облачко реплики), урок — растровую картинку вместо векторной
сцены. Проверка — браузерный скрипт `scripts/living-check.ts` (Chromium, стенд с настоящим сервером).

**Tech Stack:** React + `../lib/motion` (framer-motion API, `useReducedMotion`), Tailwind, vitest (shared), Playwright + axe (скрипты), sharp.

**Spec:** `docs/superpowers/specs/2026-11-24-living-missions-design.md`

## Global Constraints

- Картинка миссии: `clamp(190px, 34vh, 300px)`; сцена урока: `clamp(176px, 28vh, 240px)`.
- Миссия — одна картинка на всю миссию, урок — одна на весь урок; у соседних уроков маршрута — разные.
- Нет накладного второго Бобека поверх картинки, где Бобек нарисован в кадре (вся библиотека, все сцены миссий).
- Приближение картинки ≈ 6–8 % за 10–12 с; облачко ≈ 0,35 с; печать реплики ≈ 50 мс/буква, ≤ 1,2 с.
- Уменьшенное движение (`useReducedMotion()` из `../lib/motion`): без приближения, печати, конфетти и тряски.
- egzamin-* в библиотеке уроков/миссий не используются; rozmowa-1/2 — только тема «работа».
- Экзамены, входной тест, тренировки, «Вопрос дня» — без изменений. Механика, XP, экономика — без изменений.
- Растровые иллюстрации не заменять SVG или эмодзи (правило владельца).
- Комментарии в коде — по-русски (как в соседних файлах), тексты интерфейса — через i18n (ru/uk/en).
- Пуш — только после «пуш» владельца.

## Review Focus

1. Телефон 320×568: шаг миссии с 3 длинными вариантами (Żabka, шаг 3) — варианты и «Проверить» видны без прокрутки.
2. Шаг «послушай» (скрытая реплика): до ответа текст не показывается и не «печатается»; после верного ответа появляется.
3. Уменьшенное движение (настройка приложения `reducedMotion: true`): после загрузки шага нет бесконечных анимаций.
4. Тёмная тема: облачко и панель ответа читаемы — axe без нарушений контраста в области шага.
5. Картинка не загрузилась (сеть): сцена остаётся (цветной фон), нет «битой» картинки, шаг проходим.

---

### Task 1: Реестр библиотеки и правила выбора (shared)

**Files:**
- Create: `packages/shared/src/libraryArt.ts`
- Modify: `packages/shared/src/index.ts` (экспорт)
- Test: `packages/shared/test/library-art.test.ts`

**Interfaces:**
- Produces:
  - `type LibraryTheme = 'shop' | 'work' | 'transport' | 'home' | 'food' | 'talk' | 'listen' | 'speak' | 'study' | 'celebrate' | 'general'`
  - `LIBRARY_ART: Record<string, { themes: LibraryTheme[]; focus: string }>` — ключ = имя файла без `.jpg` из `apps/web/public/channel`.
  - `ROUTE_ICON_THEME: Record<string, LibraryTheme>` и `MISSION_CATEGORY_THEME: Record<string, LibraryTheme>`.
  - `libraryPool(theme: LibraryTheme): string[]` — файлы темы в порядке реестра.
  - `lessonLibraryArt(routeIcon: string | null | undefined, routeSlug: string, lessonIndex: number): string | null` — `null` = панорама города.
  - `missionLibraryArt(category: string, slug: string): string` — всегда файл (тема категории или `general`).

- [ ] **Step 1: Тесты** — `library-art.test.ts`:
  - каждый ключ `LIBRARY_ART` существует как `apps/web/public/channel/<ключ>.jpg`;
  - ни один ключ не начинается с `egzamin`; `rozmowa-1/2` есть только в теме `work`;
  - каждая тема из `ROUTE_ICON_THEME` и `MISSION_CATEGORY_THEME` имеет ≥ 2 картинки;
  - `lessonLibraryArt('explore', 'waw-x', 1)`, `('map-pins', …)`, `('map', …)`, `('achievements', …)`, `(undefined, …)`, `('unknown-icon', …)` → `null`;
  - `lessonLibraryArt('shopping', 'waw-liczby', i)` для i = 1..6: соседние результаты различны, все — из `libraryPool('shop')`;
  - тот же вызов дважды → тот же файл; разные `routeSlug` с одной темой при `lessonIndex=1` не все одинаковы (≥ 2 разных на 6 маршрутах);
  - `missionLibraryArt(c, 's')` для `shop/food/road/transport/home/work` → файл своей темы; для `season` и `xyz` → файл из `general`.
- [ ] **Step 2: Запустить** `npm run test -w @polski-go/shared -- library-art` → FAIL (модуля нет).
- [ ] **Step 3: Реализовать** `libraryArt.ts` по таблице спеки (раздел «Какие картинки где»): route icons
  shopping/basket/receipt-check → shop; office → work; transport/train-ticket/tram → transport; house → home;
  cafe/food/dishes → food; dialog/speech → talk; headphones → listen; pronunciation → speak; writing/book-clock/lessons → study;
  gift → celebrate. Категории миссий: shop, food → свои; road, transport → transport; home → home; work → work.
  `general` = lotnisko, muzeum, finanse, uniwersytet-1, straz-pozarna, akwarium, uniwersytet-2, biblioteka, kino.
  Индекс внутри темы: `(fnv1a(routeSlug) + lessonIndex) % pool.length` (FNV-1a 32 бит) — соседи различны при pool ≥ 2.
  Фокус по умолчанию `'50% 35%'` (Бобек обычно в центре сверху).
- [ ] **Step 4: Запустить** тот же тест → PASS; `npm run typecheck -w @polski-go/shared` → без ошибок.
- [ ] **Step 5: Commit** «Библиотека картинок: реестр тем и выбор для уроков и миссий».

### Task 2: WebP-копии библиотеки для приложения

**Files:**
- Create: `scripts/build-library-art.ts` (запуск `node --import tsx scripts/build-library-art.ts`)
- Create: `apps/web/src/assets/library/<файл>.webp`, `<файл>@640.webp` (результат скрипта)
- Modify: `apps/web/src/lib/assets.ts` — `libraryImage(file: string): { src: string; srcSet: string; focus: string } | null`
- Test: `packages/shared/test/library-art.test.ts` (добавить)

**Interfaces:**
- Consumes: `LIBRARY_ART` (Task 1).
- Produces: `libraryImage(file)` в `apps/web/src/lib/assets.ts` (через `pick('library', …)`, ширина основного 1080, srcset `640w, 1080w`, `focus` из реестра).

- [ ] **Step 1: Тест** — для каждого ключа `LIBRARY_ART` существуют `apps/web/src/assets/library/<ключ>.webp` и `<ключ>@640.webp`; основной не шире 1080 px, файл ≤ 200 КБ.
- [ ] **Step 2: Запустить** → FAIL (файлов нет).
- [ ] **Step 3: Скрипт** — sharp: `resize({ width: 1080, withoutEnlargement: true })` и 640, `webp({ quality: 78 })`, пропорции как у исходника (без обрезки). Шапка-комментарий как у `build-season-art.mjs`.
- [ ] **Step 4: Собрать** и запустить тест → PASS; `libraryImage` добавить; `npm run typecheck -w @polski-go/web` → без ошибок.
- [ ] **Step 5: Commit** «Библиотека картинок: WebP 1080/640 для приложения».

### Task 3: Картинка миссии всегда растровая

**Files:**
- Modify: `apps/web/src/components/MissionScene.tsx`
- Modify: `apps/web/src/screens/Mission.tsx` (вступление: передать `season`, `category`)
- Create: `scripts/living-check.ts` (стенд + Chromium, как `scripts/mission-screens.ts`)

**Interfaces:**
- Consumes: `missionLibraryArt` (Task 1), `libraryImage` (Task 2), `passMissionScene`, `passSeasonCover`, `missionSceneArt`.
- Produces: `MissionScene` props `+ season?: string | null; category?: string`; атрибут `data-scene-source="own" | "pass" | "season" | "library"` на `<img>`;
  `hasBakedBobek(slug, season?, category?)` → `true` для любой растровой картинки (SVG больше не бывает).

- [ ] **Step 1: Проверка в `living-check.ts`** — вступление миссий `zabka-first-order` (own) и сезонной миссии текущего сезона без своей сцены
  (взять из `MISSIONS` + `PASS_MISSION_SCENE`; если таких нет — открыть `/life/<сезонная>` любой без `MISSION_SCENE_ART`): в герое `img[data-scene-source]` декодирована (`naturalWidth > 0`), источник не `svg`, поверх нет `Beaver`.
- [ ] **Step 2: Запустить** `node --import tsx scripts/living-check.ts` → FAIL (нет `data-scene-source`).
- [ ] **Step 3: Реализовать** цепочку own → pass → season cover → library в `MissionScene`; `objectPosition` из `focus`.
- [ ] **Step 4: Запустить** → PASS.
- [ ] **Step 5: Commit** «Миссии: картинка места всегда растровая (сезон, библиотека)».

### Task 4: Шаг миссии — сцена над диалогом и движение

**Files:**
- Create: `apps/web/src/components/MissionStage.tsx` — сцена шага: картинка, верхняя панель поверх, облачко реплики
- Modify: `apps/web/src/screens/Mission.tsx` (`Player`, `TopBar`, `LineCard` → облачко, панель ответа с Бобеком)
- Modify: `apps/web/src/index.css` (стили облачка и сцены, если не хватает утилит)
- Modify: `scripts/living-check.ts`

**Interfaces:**
- Consumes: `MissionScene` (Task 3), `Beaver` (moods `cheer`, `sad`/`think`), `Confetti`, `XpBurst` из `components/fx`/`ui`.
- Produces: разметка для проверок: `[data-mission-stage]` (сцена, высота по Global Constraints), `[data-line-bubble]` (облачко), `[data-feedback-beaver]` (Бобек в панели ответа); в шаге нет `[data-step-beaver]`.

- [ ] **Step 1: Проверки** (320×568, 390×844, 430×932; светлая и тёмная тема), миссия `zabka-first-order`, пользователь стенда:
  - шаг 1: `[data-mission-stage] img` декодирована; `[data-line-bubble]` пересекает нижний край сцены; маленького Бобека в заголовке нет;
  - шаг 1 (скрытая реплика): текст реплики в DOM отсутствует до ответа;
  - верный ответ (правильный вариант — из `MISSIONS` контента сервера): `[data-feedback-beaver]` виден, текст реплики показан; неверный (другой вариант) — панель «Не совсем…» с Бобеком;
  - шаг 3 (3 длинных варианта) на 320×568: все `.option` и кнопка проверки целиком в окне без прокрутки;
  - картинка сцены не меняется между шагами 1→2→3 (`src` тот же);
  - `reducedMotion: true` (PATCH `/api/me/settings`): через 1,5 с после шага `document.getAnimations().filter(a => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity)` пусто и нет конфетти после верного ответа;
  - блок `**/assets/library/**` и `**/assets/scenes/**` → шаг рендерится, `img` с `naturalWidth === 0` скрыт (нет «битой» картинки), ответить можно;
  - axe (WCAG 2 A/AA) в `[data-mission-stage]` и области ответов — без нарушений в обеих темах.
- [ ] **Step 2: Запустить** → FAIL.
- [ ] **Step 3: Реализовать** `MissionStage` и перенос: картинка приближается (scale 1→1.07, 11 с, `ease-in-out`, один раз за шаг без перезапуска при смене шага — анимация на корне сцены, ключ не зависит от шага);
  облачко — существующий `LineCard` в новой обёртке (позиция: наезжает на нижний край сцены), печать текста — только для открытых реплик;
  верно — вспышка картинки (brightness 1→1.25→1, 0,7 с), `XpBurst` над сценой, `Confetti`; ошибка — тряска сцены (x 0→−6→6→0, 0,3 с);
  Бобек — в панели ответа (верно `cheer`, ошибка `think`); при ошибке загрузки картинки — скрыть `img` (`onError`), фон сцены остаётся.
- [ ] **Step 4: Запустить** `living-check` → PASS; `node --import tsx scripts/mission-screens.ts` → PASS (обновить его ожидание «миссия без картинки — SVG и свой Бобек», если оно опирается на старое поведение — правило ledger'ом).
- [ ] **Step 5: Commit** «Миссии: картинка места на каждом шаге, облачко реплики, живая реакция на ответ».

### Task 5: Урок — растровая картинка по теме маршрута

**Files:**
- Modify: `apps/web/src/components/LessonStage.tsx` (props `+ routeIcon?: string | null; lessonIndex?: number`; картинка библиотеки; движение)
- Modify: `apps/web/src/screens/Lesson.tsx` (передать `session.place.routeIcon`, `session.place.index`; вступление — та же картинка вместо векторной сцены)
- Modify: `scripts/living-check.ts`

**Interfaces:**
- Consumes: `lessonLibraryArt` (Task 1), `libraryImage` (Task 2).
- Produces: `[data-stage-art="library" | "city" | "home"]` на сцене урока; у `library` нет накладного `Beaver`.

- [ ] **Step 1: Проверки** — первый урок Варшавы (маршрут `waw-powitania`, иконка `dialog`): на вступлении и на задании — `[data-stage-art="library"]`, `img` из `/assets/library/`, нет `svg` сцены и нет накладного Бобека; высота сцены в пределах `clamp(176px, 28vh, 240px)`; верный ответ — кадр «вспыхивает», ошибка — вздрагивает; с `reducedMotion` — без бесконечных анимаций; axe — без нарушений.
- [ ] **Step 2: Запустить** → FAIL.
- [ ] **Step 3: Реализовать**: если `lessonLibraryArt(...)` вернул файл — `libraryImage` с приближением (как в Task 4) и реакцией кадра (как сейчас у фото «Бобек дома»), без `Beaver`; иначе — панорама города + Бобек игрока (как сейчас); без маршрута — фото «Бобек дома» (как сейчас). `Scene` (вектор) в уроках города не используется. Реплика-облачко и бейджи — как сейчас.
- [ ] **Step 4: Запустить** `living-check` → PASS; `node --import tsx scripts/lesson-render-check.ts` → PASS.
- [ ] **Step 5: Commit** «Уроки: картинка по теме маршрута вместо векторной сцены, движение кадра».

### Task 6: Документы, полная проверка, снимки владельцу

**Files:**
- Modify: `docs/HANDOFF.md` (запись дня), `docs/CHANNEL_ART_PROMPTS_RU.md` (раздел «Куда идут картинки»: приложение — `libraryArt.ts`)
- Create: `test-results/living/*.png` (снимки для владельца, не в git)

- [ ] **Step 1:** `npm run typecheck`, `npm run test -w @polski-go/shared`, `npm run build:web`, `npm run assets` → без ошибок.
- [ ] **Step 2:** `scripts/living-check.ts`, `mission-screens.ts`, `lesson-render-check.ts`, `browser-check.ts`, `a11y.ts` → все PASS.
- [ ] **Step 3:** снимки шагов миссии (вопрос/верно/ошибка) и урока на 390 px + короткое видео движения → владельцу.
- [ ] **Step 4: Commit** «Живые миссии и уроки: документы».
