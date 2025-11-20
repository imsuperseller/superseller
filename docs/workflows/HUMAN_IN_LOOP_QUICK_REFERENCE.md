# 🔄 Human-in-the-Loop Workflows - Quick Reference

**Date**: November 17, 2025  
**Status**: ✅ **WORKFLOWS CREATED**

---

## 📋 **WORKFLOW SUMMARY**

### **Workflow 1: Question Handler**

**ID**: `0Cyp9kWJ0oUPNx2L`  
**URL**: `http://173.254.201.134:5678/workflow/0Cyp9kWJ0oUPNx2L`  
**Trigger**: Webhook (POST)  
**Purpose**: Receives low-confidence questions, saves to Airtable, sends WhatsApp to Liza

**Webhook**: `http://173.254.201.134:5678/webhook/human-in-loop-question`

---

### **Workflow 2: Answer Handler**

**ID**: `DNzlEU1vs7aqrlBg`  
**URL**: `http://173.254.201.134:5678/workflow/DNzlEU1vs7aqrlBg`  
**Trigger**: WAHA (always listening)  
**Purpose**: Listens for Liza's responses, processes answers, updates knowledge base

---

## 🔗 **INTEGRATION**

### **From Main Workflow (CUSTOMER-WHATSAPP-001)**

**Add after "Liza AI Agent" node**:

1. **Check Confidence** (Code node)
2. **Route by Confidence** (IF node)
3. **Call Human-in-Loop** (HTTP Request node)

**HTTP Request**:
- **Method**: POST
- **URL**: `http://173.254.201.134:5678/webhook/human-in-loop-question`
- **Body**: JSON with `question`, `designer_phone`, `designer_name`, `confidence_score`, `original_message_id`

---

## ⚠️ **REQUIRED SETUP**

1. ✅ Create Airtable table `unanswered_questions`
2. ✅ Configure Liza's phone number
3. ✅ Add confidence check to main workflow
4. ✅ Activate both workflows

---

**Last Updated**: November 17, 2025

