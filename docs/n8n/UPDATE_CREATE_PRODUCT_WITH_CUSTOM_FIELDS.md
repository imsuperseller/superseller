# Update Create Product Tool to Include Custom Fields

**Goal**: Update the "Create Product" HTTP Request Tool to populate `customFieldsValues` when creating products from n8n workflows.

---

## 🎯 Overview

The current "Create Product" tool only creates basic fields:
- ✅ `name`
- ✅ `description`
- ✅ `sku`
- ✅ `spaces`

**Missing**: `customFieldsValues` array with workflow metadata (86+ custom fields)

---

## 📋 Step 1: Get Custom Field IDs

### **Option A: Query via API** (Recommended for automation)

Add a Code node before the AI Agent to fetch field IDs:

**1. Add Code Node** (before "Format Workflows"):
- Name: "Get Custom Field IDs"
- Type: `n8n-nodes-base.code`

**2. Code** (using native fetch - no external modules):
```javascript
// Fetch custom field group for Products module using native fetch
const BOOST_SPACE_API_KEY = $env.BOOST_SPACE_API_KEY;
const FIELD_GROUP_ID = 479; // "n8n Workflow Fields (Products)" - UPDATE IF DIFFERENT

try {
  const response = await $http.get({
    url: `https://superseller.boost.space/api/custom-field/${FIELD_GROUP_ID}`,
    headers: {
      'Authorization': `Bearer ${BOOST_SPACE_API_KEY}`
    }
  });
  
  const fieldGroup = response;
  const fieldMap = {};
  
  // Map field names to input IDs
  if (fieldGroup.inputs && Array.isArray(fieldGroup.inputs)) {
    fieldGroup.inputs.forEach(input => {
      if (input.name) {
        fieldMap[input.name] = input.id;
      }
    });
  }
  
  return [{
    json: {
      customFieldMap: fieldMap,
      fieldGroupId: FIELD_GROUP_ID,
      totalFields: Object.keys(fieldMap).length
    }
  }];
} catch (error) {
  console.error('Error fetching field IDs:', error.message);
  return [{
    json: {
      customFieldMap: {},
      fieldGroupId: FIELD_GROUP_ID,
      error: error.message
    }
  }];
}
```

**⚠️ Alternative: Use HTTP Request Node Instead** (Recommended - simpler):

If Code node doesn't work, use an HTTP Request node:

**1. Add HTTP Request Node** (instead of Code node):
- Name: "Get Custom Field IDs"
- Type: `n8n-nodes-base.httpRequest`
- Method: `GET`
- URL: `https://superseller.boost.space/api/custom-field/479`
- Authentication: `Generic Credential Type` → `HTTP Bearer Auth` → `boost.space`
- Response Format: `JSON`

**2. Add Code Node** (to format the response):
- Name: "Format Field Map"
- Code:
```javascript
// Format HTTP response to field map
const fieldGroup = $input.first().json;
const fieldMap = {};

if (fieldGroup.inputs && Array.isArray(fieldGroup.inputs)) {
  fieldGroup.inputs.forEach(input => {
    if (input.name) {
      fieldMap[input.name] = input.id;
    }
  });
}

return [{
  json: {
    customFieldMap: fieldMap,
    fieldGroupId: 479,
    totalFields: Object.keys(fieldMap).length
  }
}];
```

**3. Connect**: Get Custom Field IDs → Format Workflows → AI Agent

---

### **Option B: Manual Lookup** (One-time setup)

1. Go to: `https://superseller.boost.space/settings/custom-field/`
2. Find field group: **"n8n Workflow Fields (Products)"** (ID: 479)
3. Note the field input IDs for key fields:
   - `workflow_name`: ID `???`
   - `workflow_id`: ID `???`
   - `category`: ID `???`
   - `status`: ID `???`
   - `n8n_instance`: ID `???`
   - `n8n_url`: ID `???`
   - etc.

---

## 📋 Step 2: Update Format Workflows Node

**Add custom field mapping to the Set node**:

**In "Format Workflows" Set Node**, add these fields:

1. **customFieldMap** (from "Get Custom Field IDs"):
   - Name: `customFieldMap`
   - Value: `{{ $('Get Custom Field IDs').item.json.customFieldMap }}`

2. **Keep existing fields**:
   - `n8nWorkflows`
   - `sessionId`
   - `chatInput`
   - `action`

---

## 📋 Step 3: Update Create Product Tool

### **Update JSON Body**:

**Current** (Basic fields only):
```json
{
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "description": "={{ $fromAI('Description', 'Enter product description (optional)', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID (optional)', 'string') }}",
  "spaces": [59]
}
```

**Updated** (With customFieldsValues):
```json
{
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "description": "={{ $fromAI('Description', 'Enter product description (optional)', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID (optional)', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ $fromAI('Custom_Fields', 'Enter customFieldsValues array as JSON string', 'string') }}"
}
```

**⚠️ Problem**: AI Agent can't easily generate the full `customFieldsValues` array with correct field IDs.

---

## 🎯 Better Solution: Use Code Node to Format Custom Fields

### **Add Code Node** (between Format Workflows and AI Agent):

**1. Add Code Node**:
- Name: "Prepare Custom Fields"
- Type: `n8n-nodes-base.code`

**2. Code**:
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

// Map workflow data to custom fields
const customFieldsValues = [];

// Core Fields
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

// Category (extract from workflow name prefix)
const categoryMap = {
  'INT-': 'Internal',
  'SUB-': 'Subscription',
  'MKT-': 'Marketing',
  'CUSTOMER-': 'Customer',
  'DEV-': 'Development'
};
let category = 'Internal';
for (const [prefix, cat] of Object.entries(categoryMap)) {
  if (workflow.name.startsWith(prefix)) {
    category = cat;
    break;
  }
}
if (fieldMap.category) {
  customFieldsValues.push({
    customFieldInputId: fieldMap.category,
    value: category
  });
}

// Status
let status = workflow.active ? '✅ Active' : '❌ Deprecated';
if (workflow.isArchived) {
  status = '❌ Deprecated';
}
if (fieldMap.status) {
  customFieldsValues.push({
    customFieldInputId: fieldMap.status,
    value: status
  });
}

// n8n Instance
if (fieldMap.n8n_instance) {
  customFieldsValues.push({
    customFieldInputId: fieldMap.n8n_instance,
    value: 'Rensto VPS' // Default, could be dynamic
  });
}

// n8n URL
if (fieldMap.n8n_url && workflow.id) {
  customFieldsValues.push({
    customFieldInputId: fieldMap.n8n_url,
    value: `http://173.254.201.134:5678/workflow/${workflow.id}`
  });
}

// Created Date
if (fieldMap.created_date && workflow.createdAt) {
  const date = workflow.createdAt.split('T')[0]; // Extract date part
  customFieldsValues.push({
    customFieldInputId: fieldMap.created_date,
    value: date
  });
}

// Version (extract from name)
const versionMatch = workflow.name.match(/v(\d+)/i);
if (fieldMap.version && versionMatch) {
  customFieldsValues.push({
    customFieldInputId: fieldMap.version,
    value: `v${versionMatch[1]}`
  });
}

// Node Count
if (fieldMap.node_count && workflow.nodeCount !== undefined) {
  customFieldsValues.push({
    customFieldInputId: fieldMap.node_count,
    value: workflow.nodeCount
  });
}

// Return prepared data
return [{
  json: {
    ...$input.first().json,
    preparedCustomFields: customFieldsValues,
    firstWorkflow: workflow // For AI Agent to use
  }
}];
```

**3. Connect**: Format Workflows → Prepare Custom Fields → AI Agent

---

## 📋 Step 4: Update Create Product Tool JSON Body

**Updated JSON Body** (with prepared custom fields):
```json
{
  "name": "={{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "description": "={{ $fromAI('Description', 'Enter product description (optional)', 'string') }}",
  "sku": "={{ $fromAI('SKU', 'Enter SKU or workflow ID (optional)', 'string') }}",
  "spaces": [59],
  "customFieldsValues": "={{ $json.preparedCustomFields || [] }}"
}
```

**⚠️ Note**: The `customFieldsValues` should come from the Code node output, not from AI Agent input.

---

## 📋 Step 5: Update AI Agent System Message

**Add to System Message** (in the "Create Product" section):

```
**Custom Fields**: When creating a product, include the `customFieldsValues` array from the input data (`preparedCustomFields` field). This array contains all workflow metadata mapped to custom field IDs. Use it directly in the Create Product tool's JSON body.
```

---

## ✅ Complete Workflow Flow

```
1. When chat message received
   ↓
2. Fetch n8n Workflows
   ↓
3. Get Custom Field IDs (NEW)
   ↓
4. Format Workflows (updated to include customFieldMap)
   ↓
5. Prepare Custom Fields (NEW - maps workflow to customFieldsValues)
   ↓
6. AI Agent (receives preparedCustomFields)
   ↓
7. Create Product (uses preparedCustomFields in customFieldsValues)
```

---

## 🧪 Testing

1. **Test**: "Sync missing workflows"
2. **Check**: "Get Custom Field IDs" node returns field map
3. **Verify**: "Prepare Custom Fields" creates customFieldsValues array
4. **Confirm**: "Create Product" includes customFieldsValues in request
5. **Validate**: Product in Boost.space has custom fields populated

---

## 📝 Notes

- **Field Group ID**: Update `FIELD_GROUP_ID = 479` if your field group has a different ID
- **Space ID**: Currently using Space 59, update if different
- **Field Mapping**: The Code node maps only essential fields. Add more fields as needed.
- **Error Handling**: If field IDs can't be fetched, customFieldsValues will be empty (product still created with basic fields)

---

**Last Updated**: November 30, 2025
