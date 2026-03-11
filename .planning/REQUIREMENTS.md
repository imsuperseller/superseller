# Requirements: Admin Command Center

## R1: Real Project Data Model
- R1.1: Create `Project` Prisma model with: name, description, type (internal/customer/infrastructure/external), status, progress, pillar, owner, dates, metadata JSON
- R1.2: Create `ProjectMilestone` model linked to Project
- R1.3: Create `ProjectTask` model linked to Project
- R1.4: CRUD API routes: POST/GET/PATCH/DELETE `/api/admin/projects`
- R1.5: Replace fake ServiceInstance/WhatsAppInstance synthesis with real Project queries
- R1.6: Real stats (not hardcoded 12/2/45/8) calculated from DB

## R2: Customer Audit System (SuperSeller Playbook)
- R2.1: Create `AuditTemplate` model — stores section/question definitions (the 10 sections, 130+ questions from playbook)
- R2.2: Create `AuditInstance` model — one per customer, linked to Project
- R2.3: Create `AuditResponse` model — one per question per instance (status, answer, notes)
- R2.4: Seed SuperSeller Business Audit template from docx (10 sections, all questions)
- R2.5: Admin UI to view/fill audit per customer
- R2.6: Progress tracking per section and overall

## R3: Rensto Operations Playbook
- R3.1: Seed Rensto playbook as second audit template (11 sections, 140+ questions)
- R3.2: Rensto appears as an external project on admin
- R3.3: City launch tracking per Rensto market

## R4: CI Pipeline + Code Health
- R4.1: Create `CiRun` Prisma model (commitSha, branch, schemaStatus, test results, duration)
- R4.2: GitHub Actions workflow: schema sentinel + vitest web + vitest worker on every push
- R4.3: POST `/api/admin/ci-status` endpoint (GitHub Actions writes results)
- R4.4: GET `/api/admin/ci-status` endpoint (Mission Control reads)
- R4.5: Mission Control Code Health category reads live from CiRun table
- R4.6: Schema drift = CI failure = red on dashboard

## R5: Multi-Project Portfolio
- R5.1: Show GitHub commit activity for all repos (SuperSeller, Rensto, Iron Dome, Yoram)
- R5.2: Show Vercel deploy status for all projects
- R5.3: External projects registered as Project records with type="external"
- R5.4: GitHub API + Vercel API integration using existing PATs/tokens
- R5.5: Future-proof: add new projects via admin UI

## R6: Unified Alert Engine
- R6.1: Merge WhatsApp + email + GitHub issue alerting into one engine
- R6.2: All alerts written to `AlertHistory` table with project linkage
- R6.3: CI failure → instant WhatsApp to Shai
- R6.4: Health check failure → WhatsApp (with cooldowns from existing alert-engine.ts)
- R6.5: Alert history visible on System Monitor tab
- R6.6: Recovery notifications (service back up → WhatsApp)

## R7: Existing Customer Data Seeding
- R7.1: Seed UAD as Project + AuditInstance with known data
- R7.2: Seed MissParty as Project + AuditInstance with known data
- R7.3: Seed Elite Pro as Project + AuditInstance with known data
- R7.4: Seed Yoram as Project + AuditInstance with known data
- R7.5: Seed internal projects: CI Pipeline, Schema Health, Video Pipeline

## R8: Residue & Reference Audit
- R8.1: Scan all docs for stale references (dead URLs, deprecated services)
- R8.2: Cross-check memory files against current reality
- R8.3: Clean up contradictions between docs
- R8.4: Track as a Project on admin

## R9: Agent Integration
- R9.1: After every task, agent creates/updates Project record via API
- R9.2: progress.md updates continue but admin is primary SSOT
- R9.3: Document the API contract for programmatic project updates
