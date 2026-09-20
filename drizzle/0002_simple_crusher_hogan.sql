CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`provider` varchar(60) NOT NULL DEFAULT 'manual',
	`eventType` varchar(160),
	`startAt` timestamp,
	`endAt` timestamp,
	`timezone` varchar(80),
	`status` enum('requested','booked','cancelled','rescheduled','showed','no_show') NOT NULL DEFAULT 'requested',
	`calendarEventId` varchar(200),
	`meetingLink` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`overallScore` int NOT NULL,
	`categoryScores` text NOT NULL,
	`biggestOpportunity` text,
	`recommendations` text,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`trigger` varchar(80) NOT NULL,
	`actions` text NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100),
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`whatsappNumber` varchar(50),
	`niche` varchar(180),
	`country` varchar(120),
	`website` varchar(500),
	`instagram` varchar(180),
	`offer` text,
	`offerPrice` varchar(100),
	`monthlyLeads` varchar(100),
	`monthlyInquiries` varchar(100),
	`monthlyBookedCalls` varchar(100),
	`currentLeadSource` varchar(160),
	`currentSystem` varchar(160),
	`mainChallenge` varchar(180),
	`leadScore` int NOT NULL DEFAULT 0,
	`leadScoreLabel` varchar(40) NOT NULL DEFAULT 'Low Intent',
	`source` varchar(100) NOT NULL DEFAULT 'website',
	`status` enum('active','inactive','unsubscribed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastContacted` timestamp,
	`nextFollowUp` timestamp,
	`notes` text,
	`tags` text,
	`emailConsent` int NOT NULL DEFAULT 0,
	`smsConsent` int NOT NULL DEFAULT 0,
	`whatsappConsent` int NOT NULL DEFAULT 0,
	`marketingConsent` int NOT NULL DEFAULT 0,
	`consentTimestamp` timestamp,
	`consentSource` varchar(180),
	`consentText` text,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`),
	CONSTRAINT `contacts_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`channel` enum('chat','email','sms','whatsapp') NOT NULL DEFAULT 'chat',
	`messages` text NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `form_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`formId` int,
	`contactId` int,
	`data` text NOT NULL,
	`utmSource` varchar(180),
	`utmMedium` varchar(180),
	`utmCampaign` varchar(180),
	`utmContent` varchar(180),
	`utmTerm` varchar(180),
	`landingPage` varchar(500),
	`referrer` varchar(500),
	`firstTouchSource` varchar(180),
	`lastTouchSource` varchar(180),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `form_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`description` text,
	`fields` text NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forms_id` PRIMARY KEY(`id`),
	CONSTRAINT `forms_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`stage` enum('new_lead','engaged','qualified','audit_requested','strategy_call_invited','booked','showed','proposal','won','lost','nurture') NOT NULL DEFAULT 'new_lead',
	`leadScore` int NOT NULL DEFAULT 0,
	`leadScoreLabel` varchar(40) NOT NULL DEFAULT 'Low Intent',
	`source` varchar(100) NOT NULL DEFAULT 'website',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int,
	`title` varchar(200) NOT NULL,
	`description` text,
	`priority` enum('low','normal','high') NOT NULL DEFAULT 'normal',
	`status` enum('open','done','snoozed') NOT NULL DEFAULT 'open',
	`dueAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeline_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`type` varchar(80) NOT NULL,
	`detail` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeline_events_id` PRIMARY KEY(`id`)
);
