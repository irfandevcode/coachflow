import { describe, expect, it } from "vitest";
import { scoreLead } from "./scoring";

describe("scoreLead", () => {
  it("classifies a complete, urgent, strategy-call-ready lead as high intent", () => {
    const result = scoreLead({ offer: "12-week coaching", offerPrice: "$2,000", monthlyLeads: "51–100", monthlyInquiries: "25+", monthlyBookedCalls: "20+", currentLeadSource: "referrals", currentSystem: "booking page", mainChallenge: "follow-up", strategyCallInterest: true, urgency: "this month" });
    expect(result.score).toBeGreaterThanOrEqual(81);
    expect(result.label).toBe("High Intent");
  });

  it("does not inflate a blank lead", () => {
    expect(scoreLead({})).toEqual({ score: 0, label: "Low Intent" });
  });
});
