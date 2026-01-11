# Boost.space API Custom Fields Research Results

**Date**: November 28, 2025  
**Issue**: Custom fields not saving via API for `custom-module-item` records  
**Status**: ⚠️ **INVESTIGATING**

---

## 🔍 **Research Findings**

### **1. API Format Options (From Web Research)**

Based on multiple sources, Boost.space API supports **two possible formats** for custom fields:

#### **Format 1: `customFields` Object (Field Names as Keys)**
```json
{
  "spaceId": 45,
  "customFields": {
    "workflow_name": "INT-LEAD-001",
    "category": "Internal",
    "status": "Active"
  }
}
```

#### **Format 2: Direct Field Names as Properties**
```json
{
  "spaceId": 45,
  "workflow_name": "INT-LEAD-001",
  "category": "Internal",
  "status": "Active"
}
```

#### **Format 3: `customFieldsValues` Array (Current Attempt - NOT WORKING)**
```json
{
  "spaceId": 45,
  "customFieldsValues": [
    {
      "customFieldInputId": 1397,
      "value": "INT-LEAD-001"
    }
  ]
}
```

**Status**: Format 3 returns 200 OK but doesn't save fields.

---

## 📋 **Key Findings from Documentation**

### **From Boost.space Documentation:**
1. **Custom Fields Creation**: Fields must be created in System Settings → Custom Fields
2. **Field Assignment**: Fields must be assigned to specific spaces
3. **API Endpoint**: `/api/custom-module-item/{id}` for updates
4. **Field Names**: Use exact field names as defined in Boost.space

### **From Web Search Results:**
- Some sources suggest using `customFields` object with field names as keys
- Field identifiers (IDs) may not work directly - field names are preferred
- The API may require fields to be set via field names, not IDs

---

## 🧪 **Testing Results**

### **Test 1: `customFieldsValues` Array Format**
```bash
curl -X PUT "https://superseller.boost.space/api/custom-module-item/13" \
  -H "Authorization: Bearer {token}" \
  -d '{"spaceId":45,"customFieldsValues":[{"customFieldInputId":1397,"value":"TEST"}]}'
```
**Result**: ✅ 200 OK, ❌ Fields not saved

### **Test 2: Direct Field Names**
```bash
curl -X PUT "https://superseller.boost.space/api/custom-module-item/13" \
  -H "Authorization: Bearer {token}" \
  -d '{"spaceId":45,"workflow_name":"TEST"}'
```
**Result**: ⏳ **NOT YET TESTED**

### **Test 3: `customFields` Object**
```bash
curl -X PUT "https://superseller.boost.space/api/custom-module-item/13" \
  -H "Authorization: Bearer {token}" \
  -d '{"spaceId":45,"customFields":{"workflow_name":"TEST"}}'
```
**Result**: ⏳ **NOT YET TESTED**

---

## 🔧 **Next Steps**

1. **Test Format 2** (Direct field names as properties)
2. **Test Format 1** (`customFields` object)
3. **Check API Documentation** at https://apidoc.boost.space/ for exact format
4. **Contact Boost.space Support** if formats don't work

---

## 📚 **References**

- [Boost.space Custom Fields Documentation](https://docs.boost.space/knowledge-base/system/features/custom-fields-creation-usage/)
- [Boost.space Custom Module Guide](https://docs.boost.space/knowledge-base/system/modules-boost-space/boost-space-custom-module/)
- [Boost.space API Documentation](https://apidoc.boost.space/)

---

## ⚠️ **Current Status**

**Problem**: Custom fields are not being saved despite API returning 200 OK.

**Possible Causes**:
1. Wrong API format (using IDs instead of names)
2. Fields not properly assigned to space
3. API limitation for custom-module-item
4. Missing required parameters

**Workaround**: Manual entry via Boost.space UI until API format is confirmed.
