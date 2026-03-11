# Phase 1: Data Foundation — Context

**Gathered:** 2026-03-11
**Status:** Ready for planning
**Source:** PRD Express Path (SuperSeller New Business Audit.docx + Rensto Operations Playbook.docx + admin dashboard audit)

<domain>
## Phase Boundary

Build the database models and API layer that all subsequent phases depend on:
- Real `Project` model replacing the fake ServiceInstance/WhatsAppInstance synthesis
- Audit template system that can store any business playbook (SuperSeller's 10 sections/130 questions, Rensto's 11 sections/140 questions, future templates)
- CRUD API routes for projects and audits
- Replace hardcoded stats with real DB queries

</domain>

<decisions>
## Implementation Decisions

### Project Model
- `Project` table with: id, name, description, type (internal/customer/infrastructure/external), status (planning/in_progress/verification/completed/blocked), progress (0-100), pillar, ownerId, tenantId, githubRepo, vercelProjectId, startDate, dueDate, metadata JSON, createdAt, updatedAt
- `ProjectMilestone` linked to Project: title, dueDate, status, order
- `ProjectTask` linked to Project: title, description, status, assigneeId, order
- Keep existing ServiceInstance/WhatsAppInstance tables — they track SaaS provisioning, not projects. Add optional `projectId` FK to link them.

### Audit Template System (from SuperSeller Business Audit docx)
- `AuditTemplate` — defines a playbook type (e.g., "SuperSeller New Business Onboarding", "Rensto City Launch")
- `AuditSection` — one per section (e.g., "Business Fundamentals", "Org Structure & People") with order
- `AuditItem` — one per question/task within a section, with order
- `AuditInstance` — one per customer engagement, linked to Project + AuditTemplate
- `AuditResponse` — one per item per instance (status: pending/complete/na, answer text, notes)

### SuperSeller Playbook Sections (10 sections from docx)
1. Business Fundamentals (11 questions)
2. Org Structure & People (12 questions)
3. Full Systems Inventory (17 questions)
4. Cost & Contract Audit (10 questions)
5. Data Flow & Process Mapping (16 questions)
6. Customer Experience Audit (12 questions)
7. Security & Access Audit (10 questions)
8. AI Automation Opportunity Map (13 questions)
9. Quick Wins vs Long-Term Projects (8 questions)
10. Documentation Deliverables (8 questions)

### Rensto Playbook Sections (11 sections from docx)
1. Directory Business Model & Revenue (12 questions)
2. Platform & Tech Stack Inventory (18 questions)
3. Contractor Supply Side (14 questions)
4. Homeowner/Search Demand Side (15 questions)
5. New City Launch Playbook (14 questions)
6. Data Flow & Operations (14 questions)
7. Security & Access Audit (10 questions)
8. Competitive Analysis (10 questions)
9. Automation & Growth Opportunities (12 questions)
10. Quick Wins vs Long-Term Projects (8 questions)
11. Documentation Deliverables (8 questions)

### API Routes
- Replace `/api/admin/projects` GET to query real Project table
- Add POST/PATCH/DELETE to same route
- New `/api/admin/audits` route for audit template + instance management
- New `/api/admin/audits/[instanceId]/responses` for filling out audit items

### Claude's Discretion
- Exact Prisma field types and indexes
- API response pagination strategy
- Whether to use Prisma relations or manual JOINs for audit queries
- Migration strategy (prisma db push vs migration files)

</decisions>

<specifics>
## Specific Ideas

- The SuperSeller playbook's "AI Automation Opportunity Map" section maps directly to our product offerings (FB Bot, VideoForge, FrontDesk, etc.) — each question could auto-suggest relevant SuperSeller products
- The "Cost & Contract Audit" section data could feed into the Treasury tab
- The "Systems Inventory" data could feed into Mission Control for per-customer health monitoring
- AuditTemplate should be versioned so we can update playbooks without breaking existing instances

</specifics>

<deferred>
## Deferred Ideas

- Outlook calendar sync for project milestones (outlookEventId field exists but won't be wired in Phase 1)
- Per-customer Mission Control dashboards (Phase 6)
- Auto-suggesting AI crew members based on audit responses (future product feature)
- Customer self-service audit portal (future — admin-only for now)

</deferred>

---

*Phase: 01-data-foundation*
*Context gathered: 2026-03-11 via PRD Express Path*
