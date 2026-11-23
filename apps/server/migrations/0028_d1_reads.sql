-- Лимит чтения D1 (2026-11-23, письмо Cloudflare «D1 operations are nearing the daily cap»: 75 % из 5 млн строк к утру).
-- Индексы для очисток в cron (раньше каждая перебирала всю таблицу на каждом запуске): telegram_updates по дате (каждое обновление
-- Telegram хранится 3 дня — самая большая таблица), раунды викторины по времени, журнал действий по (вид, время). Индекс
-- user_settings.updated_at — отпечаток «настройки менялись?» для cron. Очередь озвучки — по (задание, статус, фраза) и счётчики
-- задания (раньше каждый шаг пересчитывал все фразы). Счётчики существующих заданий заполняются из фраз.
DROP INDEX `audio_job_items_status_idx`;--> statement-breakpoint
CREATE INDEX `audio_job_items_queue_idx` ON `audio_job_items` (`job_id`,`status`,`unit_id`);--> statement-breakpoint
ALTER TABLE `audio_jobs` ADD `done_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `audio_jobs` ADD `failed_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `audio_jobs` ADD `results` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
CREATE INDEX `audit_entity_created_idx` ON `admin_audit_logs` (`entity`,`created_at`);--> statement-breakpoint
CREATE INDEX `bot_quiz_rounds_sent_idx` ON `bot_quiz_rounds` (`sent_at`);--> statement-breakpoint
CREATE INDEX `telegram_updates_created_idx` ON `telegram_updates` (`created_at`);--> statement-breakpoint
CREATE INDEX `user_settings_updated_idx` ON `user_settings` (`updated_at`);--> statement-breakpoint
UPDATE `audio_jobs` SET
  `done_count` = (SELECT count(*) FROM `audio_job_items` i WHERE i.`job_id` = `audio_jobs`.`id` AND i.`status` = 'done'),
  `failed_count` = (SELECT count(*) FROM `audio_job_items` i WHERE i.`job_id` = `audio_jobs`.`id` AND i.`status` = 'failed'),
  `results` = COALESCE((SELECT json_group_object(r, n) FROM (SELECT i.`result` AS r, count(*) AS n FROM `audio_job_items` i WHERE i.`job_id` = `audio_jobs`.`id` AND i.`result` IS NOT NULL GROUP BY i.`result`)), '{}');
