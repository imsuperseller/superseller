# 🚀 Facebook Marketplace Lister & Lead Engine (Audited)

This folder contains the authoritative, productized version of the **Facebook Marketplace Listing Bot** and the **Lead Processing Machine**, specifically isolated for **UAD Garage Doors** and **Miss Party**.

> [!IMPORTANT]
> This is NOT the general Rensto credit-based SaaS marketplace. The broader marketplace (TourReel template, docs/templates/tourreel/) is in apps/web/rensto-site. This folder is dedicated solely to the **Facebook Marketplace Lister** product (UAD, Miss Party).

## 📁 Directory Structure

```text
platforms/marketplace/
├── PLATFORM_BIBLE.md      # 📖 Master manual & environment setup
├── PRD.md                 # 🎯 Technical specifications for the FB Lister
├── README.md              # This guide
├── saas-engine/           # 📦 Modular SaaS Orchestrator (FB Autoposter)
│   ├── index.js           # Multi-tenant job poller
│   ├── .env               # Local environment configuration
│   └── lib/               # engine.js & firebase.js libraries
├── workflows/             # 🔄 Audited n8n Orchestrations
│   ├── master-orchestrator.json     # Central Hub for FB Jobs
│   ├── full-complex-marketplace.json # FB Lister Logic (UAD/MissParty)
│   ├── lead-analysis-supervisor.json # Voice AI Lead Analyzer from listings
│   └── uad-bot-interface.json       # UAD-specific feedback API
├── data/                  # 📊 Client & Product Data
│   ├── client-profiles.json # UAD/MissParty business logic (payouts, testimonials)
│   ├── product-definitions.json # FB Lister product specs
│   ├── missparty.csv      # Bounce House listing content
│   └── uad.csv            # Garage Door listing content
└── scripts/               # 🛠️ Maintenance Utilities
    ├── seed-configs.ts    # Initial setup for FB configurations in Firestore
    ├── test-marketplace-apis.js # Checks FB bot health
    └── generate_v5.py     # Python generator for FB Lister workflows
```

## ⚙️ Core Solution Focus

1.  **Facebook Automation (`saas-engine/`)**: The posting bot that uses GoLogin and Puppeteer to list products on Facebook Marketplace for multiple clients.
2.  **Lead Routing (`workflows/`)**: n8n workflows that catch inquiries from Facebook and route them to AI agents (like SARAH for Miss Party or the Voice AI bridge for UAD).
3.  **Client Isolation**: Every file here is strictly related to the "Lister" product. No general Rensto applet selling logic is present.

---
*Purified and Verified for Standalone Product Work on January 28, 2026*
