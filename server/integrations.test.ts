import { describe, expect, it } from "vitest";
import { consentAllows, queueMessage } from "./integrations";

describe("consent-aware messaging", () => {
  it("blocks outbound messaging without marketing consent", () => {
    const contact = { emailConsent: 1, smsConsent: 0, whatsappConsent: 0, marketingConsent: 0 };
    expect(consentAllows("email", contact)).toBe(false);
    expect(queueMessage("email", "booking confirmation", false)).toMatchObject({ queued: false });
  });

  it("queues a permitted channel when consent is recorded", () => {
    const contact = { emailConsent: 1, smsConsent: 1, whatsappConsent: 0, marketingConsent: 1 };
    expect(consentAllows("sms", contact)).toBe(true);
    expect(queueMessage("sms", "appointment reminder", true)).toMatchObject({ queued: true, channel: "sms" });
  });
});
