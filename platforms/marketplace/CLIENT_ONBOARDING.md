# 📋 Client Onboarding Guide

Follow these steps to set up a new client on the Facebook Marketplace Listing Engine.

## 1. Firebase Setup
Add the client configuration to the `marketplace_configs` collection.
- Use `scripts/seed-configs.ts` as a template.
- Define `id`, `tableId`, `flowType` (IMAGE or VIDEO), and `prompts`.

## 2. GoLogin & Proxy
- Create a new GoLogin profile for the client.
- Ensure the proxy is configured correctly at the profile level.
- Get the `profileId` and add it to `config/bot-config.json`.

## 3. Data Ingestion
- Upload the client's listing data (CSV) to the n8n Data Table specified by `tableId`.
- Sample data format can be found in `data/missparty.csv` or `data/uad.csv`.

## 4. Bot Configuration
Update `config/bot-config.json`:
- Add a new object to the `products` array with the client's details.
- Ensure `getJobsUrl` and `updateStatusUrl` follow the standard pattern.

## 5. Verification
- Run `scripts/test-marketplace-apis.js` to verify the connection.
- Use `scripts/set-market-active.js` to enable the brand in the engine.

---
*Created January 28, 2026*
