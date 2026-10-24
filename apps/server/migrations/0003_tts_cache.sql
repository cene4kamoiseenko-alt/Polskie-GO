CREATE TABLE `tts_cache` (
	`key` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`voice` text NOT NULL,
	`rate` text NOT NULL,
	`mime` text NOT NULL,
	`data` blob NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
