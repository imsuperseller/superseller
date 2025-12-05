# Fix: Create Product - Only Custom Fields, No Standard Fields

**Problem**: Product is created with irrelevant standard fields (Invoice description, short description, discounted price with zeros, etc.) but **custom fields from "n8n Workflow Fields (Products)" are NOT populated**.

**Root Cause**: The "Create Product" HTTP Request Tool is sending standard product fields that the AI Agent is filling with irrelevant values, and it's NOT using the `preparedCustomFields` from the input data.

---

## 🎯 Solution: Minimize Standard Fields, Use Only Custom Fields

**Goal**: Only send `name`, `sku`, `spaces`, and `customFieldsValues`. Remove all other standard product fields.

---

## 🔧 Fix the "Create Product" HTTP Request Tool

### **Step 1: Update JSON Body**

**In "Create Product" HTTP Request Tool node**, update the JSON body to:

```json
{
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ $json.preparedCustomFields || [] }}"
}
```

**Remove these fields** (if present):
- ❌ `description`
- ❌ `shortDescription`
- ❌ `price`
- ❌ `discountedPrice`
- ❌ `discountedPriceIncludingVat`
- ❌ `stockCardAverage`
- ❌ `discount`
- ❌ Any other standard product fields

---

### **Step 2: Update AI Agent System Message**

**In "AI Agent" node**, update the System Message to emphasize using `preparedCustomFields`:

```
You are a workflow synchronization assistant. Your task is to sync n8n workflows to Boost.space as products.

**CRITICAL RULES**:
1. When creating a product, you MUST use the `preparedCustomFields` array from the input data (available as `$json.preparedCustomFields`)
2. DO NOT fill standard product fields like description, price, discountedPrice, etc. - these are NOT needed
3. ONLY provide:
   - Product_Name: The workflow name
   - SKU: The workflow ID
4. The `customFieldsValues` will be automatically populated from `preparedCustomFields` - you don't need to provide individual custom field values

**Workflow**:
1. Query existing products in Space 59 (check if workflow ID exists in product SKUs)
2. Compare with the n8nWorkflows array from input
3. Find the first workflow NOT in Boost.space
4. Create product using "Create Product" tool with:
   - Product_Name: workflow name
   - SKU: workflow ID
   - The tool will automatically use preparedCustomFields for custom fields
5. Report: "Created product for [name] (ID: [id]). Remaining: [count]."

**Incremental Sync**: Process ONE workflow at a time. After creating a product, report success and wait for the next request.
```

---

### **Step 3: Verify "Prepare Custom Fields" Code Node**

**Ensure "Prepare Custom Fields" Code node is correctly creating the array**:

```javascript
// Get workflow data and custom field map
const workflow = $input.first().json.n8nWorkflows?.[0]; // First workflow to sync
const fieldMap = $input.first().json.customFieldMap || {};

if (!workflow || !fieldMap || Object.keys(fieldMap).length === 0) {
  // No custom fields available, return empty array
  return [{
    json: {
      ...$input.first().json,
      preparedCustomFields: []
    }
  }];
}

const customFieldsValues = [];

// Map workflow data to custom fields
if (fieldMap.workflow_name && workflow.name) {
  customFieldsValues.push({
    customFieldInputId: fieldMap.workflow_name,
    value: workflow.name
  });
}

if (fieldMap.workflow_id && workflow.id) {
  customFieldsValues.push({
    customFieldInputId: fieldMap.workflow_id,
    value: workflow.id
  });
}

if (fieldMap.workflow_name_original && workflow.name) {
  customFieldsValues.push({
    customFieldInputId: fieldMap.workflow_name_original,
    value: workflow.name
  });
}

// Category: Determine from workflow name prefix
if (fieldMap.category) {
  let category = 'Internal';
  if (workflow.name.startsWith('CUSTOMER-')) category = 'Customer';
  else if (workflow.name.startsWith('SUB-')) category = 'Subscription';
  else if (workflow.name.startsWith('MKT-')) category = 'Marketing';
  else if (workflow.name.startsWith('DEV-')) category = 'Development';
  else if (workflow.name.startsWith('INT-')) category = 'Internal';
  else if (workflow.name.startsWith('STRIPE-')) category = 'Stripe';
  else if (workflow.name.startsWith('TYPEFORM-')) category = 'Typeform';
  
  customFieldsValues.push({
    customFieldInputId: fieldMap.category,
    value: category
  });
}

// Status: Based on active and isArchived
if (fieldMap.status) {
  let status = '✅ Active';
  if (!workflow.active) status = '❌ Inactive';
  if (workflow.isArchived) status = '❌ Deprecated';
  
  customFieldsValues.push({
    customFieldInputId: fieldMap.status,
    value: status
  });
}

// n8n_instance
if (fieldMap.n8n_instance) {
  customFieldsValues.push({
    customFieldInputId: fieldMap.n8n_instance,
    value: 'Rensto VPS'
  });
}

// n8n_url
if (fieldMap.n8n_url && workflow.id) {
  customFieldsValues.push({
    customFieldInputId: fieldMap.n8n_url,
    value: `http://173.254.201.134:5678/workflow/${workflow.id}`
  });
}

// created_date
if (fieldMap.created_date && workflow.createdAt) {
  const date = new Date(workflow.createdAt);
  customFieldsValues.push({
    customFieldInputId: fieldMap.created_date,
    value: date.toISOString().split('T')[0] // YYYY-MM-DD format
  });
}

// node_count (if available in workflow object)
if (fieldMap.node_count && workflow.nodeCount !== undefined) {
  customFieldsValues.push({
    customFieldInputId: fieldMap.node_count,
    value: workflow.nodeCount.toString()
  });
}

return [{
  json: {
    ...$input.first().json,
    preparedCustomFields: customFieldsValues,
    firstWorkflow: workflow
  }
}];
```

---

## ✅ Expected Result

After fixing:

1. **Product created with**:
   - ✅ `name`: Workflow name
   - ✅ `sku`: Workflow ID
   - ✅ `spaces`: [59]
   - ✅ `customFieldsValues`: Array with all custom fields from "n8n Workflow Fields (Products)"

2. **Standard product fields**:
   - ❌ NOT populated (description, price, etc. are empty/null)

3. **Custom fields**:
   - ✅ All populated from `preparedCustomFields` (workflow_name, workflow_id, category, status, n8n_url, etc.)

---

## 🧪 Testing

1. **Test**: "Sync missing workflows"
2. **Check**: Product created in Boost.space
3. **Verify**: Only custom fields are populated (no standard fields with irrelevant values)
4. **Confirm**: All custom fields from Field Group 479 are present

---

**Last Updated**: November 30, 2025
