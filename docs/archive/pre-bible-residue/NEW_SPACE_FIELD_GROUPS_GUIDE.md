# Custom Field Groups for New "n8n Workflows" Space

## 🎯 Field Groups to Connect

### ✅ **CONNECT: "n8n Workflow Fields (Products)" (ID: 479)**

**This is the main field group you need!**

- **Contains:** 89 custom fields for workflow data
- **Purpose:** All workflow-specific fields (workflow_name, category, status, node_count, etc.)
- **Action:** ✅ **Connect this to the new "n8n Workflows" space**

**Why:** This field group contains all the workflow metadata fields that your workflow products need.

---

## ❓ Field Groups to Disconnect (Optional)

### Option 1: Keep Connected to Both Spaces (Recommended)

**Keep "n8n Workflow Fields (Products)" connected to:**
- ✅ Space 39 (MCP Servers & Business References) - for any workflows that stay there
- ✅ New "n8n Workflows" space - for workflow products

**Why:** 
- If you have workflows in both spaces, they'll both have access to the fields
- No need to disconnect anything
- More flexible

### Option 2: Disconnect from Space 39 (If You're Moving All Workflows)

**Only if you're moving ALL 112 workflow products to the new space:**

- ❌ **Disconnect "n8n Workflow Fields (Products)" from Space 39**
- ✅ **Connect it only to the new "n8n Workflows" space**

**Why:**
- Cleaner separation
- MCP/infrastructure products in Space 39 won't show workflow fields
- Only workflow products in new space will have workflow fields

---

## 🚫 Field Groups to NOT Connect

**Don't connect these to the new space (they're for other product types):**

- ❌ "My Custom Fields" (ID: 326) - Generic fields
- ❌ "Tracking" (ID: 470) - Product tracking
- ❌ "Marketing" (ID: 24) - Marketing fields
- ❌ "Sales" (ID: 26) - Sales fields
- ❌ "Stock" (ID: 30) - Inventory management
- ❌ "Shipping" (ID: 34) - Shipping fields
- ❌ All other field groups (unless you specifically need them for workflows)

**Why:** These are for regular products, not workflow products. Only connect what you need.

---

## 📋 Step-by-Step Instructions

### When Creating the New Space:

1. **In the "Field groups" step:**
   - ✅ **Check/Select:** "n8n Workflow Fields (Products)"
   - ❌ **Uncheck:** All other field groups (unless you need them)

2. **After space is created:**
   - Go to: `https://superseller.boost.space/settings/custom-field/`
   - Find: "n8n Workflow Fields (Products)" (ID: 479)
   - Click: **Edit** icon
   - Check: Both Space 39 AND new space (if keeping workflows in both)
   - OR: Only new space (if moving all workflows)

---

## 💡 Recommendation

**Connect "n8n Workflow Fields (Products)" to the new space, and optionally keep it connected to Space 39 if you want flexibility.**

**Don't connect any other field groups unless you specifically need them for workflow products.**
