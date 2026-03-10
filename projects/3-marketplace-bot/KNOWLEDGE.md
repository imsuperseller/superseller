# Project 3: Marketplace Bot — Knowledge Base

## Architecture Overview

The FB Marketplace Bot is a completely standalone system that automates product listing on Facebook Marketplace. It runs on RackNerd VPS as four PM2 services: `webhook-server` (Express on port 8082), `fb-scheduler` (cron-based posting), `image-pool` (background image variation generation), and `cookie-monitor` (session health checks every 6h).

## Tech Stack
- **Runtime**: Node.js (plain JS, not TypeScript)
- **Database**: PostgreSQL (`fb_listings` table in `app_db`) — migrated from Firestore Feb 2026
- **Browser**: GoLogin (anti-detect browser profiles)
- **Image Gen**: Kie.ai API (Gemini 2.5 Flash for copy, Seedream 4.5 Edit for image variations)
- **Process Manager**: PM2 on RackNerd
- **No ORM**: Direct PostgreSQL queries via `pg` driver

## Key Patterns

### Posting Flow
1. Scheduler triggers at configured times (60-min cycles with +/-15 min jitter)
2. Webhook server generates AI listing copy + images per job
3. Opens GoLogin browser profile with saved Facebook session cookies
4. Navigates to FB Marketplace, creates listing
5. Records posting in PostgreSQL `fb_listings` table
6. Reports status via webhook

### Session Management
- Each customer has a dedicated GoLogin profile
- **UAD**: Uses Shai's personal Facebook (`1shaifriedman@gmail.com`) — GoLogin profile `694b5e53fcacf3fe4b4ff79c`
- **MissParty**: Uses `michalkacher2006@gmail.com` — GoLogin profile `6949a854f4994b150d430f37`
- Sessions established via `session-login.js` on server, requires one-time manual 2FA approval on phone
- Facebook has passkey 2FA enabled — cannot be automated
- Cookies (`c_user`, `xs`) last ~365 days
- `cookie-monitor.js` checks health every 6h, alerts via WhatsApp if stale
- `refresh-session.js` handles password-only re-auth (no 2FA checkpoint)

### Multi-Tenant
- UAD and MissParty are separate customers
- Each has own product configs, GoLogin profile, posting schedule
- Config isolation via `bot-config.json` sections

## Database
- **PostgreSQL**: `fb_listings` table in `app_db` (same server as main app)
- **Schema**: id, unique_hash, client_id, status, product_name, size, color, price, listing_price, phone_number, location, listing_title, listing_description, delivery, rental_period, includes, image_url, image_url2, image_url3, video_url, facebook_url, posted_at, config_data (JSONB)

## API Contracts

### Exposed
- `GET /health` (port 8082) — bot health status
- `GET /webhook/v2/demo/{clientId}/jobs` — get queued jobs for posting
- `POST /webhook/v2/demo/{clientId}/update` — update job status after posting

### Consumed
- Kie.ai API — image generation + AI copy per listing
- GoLogin API — browser profile management, cookie storage
- Facebook (via browser automation) — Marketplace listing creation
- PostgreSQL — listing queue and history storage

## Important Constraints
- GoLogin profiles must not be shared between customers
- FB session cookies expire ~yearly — `session-login.js` + phone 2FA approval to restore
- Image generation costs apply per listing (Kie.ai credits)
- Bot runs 24/7 on RackNerd — PM2 auto-restarts on crash
- Server path: `/opt/fb-marketplace-bot/`
- Canonical source code: `fb-marketplace-lister/deploy-package/`
