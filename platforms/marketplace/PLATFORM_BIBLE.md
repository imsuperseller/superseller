# Marketplace Platform Bible (Standalone / Isolated Legacy)

> [!CAUTION]
> **LEGACY ISLAND**: This platform currently operates as an isolated legacy system. Unlike the primary Rensto SSOT (which uses PostgreSQL), this engine still depends on **Firestore** for configuration and n8n for orchestration. Do NOT attempt to port this logic to the main database without a full rewrite.

## 🏗 Directory Architecture

```bash
platforms/marketplace/
├── assets/                 # Client branding (logos, static videos)
├── data/                   # Business logic (Client profiles, product definitions)
├── docs/                   # Legacy comparisons & strategy documents
├── saas-engine/            # Node.js Posting Bot (GoLogin + Puppeteer)
├── scripts/                # Seeding & Maintenance utilities
├── workflows/              # n8n JSON exports (Master Orchestrator, Lead Analyzers)
└── package.json            # Root manifest
```

## 👥 Extracted Client Profiles (UAD & Miss Party)

The following clients are fully mapped within this folder:

1.  **UAD Garage Doors (David Szender)**
    *   **Focus**: Automated FB Marketplace listing + Voice AI Appointment bridge.
    *   **Stack**: GoLogin, Telnyx, Workiz CRM.
    *   **Logic**: 50/50 profit split model.

2.  **Miss Party (Michal Kacher Szender)**
    *   **Focus**: White Bounce House rentals.
    *   **Stack**: AI Video Generation (Kie.ai), SARAH Voice Agent, WhatsApp.
    *   **Logic**: Subscription-based fulfillment.

## 🚀 Portability & Extraction Rules

To move this project to a new server/repository:

1.  **Environment Variables**: Create a `.env` file at the root and in `saas-engine/` with:
    *   `FIREBASE_SERVICE_ACCOUNT_PATH`: Path to your `rensto-svc.json`.
    *   `FIREBASE_DATABASE_URL`: Your Firestore URL.
    *   `GOLOGIN_TOKEN`: Your GoLogin API Key.
2.  **n8n Import**: Upload the `.json` files in `workflows/` to your n8n instance.
    *   *Note*: Update the `Niche Logic Router` in `Master Orchestrator` if your asset paths change.
3.  **Local Storage**: The `saas-engine/logs` and `saas-engine/temp` folders are required for image processing and debugging.

## 🛠 Maintenance Scripts

*   `npm run seed:configs`: Syncs the UAD/MissParty configurations to a new Firestore instance.
*   `npm run engine:start`: Launches the multi-tenant posting orchestrator.

## ⚠️ Important Notes
- **Hardcoded Paths**: All hardcoded local paths have been converted to environment variables or relative relative paths, except for internal n8n Node logic which may require manual verification of VPS paths (e.g., `/opt/fb-marketplace-bot/...`).
- **Dependencies**: Ensure Chrome/Chromium and the required system libraries for Puppeteer are installed on your host OS.
