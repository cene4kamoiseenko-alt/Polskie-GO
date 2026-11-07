CREATE TABLE `player_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text NOT NULL,
	`reported_id` text NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`resolved_at` integer,
	FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reported_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `player_reports_pair_uq` ON `player_reports` (`reporter_id`,`reported_id`);--> statement-breakpoint
CREATE INDEX `player_reports_status_idx` ON `player_reports` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `player_reports_reported_idx` ON `player_reports` (`reported_id`);