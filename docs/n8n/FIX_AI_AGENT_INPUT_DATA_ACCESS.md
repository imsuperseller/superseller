# Fix: AI Agent Not Accessing Input Data

**Problem**: AI Agent says "Please provide the `n8nWorkflows` data" even though "Format Workflows" node successfully created the array.

**Root Cause**: AI Agent node doesn't automatically access input JSON data. It needs explicit instructions in the user prompt to access the input data.

---

## 🔧 Fix the User Prompt

### **In "AI Agent" Node**:

**Current User Prompt** (WRONG):
```javascript
={{ $json.task || $json.instruction || 'Find the first missing workflow that needs to be synced to Boost.space. Query existing products in Space 59, compare with n8n workflows from input data, identify the first missing workflow, and create a product for it. Report which workflow was synced and how many remain.' }}
```

**Problem**: Says "from input data" but doesn't tell the AI Agent WHERE to find it.

**Fixed User Prompt** (CORRECT):
```javascript
={{ $json.task || $json.instruction || `Find the first missing workflow that needs to be synced to Boost.space. 

STEP 1: Query existing products in Space 59 using the Query Products tool.

STEP 2: Access the n8n workflows from the input data. The workflows are in the input JSON under the field 'n8nWorkflows' as an array. Use this data: {{ JSON.stringify($json.n8nWorkflows || []) }}

STEP 3: Compare the workflows:
- Extract SKU values from existing products (these are workflow IDs)
- For each workflow in the n8nWorkflows array, check if its ID exists in the SKU list
- Find the FIRST workflow that is NOT in Boost.space yet

STEP 4: Create a product for the first missing workflow:
- Use the Create Product tool
- name: workflow name (e.g., "INT-SYNC-007: n8n to Boost.space Auto Sync")
- description: workflow name (same as name)
- sku: workflow ID (e.g., "41dvc6epRUoQIyjs")
- spaces: [59]

STEP 5: Report clearly:
- "Created product for [workflow name] (ID: [workflow ID])"
- "Remaining workflows to sync: [count]"
- If no workflows are missing: "All workflows are already synced to Boost.space."` }}
```

---

## 🎯 Alternative: Simpler Prompt (Recommended)

**Simpler Version** (easier to read):
```javascript
={{ $json.task || $json.instruction || `Sync the first missing n8n workflow to Boost.space.

Available workflows: {{ JSON.stringify($json.n8nWorkflows || []) }}

Instructions:
1. Query existing products in Space 59
2. Compare with the workflows list above
3. Find the first workflow NOT in Boost.space (check if workflow ID exists in product SKUs)
4. Create product for that workflow (name, description=name, sku=workflow ID, spaces=[59])
5. Report: "Created product for [name] (ID: [id]). Remaining: [count]."` }}
```

---

## ✅ Why This Works

**Problem**:
- AI Agent doesn't automatically see input JSON data
- It needs explicit instructions to access `$json.n8nWorkflows`
- The prompt must include the actual data or tell the AI where to find it

**Solution**:
- Use `{{ JSON.stringify($json.n8nWorkflows || []) }}` to embed the workflows array directly in the prompt
- OR tell the AI Agent to look for `n8nWorkflows` in the input JSON
- The AI Agent can then access the data and process it

---

## 🔍 Testing

After fixing:

1. **Test**: "Sync missing workflows"
2. **Check**: AI Agent should see the workflows array in the prompt
3. **Verify**: AI Agent can iterate over workflows
4. **Confirm**: Creates product for first missing workflow

---

## 📝 Notes

- The `JSON.stringify()` embeds the actual array data in the prompt
- This ensures the AI Agent has direct access to the workflows
- The AI Agent can then process the data without needing to query it separately
- This is more reliable than expecting the AI Agent to automatically access input JSON

---

**Last Updated**: November 30, 2025
