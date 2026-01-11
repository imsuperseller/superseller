# WhatsApp Agent Duplication Guide - Step by Step

**Date**: November 16, 2025  
**Base Workflow**: `CUSTOMER-WHATSAPP-001: Donna AI - Main Agent` (ID: `86WHKNpj09tV9j1d`)  
**Purpose**: Create multiple WhatsApp agents from a single template

---

## 🎯 **QUICK START**

### **Step 1: Test Current Workflow**

**Test the existing Donna AI workflow**:
1. Send WhatsApp message to: `+1 214-436-2102`
2. Message: `"Hello Donna"`
3. Check execution: `http://172.245.56.50:5678/executions?workflowId=86WHKNpj09tV9j1d`
4. Verify response received

**If errors occur**: See troubleshooting section below.

---

## 🔄 **DUPLICATION PROCESS**

### **Method 1: Manual Duplication in n8n UI** (Recommended)

**Steps**:

1. **Open Base Workflow**:
   - Go to: `http://172.245.56.50:5678/workflow/86WHKNpj09tV9j1d`
   - Click "..." menu → "Duplicate"

2. **Update Workflow Name**:
   - Change: `CUSTOMER-WHATSAPP-001: Donna AI - Main Agent`
   - To: `CUSTOMER-WHATSAPP-002: [New Agent Name]`

3. **Update System Prompt**:
   - Find "Donna AI Agent1" node
   - Update system message for new agent context

4. **Update Knowledge Store** (if using RAG):
   - Find "Set Store Name and Extract Text1" node
   - Update `store_name` field
   - Or create new Gemini File Search store

5. **Update Agent Name**:
   - Update all references to "Donna" in system prompt
   - Update agent name in responses

6. **Save and Activate**:
   - Click "Save"
   - Toggle "Active" switch

---

### **Method 2: Programmatic Duplication** (Using n8n MCP)

**Steps**:

1. **Get Base Workflow**:
   ```javascript
   const baseWorkflow = await n8n_get_workflow({ id: "86WHKNpj09tV9j1d" });
   ```

2. **Modify Workflow**:
   - Update `name` field
   - Update system prompts in nodes
   - Update store names
   - Generate new webhook ID

3. **Create New Workflow**:
   ```javascript
   await n8n_create_workflow({
     name: "CUSTOMER-WHATSAPP-002: Sales Agent",
     nodes: modifiedNodes,
     connections: baseWorkflow.connections
   });
   ```

---

## 📋 **WHAT TO UPDATE WHEN DUPLICATING**

### **1. Workflow Name**
- **Location**: Workflow settings
- **Change**: `CUSTOMER-WHATSAPP-001` → `CUSTOMER-WHATSAPP-002`
- **Format**: `{TYPE}-WHATSAPP-{NUMBER}: {Agent Name}`

### **2. System Prompt**
- **Location**: "Donna AI Agent1" node → Options → System Message
- **Change**: Update context, personality, instructions
- **Example**: Change from "kitchen design" to "sales qualification"

### **3. Knowledge Store** (If Using RAG)
- **Location**: "Set Store Name and Extract Text1" node
- **Field**: `store_name`
- **Change**: Update to new store name or create new store
- **Example**: `fileSearchStores/donna-kitchen-knowledge` → `fileSearchStores/sales-knowledge`

### **4. Memory Session Key** (Usually Keep Same)
- **Location**: "Simple Memory1" node
- **Current**: `={{ $('WAHA Trigger1').item.json.payload?.from }}`
- **Action**: Usually keep same (per-phone isolation)

### **5. Agent Name in Responses**
- **Location**: System prompt
- **Change**: "Donna" → New agent name
- **Example**: "Donna" → "SalesBot"

### **6. Webhook ID** (Auto-Generated)
- **Location**: "WAHA Trigger1" node
- **Action**: n8n auto-generates new webhook ID
- **Note**: Update WAHA dashboard if needed

---

## 🎨 **AGENT TEMPLATES**

### **Template 1: RAG Agent** (Like Donna AI)

**Use Case**: Agent with knowledge base search

**Nodes**:
- WAHA Trigger
- Filter Message Events
- Filter Message Type
- Route by Message Type
- Download Voice Audio (if voice)
- Transcribe Voice (if voice)
- Prepare Question Text
- AI Agent with RAG Tool
- Simple Memory
- Extract Response Text
- Generate Voice Response (optional)
- Send Response

**Customization Points**:
- System prompt
- Knowledge store name
- Agent name

---

### **Template 2: Simple Chatbot** (No RAG)

**Use Case**: General chatbot without knowledge base

**Nodes**:
- WAHA Trigger
- Filter Message Events
- AI Agent (no RAG tool)
- Simple Memory
- Extract Response Text
- Send Response

**Customization Points**:
- System prompt
- Agent name
- Response style

---

### **Template 3: Workflow Trigger** (No AI)

**Use Case**: Trigger other n8n workflows

**Nodes**:
- WAHA Trigger
- Filter Message Events
- Extract Data
- Call Sub-Workflow
- Send Confirmation

**Customization Points**:
- Target workflow ID
- Data extraction logic
- Confirmation message

---

## 🔧 **TROUBLESHOOTING**

### **Issue 1: Workflow Not Triggering**

**Symptoms**: No execution when sending WhatsApp message

**Solutions**:
1. **Check WAHA Webhook**:
   - Go to: `http://172.245.56.50:3000/dashboard`
   - Login: `admin` / `admin123`
   - Check Webhooks section
   - Verify webhook URL matches n8n webhook

2. **Check Workflow Status**:
   - Verify workflow is ACTIVE
   - Check WAHA Trigger node is enabled

3. **Test Webhook Manually**:
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"event":"message","session":"default","payload":{"from":"test@c.us","type":"text","body":"test"}}' \
     "https://n8n.rensto.com/webhook/[WEBHOOK-ID]/waha"
   ```

---

### **Issue 2: Execution Errors**

**Symptoms**: Workflow triggers but fails with errors

**Common Causes**:
1. **Missing Credentials**: Check all nodes have credentials assigned
2. **Invalid Store Name**: Verify Gemini File Search store exists
3. **API Errors**: Check OpenAI/ElevenLabs API keys
4. **Node Configuration**: Verify all node parameters are correct

**Debug Steps**:
1. Check execution details in n8n UI
2. Look at error messages in failed nodes
3. Test individual nodes manually
4. Check API quotas/limits

---

### **Issue 3: No Response Sent**

**Symptoms**: Workflow executes but no WhatsApp response

**Solutions**:
1. **Check "Send Voice Message1" Node**:
   - Verify chatId is correct: `={{ $('Extract Response Text').item.json.designer_phone }}`
   - Check WAHA credentials are valid

2. **Check Response Text**:
   - Verify "Extract Response Text" node outputs text
   - Check AI Agent output format

3. **Check WAHA Session**:
   - Verify WAHA session is WORKING
   - Check WhatsApp is connected

---

## 🚀 **CREATING NEW AGENTS**

### **Example: Sales Agent**

**Steps**:

1. **Duplicate Workflow**:
   - Base: `CUSTOMER-WHATSAPP-001`
   - New: `CUSTOMER-WHATSAPP-002: Sales Agent`

2. **Update System Prompt**:
   ```
   You are a sales qualification agent for Rensto automation services.
   
   Your role:
   - Qualify leads by asking about their business needs
   - Recommend appropriate service types (Marketplace, Subscriptions, Custom)
   - Schedule consultations when ready
   - Be friendly and professional
   
   Always respond in a conversational, helpful tone.
   ```

3. **Update Knowledge Store** (Optional):
   - Create new store: `fileSearchStores/sales-knowledge`
   - Upload service descriptions, pricing, FAQs

4. **Update Agent Name**:
   - Change "Donna" to "SalesBot" in system prompt

5. **Test**:
   - Send test message
   - Verify responses are appropriate

---

### **Example: Website Chatbot**

**Steps**:

1. **Duplicate Workflow**:
   - Base: `CUSTOMER-WHATSAPP-001`
   - New: `INT-WHATSAPP-WEBSITE-001: Website Chatbot`

2. **Update System Prompt**:
   ```
   You are a friendly chatbot for Rensto's website.
   
   Your role:
   - Answer general questions about Rensto's services
   - Qualify leads (ask about business type, needs)
   - Provide information about Marketplace, Subscriptions, Custom Solutions
   - Be helpful and encourage engagement
   
   Keep responses concise and friendly.
   ```

3. **Simplify Workflow** (Optional):
   - Remove RAG tool if not needed
   - Use simpler AI model (gpt-4o-mini)

4. **Add Lead Capture**:
   - Add node to save leads to Airtable/Boost.space
   - Capture: name, phone, business type, needs

5. **Test**:
   - Send test message
   - Verify lead is captured

---

## 📊 **AGENT CONFIGURATION TABLE**

**Create in Airtable/Boost.space**:

**Table**: `WhatsApp Agents`

| Field | Type | Example |
|-------|------|---------|
| agent_id | Text | `donna-ai` |
| workflow_id | Text | `86WHKNpj09tV9j1d` |
| agent_name | Text | `Donna AI` |
| purpose | Text | `Kitchen Design Assistant` |
| system_prompt | Long Text | `You are Donna...` |
| knowledge_store | Text | `fileSearchStores/donna-kitchen-knowledge` |
| phone_numbers | Multiple Selects | `+12144362102` |
| is_active | Checkbox | `true` |
| created_date | Date | `2025-11-14` |

---

## 🔗 **ROUTING SETUP**

### **Option 1: Phone Number Routing**

**Create Router Workflow**: `INT-WHATSAPP-ROUTER-001`

**Flow**:
```
WAHA Trigger
    ↓
Extract Phone Number
    ↓
Lookup Agent (Airtable/Boost.space)
    ↓
Switch Node (Route to Agent)
    ├─→ Agent 1 (Sub-Workflow)
    ├─→ Agent 2 (Sub-Workflow)
    └─→ Default Agent (Sub-Workflow)
```

**Phone Number Mapping**:
- `+12144362102` → Donna AI (if authorized)
- Default → Website Chatbot

---

## ✅ **CHECKLIST**

### **Before Duplicating**:
- [ ] Test base workflow works
- [ ] Fix any errors in base workflow
- [ ] Document base workflow structure

### **During Duplication**:
- [ ] Duplicate workflow
- [ ] Update workflow name
- [ ] Update system prompt
- [ ] Update knowledge store (if needed)
- [ ] Update agent name
- [ ] Verify all credentials assigned

### **After Duplication**:
- [ ] Test new agent
- [ ] Verify responses are correct
- [ ] Add to agent configuration table
- [ ] Update router workflow (if using)
- [ ] Document new agent

---

## 📚 **REFERENCES**

- **Base Workflow**: `http://172.245.56.50:5678/workflow/86WHKNpj09tV9j1d`
- **Multi-Agent Architecture**: `docs/workflows/WHATSAPP_MULTI_AGENT_ARCHITECTURE.md`
- **WAHA Dashboard**: `http://172.245.56.50:3000/dashboard`
- **n8n Executions**: `http://172.245.56.50:5678/executions`

---

**Last Updated**: November 16, 2025  
**Status**: 📋 Guide Ready - Test workflow first, then duplicate

