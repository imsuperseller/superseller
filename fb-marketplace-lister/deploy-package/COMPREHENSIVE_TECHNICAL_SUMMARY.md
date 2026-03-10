# Facebook Marketplace Bot — Technical Summary

> [!NOTE]
> **STATUS (Feb 20, 2026)**: Bot is LIVE and posting for both UAD and MissParty. The "CRITICAL CORRECTION" below was accurate at time of writing (Feb 18) but has since been resolved. All form navigation, category validation, and multi-tab posting issues are FIXED.

---

## Current System Architecture

**Server**: 172.245.56.50 (RackNerd VPS, Ubuntu 24.04, 6GB RAM)

### PM2 Services
| Service | Port | Role |
|---------|------|------|
| `webhook-server` | 8082 | Job serving + dynamic phone overlay generation |
| `fb-scheduler` | — | 60-min cycle scheduler, alternates UAD/MissParty |
| `tourreel-worker` | 3002 | VideoForge video pipeline (separate product) |

### Core Files (`/opt/fb-marketplace-bot/`)
| File | Role |
|------|------|
| `facebook-bot-final.js` | Main posting bot (GoLogin + Puppeteer 19) |
| `webhook-server.js` | Job API + dynamic phone overlay + location rotation |
| `generate-overlay-images.js` | ImageMagick phone banner on product images |
| `scheduler.js` | PM2 continuous cycle scheduler |
| `bot-config.json` | Central config (GoLogin, FB creds, phones, locations) |
| `refresh-session.js` | Stale cookie refresh via password-only modal |
| `cookies_uad.json` | UAD per-profile cookies |
| `cookies_missparty.json` | MissParty per-profile cookies |

### Database
- PostgreSQL `fb_listings` table in `app_db`
- Columns: id, client_id, status, listing_title, listing_description, price, phone_number, location, image_url, video_url, facebook_url, error_message, created_at, updated_at, posted_at

### Posting Flow
```
scheduler.js → webhook-server.js (get job + rotate phone/location + generate overlay)
    → facebook-bot-final.js (GoLogin session → FB form → upload images/video → publish)
    → webhook-server.js (update status) → WhatsApp notification
```

### Key Technical Details
- GoLogin SDK with default tmpdir, `--display=:100`, `browser.newPage()` (not pages[0])
- Per-profile cookies prevent cross-account contamination
- Facebook category MUST be exact dropdown match ("Inflatable Bouncers", "Miscellaneous")
- Location converted from `, TX` → `, Texas` for FB dropdown, typed char-by-char
- Phone overlay: ImageMagick composite with semi-transparent black banner + white text
- UAD: 30 DFW cities, 4 Telnyx phones rotating
- MissParty: 20 DFW cities, 1 fixed phone

### Evidence
- UAD (id=15): Posted Feb 20 19:06 UTC — phone overlay with +1-972-628-3587
- MissParty (id=16): Posted Feb 20 19:02 UTC — phone overlay with +1-469-283-9855
- Screenshots in `/opt/fb-marketplace-bot/screenshots/`

---

## Historical Context (Feb 18 — resolved)

The original version of this document noted that the bot failed to progress past Facebook's multi-tab form. Root causes found and fixed:
1. **Category validation**: "party rentals" and "garage doors" returned zero dropdown results. Fixed to "Inflatable Bouncers" and "Miscellaneous".
2. **GoLogin config**: Custom tmpdir, missing `--display=:100`, using `pages[0]` instead of `browser.newPage()`.
3. **Per-profile cookies**: Single shared cookies.json caused cross-account contamination.

All issues resolved Feb 20, 2026. Bot now posts successfully for both customers.

---
*Updated: 2026-02-20*
