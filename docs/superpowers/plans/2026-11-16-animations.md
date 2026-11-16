# Большие анимации: шесть сцен — план работ

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** шесть анимаций на растровых картинках игры: переезд в город, сундук, новый уровень, огонёк и юбилей серии, итоги недели лиги, живая главная.

**Architecture:** чистая логика «когда праздновать» — в `packages/shared` (с тестами vitest). В приложении — общий слой сцен (очередь, оболочка на весь экран, полёт растровых картинок) в `apps/web/src/components/scenes/`, по файлу на сцену. Сцены встраиваются в существующие места (главная, итоги урока, карта). Проверка — отдельный браузерный сценарий `scripts/scenes-check.ts` с записью видео.

**Tech Stack:** React 18, framer-motion 12 (только через `apps/web/src/lib/motion.ts`), Tailwind 4 + CSS в `apps/web/src/index.css`, Playwright, vitest (packages/shared), sharp (скрипт картинок).

**Spec:** `docs/superpowers/specs/2026-11-16-animations-design.md`

## Global Constraints

- Ни одной векторной фигуры в сценах: внутри `[data-scene]` нет `<svg>`; летят, падают и вспыхивают только растровые картинки игры. Свет — мягкое размытое свечение без лучей; снег и огоньки — размытые, разного размера и прозрачности.
- Растровые иллюстрации не заменяются CSS/SVG-рисунками.
- Анимируются только transform и opacity; фильтры и тени — не в бесконечном цикле.
- «Меньше анимаций» (`html.reduced-motion`, `useReducedMotion()` из `lib/motion.ts`) и prefers-reduced-motion: итоговый кадр сцены без движения (`[data-scene-final]`), эффекты главной выключены, огонёк неподвижен.
- Любая сцена пропускается тапом или кнопкой «Пропустить»; до кульминации ≤ 3 с, вся сцена ≤ 7 с.
- Картинки сцены не загрузились за 1,5 с — показывается итоговый кадр.
- Одновременно одна сцена; порядок: уровень → юбилей серии → сундук → итоги лиги.
- Автосцены (уровень, юбилей) не стартуют на `/lesson/`, `/practice/`, `/story/`, `/life/<slug>`.
- Тексты на ru, uk, en (`apps/web/src/i18n/{ru,uk,en}.ts`).
- Отметки юбилея серии: 7, 30, 100, затем каждые 100.
- Время суток: утро 6–10, день 10–18, вечер 18–22, ночь 22–6 (часовой пояс игрока, по умолчанию Europe/Warsaw). Снег: 1 декабря — конец февраля; огоньки: 20 декабря — 6 января (дата по Варшаве).
- Звук и вибрация — `sfx` (`lib/audio.ts`) и `haptic` (`lib/telegram.ts`), только в пике сцены.

## Review Focus

1. Экран 360 px — сцена целиком в кадре, без горизонтальной прокрутки (Task 11, проверка на 360/390/430).
2. Две-три сцены разом (уровень + юбилей + сундук) — идут по очереди, не накладываются (Task 3, Task 11 «очередь»).
3. Цели полёта нет на экране (нет счётчика Złotki) — монеты улетают вверх и гаснут, сцена закрывается без ошибки (Task 11 «нет цели»).
4. localStorage недоступен (бросает исключение) — главная открывается, ошибок страницы нет, автосцены просто не играют (Task 11 «без хранилища»).
5. Картинки сцены не грузятся (сеть) — через 1,5 с итоговый кадр, тап закрывает (Task 11 «картинки не загрузились»).

---

### Task 1: Логика праздников в shared

**Files:**
- Create: `packages/shared/src/celebrations.ts`
- Modify: `packages/shared/src/index.ts` (экспорт)
- Test: `packages/shared/test/celebrations.test.ts`

**Interfaces:**
- Produces:
  - `streakMilestone(prev: number, now: number): number | null` — наибольшая отметка m из 7, 30, 100, 200, 300… с `prev < m <= now`, иначе null.
  - `levelUpTo(prevSeen: number | null, now: number): number | null` — null, если `prevSeen === null` (первый запуск) или `now <= prevSeen`; иначе `now`.
  - `type DayPeriod = 'morning' | 'day' | 'evening' | 'night'`; `dayPeriod(hour: number): DayPeriod`.
  - `homeSeason(warsawDay: string /* YYYY-MM-DD */): { snow: boolean; lights: boolean }`.
  - `streakFlash(prev: number, now: number): boolean` — серия перешла отметку 3, 14 или 60 (малые отметки: только вспышка огонька в шапке, без сцены).

- [ ] **Step 1: тесты**

```ts
describe('streakMilestone', () => {
  it('отметки 7, 30, 100, далее каждые 100', () => {
    expect(streakMilestone(6, 7)).toBe(7);
    expect(streakMilestone(7, 8)).toBeNull();
    expect(streakMilestone(29, 30)).toBe(30);
    expect(streakMilestone(99, 100)).toBe(100);
    expect(streakMilestone(199, 200)).toBe(200);
    expect(streakMilestone(3, 14)).toBe(7);      // 14 — не отметка сцены
    expect(streakMilestone(5, 31)).toBe(30);     // перескок — наибольшая
    expect(streakMilestone(12, 0)).toBeNull();   // серия сгорела
  });
});
describe('streakFlash', () => {
  it('малые отметки 3, 14, 60', () => {
    expect(streakFlash(2, 3)).toBe(true);
    expect(streakFlash(13, 14)).toBe(true);
    expect(streakFlash(59, 60)).toBe(true);
    expect(streakFlash(6, 7)).toBe(false);
    expect(streakFlash(3, 4)).toBe(false);
  });
});
describe('levelUpTo', () => {
  it('первый запуск молча, рост — новый уровень', () => {
    expect(levelUpTo(null, 5)).toBeNull();
    expect(levelUpTo(5, 5)).toBeNull();
    expect(levelUpTo(5, 7)).toBe(7);
    expect(levelUpTo(7, 6)).toBeNull();
  });
});
describe('dayPeriod', () => {
  it('границы', () => {
    expect([5, 6, 9, 10, 17, 18, 21, 22, 0].map(dayPeriod)).toEqual(['night', 'morning', 'morning', 'day', 'day', 'evening', 'evening', 'night', 'night']);
  });
});
describe('homeSeason', () => {
  it('снег дек–фев, огоньки 20.12–06.01', () => {
    expect(homeSeason('2026-11-30')).toEqual({ snow: false, lights: false });
    expect(homeSeason('2026-12-01')).toEqual({ snow: true, lights: false });
    expect(homeSeason('2026-12-20')).toEqual({ snow: true, lights: true });
    expect(homeSeason('2027-01-06')).toEqual({ snow: true, lights: true });
    expect(homeSeason('2027-01-07')).toEqual({ snow: true, lights: false });
    expect(homeSeason('2028-02-29')).toEqual({ snow: true, lights: false });
    expect(homeSeason('2027-03-01')).toEqual({ snow: false, lights: false });
  });
});
```

- [ ] **Step 2:** `cd packages/shared && npx vitest run test/celebrations.test.ts` — FAIL (модуля нет).
- [ ] **Step 3:** реализовать пять функций в `celebrations.ts`, экспорт `export * from './celebrations'` в `index.ts`.
- [ ] **Step 4:** тот же запуск — PASS; `npx vitest run` в packages/shared — все тесты зелёные.
- [ ] **Step 5:** коммит `Анимации: логика праздников (отметки серии, уровень, время суток, сезон)`.

---

### Task 2: Растровые картинки эффектов

**Files:**
- Create: `scripts/build-fx-art.mjs`
- Create (результат скрипта, коммитятся): `apps/web/src/assets/fx/gift.webp`, `apps/web/src/assets/fx/xp.webp`, `apps/web/src/assets/fx/sparkle.webp`
- Modify: `apps/web/src/lib/assets.ts` — `export const fxArt = (name: 'gift' | 'xp' | 'sparkle') => pick('fx', name);`
- Modify: `apps/web/src/assets/README.md` — строка про `fx/`

**Interfaces:**
- Produces: `fxArt(name)` → URL или null.

- [ ] **Step 1:** скрипт `node scripts/build-fx-art.mjs` (sharp, raw RGBA): из `icons/gift.webp` и `icons/xp.webp` убрать плитку заливкой от краёв по пикселям «прозрачный или (max(r,g,b) > 150 и насыщенность < 0.40)», края маски — сужение на 1 px и размытие 0.7 px, обрезка по содержимому. `sparkle.webp` — отдельная непрозрачная компонента вырезанного подарка, чья рамка целиком в правой верхней четверти (звёздочка справа сверху). В конце скрипт сам проверяет: у каждого файла угловые пиксели прозрачные, центр непрозрачный, у `sparkle` ширина и высота 20–80 px; иначе выход 1.
- [ ] **Step 2:** запустить скрипт — выход 0; посмотреть три картинки на тёмном и светлом фоне (лист в scratchpad) — нет светлых следов плитки.
- [ ] **Step 3:** `fxArt` в `assets.ts`, строка в README.
- [ ] **Step 4:** `npm run typecheck -w @polski-go/web` — 0 ошибок.
- [ ] **Step 5:** коммит `Анимации: подарок, монета опыта и искорка без плитки (растр)`.

---

### Task 3: Слой сцен — очередь, оболочка, полёт

**Files:**
- Create: `apps/web/src/components/scenes/SceneLayer.tsx`
- Create: `apps/web/src/components/scenes/Fly.tsx`
- Modify: `apps/web/src/App.tsx` — `<SceneProvider>` внутри `<ToastProvider>`, вокруг маршрутов
- Modify: `apps/web/src/index.css` — блок `/* Сцены (2026-11-16) */`
- Modify: i18n — `scene_skip` («Пропустить» / «Пропустити» / «Skip»)

**Interfaces:**
- Produces:
  - `type SceneKind = 'level' | 'streak' | 'chest' | 'league'` (переезд — не в очереди, он на карте).
  - `SceneProvider({ children })`; `useScenes(): { play(kind: SceneKind, render: (done: () => void) => ReactNode): void; active: SceneKind | null }` — очередь с приоритетом level < streak < chest < league, одна сцена за раз; повторный `play` того же вида, пока он в очереди, игнорируется.
  - `SceneShell({ kind, onDone, images, children, final }: { kind: string; onDone(): void; images: string[]; children: ReactNode /* анимация */; final: ReactNode /* итоговый кадр */ })` — фиксированный слой `z-[90]`, затемнение, кнопка «Пропустить», тап по фону = `onDone`; атрибуты `data-scene={kind}`, у итогового кадра `data-scene-final`. Ждёт загрузки `images` (≤ 1,5 с, иначе `final`); при `useReducedMotion()` — сразу `final`. Esc и системная «Назад» — `onDone`.
  - `flyTo(opts: { src: string; from: DOMRect; to: string /* CSS-селектор цели */; count: number; size: number }): Promise<void>` в `Fly.tsx` — рисует `count` растровых `<img>` в портале, веер из `from`, полёт к центру цели; цели нет на экране — полёт вверх за край и угасание. Резолвится после прилёта последней.
  - `GLOW` — CSS-класс `.scene-glow` (мягкое размытое свечение, radial-gradient + blur, без лучей).

- [ ] **Step 1:** реализовать `SceneLayer.tsx` и `Fly.tsx` по интерфейсам; CSS-блок.
- [ ] **Step 2:** подключить `SceneProvider` в `App.tsx`.
- [ ] **Step 3:** `npm run typecheck -w @polski-go/web` — 0; `npm run build:web` — успешно.
- [ ] **Step 4:** коммит `Анимации: слой сцен (очередь, оболочка, полёт растровых картинок)`.

(Поведение слоя проверяется сценами в Task 11 — у веб-приложения нет модульных тестов.)

---

### Task 4: Огонёк горит

**Files:**
- Create: `apps/web/src/components/LiveFlame.tsx`
- Modify: `apps/web/src/components/StreakCard.tsx` (огонёк в `StreakIndicator`, большой огонёк `.streak-flame`, огоньки дней), `apps/web/src/screens/Home.tsx:214` (огонёк недели)
- Modify: `apps/web/src/index.css` — `@keyframes flame-sway`, `@keyframes flame-glow`

**Interfaces:**
- Produces: `LiveFlame({ size, lit, className }: { size: number; lit: boolean; className?: string })` — растровый `Art name="flame"`; `lit=false` — серый и неподвижный; в покое колышется от основания (transform-origin 50% 90%, масштаб и наклон 2–3 %, случайная фаза через `animation-delay`), под ним мягкое свечение; класс `is-live` только пока элемент в кадре (`useInView` из `lib/motion.ts`) и вкладка видима; `html.reduced-motion` — без движения. Атрибут `data-live-flame`.

- [ ] **Step 1:** компонент + CSS; заменить `<Art name="flame" …>` в перечисленных местах (`lit` = серия > 0, у дней недели — день с занятием).
- [ ] **Step 2:** typecheck — 0.
- [ ] **Step 3:** коммит `Анимации: огонёк серии горит`.

---

### Task 5: Новый уровень

**Files:**
- Create: `apps/web/src/lib/ranks.ts` — перенести `RANKS` и `rankFor` из `screens/Home.tsx` (Home реэкспортирует, импорты в Social/Profile не трогать)
- Create: `apps/web/src/components/scenes/LevelUpScene.tsx`
- Create: `apps/web/src/components/scenes/CelebrationWatcher.tsx`
- Modify: `apps/web/src/screens/Lesson.tsx:576,698-704` — вместо `Modal` уровня: `play('level', …)` после полёта опыта (`showAch` или 1,6 с), и отметка уровня как увиденного
- Modify: `apps/web/src/App.tsx` — `<CelebrationWatcher />` внутри `SceneProvider`
- Modify: i18n — `scene_level_title` («Новый уровень!»), `scene_level_ok` («Супер!»)

**Interfaces:**
- Consumes: `levelUpTo` (Task 1), `useScenes`, `SceneShell` (Task 3).
- Produces:
  - `LevelUpScene({ level, rank, xp, xpNeeded, onDone })`: мягкое свечение; значок `Art name="shield" label={String(level)}` (растр) вылетает из глубины с поворотом 360° и пружиной; звание `rank` по буквам; полоса опыта 0 → `xp / xpNeeded`; кнопка `scene_level_ok`. `data-scene="level"`.
  - `seenStore`: `readSeen(userId): { level: number | null; streak: number | null }`, `writeSeen(userId, patch)` в `CelebrationWatcher.tsx` — localStorage `pg_seen:<userId>`, все обращения в try/catch (ошибка → `{ level: null, streak: null }`, запись молча пропускается).
  - `CelebrationWatcher()`: на изменение `useMe().data` вне маршрутов урока/миссии/истории: `levelUpTo(seen.level, me.progress.level)` → `play('level')`; запись увиденного уровня всегда.

- [ ] **Step 1:** `ranks.ts`, сцена, наблюдатель, правка Lesson и App, тексты.
- [ ] **Step 2:** typecheck — 0; `npm run build:web` — успешно.
- [ ] **Step 3:** коммит `Анимации: сцена нового уровня`.

---

### Task 6: Юбилей серии

**Files:**
- Create: `apps/web/src/components/scenes/StreakScene.tsx`
- Modify: `CelebrationWatcher.tsx` — серия
- Modify: i18n — `scene_streak_7` («Неделя подряд!»), `scene_streak_30` («Месяц подряд!»), `scene_streak_n` («{n} дней подряд!»), `scene_streak_ok` («Так держать!»)

**Interfaces:**
- Consumes: `streakMilestone` (Task 1), `LiveFlame` (Task 4), `fxArt('sparkle')` (Task 2), `flyTo` (Task 3).
- Produces: `StreakScene({ from, to, onDone })`: огонёк (растр) вырастает из `[data-open-streak]` в центр до 200 px, мягкое свечение, 6–8 растровых искорок вспыхивают вокруг; число дней набегает `from → to` (`CountUp` из `components/fx.tsx`); подпись по `to` (7 / 30 / иначе `n`); по кнопке огонёк улетает в `[data-open-streak]`. `data-scene="streak"`. Наблюдатель: `streakMilestone(seen.streak ?? me.progress.streak, me.progress.streak)` → `play('streak')`; иначе `streakFlash(...)` → класс `is-flash` на `[data-open-streak]` на 1,2 с (CSS `@keyframes flame-flash`: вспышка масштаба и мягкого свечения); при `seen.streak === null` — молча записать.

- [ ] **Step 1:** сцена, правка наблюдателя, тексты.
- [ ] **Step 2:** typecheck — 0.
- [ ] **Step 3:** коммит `Анимации: юбилей серии`.

---

### Task 7: Сундук дня

**Files:**
- Create: `apps/web/src/components/scenes/ChestScene.tsx`
- Modify: `apps/web/src/screens/Home.tsx:577-591` — после успешного `claim` вместо `toast(...)`: `play('chest', …)` с `r.xp`, `r.zlotki` и прямоугольником кнопки сундука; `data-hud-zlotki` на кнопке Złotki в `TopStats` (`Home.tsx:79`); `data-hud-level` на карточке уровня в банере главной («Уровень N · звание», `Home.tsx:373-411`)
- Modify: i18n — `scene_chest_ok` («Забрать») — сцена закрывается и сама

**Interfaces:**
- Consumes: `fxArt('gift' | 'xp')`, `iconAsset('zlotki')`, `flyTo`, `SceneShell`, `CountUp`.
- Produces: `ChestScene({ xp, zlotki, from: DOMRect, onDone })`: подарок вылетает из `from` в центр и растёт, тряска 0,8 с с нарастанием, вспышка мягкого света, `flyTo` монет Złotki (10) в `[data-hud-zlotki]` и монет опыта (8) в `[data-hud-level]`; под подарком набегают «+N zł · +N XP»; закрытие через 1,2 с после прилёта или тапом. `data-scene="chest"`.

- [ ] **Step 1:** сцена и правка Home.
- [ ] **Step 2:** typecheck — 0.
- [ ] **Step 3:** коммит `Анимации: сундук дня`.

---

### Task 8: Итоги недели в лиге

**Files:**
- Create: `apps/web/src/components/scenes/LeagueScene.tsx`
- Modify: `apps/web/src/screens/Home.tsx:322-340` — `LeagueAwardModal` вызывает `play('league', …)` вместо `RewardModal`; при закрытии — как сейчас `/leaderboard/award/seen` и сброс `leagueAward` в кэше
- Modify: i18n — `scene_league_place` («Место {rank} в рейтинге недели»), `scene_league_ok` («Забрать приз»)

**Interfaces:**
- Consumes: `leagueArt('pedestal-1'…'pedestal-3' | 'crown-N' | 'medal-N' | 'trophy' | 'trophy-small')`, `iconAsset('zlotki')`, `flyTo`, `SceneShell`.
- Produces: `LeagueScene({ rank, xp, zlotki, onDone })`: места 1–3 — пьедесталы поднимаются 3 → 2 → 1 (по 0,3 с), над местом игрока падают корона и медаль, по кубку пробегает мягкий блик, `flyTo` монет (по 1 на 25 zł, не больше 12) в `[data-hud-zlotki]`, «Место N · +M zł»; места 4–10 — малый кубок вылетает в центр и монеты. `data-scene="league"`, `data-league-rank={rank}`.

- [ ] **Step 1:** сцена и правка Home.
- [ ] **Step 2:** typecheck — 0.
- [ ] **Step 3:** коммит `Анимации: итоги недели в лиге`.

---

### Task 9: Переезд в новый город и растровый полёт опыта

**Files:**
- Modify: `apps/web/src/components/IllustratedMap.tsx:378-424,493-497` — маркер поездки: мини-Бобек (`Beaver`, растровый образ игрока, 56 px) вместо `Icon name="pin"`, покачивание в пути; по прибытии (`data-arrived`) — мягкая вспышка над городом и подпрыгивание
- Create: `apps/web/src/components/scenes/ArrivalScene.tsx`
- Modify: `apps/web/src/screens/Map.tsx:50-77,145-157` — после прибытия (≈ 3 с) `ArrivalScene`; `finishTravel` — по её закрытию; «Пропустить» на плашке — сразу `ArrivalScene` в итоговом кадре
- Modify: `apps/web/src/components/fx.tsx:25-61` — `XpBurst` рисует растровые монеты опыта `fxArt('xp')` (размер 22 px) вместо цветных кружков
- Modify: i18n — `scene_arrival_go` («Вперёд!»), `scene_arrival_done` («{city} пройден»)

**Interfaces:**
- Consumes: `SceneShell`, `iconAsset('passport')`, `cityArtImage(slug)` (`lib/assets.ts`), `CityHero`.
- Produces: `ArrivalScene({ fromCity: { namePl: string }, toCity: { slug: string; namePl: string; color: string }, onDone })`: паспорт (растр) с поворотом и ударом падает в центр, лёгкая тряска слоя, `haptic.success()` и `sfx.win()`, подпись `scene_arrival_done` с польским названием пройденного города; затем панорама нового города раскрывается из центра на весь экран (масштаб 0.2 → 1, скругление → 0) с `namePl` и кнопкой `scene_arrival_go`. `data-scene="arrival"`.

- [ ] **Step 1:** правки карты, сцена, правка Map, XpBurst.
- [ ] **Step 2:** typecheck — 0.
- [ ] **Step 3:** коммит `Анимации: переезд в новый город; полёт опыта — растровые монеты`.

---

### Task 10: Живая главная

**Files:**
- Create: `apps/web/src/components/LiveHero.tsx`
- Modify: `apps/web/src/components/CityHero.tsx` — проп `live?: boolean` → класс `is-live` на корне и класс `city-hero-art` на слое картинки (если его нет)
- Modify: `apps/web/src/screens/Home.tsx:373-411` — `CityHero live`, `<LiveHero />` внутри банера под Бобеком и карточками
- Modify: `apps/web/src/index.css` — `@keyframes hero-breathe`, `@keyframes snow-fall`, `@keyframes light-twinkle`, классы оттенков `.hero-tint.is-morning|is-evening|is-night`

**Interfaces:**
- Consumes: `dayPeriod`, `homeSeason`, `localHour`, `dayKey` (shared), `useMe().data.settings.timezone`, `useInView`, `useReducedMotion`.
- Produces: `LiveHero()` — абсолютные слои поверх картинки, под содержимым банера (`pointer-events: none`):
  - дыхание: `.city-hero.is-live .city-hero-art` — масштаб 1 → 1.05 за 18 с туда-обратно; параллакс — `translateY` до 24 px по прокрутке (rAF, CSS-переменная `--hero-shift`);
  - оттенок: `.hero-tint` с периодом из `dayPeriod(localHour(now, tz))`, пересчёт раз в минуту, смена — плавная (opacity 1,5 с); день — без слоя;
  - снег (`homeSeason(...).snow`): 24 снежинки — размытые белые пятна 3–9 px, прозрачность 0.35–0.9, разная скорость и покачивание; огоньки (`lights`): 10 тёплых размытых пятен у верхнего края, мерцание;
  - всё на паузе (`animation-play-state: paused`), когда банер вне кадра или `document.hidden`; при «Меньше анимаций» — только неподвижный оттенок.
  - атрибуты: `data-live-hero`, `data-hero-period={period}`, `data-hero-snow`, `data-hero-lights`.
  - для проверки: `?heroAt=YYYY-MM-DDTHH:mm` в адресе (только в dev-сборке, `import.meta.env.DEV`) подменяет «сейчас».

- [ ] **Step 1:** компонент, правки CityHero/Home, CSS.
- [ ] **Step 2:** typecheck — 0; `npm run build:web` — успешно.
- [ ] **Step 3:** коммит `Анимации: живая главная (дыхание, время суток, снег, огоньки)`.

---

### Task 11: Браузерная проверка сцен и запись видео

**Files:**
- Create: `scripts/scenes-check.ts`
- Modify: `package.json` — `"e2e:scenes": "node --import tsx scripts/scenes-check.ts"`

**Interfaces:**
- Consumes: `startStand({ ui: 'dev' })`, `chromiumPath` (`scripts/lib/stand.ts`), прямой доступ к БД стенда как в `scripts/browser-check.ts` (`await import(root + '/apps/server/src/db')`), все `data-*` из Tasks 3–10.

Проверки (каждая — `check(условие, 'имя')`, итог «N проверок, 0 ошибок», выход 1 при ошибке); видео — `recordVideo` 390×844 в `test-results/scenes/<сцена>.webm`:
- **сундук:** игроку выполнены задания дня (через API/БД), нажатие сундука → `[data-scene="chest"]`; внутри сцены `svg` — 0, `img` — ≥ 3; через ≤ 7 с сцена закрыта сама; баланс в `[data-hud-zlotki]` вырос на сумму награды.
- **нет цели:** то же, но перед нажатием `[data-hud-zlotki]` удалён из DOM — сцена закрывается, ошибок страницы нет.
- **уровень:** `player_progress.xp_total` поднят до следующего уровня, увиденный уровень записан меньше → на главной `[data-scene="level"]`, в нём число нового уровня; тап — закрыта; повторная загрузка — сцены нет.
- **очередь:** уровень и серия 6 → 7 сразу → сначала `level`, после закрытия — `streak` (`[data-scene="streak"]` с текстом «Неделя подряд»).
- **лига:** `league_awards` с местом 2 → `[data-scene="league"][data-league-rank="2"]`, в нём 3 картинки пьедесталов; после закрытия `leagueAward` в `/api/me` — null.
- **лига 4–10:** место 6 — `[data-league-rank="6"]`, пьедесталов нет.
- **переезд:** `/map?travel=<from>,<to>` → маркер `[data-map-traveler] img` (не `svg`), через ≤ 4 с `[data-scene="arrival"]` с картинкой паспорта и панорамой; «Вперёд!» → сцена закрыта, открыта карточка нового города.
- **итоги урока:** полёт опыта — `img` с `fx/xp`, кружков нет.
- **огонёк:** на главной у игрока с серией ≥ 1 `[data-live-flame].is-live` есть; у игрока с серией 0 — `is-live` нет.
- **главная:** `?heroAt=2026-12-24T20:30` → `data-hero-period="evening"`, `data-hero-snow`, `data-hero-lights`; `?heroAt=2026-07-01T13:00` → без оттенка, снега и огоньков; `?heroAt=2026-07-01T23:30` → `night`.
- **меньше анимаций** (`emulateMedia({ reducedMotion: 'reduce' })`): сундук → сразу `[data-scene-final]`; у огонька нет `is-live`; снега нет.
- **картинки не загрузились:** `page.route('**/assets/fx/**', abort)` → сундук через ≤ 2 с в `[data-scene-final]`, тап закрывает.
- **без хранилища:** `addInitScript` делает `localStorage.getItem/setItem` бросающими → главная открылась (есть «Учиться дальше»), ошибок страницы нет.
- **ширины:** каждая сцена на 360/390/430 — `scrollWidth <= innerWidth`, рамка сцены в пределах окна.
- **плавность:** главная в покое 5 с (`PerformanceObserver` `longtask`) — задач > 50 мс нет.
- ошибок страницы (`pageerror`) нет во всех сценариях.

- [ ] **Step 1:** написать сценарий.
- [ ] **Step 2:** `npm run e2e:scenes` — все проверки зелёные; посмотреть видео каждой сцены (кадры через ffmpeg в scratchpad) — в кадре нет векторных фигур, ничего не обрезано.
- [ ] **Step 3:** коммит `Анимации: браузерная проверка сцен и запись видео`.

---

### Task 12: Документы, полный прогон, показ владельцу

**Files:**
- Modify: `docs/REDESIGN_2026-11_RU.md` — раздел «Большие анимации (2026-11-16)»: таблица сцен, где и когда, «Меньше анимаций», как проверить (`npm run e2e:scenes`)

- [ ] **Step 1:** документ.
- [ ] **Step 2:** полный прогон: `npm run typecheck`, `cd packages/shared && npx vitest run`, `cd apps/server && npx vitest run` (после — удалить `/tmp/miniflare-*`), `npm run build:web`, `npm run e2e`, `npm run e2e:scenes` — всё зелёное.
- [ ] **Step 3:** коммит `Анимации: документ`.
- [ ] **Step 4:** отправить владельцу видео шести сцен (`SendUserFile`), ждать «да»; только после него — пуш.
