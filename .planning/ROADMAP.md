# Roadmap: Character-in-a-Box Pipeline

**Created:** 2026-03-13
**Phases:** 5
**Core Value:** Client sees their AI brand character on Day 1 via WhatsApp

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | WhatsApp Group Bootstrapper | Auto-create branded WhatsApp group with AI agent on trigger | ONBD-01, ONBD-02, ONBD-03 | 3 |
| 2 | AI Questionnaire Agent | Conversational character questionnaire → CharacterBible | QUES-01..07, CHAR-01..03 | 5 |
| 3 | fal.ai Video Generation | Generate reference + 5 test scenes via Sora 2 | VGEN-01..04 | 4 |
| 4 | Reveal Video + Delivery | Remotion composition → FFmpeg render → WhatsApp delivery | REVL-01..04, DLVR-01..03 | 4 |
| 5 | Pipeline Orchestration | BullMQ end-to-end pipeline with cost tracking + admin visibility | PIPE-01..04 | 3 |

---

## Phase 1: WhatsApp Group Bootstrapper

**Goal:** When admin triggers the pipeline for a tenant, system auto-creates a branded WhatsApp group, adds the client, and registers the AI agent.

**Requirements:** ONBD-01, ONBD-02, ONBD-03

**Success Criteria:**
1. POST `/api/character-pipeline/start` with tenantId + clientPhone creates WhatsApp group
2. Group has name "[BusinessName] — Character Studio", icon from tenant logo, description
3. AI agent is registered in group_agent_config with character-questionnaire system prompt

**Key files to create/modify:**
- `apps/worker/src/api/routes.ts` — Add `/api/character-pipeline/start` endpoint
- `apps/worker/src/services/character-pipeline/group-bootstrap.ts` — Group creation logic
- Uses: `waha-client.ts` (createGroup, setGroupIcon, setGroupDescription, addGroupParticipant)
- Uses: `group-agent.ts` (registerGroup)

---

## Phase 2: AI Questionnaire Agent

**Goal:** AI agent in the WhatsApp group conducts a structured-but-conversational questionnaire, collects brand info, and generates a CharacterBible.

**Requirements:** QUES-01..07, CHAR-01..03

**Success Criteria:**
1. Agent sends welcome message and asks first question within 10 seconds of group creation
2. Agent tracks questionnaire state (which questions asked, which answered) across messages
3. Agent handles text responses and asks follow-ups for vague answers
4. After all info collected, agent confirms with client and generates CharacterBible in DB
5. CharacterBible has all required fields populated (persona, visual style, audience, scenarios)

**Key files to create/modify:**
- `apps/worker/src/services/character-pipeline/questionnaire-agent.ts` — Questionnaire state machine
- `apps/worker/src/services/character-pipeline/character-bible-generator.ts` — Claude → CharacterBible
- Extends: `group-agent.ts` system prompt with character-specific instructions
- Uses: `claudeclaw` queue for Claude responses

---

## Phase 3: fal.ai Video Generation

**Goal:** Generate reference character video + 5 test scene videos via fal.ai Sora 2 API.

**Requirements:** VGEN-01..04

**Success Criteria:**
1. fal.ai client successfully calls Sora 2 API with character prompt from CharacterBible
2. 6 videos generated (1 reference + 5 scenes) and uploaded to R2
3. All 6 registered as TenantAssets with correct metadata
4. PipelineRun records for each generation step with cost tracking

**Key files to create/modify:**
- `apps/worker/src/services/character-pipeline/fal-client.ts` — fal.ai Sora 2 API client
- `apps/worker/src/services/character-pipeline/scene-generator.ts` — Scene prompt builder + generation orchestrator
- Uses: `r2.ts` (uploadToR2 with assetInfo), `pipeline-run.ts`, `tenant-asset.ts`

---

## Phase 4: Reveal Video + Delivery

**Goal:** Wrap 5 test scenes into a branded Remotion composition, render via FFmpeg, deliver via WhatsApp.

**Requirements:** REVL-01..04, DLVR-01..03

**Success Criteria:**
1. CharacterReveal Remotion composition renders 5 scenes with brand overlays (logo, name, colors)
2. FFmpeg produces final MP4 at 1080p
3. Video uploaded to R2 as TenantAsset
4. WAHA delivers video to the original WhatsApp group with summary message

**Key files to create/modify:**
- `apps/worker/remotion/src/CharacterRevealComposition.tsx` — New Remotion composition
- `apps/worker/remotion/src/Root.tsx` — Register CharacterReveal composition
- `apps/worker/src/services/character-pipeline/reveal-renderer.ts` — Render + upload + deliver
- Uses: `remotion-renderer.ts` (renderComposition), `r2.ts`, `waha-client.ts` (sendVideo)

---

## Phase 5: Pipeline Orchestration

**Goal:** Wire everything into a BullMQ pipeline that runs end-to-end with error handling, cost tracking, and admin visibility.

**Requirements:** PIPE-01..04

**Success Criteria:**
1. `character-pipeline` BullMQ queue processes jobs through all 4 stages sequentially
2. Pipeline retries failed generation steps (max 3), alerts on permanent failure
3. Total cost tracked via trackExpense() and PipelineRun
4. Admin can view pipeline status via GET `/api/character-pipeline/status/:tenantId`

**Key files to create/modify:**
- `apps/worker/src/queue/queues.ts` — Add `characterPipelineQueue`
- `apps/worker/src/queue/workers/character-pipeline.worker.ts` — Main pipeline worker
- `apps/worker/src/api/routes.ts` — Add status endpoint
- Uses: All character-pipeline services from phases 1-4

---

## Dependencies

```
Phase 1 (Group Bootstrap) → Phase 2 (Questionnaire) → Phase 3 (Video Gen) → Phase 4 (Reveal + Delivery)
                                                                                       ↓
                                                                              Phase 5 (Orchestration)
```

Phases 1-4 are sequential (each depends on previous output).
Phase 5 wires them together — can start partially after Phase 1-2 are done.

---
*Created: 2026-03-13*
*Last updated: 2026-03-13 after initial creation*
