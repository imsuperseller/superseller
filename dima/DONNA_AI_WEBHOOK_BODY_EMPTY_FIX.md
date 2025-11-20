# 🔧 Donna AI - Webhook Body Empty Issue

**Date**: November 14, 2025  
**Issue**: WAHA sending webhook but body is empty  
**Status**: ⚠️ **INVESTIGATING**

---

## ✅ **PROGRESS**

**Webhook is now triggering!** ✅
- Execution 2303 appeared (17:56:35)
- WAHA is successfully sending webhooks to n8n
- Workflow is receiving the webhook requests

---

## ❌ **NEW ISSUE: Empty Request Body**

**Execution 2303 shows**:
```json
{
  "body": {},
  "headers": {...},
  "params": {},
  "query": {}
}
```

**Problem**: WAHA is sending the webhook, but the request body is empty. The WAHA Trigger node expects the event data in the body.

---

## 🔍 **COMPARISON**

**Execution 2286 (Successful - from earlier)**:
- WAHA Trigger node received full event data:
  ```json
  {
    "event": "message",
    "payload": {
      "body": "Hello Donna...",
      "type": "text",
      ...
    }
  }
  ```

**Execution 2303 (Current - Empty Body)**:
- Webhook received but `body: {}` is empty
- No event data in the request

---

## 🔧 **POSSIBLE CAUSES**

1. **WAHA Configuration**: WAHA might be sending webhooks without the JSON payload
2. **Content-Type**: WAHA might not be sending `Content-Type: application/json`
3. **WAHA Trigger Node**: Might need different configuration to receive the data
4. **Webhook Format**: WAHA might be sending data in a different format (query params, headers, etc.)

---

## 🔧 **FIX ATTEMPTED**

Updated "Filter Message Events" node to check multiple locations:
- `$json.event` (direct)
- `$json.body?.event` (nested in body)
- Fallback to empty string if not found

---

## 🧪 **NEXT STEPS**

1. **Check WAHA Logs**: See what WAHA is actually sending
2. **Test Webhook Manually**: Send a test POST with proper JSON body
3. **Verify WAHA Configuration**: Ensure WAHA is configured to send JSON payloads
4. **Check WAHA Trigger Node**: Verify it's configured to parse the incoming data correctly

---

**The webhook is working, but WAHA needs to send the event data in the request body.**

