# POLSKI GO — инструкции для Claude

Telegram Mini App для изучения польского. Ветка работы: `claude/polski-go-telegram-app-r8helf`. В `main` не пушить.

## Агенты и модели

Профильные агенты лежат в `.claude/agents/`. Модель закреплена во frontmatter каждого файла.

| Роль | Файл | Модель | Когда |
|---|---|---|---|
| Архитектура | `architecture.md` | opus | сложные решения, миграции, права, ревью слоёв Бобека |
| UI/UX | `ui-ux.md` | sonnet | экраны, состояния, шторки, адаптивность |
| Персонаж и ассеты | `character-assets.md` | sonnet | модель Бобека, костюмы, галерея |
| Контент | `learning-content.md` | sonnet | уроки, словарь, города, аудит |
| Аудио | `audio.md` | sonnet | TTS, STT, микрофон |
| QA | `qa.md` | sonnet | тесты, e2e, a11y, perf |
| Релиз | `release.md` | sonnet | деплой, чек-лист, мобильный задел |

Правила распределения:
- Механические запуски (тесты, lint, сводка логов) — haiku через параметр `model` при вызове.
- Реализация — sonnet. Архитектурное ревью — opus.
- Один файл — один редактор. Два агента не правят один и тот же файл одновременно.
- Агенту передаются конкретные файлы, задача и критерии приёмки.
- Результат агента проверяет основной Claude: typecheck и затронутые тесты запускаются заново, прежде чем коммит.

## Жёсткие правила

- Не `git reset --hard`, не `clean -fd`, не force push, не разрушительные миграции БД.
- Не делать production release и реальные финансовые изменения без согласования.
- Dev auth endpoints не попадают в production.
- Секреты и токены не печатаются и не попадают в отчёты.
- «Тесты зелёные» — только после реального запуска. «Проверено на iPhone» — только при реальном устройстве.
- Коммит трейлеры: без названия модели; `Claude-Session: https://claude.ai/code/session_01MYj5TYMaPVSc6Nr7wPtBLo`.
- PR не создавать без запроса.

## Проверки

- `npm run typecheck`, `npm test` (отдельно), `node --import tsx scripts/content-lint.ts` (отчёт), `npm run e2e` (в фоне, отдельно).
- Документы: `PROJECT_PROGRESS.md`, `docs/CLAUDE_HANDOFF.md`, `docs/ARCHITECTURE_DECISIONS.md`, `docs/CONTENT_AUDIT_RU.md`, `docs/QA_RESULTS.md`, `docs/RELEASE_CHECKLIST.md`.
