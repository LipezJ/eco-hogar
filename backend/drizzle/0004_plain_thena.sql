CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('info','warning','alert') NOT NULL DEFAULT 'info',
	`status` enum('unread','read') NOT NULL DEFAULT 'unread',
	`resource_type` varchar(100),
	`resource_id` varchar(36),
	`event_type` varchar(100),
	`created_at` datetime NOT NULL,
	`read_at` datetime,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `monthly_budgets` DROP INDEX `monthly_budgets_year_month_idx`;--> statement-breakpoint
ALTER TABLE `movements` MODIFY COLUMN `category` enum('comida','transporte','servicios','ocio','salud','educacion','vivienda','otros') NOT NULL;--> statement-breakpoint
ALTER TABLE `monthly_budgets` ADD CONSTRAINT `monthly_budgets_year_month_idx` UNIQUE(`user_id`,`year`,`month`);--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `notifications_user_resource_event_idx` ON `notifications` (`user_id`,`resource_id`,`event_type`);