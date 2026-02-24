# NotebookLM TourReel Audit — Conflicts & Required Updates
**Date:** 2026-02-23
**Notebook:** Zillow-to-Video (0baf5f36-7ff0-4550-a878-923dbf59de5c)
**Sources:** 23 documents
**Authority:** DECISIONS.md §14 — Documentation Consolidation Audit

---

## Executive Summary

The TourReel NotebookLM notebook contains **7 critical conflicts** with the current quality-first implementation approach documented in DECISIONS.md §12. These conflicts span model versions, avatar requirements, creative direction, aspect ratios, music generation, and feature detection.

**Priority:** 🔴 HIGH — NotebookLM is the spec source of truth but currently contradicts deployed code.

---

## Critical Conflicts Identified

### 1. **Nano Banana Creative Effects vs Quality-First Approach**

**NotebookLM Says:**
- "Nano Banana Pro to composite the Realtor into these high-quality room photos"
- Nano Banana is "The Architect" for "prepping images and placing the Realtor naturally into room photos"
- Creative "Hero Moments" with furniture staging and magical effects

**Current Reality (DECISIONS.md §12):**
- "Drop furniture-from-sky (Nano Banana) to focus on realtor consistency + room accuracy"
- "We cannot lose quality. We cannot risk it to generate things"
- Nano Banana effects **PAUSED** until realtor consistency solved

**Conflict Severity:** 🔴 CRITICAL
**Required Update:** Add note that Nano Banana is PAUSED in favor of Kling-only pipeline focusing on realtor consistency. Update creative direction to prioritize accuracy over magical effects.

---

### 2. **Vision Model Version (gemini-2.5-flash vs gemini-3-flash)**

**NotebookLM Says:**
- "gemini-2.5-flash via a Kie.ai proxy to plan the tour"
- "gemini-3-flash for chat completions" (general, not specific to vision)
- Gemini 3.0 Pro for "Brain" (conflicting references)

**Current Reality (Deployed Code):**
- Upgraded to **gemini-3-flash** for ALL vision analysis (feature-detector.ts, gemini.ts)
- 15% better accuracy than gemini-2.5-flash
- All property analysis, feature detection, and prompt generation uses gemini-3-flash

**Conflict Severity:** 🔴 CRITICAL
**Required Update:** Update all model references to gemini-3-flash as the primary vision model. Document the 15% accuracy improvement and upgrade rationale.

---

### 3. **Realtor Avatar Photo Requirements**

**NotebookLM Says:**
- "The system requires **one realtor headshot** to be uploaded"
- "Standard production workflow is initiated by uploading a single headshot"

**Current Reality (TOURREEL_REALTOR_CONSISTENCY.md):**
- Industry standard: **4+ reference images** for professional use
- Kling Elements best practices: **2-4 photos from different angles**
- We currently use 2, should increase to **4 minimum**
- Front, 3/4 left, 3/4 right, side profile recommended

**Conflict Severity:** 🔴 CRITICAL
**Required Update:** Update avatar requirements to 4 minimum photos from different angles. Document the character consistency research findings and industry benchmarks.

---

### 4. **Video 3.0 Omni and Subject Library (Not Documented)**

**NotebookLM Says:**
- "Neither 'Video 3.0 Omni' nor 'Subject Library' is mentioned in the provided sources"

**Current Reality (TOURREEL_REALTOR_CONSISTENCY.md):**
- Kling Video 3.0 Omni has **Subject Library** feature (Feb 2026 release)
- Create reusable character library for each realtor
- Upload 3-8 second video → AI extracts face, body, appearance
- **Every video uses exact same subject** — zero variation
- Multi-shot storyboarding generates all 14 clips in one job for better consistency

**Conflict Severity:** 🔴 CRITICAL (Missing Feature Discovery)
**Required Update:** Add new document on Video 3.0 Omni capabilities, Subject Library implementation plan, and multi-shot storyboarding approach.

---

### 5. **Aspect Ratio Bug and Output Resolution**

**NotebookLM Says:**
- "9:16 (vertical)" primary aspect ratio
- "1080x1920" standard resolution
- No mention of 1660x1244 bug

**Current Reality (Deployed Code):**
- Kling outputs **1660x1244** natively (not 1920x1080)
- Bug: normalizeClip() was preserving native resolution
- Fix: Force 1920x1080 output via explicit config.video.outputWidth/outputHeight
- User complaint: "not wide, looks like ratio one on one" (4:3 instead of 16:9)

**Conflict Severity:** 🟡 MEDIUM (Bug Not Documented)
**Required Update:** Document the aspect ratio normalization fix and Kling native output resolution quirks.

---

### 6. **Music Generation Priority (Suno vs Database)**

**NotebookLM Says:**
- "Fresh Generation: Suno V5 is triggered simultaneously with video rendering"
- "If music generation fails, set audio_policy to 'none'"
- No database fallback mentioned

**Current Reality (Deployed Code):**
- Bug: Database fallback was prioritized BEFORE Suno generation
- User complaint: "you use the same exact song you used, which means you didn't generate anything"
- Fix: Suno now PRIMARY path, database only as fallback on Suno failure
- Priority order: Fresh Suno → Database fallback → None

**Conflict Severity:** 🟡 MEDIUM (Bug Not Documented)
**Required Update:** Document music generation priority fix and the database fallback logic correction.

---

### 7. **Room-Specific Negative Prompts (Not Documented)**

**NotebookLM Says:**
- "Do not list specific room-by-room negative furniture prompts"
- "Spatial limitations can result in realtor appearing to 'walk through furniture'"
- Generic SILENT_NEGATIVE and REALTOR_NEGATIVE mentioned

**Current Reality (Deployed Code):**
- Created **room-negative-prompts.ts** utility
- Room-specific exclusions: "pillows in kitchen", "chairs in bathroom", "kitchen items in bedroom"
- User complaint: "kitchen is being furnished with pillows and living room stuff, it puts a chair in front of the bathroom sink"
- Fix prevents wrong furniture in wrong rooms

**Conflict Severity:** 🟡 MEDIUM (Missing Implementation)
**Required Update:** Add documentation for room-specific negative prompts and furniture placement prevention strategies.

---

## Additional Missing Documentation

### 8. **Dynamic Pool Detection**

**NotebookLM Has:** Generic pool detection logic
**Codebase Has:**
- detectPool() function with phrase matching
- Dynamic finale prompt based on hasPool boolean
- Prevents fake pool hallucination (Yaron's property correctly detected NO POOL)

**Required Update:** Document the pool detection logic and dynamic prompt generation approach.

---

### 9. **Property Feature Detector (New Service)**

**NotebookLM Has:** No mention
**Codebase Has:**
- feature-detector.ts service (Gemini 3 Flash vision)
- Detects 22 property features (pool, jacuzzi, fireplace, island, etc.)
- Conservative approach: vision + text confirmation required
- Cost: ~$0.01 per property
- Created Feb 23, 2026

**Required Update:** Add new document on property feature detection service, capabilities, cost, and integration into pipeline.

---

### 10. **Model Observatory System (New Infrastructure)**

**NotebookLM Has:** No mention
**Codebase Has:**
- AI Model Observatory (tools/model-observatory/)
- Database tables: ai_models, ai_model_recommendations
- Tracks models across Kie.ai, Google, OpenAI, Anthropic
- User mandate: "i cannot afford u not being fully updated on kie.ai/market and all llm's and models without exception"
- Created Feb 23, 2026

**Required Update:** Add new document on Model Observatory architecture, daily scraping automation, and model tracking requirements.

---

## Deployment Information Conflicts

**NotebookLM Says:**
- Worker at `/opt/tourreel-worker`
- "Older references to `/root/tourreel-worker` are now considered stale"

**Current Reality:**
- ✅ CORRECT — Worker is at `/opt/tourreel-worker`
- Port 3002 (RackNerd), port 3001 (local when site on 3002)
- PM2 process name: "tourreel-worker"

**No conflict here** — NotebookLM is up-to-date on deployment paths.

---

## Quality-First Pivot Documentation Gap

**NotebookLM Has:**
- Trade-off discussion between "quality-first (accuracy)" and "creative staging (magical effects)"
- "In-Scene vs Picture-in-Picture (PiP)" debate
- "PiP is the recommended fallback if users prioritize reliability"

**DECISIONS.md §12 Says:**
- "Quality and consistency over creative effects" (DECIDED, not debated)
- "Zero tolerance for hallucination"
- "I don't mind losing time. I cannot afford losing quality."

**Gap:** NotebookLM presents this as an open trade-off discussion, but it's been DECIDED as of Feb 23, 2026. The quality-first approach is now the canonical direction, not an option to consider.

**Required Update:** Add DECISIONS.md §12 content to NotebookLM as an override document. Mark the creative effects debate as "RESOLVED — Quality First."

---

## Recommended Action Plan

### Phase 1: Critical Conflicts (Immediate)
1. **Add DECISIONS.md §12 as new source** — Quality-First Pivot override
2. **Update vision model references** — gemini-2.5-flash → gemini-3-flash throughout
3. **Update avatar requirements** — 1 photo → 4 photos minimum
4. **Add Video 3.0 Omni research** — Subject Library, Multi-shot storyboarding

### Phase 2: Bug Documentation (High Priority)
5. **Document aspect ratio fix** — 1660x1244 → 1920x1080 normalization
6. **Document music priority fix** — Suno primary, database fallback
7. **Add room-specific negative prompts** — Furniture placement prevention

### Phase 3: New Services (Medium Priority)
8. **Add feature-detector.ts documentation** — Property feature detection service
9. **Add Model Observatory documentation** — AI model tracking system
10. **Update dynamic pool detection** — Prompt generation based on detected features

### Phase 4: Sync with Codebase (Ongoing)
11. **Cross-reference with TOURREEL_GAP_ANALYSIS.md** — Merge findings
12. **Cross-reference with TOURREEL_REALTOR_CONSISTENCY.md** — Industry research
13. **Verify all model references** — Ensure consistency across all 23 sources

---

## Authority Hierarchy (Conflict Resolution)

Per `brain.md` and DECISIONS.md §14:

1. **DECISIONS.md** (Tier 1) — User decisions override everything
2. **Deployed Code** (Tier 2) — Running production code is truth
3. **Codebase Docs** (Tier 3) — TOURREEL_GAP_ANALYSIS.md, TOURREEL_REALTOR_CONSISTENCY.md
4. **NotebookLM** (Tier 4) — Spec/methodology source, but must align with above
5. **Aitable.ai** (Tier 5) — Dashboard data only, not authoritative

When NotebookLM conflicts with Tiers 1-3, **NotebookLM must be updated**.

---

## Next Steps

1. **Create update sources for NotebookLM:**
   - Export DECISIONS.md §12 (Quality-First Pivot)
   - Export TOURREEL_REALTOR_CONSISTENCY.md (Industry research)
   - Export TOURREEL_GAP_ANALYSIS.md (Gap documentation)
   - Create NEW: "TourReel Feb 2026 Updates — Bug Fixes and Model Upgrades"

2. **Upload to NotebookLM:**
   - Add 4 new sources to Zillow-to-Video notebook
   - Tag with "OVERRIDE - Feb 2026" for visibility

3. **Verify alignment:**
   - Re-query NotebookLM on each conflict topic
   - Confirm all 10 conflicts resolved

4. **Ongoing sync:**
   - Add to weekly checklist: "Sync codebase changes → NotebookLM"
   - Document new features in NotebookLM within 24 hours of merge

---

**Audit Completed:** Feb 23, 2026
**Auditor:** Claude (Agent)
**Status:** 🟢 Complete — 10 conflicts identified, action plan ready
**Next Action:** Create update documents and upload to NotebookLM
