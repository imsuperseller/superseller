# Zillow-to-Video Pipeline: Research Audit & Gaps

**Date:** Feb 12, 2026  
**Purpose:** Address user feedback: no realtor, missing pool, low quality, few scenes. Meticulous comparison to references and best practices.

---

## 1. Executive Summary

| Issue | Root Cause | Status |
|-------|------------|--------|
| No realtor visible | `includeRealtor = false` (hardcoded) to fix Nano Banana "media unavailable" | Fixable |
| Pool not featured | Zillow data lacks floorplan; pool never detected; no amenity extraction | Gap |
| Low quality | Kling 3.0 only (Veo retired Feb 2026). Kling 2.6 removed. | Fixed Feb 2026 |
| Few scenes (7) | No floorplan → empty tour sequence → LLM invents minimal sequence | Major gap |

---

## 2. Scene / Tour Sequence Determination

### Current Flow

```
listing.floorplan_url? 
  → analyzeFloorplan() → floorplan_analysis 
  → buildTourSequence(analysis) → tourRooms
else listing.floorplan_analysis?
  → buildTourSequence() → tourRooms
else
  tourRooms = listing.tour_sequence || []   // EMPTY for Zillow
```

**For Zillow listings:** We scrape photos, price, beds, baths, sqft. We do **NOT**:
- Save `description`, `amenities`, `resoFacts` (Apify returns these but we don't store them)
- Have `floorplan_url` (Zillow doesn't expose it in standard scrape)
- Run any fallback when `tourRooms` is empty

### What the References Say

**Playbook §10 – "When no floorplan is provided"**:
- `getDefaultSequence(propertyType, bedrooms, bathrooms)` → predefined sequences (house_3bed_2bath, house_4bed_3bath, etc.)
- **Status:** NOT IMPLEMENTED. Exists only in playbook markdown.
- **DEFAULT_SEQUENCES:** None include "Pool". house_4bed_3bath = 16 transitions. house_3bed_2bath = 12 transitions.

**Playbook §10B – Photo-Based Room Detection**:
- LLM analyzes each photo URL, returns room type + notable_features (e.g. pool, fireplace)
- **Status:** NOT IMPLEMENTED.

**Floorplan analyzer (when used):**
- Rule 6: "POOL IS A HERO FEATURE: When special_features includes 'pool', ALWAYS add 'Pool' to the tour. Place it as the FINALE."
- Rule 7: "End with outdoor spaces… Order: Backyard → Pool (when pool exists) so Pool is the finale."
- This only applies when we have floorplan_analysis.

### Industry Best Practices (Research)

- **Video length:** 3–5 minutes (realtor.com, matterport)
- **Priority rooms:** Kitchen > Bedrooms > Bathrooms > Living > Exterior > Garden > Garage > Balcony
- **Pool:** Called out as premium feature; should be a "big reveal" finale when present
- Our 7 clips × 5s = 35s → far below 3–5 min. Reference sequences suggest 12–16 clips.

---

## 3. Hero Features (Pool Detection)

### Current: `deriveHeroFeatures(floorplan_analysis)`

- Reads `floorplan_analysis.special_features` and `rooms[].notable_features`
- For Zillow: `floorplan_analysis` is null → `deriveHeroFeatures({})` → fallback `["kitchen_island", "master_suite"]` (no pool)

### Missing Data Sources

- **Zillow `description`** – Often mentions "pool", "backyard pool", etc. Not saved to DB.
- **Zillow `amenities` / `resoFacts`** – Apify returns `resoFacts.atAGlanceFacts` (e.g. "Pool: In Ground"). Not saved.
- **Photo labels** – Zillow photos sometimes have room labels. We don't analyze them.

---

## 4. Realtor / Avatar

### Current

```ts
const includeRealtor = false;  // Hardcoded
```

### Why Disabled

- `user.avatar_url` (Clerk CDN or similar) → Kie/Nano Banana returns "Your media file is unavailable"
- Kie fetches URLs server-side; Clerk URLs may need auth or be blocked

### Fix Path

1. Run `ensurePublicUrl(user.avatar_url, "avatar")` – fetch avatar, upload to R2, pass R2 URL to Nano Banana
2. Re-enable `includeRealtor = !!avatarPublic && !!exteriorPublic`
3. Keep Nano Banana prompts for realtor placement (already in `nano-banana-prompts.ts`)

---

## 5. Video Quality (Kling 3.0 Only)

### Current (Feb 2026)

- **Primary:** Kling 3.0 (kling-3.0/video, mode: pro) — only model used for clips
- **Veo:** Retired — caused quality/plastic issues per TOURREEL_REALTOR_HANDOFF_SPEC
- **Removed:** Kling 2.6 — no longer used in this product (per NotebookLM ref)

---

## 6. Gaps vs. References

| Feature | Playbook / Blueprint | Implementation |
|---------|----------------------|----------------|
| Default tour when no floorplan | §10 `getDefaultSequence()` | ❌ Missing |
| Photo-based room detection | §10B LLM over photos | ❌ Missing |
| Pool in default sequence | Floorplan rules 6–7 | Only when floorplan exists |
| Save Zillow description/amenities | Implied for prompts | ❌ listings table has no such columns |
| Realtor in scenes | Blueprint Phase 3, Nano Banana | Disabled (avatar URL issue) |
| 12–16 clips for houses | DEFAULT_SEQUENCES | We get ~7 from LLM with empty tour |

---

## 7. Recommended Implementation Order

### P0 – Scene Count & Pool (No Floorplan)

1. **Implement `getDefaultSequence`** in `floorplan-analyzer.ts` (or new `tour-sequences.ts`)
2. **Extend default sequences** – Add variants with Pool (e.g. `house_4bed_3bath_pool`)
3. **Use default when `tourRooms.length === 0`**:
   ```ts
   if (tourRooms.length === 0) {
     const defaultRooms = getDefaultSequence(listing.property_type, listing.bedrooms, listing.bathrooms);
     tourRooms = buildTourSequenceFromRoomNames(defaultRooms);
   }
   ```
4. **Pool detection without floorplan:**
   - Persist Zillow `description` and `amenities`/`resoFacts` in listings (schema + from-zillow route)
   - Parse for "pool" (and variants) → set `hasPool` in hero features
   - When `hasPool`, use a sequence that includes "Backyard" → "Pool"

### P1 – Realtor

1. Add `avatarPublic = await ensurePublicUrl(user.avatar_url, "avatar")` before Nano Banana
2. Set `includeRealtor = !!avatarPublic`
3. Revert LEGACY_SYSTEM_PROMPT to REALTOR_SYSTEM_PROMPT when includeRealtor

### P2 – Quality

1. Log which Kling model succeeded
2. Re-test Kling 3 with same images; capture full API response on failure
3. Kling 3 only—no Veo fallback (per TOURREEL_REALTOR_HANDOFF_SPEC)

### P3 – Listing Data Completeness

1. Add `description TEXT`, `amenities JSONB`, `reso_facts JSONB` to listings
2. Update from-zillow to store scraped description and resoFacts
3. Pass amenities/description into prompt generator and hero-feature logic

---

## 8. Files to Modify

| File | Changes |
|------|---------|
| `src/queue/workers/video-pipeline.worker.ts` | Default tour when empty; avatar → R2; re-enable realtor |
| `src/services/floorplan-analyzer.ts` | Add `getDefaultSequence`, `buildTourSequenceFromRoomNames` |
| `src/services/hero-features.ts` | Accept `description`, `amenities` for pool detection |
| `src/api/routes.ts` | Save description, amenities, resoFacts in from-zillow |
| `src/services/apify.ts` | Ensure we return description, amenities, resoFacts |
| `db/migrations/` | Add description, amenities, reso_facts to listings |
| `src/services/kie.ts` | Optional: try Kling 3 with different params first |
| `src/services/prompt-generator.ts` | Use REALTOR_SYSTEM_PROMPT when includeRealtor |

---

## 9. Reference Checklist

- [x] `playbook prompt.md` §10 – Default sequences
- [x] `playbook prompt.md` §10B – Photo-based room detection
- [x] `floorplan-analyzer.ts` – Pool in tour rules
- [x] `hero-features.ts` – Pool detection from special_features
- [x] `blueprint.md` – Realtor + Nano Banana flow
- [x] Industry: 3–5 min, 12+ scenes for houses, pool as finale
