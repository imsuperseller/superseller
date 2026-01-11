# WhatsApp Workflow Test & Duplication Plan

**Date**: November 16, 2025  
**Workflow**: `CUSTOMER-WHATSAPP-001: Donna AI - Main Agent` (ID: `86WHKNpj09tV9j1d`)  
**Status**: ⚠️ **NEEDS FIX** - Then ready for duplication

---

## 🔍 **CURRENT STATUS**

### **✅ What's Working**:
- ✅ Workflow is ACTIVE
- ✅ WAHA Trigger receives messages
- ✅ Text messages are processed
- ✅ AI Agent generates responses
- ✅ Response is sent back via WhatsApp

### **❌ What's Broken**:
- ❌ "Download Voice Audio1" node executes for text messages
- ❌ Error: `Invalid URL: . URL must start with "http" or "https".`
- ❌ Workflow shows "error" status even though response is sent

**Impact**: Workflow works but shows error status. Response is still sent successfully.

---

## 🔧 **FIX REQUIRED**

### **Quick Fix** (5 minutes):

1. **Open Workflow**: `http://172.245.56.50:5678/workflow/86WHKNpj09tV9j1d`

2. **Add IF Node Before "Download Voice Audio1"**:
   - **Name**: "Check Voice URL"
   - **Type**: IF
   - **Condition**: 
     ```javascript
     {{ $json.voice_url && $json.voice_url.trim() !== '' && $json.voice_url.startsWith('http') }}
     ```
   - **True Path**: → Download Voice Audio1
   - **False Path**: → Skip (or connect to Prepare Question Text1)

3. **Update Connections**:
   - "Route by Message Type" (True) → "Check Voice URL"
   - "Check Voice URL" (True) → "Download Voice Audio1"
   - "Check Voice URL" (False) → Skip (or merge with text path)

4. **Alternative**: Enable "Continue on Fail" on "Download Voice Audio1" node (quick workaround)

---

## ✅ **TEST WORKFLOW**

### **Test 1: Text Message**

1. **Send WhatsApp message** to: `+1 214-436-2102`
2. **Message**: `"Hello Donna, what are the best materials for kitchen cabinets?"`
3. **Expected**:
   - ✅ Workflow executes without errors
   - ✅ Response received in WhatsApp
   - ✅ Execution shows "success" status

4. **Check Execution**:
   - Go to: `http://172.245.56.50:5678/executions?workflowId=86WHKNpj09tV9j1d`
   - Latest execution should show "success"

---

### **Test 2: Voice Message** (After Fix)

1. **Send WhatsApp voice message** to: `+1 214-436-2102`
2. **Expected**:
   - ✅ Voice is transcribed
   - ✅ AI processes question
   - ✅ Response sent back
   - ✅ Execution shows "success"

---

## 🚀 **AFTER FIX: DUPLICATION PLAN**

### **Phase 1: Fix Current Workflow** ✅ **DO FIRST**

1. Fix "Download Voice Audio1" error
2. Test with text message
3. Test with voice message
4. Verify all executions show "success"

---

### **Phase 2: Create Router Workflow**

**Workflow**: `INT-WHATSAPP-ROUTER-001`

**Purpose**: Route messages to correct agent based on phone number or keywords

**Structure**:
```
WAHA Trigger
    ↓
Extract Phone Number
    ↓
Lookup Agent (Airtable/Boost.space)
    ↓
Switch Node (Route to Agent)
    ├─→ CUSTOMER-WHATSAPP-001 (Donna AI)
    ├─→ CUSTOMER-WHATSAPP-002 (Sales Agent)
    ├─→ INT-WHATSAPP-WEBSITE-001 (Website Chatbot)
    └─→ Default (Website Chatbot)
```

**See**: `docs/workflows/WHATSAPP_MULTI_AGENT_ARCHITECTURE.md` for full details

---

### **Phase 3: Duplicate Base Workflow**

**Template**: `CUSTOMER-WHATSAPP-001: Donna AI`

**Steps**:
1. Duplicate workflow in n8n UI
2. Update workflow name
3. Update system prompt
4. Update knowledge store (if using RAG)
5. Test new agent

**See**: `docs/workflows/WHATSAPP_AGENT_DUPLICATION_GUIDE.md` for step-by-step

---

### **Phase 4: Create Agent Types**

**1. Sales Agent** (`CUSTOMER-WHATSAPP-002`):
- Purpose: Qualify leads, recommend services
- System prompt: Sales-focused
- Knowledge base: Service descriptions, pricing

**2. Support Agent** (`INT-WHATSAPP-SUPPORT-001`):
- Purpose: Customer support, troubleshooting
- System prompt: Support-focused
- Knowledge base: FAQ, troubleshooting guides

**3. Website Chatbot** (`INT-WHATSAPP-WEBSITE-001`):
- Purpose: Public-facing website chatbot
- System prompt: General inquiries, lead qualification
- Knowledge base: Website content, service info

**4. Generic Workflow Trigger** (`INT-WHATSAPP-N8N-001`):
- Purpose: Trigger any n8n workflow via WhatsApp
- No AI agent needed
- Just message routing to other workflows

---

### **Phase 5: Website Integration**

**Add WhatsApp Widget to Website**:

**Component**: `apps/web/rensto-site/src/components/WhatsAppWidget.tsx`

**Code**:
```tsx
export const WhatsAppWidget = () => {
  const phoneNumber = "+12144362102";
  const message = encodeURIComponent("Hello! I'm interested in Rensto's services.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
  
  return (
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
      <button className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full">
        💬 Chat on WhatsApp
      </button>
    </a>
  );
};
```

**Usage**: Add to homepage, service pages, niche pages

---

## 📊 **AGENT CONFIGURATION**

### **Create Agent Database** (Airtable/Boost.space)

**Table**: `WhatsApp Agents`

| Field | Type | Description |
|-------|------|-------------|
| agent_id | Text | Unique ID |
| workflow_id | Text | n8n workflow ID |
| agent_name | Text | Display name |
| purpose | Text | Purpose description |
| system_prompt | Long Text | AI system prompt |
| knowledge_store | Text | Gemini File Search store |
| phone_numbers | Multiple Selects | Authorized phones |
| is_active | Checkbox | Active status |

---

## 🎯 **NEXT STEPS**

1. ⏳ **Fix Current Workflow**: Add IF node before "Download Voice Audio1"
2. ⏳ **Test Workflow**: Send test message, verify success
3. ⏳ **Create Router**: Build `INT-WHATSAPP-ROUTER-001`
4. ⏳ **Duplicate First Agent**: Create Sales Agent as example
5. ⏳ **Add Website Widget**: Integrate WhatsApp on website
6. ⏳ **Document Process**: Create duplication templates

---

## 🔗 **REFERENCES**

- **Workflow**: `http://172.245.56.50:5678/workflow/86WHKNpj09tV9j1d`
- **Multi-Agent Architecture**: `docs/workflows/WHATSAPP_MULTI_AGENT_ARCHITECTURE.md`
- **Duplication Guide**: `docs/workflows/WHATSAPP_AGENT_DUPLICATION_GUIDE.md`
- **Fix Guide**: `docs/workflows/WHATSAPP_WORKFLOW_FIX.md`
- **WAHA Dashboard**: `http://172.245.56.50:3000/dashboard`

---

**Last Updated**: November 16, 2025  
**Status**: ⚠️ **FIX NEEDED** - Then ready for duplication

