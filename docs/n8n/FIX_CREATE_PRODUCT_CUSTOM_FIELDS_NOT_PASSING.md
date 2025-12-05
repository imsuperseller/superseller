# Fix: Create Product - Custom Fields Not Being Passed

**Problem**: `preparedCustomFields` array is created correctly (8 custom fields), but the product is created WITHOUT custom fields in Boost.space.

**Root Cause**: The "Create Product" HTTP Request Tool's JSON body expression `"customFieldsValues": "={{ $json.preparedCustomFields || [] }}"` is not evaluating correctly OR `preparedCustomFields` is not accessible in the tool's context.

---

## 🔍 Diagnosis

**Check Execution 28149**:
- ✅ "Prepare Custom Fields": Created `preparedCustomFields` with 8 fields
- ✅ Data passed to AI Agent
- ❌ "Create Product": Product created but NO custom fields populated

**Problem**: The JSON body expression is not working correctly.

---

## 🔧 Solution

### **Step 1: Verify JSON Body Expression**

**In "Create Product" HTTP Request Tool node**, check the JSON body:

**Current** (might not be working):
```json
{
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ $json.preparedCustomFields || [] }}"
}
```

**The issue**: The expression `$json.preparedCustomFields` might not be accessible because:
1. The AI Agent's tool context might not have direct access to `$json`
2. The data might need to be passed differently

### **Step 2: Use Direct Reference to Previous Node**

**Try using a direct reference to "Prepare Custom Fields" node**:

```json
{
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ $('Prepare Custom Fields').item.json.preparedCustomFields || [] }}"
}
```

**OR if the AI Agent has access to input data**:

```json
{
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ $input.item.json.preparedCustomFields || [] }}"
}
```

### **Step 3: Verify Expression Evaluation**

**Test the expression**:
1. Add a temporary "Set" node after "Prepare Custom Fields"
2. Add a field: `testCustomFields`
3. Value: `{{ $json.preparedCustomFields }}`
4. Check if it evaluates correctly

### **Step 4: Alternative - Pass via AI Agent Context**

**If direct reference doesn't work, the AI Agent needs to pass the data explicitly**:

**Update AI Agent System Message** to include:
```
When creating a product, the customFieldsValues must be populated from the preparedCustomFields array in the input data. The Create Product tool's JSON body references $json.preparedCustomFields, but if this doesn't work, you may need to pass the array directly in the tool call.
```

**However, this is complex with HTTP Request Tools**, so the better solution is to fix the expression.

---

## 🎯 Recommended Fix

### **Option 1: Use Direct Node Reference (Recommended)**

**In "Create Product" HTTP Request Tool JSON body**:

```json
{
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ $('Prepare Custom Fields').item.json.preparedCustomFields || [] }}"
}
```

### **Option 2: Use Input Reference**

**If the Create Product tool receives input from AI Agent**:

```json
{
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ $input.item.json.preparedCustomFields || [] }}"
}
```

### **Option 3: Verify Data Flow**

**Check the node connections**:
- "Prepare Custom Fields" → "AI Agent" (should pass `preparedCustomFields`)
- "AI Agent" → "Create Product" (should have access to input data)

**If "Create Product" is a sub-node of AI Agent**, it should have access to the AI Agent's input data.

---

## 🧪 Testing

1. **Test**: "Sync missing workflows"
2. **Check**: "Prepare Custom Fields" output has `preparedCustomFields` array
3. **Verify**: "Create Product" JSON body expression evaluates correctly
4. **Confirm**: Product created in Boost.space WITH custom fields populated

---

## ✅ Expected Result

After fixing:

1. **Product created with**:
   - ✅ `name`: Workflow name
   - ✅ `sku`: Workflow ID
   - ✅ `spaces`: [59]
   - ✅ `customFieldsValues`: Array with all 8 custom fields from `preparedCustomFields`

2. **In Boost.space**:
   - ✅ Custom fields from "n8n Workflow Fields (Products)" are populated
   - ✅ workflow_name, workflow_id, category, status, n8n_url, etc. all have values

---

**Last Updated**: November 30, 2025
