# Custom Fields Population Issue

## 🔍 Issue

**User reports:** "i see the records and the fields but most not populated"

**Update script reports:** ✅ Successfully updated 112 workflows with 67-68 fields each

**API response:** Shows empty `customFieldsValues` array (similar to Products module issue)

---

## 🔧 Possible Causes

### 1. Field Input IDs Are Module-Specific
**Problem:** Custom field input IDs (like 1743, 1745) are specific to Products module. When we copy them to Deployed Workflows module, they might not match.

**Solution:** The update script maps field names to correct input IDs, but we need to verify the mapping is correct.

### 2. Field Group Connection Issue
**Problem:** Even though field group is "connected" to Deployed Workflows module, the input IDs might still be different.

**Solution:** Check if field group connection creates new input IDs or reuses existing ones.

### 3. API Response Limitation
**Problem:** Similar to Products module - API accepts updates (200 OK) but doesn't return customFieldsValues in response.

**Solution:** Fields might actually be saved but API doesn't show them. Need to verify in UI.

---

## 🧪 Testing Steps

### Step 1: Verify Field Input IDs
**Check if field input IDs are the same or different:**
```bash
# Get field group for Products module
curl -H "Authorization: Bearer ..." "https://superseller.boost.space/api/custom-field/479"

# Check if input IDs match between modules
```

### Step 2: Test Single Field Update
**Try updating one field manually:**
```bash
curl -X PUT -H "Authorization: Bearer ..." \
  -H "Content-Type: application/json" \
  -d '{"customFieldsValues":[{"customFieldInputId":XXXX,"customFieldInputName":"workflow_name","value":"Test"}]}' \
  "https://superseller.boost.space/api/custom-module-item/429"
```

### Step 3: Check UI
**Verify in Boost.space UI:**
- Go to: `https://superseller.boost.space/list/17/61`
- Open a workflow record
- Check if custom fields are visible and populated

---

## 💡 Next Steps

1. **Verify field input IDs:** Check if Products and Deployed Workflows modules use the same input IDs
2. **Test manual update:** Try updating one field manually to see if it works
3. **Check UI:** Verify if fields are actually populated in the UI (API might not show them)
4. **Fix mapping:** If input IDs are different, update the mapping logic

---

**The update script completed successfully, but we need to verify the field input IDs are correct for the Deployed Workflows module.**
