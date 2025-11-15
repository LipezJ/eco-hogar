CREATE TABLE `monthly_budgets` (
	`id` varchar(36) NOT NULL,
	`year` int NOT NULL,
	`month` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'COP',
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `monthly_budgets_id` PRIMARY KEY(`id`),
	CONSTRAINT `monthly_budgets_year_month_idx` UNIQUE(`year`,`month`)
);
