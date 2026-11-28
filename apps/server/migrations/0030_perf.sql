CREATE TABLE `perf_samples` (
	`id` integer PRIMARY KEY NOT NULL,
	`at` integer NOT NULL,
	`kind` text NOT NULL,
	`route` text NOT NULL,
	`status` integer,
	`ms` integer NOT NULL,
	`d1_ms` integer,
	`d1_calls` integer
);
--> statement-breakpoint
CREATE INDEX `perf_samples_at_idx` ON `perf_samples` (`at`);