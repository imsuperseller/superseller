# Facebook Marketplace Lister & Lead Engine

This folder contains **legacy architecture docs and n8n workflow exports** for the Facebook Marketplace Listing Bot. The canonical production code has moved to `fb marketplace lister/deploy-package/`.

> [!IMPORTANT]
> **Production code**: `fb marketplace lister/deploy-package/` → deploys to `/opt/fb-marketplace-bot/` on RackNerd (172.245.56.50).
> This `platforms/marketplace/` directory is kept for reference (n8n workflows, client data CSVs, comparison docs) but is NOT the active codebase.

## Current System (Feb 2026)

| Component | Location | Status |
|-----------|----------|--------|
| **Bot code** | `fb marketplace lister/deploy-package/` | LIVE |
| **Server** | `/opt/fb-marketplace-bot/` on 172.245.56.50 | LIVE (PM2) |
| **Database** | PostgreSQL `fb_listings` in `app_db` | LIVE |
| **Webhook server** | Port 8082 (dynamic overlay + job serving) | LIVE |
| **Lead analysis** | n8n workflows (Telnyx → Claude → CRM) | DORMANT (0 executions) |
| **n8n listing gen** | Workflow `8Ay9qG9GgOfrMUzXiC5KJ` | Legacy (webhooks broken) |
| **saas-engine/** | This directory | DEPRECATED |
| **Firestore configs** | `scripts/seed-configs.ts` | RETIRED |

## What's Still Useful Here

- `data/uad.csv`, `data/missparty.csv` — Listing content templates
- `data/client-profiles.json` — Business logic (payouts, testimonials)
- `workflows/uad-lead-analysis.json` — Telnyx lead pipeline (active in n8n, 0 executions)
- `workflows/miss-party-audio-leads.json` — MissParty lead routing (active in n8n, 0 executions)
- `docs/comparisons/` — UAD vs MissParty business/logistics comparison
- `scripts/generate_v5.py` — V5 dynamic content pipeline design (SUPERSEDED by `content-generator.js` + `image-pool.js`)
- `config/bot-config.json` — Old config (outdated, canonical is in `fb marketplace lister/deploy-package/`)

## Customers

1. **UAD Garage Doors (David Szender)** — Garage door sales, 4 Telnyx numbers, Workiz CRM, 30 DFW cities
2. **Miss Party (Michal Kacher Szender)** — Bounce house rentals, 1 phone number, WhatsApp, 20 DFW cities

## For Full Details

See `platforms/marketplace/PLATFORM_BIBLE.md` and `PRODUCT_STATUS.md` section 2.

---
*Updated: 2026-02-20. Legacy directory — canonical code at `fb marketplace lister/deploy-package/`.*
