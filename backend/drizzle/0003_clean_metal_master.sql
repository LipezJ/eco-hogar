ALTER TABLE `accounts` ADD `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `bills` ADD `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `cdts` ADD `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `debts` ADD `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `monthly_budgets` ADD `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `movements` ADD `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `email` varchar(191) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_idx` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bills` ADD CONSTRAINT `bills_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cdts` ADD CONSTRAINT `cdts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `debts` ADD CONSTRAINT `debts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `monthly_budgets` ADD CONSTRAINT `monthly_budgets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movements` ADD CONSTRAINT `movements_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;