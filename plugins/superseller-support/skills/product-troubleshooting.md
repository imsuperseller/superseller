---
name: Product Troubleshooting
description: Common issues, root causes, and fixes for each SuperSeller AI product
---

# Product Troubleshooting Guide

Diagnosis and resolution steps for common issues across all SuperSeller AI products.

## TourReel

### Kling API Failures
- **Symptom**: Video generation job stuck in "processing" or fails with API error
- **Root cause**: Kling API rate limits, temporary outages, or invalid input format
- **Fix**:
  1. Check job status in PostgreSQL: `SELECT * FROM jobs WHERE type = 'tourreel' ORDER BY created_at DESC LIMIT 5;`
  2. Check worker logs: `ssh root@172.245.56.50 "pm2 logs tourreel-worker --lines 50"`
  3. If API error, retry the job. If persistent, check Kie.ai status page.
  4. Verify API key is valid: check `KIEAI_API_KEY` in worker .env

### Double Realtor Bug
- **Symptom**: Realtor photo appears twice in the video (beginning and end)
- **Root cause**: Photo deduplication logic not filtering agent headshot from property photos
- **Fix**: Check the input photo array for duplicate agent photos. The pipeline should detect and deduplicate agent headshots before clip generation.

### WebP Format Errors (422 from Kling)
- **Symptom**: Kling API returns 422 error on image input
- **Root cause**: Kling only accepts JPG/PNG. WebP images from Zillow listings cause rejection.
- **Fix**: Ensure image preprocessing converts all WebP to JPG before sending to Kling. Check `sharp` conversion step in the pipeline.
- **Prevention**: Pre-deploy trace rule (CLAUDE.md) — always verify image format before API calls.

### Remotion Render Failures
- **Symptom**: Photo composition render fails or produces blank output
- **Root cause**: Missing photos, invalid URLs, or bundle cache corruption
- **Fix**:
  1. Check Remotion worker logs: `pm2 logs tourreel-worker`
  2. Verify photo URLs are accessible (curl each)
  3. Clear bundle cache: `rm -rf /tmp/remotion-webpack-bundle-*`
  4. Retry the render job

## FB Marketplace Bot

### GoLogin Session Expiry
- **Symptom**: Bot stops posting, logs show authentication failure
- **Root cause**: Facebook detects automation and invalidates the GoLogin browser session
- **Fix**:
  1. SSH to RackNerd: `ssh root@172.245.56.50`
  2. Check bot status: `curl -s http://172.245.56.50:8082/health`
  3. Check PM2 logs: `pm2 logs fb-scheduler --lines 50` and `pm2 logs webhook-server --lines 50`
  4. Refresh GoLogin session manually via GoLogin app
  5. Update session ID in bot-config.json: `/opt/fb-marketplace-bot/bot-config.json`
  6. Restart: `pm2 restart fb-scheduler webhook-server`

### Posting Schedule Issues
- **Symptom**: Posts not going out at expected times, or duplicate posts
- **Root cause**: Cron schedule misconfiguration, timezone issues, or Firestore schedule data stale
- **Fix**:
  1. Check bot-config.json for schedule settings
  2. Verify timezone settings (server runs UTC, schedules should account for customer timezone)
  3. Check Firestore posting schedule (FB Bot still uses Firestore — pending Postgres migration)
  4. Restart scheduler: `pm2 restart fb-scheduler`

### Listing Data Issues
- **Symptom**: Wrong product details, missing images, incorrect pricing in marketplace posts
- **Root cause**: Source data feed issues or scraping failures
- **Fix**: Check the listing data source, verify image URLs are accessible, check recent scrape logs.

## SocialHub / Buzz

### WhatsApp Approval Timeout
- **Symptom**: Content generated but never published — stuck waiting for WhatsApp approval
- **Root cause**: WAHA webhook not receiving approval response, or message never delivered
- **Fix**:
  1. Check WAHA health: `curl -s http://172.245.56.50:3000/api/sessions/superseller-whatsapp`
  2. Verify the approval message was sent to the correct phone number
  3. Check if the user responded but webhook missed it (check WAHA logs)
  4. Manually approve via API if the user confirmed through other channel

### Content Generation Failures
- **Symptom**: Claude AI content generation returns error or low-quality output
- **Root cause**: API rate limits, context window issues, or prompt template problems
- **Fix**: Check Claude API key, review the content prompt template, retry with adjusted parameters.

### Facebook Publishing Failures
- **Symptom**: Content approved but not appearing on Facebook page
- **Root cause**: Facebook Graph API token expiry, page permissions, or API rate limits
- **Fix**:
  1. Verify page token: check if the permanent page token is still valid
  2. Test with Graph API Explorer: `GET /294290977372290?fields=name,access_token`
  3. Check for Facebook API error codes in logs
  4. Regenerate page token if expired

## FrontDesk Voice AI

### Telnyx Webhook Misconfiguration
- **Symptom**: Incoming calls not triggering AI assistant, or calls drop immediately
- **Root cause**: Webhook URL pointing to wrong endpoint, or Telnyx API key issues
- **Fix**:
  1. Verify active API key (stored in worker .env as TELNYX_API_KEY)
  2. Check assistant config (stored in worker .env as TELNYX_ASSISTANT_ID)
  3. Verify webhook URL in Telnyx Mission Control portal
  4. Test with outbound call to verify connectivity
  5. Check worker voice webhook handler: `/api/telnyx/voice-webhook`

### Voice Quality Issues
- **Symptom**: AI voice sounds robotic, cuts out, or has high latency
- **Root cause**: Network latency to Telnyx, TTS model issues, or call routing problems
- **Fix**: Check MOS scores in call logs (should be > 4.0), verify KokoroTTS.af_heart model, check Deepgram Nova 3 STT.

## General Infrastructure

### Worker Down
- **Symptom**: Any product functionality stopped
- **Fix**:
  1. Health check: `curl -s http://172.245.56.50:3002/api/health`
  2. PM2 status: `ssh root@172.245.56.50 "pm2 status"`
  3. Restart specific service: `pm2 restart <service-name>`
  4. Check disk space: `df -h` (alert at 85%+)
  5. Check memory: `free -h`

### Database Issues
- **Symptom**: Queries timeout, data inconsistency, connection errors
- **Fix**:
  1. Check Postgres container: `docker ps | grep postgres`
  2. Check connections: `SELECT count(*) FROM pg_stat_activity;`
  3. Restart if needed: `docker restart postgres_db`

### Redis Issues
- **Symptom**: BullMQ jobs not processing, session errors
- **Fix**:
  1. Check Redis: `redis-cli -h 172.245.56.50 ping`
  2. Check queue status: `redis-cli -h 172.245.56.50 keys "bull:*"`
  3. Restart Redis container if needed
