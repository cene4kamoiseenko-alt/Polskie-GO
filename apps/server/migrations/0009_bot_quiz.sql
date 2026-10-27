CREATE TABLE `app_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bot_quiz_players` (
	`telegram_id` integer PRIMARY KEY NOT NULL,
	`push_enabled` integer DEFAULT true NOT NULL,
	`day` text,
	`day_count` integer DEFAULT 0 NOT NULL,
	`last_question_at` integer,
	`reward_day` text,
	`reward_count` integer DEFAULT 0 NOT NULL,
	`answered` integer DEFAULT 0 NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	`ignored_pushes` integer DEFAULT 0 NOT NULL,
	`recent` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bot_quiz_rounds` (
	`id` text PRIMARY KEY NOT NULL,
	`telegram_id` integer NOT NULL,
	`chat_id` integer NOT NULL,
	`message_id` integer,
	`question_id` text NOT NULL,
	`option_order` text NOT NULL,
	`lang` text NOT NULL,
	`source` text NOT NULL,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`has_photo` integer DEFAULT false NOT NULL,
	`chosen` integer,
	`correct` integer,
	`on_time` integer,
	`xp` integer DEFAULT 0 NOT NULL,
	`sent_at` integer NOT NULL,
	`answered_at` integer
);
--> statement-breakpoint
CREATE INDEX `bot_quiz_rounds_tg_idx` ON `bot_quiz_rounds` (`telegram_id`,`sent_at`);