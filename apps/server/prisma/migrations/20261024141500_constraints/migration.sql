-- Обмеження цілісності, які не виражаються в Prisma-схемі.
ALTER TABLE "game_wallets" ADD CONSTRAINT "game_wallets_balance_non_negative" CHECK ("balance" >= 0);
ALTER TABLE "player_progress" ADD CONSTRAINT "player_progress_xp_non_negative" CHECK ("xp_total" >= 0);
ALTER TABLE "cosmetic_items" ADD CONSTRAINT "cosmetic_items_price_non_negative" CHECK ("price" >= 0);
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_price_positive" CHECK ("price_stars" > 0 AND "months" > 0);
ALTER TABLE "language_skills" ADD CONSTRAINT "language_skills_mastery_range" CHECK ("mastery" BETWEEN 0 AND 100);
