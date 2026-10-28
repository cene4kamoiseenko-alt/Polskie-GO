CREATE TABLE `bot_contacts` (
	`telegram_id` integer PRIMARY KEY NOT NULL,
	`first_name` text DEFAULT '' NOT NULL,
	`last_name` text,
	`username` text,
	`language_code` text,
	`start_param` text,
	`last_command` text,
	`first_seen_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL,
	`blocked_at` integer
);
--> statement-breakpoint
CREATE INDEX `bot_contacts_first_seen_idx` ON `bot_contacts` (`first_seen_at`);--> statement-breakpoint
-- Перенос: кто уже пользовался /quiz (bot_quiz_players), тот писал боту; имя берём из users, если человек открывал Mini App.
INSERT INTO `bot_contacts` (`telegram_id`, `first_name`, `last_name`, `username`, `language_code`, `last_command`, `first_seen_at`, `last_seen_at`)
SELECT q.`telegram_id`, coalesce(u.`first_name`, ''), u.`last_name`, u.`username`, u.`language_code`, 'quiz', q.`created_at`, q.`updated_at`
FROM `bot_quiz_players` q LEFT JOIN `users` u ON u.`telegram_id` = q.`telegram_id`;
