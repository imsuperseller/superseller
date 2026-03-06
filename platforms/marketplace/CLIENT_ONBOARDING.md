# Client Onboarding Guide — Facebook Marketplace Bot

Follow these steps to set up a new client on the Facebook Marketplace posting system.

## 1. GoLogin Profile
- Create a new GoLogin profile for the client via GoLogin desktop app or API.
- Configure proxy: `geo.floppydata.com:10080` with auth (do NOT change — part of fingerprint).
- Get the `profileId` and add to `fb-marketplace-lister/deploy-package/bot-config.json`.

## 2. Facebook Account
- Client needs a Facebook account with Marketplace access.
- First login must be done from the server via `interactive_login.js` (triggers 2FA).
- Client approves 2FA on their phone. noVNC at `http://172.245.56.50:6080/vnc.html` for visual verification.
- After approval, cookies are saved to `cookies_{clientId}.json`.

## 3. Bot Configuration
Update `fb-marketplace-lister/deploy-package/bot-config.json`:
- Add a new object to the `products` array with:
  - `id`, `name`, `profileId`, `getJobsUrl`, `updateStatusUrl`
  - `category` — MUST be exact Facebook dropdown match (e.g. "Inflatable Bouncers", "Miscellaneous")
  - `videoLogic` ("static" or "dynamic"), `videoFilename`
  - `fbEmail`, `fbPass`
  - `phoneRotation` — array of Telnyx numbers
  - `locations` — array of DFW cities for rotation
  - `stealthLevel`, `postLimit`, `cooldownMinutes`

## 4. Product Images
- Place 3 product images at `/var/www/garage-door-images/img_{clientId}_0.jpg`, `_1.jpg`, `_2.jpg`
- Originals auto-backed up to `/var/www/garage-door-images/originals/`
- Phone overlay generated dynamically per-job by webhook server

## 5. Database Jobs
Insert listings into PostgreSQL `fb_listings` table:
```sql
INSERT INTO fb_listings (client_id, status, listing_title, listing_description, price, phone_number, location)
VALUES ('newclient', 'queued', 'Product Title', 'Description with details', 100, '+1-xxx-xxx-xxxx', 'Dallas, TX');
```

## 6. Webhook Server
Add endpoints in `webhook-server.js`:
```javascript
app.get('/webhook/v1-newclient-jobs', getJobsHandler('newclient', 'video.mp4'));
app.post('/webhook/v1-newclient-update', updateHandler('newclient'));
```

Add rotation state:
```javascript
rotationState.newclient = { phone: 0, location: 0 };
```

## 7. Deploy & Verify
```bash
rsync -avz --exclude node_modules "fb-marketplace-lister/deploy-package/" root@172.245.56.50:/opt/fb-marketplace-bot/
ssh root@172.245.56.50 "cd /opt/fb-marketplace-bot && pm2 restart webhook-server fb-scheduler"
curl -s http://172.245.56.50:8082/health
```

## 8. First Posting Test
```bash
# Test webhook returns job
curl -s http://172.245.56.50:8082/webhook/v1-newclient-jobs

# Run bot for new client
ssh root@172.245.56.50 "cd /opt/fb-marketplace-bot && DISPLAY=:100 node facebook-bot-final.js newclient"
```

---
*Updated: 2026-02-20. Replaces old Firebase-based onboarding.*
