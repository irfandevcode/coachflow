export type LeadScoringInput = {
  offer?: string | null;
  offerPrice?: string | null;
  monthlyLeads?: string | null;
  monthlyInquiries?: string | null;
  monthlyBookedCalls?: string | null;
  currentSystem?: string | null;
  currentLeadSource?: string | null;
  mainChallenge?: string | null;
  strategyCallInterest?: boolean;
  urgency?: string | null;
};

export type LeadScore = { score: number; label: "Low Intent" | "Warm" | "Qualified" | "High Intent" };

function rangeValue(value?: string | null) {
  if (!value) return 0;
  const normalized = value.toLowerCase().replace(/,/g, "");
  const match = normalized.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function scoreLead(input: LeadScoringInput): LeadScore {
  let score = 0;
  if (input.offer?.trim()) score += 15;
  if (input.offerPrice?.trim()) score += 10;
  if (rangeValue(input.monthlyLeads) >= 10) score += 12;
  if (rangeValue(input.monthlyInquiries) >= 5) score += 10;
  if (rangeValue(input.monthlyBookedCalls) >= 2) score += 10;
  if (input.currentLeadSource?.trim()) score += 8;
  if (input.currentSystem && !["", "none", "not yet"].includes(input.currentSystem.toLowerCase())) score += 10;
  if (input.mainChallenge?.trim()) score += 5;
  if (input.strategyCallInterest) score += 12;
  if (["now", "this month", "urgent", "asap"].some((word) => input.urgency?.toLowerCase().includes(word))) score += 8;
  const bounded = Math.max(0, Math.min(100, score));
  const label = bounded <= 30 ? "Low Intent" : bounded <= 60 ? "Warm" : bounded <= 80 ? "Qualified" : "High Intent";
  return { score: bounded, label };
}

export function leadScoreLabel(score: number): LeadScore["label"] {
  return score <= 30 ? "Low Intent" : score <= 60 ? "Warm" : score <= 80 ? "Qualified" : "High Intent";
}
