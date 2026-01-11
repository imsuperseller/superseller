# Create Product JSON Body - MCP Update Attempt Failed

**Status**: MCP `update_partial_workflow` tool is rejecting the request with validation error: "request/body must NOT have additional properties"

**Manual Fix Required**: Please apply the fix manually in the n8n UI.

---

## ✅ CORRECT JSON Body (Copy This Exact String)

**In the "Create Product" node (HTTP Request Tool), replace the `jsonBody` field with:**

```
={
  "name": "{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}
}
```

**Key Changes**:
- ✅ Single `=` at start (not `==`)
- ✅ `{{ $fromAI(...) }}` (no `=` inside quotes)
- ✅ `"customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}` - **NO quotes around expression, NO JSON.stringify()**

---

## 📋 Step-by-Step Manual Fix

1. **Open workflow**: `https://n8n.rensto.com/workflow/41dvc6epRUoQIyjs`
2. **Click "Create Product" node** (HTTP Request Tool, ID: `c5f715f4-9808-4872-98d9-bd9cd11a179a`)
3. **Find "JSON Body" field** (in Parameters section)
4. **Delete everything in the field**
5. **Paste this EXACT string**:

```
={
  "name": "{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}
}
```

6. **Verify**:
   - Starts with `={` (single `=`)
   - `name` and `sku` use `{{ $fromAI(...) }}` (no `=` inside)
   - `customFieldsValues` uses `{{ $input.item.json.preparedCustomFields || [] }}` (no quotes, no JSON.stringify)
7. **Save** the workflow

---

## 🔍 Why This Matches Working Pattern

**"Update Product" tool (line 147) uses the same pattern**:
```
"customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}
```

**No quotes = array directly inserted**
**No JSON.stringify() = not converted to string**

---

## ✅ Expected Result

After fixing:
- ✅ No JSON parsing errors
- ✅ Request body has all fields: `name`, `sku`, `spaces`, `customFieldsValues`
- ✅ `customFieldsValues` is a proper array (not a string)
- ✅ All 8 custom fields populated in Boost.space

---

**Last Updated**: November 30, 2025
