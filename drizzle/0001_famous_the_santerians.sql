CREATE TABLE `audit_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`website` varchar(500),
	`niche` varchar(180),
	`offer` text,
	`price` varchar(100),
	`monthlyLeads` varchar(100),
	`bookedCalls` varchar(100),
	`leadSource` varchar(100),
	`challenge` varchar(100),
	`overallScore` int NOT NULL,
	`categoryScores` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_submissions_id` PRIMARY KEY(`id`)
);
