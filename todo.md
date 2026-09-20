# CoachFlow CRM and client acquisition upgrade

## Completed

- [x] Added WhatsApp click-to-chat for **+91 75698 19144**, including booking-page CTA, prefilled message, footer contact link, CRM booking capture, and public provider configuration.

- [x] Added CRM data model for contacts, leads, audit records, conversations, appointments, tasks, forms, form submissions, automations, timeline events, and consent records.
- [x] Connected the six-step client acquisition audit to contact creation, deterministic scoring, audit records, attribution, and pipeline entry.
- [x] Added score bands: Low Intent, Warm, Qualified, and High Intent.
- [x] Added a CRM admin workspace with dashboard metrics, lead/contact views, draggable pipeline, appointment view, task list, reusable forms, automations, provider readiness, analytics, and contact timeline.
- [x] Added public booking flow with required lead fields, consent checkboxes, CRM appointment request, and Calendly booking URL abstraction.
- [x] Added chat-to-audit CTA and retained guided Flow AI consultation qualification.
- [x] Added consent-aware email/SMS/WhatsApp abstractions and message templates; no outbound message sends without recorded consent.
- [x] Added admin procedures for pipeline updates, tasks, forms, automations, provider status, and CRM overview.
- [x] Generated and applied the additive Drizzle migration `drizzle/0002_simple_crusher_hogan.sql`.
- [x] Added unit coverage for audit CRM persistence, scoring, and consent-aware messaging.

## Verification

- `pnpm check` passes.
- `pnpm test` passes: 6 test files, 9 tests.
- `pnpm build` passes.
- Desktop and mobile screenshots reviewed for `/audit`, `/book`, and `/crm`.
- WhatsApp link and number verified in source and in the booking-page screenshot; API-based WhatsApp sending remains disabled until Business API credentials are configured.

## Provider configuration notes

Set server-side environment variables when ready:

- `CALENDAR_PROVIDER`, `CALENDLY_BOOKING_URL`, optional `CALENDLY_API_KEY`
- `EMAIL_PROVIDER`, `EMAIL_API_KEY`
- `SMS_PROVIDER`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `WHATSAPP_PROVIDER`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`

Provider credentials are never exposed to the browser. Until configured, provider actions remain visible as ready-to-connect CRM blueprints and no outbound message is sent.
