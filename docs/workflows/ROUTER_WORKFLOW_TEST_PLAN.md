# 🧪 Router Workflow Test Plan

**Date**: November 25, 2025  
**Workflow**: `INT-WHATSAPP-ROUTER-001: WhatsApp Message Router`  
**Workflow ID**: `nZJJZvWl0MBe3uT4`  
**Status**: ✅ **READY FOR TESTING**

---

## ✅ **CURRENT STATUS**

### **Infrastructure**:
- ✅ Default session: **WORKING**
- ✅ Webhook configured: `https://n8n.rensto.com/webhook/a5d8af68-de4e-44b4-bbe8-9332a3915992/waha`
- ✅ Router workflow: **ACTIVE**
- ✅ All target workflows: **ACTIVE**

### **Validation**:
- ⚠️ Validation tool shows false positives (database schema issue - known issue)
- ✅ Workflow structure is correct
- ✅ All nodes are enabled
- ✅ All connections are valid
- ⚠️ Optional chaining warnings (non-critical - n8n doesn't support `?.` but workflow should still work)

---

## 🧪 **TEST PLAN**

### **Test 1: Unknown Number → Rensto Support** ✅ **READY**

**Objective**: Verify default routing works

**Steps**:
1. Send WhatsApp message from unknown number (not in router mappings)
2. Message: `"Hello, test message"`
3. Expected: Routes to Rensto Support workflow (`eQSCUFw91oXLxtvn`)

**Verification**:
- ✅ Router workflow execution appears
- ✅ Router routes to Rensto Support
- ✅ Rensto Support processes message
- ✅ Response sent successfully

**Phone Numbers to Test**:
- Any number NOT in permanent mappings
- Example: `1234567890@c.us` (fake number for testing)

---

### **Test 2: Tax4US Number → Tax4US Agent** ✅ **READY**

**Objective**: Verify Tax4US routing works

**Steps**:
1. Send WhatsApp message from: `4695885133@c.us` or `14695885133@c.us`
2. Message: `"Tax4US test"`
3. Expected: Routes to Tax4US Agent workflow (`afuwFRbipP3bqNZz`)

**Verification**:
- ✅ Router workflow execution appears
- ✅ Router routes to Tax4US Agent
- ✅ Tax4US Agent processes message
- ✅ Response sent successfully

**Permanent Mapping**:
```javascript
'4695885133@c.us': 'tax4us-ai',
'14695885133@c.us': 'tax4us-ai',
```

---

### **Test 3: MeatPoint Number → MeatPoint Agent** ✅ **READY**

**Objective**: Verify MeatPoint routing works

**Steps**:
1. Send WhatsApp message from: `19544043156@c.us`
2. Message: `"MeatPoint test"`
3. Expected: Routes to MeatPoint Agent workflow (`wctBX3HGve9jhdPG`)

**Verification**:
- ✅ Router workflow execution appears
- ✅ Router routes to MeatPoint Agent
- ✅ MeatPoint Agent processes message
- ✅ Response sent successfully

**Permanent Mapping**:
```javascript
'19544043156@c.us': 'meatpoint-agent',
```

---

### **Test 4: Liza AI Number → Liza AI** ⚠️ **NEEDS MAPPING**

**Objective**: Verify Liza AI routing works (if configured)

**Steps**:
1. Send WhatsApp message from Liza number (if mapped)
2. Message: `"Liza test"`
3. Expected: Routes to Liza AI workflow (`86WHKNpj09tV9j1d`)

**Note**: Liza AI mapping is commented out in router code:
```javascript
// '972528353052@c.us': 'liza-ai', // Example
```

**Action Required**: Uncomment and configure if needed

---

## 📊 **ROUTING LOGIC**

### **Priority Order**:
1. **Demo Mode Mappings** (highest priority - from static data)
2. **Permanent Mappings** (hard-coded in router)
3. **Default** → Rensto Support (all other numbers)

### **Current Permanent Mappings**:
```javascript
{
  '4695885133@c.us': 'tax4us-ai',        // Tax4US Agent
  '14695885133@c.us': 'tax4us-ai',       // Tax4US Agent (with country code)
  '19544043156@c.us': 'meatpoint-agent', // MeatPoint Agent
}
```

### **Workflow IDs**:
```javascript
{
  'liza-ai': '86WHKNpj09tV9j1d',        // Liza AI
  'rensto-support': 'eQSCUFw91oXLxtvn', // Rensto Support
  'meatpoint-agent': 'wctBX3HGve9jhdPG', // MeatPoint Agent
  'tax4us-ai': 'afuwFRbipP3bqNZz',      // Tax4US Agent
}
```

---

## 🔍 **TROUBLESHOOTING**

### **Issue: Router Not Receiving Messages**

**Check**:
1. ✅ Default session status: `WORKING`
2. ✅ Webhook URL matches router webhookId
3. ✅ Router workflow is ACTIVE
4. ✅ WAHA Trigger node is enabled

**Solution**:
- Verify webhook in WAHA Dashboard
- Check router workflow executions
- Test webhook manually

### **Issue: Messages Not Routing Correctly**

**Check**:
1. ✅ Phone number format matches mapping (e.g., `4695885133@c.us`)
2. ✅ Router code has correct mapping
3. ✅ Target workflow is ACTIVE

**Solution**:
- Check router execution logs for routing decision
- Verify phone number format in WAHA payload
- Update permanent mappings if needed

### **Issue: Validation Errors**

**Status**: ⚠️ **FALSE POSITIVES** (known issue)

**Details**:
- Validation tool has database schema bug
- Workflow structure is correct
- Workflow should execute despite validation errors

**Action**: Ignore validation errors, test with actual messages

---

## 📋 **EXECUTION CHECKLIST**

Before testing:
- [x] Default session is WORKING
- [x] Webhook is configured correctly
- [x] Router workflow is ACTIVE
- [x] All target workflows are ACTIVE
- [x] Routing logic is documented

During testing:
- [ ] Test 1: Unknown number → Rensto Support
- [ ] Test 2: Tax4US number → Tax4US Agent
- [ ] Test 3: MeatPoint number → MeatPoint Agent
- [ ] Test 4: Liza AI number → Liza AI (if configured)

After testing:
- [ ] Document results
- [ ] Fix any issues found
- [ ] Update routing mappings if needed

---

## 📝 **TEST RESULTS**

**Date**: TBD  
**Tester**: TBD

### **Test 1: Unknown Number → Rensto Support**
- Status: ⏳ **PENDING**
- Result: TBD

### **Test 2: Tax4US Number → Tax4US Agent**
- Status: ⏳ **PENDING**
- Result: TBD

### **Test 3: MeatPoint Number → MeatPoint Agent**
- Status: ⏳ **PENDING**
- Result: TBD

### **Test 4: Liza AI Number → Liza AI**
- Status: ⏳ **PENDING** (needs mapping configuration)
- Result: TBD

---

**Last Updated**: November 25, 2025  
**Status**: ✅ **READY FOR TESTING**

