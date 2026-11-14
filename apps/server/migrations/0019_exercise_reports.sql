CREATE TABLE `exercise_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`target` text NOT NULL,
	`source` text NOT NULL,
	`exercise_id` text,
	`lesson_slug` text,
	`item_type` text,
	`reason` text NOT NULL,
	`comment` text,
	`answer` text,
	`snapshot` text,
	`ui_lang` text,
	`status` text DEFAULT 'NEW' NOT NULL,
	`admin_note` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_at` integer,
	`resolved_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_reports_user_target_uq` ON `exercise_reports` (`user_id`,`target`);--> statement-breakpoint
CREATE INDEX `exercise_reports_status_idx` ON `exercise_reports` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `exercise_reports_target_idx` ON `exercise_reports` (`target`);