CREATE TABLE `daily_quiz_people` (
	`telegram_id` integer PRIMARY KEY NOT NULL,
	`ignored` integer DEFAULT 0 NOT NULL,
	`last_sent_at` integer,
	`no_chat_at` integer,
	`streak` integer DEFAULT 0 NOT NULL,
	`streak_day` text,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_quiz_plan` (
	`day` text NOT NULL,
	`level` text NOT NULL,
	`question_id` text NOT NULL,
	`image` text NOT NULL,
	`skipped` integer DEFAULT false NOT NULL,
	`edited_by` text,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`day`, `level`)
);
--> statement-breakpoint
CREATE TABLE `daily_quiz_questions` (
	`question_id` text PRIMARY KEY NOT NULL,
	`disabled` integer DEFAULT false NOT NULL,
	`updated_by` text,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_quiz_sends` (
	`day` text NOT NULL,
	`telegram_id` integer NOT NULL,
	`user_id` text,
	`level` text NOT NULL,
	`lang` text NOT NULL,
	`question_id` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`round_id` text,
	`error` text,
	`lease_until` integer,
	`sent_at` integer,
	`answered_at` integer,
	`chosen` integer,
	`correct` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`day`, `telegram_id`)
);
--> statement-breakpoint
CREATE INDEX `daily_quiz_sends_level_idx` ON `daily_quiz_sends` (`day`,`level`,`status`);--> statement-breakpoint
CREATE INDEX `daily_quiz_sends_round_idx` ON `daily_quiz_sends` (`round_id`);--> statement-breakpoint
CREATE INDEX `daily_quiz_sends_tg_idx` ON `daily_quiz_sends` (`telegram_id`,`day`);