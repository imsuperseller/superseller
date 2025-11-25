# 🎯 Smart Session Routing Solution - For Testing

**Date**: November 25, 2025  
**Problem**: How to decide which session/agent to send messages to when testing from 4695885133  
**Solution**: Use Demo Mode + ONE WhatsApp Number  
**Status**: ✅ **SOLUTION READY**

---

## 🎯 **THE SMART SOLUTION**

### **Key Insight**: You Don't Choose the Session - You Choose the Agent via Demo Mode

**Architecture**:
```
Your Phone (4695885133) → ONE WhatsApp Number (default session)
    ↓
Router Workflow (INT-WHATSAPP-ROUTER-001)
    ↓
Demo Mode Override (temporary routing)
    ↓
Routes to Agent:
    ├─→ Rensto Support (default)
    ├─→ Tax4US Agent (demo mode)
    ├─→ MeatPoint Agent (demo mode)
    └─→ Liza AI (demo mode)
```

---

## ✅ **HOW IT WORKS**

### **Step 1: Always Message the Same WhatsApp Number**

**You only need ONE WhatsApp number** (the `default` session):
- **WhatsApp Number**: Check with `curl` command (see below)
- **Always send messages to this number**
- **No need to switch between different WhatsApp numbers**

### **Step 2: Use Demo Mode to Route Your Number**

**Demo Mode** = Temporary routing override for testing

**How to Set Demo Mode**:

1. **Option A: Via Webhook** (Recommended - Smart Way)
   - Create a simple webhook workflow to toggle demo mode
   - Send a message like: "route me to tax4us" or "route me to meatpoint"
   - Workflow updates demo mode mapping automatically

2. **Option B: Manual Update** (Quick Testing)
   - Update router workflow's "Lookup Agent" node
   - Add your number to demo mode mappings temporarily
   - Test, then remove

3. **Option C: Use Static Data** (Persistent Testing)
   - Router workflow uses static data for demo mode
   - Update static data via Code node or webhook

---

## 🔧 **IMPLEMENTATION: Smart Demo Mode Toggle**

### **Create Demo Mode Toggle Webhook Workflow**

**Workflow**: `INT-WHATSAPP-DEMO-TOGGLE-001` (to be created)

**Flow**:
```
Webhook Trigger
    ↓
Parse Command (text message or webhook body)
    ↓
Update Router Static Data
    ↓
Confirm Update
```

**Commands**:
- `"route me to tax4us"` → Sets demo mode: `4695885133@c.us` → `tax4us-ai`
- `"route me to meatpoint"` → Sets demo mode: `4695885133@c.us` → `meatpoint-agent`
- `"route me to rensto"` → Removes demo mode (uses permanent mapping)
- `"route me to liza"` → Sets demo mode: `4695885133@c.us` → `liza-ai`

---

## 📱 **YOUR TESTING WORKFLOW**

### **Daily Testing Process**:

1. **Send message to default WhatsApp number** (always the same number)
2. **Before testing, set demo mode**:
   - Send command: "route me to tax4us" (via webhook or WhatsApp)
   - OR: Update router workflow manually
3. **Send test message**: "Hi" from your phone
4. **Verify routing**: Message should route to Tax4US Agent
5. **Change demo mode**: "route me to meatpoint"
6. **Send test message**: "Hi" again
7. **Verify routing**: Message should route to MeatPoint Agent

---

## 🎯 **BEST PRACTICES FROM RESEARCH**

### **Industry Standard Approach**:

1. **ONE WhatsApp Number** for all routing ✅
2. **Router Workflow** routes based on sender's phone number ✅
3. **Demo Mode** for testing different agents ✅
4. **Permanent Mappings** for production customers ✅

### **Why This Works**:

- **Scalable**: Add new customers by adding to routing table
- **Testable**: Use demo mode to test routing without changing production mappings
- **Simple**: One WhatsApp number, one chat, router handles the rest
- **Smart**: Router automatically routes based on your phone number

---

## 🔍 **FIND YOUR WHATSAPP NUMBER**

**Check which WhatsApp number corresponds to `default` session**:

```bash
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://173.254.201.134:3000/api/sessions/default | \
  python3 -m json.tool | grep -E '"phoneNumber"|"pushName"'
```

**This is the number you should ALWAYS message** ✅

---

## 💡 **ALTERNATIVE: Smart Command System**

### **Create Command-Based Routing**:

**Send special commands in WhatsApp**:
- `"@tax4us test message"` → Routes to Tax4US Agent
- `"@meatpoint test message"` → Routes to MeatPoint Agent
- `"@rensto test message"` → Routes to Rensto Support
- `"@liza test message"` → Routes to Liza AI

**Router Workflow Enhancement**:
- Check if message starts with `@agent-name`
- If yes, route to that agent (override phone mapping)
- If no, use normal phone-based routing

**Benefits**:
- No need to change demo mode
- Test any agent instantly
- Works from any phone number

---

## 🚀 **RECOMMENDED IMPLEMENTATION**

### **Phase 1: Simple Demo Mode** (Quick Fix)

1. ✅ Router workflow already supports demo mode
2. ✅ Add webhook to toggle demo mode
3. ✅ Test routing works

### **Phase 2: Command-Based Routing** (Smart Enhancement)

1. ✅ Add command parser to router
2. ✅ Support `@agent-name` commands
3. ✅ Override phone-based routing with commands

### **Phase 3: Admin Dashboard** (Full Solution)

1. ✅ Create admin UI to manage routing
2. ✅ Visual demo mode toggle
3. ✅ Test routing from dashboard

---

## 📋 **IMMEDIATE ACTION ITEMS**

1. **Find default session WhatsApp number** (run curl command above)
2. **Always message that number** (not meatpoint or tax4us numbers)
3. **Use demo mode** to route your number to different agents
4. **Test routing** works correctly

---

**Last Updated**: November 25, 2025  
**Status**: ✅ **SOLUTION READY** - Implement demo mode toggle

