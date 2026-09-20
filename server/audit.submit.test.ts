import { beforeEach, describe, expect, it, vi } from "vitest";

const { createAuditSubmission, upsertContactAndLead, createAuditRecord, saveFormSubmission, queueLeadAutomation, trackAnalyticsEvent } = vi.hoisted(() => ({
  createAuditSubmission: vi.fn(async () => true),
  upsertContactAndLead: vi.fn(async () => ({ contactId: 7, leadId: 9, score: 48, label: "Warm", persisted: true })),
  createAuditRecord: vi.fn(async () => true),
  saveFormSubmission: vi.fn(async () => ({ persisted: true })),
  queueLeadAutomation: vi.fn(async () => true),
  trackAnalyticsEvent: vi.fn(async () => true),
}));

vi.mock("./db", () => ({ createAuditSubmission, upsertContactAndLead, createAuditRecord, saveFormSubmission, queueLeadAutomation, trackAnalyticsEvent }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx: TrpcContext = { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };

const validInput = {
  name: "Jane Coach", email: "jane@example.com", website: "https://example.com", niche: "Online fitness coaching", offer: "12-week 1:1 coaching", price: "$1,500–$3,000", monthlyLeads: "11–25", monthlyInquiries: "6–10", bookedCalls: "1–5", leadSource: "content", currentSystem: "booking-page", challenge: "follow-up", overallScore: 48,
  categoryScores: [{ label: "Traffic", score: 72 }, { label: "Lead capture", score: 52 }, { label: "Nurturing", score: 28 }, { label: "Qualification", score: 49 }, { label: "Booking", score: 49 }, { label: "Follow-up", score: 26 }, { label: "Conversion", score: 54 }],
  marketingConsent: true,
};

describe("audit.submit", () => {
  beforeEach(() => { createAuditSubmission.mockClear(); upsertContactAndLead.mockClear(); createAuditRecord.mockClear(); saveFormSubmission.mockClear(); queueLeadAutomation.mockClear(); trackAnalyticsEvent.mockClear(); });

  it("accepts a valid diagnostic payload and persists it to the legacy and CRM records", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.audit.submit(validInput);
    expect(result).toMatchObject({ success: true, persisted: true, contactId: 7, leadId: 9 });
    expect(createAuditSubmission).toHaveBeenCalledOnce();
    expect(upsertContactAndLead).toHaveBeenCalledOnce();
    expect(createAuditRecord).toHaveBeenCalledWith(expect.objectContaining({ contactId: 7, overallScore: 48 }));
    expect(saveFormSubmission).toHaveBeenCalledOnce();
  });

  it("rejects malformed email addresses", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.audit.submit({ ...validInput, email: "not-an-email" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(createAuditSubmission).not.toHaveBeenCalled();
  });
});
