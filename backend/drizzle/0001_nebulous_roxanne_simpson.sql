CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`username` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_idx` UNIQUE(`username`)
);
