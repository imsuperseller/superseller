# Boost.space Custom Fields API - Final Finding

**Date**: November 28, 2025  
**Status**: ⚠️ **API LIMITATION CONFIRMED**

---

## 🔍 **Root Cause Identified**

After following the official Boost.space MCP documentation and extensive testing:

### **Key Discovery**:
1. **Field Configuration**: Custom field `workflow_name` (ID 1397) is linked to `note` module, not `custom-module-item`
2. **Space Configuration**: Space 45 is "n8n Workflows (Notes)" - a **note module space**
3. **API Limitation**: Even with correct module (`note`), custom fields **cannot be set via API**

### **Evidence**:
```bash
# Field configuration shows:
{
  "id": 1397,
  "name": "workflow_name",
  "module": "note",  # ← Field is for note module
  "spaces": [45]
}

# Space 45 is:
{
  "space_id": 45,
  "space_name": "n8n Workflows (Notes)",  # ← Note module space
  "module": "note"
}
```

---

## ✅ **Correct Approach**

**Use `note` module in Space 45** (not `custom-module-item`):

```javascript
// Correct configuration
{
  moduleId: 'note',  // Not 'custom-module-item'
  spaceId: 45,
  customFieldsValues: [{
    customFieldInputId: 1397,
    value: 'INT-LEAD-001',
    module: 'note'  // Must match field's module
  }]
}
```

---

## ❌ **API Limitation**

**Even with correct module and format, custom fields do NOT save via API:**

- ✅ API accepts request (200 OK)
- ✅ Format matches API documentation exactly
- ✅ All required fields present (`value`, `customFieldInputId`, `module`)
- ❌ Fields never persist in database

**Tested with**:
- Direct API calls (`PUT /api/note/{id}`)
- MCP tools (`update_record`)
- Multiple payload formats
- Both `note` and `custom-module-item` modules

**Result**: Same issue - API accepts but doesn't save.

---

## 📚 **Documentation Reference**

The Boost.space MCP documentation shared covers:
- ✅ Setting up MCP servers
- ✅ Creating custom modules
- ✅ Using MCP tools to query data
- ❌ **Does NOT cover setting custom field values via API**

This suggests custom fields may be **UI-only** or require a different method (e.g., scenarios/automations).

---

## 🎯 **Recommended Solutions**

### **Option 1: Manual Entry via UI** (Current Workaround)
- Script generates JSON export
- Copy-paste into Boost.space UI
- Fields save correctly via UI

### **Option 2: Use Boost.space Scenarios** (Per Documentation)
- Create on-demand scenario that sets custom fields
- Trigger scenario via MCP `run_scenario` tool
- May work if API limitation is bypassed through automation

### **Option 3: Contact Boost.space Support**
- Report API limitation
- Request clarification on programmatic custom field updates
- May be a bug or intentional limitation

---

## 📝 **Script Updated**

Script has been updated to:
- ✅ Use `note` module (correct for Space 45)
- ✅ Use correct `module: 'note'` in customFieldsValues
- ✅ Use correct `statusSystemId: 13` (Active status for notes)

**Ready to use once API limitation is resolved or workaround found.**
