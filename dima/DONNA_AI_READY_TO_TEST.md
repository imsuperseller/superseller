# ✅ Donna AI - Ready to Test!

**Date**: November 14, 2025  
**Workflow**: `CUSTOMER-WHATSAPP-001: Donna AI - Main Agent`  
**Status**: ✅ **ACTIVE & READY**

---

## 🎯 **QUICK TEST**

### **Send WhatsApp Message**

**To**: `+1 214-436-2102` (or the WhatsApp number linked to WAHA)

**Test Message** (Text):
```
Hello Donna, what are the best materials for kitchen cabinets?
```

**Expected Response**: Voice message from Donna with answer (if knowledge base is set up) or "I'll check with Liza" (if not found)

---

## ✅ **WORKFLOW STATUS**

- ✅ **Workflow**: ACTIVE
- ✅ **WAHA Session**: WORKING
- ✅ **WhatsApp**: Linked (`12144362102@c.us`)
- ✅ **All Nodes**: Configured
- ✅ **Webhook**: Auto-registered by WAHA Trigger node

---

## 📋 **WORKFLOW FLOW**

```
WhatsApp Message (Text/Voice)
    ↓
WAHA Trigger (receives message)
    ↓
Filter Message Type
    ↓
Set Store Name and Extract Text
    ↓
Route Message Type (IF)
    ├─→ [Voice] Download → Transcribe → Prepare Question
    └─→ [Text] Prepare Question (direct)
    ↓
Donna AI Agent
    ├─→ Search Documents Tool (RAG)
    ├─→ OpenRouter Chat Model (GPT-4o)
    ├─→ Simple Memory (conversation history)
    └─→ ElevenLabs TTS (voice response)
    ↓
Convert Audio Format (FFmpeg → OGG)
    ↓
Send Voice Message (WAHA)
    ↓
WhatsApp Response (Voice)
```

---

## ⚠️ **BEFORE TESTING**

### **1. Gemini File Search Store**

**Status**: ⚠️ **NOT CREATED YET**

**Impact**: RAG search will return "No answer found" until store is created

**Action**: Create store and upload PDFs:
- `ספר הדרכה למעצבת - גרסה 1.3.pdf`
- `ניהול_צבעים_01-18.pdf`

**Temporary**: Workflow will still respond, but will say "I'll check with Liza" for technical questions

---

## 🧪 **TEST SCENARIOS**

### **Test 1: Text Message**
1. Send: `"Hello Donna"`
2. Expected: Voice greeting response
3. Check: Execution in n8n shows success

### **Test 2: Technical Question (After Store Created)**
1. Send: `"What are the specifications for drawer slides?"`
2. Expected: Voice response with technical details from knowledge base
3. Check: RAG search found answer, confidence >80%

### **Test 3: Voice Message**
1. Send: Voice message asking a question
2. Expected: Transcribed → Processed → Voice response
3. Check: Transcription node executed successfully

---

## 📊 **MONITORING**

### **View Executions**

**URL**: `http://173.254.201.134:5678/executions`

**Filter by Workflow**: `86WHKNpj09tV9j1d`

### **Check Recent Executions**

```bash
curl -H "X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  "http://173.254.201.134:5678/api/v1/executions?workflowId=86WHKNpj09tV9j1d&limit=3"
```

---

## 🚀 **READY TO TEST!**

**Workflow is fully configured and active. Send a WhatsApp message to test!**

**WhatsApp Number**: `+1 214-436-2102`

---

**Last Updated**: November 14, 2025

