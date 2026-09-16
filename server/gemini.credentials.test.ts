import { describe, expect, it } from "vitest";

describe("Gemini credentials", () => {
  it("can access the Gemini models endpoint with the configured server secret", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey, "GEMINI_API_KEY must be configured").toBeTruthy();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey!)}`, {
      signal: AbortSignal.timeout(15_000),
    });

    expect(response.ok, `Gemini models endpoint returned ${response.status}`).toBe(true);
    const payload = await response.json() as { models?: unknown[] };
    expect(Array.isArray(payload.models)).toBe(true);
  }, 20_000);
});
