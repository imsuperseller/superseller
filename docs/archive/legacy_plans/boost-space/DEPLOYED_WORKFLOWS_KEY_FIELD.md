# Deployed Workflows Module - Key Field Selection

## 🎯 Recommendation: Use `workflow_id` as Key Field

**Select:** A field that will contain the **n8n workflow ID** (unique identifier)

---

## ✅ Best Option: Custom Field `workflow_id`

**Why:**
- ✅ Each workflow has a unique n8n workflow ID (e.g., `0Cyp9kWJ0oUPNx2L`)
- ✅ This is what we've been using in Products module (as `sku`)
- ✅ Prevents duplicate workflows when re-running migration
- ✅ Matches the schema requirement

**How:**
1. When creating the module, if asked for key field, select a field that will store workflow_id
2. If no such field exists yet, you can:
   - Use `name` temporarily (workflow names should be unique)
   - OR create custom field `workflow_id` first, then set it as key field

---

## 🔄 Alternative Options

### Option 1: Use `name` Field (If Available)
**If:** The module has a native `name` field
**Then:** Select `name` as key field
**Why:** Workflow names are unique (e.g., "INT-LEAD-001 - Lead Machine Orchestrator v2")
**Note:** This works but `workflow_id` is better (more stable, doesn't change if name changes)

### Option 2: Use `sku` Field (If Available)
**If:** Custom modules have a `sku` field like Products module
**Then:** Select `sku` as key field
**Why:** We're already using `sku` in Products module to store workflow_id
**Note:** This would be consistent with Products module approach

---

## 📋 Implementation Steps

### Step 1: Create Custom Field `workflow_id`
**After creating the module:**
1. Go to Custom Fields settings
2. Add field to "Deployed Workflows" module:
   - **Name:** `workflow_id`
   - **Type:** Text
   - **Required:** Yes
   - **Description:** "n8n workflow ID (unique identifier)"

### Step 2: Set as Key Field
1. Go to module settings
2. Find "Key field" setting
3. Select `workflow_id`

### Step 3: Migration Script Will Use It
The migration script will populate `workflow_id` with the n8n workflow ID, ensuring:
- ✅ No duplicate workflows
- ✅ Safe re-runs of migration script
- ✅ Easy lookup by workflow ID

---

## 🔍 Current Products Module Approach

**In Products module:**
- We use `sku` field to store workflow_id
- This prevents duplicates when searching for existing products
- Migration script searches by `sku` to find existing workflows

**For Deployed Workflows module:**
- Use `workflow_id` custom field (more explicit)
- Or use `sku` if available (consistent with Products)
- Or use `name` if workflow names are guaranteed unique

---

## ✅ Final Recommendation

**Create custom field `workflow_id` and use it as key field**

**Why:**
- Most explicit and clear
- Matches schema requirement
- Prevents duplicates
- Easy to understand and maintain

**If that's not possible during module creation:**
- Use `name` as key field temporarily
- Create `workflow_id` custom field after
- Update key field setting to use `workflow_id`

---

**Quick Answer:** Select a field that will contain the workflow ID. If no such field exists yet, use `name` temporarily, then create `workflow_id` custom field and set it as key field.
