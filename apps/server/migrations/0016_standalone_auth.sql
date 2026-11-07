CREATE TABLE `device_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`key_hash` text NOT NULL,
	`platform` text DEFAULT 'web' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`last_used_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `device_credentials_key_hash_unique` ON `device_credentials` (`key_hash`);--> statement-breakpoint
CREATE INDEX `device_credentials_user_idx` ON `device_credentials` (`user_id`);--> statement-breakpoint
CREATE TABLE `link_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`code_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `link_codes_code_hash_unique` ON `link_codes` (`code_hash`);--> statement-breakpoint
CREATE INDEX `link_codes_user_idx` ON `link_codes` (`user_id`,`expires_at`);