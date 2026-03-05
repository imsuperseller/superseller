# Project 3: Marketplace Bot — Knowledge Base

## Architecture Overview

The FB Marketplace Bot is a completely standalone system that automates product listing on Facebook Marketplace. It runs on RackNerd VPS as two PM2 services: `webhook-server` (Express on port 8082) and `fb-scheduler` (cron-based posting).

## Tech Stack
- **Runtime**: Node.js (plain JS, not TypeScript)
- **Database**: Firestore (Google Firebase) — NOT PostgreSQL
- **Browser**: GoLogin (anti-detect browser profiles)
- **Image Gen**: Kie.ai API
- **Process Manager**: PM2 on RackNerd
- **No ORM**: Direct Firestore SDK calls

## Key Patterns

### Posting Flow
1. Scheduler triggers at configured times
2. Loads product configs from `product-configs.js`
3. Generates listing images via Kie.ai
4. Opens GoLogin browser profile
5. Navigates to FB Marketplace → creates listing
6. Records posting in Firestore
7. Reports status via webhook

### GoLogin Session Management
- Each customer has a dedicated GoLogin profile
- Sessions refreshed periodically via `refresh-session.js`
- Profile IDs stored in `bot-config.json`

### Multi-Tenant
- UAD and MissParty are separate customers
- Each has own product configs, GoLogin profile, posting schedule
- Config isolation via `bot-config.json` sections

## Database
- **Firestore collections**: posting schedules, listing history, session state
- **NOT connected to PostgreSQL** — fully isolated from the SaaS platform
- **Migration pending**: Move to PostgreSQL for consistency (low priority)

## API Contracts

### Exposed
- `GET /health` (port 8082) — bot health status
- `POST /webhook` — external triggers for manual posting

### Consumed
- Kie.ai API — image generation per listing
- GoLogin API — browser profile management
- Facebook Graph API (indirectly via browser automation)
- Firestore — schedule and history storage

## Important Constraints
- GoLogin profiles must not be shared between customers
- FB session cookies expire — refresh-session.js must run regularly
- Image generation costs apply per listing (Kie.ai credits)
- Bot runs 24/7 on RackNerd — PM2 auto-restarts on crash
- Server path: `/opt/fb-marketplace-bot/`
