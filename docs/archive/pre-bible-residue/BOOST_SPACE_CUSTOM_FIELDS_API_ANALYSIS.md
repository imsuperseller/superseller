# Boost.space Custom Fields API Analysis - Complete Investigation

**Date**: November 28, 2025  
**Status**: ⚠️ **API LIMITATION IDENTIFIED**

---

## 🔍 **Investigation Summary**

After extensive testing using:
- ✅ Official Boost.space API documentation (https://apidoc.boost.space/)
- ✅ Boost.space MCP tools (36 tools available)
- ✅ Direct API calls with exact schema format
- ✅ Multiple module types (contact, note, custom-module-item, product)

**Finding**: Custom fields **CANNOT be set via API** for `custom-module-item` records, despite:
- ✅ API accepting requests (200 OK)
- ✅ Format matching API documentation exactly
- ✅ Same format working for `contact` module
- ✅ All required fields present (`value`, `customFieldInputId`, `module`)

---

## 📋 **API Documentation Confirmation**

### **CustomFieldValue Schema** (from https://apidoc.boost.space/latest.json):
```json
{
  "required": ["value", "customFieldInputId", "module"],
  "properties": {
    "value": "string (required)",
    "customFieldInputId": "integer (required)",
    "module": "string (required)",
    "table": "string (optional - auto-loaded)",
    "entityId": "integer (optional - helps with linking)"
  }
}
```

### **CustomModuleItem Schema**:
```json
{
  "properties": {
    "customFieldsValues": {
      "type": "array",
      "items": { "$ref": "#/components/schemas/CustomFieldValue" }
    },
    "spaceId": "integer (required)",
    "statusSystemId": "integer (required)"
  }
}
```

### **PUT Endpoint**: `/api/custom-module-item/{customModuleItemId}`
- **Request Body**: `CustomModuleItem` schema
- **Response**: `CustomModuleItem` schema

---

## ✅ **What Works**

### **Contact Module** (Built-in Module):
```bash
curl -X PUT "https://superseller.boost.space/api/contact/81?spaceId=26" \
  -d '{"customFieldsValues":[{"customFieldInputId":1381,"value":"TEST","module":"contact"}]}'
```
**Result**: ✅ **WORKS** - Fields save successfully

### **Custom Field Configuration**:
- ✅ Fields created: 86 fields in field group 475
- ✅ Fields assigned to Space 45
- ✅ Fields linked to custom-module-item module
- ✅ Field IDs mapped correctly

---

## ❌ **What Doesn't Work**

### **Custom-Module-Item** (Custom Module):
```bash
curl -X PUT "https://superseller.boost.space/api/custom-module-item/13?spaceId=45" \
  -d '{"spaceId":45,"statusSystemId":94,"customFieldsValues":[{"customFieldInputId":1397,"value":"TEST","module":"custom-module-item"}]}'
```
**Result**: ❌ **DOES NOT WORK** - API returns 200 OK but fields are not saved

### **Note Module** (In Space 45):
```bash
curl -X PUT "https://superseller.boost.space/api/note/257?spaceId=45" \
  -d '{"customFieldsValues":[{"customFieldInputId":1397,"value":"TEST","module":"note"}]}'
```
**Result**: ❌ **DOES NOT WORK** - Same issue

---

## 🧪 **All Tested Formats**

1. ✅ `customFieldsValues` array with `customFieldInputId`, `value`, `module`
2. ✅ Added `table` property
3. ✅ Added `entityId` property
4. ✅ Field names as direct properties
5. ✅ `customFields` object format
6. ✅ `boostId` format
7. ✅ Via MCP tools (`update_record`, `bulk_upsert_records`)
8. ✅ Creating new records vs updating existing
9. ✅ Different field module assignments (`null`, `custom-module-item`, `note`)

**All formats**: API accepts (200 OK) but fields never persist.

---

## 💡 **Conclusion**

**Boost.space API has a limitation where custom fields cannot be set via API for custom modules (`custom-module-item`), even though:**
- The API documentation shows it should work
- The format is correct
- The same format works for built-in modules (contact)
- All required fields are present

**This appears to be either:**
1. A bug in Boost.space's API for custom modules
2. A missing feature (custom modules may require UI for custom fields)
3. A permission/configuration issue specific to custom modules

---

## ✅ **Working Solution: Use Built-in Modules**

Since `contact` module works perfectly with custom fields via API, **recommended approach**:

### **Option 1: Use Contact Module** (If workflow data fits)
- Contact module supports custom fields via API
- Can create custom fields and assign to spaces
- Proven to work

### **Option 2: Use Note Module** (If Space 45 is note-based)
- Space 45 is "n8n Workflows (Notes)" - it's a NOTE module space
- Note module supports custom fields (though API may have same limitation)
- Can store workflow data in note records

### **Option 3: Manual Entry** (Current workaround)
- Use UI to populate custom fields
- Script can generate JSON export for easy copy-paste

---

## 📚 **References**

- [Boost.space API Documentation](https://apidoc.boost.space/)
- [Custom Module Guide](https://docs.boost.space/knowledge-base/system/modules-boost-space/boost-space-custom-module/)
- [Custom Fields Documentation](https://docs.boost.space/knowledge-base/system/features/custom-fields-creation-usage/)

---

## 🎯 **Next Steps**

1. **Contact Boost.space Support** - Report API limitation for custom-module-item
2. **Consider Alternative**: Use `note` module in Space 45 (already configured)
3. **Use MCP Tools**: Continue using MCP tools for other operations (they work for standard fields)
4. **Manual Entry**: Use script-generated JSON for manual field population until API issue resolved
