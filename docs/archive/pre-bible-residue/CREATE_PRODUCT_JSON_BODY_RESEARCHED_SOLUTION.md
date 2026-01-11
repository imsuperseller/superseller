# Create Product JSON Body - Researched Solution

**Research Findings**:
1. ✅ "Update Product" tool (line 147) uses: `"customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}` - **NO quotes**
2. ✅ Web search confirms: Arrays should be included directly: `"items": {{$json["items"]}}` - **NO quotes**
3. ❌ Current "Create Product" uses: `"customFieldsValues": "{{ JSON.stringify(...) }}"` - **WRONG** (wrapped in quotes, creates string)

**Root Cause**: When `jsonBody` starts with `=`, n8n evaluates the entire JSON as an expression. If `$input.item.json.preparedCustomFields` is undefined or the expression fails, it creates invalid JSON like `"customFieldsValues": undefined`.

---

## ✅ CORRECT Solution (Matches Working "Update Product" Pattern)

**Copy this EXACT string** and paste into "JSON Body" field:

```
={
  "name": "{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}
}
```

**Key Points** (matching "Update Product" pattern):
- ✅ Single `=` at start (not `==`)
- ✅ `{{ $fromAI(...) }}` (no `=` inside quotes)
- ✅ `"customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}` - **NO quotes around expression**
- ✅ `|| []` ensures it always returns an array (never undefined)

---

## 📋 Step-by-Step

1. **Open workflow**: `https://n8n.rensto.com/workflow/41dvc6epRUoQIyjs`
2. **Click "Create Product" node**
3. **Find "JSON Body" field**
4. **Delete everything**
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

## 🔍 Why This Works

**When `jsonBody` starts with `=`**:
- n8n evaluates the entire JSON body as an expression
- Each `{{ ... }}` expression is evaluated
- `{{ $input.item.json.preparedCustomFields || [] }}` evaluates to an array directly
- The `|| []` ensures it's always an array (never undefined)
- No quotes means it's inserted as an array, not a string

**Why `JSON.stringify()` doesn't work**:
- Wrapping in quotes: `"{{ JSON.stringify(...) }}"` creates a **string**
- The API expects an **array**, not a string
- Even if n8n parses it, the API will reject it

---

## ✅ Expected Result

After fixing:
- ✅ No JSON parsing errors
- ✅ Request body has all fields: `name`, `sku`, `spaces`, `customFieldsValues`
- ✅ `customFieldsValues` is a proper array (not a string)
- ✅ All 8 custom fields populated in Boost.space

---

**Last Updated**: November 30, 2025
