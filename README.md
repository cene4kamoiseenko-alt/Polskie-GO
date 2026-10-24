# POLSKI GO 🦫🇵🇱

**Вивчай польську. Подорожуй. Перемагай!**

Telegram Mini App — образовательная игра для изучения польского языка (A0 → B2).
Пользователь путешествует по иллюстрированной карте Польши вместе с бобром Бобеком,
проходит уроки, квесты и экзамены городов, собирает сувениры и одевает персонажа.

| | |
|---|---|
| Mini App | React 18 · TypeScript · Vite · Tailwind CSS 4 · Framer Motion · Telegram Mini Apps SDK |
| Backend | Node.js 22 · Fastify 5 · Prisma 6 · PostgreSQL 16 · Zod |
| Админ-панель | отдельное React-приложение (`/admin/`) |
| AI | Anthropic Claude через серверный API (ключ только на сервере) |
| Платежи | Telegram Stars (подписка + разовые тарифы) |
| Тесты | Vitest (модульные + интеграционные на реальной PostgreSQL), Playwright E2E |

Подробности: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · Статус этапов: [docs/STATUS.md](docs/STATUS.md)

## Структура

```
packages/shared   общая игровая логика: проверка ответов, SM-2, XP/уровни, серии, даты
apps/server       Fastify API, Prisma-схема и миграции, учебный контент, seed, тесты
apps/web          Telegram Mini App (игра)
apps/admin        веб-панель администратора
scripts/e2e.cjs   E2E-сценарий в браузере
docs/             архитектура и статус
```

## Быстрый старт (локально)

Требуется Node.js ≥ 20 и PostgreSQL 16.

```bash
npm install
cp apps/server/.env.example apps/server/.env      # проверьте DATABASE_URL
createdb polskigo                                 # или через psql
npm run db:migrate                                # миграции
npm run db:seed                                   # контент A0–A1, тарифы, первый админ
npm run dev                                       # API :3000, Mini App :5173, админка :5174/admin/
```

* Mini App в браузере: <http://localhost:5173> — вне Telegram работает dev-вход
  (`DEV_AUTH=true`, в production всегда выключен). Другой тестовый пользователь: `?devUser=123`.
* Админка: <http://localhost:5174/admin/> — логин/пароль из `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Тесты

```bash
npm test          # shared (12) + server (35): авторизация, уроки, анти-накрутка, квесты,
                  # магазин, Stars-платежи, админка, валидность всего контента
npm run e2e       # браузерный сценарий (нужен запущенный npm run dev)
npm run typecheck
```

Серверные тесты создают отдельную временную схему в `TEST_DATABASE_URL` и удаляют её после прогона.

## Production

```bash
docker compose up -d --build     # PostgreSQL + приложение на :3000 (API + Mini App + /admin/)
```

Контейнер применяет миграции и добавляет отсутствующий контент при каждом старте.
Один сервер отдаёт `/api`, `/telegram/webhook`, Mini App (`/`) и админку (`/admin/`).

### Cloudflare Pages (только Mini App)

Pages хостит статику, поэтому на нём размещается только фронтенд. API (Fastify + PostgreSQL)
нужно запустить отдельно — Docker на любом VPS, Railway, Render, Fly.io и т. п.

| Настройка Pages | Значение |
|---|---|
| Build command | `npm run build:web` |
| Build output directory | `apps/web/dist` |
| Root directory | *(пусто — корень репозитория)* |
| Переменная `VITE_API_URL` | `https://api.ваш-домен` (адрес backend) |
| Переменная `NODE_VERSION` | `22` |

На backend добавьте домен Pages в `CORS_ORIGINS` и укажите его в `WEB_APP_URL`.

### Что нужно настроить владельцу

1. **Бот** в [@BotFather](https://t.me/BotFather): создать бота, получить токен; `/newapp` — создать Mini App
   с URL вашего домена (HTTPS) и коротким именем (например `app`).
2. **Переменные** в `apps/server/.env`:
   `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_APP_SHORT_NAME`,
   `TELEGRAM_WEBHOOK_SECRET` (случайная строка), `WEB_APP_URL`, `SESSION_SECRET` (≥ 32 символа),
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DEV_AUTH=false`, `NODE_ENV=production`.
3. **Webhook и меню бота**: `PUBLIC_URL=https://ваш-домен npm run bot:setup -w @polski-go/server`.
4. **Telegram Stars**: отдельных ключей не нужно — оплата в валюте `XTR`. Цены тарифов — в админке.
5. **AI-преподаватель**: `ANTHROPIC_API_KEY` (без ключа вкладка работает в честно помеченном ограниченном режиме),
   `AI_MONTHLY_OUTPUT_TOKENS` — месячный бюджет.
6. **Напоминания**: `JOBS_ENABLED=true` (отправляются только согласившимся, не чаще раза в день).
7. **Бэкапы**: `npm run db:backup -w @polski-go/server` по cron (pg_dump, хранится 14 копий).
8. **Озвучка**: сейчас используется синтез речи устройства (Web Speech API). Для стабильного звука
   загрузите аудиофайлы к словам и упражнениям в админке (поля «Аудио»).

## Лицензии и ассеты

Маскот, карта и иллюстрации — оригинальные векторные рисунки этого проекта. Эмодзи используются как
временные иконки предметов и легко заменяются изображениями через админку.
