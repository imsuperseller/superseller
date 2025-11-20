# 🚨 WhatsApp Routing Issue - Current Problem & Solution

**Date**: November 17, 2025  
**Issue**: Both sessions connected to same number - no routing logic  
**Status**: ⚠️ **ROUTING CONFLICT** - Needs Router Workflow

---

## 🚨 **THE PROBLEM**

**Current Setup**:
- **WhatsApp Number**: `+1 214-436-2102` (`12144362102@c.us`)
- **Session 1**: `default` → Workflow `86WHKNpj09tV9j1d` (Donna AI - Dima)
- **Session 2**: `rensto-support` → Workflow `eQSCUFw91oXLxtvn` (Rensto Support)

**What Happens When Someone Messages `+1 214-436-2102`**:

### **Scenario 1: Both Workflows Trigger** (Most Likely)
- WAHA receives message
- WAHA sends webhook to **BOTH** workflows (if both webhooks registered)
- **Result**: User gets **TWO responses** (one from Donna AI, one from Rensto Support)
- **Problem**: Confusing, unprofessional, duplicate responses

### **Scenario 2: Last Registered Wins**
- WAHA receives message
- WAHA sends webhook to **last registered** workflow
- **Result**: User gets response from only one agent (randomly)
- **Problem**: Wrong agent might respond (Donna AI answers Rensto questions, or vice versa)

### **Scenario 3: First Active Workflow Wins**
- WAHA receives message
- WAHA sends webhook to **first active** workflow
- **Result**: Always goes to same workflow (usually Donna AI)
- **Problem**: Rensto Support never gets messages

---

## ❌ **CURRENT BEHAVIOR**

**If someone sends a message to `+1 214-436-2102`**:

1. **Message arrives** at WAHA
2. **WAHA sends webhook** to registered workflows
3. **Both workflows trigger** (or one wins randomly)
4. **User gets confused** (wrong agent or duplicate responses)

**No routing logic exists** - messages go to whichever workflow is listening!

---

## ✅ **THE SOLUTION: Router Workflow**

### **Architecture**:

```
WhatsApp Message → +1 214-436-2102
    ↓
WAHA Session: "default" (single session)
    ↓
Router Workflow: INT-WHATSAPP-ROUTER-001
    ↓
    ├─→ Check Phone Number
    ├─→ Lookup Agent (Airtable/Boost.space)
    ├─→ Route to Correct Agent:
    │   ├─→ Dima's Number → Donna AI (86WHKNpj09tV9j1d)
    │   ├─→ Known Rensto Customer → Rensto Support (eQSCUFw91oXLxtvn)
    │   └─→ Unknown Number → Default Agent (Website Chatbot)
    └─→ Send Response
```

---

## 🔧 **IMPLEMENTATION PLAN**

### **Step 1: Create Router Workflow**

**Workflow**: `INT-WHATSAPP-ROUTER-001`

**Nodes**:
1. **WAHA Trigger** (session: `default`)
   - Receives ALL messages to `+1 214-436-2102`
   - Single point of entry

2. **Extract Phone Number**
   - Get sender's phone: `$json.payload.from`
   - Normalize format: `+12144362102` → `+1 214-436-2102`

3. **Lookup Agent** (Airtable/Boost.space)
   - Query: "WhatsApp Agent Routing" table
   - Match phone number to agent
   - Return: `workflow_id`, `agent_name`, `session`

4. **Switch Node** (Route by Agent)
   - Case 1: `donna-ai` → Call Sub-Workflow `86WHKNpj09tV9j1d`
   - Case 2: `rensto-support` → Call Sub-Workflow `eQSCUFw91oXLxtvn`
   - Case 3: `default` → Call Sub-Workflow `INT-WHATSAPP-WEBSITE-001`
   - Default: Fallback to Rensto Support

5. **Sub-Workflow Nodes**
   - Call specific agent workflow
   - Pass message data
   - Return response

---

### **Step 2: Create Agent Routing Table**

**Location**: Airtable or Boost.space

**Table**: `WhatsApp Agent Routing`

| Phone Number | Agent ID | Workflow ID | Agent Name | Purpose | Active |
|--------------|----------|-------------|------------|---------|--------|
| +12144362102 (Dima) | donna-ai | 86WHKNpj09tV9j1d | Donna AI | Kitchen Design | ✅ |
| +1234567890 (Example) | rensto-support | eQSCUFw91oXLxtvn | Rensto Support | General Support | ✅ |
| * (Default) | website-chatbot | INT-WHATSAPP-WEBSITE-001 | Website Chatbot | General Inquiries | ✅ |

---

### **Step 3: Update Existing Workflows**

**Donna AI Workflow** (`86WHKNpj09tV9j1d`):
- **Remove**: WAHA Trigger node (router handles this)
- **Add**: Sub-Workflow Trigger (called by router)
- **Keep**: All other nodes (AI agent, RAG, TTS, etc.)

**Rensto Support Workflow** (`eQSCUFw91oXLxtvn`):
- **Remove**: WAHA Trigger node (router handles this)
- **Add**: Sub-Workflow Trigger (called by router)
- **Keep**: All other nodes (AI agent, RAG, TTS, etc.)

---

### **Step 4: Create Default Agent** (Website Chatbot)

**Workflow**: `INT-WHATSAPP-WEBSITE-001`

**Purpose**: Handle unknown phone numbers (general website inquiries)

**Features**:
- FAQ responses
- Service information
- Lead qualification
- Handoff to sales/support

---

## 📋 **ROUTING LOGIC**

### **Phone Number Matching**:

1. **Exact Match**: 
   - Phone number in routing table → Route to specific agent
   - Example: Dima's number → Donna AI

2. **Pattern Match**:
   - Country code + area code → Route to regional agent
   - Example: `+1 214-*` → Rensto Support (Dallas area)

3. **Default**:
   - Unknown number → Website Chatbot
   - First-time visitors → General FAQ

---

## 🎯 **IMMEDIATE FIX** (Quick Solution)

**Until Router is Built**:

### **Option 1: Use Only One Session** (Temporary)

1. **Deactivate** one workflow (e.g., Rensto Support)
2. **Use only** `default` session for Donna AI
3. **Create separate** WhatsApp number for Rensto Support

**Pros**: No conflicts  
**Cons**: Need second WhatsApp number

---

### **Option 2: Keyword-Based Routing** (Quick Fix)

**Modify Donna AI Workflow**:
- Add IF node after WAHA Trigger
- Check message for keywords: "donna", "kitchen", "liza"
- If keywords found → Continue to Donna AI
- If no keywords → Route to Rensto Support (or skip)

**Pros**: Quick to implement  
**Cons**: Not perfect, might miss some messages

---

### **Option 3: Phone Number Check** (Better Quick Fix)

**Modify Both Workflows**:
- Add IF node after WAHA Trigger
- Check sender's phone number
- If Dima's number → Continue
- If not Dima's number → Skip/Route to other workflow

**Pros**: More accurate  
**Cons**: Need to maintain phone number list in each workflow

---

## ✅ **RECOMMENDED APPROACH**

**Short Term** (Today):
1. ✅ Use **Option 3**: Add phone number check in both workflows
2. ✅ Dima's number → Donna AI workflow
3. ✅ All other numbers → Rensto Support workflow

**Long Term** (This Week):
1. ⏳ Create Router Workflow (`INT-WHATSAPP-ROUTER-001`)
2. ⏳ Create Agent Routing Table (Airtable/Boost.space)
3. ⏳ Convert workflows to Sub-Workflows
4. ⏳ Test routing logic
5. ⏳ Create Default Agent (Website Chatbot)

---

## 🧪 **TESTING**

**Test Cases**:

1. **Dima sends message**:
   - Expected: Routes to Donna AI
   - Verify: Response mentions kitchen design

2. **Unknown number sends message**:
   - Expected: Routes to Rensto Support (or Website Chatbot)
   - Verify: Response mentions Rensto services

3. **Both workflows active**:
   - Expected: Only one responds (based on routing)
   - Verify: No duplicate responses

---

**Last Updated**: November 17, 2025  
**Status**: ⚠️ **ROUTING CONFLICT** - Router Workflow Needed

