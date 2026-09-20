import { desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  analyticsEvents,
  appointments,
  auditRecords,
  auditSubmissions,
  automationEvents,
  automations,
  consents,
  contacts,
  conversationMessages,
  conversations,
  formSubmissions,
  forms,
  InsertAuditSubmission,
  InsertContact,
  InsertUser,
  leads,
  tasks,
  timelineEvents,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { scoreLead, type LeadScoringInput } from "./scoring";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function createAuditSubmission(input: Omit<InsertAuditSubmission, "id" | "createdAt">): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.insert(auditSubmissions).values(input);
  return true;
}

function insertId(result: unknown) {
  const header = Array.isArray(result) ? result[0] as { insertId?: number } : result as { insertId?: number };
  return Number(header?.insertId || 0);
}

export type LeadContactInput = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  niche?: string;
  country?: string;
  website?: string;
  instagram?: string;
  offer?: string;
  offerPrice?: string;
  monthlyLeads?: string;
  monthlyInquiries?: string;
  monthlyBookedCalls?: string;
  currentLeadSource?: string;
  currentSystem?: string;
  currentFunnel?: string;
  currentBookingSystem?: string;
  currentFollowUpSystem?: string;
  mainChallenge?: string;
  source?: string;
  sourceDetail?: string;
  emailConsent?: boolean;
  smsConsent?: boolean;
  whatsappConsent?: boolean;
  marketingConsent?: boolean;
  consentSource?: string;
  consentText?: string;
  strategyCallInterest?: boolean;
  urgency?: string;
};

function nullable(value: string | undefined) {
  return value === undefined ? null : value || null;
}

export async function upsertContactAndLead(input: LeadContactInput, scoringInput?: LeadScoringInput) {
  const db = await getDb();
  const score = scoreLead({ ...input, ...scoringInput });
  if (!db) return { contactId: 0, leadId: 0, ...score, persisted: false };

  const existing = await db.select().from(contacts).where(eq(contacts.email, input.email)).limit(1);
  const now = new Date();
  const existingContact = existing[0];
  const consent = {
    emailConsent: input.emailConsent === undefined ? existingContact?.emailConsent ?? 0 : input.emailConsent ? 1 : 0,
    smsConsent: input.smsConsent === undefined ? existingContact?.smsConsent ?? 0 : input.smsConsent ? 1 : 0,
    whatsappConsent: input.whatsappConsent === undefined ? existingContact?.whatsappConsent ?? 0 : input.whatsappConsent ? 1 : 0,
    marketingConsent: input.marketingConsent === undefined ? existingContact?.marketingConsent ?? 0 : input.marketingConsent ? 1 : 0,
    consentTimestamp: input.marketingConsent ? now : existingContact?.consentTimestamp,
    consentSource: input.consentSource || existingContact?.consentSource,
    consentText: input.consentText || existingContact?.consentText,
  };
  const contactValues = {
    firstName: input.firstName,
    lastName: nullable(input.lastName) ?? existingContact?.lastName ?? null,
    phone: nullable(input.phone) ?? existingContact?.phone ?? null,
    whatsappNumber: nullable(input.whatsappNumber) ?? existingContact?.whatsappNumber ?? null,
    niche: nullable(input.niche) ?? existingContact?.niche ?? null,
    country: nullable(input.country) ?? existingContact?.country ?? null,
    website: nullable(input.website) ?? existingContact?.website ?? null,
    instagram: nullable(input.instagram) ?? existingContact?.instagram ?? null,
    offer: nullable(input.offer) ?? existingContact?.offer ?? null,
    offerPrice: nullable(input.offerPrice) ?? existingContact?.offerPrice ?? null,
    monthlyLeads: nullable(input.monthlyLeads) ?? existingContact?.monthlyLeads ?? null,
    monthlyInquiries: nullable(input.monthlyInquiries) ?? existingContact?.monthlyInquiries ?? null,
    monthlyBookedCalls: nullable(input.monthlyBookedCalls) ?? existingContact?.monthlyBookedCalls ?? null,
    currentLeadSource: nullable(input.currentLeadSource) ?? existingContact?.currentLeadSource ?? null,
    currentSystem: nullable(input.currentSystem) ?? existingContact?.currentSystem ?? null,
    currentFunnel: nullable(input.currentFunnel) ?? existingContact?.currentFunnel ?? null,
    currentBookingSystem: nullable(input.currentBookingSystem) ?? existingContact?.currentBookingSystem ?? null,
    currentFollowUpSystem: nullable(input.currentFollowUpSystem) ?? existingContact?.currentFollowUpSystem ?? null,
    mainChallenge: nullable(input.mainChallenge) ?? existingContact?.mainChallenge ?? null,
    source: input.source || existingContact?.source || "website",
    leadScore: score.score,
    leadScoreLabel: score.label,
    leadScoreFactors: JSON.stringify(score.factors),
    status: "active" as const,
    ...consent,
  };
  let contactId = existingContact?.id ?? 0;
  if (existingContact) {
    await db.update(contacts).set(contactValues).where(eq(contacts.id, contactId));
  } else {
    const result = await db.insert(contacts).values({ email: input.email, ...contactValues });
    contactId = insertId(result);
  }

  const existingLead = await db.select().from(leads).where(eq(leads.contactId, contactId)).limit(1);
  let leadId = existingLead[0]?.id ?? 0;
  const leadWasCreated = !existingLead[0];
  if (existingLead[0]) {
    await db.update(leads).set({ leadScore: score.score, leadScoreLabel: score.label, leadScoreFactors: JSON.stringify(score.factors), source: input.source || existingLead[0].source, sourceDetail: input.sourceDetail || existingLead[0].sourceDetail }).where(eq(leads.id, leadId));
  } else {
    const result = await db.insert(leads).values({ contactId, leadScore: score.score, leadScoreLabel: score.label, leadScoreFactors: JSON.stringify(score.factors), source: input.source || "website", sourceDetail: input.sourceDetail || null, stage: "new_lead" });
    leadId = insertId(result);
  }

  if (input.emailConsent !== undefined || input.smsConsent !== undefined || input.whatsappConsent !== undefined || input.marketingConsent !== undefined) {
    const consentValues = [
      ["email", input.emailConsent], ["sms", input.smsConsent], ["whatsapp", input.whatsappConsent], ["marketing", input.marketingConsent],
    ] as const;
    for (const [channel, granted] of consentValues) {
      if (granted !== undefined) await db.insert(consents).values({ contactId, channel, granted: granted ? 1 : 0, source: input.consentSource || input.source || "website", text: input.consentText || null, optedOut: granted ? 0 : 1 });
    }
  }
  await db.insert(timelineEvents).values({ contactId, type: leadWasCreated ? "LEAD_CREATED" : "LEAD_UPDATED", detail: `${leadWasCreated ? "Lead created" : "Lead updated"} from ${input.source || "website"}. Score: ${score.score}/100 (${score.label}).` });
  return { contactId, leadId, ...score, persisted: true };
}

export async function createAuditRecord(input: { contactId: number; overallScore: number; categoryScores: string; biggestOpportunity: string; recommendations: string[]; aiAnalysis?: string }) {
  const db = await getDb();
  if (!db) return false;
  const categories = (() => { try { return JSON.parse(input.categoryScores) as Array<{ label: string; score: number }>; } catch { return []; } })();
  const scoreFor = (label: string) => categories.find((category) => category.label.toLowerCase().includes(label))?.score || 0;
  await db.insert(auditRecords).values({ contactId: input.contactId, trafficScore: scoreFor("traffic"), leadCaptureScore: scoreFor("lead capture"), nurturingScore: scoreFor("nurtur"), qualificationScore: scoreFor("qualif"), bookingScore: scoreFor("book"), followUpScore: scoreFor("follow"), conversionScore: scoreFor("convert"), overallScore: input.overallScore, categoryScores: input.categoryScores, biggestOpportunity: input.biggestOpportunity, recommendations: JSON.stringify(input.recommendations), aiAnalysis: input.aiAnalysis || null });
  await db.update(leads).set({ stage: "audit_requested", leadScore: input.overallScore }).where(eq(leads.contactId, input.contactId));
  await db.insert(timelineEvents).values({ contactId: input.contactId, type: "AUDIT_COMPLETED", detail: `Audit completed with score ${input.overallScore}/100.` });
  return true;
}

export async function createFormSubmission(input: { formId?: number; contactId?: number; leadId?: number; data: Record<string, unknown>; attribution?: Record<string, string> }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(formSubmissions).values({ formId: input.formId || null, contactId: input.contactId || null, data: JSON.stringify(input.data), utmSource: input.attribution?.utm_source || null, utmMedium: input.attribution?.utm_medium || null, utmCampaign: input.attribution?.utm_campaign || null, utmContent: input.attribution?.utm_content || null, utmTerm: input.attribution?.utm_term || null, landingPage: input.attribution?.landing_page || null, referrer: input.attribution?.referrer || null, firstTouchSource: input.attribution?.first_touch_source || null, lastTouchSource: input.attribution?.last_touch_source || null });
  if (input.contactId) await db.insert(timelineEvents).values({ contactId: input.contactId, type: "FORM_SUBMITTED", detail: `Form submission ${insertId(result)} stored.` });
  return { id: insertId(result), persisted: true };
}

export async function saveFormSubmission(input: { formId?: number; contactId?: number; data: Record<string, unknown>; attribution?: Record<string, string> }) {
  return createFormSubmission(input);
}

export async function queueLeadAutomation(input: { contactId: number; leadId: number; source?: string; consent?: { email?: boolean; sms?: boolean; whatsapp?: boolean } }) {
  const db = await getDb();
  if (!db) return false;
  await db.insert(automationEvents).values({ contactId: input.contactId, leadId: input.leadId, trigger: "NEW_LEAD", action: "CREATE_TASK", status: "queued", detail: `Lead created from ${input.source || "website"}.` });
  await db.insert(tasks).values({ contactId: input.contactId, title: "Review new CoachFlow lead", description: "Review score, audit answers, and send the next appropriate follow-up.", priority: "normal", status: "open" });
  const messageActions = [["email", input.consent?.email], ["sms", input.consent?.sms], ["whatsapp", input.consent?.whatsapp]] as const;
  for (const [channel, consented] of messageActions) await db.insert(automationEvents).values({ contactId: input.contactId, leadId: input.leadId, trigger: "NEW_LEAD", action: `SEND_${channel.toUpperCase()}`, status: consented ? "queued" : "skipped", detail: consented ? "Consent recorded; provider delivery pending configuration." : "Skipped because channel consent was not recorded." });
  await db.insert(analyticsEvents).values({ contactId: input.contactId, leadId: input.leadId, event: "FORM_SUBMISSION", source: input.source || "website", metadata: JSON.stringify({ trigger: "NEW_LEAD" }) });
  return true;
}

export async function trackAnalyticsEvent(input: { contactId?: number; leadId?: number; event: string; source?: string; metadata?: Record<string, unknown> }) {
  const db = await getDb();
  if (!db) return false;
  await db.insert(analyticsEvents).values({ contactId: input.contactId || null, leadId: input.leadId || null, event: input.event, source: input.source || null, metadata: input.metadata ? JSON.stringify(input.metadata) : null });
  return true;
}

export async function getCrmOverview() {
  const db = await getDb();
  if (!db) return { leads: [], contacts: [], appointments: [], tasks: [], forms: [], automations: [], totals: { total: 0, newLeads: 0, qualified: 0, highIntent: 0, audits: 0, booked: 0, showed: 0, noShows: 0, won: 0, lost: 0, conversionRate: 0 } };
  const [leadRows, contactRows, appointmentRows, taskRows, formRows, automationRows, auditRows, submissionRows] = await Promise.all([
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(1000),
    db.select().from(contacts).orderBy(desc(contacts.createdAt)).limit(1000),
    db.select().from(appointments).orderBy(desc(appointments.createdAt)).limit(500),
    db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(500),
    db.select().from(forms).orderBy(desc(forms.createdAt)),
    db.select().from(automations).orderBy(desc(automations.createdAt)),
    db.select().from(auditRecords).orderBy(desc(auditRecords.completedAt)).limit(500),
    db.select().from(formSubmissions).orderBy(desc(formSubmissions.createdAt)).limit(5000),
  ]);
  const count = (stage: string) => leadRows.filter((lead) => lead.stage === stage).length;
  const booked = count("booked");
  return { leads: leadRows, contacts: contactRows, appointments: appointmentRows, tasks: taskRows, forms: formRows, formSubmissions: submissionRows, automations: automationRows, totals: { total: leadRows.length, newLeads: count("new_lead"), qualified: count("qualified"), highIntent: contactRows.filter((contact) => contact.leadScore >= 81).length, audits: auditRows.length, booked, showed: count("showed"), noShows: appointmentRows.filter((appointment) => appointment.status === "no_show").length, won: count("won"), lost: count("lost"), conversionRate: leadRows.length ? Math.round((booked / leadRows.length) * 100) : 0 } };
}

export async function getCrmLeadDirectory(input: { search?: string; stage?: string; niche?: string; source?: string; minScore?: number; maxScore?: number; booked?: boolean; page?: number; pageSize?: number }) {
  const db = await getDb();
  if (!db) return { rows: [], total: 0, page: input.page || 1, pageSize: input.pageSize || 25 };
  const [leadRows, contactRows, appointmentRows] = await Promise.all([db.select().from(leads).orderBy(desc(leads.createdAt)).limit(5000), db.select().from(contacts).orderBy(desc(contacts.createdAt)).limit(5000), db.select().from(appointments).limit(5000)]);
  const contactsById = new Map(contactRows.map((contact) => [contact.id, contact]));
  const bookedContactIds = new Set(appointmentRows.filter((appointment) => ["booked", "showed"].includes(appointment.status)).map((appointment) => appointment.contactId));
  const search = input.search?.trim().toLowerCase();
  const filtered = leadRows.filter((lead) => {
    const contact = contactsById.get(lead.contactId);
    if (!contact) return false;
    const haystack = `${contact.firstName} ${contact.lastName || ""} ${contact.email} ${contact.phone || ""} ${contact.niche || ""} ${contact.offer || ""}`.toLowerCase();
    return (!search || haystack.includes(search)) && (!input.stage || lead.stage === input.stage) && (!input.niche || contact.niche === input.niche) && (!input.source || lead.source === input.source) && (input.minScore === undefined || lead.leadScore >= input.minScore) && (input.maxScore === undefined || lead.leadScore <= input.maxScore) && (input.booked === undefined || bookedContactIds.has(contact.id) === input.booked);
  });
  const pageSize = Math.min(100, Math.max(1, input.pageSize || 25));
  const page = Math.max(1, input.page || 1);
  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize).map((lead) => ({ lead, contact: contactsById.get(lead.contactId), booked: bookedContactIds.has(lead.contactId) })), total: filtered.length, page, pageSize };
}

export async function getLeadProfile(contactId: number) {
  const db = await getDb();
  if (!db) return null;
  const [contact, lead, submissions, audits, timeline, appointmentRows, conversationRows] = await Promise.all([
    db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1),
    db.select().from(leads).where(eq(leads.contactId, contactId)).limit(1),
    db.select().from(formSubmissions).where(eq(formSubmissions.contactId, contactId)).orderBy(desc(formSubmissions.createdAt)),
    db.select().from(auditRecords).where(eq(auditRecords.contactId, contactId)).orderBy(desc(auditRecords.completedAt)),
    db.select().from(timelineEvents).where(eq(timelineEvents.contactId, contactId)).orderBy(desc(timelineEvents.createdAt)),
    db.select().from(appointments).where(eq(appointments.contactId, contactId)).orderBy(desc(appointments.createdAt)),
    db.select().from(conversations).where(eq(conversations.contactId, contactId)).orderBy(desc(conversations.lastMessageAt)),
  ]);
  const conversationIds = conversationRows.map((conversation) => conversation.id);
  const messages = conversationIds.length ? await db.select().from(conversationMessages).orderBy(desc(conversationMessages.createdAt)) : [];
  return { contact: contact[0], lead: lead[0], submissions, audits, timeline, appointments: appointmentRows, conversations: conversationRows.map((conversation) => ({ ...conversation, messages: messages.filter((message) => message.conversationId === conversation.id) })) };
}

export async function exportCrmCsv() {
  const directory = await getCrmLeadDirectory({ page: 1, pageSize: 5000 });
  const header = ["Name", "Email", "Phone", "Niche", "Website", "Instagram", "Offer", "Offer Price", "Lead Score", "Status", "Source", "Created Date", "Last Activity"];
  const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const rows = directory.rows.map(({ lead, contact }) => [contact?.firstName + " " + (contact?.lastName || ""), contact?.email, contact?.phone, contact?.niche, contact?.website, contact?.instagram, contact?.offer, contact?.offerPrice, lead.leadScore, lead.stage, lead.source, lead.createdAt, contact?.updatedAt].map(csvCell).join(","));
  return [header.map(csvCell).join(","), ...rows].join("\n");
}

export async function exportFormSubmissionsCsv() {
  const db = await getDb();
  if (!db) return "Form ID,Contact ID,Email,Submitted Date,Answers,UTM Source,UTM Medium,UTM Campaign\n";
  const [submissions, contactRows] = await Promise.all([db.select().from(formSubmissions).orderBy(desc(formSubmissions.createdAt)).limit(10000), db.select().from(contacts).limit(10000)]);
  const contactsById = new Map(contactRows.map((contact) => [contact.id, contact]));
  const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const header = ["Form ID", "Contact ID", "Email", "Submitted Date", "Answers", "UTM Source", "UTM Medium", "UTM Campaign"];
  const rows = submissions.map((submission) => [submission.formId, submission.contactId, contactsById.get(submission.contactId || 0)?.email, submission.createdAt, submission.data, submission.utmSource, submission.utmMedium, submission.utmCampaign].map(csvCell).join(","));
  return [header.map(csvCell).join(","), ...rows].join("\n");
}

export async function updateLeadStage(leadId: number, stage: typeof leads.$inferInsert.stage) {
  const db = await getDb();
  if (!db) return false;
  const lead = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (!lead[0]) return false;
  await db.update(leads).set({ stage }).where(eq(leads.id, leadId));
  await db.insert(timelineEvents).values({ contactId: lead[0].contactId, type: "PIPELINE_STAGE_UPDATED", detail: `Pipeline moved to ${stage}.` });
  await trackAnalyticsEvent({ contactId: lead[0].contactId, leadId, event: "PIPELINE_STAGE_CHANGED", source: "crm", metadata: { stage } });
  return true;
}

export async function createAppointment(input: { contact: LeadContactInput; startAt?: Date; endAt?: Date; timezone?: string; eventType?: string; meetingLink?: string; externalEventId?: string; status?: "requested" | "booked" | "cancelled" | "rescheduled" | "showed" | "no_show" }) {
  const lead = await upsertContactAndLead(input.contact, { mainChallenge: input.contact.mainChallenge, strategyCallInterest: true });
  const db = await getDb();
  if (!db) return { ...lead, appointmentId: 0, persisted: false };
  if (input.externalEventId) {
    const existing = await db.select().from(appointments).where(eq(appointments.calendarEventId, input.externalEventId)).limit(1);
    if (existing[0]) return { ...lead, appointmentId: existing[0].id, persisted: true, duplicate: true };
  }
  const status = input.status || "requested";
  const result = await db.insert(appointments).values({ contactId: lead.contactId, provider: process.env.CALENDAR_PROVIDER || "manual", startAt: input.startAt || null, endAt: input.endAt || null, timezone: input.timezone || null, eventType: input.eventType || "Strategy call", meetingLink: input.meetingLink || process.env.CALENDLY_BOOKING_URL || null, calendarEventId: input.externalEventId || null, status });
  await db.update(leads).set({ stage: status === "booked" ? "booked" : "strategy_call_invited" }).where(eq(leads.contactId, lead.contactId));
  await db.insert(timelineEvents).values({ contactId: lead.contactId, type: status === "booked" ? "APPOINTMENT_BOOKED" : "BOOKING_REQUESTED", detail: status === "booked" ? "Appointment booked." : "Strategy call booking requested." });
  await trackAnalyticsEvent({ contactId: lead.contactId, leadId: lead.leadId, event: status === "booked" ? "BOOKING" : "CALENDAR_OPENED", source: process.env.CALENDAR_PROVIDER || "manual" });
  return { ...lead, appointmentId: insertId(result), persisted: true };
}

export async function createTask(input: { contactId?: number; title: string; description?: string; priority?: "low" | "normal" | "high"; dueAt?: Date }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(tasks).values({ contactId: input.contactId || null, title: input.title, description: input.description || null, priority: input.priority || "normal", dueAt: input.dueAt || null });
  return { id: insertId(result), persisted: true };
}

export async function createForm(input: { name: string; slug: string; description?: string; fields: string[] }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(forms).values({ name: input.name, slug: input.slug, description: input.description || null, fields: JSON.stringify(input.fields), active: 1 });
  return { id: insertId(result), persisted: true };
}

export async function createAutomation(input: { name: string; trigger: string; actions: string[] }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(automations).values({ name: input.name, trigger: input.trigger, actions: JSON.stringify(input.actions), enabled: 1 });
  return { id: insertId(result), persisted: true };
}

export async function saveConversationMessages(input: { contactId: number; conversationId?: number; messages: Array<{ role: "user" | "assistant" | "system"; content: string }>; channel?: "chat" | "email" | "sms" | "whatsapp" }) {
  const db = await getDb();
  if (!db) return { conversationId: 0, persisted: false };
  let conversationId = input.conversationId;
  if (!conversationId) {
    const result = await db.insert(conversations).values({ contactId: input.contactId, channel: input.channel || "chat", messages: JSON.stringify(input.messages), startedAt: new Date(), lastMessageAt: new Date() });
    conversationId = insertId(result);
  } else {
    await db.update(conversations).set({ messages: JSON.stringify(input.messages), lastMessageAt: new Date() }).where(eq(conversations.id, conversationId));
  }
  for (const message of input.messages.slice(-2)) await db.insert(conversationMessages).values({ conversationId, role: message.role, message: message.content, intent: null });
  await db.insert(timelineEvents).values({ contactId: input.contactId, type: "FLOW_AI_CONVERSATION", detail: `${input.messages.length} messages recorded.` });
  return { conversationId, persisted: true };
}

export async function getTimeline(contactId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(timelineEvents).where(eq(timelineEvents.contactId, contactId)).orderBy(desc(timelineEvents.createdAt));
}

export async function getAnalyticsSummary() {
  const db = await getDb();
  if (!db) return { events: [], totals: {} };
  const events = await db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt)).limit(5000);
  const totals = events.reduce<Record<string, number>>((acc, event) => { acc[event.event] = (acc[event.event] || 0) + 1; return acc; }, {});
  return { events, totals };
}
