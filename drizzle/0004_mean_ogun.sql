ALTER TABLE `audit_records` ADD `trafficScore` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_records` ADD `leadCaptureScore` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_records` ADD `nurturingScore` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_records` ADD `qualificationScore` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_records` ADD `bookingScore` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_records` ADD `followUpScore` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_records` ADD `conversionScore` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_calendar_event_id_idx` UNIQUE(`calendarEventId`);