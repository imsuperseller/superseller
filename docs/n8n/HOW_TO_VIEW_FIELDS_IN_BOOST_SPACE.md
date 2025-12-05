# 📍 How to View All 86 Fields in Boost.space UI

**Date**: November 28, 2025  
**Field Group**: "n8n Workflow Fields" (ID: 475)  
**Location**: Space 45 (n8n Workflows)  
**Total Fields**: 86

---

## 🎯 **QUICK ACCESS**

### **Direct Navigation Path**

1. **Login to Boost.space**
   - URL: https://superseller.boost.space
   - Login with your credentials

2. **Find the n8n Workflows Space**
   - Click on **"Spaces"** in the left sidebar (or top navigation)
   - Look for a space named **"n8n Workflows"** or **"n8n Workflows (Notes)"**
   - Click on it to open
   - (If you can't find it, use the search bar and type "n8n" or "workflows")

3. **Access Custom Fields**
   - Once in the n8n Workflows space, look for **"Settings"** or **"⚙️"** icon
   - Click **"Custom Fields"** or **"Field Groups"**
   - Find and click **"n8n Workflow Fields"** to see all 86 fields

---

## 📋 **STEP-BY-STEP GUIDE**

### **Method 1: Via Space Settings**

1. **Find the n8n Workflows Space**
   - Go to https://superseller.boost.space
   - Click **"Spaces"** in the sidebar
   - Look for and click on **"n8n Workflows"** (or search for "n8n" in the search bar)

2. **Open Settings**
   - Look for **Settings** icon (⚙️) in the top right or sidebar
   - Click **"Settings"** or **"Space Settings"**

3. **Navigate to Custom Fields**
   - In Settings menu, click **"Custom Fields"** or **"Field Groups"**
   - You should see a list of field groups

4. **View Field Group**
   - Find **"n8n Workflow Fields"** in the list
   - Click on it to expand and see all 86 fields

---

### **Method 2: Via Module Settings**

1. **Find the n8n Workflows Space**
   - Go to https://superseller.boost.space
   - Click **"Spaces"** and find **"n8n Workflows"**
   - Click to open it

2. **Open the Module**
   - You should see a list/table of workflow records
   - If you see records, you're in the right place

3. **Access Module Settings**
   - Look for **"⚙️ Settings"** or **"Module Settings"** button
   - Usually in the top right corner of the module view

4. **View Custom Fields**
   - Click **"Custom Fields"** or **"Fields"** tab
   - Find **"n8n Workflow Fields"** field group
   - Expand to see all 86 fields

---

### **Method 3: Via Field Group Direct Link**

1. **Direct Field Group URL** (if supported)
   ```
   https://superseller.boost.space/settings/custom-field/475
   ```
   Note: This URL format may vary depending on Boost.space version

2. **Alternative: Settings → Custom Fields**
   ```
   https://superseller.boost.space/settings/custom-field
   ```
   Then search for "n8n Workflow Fields" or ID 475

---

## 🔍 **WHAT YOU'LL SEE**

### **Field Group Information**
- **Name**: n8n Workflow Fields
- **ID**: 475
- **Boost ID**: ElementGroup0475
- **Module**: custom-module-item
- **Space**: 45

### **Field Categories** (86 total)

1. **Core Fields** (13 fields)
   - workflow_name, description, category, status, workflow_id, etc.

2. **Technical Fields** (11 fields)
   - node_count, complexity_score, execution_time_avg, etc.

3. **Business Fields** (35 fields)
   - Revenue, customers, ROI, strategy, relationships, etc.

4. **Documentation Fields** (8 fields)
   - setup_guide, troubleshooting_guide, screenshots, etc.

5. **Marketplace Fields** (9 fields)
   - marketplace_status, pricing, category, sales, etc.

---

## ✅ **VERIFICATION METHODS**

### **Method 1: Count Fields in UI**

1. Navigate to the field group
2. Count the fields listed
3. Should see **86 fields** total

### **Method 2: Via API** (Quick Check)

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://superseller.boost.space/api/custom-field/475" | \
  jq '{total_fields: (.inputs | length), field_names: [.inputs[].name]}'
```

**Expected Result**: `"total_fields": 86`

### **Method 3: Check Field Group Details**

In the UI, when you click on "n8n Workflow Fields", you should see:
- Field count: **86**
- All fields listed with their types
- Field descriptions
- Required/optional indicators

---

## 📊 **FIELD LIST BY CATEGORY**

### **Core Fields** (13)
1. workflow_name (text, required)
2. description (textarea, required)
3. category (select, required)
4. status (select, required)
5. workflow_id (text, required)
6. workflow_name_original (text)
7. n8n_instance (select)
8. n8n_url (url)
9. created_date (date)
10. last_successful_run (datetime)
11. version (text)
12. previous_version_id (text)
13. failed_executions (number)

### **Technical Fields** (11)
14. node_count (number)
15. complexity_score (number)
16. execution_time_avg (decimal)
17. execution_time_max (decimal)
18. integrations_used (textarea)
19. required_credentials (textarea)
20. workflow_json_url (url)
21. workflow_json (textarea)
22. success_rate (number)
23. total_executions (number)
24. successful_executions (number)

### **Business Fields** (35)
**Revenue & Financial** (8):
25. revenue_generated (number)
26. revenue_model (select)
27. monthly_recurring_revenue (number)
28. annual_recurring_revenue (number)
29. profit_margin (number)
30. cost_per_acquisition (number)
31. customer_lifetime_value (number)
32. ltv_cac_ratio (number)

**Customer & Market** (6):
33. customers_served (number)
34. target_customer_segment (select)
35. target_market_size (number)
36. market_opportunity (select)
37. competitive_advantage (textarea)
38. market_fit_score (number)

**Business Impact & ROI** (7):
39. time_saved_hours (number)
40. cost_savings (number)
41. roi_percentage (number)
42. payback_period_months (number)
43. business_value (select)
44. business_impact_score (number)
45. strategic_priority (select)

**Business Relationships** (5):
46. client_name (text)
47. business_owner (text)
48. executive_sponsor (text)
49. business_unit (text)
50. key_stakeholders (textarea)

**Business Case & Strategy** (7):
51. business_case (textarea)
52. business_justification (textarea)
53. strategic_alignment (textarea)
54. success_criteria (textarea)
55. business_requirements (textarea)
56. business_metrics (textarea)
57. kpis (textarea)

**Market & Industry** (5):
58. use_cases (textarea)
59. target_industries (textarea)
60. market_segment (select)
61. industry_vertical (text)
62. geographic_market (text)

**Business Model & Operations** (6):
63. business_model (select)
64. pricing_strategy (select)
65. sales_cycle_days (number)
66. conversion_rate (number)
67. churn_risk (select)
68. upsell_opportunity (select)

**General** (1):
69. tags (textarea)

### **Documentation Fields** (8)
70. setup_guide (textarea)
71. configuration_steps (textarea)
72. troubleshooting_guide (textarea)
73. screenshot_urls (textarea)
74. demo_video_url (url)
75. documentation_url (url)
76. changelog (textarea)
77. known_issues (textarea)

### **Marketplace Fields** (9)
78. marketplace_status (select)
79. marketplace_price_diy (number)
80. marketplace_price_install (number)
81. marketplace_category (select)
82. marketplace_slug (text)
83. marketplace_description (textarea)
84. marketplace_features (textarea)
85. marketplace_sales_count (number)
86. marketplace_revenue (number)

---

## 🎯 **QUICK REFERENCE**

### **Key URLs**
- **Boost.space Home**: https://superseller.boost.space
- **Settings**: https://superseller.boost.space/settings
- **Custom Fields**: https://superseller.boost.space/settings/custom-field

### **Field Group Info**
- **Name**: n8n Workflow Fields
- **ID**: 475
- **Total Fields**: 86
- **Space Name**: n8n Workflows (or n8n Workflows (Notes))

### **API Endpoint**
```
GET https://superseller.boost.space/api/custom-field/475
```

---

## 🔧 **TROUBLESHOOTING**

### **Can't Find the n8n Workflows Space?**
1. Check if you're logged in
2. Use the search bar in Spaces and type "n8n" or "workflows"
3. Look through all your spaces - it might be named "n8n Workflows" or "n8n Workflows (Notes)"

### **Can't See Custom Fields?**
1. Make sure you're in the n8n Workflows space (check the space name at the top)
2. Check if you have admin/edit permissions
3. Try accessing via Settings → Custom Fields

### **Field Count Doesn't Match?**
1. Verify you're looking at the correct field group (ID: 475)
2. Check if fields are collapsed/hidden
3. Use API to verify: `curl` command above

### **Fields Not Showing in Records?**
1. Fields exist in the field group
2. You may need to add them to the record view
3. Check module settings → Fields → Add fields to view

---

## 📝 **NOTES**

- All 86 fields are in **one field group**: "n8n Workflow Fields"
- Fields are organized by category in the script, but may appear in creation order in the UI
- Some fields may be collapsed/hidden in the UI - look for expand/collapse buttons
- Field types may show as simplified versions (e.g., "text" for both text and textarea)
- **To find the space**: Use the search bar in Boost.space and type "n8n" - don't try to navigate by number

---

**Last Updated**: November 28, 2025  
**Field Group ID**: 475  
**Total Fields**: 86
