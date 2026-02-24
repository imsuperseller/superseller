---
name: credential-guardian
description: >
  API key and credential lifecycle management for Rensto. Monitors expiry dates,
  tracks credential locations across web/worker/MCP, validates connectivity,
  and prevents silent outages from expired or misconfigured keys.
autoTrigger:
  - "credential"
  - "api key"
  - "expired"
  - "token"
  - "secret"
  - "401"
  - "unauthorized"
  - "key rotation"
  - "env var"
negativeTrigger:
  - "video pipeline"
  - "UI design"
  - "schema"
  - "migration"
---

# Credential Guardian

## When to Use
Use when investigating authentication failures, rotating API keys, auditing credential locations, or preventing silent outages from expired tokens. Covers all external service credentials (Stripe, Kie.ai, Gemini, R2, Aitable, Apify, Resend, n8n, Firebase, WAHA, GoLogin). Not for video pipeline logic, UI design, schema changes, or migrations.

## Critical Rules
1. **Never commit credentials to git.** Check `.gitignore` before any `.env` file changes.
2. **Credentials live in FOUR locations**: Vercel dashboard (web), RackNerd `.env` (worker), `~/.cursor/mcp.json` (MCP), `infra/*.env` (n8n/services).
3. **Shared keys must be updated in ALL locations**: `STRIPE_SECRET_KEY`, `DATABASE_URL`, `KIE_API_KEY` exist in multiple places.
4. **Most API keys don't expire**, but OAuth tokens do (Vercel OIDC, NotebookLM, QuickBooks).
5. **Test after rotation**: Run health checks to verify new keys work before removing old ones.

## Architecture

### Credential Locations
| Location | Manages | How to Access |
|----------|---------|--------------|
| Vercel Dashboard | Web app env vars | `vercel env ls` or Vercel web UI |
| RackNerd `/opt/tourreel-worker/.env` | Worker env vars | SSH `root@172.245.56.50` |
| `~/.cursor/mcp.json` | MCP server tokens | Local file |
| `infra/.n8n-auth.env` | n8n Docker auth | SSH to RackNerd |
| `fb marketplace lister/.env` | FB Bot config | Local file (not committed) |

### Active Credentials Inventory

#### Payment & Billing
| Key | Service | Where Used | Expiry |
|-----|---------|-----------|--------|
| `STRIPE_SECRET_KEY` | Stripe | Web + Worker | Never (live key) |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Web + Worker | Never |
| `STRIPE_*_PRICE_ID` (3) | Stripe | Worker | Never |

#### AI & Video
| Key | Service | Where Used | Expiry |
|-----|---------|-----------|--------|
| `KIE_API_KEY` / `KIE_AI_API_KEY` | Kie.ai (Kling 3.0) | Web + Worker | Never (balance-based) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini | Web + Worker | Never |
| `APIFY_API_TOKEN` | Apify (Zillow scraping) | Worker | Never |

#### Storage
| Key | Service | Where Used | Expiry |
|-----|---------|-----------|--------|
| `R2_ACCESS_KEY_ID` | Cloudflare R2 | Worker | Never |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 | Worker | Never |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Storage | Web | Never (service account) |

#### Communication
| Key | Service | Where Used | Expiry |
|-----|---------|-----------|--------|
| `RESEND_API_KEY` | Resend (email) | Web + Worker | Never |
| `AITABLE_API_TOKEN` | Aitable.ai | Web | Never |

#### Infrastructure
| Key | Service | Where Used | Expiry |
|-----|---------|-----------|--------|
| `DATABASE_URL` | PostgreSQL | Web + Worker + FB Bot | Never (password-based) |
| `REDIS_URL` / `REDIS_PASSWORD` | Redis | Worker + FB Bot | Never |
| `NEXTAUTH_SECRET` | NextAuth | Worker | Never |

#### OAuth (EXPIRES)
| Key | Service | Where Used | TTL |
|-----|---------|-----------|-----|
| `VERCEL_OIDC_TOKEN` | Vercel | Web (.env.local) | ~12 hours (auto-rotates on `vercel env pull`) |
| NotebookLM tokens | Google | MCP server | Session-based (auto-refresh via `notebooklm-mcp-auth`) |
| QuickBooks OAuth | Intuit | MCP server | Sandbox only (manual refresh) |

## Common Patterns

### Verify a Key Works
```bash
# Stripe
curl -s https://api.stripe.com/v1/balance -H "Authorization: Bearer $STRIPE_SECRET_KEY" | jq .available

# Kie.ai
curl -s https://api.kie.ai/api/v1/user/balance -H "Authorization: Bearer $KIE_API_KEY" | jq .

# Gemini
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_GENERATIVE_AI_API_KEY" | jq '.models | length'

# Aitable
curl -s https://aitable.ai/fusion/v1/spaces -H "Authorization: Bearer $AITABLE_API_TOKEN" | jq .success

# R2 (via worker health)
curl -s http://172.245.56.50:3002/api/health | jq .

# Resend
curl -s https://api.resend.com/domains -H "Authorization: Bearer $RESEND_API_KEY" | jq '.data | length'
```

### Rotate a Key (Checklist)
1. Generate new key in service dashboard
2. Update in ALL locations (see Credential Locations table)
3. Deploy: `git push` (web auto-deploy) + `./apps/worker/deploy-to-racknerd.sh` (worker)
4. Run health checks: `curl https://rensto.com/api/health/check`
5. Verify worker: `curl http://172.245.56.50:3002/api/health`
6. Remove old key from service dashboard (after confirming new key works)

### Check All Services at Once
```bash
# Run full health check (checks Stripe, Gemini, Kie, Resend, Aitable, etc.)
curl -s https://rensto.com/api/admin/monitoring | jq '.services[] | {name, status}'
```

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| `401 Unauthorized` on Kie.ai | Balance is $0 or API key was regenerated. | `curl -H "Authorization: Bearer $KIE_API_KEY" https://api.kie.ai/api/v1/user/balance`. If 0: top up. If invalid: regenerate key, update BOTH web + worker envs. |
| `401` on Stripe API | Wrong key mode (test vs live) or key rotated. | Verify key starts with `sk_live_`. Check Vercel + RackNerd both have the same key. |
| NotebookLM MCP not responding | OAuth session expired (session-based tokens). | Run `notebooklm-mcp-auth` in terminal. Tokens auto-refresh. |
| Vercel OIDC token expired | ~12hr TTL, auto-rotates. | `cd apps/web/rensto-site && vercel env pull .env.local`. |
| Aitable sync 401/403 | Token revoked or space permissions changed. | Test: `curl -H "Authorization: Bearer $TOKEN" https://aitable.ai/fusion/v1/spaces`. Regenerate in Aitable dashboard if invalid. |
| `ECONNREFUSED` on R2 upload | R2 access key misconfigured or region mismatch. | Verify `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY` in worker `.env`. Test: `curl http://172.245.56.50:3002/api/health`. |
| Gemini 429 rate limit | Too many concurrent vision/prompt calls. | Add exponential backoff. Check quota at console.cloud.google.com. |
| Key works locally but not on Vercel | Key not deployed to Vercel env. | `vercel env ls` to check. `vercel env add` to push. Redeploy after. |

## Security Alerts
- `social app/.env` contains 100+ credentials including live keys — should be purged from git history
- FB Bot `bot-config.json` contains Facebook login credentials in plaintext
- All RackNerd credentials transmitted over SSH (key-based auth preferred)

## References
- `CREDENTIAL_REFERENCE.md` — Where credentials are stored (paths only, no values)
- `apps/web/rensto-site/src/lib/env.ts` — Web app env schema (Zod validated)
- `apps/worker/src/config.ts` — Worker config with defaults
- `apps/web/rensto-site/src/lib/monitoring/service-registry.ts` — Health checks that validate keys
- `references/credential-inventory.md` — Full inventory with service details
