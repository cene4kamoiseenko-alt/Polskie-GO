CREATE TABLE `error_log` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`kind` text NOT NULL,
	`message` text NOT NULL,
	`detail` text,
	`path` text,
	`release` text,
	`count` integer DEFAULT 1 NOT NULL,
	`first_at` integer NOT NULL,
	`last_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `error_log_day_idx` ON `error_log` (`day`,`last_at`);