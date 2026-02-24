---
name: facebook-bot-server-management
description: >-
  Manages the Facebook marketplace bot on RackNerd server (172.245.56.50). PM2 services:
  webhook-server (port 8082), fb-scheduler (60-min cycles). Bot path: /opt/fb-marketplace-bot/.
  Use when "server bot", "RackNerd management", "bot restart". Not for local dev.
triggers:
  - "server bot"
  - "RackNerd management"
  - "bot restart"
  - "webhook server"
negative_triggers:
  - "local development"
  - "vercel deploy"
---

# Facebook Bot Server Management

Production Facebook marketplace bot on RackNerd VPS. Bot is LIVE and posting.

## Server Details
- **IP**: 172.245.56.50
- **Bot path**: `/opt/fb-marketplace-bot/`
- **Image path**: `/var/www/garage-door-images/`
- **GoLogin profiles**: UAD (`694b5e53fcacf3fe4b4ff79c`), Miss Party (`6949a854f4994b150d430f37`)

## PM2 Services

| Service | Role | Notes |
|---------|------|-------|
| `webhook-server` | Job serving + dynamic phone overlay | Port 8082 |
| `fb-scheduler` | 60-min cycle scheduler | Alternates UAD/MissParty |
| `tourreel-worker` | TourReel video pipeline | Port 3002 (separate product) |

## Operations

### Check Status
```bash
ssh root@172.245.56.50 "pm2 status"
curl -s http://172.245.56.50:8082/health
```

### View Logs
```bash
ssh root@172.245.56.50 "pm2 logs webhook-server --lines 30"
ssh root@172.245.56.50 "pm2 logs fb-scheduler --lines 30"
```

### Restart Services
```bash
ssh root@172.245.56.50 "pm2 restart webhook-server fb-scheduler"
```

### Deploy Code Update
```bash
rsync -avz --exclude node_modules "fb marketplace lister/deploy-package/" root@172.245.56.50:/opt/fb-marketplace-bot/
ssh root@172.245.56.50 "cd /opt/fb-marketplace-bot && pm2 restart webhook-server fb-scheduler"
```

### Manual Bot Run
```bash
ssh root@172.245.56.50 "cd /opt/fb-marketplace-bot && DISPLAY=:100 node facebook-bot-final.js uad"
ssh root@172.245.56.50 "cd /opt/fb-marketplace-bot && DISPLAY=:100 node facebook-bot-final.js missparty"
```

### Check Videos
```bash
ssh root@172.245.56.50 "ls -lh /opt/fb-marketplace-bot/*.mp4"
curl -I http://172.245.56.50:8080/video.mp4
curl -I http://172.245.56.50:8080/michal_video.mp4
```

### Check Images
```bash
ssh root@172.245.56.50 "ls -lh /var/www/garage-door-images/"
```

### Database Check
```bash
ssh root@172.245.56.50 "PGPASSWORD=a1efbcd564b928d3ef1d7cae psql -U admin -d app_db -h localhost -c \"SELECT id, client_id, status, listing_title, posted_at FROM fb_listings ORDER BY created_at DESC LIMIT 10;\""
```

## GoLogin Sessions

### Check Active Sessions
```bash
ssh root@172.245.56.50 "ps aux | grep orbita-browser | grep -v grep"
```

### Kill Stuck Sessions
```bash
ssh root@172.245.56.50 "pkill -f orbita-browser && rm -f /tmp/gologin_profile_*/Singleton*"
```

### Session Refresh (Stale Cookies)
```bash
ssh root@172.245.56.50 "cd /opt/fb-marketplace-bot && DISPLAY=:100 node refresh-session.js uad"
```

## Error Recovery

### Bot Not Posting
1. `pm2 status` — check if services are running
2. `curl http://172.245.56.50:8082/health` — webhook server health
3. Check DB for queued jobs: `SELECT count(*) FROM fb_listings WHERE status='queued';`
4. Check screenshots: `ls /opt/fb-marketplace-bot/screenshots/ | tail -5`
5. Check logs: `pm2 logs fb-scheduler --lines 50`

### Emergency Stop
```bash
ssh root@172.245.56.50 "pm2 stop fb-scheduler && pkill -f orbita-browser"
```

### Resource Check
```bash
ssh root@172.245.56.50 "free -h && df -h && pm2 status"
```
