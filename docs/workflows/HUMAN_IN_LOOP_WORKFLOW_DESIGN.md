# 🔄 Human-in-the-Loop Workflow Design

**Date**: November 17, 2025  
**Workflow**: `CUSTOMER-WHATSAPP-002: Human-in-the-Loop Handler`  
**Status**: 📋 **DESIGN PHASE**

---

## 🎯 **WORKFLOW PURPOSE**

Handle questions that Liza AI cannot answer with high confidence (<80%). Forward to senior staff (Liza), wait for response, update knowledge base, and send answer to original designer.

---

## 📋 **WORKFLOW FLOW**

### **Part 1: Receive Low-Confidence Question** (Triggered by Main Workflow)

```
Input from CUSTOMER-WHATSAPP-001:
{
  question: "מה המידות הסטנדרטיות?",
  designer_phone: "972528353052@c.us",
  designer_name: "Designer Name",
  confidence_score: 65,
  original_message_id: "message_id",
  timestamp: "2025-11-17T..."
}
    ↓
1. Save to Airtable (unanswered_questions table)
    ↓
2. Format WhatsApp Message for Liza
    ↓
3. Send WhatsApp to Liza (senior staff)
    ↓
4. Wait for Liza's Response (WAHA Trigger)
    ↓
5. Extract Answer from Liza's Message
    ↓
6. Update Airtable (link answer to question)
    ↓
7. Upload Answer to Gemini File Search Store
    ↓
8. Send Answer to Original Designer
```

---

## 🔧 **NODE STRUCTURE**

### **Node 1: Webhook Trigger** (Receives from Main Workflow)

**Type**: `n8n-nodes-base.webhook`  
**Purpose**: Receive low-confidence questions from `CUSTOMER-WHATSAPP-001`

**Input Format**:
```json
{
  "question": "מה המידות הסטנדרטיות?",
  "designer_phone": "972528353052@c.us",
  "designer_name": "Designer Name",
  "confidence_score": 65,
  "original_message_id": "message_id",
  "timestamp": "2025-11-17T..."
}
```

---

### **Node 2: Save to Airtable** (Unanswered Questions)

**Type**: `mcp_airtable-mcp_create_record`  
**Base**: `appQijHhqqP4z6wGe` (Rensto Client Operations)  
**Table**: `unanswered_questions` (to be created)

**Fields**:
- `question` (text)
- `designer_phone` (text)
- `designer_name` (text)
- `confidence_score` (number)
- `status` (single select: "pending")
- `timestamp` (date)
- `original_message_id` (text)

**Output**: Airtable record ID (for linking later)

---

### **Node 3: Format Message for Liza**

**Type**: `n8n-nodes-base.code`

**Purpose**: Format WhatsApp message to send to Liza

**Message Format** (Hebrew):
```
❓ שאלה חדשה שדורשת תשובה:

מעצבת: [Designer Name]
טלפון: [Designer Phone]
שאלה: [Question]

תשובה:
```

**Code**:
```javascript
const question = $input.item.json.question;
const designerName = $input.item.json.designer_name || 'לא צוין';
const designerPhone = $input.item.json.designer_phone || '';
const confidence = $input.item.json.confidence_score || 0;
const recordId = $input.item.json.airtable_record_id || '';

const message = `❓ שאלה חדשה שדורשת תשובה:

מעצבת: ${designerName}
טלפון: ${designerPhone}
שאלה: ${question}

רמת ביטחון: ${confidence}%

תשובה:`;

return {
  json: {
    message: message,
    liza_phone: '972528353052@c.us', // Liza's phone (Novo's number for now)
    question: question,
    designer_phone: designerPhone,
    designer_name: designerName,
    airtable_record_id: recordId,
    confidence_score: confidence
  }
};
```

---

### **Node 4: Send WhatsApp to Liza**

**Type**: `@devlikeapro/n8n-nodes-waha.WAHA`  
**Resource**: Chatting  
**Operation**: Send Text  
**Session**: `default`  
**ChatId**: `={{ $json.liza_phone }}`  
**Text**: `={{ $json.message }}`

---

### **Node 5: WAHA Trigger** (Wait for Liza's Response)

**Type**: `@devlikeapro/n8n-nodes-waha.wahaTrigger`  
**Session**: `default`  
**Purpose**: Listen for Liza's WhatsApp response

**Filter**: Only messages from Liza's phone (`972528353052@c.us`)

---

### **Node 6: Filter Liza's Response**

**Type**: `n8n-nodes-base.if`

**Conditions**:
1. Event is "message"
2. Sender is Liza's phone (`972528353052@c.us`)
3. Message is text (not voice)

---

### **Node 7: Extract Answer from Liza's Message**

**Type**: `n8n-nodes-base.code`

**Purpose**: Extract the answer text from Liza's message

**Logic**:
- Remove the question part (if Liza quoted it)
- Extract just the answer
- Clean up formatting

**Code**:
```javascript
const message = $input.item.json.payload?.body || $input.item.json.payload?.conversation || '';
const question = $('Format Message for Liza').first().json.question || '';

// Extract answer - remove question if quoted
let answer = message.trim();

// If message starts with question, remove it
if (answer.includes(question)) {
  answer = answer.replace(question, '').trim();
}

// Remove common prefixes
answer = answer
  .replace(/^תשובה:/i, '')
  .replace(/^תשובה/i, '')
  .replace(/^:/, '')
  .trim();

return {
  json: {
    answer: answer,
    original_question: question,
    designer_phone: $('Format Message for Liza').first().json.designer_phone,
    designer_name: $('Format Message for Liza').first().json.designer_name,
    airtable_record_id: $('Format Message for Liza').first().json.airtable_record_id,
    liza_response_timestamp: new Date().toISOString()
  }
};
```

---

### **Node 8: Update Airtable** (Link Answer to Question)

**Type**: `mcp_airtable-mcp_update_records`  
**Base**: `appQijHhqqP4z6wGe`  
**Table**: `unanswered_questions`

**Update**:
- `liza_response` (text) = answer
- `liza_response_timestamp` (date) = timestamp
- `status` (single select) = "answered"

---

### **Node 9: Upload Answer to Gemini File Search Store**

**Type**: `n8n-nodes-base.code` or HTTP Request

**Purpose**: Upload Liza's answer as a document to Gemini File Search Store

**Format**: Create a text document with:
- Question
- Answer
- Context (designer, date)

**Upload via Gemini API**:
```javascript
const STORE_ID = 'lizastore-acjmu8h7uknt';
const API_KEY = 'AIzaSyCiAYlFRy_21ZnBKRgLbLG52LD-dmqnK5Y';

const question = $input.item.json.original_question;
const answer = $input.item.json.answer;
const designerName = $input.item.json.designer_name;

// Create document content
const documentContent = `שאלה: ${question}

תשובה: ${answer}

מעצבת: ${designerName}
תאריך: ${new Date().toLocaleDateString('he-IL')}`;

// Upload to Gemini File Search Store
// (Implementation depends on Gemini API for file upload)
```

---

### **Node 10: Send Answer to Original Designer**

**Type**: `@devlikeapro/n8n-nodes-waha.WAHA`  
**Resource**: Chatting  
**Operation**: Send Text  
**Session**: `default`  
**ChatId**: `={{ $json.designer_phone }}`  
**Text**: `={{ "תשובה לשאלה שלך:\n\n" + $json.answer }}`

---

## 🔄 **ALTERNATIVE APPROACH: Two-Workflow System**

Since WAHA doesn't have `sendAndWait` like Slack, we need a different approach:

### **Workflow 1: CUSTOMER-WHATSAPP-002A** (Question Handler)
- Receives low-confidence question
- Saves to Airtable
- Sends WhatsApp to Liza
- **Ends here** (doesn't wait)

### **Workflow 2: CUSTOMER-WHATSAPP-002B** (Answer Handler)
- WAHA Trigger (listens for all messages)
- Filters: Only messages from Liza's phone
- Checks: Is this a reply to a pending question?
- If yes: Extract answer, update Airtable, upload to knowledge base, send to designer

**Matching Logic**: Use Airtable to find pending questions, match by timestamp or question content

---

## 📊 **AIRTABLE TABLE STRUCTURE**

### **Table: `unanswered_questions`**

**Base**: `appQijHhqqP4z6wGe` (Rensto Client Operations)

**Fields**:
| Field Name | Type | Description |
|------------|------|-------------|
| `question` | Single line text | The original question |
| `designer_phone` | Phone | Designer's WhatsApp number |
| `designer_name` | Single line text | Designer's name |
| `confidence_score` | Number | Confidence score (0-100) |
| `status` | Single select | pending / answered / archived |
| `timestamp` | Date & time | When question was asked |
| `liza_response` | Long text | Liza's answer (nullable) |
| `liza_response_timestamp` | Date & time | When Liza responded (nullable) |
| `original_message_id` | Single line text | Original WhatsApp message ID |
| `airtable_record_id` | Single line text | This record's ID (for linking) |

---

## 🎯 **RECOMMENDED APPROACH**

**Use Two-Workflow System**:

1. **CUSTOMER-WHATSAPP-002A**: Question Handler (webhook-triggered)
2. **CUSTOMER-WHATSAPP-002B**: Answer Handler (WAHA-triggered, always listening)

**Benefits**:
- ✅ No need to wait/poll
- ✅ Liza can respond at any time
- ✅ Multiple questions can be pending
- ✅ Simpler workflow logic

---

**Last Updated**: November 17, 2025  
**Status**: 📋 **DESIGN COMPLETE** - Ready for Implementation

