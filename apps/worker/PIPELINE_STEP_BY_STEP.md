# TourReel Video Pipeline — Step-by-Step Order of Operations

**Canonical flow** from `video-pipeline.worker.ts`. All steps run sequentially in one BullMQ job.

---

## Phase 0: Setup & Pre-checks

- **Job starts** — Worker receives `{ jobId, listingId, userId }`
- **Temp dir** — Create `workDir` for local frames, clips, master
- **Status** — Set `analyzing`, 5%
- **Credit pre-check** — Fail fast if balance &lt; `maxClipsPerVideo × 15`
- **Load listing** — Fetch full row from `listings` (address, photos, floorplan, etc.)

---

## Phase 1: Tour Sequence (Which Rooms, In What Order)

### 1a. Floorplan analysis (if available)

- **Input**: `listing.floorplan_url`, `listing` (property_type, beds, baths, sqft)
- **Agent**: Gemini Vision via `analyzeFloorplan()`
- **Behavior**:
  - Sends floorplan image + structured prompt to Gemini
  - Gets JSON: `rooms[]`, `suggested_tour_sequence[]`, `special_features[]`, etc.
  - Rules: Exterior Front → Front Door first; logical walking path; at most one Pool
- **Output**: `FloorplanAnalysis` → `buildTourSequence()` → `TourRoom[]` (from/to pairs)
- **Persistence**: `listings.floorplan_analysis`, `video_jobs.tour_sequence`

### 1b. Hero features (pool, fireplace, kitchen island, etc.)

- **Input**: `floorplan_analysis`, `listing.description`, `listing.amenities`
- **Logic**: `deriveHeroFeatures()` (rule-based, not LLM)
- **Behavior**:
  - Pool detection from special_features, description, amenities (avoids “pool table”, “car pool”)
  - Ranks hero features; pool is highest; fallback: kitchen_island, master_suite
- **Output**: `{ heroFeatures, primaryHero, hasPool }`

### 1c. Default sequence (when no floorplan)

- **Input**: `property_type`, `bedrooms`, `bathrooms`, `hasPool`
- **Logic**: `getDefaultSequence()` (rule-based lookup)
- **Behavior**:
  - Picks from `DEFAULT_SEQUENCES` (e.g. `house_3bed_2bath`)
  - Appends Pool at end if `hasPool`
- **Output**: Ordered room names → `buildTourSequenceFromRoomNames()` → `TourRoom[]`

### 1d. Cap to max clips

- **Logic**: `tourRooms.slice(0, maxClipsPerVideo)`
- **Persistence**: `video_jobs.tour_sequence` updated

---

## Phase 2: Clip Prompts & Avatar

### 2a. Realtor avatar (optional)

- **Input**: `users.avatar_url` for job’s `userId`
- **Logic**: Fetch avatar → upload to R2 so Kie/Nano can fetch it
- **Output**: `avatarPublic` URL or null → `includeRealtor = !!avatarPublic`

### 2b. Generate clip prompts (LLM)

- **Input**: `tourRooms`, property_type, description, style, heroFeatures, amenities, includeRealtor
- **Agent**: Gemini Chat via `generateClipPrompts()`
- **Behavior**:
  - Maps rooms to `ROOM_DESCRIPTIONS` for typical_features
  - Uses `STYLE_MODIFIERS` for style (modern, farmhouse, etc.)
  - System prompt: realtor-centric or property-only, cinematic rules
  - User message: tour sequence + hero features + amenities
- **Output**: `ClipPrompt[]` — per-clip prompt, from_room, to_room, duration_seconds, negative_prompt

### 2c. Trim & persist clips

- **Logic**: Trim prompts to `maxClipsPerVideo`; insert into `clips` (pending)

---

## Phase 3: Photo Selection (Which Images Participate)

### 3a. Extract photo URLs

- **Input**: `listing.exterior_photo_url`, `listing.additional_photos` (array or JSON)
- **Logic**: `extractPhotoUrl()` — supports string, `{ url }`, nested structures
- **Output**: `additionalPhotos[]`, exterior URL

### 3b. Upload photos to R2

- **Logic**: `ensurePublicUrl()` — fetch each URL, upload to R2 (Zillow URLs block Kie)
- **Output**: `exteriorPublic`, `additionalPublic[]` (R2 URLs only)

### 3c. Choose opening photo (AI)

- **Input**: Candidates = `[exteriorPublic, ...additionalPublic.slice(0, 4)]`
- **Agent**: Gemini Vision via `pickBestApproachPhotoForOpening()`
- **Behavior**:
  - Reject: pool, backyard, interior, aerial/drone
  - Accept: ground-level front door / walkway / approach
- **Output**: Index into candidates → `lastFrameUrl` for clip 1

### 3d. Map rooms to photos (rule-based)

- **Module**: `room-photo-mapper.ts` — single source of truth
- **Logic**: `assignPhotosToClips(clips, input)` → `ClipPhotoAssignment[]`
- **Rules**:
  - Pool/Backyard/Patio/Deck → last photo(s) when `hasPool`
  - Exterior front door → exterior or first photo
  - Foyer/entry → second or first
  - Default → `usePhotos[idx]` or `usePhotos[0]`
- **Validation**: `validateClipPhotoAssignments()` — fail fast before credits spent if opening or any room lacks a usable photo

---

## Phase 4: Frame Preparation (Realtor Composite)

### 4a. Nano Banana composites (if realtor)

- **For each clip**: `avatarPublic` + room photo → Nano Banana Pro
- **Behavior**: Realtor placed in scene per `getNanoBananaRoomPrompt(to_room, hasPool)`
- **Output**: `frameUrls[]` — composite image per scene (R2 URLs)
- **Fallback**: Nano failure → property-only, no realtor

### 4b. Property-only

- **Logic**: Use `lastFrameUrl` (opening) and room photos directly, no Nano

---

## Phase 5: Clip Generation (Video)

- **Per clip**:
  1. **Start frame**: Clip 1 = opening composite/exterior; Clip N+1 = last frame of Clip N (extracted)
  2. **End frame** (realtor): Nano composite for next room
  3. **Kling 3.0**: Single-image mode — `start_frame` + prompt → video
  4. **Extract last frame** from video for next clip’s start
  5. **Normalize** clip (resolution)
  6. **Persist**: `clips.status = 'complete'`, `video_url`, `end_frame_url`

---

## Phase 6: Assembly

- **Stitch**: FFmpeg concat of normalized clips
- **Music**: Kie Suno or `music_tracks` table fallback
- **Overlays**: Text per room (stub)
- **Variants**: Master, vertical, thumbnail
- **Upload**: R2 for master, vertical, thumb
- **Complete**: `video_jobs.status = 'complete'`, URLs, duration

---

## AI Agents Summary

| Step | Agent | Input | Output |
|------|-------|-------|--------|
| 1a | Gemini Vision | Floorplan image + listing context | Rooms, suggested_tour_sequence |
| 1b | Rule-based | Floorplan analysis, description, amenities | Hero features, hasPool |
| 1c | Rule-based | Property type, beds, baths | Default room sequence |
| 2b | Gemini Chat | Tour rooms, style, hero features | Clip prompts (prompt, negative, duration) |
| 3c | Gemini Vision | Candidate photos (exterior + first 4) | Best opening photo index |
| 3d | Rule-based | Room name, index | Photo URL for room |
| 4a | Nano Banana | Avatar + room photo | Composite with realtor |
| 5 | Kling 3.0 | Start frame + prompt | Video clip |
| 6 | Kie Suno (optional) | Music style | Background audio |

---

## Data Flow Diagram (High Level)

```
listing (photos, floorplan) + user (avatar)
         ↓
[Phase 1] Floorplan/default → TourRoom[]
         ↓
[Phase 2] TourRoom[] → ClipPrompt[]  (LLM)
         ↓
[Phase 3] Photos → R2; Gemini picks opening; getPhotoForRoom maps room→photo
         ↓
[Phase 4] Avatar + photos → Nano composites (frameUrls)
         ↓
[Phase 5] frameUrls + prompts → Kling → clips
         ↓
[Phase 6] Stitch → Music → Variants → R2 → complete
```

---

## References

- **Worker**: `apps/worker/src/queue/workers/video-pipeline.worker.ts`
- **Floorplan**: `apps/worker/src/services/floorplan-analyzer.ts`
- **Hero features**: `apps/worker/src/services/hero-features.ts`
- **Prompts**: `apps/worker/src/services/prompt-generator.ts`
- **Opening photo**: `apps/worker/src/services/gemini.ts` (`pickBestApproachPhotoForOpening`)
- **Room→photo**: `apps/worker/src/services/room-photo-mapper.ts` (`assignPhotosToClips`, `validateClipPhotoAssignments`)
