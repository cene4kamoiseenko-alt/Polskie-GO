-- Польської мови інтерфейсу більше немає: застосунок учить польську, пояснення — рідною мовою учня.
-- Профілі з польською отримують мову за мовою Telegram — те саме правило, що uiLangFor у packages/shared:
-- ru / be / kk → російська, en → англійська, решта (зокрема pl) → українська. Інші профілі не змінюються; повтор нічого не робить.
UPDATE `user_settings` SET `ui_language` = coalesce((
  SELECT CASE
    WHEN lower(substr(u.`language_code`, 1, 2)) IN ('ru', 'be', 'kk') THEN 'ru'
    WHEN lower(substr(u.`language_code`, 1, 2)) = 'en' THEN 'en'
    ELSE 'uk'
  END
  FROM `users` u WHERE u.`id` = `user_settings`.`user_id`
), 'uk')
WHERE `ui_language` = 'pl';
