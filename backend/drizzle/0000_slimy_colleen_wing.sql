CREATE TABLE `accounts` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`institution` varchar(255) NOT NULL,
	`account_type` enum('ahorro','corriente','inversion','nomina','efectivo','otro') NOT NULL,
	`account_number` varchar(255),
	`currency` enum('ARS','USD','EUR','BRL','CLP','UYU','MXN','COP','PEN','otro') NOT NULL,
	`balance` decimal(15,2) NOT NULL,
	`is_national` boolean NOT NULL DEFAULT true,
	`owner` varchar(255) NOT NULL,
	`status` enum('activa','inactiva','bloqueada') NOT NULL DEFAULT 'activa',
	`description` text,
	`created_at` datetime NOT NULL,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bills` (
	`id` varchar(36) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`category` enum('electricidad','agua','gas','internet','telefono','cable','streaming','alquiler','condominio','seguro','otros') NOT NULL,
	`cycle` enum('mensual','bimestral','trimestral','semestral','anual') NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`due_date` datetime NOT NULL,
	`status` enum('pendiente','pagado','vencido') NOT NULL DEFAULT 'pendiente',
	`payment_date` datetime,
	`attachment` varchar(500),
	`description` text,
	`auto_renew` boolean DEFAULT false,
	`created_at` datetime NOT NULL,
	CONSTRAINT `bills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cdts` (
	`id` varchar(36) NOT NULL,
	`institution` varchar(255) NOT NULL,
	`opening_date` datetime NOT NULL,
	`initial_amount` decimal(15,2) NOT NULL,
	`interest_rate` decimal(5,2) NOT NULL,
	`term` int NOT NULL,
	`due_date` datetime NOT NULL,
	`final_amount` decimal(15,2) NOT NULL,
	`status` enum('activo','vencido','cancelado') NOT NULL DEFAULT 'activo',
	`auto_renew` boolean DEFAULT false,
	`description` text,
	`created_at` datetime NOT NULL,
	CONSTRAINT `cdts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debts` (
	`id` varchar(36) NOT NULL,
	`type` enum('deuda','prestamo') NOT NULL,
	`origin` varchar(255) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`interest_rate` decimal(5,2) NOT NULL,
	`installments` int NOT NULL,
	`start_date` datetime NOT NULL,
	`payment_day` int NOT NULL,
	`description` text,
	`created_at` datetime NOT NULL,
	CONSTRAINT `debts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `movements` (
	`id` varchar(36) NOT NULL,
	`type` enum('ingreso','egreso') NOT NULL,
	`category` enum('comida','transporte','servicios','ocio','salud','educaci�n','vivienda','otros') NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`description` varchar(500) NOT NULL,
	`tags` text,
	`attachment` varchar(500),
	`date` datetime NOT NULL,
	`created_at` datetime NOT NULL,
	CONSTRAINT `movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` varchar(36) NOT NULL,
	`debt_id` varchar(36) NOT NULL,
	`installment_number` int NOT NULL,
	`due_date` datetime NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`principal` decimal(15,2) NOT NULL,
	`interest` decimal(15,2) NOT NULL,
	`is_paid` boolean NOT NULL DEFAULT false,
	`paid_date` datetime,
	`created_at` datetime NOT NULL,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
