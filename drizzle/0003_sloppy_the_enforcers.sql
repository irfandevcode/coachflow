CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int,
	`leadId` int,
	`event` varchar(100) NOT NULL,
	`source` varchar(180),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automation_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int,
	`leadId` int,
	`trigger` varchar(100) NOT NULL,
	`action` varchar(100) NOT NULL,
	`status` enum('queued','sent','skipped','failed') NOT NULL DEFAULT 'queued',
	`detail` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `automation_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`channel` enum('email','sms','whatsapp','marketing') NOT NULL,
	`granted` int NOT NULL DEFAULT 0,
	`source` varchar(180),
	`text` text,
	`optedOut` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`message` text NOT NULL,
	`intent` varchar(120),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `audit_records` ADD `aiAnalysis` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `currentFunnel` varchar(160);--> statement-breakpoint
ALTER TABLE `contacts` ADD `currentBookingSystem` varchar(160);--> statement-breakpoint
ALTER TABLE `contacts` ADD `currentFollowUpSystem` varchar(160);--> statement-breakpoint
ALTER TABLE `contacts` ADD `leadScoreFactors` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `optOutStatus` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `contacts` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `leads` ADD `leadScoreFactors` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `sourceDetail` varchar(180);