-- Захисні тригери. Пакет запитів D1 атомарний: помилка будь-якого запиту відкочує весь пакет.
-- Оптимістичне блокування сесії: оновлення має збільшувати version рівно на 1.
CREATE TRIGGER `learning_sessions_version_guard` BEFORE UPDATE OF `version` ON `learning_sessions`
WHEN NEW.`version` <> OLD.`version` + 1
BEGIN
  SELECT RAISE(ABORT, 'conflict:session');
END;
--> statement-breakpoint
-- Нагороду за квест можна забрати лише один раз.
CREATE TRIGGER `user_quests_claim_guard` BEFORE UPDATE OF `status` ON `user_quests`
WHEN OLD.`status` = 'CLAIMED'
BEGIN
  SELECT RAISE(ABORT, 'conflict:claimed');
END;
