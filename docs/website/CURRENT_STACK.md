# 🚀 Rensto Website - Current Stack

**Last Updated**: December 22, 2025  
**Status**: ✅ LIVE on Vercel

---

## Technology Stack

| Component | Technology | Details |
|-----------|------------|---------|
| **Hosting** | Vercel | Auto-deploy on git push |
| **Framework** | Next.js 14 | App Router |
| **Styling** | Tailwind CSS + CSS Variables | Custom design system |
| **Source** | `apps/web/rensto-site/` | Monorepo structure |
| **Domain** | rensto.com | Vercel managed DNS/SSL |

---

## Site Architecture

```
rensto.com/
├── /                          # Homepage (3 service paths)
├── /custom                    # URL Scan + Qualification Flow
│   ├── /onboarding           # Client onboarding
│   └── /success              # Post-booking success
├── /niches                   # 9-Industry Grid
│   └── /niches/[slug]        # Dynamic Niche Template
├── /subscriptions            # Subscription plans
├── /offers                   # Generated offer pages
├── /auth                     # Authentication
├── /portal                   # Customer portal
└── /api/*                    # API routes
```

---

## Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/app/page.tsx` | Homepage | 606 |
| `src/app/custom/ClientPage.tsx` | Custom solutions flow | 688 |
| `src/app/niches/page.tsx` | Industry grid | 120 |
| `src/app/niches/[slug]/page.tsx` | Dynamic niche template | 537 |
| `src/data/niche_engine.json` | 9 industry configurations | 1097 |

---

## n8n Integration Points

| Website Action | n8n Workflow |
|----------------|--------------|
| Custom page lead | Workflow #1: Inbound Lead Intelligence |
| TidyCal booking | Workflow #3a: TidyCal → Contract |
| Contract signed | Workflow #3b: Contract → Payment |
| Payment complete | Workflow #3c: Payment → Closed-Won |
| Qualified leads | Workflow #2: Proposal Generator |

---

## ⚠️ Deprecated

- **Webflow**: Migrated away Nov 2, 2025
- **Airtable for Marketplace**: Migrating to n8n Data Tables

---

## Development

```bash
cd apps/web/rensto-site
npm run dev          # Local development
npm run build        # Production build
```

Deploys automatically on push to main branch via Vercel.
