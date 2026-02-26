# 🔧 Runbooks & SOPs

> **Source of Truth for handling common operational scenarios.**

---

## 🔴 Critical Issues

### Service Down (n8n)
1. SSH to VPS: `ssh root@172.245.56.50`
2. Check Docker: `docker ps | grep n8n`
3. Restart: `docker restart n8n_superseller`
4. Verify: `curl http://n8n.superseller.agency/healthz`

### Stripe Webhook Failure
1. Check Stripe Dashboard for failed events.
2. Review n8n execution logs.
3. Re-trigger webhook manually if needed.

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
- Verify Stripe webhooks in test mode first.
