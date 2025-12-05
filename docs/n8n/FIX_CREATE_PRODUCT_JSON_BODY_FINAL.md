# Fix: Create Product JSON Body - Final Correct Format

**Error**: Request body only contains `"preparedCustomFields": []` - missing `name`, `sku`, `spaces`.

**Root Cause**: The JSON body has `=={` (double equals) and incorrect expression syntax. The `$fromAI()` calls aren't being evaluated.

---

## 🔧 Fix: Use Correct Pattern (Matches Other Tools)

**Looking at "Update Product" tool (line 147)**, the correct pattern is:

```json
"jsonBody": "={\n  \"name\": \"{{ $fromAI('Product_Name', 'Enter new product name (optional)', 'string') }}\",\n  \"description\": \"{{ $fromAI('Description', 'Enter new description (optional)', 'string') }}\",\n  \"sku\": \"{{ $fromAI('SKU', 'Enter new SKU (optional)', 'string') }}\"\n}"
```

**Key Pattern**:
- Single `=` at start
- `{{ $fromAI(...) }}` (NO `=` inside the quotes)
- Entire JSON is a string that gets evaluated

---

## ✅ Correct JSON Body for Create Product

**In "Create Product" HTTP Request Tool node**, set JSON body to:

```json
={
  "name": "{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}
}
```

**Important**:
- Single `=` at start (not `==`)
- `{{ $fromAI(...) }}` (no `=` inside quotes)
- `customFieldsValues` without quotes around the expression (so it evaluates to an array, not a string)

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

## 🧪 Testing

1. **Test**: "Sync missing workflows"
2. **Check**: Request body contains `name`, `sku`, `spaces`, and `customFieldsValues`
3. **Verify**: Product created successfully with all fields populated

---

## ✅ Expected Result

After fixing:
- ✅ Request body has all fields: `name`, `sku`, `spaces`, `customFieldsValues`
- ✅ Product created successfully
- ✅ All 8 custom fields populated in Boost.space

---

**Last Updated**: November 30, 2025
