---
name: gologin-profile-management
description: >-
  GoLogin browser profile management for Facebook Marketplace automation. Handles session lifecycle,
  cookie management, proxy configuration, and anti-detection. Per-profile cookies prevent cross-account
  contamination. Use when "gologin profile", "browser session", "cookie management". Not for n8n workflows.
version: 2.0.0
triggers:
  - "gologin profile"
  - "browser automation"
  - "cookie management"
  - "session management"
negative_triggers:
  - "n8n workflow"
  - "social media"
---

# GoLogin Profile Management

Manages GoLogin browser profiles for Facebook Marketplace automation on RackNerd server.

## Profiles

| Client | Profile ID | FB Account | Cookie File |
|--------|-----------|------------|-------------|
| UAD | `694b5e53fcacf3fe4b4ff79c` | uad.garage.doors@gmail.com | `cookies_uad.json` |
| MissParty | `6949a854f4994b150d430f37` | michalkacher2006@gmail.com | `cookies_missparty.json` |

## Critical Rules (from findings.md — NEVER violate)

1. **Default tmpdir** (`/tmp`) — NOT a custom directory
2. **`--display=:100`** in extra_params (X11 for headless VPS)
3. **`--password-store=basic`** in extra_params (Linux encryption fix)
4. **`browser.newPage()`** — NEVER `pages[0]` (stale session context)
5. **Per-profile cookies**: `cookies_{clientId}.json` — NEVER shared cookies.json
6. **`GL.stopLocal({ posting: false })`** — NEVER `GL.stop()` (prevents S3 profile corruption)
7. **Pre-create fonts dir**: `/tmp/gologin_profile_{id}/fonts/`
8. **Clean stale locks**: `rm -f /tmp/gologin_profile_*/Singleton*`
9. **NEVER change proxy** — `geo.floppydata.com:10080` is part of fingerprint

## GoLogin API

**Token**: Read from `bot-config.json` → `shared.gologinToken` (NEVER hardcode)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/browser/{profileId}` | GET | Read profile |
| `/browser/{profileId}` | PUT | Update (requires ALL fields: GET first, modify, PUT back) |
| `/browser/{profileId}/cookies` | GET | Read cookies |
| `/browser/{profileId}/cookies` | POST | Upload cookies |

**No PATCH support** — always GET full profile, modify, PUT entire object back.

## Cookie Pipeline (Priority Order)

1. **Per-profile cookies.json** — `cookies_{clientId}.json` injected via `page.setCookie()` + force locale `en_US`
2. **GoLogin API** — `GL.getCookies(profileId)` as backup
3. **Direct login** — LAST RESORT, triggers 2FA notification to client

## Session Maintenance

### Keep Sessions Fresh
- Run bot at least weekly to prevent cookie staleness
- After EVERY successful posting, cookies saved to per-profile file AND GoLogin API
- If cookies go stale (>2 weeks idle): run `refresh-session.js` — fills password-only modal, no 2FA

### Session Refresh
```bash
ssh root@172.245.56.50 "cd /opt/fb-marketplace-bot && DISPLAY=:100 node refresh-session.js uad"
```

### First-Time Login (2FA Required)
- **UAD (server)**: Automated login does not work (no form in DOM). Use one-time manual login: `node scripts/manual-login-uad.js`, then log in via noVNC within 10 min. **Do not ask the user to run manual login again** unless session is confirmed lost. Session is preserved: bot never overwrites `cookies_uad.json` when it has `c_user` with cookies that lack it; backup to `.bak` before overwrite.
- **MissParty**: `DISPLAY=:100 node interactive_login.js 1` then approve 2FA via noVNC: `http://172.245.56.50:6080/vnc.html`

### Check Cookie Health
```bash
# Check if cookies have c_user + xs (required for valid session)
ssh root@172.245.56.50 "cat /opt/fb-marketplace-bot/cookies_uad.json | python3 -c \"import json,sys; cookies=json.load(sys.stdin); print([c['name'] for c in cookies if c['name'] in ['c_user','xs']])\""
```

## Rate Limits

- MAX 2-3 GoLogin login attempts per day (each sends notification to client)
- 5-minute minimum gap between bot runs
- In production: 30-minute intervals (configured per-product in bot-config.json)
- ~15 rapid sessions in 2 hours triggers Facebook block on ALL pages

## Proxy

- **Host**: `geo.floppydata.com:10080`
- **Auth**: `${PROXY_USERNAME} / ${PROXY_PASSWORD}`
- **NEVER change** — it's part of the browser fingerprint
- Bandwidth: 3.3GB, rotates IPs automatically
