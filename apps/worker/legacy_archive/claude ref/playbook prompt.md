# TourReel — Prompt Engineering Playbook

**Version:** 1.0
**Date:** February 10, 2026
**Purpose:** Every prompt used in the TourReel pipeline — exact text, variable slots, expected outputs, failure modes, and tuning notes. This is the creative engine of the product. The quality of these prompts directly determines the quality of every video we generate.

---

## TABLE OF CONTENTS

1. [Prompt Architecture Overview](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#1-prompt-architecture-overview)
2. [Floorplan Analysis Prompts](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#2-floorplan-analysis-prompts)
3. [Tour Sequence Builder Prompts](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#3-tour-sequence-builder-prompts)
4. [Video Clip Prompts — Master Templates](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#4-video-clip-prompts)
5. [Room-Type Prompt Library](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#5-room-type-prompt-library)
6. [Transition-Type Prompt Modifiers](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#6-transition-type-prompt-modifiers)
7. [Property Style Prompt Modifiers](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#7-property-style-prompt-modifiers)
8. [Negative Prompts](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#8-negative-prompts)
9. [Music Generation Prompts](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#9-music-generation-prompts)
10. [Fallback Prompts (No Floorplan)](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#10-fallback-prompts)
11. [Prompt Assembly Logic](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#11-prompt-assembly-logic)
12. [Quality Control Prompts](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#12-quality-control-prompts)
13. [Tuning Guide &amp; Known Failure Modes](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#13-tuning-guide)
14. [Prompt Version Registry](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#14-prompt-version-registry)

---

## 1. Prompt Architecture Overview

Every TourReel video uses prompts at  **four stages** :

```
Stage 1: FLOORPLAN ANALYSIS (LLM — Vision)
  Input:  Floorplan image + property metadata
  Output: Room list, connections, suggested walking path
  Model:  Gemini 2.5 Pro Vision (primary) / GPT-4o (fallback)

Stage 2: TOUR SEQUENCE REFINEMENT (LLM — Text)
  Input:  Room list + user preferences + property type
  Output: Final ordered room sequence with transition types
  Model:  Gemini 2.5 Pro / GPT-4o

Stage 3: VIDEO CLIP GENERATION (Kling 3.0 / Veo 3.1)
  Input:  Per-clip prompt + start frame + end frame
  Output: 5-8 second video clip
  Model:  Kling 3.0 via fal.ai (primary) / Veo 3.1 via kie.ai (backup)

Stage 4: MUSIC GENERATION (Suno V5)
  Input:  Style prompt + duration target
  Output: Instrumental background track
  Model:  Suno V5 via kie.ai
```

### Prompt Variable Convention

Throughout this document, variables use `{{VARIABLE_NAME}}` syntax. The prompt assembly code (Section 11) replaces these before sending to the model.

```
{{PROPERTY_TYPE}}    → "modern farmhouse", "luxury condo", "colonial house"
{{FROM_ROOM}}        → "Living Room", "Kitchen", "Master Bedroom"
{{TO_ROOM}}          → "Dining Room", "Hallway", "Bathroom"
{{TRANSITION_TYPE}}  → "walk", "enter", "stairs", "exit"
{{STYLE_MODIFIER}}   → "warm wood tones", "sleek minimalist", "Mediterranean tile"
{{TIME_OF_DAY}}      → "golden hour", "bright midday", "soft morning"
{{CAMERA_HEIGHT}}    → "eye level", "slightly elevated", "low angle"
{{DURATION}}         → "5", "6", "8" (seconds)
{{CLIP_NUMBER}}      → "1", "2", "3" (position in sequence)
{{TOTAL_CLIPS}}      → "10", "12" (total clips in tour)
{{NEGATIVE_PROMPT}}  → assembled negative prompt string
```

---

## 2. Floorplan Analysis Prompts

### 2A. Primary Floorplan Analysis (Vision Model)

**Used in:** `src/services/floorplan-analyzer.ts`
**Model:** Gemini 2.5 Pro Vision via OpenRouter
**Temperature:** 0.2
**Max tokens:** 4096
**Response format:** JSON

```
SYSTEM: (none — single user message with image)

USER:
You are an expert real estate floorplan analyst specializing in property walkthrough planning. Analyze this floorplan image carefully and extract detailed room information for generating a cinematic property tour video.

Property context: {{PROPERTY_TYPE_CONTEXT}}

Analyze the floorplan and return a JSON object with this EXACT structure:

{
  "rooms": [
    {
      "name": "Living Room",
      "type": "living",
      "approximate_position": { "x": 0.4, "y": 0.5 },
      "approximate_size": "large",
      "connects_to": ["Foyer", "Kitchen", "Dining Room"],
      "notable_features": ["fireplace", "large windows", "vaulted ceiling"],
      "floor": 1
    }
  ],
  "suggested_tour_sequence": [
    "Exterior Front",
    "Front Door",
    "Foyer",
    "Living Room",
    "Kitchen",
    "Dining Room",
    "Master Bedroom",
    "Master Bathroom",
    "Bedroom 2",
    "Bathroom 2",
    "Backyard"
  ],
  "total_rooms": 9,
  "property_type": "house",
  "architectural_style": "modern farmhouse",
  "floors": 2,
  "special_features": ["pool", "garage", "balcony", "fireplace", "island kitchen"],
  "natural_light_direction": "south-facing",
  "estimated_sqft_per_floor": [1800, 1200],
  "confidence_score": 0.85
}

CRITICAL RULES for the tour sequence:
1. ALWAYS start with "Exterior Front" → "Front Door" (the approach shot)
2. After entering, follow a LOGICAL WALKING PATH — never teleport between disconnected rooms
3. Prefer this general flow: entrance → main living areas → kitchen/dining → bedrooms → bathrooms → outdoor spaces
4. Group rooms by proximity — visit adjacent rooms before moving to distant ones
5. For multi-story: complete the main floor first, then use "Stairs" as a transition, then complete upper floors
6. End with outdoor spaces (backyard, patio, pool) if they exist
7. Never include utility rooms (HVAC closet, electrical panel) unless they are a notable feature
8. Include hallways ONLY if they are architecturally significant or necessary for the walking path
9. Bathrooms should follow their associated bedrooms (Master Bedroom → Master Bathroom)
10. The kitchen and dining room should be adjacent in sequence since they usually connect

Room type classifications (use exactly these):
- "living" — living room, family room, great room, den
- "kitchen" — kitchen, kitchenette
- "dining" — dining room, breakfast nook, eat-in area
- "bedroom" — bedroom, guest room, nursery
- "bathroom" — bathroom, powder room, half bath, en-suite
- "foyer" — foyer, entryway, mudroom, vestibule
- "hallway" — hallway, corridor, landing
- "office" — office, study, library, home office
- "laundry" — laundry room, utility room
- "garage" — garage, carport
- "outdoor" — patio, deck, backyard, balcony, pool area, garden
- "stairs" — staircase (use as transition marker, not a room)
- "closet" — walk-in closet (include only if notably large)
- "bonus" — bonus room, media room, game room, gym, wine cellar
- "other" — anything else

Size classifications:
- "small" — under ~100 sqft (bathrooms, closets, powder rooms)
- "medium" — ~100-200 sqft (bedrooms, offices, dining rooms)
- "large" — ~200-400 sqft (living rooms, master bedrooms, kitchens)
- "extra_large" — over ~400 sqft (great rooms, open concept areas)

Position values (x, y) are normalized 0-1 relative to the floorplan image, with (0,0) at top-left. These help determine the walking path even when room connections are ambiguous.

The "confidence_score" should reflect how clearly you can read the floorplan:
- 0.9-1.0: Crystal clear, all rooms labeled, doors visible
- 0.7-0.89: Most rooms identifiable, some assumptions needed
- 0.5-0.69: Partial information, significant guessing required
- Below 0.5: Cannot reliably analyze — flag this

Return ONLY valid JSON. No markdown code fences. No explanation text.
```

**Variable: `{{PROPERTY_TYPE_CONTEXT}}`**

Assembled from listing data:

```typescript
function buildPropertyContext(listing: DbListing): string {
  const parts: string[] = [];

  if (listing.property_type) parts.push(`Property type: ${listing.property_type}`);
  if (listing.bedrooms) parts.push(`${listing.bedrooms} bedrooms`);
  if (listing.bathrooms) parts.push(`${listing.bathrooms} bathrooms`);
  if (listing.sqft) parts.push(`${listing.sqft} sqft`);
  if (listing.city && listing.state) parts.push(`Location: ${listing.city}, ${listing.state}`);

  return parts.length > 0
    ? parts.join(". ") + "."
    : "No additional property details available.";
}
```

### 2B. No-Floorplan Fallback Analysis

**Used when:** User doesn't upload a floorplan
**Input:** Listing photos + property metadata only

```
SYSTEM: (none — single user message)

USER:
You are a real estate tour planner. The client has NOT provided a floorplan, but has provided listing photos and basic property details. Based on the property type and room count, generate a realistic tour sequence.

Property details:
- Type: {{PROPERTY_TYPE}}
- Bedrooms: {{BEDROOMS}}
- Bathrooms: {{BATHROOMS}}
- Square footage: {{SQFT}}
- Location: {{CITY}}, {{STATE}}

Based on typical {{PROPERTY_TYPE}} layouts with {{BEDROOMS}} bedrooms and {{BATHROOMS}} bathrooms, generate a plausible tour sequence.

Return a JSON object:

{
  "rooms": [
    {
      "name": "Living Room",
      "type": "living",
      "approximate_position": { "x": 0.5, "y": 0.5 },
      "approximate_size": "large",
      "connects_to": ["Foyer", "Kitchen"],
      "notable_features": [],
      "floor": 1
    }
  ],
  "suggested_tour_sequence": ["Exterior Front", "Front Door", "Foyer", ...],
  "total_rooms": {{ESTIMATED_ROOMS}},
  "property_type": "{{PROPERTY_TYPE}}",
  "architectural_style": "unknown",
  "floors": {{ESTIMATED_FLOORS}},
  "special_features": [],
  "natural_light_direction": "unknown",
  "estimated_sqft_per_floor": [{{SQFT_PER_FLOOR}}],
  "confidence_score": 0.4
}

Use standard American residential layouts for the given property type and size. The confidence_score should be 0.3-0.5 since this is estimated, not observed.

Return ONLY valid JSON. No markdown. No explanation.
```

---

## 3. Tour Sequence Builder Prompts

### 3A. Sequence Refinement (After User Drag-and-Drop)

**Used when:** User has reordered rooms in the wizard and we need to validate the walking path still makes sense.

```
SYSTEM:
You are a cinematography assistant for real estate tours. Your job is to validate and slightly adjust a room tour sequence so the camera movements feel natural — like a person walking through the house.

USER:
The user has arranged this tour sequence for a {{PROPERTY_TYPE}}:

{{USER_SEQUENCE_LIST}}

Original floorplan analysis showed these room connections:
{{ROOM_CONNECTIONS_JSON}}

Check if the sequence creates any physically impossible transitions (jumping to a disconnected room). If it does, insert the minimum necessary hallway/transition rooms to make the path walkable.

Return a JSON object:
{
  "validated_sequence": ["Room 1", "Room 2", ...],
  "modifications": [
    {
      "action": "inserted",
      "room": "Hallway",
      "between": ["Living Room", "Bedroom 3"],
      "reason": "These rooms don't directly connect"
    }
  ],
  "is_valid": true,
  "warnings": []
}

Rules:
- Only insert rooms if absolutely necessary for physical continuity
- Never remove rooms the user explicitly included
- Never reorder rooms — the user's order is intentional
- If two rooms connect directly, no insertion needed even if they seem far apart
- Prefer inserting "Hallway" over other transition rooms

Return ONLY valid JSON.
```

---

## 4. Video Clip Prompts — Master Templates

This is the core creative engine. Each clip gets a prompt assembled from multiple pieces.

### 4A. The Master Prompt Template

Every clip prompt follows this structure:

```
{{CAMERA_MOVEMENT}}. {{SCENE_DESCRIPTION}}. {{ROOM_DETAILS}}. {{LIGHTING}}. {{STYLE_TAGS}}.
```

**Assembled by:** `src/services/prompt-generator.ts`

### 4B. Clip Prompt Generation (LLM-Assisted)

**System prompt for the LLM that writes individual clip prompts:**

```
SYSTEM:
You are a world-class real estate cinematographer directing an AI video generation model. Your job is to write detailed video prompts that produce cinematic, smooth, professional property tour clips.

You are generating prompts for {{MODEL_NAME}} (an AI video generation model). Each prompt describes a 5-8 second clip showing a camera moving from one room to the next inside a property.

CINEMATIC RULES YOU MUST FOLLOW:

1. CAMERA MOVEMENT: Every clip must specify ONE primary camera movement:
   - "Smooth steadicam forward dolly" — moving straight ahead through a space
   - "Gentle tracking shot" — moving parallel to a wall or feature
   - "Slow push-in" — gradually moving closer to a focal point
   - "Sweeping pan" — camera rotates to reveal a room
   - "Pull-back reveal" — camera moves backward to show full room
   - "Through-the-doorway dolly" — camera passes through a door frame
   - "Ascending staircase follow" — camera glides up stairs

2. CAMERA HEIGHT: Always "eye level" (approximately 5 feet) unless:
   - Entering a room with high ceilings → "slightly elevated to showcase ceiling height"
   - Kitchen with island → "slightly lower to feature countertop"
   - Stairs → "ascending at handrail height"

3. LIGHTING CONSISTENCY: All clips in a tour MUST use the same time of day. Use:
   - "Warm golden hour sunlight streaming through windows" (DEFAULT — most flattering)
   - Light should come from {{LIGHT_DIRECTION}} based on the property orientation
   - Interior rooms without windows: "soft ambient lighting with warm-toned fixtures"

4. SPEED: Camera movement should be SLOW and STEADY. Never fast. Real estate videos use 
   a pace that lets viewers absorb each space. Think "luxury hotel walkthrough" speed.

5. CONTINUITY: The END of clip N must visually match the START of clip N+1. This means:
   - If clip 3 ends facing a doorway, clip 4 starts from that doorway looking into the next room
   - Maintain consistent wall colors, flooring, lighting across consecutive clips
   - Never change time of day between clips

6. COMPOSITION: Follow the rule of thirds. Lead the viewer's eye with:
   - Architectural lines (hallways, ceiling beams, countertops)
   - Natural light sources (windows should be visible but not blown out)
   - Depth layers (foreground detail, middle ground furniture, background windows)

7. ABSOLUTELY NO:
   - People, pets, or animals in frame
   - Text, logos, or watermarks described in the prompt
   - Unrealistic elements (floating objects, impossible geometry)
   - Rapid camera movements or shaking
   - Dark or moody lighting (this is a SALES video, not a horror film)
   - Extreme close-ups of objects

OUTPUT FORMAT:
For each clip, write a single paragraph prompt (80-150 words). The prompt should be DENSE with visual detail but read as a natural description, not a list. Include camera movement, direction, lighting, materials, colors, and architectural features.

USER:
Property: {{PROPERTY_TYPE}} — {{ARCHITECTURAL_STYLE}}
Style notes: {{STYLE_MODIFIER}}
Lighting: {{TIME_OF_DAY}} — light from {{LIGHT_DIRECTION}}
Tour sequence ({{TOTAL_CLIPS}} clips total):

{{TOUR_SEQUENCE_NUMBERED}}

For EACH transition, generate a video prompt. Number them to match.

CRITICAL: Clip 1 is ALWAYS the exterior approach. The final clip should feel like a conclusion (wider shot, settling movement).

Return a JSON array:
[
  {
    "clip_number": 1,
    "from_room": "Exterior",
    "to_room": "Front Door",
    "prompt": "Your detailed prompt here...",
    "camera_movement": "forward dolly",
    "camera_height": "eye level",
    "duration_seconds": 5
  }
]

Return ONLY valid JSON array. No markdown.
```

### 4C. Hardcoded Clip Templates (Bypass LLM for Common Transitions)

For maximum reliability and speed, these common transitions can skip the LLM and use pre-written templates:

#### Exterior Approach (ALWAYS Clip 1)

```
Smooth cinematic steadicam shot approaching a {{PROPERTY_TYPE}} from the street. The camera glides slowly along the front walkway, revealing the {{EXTERIOR_DESCRIPTION}}. {{TIME_OF_DAY}} light casts warm shadows across the facade. Lush landscaping frames the shot on both sides. The front door grows larger in frame as we approach. Professional real estate cinematography, 4K quality, shallow depth of field, warm color grading.
```

#### Entering Front Door (ALWAYS Clip 2)

```
Smooth steadicam shot passing through the front door of a {{PROPERTY_TYPE}} into the {{FIRST_INTERIOR_ROOM}}. The camera crosses the threshold at eye level, transitioning from bright exterior {{TIME_OF_DAY}} light into the warmly lit interior. {{FOYER_DESCRIPTION}}. The doorframe passes around us as we enter, revealing the space ahead. Cinematic real estate walkthrough, 4K, warm tones.
```

#### Room-to-Room Through Doorway (Generic)

```
Smooth steadicam forward dolly from the {{FROM_ROOM}} through a doorway into the {{TO_ROOM}}. {{FROM_ROOM_BRIEF}}. The camera passes through the door frame at eye level, revealing {{TO_ROOM_DESCRIPTION}}. {{LIGHTING_NOTE}}. Continuous steady movement, professional real estate cinematography, 4K quality, warm color grading.
```

#### Staircase Transition

```
Cinematic steadicam shot ascending the staircase from the {{FROM_FLOOR}} floor to the {{TO_FLOOR}} floor. The camera glides upward at handrail height, following the curve of the banister. {{STAIR_DESCRIPTION}}. Natural light from {{LIGHT_SOURCE}} illuminates the stairwell. The upper landing comes into view as we reach the top. Smooth continuous movement, real estate tour cinematography.
```

#### Final Clip — Backyard/Exterior Exit

```
Smooth steadicam shot exiting through {{EXIT_DOOR}} into the {{OUTDOOR_SPACE}}. The camera passes through the doorframe, transitioning from interior to exterior as {{TIME_OF_DAY}} light floods the frame. {{OUTDOOR_DESCRIPTION}}. The camera gently slows to a stop, framing the full outdoor space in a wide establishing shot. Professional real estate cinematography, 4K, warm golden tones, cinematic conclusion.
```

---

## 5. Room-Type Prompt Library

Each room type has specific visual details that should be mentioned. These are **injected into the prompt** based on the room type from the floorplan analysis.

### `ROOM_DESCRIPTIONS` Lookup Table

```typescript
export const ROOM_DESCRIPTIONS: Record<string, {
  typical_features: string;
  camera_focus: string;
  lighting_note: string;
  material_hints: string;
}> = {

  // ─── LIVING SPACES ───

  "living": {
    typical_features: "spacious open layout with comfortable seating area, entertainment center, and large windows",
    camera_focus: "Pull back to reveal the full room depth, emphasizing ceiling height and window placement",
    lighting_note: "Natural light flooding through large windows, supplemented by warm ambient fixtures",
    material_hints: "hardwood floors, neutral-toned walls, plush area rug, crown molding",
  },

  "kitchen": {
    typical_features: "modern cabinetry, stone countertops, stainless steel appliances, and functional island or peninsula",
    camera_focus: "Track along the countertop line, showcasing the workspace flow and appliance arrangement",
    lighting_note: "Bright overhead lighting with under-cabinet accent lights creating depth",
    material_hints: "granite or quartz countertops, tile backsplash, brushed nickel hardware, pendant lights",
  },

  "dining": {
    typical_features: "centered dining table with seating, chandelier or statement light fixture overhead",
    camera_focus: "Sweeping reveal from the entry point, framing the table and light fixture together",
    lighting_note: "Statement chandelier as focal light source, natural sidelight from adjacent windows",
    material_hints: "polished table surface, upholstered chairs, wainscoting or accent wall",
  },

  "foyer": {
    typical_features: "welcoming entry space with coat closet, console table, and first impression of the home's style",
    camera_focus: "Forward dolly from the door into the space, looking toward the main living area beyond",
    lighting_note: "Entry fixture casting warm downlight, natural light from door sidelights",
    material_hints: "tile or hardwood entry floor, decorative mirror, fresh flowers on console",
  },

  // ─── BEDROOMS ───

  "bedroom": {
    typical_features: "well-proportioned room with bed as centerpiece, nightstands, and window with natural light",
    camera_focus: "Enter and gently sweep to reveal the full room, settling on the window view",
    lighting_note: "Soft natural light through curtains, bedside lamps creating warm pools of light",
    material_hints: "carpet or hardwood floors, fresh bedding, neutral wall colors, window treatments",
  },

  "master_bedroom": {
    typical_features: "generous primary suite with king bed, sitting area, walk-in closet access, and en-suite bathroom entry visible",
    camera_focus: "Slow reveal from entry, panning across the full suite to show its scale and amenities",
    lighting_note: "Layered lighting — natural window light, recessed ceiling lights, and bedside ambient",
    material_hints: "premium carpet or wide-plank hardwood, tray ceiling, accent wall, reading nook",
  },

  // ─── BATHROOMS ───

  "bathroom": {
    typical_features: "clean and bright bathroom with vanity, mirror, shower or tub-shower combination",
    camera_focus: "Brief push-in from doorway, showcasing the vanity and fixtures without lingering",
    lighting_note: "Bright vanity lighting reflecting off mirror, clean white light with warm accents",
    material_hints: "ceramic tile, glass shower enclosure, polished chrome fixtures, stone vanity top",
  },

  "master_bathroom": {
    typical_features: "luxury en-suite with dual vanities, soaking tub, separate glass-enclosed shower, and high-end finishes",
    camera_focus: "Sweeping entry shot that captures both the tub and shower, then settles on the vanity",
    lighting_note: "Bright clean lighting balanced with warm accents, natural light if window present",
    material_hints: "marble or porcelain tile, frameless glass, rainfall showerhead, freestanding tub, dual sinks",
  },

  // ─── FUNCTIONAL ROOMS ───

  "office": {
    typical_features: "dedicated workspace with desk, built-in shelving or bookcases, and good natural light",
    camera_focus: "Enter and reveal the workspace, emphasizing the window and built-ins",
    lighting_note: "Task lighting at desk supplemented by natural window light",
    material_hints: "rich wood desk, built-in cabinetry, leather chair, organized shelving",
  },

  "laundry": {
    typical_features: "utility space with front-loading washer and dryer, folding counter, and storage",
    camera_focus: "Quick push-in from doorway — don't linger (utility room, not a selling point)",
    lighting_note: "Bright overhead fluorescent or LED, clean and functional",
    material_hints: "tile floor, white cabinetry, stainless appliances, countertop",
  },

  "garage": {
    typical_features: "spacious garage with epoxy floor, storage systems, and room for vehicles",
    camera_focus: "Wide reveal from interior entry door, showing floor space and organization",
    lighting_note: "Bright overhead LED shop lights, daylight from garage door windows",
    material_hints: "epoxy floor coating, pegboard walls, overhead storage racks",
  },

  // ─── BONUS ROOMS ───

  "bonus": {
    typical_features: "flexible bonus space suitable for media room, playroom, or home gym",
    camera_focus: "Enter and slowly reveal the full space, emphasizing its versatility",
    lighting_note: "Recessed lighting, potentially dimmer setting for media room feel",
    material_hints: "carpet or luxury vinyl, neutral walls ready for personalization",
  },

  // ─── OUTDOOR ───

  "outdoor": {
    typical_features: "outdoor living space with patio, landscaping, and potential pool or garden views",
    camera_focus: "Exit through door into the space, camera settles on the widest view available",
    lighting_note: "Full natural outdoor light, golden hour warmth across the landscape",
    material_hints: "paver stone patio, outdoor furniture, mature landscaping, green lawn",
  },

  // ─── TRANSITIONS ───

  "hallway": {
    typical_features: "connecting corridor with clean lines leading to the next space",
    camera_focus: "Smooth forward dolly through the hallway, framing the destination at the end",
    lighting_note: "Recessed hallway lights creating even illumination, natural light from rooms on either side",
    material_hints: "hardwood or tile floor, neutral walls, framed artwork, architectural details",
  },

  "stairs": {
    typical_features: "staircase connecting floors with railing and architectural character",
    camera_focus: "Ascending steadicam at handrail height, following the stair geometry upward",
    lighting_note: "Stairwell fixture overhead, natural light from landing window if present",
    material_hints: "hardwood or carpeted treads, wood or iron railing, wainscoting on stair wall",
  },
};
```

---

## 6. Transition-Type Prompt Modifiers

These phrases are **prepended or injected** into the clip prompt based on the transition type between rooms.

```typescript
export const TRANSITION_MODIFIERS: Record<string, {
  camera_instruction: string;
  movement_description: string;
  pacing_note: string;
}> = {

  "walk": {
    camera_instruction: "Smooth steadicam forward dolly at eye level",
    movement_description: "The camera glides steadily forward through the space",
    pacing_note: "Moderate walking pace, approximately 2 feet per second",
  },

  "enter": {
    camera_instruction: "Through-the-doorway dolly shot at eye level",
    movement_description: "The camera passes through the door frame, crossing the threshold into the next room as the new space opens up around us",
    pacing_note: "Slightly slower than walking pace — let the reveal breathe",
  },

  "stairs": {
    camera_instruction: "Ascending steadicam shot at handrail height",
    movement_description: "The camera smoothly ascends the staircase, following the upward path while the upper landing gradually comes into view",
    pacing_note: "Slow and steady — ascending movement should feel effortless",
  },

  "exit": {
    camera_instruction: "Through-the-door dolly transitioning from interior to exterior",
    movement_description: "The camera passes through the door frame from the dim interior into bright outdoor light, the outdoor space expanding before us",
    pacing_note: "Slow and conclusive — the camera gently decelerates as it reaches the exterior",
  },

  // Additional specialized transitions

  "open_concept": {
    camera_instruction: "Sweeping pan or gentle tracking shot",
    movement_description: "The camera rotates smoothly, transitioning our view from one zone of the open-concept space to another without passing through any door",
    pacing_note: "Gentle pan, 30-45 degrees of rotation over the full clip duration",
  },

  "reveal": {
    camera_instruction: "Pull-back reveal shot",
    movement_description: "The camera slowly retreats, pulling back to reveal the full scope of the room from a detail or entry point",
    pacing_note: "Slow pull-back, letting the room's scale register with the viewer",
  },

  "corner": {
    camera_instruction: "Tracking shot that rounds a corner",
    movement_description: "The camera follows the wall around a corner, smoothly turning to reveal the continuation of the space or the next room",
    pacing_note: "Maintain constant speed through the turn",
  },
};
```

---

## 7. Property Style Prompt Modifiers

Applied globally to ALL clips in a tour based on the property's architectural style.

```typescript
export const STYLE_MODIFIERS: Record<string, {
  interior_palette: string;
  material_emphasis: string;
  mood: string;
  architectural_cues: string;
}> = {

  "modern": {
    interior_palette: "clean white walls, light gray accents, pops of black hardware",
    material_emphasis: "polished concrete, large-format tile, floor-to-ceiling glass, matte black fixtures",
    mood: "sleek and minimalist with carefully curated design elements",
    architectural_cues: "clean lines, open sight lines, minimal ornamentation, geometric shapes",
  },

  "traditional": {
    interior_palette: "warm cream walls, rich wood tones, classic navy or hunter green accents",
    material_emphasis: "hardwood floors, crown molding, chair rail, panel doors, brass or brushed gold hardware",
    mood: "timeless elegance with sophisticated warmth",
    architectural_cues: "symmetrical layouts, arched doorways, wainscoting, multi-pane windows",
  },

  "farmhouse": {
    interior_palette: "warm white shiplap, natural wood tones, muted sage or dusty blue accents",
    material_emphasis: "reclaimed wood, shiplap walls, apron-front sink, barn door hardware, open shelving",
    mood: "rustic charm meets modern comfort",
    architectural_cues: "exposed beams, board-and-batten exterior, wide plank floors, barn-style doors",
  },

  "mediterranean": {
    interior_palette: "warm terracotta, sandy beige, deep ocean blue, burnt sienna accents",
    material_emphasis: "terracotta tile, wrought iron details, arched passages, stucco texture, hand-painted tile",
    mood: "sun-drenched warmth with old-world character",
    architectural_cues: "arched doorways, tile roof, courtyard-oriented, balconies with iron railings",
  },

  "mid_century_modern": {
    interior_palette: "warm wood paneling, burnt orange, avocado green, mustard yellow, teak tones",
    material_emphasis: "walnut paneling, terrazzo floors, butterfly roofline, floor-to-ceiling windows, organic shapes",
    mood: "retro sophistication with warm organic flow",
    architectural_cues: "post-and-beam construction, clerestory windows, flat or low-slope roof, indoor-outdoor connection",
  },

  "coastal": {
    interior_palette: "bright white, sea glass blue, sandy beige, coral and driftwood accents",
    material_emphasis: "whitewashed wood, natural linen, rattan, light-toned tile, jute rugs",
    mood: "breezy and light with relaxed seaside elegance",
    architectural_cues: "open floor plans, large windows for ocean views, covered porches, outdoor showers",
  },

  "luxury_contemporary": {
    interior_palette: "rich charcoal, warm taupe, gold accents, cream marble",
    material_emphasis: "marble slabs, brushed gold fixtures, custom millwork, automated systems, designer lighting",
    mood: "opulent sophistication with cutting-edge design",
    architectural_cues: "double-height spaces, cantilevered elements, smart home integration, statement staircases",
  },

  "colonial": {
    interior_palette: "warm whites, dusty blue, colonial red, dark wood trim",
    material_emphasis: "wide plank pine floors, built-in bookcases, brick fireplace, paneled doors, dentil molding",
    mood: "dignified historical character with modern updates",
    architectural_cues: "center hall layout, formal rooms, dormer windows, shuttered facade, brick or clapboard",
  },

  "generic": {
    interior_palette: "neutral warm tones, light walls, medium-toned wood accents",
    material_emphasis: "hardwood or tile floors, clean painted walls, standard fixtures with modern updates",
    mood: "clean, bright, and welcoming",
    architectural_cues: "well-maintained contemporary finishes",
  },
};
```

---

## 8. Negative Prompts

Negative prompts are critical for preventing common AI video artifacts.

### 8A. Universal Negative Prompt (Applied to ALL clips)

```
blurry, out of focus, distorted, warped, low quality, low resolution, overexposed, underexposed, dark, moody, grain, noise, artifact, glitch, flickering, strobing, watermark, text overlay, logo, brand name, subtitle, caption, letterbox, black bars, fish-eye lens, extreme wide angle, dutch angle, shaky camera, handheld shake, motion blur, duplicate frames, temporal inconsistency, morphing walls, melting objects, floating furniture, impossible geometry, non-euclidean space, people, person, human figure, hand, finger, face, pet, animal, dog, cat, bird, cartoon, anime, illustration, painting, sketch, CGI obvious, video game, render artifact, plastic looking, uncanny valley, horror, scary, dark shadows, dramatic lighting, colored lighting, neon, psychedelic
```

### 8B. Model-Specific Negative Prompt Extensions

**For Kling 3.0 (fal.ai):**

```
{{UNIVERSAL_NEGATIVE}}, sudden scene change, abrupt cut, inconsistent wall color between frames, door appearing or disappearing, window changing shape, floor material changing mid-shot, ceiling height shifting
```

**For Veo 3.1 (kie.ai):**

```
{{UNIVERSAL_NEGATIVE}}, jittery motion, frame rate drops, audio artifacts, lip sync, speech, talking, singing, unnatural camera acceleration, zoom in zoom out, rapid movement
```

### 8C. Room-Specific Negative Additions

```typescript
export const ROOM_NEGATIVE_ADDITIONS: Record<string, string> = {
  "kitchen": "dirty dishes, messy counters, open cabinets, food, cooking, steam",
  "bathroom": "toilet seat up, dirty towels, soap scum, water stains, shower running",
  "bedroom": "unmade bed, messy clothes, personal items scattered, alarm clock flashing",
  "outdoor": "rain, cloudy sky, dead plants, brown lawn, trash, construction",
  "garage": "oil stains, cluttered, messy tools, broken items",
};
```

---

## 9. Music Generation Prompts

### 9A. Pre-Generated Library Prompts (Seed 20+ Tracks)

Each track is generated once, stored on R2, and reused across videos.

```typescript
export const MUSIC_LIBRARY_PROMPTS: Array<{
  name: string;
  style: string;
  suno_prompt: string;
  suno_style_tags: string;
  mood: string;
  best_for: string[];
}> = [
  {
    name: "Golden Hour Tour",
    style: "elegant",
    suno_prompt: "Warm and inviting background music for a luxury real estate property tour video",
    suno_style_tags: "ambient, warm piano, soft strings, elegant, cinematic background, no vocals, instrumental",
    mood: "warm_inviting",
    best_for: ["house", "condo", "townhouse"],
  },
  {
    name: "Modern Showcase",
    style: "contemporary",
    suno_prompt: "Sleek modern ambient music for a contemporary property walkthrough",
    suno_style_tags: "modern ambient, subtle electronic, clean production, minimalist, no vocals, background music",
    mood: "sophisticated",
    best_for: ["condo", "apartment", "commercial"],
  },
  {
    name: "Coastal Breeze",
    style: "relaxed",
    suno_prompt: "Light breezy background music for a beachside or coastal property tour",
    suno_style_tags: "acoustic guitar, light percussion, ocean vibes, breezy, warm, no vocals, instrumental",
    mood: "relaxed",
    best_for: ["house", "condo"],
  },
  {
    name: "Estate Grandeur",
    style: "cinematic",
    suno_prompt: "Grand cinematic score for a luxury estate property showcase video",
    suno_style_tags: "orchestral, cinematic, sweeping strings, grand piano, majestic, no vocals, film score",
    mood: "majestic",
    best_for: ["house"],
  },
  {
    name: "Urban Loft",
    style: "upbeat",
    suno_prompt: "Upbeat modern background music for an urban loft or city apartment tour",
    suno_style_tags: "lo-fi beats, jazzy piano, upbeat, urban, smooth, no vocals, background",
    mood: "energetic",
    best_for: ["apartment", "condo", "commercial"],
  },
  {
    name: "Family Home",
    style: "heartwarming",
    suno_prompt: "Warm heartfelt background music for a family home walkthrough video",
    suno_style_tags: "acoustic piano, warm guitar, gentle strings, heartwarming, hopeful, no vocals",
    mood: "heartwarming",
    best_for: ["house", "townhouse"],
  },
  {
    name: "Rustic Charm",
    style: "folk",
    suno_prompt: "Gentle folk-inspired background music for a farmhouse or rustic property",
    suno_style_tags: "acoustic guitar, light mandolin, warm folk, rustic, country home, no vocals",
    mood: "rustic",
    best_for: ["house"],
  },
  {
    name: "Zen Retreat",
    style: "ambient",
    suno_prompt: "Calming zen ambient music for a serene property with spa or nature features",
    suno_style_tags: "ambient pads, nature sounds subtle, meditation, calm, flowing water, no vocals",
    mood: "serene",
    best_for: ["house", "condo"],
  },
  {
    name: "Downtown Pulse",
    style: "electronic",
    suno_prompt: "Sophisticated electronic ambient for a high-rise downtown property",
    suno_style_tags: "deep house light, ambient electronic, sophisticated, nightlife subtle, no vocals",
    mood: "cosmopolitan",
    best_for: ["apartment", "condo", "commercial"],
  },
  {
    name: "Classic Elegance",
    style: "classical",
    suno_prompt: "Elegant classical-inspired background music for a traditional or historic property",
    suno_style_tags: "string quartet, classical, elegant, refined, soft chamber music, no vocals",
    mood: "refined",
    best_for: ["house"],
  },
  // Generate 10 more variations during seed phase
  // Vary tempo (80-120 BPM), key (major keys only), and instrumentation
];
```

### 9B. Custom Music Generation (Premium Feature)

For users who request custom music matching their listing:

```
Suno API payload:
{
  "model": "v5",
  "prompt": "Background music for a real estate tour of a {{PROPERTY_TYPE}} in {{CITY}}, {{STATE}}. The property is {{ARCHITECTURAL_STYLE}} style. The video is {{VIDEO_DURATION}} seconds long. Create warm, inviting, professional background music that enhances the viewing experience without being distracting.",
  "make_instrumental": true,
  "custom_mode": true,
  "style": "{{SELECTED_STYLE}}, professional background music, real estate, no vocals, instrumental, warm, inviting, {{TEMPO}} BPM",
  "title": "{{ADDRESS}} Tour"
}
```

### 9C. Music Style-to-Property Matching Logic

```typescript
export function selectMusicStyle(
  propertyType: string,
  architecturalStyle: string,
  listingPrice: number | null,
  userPreference?: string
): string {
  // User preference always wins
  if (userPreference) return userPreference;

  // Price-based upgrade
  if (listingPrice && listingPrice > 1000000) return "cinematic";
  if (listingPrice && listingPrice > 500000) return "elegant";

  // Style matching
  const styleMap: Record<string, string> = {
    "modern": "contemporary",
    "traditional": "classical",
    "farmhouse": "folk",
    "mediterranean": "elegant",
    "mid_century_modern": "contemporary",
    "coastal": "relaxed",
    "luxury_contemporary": "cinematic",
    "colonial": "classical",
  };

  if (architecturalStyle && styleMap[architecturalStyle]) {
    return styleMap[architecturalStyle];
  }

  // Property type fallback
  const typeMap: Record<string, string> = {
    "house": "elegant",
    "condo": "contemporary",
    "apartment": "upbeat",
    "townhouse": "heartwarming",
    "commercial": "contemporary",
  };

  return typeMap[propertyType] || "elegant";
}
```

---

## 10. Fallback Prompts (No Floorplan)

### 10A. Default Tour Sequences by Property Type

When no floorplan is provided, use these standard sequences:

```typescript
export const DEFAULT_SEQUENCES: Record<string, string[]> = {
  "house_3bed_2bath": [
    "Exterior Front", "Front Door", "Foyer", "Living Room",
    "Kitchen", "Dining Room", "Master Bedroom", "Master Bathroom",
    "Bedroom 2", "Bedroom 3", "Bathroom 2", "Backyard"
  ],
  "house_4bed_3bath": [
    "Exterior Front", "Front Door", "Foyer", "Living Room",
    "Kitchen", "Dining Room", "Family Room",
    "Stairs", "Master Bedroom", "Master Bathroom",
    "Bedroom 2", "Bedroom 3", "Bedroom 4",
    "Bathroom 2", "Bathroom 3", "Backyard"
  ],
  "condo_2bed_2bath": [
    "Building Exterior", "Lobby", "Elevator/Hallway", "Unit Entry",
    "Living Room", "Kitchen", "Dining Area",
    "Master Bedroom", "Master Bathroom",
    "Bedroom 2", "Bathroom 2", "Balcony"
  ],
  "apartment_1bed_1bath": [
    "Building Exterior", "Lobby", "Unit Entry",
    "Living Area", "Kitchen", "Bedroom", "Bathroom"
  ],
  "townhouse_3bed_2.5bath": [
    "Exterior Front", "Front Door", "Living Room",
    "Kitchen", "Dining Room", "Powder Room",
    "Stairs", "Master Bedroom", "Master Bathroom",
    "Bedroom 2", "Bedroom 3", "Bathroom 2",
    "Patio/Deck"
  ],
};

export function getDefaultSequence(
  propertyType: string,
  bedrooms: number,
  bathrooms: number
): string[] {
  const key = `${propertyType}_${bedrooms}bed_${bathrooms}bath`;
  if (DEFAULT_SEQUENCES[key]) return DEFAULT_SEQUENCES[key];

  // Fuzzy match: find closest
  const candidates = Object.entries(DEFAULT_SEQUENCES)
    .filter(([k]) => k.startsWith(propertyType))
    .sort((a, b) => {
      const aBeds = parseInt(a[0].match(/(\d+)bed/)?.[1] || "0");
      const bBeds = parseInt(b[0].match(/(\d+)bed/)?.[1] || "0");
      return Math.abs(aBeds - bedrooms) - Math.abs(bBeds - bedrooms);
    });

  if (candidates.length > 0) return candidates[0][1];

  // Ultimate fallback
  return DEFAULT_SEQUENCES["house_3bed_2bath"];
}
```

### 10B. Photo-Based Room Detection (No Floorplan Alternative)

When no floorplan is provided but listing photos exist, use this LLM prompt to identify rooms from photos:

```
SYSTEM:
You are a real estate photo analyst. Identify what room each photo shows and categorize it.

USER:
I have {{PHOTO_COUNT}} listing photos for a {{PROPERTY_TYPE}} ({{BEDROOMS}} bed, {{BATHROOMS}} bath). Analyze each photo and identify the room.

Photos:
{{PHOTO_LIST_WITH_URLS}}

Return a JSON array where each element corresponds to a photo:
[
  {
    "photo_index": 0,
    "room_name": "Living Room",
    "room_type": "living",
    "confidence": 0.95,
    "notable_features": ["fireplace", "large windows"],
    "is_exterior": false,
    "use_as_start_frame": true
  }
]

Group similar photos (e.g., two photos of the same kitchen). Only the best photo per room should have "use_as_start_frame": true.

Return ONLY valid JSON.
```

---

## 11. Prompt Assembly Logic

This is the actual code that builds the final prompt string sent to Kling 3.0 or Veo 3.1.

```typescript
// src/services/prompt-generator.ts — assembleClipPrompt()

import { ROOM_DESCRIPTIONS } from "./room-descriptions";
import { TRANSITION_MODIFIERS } from "./transition-modifiers";
import { STYLE_MODIFIERS } from "./style-modifiers";
import { ROOM_NEGATIVE_ADDITIONS } from "./negative-prompts";
import { ClipPrompt, TourRoom } from "../types";

interface PromptContext {
  propertyType: string;
  architecturalStyle: string;
  timeOfDay: string;
  lightDirection: string;
  clipNumber: number;
  totalClips: number;
}

/**
 * Assembles the final prompt for a single video clip.
 *
 * Can be called INSTEAD of the LLM-based prompt generator
 * for maximum speed and reliability (no LLM latency).
 *
 * Use LLM-based generation for premium tier; use template-based
 * assembly for standard tier.
 */
export function assembleClipPrompt(
  transition: TourRoom,
  context: PromptContext
): string {
  const fromType = inferRoomType(transition.from);
  const toType = inferRoomType(transition.to);

  const toRoom = ROOM_DESCRIPTIONS[toType] || ROOM_DESCRIPTIONS["hallway"];
  const transitionMod = TRANSITION_MODIFIERS[transition.transition_type] || TRANSITION_MODIFIERS["walk"];
  const style = STYLE_MODIFIERS[context.architecturalStyle] || STYLE_MODIFIERS["generic"];

  // ─── Build camera instruction ───
  let camera = transitionMod.camera_instruction;

  // First clip always approaches from exterior
  if (context.clipNumber === 1) {
    camera = "Smooth cinematic steadicam approach shot at eye level";
  }

  // Last clip should settle/decelerate
  const isLast = context.clipNumber === context.totalClips;
  const pacingMod = isLast
    ? "The camera gently decelerates and settles into a wide establishing frame."
    : "";

  // ─── Build scene description ───
  const scene = `${transitionMod.movement_description}, transitioning from the ${transition.from} into the ${transition.to}`;

  // ─── Build room detail ───
  const roomDetail = `The ${transition.to} features ${toRoom.typical_features}. ${toRoom.material_hints}.`;

  // ─── Build lighting ───
  const lighting = `${context.timeOfDay} light. ${toRoom.lighting_note}. Light primarily from ${context.lightDirection}.`;

  // ─── Build style tags ───
  const styleTags = `${style.mood}. ${style.material_emphasis}. ${style.architectural_cues}.`;

  // ─── Assemble final prompt ───
  const parts = [
    camera,
    scene,
    roomDetail,
    lighting,
    `Professional real estate cinematography, 4K quality, warm color grading, shallow depth of field`,
    styleTags,
    pacingMod,
  ].filter(Boolean);

  return parts.join(". ").replace(/\.\./g, ".").replace(/\s+/g, " ").trim();
}

/**
 * Assembles the negative prompt for a clip.
 */
export function assembleNegativePrompt(toRoom: string): string {
  const roomType = inferRoomType(toRoom);
  const roomNegative = ROOM_NEGATIVE_ADDITIONS[roomType] || "";

  const universal = "blurry, out of focus, distorted, warped, low quality, overexposed, underexposed, dark, moody, watermark, text overlay, logo, people, person, human, pet, animal, cartoon, anime, shaky camera, motion blur, floating furniture, impossible geometry";

  return roomNegative
    ? `${universal}, ${roomNegative}`
    : universal;
}

/**
 * Infer room type from room name string.
 */
function inferRoomType(roomName: string): string {
  const lower = roomName.toLowerCase();

  if (lower.includes("exterior") || lower.includes("outside") || lower.includes("front")) return "outdoor";
  if (lower.includes("backyard") || lower.includes("patio") || lower.includes("deck") || lower.includes("pool") || lower.includes("garden")) return "outdoor";
  if (lower.includes("master bed") || lower.includes("primary bed") || lower.includes("primary suite")) return "master_bedroom";
  if (lower.includes("master bath") || lower.includes("primary bath") || lower.includes("en-suite")) return "master_bathroom";
  if (lower.includes("bed")) return "bedroom";
  if (lower.includes("bath") || lower.includes("powder")) return "bathroom";
  if (lower.includes("kitchen")) return "kitchen";
  if (lower.includes("dining") || lower.includes("breakfast")) return "dining";
  if (lower.includes("living") || lower.includes("family") || lower.includes("great room") || lower.includes("den")) return "living";
  if (lower.includes("foyer") || lower.includes("entry") || lower.includes("vestibule") || lower.includes("mudroom")) return "foyer";
  if (lower.includes("hall") || lower.includes("corridor") || lower.includes("landing")) return "hallway";
  if (lower.includes("stair")) return "stairs";
  if (lower.includes("office") || lower.includes("study") || lower.includes("library")) return "office";
  if (lower.includes("laundry") || lower.includes("utility")) return "laundry";
  if (lower.includes("garage") || lower.includes("carport")) return "garage";
  if (lower.includes("closet") || lower.includes("walk-in")) return "closet";
  if (lower.includes("bonus") || lower.includes("media") || lower.includes("game") || lower.includes("gym") || lower.includes("theater")) return "bonus";
  if (lower.includes("lobby") || lower.includes("elevator")) return "foyer";
  if (lower.includes("balcony") || lower.includes("terrace") || lower.includes("porch")) return "outdoor";

  return "hallway"; // Safe default
}
```

### Full Prompt Assembly Example

For a transition `Living Room → Kitchen` in a `modern farmhouse`:

**Assembled prompt:**

```
Smooth steadicam forward dolly at eye level. The camera glides steadily forward through the space, transitioning from the Living Room into the Kitchen. The Kitchen features modern cabinetry, stone countertops, stainless steel appliances, and functional island or peninsula. granite or quartz countertops, tile backsplash, brushed nickel hardware, pendant lights. Warm golden hour sunlight streaming through windows. Bright overhead lighting with under-cabinet accent lights creating depth. Light primarily from south-facing windows. Professional real estate cinematography, 4K quality, warm color grading, shallow depth of field. rustic charm meets modern comfort. reclaimed wood, shiplap walls, apron-front sink, barn door hardware, open shelving. exposed beams, board-and-batten exterior, wide plank floors, barn-style doors.
```

**Assembled negative prompt:**

```
blurry, out of focus, distorted, warped, low quality, overexposed, underexposed, dark, moody, watermark, text overlay, logo, people, person, human, pet, animal, cartoon, anime, shaky camera, motion blur, floating furniture, impossible geometry, dirty dishes, messy counters, open cabinets, food, cooking, steam
```

---

## 12. Quality Control Prompts

### 12A. Clip Quality Assessment (Optional V2 Feature)

Use an LLM to evaluate generated clips before including them in the final video:

```
SYSTEM:
You are a quality control reviewer for real estate tour videos. Evaluate whether a generated video clip meets professional standards.

USER:
I've generated a video clip with this prompt:
"{{ORIGINAL_PROMPT}}"

A frame from the generated video is attached. Rate this clip:

{
  "overall_quality": 8,        // 1-10
  "camera_smoothness": 9,     // 1-10 — is the camera movement steady?
  "visual_fidelity": 7,       // 1-10 — does it look photorealistic?
  "prompt_adherence": 8,      // 1-10 — does it match the prompt description?
  "continuity_safe": true,    // Will this cut smoothly with adjacent clips?
  "artifacts_detected": [],   // ["morphing wall", "floating object", "flash frame"]
  "should_regenerate": false, // true if quality < 6 or artifacts detected
  "notes": "Slight softness in background but acceptable for production"
}

Quality thresholds:
- 8-10: Excellent — use as-is
- 6-7: Acceptable — use but could improve
- 4-5: Marginal — regenerate if budget allows
- 1-3: Unacceptable — must regenerate

Return ONLY valid JSON.
```

---

## 13. Tuning Guide & Known Failure Modes

### 13A. Common Prompt Failures and Fixes

| Problem                              | Root Cause                             | Fix                                                                         |
| ------------------------------------ | -------------------------------------- | --------------------------------------------------------------------------- |
| Camera suddenly jerks or teleports   | Prompt describes two distinct scenes   | Keep to ONE continuous camera movement per clip                             |
| Walls morph or melt between frames   | Prompt mentions too many room details  | Reduce detail density — 80 words max for room description                  |
| Room looks nothing like a real house | Generic/vague prompt                   | Add specific material mentions (hardwood, granite, etc.)                    |
| Lighting changes between clips       | No consistent time-of-day directive    | Ensure ALL clip prompts include same `{{TIME_OF_DAY}}`                    |
| People or faces appear               | Model hallucinating from training data | Strengthen negative prompt: "no people, no human, no face, no figure"       |
| Obvious AI artifacts (plastic look)  | Over-describing reflective surfaces    | Avoid mentioning mirrors, glass, chrome in detail                           |
| Video is too dark                    | "Dramatic" or "moody" words in prompt  | Always include "well-lit", "bright", "warm light"                           |
| Camera moves too fast                | Missing pacing instruction             | Always include "slow and steady" or "walking pace"                          |
| Floor texture changes mid-clip       | AI model losing continuity             | Keep clips to 5 seconds (shorter = more consistent)                         |
| Doorways generate wrong              | Complex geometry confuses model        | Use "the camera passes through an open archway" instead of "through a door" |
| Furniture floating or impossible     | AI geometry failure                    | Add to negative: "physically impossible, floating objects, hovering"        |

### 13B. Model-Specific Tuning Notes

**Kling 3.0 (fal.ai):**

* `cfg_scale`: Start at 0.5. Increase to 0.7 if prompt adherence is low. Decrease to 0.3 if results are over-stylized.
* Best at: Smooth camera movements, consistent lighting, architectural spaces
* Struggles with: Reflective surfaces (mirrors, polished marble), windows with exterior views, staircase geometry
* Sweet spot: 5 seconds at 16:9 — longer clips (8-10s) show more drift
* **Pro tip:** Adding "photograph-quality" to the prompt significantly reduces painterly artifacts

**Veo 3.1 (kie.ai):**

* Best at: Natural lighting, outdoor scenes, establishing shots
* Struggles with: Complex interior geometry, tight spaces (bathrooms), overhead angles
* `veo-3.1-fast`: 8-second clips, lower quality but acceptable for middle clips
* `veo-3.1`: 8-second clips, higher quality, better for hero clips (first and last)
* **Pro tip:** Veo responds better to shorter, more direct prompts. Keep under 100 words.

### 13C. Prompt Length Guidelines

```
Kling 3.0: 80-150 words OPTIMAL. Under 50 = too vague. Over 200 = model gets confused.
Veo 3.1:   50-100 words OPTIMAL. More direct is better. Over 150 = diminishing returns.
Suno:      20-50 words for style/mood. Longer descriptions don't improve music quality.
LLM (floorplan): No limit but structured prompt with JSON schema produces reliable output.
```

---

## 14. Prompt Version Registry

Track every prompt version for A/B testing and quality improvement.

```typescript
export const PROMPT_VERSIONS = {
  // Floorplan analysis
  "floorplan_analysis_v1": {
    version: "1.0",
    date: "2026-02-10",
    description: "Initial floorplan analysis prompt with 10 tour sequence rules",
    status: "active",
  },

  // Clip generation - LLM system prompt
  "clip_generation_system_v1": {
    version: "1.0",
    date: "2026-02-10",
    description: "Initial cinematic director system prompt with 7 rules",
    status: "active",
  },

  // Template-based clip assembly
  "clip_template_v1": {
    version: "1.0",
    date: "2026-02-10",
    description: "First version of template-based prompt assembly",
    status: "active",
  },

  // Negative prompts
  "negative_universal_v1": {
    version: "1.0",
    date: "2026-02-10",
    description: "Universal negative prompt covering common artifacts",
    status: "active",
  },

  // Music generation
  "music_library_v1": {
    version: "1.0",
    date: "2026-02-10",
    description: "Initial 10-track music library prompt set",
    status: "active",
  },
};

// Future: Store prompt versions in DB, A/B test different versions
// per video job, track quality scores per version to optimize over time.
```

---

## Appendix A: Complete Prompt Variable Reference

| Variable                      | Source                                     | Example Value                                                   |
| ----------------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| `{{PROPERTY_TYPE}}`         | listings.property_type                     | `"house"`                                                     |
| `{{PROPERTY_TYPE_CONTEXT}}` | Assembled from listing fields              | `"Property type: house. 4 bedrooms. 3 bathrooms. 2400 sqft."` |
| `{{ARCHITECTURAL_STYLE}}`   | floorplan_analysis.architectural_style     | `"modern farmhouse"`                                          |
| `{{FROM_ROOM}}`             | tour_sequence[n].from                      | `"Living Room"`                                               |
| `{{TO_ROOM}}`               | tour_sequence[n].to                        | `"Kitchen"`                                                   |
| `{{TRANSITION_TYPE}}`       | tour_sequence[n].transition_type           | `"walk"`                                                      |
| `{{TIME_OF_DAY}}`           | Config default                             | `"Warm golden hour sunlight"`                                 |
| `{{LIGHT_DIRECTION}}`       | floorplan_analysis.natural_light_direction | `"south-facing windows"`                                      |
| `{{CLIP_NUMBER}}`           | Sequential counter                         | `3`                                                           |
| `{{TOTAL_CLIPS}}`           | tour_sequence.length                       | `12`                                                          |
| `{{DURATION}}`              | config.video.defaultClipDuration           | `"5"`                                                         |
| `{{STYLE_MODIFIER}}`        | Lookup from STYLE_MODIFIERS                | Full style object                                               |
| `{{NEGATIVE_PROMPT}}`       | Assembled from universal + room-specific   | Full negative string                                            |
| `{{MODEL_NAME}}`            | Based on model_preference                  | `"Kling 3.0"`or `"Veo 3.1"`                                 |
| `{{CAMERA_HEIGHT}}`         | Room-specific or default                   | `"eye level"`                                                 |
| `{{EXTERIOR_DESCRIPTION}}`  | From listing photos or generic             | `"a modern farmhouse facade with stone accents"`              |
| `{{VIDEO_DURATION}}`        | Calculated total                           | `"55"`(seconds)                                               |
| `{{SELECTED_STYLE}}`        | User selection or auto-matched             | `"elegant"`                                                   |
| `{{TEMPO}}`                 | Based on music style                       | `"90"`(BPM)                                                   |

## Appendix B: Example Complete Prompt Set for a 10-Clip Tour

**Property:** Modern Farmhouse, 4 bed / 3 bath, 2,400 sqft, Austin, TX

| Clip | From → To                    | Final Prompt (abbreviated)                                                                                                                                                                                          |
| ---- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Exterior → Front Door        | Smooth cinematic steadicam approach shot at eye level. Camera glides along stone walkway toward a modern farmhouse with board-and-batten siding and black-framed windows. Golden hour light...                      |
| 2    | Front Door → Foyer           | Through-the-doorway dolly at eye level, crossing the threshold into a welcoming foyer. Wide plank oak floors, shiplap accent wall, modern pendant fixture overhead...                                               |
| 3    | Foyer → Living Room          | Steady forward dolly revealing an open-concept living room. Exposed beam ceiling, stone fireplace as focal point, large south-facing windows flooding the space with golden light...                                |
| 4    | Living Room → Kitchen        | Gentle tracking shot transitioning from living area to kitchen. Camera follows the open sightline past the island. Quartz countertops, shaker cabinetry, farmhouse sink...                                          |
| 5    | Kitchen → Dining Room        | Smooth pan from kitchen workspace toward adjacent dining area. Farm table centered under modern chandelier. Natural light through French doors leading to the backyard...                                           |
| 6    | Dining Room → Stairs         | Forward dolly from dining toward the staircase. Camera approaches the stair entry, oak treads visible ascending...                                                                                                  |
| 7    | Stairs → Master Bedroom      | Ascending steadicam at handrail height. Camera crests the landing and enters the primary suite. Generous room with sitting nook, vaulted ceiling with exposed beam...                                               |
| 8    | Master Bedroom → Master Bath | Through-doorway dolly into the en-suite. Dual vanities with quartz tops, freestanding soaking tub by the window, glass-enclosed shower with rainfall head...                                                        |
| 9    | Master Bath → Bedroom 2      | Forward dolly through hallway into second bedroom. Bright corner room with two windows, neutral walls, plush carpet, ceiling fan...                                                                                 |
| 10   | Bedroom 2 → Backyard         | Descending stairs (quick), camera exits through French doors onto the covered patio. Golden hour light across the lawn, mature landscaping, stone paver patio. Camera gently settles into a wide establishing shot. |

---

*End of Prompt Engineering Playbook. This document contains every prompt, every variable, every template, and every tuning note needed to generate professional real estate tour videos. Update the version registry as prompts are refined through production testing.*
