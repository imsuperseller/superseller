# Boost.space Field Group Assignment Status

## Field Group: "n8n Workflow Fields" (ID: 475)

**Location:** System Settings → Custom Fields → Notes Module  
**Settings URL:** `https://superseller.boost.space/settings/custom-field/`

### Current Status

**Spaces Column:** Empty (no spaces assigned)

### Action Required

The "n8n Workflow Fields" group needs to be assigned to **Space 45** ("n8n Workflows (Notes)") for the custom fields to appear in record detail views.

### How to Assign

1. Navigate to: `https://superseller.boost.space/settings/custom-field/`
2. Find the "n8n Workflow Fields" row in the table
3. Click on the **"Spaces"** column cell for that row (currently empty)
4. Select **Space 45** or **"n8n Workflows (Notes)"** from the dropdown/modal
5. Save the assignment

### Why This Matters

Custom fields only appear in record detail views when:
- The field group is assigned to the specific space
- You're viewing a record that belongs to that space
- You're in the record detail view (not list view)

Without this assignment, the 86 custom fields we created will not be visible in the UI, even though they exist in the system.
