# Boost.space API Custom Fields - Final Research Report

**Date**: November 28, 2025  
**Issue**: Custom fields not saving via API for `custom-module-item` records  
**Status**: ❌ **API LIMITATION IDENTIFIED**

---

## 🔍 **Research Summary**

After extensive testing and research, **none of the API formats successfully save custom fields** for `custom-module-item` records, despite the API returning 200 OK responses.

---

## 🧪 **Tested Formats (All Failed)**

### **Format 1: `customFieldsValues` Array**
```json
{
  "spaceId": 45,
  "customFieldsValues": [
    {"customFieldInputId": 1397, "value": "INT-LEAD-001"}
  ]
}
```
**Result**: ✅ 200 OK, ❌ Fields not saved

### **Format 2: Direct Field Names**
```json
{
  "spaceId": 45,
  "workflow_name": "INT-LEAD-001"
}
```
**Result**: ✅ 200 OK, ❌ Fields not saved

### **Format 3: `customFields` Object**
```json
{
  "spaceId": 45,
  "customFields": {
    "workflow_name": "INT-LEAD-001"
  }
}
```
**Result**: ✅ 200 OK, ❌ Fields not saved

### **Format 4: `boostId` Format**
```json
{
  "spaceId": 45,
  "CustomFieldInput01397": "INT-LEAD-001"
}
```
**Result**: ✅ 200 OK, ❌ Fields not saved

### **Format 5: PATCH Method**
```json
PATCH /api/custom-module-item/13
{"workflow_name": "INT-LEAD-001"}
```
**Result**: ✅ 200 OK, ❌ Fields not saved

---

## 📊 **Findings**

1. **API Accepts All Formats**: All formats return 200 OK
2. **Fields Never Save**: No format actually persists custom field values
3. **Record Structure**: Records have `customFieldsValues` array (empty) but API doesn't populate it
4. **Field Assignment**: All 86 fields are assigned to Space 45
5. **Field Definitions**: Fields exist with correct IDs and names

---

## 💡 **Conclusion**

**The Boost.space API for `custom-module-item` appears to have a limitation where custom fields cannot be set via API, even though the API accepts the requests.**

This could be:
1. **API Bug**: The endpoint accepts requests but doesn't process custom fields
2. **UI-Only Feature**: Custom fields for custom modules may only be settable via UI
3. **Missing Endpoint**: There may be a separate endpoint for custom field updates
4. **Permission Issue**: API token may not have permission to set custom fields

---

## ✅ **Workaround**

**Manual Entry via Boost.space UI**:
1. Navigate to: https://superseller.boost.space/list/custom-module-item/13
2. Click "Edit" on the record
3. Fill in the 86 custom fields manually
4. Save the record

**Alternative**: Use the script to generate a JSON file with all field values for easy copy-paste.

---

## 📚 **References**

- [Boost.space Custom Fields Documentation](https://docs.boost.space/knowledge-base/system/features/custom-fields-creation-usage/)
- [Boost.space API Documentation](https://apidoc.boost.space/)
- Research document: `/docs/n8n/BOOST_SPACE_API_CUSTOM_FIELDS_RESEARCH.md`

---

## 🎯 **Next Steps**

1. **Contact Boost.space Support** to confirm if custom fields can be set via API
2. **Check API Documentation** for any special requirements
3. **Use Manual Entry** as workaround until API issue is resolved
4. **Create JSON Export Script** to generate field values for easy manual entry
