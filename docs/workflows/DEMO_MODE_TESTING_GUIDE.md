# 🧪 Demo Mode Testing Guide - Quick Reference

**Date**: November 25, 2025  
**Purpose**: Quick guide for testing routing from 4695885133 to different agents  
**Status**: ✅ **READY**

---

## 🎯 **QUICK START**

### **Your Number**: `4695885133@c.us`

**Current Status**: Permanently mapped to `tax4us-ai`

**To Test Other Agents**: Use demo mode to temporarily override

---

## 🔧 **HOW TO SET DEMO MODE**

### **Method 1: Add Code Node Before "Lookup Agent"** (Temporary)

1. Open router workflow: `INT-WHATSAPP-ROUTER-001` (ID: `nZJJZvWl0MBe3uT4`)
2. Add Code node before "Lookup Agent" node
3. Insert this code:

```javascript
// Set demo mode mapping for testing
let staticData = this.getWorkflowStaticData('global');
staticData.demoModeMappings = {
  '4695885133@c.us': 'rensto-support' // Change to: 'meatpoint-agent', 'liza-ai', or 'tax4us-ai'
};
this.setWorkflowStaticData('global', staticData);

// Pass through to next node
return $input.all();
```

4. Connect: Code node → "Lookup Agent"
5. Send test message
6. **Remove Code node after testing** (or disable it)

---

### **Method 2: Temporarily Comment Out Permanent Mapping**

1. Open router workflow
2. Edit "Lookup Agent" node
3. Find this section:
   ```javascript
   const permanentMappings = {
     '4695885133@c.us': 'tax4us-ai', // Shai (Tax4US testing)
     '14695885133@c.us': 'tax4us-ai', // Shai with country code (Tax4US testing)
   };
   ```
4. Comment it out:
   ```javascript
   const permanentMappings = {
     // '4695885133@c.us': 'tax4us-ai', // TEMPORARILY COMMENTED FOR TESTING
     // '14695885133@c.us': 'tax4us-ai', // TEMPORARILY COMMENTED FOR TESTING
     '19544043156@c.us': 'meatpoint-agent',
   };
   ```
5. Save workflow
6. Send test message (will route to Rensto Support by default)
7. **Uncomment after testing**

---

## 📋 **TEST SEQUENCE**

### **Test 1: Rensto Support**
1. Set demo mode: `4695885133@c.us` → `rensto-support`
2. Send: `"Test 1.1 - Rensto Support"`
3. Verify: Response from Rensto Support
4. Clear demo mode

---

### **Test 2: Tax4US** (Your Default)
1. Ensure permanent mapping is active (no demo mode)
2. Send: `"Test 1.2 - Tax4US"`
3. Verify: Response from Tax4US Agent

---

### **Test 3: MeatPoint**
1. Set demo mode: `4695885133@c.us` → `meatpoint-agent`
2. Send: `"Test 1.3 - MeatPoint"`
3. Verify: Response from MeatPoint Agent
4. Clear demo mode

---

### **Test 4: Liza**
1. Set demo mode: `4695885133@c.us` → `liza-ai`
2. Send: `"Test 1.4 - Liza"`
3. Verify: Response from Liza Agent
4. Clear demo mode

---

## 🔍 **HOW TO CHECK RESULTS**

### **Via n8n UI**:
1. Go to: http://173.254.201.134:5678
2. Click "Executions"
3. Find latest router execution
4. Click on "Lookup Agent" node
5. Check output: `agent_id` field

**Expected Values**:
- `rensto-support` → Rensto Support
- `tax4us-ai` → Tax4US Agent
- `meatpoint-agent` → MeatPoint Agent
- `liza-ai` → Liza AI

---

## ✅ **SUCCESS CHECKLIST**

After each test:
- [ ] Router execution shows correct `agent_id`
- [ ] Agent workflow executed successfully
- [ ] Response received in WhatsApp
- [ ] No errors in execution logs

---

## 🚀 **AFTER ALL TESTS PASS**

1. ✅ Document any issues
2. ✅ Fix routing problems
3. ✅ **Proceed with Tax4US-specific work**

---

**Last Updated**: November 25, 2025  
**Status**: ✅ **READY FOR TESTING**

