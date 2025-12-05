# Fix: Get Custom Field IDs Node - Axios Not Allowed

**Error**: `Module 'axios' is disallowed [line 2]`

**Root Cause**: n8n Code nodes don't allow external modules like `axios`. Use HTTP Request node instead.

---

## ✅ Solution: Use HTTP Request Node

### **Step 1: Delete the Code Node**

Delete the "Get Custom Field IDs" Code node.

---

### **Step 2: Add HTTP Request Node**

**1. Add HTTP Request Node**:
- Name: "Get Custom Field IDs"
- Type: `n8n-nodes-base.httpRequest`
- Version: `4.3` (or latest)

**2. Configuration**:
- **Method**: `GET`
- **URL**: `https://superseller.boost.space/api/custom-field/479`
  - (Update `479` if your field group ID is different)
- **Authentication**: 
  - Type: `Generic Credential Type`
  - Credential Type: `HTTP Bearer Auth`
  - Credential Name: `boost.space`
- **Response Format**: `JSON`
- **Options**:
  - Timeout: `30000` (30 seconds)

**3. Connect**: 
- Input: From "Fetch n8n Workflows" (or wherever you want to fetch field IDs)
- Output: To "Format Field Map" (next step)

---

### **Step 3: Add Code Node to Format Response**

**1. Add Code Node**:
- Name: "Format Field Map"
- Type: `n8n-nodes-base.code`

**2. Code** (no external modules):
```javascript
// Format HTTP response to field map
const fieldGroup = $input.first().json;
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
    fieldGroupId: 479,
    totalFields: Object.keys(fieldMap).length,
    // Preserve original data if needed
    ...$input.first().json
  }
}];
```

**3. Connect**: 
- Input: From "Get Custom Field IDs" HTTP Request node
- Output: To "Format Workflows" Set node

---

### **Step 4: Update Format Workflows Node**

**In "Format Workflows" Set Node**, add:

**Field**: `customFieldMap`
- **Name**: `customFieldMap`
- **Value**: `{{ $('Format Field Map').item.json.customFieldMap }}`

**Keep all existing fields**:
- `n8nWorkflows`
- `sessionId`
- `chatInput`
- `action`

---

## 🔄 Updated Workflow Flow

```
1. When chat message received
   ↓
2. Fetch n8n Workflows
   ↓
3. Get Custom Field IDs (HTTP Request Node) ✅
   ↓
4. Format Field Map (Code Node) ✅
   ↓
5. Format Workflows (Set Node - includes customFieldMap)
   ↓
6. Prepare Custom Fields (Code Node)
   ↓
7. AI Agent
   ↓
8. Create Product (with customFieldsValues)
```

---

## 🧪 Testing

1. **Test**: Run the workflow
2. **Check**: "Get Custom Field IDs" HTTP Request returns field group data
3. **Verify**: "Format Field Map" creates `customFieldMap` object
4. **Confirm**: "Format Workflows" includes `customFieldMap` in output
5. **Validate**: Custom fields are populated in created products

---

## 📝 Notes

- **Field Group ID**: Update `479` in the HTTP Request URL if your field group has a different ID
- **No External Modules**: Code nodes only use native JavaScript and n8n's built-in functions
- **HTTP Request Node**: This is the recommended way to make API calls in n8n workflows

---

**Last Updated**: November 30, 2025
