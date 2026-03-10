# Project 3: Marketplace Bot (FB Marketplace)

> **Role**: Facebook Marketplace automation — GoLogin profiles, scheduled posting, Kie.ai image gen, UAD + MissParty.
> **Isolation**: COMPLETE — uses PostgreSQL (`fb_listings` table in `app_db`), zero imports from apps/.

---

## File Ownership

### CAN edit (this project OWNS these files)
```
fb marketplace lister/**
platforms/marketplace/**
```

### CANNOT edit (owned by other projects)
```
apps/**                           → Projects 1 & 2
infra/**                          → Project 4 (Infrastructure)
scripts/**                        → Project 4 (Infrastructure)
tools/**                          → Project 4 (Infrastructure)
.env*                             → Project 4 (Infrastructure)
docs/**                           → Project 7 (Strategy & Docs)
brain.md, CLAUDE.md, *.md (root)  → Project 7 (Strategy & Docs)
```

### CAN read (for reference, but never modify)
- `PRODUCT_STATUS.md` — product feature matrix
- `platforms/marketplace/PLATFORM_BIBLE.md` (this project owns this)
- Root `.md` files for context

---

## Assigned Skills
- marketplace-saas

### App-Local Skills (in `fb marketplace lister/.agent/skills/`, not in `.claude/skills/`)
- gologin-profile-management
- facebook-bot-server-management
- facebook-marketplace-posting
- fixing-database-schema
- managing-marketplace-listings

---

## Key Files
| Resource | Path |
|----------|------|
| Main Bot | `fb marketplace lister/deploy-package/facebook-bot-final.js` |
| Scheduler | `fb marketplace lister/deploy-package/scheduler-v2.js` |
| Webhook Server | `fb marketplace lister/deploy-package/webhook-server.js` |
| Image Generator | `fb marketplace lister/deploy-package/image-generator.js` |
| Product Configs | `fb marketplace lister/deploy-package/product-configs.js` |
| Session Login | `fb marketplace lister/deploy-package/session-login.js` |
| Session Refresh | `fb marketplace lister/deploy-package/refresh-session.js` |
| Bot Config (local) | `fb marketplace lister/deploy-package/bot-config.json` |
| Bot Config (server) | `/opt/fb-marketplace-bot/bot-config.json` |
| Platform Bible | `platforms/marketplace/PLATFORM_BIBLE.md` |
| SaaS Engine (legacy) | `platforms/marketplace/saas-engine/` |
| GoLogin Skills | `fb marketplace lister/.agent/skills/gologin-profile-management/SKILL.md` |

---

## Build / Test / Deploy

```bash
# The bot runs on RackNerd via PM2
# Deploy:
rsync -avz "fb marketplace lister/deploy-package/" root@172.245.56.50:/opt/fb-marketplace-bot/

# Health check
curl -s http://172.245.56.50:8082/health

# PM2 services on server
pm2 status           # webhook-server, fb-scheduler, image-pool, cookie-monitor
```

---

## Cross-Project Rules

1. **Complete isolation**: This project has ZERO dependencies on apps/web or apps/worker. Do not create imports.
2. **Database**: Uses PostgreSQL (`fb_listings` table in `app_db`). Firestore fully retired for this project.
3. **Root docs**: To update root `.md` files, create a request for Project 7.
4. **Env changes**: To add/modify server env vars, create a request for Project 4.

---

## Architecture
- **Database**: PostgreSQL (`fb_listings` table in `app_db`)
- **Image Gen**: Kie.ai API (Gemini 2.5 Flash for copy, Seedream 4.5 Edit for image variations)
- **Browser Automation**: GoLogin for FB session management
- **Session Login**: `session-login.js` — fills FB credentials, waits for 2FA (passkey, must approve on phone), saves cookies to GoLogin API + local file
- **Scheduling**: Custom scheduler.js with PM2 (60-min cycles, +/-15min jitter)
- **Webhook**: Express server on port 8082
- **PM2 processes**: `webhook-server`, `fb-scheduler`, `image-pool`, `cookie-monitor`
- **Customers**: UAD (`1shaifriedman@gmail.com`, Shai's personal FB) + MissParty (`michalkacher2006@gmail.com`)

## URLs
| Service | URL |
|---------|-----|
| Bot Health | http://172.245.56.50:8082/health |
| RackNerd SSH | root@172.245.56.50 |
