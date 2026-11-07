# POLSKI GO — как работать с репозиторием

Telegram Mini App и Android-приложение для изучения польского. Один код, две оболочки: Telegram и обычный веб/Google Play (см. `docs/ANDROID_RU.md`).

## Ветки и выкладка

- Рабочая ветка — `claude/polski-go-telegram-app-r8helf`. Cloudflare Workers Builds собирает её и выкладывает в production (`npm run deploy:cf`: закладка базы → миграции → `wrangler deploy` → seed).
  Любой пуш в эту ветку — выкладка, поэтому перед пушем: `npm run typecheck`, `npm test`, `node --import tsx scripts/content-lint.ts`.
- В `main` напрямую не пушим. Pull request — по запросу владельца.
- История не переписывается: без `git reset --hard`, `git clean -fd` и force push.

## Проверки

| Что | Команда |
|---|---|
| Типы | `npm run typecheck` |
| Модульные и интеграционные тесты (локальная D1) | `npm test` |
| Контент (польский, переводы, структура заданий) | `node --import tsx scripts/content-lint.ts` |
| Сквозные сценарии в браузере (Chromium) | `npm run e2e` (идёт долго: запускать отдельно, файлы в это время не менять) |
| Доступность | `npm run a11y` |
| Скриншоты 320–430 px | `npm run screens` |
| Бюджет скорости (JS, картинки) | `npm run perf` |
| Политика безопасности (CSP) | `node --import tsx scripts/csp-check.ts` |
| Нагрузка (500 игроков) | `npm run load:test` — `docs/LOAD_TEST_RU.md` |

Тяжёлые прогоны (e2e, screens, a11y, perf) запускаются по одному. «Тесты зелёные» — только после реального запуска; «проверено на iPhone/Android» — только на настоящем устройстве.

## Жёсткие правила

- Миграции базы только вперёд и неразрушающие. На production seed не перезаписывает строки (`ON CONFLICT DO NOTHING`): правки существующих данных — охраняемыми `UPDATE` в `apps/server/src/content/seed.ts`.
- Dev-вход (`/api/auth/dev`) в production не попадает.
- Секреты и токены не печатаются, не попадают в отчёты и репозиторий.
- Реальные платежи и публикация в магазины приложений — только по согласованию с владельцем.
- Генерация озвучки платная и идёт только из админки (`AUDIO_GENERATION_MODE=admin_only`); кнопка динамика отдаёт только готовые файлы — `docs/AUDIO_LIBRARY_RU.md`.

## Документы

- `PROJECT_PROGRESS.md` — журнал этапов; `docs/HANDOFF.md` — карта проекта: что сделано, что в работе, что открыто.
- `docs/ARCHITECTURE_DECISIONS.md` — принятые решения; `docs/RELEASE_CHECKLIST.md` — что осталось до запуска; `docs/QA_RESULTS.md` — результаты проверок.
- `docs/OPERATIONS_RU.md` — защита, резервные копии, откат; `docs/ANDROID_RU.md` — Google Play.
- После крупного этапа обновляются `PROJECT_PROGRESS.md`, `docs/HANDOFF.md` и чек-лист релиза.
