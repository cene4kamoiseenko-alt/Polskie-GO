-- Источники трафика (2026-11-23, services/traffic.ts): ссылки с метками и первое касание каждого человека.
-- Добавляет таблицы и заполняет первые касания из того, что уже есть: bot_contacts (первая метка /start) и users (вход в приложение).
CREATE TABLE `traffic_links` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`channel` text NOT NULL,
	`title` text NOT NULL,
	`note` text,
	`cost` real,
	`created_by` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`archived_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `traffic_links_code_unique` ON `traffic_links` (`code`);--> statement-breakpoint
CREATE TABLE `user_sources` (
	`telegram_id` integer PRIMARY KEY NOT NULL,
	`param` text,
	`via` text NOT NULL,
	`first_seen_at` integer NOT NULL,
	`param_at` integer
);
--> statement-breakpoint
CREATE INDEX `user_sources_first_seen_idx` ON `user_sources` (`first_seen_at`);--> statement-breakpoint
CREATE INDEX `user_sources_param_idx` ON `user_sources` (`param`);--> statement-breakpoint
INSERT OR IGNORE INTO `user_sources` (`telegram_id`, `param`, `via`, `first_seen_at`, `param_at`)
SELECT b.`telegram_id`, NULLIF(b.`start_param`, ''), 'bot', MIN(b.`first_seen_at`, COALESCE(u.`created_at`, b.`first_seen_at`)),
  CASE WHEN NULLIF(b.`start_param`, '') IS NULL THEN NULL ELSE b.`first_seen_at` END
FROM `bot_contacts` b LEFT JOIN `users` u ON u.`telegram_id` = b.`telegram_id`;--> statement-breakpoint
INSERT OR IGNORE INTO `user_sources` (`telegram_id`, `param`, `via`, `first_seen_at`)
SELECT `telegram_id`, NULL, CASE WHEN `telegram_id` < 0 THEN 'web' ELSE 'app' END, `created_at` FROM `users`;
