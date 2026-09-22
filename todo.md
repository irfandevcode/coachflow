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
- [x] Added immutable form-submission history with attribution, duplicate-safe contact/lead upsert, automation events, consent history, analytics events, explicit audit category scores, and explainable score factors.
- [x] Added admin CRM directory search/stage filter, CSV lead export, `/admin/crm`, `/admin/forms`, richer lead profiles, form submission history, audit history, appointment history, and Flow AI conversation history surfaces.
- [x] Added external calendar event deduplication checks and stored lead timeline / analytics events for pipeline changes and bookings.
- [x] Generated and applied the additive Drizzle migration `drizzle/0002_simple_crusher_hogan.sql`.
- [x] Added unit coverage for audit CRM persistence, scoring, and consent-aware messaging.

## Verification

- `pnpm check` passes.
- `pnpm test` passes: 6 test files, 10 tests.
- `pnpm build` passes.
- Desktop and mobile screenshots reviewed for `/audit`, `/book`, and `/crm`.
- `/admin/crm` and `/admin/forms` routes verified; protected admin access remains enforced.
- WhatsApp link and number verified in source and in the booking-page screenshot; API-based WhatsApp sending remains disabled until Business API credentials are configured.
- Live verification completed with `crm-verification-20260921@example.com`: one Free Funnel Audit submission, one lead/contact identity, one audit result, three timeline events, and one follow-up task were returned from the persistent CRM data layer with all submitted answers intact.
- Repaired live schema drift by adding the missing nullable `leads.sourceDetail` column; audit submission and CRM directory now complete successfully.

## Provider configuration notes

Set server-side environment variables when ready:

- `CALENDAR_PROVIDER`, `CALENDLY_BOOKING_URL`, optional `CALENDLY_API_KEY`
- `EMAIL_PROVIDER`, `EMAIL_API_KEY`
- `SMS_PROVIDER`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `WHATSAPP_PROVIDER`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`

Provider credentials are never exposed to the browser. Until configured, provider actions remain visible as ready-to-connect CRM blueprints and no outbound message is sent.

## Architecture note

The attached brief names PostgreSQL + Prisma, but this existing WebDev project is scaffolded and deployed with the managed `DATABASE_URL` MySQL/TiDB connection and Drizzle ORM. The CRM work was added additively on that existing production data layer so the Flow AI application and auth remain intact; switching databases/ORMs would require a separate infrastructure migration and connection approval.
