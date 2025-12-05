# Fix: Create Product - JSON Parsing Error

**Error**: `JSON parameter needs to be valid JSON`

**Root Cause**: The `customFieldsValues` field without quotes is causing JSON parsing issues when the expression evaluates. n8n needs the entire JSON body to be valid JSON after expression evaluation.

---

## 🔧 Fix: Use JSON.stringify for customFieldsValues

**The issue**: When `customFieldsValues` is unquoted like `{{ $input.item.json.preparedCustomFields || [] }}`, if the expression fails or returns undefined, it creates invalid JSON.

**Solution**: Wrap it in quotes and use `JSON.stringify()` to ensure it's always valid JSON:

---

## ✅ Correct JSON Body String

**Copy this EXACT string** and paste into "JSON Body" field:

```
={
  "name": "{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ JSON.stringify($input.item.json.preparedCustomFields || []) }}"
}
```

**Key Change**: 
- `"customFieldsValues": "={{ JSON.stringify($input.item.json.preparedCustomFields || []) }}"`
- Wrapped in quotes with `JSON.stringify()` to ensure it's always valid JSON
- n8n will parse the stringified JSON back to an array when sending the request

---

## 📋 Step-by-Step

1. **Open workflow**: `https://n8n.rensto.com/workflow/41dvc6epRUoQIyjs`
2. **Click "Create Product" node**
3. **Find "JSON Body" field**
4. **Delete everything**
5. **Paste the string above** (exactly as shown)
6. **Save** the workflow

---

## 🧪 Testing

1. **Test**: "Sync missing workflows"
2. **Check**: No JSON parsing errors
3. **Verify**: Product created with custom fields populated

---

## ✅ Expected Result

After fixing:
- ✅ No JSON parsing errors
- ✅ Request body has all fields: `name`, `sku`, `spaces`, `customFieldsValues`
- ✅ `customFieldsValues` is a proper array (not a string)
- ✅ All 8 custom fields populated in Boost.space

---

**Last Updated**: November 30, 2025
