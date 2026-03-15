---
phase: 04-character-video-gen-delivery
plan: 03
subsystem: onboarding
tags: [remotion, r2, waha, whatsapp, character-video, pipeline]

requires:
  - phase: 04-01
    provides: character-video-gen module with scene generation + awaiting-composition state
  - phase: 04-02
    provides: CharacterReveal Remotion composition registered as CharacterReveal-16x9

provides:
  - Full character-video-gen lifecycle: generate scenes -> compose Remotion reveal -> upload R2 -> WhatsApp delivery
  - Composition pipeline triggered automatically after scene generation (no extra WhatsApp message needed)
  - PipelineRun finalized with costCents, deliveredVia, deliveredAt
  - Billing-model-aware cost visibility in WhatsApp caption
  - /tmp cleanup after delivery

affects: [character-video-gen, onboarding-modules, pipeline-run]

tech-stack:
  added: []
  patterns:
    - Auto-trigger composition after generation (setImmediate chaining between pipeline phases)
    - Remotion composition rendered via renderComposition('CharacterReveal-16x9') with retry
    - Billing-model conditional caption content (credit vs flat/package billing)
    - /tmp cleanup as final step after successful delivery

key-files:
  created: []
  modified:
    - apps/worker/src/services/onboarding/modules/character-video-gen.ts

key-decisions:
  - "CharacterRevealProps import path from modules/ subdirectory is ../../../../remotion/src/types (4 levels up, not 3)"
  - "Auto-trigger composition pipeline immediately after generation rather than waiting for next WhatsApp message"
  - "AssetInfo does not have description field — used metadata: { description: '...' } pattern instead"
  - "Cost visibility conditional on isCreditBillingModel query against ServiceInstance table"
  - "On WAHA sendVideo failure: log error + update PipelineRun deliveredVia=failed, but still mark module complete (graceful degradation)"

requirements-completed: [CHAR-08, CHAR-09, CHAR-10]

duration: 5min
completed: 2026-03-15
---

# Phase 04 Plan 03: Character Video Gen Delivery Summary

**Remotion CharacterReveal-16x9 render -> R2 upload -> WAHA WhatsApp video delivery with scene-summary caption and billing-conditional cost visibility**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-15T02:22:35Z
- **Completed:** 2026-03-15T02:27:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Added composing/uploading/delivering/complete phases to character-video-gen state machine
- Remotion composition renders CharacterReveal-16x9 with fetched Brand/Tenant data, retry on failure
- Reveal MP4 uploaded to R2 at `character-videos/{tenantId}/reveal-{timestamp}.mp4` as TenantAsset
- WAHA sendVideo delivers the reveal with 5-scene caption listing scene labels
- PipelineRun finalized: status=completed, deliveredVia=whatsapp, deliveredAt, costCents
- Billing-model detection: credit model shows cost in caption; flat/package/unknown omits it
- /tmp/character-video/{tenantId}/ cleaned up after delivery
- Composition pipeline auto-triggered immediately after scene generation (no extra trigger needed)

## Task Commits

1. **Task 1: Add composition rendering + R2 upload + WhatsApp delivery** - `92e47ad2` (feat)

**Plan metadata:** *(pending final commit)*

## Files Created/Modified

- `apps/worker/src/services/onboarding/modules/character-video-gen.ts` - Extended with composing, uploading, delivering, complete phases plus runCompositionPipeline function

## Decisions Made

- CharacterRevealProps import path needs 4 levels up (`../../../../remotion/src/types/`) not 3, because the file is in `src/services/onboarding/modules/` (4 levels deep from worker root vs 3 for `src/services/` or `src/queue/workers/`)
- Auto-trigger composition pipeline directly from runGenerationPipeline instead of requiring a WhatsApp message to hit awaiting-composition — better UX, no message gap needed
- WAHA delivery failure is graceful: PipelineRun records deliveredVia=failed but module still advances to complete state
- AssetInfo type only has metadata (not description) — used `metadata: { description: "..." }` to store human-readable description

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed CharacterRevealProps import path depth**
- **Found during:** Task 1 (TypeScript compile check)
- **Issue:** Plan specified `../../../remotion/src/types/` but correct path from `src/services/onboarding/modules/` is `../../../../remotion/src/types/` (4 levels up)
- **Fix:** Changed import to use 4 levels `../../../../remotion/src/types/character-reveal-props`
- **Files modified:** character-video-gen.ts
- **Verification:** `npx tsc --noEmit` shows zero errors in character-video-gen.ts
- **Committed in:** 92e47ad2

**2. [Rule 1 - Bug] Fixed description field on AssetInfo**
- **Found during:** Task 1 (TypeScript compile check)
- **Issue:** Plan spec said `assetInfo: { ..., description: "AI Character Reveal Video" }` but AssetInfo interface only has `{ tenantId, type, filename, metadata? }`
- **Fix:** Used `metadata: { description: "AI Character Reveal Video" }` pattern
- **Files modified:** character-video-gen.ts
- **Verification:** `npx tsc --noEmit` shows zero errors
- **Committed in:** 92e47ad2

---

**Total deviations:** 2 auto-fixed (1 blocking import path, 1 type mismatch)
**Impact on plan:** Both necessary for TypeScript correctness. No scope creep.

## Issues Encountered

None beyond the two auto-fixed TypeScript issues above.

## Next Phase Readiness

- Phase 04 fully complete: scenes generated -> Remotion reveal composed -> R2 uploaded -> WhatsApp delivered
- Full end-to-end character video pipeline is operational for customers with video products
- PipelineRun lifecycle fully tracked with costs, delivery method, and timestamps

---
*Phase: 04-character-video-gen-delivery*
*Completed: 2026-03-15*
