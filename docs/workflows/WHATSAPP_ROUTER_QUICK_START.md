# 🚀 WhatsApp Router - Quick Start Guide

**Date**: November 17, 2025  
**Workflow ID**: `nZJJZvWl0MBe3uT4`  
**Status**: ✅ **CREATED** - Ready to Activate

---

## ✅ **ROUTER CREATED**

**Workflow**: `INT-WHATSAPP-ROUTER-001: WhatsApp Message Router`  
**URL**: `http://173.254.201.134:5678/workflow/nZJJZvWl0MBe3uT4`

---

## 🎯 **HOW IT WORKS**

### **Architecture**:

```
ONE WhatsApp Number: +1 214-436-2102
    ↓
ONE WAHA Session: "default" (ONE QR code scan)
    ↓
Router Workflow: Receives ALL messages
    ↓
Routes based on SENDER's phone number:
    ├─→ Dima (14695885133@c.us) → Donna AI
    └─→ Everyone else → Rensto Support
```

---

## ✅ **CUSTOMER ONBOARDING** (Simple!)

### **For Each Customer**:

1. **Get their WhatsApp phone number**
   - Example: `+1 469-588-5133`
   - Format: `14695885133@c.us`

2. **Add to router** (edit "Lookup Agent" node):
   ```javascript
   '14695885133@c.us': 'donna-ai'
   ```

3. **Tell customer**:
   - "Message us at `+1 214-436-2102`"
   - **That's it!** No QR code, no setup

4. **Router automatically routes** their messages

---

## ⚠️ **CRITICAL: Before Activating Router**

**Agent workflows need modification** because they have WAHA Triggers but router calls them as sub-workflows.

**Options**:

### **Option 1: Deactivate Agent Workflows** (Recommended for Now)

1. **Deactivate Donna AI**: `http://173.254.201.134:5678/workflow/86WHKNpj09tV9j1d`
2. **Deactivate Rensto Support**: `http://173.254.201.134:5678/workflow/eQSCUFw91oXLxtvn`
3. **Activate Router**: `http://173.254.201.134:5678/workflow/nZJJZvWl0MBe3uT4`

**Note**: Router will call agent workflows, but they need to accept router data format.

### **Option 2: Modify Agent Workflows** (Better Long-Term)

**Add Manual Trigger** to agent workflows:
- Keep WAHA Trigger (for direct access)
- Add Manual Trigger (for router calls)
- Add IF node to detect source and format data accordingly

---

## 📋 **CURRENT CONFIGURATION**

**Phone Mapping**:
- `14695885133@c.us` → `donna-ai` → Workflow `86WHKNpj09tV9j1d`
- All others → `rensto-support` → Workflow `eQSCUFw91oXLxtvn`

**To Add New Customer**:
1. Get phone number
2. Edit "Lookup Agent" node in router
3. Add mapping: `'phone@c.us': 'agent-id'`
4. Add workflow ID to `agentWorkflows` mapping
5. Done!

---

## 🧪 **TESTING**

**After activating router**:

1. **Test Dima routing**:
   - Send message from Dima's phone to `+1 214-436-2102`
   - Should route to Donna AI workflow
   - Verify Donna AI responds

2. **Test default routing**:
   - Send message from unknown phone to `+1 214-436-2102`
   - Should route to Rensto Support workflow
   - Verify Rensto Support responds

---

## 💡 **KEY POINTS**

1. ✅ **ONE WhatsApp number** - `+1 214-436-2102`
2. ✅ **ONE WAHA session** - `default` (one QR code scan)
3. ✅ **Router routes** based on sender's phone
4. ✅ **No QR codes for customers** - They just message normally
5. ✅ **Easy to add customers** - Just update router mapping

---

**Last Updated**: November 17, 2025  
**Status**: ✅ **ROUTER READY** - Needs Agent Workflow Compatibility Fix Before Activation

