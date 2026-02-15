# Technical Audit & Unified Production Roadmap

> **→ For current pipeline architecture and flow, see `apps/worker/TOURREEL_REALTOR_HANDOFF_SPEC.md`.** (PIPELINE_SPEC was migrated.)

This document serves as a retrospective audit of the TourReel project. It synthesizes past technical failures and lessons learned. The canonical implementation spec is now `TOURREEL_REALTOR_HANDOFF_SPEC.md` (formerly PIPELINE_SPEC).

## 1. Context & Retrospective: The Failure Audit

### A. The "Hallucination" Trap
*   **Failure**: Repeated generation of broken URLs using `storage.realtor-video.com`.
*   **Root Cause**: Over-reliance on "mock" documentation in `claude ref/blueprint.md` instead of local environment secrets.
*   **Lesson**: The `claude ref/` folder contains *conceptual* blueprints. The `.env` file and `config.ts` are the only sources of truth for infrastructure.

### B. The Missing Realtor Identity
*   **Failure**: Generated videos contained property footage but completely ignored the "Realtor" requirement.
*   **Root Cause**: A hardcoded "Banned Elements" list in `apps/worker/src/services/prompt-generator.ts` which explicitly forbade "people, persons, human figures."
*   **Correction**: This rule was intended for a generic MVP but contradicts the core "Realtor-Centric" requirement of the project.

### C. The "Visible Transition" Flaw
*   **Failure**: Transitions between rooms appeared as visible crossfades (`xfade`) instead of a "seamless walkthrough."
*   **Root Cause**: The `ffmpeg.ts` service was configured to use standard video transitions rather than implementing the **Frame-Matching Seamless Concatenation** protocol.
*   **Status**: This requires a structural shift from "Stitching with Fades" to "AI-Driven Frame Continuity."

### D. Process Failures
*   **Spec-Driven Development (SDD)**: I failed to follow the mandated cycle (Spec -> Plan -> Tasks -> Implement).
*   **Rules Ignorance**: I ignored `.agent/rules/general.md` which points to `AGENTS.md` (which is still missing from the root) and `tasks/lessons.md`.

---

## 2. Current Project State (February 11, 2026)

### Infrastructure
- **R2 Storage**: Verified and functioning. Video `final_production.mp4` successfully uploaded to the bucket.
- **Local VPS**: Files saved in `/tmp/tourreel-jobs/test-prod-1770831069230/`.
- **Environment**: `.env` sanitized of mock domains.
- **Git**: **CRITICAL FAILURE**. The workspace is currently NOT a Git repository. Local changes are at risk of being lost if moved.

### Codebase Correctness
- `apps/worker/src/services/r2.ts`: **FIXED**. No longer prepends mock domains.
- `apps/web/src/components/JobCard.tsx`: **FIXED**. Dynamic URL resolution implemented (relative path fallback).
- `tasks/lessons.md`: **INITIALIZED**. Now tracking R2 leaks and prompt failures.

---

## 3. The Unified Production Specification (Bible Alignment)

To achieve the "WOW" result, the following **MUST** be implemented according to the NotebookLM references:

### I. Realtor Identity Protocol
The Realtor is the "Anchor" of the video.
- **Character Traits**: (Pending NotebookLM Refresh) - Will include consistent descriptions of the realtor's appearance, attire, and role.
- **Presence**: The realtor must appear in the opening shot, at key transitions (e.g., entering the kitchen), and in the closing "call to action."
- **Prompt Injection**: Prompts must be modified to describe the realtor moving *within* the frame, interacting with the space.

### II. Seamless Transition Architecture
Visible transitions are unacceptable for a "walkthrough" feel.
- **First-and-Last Frame Matching**: 
    1. Extract the last frame of Video N.
    2. Use this as the `image_url` (seed) for Video N+1 using Kie.ai's `FIRST_AND_LAST_FRAMES_2_VIDEO` generation type.
- **FFmpeg Protocol**:
    - Remove `xfade`.
    - Use the `concat` demuxer for zero-loss, zero-transition stitching between perfectly matched head/tail frames.

### III. Identity Consistency
- **Visual Seed**: Use a consistent reference image (Avatar URL) for the realtor.
- **Negative Prompts**: Remove "people" from the negative prompt and add `morphing, melting, inconsistent facial features`.

---

## 4. Immediate Roadmap (The "Final Mile")

1.  **[ ] GitHub Initialization**: Initialize repository and push to origin to ensure the environment is portable.
2.  **[ ] NotebookLM Ingestion**: Once `notebooklm-mcp-auth` is refreshed, ingest the specific "Identity" traits for the realtor.
3.  **[ ] Prompt Generator Overhaul**: Rewrite `generateClipPrompts` to include the Realtor Persona and enforce frame-matching instructions.
4.  **[ ] FFmpeg Transition Rewrite**: Replace `stitchClips` with a seamless concatenation method.
5.  **[ ] End-to-End Production Run**: Execute a full job from scratch and verify against the **Bible** specs.

---
**Status: Phase 1–4 implemented (Feb 2026).** Prompt generator: realtor persona + hero features. Hero system: every property gets top-3 hero focus (pool, kitchen island, fireplace, view, master suite). FFmpeg: concat demuxer. Nano Banana: approach walk, hero room prompts. Video gen: Kie Kling 3.0 only. Text overlays: stub. See NotebookLM 0baf5f36 (Zillow-to-Video).
