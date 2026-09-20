import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const auditSubmissions = mysqlTable("audit_submissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  website: varchar("website", { length: 500 }),
  niche: varchar("niche", { length: 180 }),
  offer: text("offer"),
  price: varchar("price", { length: 100 }),
  monthlyLeads: varchar("monthlyLeads", { length: 100 }),
  bookedCalls: varchar("bookedCalls", { length: 100 }),
  leadSource: varchar("leadSource", { length: 100 }),
  challenge: varchar("challenge", { length: 100 }),
  overallScore: int("overallScore").notNull(),
  categoryScores: text("categoryScores").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  whatsappNumber: varchar("whatsappNumber", { length: 50 }),
  niche: varchar("niche", { length: 180 }),
  country: varchar("country", { length: 120 }),
  website: varchar("website", { length: 500 }),
  instagram: varchar("instagram", { length: 180 }),
  offer: text("offer"),
  offerPrice: varchar("offerPrice", { length: 100 }),
  monthlyLeads: varchar("monthlyLeads", { length: 100 }),
  monthlyInquiries: varchar("monthlyInquiries", { length: 100 }),
  monthlyBookedCalls: varchar("monthlyBookedCalls", { length: 100 }),
  currentLeadSource: varchar("currentLeadSource", { length: 160 }),
  currentSystem: varchar("currentSystem", { length: 160 }),
  currentFunnel: varchar("currentFunnel", { length: 160 }),
  currentBookingSystem: varchar("currentBookingSystem", { length: 160 }),
  currentFollowUpSystem: varchar("currentFollowUpSystem", { length: 160 }),
  mainChallenge: varchar("mainChallenge", { length: 180 }),
  leadScore: int("leadScore").default(0).notNull(),
  leadScoreLabel: varchar("leadScoreLabel", { length: 40 }).default("Low Intent").notNull(),
  leadScoreFactors: text("leadScoreFactors"),
  source: varchar("source", { length: 100 }).default("website").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "unsubscribed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastContacted: timestamp("lastContacted"),
  nextFollowUp: timestamp("nextFollowUp"),
  notes: text("notes"),
  tags: text("tags"),
  emailConsent: int("emailConsent").default(0).notNull(),
  smsConsent: int("smsConsent").default(0).notNull(),
  whatsappConsent: int("whatsappConsent").default(0).notNull(),
  marketingConsent: int("marketingConsent").default(0).notNull(),
  consentTimestamp: timestamp("consentTimestamp"),
  consentSource: varchar("consentSource", { length: 180 }),
  consentText: text("consentText"),
  optOutStatus: int("optOutStatus").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId").notNull(),
  stage: mysqlEnum("stage", ["new_lead", "engaged", "qualified", "audit_requested", "strategy_call_invited", "booked", "showed", "proposal", "won", "lost", "nurture"]).default("new_lead").notNull(),
  leadScore: int("leadScore").default(0).notNull(),
  leadScoreLabel: varchar("leadScoreLabel", { length: 40 }).default("Low Intent").notNull(),
  leadScoreFactors: text("leadScoreFactors"),
  source: varchar("source", { length: 100 }).default("website").notNull(),
  sourceDetail: varchar("sourceDetail", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const auditRecords = mysqlTable("audit_records", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId").notNull(),
  trafficScore: int("trafficScore").default(0).notNull(),
  leadCaptureScore: int("leadCaptureScore").default(0).notNull(),
  nurturingScore: int("nurturingScore").default(0).notNull(),
  qualificationScore: int("qualificationScore").default(0).notNull(),
  bookingScore: int("bookingScore").default(0).notNull(),
  followUpScore: int("followUpScore").default(0).notNull(),
  conversionScore: int("conversionScore").default(0).notNull(),
  overallScore: int("overallScore").notNull(),
  categoryScores: text("categoryScores").notNull(),
  biggestOpportunity: text("biggestOpportunity"),
  recommendations: text("recommendations"),
  aiAnalysis: text("aiAnalysis"),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId").notNull(),
  channel: mysqlEnum("channel", ["chat", "email", "sms", "whatsapp"]).default("chat").notNull(),
  messages: text("messages").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
});

export const conversationMessages = mysqlTable("conversation_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  message: text("message").notNull(),
  intent: varchar("intent", { length: 120 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId").notNull(),
  provider: varchar("provider", { length: 60 }).default("manual").notNull(),
  eventType: varchar("eventType", { length: 160 }),
  startAt: timestamp("startAt"),
  endAt: timestamp("endAt"),
  timezone: varchar("timezone", { length: 80 }),
  status: mysqlEnum("status", ["requested", "booked", "cancelled", "rescheduled", "showed", "no_show"]).default("requested").notNull(),
  calendarEventId: varchar("calendarEventId", { length: 200 }),
  meetingLink: varchar("meetingLink", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ calendarEventUnique: uniqueIndex("appointments_calendar_event_id_idx").on(table.calendarEventId) }));

export const consents = mysqlTable("consents", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId").notNull(),
  channel: mysqlEnum("channel", ["email", "sms", "whatsapp", "marketing"]).notNull(),
  granted: int("granted").default(0).notNull(),
  source: varchar("source", { length: 180 }),
  text: text("text"),
  optedOut: int("optedOut").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const automationEvents = mysqlTable("automation_events", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId"),
  leadId: int("leadId"),
  trigger: varchar("trigger", { length: 100 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["queued", "sent", "skipped", "failed"]).default("queued").notNull(),
  detail: text("detail"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId"),
  leadId: int("leadId"),
  event: varchar("event", { length: 100 }).notNull(),
  source: varchar("source", { length: 180 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId"),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["low", "normal", "high"]).default("normal").notNull(),
  status: mysqlEnum("status", ["open", "done", "snoozed"]).default("open").notNull(),
  dueAt: timestamp("dueAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const forms = mysqlTable("forms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  description: text("description"),
  fields: text("fields").notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const formSubmissions = mysqlTable("form_submissions", {
  id: int("id").autoincrement().primaryKey(),
  formId: int("formId"),
  contactId: int("contactId"),
  data: text("data").notNull(),
  utmSource: varchar("utmSource", { length: 180 }),
  utmMedium: varchar("utmMedium", { length: 180 }),
  utmCampaign: varchar("utmCampaign", { length: 180 }),
  utmContent: varchar("utmContent", { length: 180 }),
  utmTerm: varchar("utmTerm", { length: 180 }),
  landingPage: varchar("landingPage", { length: 500 }),
  referrer: varchar("referrer", { length: 500 }),
  firstTouchSource: varchar("firstTouchSource", { length: 180 }),
  lastTouchSource: varchar("lastTouchSource", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const automations = mysqlTable("automations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  trigger: varchar("trigger", { length: 80 }).notNull(),
  actions: text("actions").notNull(),
  enabled: int("enabled").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const timelineEvents = mysqlTable("timeline_events", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId").notNull(),
  type: varchar("type", { length: 80 }).notNull(),
  detail: text("detail"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type AuditSubmission = typeof auditSubmissions.$inferSelect;
export type InsertAuditSubmission = typeof auditSubmissions.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type AuditRecord = typeof auditRecords.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Form = typeof forms.$inferSelect;
export type Automation = typeof automations.$inferSelect;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type FormSubmission = typeof formSubmissions.$inferSelect;
export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type Consent = typeof consents.$inferSelect;
export type AutomationEvent = typeof automationEvents.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
