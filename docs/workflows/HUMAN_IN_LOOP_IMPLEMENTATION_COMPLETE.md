# ✅ Human-in-the-Loop Workflow - Implementation Complete

**Date**: November 17, 2025  
**Status**: ✅ **WORKFLOWS CREATED** - Needs Airtable Table & Configuration

---

## 🎯 **WORKFLOWS CREATED**

### **1. CUSTOMER-WHATSAPP-002A: Question Handler**

**Workflow ID**: `0Cyp9kWJ0oUPNx2L`  
**URL**: `http://173.254.201.134:5678/workflow/0Cyp9kWJ0oUPNx2L`  
**Status**: ✅ **CREATED** - Needs Airtable table

**Purpose**: Receives low-confidence questions, saves to Airtable, sends WhatsApp to Liza

**Flow**:
```
Webhook Trigger (POST /human-in-loop-question)
    ↓
Save to Airtable (unanswered_questions table)
    ↓
Extract Record ID
    ↓
Format Message for Liza (Hebrew)
    ↓
Send WhatsApp to Liza
    ↓
Webhook Response (200 OK)
```

**Webhook URL**: `http://173.254.201.134:5678/webhook/human-in-loop-question`

**Input Format**:
```json
{
  "question": "מה המידות הסטנדרטיות?",
  "designer_phone": "972528353052@c.us",
  "designer_name": "Designer Name",
  "confidence_score": 65,
  "original_message_id": "message_id"
}
```

---

### **2. CUSTOMER-WHATSAPP-002B: Answer Handler**

**Workflow ID**: `DNzlEU1vs7aqrlBg`  
**URL**: `http://173.254.201.134:5678/workflow/DNzlEU1vs7aqrlBg`  
**Status**: ✅ **CREATED**

**Purpose**: Listens for Liza's WhatsApp responses, processes answers, updates knowledge base

**Flow**:
```
WAHA Trigger (all messages)
    ↓
Filter Liza Messages (from 972528353052@c.us)
    ↓
Extract Message Text
    ↓
Query Airtable for Pending (List Records)
    ↓
Find Pending Question (Process results)
    ↓
Check If Response (has pending question?)
    ↓
Extract Answer (clean up message)
    ↓
Update Airtable (link answer to question)
    ↓
Upload to Knowledge Base (Gemini File Search)
    ↓
Send Answer to Designer
```

---

## 📋 **NEXT STEPS**

### **Step 1: Setup Boost.space Category** ⚠️ **REQUIRED**

**Space**: 27 (General/Business)  
**Module**: Notes  
**Category**: "Unanswered Questions"

**Action**: Create category in Boost.space UI if it doesn't exist

**Fields to Create**:
1. `question` (Single line text) - The original question
2. `designer_phone` (Phone) - Designer's WhatsApp number
3. `designer_name` (Single line text) - Designer's name
4. `confidence_score` (Number) - Confidence score (0-100)
5. `status` (Single select) - Options: `pending`, `answered`, `archived`
6. `timestamp` (Date & time) - When question was asked
7. `liza_response` (Long text) - Liza's answer (nullable)
8. `liza_response_timestamp` (Date & time) - When Liza responded (nullable)
9. `original_message_id` (Single line text) - Original WhatsApp message ID

**Note**: Airtable API is currently rate-limited. Create table manually in Airtable UI.

---

### **Step 2: Configure Liza's Phone Number** ⚠️ **REQUIRED**

**Current**: `972528353052@c.us` (Novo's number - placeholder)

**Action**: Update `Format Message for Liza` node in workflow `0Cyp9kWJ0oUPNx2L` with actual Liza's phone number.

**Location**: `http://173.254.201.134:5678/workflow/0Cyp9kWJ0oUPNx2L`

---

### **Step 3: Add Confidence Check to Main Workflow** ⚠️ **REQUIRED**

**Workflow**: `CUSTOMER-WHATSAPP-001: Liza AI - Kitchen Design Assistant` (ID: `86WHKNpj09tV9j1d`)

**Action**: Add confidence check node after RAG search, route low-confidence questions to Human-in-Loop workflow.

**Location**: After "Liza AI Agent" node, before "Extract Response Text1"

**Logic**:
```javascript
// Extract confidence from RAG search
// If confidence < 80%, call Human-in-Loop workflow
// If confidence >= 80%, continue to response
```

---

### **Step 4: Implement Gemini File Upload** ⚠️ **TODO**

**Current**: `Upload to Knowledge Base` node has placeholder code

**Action**: Implement actual Gemini File Search Store upload API call

**Reference**: Gemini File Search API documentation

---

## 🔧 **WORKFLOW CONFIGURATION**

### **Webhook Endpoint**

**URL**: `http://173.254.201.134:5678/webhook/human-in-loop-question`  
**Method**: POST  
**Content-Type**: application/json

**Example Call** (from main workflow):
```javascript
// In CUSTOMER-WHATSAPP-001, after confidence check
if (confidence < 80) {
  await this.helpers.httpRequest({
    method: 'POST',
    url: 'http://173.254.201.134:5678/webhook/human-in-loop-question',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question: question,
      designer_phone: designerPhone,
      designer_name: designerName,
      confidence_score: confidence,
      original_message_id: originalMessageId
    })
  });
}
```

---

## 📊 **TESTING CHECKLIST**

### **Test Workflow 002A (Question Handler)**:

1. ✅ **Activate workflow**: `http://173.254.201.134:5678/workflow/0Cyp9kWJ0oUPNx2L`
2. ✅ **Get webhook URL**: From Webhook Trigger node
3. ✅ **Send test POST request**:
   ```bash
   curl -X POST http://173.254.201.134:5678/webhook/human-in-loop-question \
     -H "Content-Type: application/json" \
     -d '{
       "question": "מה המידות הסטנדרטיות?",
       "designer_phone": "972528353052@c.us",
       "designer_name": "Test Designer",
       "confidence_score": 65,
       "original_message_id": "test123"
     }'
   ```
4. ✅ **Verify**: 
   - Record created in Airtable
   - WhatsApp message sent to Liza

### **Test Workflow 002B (Answer Handler)**:

1. ✅ **Activate workflow**: `http://173.254.201.134:5678/workflow/[ID]`
2. ✅ **Send WhatsApp message from Liza's phone** (`972528353052@c.us`)
3. ✅ **Verify**:
   - Message filtered correctly
   - Pending question found in Boost.space
   - Answer extracted
   - Boost.space note updated
   - Answer sent to designer

---

## 🎯 **INTEGRATION WITH MAIN WORKFLOW**

### **Add Confidence Check to CUSTOMER-WHATSAPP-001**

**Location**: After "Liza AI Agent" node

**New Node**: "Check Confidence"

**Type**: `n8n-nodes-base.code`

**Code**:
```javascript
// Extract confidence from RAG search response
// Check if Search Documents Tool found results
const ragResponse = $('Search Documents Tool').item.json.output || '';
const hasResults = ragResponse && 
                   ragResponse !== 'לא מצאתי מידע במאגר הידע על הנושא הזה.' &&
                   ragResponse.length > 50;

// Calculate confidence (simplified)
// If RAG found results: 90%, else: 50%
const confidence = hasResults ? 90 : 50;

const question = $('Prepare Question Text').item.json.question || '';
const designerPhone = $('Prepare Question Text').item.json.designer_phone || '';
const designerName = 'Designer'; // TODO: Get from Airtable
const originalMessageId = $('Prepare Question Text').item.json.original_message_id || '';

return {
  json: {
    confidence: confidence,
    route_to_human: confidence < 80,
    question: question,
    designer_phone: designerPhone,
    designer_name: designerName,
    confidence_score: confidence,
    original_message_id: originalMessageId
  }
};
```

**Next Node**: IF node - Route based on `route_to_human`
- If `true` → Call Human-in-Loop workflow (HTTP Request)
- If `false` → Continue to "Extract Response Text1"

---

## 📝 **NOTES**

1. **Boost.space**: Using Notes module (Space 27) instead of Airtable - no rate limits!
2. **Liza's Phone**: Currently using Novo's number as placeholder. Update when Liza's number is known.
3. **Gemini Upload**: File upload not yet implemented. Manual upload required for now.
4. **Matching Logic**: Answer Handler matches by most recent pending question. Could be improved with question ID in message.

---

**Last Updated**: November 17, 2025  
**Status**: ✅ **WORKFLOW 002A MIGRATED TO BOOST.SPACE** - Workflow 002B needs manual update (see HUMAN_IN_LOOP_BOOST_SPACE_UPDATE_COMPLETE.md)

