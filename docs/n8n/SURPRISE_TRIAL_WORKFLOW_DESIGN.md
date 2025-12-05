# Surprise Trial Workflow - Complete Design

**Date**: November 25, 2025  
**Status**: 📋 Design Phase  
**Goal**: Automatically generate and deploy customer workflows with 1-hour free trial, then auto-shutdown and payment prompt

---

## 🎯 THE SURPRISE EXPERIENCE

**Customer Journey**:
1. Customer completes AI voice consultation
2. **SURPRISE**: "We've already built your WhatsApp agent! It's live now for 1 hour - try it out!"
3. Customer tests agent for 1 hour (basic version - may have minor issues, that's OK)
4. **AUTO-SHUTDOWN**: WAHA session stops automatically
5. **PAYMENT PROMPT**: Email sent with payment link
6. **CUSTOMER PAYS**: Stripe payment processed
7. **FINALIZATION PHASE**: Admin reviews and fixes (30-55 min) - **THIS IS WHEN YOU GET PAID** ✅
8. **FULL ACTIVATION**: Agent goes fully live after review (within 24 hours)

**Why This Works**:
- ✅ **WOW Factor**: Customer doesn't expect it - creates immediate value
- ✅ **Urgency**: 1-hour timer creates FOMO
- ✅ **Proof of Value**: They see it working before paying
- ✅ **Low Friction**: No commitment required upfront
- ✅ **YOU GET PAID FIRST**: Review work happens AFTER payment - it's part of the service they pay for

---

## 📊 COMPLETE WORKFLOW ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│         SURPRISE TRIAL WORKFLOW SYSTEM                       │
└─────────────────────────────────────────────────────────────┘

PHASE 1: AI CONSULTATION COMPLETES
  ↓
PHASE 2: AUTOMATIC WORKFLOW GENERATION
  ├─ Extract customer data (email, name, business info)
  ├─ Get base template (MCP: n8n_get_workflow)
  ├─ Customize workflow (Code node)
  ├─ Auto-fix errors (MCP: n8n_autofix_workflow)
  ├─ Validate workflow (MCP: n8n_validate_workflow)
  └─ Create workflow (MCP: n8n_create_workflow)
  ↓
PHASE 3: DEPLOY & ACTIVATE
  ├─ Create WAHA session (HTTP: POST /api/sessions/create)
  ├─ Start WAHA session (HTTP: POST /api/sessions/{session}/start)
  ├─ Configure webhook (HTTP: POST /api/sessions/{session})
  ├─ Activate workflow (MCP: n8n_update_workflow - set active: true)
  └─ Send surprise message to customer
  ↓
PHASE 4: 1-HOUR TRIAL TIMER
  ├─ Schedule shutdown (Cron: 1 hour from now)
  ├─ Log trial start (Boost.space)
  └─ Monitor usage (optional)
  ↓
PHASE 5: AUTO-SHUTDOWN
  ├─ Stop WAHA session (HTTP: POST /api/sessions/{session}/stop)
  ├─ Deactivate workflow (MCP: n8n_update_workflow - set active: false)
  └─ Send payment email
  ↓
PHASE 6: PAYMENT PROCESSING
  ├─ Customer pays via Stripe
  ├─ Webhook triggers reactivation
  ├─ Restart WAHA session
  └─ Reactivate workflow
```

---

## 🔧 DETAILED NODE DESIGN

### **Workflow Name**: `INT-WORKFLOW-GENERATOR-001: Surprise Trial Workflow Generator`

---

### **1. Trigger: Execute Workflow Trigger**

**Type**: `n8n-nodes-base.executeWorkflowTrigger`

**Input Source**: `passthrough`

**Expected Input from AI Consultation**:
```json
{
  "customerName": "Tax4US",
  "customerEmail": "ben@tax4us.com",
  "customerPhone": "+1234567890",
  "businessName": "Tax4US LLC",
  "businessType": "tax",
  "agentName": "Tax4US Support Agent",
  "agentPersonality": "professional",
  "agentPurpose": "Help Tax4US customers with tax questions",
  "agentSystemMessage": "You are a professional tax support agent...",
  "storeName": "fileSearchStores/tax4us-knowledge-base-xyz123",
  "wahaSession": "tax4us",
  "credentials": {
    "openAiApi": "cred-id-here",
    "wahaApi": "cred-id-here",
    "elevenLabsApi": "cred-id-here"
  },
  "notificationPhone": "1234567890@s.whatsapp.net"
}
```

---

### **2. Extract Customer Data**

**Type**: `n8n-nodes-base.code`

**Code**:
```javascript
const input = $input.item.json;

// Extract and validate customer data
const customerData = {
  customerName: input.customerName || 'Unknown',
  customerEmail: input.customerEmail || input.email || '',
  customerPhone: input.customerPhone || input.phone || '',
  businessName: input.businessName || input.customerName,
  businessType: input.businessType || 'general',
  workflowName: input.workflowName || `${input.customerName} WhatsApp Agent`,
  agentName: input.agentName || `${input.customerName} Support Agent`,
  agentPersonality: input.agentPersonality || 'professional',
  agentPurpose: input.agentPurpose || `Help ${input.customerName} customers`,
  agentSystemMessage: input.agentSystemMessage || '',
  storeName: input.storeName || 'fileSearchStores/rensto-knowledge-base-ndf9fmymwb2p',
  wahaSession: input.wahaSession || input.customerName.toLowerCase().replace(/\s+/g, '-'),
  credentials: input.credentials || {},
  notificationPhone: input.notificationPhone || '',
  trialStartTime: new Date().toISOString(),
  trialEndTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
};

// Validate required fields
if (!customerData.customerEmail) {
  throw new Error('Missing customerEmail - required for payment prompt');
}
if (!customerData.customerName) {
  throw new Error('Missing customerName');
}

return {
  json: customerData
};
```

---

### **3. Get Base Template**

**Type**: `n8n-nodes-base.httpRequest`

**Purpose**: Export base workflow via MCP HTTP endpoint

**Configuration**:
- **Method**: POST
- **⚠️ HTTP endpoint returns 404** - Use MCP tools directly via npx mode
- **Headers**:
  - `Authorization`: `Bearer {{ $env.N8N_MCP_JWT_TOKEN }}`
  - `Content-Type`: `application/json`
  - `Accept`: `application/json, text/event-stream`
- **Body** (JSON-RPC 2.0):
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "n8n_get_workflow",
    "arguments": {
      "id": "eQSCUFw91oXLxtvn"
    }
  }
}
```

**Response Parsing**: Extract workflow JSON from SSE response

---

### **4. Customize Workflow**

**Type**: `n8n-nodes-base.code`

**Purpose**: Customize workflow JSON (full logic from node-customizer.js)

**Key Customizations**:
- Update workflow name
- Customize Smart Message Router (store_name)
- Customize Shai AI Agent (system message, personality)
- Customize Search Knowledge Base (store_name, description)
- Update WAHA nodes (session, credentials)
- Update notification phone
- Generate new node IDs
- Update connections

---

### **5. Auto-Fix Workflow Errors**

**Type**: `n8n-nodes-base.httpRequest`

**Purpose**: Auto-fix common workflow errors before validation

**Configuration**:
- **Method**: POST
- **⚠️ HTTP endpoint returns 404** - Use MCP tools directly via npx mode
- **Body** (JSON-RPC 2.0):
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "n8n_autofix_workflow",
    "arguments": {
      "workflow": {{ $json.workflow }},
      "applyFixes": true,
      "fixTypes": ["expression-format", "typeversion-correction", "connection-fix"],
      "confidenceThreshold": "medium"
    }
  }
}
```

**Response**: Fixed workflow JSON

---

### **6. Validate Workflow**

**Type**: `n8n-nodes-base.httpRequest`

**Purpose**: Validate workflow before creating

**Configuration**:
- **Method**: POST
- **⚠️ HTTP endpoint returns 404** - Use MCP tools directly via npx mode
- **Body** (JSON-RPC 2.0):
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "n8n_validate_workflow",
    "arguments": {
      "workflow": {{ $json.workflow }},
      "options": {
        "validateNodes": true,
        "validateConnections": true,
        "validateExpressions": true,
        "profile": "runtime"
      }
    }
  }
}
```

**Error Handling**: If validation fails, log errors and notify admin (don't stop - try to fix)

---

### **7. Create Workflow**

**Type**: `n8n-nodes-base.httpRequest`

**Purpose**: Create new workflow in n8n

**Configuration**:
- **Method**: POST
- **⚠️ HTTP endpoint returns 404** - Use MCP tools directly via npx mode
- **Body** (JSON-RPC 2.0):
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "n8n_create_workflow",
    "arguments": {
      "name": {{ $json.workflow.name }},
      "nodes": {{ $json.workflow.nodes }},
      "connections": {{ $json.workflow.connections }},
      "settings": {{ $json.workflow.settings }}
    }
  }
}
```

**Response**: New workflow ID

---

### **8. Create WAHA Session**

**Type**: `n8n-nodes-base.httpRequest`

**Purpose**: Create new WAHA session for customer

**Configuration**:
- **Method**: POST
- **URL**: `http://173.254.201.134:3000/api/sessions/create`
- **Headers**:
  - `x-api-key`: `4fc7e008d7d24fc995475029effc8fa8`
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "name": "={{ $json.wahaSession }}",
  "config": {
    "proxy": null,
    "userAgent": null
  }
}
```

**Response**: Session created (status: SCAN_QR_CODE or WORKING)

---

### **9. Start WAHA Session**

**Type**: `n8n-nodes-base.httpRequest`

**Purpose**: Start WAHA session (if not already started)

**Configuration**:
- **Method**: POST
- **URL**: `http://173.254.201.134:3000/api/sessions/={{ $json.wahaSession }}/start`
- **Headers**:
  - `x-api-key`: `4fc7e008d7d24fc995475029effc8fa8`

**Note**: If session needs QR scan, this will return QR code URL

---

### **10. Configure WAHA Webhook**

**Type**: `n8n-nodes-base.httpRequest`

**Purpose**: Configure webhook for new workflow

**Configuration**:
- **Method**: POST
- **URL**: `http://173.254.201.134:3000/api/sessions/={{ $json.wahaSession }}`
- **Headers**:
  - `x-api-key`: `4fc7e008d7d24fc995475029effc8fa8`
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "webhook": {
    "url": "={{ $json.workflowWebhookUrl }}",
    "events": ["message", "message.any"],
    "retries": 3
  }
}
```

**Note**: Get webhook URL from created workflow (WAHA Trigger node)

---

### **11. Activate Workflow**

**Type**: `n8n-nodes-base.httpRequest`

**Purpose**: Activate the new workflow

**Configuration**:
- **Method**: POST
- **⚠️ HTTP endpoint returns 404** - Use MCP tools directly via npx mode
- **Body** (JSON-RPC 2.0):
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "n8n_update_partial_workflow",
    "arguments": {
      "id": {{ $json.newWorkflowId }},
      "operations": [
        {
          "type": "updateSettings",
          "updates": {
            "active": true
          }
        }
      ]
    }
  }
}
```

---

### **12. Send Surprise Message**

**Type**: `@devlikeapro/n8n-nodes-waha.WAHA`

**Purpose**: Send surprise message to customer

**Configuration**:
- **Resource**: `Chatting`
- **Operation**: `Send Text`
- **Session**: `={{ $json.wahaSession }}`
- **ChatId**: `={{ $json.customerPhone }}`
- **Text**: 
```
🎉 SURPRISE! 

We've already built your WhatsApp agent! It's live RIGHT NOW for the next hour.

Try it out - send a message and see it in action!

Your agent: {{ $json.agentName }}
Session: {{ $json.wahaSession }}

⏰ You have 1 hour to test it out. After that, we'll send you a payment link to keep it active.

Enjoy! 🚀
```

---

### **13. Schedule Shutdown (1 Hour Timer)**

**Type**: `n8n-nodes-base.cron` OR `n8n-nodes-base.wait`

**Option A: Wait Node** (Recommended for single execution):
- **Wait For**: `={{ $json.trialEndTime }}` (ISO timestamp)
- **Resume**: `When Time Arrives`

**Option B: Cron Trigger** (For scheduled execution):
- **Cron Expression**: Calculate 1 hour from now
- **Trigger**: Separate workflow that checks for trials ending

**Option C: Execute Workflow** (Best approach):
- Create separate "Trial Shutdown" workflow
- Trigger it via Execute Workflow with delay
- Or use n8n's built-in scheduling

---

### **14. Stop WAHA Session**

**Type**: `n8n-nodes-base.httpRequest`

**Purpose**: Stop WAHA session after 1 hour

**Configuration**:
- **Method**: POST
- **URL**: `http://173.254.201.134:3000/api/sessions/={{ $json.wahaSession }}/stop`
- **Headers**:
  - `x-api-key`: `4fc7e008d7d24fc995475029effc8fa8`

**Alternative**: If `/stop` doesn't exist, use `/restart` then immediately stop, or delete session

---

### **15. Deactivate Workflow**

**Type**: `n8n-nodes-base.httpRequest`

**Purpose**: Deactivate workflow

**Configuration**:
- **Method**: POST
- **⚠️ HTTP endpoint returns 404** - Use MCP tools directly via npx mode
- **Body** (JSON-RPC 2.0):
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "n8n_update_partial_workflow",
    "arguments": {
      "id": {{ $json.newWorkflowId }},
      "operations": [
        {
          "type": "updateSettings",
          "updates": {
            "active": false
          }
        }
      ]
    }
  }
}
```

---

### **16. Generate Payment Link**

**Type**: `n8n-nodes-base.code` + `mcp_stripe_create_payment_link`

**Purpose**: Create Stripe payment link

**Code** (extract from conversation or use defaults):
```javascript
const customerData = $json;

// Calculate pricing based on business type
const pricing = {
  'tax': { setup: 3500, monthly: 297 },
  'contractor': { setup: 2997, monthly: 247 },
  'realtor': { setup: 3997, monthly: 347 },
  'ecommerce': { setup: 2497, monthly: 197 },
  'legal': { setup: 4500, monthly: 397 },
  'general': { setup: 2500, monthly: 200 }
};

const packagePrice = pricing[customerData.businessType] || pricing['general'];

// Create Stripe price (if not exists)
// Then create payment link

return {
  json: {
    ...customerData,
    pricing: packagePrice,
    paymentLink: 'https://buy.stripe.com/...' // From Stripe MCP
  }
};
```

**Stripe MCP Tool**:
```javascript
// Use mcp_stripe_create_payment_link
// Requires: price ID, quantity, optional redirect_url
```

---

### **17. Send Payment Email**

**Type**: `n8n-nodes-base.emailSend` OR `n8n-nodes-base.microsoftOutlook`

**Purpose**: Send payment prompt email

**Configuration**:
- **To**: `={{ $json.customerEmail }}`
- **Subject**: `Your WhatsApp Agent Trial Has Ended - Keep It Active!`
- **Body** (HTML):
```html
Hi {{ $json.customerName }},

Your 1-hour trial of your WhatsApp agent has ended. We hope you enjoyed testing it!

To keep your agent active, complete your payment:

💰 Investment: ${{ $json.pricing.setup }} one-time setup + ${{ $json.pricing.monthly }}/month

🔗 Payment Link: {{ $json.paymentLink }}

⏰ This link is valid for 48 hours. After payment, your agent will be reactivated immediately.

Questions? Reply to this email or WhatsApp us!

Best,
Shai & The Rensto Team
```

---

### **18. Log Trial to Boost.space**

**Type**: `n8n-nodes-base.httpRequest` (Boost.space API)

**Purpose**: Log trial for tracking

**Configuration**:
- **Operation**: `Create`
- **Base**: `Rensto Client Operations`
- **Table**: `Trials`
- **Fields**:
  - Customer Name
  - Customer Email
  - Workflow ID
  - WAHA Session
  - Trial Start
  - Trial End
  - Status: `trial_ended`
  - Payment Link

---

## ⏰ TIMER IMPLEMENTATION OPTIONS

### **Option 1: Wait Node (Recommended)**

**Pros**: Simple, built-in, reliable  
**Cons**: Keeps workflow execution running for 1 hour

**Implementation**:
- Use `n8n-nodes-base.wait`
- Wait until: `={{ $json.trialEndTime }}`
- Resume: `When Time Arrives`

---

### **Option 2: Separate Shutdown Workflow**

**Pros**: Doesn't hold execution, scalable  
**Cons**: Requires coordination

**Implementation**:
1. Main workflow creates trial record in Boost.space with `trialEndTime`
2. Separate "Trial Shutdown Monitor" workflow runs every 5 minutes
3. Checks Boost.space for trials ending within next 5 minutes
4. Triggers shutdown workflow via Execute Workflow

---

### **Option 3: Cron + Airtable Check**

**Pros**: Most scalable, handles many trials  
**Cons**: Slight delay (up to cron interval)

**Implementation**:
1. Main workflow logs trial to Boost.space
2. Cron workflow runs every 5 minutes
3. Checks Boost.space for `trialEndTime <= NOW() AND status = 'active'`
4. Triggers shutdown for each expired trial

**Recommended**: **Option 3** (Cron + Boost.space) for scalability

---

## 🔄 PAYMENT → FINALIZATION → REACTIVATION FLOW

### **Stripe Webhook Handler**

**Workflow**: `STRIPE-TRIAL-PAYMENT-001`

**Trigger**: Stripe webhook `checkout.session.completed`

**Flow**:
1. ✅ Validate payment
2. ✅ Extract customer email
3. ✅ Lookup trial in Airtable
4. ✅ **Mark workflow as "PAID - PENDING REVIEW"** (inactive)
5. ✅ **Notify admin** (Slack/WhatsApp): "New paid workflow needs review - 30-55 min work"
6. ✅ **Admin reviews and fixes** (30-55 minutes) - **YOU GET PAID FOR THIS**
7. ✅ **Admin marks as "REVIEWED"** in Airtable
8. ✅ **Auto-restart WAHA session**
9. ✅ **Auto-activate workflow**
10. ✅ **Send confirmation email**: "Your agent is now fully optimized and live!"

---

## 🚨 ERROR HANDLING & EDGE CASES

### **1. Workflow Validation Fails**

**Action**: 
- Log errors to Boost.space
- Notify admin via Slack/WhatsApp
- Still create workflow (inactive)
- Admin reviews and fixes manually

### **2. WAHA Session Creation Fails**

**Action**:
- Retry 3 times
- If still fails, notify admin
- Workflow created but inactive
- Admin manually creates session

### **3. Customer Email Missing**

**Action**:
- Extract from conversation (AI agent should ask)
- If still missing, use notification phone
- Send WhatsApp message instead of email

### **4. Auto-Fix Doesn't Fix All Errors**

**Action**:
- Log remaining errors
- Create workflow anyway (inactive)
- Admin reviews and fixes
- Notify customer: "Agent is being finalized, will be ready in 24 hours"

---

## 📊 AUTOMATION CAPABILITIES (November 2025)

### **✅ CAN BE AUTOMATED**:

1. **Workflow Generation**: ✅ Fully automated
   - Export template, customize, validate, create

2. **Auto-Fix Common Errors**: ✅ Available
   - `n8n_autofix_workflow` can fix:
     - Expression format errors
     - Type version corrections
     - Connection fixes
   - **Limitation**: Only fixes common/obvious errors

3. **Validation**: ✅ Fully automated
   - `n8n_validate_workflow` catches most issues

4. **WAHA Session Management**: ✅ Fully automated
   - Create, start, stop sessions via API

5. **Email Extraction**: ✅ Can be automated
   - Extract from AI conversation
   - Fallback to asking customer

### **⚠️ REQUIRES MANUAL REVIEW**:

1. **Complex Workflow Errors**: 
   - Auto-fix handles ~70-80% of errors
   - Complex logic errors need human review

2. **Credential Setup**:
   - Customer's OpenAI/WAHA/ElevenLabs credentials
   - May need manual verification

3. **Knowledge Base Setup**:
   - Customer's Google AI Studio knowledge base
   - May need manual configuration

**Recommendation**: 
- **Automate 90%**: Generation, deployment, trial, shutdown
- **Manual Review**: After trial ends, admin reviews for 15-30 min
- **Customer Message**: "Your agent is ready! We're doing final quality checks - will be fully active in 24 hours"

---

## 🎯 SUCCESS METRICS

**Track**:
- Trials created
- Trials completed (customer tested)
- Payment conversion rate
- Time to payment
- Customer satisfaction

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] Create main workflow generator workflow
- [ ] Create trial shutdown monitor workflow (Cron)
- [ ] Create payment → reactivation workflow
- [ ] Test workflow generation end-to-end
- [ ] Test WAHA session start/stop
- [ ] Test 1-hour timer
- [ ] Test payment email
- [ ] Test reactivation flow
- [ ] Document customer-facing messaging
- [ ] Set up Boost.space tracking table (Space 53: Operations)

---

**Status**: Ready for implementation  
**Estimated Time**: 8-12 hours  
**Priority**: **CRITICAL** (enables surprise trial model)

