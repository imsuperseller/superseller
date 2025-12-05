# Fix: Create Product - Equals Prefix Issue & Missing Custom Fields

**Problem**: 
1. Product fields have `=` prefix (e.g., `"name": "=CUSTOMER-WHATSAPP-002A..."`) - treated as string literals
2. `description` and `invoice_description` are being populated (shouldn't be)
3. Custom fields from `preparedCustomFields` are NOT appearing in the product

**Root Cause**: 
- The AI Agent is providing values with `=` prefix OR the HTTP Request Tool JSON body has incorrect `$fromAI()` expressions
- `description` field is still in the JSON body (should be removed)
- `customFieldsValues` is not being correctly passed to the API

---

## 🔧 Fix

### **Step 1: Fix "Create Product" HTTP Request Tool JSON Body**

**In "Create Product" HTTP Request Tool node**, the JSON body should be EXACTLY:

```json
{
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ $json.preparedCustomFields || [] }}"
}
```

**⚠️ CRITICAL**:
- **NO `=` prefix** in the field values (just `{{ ... }}`, not `={{ ... }}`)
- **NO `description` field** at all
- **NO `invoice_description` field** at all
- **`customFieldsValues`** must reference `$json.preparedCustomFields`

**WRONG** (what's causing the issue):
```json
{
  "name": "={{ $fromAI('Product_Name', ...) }}",  // ❌ Has `=` prefix
  "description": "={{ $fromAI('Description', ...) }}",  // ❌ Should not exist
  "sku": "={{ $fromAI('SKU', ...) }}",  // ❌ Has `=` prefix
  "spaces": [59]
  // ❌ Missing customFieldsValues
}
```

**CORRECT**:
```json
{
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ $json.preparedCustomFields || [] }}"
}
```

**Note**: The `={{ ... }}` syntax is CORRECT for n8n expressions. The `=` prefix in the JSON body is correct. The problem is that the AI Agent is providing values that already have `=` prefix, which then gets double-prefixed.

---

### **Step 2: Update AI Agent System Message**

**In "AI Agent" node**, update the System Message to explicitly tell it NOT to include `=` prefix:

```
You are a workflow synchronization assistant. Your task is to sync n8n workflows to Boost.space as products.

**CRITICAL RULES**:
1. When creating a product, provide ONLY:
   - Product_Name: The workflow name (NO `=` prefix, just the name)
   - SKU: The workflow ID (NO `=` prefix, just the ID)
2. DO NOT provide description, invoice_description, price, or any other standard product fields
3. The customFieldsValues will be automatically populated from preparedCustomFields - you don't need to provide individual custom field values
4. When providing values to $fromAI(), provide the ACTUAL VALUE, not an expression with `=` prefix

**Example**:
- ✅ Product_Name: "CUSTOMER-WHATSAPP-002A: Human-in-Loop - Question Handler"
- ❌ Product_Name: "=CUSTOMER-WHATSAPP-002A: Human-in-Loop - Question Handler"

**Workflow**:
1. Query existing products in Space 59 (check if workflow ID exists in product SKUs)
2. Compare with the n8nWorkflows array from input
3. Find the first workflow NOT in Boost.space
4. Create product using "Create Product" tool with:
   - Product_Name: workflow name (actual value, no `=` prefix)
   - SKU: workflow ID (actual value, no `=` prefix)
   - The tool will automatically use preparedCustomFields for custom fields
5. Report: "Created product for [name] (ID: [id]). Remaining: [count]."

**Incremental Sync**: Process ONE workflow at a time. After creating a product, report success and wait for the next request.
```

---

### **Step 3: Verify "Prepare Custom Fields" Output**

**Check that "Prepare Custom Fields" Code node is outputting**:

```json
{
  "preparedCustomFields": [
    {
      "customFieldInputId": 1743,
      "value": "CUSTOMER-WHATSAPP-002A: Human-in-Loop - Question Handler"
    },
    {
      "customFieldInputId": 1749,
      "value": "0Cyp9kWJ0oUPNx2L"
    },
    // ... more fields
  ]
}
```

**This should be passed to the AI Agent and then to the "Create Product" tool.**

---

### **Step 4: Test the Request Body**

**After fixing, test and check the actual HTTP request body**:

1. **Run the workflow**
2. **Check "Create Product" node execution**
3. **Verify the request body**:
   ```json
   {
     "name": "CUSTOMER-WHATSAPP-002A: Human-in-Loop - Question Handler",  // ✅ No `=` prefix
     "sku": "0Cyp9kWJ0oUPNx2L",  // ✅ No `=` prefix
     "spaces": [59],
     "customFieldsValues": [  // ✅ Array with custom fields
       {
         "customFieldInputId": 1743,
         "value": "CUSTOMER-WHATSAPP-002A: Human-in-Loop - Question Handler"
       },
       // ... more fields
     ]
   }
   ```

---

## ✅ Expected Result

After fixing:

1. **Product created with**:
   - ✅ `name`: "CUSTOMER-WHATSAPP-002A: Human-in-Loop - Question Handler" (no `=` prefix)
   - ✅ `sku`: "0Cyp9kWJ0oUPNx2L" (no `=` prefix)
   - ✅ `spaces`: [59]
   - ✅ `customFieldsValues`: Array with all 8 custom fields populated

2. **Standard product fields**:
   - ❌ `description`: null or empty (NOT populated)
   - ❌ `invoice_description`: null or empty (NOT populated)
   - ❌ `price`: null (NOT populated)

3. **Custom fields**:
   - ✅ All populated from "n8n Workflow Fields (Products)" field group (workflow_name, workflow_id, category, status, n8n_url, etc.)

---

## 🧪 Testing

1. **Test**: "Sync missing workflows"
2. **Check**: Product created in Boost.space
3. **Verify**: 
   - No `=` prefix in name/sku
   - No description/invoice_description populated
   - Custom fields are populated (check in Boost.space UI)

---

**Last Updated**: November 30, 2025
