---
name: Deploy
description: Deploy worker to RackNerd or web to Vercel with pre-deploy trace validation
---

# Deploy

Deploy SuperSeller services to production. Two targets: **Worker** (RackNerd VPS) and **Web** (Vercel).

## Usage

```
/deploy worker    — Deploy apps/worker to RackNerd (172.245.56.50)
/deploy web       — Deploy apps/web to Vercel production
/deploy all       — Deploy both
```

## Worker Deploy (RackNerd)

### Pre-Deploy Trace (MANDATORY)

Before deploying ANY code change, you MUST trace the data flow:

```
PRE-DEPLOY TRACE:
- Changed: [file:function]
- Data flow: [source] → [transform] → [API call]
- External API input: [exact format/values that will be sent]
- Expected response: [what comes back]
- Failure modes: [what could go wrong]
```

If the change touches any path that calls Kie.ai/Kling/Suno/Recraft/Nano, **confirm with the user before deploying** — these burn real credits.

### Steps

1. **Build locally** (TypeScript compilation):
   ```bash
   cd /Users/shaifriedman/superseller/apps/worker
   npx tsc
   ```

2. **Run the deploy script** (preferred):
   ```bash
   ./apps/worker/deploy-to-racknerd.sh
   ```
   This handles rsync, npm install, PM2 restarts, and installs the daily FFmpeg update cron job.

3. **Or manual rsync**:
   ```bash
   rsync -avz --exclude node_modules --exclude .env \
     apps/worker/ root@172.245.56.50:/opt/tourreel-worker/apps/worker/
   ```

4. **On the server** (if manual):
   ```bash
   ssh root@172.245.56.50
   cd /opt/tourreel-worker/apps/worker
   npm install --production
   npx tsc
   pm2 restart tourreel-worker
   ```

5. **Validate**:
   ```bash
   curl -s http://172.245.56.50:3002/api/health
   pm2 logs tourreel-worker --lines 20
   ```

### PM2 Services on RackNerd
- `tourreel-worker` — Main worker (port 3002)
- `fb-scheduler` — FB Marketplace posting scheduler
- `webhook-server` — Telnyx + general webhooks
- `image-pool` — Image processing pool
- `cookie-monitor` — FB cookie health monitor

## Web Deploy (Vercel)

### Auto-deploy (preferred)
Push to `main` branch — auto-deploys `api.superseller.agency`:
```bash
git push origin main
```

### Manual deploy
For `superseller.agency` frontend:
```bash
cd apps/web/superseller-site
vercel --prod
```
Requires `VERCEL_TOKEN` in environment.

### Validate
```bash
curl -s https://superseller.agency/api/health
```

## Post-Deploy Checklist

1. Health check passes (200 OK)
2. No error logs in first 60 seconds
3. If worker: PM2 shows 0 restarts since deploy
4. If web: Vercel deployment shows "Ready"
5. Update `progress.md` with deploy timestamp and changes
