# Roadmap: Universal Customer Onboarding System

**Core Value:** Every customer gets an AI agent in a WhatsApp group from Day 1 — product-aware, zero friction

## Milestones

- ✅ **v1.0 MVP** — Phases 1-6 (shipped 2026-03-15) — [Archive](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Intelligent Content Engine** — Phases 07-10 (shipped 2026-03-15) — [Archive](milestones/v1.1-ROADMAP.md)
- ✅ **v1.2 Production-Ready Onboarding** — Phases 12-14 (shipped 2026-03-15) — [Archive](milestones/v1.2-ROADMAP.md)
- 🚧 **v1.3 Character Iteration** — Phases 15-19 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-6) — SHIPPED 2026-03-15</summary>

- [x] Phase 1: Universal Group + Product-Aware Agent (2/2 plans) — completed 2026-03-12
- [x] Phase 2: Onboarding Modules — Asset, Social, Compete (3/3 plans) — completed 2026-03-13
- [x] Phase 3: Character Questionnaire (1/1 plan) — completed 2026-03-13
- [x] Phase 3.1: Multi-Model Best Shot Routing (2/2 plans) — completed 2026-03-13
- [x] Phase 4: Character Video Gen + Delivery (3/3 plans) — completed 2026-03-14
- [x] Phase 5: Pipeline Orchestration (2/2 plans) — completed 2026-03-14
- [x] Phase 6: Fix Social Intro + Poll Vote (2/2 plans) — completed 2026-03-14

</details>

<details>
<summary>✅ v1.1 Intelligent Content Engine (Phases 07-10) — SHIPPED 2026-03-15</summary>

- [x] Phase 07: Provider Foundation (2/2 plans) — completed 2026-03-15
- [x] Phase 08: Provider Activation (2/2 plans) — completed 2026-03-15
- [x] Phase 09: Quality Feedback Loop (3/3 plans) — completed 2026-03-15
- [x] Phase 10: Remotion Templates (1/1 plan) — completed 2026-03-15

</details>

<details>
<summary>✅ v1.2 Production-Ready Onboarding (Phases 12-14) — SHIPPED 2026-03-15</summary>

- [x] Phase 12: Payment Webhooks (4/4 plans) — completed 2026-03-15
- [x] Phase 13: Voice Note Transcription (2/2 plans) — completed 2026-03-15
- [x] Phase 14: Language Detection (1/1 plan) — completed 2026-03-15

</details>

### 🚧 v1.3 Character Iteration (In Progress)

**Milestone Goal:** Let customers request changes to their AI character and regenerate scenes through WhatsApp — iterative refinement until they're satisfied, with credit transparency and admin oversight.

- [x] **Phase 15: Tech Debt Fixes** — Wire admin failure alerts and fix cost tracking provider attribution (completed 2026-03-15)
- [x] **Phase 16: Change Request Intake** — Natural-language intent classification, CharacterBible versioning, credit confirmation gate (completed 2026-03-15)
- [ ] **Phase 17: Scene-Level Regeneration** — Single-scene regen loop with mixed-scene assembly and WhatsApp delivery
- [ ] **Phase 18: Character-Level Changes** — CharacterBible delta + multi-scene regen with admin approval gate
- [ ] **Phase 19: Admin Tooling** — Version history, rollback, change request audit log in admin portal

## Phase Details

### Phase 15: Tech Debt Fixes
**Goal**: Load-bearing bugs that would corrupt budget gates and swallow generation failures are fixed before any iteration code ships
**Depends on**: Nothing (prerequisite fixes)
**Requirements**: DEBT-01, DEBT-02
**Success Criteria** (what must be TRUE):
  1. When a Remotion render fails after all retries, admin receives a WhatsApp message with the error and the customer receives a "our team will follow up" message — no silent failures
  2. Cost entries in `api_expenses` show the correct provider (`fal` or `kie.ai`) based on which model actually ran the job, not a hardcoded label
  3. Pipelines missing `admin_phone` fall back to the configured default admin number rather than throwing a null error
**Plans:** 2/2 plans complete
Plans:
- [ ] 15-01-PLAN.md — Admin failure alerts + customer messaging + admin phone fallback
- [ ] 15-02-PLAN.md — Cost tracking provider attribution fix + backfill migration

### Phase 16: Change Request Intake
**Goal**: Customers can send natural-language change requests after receiving their character video, see a cost estimate, confirm via poll, and have their intent correctly classified — no generation triggered yet
**Depends on**: Phase 15
**Requirements**: INTAKE-01, INTAKE-02, INTAKE-03, INTAKE-04, CHAR-01
**Success Criteria** (what must be TRUE):
  1. Customer sends a WhatsApp message like "make her hair shorter" after video delivery and the system responds with the classified intent and affected scope (not the questionnaire)
  2. Customer receives a cost estimate poll ("Scene regen will use X credits — proceed?") and no generation is dispatched until they confirm Yes
  3. System correctly extracts scene numbers from natural-language references ("scene 3", "the third one", "the coffee shop scene")
  4. A new CharacterBible version row is inserted for every approved change (old version preserved, rollback possible)
  5. Every change request is logged with intent, scope, and status from the moment it is received
**Plans:** 2/2 plans complete
Plans:
- [ ] 16-01-PLAN.md — DB schema + intent classifier + CharacterBible versioning services
- [ ] 16-02-PLAN.md — Post-delivery routing + credit confirmation poll + pipeline wiring

### Phase 17: Scene-Level Regeneration
**Goal**: Customers can regenerate a single scene without touching approved scenes, and receive the updated reveal video via WhatsApp
**Depends on**: Phase 16
**Requirements**: REGEN-01, REGEN-02, REGEN-03, ASSEM-01
**Success Criteria** (what must be TRUE):
  1. Customer requests a change to scene 2; scenes 1, 3, 4, 5 are untouched in the final delivered video
  2. Per-scene status (`approved / pending / rejected`) is tracked in the database and drives which scenes are re-rendered versus reused
  3. Customer receives exactly two WhatsApp messages: an acknowledgment at request start and the new video at completion — nothing in between
  4. Remotion CharacterReveal re-renders correctly with a mix of original and newly generated scene URLs
**Plans**: TBD

### Phase 18: Character-Level Changes
**Goal**: Customers can request changes to the character itself (appearance, personality, style), triggering a versioned CharacterBible update and selective multi-scene regen after admin approval
**Depends on**: Phase 17
**Requirements**: CHAR-02, CHAR-03, CHAR-04, ASSEM-02
**Success Criteria** (what must be TRUE):
  1. Customer says "make her more casual" and the system produces a CharacterBible diff, identifies affected scenes via field-to-scene mapping, and sends admin a review notification with scope and cost estimate before dispatching any generation
  2. Admin can approve the full scope, narrow the scope to specific scenes, or deny the request — all via WhatsApp
  3. After admin approval, only the affected scenes are regenerated and the updated reveal video is delivered to the customer with approve/change options
  4. A name-only change (no visual scenes affected) costs $0 AI generation — the existing video is re-delivered with an updated caption
**Plans**: TBD

### Phase 19: Admin Tooling
**Goal**: Admin can view the full history of character changes, roll back to any previous CharacterBible version, and audit per-customer iteration spend
**Depends on**: Phase 18
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03
**Success Criteria** (what must be TRUE):
  1. Admin portal shows a per-character timeline of CharacterBible versions with the diff and cost for each change
  2. Admin can roll back a character to any previous version with one click and a confirmation step
  3. Every change request in the audit log shows intent classification, scenes triggered, and cost in cents
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Universal Group + Agent | v1.0 | 2/2 | Complete | 2026-03-12 |
| 2. Onboarding Modules | v1.0 | 3/3 | Complete | 2026-03-13 |
| 3. Character Questionnaire | v1.0 | 1/1 | Complete | 2026-03-13 |
| 3.1. Best Shot Routing | v1.0 | 2/2 | Complete | 2026-03-13 |
| 4. Character Video Gen | v1.0 | 3/3 | Complete | 2026-03-14 |
| 5. Pipeline Orchestration | v1.0 | 2/2 | Complete | 2026-03-14 |
| 6. Fix Social + Poll Vote | v1.0 | 2/2 | Complete | 2026-03-14 |
| 07. Provider Foundation | v1.1 | 2/2 | Complete | 2026-03-15 |
| 08. Provider Activation | v1.1 | 2/2 | Complete | 2026-03-15 |
| 09. Quality Feedback Loop | v1.1 | 3/3 | Complete | 2026-03-15 |
| 10. Remotion Templates | v1.1 | 1/1 | Complete | 2026-03-15 |
| 12. Payment Webhooks | v1.2 | 4/4 | Complete | 2026-03-15 |
| 13. Voice Note Transcription | v1.2 | 2/2 | Complete | 2026-03-15 |
| 14. Language Detection | v1.2 | 1/1 | Complete | 2026-03-15 |
| 15. Tech Debt Fixes | v1.3 | 2/2 | Complete | 2026-03-15 |
| 16. Change Request Intake | 2/2 | Complete   | 2026-03-15 | - |
| 17. Scene-Level Regeneration | v1.3 | 0/TBD | Not started | - |
| 18. Character-Level Changes | v1.3 | 0/TBD | Not started | - |
| 19. Admin Tooling | v1.3 | 0/TBD | Not started | - |

---
*Created: 2026-03-13*
*Updated: 2026-03-15 — Phase 16 plans created (2 plans, waves 1-2)*
