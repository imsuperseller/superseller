# Create Product JSON Body - Exact String to Paste

**Copy this EXACT string** and paste it into the "JSON Body" field:

```
={
  "name": "{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}
}
```

---

## 📋 Step-by-Step

1. **Open workflow**: `https://n8n.rensto.com/workflow/41dvc6epRUoQIyjs`
2. **Click "Create Product" node**
3. **Find "JSON Body" field**
4. **Delete everything in that field**
5. **Paste the string above** (copy the entire block including the `={` at the start)
6. **Save** the workflow

---

## ⚠️ Important Notes

- **Keep the `=` at the start** - this tells n8n to evaluate it as an expression
- **Don't add extra quotes** - the string above is exactly what n8n expects
- **If n8n auto-converts it**, try pasting in "Code" mode or "Raw" mode if available
- **The `customFieldsValues` line has NO quotes** around the expression (so it evaluates to an array, not a string)

---

**Last Updated**: November 30, 2025
