# WhatsApp Multi-Agent Architecture - Complete Guide

**Date**: November 16, 2025  
**Base Workflow**: `CUSTOMER-WHATSAPP-001: Donna AI - Main Agent` (ID: `86WHKNpj09tV9j1d`)  
**Status**: 📋 Architecture Plan

---

## 🎯 **OVERVIEW**

**Goal**: Create a scalable WhatsApp agent system where:
1. ✅ Multiple agents for different purposes (customer support, sales, technical, etc.)
2. ✅ Website chatbots (embedded WhatsApp widgets)
3. ✅ n8n workflows with WhatsApp integration
4. ✅ Per-agent conversation isolation
5. ✅ Easy duplication and customization

---

## 🏗️ **ARCHITECTURE**

### **Current Setup** (Donna AI - Single Agent)

```
WhatsApp Number: +1 214-436-2102
    ↓
WAHA Session: "default"
    ↓
Single Workflow: CUSTOMER-WHATSAPP-001
    ↓
Single Agent: Donna AI (Kitchen Design)
```

### **Target Architecture** (Multi-Agent System)

```
WhatsApp Number: +1 214-436-2102
    ↓
WAHA Session: "default"
    ↓
Router Workflow: INT-WHATSAPP-ROUTER-001
    ├─→ Agent 1: CUSTOMER-WHATSAPP-001 (Donna AI - Kitchen Design)
    ├─→ Agent 2: CUSTOMER-WHATSAPP-002 (Sales Agent)
    ├─→ Agent 3: CUSTOMER-WHATSAPP-003 (Support Agent)
    ├─→ Agent 4: INT-WHATSAPP-WEBSITE-001 (Website Chatbot)
    └─→ Agent 5: INT-WHATSAPP-N8N-001 (Generic n8n Workflow Trigger)
```

---

## 📋 **AGENT TYPES**

### **1. Customer-Specific Agents** (`CUSTOMER-WHATSAPP-*`)

**Purpose**: Dedicated agents for specific customers/projects

**Examples**:
- `CUSTOMER-WHATSAPP-001`: Donna AI (Kitchen Design for Dima)
- `CUSTOMER-WHATSAPP-002`: Tax4Us Support Agent
- `CUSTOMER-WHATSAPP-003`: Shelly Insurance Agent

**Characteristics**:
- Custom knowledge base per agent
- Customer-specific system prompts
- Isolated conversation memory
- Customer branding/personality

---

### **2. Internal Agents** (`INT-WHATSAPP-*`)

**Purpose**: Rensto internal operations

**Examples**:
- `INT-WHATSAPP-ROUTER-001`: Routes messages to correct agent
- `INT-WHATSAPP-WEBSITE-001`: Website chatbot (public-facing)
- `INT-WHATSAPP-SALES-001`: Sales qualification agent
- `INT-WHATSAPP-SUPPORT-001`: Customer support agent

**Characteristics**:
- Rensto branding
- General knowledge base
- Multi-purpose functionality

---

### **3. Website Chatbots** (`INT-WHATSAPP-WEBSITE-*`)

**Purpose**: Embedded WhatsApp widgets on website

**Examples**:
- Homepage chatbot
- Service page chatbots (Marketplace, Subscriptions, etc.)
- Niche page chatbots

**Characteristics**:
- Public-facing
- Lead qualification
- FAQ responses
- Handoff to human when needed

---

### **4. n8n Workflow Triggers** (`INT-WHATSAPP-N8N-*`)

**Purpose**: Generic WhatsApp integration for any n8n workflow

**Examples**:
- Lead generation workflows
- Form submissions via WhatsApp
- Notification workflows
- Data collection workflows

**Characteristics**:
- Generic, reusable
- Easy to connect to existing workflows
- No AI agent needed (just message routing)

---

## 🔄 **ROUTING STRATEGY**

### **Option 1: Keyword-Based Routing** (Simple)

**How It Works**:
- Router workflow checks first message for keywords
- Routes to appropriate agent based on keywords

**Keywords**:
- "sales", "buy", "pricing" → Sales Agent
- "support", "help", "issue" → Support Agent
- "donna", "kitchen" → Donna AI
- Default → Website Chatbot

**Pros**: Simple, fast  
**Cons**: Requires specific keywords, less flexible

---

### **Option 2: Phone Number Routing** (Recommended)

**How It Works**:
- Router checks sender's phone number
- Routes to agent based on phone number mapping (Airtable/Boost.space)

**Mapping Table** (Airtable/Boost.space):
| Phone Number | Agent Workflow ID | Agent Name | Purpose |
|--------------|-------------------|------------|---------|
| +12144362102 | 86WHKNpj09tV9j1d | Donna AI | Kitchen Design |
| +1234567890 | INT-WHATSAPP-SALES-001 | Sales Agent | Lead Qualification |
| Default | INT-WHATSAPP-WEBSITE-001 | Website Chatbot | General Inquiries |

**Pros**: Flexible, per-user routing, easy to manage  
**Cons**: Requires phone number database

---

### **Option 3: AI-Powered Routing** (Advanced)

**How It Works**:
- Router uses AI to analyze first message
- Determines intent and routes to best agent

**Pros**: Most flexible, intelligent routing  
**Cons**: Slower, requires AI call, more complex

---

## 🚀 **IMPLEMENTATION PLAN**

### **Phase 1: Test Current Workflow** ✅ **DO FIRST**

1. **Test Donna AI Workflow**:
   - Send WhatsApp message to `+1 214-436-2102`
   - Verify workflow triggers
   - Check execution in n8n
   - Fix any issues

2. **Verify WAHA Connection**:
   - Check WAHA dashboard: `http://173.254.201.134:3000/dashboard`
   - Verify webhook is configured
   - Test webhook manually if needed

---

### **Phase 2: Create Router Workflow**

**Workflow**: `INT-WHATSAPP-ROUTER-001`

**Structure**:
```
WAHA Trigger
    ↓
Get Phone Number
    ↓
Lookup Agent (Airtable/Boost.space)
    ↓
Route to Agent (Switch Node)
    ├─→ Agent 1 (Sub-Workflow)
    ├─→ Agent 2 (Sub-Workflow)
    ├─→ Agent 3 (Sub-Workflow)
    └─→ Default Agent (Sub-Workflow)
```

**Nodes**:
1. **WAHA Trigger**: Receives all WhatsApp messages
2. **Extract Phone**: Get sender's phone number
3. **Lookup Agent**: Query Airtable/Boost.space for agent mapping
4. **Switch Node**: Route to correct agent workflow
5. **Sub-Workflow Nodes**: Call specific agent workflows

---

### **Phase 3: Duplicate Base Workflow**

**Template**: `CUSTOMER-WHATSAPP-001: Donna AI`

**Duplication Steps**:
1. Duplicate workflow in n8n
2. Update workflow name (e.g., `CUSTOMER-WHATSAPP-002: Sales Agent`)
3. Update system prompt for new agent
4. Update knowledge base/store name
5. Update memory session key (if needed)
6. Test new agent

**Quick Duplicate Script**:
- Use n8n MCP tools to duplicate workflow
- Update specific fields
- Activate new workflow

---

### **Phase 4: Create Agent Templates**

**Template Categories**:

1. **RAG Agent Template** (Like Donna AI):
   - WAHA Trigger
   - Message Filter
   - Voice/Text Router
   - AI Agent with RAG
   - TTS
   - Send Response

2. **Simple Chatbot Template**:
   - WAHA Trigger
   - AI Agent (no RAG)
   - Send Response

3. **Workflow Trigger Template**:
   - WAHA Trigger
   - Extract Data
   - Call Another Workflow
   - Send Confirmation

---

### **Phase 5: Website Integration**

**Option A: WhatsApp Widget** (Recommended)

**Implementation**:
1. Add WhatsApp widget to website
2. Widget opens WhatsApp chat with pre-filled message
3. User sends message → Router → Website Chatbot Agent
4. Agent responds with FAQ or qualification questions

**Widget Code** (for Vercel/Next.js):
```tsx
// components/WhatsAppWidget.tsx
export const WhatsAppWidget = () => {
  const phoneNumber = "+12144362102";
  const message = encodeURIComponent("Hello! I'm interested in Rensto's services.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
  
  return (
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
      <button>💬 Chat on WhatsApp</button>
    </a>
  );
};
```

**Option B: Embedded Chat** (Advanced)

- Use WhatsApp Business API
- Embed chat widget directly on page
- Requires WhatsApp Business Account

---

## 📊 **AGENT CONFIGURATION**

### **Agent Configuration Table** (Airtable/Boost.space)

**Table**: `WhatsApp Agents`

| Field | Type | Description |
|-------|------|-------------|
| agent_id | Text | Unique ID (e.g., "donna-ai") |
| workflow_id | Text | n8n workflow ID |
| agent_name | Text | Display name (e.g., "Donna AI") |
| purpose | Text | Purpose description |
| system_prompt | Long Text | AI system prompt |
| knowledge_store | Text | Gemini File Search store name |
| phone_numbers | Multiple Selects | Authorized phone numbers |
| is_active | Checkbox | Active status |
| created_date | Date | Creation date |

---

## 🔧 **DUPLICATION PROCESS**

### **Step-by-Step: Duplicate Donna AI to New Agent**

1. **Duplicate Workflow**:
   ```bash
   # Use n8n MCP tool
   n8n_get_workflow({ id: "86WHKNpj09tV9j1d" })
   # Save as new workflow
   n8n_create_workflow({ name: "CUSTOMER-WHATSAPP-002: Sales Agent", ... })
   ```

2. **Update Workflow Name**:
   - Change: `CUSTOMER-WHATSAPP-001: Donna AI - Main Agent`
   - To: `CUSTOMER-WHATSAPP-002: Sales Agent`

3. **Update System Prompt**:
   - Find "Donna AI Agent" node
   - Update system message for sales context

4. **Update Knowledge Store** (if using RAG):
   - Change: `fileSearchStores/donna-kitchen-knowledge`
   - To: `fileSearchStores/sales-knowledge` (or create new store)

5. **Update Memory Session Key** (if needed):
   - Keep per-phone isolation: `={{ $('WAHA Trigger').item.json.payload.from }}`

6. **Update Agent Name in Responses**:
   - Change "Donna" to new agent name in system prompt

7. **Test New Agent**:
   - Send test message
   - Verify routing works
   - Check responses

---

## 🎯 **USE CASES**

### **Use Case 1: Customer Support Agent**

**Purpose**: Handle customer support inquiries

**Configuration**:
- **System Prompt**: "You are a helpful customer support agent for Rensto..."
- **Knowledge Base**: FAQ, troubleshooting guides
- **Routing**: Phone numbers from support tickets

**Features**:
- Ticket creation
- Escalation to human
- Knowledge base search

---

### **Use Case 2: Sales Qualification Agent**

**Purpose**: Qualify leads and schedule consultations

**Configuration**:
- **System Prompt**: "You are a sales qualification agent..."
- **Knowledge Base**: Service offerings, pricing
- **Routing**: New website inquiries

**Features**:
- Lead qualification questions
- Service recommendation
- Calendar scheduling
- Handoff to sales team

---

### **Use Case 3: Website Chatbot**

**Purpose**: Answer general website questions

**Configuration**:
- **System Prompt**: "You are a friendly chatbot for Rensto's website..."
- **Knowledge Base**: Website content, service descriptions
- **Routing**: Default for unknown phone numbers

**Features**:
- FAQ responses
- Service information
- Lead capture
- Handoff to sales/support

---

### **Use Case 4: n8n Workflow Trigger**

**Purpose**: Trigger any n8n workflow via WhatsApp

**Configuration**:
- **No AI Agent**: Just message routing
- **Workflow**: Calls target workflow with message data

**Features**:
- Generic message forwarding
- Data extraction
- Workflow triggering
- Confirmation responses

---

## 📝 **NEXT STEPS**

1. ✅ **Test Current Workflow**: Verify Donna AI is working
2. ⏳ **Create Router Workflow**: Build `INT-WHATSAPP-ROUTER-001`
3. ⏳ **Create Agent Database**: Set up Airtable/Boost.space table
4. ⏳ **Duplicate First Agent**: Create Sales Agent as example
5. ⏳ **Add Website Widget**: Integrate WhatsApp widget on website
6. ⏳ **Document Duplication Process**: Create step-by-step guide

---

## 🔗 **REFERENCES**

- **Base Workflow**: `http://173.254.201.134:5678/workflow/86WHKNpj09tV9j1d`
- **WAHA Dashboard**: `http://173.254.201.134:3000/dashboard`
- **n8n Executions**: `http://173.254.201.134:5678/executions`
- **Donna AI Docs**: `dima/DONNA_AI_*` files

---

**Last Updated**: November 16, 2025  
**Status**: 📋 Architecture Plan - Ready for Implementation

