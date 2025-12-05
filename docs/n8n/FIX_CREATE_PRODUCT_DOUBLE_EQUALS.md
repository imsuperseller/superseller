# Fix: Create Product - Double Equals Error

**Error**: `JSON parameter needs to be valid JSON`

**Root Cause**: Line 491 shows `"jsonBody": "=={"` - there's a **DOUBLE `==`** at the start! It should be a single `=`.

Also, the expression syntax doesn't match the pattern used by other tools.

---

## 🔧 Fix

**In "Create Product" HTTP Request Tool node**, update the JSON body:

**Current** (WRONG - has `==` and wrong expression syntax):
```json
=={
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ JSON.stringify($input.item.json.preparedCustomFields || []) }}"
}
```

**Fixed** (CORRECT - single `=` and correct expression syntax):
```json
={
  "name": "{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}
}
```

**Key Changes**:
1. **Remove one `=`**: Change `=={` to `={`
2. **Remove `=` from field values**: Change `"={{ $fromAI(...) }}"` to `"{{ $fromAI(...) }}"`
3. **Remove quotes from customFieldsValues**: Change `"customFieldsValues": "={{ JSON.stringify(...) }}"` to `"customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}`

**Why**: 
- The `=` prefix at the start tells n8n to evaluate the entire JSON body as an expression
- Inside the JSON, field values use `{{ ... }}` without the `=` prefix
- `customFieldsValues` should be an array, not a string, so no quotes around the expression

---

## 📋 Step-by-Step Fix

1. **Open workflow**: `https://n8n.rensto.com/workflow/41dvc6epRUoQIyjs`
2. **Click "Create Product" node** (HTTP Request Tool)
3. **Find "JSON Body" field**
4. **Replace entire JSON body with**:

```json
={
  "name": "{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}
}
```

5. **Save** the workflow

---

## ✅ Expected Result

After fixing:
- ✅ No JSON parsing errors
- ✅ Product created successfully
- ✅ `customFieldsValues` array properly populated with all 8 custom fields
- ✅ All custom fields appear in Boost.space

---

**Last Updated**: November 30, 2025
