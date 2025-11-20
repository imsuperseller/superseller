# ✅ Human-in-the-Loop Workflows - Complete Summary

**Date**: November 17, 2025  
**Status**: ✅ **BOTH WORKFLOWS CREATED**

---

## 🎯 **WORKFLOWS CREATED**

### **1. CUSTOMER-WHATSAPP-002A: Question Handler**

**ID**: `0Cyp9kWJ0oUPNx2L`  
**URL**: `http://173.254.201.134:5678/workflow/0Cyp9kWJ0oUPNx2L`  
**Trigger**: Webhook (POST)  
**Status**: ✅ **CREATED**

**Flow**:
```
Webhook Trigger
    ↓
Save to Airtable
    ↓
Extract Record ID
    ↓
Format Message for Liza
    ↓
Send WhatsApp to Liza
    ↓
Webhook Response
```

**Webhook**: `http://173.254.201.134:5678/webhook/human-in-loop-question`

---

### **2. CUSTOMER-WHATSAPP-002B: Answer Handler**

**ID**: `DNzlEU1vs7aqrlBg`  
**URL**: `http://173.254.201.134:5678/workflow/DNzlEU1vs7aqrlBg`  
**Trigger**: WAHA (always listening)  
**Status**: ✅ **CREATED**

**Flow**:
```
WAHA Trigger
    ↓
Filter Liza Messages
    ↓
Extract Message Text
    ↓
Query Airtable for Pending
    ↓
Find Pending Question
    ↓
Check If Response
    ↓
Extract Answer
    ↓
Update Airtable
    ↓
Upload to Knowledge Base
    ↓
Send Answer to Designer
```

---

## ⚠️ **REQUIRED SETUP**

1. **Create Airtable Table**: `unanswered_questions` in base `appQijHhqqP4z6wGe`
2. **Configure Liza's Phone**: Update in workflow 002A (currently `972528353052@c.us`)
3. **Add Confidence Check**: To main workflow `86WHKNpj09tV9j1d`
4. **Activate Workflows**: Both workflows need to be activated

---

## 🔗 **INTEGRATION**

**From Main Workflow**: Add confidence check after "Liza AI Agent" node, route low-confidence questions to webhook.

**Webhook Call**:
```javascript
POST http://173.254.201.134:5678/webhook/human-in-loop-question
{
  "question": "...",
  "designer_phone": "...",
  "designer_name": "...",
  "confidence_score": 65,
  "original_message_id": "..."
}
```

---

**Last Updated**: November 17, 2025  
**Status**: ✅ **WORKFLOWS READY** - Needs Airtable Table & Integration

