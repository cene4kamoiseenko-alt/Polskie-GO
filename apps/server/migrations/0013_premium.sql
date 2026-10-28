CREATE TABLE `support_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`telegram_id` integer NOT NULL,
	`user_id` text,
	`topic` text DEFAULT 'payment' NOT NULL,
	`text` text,
	`status` text DEFAULT 'AWAITING' NOT NULL,
	`reply` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `support_requests_tg_status_idx` ON `support_requests` (`telegram_id`,`status`);--> statement-breakpoint
CREATE INDEX `support_requests_status_idx` ON `support_requests` (`status`,`created_at`);--> statement-breakpoint
ALTER TABLE `player_progress` ADD `streak_shield_day` text;