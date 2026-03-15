---
phase: 01-universal-group-product-aware-agent
verified: 2026-03-13T23:15:00Z
status: human_needed
score: 9/9 must-haves verified
re_verification: false
human_verification:
  - test: "POST /api/onboarding/start with a real tenant that has active ServiceInstances"
    expected: "WhatsApp group created named '[BusinessName] -- SuperSeller AI', icon set from Brand logo, description lists products, welcome message lists products with hints, AI agent responds with product awareness"
    why_human: "Requires live WAHA connection, real WhatsApp group creation, and visual confirmation of group name/icon/description/welcome message"
---

# Phase 01: Universal Group + Product-Aware Agent Verification Report

**Phase Goal:** When admin triggers onboarding for a tenant, system creates a WhatsApp group, reads the tenant's products (ServiceInstance + Subscription), assembles a product-aware system prompt, registers the AI agent, and sends a personalized welcome.
**Verified:** 2026-03-13T23:15:00Z
**Status:** human_needed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | System reads tenant's ServiceInstance + Subscription records to determine products | VERIFIED | `prompt-assembler.ts:67-132` queries both tables with raw SQL, joins Subscription through TenantUser, deduplicates by productName |
| 2 | System prompt is assembled dynamically based on active products | VERIFIED | `prompt-assembler.ts:140-192` builds Role/Products/Modules/Rules/Language sections; includes product list and module hints |
| 3 | Agent knows which onboarding modules to activate based on product mix | VERIFIED | `prompt-assembler.ts:24-59` MODULE_HINTS maps product names to onboarding descriptions with fuzzy matching fallback |
| 4 | WhatsApp group is created with correct name, icon, and description | VERIFIED | `group-bootstrap.ts:96-139` creates group named `{name} -- SuperSeller AI`, sets icon from Brand.logoUrl, sets description with product list |
| 5 | Agent is registered in group_agent_config with product-aware prompt | VERIFIED | `group-bootstrap.ts:142-150` calls registerGroup with systemPromptAdditions = assembled product prompt |
| 6 | Welcome message lists the specific products the customer has | VERIFIED | `group-bootstrap.ts:153-171` builds welcome with per-product lines including module hints |
| 7 | Admin can trigger onboarding via POST /api/onboarding/start with tenantId + clientPhone | VERIFIED | `routes.ts:39-63` endpoint with zod validation (UUID + min 8 chars) |
| 8 | Endpoint returns groupId, pipelineRunId, and product list on success | VERIFIED | `routes.ts:52-58` returns 201 with ok, groupId, pipelineRunId, tenantName, products[] |
| 9 | Endpoint returns 400 for missing params and 500 with error on failure | VERIFIED | `routes.ts:42-43` returns 400 with zod flatten; `routes.ts:60-61` returns 500 with error message |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/worker/src/services/onboarding/prompt-assembler.ts` | Dynamic system prompt assembly from tenant products | VERIFIED | 193 lines, exports assembleProductPrompt, fetchTenantProducts, getProductModuleHints, ProductInfo |
| `apps/worker/src/services/onboarding/prompt-assembler.test.ts` | Tests for prompt assembly | VERIFIED | 130 lines, 11 test cases covering single/multi/zero products, dedup, hints, language |
| `apps/worker/src/services/onboarding/group-bootstrap.ts` | Universal WhatsApp group creation + agent registration | VERIFIED | 209 lines, exports bootstrapOnboardingGroup, OnboardingBootstrapResult |
| `apps/worker/src/api/routes.ts` | POST /api/onboarding/start endpoint | VERIFIED | Endpoint at line 39, imports bootstrapOnboardingGroup, zod validation, 201/400/500 responses |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| prompt-assembler.ts | ServiceInstance + Subscription tables | raw SQL query | WIRED | Line 75: `SELECT...FROM "ServiceInstance" WHERE "tenantId" = $1`; Line 88: `SELECT...FROM "Subscription" s JOIN "TenantUser" tu` |
| group-bootstrap.ts | waha-client.ts | createGroup, setGroupIcon, setGroupDescription, sendText | WIRED | Line 17-21: imports all four functions; used at lines 101, 121, 139, 171 |
| group-bootstrap.ts | group-agent.ts | registerGroup with product-aware systemPromptAdditions | WIRED | Line 22: imports registerGroup; line 142: calls with systemPromptAdditions = productPrompt |
| group-bootstrap.ts | prompt-assembler.ts | assembleProductPrompt(tenantId) | WIRED | Line 26: imports assembleProductPrompt + getProductModuleHints; line 79: calls assembleProductPrompt(tenantId) |
| routes.ts /api/onboarding/start | onboarding/group-bootstrap.ts | bootstrapOnboardingGroup(tenantId, clientPhone) | WIRED | Line 26: import; line 50: call with destructured params from zod-validated body |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| UGRP-01 | 01-02 | Admin can trigger onboarding via POST /api/onboarding/start | SATISFIED | routes.ts:39 endpoint exists with zod validation |
| UGRP-02 | 01-01 | System auto-creates WhatsApp group named "[BusinessName] -- SuperSeller AI" | SATISFIED | group-bootstrap.ts:96 template string |
| UGRP-03 | 01-01 | System reads ServiceInstance + Subscription for products | SATISFIED | prompt-assembler.ts:67-132 queries both tables |
| UGRP-04 | 01-01 | Group icon set from Brand logo | SATISFIED | group-bootstrap.ts:120-129 setGroupIcon from brand.logo_url |
| UGRP-05 | 01-01 | Group description includes customer name and product list | SATISFIED | group-bootstrap.ts:132-139 description with tenant.name + product list |
| PAGENT-01 | 01-01 | AI agent registered with product-aware system prompt | SATISFIED | group-bootstrap.ts:142-150 registerGroup with systemPromptAdditions |
| PAGENT-02 | 01-01 | System prompt assembled dynamically from active products | SATISFIED | prompt-assembler.ts:140-192 assembleProductPrompt |
| PAGENT-03 | 01-01 | Agent knows which modules to activate based on product mix | SATISFIED | prompt-assembler.ts:24-59 MODULE_HINTS with product-to-module mapping |
| PAGENT-04 | 01-01 | Agent sends personalized welcome listing products | SATISFIED | group-bootstrap.ts:153-171 welcome message with per-product hints |
| PAGENT-05 | 01-01 | Agent can handle general Q&A about any product customer has | SATISFIED | prompt-assembler.ts:153-173 product sections in system prompt give agent awareness of all products |

No orphaned requirements for Phase 1. All 10 requirement IDs from plans are accounted for in REQUIREMENTS.md.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| -- | -- | -- | -- | -- |

No TODOs, FIXMEs, placeholders, empty implementations, or console.log-only handlers found in any phase artifacts.

### Human Verification Required

### 1. End-to-End WhatsApp Group Creation

**Test:** Deploy worker to RackNerd, find a tenant with active ServiceInstances, call `POST /api/onboarding/start` with real tenantId and phone number.
**Expected:** WhatsApp group appears on phone named "[BusinessName] -- SuperSeller AI", group icon is the brand logo, description lists active products, welcome message names each product with onboarding hints, AI agent responds to messages with product-aware context.
**Why human:** Requires live WAHA connection, real WhatsApp delivery, and visual confirmation of group metadata and message content.

### Gaps Summary

No gaps found. All 9 observable truths verified at all three levels (exists, substantive, wired). All 10 requirement IDs satisfied. All 4 commits verified in git history (15e2da71, 9f268ec7, a81e2d90, 2e4ba9e5). No anti-patterns detected.

The only remaining verification is live end-to-end testing with a real tenant and WAHA connection, which requires human confirmation.

---

_Verified: 2026-03-13T23:15:00Z_
_Verifier: Claude (gsd-verifier)_
