# TourReel Troubleshooting Guide

## Error: Double Realtor (Two Identical Figures)

**Symptoms**: Two identical realtors in first scene — one static, one duplicated.

**Root Cause**: Nano Banana creates composite (realtor + room photo). Kling receives this as start frame. If the prompt describes "person walking" or includes clip.prompt with person actions, Kling generates a SECOND person instead of animating the existing one.

**Fix**:
1. Prompt MUST start with: "The person is ALREADY in the frame"
2. Remove clip.prompt entirely when realtor_in_frame is true
3. Negative MUST include: "duplicate person, two people, double figure, ghost figure, extra person, clone"
4. Use `buildRealtorOnlyKlingPrompt(clip)` — minimal, camera-focused, no person actions

**Files**: `apps/worker/src/services/kie.ts` (buildRealtorOnlyKlingPrompt)

---

## Error: Robotic Walking

**Symptoms**: Realtor walks straight forward like a robot, zero interaction with listing.

**Root Cause**: Directive "Person moves FORWARD through the space—no circular pacing" causes overly literal animation.

**Fix**: Remove forward-movement directives. Use room-focused prompt: "The [room] is the focus. Reveal space and key features." Camera + production emphasis, never person action emphasis.

---

## Error: Low Resolution / Blurry Video

**Root Cause 1**: Kling standard mode outputs 720p. Pipeline upscales to 1080p → blur.
**Root Cause 2** (Feb 2026): Parallel mode called `normalizeClip()` WITHOUT explicit dimensions. Kling native resolution varies per clip → some came out near-square.

**Fix**:
1. Set Kling mode to `pro` (1080p native): `KIE_KLING_MODE=pro`
2. Set Nano Banana to 4K composites: `NANO_BANANA_RESOLUTION=4K`
3. FFmpeg preset `medium` (better compression quality vs `veryfast`)
4. **CRITICAL**: ALL `normalizeClip()` calls MUST pass explicit `{ width: config.video.outputWidth, height: config.video.outputHeight }` — never rely on auto-detect

---

## Error: Kie 500 on Task Creation

**Symptoms**: HTTP 500 when submitting Kling task.

**Cause 1**: Float duration — `5.00` instead of `"5"`
- **Fix**: Ensure duration is string enum `"5"` or `"10"`

**Cause 2**: Zillow URL as image_url
- **Fix**: Upload photo to R2 first, use R2 public URL

**Cause 3**: Negative prompt > 500 characters
- **Fix**: Trim negative prompt to 500 chars

---

## Error: Task Timeout (15 minutes)

**Symptoms**: Kling task never completes, times out after 900s.

**Cause**: Kling overloaded, or image complexity too high.

**Fix**:
1. Retry with `mode: "std"` (720p, faster processing)
2. Simplify prompt (reduce detail)
3. Try different start frame image
4. Check Kie status: if systematic failures, their API may be down

---

## Error: Insufficient Credits

**Symptoms**: `UnrecoverableError: Insufficient credits`

**Cause**: User balance < maxClips * 15 credits.

**Fix**: User needs to purchase more credits. This is a hard fail — no retry.

---

## Error: Floorplan Analysis Fails

**Symptoms**: Warning in logs, pipeline continues with default sequence.

**Cause**: Gemini vision couldn't parse the floorplan image (low quality, unusual format).

**Impact**: Non-critical — pipeline falls back to default room sequence based on property type.

**Fix**: Upload a clearer floorplan image, or manually specify room sequence.

---

## Error: Photo-to-Room Mismatch

**Symptoms**: Kitchen photo shows in bedroom clip, etc.

**Cause**: Heuristic photo assignment (index-based) doesn't understand room content.

**Fix**:
1. Enable AI vision matching: `USE_AI_PHOTO_MATCH=true` (default)
2. If vision matching fails, check Gemini API key and photo quality
3. Ensure listing has enough photos (at least 1 per room)

---

## Error: Music Generation Fails / No URL

**Symptoms**: Suno task fails, times out, or returns `status: completed` with no audio URL.

**Impact**: Non-critical — pipeline falls back to database `music_tracks` table, then SoundHelix generic MP3.

**Fix**: Check Kie API status. If persistent, the fallback music is acceptable for delivery. Known issue (Feb 2026): Kie.ai Suno sometimes returns `completed` status but empty response — this is an upstream API regression.

---

## Error: Floorplan Image Appears in Video

**Symptoms**: One clip shows the literal floorplan drawing as its scene instead of a room photo.

**Root Cause**: `detectFloorplanInPhotos()` stores `listing.floorplan_url` but didn't remove the URL from `additionalPhotos` array → floorplan got assigned as a clip start frame.

**Fix** (Feb 2026):
1. In floorplan detection block: remove detected URL from `flatPhotos`
2. In photo pool construction: filter `additionalPhotos` to exclude `listing.floorplan_url`
3. Both exclusion points are required (detection stores, pool construction uses)

---

## Error: FFmpeg Assembly Fails

**Symptoms**: Stitch step fails with codec/format error.

**Common Causes**:
1. Clip not properly normalized (different resolution/codec)
2. Corrupted clip file (incomplete download)
3. Disk full on VPS

**Fix**:
1. Check all clips are normalized to 1920x1080 H.264 (force explicit dimensions)
2. Re-download failed clip from R2
3. Check disk space: `df -h /opt/tourreel-worker`
4. Clean temp files: `rm -rf /tmp/tourreel-*`

---

## Error: Text Overlay Timing Mismatch

**Symptoms**: Room labels appear during wrong clip or overlap with next room.

**Root Cause**: `cumSec` accumulated from DB `duration_seconds` which doesn't match actual clip video duration (Kling may return different length than requested).

**Fix** (Feb 2026): Measure actual duration with `getVideoDuration()` on each normalized clip, store in `actualClipDurations` Map, use that for overlay timing instead of DB values.

---

## Error: Clip Regeneration Continuity Break

**Symptoms**: Regenerated clip has visible jump/seam with adjacent clips.

**Cause**: Kling interpolation between start/end frames not matching.

**Fix**: Regeneration uses SAME start_frame_url and end_frame_url. If still breaks:
1. Regenerate adjacent clips too
2. Check boundary frame extraction worked (last frame of previous clip)

---

## Deployment Checklist

After worker code changes:
1. Build: `cd apps/worker && npm run build`
2. Deploy: `rsync -avz dist/ root@172.245.56.50:/opt/tourreel-worker/dist/`
3. Restart: `ssh root@172.245.56.50 "pm2 restart tourreel-worker"`
4. Verify: `curl -s http://172.245.56.50:3002/api/health`
5. Watch logs: `ssh root@172.245.56.50 "pm2 logs tourreel-worker --lines 50"`

---

## Quick Diagnostics

```bash
# Check worker health
curl -s http://172.245.56.50:3002/api/health

# Check job status
curl -s http://172.245.56.50:3002/api/jobs/<jobId>

# Watch worker logs
ssh root@172.245.56.50 "pm2 logs tourreel-worker --lines 100"

# Check disk space
ssh root@172.245.56.50 "df -h /opt/tourreel-worker"

# Check PM2 status
ssh root@172.245.56.50 "pm2 status"

# Restart worker
ssh root@172.245.56.50 "pm2 restart tourreel-worker"
```
