# DeliveryFlow - Core Modules & Business Rules

**Document ID:** DF-SRS-08  
**Target Audience:** Backend Engineers, QA Teams, Business Analysts

This document defines the strict 13-point business rules for the supporting modules that are critical to the platform's operation but were not explicitly broken out into standalone engines.

---

## Module A: Authentication & Access Control (RBAC)

**1. Business Purpose:** Ensure strict data privacy and secure access to proprietary execution data.
**2. Problem Being Solved:** Unauthorized access to corporate strategic roadmaps and performance data could lead to insider trading or competitive disadvantage.
**3. Current Industry Challenges:** Maintaining role consistency between the ALM tool (Jira) and the reporting layer.
**4. User Workflow:** User accesses URL -> Redirects to Corporate SSO (Okta) -> Authenticates -> Returns to DeliveryFlow dashboard.
**5. User Journey:** A new PMO joins. The Admin provisions them in Okta. DeliveryFlow auto-creates their profile on first login via Just-In-Time (JIT) provisioning.
**6. Functional Requirements:** Must support SAML 2.0 and OIDC. Must support local fallback for admins.
**7. Business Rules:** A user cannot view a project unless they are explicitly assigned to it or possess the `GLOBAL_VIEWER` role.
**8. Validation Rules:** Passwords (if local) must be > 12 chars, containing uppercase, lowercase, number, and symbol.
**9. Edge Cases:** User is removed from Okta while maintaining an active session in DeliveryFlow.
**10. Error Handling:** If SSO fails, display generic "Authentication Error" without leaking identity provider details.
**11. Security Considerations:** JWT tokens must expire every 60 minutes. Refresh tokens are stored securely in HTTP-only cookies.
**12. Acceptance Criteria:** User logs in via SSO. User attempts to access a restricted project URL and is redirected to a 403 Forbidden page.
**13. Future Enhancements:** Granular Field-Level Security (FLS) to hide specific financial data within a project.

---

## Module B: Executive Reporting

**1. Business Purpose:** Automate the distribution of objective project status to C-suite stakeholders.
**2. Problem Being Solved:** PMOs waste thousands of hours annually copying/pasting charts from Jira into PowerPoint.
**3. Current Industry Challenges:** BI tools like Tableau require complex SQL knowledge to build reports. Native Jira reports are not executive-friendly.
**4. User Workflow:** User clicks "New Report" -> Selects template -> Selects Portfolio -> Clicks "Generate" -> PDF downloads.
**5. User Journey:** Elena (Executive) wants a Friday update. Patricia (PMO) configures a scheduled report. Every Friday at 8 AM, Elena receives a PDF in her inbox.
**6. Functional Requirements:** PDF generation engine (e.g., Puppeteer/wkhtmltopdf). Scheduled Cron jobs.
**7. Business Rules:** A report schedule must be owned by an active user. If the user is deactivated, the schedule pauses.
**8. Validation Rules:** Cron expressions must be validated before saving to prevent infinite loop generation (e.g., cannot schedule per-minute).
**9. Edge Cases:** PDF generation takes longer than the 30-second HTTP timeout due to massive graph rendering.
**10. Error Handling:** If generation times out, fallback to an async background job and email the user when it's ready.
**11. Security Considerations:** PDFs containing sensitive strategic data must not be stored in publicly accessible S3 buckets. Presigned URLs must be used.
**12. Acceptance Criteria:** Given a scheduled report, when Friday 8 AM occurs, a PDF containing the exact Health Scores is emailed to the subscriber list.
**13. Future Enhancements:** AI-generated PowerPoint (.pptx) exports where each slide is a different project with AI talking points in the notes section.

---

## Module C: Integrations (Webhook Ingestion)

**1. Business Purpose:** The platform is useless without real-time data from external execution systems.
**2. Problem Being Solved:** Polling APIs every 5 minutes hits rate limits. We need a push-based architecture.
**3. Current Industry Challenges:** Webhooks frequently fail, timeout, or deliver out of order, leading to corrupted state databases.
**4. User Workflow:** Admin generates a unique Webhook URL in DeliveryFlow -> Pastes it into Jira settings -> Clicks "Test Sync".
**5. User Journey:** Devin completes a ticket in Jira. Jira fires a webhook. DeliveryFlow ingests it, recalculates health, and updates the UI via WebSockets.
**6. Functional Requirements:** Ingestion service must acknowledge (202 Accepted) webhooks within 200ms before processing.
**7. Business Rules:** Webhooks from unknown IPs or without valid HMAC signatures are immediately dropped.
**8. Validation Rules:** The JSON payload schema must be validated against expected provider schemas before queuing in Kafka.
**9. Edge Cases:** Jira goes down and sends 10,000 webhooks at once when it recovers (Thundering Herd problem).
**10. Error Handling:** If processing a webhook fails 3 times in Kafka, it is routed to a Dead Letter Queue (DLQ) for manual inspection.
**11. Security Considerations:** Webhook endpoints are exposed to the public internet. Rate limiting (e.g., max 1000 requests/sec per tenant) must be enforced at the API Gateway.
**12. Acceptance Criteria:** Given a valid Jira webhook payload sent to the endpoint, the system returns 202 immediately and the database is updated within 2 seconds.
**13. Future Enhancements:** Two-way sync: DeliveryFlow AI recommendations automatically creating new Jira tasks when approved by a human.
