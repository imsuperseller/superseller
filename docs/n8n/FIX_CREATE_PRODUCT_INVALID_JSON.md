# Fix: Create Product - Invalid JSON Error

**Error**: `JSON parameter needs to be valid JSON`

**Root Cause**: The JSON body expression is malformed. The `customFieldsValues` field needs to be properly formatted as an array, not a string.

---

## 🔧 Fix

**In "Create Product" HTTP Request Tool node**, update the JSON body:

**Current** (INVALID - causes error):
```json
{
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}
}
```

**Problem**: When `jsonBody` starts with `=`, the entire body is treated as an expression. But mixing string expressions with unquoted expressions causes JSON parsing errors.

**Fixed** (CORRECT - Option 1 - Recommended):
```json
={
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ JSON.stringify($input.item.json.preparedCustomFields || []) }}"
}
```

**OR** (Option 2 - Alternative):
```json
={{ JSON.stringify({
  "name": $fromAI('Product_Name', 'Enter the product/workflow name', 'string'),
  "sku": $fromAI('SKU', 'Enter SKU or workflow ID', 'string'),
  "spaces": [59],
  "customFieldsValues": $input.item.json.preparedCustomFields || []
}) }}
```

**However**, `$fromAI()` only works in the HTTP Request Tool's special context, so Option 1 is better.

---

## 📋 Step-by-Step Fix

1. **Open workflow**: `https://n8n.rensto.com/workflow/41dvc6epRUoQIyjs`
2. **Click "Create Product" node** (HTTP Request Tool)
3. **Find "JSON Body" field**
4. **Replace entire JSON body with**:

```json
={
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ JSON.stringify($input.item.json.preparedCustomFields || []) }}"
}
```

**Key Changes**:
- Keep the `=` prefix at the start
- Wrap `customFieldsValues` value in quotes: `"={{ JSON.stringify(...) }}"`
- Use `JSON.stringify()` to ensure it's a valid JSON string that gets parsed as an array
- Use `$input.item.json.preparedCustomFields` instead of `$('Prepare Custom Fields').item.json.preparedCustomFields`

5. **Save** the workflow

---

## 🧪 Testing

1. **Test**: "Sync missing workflows"
2. **Check**: No JSON parsing errors
3. **Verify**: Product created with custom fields populated

---

## ✅ Expected Result

After fixing:
- ✅ No JSON parsing errors
- ✅ Product created successfully
- ✅ `customFieldsValues` array properly populated with all 8 custom fields
- ✅ All custom fields appear in Boost.space

---

**Last Updated**: November 30, 2025
