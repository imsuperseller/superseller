# TourReel Video Pipeline - Gap Analysis
**Date:** 2026-02-23
**Trigger:** User feedback on Yaron video quality issues

---

## ✅ What We're Already Handling

### 1. No Pool Scenario
**Status:** ✅ HANDLED

**Code:** `apps/worker/src/services/hero-features.ts` lines 144-146
```typescript
if (heroFeatures.length === 0) {
    heroFeatures.push("kitchen_island", "master_suite");
}
```

**Logic:**
- If no pool detected → Falls back to kitchen_island, master_suite as hero features
- Finale clip still works but focuses on backyard/patio instead of pool
- **Issue:** Yaron's video hardcoded "sparkling pool" in clip 14 prompt (line 108 of regenerate-yaron-v2.mjs)
- **Fix needed:** Make finale prompt dynamic based on `heroResult.hasPool`

---

### 2. Single Floor vs Multi-Floor
**Status:** ✅ HANDLED

**Code:** `apps/worker/src/services/floorplan-analyzer.ts` lines 291-320
```typescript
export function isSingleStory(listing: {
    description?: string | null;
    amenities?: any;
    floorplan?: any;
    resoFacts?: any;
}): boolean {
    // Checks for:
    // - "single-story", "ranch", "rambler", "single level"
    // - Amenities "Stories: 1"
    // - Floorplan data floors <= 1
}
```

**Usage:** `video-pipeline.worker.ts` line 143-144
```typescript
const singleStory = isSingleStory(listing);
const roomNames = getDefaultSequence(propType, beds, baths, heroResult.hasPool, singleStory);
```

**Logic:**
- Single story → No "Stairs" room in tour sequence
- Multi-floor → Adds "Stairs" as transition between floors
- **Working as designed**

---

## ❌ Critical Gaps Identified

### 3. Vision Model Choice (SUBOPTIMAL)
**Status:** ❌ NEEDS UPGRADE

**Current:** `gemini-2.5-flash` (apps/worker/src/services/gemini.ts lines 4-5)
- Fast (0.21-0.37s first token, 163 tokens/sec)
- Cheap ($0.75 per 1M tokens)
- **Good for:** Real-time tasks, customer support

**Should Use:** `gemini-2.0-pro` for vision analysis
- Better reasoning and complex analysis
- 2M token context window (vs 1M for Flash)
- Better at structured output and technical tasks
- **Cost:** $11.25 per 1M tokens (15x more expensive)
- **Speed:** Several seconds slower

**Where It Matters:**
1. **Photo-to-room matching** (`matchPhotosToRoomsWithVision`) - Needs deep reasoning
2. **Floorplan detection** (`detectFloorplanInPhotos`) - Needs complex pattern recognition
3. **Opening shot selection** (`pickBestApproachPhotoForOpening`) - Needs artistic judgment

**Recommendation:**
- Use `gemini-2.0-pro` for vision analysis (3 calls per job)
- Keep `gemini-2.5-flash` for text generation (prompts, descriptions)
- Cost increase: ~$0.10 per job (negligible vs $10-50 in Kling/Suno costs)

**Sources:**
- [Gemini 2.0 Flash vs Pro Comparison](https://vapi.ai/blog/gemini-flash-vs-pro)
- [Gemini Models Comparison](https://www.oreateai.com/blog/gemini-20-pro-vs-flash-a-comprehensive-comparison/2f3b2d30e7a42b5d3633d448a3aa3fd1)

---

### 4. Industry Best Practices (NOT IMPLEMENTED)

**What Others Are Doing:**

#### AI Video Generation (2026 State-of-Art)
- **Trolto:** Fly-through videos from 2D photos (cinematic, social media optimized)
- **Collov:** Property photos → cinematic videos in minutes
- **InVideo + Kling:** Start frame → end frame interpolation (e.g., empty lot → finished home)
- **Nano Banana + Kling:** Character consistency across room-to-room transitions

**Our Gap:**
- ✅ We use Nano Banana + Kling (ahead of curve)
- ❌ We don't use **start frame → end frame interpolation** technique
- ❌ We don't optimize for **social media aspect ratios upfront** (we export variants after)

**Opportunity:**
- Implement "last frame of clip N → start frame of clip N+1" for smoother transitions
- **We already do this!** Lines 453-454 in video-pipeline.worker.ts extract last frame
- **But:** We're not using it for Nano Banana input (opportunity to improve)

**Sources:**
- [How to Create Real Estate Videos Using AI](https://invideo.io/blog/how-to-create-real-estate-videos-using-ai/)
- [Create Real Estate Video Using AI](https://www.generativeaipub.com/p/create-real-estate-video-using-ai)

---

### 5. Hardcoded Assumptions in Yaron Script

**Issue:** `regenerate-yaron-v2.mjs` has property-specific hardcoded values:

```javascript
// Line 108: Assumes pool exists
prompt: "@realtor steps through back door into spacious backyard with sparkling pool..."

// Line 20-34: Fixed tour sequence (doesn't adapt to actual property layout)
const TOUR_SEQUENCE = [
  { from: "Exterior Front", to: "Front Door", transition_type: "walk" },
  // ... 14 hardcoded transitions
];
```

**Problem:**
- If property has no pool → Kling generates fake pool or weird artifacts
- If property has different layout → Tour doesn't flow logically
- Not reusable for other properties

**Fix Needed:**
- Generate tour sequence from `buildTourSequence()` using actual floorplan data
- Make finale prompt conditional: `heroResult.hasPool ? "sparkling pool" : "manicured backyard"`
- Use dynamic prompts from `generateClipPrompts()` instead of hardcoded

---

### 6. Aspect Ratio Strategy (UNCLEAR)

**Current Approach:**
- Generate all clips at 16:9 (1920x1080)
- Export 4 variants: 16:9, 9:16, 1:1, 4:5

**Industry Practice:**
- **Primary format depends on distribution:**
  - Zillow/MLS: 16:9 (landscape)
  - Instagram/TikTok: 9:16 (vertical)
  - Facebook: 1:1 or 4:5 (square/portrait)

**Our Gap:**
- ❌ We crop/letterbox after generation → loses framing/composition
- ✅ Better: Generate vertical clips natively if primary use is social media

**Decision Needed:**
- What's the primary distribution channel for TourReel videos?
- Should we offer "social media first" option (9:16 native)?

**Sources:**
- [Real Estate Video Tours Best Practices](https://panoee.com/real-estate-video-tours/)

---

### 7. Photo Quality & Quantity (UNVALIDATED)

**Current Logic:**
- Uses Zillow photos (whatever's available)
- No minimum quality check
- No lighting/angle validation

**Industry Standard:**
- **Minimum:** 10-15 high-quality photos per listing
- **Lighting:** Consistent, bright, natural light preferred
- **Angles:** Wide-angle for room size, detail shots for features

**Our Gap:**
- ❌ No photo quality gate (accept blurry/dark photos)
- ❌ No minimum photo count enforcement
- ❌ No lighting consistency check

**Risk:**
- GIGO (Garbage In, Garbage Out) - bad photos → bad video

**Fix Needed:**
- Pre-flight photo quality check (blur detection, brightness analysis)
- Minimum 8 usable photos or fail early with clear error message

---

### 8. Furniture Placement Logic (BUGGY)

**User Report:**
- "kitchen is being furnished with pillows and living room stuff"
- "puts a chair in front of the bathroom sink"

**Current Fix:**
- Room-specific negative prompts (lines 59, 69, 74, 84, 89, 94, 99, 104 in regenerate-yaron-v2.mjs)

**Example:**
```javascript
// Kitchen (line 59)
negative: `${NEG}, dirty dishes, food, pillows, bedroom items, living room furniture`

// Bathroom (line 84)
negative: `${NEG}, toilet seat up, dirty towels, soap scum, kitchen items, chairs`
```

**Gap:**
- ✅ We have negative prompts for Yaron's video
- ❌ Not applied systematically in `generateClipPrompts()` function
- ❌ No room-type-aware negative prompt generator

**Fix Needed:**
- Create `getRoomSpecificNegativePrompt(roomType: string)` utility
- Apply to all videos, not just Yaron's manual script

---

### 9. Realtor Consistency (PARTIAL FIX)

**User Report:**
- "realtor does not look like himself after the first scene"

**Current Approach:**
- Kling Elements with `@realtor` token + avatar URLs (2 reference images)

**Known Issues:**
- Kling Elements sometimes generates different face despite reference
- Character consistency degrades across 14 clips

**Industry Practice:**
- Use **same character across ALL clips** by:
  1. Higher reference image weight
  2. Stronger prompt adherence
  3. Consistent lighting/angle in avatar photos

**Our Gap:**
- ❌ Only 2 reference images (Kling supports more)
- ❌ Avatar photos might have inconsistent lighting/angle
- ❌ No validation that avatar is high-quality reference

**Fix Needed:**
- Require 4-6 high-quality avatar photos (different angles, consistent lighting)
- Add avatar quality validation (face detection, resolution check)
- Experiment with higher element weight in Kling API

---

### 10. Transition Smoothness (NOT ADDRESSED)

**User Report:**
- "not have these visual transitions to look like a presentation"
- "all the video looks like one shot"

**Current Approach:**
- Concatenation (`stitchClipsConcat`) - hard cuts between clips
- Extract last frame → use as start frame for next clip

**Industry Practice:**
- **Cinematic flow:** Last frame of clip N → start frame of clip N+1 (already doing)
- **Camera continuity:** Match camera angle/height between transitions
- **Cross-dissolve:** Subtle fades for indoor→indoor transitions

**Our Gap:**
- ✅ We extract boundary frames
- ❌ We don't feed last frame → Nano Banana → Kling for next clip start
- ❌ No cross-fade option (only concat)

**Opportunity:**
- Use boundary frames as Nano Banana input for next clip
- Add optional cross-dissolve for smoother indoor transitions
- **Trade-off:** More Nano Banana calls = higher cost

---

### 11. Cost Tracking Per Session (MISSING)

**Agent Behavior Rule:**
> Every API generation MUST log its cost. No exceptions, every session, forever.

**Current Status:**
- ✅ Database tracks `usage_events` per job
- ❌ No session-level cost summary in progress.md
- ❌ Manual sessions (like Yaron regeneration) don't auto-log costs

**Fix Needed:**
- Add cost table to progress.md after every manual regeneration
- Format: `| Operation | Count | Unit Cost | Total |`

---

## 📊 Priority Matrix

| Gap | Impact | Effort | Priority |
|-----|--------|--------|----------|
| **Vision model upgrade (Flash → Pro)** | High (better photo matching) | Low (config change) | 🔴 HIGH |
| **Dynamic finale prompt (pool check)** | High (prevents fake pool) | Low (conditional logic) | 🔴 HIGH |
| **Room-specific negative prompts** | High (fixes wrong furniture) | Medium (utility function) | 🔴 HIGH |
| **Avatar quality validation** | Medium (realtor consistency) | Medium (face detection API) | 🟡 MEDIUM |
| **Photo quality gate** | Medium (prevents GIGO) | Medium (blur/brightness detection) | 🟡 MEDIUM |
| **Boundary frame → Nano input** | Medium (smoother transitions) | High (refactor pipeline) | 🟢 LOW |
| **Social-first aspect ratio** | Low (depends on distribution) | Low (config change) | 🟢 LOW |

---

## 🎯 Immediate Action Plan (Before Regenerating Yaron)

### Phase 1: Critical Fixes (30 min)
1. ✅ Switch vision analysis to `gemini-2.0-pro` (gemini.ts lines 4-5)
2. ✅ Create `getRoomSpecificNegativePrompt()` utility
3. ✅ Update regenerate-yaron-v2.mjs to use dynamic finale prompt
4. ✅ Rebuild + deploy

### Phase 2: Regenerate Yaron (90 min)
5. ✅ Run regeneration with all fixes
6. ✅ Monitor to completion
7. ✅ Verify quality (aspect ratio, music, furniture, realtor, pool)

### Phase 3: Document (10 min)
8. ✅ Add cost table to progress.md
9. ✅ Update findings.md with root causes discovered

---

## 🔬 Research Summary

**What We Learned:**

1. **AI Real Estate Video (2026 SOTA):**
   - Start/end frame interpolation is standard
   - Social media vertical (9:16) is increasingly primary format
   - 87% more views with virtual tours
   - Trolto/Collov dominate AI-generated fly-throughs

2. **Kling Best Practices:**
   - Image-to-video conversion requires decent lighting
   - Standard smartphone photos work fine
   - Dynamic room-to-room transitions are key
   - Production time: 10-20 minutes per video with workflow

3. **Gemini Model Choice:**
   - Flash: Speed champion (0.21s first token, $0.75/1M)
   - Pro: Reasoning champion (15x cost, better complex analysis)
   - **Verdict:** Use Pro for vision, Flash for text

**Sources:**
- [AI Virtual Tour Generator](https://collov.ai/ai-virtual-tour-generator)
- [RICOH360 AI Property Tours](https://blog.ricoh360.com/en/the-power-of-ai-in-property-tours)
- [Real Estate Video Tours 2026](https://panoee.com/real-estate-video-tours/)
- [Gemini 2.0 Flash vs Pro](https://vapi.ai/blog/gemini-flash-vs-pro)
- [Kling AI Real Estate Use Cases](https://www.lavamedia.us/blog/6-real-world-business-cases-of-ai-video-with-kling-ai-for-retail-real-estate-and-startups)

---

**Next Step:** Implement Phase 1 critical fixes, then regenerate Yaron with confidence.
