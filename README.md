# POLSKI GO 🦫🇵🇱

**Вивчай польську. Подорожуй. Перемагай!**

Telegram Mini App — образовательная игра для изучения польского языка (A0 → B2).
Пользователь путешествует по иллюстрированной карте Польши вместе с бобром Бобеком,
проходит уроки, квесты и экзамены городов, собирает сувениры и одевает персонажа.

| | |
|---|---|
| Mini App | React 18 · TypeScript · Vite · Tailwind CSS 4 · Framer Motion · Telegram Mini Apps SDK |
| Backend | Cloudflare Workers · Hono · Drizzle ORM · Cloudflare D1 (SQLite) · Zod |
| Админ-панель | отдельное React-приложение (`/admin/`) |
| AI | Anthropic Claude через серверный API (ключ только на сервере) |
| Платежи | Telegram Stars (подписка + разовые тарифы) |
| Хостинг | один бесплатный Cloudflare Worker: API + Mini App + админка, D1, Cron |
| Тесты | Vitest (модульные + интеграционные на локальной D1 через Miniflare), Playwright E2E |

Подробности: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · Статус этапов: [docs/STATUS.md](docs/STATUS.md)

## Структура

```
packages/shared   общая игровая логика: проверка ответов, SM-2, XP/уровни, серии, даты
apps/server       Worker (Hono API), схема Drizzle и миграции D1, учебный контент, seed, тесты
apps/web          Telegram Mini App (игра)
apps/admin        веб-панель администратора
scripts/          сборка для Cloudflare, E2E-сценарий в браузере
wrangler.jsonc    конфигурация Cloudflare Worker
docs/             архитектура и статус
```

## Быстрый старт (локально)

Требуется только Node.js ≥ 20 — база D1 и Worker запускаются локально через `wrangler`.

```bash
npm install
cp apps/server/.dev.vars.example .dev.vars        # локальные переменные Worker
npm run db:local                                  # миграции + контент в локальную D1
npm run dev                                       # Worker :8787, Mini App :5173, админка :5174/admin/
```

* Mini App в браузере: <http://localhost:5173> — вне Telegram работает dev-вход
  (`DEV_AUTH=true`, в production всегда выключен). Другой тестовый пользователь: `?devUser=123`.
* Админка: <http://localhost:5174/admin/> — первый вход по `ADMIN_EMAIL` / `ADMIN_PASSWORD` создаёт суперадмина.

## Тесты

```bash
npm test          # shared (12) + server (36): авторизация, уроки, анти-накрутка, квесты,
                  # магазин, Stars-платежи, админка, валидность всего контента
npm run e2e       # браузерный сценарий (нужен запущенный npm run dev)
npm run typecheck
```

Серверные тесты поднимают для каждого файла свою локальную D1 (Miniflare — тот же движок, что в Cloudflare).

## Деплой на Cloudflare (бесплатно)

Всё приложение — **один Cloudflare Worker** на бесплатном плане:
API (`/api`), webhook бота (`/telegram/webhook`), Mini App (`/`), админка (`/admin/`),
база **D1** (в ней же файлы, загруженные в админке, до 1,9 МБ), напоминания по **Cron** каждые 15 минут.
База создаётся автоматически при первом деплое.

### 1. Подключить репозиторий

Cloudflare → **Workers & Pages → Create → Import a repository** → выбрать репозиторий.

| Настройка | Значение |
|---|---|
| Project name | `polskie-go` (должно совпадать с `name` в `wrangler.jsonc`) |
| Root directory | *(пусто — корень репозитория)* |
| Build command | `npm run build:cf` |
| Deploy command | `npm run deploy:cf` |
| Production branch | ветка с этим кодом |

Деплой-команда выкладывает Worker, применяет миграции D1 и добавляет недостающий учебный контент
(существующие правки из админки не перезаписываются). Каждый push запускает сборку заново.

### 2. Секреты Worker

Worker `polskie-go` → **Settings → Variables and Secrets** (тип *Secret*):

| Имя | Значение |
|---|---|
| `TELEGRAM_BOT_TOKEN` | токен от @BotFather |
| `TELEGRAM_BOT_USERNAME` | имя бота без @ |
| `TELEGRAM_APP_SHORT_NAME` | короткое имя Mini App из `/newapp` (например `app`) |
| `TELEGRAM_WEBHOOK_SECRET` | случайная строка |
| `SESSION_SECRET` | случайная строка ≥ 32 символов |
| `WEB_APP_URL` | `https://polskie-go.<аккаунт>.workers.dev` (или свой домен) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | первый вход в `/admin/` |
| `ANTHROPIC_API_KEY` | необязательно; без ключа AI честно работает в ограниченном режиме |

Проверка: `https://polskie-go.<аккаунт>.workers.dev/api/health` → `{"ok":true}`.

### 3. Бот

Подробно (команды, картинки, напоминания, проверка после деплоя) — [`docs/TELEGRAM_BOT.md`](docs/TELEGRAM_BOT.md).

1. В [@BotFather](https://t.me/BotFather): `/newapp` → URL `https://polskie-go.<аккаунт>.workers.dev`.
2. После деплоя один раз (токен и адреса — из окружения или `.env`, в вывод не попадают):
   `WEB_APP_URL=https://polskie-go.<аккаунт>.workers.dev TELEGRAM_BOT_TOKEN=… npm run bot:setup -w @polski-go/server`
   — регистрирует девять команд (ru + uk/pl/en) и кнопку меню Mini App. Описание бота, Description Picture, токен и webhook не меняются.
   `--dry-run` показывает вызовы без сети.
3. Webhook нужен один раз (бот, Stars, `/start`): добавить флаг `--webhook` и переменные `PUBLIC_URL`, `TELEGRAM_WEBHOOK_SECRET`
   (`allowed_updates=["message","pre_checkout_query"]`, ожидающие обновления не сбрасываются).
   Без компьютера: откройте `https://polskie-go.<аккаунт>.workers.dev/telegram/setup?key=<TELEGRAM_WEBHOOK_SECRET>` — Worker сам поставит команды, кнопку меню и webhook токеном из Cloudflare и покажет подсказки; `&mode=check` только проверяет.
4. **Telegram Stars**: отдельных ключей не нужно — оплата в валюте `XTR`, цены тарифов — в админке.
5. Картинки команд — `apps/web/public/bot/commands/*.jpg`, публикуются вместе с приложением. `WEB_APP_URL` — полный адрес с `https://` (без схемы или с `http://` сервер и `bot:setup` приведут его к `https://`).

### Лимиты бесплатного плана

* Worker: 100 000 запросов в сутки, 10 мс CPU на запрос (тяжёлые операции сгруппированы в пакеты D1).
* D1: 5 млн чтений и 100 000 записей в сутки, 5 ГБ. Хватает примерно на несколько сотен активных учеников в день;
  дальше — Workers Paid ($5/мес) без изменений в коде.
* Резервные копии: встроенный Time Travel D1 (восстановление на любую минуту за 30 дней).

### Если Mini App остаётся на Cloudflare Pages

Можно оставить старый проект Pages для фронтенда: переменная `VITE_API_URL` = адрес Worker,
а в секретах Worker — `CORS_ORIGINS` = адрес Pages. Но проще открывать Mini App прямо с Worker.

### Озвучка

Сейчас используется синтез речи устройства (Web Speech API). Для стабильного звука загрузите
аудиофайлы к словам и упражнениям в админке (поля «Аудио»).

## Лицензии и ассеты

Маскот, карта и иллюстрации — оригинальные векторные рисунки этого проекта. Эмодзи используются как
временные иконки предметов и легко заменяются изображениями через админку.
