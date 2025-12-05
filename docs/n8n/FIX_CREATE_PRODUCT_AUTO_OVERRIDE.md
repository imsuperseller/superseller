# Fix: Create Product - Auto-Generated Override Issue

**Error**: `Field 'name' can't be empty`

**Root Cause**: n8n auto-generated an override for the JSON body:
```
"jsonBody": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('JSON', ``, 'json') }}"
```

This makes the AI Agent provide the entire JSON body as one parameter, which doesn't work correctly.

---

## 🔧 Fix: Disable Auto-Override and Use Manual JSON Body

### **Step 1: Open Create Product Node**

1. **Open workflow**: `https://n8n.rensto.com/workflow/41dvc6epRUoQIyjs`
2. **Click "Create Product" node** (HTTP Request Tool)

### **Step 2: Find and Remove Auto-Override**

1. **Look for "JSON Body" field**
2. **If you see**: `={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('JSON', ``, 'json') }}`
3. **This is the auto-override** - it needs to be replaced

### **Step 3: Set Manual JSON Body**

**Replace the JSON Body with**:

```json
={
  "name": "{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}
}
```

**Key Points**:
- Single `=` at start
- `{{ $fromAI(...) }}` (no `=` inside quotes)
- `customFieldsValues` without quotes (evaluates to array)

### **Step 4: Verify Settings**

**Check these settings in the node**:
- **Send Body**: ✅ Enabled
- **Body Content Type**: `JSON`
- **Specify Body**: `JSON`
- **JSON Body**: (the expression above)

### **Step 5: Save and Test**

1. **Save** the workflow
2. **Test**: "Sync missing workflows"
3. **Check**: Request body contains `name`, `sku`, `spaces`, and `customFieldsValues`

---

## 🎯 Why This Happens

n8n sometimes auto-generates overrides for HTTP Request Tools when it detects `$fromAI()` usage. This override tries to make the AI Agent provide the entire JSON body, but it doesn't work correctly for complex structures.

**Solution**: Manually set the JSON body with individual `$fromAI()` calls for each field.

---

## ✅ Expected Result

After fixing:
- ✅ Request body has all fields: `name`, `sku`, `spaces`, `customFieldsValues`
- ✅ Product created successfully
- ✅ All 8 custom fields populated in Boost.space

---

**Last Updated**: November 30, 2025
