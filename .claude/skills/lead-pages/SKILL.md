---
name: lead-pages
description: >-
  Dynamic lead landing pages for Rensto customers. Covers /lp/[slug] pages with
  per-customer branding (colors, logo, font, RTL/LTR), lead capture forms,
  WhatsApp/email notifications, seed scripts, and content extraction governance.
  Use when working on landing pages, lead capture, /lp/ routes, customer branding,
  or lead page content. Not for TourReel, video pipeline, admin dashboard,
  or general website pages.
  Example: "Add a new landing page for a dental client" or "Fix RTL layout on customer landing page".
autoTrigger:
  - "landing page"
  - "lead page"
  - "/lp/"
  - "lead capture"
  - "customer branding"
  - "lead form"
  - "RTL"
  - "LandingPage model"
  - "lead pages"
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
- **NEVER invent content** — Extract verbatim from customer strategy docs. If content doesn't exist in docs, leave the section EMPTY. Cite source in seed scripts. Violation history: fabricated testimonials despite docs explicitly saying content didn't exist (see findings.md).
- **Customer implementations in separate repos** — Customer-specific strategy docs, seed scripts, and assets live in dedicated repositories (e.g., yoramnfridman1/yoram-friedman-insurance). Generic landing page infrastructure remains in Rensto.
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
| `apps/web/rensto-site/prisma/seed-*.ts` | Customer seed scripts — content extracted from strategy docs with source citations (archived to customer repos) |
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
1. **Search** for customer docs in separate customer repository (strategy files, brand guidelines)
2. **READ** every doc fully — not skim
3. **Extract verbatim** — copy from docs, don't paraphrase or fabricate
4. **If content doesn't exist** in docs → **leave it empty** (empty array or null)
5. **If docs say "we don't have this yet"** → **OMIT** the section entirely
6. **Cite source** in seed script comments (which doc, which section)

## Creating a New Landing Page

**Note**: Customer-specific implementations are now maintained in separate repositories (e.g., yoramnfridman1/yoram-friedman-insurance).

1. Create separate customer repository with strategy docs
2. Create seed script: `prisma/seed-{customer}-landing-page.ts` in customer repo
3. Extract content from docs (cite sources)
4. Run seed script against Rensto database (if hosting on Rensto platform)
5. Test: visit `/lp/{slug}` — verify branding, RTL/LTR, form submission
6. Verify WhatsApp/email notification delivery

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

- NotebookLM 719854ee — Rensto website content
- Content extraction rule: `CLAUDE.md` §Content Extraction Rule
- PRODUCT_STATUS.md §4 — Landing page product status
- findings.md — Content Invention Pattern (root cause, safeguards)

**Archived reference implementation**:
- Yoram Friedman Insurance (Hebrew RTL, insurance industry) — migrated to [yoramnfridman1/yoram-friedman-insurance](https://github.com/yoramnfridman1/yoram-friedman-insurance) (private)
- Includes: Strategy docs, seed script, logo asset, exported database records
- NotebookLM 6a4eb203 — Yoram Friedman leads, strategy docs (archived)
