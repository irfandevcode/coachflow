import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  appointments,
  auditRecords,
  auditSubmissions,
  automations,
  contacts,
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
  mainChallenge?: string;
  source?: string;
  emailConsent?: boolean;
  smsConsent?: boolean;
  whatsappConsent?: boolean;
  marketingConsent?: boolean;
  consentSource?: string;
  consentText?: string;
};

export async function upsertContactAndLead(input: LeadContactInput, scoringInput?: LeadScoringInput) {
  const db = await getDb();
  const score = scoreLead({ ...input, ...scoringInput });
  if (!db) return { contactId: 0, leadId: 0, ...score, persisted: false };

  const existing = await db.select().from(contacts).where(eq(contacts.email, input.email)).limit(1);
  const now = new Date();
  const consent = {
    emailConsent: input.emailConsent ? 1 : 0,
    smsConsent: input.smsConsent ? 1 : 0,
    whatsappConsent: input.whatsappConsent ? 1 : 0,
    marketingConsent: input.marketingConsent ? 1 : 0,
    consentTimestamp: input.marketingConsent ? now : undefined,
    consentSource: input.consentSource,
    consentText: input.consentText,
  };
  let contactId = existing[0]?.id ?? 0;
  if (existing[0]) {
    await db.update(contacts).set({
      firstName: input.firstName,
      lastName: input.lastName || null,
      phone: input.phone || null,
      whatsappNumber: input.whatsappNumber || null,
      niche: input.niche || null,
      country: input.country || null,
      website: input.website || null,
      instagram: input.instagram || null,
      offer: input.offer || null,
      offerPrice: input.offerPrice || null,
      monthlyLeads: input.monthlyLeads || null,
      monthlyInquiries: input.monthlyInquiries || null,
      monthlyBookedCalls: input.monthlyBookedCalls || null,
      currentLeadSource: input.currentLeadSource || null,
      currentSystem: input.currentSystem || null,
      mainChallenge: input.mainChallenge || null,
      ...consent,
      leadScore: score.score,
      leadScoreLabel: score.label,
      status: "active",
    }).where(eq(contacts.id, contactId));
  } else {
    const result = await db.insert(contacts).values({
      firstName: input.firstName,
      lastName: input.lastName || null,
      email: input.email,
      phone: input.phone || null,
      whatsappNumber: input.whatsappNumber || null,
      niche: input.niche || null,
      country: input.country || null,
      website: input.website || null,
      instagram: input.instagram || null,
      offer: input.offer || null,
      offerPrice: input.offerPrice || null,
      monthlyLeads: input.monthlyLeads || null,
      monthlyInquiries: input.monthlyInquiries || null,
      monthlyBookedCalls: input.monthlyBookedCalls || null,
      currentLeadSource: input.currentLeadSource || null,
      currentSystem: input.currentSystem || null,
      mainChallenge: input.mainChallenge || null,
      leadScore: score.score,
      leadScoreLabel: score.label,
      source: input.source || "website",
      ...consent,
    });
    contactId = insertId(result);
  }

  const existingLead = await db.select().from(leads).where(eq(leads.contactId, contactId)).limit(1);
  let leadId = existingLead[0]?.id ?? 0;
  if (existingLead[0]) {
    await db.update(leads).set({ leadScore: score.score, leadScoreLabel: score.label, source: input.source || "website" }).where(eq(leads.id, leadId));
  } else {
    const result = await db.insert(leads).values({ contactId, leadScore: score.score, leadScoreLabel: score.label, source: input.source || "website", stage: "new_lead" });
    leadId = insertId(result);
  }
  await db.insert(timelineEvents).values({ contactId, type: "LEAD_CREATED", detail: `Lead created from ${input.source || "website"}. Score: ${score.score}/100 (${score.label}).` });
  return { contactId, leadId, ...score, persisted: true };
}

export async function createAuditRecord(input: { contactId: number; overallScore: number; categoryScores: string; biggestOpportunity: string; recommendations: string[] }) {
  const db = await getDb();
  if (!db) return false;
  await db.insert(auditRecords).values({ ...input, recommendations: JSON.stringify(input.recommendations) });
  await db.update(leads).set({ stage: "audit_requested", leadScore: input.overallScore }).where(eq(leads.contactId, input.contactId));
  await db.insert(timelineEvents).values({ contactId: input.contactId, type: "AUDIT_COMPLETED", detail: `Audit completed with score ${input.overallScore}/100.` });
  return true;
}

export async function getCrmOverview() {
  const db = await getDb();
  if (!db) return { leads: [], contacts: [], appointments: [], tasks: [], forms: [], automations: [], totals: { total: 0, newLeads: 0, qualified: 0, booked: 0, showed: 0, noShows: 0, won: 0, lost: 0 } };
  const [leadRows, contactRows, appointmentRows, taskRows, formRows, automationRows] = await Promise.all([
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(200),
    db.select().from(contacts).orderBy(desc(contacts.createdAt)).limit(200),
    db.select().from(appointments).orderBy(desc(appointments.createdAt)).limit(100),
    db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(100),
    db.select().from(forms).orderBy(desc(forms.createdAt)),
    db.select().from(automations).orderBy(desc(automations.createdAt)),
  ]);
  const count = (stage: string) => leadRows.filter((lead) => lead.stage === stage).length;
  return { leads: leadRows, contacts: contactRows, appointments: appointmentRows, tasks: taskRows, forms: formRows, automations: automationRows, totals: { total: leadRows.length, newLeads: count("new_lead"), qualified: count("qualified"), booked: count("booked"), showed: count("showed"), noShows: appointmentRows.filter((appointment) => appointment.status === "no_show").length, won: count("won"), lost: count("lost") } };
}

export async function updateLeadStage(leadId: number, stage: typeof leads.$inferInsert.stage) {
  const db = await getDb();
  if (!db) return false;
  const lead = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (!lead[0]) return false;
  await db.update(leads).set({ stage }).where(eq(leads.id, leadId));
  await db.insert(timelineEvents).values({ contactId: lead[0].contactId, type: "PIPELINE_STAGE_UPDATED", detail: `Pipeline moved to ${stage}.` });
  return true;
}

export async function createAppointment(input: { contact: LeadContactInput; startAt?: Date; timezone?: string; eventType?: string; meetingLink?: string }) {
  const lead = await upsertContactAndLead(input.contact, { mainChallenge: input.contact.mainChallenge, strategyCallInterest: true });
  const db = await getDb();
  if (!db) return { ...lead, appointmentId: 0, persisted: false };
  const result = await db.insert(appointments).values({ contactId: lead.contactId, provider: process.env.CALENDAR_PROVIDER || "manual", startAt: input.startAt || null, timezone: input.timezone || null, eventType: input.eventType || "Strategy call", meetingLink: input.meetingLink || process.env.CALENDLY_BOOKING_URL || null, status: "requested" });
  await db.update(leads).set({ stage: "strategy_call_invited" }).where(eq(leads.contactId, lead.contactId));
  await db.insert(timelineEvents).values({ contactId: lead.contactId, type: "BOOKING_REQUESTED", detail: "Strategy call booking requested." });
  return { ...lead, appointmentId: insertId(result), persisted: true };
}

export async function createTask(input: { contactId?: number; title: string; description?: string; priority?: "low" | "normal" | "high"; dueAt?: Date }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(tasks).values({ contactId: input.contactId || null, title: input.title, description: input.description || null, priority: input.priority || "normal", dueAt: input.dueAt || null });
  return { id: insertId(result), persisted: true };
}

export async function saveFormSubmission(input: { formId?: number; contactId?: number; data: Record<string, unknown>; attribution?: Record<string, string> }) {
  const db = await getDb();
  if (!db) return { persisted: false };
  await db.insert(formSubmissions).values({ formId: input.formId || null, contactId: input.contactId || null, data: JSON.stringify(input.data), utmSource: input.attribution?.utm_source || null, utmMedium: input.attribution?.utm_medium || null, utmCampaign: input.attribution?.utm_campaign || null, utmContent: input.attribution?.utm_content || null, utmTerm: input.attribution?.utm_term || null, landingPage: input.attribution?.landing_page || null, referrer: input.attribution?.referrer || null, firstTouchSource: input.attribution?.first_touch_source || null, lastTouchSource: input.attribution?.last_touch_source || null });
  return { persisted: true };
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

export async function getTimeline(contactId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(timelineEvents).where(eq(timelineEvents.contactId, contactId)).orderBy(desc(timelineEvents.createdAt));
}
