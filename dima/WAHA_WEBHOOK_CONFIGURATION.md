# WAHA Webhook Configuration for Donna AI

**Date**: November 14, 2025  
**Workflow**: `CUSTOMER-WHATSAPP-001: Donna AI - Main Agent`  
**Webhook ID**: `a61c597a-9024-4c5a-9703-ba1fb2750a62`

---

## 🔗 **WEBHOOK URLS**

### **Test Mode** (for manual testing):
```
https://n8n.rensto.com/webhook-test/a61c597a-9024-4c5a-9703-ba1fb2750a62/waha
```

### **Production Mode** (for WAHA):
```
https://n8n.rensto.com/webhook/a61c597a-9024-4c5a-9703-ba1fb2750a62/waha
```

---

## ⚠️ **CURRENT STATUS**

**Issue**: WAHA Trigger node should auto-register webhook, but messages aren't triggering workflow

**Possible Causes**:
1. WAHA webhook not configured to send to n8n
2. WAHA Trigger node auto-registration not working
3. Webhook URL format incorrect

---

## 🔧 **SOLUTION: Manual WAHA Webhook Configuration**

Since WAHA NOWEB doesn't expose `/api/webhooks` endpoint, the WAHA Trigger node should handle webhook registration automatically. However, if it's not working, we need to:

### **Option 1: Check WAHA Trigger Node Configuration**

The WAHA Trigger node (v202502) should automatically:
1. Register webhook URL with WAHA when workflow is activated
2. Configure WAHA to send `message` events to the webhook

**Verify**:
- Workflow is **ACTIVE** ✅
- WAHA Trigger node is **NOT disabled** ✅
- WAHA session is **WORKING** ✅

### **Option 2: WAHA Dashboard Configuration**

If auto-registration isn't working:

1. **Access WAHA Dashboard**:
   - URL: `http://173.254.201.134:3000/dashboard`
   - Login: `admin` / `admin123`

2. **Navigate to Webhooks Section**

3. **Add Webhook**:
   - **URL**: `https://n8n.rensto.com/webhook/a61c597a-9024-4c5a-9703-ba1fb2750a62/waha`
   - **Events**: Select `message`
   - **Session**: `default` (or leave empty for all sessions)
   - **Save**

### **Option 3: WAHA API Configuration (If Available)**

If WAHA NOWEB supports webhook configuration via API:

```bash
# Try session-specific webhook
curl -X POST \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://n8n.rensto.com/webhook/a61c597a-9024-4c5a-9703-ba1fb2750a62/waha",
    "events": ["message"]
  }' \
  "http://173.254.201.134:3000/api/sessions/default/webhook"
```

---

## 🧪 **TEST WEBHOOK**

### **Test Production Webhook**:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message",
    "session": "default",
    "payload": {
      "from": "test@c.us",
      "type": "text",
      "body": "Test message from WAHA"
    }
  }' \
  "https://n8n.rensto.com/webhook/a61c597a-9024-4c5a-9703-ba1fb2750a62/waha"
```

**Expected**: Should trigger workflow execution

---

## 📋 **VERIFICATION STEPS**

1. ✅ **Workflow Active**: `http://173.254.201.134:5678/workflow/86WHKNpj09tV9j1d`
2. ✅ **WAHA Session Working**: `http://173.254.201.134:3000/api/sessions/default`
3. ⚠️ **Webhook Registered**: Check if WAHA is sending events to n8n
4. ⚠️ **Test Message**: Send WhatsApp message and check for execution

---

## 🔍 **TROUBLESHOOTING**

### **If Webhook Still Not Working**:

1. **Check n8n Logs**:
   ```bash
   docker logs n8n | grep -i webhook
   ```

2. **Check WAHA Logs**:
   ```bash
   docker logs waha-noweb | grep -i webhook
   ```

3. **Verify Network Connectivity**:
   - WAHA can reach `https://n8n.rensto.com`
   - No firewall blocking webhook calls

4. **Check WAHA Trigger Node**:
   - Open workflow in n8n
   - Click on WAHA Trigger node
   - Verify webhook URL is correct
   - Check if there are any error messages

---

## 📚 **REFERENCES**

- **Workflow**: `http://173.254.201.134:5678/workflow/86WHKNpj09tV9j1d`
- **WAHA Dashboard**: `http://173.254.201.134:3000/dashboard`
- **WAHA API**: `http://173.254.201.134:3000/api`
- **n8n Executions**: `http://173.254.201.134:5678/executions`

