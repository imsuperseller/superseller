# Phase 15: Tech Debt Fixes - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix three load-bearing bugs that would corrupt budget gates and swallow generation failures before any iteration code (Phases 16-19) ships:
1. Render/composition failure alerts to admin + customer messaging (DEBT-01)
2. Cost tracking provider attribution fix (DEBT-02)
3. Admin phone null-safety fallback (from success criteria #3)

</domain>

<decisions>
## Implementation Decisions

### Failure Alert Messages
- Build a generic `sendAdminAlert()` utility that ANY module can call on terminal failure — not just render/composition
- Admin WhatsApp alert includes: error message, tenant name, module name, group ID, and customer phone — full context to act on immediately
- Customer receives an apologetic message in their WhatsApp group: "We hit a snag creating your video. Our team has been notified and will follow up shortly." — professional, sets expectation
- Wire `sendAdminAlert()` into all terminal module failure paths, not just character-video-gen

### Cost Attribution Fix
- Fix the hardcoded `service: "kie.ai"` in character-video-gen.ts line 339 to use the actual provider from `jobResult.provider`
- Audit ALL `trackExpense()` calls across the entire worker for the same hardcoded-provider pattern
- Normalize provider names to a controlled set of standard labels (e.g., `fal.ai`, `kie.ai`, `replicate`) — add a mapping layer rather than passing raw provider strings
- Backfill existing misattributed rows in `api_expenses` with correct provider based on job metadata — write a migration script

### Admin Phone Fallback
- When `admin_phone` is empty/null, fall back to `ADMIN_PHONE` environment variable
- Apply the fallback at pipeline creation time (set default when pipeline run is created) — single fix point, all downstream code sees a valid phone
- Log a warning when the fallback kicks in — helps catch misconfigured pipelines without breaking them

### Claude's Discretion
- Exact wording of admin alert messages (follow the structure above but wordsmith as needed)
- Migration script approach for backfilling api_expenses (SQL update vs Node script)
- Which modules beyond character-video-gen need sendAdminAlert() wired in (audit the codebase)
- Standard provider label mapping implementation (enum, const map, etc.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core module (bug locations)
- `apps/worker/src/services/onboarding/modules/character-video-gen.ts` — Lines 491-498 (silent failure), line 339 (hardcoded service), line 218 (provider available)
- `apps/worker/src/services/onboarding/pipeline-state.ts` — admin_phone column definition, pipeline creation logic, upsert functions

### Cost tracking
- `apps/worker/src/services/expense-tracker.ts` — `trackExpense()` function definition and params interface
- `CLAUDE.md` §6 "Generation Cost Tracking (MANDATORY)" — cost tracking rules and rate table reference

### WhatsApp messaging
- `apps/worker/src/services/waha-client.ts` — sendVideo, sendText functions (used for customer + admin messaging)

### Model router (provider info)
- `apps/worker/src/services/model-router/router.ts` — Route result includes provider field
- `apps/worker/src/services/model-router/provider-adapters/types.ts` — Provider type definitions

### Infrastructure
- `docs/INFRA_SSOT.md` §5b — Cost rate table for provider pricing

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `sendVideo()` / `sendText()` from `waha-client.ts` — use sendText for admin alerts and customer failure messages
- `trackExpense()` from `expense-tracker.ts` — already has service/operation/metadata params, just needs correct provider
- `jobResult.provider` (line 218 of character-video-gen.ts) — provider info already flows through, just not used in trackExpense
- Pipeline state functions in `pipeline-state.ts` — admin_phone already in the schema, just needs default logic

### Established Patterns
- Pipeline state uses upsert pattern with `createOrUpdatePipelineRun()` — admin_phone fallback goes here
- Module errors follow `logger.error()` + `updatePipelineRun(status: "failed")` pattern — add sendAdminAlert after this
- WAHA client abstracts WhatsApp sending — new sendAdminAlert can wrap sendText with formatting

### Integration Points
- `onboarding.worker.ts` — where pipeline runs are created (admin_phone fallback injection point)
- `pipeline-state.ts:createOrUpdatePipelineRun()` — where admin_phone gets set
- Every module's terminal catch block — where sendAdminAlert gets wired

</code_context>

<specifics>
## Specific Ideas

No specific requirements — the fixes are well-defined by the bugs. Standard approaches apply.

</specifics>

<deferred>
## Deferred Ideas

- Alert rate limiting (if admin gets spammed with failures) — monitor after shipping, add if needed
- Cost dashboard in admin portal showing per-provider breakdown — Phase 19 admin tooling scope
- Automated retry escalation (retry N times then alert) — current retry logic is sufficient for now

</deferred>

---

*Phase: 15-tech-debt-fixes*
*Context gathered: 2026-03-15*
