# HTTP Webhook Troubleshooting Guide

**Date**: November 17, 2025  
**Issue**: Webhook returns 404 after reactivation  
**Status**: ⚠️ **INVESTIGATING**

---

## ❌ **PROBLEM**

After reactivating the workflow, the HTTP webhook still returns 404:
```json
{
  "code": 404,
  "message": "The requested webhook \"POST rensto-support\" is not registered."
}
```

**Workflow Status**:
- ✅ Workflow is active (`active: true`)
- ✅ HTTP Webhook Trigger node exists
- ✅ Webhook ID: `16066022-de20-4cc1-9d8f-72a7223d52c1`
- ✅ Response Mode: `responseNode`
- ✅ Response Node: `respond-to-webhook`
- ❌ Webhook endpoint not registered

---

## 🔍 **POSSIBLE CAUSES**

### **1. Response Node Configuration Issue**

The `responseNode` option might need:
- Node ID instead of node name
- Different format
- Node must be directly connected to webhook

**Current Configuration**:
```json
{
  "responseMode": "responseNode",
  "options": {
    "responseNode": "respond-to-webhook"
  }
}
```

**Try**: Use node ID `respond-to-webhook` (which is the node ID)

### **2. n8n Version Compatibility**

`responseNode` mode might not be supported in n8n v1.113.3

**Alternative**: Use `lastNode` mode and ensure "Respond to Webhook" is the last node in the HTTP webhook path

### **3. Webhook Path Conflict**

The path `rensto-support` might conflict with another webhook or route

**Check**: Verify no other workflows use this path

### **4. n8n Service Restart Required**

Sometimes n8n needs a full restart to register webhooks after configuration changes

**Solution**: Restart n8n service on VPS

---

## 🔧 **SOLUTIONS TO TRY**

### **Solution 1: Use `lastNode` Mode**

Change webhook to `lastNode` mode and ensure "Respond to Webhook" is the last node:

1. Update webhook: `responseMode: "lastNode"`
2. Remove routing node (or make it pass-through for HTTP webhook)
3. Ensure "Respond to Webhook" is the final node in HTTP path
4. Reactivate workflow

### **Solution 2: Use Node ID for responseNode**

If using `responseNode` mode, try using the actual node ID:

```json
{
  "responseMode": "responseNode",
  "options": {
    "responseNode": "respond-to-webhook"  // This is already the node ID
  }
}
```

### **Solution 3: Restart n8n Service**

SSH to VPS and restart n8n:

```bash
ssh root@172.245.56.50
systemctl restart n8n
# OR if using Docker:
docker restart n8n
```

### **Solution 4: Check Webhook Node in UI**

1. Open workflow in n8n UI
2. Click on "HTTP Webhook Trigger" node
3. Verify:
   - Path: `rensto-support`
   - Response Mode: Shows correct mode
   - Response Node: Shows "Respond to Webhook"
   - Webhook URL: Shows production URL

---

## 📋 **VERIFICATION STEPS**

1. **Check Workflow Status**:
   - Workflow must be active
   - All nodes must be connected
   - No disabled nodes in the path

2. **Check Webhook Configuration**:
   - Path must be unique
   - Response mode must be valid
   - Response node must exist and be connected

3. **Check n8n Logs**:
   ```bash
   ssh root@172.245.56.50
   journalctl -u n8n -f
   # OR if Docker:
   docker logs n8n -f
   ```

4. **Test Webhook**:
   ```bash
   curl -X POST "http://172.245.56.50:5678/webhook/rensto-support" \
     -H "Content-Type: application/json" \
     -d '{"question": "Test"}'
   ```

---

## 🎯 **RECOMMENDED NEXT STEPS**

1. **Try `lastNode` mode** (simpler, more reliable)
2. **Check n8n logs** for webhook registration errors
3. **Restart n8n** if logs show issues
4. **Verify in UI** that webhook shows production URL

---

**Last Updated**: November 17, 2025, 21:25 UTC

