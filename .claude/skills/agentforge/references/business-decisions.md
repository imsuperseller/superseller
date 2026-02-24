# AgentForge Business Decisions (Canonical)

Decisions made 2026-02-19. Do not revisit without user approval.

## What AgentForge IS
- A **business intelligence / research pipeline** that automates client discovery, design analysis, and market research
- An internal tool first (Option A), then a self-service product (Option B)
- A reusable pipeline pattern that can spawn future products (SEO auditor, brand kit gen, proposal writer)

## What AgentForge is NOT
- NOT a web builder (v0, Bolt, Lovable own that space)
- NOT a code generator (the original code_generation stage was deliberately killed)
- NOT a standalone app (lives inside rensto-site, not a separate project)

## Why Code Gen Was Removed
- 8K tokens produces placeholder garbage, not a real website
- Can't compete with v0/Bolt/Lovable which generate full working apps
- The research stages (1-3) are the actual differentiator — nobody packages web research as a product

## Pricing
| Product | Price | Credits | Customer |
|---------|-------|---------|----------|
| Internal proposal tool (Option A) | Free (internal) | 0 | Rensto staff |
| Website Intelligence Report (Option B) | $49-$149 one-time | 50-100 | SMB owners, marketers, freelancers |

## Model Selection Rationale
- **Haiku 4.5 for stages 1-3**: Research = web search + summarization. Haiku handles this well at ~80% lower cost than Sonnet.
- **Sonnet 4.6 for stage 4 (deliverables)**: Synthesis requires stronger reasoning to produce a coherent executive report from 3 research outputs.

## Build Order
1. Option A (internal tool) — 1-2 weeks, zero new billing needed, immediate efficiency gain
2. Option B (self-service product) — bolt onto existing credit system, 50 credits per report
3. Pipeline engine extraction — reuse pattern for future products (happens naturally, don't over-engineer)

## What Was Salvaged From Original Specs
- Prompt templates from `AgentForge-Prompts-Library-v1.docx` — extract into code
- UI form fields from `agentforge.jsx` — 12 intake fields (clientName, businessName, businessType, existingWebsite, serviceType, description, targetAudience, goals, budget, timeline, competitors, specialRequirements)
- Dark theme styling direction from `agentforge.jsx` — use as reference when building UI

## What Was Discarded
- Separate Prisma schema (redundant with existing)
- Separate User/Auth models (redundant with existing)
- NextAuth.js setup (already exists in rensto-site)
- Supabase/Neon database (Rensto uses RackNerd PostgreSQL)
- Client-side Anthropic API calls (security hole)
- architecture stage (stage 4 in original)
- code_generation stage (stage 5 in original)
- PromptTemplate DB table for v1 (overkill — prompts in code first, DB when A/B testing needed)
