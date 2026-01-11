# 🧪 WhatsApp Workflows - Test Plan

**Date**: November 17, 2025  
**Purpose**: Test all 4 WhatsApp workflows to ensure they're working correctly  
**Status**: 🔄 **TESTING IN PROGRESS**

---

## 📋 **WORKFLOWS TO TEST**

### **1. CUSTOMER-WHATSAPP-001: Liza AI - Kitchen Design Assistant**
- **ID**: `86WHKNpj09tV9j1d`
- **Status**: ✅ Active
- **Phone Filter**: `972528353052@c.us`, `14695885133@c.us`
- **Features**: Text + Voice, RAG, Emoji rules

### **2. INT-WHATSAPP-SUPPORT-001: Rensto Support Agent**
- **ID**: `eQSCUFw91oXLxtvn`
- **Status**: ✅ Active
- **Phone Filter**: `14695885133@c.us` only
- **Features**: Text + Voice, RAG

### **3. INT-WHATSAPP-ROUTER-001: WhatsApp Message Router**
- **ID**: `nZJJZvWl0MBe3uT4`
- **Status**: ❌ Inactive
- **Purpose**: Routes messages to Liza AI or Rensto Support
- **Phone Mapping**: `972528353052@c.us` → Liza AI, others → Rensto Support

### **4. INT-WHATSAPP-001: Voice WhatsApp Agent v1**
- **ID**: `3OukCjHVvBXiXr6u`
- **Status**: ✅ Active
- **Purpose**: Voice-only agent
- **Features**: Voice messages only

---

## 🧪 **TEST SCENARIOS**

### **Test 1: Liza AI Workflow** (Direct)

**Test Cases**:
1. ✅ **Text Message from Dima** (`972528353052@c.us`)
   - Message: "הי"
   - Expected: Natural greeting, no emoji (unless first message)
   - Expected: No search_documents call

2. ✅ **Text Message from Rensto** (`14695885133@c.us`)
   - Message: "מה המידות הסטנדרטיות?"
   - Expected: Calls search_documents, responds with answer
   - Expected: No emojis (technical question)

3. ✅ **Voice Message from Dima**
   - Voice: "איפה הסניף בירושלים?"
   - Expected: Transcribes, calls search_documents, responds
   - Expected: Can use 📍 emoji (showroom location)

4. ❌ **Text Message from Unknown Number**
   - Message: "Hello"
   - Expected: Should be filtered out (not in allowed phones)

---

### **Test 2: Rensto Support Workflow** (Direct)

**Test Cases**:
1. ✅ **Text Message from Rensto** (`14695885133@c.us`)
   - Message: "What is the Marketplace?"
   - Expected: Calls search_documents, responds with answer

2. ✅ **Voice Message from Rensto**
   - Voice: "Tell me about subscriptions"
   - Expected: Transcribes, calls search_documents, responds

3. ❌ **Text Message from Dima** (`972528353052@c.us`)
   - Message: "Hello"
   - Expected: Should be filtered out (not Rensto's number)

---

### **Test 3: Router Workflow** (If Activated)

**Test Cases**:
1. ⚠️ **Text Message from Dima** (`972528353052@c.us`)
   - Expected: Routes to Liza AI workflow
   - Note: Router is currently INACTIVE

2. ⚠️ **Text Message from Rensto** (`14695885133@c.us`)
   - Expected: Routes to Rensto Support workflow
   - Note: Router is currently INACTIVE

3. ⚠️ **Text Message from Unknown Number**
   - Expected: Routes to Rensto Support (default)

---

### **Test 4: Voice-Only Workflow**

**Test Cases**:
1. ✅ **Voice Message** (any number)
   - Expected: Transcribes, AI responds, sends voice back

2. ❌ **Text Message** (any number)
   - Expected: Should be filtered out (voice-only workflow)

---

## 🔍 **VALIDATION CHECKLIST**

### **For Each Workflow**:

- [ ] Workflow is active (or inactive as intended)
- [ ] Phone filters are correct
- [ ] Routing logic works (if applicable)
- [ ] Text messages process correctly
- [ ] Voice messages transcribe correctly
- [ ] AI agent responds appropriately
- [ ] Response is sent back via WhatsApp
- [ ] No errors in execution logs
- [ ] Emoji rules followed (for Liza AI)

---

## 📊 **TEST RESULTS**

### **Workflow 1: Liza AI** (`86WHKNpj09tV9j1d`)
- **Status**: ✅ Active
- **Last Test**: Pending
- **Results**: TBD

### **Workflow 2: Rensto Support** (`eQSCUFw91oXLxtvn`)
- **Status**: ✅ Active
- **Last Test**: Pending
- **Results**: TBD

### **Workflow 3: Router** (`nZJJZvWl0MBe3uT4`)
- **Status**: ❌ Inactive
- **Last Test**: Pending
- **Results**: TBD

### **Workflow 4: Voice-Only** (`3OukCjHVvBXiXr6u`)
- **Status**: ✅ Active
- **Last Test**: Pending
- **Results**: TBD

---

**Last Updated**: November 17, 2025  
**Status**: 🔄 **TESTING IN PROGRESS**

