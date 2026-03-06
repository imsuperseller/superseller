---
name: facebook-marketplace-posting
description: >-
  Facebook Marketplace posting automation using GoLogin + Puppeteer on RackNerd server.
  Bot is LIVE — posts for UAD (garage doors) and MissParty (bounce house rentals) with
  dynamic phone overlays, DFW location rotation, and per-profile cookies.
version: 2.0.0
triggers:
  - "post to facebook marketplace"
  - "create facebook listing"
  - "facebook automation"
  - "marketplace bot"
negative_triggers:
  - "social media management"
  - "instagram"
  - "tiktok"
---

# Facebook Marketplace Posting Automation

Bot is LIVE and posting for both customers as of Feb 20, 2026.

## Architecture

```
scheduler.js (PM2, 60-min cycles)
    → webhook-server.js (port 8082: get job + rotate phone/location + generate overlay)
    → facebook-bot-final.js (GoLogin SDK + Puppeteer 19 → FB Marketplace form → publish)
    → webhook-server.js (update status in PostgreSQL)
    → WhatsApp notification via WAHA
```

**Server**: `/opt/fb-marketplace-bot/` on 172.245.56.50
**Database**: PostgreSQL `fb_listings` table in `app_db`
**Config**: `bot-config.json` — GoLogin token, FB credentials, phone arrays, location arrays

## Client Configurations

### UAD Garage Doors
- **GoLogin Profile**: `694b5e53fcacf3fe4b4ff79c`
- **Category**: "Miscellaneous" (exact FB dropdown match)
- **Phone Rotation**: 4 Telnyx numbers cycling per-job
- **Locations**: 30 DFW cities (sequential rotation)
- **Video**: Static `video.mp4`
- **Stealth**: Moderate — 5 posts/cycle, 15-min cooldown

### Miss Party Rentals
- **GoLogin Profile**: `6949a854f4994b150d430f37`
- **Category**: "Inflatable Bouncers" (exact FB dropdown match)
- **Phone**: Single `+1-469-283-9855`
- **Locations**: 20 DFW cities (sequential rotation)
- **Video**: Static `michal_video.mp4`
- **Stealth**: High — 3 posts/cycle, 30-min cooldown

## Key Technical Details

### GoLogin Config (MUST follow — see findings.md)
1. Default tmpdir (`/tmp`) — NOT custom directory
2. `--display=:100` in extra_params (X11 for headless VPS)
3. `browser.newPage()` — NEVER `pages[0]`
4. Per-profile cookies: `cookies_{clientId}.json`
5. Always `GL.stopLocal({ posting: false })` — NEVER `GL.stop()`
6. Pre-create fonts dir at `/tmp/gologin_profile_{id}/fonts/`

### Facebook Form Flow
Details tab → Next → Location tab → Next → Review → Publish
- Category MUST be exact FB dropdown match
- Check `[role="alert"]` for validation errors after clicking Next
- Location: `, TX` → `, Texas` conversion, typed char-by-char, ArrowDown → Enter

### Dynamic Phone Overlay
`webhook-server.js` calls `generateOverlayImage()` per-job:
- Rotates through phone array → generates ImageMagick overlay → returns overlay URL
- Per-product subtitles: UAD="Free Estimates • Licensed & Insured", MissParty="24hr Rentals • Dallas TX"
- Originals backed up at `/var/www/garage-door-images/originals/`

## Operations

### Create Job
```sql
INSERT INTO fb_listings (client_id, status, listing_title, listing_description, price, phone_number, location)
VALUES ('uad', 'queued', 'Garage Door Title', 'Description', 2500, '+1-972-954-2407', 'Dallas, TX');
```

### Manual Bot Run
```bash
ssh root@172.245.56.50 "cd /opt/fb-marketplace-bot && DISPLAY=:100 node facebook-bot-final.js uad"
```

### Health Check
```bash
curl -s http://172.245.56.50:8082/health
```

### Restart Services
```bash
ssh root@172.245.56.50 "pm2 restart webhook-server fb-scheduler"
```
