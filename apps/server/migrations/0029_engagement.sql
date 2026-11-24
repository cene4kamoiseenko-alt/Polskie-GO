CREATE TABLE `engage_people` (
	`telegram_id` integer PRIMARY KEY NOT NULL,
	`opted_out_at` integer,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `engage_sends` (
	`day` text NOT NULL,
	`telegram_id` integer NOT NULL,
	`user_id` text,
	`kind` text NOT NULL,
	`variant` text,
	`lang` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`lease_until` integer,
	`sent_at` integer,
	`opened_at` integer,
	`error` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`day`, `telegram_id`)
);
--> statement-breakpoint
CREATE INDEX `engage_sends_tg_idx` ON `engage_sends` (`telegram_id`,`day`);--> statement-breakpoint
CREATE INDEX `engage_sends_kind_day_idx` ON `engage_sends` (`kind`,`day`);--> statement-breakpoint
CREATE TABLE `user_flags` (
	`user_id` text NOT NULL,
	`key` text NOT NULL,
	`at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `key`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
