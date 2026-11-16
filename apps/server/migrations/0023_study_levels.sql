-- Свой уровень на общей дороге (2026-11-16, docs/superpowers/specs/2026-11-16-levels-design.md):
-- уровень задания (NULL — обычная версия урока; A2/B1/B2 — трудные версии с порядком 100+/200+/300+; во входном тесте — блок A0…B2),
-- уровень заданий игрока и счётчики автоподстройки.
ALTER TABLE `exercises` ADD `level` text CHECK (`level` IN ('A0', 'A1', 'A2', 'B1', 'B2'));--> statement-breakpoint
ALTER TABLE `player_progress` ADD `study_level` text CHECK (`study_level` IN ('A2', 'B1', 'B2'));--> statement-breakpoint
ALTER TABLE `player_progress` ADD `level_up_run` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `player_progress` ADD `level_down_run` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- Счётчик заданий урока — только обычная версия (порядок < 100): трудные версии не увеличивают «N заданий» на карточке урока.
DROP TRIGGER IF EXISTS `exercises_count_insert`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `exercises_count_delete`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `exercises_count_move`;--> statement-breakpoint
CREATE TRIGGER `exercises_count_insert` AFTER INSERT ON `exercises`
WHEN NEW.`order` < 100
BEGIN
  UPDATE `lessons` SET `exercise_count` = `exercise_count` + 1 WHERE `id` = NEW.`lesson_id`;
END;--> statement-breakpoint
CREATE TRIGGER `exercises_count_delete` AFTER DELETE ON `exercises`
WHEN OLD.`order` < 100
BEGIN
  UPDATE `lessons` SET `exercise_count` = `exercise_count` - 1 WHERE `id` = OLD.`lesson_id`;
END;--> statement-breakpoint
CREATE TRIGGER `exercises_count_move` AFTER UPDATE OF `lesson_id` ON `exercises`
WHEN OLD.`lesson_id` IS NOT NEW.`lesson_id` AND OLD.`order` < 100
BEGIN
  UPDATE `lessons` SET `exercise_count` = `exercise_count` - 1 WHERE `id` = OLD.`lesson_id`;
  UPDATE `lessons` SET `exercise_count` = `exercise_count` + 1 WHERE `id` = NEW.`lesson_id`;
END;--> statement-breakpoint
UPDATE `lessons` SET `exercise_count` = (SELECT count(*) FROM `exercises` WHERE `exercises`.`lesson_id` = `lessons`.`id` AND `exercises`.`order` < 100);
