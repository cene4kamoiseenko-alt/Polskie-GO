-- Заморозки серии, купленные за Złotki (2026-11-16): каждая закрывает один пропущенный день.
-- CHECK 0–2: покупка сверх запаса откатывается вместе со списанием Złotki (как CHECK баланса кошелька).
ALTER TABLE `player_progress` ADD `streak_freezes` integer DEFAULT 0 NOT NULL CHECK (`streak_freezes` BETWEEN 0 AND 2);
