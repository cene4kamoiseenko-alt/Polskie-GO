CREATE TABLE `league_awards` (
	`week` text NOT NULL,
	`user_id` text NOT NULL,
	`rank` integer NOT NULL,
	`xp` integer NOT NULL,
	`zlotki` integer NOT NULL,
	`created_at` integer NOT NULL,
	`notified_at` integer,
	`seen_at` integer,
	PRIMARY KEY(`week`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `league_awards_user_idx` ON `league_awards` (`user_id`,`seen_at`);--> statement-breakpoint
CREATE INDEX `league_awards_notify_idx` ON `league_awards` (`notified_at`);--> statement-breakpoint
CREATE TABLE `league_weeks` (
	`week` text PRIMARY KEY NOT NULL,
	`settled_at` integer NOT NULL,
	`players` integer DEFAULT 0 NOT NULL
);
