-- Подписка на канал @polskigoo (2026-11-23, docs/superpowers/specs/2026-11-23-channel-mission-design.md): когда бот подтвердил подписку.
-- Открывает миссию канала «Тайна Твардовского» навсегда; NULL — ещё не подтверждена.
ALTER TABLE `users` ADD `channel_joined_at` integer;
