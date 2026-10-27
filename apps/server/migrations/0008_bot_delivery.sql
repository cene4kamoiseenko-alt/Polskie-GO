CREATE TABLE `telegram_updates` (
	`update_id` integer PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `notification_log` ADD `status` text DEFAULT 'LEGACY' NOT NULL;--> statement-breakpoint
ALTER TABLE `notification_log` ADD `template` text;--> statement-breakpoint
ALTER TABLE `notification_log` ADD `lang` text;--> statement-breakpoint
ALTER TABLE `notification_log` ADD `method` text;--> statement-breakpoint
ALTER TABLE `notification_log` ADD `attempts` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `notification_log` ADD `lease_until` integer;--> statement-breakpoint
ALTER TABLE `notification_log` ADD `next_attempt_at` integer;--> statement-breakpoint
ALTER TABLE `notification_log` ADD `sent_at` integer;--> statement-breakpoint
ALTER TABLE `notification_log` ADD `telegram_message_id` integer;--> statement-breakpoint
ALTER TABLE `notification_log` ADD `error` text;--> statement-breakpoint
ALTER TABLE `notification_log` ADD `updated_at` integer;--> statement-breakpoint
CREATE INDEX `notification_log_status_idx` ON `notification_log` (`status`,`next_attempt_at`);