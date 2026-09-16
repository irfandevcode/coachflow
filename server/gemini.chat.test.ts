import { afterEach, describe, expect, it, vi } from "vitest";
import { askCoachFlowGemini } from "./gemini";

describe("askCoachFlowGemini", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends CoachFlow context to Gemini and returns the generated text", async () => {
    process.env.GEMINI_API_KEY = "test-server-secret";
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: "Start by mapping your lead-to-call handoff." }] } }],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await askCoachFlowGemini([{ role: "user", content: "Where should I look first?" }]);

    expect(result).toBe("Start by mapping your lead-to-call handoff.");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("models/gemini-3.6-flash:generateContent");
    expect(url).toContain("key=test-server-secret");
    const body = JSON.parse(String(options.body));
    expect(body.systemInstruction.parts[0].text).toContain("CoachFlow AI concierge");
    expect(body.contents).toEqual([{ role: "user", parts: [{ text: "Where should I look first?" }] }]);
  });
});
