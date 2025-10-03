# Env Matrix

| Scope | Key | Where | Required | Notes |
|---|---|---|---|---|
| Worker Var | N8N_WEBHOOK_PATH | wrangler.toml [vars] | ✅ | default `rensto-exec` |
| Secret | N8N_API_URL | wrangler secret | ✅ | e.g. https://n8n.yourdomain.com |
| Secret | N8N_API_KEY | wrangler secret | ✅ | API key with workflow write/exec |
| Secret | OPENROUTER_API_KEY | wrangler secret | ✅ | for internal tools |
| Secret | AIRTABLE_API_KEY | wrangler secret | ✅ | |
| Var | AIRTABLE_BASE_ID | wrangler secret | ✅ | base for `API_Usage_Log` |
| Var | AIRTABLE_USAGE_TABLE | wrangler secret | ✅ | default `API_Usage_Log` |
| Secret | ROLLBAR_ACCESS_TOKEN | wrangler secret | ⭕ | optional |
| KV | TENANT_REGISTRY_KV | wrangler.toml | ✅ | Holds tenant JSON blobs |
| KV | IDEMPOTENCY_KV | wrangler.toml | ✅ | Tracks run_id 1h |
| KV | THROTTLE_KV | wrangler.toml | ✅ | Token buckets |