CREATE TABLE `tts_spend` (
	`day` text NOT NULL,
	`kind` text NOT NULL,
	`chars` integer DEFAULT 0 NOT NULL,
	`requests` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `kind`)
);
