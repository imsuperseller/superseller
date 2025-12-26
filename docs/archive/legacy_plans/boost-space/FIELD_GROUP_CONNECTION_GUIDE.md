# Field Group Connection Guide - Deployed Workflows

## ✅ Correct Field Group

**For Deployed Workflows module (custom-module-item):**
- **Field Group ID:** `475`
- **Field Group Name:** `n8n Workflow Fields`
- **Module:** `custom-module-item`
- **Table:** `custom_module_item`
- **Total Fields:** 87

**This is the CORRECT field group to connect to Deployed Workflows module.**

---

## ❌ Wrong Field Group (Do NOT Use)

**Field Group 479:**
- **Field Group ID:** `479`
- **Field Group Name:** `n8n Workflow Fields (Products)`
- **Module:** `product`
- **Table:** `product`

**This is for Products module, NOT Deployed Workflows.**

---

## 🔧 How to Connect Field Group to Module

### In Boost.space UI:

1. **Go to Deployed Workflows module:**
   - Navigate to: `https://superseller.boost.space/list/17/61`
   - Or: Products → Custom Modules → Deployed Workflows

2. **Open Module Settings:**
   - Click the gear icon (⚙️) or module settings
   - Go to "Custom Fields" or "Field Groups" section

3. **Connect Field Group 475:**
   - Look for "n8n Workflow Fields" (ID: 475)
   - Make sure it's connected/assigned to this module
   - If it's not listed, you may need to:
     - Go to Settings → Custom Fields
     - Find field group 475
     - Assign it to "custom-module-item" module

4. **Verify Connection:**
   - Open any workflow record
   - Check if custom fields section appears
   - Fields should be visible (even if empty initially)

---

## 🧪 Testing Field Group Connection

**After connecting, test with a manual update:**

```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customFieldsValues": [
      {
        "customFieldInputId": 1397,
        "customFieldInputName": "workflow_name",
        "value": "Test Workflow"
      }
    ]
  }' \
  "https://superseller.boost.space/api/custom-module-item/429"
```

**Then check in UI** - the field should appear populated.

---

## 📋 Field Input IDs Reference

**Field Group 475 (Deployed Workflows) - Sample IDs:**
- `workflow_name`: ID `1397`
- `category`: ID `1399`
- `status`: ID `1401`
- `workflow_id`: ID `1403`
- `workflow_name_original`: ID `1405`

**These are DIFFERENT from Products module (479):**
- Products module uses IDs: 1743, 1745, 1747, etc.

---

## ⚠️ Common Issues

### Issue 1: Fields Not Visible in UI
**Symptom:** Custom fields section doesn't appear in record view

**Solution:** Field group not connected to module. Connect field group 475 to custom-module-item module.

### Issue 2: Fields Visible But Empty
**Symptom:** Fields appear but values are empty

**Possible causes:**
1. Wrong field group connected (using 479 instead of 475)
2. Field input IDs don't match (using Products IDs instead of Deployed Workflows IDs)
3. API update didn't work (check API response)

**Solution:** 
- Verify field group 475 is connected
- Re-run update script with correct field group ID (475)

### Issue 3: API Returns Empty customFieldsValues
**Symptom:** API GET request shows `customFieldsValues: []` even after update

**Note:** This is a known Boost.space API limitation. Fields may be saved but API doesn't return them. **Always verify in UI.**

---

## ✅ Verification Checklist

- [ ] Field group 475 is connected to Deployed Workflows module
- [ ] Field group name is "n8n Workflow Fields" (not "n8n Workflow Fields (Products)")
- [ ] Custom fields section appears in workflow records
- [ ] Fields are visible (even if empty)
- [ ] Update script uses field group ID 475 (not 479)
- [ ] Field input IDs match field group 475 (1397, 1399, etc.)

---

**The correct field group to connect is: Field Group 475 "n8n Workflow Fields" (for custom-module-item)**
