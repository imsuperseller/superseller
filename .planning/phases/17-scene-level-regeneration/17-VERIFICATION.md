---
phase: 17-scene-level-regeneration
verified: 2026-03-15T23:30:00Z
status: passed
score: 4/4 must-haves verified
re_verification: false
---

# Phase 17: Scene-Level Regeneration Verification Report

**Phase Goal:** Customers can regenerate a single scene without touching approved scenes, and receive the updated reveal video via WhatsApp
**Verified:** 2026-03-15T23:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Customer requests a change to scene 2; scenes 1, 3, 4, 5 are untouched in the final delivered video | VERIFIED | `character-regen.worker.ts` line 170: `sceneUrls[sceneIndex] = newSceneUrl` replaces only the target index; the rest of the 5-element array is passed unchanged to Remotion via `sceneClips: sceneUrls` |
| 2 | Per-scene status (`approved / pending / rejected`) is tracked in the database and drives which scenes are re-rendered versus reused | VERIFIED | `character-video-gen.ts` line 642: `sceneStatuses: (data.sceneUrls ?? []).map(() => "approved")` initialized on delivery; worker sets `pending` before generation (line 75) and `approved` after success (line 171), with fallback for pre-Phase-17 tenants (line 59) |
| 3 | Customer receives exactly two WhatsApp messages: acknowledgment at request start and new video at completion — nothing in between | VERIFIED | `character-regen.worker.ts` line 41: `sendText` ack; line 215: `sendVideo` delivery. `change-request-handler.ts` line 329: generic confirmation message gated on `cr.intent !== "scene-change"` — scene-change gets zero messages from handler |
| 4 | Remotion CharacterReveal re-renders correctly with a mix of original and newly generated scene URLs | VERIFIED | `character-regen.worker.ts` line 189: `sceneClips: sceneUrls` (mixed N-1 original + 1 new R2 URLs); `CharacterRevealComposition.tsx` line 269: `validClips = sceneClips.filter(...)` consumes the array; `CharacterRevealProps.sceneClips: string[]` accepts per-scene URLs |

**Score:** 4/4 truths verified

---

### Required Artifacts

#### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/worker/src/queue/queues.ts` | `characterRegenQueue` + `CharacterRegenJobData` interface | VERIFIED | Line 153: `export const characterRegenQueue = new Queue("character-regen", ...)` — Line 163: `export interface CharacterRegenJobData` with all required fields |
| `apps/worker/src/queue/workers/character-regen.worker.ts` | BullMQ worker skeleton (Plan 01), full implementation (Plan 02) | VERIFIED | 327 lines (Plan 01 required 30+, Plan 02 required 150+). Full pipeline implemented. |
| `apps/worker/src/services/onboarding/modules/character-video-gen.ts` | `export async function generateScene` + `export function buildScenePrompts` + `sceneStatuses` init | VERIFIED | Lines 129, 183, 642 — all three changes confirmed |
| `apps/worker/src/services/onboarding/change-request-intake.ts` | `getInProgressChangeRequest` concurrency guard | VERIFIED | Line 192: `export async function getInProgressChangeRequest(groupId)` — queries `WHERE status = 'in-progress'` |
| `apps/worker/src/index.ts` | Worker registered at startup and shutdown | VERIFIED | Line 14: import; line 83: `await initCharacterRegenWorker()`; line 118: `await characterRegenWorker.close()` |

#### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/worker/src/services/onboarding/change-request-handler.ts` | Dispatch to `characterRegenQueue` on scene-change confirmation | VERIFIED | Line 312: `characterRegenQueue.add("regen-scene", { ... sceneIndex: (cr.scene_number ?? 1) - 1 ... })` with dynamic import pattern |
| `apps/worker/src/queue/workers/character-regen.worker.ts` | Full regen pipeline (generate, R2 upload, Remotion render, WhatsApp delivery) | VERIFIED | All 15 steps implemented; no stub `throw new Error("not yet implemented")` remains |

---

### Key Link Verification

#### Plan 01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `character-regen.worker.ts` | `queues.ts` | `import CharacterRegenJobData` | WIRED | Line 7: `import { CharacterRegenJobData } from "../queues"` |
| `index.ts` | `character-regen.worker.ts` | `initCharacterRegenWorker` registration | WIRED | Lines 14, 83, 118 — import + bootstrap + shutdown |

#### Plan 02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `change-request-handler.ts` | `queues.ts` | Dynamic import `characterRegenQueue.add` | WIRED | Line 312: `await characterRegenQueue.add("regen-scene", ...)` via dynamic import |
| `character-regen.worker.ts` | `character-video-gen.ts` | `import generateScene + buildScenePrompts` | WIRED | Line 8: `import { generateScene, buildScenePrompts } from "../../services/onboarding/modules/character-video-gen"` |
| `character-regen.worker.ts` | `waha-client.ts` | `sendText` (ack) + `sendVideo` (delivery) | WIRED | Lines 12, 41, 215 |
| `character-regen.worker.ts` | `module-state.ts` | `getModuleState + upsertModuleState` | WIRED | Line 9: import; used at lines 53, 76, 116, 218, 261 |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| REGEN-01 | 17-01, 17-02 | System regenerates a single specified scene without touching other approved scenes | SATISFIED | Worker replaces only `sceneUrls[sceneIndex]`; remaining URLs passed unchanged to Remotion |
| REGEN-02 | 17-01 | Per-scene status tracking (approved/pending/rejected) on scene records | SATISFIED | `sceneStatuses` array initialized at delivery, mutated through `pending` -> `approved` lifecycle in worker |
| REGEN-03 | 17-02 | Customer receives acknowledgment at request start and new video at completion (two messages only) | SATISFIED | Exactly two WAHA calls: `sendText` ack + `sendVideo` delivery; generic handler message suppressed for scene-change intent |
| ASSEM-01 | 17-02 | CharacterReveal Remotion composition accepts per-scene URL props (mixed old + new scenes) | SATISFIED | `CharacterRevealProps.sceneClips: string[]` accepted; `CharacterRevealComposition.tsx` consumes via `OffthreadVideo` per clip; worker passes mixed 5-element array |

No orphaned requirements — all four REQUIREMENTS.md entries map to plans and are satisfied.

---

### Anti-Patterns Found

None. Scan of `character-regen.worker.ts` and `change-request-handler.ts` found no TODO/FIXME/placeholder/stub patterns unrelated to future phases.

The Plan 01 `throw new Error("character-regen: processing not yet implemented (Plan 02)")` stub was confirmed removed — it does not appear in the final file.

---

### Human Verification Required

#### 1. End-to-End Regen Flow

**Test:** Trigger a poll vote "Yes" on a scene-change change request via WhatsApp group.
**Expected:** (1) "Regenerating scene N..." message arrives within seconds. (2) ~2-3 minutes later, a video message arrives showing the updated reveal with only the requested scene changed.
**Why human:** Requires live WAHA session, actual BullMQ job execution, Remotion render on RackNerd, and visual confirmation that only the correct scene is replaced.

#### 2. Concurrency Guard

**Test:** Vote Yes on two different scene-change change requests within seconds of each other for the same group.
**Expected:** Second vote receives "A scene is currently being regenerated..." and does not enqueue a second job.
**Why human:** Requires two near-simultaneous poll votes; timing-sensitive behavior.

#### 3. Error Recovery Path

**Test:** Simulate a generateScene failure (e.g., invalid prompt or Fal API error) during a regen job.
**Expected:** Customer receives apology message, admin receives alert, change request shows `failed` status, sceneStatuses reverted to `approved`.
**Why human:** Requires injecting a failure condition or observing a real failure.

---

### Commits Verified

| Commit | Description | Status |
|--------|-------------|--------|
| `a429f647` | feat(17-01): add characterRegenQueue, export generateScene/buildScenePrompts, init sceneStatuses, add getInProgressChangeRequest | FOUND |
| `52d1838d` | feat(17-01): create character-regen.worker.ts skeleton + register in index.ts | FOUND |
| `80b67e97` | feat(17-02): wire scene-change dispatch + concurrency guard in change-request-handler | FOUND |
| `9256b8f4` | feat(17-02): implement full character-regen worker end-to-end pipeline | FOUND |

TypeScript compilation: clean (no errors).

---

### Gaps Summary

No gaps. All automated checks passed.

---

_Verified: 2026-03-15T23:30:00Z_
_Verifier: Claude (gsd-verifier)_
