CREATE TABLE `audio_assets` (
	`key` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL,
	`text` text NOT NULL,
	`voice_id` text NOT NULL,
	`model_id` text NOT NULL,
	`settings` text NOT NULL,
	`version` text NOT NULL,
	`object_key` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`chars` integer DEFAULT 0 NOT NULL,
	`credits` real DEFAULT 0 NOT NULL,
	`bytes` integer,
	`source` text,
	`request_id` text,
	`error` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`locked_until` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audio_assets_unit_idx` ON `audio_assets` (`unit_id`);--> statement-breakpoint
CREATE INDEX `audio_assets_status_idx` ON `audio_assets` (`voice_id`,`status`);--> statement-breakpoint
CREATE TABLE `audio_misses` (
	`unit_id` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`last_at` integer NOT NULL
);
