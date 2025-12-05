# Connect Field Group 475 to Deployed Workflows Module

## ✅ Correct Field Group

**Field Group 475: "n8n Workflow Fields"**
- **ID:** 475
- **Module:** custom-module-item (Deployed Workflows)
- **Total Fields:** 87

**This is the field group you need to connect.**

---

## 🔧 How to Connect (UI Steps)

### Step 1: Navigate to Deployed Workflows Module

1. Go to: `https://superseller.boost.space/list/17/61`
   - This is the Deployed Workflows module (Module ID: 17, Space ID: 61)

### Step 2: Open Any Workflow Record

1. Click on any workflow record to open the detail view
2. Look for the **"Custom Fields"** section or **"Edit"** button

### Step 3: Connect Field Group

1. In the record detail view, look for a **"Connect"** button or **"Field Groups"** section
2. You should see field group options
3. Find **"n8n Workflow Fields"** (ID: 475)
4. Click **"Connect"** or **"Assign"** next to it

**Alternative Method:**
- Go to: `https://superseller.boost.space/list/17/61#edit-wrapper`
- Look for field group connection options
- Connect field group 475

### Step 4: Verify Connection

After connecting:
1. Refresh the page
2. Open a workflow record
3. You should see the custom fields section appear
4. Fields should be visible (even if empty initially)

---

## ⚠️ Important Notes

### Why Connection is Required

**From previous discovery:**
- Field groups must be "connected" in the UI before API can save custom fields
- API accepts requests (200 OK) but fields don't persist without connection
- This is a one-time manual step that enables API access

### Field Group Confusion

**Do NOT use:**
- ❌ Field Group 479: "n8n Workflow Fields (Products)" - This is for Products module only

**Use:**
- ✅ Field Group 475: "n8n Workflow Fields" - This is for custom-module-item (Deployed Workflows)

---

## 🧪 After Connection - Test

Once connected, the update script should work:

```bash
node scripts/boost-space/update-deployed-workflows-fields.cjs
```

**Or test manually:**
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

Then check in UI - the field should appear populated.

---

## 📋 Verification Checklist

- [ ] Navigated to Deployed Workflows module (Module 17, Space 61)
- [ ] Found field group connection option
- [ ] Connected field group 475 "n8n Workflow Fields"
- [ ] Custom fields section appears in workflow records
- [ ] Fields are visible (even if empty)
- [ ] Re-ran update script after connection
- [ ] Verified fields are populated in UI

---

**The field group to connect is: Field Group 475 "n8n Workflow Fields"**

**After connecting, re-run the update script to populate all fields.**
