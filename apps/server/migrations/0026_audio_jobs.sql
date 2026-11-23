-- Очередь озвучки (2026-11-23, services/audio-jobs.ts): задания админки озвучиваются на сервере частями — cron и tick страницы;
-- свёрнутое окно админки больше не останавливает генерацию. Только добавляет таблицы.
CREATE TABLE `audio_job_items` (
	`job_id` text NOT NULL,
	`unit_id` text NOT NULL,
	`text` text NOT NULL,
	`model` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`result` text,
	`error` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`claimed_at` integer,
	PRIMARY KEY(`job_id`, `unit_id`),
	FOREIGN KEY (`job_id`) REFERENCES `audio_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `audio_job_items_status_idx` ON `audio_job_items` (`job_id`,`status`);--> statement-breakpoint
CREATE TABLE `audio_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`stop_reason` text,
	`max_credits` real NOT NULL,
	`spent` real DEFAULT 0 NOT NULL,
	`rates` text,
	`allow_other_voice` integer DEFAULT false NOT NULL,
	`total` integer NOT NULL,
	`last_error` text,
	`created_by` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`finished_at` integer
);
--> statement-breakpoint
CREATE INDEX `audio_jobs_status_idx` ON `audio_jobs` (`status`,`created_at`);