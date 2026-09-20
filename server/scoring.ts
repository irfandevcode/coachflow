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

export type ScoreFactor = { key: string; label: string; points: number; present: boolean };
export type LeadScore = { score: number; label: "Low Intent" | "Warm" | "Qualified" | "High Intent"; factors: ScoreFactor[] };

function rangeValue(value?: string | null) {
  if (!value) return 0;
  const normalized = value.toLowerCase().replace(/,/g, "");
  const match = normalized.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function scoreLead(input: LeadScoringInput): LeadScore {
  const factors: ScoreFactor[] = [
    { key: "offer", label: "Existing coaching offer", points: 15, present: Boolean(input.offer?.trim()) },
    { key: "offerPrice", label: "Offer price defined", points: 10, present: Boolean(input.offerPrice?.trim()) },
    { key: "monthlyLeads", label: "Existing lead volume", points: 12, present: rangeValue(input.monthlyLeads) >= 10 },
    { key: "monthlyInquiries", label: "Existing inquiry volume", points: 10, present: rangeValue(input.monthlyInquiries) >= 5 },
    { key: "monthlyBookedCalls", label: "Existing booked calls", points: 10, present: rangeValue(input.monthlyBookedCalls) >= 2 },
    { key: "currentLeadSource", label: "Known lead source", points: 8, present: Boolean(input.currentLeadSource?.trim()) },
    { key: "currentSystem", label: "Existing booking or follow-up system", points: 10, present: Boolean(input.currentSystem && !["", "none", "not yet"].includes(input.currentSystem.toLowerCase())) },
    { key: "mainChallenge", label: "Clear acquisition challenge", points: 5, present: Boolean(input.mainChallenge?.trim()) },
    { key: "strategyCallInterest", label: "Strategy call interest", points: 12, present: Boolean(input.strategyCallInterest) },
    { key: "urgency", label: "Near-term implementation intent", points: 8, present: Boolean(["now", "this month", "urgent", "asap"].some((word) => input.urgency?.toLowerCase().includes(word))) },
  ];
  const score = Math.max(0, Math.min(100, factors.filter((factor) => factor.present).reduce((total, factor) => total + factor.points, 0)));
  const label = score <= 30 ? "Low Intent" : score <= 60 ? "Warm" : score <= 80 ? "Qualified" : "High Intent";
  return { score, label, factors };
}

export function leadScoreLabel(score: number): LeadScore["label"] {
  return score <= 30 ? "Low Intent" : score <= 60 ? "Warm" : score <= 80 ? "Qualified" : "High Intent";
}
