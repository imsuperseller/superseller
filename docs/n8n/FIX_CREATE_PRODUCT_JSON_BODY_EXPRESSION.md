# Fix: Create Product JSON Body Expression

**Current Issue**: Line 491 in workflow shows:
```json
"customFieldsValues": "={{ $('Prepare Custom Fields').item.json.preparedCustomFields || [] }}"
```

**Problem**: This expression doesn't work in HTTP Request Tool context because it tries to reference a node that's not in the tool's execution path.

**Solution**: Use `$input.item.json.preparedCustomFields` instead, since "Prepare Custom Fields" feeds into "AI Agent", and the tool has access to the AI Agent's input.

---

## 🔧 Fix

**In "Create Product" HTTP Request Tool node**, update the JSON body:

**Current** (Line 491 - WRONG):
```json
{
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ $('Prepare Custom Fields').item.json.preparedCustomFields || [] }}"
}
```

**Fixed** (CORRECT):
```json
{
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}
}
```

**Key Change**: 
- Remove quotes around the expression: `{{ $input.item.json.preparedCustomFields || [] }}`
- Use `$input.item.json` instead of `$('Prepare Custom Fields').item.json`

---

## 📋 Step-by-Step

1. **Open workflow**: `https://n8n.rensto.com/workflow/41dvc6epRUoQIyjs`
2. **Click "Create Product" node** (HTTP Request Tool)
3. **Find "JSON Body" field**
4. **Update the `customFieldsValues` line**:
   - Change: `"customFieldsValues": "={{ $('Prepare Custom Fields').item.json.preparedCustomFields || [] }}"`
   - To: `"customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}`
5. **Save** the workflow

---

## ✅ Expected Result

After fixing:
- Product created with `customFieldsValues` populated
- All 8 custom fields appear in Boost.space
- workflow_name, workflow_id, category, status, n8n_url, etc. all have values

---

**Last Updated**: November 30, 2025
