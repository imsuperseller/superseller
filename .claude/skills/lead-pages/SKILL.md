---
name: lead-pages
description: >-
  Dynamic lead landing pages for Rensto customers. Covers /lp/[slug] pages with
  per-customer branding (colors, logo, font, RTL/LTR), lead capture forms,
  WhatsApp notifications, seed scripts, and content extraction governance.
  Use when working on landing pages, lead capture, /lp/ routes, customer branding,
  Yoram, or lead page content. Not for TourReel, video pipeline, admin dashboard,
  or general website pages.
  Example: "Add a new landing page for a dental client" or "Fix RTL layout on Yoram's page".
autoTrigger:
  - "landing page"
  - "lead page"
  - "/lp/"
  - "lead capture"
  - "Yoram"
  - "customer branding"
  - "seed-yoram"
  - "lead form"
  - "RTL"
  - "LandingPage model"
negativeTrigger:
  - "TourReel"
  - "video pipeline"
  - "FB Marketplace"
  - "admin dashboard"
  - "Winner Studio"
  - "FrontDesk"
  - "AgentForge"
---

# Lead Landing Pages

## Critical
- **NEVER invent content** — Extract verbatim from customer strategy docs. If content doesn't exist in docs, leave the section EMPTY. Cite source in seed scripts. Violation history: fabricated testimonials for Yoram despite docs saying "ain bema lehishtamesh".
- **RTL/LTR is per-page** — `page.direction` controls all layout, animations, text alignment, and FAB positioning. Test both directions.
- **Seed scripts are the canonical data source** — Landing page data is upserted via Prisma seed scripts, not admin UI (admin UI not built yet).
- **WhatsApp notifications are best-effort** — Use Facebook Graph API v19.0 with `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID`. Log and continue if credentials missing.
- **Lead API is public (no auth)** — Validate all inputs server-side. Rate limiting not yet implemented.

## Architecture

```
Browser → /lp/[slug] (SSR) → Prisma lookup → LandingPageClient.tsx (734 lines)
                                                    ↓
                                              Lead Form Submit
                                                    ↓
                                        POST /api/leads/landing-page
                                                    ↓
                                        Create Lead record + WhatsApp notification
```

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/rensto-site/src/app/lp/[slug]/page.tsx` | Server component — Prisma lookup, SEO metadata, view counter (42 lines) |
| `apps/web/rensto-site/src/app/lp/[slug]/LandingPageClient.tsx` | Client render — hero, form, steps, testimonials, differentiators, credentials, footer, WhatsApp FAB (734 lines) |
| `apps/web/rensto-site/src/app/api/leads/landing-page/route.ts` | Lead capture API — validation, Lead creation, WhatsApp notification (116 lines) |
| `apps/web/rensto-site/prisma/seed-yoram-landing-page.ts` | Yoram seed — content extracted from strategy docs with source citations (178 lines) |
| `apps/web/rensto-site/src/lib/db/leads.ts` | Lead data access — queries, filters, sync flags (96 lines) |
| `apps/web/rensto-site/src/components/lp/MicroExpanderFAB.tsx` | WhatsApp floating button — expands on hover, directional (100 lines) |
| `apps/web/rensto-site/prisma/schema.prisma` | LandingPage + Lead models |

## API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/lp/[slug]` | None | Render landing page (Next.js RSC) |
| POST | `/api/leads/landing-page` | None (public) | Capture lead + WhatsApp notification |

## Database Models

### LandingPage
| Field | Type | Default | Notes |
|-------|------|---------|-------|
| slug | String | (unique) | URL path identifier |
| userId | UUID | (required) | Owner user |
| businessName | String | | Business display name |
| heroHeadline | String | | Main headline |
| heroSubheadline | String? | | Supporting text |
| ctaText | String | | CTA button label |
| primaryColor | String | #1e3a8a | Main brand color |
| accentColor | String | #2563eb | Secondary color |
| ctaColor | String | #f97316 | CTA button color |
| logoUrl | String? | | R2/CDN URL |
| fontFamily | String | Heebo | Google Font name |
| direction | String | rtl | rtl or ltr |
| locale | String | he | he, en, ar |
| sections | Json? | | { steps[], testimonials[], differentiators[], credentials[], complianceFooter } |
| views | Int | 0 | View counter |
| submissions | Int | 0 | Lead counter |

### Lead
| Field | Type | Notes |
|-------|------|-------|
| source | String | "landing_page" for LP leads |
| sourceId | String? | slug value |
| name | String? | From form |
| phone | String? | From form |
| email | String? | From form |
| status | String | "new" default |
| metadata | Json? | { landingPageId, slug, submittedAt, userAgent } |

## Brand Token Injection

```typescript
// Font — loaded dynamically from Google Fonts
const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(page.fontFamily)}:wght@400;500;700;900&display=swap`;

// Colors — applied via inline styles
style={{ backgroundColor: page.primaryColor }}   // Header
style={{ backgroundColor: page.accentColor }}    // Step numbers
style={{ backgroundColor: page.ctaColor }}       // CTA button

// Direction — controls layout
<div dir={page.direction}>
  // Animations flip: x: isRTL ? 40 : -40
  // FAB position: isRTL ? "right-6" : "left-6"
```

## Content Extraction Rule (MANDATORY)

When creating a new landing page:
1. **Search** for customer docs (e.g., `yoram-leads/`, customer strategy files)
2. **READ** every doc fully — not skim
3. **Extract verbatim** — copy from docs, don't paraphrase or fabricate
4. **If content doesn't exist** in docs → **leave it empty** (empty array or null)
5. **If docs say "we don't have this yet"** → **OMIT** the section entirely
6. **Cite source** in seed script comments (which doc, which section)

## Creating a New Landing Page

1. Create strategy docs in `{customer}-leads/` directory
2. Create seed script: `prisma/seed-{customer}-landing-page.ts`
3. Extract content from docs (cite sources)
4. Run: `npx tsx prisma/seed-{customer}-landing-page.ts`
5. Test: visit `/lp/{slug}` — verify branding, RTL/LTR, form submission
6. Verify WhatsApp notification delivery

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| 404 on /lp/[slug] | Page not seeded or `active: false` | Run seed script, check `active` flag in DB |
| WhatsApp notification not sent | Missing `WHATSAPP_TOKEN` or `WHATSAPP_PHONE_NUMBER_ID` env vars | Set env vars in Vercel dashboard |
| Font not loading | fontFamily has special characters or doesn't exist on Google Fonts | Check Google Fonts availability, URL-encode family name |
| RTL layout broken | Framer Motion animations not flipped | Check `isRTL` prop in LandingPageClient — all slide-in x values must flip |
| Lead not created | Validation failure (missing name/phone/email) | All 3 fields are mandatory — check form validation |
| Testimonials showing fabricated content | Content invented instead of extracted | DELETE fabricated data, extract only from customer docs |

## References

- NotebookLM 6a4eb203 — Yoram Friedman leads, strategy docs
- NotebookLM 719854ee — Rensto website content
- Content rule: `CLAUDE.md` lines 26-35
- Customer docs: `yoram-leads/` directory (7 markdown files)
- Logo asset: `public/lp/yoram-logo.png`
