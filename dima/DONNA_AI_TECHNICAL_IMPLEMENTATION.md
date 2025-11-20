# Donna AI - Technical Implementation Plan

**Date**: November 14, 2025  
**Client**: Dima Vainer  
**Project**: Technical Knowledge Agent for Kitchen Designers  
**Status**: Proposal Phase

---

## 🎯 Project Overview

**Donna AI** is a RAG-powered voice WhatsApp agent that provides instant technical answers to kitchen designers. The system combines:

- **Voice WhatsApp Agent** (workflow `3OukCjHVvBXiXr6u` - already built)
- **Gemini File Search RAG** (workflow `86WHKNpj09tV9j1d` - already built)
- **Human-in-the-Loop** (new workflow to build)
- **Admin Dashboard** (Airtable-based)

---

## 🏗️ Architecture

### **Workflow Structure**

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER-WHATSAPP-001                     │
│              Donna AI - Main Voice Agent                      │
└─────────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ↓                               ↓
┌───────────────────┐         ┌───────────────────┐
│  Voice Message    │         │  Text Message      │
│  (PTT)            │         │  (Text)            │
└─────────┬─────────┘         └─────────┬─────────┘
          │                               │
          └───────────────┬───────────────┘
                          ↓
              ┌───────────────────────┐
              │  Transcribe (Whisper)  │
              │  (if voice)            │
              └───────────┬─────────────┘
                          ↓
              ┌───────────────────────┐
              │  AI Agent + RAG Tool   │
              │  - Gemini File Search  │
              │  - GPT-4o              │
              │  - Confidence Check    │
              └───────────┬─────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ↓                                   ↓
┌──────────────────┐            ┌──────────────────┐
│ High Confidence  │            │ Low Confidence   │
│ (>80%)           │            │ (<80%)           │
└────────┬─────────┘            └────────┬─────────┘
         │                                │
         ↓                                ↓
┌──────────────────┐            ┌──────────────────┐
│ TTS (ElevenLabs) │            │ Human-in-Loop    │
│ Send Voice       │            │ Workflow         │
└──────────────────┘            └──────────────────┘
```

---

## 📋 Workflows to Build/Modify

### **1. CUSTOMER-WHATSAPP-001: Donna AI Main Agent**

**Base**: Modify existing `INT-WHATSAPP-001: Voice WhatsApp Agent v1` (ID: `3OukCjHVvBXiXr6u`)

**Changes Needed**:
1. **Add RAG Tool** - Integrate Gemini File Search
2. **Add Confidence Check** - Before sending response
3. **Update System Message** - Kitchen design context
4. **Add Text Support** - Handle both voice and text

**Node Structure**:
```
WAHA Trigger
    ↓
Filter (voice/text)
    ↓
[If Voice] Transcribe (Whisper)
    ↓
AI Agent
    ├─→ Simple Memory (per designer)
    ├─→ OpenRouter Chat Model (GPT-4o)
    ├─→ Gemini RAG Tool (search documents)
    └─→ ElevenLabs TTS Tool
    ↓
Confidence Check
    ├─→ [High] → TTS → Send Voice
    └─→ [Low] → Human-in-Loop Workflow
```

**System Message**:
```
You are Donna, a technical knowledge assistant for kitchen designers.

Your role:
- Answer technical questions about kitchen design, materials, specifications
- Use the document search tool to find accurate information
- Provide concise, professional answers (under 100 words for voice)
- Always cite sources when possible
- If you're not confident, say "I'm not sure, let me check with Liza"

When users ask questions:
1. IMMEDIATELY search the knowledge base using the search_documents tool
2. Extract the relevant information
3. Provide a clear, concise answer
4. If confidence is low (<80%), indicate uncertainty

Always use the textToSpeech tool to respond with voice.
```

---

### **2. CUSTOMER-WHATSAPP-002: Human-in-the-Loop Handler**

**Purpose**: Handle questions Donna can't answer

**Flow**:
```
Input: Question + Designer Info + Low Confidence
    ↓
Save to Airtable (unanswered_questions table)
    ↓
Send WhatsApp to Liza
    ↓
Wait for Liza's response (WAHA Trigger)
    ↓
Extract answer from Liza's message
    ↓
Update Airtable (link answer to question)
    ↓
Upload answer to Gemini File Search Store
    ↓
Send answer to original designer
```

**Airtable Table: `unanswered_questions`**
```typescript
{
  id: string (auto)
  question: text
  designer_name: string
  designer_phone: string
  timestamp: datetime
  status: 'pending' | 'answered' | 'archived'
  liza_response: text (nullable)
  liza_response_timestamp: datetime (nullable)
  confidence_score: number (0-100)
}
```

---

### **3. CUSTOMER-WHATSAPP-003: Knowledge Base Updater**

**Purpose**: Update Gemini File Search Store with new documents/answers

**Flow**:
```
Trigger: New document upload OR Liza's answer
    ↓
Process document (PDF/DOCX/TXT)
    ↓
Upload to Gemini File Search Store
    ↓
Update Airtable (knowledge_base_documents table)
```

**Base**: Use existing `86WHKNpj09tV9j1d` workflow as reference

---

### **4. CUSTOMER-WHATSAPP-004: Admin Dashboard Sync**

**Purpose**: Sync data to Airtable for reporting

**Airtable Tables**:

#### `conversations`
```typescript
{
  id: string (auto)
  designer_name: string
  designer_phone: string
  question: text
  answer: text
  confidence_score: number
  timestamp: datetime
  source: 'voice' | 'text'
  response_time_seconds: number
}
```

#### `usage_stats`
```typescript
{
  id: string (auto)
  date: date
  total_questions: number
  voice_questions: number
  text_questions: number
  unanswered_questions: number
  avg_confidence: number
  avg_response_time: number
}
```

#### `designers`
```typescript
{
  id: string (auto)
  name: string
  phone: string
  branch: string
  authorized: boolean
  total_questions: number
  last_question_date: datetime
}
```

---

## 🔧 Technical Details

### **RAG Integration**

**Gemini File Search Store**:
- Store Name: `fileSearchStores/donna-kitchen-knowledge-{id}`
- Documents to upload:
  - `ספר הדרכה למעצבת - גרסה 1.3.pdf`
  - `ניהול_צבעים_01-18.pdf`
  - Any additional technical documents

**RAG Tool Code** (for AI Agent):
```javascript
const STORE_NAME = 'fileSearchStores/donna-kitchen-knowledge-{id}';
const API_KEY = 'AIzaSyC3ii2_eTe8XqC3oLh3w3vc7ITU4I7eDtU';

const query = $input.params.query || '';

const requestBody = {
  contents: [{
    parts: [{ text: query }]
  }],
  tools: [{
    fileSearch: {
      fileSearchStoreNames: [STORE_NAME]
    }
  }]
};

const response = await this.helpers.httpRequest({
  method: 'POST',
  url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
  headers: { 'Content-Type': 'application/json' },
  body: requestBody,
  json: true
});

const answer = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer found';
const confidence = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.length > 0 ? 90 : 50;

return { answer, confidence };
```

---

### **Confidence Check Logic**

**After AI Agent Response**:
```javascript
// Extract confidence from RAG tool response
const confidence = $json.confidence || 80;

// If confidence < 80%, route to Human-in-Loop
if (confidence < 80) {
  return {
    json: {
      route: 'human_in_loop',
      question: $('AI Agent').item.json.text,
      confidence: confidence
    }
  };
} else {
  return {
    json: {
      route: 'send_response',
      answer: $('AI Agent').item.json.text,
      confidence: confidence
    }
  };
}
```

---

### **Phone Number Authorization**

**Airtable Table: `authorized_phones`**
```typescript
{
  id: string (auto)
  phone: string (format: 12144362102@c.us)
  designer_name: string
  branch: string
  authorized: boolean
  added_date: datetime
}
```

**Authorization Check** (in WAHA Trigger workflow):
```javascript
const incomingPhone = $json.payload.from; // e.g., "12144362102@c.us"

// Query Airtable for authorized phones
const authorizedPhones = await this.helpers.httpRequest({
  method: 'GET',
  url: `https://api.airtable.com/v0/{baseId}/authorized_phones?filterByFormula={phone}="${incomingPhone}"`,
  headers: {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`
  }
});

if (authorizedPhones.records.length === 0) {
  // Not authorized - send rejection message
  return {
    json: {
      authorized: false,
      message: "Sorry, you're not authorized to use Donna AI. Please contact your manager."
    }
  };
}

return {
  json: {
    authorized: true,
    designer_name: authorizedPhones.records[0].fields.designer_name
  }
};
```

---

## 📊 Data Flow

### **Question Flow**
```
Designer (WhatsApp)
    ↓
WAHA → n8n Workflow
    ↓
Authorization Check (Airtable)
    ↓
Transcribe (if voice)
    ↓
AI Agent + RAG Search
    ↓
Confidence Check
    ├─→ [High] → TTS → Send Voice
    └─→ [Low] → Save to Airtable → Notify Liza
```

### **Answer Flow (Human-in-Loop)**
```
Liza (WhatsApp Response)
    ↓
WAHA → n8n Workflow
    ↓
Extract Answer
    ↓
Update Airtable (link to question)
    ↓
Upload to Gemini File Search Store
    ↓
Send to Original Designer
```

---

## 🚀 Implementation Steps

### **Phase 1: Setup (Week 1)**
1. ✅ Create Gemini File Search Store
2. ✅ Upload initial documents (2 PDFs)
3. ✅ Set up Airtable base with all tables
4. ✅ Configure WAHA for new WhatsApp number
5. ✅ Set up phone authorization system

### **Phase 2: Main Workflow (Week 2)**
1. ✅ Clone `INT-WHATSAPP-001` → `CUSTOMER-WHATSAPP-001`
2. ✅ Add RAG tool integration
3. ✅ Add confidence check logic
4. ✅ Update system message
5. ✅ Add text message support
6. ✅ Test with sample questions

### **Phase 3: Human-in-Loop (Week 3)**
1. ✅ Build `CUSTOMER-WHATSAPP-002` workflow
2. ✅ Set up Airtable `unanswered_questions` table
3. ✅ Configure Liza's WhatsApp number
4. ✅ Test question → Liza → answer flow

### **Phase 4: Knowledge Base Management (Week 4)**
1. ✅ Build `CUSTOMER-WHATSAPP-003` workflow
2. ✅ Set up document upload interface
3. ✅ Test document processing and indexing

### **Phase 5: Dashboard & Reporting (Week 5)**
1. ✅ Build `CUSTOMER-WHATSAPP-004` workflow
2. ✅ Create Airtable dashboard views
3. ✅ Set up automated reporting
4. ✅ Test data sync

### **Phase 6: Testing & Optimization (Week 6)**
1. ✅ End-to-end testing
2. ✅ Performance optimization
3. ✅ User acceptance testing
4. ✅ Documentation
5. ✅ Go-Live

---

## 🔑 Credentials & Configuration

### **Required Credentials**

1. **WAHA API**
   - Existing: `px3TLR7BGl3MVW7Y` (WAHA account)
   - New WhatsApp number for Donna

2. **OpenAI API**
   - Existing: `0sXFXYfqiDEKuDcN` (service@rensto.com)
   - For Whisper transcription

3. **ElevenLabs API**
   - Existing: `yEEqLVMzOlo1L0xI` (ElevenLabs account)
   - Voice ID: `fkQDt886xMbusUJ9weAC` (Donna's voice)

4. **OpenRouter API**
   - Existing: `XorqqpNVvabnf8Ko` (service@rensto.com)
   - For GPT-4o model

5. **Gemini API**
   - Need: API key for File Search Store
   - Store name: `fileSearchStores/donna-kitchen-knowledge-{id}`

6. **Airtable API**
   - Existing: PAT token
   - Base: New base for Donna AI project

---

## 📝 Notes

- **Voice Agent**: Already built (`INT-WHATSAPP-001`) - can be adapted
- **RAG System**: Already built (`86WHKNpj09tV9j1d`) - can be reused
- **Human-in-Loop**: New workflow to build
- **Admin Dashboard**: Airtable-based (no custom development needed)

**Estimated Development Time**: 4-6 weeks  
**Complexity**: Medium-High (RAG + Voice + Human-in-Loop)

---

**Last Updated**: November 14, 2025

