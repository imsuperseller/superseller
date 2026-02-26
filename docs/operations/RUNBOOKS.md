# 🔧 Runbooks & SOPs

> **Source of Truth for handling common operational scenarios.**

---

## 🔴 Critical Issues

### Service Down (n8n)
1. SSH to VPS: `ssh root@172.245.56.50`
2. Check Docker: `docker ps | grep n8n`
3. Restart: `docker restart n8n_superseller`
4. Verify: `curl http://n8n.superseller.agency/healthz`

### PayPal Webhook Failure
1. Check PayPal Developer Dashboard → Webhooks for failed events.
2. Verify `PAYPAL_WEBHOOK_ID` env var matches `7K1581345X6344910`.
3. Check `/api/webhooks/paypal` route logs on Vercel.
4. Re-trigger webhook manually via PayPal dashboard if needed.

---

## 🟡 Routine Tasks

### New Customer Fulfillment
1. Check Fulfillment Queue at `/control/fulfillment`.
2. Locate new order, review requirements.
3. Execute setup (varies by product type).
4. Mark as fulfilled in queue.
5. Send confirmation email.

### Adding a New Product to Marketplace
1. Create Firestore document in `templates` collection.
2. Add to `MOCK_TEMPLATES_EN` array in `marketplace/page.tsx`.
3. Create n8n workflow for fulfillment.
4. Update `docs/business/PRODUCTS.md`.

---

## 🟢 Best Practices

### Before Deploying Code
- Run `npm run build` locally to catch errors.
- Test on `/marketplace` and `/offers` pages.
- Verify PayPal webhooks are receiving events (check PayPal developer dashboard).
