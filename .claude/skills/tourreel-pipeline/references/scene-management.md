# Scene & Room Management

## Floorplan Analysis

Gemini 3 Pro vision analyzes the floorplan image and extracts:
- Room names, types, positions, sizes
- Suggested tour sequence (walking path)
- Floor count, special features
- Confidence score (0.0-1.0)

### Tour Sequence Rules

- ALWAYS start with "Exterior Front" → "Front Door"
- Follow logical walking path (no teleportation)
- Add "Stairs" ONLY if multiple floors detected
- Add "Pool" ONLY if visible on floorplan (ONE max)
- Add "Backyard" ONE max; order: Backyard → Pool
- Never include utility rooms (HVAC, electrical)
- Bathrooms follow their bedrooms (Master Bed → Master Bath)

### Default Sequences (when no floorplan)

Fallback sequences by property type:

**3-bed house**: Exterior → Front Door → Foyer → Living → Kitchen → Dining → Master Bedroom → Master Bath → Bedroom 2 → Bedroom 3 → Bathroom → Backyard → Pool

**Condo/Townhouse**: Exterior → Entry → Living → Kitchen → Bedroom → Bathroom → Balcony

### TourRoom Type

```typescript
{
  order: number;
  from: string;          // "Exterior Front"
  to: string;            // "Front Door"
  transition_type: "walk" | "enter" | "stairs" | "exit";
}
```

## Photo-to-Room Assignment

### Rules

| Room | Photo Assignment |
|------|-----------------|
| Exterior/Front Door | First photo in sequence |
| Foyer/Entry | Second photo |
| Pool/Backyard | Last photo(s) in sequence |
| All others | By index (round-robin) or AI vision override |

### AI Vision Override

When `USE_AI_PHOTO_MATCH=true` (default), Gemini matches photos to rooms:
- Analyzes up to 20 photos
- Returns `Map<roomIndex, photoIndex>`
- Falls back to heuristic if vision fails

### Opening Photo Selection

Gemini picks the best "approach" photo:
- Must show pathway/front door area
- NOT pool, backyard, or interior
- Analyzes up to 8 candidate photos

## Room Camera Flows (Hardcoded)

Each room type has a specific camera movement:

| Room | Camera Flow |
|------|-------------|
| kitchen | Track along countertop, settle on island/window |
| living | Enter wide, dolly forward, settle on window/fireplace |
| master_bedroom | Enter slowly, sweep full suite, toward window/en-suite |
| bedroom | Gentle pan from door, settle on window |
| bathroom | Slow pan from vanity, toward shower/tub |
| dining | Track along table, settle on chandelier/window |
| foyer | Enter from door, dolly toward staircase/hallway |
| pool | Glide along deck, reveal pool/water, wide view |
| backyard | Move out patio, reveal lawn/landscaping, widest view |
| stairs | Dolly forward ascending, reveal landing above |
| office | Pan from desk, toward bookshelf/window |
| hallway | Track forward, reveal rooms off hallway |

## Room-Specific Negative Prompts

| Room | Banned Elements |
|------|----------------|
| kitchen | dirty dishes, messy counters, open cabinets, cooking, steam |
| bathroom | toilet seat up, dirty towels, soap scum, water stains |
| bedroom | unmade bed, messy clothes, personal items |
| pool | rain, cloudy sky, dead plants, trash |

## Single-Story Detection

Checks (in order):
1. `floorplan.floors <= 1`
2. Description keywords: "single-story", "ranch", "one story"
3. Amenities/reso_facts for story count

If single-story → remove "Stairs" from sequence automatically.
