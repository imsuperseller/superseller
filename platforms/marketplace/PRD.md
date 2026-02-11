# Unified Facebook Marketplace Engine - PRD

## 🎯 Overview
The **Unified Facebook Marketplace Engine** is a scalable, multi-tenant automation framework designed to orchestrate Facebook Marketplace listings via a centralized n8n hub. It replaces fragmented, customer-specific workflows with a single dynamic engine driven by Firestore configurations.

## 🏗️ Architecture
The system follows a hub-and-spoke model where a single n8n engine handles multiple customer 'brands' dynamically.

### Core Components
1. **Master Orchestrator**: Polls active solution instances in Firestore and triggers generation jobs. (Located in `workflows/master-orchestrator.json`)
2. **Unified Bot Router**: 
   - Receives jobs via `/v1/marketplace/generate/:product`.
   - Fetches configuration from `marketplace_configs/{product}` in Firestore.
   - Routes flow based on `flowType` (e.g., AI Image Gen vs. Static Video).
3. **Execution Engine**: The `engine/facebook-bot.js` script (formerly `master-bot-patched.js`) which runs on the VPS.
4. **Firestore Config Layer**: Centralizes all brand-specific logic (slugs, pricing, locations, AI prompts, video paths).

### File Locations
All related materials are now consolidated in `platforms/marketplace/`:
- `engine/`: Posting logic and bot scripts.
- `workflows/`: n8n workflow backups.
- `config/`: Configuration templates and local settings.
- `data/`: Sample data and client CSVs.
- `scripts/`: Seeding and maintenance utilities.

---

## 👥 Case Studies

### Case 1: UAD (Static Assets)
- **Objective**: Post standard bouncy house listings.
- **Requirements**: Uses static video files located on the bot server.
- **Multi-Tenant Handling**: `flowType` set to `STATIC` in Firestore. Router skips AI image generation and serves predefined video links.

### Case 2: Miss Party (AI-Driven)
- **Objective**: Generate unique, high-conversion party rental listings.
- **Requirements**: Requires dynamic AI image generation (Flux) and variable copywriting (Claude).
- **Multi-Tenant Handling**: `flowType` set to `IMAGE`. Engine generates unique prompts based on scenario templates in Firestore, creates AI tasks, and waits for completion.

---

## 🔒 Session & Proxy Persistence
One of the most critical features of this unified engine is its respect for the professional session state of the Facebook accounts.

### Persistent Logins
- **Mechanism**: The bot utilizes the `Profile ID` to launch a dedicated GoLogin environment.
- **Session Check**: Before attempting a login, the engine navigates to the Marketplace creation page and checks for an active session. If the Facebook account is already logged in (standard for our professional profiles), the login phase is **skipped entirely**.
- **User Benefit**: This prevents suspicious login activities and ensures that the account remains warm and active within its native GoLogin context.

### Proxy Integrity
- **Inheritance**: Proxies are configured at the GoLogin profile level. 
- **Consistency**: The engine does not override or ad-hoc assign proxies; it inherits the exact network environment (IP/Location) defined in the GoLogin profile. This ensures that every listing for `missparty` or `uad` originates from its designated, proxy-protected location.

---

## 📈 Scalability & Multi-Tenancy
This project serves as a blueprint for handling multiple customers with distinct needs under a shared infrastructure.

### Adding a New Customer (5-Minute Onboarding)
1. **Firestore**: Create a new document in `marketplace_configs` with the new customer ID (e.g., `brand-x`).
2. **Data Table**: Create a new n8n Data Table to store this brand's listings.
3. **Deployment**: Add the customer to `local_bot_config.json` with the corresponding slug.
4. **Result**: The engine automatically detects the new brand and starts generating/posting using the unified endpoints.

---

## 🛡️ Best Practices
- **Shared Credentials**: Always use central MCP/n8n credentials (GoLogin, AI APIs) to reduce management overhead.
- **Version Control**: Any logic changes to `nFGT` now impact ALL customers. Thorough testing on a dev slug (e.g., `test-brand`) is required before deployment.
