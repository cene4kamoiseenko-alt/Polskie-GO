CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`metric` text NOT NULL,
	`threshold` integer NOT NULL,
	`zlotki_reward` integer DEFAULT 0 NOT NULL,
	`reward_item_id` text,
	`order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `achievements_slug_unique` ON `achievements` (`slug`);--> statement-breakpoint
CREATE TABLE `admin_audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_id` text,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text,
	`details` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`admin_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `admin_audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'EDITOR' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`last_login_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE `ai_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`mode` text DEFAULT 'chat' NOT NULL,
	`title` text,
	`messages` text DEFAULT '[]' NOT NULL,
	`tokens_in` integer DEFAULT 0 NOT NULL,
	`tokens_out` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_conv_user_updated_idx` ON `ai_conversations` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `ai_usage` (
	`user_id` text NOT NULL,
	`day` text NOT NULL,
	`requests` integer DEFAULT 0 NOT NULL,
	`tokens_in` integer DEFAULT 0 NOT NULL,
	`tokens_out` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `day`)
);
--> statement-breakpoint
CREATE TABLE `cities` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`order` integer NOT NULL,
	`name_pl` text NOT NULL,
	`name` text NOT NULL,
	`theme` text NOT NULL,
	`description` text NOT NULL,
	`cefr` text NOT NULL,
	`map_x` real NOT NULL,
	`map_y` real NOT NULL,
	`emoji` text DEFAULT '🏙️' NOT NULL,
	`color` text DEFAULT '#45C486' NOT NULL,
	`ticket_lessons` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cities_slug_unique` ON `cities` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `cities_order_unique` ON `cities` (`order`);--> statement-breakpoint
CREATE TABLE `city_routes` (
	`id` text PRIMARY KEY NOT NULL,
	`city_id` text NOT NULL,
	`slug` text NOT NULL,
	`order` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon` text DEFAULT '📘' NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `city_routes_slug_unique` ON `city_routes` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `city_routes_city_order` ON `city_routes` (`city_id`,`order`);--> statement-breakpoint
CREATE TABLE `cosmetic_items` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`slot` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`asset_key` text NOT NULL,
	`price` integer DEFAULT 0 NOT NULL,
	`rarity` text DEFAULT 'common' NOT NULL,
	`is_premium` integer DEFAULT false NOT NULL,
	`reward_only` integer DEFAULT false NOT NULL,
	`city_id` text,
	`is_active` integer DEFAULT true NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cosmetic_items_slug_unique` ON `cosmetic_items` (`slug`);--> statement-breakpoint
CREATE TABLE `daily_activity` (
	`user_id` text NOT NULL,
	`day` text NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`lessons` integer DEFAULT 0 NOT NULL,
	`exercises` integer DEFAULT 0 NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	`new_words` integer DEFAULT 0 NOT NULL,
	`reviews` integer DEFAULT 0 NOT NULL,
	`seconds` integer DEFAULT 0 NOT NULL,
	`practice_xp` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `day`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `exercise_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`session_id` text NOT NULL,
	`exercise_id` text,
	`item_key` text NOT NULL,
	`type` text NOT NULL,
	`skill` text NOT NULL,
	`answer` text NOT NULL,
	`is_correct` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `learning_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `attempts_user_created_idx` ON `exercise_attempts` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `attempts_user_correct_idx` ON `exercise_attempts` (`user_id`,`is_correct`);--> statement-breakpoint
CREATE INDEX `attempts_exercise_correct_idx` ON `exercise_attempts` (`exercise_id`,`is_correct`);--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`order` integer NOT NULL,
	`type` text NOT NULL,
	`skill` text NOT NULL,
	`data` text NOT NULL,
	`explanation` text,
	`audio_url` text,
	`image_url` text,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_lesson_order` ON `exercises` (`lesson_id`,`order`);--> statement-breakpoint
CREATE INDEX `exercises_skill_idx` ON `exercises` (`skill`);--> statement-breakpoint
CREATE TABLE `friendships` (
	`id` text PRIMARY KEY NOT NULL,
	`requester_id` text NOT NULL,
	`addressee_id` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`addressee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `friendships_pair` ON `friendships` (`requester_id`,`addressee_id`);--> statement-breakpoint
CREATE INDEX `friendships_addressee_idx` ON `friendships` (`addressee_id`);--> statement-breakpoint
CREATE TABLE `game_config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `game_wallets` (
	`user_id` text PRIMARY KEY NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "game_wallets_balance_non_negative" CHECK("game_wallets"."balance" >= 0)
);
--> statement-breakpoint
CREATE TABLE `language_skills` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`skill` text NOT NULL,
	`mastery` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `language_skills_user_skill` ON `language_skills` (`user_id`,`skill`);--> statement-breakpoint
CREATE TABLE `leaderboards` (
	`user_id` text NOT NULL,
	`period_key` text NOT NULL,
	`league` text DEFAULT 'bronze' NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `period_key`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `leaderboards_period_xp_idx` ON `leaderboards` (`period_key`,`xp`);--> statement-breakpoint
CREATE TABLE `learning_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text,
	`mode` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`items` text NOT NULL,
	`state` text DEFAULT '{}' NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`xp_awarded` integer DEFAULT 0 NOT NULL,
	`zlotki_awarded` integer DEFAULT 0 NOT NULL,
	`started_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`finished_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `sessions_user_started_idx` ON `learning_sessions` (`user_id`,`started_at`);--> statement-breakpoint
CREATE INDEX `sessions_user_lesson_idx` ON `learning_sessions` (`user_id`,`lesson_id`,`finished_at`);--> statement-breakpoint
CREATE TABLE `lesson_words` (
	`lesson_id` text NOT NULL,
	`entry_id` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`lesson_id`, `entry_id`),
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`entry_id`) REFERENCES `vocabulary_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`route_id` text,
	`slug` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`kind` text DEFAULT 'LESSON' NOT NULL,
	`title` text NOT NULL,
	`topic` text NOT NULL,
	`cefr` text DEFAULT 'A0' NOT NULL,
	`difficulty` integer DEFAULT 1 NOT NULL,
	`explanation` text NOT NULL,
	`examples` text DEFAULT '[]' NOT NULL,
	`is_premium` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`route_id`) REFERENCES `city_routes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lessons_slug_unique` ON `lessons` (`slug`);--> statement-breakpoint
CREATE INDEX `lessons_route_order_idx` ON `lessons` (`route_id`,`order`);--> statement-breakpoint
CREATE TABLE `notification_campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`sent_count` integer DEFAULT 0 NOT NULL,
	`cursor` text,
	`scheduled_at` integer,
	`sent_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notification_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`day` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notification_log_unique` ON `notification_log` (`user_id`,`kind`,`day`);--> statement-breakpoint
CREATE TABLE `payment_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`type` text NOT NULL,
	`plan_code` text,
	`amount` integer,
	`currency` text,
	`charge_id` text,
	`payload` text,
	`raw` text,
	`error` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_events_charge_id_unique` ON `payment_events` (`charge_id`);--> statement-breakpoint
CREATE INDEX `payment_events_user_idx` ON `payment_events` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `payment_events_type_idx` ON `payment_events` (`type`,`created_at`);--> statement-breakpoint
CREATE INDEX `payment_events_payload_idx` ON `payment_events` (`payload`);--> statement-breakpoint
CREATE TABLE `player_progress` (
	`user_id` text PRIMARY KEY NOT NULL,
	`xp_total` integer DEFAULT 0 NOT NULL,
	`player_level` integer DEFAULT 1 NOT NULL,
	`language_level` text DEFAULT 'A0' NOT NULL,
	`current_city_id` text,
	`streak_current` integer DEFAULT 0 NOT NULL,
	`streak_best` integer DEFAULT 0 NOT NULL,
	`last_active_day` text,
	`lessons_completed` integer DEFAULT 0 NOT NULL,
	`perfect_lessons` integer DEFAULT 0 NOT NULL,
	`words_learned` integer DEFAULT 0 NOT NULL,
	`exercises_correct` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`current_city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `player_progress_xp_idx` ON `player_progress` (`xp_total`);--> statement-breakpoint
CREATE TABLE `quest_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`quest_id` text NOT NULL,
	`order` integer NOT NULL,
	`data` text NOT NULL,
	FOREIGN KEY (`quest_id`) REFERENCES `quests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quest_steps_quest_order` ON `quest_steps` (`quest_id`,`order`);--> statement-breakpoint
CREATE TABLE `quests` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`metric` text NOT NULL,
	`target` integer DEFAULT 1 NOT NULL,
	`xp_reward` integer DEFAULT 0 NOT NULL,
	`zlotki_reward` integer DEFAULT 0 NOT NULL,
	`reward_item_id` text,
	`city_id` text,
	`icon` text DEFAULT '⭐' NOT NULL,
	`is_premium` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quests_slug_unique` ON `quests` (`slug`);--> statement-breakpoint
CREATE TABLE `review_schedule` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`ease` real DEFAULT 2.5 NOT NULL,
	`interval_days` integer DEFAULT 0 NOT NULL,
	`repetitions` integer DEFAULT 0 NOT NULL,
	`lapses` integer DEFAULT 0 NOT NULL,
	`due_at` integer NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `review_user_item` ON `review_schedule` (`user_id`,`item_type`,`item_id`);--> statement-breakpoint
CREATE INDEX `review_user_due_idx` ON `review_schedule` (`user_id`,`due_at`);--> statement-breakpoint
CREATE TABLE `subscription_plans` (
	`code` text PRIMARY KEY NOT NULL,
	`months` integer NOT NULL,
	`price_stars` integer NOT NULL,
	`recurring` integer DEFAULT false NOT NULL,
	`title` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_code` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`starts_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`is_recurring` integer DEFAULT false NOT NULL,
	`telegram_charge_id` text,
	`cancelled_at` integer,
	`granted_by_admin_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_telegram_charge_id_unique` ON `subscriptions` (`telegram_charge_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_user_expires_idx` ON `subscriptions` (`user_id`,`expires_at`);--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`user_id` text NOT NULL,
	`achievement_id` text NOT NULL,
	`unlocked_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`seen` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`user_id`, `achievement_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_cities` (
	`user_id` text NOT NULL,
	`city_id` text NOT NULL,
	`unlocked_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`completed_at` integer,
	`boss_passed_at` integer,
	`source` text DEFAULT 'journey' NOT NULL,
	PRIMARY KEY(`user_id`, `city_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_inventory` (
	`user_id` text NOT NULL,
	`item_id` text NOT NULL,
	`equipped` integer DEFAULT false NOT NULL,
	`source` text DEFAULT 'shop' NOT NULL,
	`acquired_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `item_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `cosmetic_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_lesson_progress` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`completions` integer DEFAULT 0 NOT NULL,
	`best_score` integer DEFAULT 0 NOT NULL,
	`stars` integer DEFAULT 0 NOT NULL,
	`first_completed_at` integer,
	`last_completed_at` integer,
	PRIMARY KEY(`user_id`, `lesson_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text,
	`bio` text,
	`beaver_name` text DEFAULT 'Bobek' NOT NULL,
	`self_level` text,
	`placement_level` text,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_quests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`quest_id` text NOT NULL,
	`period_key` text NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`state` text DEFAULT '{}' NOT NULL,
	`completed_at` integer,
	`claimed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`quest_id`) REFERENCES `quests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_quests_period` ON `user_quests` (`user_id`,`quest_id`,`period_key`);--> statement-breakpoint
CREATE INDEX `user_quests_user_period_idx` ON `user_quests` (`user_id`,`period_key`);--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`ui_language` text DEFAULT 'uk' NOT NULL,
	`theme` text DEFAULT 'auto' NOT NULL,
	`timezone` text DEFAULT 'Europe/Warsaw' NOT NULL,
	`learning_goal` text,
	`daily_goal_minutes` integer DEFAULT 10 NOT NULL,
	`reminder_hour` integer,
	`notifications_enabled` integer DEFAULT false NOT NULL,
	`sound_enabled` integer DEFAULT true NOT NULL,
	`reduced_motion` integer DEFAULT false NOT NULL,
	`public_profile` integer DEFAULT true NOT NULL,
	`show_in_leaderboard` integer DEFAULT true NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_vocabulary` (
	`user_id` text NOT NULL,
	`entry_id` text NOT NULL,
	`status` text DEFAULT 'NEW' NOT NULL,
	`favorite` integer DEFAULT false NOT NULL,
	`times_seen` integer DEFAULT 0 NOT NULL,
	`times_correct` integer DEFAULT 0 NOT NULL,
	`times_wrong` integer DEFAULT 0 NOT NULL,
	`added_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`last_seen_at` integer,
	PRIMARY KEY(`user_id`, `entry_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`entry_id`) REFERENCES `vocabulary_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_vocab_status_idx` ON `user_vocabulary` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`telegram_id` integer NOT NULL,
	`username` text,
	`first_name` text DEFAULT '' NOT NULL,
	`last_name` text,
	`photo_url` text,
	`language_code` text,
	`referral_code` text NOT NULL,
	`referred_by_id` text,
	`is_banned` integer DEFAULT false NOT NULL,
	`ban_reason` text,
	`onboarded_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`last_seen_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegram_id_unique` ON `users` (`telegram_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_referral_code_unique` ON `users` (`referral_code`);--> statement-breakpoint
CREATE INDEX `users_created_at_idx` ON `users` (`created_at`);--> statement-breakpoint
CREATE INDEX `users_last_seen_at_idx` ON `users` (`last_seen_at`);--> statement-breakpoint
CREATE TABLE `vocabulary_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`pl` text NOT NULL,
	`pos` text NOT NULL,
	`translations` text NOT NULL,
	`pronunciation` text,
	`forms` text DEFAULT '{}' NOT NULL,
	`examples` text DEFAULT '[]' NOT NULL,
	`cefr` text DEFAULT 'A0' NOT NULL,
	`topics` text DEFAULT '[]' NOT NULL,
	`emoji` text,
	`audio_url` text,
	`image_url` text,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vocab_pl_pos` ON `vocabulary_entries` (`pl`,`pos`);--> statement-breakpoint
CREATE INDEX `vocab_cefr_idx` ON `vocabulary_entries` (`cefr`);--> statement-breakpoint
CREATE TABLE `wallet_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` integer NOT NULL,
	`reason` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wallet_transactions_idempotency_key_unique` ON `wallet_transactions` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `wallet_tx_user_created_idx` ON `wallet_transactions` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `xp_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` integer NOT NULL,
	`reason` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`day` text NOT NULL,
	`week` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `xp_events_idempotency_key_unique` ON `xp_events` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `xp_events_user_day_idx` ON `xp_events` (`user_id`,`day`);--> statement-breakpoint
CREATE INDEX `xp_events_week_idx` ON `xp_events` (`week`);