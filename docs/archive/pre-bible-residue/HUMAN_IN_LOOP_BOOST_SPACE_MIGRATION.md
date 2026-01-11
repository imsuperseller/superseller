# 🔄 Human-in-the-Loop - Boost.space Migration

**Date**: November 17, 2025  
**Reason**: Migrated from Airtable to Boost.space (PRIMARY data storage)  
**Status**: ✅ **MIGRATION PLAN**

---

## 🎯 **CHANGES REQUIRED**

### **Workflow 1: CUSTOMER-WHATSAPP-002A (Question Handler)**

**Current**: Uses Airtable `unanswered_questions` table  
**New**: Use Boost.space Notes module (Space 27)

**Changes**:
1. Replace "Save to Airtable" node with HTTP Request to Boost.space API
2. Update "Extract Record ID" to get Boost.space note ID
3. Store data in Boost.space Note format

---

### **Workflow 2: CUSTOMER-WHATSAPP-002B (Answer Handler)**

**Current**: Uses Airtable queries and updates  
**New**: Use Boost.space Notes API

**Changes**:
1. Replace "Query Airtable for Pending" with HTTP Request to Boost.space API
2. Replace "Update Airtable" with HTTP Request to Boost.space API
3. Update "Find Pending Question" to process Boost.space note format

---

## 📋 **BOOST.SPACE API FORMAT**

### **Create Note (Unanswered Question)**

**Endpoint**: `POST https://superseller.boost.space/api/note`  
**Headers**:
```
Authorization: Bearer {BOOST_SPACE_API_KEY}
Content-Type: application/json
```

**Body**:
```json
{
  "title": "Unanswered Question: {question_preview}",
  "content": "{\"question\": \"...\", \"designer_phone\": \"...\", \"designer_name\": \"...\", \"confidence_score\": 65, \"status\": \"pending\", \"timestamp\": \"...\", \"original_message_id\": \"...\"}",
  "spaceId": 27,
  "category": "Unanswered Questions"
}
```

**Response**:
```json
{
  "id": "note_123",
  "title": "...",
  "content": "...",
  ...
}
```

---

### **Query Notes (Find Pending)**

**Endpoint**: `GET https://superseller.boost.space/api/note?spaceId=27&category=Unanswered Questions`  
**Filter**: Parse `content` JSON to find `status: "pending"`  
**Sort**: By `timestamp` (descending)

---

### **Update Note (Add Answer)**

**Endpoint**: `PUT https://super.boost.space/api/note/{note_id}`  
**Body**:
```json
{
  "content": "{\"question\": \"...\", \"designer_phone\": \"...\", \"designer_name\": \"...\", \"confidence_score\": 65, \"status\": \"answered\", \"timestamp\": \"...\", \"original_message_id\": \"...\", \"liza_response\": \"...\", \"liza_response_timestamp\": \"...\"}"
}
```

---

## 🔧 **NODE UPDATES**

### **Node: "Save to Boost.space"** (Replaces "Save to Airtable")

**Type**: `n8n-nodes-base.httpRequest`

**Method**: POST  
**URL**: `https://superseller.boost.space/api/note`  
**Headers**:
```json
{
  "Authorization": "Bearer {{ $env.BOOST_SPACE_API_KEY }}",
  "Content-Type": "application/json"
}
```

**Body**:
```json
{
  "title": "={{ 'Unanswered Question: ' + ($json.question || '').substring(0, 50) }}",
  "content": "={{ JSON.stringify({question: $json.question, designer_phone: $json.designer_phone, designer_name: $json.designer_name, confidence_score: $json.confidence_score, status: 'pending', timestamp: $now.toISO(), original_message_id: $json.original_message_id}) }}",
  "spaceId": 27,
  "category": "Unanswered Questions"
}
```

---

### **Node: "Query Boost.space for Pending"** (Replaces "Query Airtable for Pending")

**Type**: `n8n-nodes-base.httpRequest`

**Method**: GET  
**URL**: `https://superseller.boost.space/api/note?spaceId=27&category=Unanswered Questions`  
**Headers**:
```json
{
  "Authorization": "Bearer {{ $env.BOOST_SPACE_API_KEY }}",
  "Content-Type": "application/json"
}
```

---

### **Node: "Find Pending Question"** (Update Code)

**Code**:
```javascript
// Process Boost.space notes
const notes = $input.all();
const messageData = $('Extract Message Text').item.json;

// Find most recent pending question
let pendingNote = null;
for (const noteItem of notes) {
  const note = noteItem.json;
  try {
    const content = JSON.parse(note.content || '{}');
    if (content.status === 'pending') {
      pendingNote = { note, content };
      break; // Most recent (already sorted)
    }
  } catch (e) {
    // Skip invalid JSON
  }
}

if (pendingNote) {
  return {
    json: {
      ...messageData,
      question_record: pendingNote.note,
      question: pendingNote.content.question || '',
      designer_phone: pendingNote.content.designer_phone || '',
      designer_name: pendingNote.content.designer_name || '',
      airtable_record_id: pendingNote.note.id, // Keep same field name for compatibility
      confidence_score: pendingNote.content.confidence_score || 0
    }
  };
} else {
  return {
    json: {
      ...messageData,
      question_record: null,
      is_response: false
    }
  };
}
```

---

### **Node: "Update Boost.space"** (Replaces "Update Airtable")

**Type**: `n8n-nodes-base.httpRequest`

**Method**: PUT  
**URL**: `https://superseller.boost.space/api/note/{{ $json.airtable_record_id }}`  
**Headers**:
```json
{
  "Authorization": "Bearer {{ $env.BOOST_SPACE_API_KEY }}",
  "Content-Type": "application/json"
}
```

**Body**:
```json
{
  "content": "={{ JSON.stringify({question: $json.question, designer_phone: $json.designer_phone, designer_name: $json.designer_name, confidence_score: $json.confidence_score, status: 'answered', timestamp: $json.timestamp, original_message_id: $json.original_message_id, liza_response: $json.answer, liza_response_timestamp: $json.liza_response_timestamp}) }}"
}
```

---

## ✅ **BENEFITS OF MIGRATION**

1. ✅ **No Rate Limits**: Boost.space lifetime plan has no API rate limits
2. ✅ **Consistent Architecture**: Matches data storage strategy
3. ✅ **Better Performance**: Instant webhooks available
4. ✅ **Cost Savings**: No Airtable usage for this workflow

---

## ⚠️ **REQUIRED SETUP**

1. **Environment Variable**: `BOOST_SPACE_API_KEY` in n8n credentials
2. **Space 27**: Ensure "Unanswered Questions" category exists
3. **Update Workflows**: Apply changes to both workflows

---

**Last Updated**: November 17, 2025  
**Status**: 📋 **MIGRATION PLAN** - Ready to implement

