# 🔧 Webhook Update Instructions - Default Session

**Date**: November 25, 2025  
**Session**: `default`  
**Target Webhook**: Router workflow (`a5d8af68-de4e-44b4-bbe8-9332a3915992/waha`)

---

## 🎯 **OBJECTIVE**

Update the `default` WAHA session webhook from:
- **Current**: `https://n8n.rensto.com/webhook/rensto-support-api`
- **Target**: `https://n8n.rensto.com/webhook/a5d8af68-de4e-44b4-bbe8-9332a3915992/waha`

---

## ⚠️ **CURRENT STATUS**

**WAHA API Limitation**: The WAHA NOWEB API doesn't expose webhook update endpoints via REST API. Webhook configuration must be done via the **WAHA Dashboard**.

---

## ✅ **METHOD: WAHA Dashboard (Manual Configuration)**

### **Step 1: Access WAHA Dashboard**

1. **Open Browser**: Navigate to `http://172.245.56.50:3000/dashboard`
2. **Login** (if required):
   - Username: `admin`
   - Password: `admin123`

### **Step 2: Navigate to Default Session**

1. **Click**: "Sessions" in the left sidebar
2. **Find**: Session named `default`
3. **Click**: On the `default` session row

### **Step 3: Update Webhook Configuration**

1. **Click**: "Webhooks" tab (or "Configuration" → "Webhooks")
2. **Find**: Existing webhook with URL `https://n8n.rensto.com/webhook/rensto-support-api`
3. **Edit** (or **Delete** and **Add New**):
   - **URL**: `https://n8n.rensto.com/webhook/a5d8af68-de4e-44b4-bbe8-9332a3915992/waha`
   - **Events**: Select:
     - ✅ `message`
     - ✅ `message.any`
     - ✅ `session.status`
   - **Retries**: 3 (or leave default)
   - **Save**

### **Step 4: Verify Webhook Update**

**Check via API**:
```bash
curl -s -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://172.245.56.50:3000/api/sessions/default | \
  python3 -m json.tool | jq '.config.webhooks[0]'
```

**Expected Response**:
```json
{
  "url": "https://n8n.rensto.com/webhook/a5d8af68-de4e-44b4-bbe8-9332a3915992/waha",
  "events": ["message", "message.any", "session.status"]
}
```

---

## 🧪 **TESTING**

### **Test 1: Router Workflow Receives Messages**

1. **Send WhatsApp message** to: `+1 214-436-2102`
2. **Message**: `"Test router"`
3. **Check Router Workflow Executions**:
   - URL: `http://172.245.56.50:5678/workflow/nZJJZvWl0MBe3uT4`
   - Should see new execution
4. **Verify**: Router processes message and routes to Rensto Support

### **Test 2: Routing Logic**

**Test Unknown Number** (should route to Rensto Support):
- Send from any number not in router's mapping
- Should route to Rensto Support workflow

**Test Tax4US Number** (`4695885133@c.us`):
- Should route to Tax4US agent workflow

**Test MeatPoint Number** (`19544043156@c.us`):
- Should route to MeatPoint agent workflow

---

## 📋 **VERIFICATION CHECKLIST**

- [ ] Default session webhook updated to router's webhook
- [ ] Router workflow is ACTIVE
- [ ] Router workflow WAHA Trigger uses `session: "default"`
- [ ] Test message triggers router workflow
- [ ] Router routes unknown numbers to Rensto Support
- [ ] Router routes known numbers to correct agents

---

## 🔍 **TROUBLESHOOTING**

### **Issue: Webhook Not Updating**

**Solution**:
1. Restart default session: `POST /api/sessions/default/restart`
2. Try deleting old webhook and adding new one
3. Check WAHA logs for errors

### **Issue: Router Not Receiving Messages**

**Check**:
1. ✅ Router workflow is ACTIVE
2. ✅ Router WAHA Trigger webhookId matches webhook URL
3. ✅ Default session status is WORKING
4. ✅ Webhook events include `message` and `message.any`

---

## 📚 **REFERENCES**

- **Router Workflow**: `nZJJZvWl0MBe3uT4` (INT-WHATSAPP-ROUTER-001)
- **Router WebhookId**: `a5d8af68-de4e-44b4-bbe8-9332a3915992`
- **Router Webhook URL**: `https://n8n.rensto.com/webhook/a5d8af68-de4e-44b4-bbe8-9332a3915992/waha`
- **WAHA Dashboard**: `http://172.245.56.50:3000/dashboard`
- **WAHA API**: `http://172.245.56.50:3000/api`

---

**Last Updated**: November 25, 2025  
**Status**: ⚠️ **REQUIRES MANUAL CONFIGURATION VIA DASHBOARD**

