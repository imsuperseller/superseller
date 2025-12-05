# Fix: Invalid Syntax Error in User Prompt

**Error**: `invalid syntax` in AI Agent node

**Root Cause**: Cannot nest `{{ }}` expressions inside template literals (backticks) within n8n expressions.

**Problem Code**:
```javascript
={{ $json.task || $json.instruction || `Sync... Available workflows: {{ JSON.stringify($json.n8nWorkflows || []) }}` }}
```

The `{{ }}` inside the backticks conflicts with n8n's expression parser.

---

## 🔧 Fix Options

### **Option 1: Use String Concatenation (Recommended)**

**Replace the User Prompt with**:
```javascript
={{ $json.task || $json.instruction || 'Sync the first missing n8n workflow to Boost.space. Available workflows: ' + JSON.stringify($json.n8nWorkflows || []) + '. Instructions: 1. Query existing products in Space 59. 2. Compare with the workflows list above. 3. Find the first workflow NOT in Boost.space (check if workflow ID exists in product SKUs). 4. Create product for that workflow (name, description=name, sku=workflow ID, spaces=[59]). 5. Report: "Created product for [name] (ID: [id]). Remaining: [count]."' }}
```

---

### **Option 2: Use Code Node to Format Prompt First (Better for Long Prompts)**

**1. Add Code Node** before AI Agent:
- Name: "Format User Prompt"
- Type: `n8n-nodes-base.code`

**2. Code**:
```javascript
const workflows = $input.first().json.n8nWorkflows || [];
const chatInput = $input.first().json.chatInput || 'Sync missing workflows';

const userPrompt = `Sync the first missing n8n workflow to Boost.space.

Available workflows: ${JSON.stringify(workflows)}

Instructions:
1. Query existing products in Space 59
2. Compare with the workflows list above
3. Find the first workflow NOT in Boost.space (check if workflow ID exists in product SKUs)
4. Create product for that workflow (name, description=name, sku=workflow ID, spaces=[59])
5. Report: "Created product for [name] (ID: [id]). Remaining: [count]."`;

return [{
  json: {
    ...$input.first().json,
    instruction: userPrompt
  }
}];
```

**3. Update AI Agent User Prompt**:
```javascript
={{ $json.instruction || $json.task || 'Sync missing workflows' }}
```

**4. Connect**: Format Workflows → Format User Prompt → AI Agent

---

### **Option 3: Simpler Prompt Without Embedding Data**

**If embedding the full array is too long**, use a simpler approach:

```javascript
={{ $json.task || $json.instruction || 'Sync the first missing n8n workflow to Boost.space. The n8n workflows are available in the input JSON under the field "n8nWorkflows" as an array. Query existing products in Space 59, compare workflow IDs with product SKUs, find the first missing workflow, create a product (name, description=name, sku=workflow ID, spaces=[59]), and report the result.' }}
```

**Then update System Message** to tell AI Agent to access input data:
```
**Input Data**: The n8n workflow list is provided in the input JSON under the field `n8nWorkflows` as an array. Access this data directly from the input JSON. The workflows array contains: id, name, active, isArchived, createdAt, updatedAt, nodeCount.
```

---

## ✅ Recommended Solution: Option 1 (Quick Fix)

**Use this User Prompt**:
```javascript
={{ $json.task || $json.instruction || 'Sync the first missing n8n workflow to Boost.space. Workflows available in input JSON field "n8nWorkflows". Query products in Space 59, compare workflow IDs with product SKUs, find first missing workflow, create product (name, description=name, sku=workflow ID, spaces=[59]), report result.' }}
```

**This avoids syntax errors and is simple to implement.**

---

## 🎯 Why This Works

**Problem**:
- Template literals (backticks) + nested `{{ }}` expressions = syntax conflict
- n8n expression parser can't handle nested expression syntax

**Solution**:
- Use string concatenation with `+` operator
- OR use Code node to format prompt first
- OR simplify prompt and rely on System Message to tell AI where to find data

---

## 🧪 Testing

After fixing:

1. **Test**: "Sync missing workflows"
2. **Check**: No syntax errors
3. **Verify**: AI Agent can access workflows
4. **Confirm**: Creates product for first missing workflow

---

**Last Updated**: November 30, 2025
