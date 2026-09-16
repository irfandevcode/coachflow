import { beforeEach, describe, expect, it, vi } from "vitest";

const { createAuditSubmission } = vi.hoisted(() => ({
  createAuditSubmission: vi.fn(async () => true),
}));

vi.mock("./db", () => ({ createAuditSubmission }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx: TrpcContext = {
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

const validInput = {
  name: "Jane Coach",
  email: "jane@example.com",
  website: "https://example.com",
  niche: "Online fitness coaching",
  offer: "12-week 1:1 coaching",
  price: "$1,500–$3,000",
  monthlyLeads: "11–25",
  bookedCalls: "1–5",
  leadSource: "content",
  challenge: "follow-up",
  overallScore: 48,
  categoryScores: [
    { label: "Traffic", score: 72 },
    { label: "Lead capture", score: 52 },
    { label: "Nurturing", score: 28 },
    { label: "Booking", score: 49 },
    { label: "Follow-up", score: 26 },
  ],
};

describe("audit.submit", () => {
  beforeEach(() => createAuditSubmission.mockClear());

  it("accepts a valid diagnostic payload and persists it", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.audit.submit(validInput);

    expect(result).toEqual({ success: true, persisted: true });
    expect(createAuditSubmission).toHaveBeenCalledOnce();
    expect(createAuditSubmission).toHaveBeenCalledWith(expect.objectContaining({
      name: "Jane Coach",
      email: "jane@example.com",
      overallScore: 48,
      categoryScores: JSON.stringify(validInput.categoryScores),
    }));
  });

  it("rejects malformed email addresses", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.audit.submit({ ...validInput, email: "not-an-email" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(createAuditSubmission).not.toHaveBeenCalled();
  });
});
