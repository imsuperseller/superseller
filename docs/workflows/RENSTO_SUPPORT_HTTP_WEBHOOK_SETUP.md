# HTTP Webhook Trigger Setup for Rensto Support Workflow

**Workflow ID**: `eQSCUFw91oXLxtvn`  
**Workflow Name**: `INT-WHATSAPP-SUPPORT-001: Rensto Support Agent`  
**Date**: November 17, 2025

---

## 🎯 **OBJECTIVE**

Add HTTP Webhook trigger alongside WAHA trigger so the same agent can handle both WhatsApp messages and website chat requests.

---

## 📋 **MANUAL SETUP STEPS**

### **Step 1: Add HTTP Webhook Trigger**

1. Open workflow: `http://173.254.201.134:5678/workflow/eQSCUFw91oXLxtvn`
2. Click **"+"** button to add new node
3. Search for **"Webhook"** → Select **"Webhook"** node
4. Configure:
   - **HTTP Method**: `POST`
   - **Path**: `rensto-support`
   - **Response Mode**: `Last Node`
   - **Options**: Leave defaults

5. **Webhook URL** will be: `http://173.254.201.134:5678/webhook/rensto-support`

---

### **Step 2: Add Normalization Code Node**

1. Add **"Code"** node after HTTP Webhook Trigger
2. Name: `Normalize HTTP Input`
3. Add this code:

```javascript
// Normalize HTTP webhook input to match WAHA trigger format
// This allows both WAHA and HTTP triggers to use the same downstream nodes
const httpInput = $input.item.json;

// Extract question from HTTP request body
const question = httpInput.body?.question || 
                 httpInput.body?.text || 
                 httpInput.body?.message || 
                 httpInput.question || 
                 httpInput.text || 
                 httpInput.message ||
                 '';

// Extract metadata
const sessionId = httpInput.body?.sessionId || 
                  httpInput.body?.session_id || 
                  httpInput.sessionId || 
                  httpInput.session_id ||
                  'webhook';

// Create WAHA-compatible format
return {
  json: {
    event: 'message',
    payload: {
      from: sessionId,
      body: question,
      conversation: question,
      id: `webhook-${Date.now()}`,
      hasMedia: false,
      _data: {
        message: {}
      }
    },
    source: 'http-webhook'
  }
};
```

---

### **Step 3: Connect Nodes**

1. **HTTP Webhook Trigger** → **Normalize HTTP Input**
2. **Normalize HTTP Input** → **Filter Message Events1** (same node that WAHA Trigger connects to)

---

### **Step 4: Add Response Node**

Since HTTP Webhook uses "Last Node" response mode, we need to add a response node at the end:

1. Add **"Respond to Webhook"** node after **"Send Voice Message1"**
2. Configure:
   - **Response Code**: `200`
   - **Response Data**: `={{ $json.response_text }}` (from Extract Response Text node)

---

## 🔌 **USAGE**

### **From Website (Next.js)**

```javascript
// POST to webhook
const response = await fetch('http://173.254.201.134:5678/webhook/rensto-support', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'What is the Marketplace?',
    sessionId: 'user-123' // Optional: for conversation memory
  })
});

const data = await response.json();
console.log(data); // Agent response
```

### **Expected Request Format**

```json
{
  "question": "What is the Marketplace?",
  "sessionId": "user-123"
}
```

### **Expected Response Format**

```json
{
  "response_text": "The Marketplace is our collection of pre-built workflow templates..."
}
```

---

## ✅ **VERIFICATION**

1. **Test HTTP Webhook**:
   ```bash
   curl -X POST http://173.254.201.134:5678/webhook/rensto-support \
     -H "Content-Type: application/json" \
     -d '{"question": "What is Rensto?", "sessionId": "test-123"}'
   ```

2. **Verify Response**: Should return agent's answer

3. **Test WhatsApp**: Send message to verify WAHA trigger still works

---

## 📝 **NOTES**

- Both triggers feed into the same **Filter Message Events1** node
- The normalization node ensures both formats are compatible
- Memory is session-based (uses `sessionId` from HTTP or `from` from WAHA)
- Response node only needed for HTTP webhook (WAHA sends via WhatsApp)

---

**Status**: ⚠️ **MANUAL SETUP REQUIRED** (n8n MCP connection format limitations)

