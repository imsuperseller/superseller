# TourReel — Template for Credit-Based SaaS Apps

**Purpose**: This folder is the canonical template for building new credit-based SaaS apps in the SuperSeller AI marketplace. TourReel (AI property tour videos) is the first such app.

## Template Structure

| Document | Purpose |
|----------|---------|
| **BLUEPRINT.md** | Vision, technical validation, cost model, risk analysis. Start here before coding. |
| **IMPLEMENTATION_SPEC.md** | Complete implementation reference: file paths, APIs, schemas, build order. |
| **PROMPT_PLAYBOOK.md** | Every prompt used in the pipeline: exact text, variables, failure modes. |

## How to Use This Template

1. **Copy** this folder for your new app (e.g. `docs/templates/my-new-app/`).
2. **Adapt** each document for your app's purpose and needs — flexibility over rigid copy.
3. **Replace** TourReel-specific content (real estate, video pipeline) with your domain.
4. **Preserve** the structure: Blueprint → Implementation Spec → Prompt Playbook.
5. **Use PostgreSQL** for app data (never Aitable.ai for production SaaS).
6. **Follow** SuperSeller AI design system: `apps/web/superseller-site/RENSTO_DESIGN_SYSTEM_REFERENCE.md`.

## Tech Stack (Per brain.md)

- **Frontend**: Next.js, Tailwind, shadcn/ui
- **Database**: PostgreSQL + Redis
- **Payments**: Stripe (credits, subscriptions)
- **Creative AI**: Kie.ai Kling 3.0
- **Deployment**: Vercel (frontend), RackNerd (workers)
