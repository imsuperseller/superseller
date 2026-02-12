# Project Constitution (GEMINI.MD) - "The Law"

## 1. Mission & Authority
**Objective**: Transform "Rensto Site" into the "Antigravity" example implementation.
**Authority**: This document is "The Law". All architectural decisions must align with Section 3, 4, and 5.
**Frameworks**:
- **B.L.A.S.T. Protocol**: Blueprint, Link, Architect, Stylize, Trigger.
- **A.N.T. Architecture**: Architecture, Navigation, Tools.

## 2. Core Constraints
- **Styling**: **Tailwind CSS** is mandatory. Vanilla CSS is forbidden for new components.
- **Stack**: Next.js 14, Shadcn/UI, Lucide, PostgreSQL + Redis (primary), AITable (CRP).
- **Aesthetics**: **Linear Aesthetic** (#0A0A0A background). Smooth GSAP animations mandatory for Hero/Top-level.

## 3. Data Residency (Master Protocol)
- **Primary Database**: **PostgreSQL + Redis** is the System of Record for all app and customer data (Service instances, customers, payments, leads). Migration from Firestore completed February 2026.
- **Primary CRM**: **AITable** is the System of Record for all Business Truth (Leads, Clients, Billing).
- **Legacy/Fallback**: **Firestore** remains available as legacy/fallback only (not primary).
- **Sync Protocol**: Captured leads flow PostgreSQL -> AITable via `tools/sync_leads_to_aitable.js`.

## 4. JSON Data Schema (The "Bones")

### Lead (The "Payload")
```json
{
  "id": "string",
  "userId": "string",
  "source": "whatsapp | linkedin | google_maps | manual",
  "leadStatus": "new | qualified | booked | converted | lost",
  "data": { "name": "string", "email": "string", "phone": "string", "company": "string" },
  "speedToLead": { "responseTime": "number", "status": "excellent | good | poor" }
}
```

### Token (The "Economy")
```json
{
  "id": "string",
  "userId": "string",
  "balance": "number",
  "transactions": [{ "amount": "number", "type": "credit | debit", "timestamp": "date" }]
}
```

## 5. Deployment & Maintenance
- **Vercel**: `rensto-site` is the canonical production deployment.
- **Purge Rule**: Documentation redundant with NotebookLM must be removed from the local codebase to prevent drift.
