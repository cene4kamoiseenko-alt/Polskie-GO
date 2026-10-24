CREATE TABLE `mission_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`mission_slug` text NOT NULL,
	`step` integer DEFAULT 0 NOT NULL,
	`mistakes` integer DEFAULT 0 NOT NULL,
	`hints` integer DEFAULT 0 NOT NULL,
	`step_failed` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`started_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`finished_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `mission_runs_user_idx` ON `mission_runs` (`user_id`,`mission_slug`,`status`);--> statement-breakpoint
CREATE TABLE `user_mission_steps` (
	`user_id` text NOT NULL,
	`step_key` text NOT NULL,
	`first_try` integer DEFAULT false NOT NULL,
	`solved_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `step_key`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_missions` (
	`user_id` text NOT NULL,
	`mission_slug` text NOT NULL,
	`completions` integer DEFAULT 0 NOT NULL,
	`flawless` integer DEFAULT 0 NOT NULL,
	`best_mistakes` integer DEFAULT 0 NOT NULL,
	`first_completed_at` integer,
	`last_completed_at` integer,
	PRIMARY KEY(`user_id`, `mission_slug`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
-- Оптимістичне блокування проходження місії (як у learning_sessions).
CREATE TRIGGER `mission_runs_version_guard` BEFORE UPDATE OF `version` ON `mission_runs`
WHEN NEW.`version` <> OLD.`version` + 1
BEGIN
  SELECT RAISE(ABORT, 'conflict:session');
END;
