---
name: managing-marketplace-listings
description: >-
  Manages Facebook Marketplace listings lifecycle for UAD (garage doors) and Miss Party (rentals).
  Jobs stored in PostgreSQL fb_listings table. Webhook server on port 8082 serves jobs with
  dynamic phone overlay and DFW location rotation. Use when "activate marketplace", "facebook listings",
  "UAD automation", or "Miss Party automation". Not for manual posting or other social platforms.
triggers:
  - "activate marketplace for"
  - "post listing to facebook"
  - "test marketplace automation"
  - "UAD automation"
  - "Miss Party automation"
negative_triggers:
  - "social media management"
  - "instagram posting"
---

# Managing Marketplace Listings

Manages the complete lifecycle of Facebook Marketplace listings for UAD Garage Doors and Miss Party Rentals. System is LIVE as of Feb 20, 2026.

## Client Configuration

### UAD Garage Doors
- **Phone Numbers**: 4 rotating Telnyx lines (+1-972-954-2407, +1-972-628-3587, +1-469-625-0960, +1-469-535-7538)
- **Locations**: 30 DFW cities (sequential rotation across all metro quadrants)
- **Category**: "Miscellaneous" (exact FB dropdown match)
- **Video**: Static `video.mp4` on server
- **Images**: 3 product images with dynamic phone overlay on main image
- **Lead Pipeline**: Telnyx Voice AI → Claude Sonnet → Workiz CRM

### Miss Party Rentals
- **Phone Number**: +1-469-814-6509 (single)
- **Locations**: 20 DFW cities (sequential rotation, populated suburbs)
- **Category**: "Miscellaneous" (exact FB dropdown match)
- **Pricing**: $49.99 flat
- **Video**: Static `michal_video.mp4`
- **Images**: 3 product images with dynamic phone overlay on main image

## Core Operations

**Server**: 172.245.56.50 at `/opt/fb-marketplace-bot/`
**Database**: PostgreSQL `app_db`, table `fb_listings`
**Webhook**: Port 8082 — serves jobs with rotated phone/location and dynamic overlay

### Create Listing
```sql
INSERT INTO fb_listings (client_id, status, listing_title, listing_description, price, phone_number, location)
VALUES ('uad', 'queued', '16x7 Classic Steel Garage Door - Professional Installation',
  'Premium garage door with professional installation and warranty. Call for free quote!',
  2500, '+1-972-954-2407', 'Dallas, TX');
```

### Check Job Status
```sql
SELECT id, client_id, status, listing_title, location, posted_at
FROM fb_listings ORDER BY created_at DESC LIMIT 10;
```

### Monitor Server
```bash
# PM2 status
ssh root@172.245.56.50 "pm2 status"

# Webhook health
curl -s http://172.245.56.50:8082/health

# Recent bot activity
ssh root@172.245.56.50 "pm2 logs fb-scheduler --lines 20"
```

### Manual Bot Run
```bash
ssh root@172.245.56.50 "cd /opt/fb-marketplace-bot && DISPLAY=:100 node facebook-bot-final.js uad"
ssh root@172.245.56.50 "cd /opt/fb-marketplace-bot && DISPLAY=:100 node facebook-bot-final.js missparty"
```

## Image Generation

### Dynamic Phone Overlay
Webhook server generates per-job overlay using ImageMagick:
- Rotates phone number from product's `phoneRotation` array
- Generates semi-transparent black banner with white text at bottom of main image
- Per-product subtitles: UAD → "Free Estimates • Licensed & Insured", MissParty → "24hr Rentals • Dallas TX"
- Originals preserved at `/var/www/garage-door-images/originals/`

### Static Images
Currently 3 fixed images per product served from nginx on port 8080:
- `img_{clientId}_0.jpg` (main — gets phone overlay)
- `img_{clientId}_1.jpg`, `img_{clientId}_2.jpg` (additional)

### Gap: No City-Vibe Matching
Images and listing copy are static regardless of city. V5 pipeline (Claude AI for unique copy + Kie.ai for unique images) exists in `platforms/marketplace/scripts/generate_v5.py` but is NOT connected.

## Error Recovery

### Bot Won't Post
1. Check cookies: `ssh root@172.245.56.50 "cat /opt/fb-marketplace-bot/cookies_{clientId}.json | head -5"`
2. Check GoLogin process: `ps aux | grep orbita`
3. Check screenshots: `ls /opt/fb-marketplace-bot/screenshots/`
4. Check DB jobs: `SELECT * FROM fb_listings WHERE status='queued' AND client_id='uad';`

### Session Expired
Run `refresh-session.js` — fills password-only modal (no 2FA needed if GoLogin fingerprint preserved).
```bash
ssh root@172.245.56.50 "cd /opt/fb-marketplace-bot && DISPLAY=:100 node refresh-session.js uad"
```
