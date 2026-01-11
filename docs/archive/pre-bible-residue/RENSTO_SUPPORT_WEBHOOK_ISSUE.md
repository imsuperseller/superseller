# HTTP Webhook Registration Issue

**Date**: November 17, 2025, 21:31 UTC  
**Status**: ❌ **WEBHOOK NOT REGISTERING** (Requires n8n Service Restart)

## Problem

HTTP webhook endpoint is not registering even though:
- ✅ Workflow is active
- ✅ HTTP Webhook Trigger node exists with `httpMethod: POST`, `path: rensto-support-api`
- ✅ Webhook ID exists: `16066022-de20-4cc1-9d8f-72a7223d52c1`
- ✅ User has deactivated/reactivated workflow multiple times

## Root Cause

n8n webhook registration happens at workflow activation time. When webhooks are added programmatically, n8n may not register them until:
1. Workflow is deactivated and reactivated (already tried)
2. n8n service is restarted (required)

## Solution

**Restart n8n service on VPS**:
```bash
# SSH to VPS
ssh root@172.245.56.50

# Restart n8n (method depends on how it's running)
# If using PM2:
pm2 restart n8n

# If using systemd:
systemctl restart n8n

# If using Docker:
docker restart n8n
```

After restart, webhook should register automatically when workflow is active.

## Current Configuration

- **Path**: `rensto-support-api`
- **Method**: `POST`
- **Response Mode**: `lastNode`
- **Webhook URL**: `http://172.245.56.50:5678/webhook/rensto-support-api`

