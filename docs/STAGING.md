# Staging: отдельная сборка без доступа к production

Состояние на 2026-10-27. Staging — второй Cloudflare Worker `polskie-go-staging` с **собственной базой D1 `polski-go-staging`**, без cron и без боевого бота. Он собирается из того же кода и тех же `dist-cf`, поэтому в нём можно проверить сборку, миграции, seed, картинки бота и Mini App до того, как что-то уйдёт в production.

**Из этой среды Cloudflare недоступен: удалённый деплой не выполнялся.** Проверено локально (раздел 3). Что нужно сделать вам в Cloudflare — раздел 5.

## 1. Что отделено от production

| Ресурс | Production (`wrangler.jsonc`) | Staging (`wrangler.staging.jsonc`) |
|---|---|---|
| Worker | `polskie-go` | `polskie-go-staging` (`https://polskie-go-staging.<аккаунт>.workers.dev`) |
| База D1 | `polski-go` | `polski-go-staging` |
| Cron (самонастройка webhook, нагадування, приглашения) | каждые 15 минут | **нет** (`"triggers": {"crons": []}` задано явно) |
| `ENVIRONMENT` | `production` | `staging` |
| Секреты | в панели Worker `polskie-go` | свои, в панели Worker `polskie-go-staging`; секреты production в staging не попадают |
| Токен бота | боевой | **боевой токен игнорируется**: staging принимает токен только с id из `STAGING_BOT_ID` (отдельный тестовый бот) |
| Озвучка и распознавание | включены по настройкам | `TTS_PROVIDER=off`, `STT_PROVIDER=off` (платные сервисы). Ключ Google можно положить секретом: админка staging сравнивает голоса на слух, игроки staging озвучку не получают (`docs/GOOGLE_TTS_SETUP_RU.md`, шаг 6) |
| Вход без Telegram (`/api/auth/dev`) | всегда выключен | выключен; включается только явной переменной `DEV_AUTH=true` |
| CORS и `SESSION_SECRET` | строгие | такие же строгие (staging доступен из интернета) |

Файл `wrangler.jsonc` **не менялся**: боевой деплой (`npm run deploy:cf`, Workers Builds) идёт как раньше. Блок `env` в нём не добавлялся: wrangler начал бы предупреждать о «неявном окружении» при каждом production-деплое.

## 2. Что блокируется кодом и сторожем

Код (`apps/server/src/env.ts`, `lib/telegram.ts`, `app.ts`):

- При `ENVIRONMENT=staging` `TELEGRAM_BOT_TOKEN` считается заданным, только если часть токена до «:» равна `STAGING_BOT_ID`. Иначе токена «нет»: `botApi` бросает ошибку до сети (ни `setWebhook`, ни `sendMessage`, ни счета Stars), cron-задача ничего не шлёт, вход по `initData` боевого бота даёт `bot_token_missing`, платежи выключены.
- `SESSION_SECRET` в staging обязателен (≥ 32 знака), CORS — только `CORS_ORIGINS`.
- `/api/health` показывает `"environment"`: так видно, на какой сборке вы находитесь.

Сторож (`scripts/staging-guard.mjs`, команда `npm run staging:check`, она же первый шаг `npm run deploy:staging`) падает, если в `wrangler.staging.jsonc`: то же имя Worker или база, что у production; cron не пуст или не задан (он наследуется!); `ENVIRONMENT` не `staging`; в `vars` есть токены и ключи; не выключены TTS/STT; есть `routes`, `zone_id`, KV, R2, очереди и другие привязки, которые могли бы указывать на production; `main`, `compatibility_*` или `assets` отличаются от боевых. Он же проверяет, что каждая staging-команда в `package.json` зовёт wrangler с `-c wrangler.staging.jsonc` и базой `polski-go-staging`, а боевая `deploy:cf` не тронута.

Тесты: `apps/server/test/staging.test.ts` (23, в том числе проверка, что сторож ловит каждое нарушение, и что без защиты токена тесты падают).

**Чего код и сторож не могут:** остановить ручную команду wrangler. `wrangler d1 execute polski-go --remote …` всегда идёт в базу production, какой бы `-c` вы ни указали. Staging-команды используйте только через `npm run …:staging` / `staging:local`.

## 3. Что проверено в этой среде

- `wrangler deploy --dry-run -c wrangler.staging.jsonc`: привязки — `DB (polski-go-staging)`, `ASSETS`, `ENVIRONMENT=staging`, `TTS_PROVIDER=off`, `STT_PROVIDER=off`, ничего больше.
- Локальный запуск (`wrangler dev -c wrangler.staging.jsonc --local`, локальная база, миграции 0001–0009 и seed применены): `/api/health` → `"environment":"staging"`, миграция `0009_bot_quiz.sql`, `"bot":null`; `/api/auth/dev` без `DEV_AUTH` → 404; чужой `Origin` не получает CORS; корректно подписанный `initData` с токеном вне `STAGING_BOT_ID` → `401 bot_token_missing`, а с совпавшим `STAGING_BOT_ID` → 200.
- Повторная проверка 2026-10-27 (Opus, тот же код плюс миграция `0010_tts_spend.sql`). `npm run staging:check` прошёл. `wrangler deploy --dry-run -c wrangler.staging.jsonc` — те же пять привязок. Локальные `d1 migrations apply polski-go-staging --local -c wrangler.staging.jsonc` в отдельную папку применили 0000–0010, повторный запуск ответил «No migrations to apply». После них seed.

  `wrangler dev` с токеном не из `STAGING_BOT_ID`:

  - `/api/health` → `staging`, `0010_tts_spend.sql`, `"bot":null`;
  - `/api/auth/dev`: без `DEV_AUTH` → 404, с `DEV_AUTH=true` → 200, с `DEV_AUTH=true` и `ENVIRONMENT=production` → 404;
  - чужой `Origin` → без `Access-Control-Allow-Origin`;
  - `/api/tts` при `TTS_PROVIDER=off` → 503.

  Wrangler в этой среде не залогинен: удалённые команды физически невозможны. Сторож теперь также отказывает, если в боевом `wrangler.jsonc` появится `DEV_AUTH`.
- Не проверено: удалённый деплой, создание базы D1 в аккаунте, Workers Builds для второго Worker, Telegram на телефоне.

## 4. Локальный staging без Cloudflare

```
npm run staging:local      # сторож, сборка, локальная база в .wrangler/staging (миграции + seed), Worker на http://127.0.0.1:8788
```

Секреты для него — файл `.dev.vars` в корне (в git не попадает). Минимум:

```
SESSION_SECRET=<не короче 32 знаков>
DEV_AUTH=true
WEB_APP_URL=http://127.0.0.1:8788
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=<придумайте>
```

Не кладите в `.dev.vars` боевой `TELEGRAM_BOT_TOKEN`. Даже если он там окажется, staging его проигнорирует.

## 5. Что нужно сделать вам в Cloudflare

Все команды — в корне репозитория, после `npx wrangler login`.

**Важно про доступ.** Токен Cloudflare не ограничивается одним Worker: тот, кто залогинен в аккаунт с production, технически может задеть и production. От этого защищают сторож, отдельные имена и код выше, но **не** права. Полная изоляция (до уровня учётных данных) — только отдельный бесплатный аккаунт Cloudflare под staging. Если нужна именно такая гарантия, выполните шаги ниже в этом отдельном аккаунте.

1. **База.** `npx wrangler d1 create polski-go-staging` (или Dashboard → Storage & databases → D1 → Create, имя `polski-go-staging`). Боевой конфиг не содержит `database_id` — база создаётся и находится по имени; staging устроен так же. Если ваша версия wrangler потребует `database_id`, добавьте его в `d1_databases` файла `wrangler.staging.jsonc` (сторож проверит, что он не совпадает с боевым).
2. **Секреты staging** (каждый раз спросит значение): 
   ```
   npx wrangler secret put SESSION_SECRET -c wrangler.staging.jsonc     # openssl rand -hex 32
   npx wrangler secret put ADMIN_EMAIL -c wrangler.staging.jsonc
   npx wrangler secret put ADMIN_PASSWORD -c wrangler.staging.jsonc
   ```
   Команда `secret put` создаёт Worker `polskie-go-staging`, если его ещё нет (если спросит — подтвердите).
3. **Первый деплой.** `npm run deploy:staging`: сторож → сборка → миграции в `polski-go-staging` → Worker → seed.
4. **Переменные** (Dashboard → Workers & Pages → `polskie-go-staging` → Settings → Variables and Secrets; в конфиге стоит `keep_vars`, поэтому деплой их не стирает): `WEB_APP_URL` и `CORS_ORIGINS` = `https://polskie-go-staging.<аккаунт>.workers.dev`; для входа без Telegram — `DEV_AUTH` = `true`.
5. **Проверка.** `https://polskie-go-staging.<аккаунт>.workers.dev/api/health` → `"environment":"staging"`, `"migration":"0011_bot_contacts.sql"` (последняя миграция в репозитории), `"bot":null`. Картинки бота открываются прямо в браузере: `…/bot/scenes/ru/words.jpg` (полный кадр без размытых полос), `…/bot/commands/map.jpg`. Mini App: откройте адрес в браузере и войдите через `DEV_AUTH`.
6. **Telegram на staging (по желанию, только отдельным ботом).** В @BotFather создайте **второго** бота; его токен — секрет `TELEGRAM_BOT_TOKEN` staging, число до «:» — переменная `STAGING_BOT_ID`, имя — `TELEGRAM_BOT_USERNAME`; `/newapp` для этого бота ведёт на адрес staging. Webhook — админка `…/admin/` → «🤖 Бот» → «Настроить бота». Боевой токен в staging не кладите и `npm run bot:setup` с боевым токеном для staging не запускайте.

### Автодеплой (необязательно, не проверялся)

- **Workers Builds для второго Worker.** Документация Cloudflare из этой среды недоступна, поэтому как Workers Builds сверяет имя проекта с `name` в `wrangler.staging.jsonc` я проверить не мог. Пока это не подтверждено, деплойте staging командой `npm run deploy:staging` или workflow ниже.
- **Но настройку на production-проекте проверьте до первого пуша любой другой ветки:** Worker `polskie-go` → Settings → Build → Branch control → «Builds for non-production branches». Пока флажок включён, пуш в чужую ветку запускает сборку production-проекта (по умолчанию `npx wrangler versions upload`: версия загружается, но не выкатывается). Если вы не хотите даже загрузки версий, выключите его.
- **GitHub Actions:** `.github/workflows/staging.yml` — только ручной запуск (`workflow_dispatch`), нужно ввести `DEPLOY-STAGING`; секреты `CLOUDFLARE_API_TOKEN` и `CLOUDFLARE_ACCOUNT_ID` берутся из GitHub Environment `staging` (положите туда токен отдельного аккаунта). Файл не запускался. Он не срабатывает ни на push, ни на pull request.

## 6. Убрать staging

`npx wrangler delete -c wrangler.staging.jsonc` и `npx wrangler d1 delete polski-go-staging` (имя базы читайте внимательно: это команды удаления).

## 7. Чего staging не доказывает

Работу бота и Mini App в Telegram на iOS и Android; поведение боевой базы с реальными данными (для миграций — закладка Time Travel и копия данных, `RELEASE_REPORT.md`); производительность на телефоне; озвучку и распознавание (на staging они выключены).
