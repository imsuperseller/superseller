---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_plan: Not started
status: completed
stopped_at: Completed 05-02-PLAN.md
last_updated: "2026-03-15T03:14:30.139Z"
progress:
  total_phases: 6
  completed_phases: 6
  total_plans: 13
  completed_plans: 13
  percent: 100
---

# State: Universal Customer Onboarding System

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-13)

**Core value:** Every customer gets an AI agent in a WhatsApp group from Day 1 — product-aware, zero friction
**Current focus:** Phase 2 — Onboarding Modules (Asset, Social, Compete)

## Current Phase

**Phase:** 2 — Onboarding Modules (Asset, Social, Compete)
**Status:** Milestone complete
**Current Plan:** Not started
**Progress:** [██████████] 100%

## Decisions

- Used `Brand` table (not `TenantBrand`) — matches current Prisma schema
- Pass inputJson as object to createPipelineRun (avoids double-stringify bug)
- ServiceInstance takes priority over Subscription when deduplicating products
- Auto-approved human-verify checkpoint for 01-02: type-check clean, worker healthy, WhatsApp test deferred to integration
- SocialHub triggers asset-collection first (highest priority visual product) before social-setup
- Module loader uses lazy dynamic imports for graceful handling of not-yet-implemented modules
- Fallback intro messages hardcoded in router for pre-implementation phase
- Simplified competitor data to name + freeform details (not separate URL/location fields)
- Module router in ClaudeClaw uses lazy import and try/catch for non-critical fallthrough
- [Phase 02-02]: Reused ep-asset-ingestion.ts media download pattern for asset collection module
- [Phase 02-02]: Social setup stores preferences only (no credentials) in ServiceInstance.configuration with JSON merge
- [Phase 03-01]: Used direct fetch instead of @anthropic-ai/sdk in character-bible-generator (sdk not installed in worker)
- [Phase 03-01]: character-questionnaire registered between asset-collection and social-setup (higher priority for video customers)
- [Phase 03-01]: Vague answer threshold set to 10 chars for personality/visual_style/audience phases only
- [Phase 03.1-multi-model-best-shot-routing]: KieAdapter uses getTaskStatus(id,'kling') — plan listed getKieTaskStatus which doesn't exist in kie.ts
- [Phase 03.1-multi-model-best-shot-routing]: FalAdapter jobId encoded as modelId::requestId for stateless poll/cancel URL construction
- [Phase 03.1-multi-model-best-shot-routing]: cancelJob is a no-op in KieAdapter — kie.ts has no cancel API
- [Phase 03.1-02]: selectionFromDefault passes budgetCeiling as maxCost on budget_override — ensures estimatedCost stays within tier
- [Phase 03.1-02]: Observatory fallback cost set to 0.04 (below cheapest ceiling 0.05) — prevents silent budget violations in pure-fallback path
- [Phase 04-character-video-gen-delivery]: CharacterReveal uses 16x9 only — no 9x16 variant needed for WhatsApp delivery
- [Phase 04-character-video-gen-delivery]: SCENE_DURATION=sec(5) matches Sora 2 default 5s clip output (HairShowreel uses sec(4) for Kling)
- [Phase 04-01]: Import path for db/client from modules/ subdirectory is ../../../db/client (3 levels up)
- [Phase 04-01]: Background generation via setImmediate — WhatsApp handler returns immediately, pipeline runs async
- [Phase 04-01]: Partial success: 3+ of 5 scenes = proceed to awaiting-composition; fewer = PipelineRun failed, module reset to intro for retry
- [Phase 04-03]: CharacterRevealProps import path from modules/ is 4 levels up (../../../../remotion/src/types)
- [Phase 04-03]: Auto-trigger composition pipeline from runGenerationPipeline directly — no WhatsApp trigger needed
- [Phase 05-01]: attempts:1 on customerOnboardingQueue — state machine manages retries, not BullMQ
- [Phase 05-01]: Worker job ends after first poll — pipeline advances via handlePipelineEvent from claudeclaw message flow
- [Phase 05-01]: advancePipelineAfterApproval() exported for Plan 02 admin APPROVE command wiring
- [Phase 05-02]: APPROVE with no remaining modules → awaiting-approval for final sign-off, not immediate completion
- [Phase 05-02]: POST /api/onboarding/start: bootstrapOnboardingGroup first (creates WA group), then enqueues BullMQ — group creation is synchronous prerequisite
- [Phase 05-02]: isPollVote + pollOption added to ClaudeClawJobData so WAHA webhook handler can set these for poll.vote events

## Phase History

- **01-01** (Core Onboarding Modules): COMPLETE — prompt-assembler + group-bootstrap (2min)
- **01-02** (API Endpoint + Verification): COMPLETE — POST /api/onboarding/start wired (1min)
- **02-01** (Module Foundation): COMPLETE — types, DB state, module router with priority activation (3min)
- **02-03** (Competitor Research + ClaudeClaw Integration): COMPLETE — competitor module + worker pipeline wiring (2min)

## Accumulated Context

### Roadmap Evolution

- Phase 03.1 inserted after Phase 3: Multi-Model "Best Shot" Routing (INSERTED) — shared model routing layer for all video products, must precede Phase 4 (Character Video Gen)

## Blockers

None identified.

## Notes

- Admin project ID: `cmmpgo3k60000h5zuaxfqac80`
- DB foundation already built (CharacterBible, PipelineRun, TenantAsset tables)
- WAHA client has full group management capabilities
- Group agent framework exists and is production-tested
- ServiceInstance + Subscription tables track customer's products (no enums — string types)
- Sora 2 accessed via Kie.ai API (NOT fal.ai): `POST /v1/jobs/createTask` with `model: "sora-2-pro-text-to-video"`
- Old `character-pipeline/group-bootstrap.ts` exists but is too narrow — Phase 1 replaces it with universal `onboarding/group-bootstrap.ts`

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| 01-01 | 2min | 2 | 3 |
| 01-02 | 1min | 2 | 1 |
| 02-01 | 3min | 2 | 5 |
| 02-03 | 2min | 2 | 3 |
| Phase 02 P02 | 4min | 2 tasks | 5 files |
| Phase 03-character-questionnaire P03-01 | 22min | 2 tasks | 7 files |
| Phase 03.1-multi-model-best-shot-routing P01 | 4min | 2 tasks | 6 files |
| Phase 03.1-multi-model-best-shot-routing P02 | 2min | 2 tasks | 3 files |
| Phase 04-character-video-gen-delivery P02 | 3min | 2 tasks | 3 files |
| Phase 04-character-video-gen-delivery P04-01 | 3 | 1 tasks | 3 files |
| Phase 04-character-video-gen-delivery P04-03 | 4min | 1 tasks | 1 files |
| Phase 05-pipeline-orchestration P01 | 3min | 2 tasks | 7 files |
| Phase 05-pipeline-orchestration P02 | 5min | 2 tasks | 5 files |

## Last Session

- **Stopped at:** Completed 05-02-PLAN.md
- **Timestamp:** 2026-03-13T23:24:43Z

---
*Last updated: 2026-03-13 — completed plan 02-03 (Competitor Research + ClaudeClaw Integration)*
