# 🔗 WAHA Webhook Configuration for Rensto Support Workflow

**Date**: November 17, 2025  
**Workflow ID**: `eQSCUFw91oXLxtvn`  
**Workflow Name**: `INT-WHATSAPP-SUPPORT-001: Rensto Support Agent`  
**WAHA Session**: `rensto-support`  
**Status**: ⚠️ **NEEDS CONFIGURATION**

---

## 🎯 **OBJECTIVE**

Configure WAHA to send events (messages, media, etc.) to the n8n workflow webhook URL so the workflow can receive WhatsApp messages.

---

## 📋 **CURRENT STATE**

**WAHA Trigger Node**:
- **Node ID**: `41b99b57-d1de-42f5-8a50-81ef433696fb`
- **Webhook ID**: `976a4187-04c0-458b-b9ba-c7af75ed5de0`
- **Webhook URL**: `http://173.254.201.134:5678/webhook/976a4187-04c0-458b-b9ba-c7af75ed5de0/waha`

**WAHA Instance**:
- **URL**: `http://173.254.201.134:3000`
- **API Key**: `4fc7e008d7d24fc995475029effc8fa8`
- **Session**: `rensto-support`

---

## ✅ **CONFIGURATION METHODS**

### **Method 1: Session Webhook (Recommended)**

Configure webhook when starting/updating the session:

```bash
curl -X POST "http://173.254.201.134:3000/api/sessions/rensto-support" \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "url": "http://173.254.201.134:5678/webhook/976a4187-04c0-458b-b9ba-c7af75ed5de0/waha",
      "events": [
        "session.status",
        "message",
        "message.any",
        "message.reaction",
        "message.ack",
        "message.waiting",
        "message.edited",
        "message.revoked",
        "group.v2.join",
        "group.v2.leave",
        "group.v2.participants",
        "group.v2.update",
        "presence.update",
        "poll.vote",
        "poll.vote.failed",
        "chat.archive",
        "call.received",
        "call.accepted",
        "call.rejected"
      ],
      "retries": 3,
      "headers": {}
    }
  }'
```

---

### **Method 2: Global Webhook (Alternative)**

Configure webhook at server level (applies to all sessions):

```bash
curl -X POST "http://173.254.201.134:3000/api/webhooks" \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://173.254.201.134:5678/webhook/976a4187-04c0-458b-b9ba-c7af75ed5de0/waha",
    "events": [
      "session.status",
      "message",
      "message.any"
    ],
    "retries": 3
  }'
```

---

### **Method 3: WAHA Dashboard (Manual)**

1. **Open WAHA Dashboard**: `http://173.254.201.134:3000/dashboard`
2. **Go to**: Sessions → `rensto-support` → Webhooks
3. **Add Webhook**:
   - **URL**: `http://173.254.201.134:5678/webhook/976a4187-04c0-458b-b9ba-c7af75ed5de0/waha`
   - **Events**: Select all message events
   - **Retries**: 3
   - **Save**

---

## 📋 **REQUIRED EVENTS**

For Rensto Support workflow, configure these events:

### **Essential Events**:
- ✅ `message` - Text and voice messages
- ✅ `message.any` - All message types
- ✅ `session.status` - Session connection status

### **Optional Events** (for future features):
- `message.reaction` - Message reactions
- `message.ack` - Message acknowledgments
- `message.edited` - Edited messages
- `message.revoked` - Deleted messages
- `group.v2.join` - Group join events
- `group.v2.leave` - Group leave events
- `presence.update` - Online/offline status
- `call.received` - Incoming calls
- `call.accepted` - Accepted calls
- `call.rejected` - Rejected calls

---

## ✅ **VERIFICATION**

### **1. Check Webhook Registration**

```bash
curl -X GET "http://173.254.201.134:3000/api/sessions/rensto-support" \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8"
```

**Expected Response**:
```json
{
  "session": "rensto-support",
  "status": "WORKING",
  "webhook": {
    "url": "http://173.254.201.134:5678/webhook/976a4187-04c0-458b-b9ba-c7af75ed5de0/waha",
    "events": ["message", "message.any", "session.status"]
  }
}
```

### **2. Test Message Flow**

1. **Send WhatsApp message** to `+1 214-436-2102`
2. **Check n8n workflow execution**: `http://173.254.201.134:5678/executions`
3. **Verify**: Workflow should trigger and process message

### **3. Check WAHA Logs**

```bash
docker logs waha-noweb | grep -i webhook
```

**Expected**: Webhook delivery logs showing successful POST requests to n8n

---

## 🔧 **TROUBLESHOOTING**

### **Issue: Webhook Not Receiving Events**

**Check**:
1. ✅ Webhook URL is correct (no typos)
2. ✅ n8n workflow is **ACTIVE**
3. ✅ WAHA session is **WORKING** (not SCAN_QR_CODE)
4. ✅ Network connectivity (WAHA can reach n8n)
5. ✅ Firewall rules allow traffic

**Solution**:
- Restart WAHA session: `POST /api/sessions/rensto-support/restart`
- Re-register webhook: Update session with webhook config
- Check n8n webhook logs: `http://173.254.201.134:5678/webhook/976a4187-04c0-458b-b9ba-c7af75ed5de0/waha`

### **Issue: Webhook Returns 404**

**Cause**: n8n webhook URL is incorrect or workflow is inactive

**Solution**:
1. Verify webhook ID in WAHA Trigger node
2. Ensure workflow is **ACTIVE**
3. Test webhook URL directly: `curl -X POST http://173.254.201.134:5678/webhook/976a4187-04c0-458b-b9ba-c7af75ed5de0/waha`

### **Issue: Events Not Matching**

**Cause**: WAHA sends events but workflow filter rejects them

**Solution**:
- Check "Filter Message Events1" node in workflow
- Verify event format matches WAHA payload structure
- Test with `message.any` event to catch all message types

---

## 📚 **REFERENCES**

- **WAHA Events Documentation**: https://waha.devlike.pro/docs/how-to/events/
- **WAHA API**: `http://173.254.201.134:3000/api`
- **WAHA Dashboard**: `http://173.254.201.134:3000/dashboard`
- **n8n Workflow**: `http://173.254.201.134:5678/workflow/eQSCUFw91oXLxtvn`

---

## ✅ **QUICK SETUP COMMAND**

**One-liner to configure webhook**:

```bash
curl -X POST "http://173.254.201.134:3000/api/sessions/rensto-support" \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  -H "Content-Type: application/json" \
  -d '{"webhook":{"url":"http://173.254.201.134:5678/webhook/976a4187-04c0-458b-b9ba-c7af75ed5de0/waha","events":["message","message.any","session.status"],"retries":3}}'
```

---

**Last Updated**: November 17, 2025  
**Status**: ⚠️ **PENDING CONFIGURATION**

