# Donna AI - Webhook Configuration Issue

**Date**: November 14, 2025  
**Issue**: Message sent but workflow not triggering  
**Status**: ⚠️ **INVESTIGATING**

---

## 🔍 **PROBLEM**

User sent test message: **"Hello Donna, what materials are best for kitchen cabinets?"**

**Expected**: Workflow should trigger and respond with voice message  
**Actual**: No workflow execution triggered

---

## ✅ **VERIFIED**

1. **Workflow Status**: ✅ Active
2. **WAHA Trigger Node**: ✅ Enabled (not disabled)
3. **WAHA Session**: ✅ WORKING (`default` session)
4. **Webhook ID**: `a61c597a-9024-4c5a-9703-ba1fb2750a62`
5. **Webhook URL**: `http://173.254.201.134:5678/webhook/a61c597a-9024-4c5a-9703-ba1fb2750a62/waha`

---

## ❌ **ISSUES FOUND**

### **1. Webhook Not Registered**

**Error when accessing webhook**:
```json
{
  "code": 404,
  "message": "The requested webhook \"GET a61c597a-9024-4c5a-9703-ba1fb2750a62\" is not registered.",
  "hint": "The workflow must be active for a production URL to run successfully..."
}
```

**Note**: Workflow IS active, but webhook shows as "not registered"

### **2. WAHA Webhook API Not Available**

**Attempted endpoints**:
- ❌ `POST /api/webhooks` → 404 Not Found
- ❌ `GET /api/webhooks` → 404 Not Found
- ❌ `POST /api/sessions/default/config` → 404 Not Found

**Conclusion**: WAHA NOWEB may not expose webhook configuration API, or uses different endpoint

---

## 🔧 **POSSIBLE SOLUTIONS**

### **Option 1: WAHA Trigger Auto-Registration**

The WAHA Trigger node (v202502) should automatically register webhooks when workflow is activated. This might require:
- Workflow to be saved after activation
- WAHA Trigger node to be configured with session name
- Network connectivity between n8n and WAHA

**Action**: Check WAHA Trigger node configuration for session name

### **Option 2: Manual Webhook Configuration**

If WAHA NOWEB requires manual webhook configuration:
1. Check WAHA dashboard: `http://173.254.201.134:3000/dashboard`
2. Navigate to Webhooks section
3. Add webhook manually:
   - URL: `http://173.254.201.134:5678/webhook/a61c597a-9024-4c5a-9703-ba1fb2750a62/waha`
   - Events: `message`

### **Option 3: WAHA Session-Specific Webhooks**

WAHA NOWEB might require webhook configuration per session:
- Check if webhook needs to be configured at session level
- May need to use different API endpoint

### **Option 4: Test Webhook Directly**

Test if webhook endpoint is accessible:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message",
    "session": "default",
    "payload": {
      "from": "test@c.us",
      "type": "text",
      "body": "Test message"
    }
  }' \
  "http://173.254.201.134:5678/webhook/a61c597a-9024-4c5a-9703-ba1fb2750a62/waha"
```

---

## 📋 **NEXT STEPS**

1. ✅ Check WAHA Trigger node configuration (session name, webhook URL)
2. ⚠️ Verify WAHA NOWEB webhook configuration method
3. ⚠️ Test webhook endpoint directly
4. ⚠️ Check WAHA logs for webhook registration attempts
5. ⚠️ Verify network connectivity between WAHA and n8n

---

## 🔗 **REFERENCES**

- **Workflow**: `http://173.254.201.134:5678/workflow/86WHKNpj09tV9j1d`
- **WAHA Dashboard**: `http://173.254.201.134:3000/dashboard`
- **WAHA API**: `http://173.254.201.134:3000/api`
- **Webhook URL**: `http://173.254.201.134:5678/webhook/a61c597a-9024-4c5a-9703-ba1fb2750a62/waha`

