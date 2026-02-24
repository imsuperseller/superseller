---
name: agentforge
description: >
  AgentForge multi-stage AI research pipeline for Rensto SaaS.
  Covers business discovery, design analysis, market research, and deliverable packaging.
  Integrated within rensto-site using Antigravity orchestration, BullMQ, and credit billing.
  Use when working on AgentForge, website intelligence, client proposals, research pipeline,
  or multi-stage AI processing. Not for video pipeline, UI design, or n8n workflows.
  Example: "Add a new research stage to AgentForge" or "Wire AgentForge credits".
autoTrigger:
  - "AgentForge"
  - "agent forge"
  - "research pipeline"
  - "website intelligence"
  - "client proposal"
  - "pipeline stages"
negativeTrigger:
  - "video pipeline"
  - "TourReel"
  - "UI design"
  - "n8n"
---

# AgentForge — AI Research Pipeline

## When to Use
Use when working on AgentForge research pipeline, adding/modifying pipeline stages, credit integration for reports, deliverable generation, or client intake flows. Not for video pipeline (use tourreel-pipeline), UI design (use ui-ux-pro-max), or billing logic (use stripe-credits for Stripe-specific work).

## Critical Rules
1. **AgentForge is a RESEARCH product, NOT a web builder.** It generates business intelligence reports (discovery, design analysis, market research). Code generation was deliberately removed — v0/Bolt/Lovable own that space.
2. **It lives INSIDE `apps/web/rensto-site/`, NOT as a separate app.** Routes at `/dashboard/agentforge/`, API at `/api/agentforge/`. Uses the existing Prisma schema, auth, and credit system. Never create a separate Next.js project.
3. **All Claude API calls are SERVER-SIDE only.** API routes call Anthropic SDK. Never expose API keys to the browser. The original `agentforge.jsx` had this bug — do not repeat it.
4. **Use BullMQ for pipeline orchestration.** Same pattern as TourReel: queue job → worker processes stages sequentially → poll for progress. Never run multi-minute pipelines synchronously in API routes.
5. **Credit-gated.** Every pipeline run deducts credits. Check before starting, deduct on completion. Use existing credit system (`src/lib/credits.ts`).
6. **Haiku for research stages (1-3), Sonnet for synthesis (4+).** Research stages are web search + summarization — Haiku 4.5 handles this at ~80% lower cost. Sonnet for architecture/deliverables where reasoning quality matters.

## Architecture

### Product Tiers
| Product | What Customer Gets | Credit Cost | Target |
|---------|-------------------|-------------|--------|
| **Option A: Internal Tool** | Automated client proposal for Rensto sales team | 0 (internal) | Rensto staff |
| **Option B: Website Intelligence Report** | Branded PDF — discovery + competitive analysis + design recs | 50-100 credits | SMB owners, marketers, freelancers |

Option A ships first (internal efficiency). Option B ships second (revenue product).

### Pipeline Stages (3 research + 1 synthesis)

| # | Stage | Model | Temp | Max Tokens | Tools | Purpose |
|---|-------|-------|------|------------|-------|---------|
| 1 | discovery | haiku-4.5 | 0.3 | 4000 | web_search | Business research, online presence, brand identity |
| 2 | design_analysis | haiku-4.5 | 0.4 | 5000 | web_search | Current site audit, industry benchmarks, design recs |
| 3 | market_research | haiku-4.5 | 0.3 | 5000 | web_search | Competitor deep dive, feature gaps, content strategy |
| 4 | deliverables | sonnet-4.6 | 0.5 | 6000 | none | Executive summary, recommendations, implementation roadmap |

**Code generation and architecture stages were deliberately removed.** Do not re-add them.

### Key Files (Target Locations)

| File | Purpose |
|------|---------|
| `apps/web/rensto-site/src/app/dashboard/agentforge/page.tsx` | Dashboard UI — intake form + pipeline progress |
| `apps/web/rensto-site/src/app/api/agentforge/run/route.ts` | Start pipeline run (creates BullMQ job) |
| `apps/web/rensto-site/src/app/api/agentforge/status/[runId]/route.ts` | Poll pipeline progress |
| `apps/web/rensto-site/src/app/api/agentforge/deliverables/[runId]/route.ts` | Fetch completed deliverables |
| `apps/web/rensto-site/src/lib/agentforge/pipeline.ts` | Pipeline orchestrator (stage sequencing, context passing) |
| `apps/web/rensto-site/src/lib/agentforge/stages/*.ts` | Individual stage executors (discovery, design, market, deliverables) |
| `apps/web/rensto-site/src/lib/agentforge/prompts.ts` | Prompt templates (in-code for v1, DB for v2 A/B testing) |
| `apps/web/rensto-site/prisma/schema.prisma` | Add AgentForge models to EXISTING schema |

### Integration Flow
```
Intake form → POST /api/agentforge/run → Credit check → BullMQ job
→ Stages 1→2→3→4 sequentially → AFDeliverable saved
→ Client polls /api/agentforge/status/[runId]
```

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| Context overflow in stage 4 | Earlier stage outputs too long for Sonnet context window. | Summarize/truncate each stage output to ~2000 tokens before passing to deliverables stage. |
| Web search returns empty in stages 1-3 | Claude's `web_search` can fail silently on certain queries. | Check for empty search results in output. Retry once with rephrased query. |
| Credit double-deduction | BullMQ retried a failed job that already deducted credits. | Use `UnrecoverableError` for credit failures — BullMQ must NOT retry. |
| `ANTHROPIC_API_KEY` not found | Env var missing on server. | Add to Vercel env vars (web) or worker `.env`. Never expose to browser. |

## References

### Level 2 (Implementation — loaded on demand)
- `references/implementation-patterns.md` — Prisma schema, BullMQ patterns, Claude SDK, context passing, spec docs

### Other
- `agentforge/AgentForge-Prompts-Library-v1.docx` — Original prompt templates (extract into `prompts.ts`)
- `apps/worker/src/queue/workers/video-pipeline.worker.ts` — TourReel pipeline pattern to follow
- stripe-credits skill — Credit check/deduct patterns
- database-management skill — Schema migration patterns
