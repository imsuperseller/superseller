# Create Product JSON Body - CORRECT Final Version

**Current Issue**: Line 622 shows `=={` (double equals) and `customFieldsValues` has `={{ JSON.stringify(...) }}` which is wrong.

---

## ✅ CORRECT JSON Body String

**Copy this EXACT string** (no extra `=`, no `=` inside quotes for customFieldsValues):

```
={
  "name": "{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "{{ JSON.stringify($input.item.json.preparedCustomFields || []) }}"
}
```

**Key Points**:
- **Single `=` at start** (not `==`)
- **`{{ $fromAI(...) }}`** (no `=` inside quotes for name/sku)
- **`"{{ JSON.stringify(...) }}"`** (no `=` inside quotes for customFieldsValues - just `{{ ... }}`)

---

## 📋 Step-by-Step

1. **Open workflow**: `https://n8n.rensto.com/workflow/41dvc6epRUoQIyjs`
2. **Click "Create Product" node**
3. **Find "JSON Body" field**
4. **Delete EVERYTHING in that field**
5. **Paste this EXACT string**:

```
={
  "name": "{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "{{ JSON.stringify($input.item.json.preparedCustomFields || []) }}"
}
```

6. **Verify**:
   - Starts with `={` (single `=`)
   - `name` and `sku` use `{{ $fromAI(...) }}` (no `=` inside)
   - `customFieldsValues` uses `"{{ JSON.stringify(...) }}"` (no `=` inside the quotes)
7. **Save** the workflow

---

## ⚠️ Common Mistakes to Avoid

- ❌ `=={` (double equals)
- ❌ `"={{ $fromAI(...) }}"` (has `=` inside quotes)
- ❌ `"={{ JSON.stringify(...) }}"` (has `=` inside quotes)
- ✅ `={` (single equals)
- ✅ `"{{ $fromAI(...) }}"` (no `=` inside)
- ✅ `"{{ JSON.stringify(...) }}"` (no `=` inside)

---

## ✅ Expected Result

After fixing:
- ✅ No JSON parsing errors
- ✅ Request body has all fields: `name`, `sku`, `spaces`, `customFieldsValues`
- ✅ Product created successfully
- ✅ All 8 custom fields populated in Boost.space

---

**Last Updated**: November 30, 2025
