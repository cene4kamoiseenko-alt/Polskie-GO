-- Кількість вправ уроку зберігається в lessons.exercise_count: getJourney більше не рахує GROUP BY
-- по всій таблиці exercises на кожен запит (на D1 це читання всіх рядків вправ щоразу).
ALTER TABLE `lessons` ADD `exercise_count` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
UPDATE `lessons` SET `exercise_count` = (SELECT count(*) FROM `exercises` WHERE `exercises`.`lesson_id` = `lessons`.`id`);
--> statement-breakpoint
-- Лічильник підтримують тригери: seed, адмінка, перенесення вправ між уроками (LESSON_MOVES) і будь-який SQL.
CREATE TRIGGER `exercises_count_insert` AFTER INSERT ON `exercises`
BEGIN
  UPDATE `lessons` SET `exercise_count` = `exercise_count` + 1 WHERE `id` = NEW.`lesson_id`;
END;
--> statement-breakpoint
CREATE TRIGGER `exercises_count_delete` AFTER DELETE ON `exercises`
BEGIN
  UPDATE `lessons` SET `exercise_count` = `exercise_count` - 1 WHERE `id` = OLD.`lesson_id`;
END;
--> statement-breakpoint
CREATE TRIGGER `exercises_count_move` AFTER UPDATE OF `lesson_id` ON `exercises`
WHEN OLD.`lesson_id` IS NOT NEW.`lesson_id`
BEGIN
  UPDATE `lessons` SET `exercise_count` = `exercise_count` - 1 WHERE `id` = OLD.`lesson_id`;
  UPDATE `lessons` SET `exercise_count` = `exercise_count` + 1 WHERE `id` = NEW.`lesson_id`;
END;
