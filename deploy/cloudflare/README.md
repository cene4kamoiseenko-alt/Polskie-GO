# Деплой API на Cloudflare

Фронтенд живёт на **Cloudflare Pages**, API — в **Cloudflare Containers** (Worker + контейнер
из корневого `Dockerfile`). Базу данных Cloudflare не предоставляет — нужен внешний PostgreSQL,
например бесплатный [Neon](https://neon.tech).

> Containers требуют платного плана **Workers Paid** ($5/мес).

## 1. База данных (Neon)
1. Создать проект в Neon (регион — Frankfurt).
2. Скопировать строку подключения **без пулинга** (Direct connection), с `?sslmode=require`.

## 2. Секреты в GitHub
Settings → Secrets and variables → Actions:
- `CLOUDFLARE_API_TOKEN` — токен с шаблоном «Edit Cloudflare Workers» (+ права Containers);
- `CLOUDFLARE_ACCOUNT_ID` — ID аккаунта (справа на главной панели Cloudflare).

## 3. Первый деплой
Actions → **Deploy API (Cloudflare)** → Run workflow. Появится Worker `polski-go-api`
с адресом `https://polski-go-api.<аккаунт>.workers.dev`.

## 4. Переменные Worker
Workers & Pages → polski-go-api → Settings → Variables and Secrets (тип **Secret**):

| Имя | Значение |
| --- | --- |
| `DATABASE_URL` | строка из Neon |
| `SESSION_SECRET` | случайная строка ≥ 32 символов |
| `TELEGRAM_BOT_TOKEN` | токен от @BotFather |
| `TELEGRAM_BOT_USERNAME` | имя бота без @ |
| `TELEGRAM_WEBHOOK_SECRET` | случайная строка |
| `WEB_APP_URL` | адрес Pages, напр. `https://polskie-go.pages.dev` |
| `CORS_ORIGINS` | тот же адрес Pages |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | вход в админку `/admin` |
| `ANTHROPIC_API_KEY` | необязательно; без него AI отвечает шаблонами |

После сохранения запустить workflow ещё раз (контейнер получит переменные при старте).
Проверка: `https://polski-go-api.<аккаунт>.workers.dev/api/health` → `{"ok":true}`.

## 5. Pages
Pages → проект → Settings → Variables: `VITE_API_URL = https://polski-go-api.<аккаунт>.workers.dev`,
затем Retry deployment.

## 6. Бот
В @BotFather: `/newapp` (или Bot Settings → Menu Button) → URL Pages.
Webhook: открыть в браузере
`https://api.telegram.org/bot<ТОКЕН>/setWebhook?url=https://polski-go-api.<аккаунт>.workers.dev/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>`

## Особенности
- Контейнер засыпает после 30 мин без запросов; первый запрос после сна — ~10–20 с.
- Файлы, загруженные через админку, хранятся в контейнере и пропадают при перезапуске.
