# Feature Research

**Domain:** Iterative AI character design — client change requests and selective scene regeneration
**Researched:** 2026-03-15
**Confidence:** HIGH (existing codebase inspected + industry UX pattern research verified via ShapeOfAI, HeyGen Video Agent, LTX Studio Elements docs)

---

## Context: What Already Exists

This is a SUBSEQUENT milestone added on top of the WhatsApp-first character onboarding system. The following infrastructure is production-ready and must NOT be re-built:

| Existing Component | Location / Status |
|---|---|
| Character questionnaire (personality, visual style, industry, brand colors) | Production — onboarding flow |
| `CharacterBible` table — Claude-generated character definition | Production — stores the full creative brief |
| Best Shot routing — optimal model per scene type | Production — model-router |
| 5-scene generation per character, 3-of-5 partial success tolerance | Production — character-video-gen worker |
| `CharacterReveal` Remotion composition — final assembled video | Production |
| WhatsApp delivery with APPROVE / RETRY / SKIP admin commands | Production — pipeline hooks |
| Poll-based module advancement | Production — WAHA integration |
| `PipelineRun` tracking — hooks for status events | Production |

**The gap this milestone closes:** Once a client receives their CharacterReveal video and wants changes ("make her look more professional," "redo scene 3 — the background is wrong"), there is no supported path. Today the only option is a full pipeline re-run from scratch, which costs full generation credits and takes the same time as initial generation.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features clients will assume exist after receiving their character video. Missing any of these makes the product feel unfinished and forces admin intervention for every change request.

| Feature | Why Expected | Complexity | Dependencies on Existing |
|---------|--------------|------------|--------------------------|
| **Natural-language change request via WhatsApp** | Clients already live in WhatsApp for this product; sending "can you make her look more energetic?" in the same thread is the zero-friction path; any other channel (email, form) contradicts the WhatsApp-first brand | MEDIUM | WAHA inbound message handler; ClaudeClaw router to classify intent; `CharacterBible` must be mutable (currently write-once) |
| **CharacterBible update from change request** | A change request that doesn't update the CharacterBible means scene 4 might get regenerated with the old character; the bible is the source of truth for all generation prompts — changing one scene without updating it creates drift | MEDIUM | Claude re-generation of CharacterBible diff; `CharacterBible` upsert endpoint; version history to enable rollback |
| **Selective scene regeneration (pick which scenes to redo)** | Clients who approve scenes 1, 2, 4, 5 should not have to pay to regenerate all 5 again because scene 3 failed; industry standard since at least 2024 (ShapeOfAI documents this as the "regenerate" pattern); HeyGen Video Agent implements "change scene 3" conversationally | MEDIUM | `PipelineRun` scene-level status tracking; individual scene records must be addressable; CharacterReveal must support re-render with a subset of scenes |
| **Scene-by-scene approval before final assembly** | The existing APPROVE/RETRY/SKIP commands operate at the pipeline level; after iteration, clients need to confirm each regenerated scene individually before Remotion re-assembles the full video; otherwise a re-run of scene 3 could silently replace an approved scene 3 with a worse result | LOW | Pipeline hook enhancement; per-scene status column on scene records (approved / pending / rejected) |
| **Confirmation before credit spend** | Generating a new scene costs real money ($0.05–$0.40/scene depending on model); clients must receive a cost-transparent confirmation ("Regenerating scene 3 will take ~2 minutes and uses 1 generation credit — confirm?") before any generation starts; this is both ethical and prevents disputes | LOW | Credit/quota check before any regeneration call; WhatsApp confirmation poll before dispatching BullMQ job |
| **Change request status feedback** ("working on it…" at start, video when done) | Client sends change request, waits 2+ minutes, and receives only silence — this pattern causes re-sends, escalations, and distrust; one status message at submission + one message when complete is the minimum | LOW | WAHA send; no intermediate polling messages (anti-feature below) |

---

### Differentiators (Competitive Advantage)

Features that distinguish iterative character design from a simple "re-run the pipeline" approach.

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Targeted change understanding — character vs. scene scope** | Claude classifies whether the change is character-level ("make her look younger" = CharacterBible update + all scenes) vs. scene-level ("redo scene 3 — wrong background" = single scene, same character); character-level changes trigger a CharacterBible diff + selective re-run of all 5 scenes; scene-level changes regenerate one scene without touching the bible; this prevents full re-runs when only one shot is wrong | HIGH | Claude intent classifier in ClaudeClaw router; CharacterBible diff algorithm; scope-aware BullMQ job dispatcher |
| **Version history with rollback** | Every CharacterBible version and every generated scene is stored with a version number; if a change request makes things worse ("the new scene 3 is worse than the original"), admin can roll back to version N-1 without re-generating; LTX Studio Elements implements this as character "saves" — a versioned asset library | MEDIUM | `character_bible_versions` table; `scene_versions` table or versioned R2 keys; admin rollback command via WhatsApp (`/rollback scene 3`) or admin portal |
| **Change request history per character** | Every change request, the CharacterBible diff it produced, and which scenes it triggered are stored; this creates an audit trail for billing disputes ("I only changed scene 3, why were all 5 regenerated?") and feeds future iteration patterns (which change types are most common?) | LOW | `character_change_requests` table; log intent classification result + scope determination + scenes triggered + cost incurred |
| **Partial video delivery after selective regeneration** | When only scene 3 is regenerated, deliver a new CharacterReveal video that assembles the 4 approved scenes + the new scene 3; do NOT require the client to re-approve scenes 1, 2, 4, 5 again; Remotion's parametric rendering means this is a data change only (pass new scene 3 URL, keep existing URLs for others) | MEDIUM | CharacterReveal composition must accept per-scene URLs as props; Remotion re-render with mixed old/new scene inputs |
| **Admin change request review before execution** | For expensive changes (character-level = all 5 scenes = $0.25–$2.00), admin gets a WhatsApp notification with a summary of what will change and at what cost before it executes; admin can modify the scope (e.g., "only regenerate scenes 2 and 4, not all 5") before approving; prevents runaway credit spend on misunderstood requests | MEDIUM | Admin approval step in pipeline for character-level changes; scene scope editor in admin portal or via WhatsApp commands; bypass for scene-level changes (low cost, no approval needed) |

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Mid-generation progress updates via WhatsApp** | Client wants to know scene 3 is "50% done" | Violates business rule (`feedback_no_scheduled_kie.md`); WAHA rate limits trigger under concurrent jobs; "50% done" for AI generation is a lie — models don't emit meaningful progress signals | Send one acknowledgment at request start ("Got it, working on scene 3 — expect your video in ~3 minutes") and one message when complete. No in-between. |
| **Full character re-generation on every change request** | Simpler to implement — just re-run the full pipeline | Costs full credits ($0.25–$2.00) when the client only wanted one scene changed; erases approved scenes; slower delivery | Scope classification (character-level vs. scene-level) + selective regeneration |
| **Free unlimited change requests** | Clients want to iterate without friction | No business model for AI generation costs; Kie.ai and fal.ai charge per-generation regardless of how the output is used; unlimited free changes would make this product economically unviable | Credit-based change requests: initial generation included, additional change requests consume credits from client's allocation |
| **Automatic re-generation on rejection without confirmation** | When client sends "SKIP" or rejects a scene, auto-trigger regeneration | Without a change request accompanying the rejection, there is nothing to change — re-running the same prompt produces the same (or worse) output; wastes credits; creates a frustrating loop | Rejection triggers a change request prompt: "Scene 3 rejected. What should be different?" — then regenerate with the updated brief |
| **Per-client custom model fine-tuning** | "Train the AI specifically on my character" sounds premium | LoRA/DreamBooth training costs $10–$50+ per character and takes 30–120 minutes; fal.ai charges $0.30–$2.00/min for training; adds model management infrastructure that doesn't exist in this stack; for 5-scene character videos, reference-based consistency (existing approach) is sufficient | Character reference images as Sora 2 `character_ids` or fal.ai image references — no fine-tuning needed for acceptable consistency at this scope |
| **Natural language scene editor ("make her smile more in the third scene")** | Sounds like surgical precision | NLP → specific scene modification is prompt injection, not editing; the model regenerates the entire scene from a modified prompt; "smile more" in the prompt produces a different background, different lighting, different everything — not just a smile change | Set correct expectation: "I'll regenerate scene 3 with 'more energetic expression' added to the brief. The background and lighting may vary slightly." This is honest about what AI video generation actually does. |

---

## Feature Dependencies

```
[Natural-language change request via WhatsApp]
    └──requires──> [ClaudeClaw intent classifier for change vs. new request]
    └──requires──> [CharacterBible mutable (upsert, not write-once)]
                       └──requires──> [character_bible_versions table for rollback]

[Targeted change understanding (character vs. scene scope)]
    └──required by──> [Selective scene regeneration]
    └──required by──> [Admin change request review (for character-level only)]

[Selective scene regeneration]
    └──requires──> [Per-scene addressable records with status (approved/pending/rejected)]
    └──requires──> [CharacterReveal composition accepting per-scene URL props]
                       └──enables──> [Partial video delivery after selective regeneration]

[Confirmation before credit spend]
    └──required by──> [ALL regeneration paths]
    └──must precede──> [BullMQ job dispatch for any regeneration]

[Scene-by-scene approval]
    └──must follow──> [Any regeneration completion]
    └──gates──> [Remotion CharacterReveal re-assembly]

[Version history with rollback]
    └──requires──> [character_bible_versions table]
    └──requires──> [Versioned R2 keys for scene assets]
    └──independent of──> [Core regeneration flow — can be added after]

[Change request history per character]
    └──requires──> [character_change_requests table]
    └──low dependency — can be added after core flow ships]
```

### Dependency Notes

- **CharacterBible mutability is the foundational blocker:** Currently the CharacterBible is written once during onboarding and treated as immutable. Every downstream feature (change request → bible update → selective regeneration → partial video delivery) requires this to become mutable with versioning. This must be the first schema change.

- **Scope classification before regeneration dispatch:** The intent classifier (character-level vs. scene-level) determines what gets regenerated and at what cost. This classification must happen before any BullMQ job is dispatched — it cannot be retrofitted after dispatch.

- **CharacterReveal must accept mixed scene inputs:** Currently the composition assembles 5 scenes from a `PipelineRun`. To deliver partial re-renders (4 approved + 1 new), it must accept per-scene URLs as props rather than deriving them all from the same run ID. This is a Remotion props change that affects the final assembly step.

- **Credit confirmation is a hard gate:** Do not implement any regeneration path without the credit confirmation step. The cost transparency principle (from `feedback_predelivery_checklist.md`) requires client-visible cost before any spend.

---

## MVP Definition

### Launch With (v1 of this milestone)

Minimum set to make character iteration usable. A client receives their CharacterReveal video, sends "can we change scene 3?" via WhatsApp, and gets a re-rendered video with scene 3 updated — without regenerating scenes 1, 2, 4, 5.

- [ ] **CharacterBible mutability + versioning** — `upsert` endpoint replaces write-once; `character_bible_versions` table stores every version with `change_request_id` FK; rollback is possible via SQL even if no admin UI exists yet
- [ ] **ClaudeClaw intent classifier — change request routing** — inbound message classified as: (a) scene-level change request, (b) character-level change request, (c) new character request, (d) other; scene ID extraction from message ("scene 3", "the third scene") for case (a)
- [ ] **Credit confirmation before regeneration** — WhatsApp poll ("Scene 3 regeneration uses 1 credit. Confirm?") before BullMQ dispatch; no generation happens without explicit confirmation
- [ ] **Selective scene regeneration — scene-level** — re-run one specified scene with updated brief; existing approved scenes untouched; new scene added to R2 with versioned key
- [ ] **Per-scene status tracking** — `scene_status` column on scene records: `approved | pending | rejected`; updated after each generation and each APPROVE/RETRY/SKIP command
- [ ] **CharacterReveal re-assembly with mixed inputs** — Remotion composition accepts `sceneUrls: string[]` prop array; re-renders final video using approved old scenes + new regenerated scene
- [ ] **Change request start acknowledgment + completion delivery** — two WhatsApp messages total: "Working on it — ~3 minutes" at start; new video when complete

### Add After Validation (v1.x)

Add these once the core scene-level change flow is working and used by at least one client.

- [ ] **Character-level change request support** — changes that require CharacterBible update + multi-scene regeneration; scope confirmation ("This will regenerate all 5 scenes. Confirm?"); admin review gate before dispatch
- [ ] **Targeted scope classification** — Claude determines which scenes are affected by a character-level change (e.g., "make her hair shorter" probably doesn't require re-running environment/establishing shots); narrows regeneration to semantically-affected scenes only
- [ ] **Version history UI in admin portal** — view all CharacterBible versions per character; one-click rollback to previous version with confirmation
- [ ] **Change request history log** — `character_change_requests` table; admin endpoint to view per-character change history with cost and scope for each request

### Future Consideration (v2+)

- [ ] **Multi-round iterative conversation** — "make scene 3 more energetic" → delivers scene → "actually, darker mood" → iterate; requires conversation state management (current session memory, not just single-request classification)
- [ ] **Client-facing change request portal** — web UI for clients to view their scenes side-by-side, click a scene to request changes, see version history; removes dependency on WhatsApp for change management; deferred because WhatsApp-first is the current product positioning
- [ ] **Automatic scene drift detection** — after a character-level change, automatically flag scenes whose generated output no longer matches the new CharacterBible (using embedding similarity); proactively suggest "scene 4 may need regeneration based on your character update"; deferred until enough change request history exists to validate the heuristic

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| CharacterBible mutability + versioning | HIGH — foundational | LOW — schema + upsert endpoint | P1 |
| ClaudeClaw intent classifier (change request routing) | HIGH — prerequisite for all flows | MEDIUM — Claude prompt engineering + scene ID extraction | P1 |
| Credit confirmation before regeneration | HIGH — trust + cost transparency | LOW — WAHA poll + gate in dispatcher | P1 |
| Selective scene regeneration (scene-level) | HIGH — core value of this milestone | MEDIUM — BullMQ job for single scene + R2 versioned key | P1 |
| Per-scene status tracking | HIGH — required for selective re-assembly | LOW — column addition + status update hooks | P1 |
| CharacterReveal mixed-scene re-assembly | HIGH — final delivery requires this | MEDIUM — Remotion props change + re-render trigger | P1 |
| Change request start + completion messages | HIGH — client trust | LOW — two WAHA sends | P1 |
| Character-level change request support | MEDIUM — needed for "make her different" requests | HIGH — CharacterBible diff + multi-scene scope logic | P2 |
| Targeted scope classification (which scenes affected) | MEDIUM — cost savings | HIGH — semantic scene relevance scoring | P2 |
| Version history UI in admin portal | MEDIUM — admin operational comfort | MEDIUM — admin portal view | P2 |
| Change request history log | LOW — audit trail, billing | LOW — table + admin endpoint | P2 |
| Multi-round iterative conversation | MEDIUM — power user UX | HIGH — session state management | P3 |
| Client-facing change request portal | LOW — contradicts WhatsApp-first | HIGH — new web surface | P3 |
| Automatic scene drift detection | LOW — speculative value | HIGH — embedding similarity pipeline | P3 |

**Priority key:**
- P1: Must have for milestone launch
- P2: Should have, add when core is stable
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

How leading AI video / character generation products handle the same problem:

| Feature | HeyGen Video Agent | LTX Studio Elements | ShapeOfAI Regenerate Pattern | Our Approach |
|---------|-------------------|---------------------|-------------------------------|--------------|
| Change request input | Conversational ("make scene 3 shorter") in same chat thread | Visual — click scene, type change | N/A — UX pattern only | WhatsApp message in existing group thread |
| Scope detection | Automatic — small change = one scene, structural change = re-plan | Manual — user selects which scene to change | N/A | Claude intent classifier (character vs. scene level) |
| Pre-generation confirmation | Shows blueprint before rendering; "Build mode" auto-proceeds, "Chat mode" asks per step | Not documented | Recommended — "set clear expectations for what will change" | WhatsApp poll: credit cost + scope summary before dispatch |
| Partial regeneration | Yes — "change scene 3" only re-renders scene 3 | Yes — Elements are persistent assets; only the edited scene re-renders | Overwrite vs. branching model | Scene-level: yes. Character-level: targeted scope classification (P2) |
| Version history | Not documented | Yes — Elements saved across projects, reusable | Branching mode recommended | character_bible_versions table; admin rollback command (P2 UI) |
| Intermediate status | Chat mode shows step-by-step; Build mode is silent until done | Not documented | Single completion message recommended | One acknowledgment at start + one video at completion. No intermediate messages. |
| Delivery format | Rendered video in same interface | Rendered video in platform | N/A | New CharacterReveal video sent to WhatsApp group |

**Key differentiator vs. competitors:** This system operates entirely within WhatsApp, requires no client login or platform visit, and delivers the iterated video back to the same group where the relationship lives. HeyGen and LTX require clients to navigate a web interface. For the target ICP (Israeli/Jewish small business owners, Dallas), WhatsApp-native delivery is a meaningful advantage.

---

## UX Flow: Scene-Level Change Request (Core Flow)

```
Client → WhatsApp: "I don't like scene 3, can we make the background a coffee shop?"

ClaudeClaw classifies:
  → intent: scene_change_request
  → scene_id: 3
  → change_description: "background should be a coffee shop"
  → scope: scene_level (no CharacterBible update needed)

System → WhatsApp poll:
  "Scene 3 change: [background → coffee shop setting]
   Uses 1 generation credit.
   ✅ Confirm  ❌ Cancel"

Client taps Confirm →

BullMQ dispatches single-scene regeneration job:
  → loads CharacterBible (current version, unchanged)
  → modifies scene 3 prompt: appends "coffee shop interior background"
  → routes to Best Shot model for scene 3's shot type
  → generates via fal.ai / Kie.ai

Worker → WhatsApp: "Working on scene 3 — expect your updated video in ~3 minutes"

Generation completes →
  → new scene 3 stored in R2 with versioned key (scene_3_v2.mp4)
  → scene 3 status updated to: pending_approval
  → CharacterReveal re-renders: [scene1_v1, scene2_v1, scene3_v2, scene4_v1, scene5_v1]

System → WhatsApp: [sends new CharacterReveal video]
  "Here's your updated character video with the new scene 3.
   APPROVE to finalize, RETRY if you want more changes."
```

## UX Flow: Character-Level Change Request (P2 Flow)

```
Client → WhatsApp: "She looks too formal — can you make her more approachable and casual?"

ClaudeClaw classifies:
  → intent: character_change_request
  → scope: character_level (CharacterBible update required)
  → affected_scenes: [1, 2, 3, 4, 5] — initial conservative estimate

Admin notification → WhatsApp:
  "Character change request from [client]:
   'More approachable and casual'
   Draft CharacterBible update: [diff preview]
   Estimated scenes to regenerate: [1, 2, 3, 4, 5] — all 5
   Estimated cost: 5 credits
   APPROVE-ALL | APPROVE-PARTIAL [specify scenes] | DENY"

Admin approves →

System → client WhatsApp poll:
  "Character update: [approachable, casual style]
   Will regenerate [5] scenes. Uses 5 credits.
   ✅ Confirm  ❌ Cancel"

Client confirms →
BullMQ dispatches 5 scene-regeneration jobs (same tolerance: 3-of-5 = proceed)
[... same completion and delivery flow as scene-level ...]
```

---

## Sources

- ShapeOfAI Regenerate UX Pattern: [https://www.shapeof.ai/patterns/regenerate](https://www.shapeof.ai/patterns/regenerate) — overwrite vs. branching, guided regeneration, "set clear expectations for what will change" (HIGH confidence — official UX pattern library)
- HeyGen Video Agent January 2026 release: [https://www.heygen.com/blog/heygen-january-2026-release](https://www.heygen.com/blog/heygen-january-2026-release) — conversational scene editing "change scene 3 shorter", pre-build blueprint review, build vs. chat mode (HIGH confidence — official product blog)
- HeyGen Video Agent help docs: [https://help.heygen.com/en/articles/12402907-how-to-get-started-with-video-agent](https://help.heygen.com/en/articles/12402907-how-to-get-started-with-video-agent) — scope detection (small change = one scene, structural = re-plan), post-render editability (MEDIUM confidence — vendor documentation)
- LTX Studio Elements / consistent character: [https://ltx.studio/blog/best-ai-character-generator](https://ltx.studio/blog/best-ai-character-generator) — persistent character assets, reuse across projects without regenerating from scratch (MEDIUM confidence — vendor blog)
- ShapeOfAI regeneration pattern (fetched): Guided regeneration vs. random regeneration; branching vs. overwrite trade-offs; importance of confirming what will change before execution (HIGH confidence — verified via WebFetch)
- Existing codebase: CharacterBible table, PipelineRun table, CharacterReveal composition, APPROVE/RETRY/SKIP admin commands, WAHA integration, ClaudeClaw router — all confirmed via direct inspection in previous milestone research (HIGH confidence)
- Business rules: `feedback_no_scheduled_kie.md`, `feedback_predelivery_checklist.md`, `feedback_wire_before_deliver.md` — cost transparency and no mid-generation polling are business constraints, not technical preferences (HIGH confidence — project memory)

---

*Feature research for: Character Iteration — Client Change Requests + Scene Regeneration (subsequent milestone)*
*Researched: 2026-03-15*
