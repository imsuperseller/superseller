# ✅ WhatsApp Router Workflow - Implementation Guide

**Date**: November 17, 2025  
**Workflow ID**: `nZJJZvWl0MBe3uT4`  
**Status**: ✅ **CREATED** - Needs Configuration

---

## 🎯 **ARCHITECTURE CLARIFICATION**

### **How It Works**:

**ONE WhatsApp Number, ONE Session, Router Routes Messages**

```
WhatsApp Number: +1 214-436-2102 (Rensto's number)
    ↓
WAHA Session: "default" (single session)
    ↓
Router Workflow: INT-WHATSAPP-ROUTER-001
    ↓
Routes based on SENDER's phone number:
    ├─→ Dima (14695885133@c.us) → Donna AI workflow
    └─→ Everyone else → Rensto Support workflow
```

---

## ✅ **CUSTOMER ONBOARDING PROCESS**

### **For Customers (Like Dima)**:

1. **Customer provides their WhatsApp phone number**
   - Example: Dima provides `+1 469-588-5133`
   - Format in system: `14695885133@c.us`

2. **Add to Router's phone mapping**:
   - Update "Lookup Agent" node in router workflow
   - Add: `'14695885133@c.us': 'donna-ai'`

3. **Customer messages Rensto's number**: `+1 214-436-2102`
   - **No QR code needed for customer**
   - **No special setup needed**
   - Customer just sends a normal WhatsApp message

4. **Router automatically routes** to correct agent

---

## 📋 **ROUTER WORKFLOW STRUCTURE**

**Workflow**: `INT-WHATSAPP-ROUTER-001` (ID: `nZJJZvWl0MBe3uT4`)

**Nodes**:
1. **WAHA Trigger** (session: `default`)
   - Receives ALL messages to `+1 214-436-2102`

2. **Filter Message Events**
   - Only processes `event === "message"`

3. **Extract Phone Number**
   - Gets sender's phone: `$json.payload.from`
   - Extracts message text, type, voice URL

4. **Lookup Agent**
   - Maps phone number to agent ID
   - Current mapping:
     - `14695885133@c.us` → `donna-ai`
     - All others → `rensto-support`

5. **Route to Agent** (Switch Node)
   - Routes to correct agent workflow

6. **Call Donna AI** / **Call Rensto Support**
   - Execute Workflow nodes
   - Pass message data to agent workflows

---

## ⚠️ **CRITICAL ISSUE: Agent Workflows Need Modification**

**Problem**: Agent workflows (`86WHKNpj09tV9j1d` and `eQSCUFw91oXLxtvn`) have WAHA Triggers, but when called as sub-workflows, they need to accept data from the router instead.

**Solution Options**:

### **Option 1: Modify Agent Workflows** (Recommended)

**Add Manual Trigger** to agent workflows:
- Keep WAHA Trigger (for direct access if needed)
- Add Manual Trigger (for router calls)
- Add IF node to detect source:
  - If from WAHA Trigger → Use WAHA data
  - If from Manual Trigger → Use router data

### **Option 2: Pass Data in WAHA Format**

**Modify Router** to pass data in exact WAHA format:
- Format data to match WAHA Trigger output
- Agent workflows won't need changes

### **Option 3: Create Router-Compatible Versions**

**Duplicate agent workflows**:
- Keep originals with WAHA Triggers
- Create router-compatible versions (Manual Trigger entry)
- Router calls router-compatible versions

---

## 🔧 **IMMEDIATE NEXT STEPS**

### **Step 1: Update Router Phone Mapping**

**Edit "Lookup Agent" node** in router workflow:
- Add Dima's phone: `'14695885133@c.us': 'donna-ai'`
- Add any other customer phones

### **Step 2: Fix Agent Workflow Compatibility**

**Option A: Add Manual Trigger to Agent Workflows**

1. **Donna AI Workflow** (`86WHKNpj09tV9j1d`):
   - Add Manual Trigger node
   - Add IF node: Check if data from WAHA or Manual
   - Route accordingly

2. **Rensto Support Workflow** (`eQSCUFw91oXLxtvn`):
   - Same as above

**Option B: Modify Router to Pass WAHA-Formatted Data**

1. **Update "Call Donna AI" node**:
   - Format data to match WAHA Trigger output structure
   - Pass `payload`, `event`, etc. in correct format

2. **Update "Call Rensto Support" node**:
   - Same as above

---

## 📋 **ROUTING TABLE** (Current)

| Phone Number | Agent ID | Workflow ID | Agent Name |
|--------------|----------|-------------|------------|
| `14695885133@c.us` | `donna-ai` | `86WHKNpj09tV9j1d` | Donna AI |
| `*` (default) | `rensto-support` | `eQSCUFw91oXLxtvn` | Rensto Support |

---

## 🎯 **ADDING NEW CUSTOMERS**

**When a new customer wants WhatsApp automation**:

1. **Get customer's WhatsApp phone number**
   - Example: `+1 555-123-4567`
   - Format: `15551234567@c.us`

2. **Update Router's "Lookup Agent" node**:
   ```javascript
   const phoneToAgent = {
     '14695885133@c.us': 'donna-ai', // Dima
     '15551234567@c.us': 'customer-agent-id', // New customer
     // ...
   };
   ```

3. **Create customer's agent workflow** (if needed):
   - Duplicate base workflow
   - Customize for customer
   - Get workflow ID

4. **Add to agentWorkflows mapping**:
   ```javascript
   const agentWorkflows = {
     'donna-ai': '86WHKNpj09tV9j1d',
     'customer-agent-id': 'new-workflow-id',
     // ...
   };
   ```

5. **Tell customer**:
   - "Message us at `+1 214-436-2102` and our AI agent will help you!"
   - No QR code needed
   - No special setup needed

---

## ✅ **BENEFITS**

1. **One WhatsApp number** - Easy to share, one point of contact
2. **Automatic routing** - No manual intervention
3. **Scalable** - Add customers by updating router mapping
4. **No QR codes for customers** - They just message normally
5. **Cost effective** - One WhatsApp number, one WAHA session

---

## 🧪 **TESTING**

**Test Dima's routing**:
1. Send message from Dima's phone to `+1 214-436-2102`
2. Router should route to Donna AI workflow
3. Verify Donna AI responds

**Test default routing**:
1. Send message from unknown phone to `+1 214-436-2102`
2. Router should route to Rensto Support workflow
3. Verify Rensto Support responds

---

**Last Updated**: November 17, 2025  
**Status**: ✅ **ROUTER CREATED** - Needs Agent Workflow Compatibility Fix

