import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { askCoachFlowGemini } from "./gemini";
import { calendarConfig, providerStatus } from "./integrations";
import { createAppointment, createAuditRecord, createAuditSubmission, createAutomation, createForm, createTask, getCrmOverview, getTimeline, saveFormSubmission, updateLeadStage, upsertContactAndLead } from "./db";
import { z } from "zod";

const attributionSchema = z.object({
  utm_source: z.string().max(180).optional(), utm_medium: z.string().max(180).optional(), utm_campaign: z.string().max(180).optional(), utm_content: z.string().max(180).optional(), utm_term: z.string().max(180).optional(), landing_page: z.string().max(500).optional(), referrer: z.string().max(500).optional(), first_touch_source: z.string().max(180).optional(), last_touch_source: z.string().max(180).optional(),
}).optional();

const leadInputSchema = z.object({
  firstName: z.string().min(1).max(100), lastName: z.string().max(100).optional(), email: z.string().email().max(320), phone: z.string().max(50).optional(), whatsappNumber: z.string().max(50).optional(), niche: z.string().max(180).optional(), country: z.string().max(120).optional(), website: z.string().max(500).optional(), instagram: z.string().max(180).optional(), offer: z.string().max(2000).optional(), offerPrice: z.string().max(100).optional(), monthlyLeads: z.string().max(100).optional(), monthlyInquiries: z.string().max(100).optional(), monthlyBookedCalls: z.string().max(100).optional(), currentLeadSource: z.string().max(160).optional(), currentSystem: z.string().max(160).optional(), mainChallenge: z.string().max(180).optional(), source: z.string().max(100).optional(), emailConsent: z.boolean().optional(), smsConsent: z.boolean().optional(), whatsappConsent: z.boolean().optional(), marketingConsent: z.boolean().optional(), consentSource: z.string().max(180).optional(), consentText: z.string().max(1000).optional(), strategyCallInterest: z.boolean().optional(), urgency: z.string().max(80).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  lead: router({
    create: publicProcedure.input(z.object({ contact: leadInputSchema, attribution: attributionSchema })).mutation(async ({ input }) => {
      const result = await upsertContactAndLead(input.contact, { strategyCallInterest: input.contact.strategyCallInterest, urgency: input.contact.urgency });
      await saveFormSubmission({ data: input.contact, attribution: input.attribution });
      return result;
    }),
  }),
  audit: router({
    submit: publicProcedure.input(z.object({
      name: z.string().min(1).max(160), email: z.string().email().max(320), phone: z.string().max(50).optional(), website: z.string().max(500), instagram: z.string().max(180).optional(), niche: z.string().max(180), offer: z.string().max(1000), price: z.string().max(100), monthlyLeads: z.string().max(100), monthlyInquiries: z.string().max(100).optional(), bookedCalls: z.string().max(100), leadSource: z.string().max(100), currentSystem: z.string().max(160).optional(), challenge: z.string().max(100), overallScore: z.number().int().min(0).max(100), categoryScores: z.array(z.object({ label: z.string(), score: z.number().int().min(0).max(100) })), attribution: attributionSchema, marketingConsent: z.boolean().optional(), smsConsent: z.boolean().optional(), whatsappConsent: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const firstAndLast = input.name.trim().split(/\s+/);
      const contact = await upsertContactAndLead({ firstName: firstAndLast[0] || input.name, lastName: firstAndLast.slice(1).join(" ") || undefined, email: input.email, phone: input.phone, website: input.website, instagram: input.instagram, niche: input.niche, offer: input.offer, offerPrice: input.price, monthlyLeads: input.monthlyLeads, monthlyInquiries: input.monthlyInquiries, monthlyBookedCalls: input.bookedCalls, currentLeadSource: input.leadSource, currentSystem: input.currentSystem, mainChallenge: input.challenge, source: input.attribution?.utm_source || "free_audit", marketingConsent: input.marketingConsent, smsConsent: input.smsConsent, whatsappConsent: input.whatsappConsent, emailConsent: input.marketingConsent, consentSource: "free_audit", consentText: "I agree to receive the requested audit and relevant follow-up.", }, { offer: input.offer, offerPrice: input.price, monthlyLeads: input.monthlyLeads, monthlyInquiries: input.monthlyInquiries, monthlyBookedCalls: input.bookedCalls, currentSystem: input.currentSystem, currentLeadSource: input.leadSource, mainChallenge: input.challenge, strategyCallInterest: true });
      await createAuditSubmission({ name: input.name, email: input.email, website: input.website || null, niche: input.niche || null, offer: input.offer || null, price: input.price || null, monthlyLeads: input.monthlyLeads || null, bookedCalls: input.bookedCalls || null, leadSource: input.leadSource || null, challenge: input.challenge || null, overallScore: input.overallScore, categoryScores: JSON.stringify(input.categoryScores) });
      const lowest = [...input.categoryScores].sort((a, b) => a.score - b.score)[0];
      await createAuditRecord({ contactId: contact.contactId, overallScore: input.overallScore, categoryScores: JSON.stringify(input.categoryScores), biggestOpportunity: lowest ? lowest.label : "Follow-up", recommendations: ["Clarify one next step from attention to conversation.", "Add a short follow-up path for people who are not ready today.", "Connect qualification and booking so the call feels like a natural next step."] });
      await saveFormSubmission({ data: input, attribution: input.attribution });
      return { success: true, ...contact } as const;
    }),
  }),
  booking: router({
    config: publicProcedure.query(() => calendarConfig()),
    request: publicProcedure.input(z.object({ contact: leadInputSchema, startAt: z.string().datetime().optional(), timezone: z.string().max(80).optional(), eventType: z.string().max(160).optional() })).mutation(async ({ input }) => createAppointment({ contact: input.contact, startAt: input.startAt ? new Date(input.startAt) : undefined, timezone: input.timezone, eventType: input.eventType })),
  }),
  forms: router({
    catalog: publicProcedure.query(() => [
      { slug: "flow-ai-lead", name: "Flow AI Lead Form", fields: ["text", "email", "phone", "hidden"] },
      { slug: "free-client-acquisition-audit", name: "Free Client Acquisition Audit", fields: ["text", "email", "phone", "dropdown", "multiple choice", "long text", "checkbox", "hidden"] },
      { slug: "strategy-call-application", name: "Strategy Call Application", fields: ["text", "email", "phone", "url", "long text", "checkbox"] },
      { slug: "contact", name: "Contact Form", fields: ["text", "email", "long text"] },
      { slug: "custom-lead-qualification", name: "Custom Lead Qualification Form", fields: ["text", "email", "number", "dropdown", "multiple choice", "checkbox", "long text", "url", "hidden"] },
    ]),
    submit: publicProcedure.input(z.object({ formId: z.number().int().optional(), contact: leadInputSchema.optional(), data: z.record(z.string(), z.unknown()), attribution: z.record(z.string(), z.string()).optional() })).mutation(async ({ input }) => { const lead = input.contact ? await upsertContactAndLead(input.contact) : null; const result = await saveFormSubmission({ formId: input.formId, contactId: lead?.contactId, data: input.data, attribution: input.attribution }); return { ...result, contactId: lead?.contactId || null }; }),
  }),
  crm: router({
    overview: adminProcedure.query(() => getCrmOverview()),
    moveLead: adminProcedure.input(z.object({ leadId: z.number().int(), stage: z.enum(["new_lead", "engaged", "qualified", "audit_requested", "strategy_call_invited", "booked", "showed", "proposal", "won", "lost", "nurture"]) })).mutation(({ input }) => updateLeadStage(input.leadId, input.stage)),
    timeline: adminProcedure.input(z.object({ contactId: z.number().int() })).query(({ input }) => getTimeline(input.contactId)),
    createTask: adminProcedure.input(z.object({ contactId: z.number().int().optional(), title: z.string().min(1).max(200), description: z.string().max(2000).optional(), priority: z.enum(["low", "normal", "high"]).optional() })).mutation(({ input }) => createTask(input)),
    createForm: adminProcedure.input(z.object({ name: z.string().min(1).max(160), slug: z.string().min(1).max(160), description: z.string().max(1000).optional(), fields: z.array(z.string()).min(1) })).mutation(({ input }) => createForm(input)),
    createAutomation: adminProcedure.input(z.object({ name: z.string().min(1).max(180), trigger: z.string().min(1).max(80), actions: z.array(z.string()).min(1) })).mutation(({ input }) => createAutomation(input)),
    providerStatus: adminProcedure.query(() => providerStatus()),
  }),
  ai: router({
    chat: publicProcedure.input(z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4_000) })).min(1).max(12), qualification: z.object({ stage: z.number().int().min(0).max(4), answers: z.object({ goal: z.string().max(800).optional(), offer: z.string().max(800).optional(), leadFlow: z.string().max(800).optional(), timeline: z.string().max(800).optional() }) }) })).mutation(async ({ input }) => ({ content: await askCoachFlowGemini(input.messages, input.qualification) })),
  }),
});

export type AppRouter = typeof appRouter;
