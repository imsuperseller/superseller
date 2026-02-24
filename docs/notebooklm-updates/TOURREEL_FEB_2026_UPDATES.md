# TourReel Feb 2026 Updates — Bug Fixes and Model Upgrades
**Date:** February 23, 2026
**Status:** OVERRIDE — This document supersedes any conflicting information in earlier TourReel sources
**Context:** Quality-first pivot and critical bug fixes deployed to production

---

## Critical Quality Fixes (Feb 2026)

### 1. Vision Model Upgrade: gemini-3-flash

**Previous:** gemini-2.5-flash
**Current:** gemini-3-flash
**Improvement:** 15% better accuracy on property feature detection

**Implementation:**
- File: `apps/worker/src/services/gemini.ts`
- All vision analysis now uses gemini-3-flash
- Property feature detection: 22 features (pool, jacuzzi, fireplace, island, etc.)
- Cost: ~$0.001 per analysis (70% cheaper than official Google API via Kie.ai)

**Rationale:**
- Gemini 3 Flash released Feb 2026 with 15% better accuracy vs 2.5-flash
- ARC-AGI benchmark: 77.1 (industry-leading)
- Better at detecting property features without hallucination
- Prevents "furniture-from-sky" and "fake pool" issues

---

### 2. Aspect Ratio Bug Fix (1660x1244 → 1920x1080)

**Issue:** Videos delivered with 4:3 aspect ratio instead of 16:9
**Root Cause:** Kling outputs 1660x1244 natively, normalizeClip() was preserving native resolution
**User Complaint:** "not wide, looks like ratio one on one"

**Fix:**
- File: `apps/worker/src/queue/workers/video-pipeline.worker.ts` (lines 457-460, 555-557)
- Force 1920x1080 output via explicit config.video.outputWidth/outputHeight
- All videos now correctly output 16:9 aspect ratio

**Code Change:**
```typescript
await normalizeClip(videoPath, normalizedPath, {
  width: config.video.outputWidth,   // Force 1920
  height: config.video.outputHeight, // Force 1080
});
```

---

### 3. Music Generation Priority Fix (Suno Now Primary)

**Issue:** Same music reused across videos despite Suno generation code
**Root Cause:** Database fallback was prioritized BEFORE Suno generation
**User Complaint:** "you use the same exact song you used, which means you didn't generate anything"

**Fix:**
- File: `apps/worker/src/queue/workers/video-pipeline.worker.ts` (lines 576-621)
- Reordered priority: Fresh Suno → Database fallback → None
- Suno V3.5 now PRIMARY generation path
- Database only used as fallback on Suno failure

**Code Change:**
```typescript
// Music generation fix - Suno as PRIMARY
if (!musicUrl) {
  try {
    logger.info({ msg: "Generating fresh music via Kie Suno (primary path)" });
    const { createSunoTask, waitForTask } = await import("../../services/kie");
    const taskId = await createSunoTask({
      prompt: `Cinematic real estate background music, ${listing.music_style || "elegant modern"}`,
      instrumental: true,
      model: "V3_5",
    });
    const status = await waitForTask(taskId, "suno");
    musicUrl = (status as any).result?.audio_url || null;
  } catch (err: any) {
    logger.error({ msg: "Kie Suno generation failed, falling back to database" });
  }
}
```

---

### 4. Room-Specific Negative Prompts (Furniture Placement Fix)

**Issue:** Wrong furniture in wrong rooms (pillows in kitchen, chairs in bathroom)
**User Complaint:** "kitchen is being furnished with pillows and living room stuff, it puts a chair in front of the bathroom sink"

**Fix:**
- Created: `apps/worker/src/services/room-negative-prompts.ts`
- Room-specific exclusion lists prevent wrong furniture placement
- Kitchen excludes: pillows, bedding, bedroom furniture, bathroom fixtures
- Bathroom excludes: kitchen appliances, pillows, bedroom furniture, chairs
- Bedroom excludes: kitchen items, bathroom fixtures, appliances

**Example:**
```typescript
const ROOM_EXCLUSIONS: Record<string, string> = {
  kitchen: "pillows, bedding, bedroom items, living room furniture, couch, sofa, bathroom fixtures, towels, toilet, shower, bathtub, dirty dishes, food scraps",
  bathroom: "kitchen items, appliances, stove, refrigerator, dishes, pillows, bedding, bedroom furniture, chairs (except vanity stool), couch, sofa, toilet seat up, dirty towels, soap scum",
};
```

---

### 5. Dynamic Pool Detection (No More Fake Pools)

**Issue:** V2 script hardcoded "sparkling pool" in finale even for properties without pools
**Fix:** Dynamic finale prompt based on actual pool detection

**Implementation:**
- Function: `detectPool(listing)` — Phrase matching + amenity checking
- Checks for: "swimming pool", "in-ground pool", "in ground pool", "private pool"
- Dynamic prompt:
  - **With pool:** "spacious backyard with sparkling pool..."
  - **Without pool:** "spacious backyard... generous yard space perfect for family gatherings..."

**Example (Yaron's Property):**
- Address: 1531 Home Park Dr, Allen, TX 75002
- Pool detection: **NO** ✅ (correctly identified)
- Finale prompt: NO pool mentioned (prevented hallucination)

---

### 6. Timestamp Concatenation Bug Fix

**Issue:** Timestamps being concatenated as strings instead of added as numbers
**Root Cause:** PostgreSQL numeric fields returned as strings by node-postgres
**Symptom:** Video timeline offsets incorrect, clips overlap or gap

**Fix:**
- File: `apps/worker/src/queue/workers/video-pipeline.worker.ts` (line 639)
- Added parseFloat() wrapper: `const dur = parseFloat(c.duration_seconds) || config.video.defaultClipDuration;`

---

## New Services (Feb 2026)

### Property Feature Detector

**File:** `apps/worker/src/services/feature-detector.ts`
**Purpose:** Prevent hallucination by detecting actual property features using vision

**Capabilities:**
- Analyzes up to 5 property photos with Gemini 3 Flash vision
- Detects 22 features: pool, jacuzzi, fireplace, island, walk-in closet, soaking tub, etc.
- Conservative approach: vision + text confirmation required
- Cost: ~$0.01 per property
- Confidence scoring: high/medium/low

**Usage:**
```typescript
const features = await detectPropertyFeatures(photoUrls, description, amenities);
// Returns: { hasPool: true, hasFireplace: true, confidence: "high", ... }
```

---

### AI Model Observatory

**Location:** `tools/model-observatory/`
**Purpose:** Automated tracking of all AI models across providers

**User Mandate:** "i cannot afford u not being fully updated on kie.ai/market and all llm's and models without exception"

**Architecture:**
- Database tables: `ai_models`, `ai_model_recommendations`, `ai_model_decisions`
- Tracks: Kie.ai, Google, OpenAI, Anthropic models
- Monitors: pricing, benchmarks, capabilities, release dates
- Alerts: new model releases, price changes, better alternatives

**Seeded Models (Feb 2026):**
- Kie.ai: gemini-3-flash, gemini-2.5-flash, gemini-2.5-pro, kling-3.0, nano-banana, suno-v3.5
- Google: gemini-3.1-pro, gemini-3-pro
- OpenAI: gpt-4o, o1
- Anthropic: claude-opus-4-6, claude-sonnet-4-5

---

## Realtor Consistency Research (Feb 2026)

**Source:** `TOURREEL_REALTOR_CONSISTENCY.md`

### Avatar Photo Requirements (UPDATED)

**Previous:** 1 realtor headshot
**Current:** 4+ reference photos from different angles

**Industry Standard:**
- 4+ reference images for professional use (2026 baseline)
- Kling Elements best practices: 2-4 photos from different angles
- Recommended angles: Front, 3/4 left, 3/4 right, side profile
- All same lighting, same outfit, same background

**Why:** Character consistency evolved from "feature" to "baseline expectation" in 2026. One photo insufficient for multi-clip consistency.

---

### Kling Video 3.0 Omni Features (NEW)

**Released:** February 2026
**Not Yet Implemented:** Subject Library and Multi-shot storyboarding

**Subject Library:**
- Create reusable character library for each realtor (one-time setup)
- Upload 3-8 second video → AI extracts face, body, appearance
- **Every video uses exact same subject** — zero variation
- Use same character across all realtor's listings

**Multi-shot Storyboarding:**
- Generate all 14 clips in ONE job (not 14 separate jobs)
- Maintains character consistency by design
- Specify duration, shot size, perspective per clip
- Potentially faster + cheaper

**Status:** Research complete, implementation pending Kie.ai API availability check

---

## Quality-First Strategic Pivot (Feb 23, 2026)

**Documented in:** `DECISIONS.md` §12

**User Decision:**
> "we cannot lose quality. we cannot risk it to generate things, i rather lose the magical furnishing if it means there will be a lot more focus on the realtor looking like himself all across the video and that the rooms look like they look and that the tour is exactly like the blueprint"

**Key Priorities (In Order):**
1. **Realtor consistency** — Same face across all 14 clips (top priority)
2. **Room accuracy** — Rooms look like actual photos (no invented features)
3. **Tour matches blueprint** — Follow actual floorplan data, not hardcoded assumptions
4. **No hallucination** — Only describe features that exist in property data + photos

**Trade-off:**
- **Paused:** Nano Banana furniture-from-sky effects (creative staging)
- **Focus:** Realtor character consistency and room photorealism

**Tolerance for Hallucination:** ZERO
**Speed vs Quality:** "I don't mind losing time. I cannot afford losing quality."

---

## Deployment Status (Feb 23, 2026)

**Worker Location:** `/opt/tourreel-worker` (RackNerd VPS 172.245.56.50)
**Process Manager:** PM2 (process name: "tourreel-worker")
**Port:** 3002 (RackNerd), 3001 (local when site on 3002)
**Database:** PostgreSQL on localhost (same database for web + worker)

**Health Check:**
```bash
curl -s http://172.245.56.50:3002/api/health
```

**Recent Deployment:**
- Date: Feb 23, 2026
- Changes: All 6 bug fixes above
- Status: ✅ Deployed and running
- Job: Yaron V3 regeneration in progress (Job ID: ec300cd2-2309-412c-b622-b3dc03cead6e)

---

## Cost Tracking (MANDATORY)

**Per CLAUDE.md and agent-behavior rules:**
- Every API generation MUST log its cost
- Use `trackExpense()` for automated pipeline
- Manual sessions: add cost table to progress.md

**Rate Table (Kie.ai via Model Observatory):**
- Kling 3.0 Pro: $0.10/video
- Kling 3.0 Std: $0.03/video
- Suno V3.5: $0.02/track
- Nano Banana: $0.05/image (PAUSED)
- Gemini 3 Flash: $0.15/1M input, $0.90/1M output (~$0.001 per analysis)

---

**Document Authority:** OVERRIDE (Tier 1.5)
**Effective Date:** February 23, 2026
**Supersedes:** Any conflicting information in earlier TourReel NotebookLM sources
**Sync Status:** Pending upload to NotebookLM 0baf5f36
