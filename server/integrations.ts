export type MessagingChannel = "email" | "sms" | "whatsapp";

export function calendarConfig() {
  return {
    provider: process.env.CALENDAR_PROVIDER || "calendly",
    bookingUrl: process.env.CALENDLY_BOOKING_URL || "",
    configured: Boolean(process.env.CALENDLY_BOOKING_URL),
  };
}

export function providerStatus() {
  return {
    calendar: { provider: process.env.CALENDAR_PROVIDER || "calendly", configured: Boolean(process.env.CALENDLY_API_KEY || process.env.CALENDLY_BOOKING_URL) },
    email: { provider: process.env.EMAIL_PROVIDER || "not_connected", configured: Boolean(process.env.EMAIL_API_KEY) },
    sms: { provider: process.env.SMS_PROVIDER || "twilio", configured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) },
    whatsapp: { provider: process.env.WHATSAPP_PROVIDER || "not_connected", configured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) },
  };
}

export const automationTriggers = [
  "NEW_LEAD", "AUDIT_COMPLETED", "LEAD_QUALIFIED", "BOOKING_CREATED", "BOOKING_CANCELLED", "BOOKING_RESCHEDULED", "APPOINTMENT_TOMORROW", "APPOINTMENT_SOON", "NO_SHOW", "PROPOSAL_SENT", "DEAL_WON", "DEAL_LOST", "INACTIVE_LEAD",
] as const;

export const automationActions = [
  "SEND_EMAIL", "SEND_SMS", "SEND_WHATSAPP", "CREATE_TASK", "UPDATE_LEAD", "ADD_TAG", "MOVE_PIPELINE_STAGE", "WAIT", "NOTIFY_ADMIN",
] as const;

export const messageTemplates = {
  newLead: "Hi {{first_name}}, this is Flow AI from CoachFlow. I received your client acquisition information and will help identify where your current client journey may be leaking. You can continue here: {{link}}",
  bookingConfirmation: "Hi {{first_name}}, your strategy call is confirmed for {{date}} at {{time}}. Meeting link: {{meeting_link}}. Looking forward to speaking with you.",
  reminder: "Quick reminder, {{first_name}} — your strategy call is tomorrow at {{time}}.",
  sameDay: "Your strategy call starts in {{time}}. Join here: {{meeting_link}}",
  noShow: "Looks like we missed you today. If you would still like to review your client acquisition system, you can reschedule here: {{reschedule_link}}",
};

export function consentAllows(channel: MessagingChannel, contact: { emailConsent: number; smsConsent: number; whatsappConsent: number; marketingConsent: number }) {
  if (!contact.marketingConsent) return false;
  if (channel === "email") return Boolean(contact.emailConsent);
  if (channel === "sms") return Boolean(contact.smsConsent);
  return Boolean(contact.whatsappConsent);
}

export function queueMessage(channel: MessagingChannel, template: string, consented: boolean) {
  if (!consented) return { queued: false, reason: "Consent required before sending marketing communications." } as const;
  return { queued: true, channel, template } as const;
}
