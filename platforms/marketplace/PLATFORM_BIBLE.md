# Marketplace Platform Bible

> For overall authority precedence, see [`brain.md`](../../brain.md).

> [!NOTE]
> **STATUS UPDATE (Feb 20, 2026)**: The marketplace bot is LIVE and posting for both customers. The system now runs on **PostgreSQL** (not Firestore) with a local webhook-server on port 8082. The canonical production code lives at `fb-marketplace-lister/deploy-package/` and deploys to `/opt/fb-marketplace-bot/` on RackNerd (172.245.56.50).

## Architecture

```
fb-marketplace-lister/deploy-package/   ← Canonical source code
├── facebook-bot-final.js               ← Main GoLogin + Puppeteer posting bot
├── webhook-server.js                   ← Job server (port 8082) + AI content + overlay + image pool
├── content-generator.js                ← AI listing copy via Kie.ai Gemini 2.5 Flash
├── image-pool.js                       ← Image variation pool via Kie.ai Seedream 4.5 Edit
├── image-pool-worker.js                ← PM2 background job — fills variation pool
├── generate-overlay-images.js          ← ImageMagick phone banner on images
├── scheduler.js                        ← PM2 continuous cycle (60-min, ±15 min jitter)
├── cookie-monitor.js                   ← PM2 health check every 6h — cookie validity, stale detection, WhatsApp alert, auto-refresh
├── bot-config.json                     ← Central config (GoLogin, FB creds, phones, locations)
├── refresh-session.js                  ← Stale cookie refresh (password-only modal)
├── cookies_uad.json                    ← Per-profile UAD cookies
├── cookies_missparty.json              ← Per-profile MissParty cookies
└── database/                           ← PostgreSQL schema + connection
```

**Server**: `/opt/fb-marketplace-bot/` on 172.245.56.50
**PM2 apps**: `webhook-server` (port 8082), `fb-scheduler`, `image-pool`, `cookie-monitor`
**Database**: PostgreSQL `fb_listings` table in `app_db`
**Image server**: nginx port 8080 serving static + variations + dynamic overlay images
**AI API**: Kie.ai (`KIE_API_KEY`) — Gemini 2.5 Flash for copy, Seedream 4.5 Edit for image variations

### UAD session (cookies_uad.json)
UAD cannot use automated Facebook login on the server (login form not in DOM). Session is obtained **once** via manual login: run `node scripts/manual-login-uad.js`, then log in at noVNC (http://172.245.56.50:6080/vnc.html) within the 10-minute wait. **Do not lose this session and do not ask the user to run manual login again** unless the session is confirmed lost. The bot never overwrites `cookies_uad.json` when it already contains `c_user` with cookies that lack `c_user`. Before any overwrite, existing session is backed up to `cookies_uad.json.bak`.

## Clients

### UAD Garage Doors (David Szender)
- **Focus**: Automated FB Marketplace listing + Telnyx Voice AI lead pipeline
- **Stack**: GoLogin, Telnyx (4 rotating numbers), Workiz CRM
- **Category**: "Miscellaneous" (exact FB dropdown match)
- **Video**: Static `video.mp4` on server
- **Locations**: 30 DFW cities (sequential rotation)
- **Stealth**: Moderate — 5 posts/cycle, 15-min cooldown

### Miss Party (Michal Kacher Szender)
- **Focus**: White Bounce House rentals
- **Stack**: GoLogin, WhatsApp via WAHA, single phone number
- **Category**: "Inflatable Bouncers" (exact FB dropdown match)
- **Video**: Static `michal_video.mp4` on server (video variation is the only remaining stealth gap — B9)
- **Locations**: 20 DFW cities (sequential rotation)
- **Stealth**: High — 3 posts/cycle, 30-min cooldown

## Key Systems

### Phone Overlay (Dynamic)
Webhook server generates per-job overlay image with rotated Telnyx phone number using ImageMagick. Per-product subtitles: UAD → "Free Estimates • Licensed & Insured", MissParty → "24hr Rentals • Dallas TX". Original clean images backed up at `/var/www/garage-door-images/originals/`.

### Location Rotation
Each posting gets a different DFW city from the configured array. Bot converts `, TX` → `, Texas` for Facebook dropdown matching. Typed character-by-character with ArrowDown → Enter for selection.

### Lead Analysis (n8n — LIVE as of Feb 22)
- **UAD**: Telnyx AI Assistant "Sarah" → 15-min poll → Claude Sonnet 4.5 analysis → Workiz CRM + Outlook email (n8n workflow U6EZ2iLQ4zCGg31H) — **ACTIVE, 5 triggers**
- **MissParty**: Telnyx AI Assistant "Sarah" → 15-min poll → Claude analysis → Email notification (n8n workflow 9gfvZo9sB4b3pMWQ) — **ACTIVE, 5 triggers**
- **Voice AI "Hope"**: SuperSeller AI sales agent (n8n workflow MqMYMeA9U9PEX1cH) — NOT for customer calls
- **Status**: Both UAD and MissParty pipelines executing successfully. Emails sent to shai@superseller.agency. Workiz POST returns 401 (needs write permission in Workiz dashboard).

## Legacy Reference

The `platforms/marketplace/` directory contains legacy architecture docs, n8n workflow exports, and old `saas-engine/` code that predates the current system. The canonical production code is in `fb-marketplace-lister/deploy-package/`. The `saas-engine/` and `scripts/seed-configs.ts` reference Firestore which is fully retired.

### n8n Workflows (legacy reference only — Antigravity is primary)
- `master-orchestrator.json` — Legacy central hub
- `full-complex-marketplace.json` — Legacy FB Lister logic
- `lead-analysis-supervisor.json` — Lead routing (workflows are active in n8n but DORMANT — 0 executions)
- V5 pipeline (`scripts/generate_v5.py`) — Original design reference (superseded by `content-generator.js` + `image-pool.js`)

## Deployment

```bash
# Sync code to server
rsync -avz --exclude node_modules "fb-marketplace-lister/deploy-package/" root@172.245.56.50:/opt/fb-marketplace-bot/

# Restart PM2 services
ssh root@172.245.56.50 "cd /opt/fb-marketplace-bot && pm2 restart webhook-server fb-scheduler image-pool cookie-monitor"

# Health check
curl -s http://172.245.56.50:8082/health
```

---
*Updated: 2026-03-03. Canonical config: `fb-marketplace-lister/deploy-package/bot-config.json`. UAD session preservation: progress.md, findings.md.*
