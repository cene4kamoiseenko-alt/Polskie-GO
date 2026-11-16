-- Теория трудных версий урока (2026-11-16, docs/LEVELS_RU.md): {A2|B1|B2: {explanation, examples}} — игрок своего уровня
-- видит перед заданиями то, что нового в теме на его уровне, а не теорию A0. Источник — код (content/levels), seed обновляет каждый раз.
ALTER TABLE `lessons` ADD `level_texts` text;
