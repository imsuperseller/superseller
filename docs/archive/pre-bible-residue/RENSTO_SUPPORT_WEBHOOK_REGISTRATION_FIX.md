# HTTP Webhook Registration Fix

**Date**: November 17, 2025  
**Issue**: HTTP Webhook returns 404 "not registered"  
**Status**: ⚠️ **REQUIRES MANUAL ACTIVATION**

---

## ❌ **PROBLEM**

The HTTP Webhook Trigger node was added programmatically, but n8n hasn't registered the webhook endpoint yet.

**Error**:
```json
{
  "code": 404,
  "message": "The requested webhook \"POST rensto-support\" is not registered.",
  "hint": "The workflow must be active for a production URL to run successfully..."
}
```

**Current Status**:
- ✅ HTTP Webhook Trigger node exists
- ✅ Normalize HTTP Input node exists
- ✅ Workflow is active
- ❌ Webhook endpoint not registered

---

## ✅ **SOLUTION: Manual Workflow Reactivation**

n8n requires workflows to be **deactivated and reactivated** to register new webhook endpoints.

### **Steps**:

1. **Go to n8n**: http://172.245.56.50:5678
2. **Open Workflow**: `INT-WHATSAPP-SUPPORT-001: Rensto Support Agent`
3. **Deactivate**: Toggle the workflow OFF (top-right corner)
4. **Wait**: 2-3 seconds
5. **Reactivate**: Toggle the workflow ON
6. **Wait**: 5-10 seconds for webhook registration
7. **Test**: Run the test command below

### **Test Command**:
```bash
curl -X POST "http://172.245.56.50:5678/webhook/rensto-support" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Rensto?"}'
```

**Expected Result**: Should return workflow execution response (not 404)

---

## 🔍 **WHY THIS HAPPENS**

When webhook nodes are added programmatically via API:
1. Node is added to workflow ✅
2. Workflow structure is saved ✅
3. **BUT**: n8n doesn't automatically register the webhook endpoint ❌

**Solution**: Deactivating/reactivating forces n8n to:
- Re-scan all trigger nodes
- Register all webhook endpoints
- Update the webhook routing table

---

## 📋 **ALTERNATIVE: Restart n8n** (If reactivation doesn't work)

If deactivating/reactivating doesn't work, restart n8n:

```bash
# SSH to VPS
ssh root@172.245.56.50

# Restart n8n (choose one based on your setup)
systemctl restart n8n
# OR
docker restart n8n
```

---

## ✅ **VERIFICATION**

After reactivation, verify:

1. **Check Webhook URL in n8n UI**:
   - Open workflow
   - Click "HTTP Webhook Trigger" node
   - Should show: `http://172.245.56.50:5678/webhook/rensto-support`

2. **Test Webhook**:
   ```bash
   curl -X POST "http://172.245.56.50:5678/webhook/rensto-support" \
     -H "Content-Type: application/json" \
     -d '{"question": "Test"}'
   ```

3. **Check Executions**:
   - Go to: http://172.245.56.50:5678/executions
   - Should see new execution from webhook test

---

**Last Updated**: November 17, 2025, 21:09 UTC

