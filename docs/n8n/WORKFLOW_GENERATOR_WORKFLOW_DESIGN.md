# Workflow Generator n8n Workflow - Design Document

**Date**: November 25, 2025  
**Status**: 📋 Design Phase  
**Goal**: Build an n8n workflow that automatically generates customer workflows using MCP tools

---

## 🎯 OVERVIEW

**Workflow Name**: `INT-WORKFLOW-GENERATOR-001: Automated Workflow Generator`

**Purpose**: Automatically generate and deploy n8n workflows for customers based on AI consultation data.

**Trigger**: Receives customer data from AI voice consultation workflow

**Output**: Creates new n8n workflow, validates it, tests it, and notifies for review

---

## 📊 WORKFLOW ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│              WORKFLOW GENERATOR WORKFLOW                      │
└─────────────────────────────────────────────────────────────┘

1. TRIGGER
   └─ Execute Workflow Trigger (receives customer data from AI consultation)

2. EXTRACT CUSTOMER DATA
   └─ Code Node: Parse customer data from consultation
      - customerName
      - agentName
      - agentPersonality
      - agentPurpose
      - storeName (knowledge base)
      - wahaSession
      - credentials (OpenAI, WAHA, ElevenLabs)
      - notificationPhone

3. GET BASE TEMPLATE
   └─ HTTP Request → MCP HTTP Endpoint
      - Method: POST
      - ⚠️ HTTP endpoint returns 404 - Use MCP tools directly via npx mode
      - Headers: Authorization Bearer token
      - Body: MCP JSON-RPC call to export_workflow
      - Workflow ID: eQSCUFw91oXLxtvn (Rensto base template)

4. CUSTOMIZE WORKFLOW
   └─ Code Node: Customize workflow JSON
      - Update workflow name
      - Customize Smart Message Router (store_name, userId)
      - Customize Shai AI Agent (system message, personality)
      - Customize Search Knowledge Base (store_name, description)
      - Update WAHA nodes (session, credentials)
      - Update notification phone
      - Generate new node IDs
      - Update connections

5. VALIDATE WORKFLOW
   └─ HTTP Request → MCP HTTP Endpoint
      - Method: POST
      - Body: MCP JSON-RPC call to validate_workflow
      - Returns: Validation errors/warnings

6. CREATE WORKFLOW
   └─ HTTP Request → MCP HTTP Endpoint
      - Method: POST
      - Body: MCP JSON-RPC call to create_workflow
      - Returns: New workflow ID

7. TEST WORKFLOW
   └─ HTTP Request → MCP HTTP Endpoint
      - Method: POST
      - Body: MCP JSON-RPC call to trigger_webhook_workflow
      - Test message: "Hello, this is a test"

8. NOTIFY FOR REVIEW
   └─ Send notification (Slack/WhatsApp/Email)
      - Workflow ID
      - Customer name
      - Validation results
      - Test results
      - Link to workflow

9. LOG TO BOOST.SPACE
   └─ Create record in Boost.space Space 53 (Operations)
      - Customer name
      - Workflow ID
      - Status
      - Generated date
```

---

## 🔧 NODE DETAILS

### **1. Trigger: Execute Workflow Trigger**

**Type**: `n8n-nodes-base.executeWorkflowTrigger`

**Input Source**: `passthrough`

**Expected Input**:
```json
{
  "customerName": "Tax4US",
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

**Purpose**: Parse and validate customer data from consultation

**Code**:
```javascript
const input = $input.item.json;

// Extract customer data
const customerData = {
  customerName: input.customerName || 'Unknown',
  workflowName: input.workflowName || `${input.customerName} WhatsApp Agent`,
  agentName: input.agentName || `${input.customerName} Support Agent`,
  agentPersonality: input.agentPersonality || 'professional',
  agentPurpose: input.agentPurpose || `Help ${input.customerName} customers`,
  agentSystemMessage: input.agentSystemMessage || '',
  storeName: input.storeName || 'fileSearchStores/rensto-knowledge-base-ndf9fmymwb2p',
  wahaSession: input.wahaSession || input.customerName.toLowerCase(),
  credentials: input.credentials || {},
  notificationPhone: input.notificationPhone || ''
};

// Validate required fields
if (!customerData.customerName) {
  throw new Error('Missing customerName');
}
if (!customerData.storeName) {
  throw new Error('Missing storeName (knowledge base)');
}

return {
  json: customerData
};
```

---

### **3. Get Base Template**

**Type**: `n8n-nodes-base.httpRequest`

**Purpose**: Call MCP HTTP endpoint to export base workflow

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

**Response Handling**: Parse SSE response, extract workflow JSON

---

### **4. Customize Workflow**

**Type**: `n8n-nodes-base.code`

**Purpose**: Customize workflow JSON based on customer data

**Code** (simplified - full version in node-customizer.js):
```javascript
const baseWorkflow = $node['Get Base Template'].json.workflow || $json.workflow;
const customerData = $node['Extract Customer Data'].json;

// Deep clone workflow
const workflow = JSON.parse(JSON.stringify(baseWorkflow));

// Update workflow metadata
workflow.name = customerData.workflowName;
workflow.description = `WhatsApp agent workflow for ${customerData.customerName}`;

// Customize nodes
workflow.nodes = workflow.nodes.map(node => {
  // Customize Smart Message Router
  if (node.name === 'Smart Message Router') {
    const code = node.parameters.jsCode;
    node.parameters.jsCode = code
      .replace(/store_name: 'fileSearchStores\/rensto-knowledge-base-ndf9fmymwb2p'/, 
               `store_name: '${customerData.storeName}'`);
  }
  
  // Customize Shai AI Agent
  if (node.name === 'Shai AI Sales Agent') {
    node.parameters.options.systemMessage = customerData.agentSystemMessage || 
      `You are ${customerData.agentName}, ${customerData.agentPurpose}`;
  }
  
  // Customize Search Knowledge Base
  if (node.name === 'Search Knowledge Base') {
    node.parameters.description = `Search the ${customerData.customerName} knowledge base...`;
    // Update store_name in code
    const code = node.parameters.jsCode;
    node.parameters.jsCode = code
      .replace(/fileSearchStores\/rensto-knowledge-base-ndf9fmymwb2p/g, 
               customerData.storeName);
  }
  
  // Update WAHA nodes
  if (node.type === '@devlikeapro/n8n-nodes-waha.WAHA') {
    node.parameters.session = customerData.wahaSession;
    if (customerData.credentials.wahaApi) {
      node.credentials.wahaApi.id = customerData.credentials.wahaApi;
    }
  }
  
  // Update credentials
  if (customerData.credentials.openAiApi && node.credentials?.openAiApi) {
    node.credentials.openAiApi.id = customerData.credentials.openAiApi;
  }
  if (customerData.credentials.elevenLabsApi && node.credentials?.elevenLabsApi) {
    node.credentials.elevenLabsApi.id = customerData.credentials.elevenLabsApi;
  }
  
  // Generate new node IDs
  node.id = generateNewId();
  
  return node;
});

// Update connections with new node IDs
// (Map old IDs to new IDs)

return {
  json: {
    workflow: workflow,
    customerData: customerData
  }
};
```

---

### **5. Validate Workflow**

**Type**: `n8n-nodes-base.httpRequest`

**Purpose**: Validate workflow before creating

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

**Error Handling**: If validation fails, log errors and stop execution

---

### **6. Create Workflow**

**Type**: `n8n-nodes-base.httpRequest`

**Purpose**: Create new workflow in n8n

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

### **7. Test Workflow**

**Type**: `n8n-nodes-base.httpRequest`

**Purpose**: Trigger test execution

**Configuration**:
- **Method**: POST
- **URL**: `{{ $json.workflow.webhookUrl }}` (from created workflow)
- **Body**: Test message

---

### **8. Notify for Review**

**Type**: `n8n-nodes-base.code` + `@devlikeapro/n8n-nodes-waha.WAHA`

**Purpose**: Send notification with workflow details

---

### **9. Log to Boost.space**

**Type**: `n8n-nodes-base.httpRequest` (Boost.space API)

**Purpose**: Log generated workflow to Boost.space Space 53 (Operations)

---

## 🔑 MCP HTTP ENDPOINT USAGE

### **JSON-RPC 2.0 Format**

All MCP tool calls use JSON-RPC 2.0 format:

```json
{
  "jsonrpc": "2.0",
  "id": <unique-id>,
  "method": "tools/call",
  "params": {
    "name": "<tool-name>",
    "arguments": {
      // Tool-specific arguments
    }
  }
}
```

### **Response Format (SSE)**

MCP HTTP endpoint returns Server-Sent Events:

```
event: message
data: {"result": {...}, "jsonrpc": "2.0", "id": 1}
```

### **Available MCP Tools**

- `n8n_get_workflow` - Export workflow
- `n8n_validate_workflow` - Validate workflow
- `n8n_create_workflow` - Create workflow
- `n8n_update_workflow` - Update workflow
- `n8n_trigger_webhook_workflow` - Test workflow

---

## 🎉 SURPRISE TRIAL FEATURE

**After workflow creation, automatically**:
1. ✅ Create and start WAHA session
2. ✅ Send surprise message to customer
3. ✅ Set 1-hour timer
4. ✅ Auto-shutdown WAHA session after 1 hour
5. ✅ Send payment email with Stripe link
6. ✅ Log trial to Airtable

**See**: `docs/n8n/SURPRISE_TRIAL_WORKFLOW_DESIGN.md` for complete trial flow design

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] Create workflow structure in n8n
- [ ] Set up Execute Workflow Trigger
- [ ] Build Extract Customer Data node
- [ ] Build Get Base Template node (MCP HTTP call)
- [ ] Build Customize Workflow node (full customization logic)
- [ ] Build Auto-Fix Workflow node (MCP HTTP call)
- [ ] Build Validate Workflow node (MCP HTTP call)
- [ ] Build Create Workflow node (MCP HTTP call)
- [ ] Build Create WAHA Session node
- [ ] Build Start WAHA Session node
- [ ] Build Configure Webhook node
- [ ] Build Activate Workflow node
- [ ] Build Send Surprise Message node
- [ ] Build Schedule Shutdown (1-hour timer)
- [ ] Build Stop WAHA Session node
- [ ] Build Deactivate Workflow node
- [ ] Build Generate Payment Link node
- [ ] Build Send Payment Email node
- [ ] Build Log Trial node
- [ ] Create separate Trial Shutdown Monitor workflow (Cron)
- [ ] Create Payment → Reactivation workflow
- [ ] Test with sample customer data
- [ ] Document workflow usage

---

## 🚀 NEXT STEPS

1. **Create the workflow in n8n** using this design
2. **Test MCP HTTP endpoint calls** from n8n HTTP Request nodes
3. **Implement full customization logic** (port from node-customizer.js)
4. **Test WAHA session start/stop** via API
5. **Test 1-hour timer** mechanism
6. **Test payment email** and reactivation flow
7. **Add error handling** and retry logic
8. **Add logging** and monitoring

---

**Status**: Ready for implementation  
**Estimated Time**: 8-12 hours (includes surprise trial feature)  
**Priority**: **CRITICAL** (enables surprise trial model + workflow productization)

