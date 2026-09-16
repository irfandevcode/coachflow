import { TRPCError } from "@trpc/server";

export type CoachFlowChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

const MODEL = "gemini-3.6-flash";
const SYSTEM_INSTRUCTION = `You are the CoachFlow AI concierge. CoachFlow helps coaches build predictable client acquisition systems by combining funnels, automation, lead nurturing, booking, and conversion strategy.

Be concise, practical, warm, and honest. Help visitors understand their acquisition bottlenecks, suggest useful next steps, and explain CoachFlow's free acquisition audit and strategy calls without making guaranteed claims about leads, revenue, or results. You can answer general questions about coaching marketing, funnels, follow-up, qualification, booking, and conversion. If a visitor asks for something outside this scope, politely bring the conversation back to client acquisition for coaches. Never claim to be human, never invent CoachFlow pricing or availability, and never request sensitive credentials or payment information.`;

function toGeminiContents(messages: CoachFlowChatMessage[]) {
  return messages
    .slice(-12)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content.slice(0, 4_000) }],
    }));
}

export async function askCoachFlowGemini(messages: CoachFlowChatMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The CoachFlow assistant is not configured yet." });
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: toGeminiContents(messages),
      generationConfig: {
        temperature: 0.55,
        maxOutputTokens: 600,
      },
    }),
    signal: AbortSignal.timeout(25_000),
  });

  const payload = await response.json() as GeminiResponse;
  if (!response.ok) {
    console.error("[Gemini] Request failed", response.status, payload.error?.message ?? "unknown error");
    throw new TRPCError({ code: "BAD_GATEWAY", message: "The CoachFlow assistant is temporarily unavailable. Please try again shortly." });
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) {
    throw new TRPCError({ code: "BAD_GATEWAY", message: "The CoachFlow assistant returned an empty response. Please try again." });
  }

  return text;
}
