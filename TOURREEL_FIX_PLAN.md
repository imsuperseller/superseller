# VideoForge Quality Fix Plan — March 2026

**Owner**: Claude (AI) + Shai (review)
**Goal**: Produce consistently good final videos. Zero tolerance for the 7 recurring issues.
**Approach**: Fix in dependency order. Each fix is isolated and testable before moving to the next.

---

## The 7 Issues (User-Reported)

| # | Issue | Severity | Root Cause Found |
|---|-------|----------|-----------------|
| 1 | Pool appearing as opening scene | HIGH | Photo classifier sometimes misidentifies pool as exterior_front. HSV heuristic is unreliable. |
| 2 | Multiple realtors / realtor changing appearance | HIGH | Only clip 1 gets Nano Banana composite. Kling invents people for other clips when prompts imply human presence. |
| 3 | Crossfade transitions everywhere instead of seamless continuity | HIGH | `stitchClipsConcat` exists but is NEVER CALLED. Line 893 always uses `stitchClips` (dissolve xfade). |
| 4 | Transitions should only be for floor changes / distant rooms | MED | No logic differentiates adjacent vs. distant room transitions. Everything gets same 0.3s dissolve. |
| 5 | Text labels don't match the room/scene | MED | Labels use `clip.to_room` from floorplan analysis, but Kling generates content that may not match the original room photo. No validation. |
| 6 | Same music across all videos | MED | FIXED in code (Suno primary, DB fallback removed). But if Suno style prompt is identical every time, output sounds similar. |
| 7 | Low video quality | MED | PARTIALLY FIXED (Pro mode = 1080p). But still using CRF 18 + medium preset. Some quality loss in xfade re-encoding. |

---

## Fix Order (Dependency-Aware)

### Phase 1: Stitching & Transitions (Issues #3, #4) — HIGHEST IMPACT

**Why first**: This is the single biggest visual quality problem. Every video has jarring dissolves between every clip, destroying the walkthrough feel. Fixing this alone transforms the output.

#### Fix 3A: Use `stitchClipsConcat` as DEFAULT for adjacent rooms

**File**: `apps/worker/src/queue/workers/video-pipeline.worker.ts`
**Line**: 893

**Current code**:
```typescript
await stitchClips(clipFiles, masterSilentPath, "dissolve", 0.3);
```

**New logic**: Build a transition map based on room adjacency from floorplan analysis. Adjacent rooms = seamless concat. Floor changes / distant rooms = dissolve xfade.

```typescript
// Build transition decisions per clip boundary
const transitionMap = buildTransitionMap(clips, floorplanAnalysis);
// transitionMap[i] = 'seamless' | 'dissolve' for boundary between clip i and clip i+1

if (transitionMap.every(t => t === 'seamless')) {
    // All adjacent: pure seamless concat
    await stitchClipsConcat(clipFiles, masterSilentPath, { boundaryFramePaths });
} else if (transitionMap.every(t => t === 'dissolve')) {
    // All distant (shouldn't happen with good floorplan): full xfade
    await stitchClips(clipFiles, masterSilentPath, "dissolve", 0.3);
} else {
    // Mixed: segment-based stitching (new function needed)
    await stitchClipsMixed(clipFiles, masterSilentPath, transitionMap, boundaryFramePaths);
}
```

#### Fix 3B: New function `buildTransitionMap()`

**File**: `apps/worker/src/services/ffmpeg.ts` (or new `transition-planner.ts`)

Logic:
1. For each clip boundary (clip N → clip N+1), check floorplan `connects_to` adjacency
2. If clip N's room connects_to clip N+1's room → `'seamless'`
3. If floor changes (clip N floor ≠ clip N+1 floor) → `'dissolve'`
4. If rooms are NOT in `connects_to` list → `'dissolve'`
5. Default (no floorplan data) → `'seamless'` (better than always dissolve)

#### Fix 3C: New function `stitchClipsMixed()`

**File**: `apps/worker/src/services/ffmpeg.ts`

Segments approach:
1. Group consecutive clips that share 'seamless' transitions
2. `stitchClipsConcat` each seamless group into one segment
3. `stitchClips` (xfade) the segments together at dissolve boundaries

#### Fix 4: Text overlay timing must account for mixed transitions

**File**: `apps/worker/src/queue/workers/video-pipeline.worker.ts` lines 968-1036

The `xfadeDur` constant (0.3) must become per-boundary:
```typescript
const xfadeDur = transitionMap[i] === 'dissolve' ? 0.3 : 0;
cumSec += (dur - xfadeDur);
```

---

### Phase 2: Pool in Opening Scene (Issue #1)

**Why second**: This is a visible, embarrassing bug — pool interior shown as "front of house". Quick to fix.

#### Fix 1A: Hardcode opening = FIRST classified `exterior_front` photo

**File**: `apps/worker/src/queue/workers/video-pipeline.worker.ts` (opening photo selection)

Currently: `pickBestApproachPhotoForOpening()` (Gemini vision) can misidentify pool as exterior. The HSV `detectPoolHeuristic()` is a fallback but unreliable.

**New logic**:
1. If classified photos exist: Use the photo with `type === 'exterior_front'` and highest confidence. NEVER allow `type === 'pool'` or `type === 'outdoor'` as opening.
2. If no classified exterior_front: Fall back to first listing photo (Zillow always puts front exterior first).
3. **Post-selection validation**: Run `detectPoolHeuristic()` on chosen opening photo. If it returns true → reject and try next candidate.

#### Fix 1B: Explicit pool exclusion in photo classifier

**File**: `apps/worker/src/services/photo-classifier.ts`

Add to the classification prompt:
```
CRITICAL: A photo showing a swimming pool, hot tub, or water feature is NEVER 'exterior_front'.
Classify it as 'pool' or 'outdoor'. The exterior front photo shows the FRONT of the house
as seen from the street/driveway — no pool is visible from the front approach.
```

#### Fix 1C: Pool photos restricted to pool room clips ONLY

**File**: `apps/worker/src/services/room-photo-mapper.ts`

In `assignWithClassifiedPhotos()`: Ensure photos classified as `pool` are ONLY assigned to clips where `to_room` contains "pool", "backyard", "deck", or "patio". Never assigned to "Exterior Front", "Front Door", "Foyer", etc.

---

### Phase 3: Realtor Consistency (Issue #2)

**Why third**: Complex and expensive (each fix requires test jobs ~$1.50). Must be methodical.

The realtor problem has three sub-issues:

#### Sub-issue 2A: Kling invents new people in non-composite clips

**Root cause**: Only clip 1 gets Nano Banana composite (realtor + photo merged). All other clips use the raw room photo as start frame + a text prompt. Kling interprets ambiguous prompts (like "camera follows through...") as "show a person walking" and generates a random person.

**Fix**: Strengthen negative prompts for ALL non-composite clips.

**File**: `apps/worker/src/services/prompt-generator.ts`

In `ROOM_NEGATIVE_ADDITIONS` and the system prompt, add for every clip where `realtor_in_frame === false`:
```
"no people, no persons, no figures, no silhouettes, no human, nobody visible"
```

Currently the negative prompt only has `DUPLICATE_FIGURE_NEGATIVE` conditionally. Must be unconditional for ALL property-only clips.

#### Sub-issue 2B: Realtor appearance changes when using Kling Elements

**Root cause**: Kling Elements uses reference images but doesn't guarantee perfect consistency across clips. Each clip is generated independently.

**Fix (pragmatic)**:
1. Use Kling Elements ONLY for clip 1 (opening approach) — where the realtor is the focal point.
2. All subsequent interior clips should be property-only with the strict "no people" negative prompt.
3. Optional closing clip: If there's an outro/CTA, can include realtor via a SECOND Nano Banana composite (single static image, not Kling-generated).

This matches the user's vision: realtor appears at beginning (walks up), property showcase in between (no people), realtor at end (CTA).

#### Sub-issue 2C: Nano Banana composite quality varies

**Fix**: Already have retry logic. Add: if composite looks wrong (e.g., extra limbs detected by a quick Gemini vision check), retry with adjusted prompt. Only do this for the critical clip 1.

---

### Phase 4: Text Label Accuracy (Issue #5)

#### Fix 5A: Validate room labels against clip content

**Current problem**: Text overlay uses `clip.to_room` (e.g., "Kitchen") but Kling may have generated something that looks like a dining room or living room because the input photo was misclassified.

**File**: `apps/worker/src/queue/workers/video-pipeline.worker.ts` lines 968-1036

**Two-part fix**:

1. **Pre-generation validation**: After photo assignment, verify photo matches room name using a quick Gemini vision call: "Does this photo show a [room_name]? Reply yes/no." If no → swap photo or update room label to match the photo.

2. **Simpler approach (recommended)**: Instead of room-specific labels ("Kitchen", "Master Bedroom"), use GENERIC descriptive overlays:
   - Opening: Property address + price (already works)
   - Interior clips: No room labels (remove them — they're the source of mismatch)
   - Hero features: Only label if confident ("Pool & Spa", "Gourmet Kitchen") based on hero feature detection, not floorplan analysis
   - Closing: CTA (already works)

**Recommendation**: Go with option 2 (remove per-room labels). They add visual noise and are the primary source of mismatch. Professional real estate videos don't label every room.

---

### Phase 5: Music Variety (Issue #6)

#### Current state: ALREADY FIXED in code
Suno V5 generates fresh music per video. DB fallback removed.

#### Remaining issue: All Suno prompts sound similar

**File**: `apps/worker/src/queue/workers/video-pipeline.worker.ts` lines 913-916

**Current styles**:
```typescript
const sunoStyles = [
    listing.music_style || "elegant modern",
    "luxury cinematic piano ambient",
];
```

**Fix**: Diversify the prompt based on property characteristics:

```typescript
const sunoStyles = pickMusicStyle(listing);
// Returns different style based on:
// - property_type: "luxury mansion" → orchestral, "modern condo" → electronic ambient,
//   "cozy cottage" → acoustic guitar, "beachfront" → tropical ambient
// - price bracket: >$1M → orchestral/piano, $300K-$1M → cinematic, <$300K → upbeat pop instrumental
// - architectural_style: "modern" → electronic, "traditional" → classical, "farmhouse" → folk acoustic
```

**File**: New `apps/worker/src/services/music-style-picker.ts`

---

### Phase 6: Video Quality Polish (Issue #7)

#### Current state: PARTIALLY FIXED
- Kling Pro mode = 1080p native ✅
- CRF 18 + medium preset ✅
- 4K Nano Banana composites ✅

#### Remaining quality loss: xfade re-encoding

The dissolve transition (`stitchClips`) re-encodes ALL clips through FFmpeg, losing quality even at CRF 18. Phase 1's switch to `stitchClipsConcat` (seamless) solves this for most boundaries because it uses `"-c", "copy"` (no re-encoding).

#### Additional quality fix: Output CRF

For the final mixed stitch (dissolve boundaries only), lower CRF from 18 → 16 for the xfade segments.

**File**: `apps/worker/src/services/ffmpeg.ts` line 213

```typescript
"-crf", "16",  // Higher quality for transition segments
```

---

## Implementation Sequence

| Step | Phase | Est. Time | Est. Cost | Risk |
|------|-------|-----------|-----------|------|
| 1 | Phase 1: `buildTransitionMap()` | 2h | $0 | LOW — pure logic |
| 2 | Phase 1: `stitchClipsMixed()` | 3h | $0 | MED — FFmpeg complexity |
| 3 | Phase 1: Wire into pipeline | 1h | $0 | LOW |
| 4 | Phase 2: Pool exclusion | 1h | $0 | LOW |
| 5 | Phase 3: No-people negative prompts | 1h | $0 | LOW |
| 6 | Phase 3: Realtor only in clip 1 + CTA | 2h | $0 | MED |
| 7 | Phase 4: Remove per-room labels | 30min | $0 | LOW |
| 8 | Phase 5: Music style picker | 1h | $0 | LOW |
| 9 | Phase 6: CRF 16 for xfade | 15min | $0 | LOW |
| 10 | **TEST RUN** | 30min | ~$1.50 | — |

**Total dev time**: ~12h
**Test cost**: ~$1.50 per test job (Kling Pro clips + Suno)
**Strategy**: Implement phases 1-4 WITHOUT deploying, then do ONE test job to validate all fixes together. No iterative deploy-test cycles that burn credits.

---

## Success Criteria (Per Test Video)

- [ ] Opening clip shows front of house (no pool, no backyard)
- [ ] Realtor appears in clip 1 only (or clip 1 + closing CTA)
- [ ] No random people appear in interior clips
- [ ] Adjacent room transitions are seamless (no dissolve)
- [ ] Floor changes / distant rooms have smooth dissolve
- [ ] No per-room text labels (only address, price, CTA)
- [ ] Music matches property style (not generic piano every time)
- [ ] 1080p quality throughout, no blur
- [ ] Video plays smoothly with no audio/video sync issues

---

## NEVER REPEAT (From Previous Failures)

1. Don't deploy untested changes to production worker
2. Don't add "quick fix" that breaks another stage
3. Don't use `stitchClips` (xfade) as default — it's a fallback for floor changes only
4. Don't pass Zillow URLs to Kling (always R2 first)
5. Don't trust floorplan analysis 100% — always validate with photo classification
6. Don't generate multiple composites per video — each is $0.09 and they break continuity
7. Don't assume "fixed" until a complete end-to-end test video plays correctly
