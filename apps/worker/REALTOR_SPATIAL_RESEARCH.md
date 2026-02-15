# Realtor Spatial Integration — "Added" vs Natural in Scene

**Symptom**: Realtor looks composited/pasted into the scene rather than naturally part of it. Walks through furniture, through doors, doesn't respect room geometry. Feels like he was added to the video instead of walking inside the house.

**Pipeline context**: The realtor is placed only by Nano Banana (composite). Kling receives those composites as start/end frames and interpolates—it does **not** inject or add the realtor. Spatial issues come from: (a) Nano placement quality, (b) Kling's interpolation path between frames.

---

## Root Cause Hypotheses

### 1. Nano Banana composite quality (placement + integration)

**Flow**: `[avatar, room_photo]` → Nano Banana Pro → single composite image.

**Possible issues**:
- Person placed in wrong spatial position (e.g. floating, overlapping furniture)
- Scale mismatch (person too large/small for room)
- Lighting/shadows don't match (obvious paste)
- No explicit "floor plane" or "walkable path" in prompt — model guesses

**Evidence**: Nano Banana Pro is "physics-aware" per Kie docs; control is prompt-only. No depth, placement coordinates, or mask.

### 2. Kling interpolation (motion path)

**Flow**: `[start_frame, end_frame]` → Kling 3.0 → video interpolates between them.

**Possible issues**:
- We give Kling NO spatial constraints. Prompt: "Smooth dolly... room in view. Single person only."
- Kling interpolates position from start to end. If end frame has person elsewhere, Kling may create a straight-line path that cuts through furniture.
- Image-to-video models don't have explicit 3D/depth — they infer from pixels. Furniture occlusion can fail.
- We use `last_frame` = next room's Nano composite. So we're asking: "animate from person in room A to person in room B." That's a big transition; Kling might "glide" through walls to match.

### 3. End-frame mismatch (room A → room B)

**Current**: Clip N end = Clip N+1 start = next room's Nano composite. So each clip transitions across rooms.

**Problem**: The end frame shows the realtor in a *different room*. Kling must move the person from position A to position B. That can force unnatural paths (through walls, furniture) to satisfy the end frame.

### 4. Model choice

- **Kling 3.0** (current): Image-to-video, start+end frames. No Motion Control (reference video) in our Kie integration.
- **Kling 2.6 Motion Control** (Kie): Uses reference VIDEO for motion — physics-accurate transfer. Would need 3–30s reference videos of realtors walking.
- **Veo** (retired): Had quality issues per TOURREEL_REALTOR_HANDOFF_SPEC / NotebookLM 0baf5f36.

---

## Research Plan

### Phase 1: Audit current outputs

1. **Save and inspect Nano Banana composites** for 3–5 clips (opening, living, kitchen).
   - Tool: `tools/save-nano-frames.ts` — fetch composites from R2 for a job, save locally.
   - Check: scale, shadows, overlap with furniture, floor contact.

2. **Save Kling input/output** for 2–3 clips.
   - Input: start frame, end frame, prompt.
   - Output: generated video.
   - Manually identify: at what second does the person "go through" something? Does the composite already look wrong, or does Kling create the bad motion?

### Phase 2: Nano Banana prompt experiments

3. **Add explicit spatial language** to room prompts:
   - Before: "The realtor at the island, facing the guest..."
   - After: "The realtor STANDING on the floor, one step in from the doorway, at the kitchen island. Feet on ground. Correct scale for the room. Facing the guest..."
   - Variants: "in the walkable space between furniture", "along the clear path through the room".

4. **Constrain pose per room type**:
   - Doorways: "at the doorway, one foot over the threshold"
   - Living: "in the open space in front of the sofa, not overlapping furniture"
   - Kitchen: "at the island, standing on the floor on the guest side"

5. **A/B test**: Run 1-clip validation (`run-1clip-validation.ts`) with old vs new prompts. Compare composites visually.

### Phase 3: Kling prompt experiments

6. **Add spatial negative prompt**:
   - Current: `DUPLICATE_FIGURE_NEGATIVE`, `SILENT_NEGATIVE`.
   - Add: `"person walking through walls, person walking through furniture, floating person, person clipping through objects, impossible movement, person gliding"`.

7. **Add spatial positive hint** (without triggering double figure):
   - "Camera glides. Person moves naturally within the space, respecting furniture and walls."
   - "Realistic walking path. Person stays on floor, avoids furniture."

8. **Reduce transition scope**: 
   - Hypothesis: Less movement = less chance to screw up.
   - Experiment: Use end frame = same room, person slightly turned. So Kling only does subtle animation (turn, gesture). Room transitions become cuts. Would need more clips.

### Phase 4: Pipeline / model experiments

9. **Kie Kling Motion Control** (if available):
   - Check Kie docs for `kling-2.6-motion-control` or equivalent.
   - Requires: reference video of realtor walking. Could use stock footage.
   - Would give physics-accurate motion transfer instead of free interpolation.

10. **Single-frame Kling (no end frame)**:
    - Use only start frame. Let Kling animate without end constraint.
    - Risk: less continuity, more creative freedom (could be worse).
    - Quick test: 1 clip, compare output.

### Phase 5: Structural change (if above insufficient)

11. **Per-room clips**: One clip per room, person stands/gestures; camera moves. No cross-room interpolation. Stitch many short clips. More control, more clips.

12. **Pre-compute walkable path**: Use vision/LLM to identify "walkable" pixels in room photo. Pass to Nano or post-process. (Speculative; API support unclear.)

---

## Test Protocol

1. **Baseline**: Run full pipeline for listing `1531 Home Park Dr` (or fixed Zillow URL). Save all Nano composites + Kling inputs/outputs. Document timestamp of each "walk through furniture" moment.

2. **Per experiment**: Change ONE variable (Nano prompt, Kling prompt, or end-frame strategy). Re-run 1–3 clips. Compare side-by-side.

3. **Success criteria**:
   - Realtor appears to walk on floor, not float.
   - No visible clipping through sofas, tables, walls.
   - Feels like one continuous shot, not a green-screen composite.

---

## Quick Wins (implement first)

1. **Nano prompts**: Add "standing on the floor", "correct scale", "in the walkable space" to `nano-banana-prompts.ts`.
2. **Kling negative**: Add spatial negatives (`walking through furniture`, etc.) to `kie.ts`.
3. **Kling positive**: Add one line to `buildRealtorOnlyKlingPrompt`: "Person moves naturally within the space, respecting room geometry."

---

## References

- `apps/worker/src/services/nano-banana-prompts.ts` — room prompts
- `apps/worker/src/services/kie.ts` — `buildRealtorOnlyKlingPrompt`, negative prompts
- `apps/worker/DOUBLE_REALTOR_RESEARCH.md` — double-figure fix (related: we minimized person description)
- Kie Kling 2.6 Motion Control: https://kie.ai/kling-2-6-motion-control
- Kling 3.0 Motion Control (physics): https://kling3.io/motion-control
