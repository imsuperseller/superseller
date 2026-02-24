# Credential Rotation Playbook

## Pre-Rotation Checklist
- [ ] Identify ALL locations where the key is used (web, worker, MCP, infra)
- [ ] Generate new key in service dashboard
- [ ] Have rollback plan (keep old key active until new one confirmed)

## Service-Specific Rotation

### Stripe
1. Go to https://dashboard.stripe.com/apikeys
2. Roll the secret key (Stripe keeps old key active for 24h)
3. Update in: Vercel env, RackNerd `.env`, `~/.cursor/mcp.json`
4. Update webhook secret if regenerating webhook endpoint
5. Verify: `curl https://api.stripe.com/v1/balance -H "Authorization: Bearer $NEW_KEY"`
6. Deploy both apps

### Kie.ai
1. Go to kie.ai dashboard -> API Keys
2. Generate new key
3. Update in: `apps/worker/.env` (RackNerd), `apps/web/rensto-site/.env.local` (Vercel)
4. Verify: `curl https://api.kie.ai/api/v1/user/balance -H "Authorization: Bearer $NEW_KEY"`
5. Deploy worker: `./apps/worker/deploy-to-racknerd.sh`

### Google Gemini
1. Go to https://aistudio.google.com/app/apikey
2. Create new key or rotate existing
3. Update in: Vercel env, RackNerd `.env`
4. Verify: `curl "https://generativelanguage.googleapis.com/v1beta/models?key=$NEW_KEY"`
5. Deploy both apps

### Cloudflare R2
1. Go to Cloudflare dashboard -> R2 -> Manage R2 API Tokens
2. Create new token with same permissions
3. Update `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` on RackNerd
4. Verify: run a test upload via worker health endpoint
5. Remove old token after 24h

### Aitable
1. Go to aitable.ai -> Settings -> Developer
2. Regenerate API token
3. Update `AITABLE_API_TOKEN` in Vercel env
4. Verify: `curl -H "Authorization: Bearer $NEW_TOKEN" https://aitable.ai/fusion/v1/spaces`
5. Redeploy web app

### Resend
1. Go to https://resend.com/api-keys
2. Create new key
3. Update in: Vercel env, RackNerd `.env` (if worker uses it)
4. Verify: `curl -H "Authorization: Bearer $NEW_KEY" https://api.resend.com/domains`

### Database (PostgreSQL)
1. Update password in Neon/Supabase/provider dashboard
2. Update `DATABASE_URL` in: Vercel env, RackNerd `.env`, FB Bot `.env`
3. Deploy all three apps
4. Verify: `curl https://rensto.com/api/health/check`

### Redis
1. Update password on RackNerd: `redis-cli CONFIG SET requirepass "NEW_PASSWORD"`
2. Update `REDIS_URL`/`REDIS_PASSWORD` in: RackNerd worker `.env`, FB Bot `.env`
3. Restart worker: `pm2 restart tourreel-worker`
4. Verify: `redis-cli -a NEW_PASSWORD ping`

## Post-Rotation Verification
```bash
# Full system health check
curl -s https://rensto.com/api/health/check | jq .
curl -s http://172.245.56.50:3002/api/health | jq .
curl -s https://rensto.com/api/admin/monitoring | jq '.services[] | {name, status}'
```

## Emergency: Key Compromised
1. **Immediately** revoke the compromised key in the service dashboard
2. Generate new key
3. Update ALL locations (see credential inventory)
4. Deploy all affected apps
5. Audit access logs in the affected service for unauthorized usage
6. If DB credentials: change password, check for unauthorized data access
7. Log incident in `findings.md`
