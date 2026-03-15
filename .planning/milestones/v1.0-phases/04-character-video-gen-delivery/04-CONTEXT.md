# Phase 4: Character Video Generation + Delivery - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Generate character videos from CharacterBible (Phase 3 output) via Kie.ai Sora 2, compose a branded reveal video in Remotion, deliver via WhatsApp. Covers CHAR-05 through CHAR-10. Does not include questionnaire (Phase 3), pipeline orchestration (Phase 5), or character revision/regeneration (v2).

</domain>

<decisions>
## Implementation Decisions

### Scene design
- Scenes derived from CharacterBible `scenario_prompts` (3 from questionnaire) + 2 auto-generated (intro portrait + stylized artistic closer)
- Personalized to customer's actual business, not generic fixed templates
- Total: 5 scenes per character

### Delivery outputs
- Only the final composed Remotion reveal video is sent via WhatsApp
- Individual scene clips stored in R2 as TenantAssets but NOT sent to the customer
- Cleaner experience — one polished video, not 5+ messages

### Cost visibility in summary
- Conditional on subscription model: credit-based customers see credits consumed; flat-rate/package customers (e.g., Elite Pro) see no cost info
- Determined at delivery time by reading tenant's Subscription/ServiceInstance billing model
- Cost always tracked internally via PipelineRun + trackExpense() regardless

### Claude's Discretion
- **Prompt engineering approach** — Claude decides how detailed Sora 2 prompts should be (rich cinematic vs minimal), based on what produces best results with Sora 2
- **Model selection strategy** — Claude decides whether to use routeShot() from Phase 3.1 or hardcode Sora 2 Pro, based on architectural fit
- **Failure handling** — Claude decides partial delivery vs all-or-nothing strategy when scenes fail
- **Delivery flow** — Claude decides whether to build anticipation (teaser → progress → reveal) or just send the video
- **Post-delivery behavior** — Claude decides whether to ask for feedback/approval or mark module complete after delivery
- **Remotion reveal composition** — Claude decides whether to adapt HairShowreelComposition or build a new CharacterRevealComposition, based on what fits best
- **Video specs** — Claude decides duration per scene, total length, aspect ratio, resolution within WhatsApp's ~16MB file size limit

</decisions>

<specifics>
## Specific Ideas

- Sora 2 accessed via Kie.ai API: `POST /v1/jobs/createTask` with `model: "sora-2-pro-text-to-video"` — existing pattern in deanna-pitch-video.ts
- Character reference syntax in Sora 2 prompts: `@handle` (from CharacterBible.soraHandle)
- CharacterBible.metadata.scenario_prompts contains the 3 customer scenarios — these are the source of truth for scene generation

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `kie.ts`: Sora 2 Pro integration — createTask, pollTaskStatus, result extraction
- `deanna-pitch-video.ts`: Complete working reference for 5-scene Sora 2 generation + FFmpeg concat + R2 upload (~$5.00 for 5×10s 1080p)
- `model-router/router.ts`: routeShot() with ShotType taxonomy, budget tiers, Observatory integration
- `model-router/provider-adapters/kie-adapter.ts`: KieAdapter for unified provider interface
- `HairShowreelComposition.tsx`: Ken Burns transitions, motion clips, customizable accent colors — adaptable for character reveal
- `CrewDemoComposition.tsx` / `CrewDemoV3Composition.tsx`: Full-screen AI video per scene with branded overlays
- Reusable Remotion components: CrewIntro, AnimatedBg, ParticleFieldScene, GlassPanel, FilmGrain, Vignette

### Established Patterns
- PipelineRun: createPipelineRun() → updatePipelineRun() with status, costCents, deliveredVia, deliveredAt
- R2 upload: uploadToR2() with AssetInfo for automatic TenantAsset registration
- WAHA delivery: sendVideo(chatId, videoUrl, caption) with session targeting
- Character pipeline state: `character_pipeline_state` table tracks stage progression per tenant
- Cost tracking: trackExpense() mandatory for every API generation call

### Integration Points
- CharacterBible table: fetch by tenantId after Phase 3 questionnaire completes
- character_pipeline_state: advance stage from 'questionnaire' → 'video-generation' → 'delivery'
- Module system: character-video-gen as an OnboardingModule, triggered after character-questionnaire completes
- WhatsApp group: groupId from character_pipeline_state or onboarding module context
- Tenant billing model: read Subscription/ServiceInstance to determine cost visibility

</code_context>

<deferred>
## Deferred Ideas

- Character revision via WhatsApp feedback ("regenerate scene 3") — ECHAR-01/02 in v2 requirements
- Music/audio on reveal video — explicitly out of scope per REQUIREMENTS.md
- Auto-trigger from Phase 3 completion (pipeline orchestration) — Phase 5

</deferred>

---

*Phase: 04-character-video-gen-delivery*
*Context gathered: 2026-03-14*
