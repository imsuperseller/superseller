# Video Prompt Engineering Rules

## Three Prompt Modes

### 1. Property-Only (no realtor)

Used when: User has no avatar or `FORCE_NO_REALTOR=1`.

**Rules**:
- Camera POV = buyer's perspective
- Empty property, NO humans whatsoever
- Hero moments (pool, kitchen, fireplace) as focal points
- Pool = FINALE of video
- Negative: `KLING_PROPERTY_NEGATIVE` (ban all people, animals, CGI)

**Opening clip**: "Slow dolly forward along pathway toward front door. Ground level. Photorealistic. No people."

**Interior clips**: Room-specific camera flow (see scene-management.md). Focus on features, light, materials.

### 2. Realtor-in-Frame (Nano Banana composite)

Used when: User has avatar, Kling Elements disabled.

Nano Banana creates a composite image (realtor superimposed on room photo) as the start frame.

**CRITICAL RULES**:
- Prompt MUST start with: "The person is ALREADY in the frame. Animate their natural movement only. Do NOT add any new people or figures. Single person only."
- MUST NOT describe person actions (triggers double figure generation)
- MUST NOT include generic clip.prompt (also triggers double figure)
- MUST NOT say "Person moves FORWARD through the space" (robotic walking)
- Focus prompt on camera movement + room features, NOT person actions
- Negative: `KLING_REALTOR_NEGATIVE` (composite: silent + identity + duplicate + spatial)

**Opening clip**: "Person is ALREADY in frame. Animate natural movement only. Single person. Slow dolly toward door."

**Interior clips**: "Person is ALREADY in frame. [Camera flow]. Single person. Room focus. Preserve exact decor."

### 3. Kling Elements (native character reference)

Used when: `USE_KLING_ELEMENTS=1`.

No Nano composite needed — Kling natively references the realtor from uploaded images.

**Rules**:
- Reference `@realtor` in prompt (NOT a description — a reference object)
- Negative: `KLING_ELEMENTS_NEGATIVE` (identity protection)

**Opening clip**: "Real estate agent @realtor walks along pathway toward front door."

**Interior clips**: "@realtor gestures naturally in the [room]. [Camera flow]. Single person only."

## System Prompt Structure

### Realtor-Centric System Prompt
- Camera POV = buyer's eyes
- Realtor welcomes at door, walks WITH buyer
- Natural, conversational energy
- **SILENT**: Lips closed, no mouth movement ever
- One primary camera movement per clip
- Eye-level camera (5ft height)
- One room per clip (no inter-room transitions)
- Hero moments: Realtor faces camera to gesture/point
- **Pool safety**: Realtor on deck, gestures toward pool, NEVER walks toward water
- **Opening**: Realtor on pathway, walking TOWARD door (approach walk, NOT at door)

### Property-Only System Prompt
- Empty property, no humans
- Hero features as focal points
- Pool = FINALE

## Style Modifiers

Maps architectural style to visual language:

| Style | Palette | Materials | Mood |
|-------|---------|-----------|------|
| modern | White, light gray | Polished concrete, glass | Sleek, open |
| luxury | Charcoal, warm taupe, gold | Marble, brass | Rich, curated |
| farmhouse | Warm white | Shiplap, reclaimed wood | Cozy, natural |
| colonial | Warm whites, dusty blue | Pine floors, brick | Classic, warm |
| mid-century | Warm neutrals, accent pops | Wood, leather | Retro, stylish |
| mediterranean | Terracotta, cream, azure | Stucco, tile, iron | Warm, sunlit |
| industrial | Raw gray, exposed brick | Concrete, steel | Urban, edgy |
| coastal | White, sea blue, sand | Driftwood, linen | Breezy, light |
| craftsman | Earth tones, warm wood | Cedar, stone | Handcrafted |
| contemporary | Monochrome + bold accent | Mixed modern | Clean, curated |
| art-deco | Black, gold, emerald | Marble, brass, velvet | Glamorous |
| scandinavian | White, pale wood, soft gray | Light oak, wool | Minimal, cozy |

## Prompt Generation Workflow

1. Select system prompt (realtor-centric or property-only)
2. Apply style modifier from listing architecture
3. Call Gemini 3 Pro (temp=0.4, max_tokens=8192)
4. Parse JSON array of clip objects
5. Enrich negatives: base negative + room-specific additions
6. Return `ClipPrompt[]`

## Output Format

```json
{
  "clip_number": 1,
  "from_room": "Exterior Front",
  "to_room": "Front Door",
  "prompt": "Slow dolly forward along pathway...",
  "duration_seconds": 5,
  "negative_prompt": "blurry, ..., no dirty dishes"
}
```
