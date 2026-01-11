# ✅ WAHA Trigger Node Configuration (v202502)

**Date**: November 25, 2025  
**Node Type**: `@devlikeapro/n8n-nodes-waha.wahaTrigger`  
**Version**: 202502 (Latest)  
**Status**: ✅ **CONFIGURED**

---

## ✅ **CORRECT CONFIGURATION**

**Parameters**:
```json
{
  "session": "default",
  "events": ["message", "message.any"]
}
```

**What to Enter in n8n UI**:

1. **Session**: `default`
   - This is the WAHA session name to listen to
   - Must match the session name in WAHA

2. **Events**: 
   - Select: `message`
   - Select: `message.any`
   - These are the event types to listen for

---

## 📋 **WHY THESE PARAMETERS**

### **Session: "default"**
- Router workflow listens to the `default` WAHA session
- All WhatsApp messages from the default session will trigger the router
- Must match the session name configured in WAHA

### **Events: ["message", "message.any"]**
- `message`: Text messages and basic message events
- `message.any`: All message types (text, voice, media, etc.)
- These ensure the router receives all incoming messages

---

## ⚠️ **IMPORTANT NOTES**

1. **Empty Parameters `{}` Don't Work**:
   - If parameters are empty, the WAHA Trigger won't register webhooks
   - Messages will be ignored
   - Always configure `session` and `events`

2. **Session Name Must Match**:
   - The `session` parameter must match the WAHA session name
   - Check WAHA Dashboard to verify session name
   - Router uses `default` session

3. **Webhook Auto-Registration**:
   - When workflow is activated, n8n automatically registers the webhook with WAHA
   - Webhook URL: `https://n8n.rensto.com/webhook/{webhookId}/waha`
   - No manual webhook configuration needed in WAHA Dashboard (but can verify)

---

## 🧪 **VERIFICATION**

After configuring:

1. **Activate Router Workflow**
2. **Check WAHA Session**:
   ```bash
   curl -s -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
     http://172.245.56.50:3000/api/sessions/default | \
     python3 -m json.tool | grep -A 5 webhooks
   ```
3. **Should see webhook URL** pointing to router workflow
4. **Send test message** to WhatsApp number
5. **Check router workflow execution** - should see message event

---

**Last Updated**: November 25, 2025  
**Status**: ✅ **CONFIGURED AND WORKING**
