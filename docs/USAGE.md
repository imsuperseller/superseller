# Rensto Gateway — Usage

## 1) Add a tenant
Put a JSON document at KV key `tenant:<id>` in `TENANT_REGISTRY_KV`:
```json
{
  "id": "acme",
  "hmacSecret": "GENERATE_ME",
  "ratePerMin": 120,
  "burst": 30,
  "meters": {
    "leads_csv": { "subscription_item_id": "si_..." }
  }
}
```

## 2) Map SKUs
- `prompt_improve` → internal tool (subscription-gated)
- `leads_csv` → forwarded to n8n sub-workflow
- `any unknown SKU` → forwarded to n8n (author the flow there)

## 3) n8n side
- Create a Webhook workflow at `/webhook/${N8N_WEBHOOK_PATH}`.
- In the Webhook node: enable "Save Raw Body" (binary property data), and don't parse JSON.
- Add Function node with `n8n/functions/verify-hmac.ts`.
- Branch: if verified==true, continue; else return 401.

## 4) Call the gateway

Use the example curl:

```bash
TENANT_ID=acme SECRET=GENERATE_ME ./examples/curl/n8n-webhook-signed.sh
```

## 5) Billing
- `metered` SKUs call recordUsage() on success. Configure meters in the tenant doc.

## 6) Deploy
- Tag `staging-*` → deploy to staging; `prod-*` → production.