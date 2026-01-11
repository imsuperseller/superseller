# 🏗️ Create "workflows" Module - Step-by-Step Guide

**Date**: November 27, 2025  
**Status**: Ready to Execute

---

## ⚠️ **IMPORTANT**

Custom modules in Boost.space **must be created via the UI**. The API does not support module creation.

---

## 📋 **STEP-BY-STEP INSTRUCTIONS**

### **Step 1: Navigate to Boost.space**

1. Open browser: https://superseller.boost.space
2. Log in with your credentials
3. Navigate to **Space 45** (or create Space 60 if you prefer)

### **Step 2: Create Custom Module**

1. In Space 45, look for **"+"** button or **"Add Module"** option
2. Click to open module creation dialog
3. Select **"Custom Module"** (not built-in module)
4. Enter module name: **`workflows`**
5. Click **"Save"** or **"Create"**

### **Step 3: Add Fields**

After module is created, add fields one by one:

#### **Field Group 1: Core Information** (12 fields)

1. **name** (Text, Required)
   - Type: Text
   - Required: Yes
   - Description: "Workflow name (e.g., INT-LEAD-001 - Lead Machine Orchestrator v2)"

2. **description** (Textarea, Required)
   - Type: Textarea
   - Required: Yes
   - Description: "Full description of what the workflow does"

3. **category** (Select, Required)
   - Type: Select
   - Required: Yes
   - Options: Internal, Subscription, Marketing, Customer, Development
   - Description: "Workflow category"

4. **status** (Select, Required)
   - Type: Select
   - Required: Yes
   - Options: ✅ Active, ✅ Successful, ⚠️ Testing, ❌ Deprecated, 📦 Template
   - Description: "Workflow status"

5. **workflow_id** (Text, Required)
   - Type: Text
   - Required: Yes
   - Description: "n8n workflow ID (e.g., 1LWTwUuN6P6uq2Ha)"

6. **workflow_name_original** (Text, Optional)
   - Type: Text
   - Required: No
   - Description: "Original name from n8n"

7. **n8n_instance** (Select, Required)
   - Type: Select
   - Required: Yes
   - Options: Rensto VPS, Tax4Us Cloud, Shelly Cloud
   - Description: "n8n instance where workflow runs"

8. **n8n_url** (URL, Optional)
   - Type: URL
   - Required: No
   - Description: "Full URL to workflow"

9. **created_date** (Date, Optional)
   - Type: Date
   - Required: No
   - Description: "Date workflow was created"

10. **last_successful_run** (DateTime, Optional)
    - Type: DateTime
    - Required: No
    - Description: "Date of last successful execution"

11. **version** (Text, Optional)
    - Type: Text
    - Required: No
    - Description: "Version number (e.g., v2, v1.3)"

12. **previous_version_id** (Text, Optional)
    - Type: Text
    - Required: No
    - Description: "Link to previous version record"

#### **Field Group 2: Technical Details** (8 fields)

13. **node_count** (Number, Optional)
14. **complexity_score** (Number, Optional)
15. **execution_time_avg** (Number, Optional)
16. **execution_time_max** (Number, Optional)
17. **integrations_used** (Textarea, Optional)
18. **required_credentials** (Textarea, Optional)
19. **workflow_json_url** (URL, Optional)
20. **workflow_json** (Textarea, Optional)

#### **Field Group 3: Execution Metrics** (4 fields)

21. **success_rate** (Number, Optional)
22. **total_executions** (Number, Optional)
23. **successful_executions** (Number, Optional)
24. **failed_executions** (Number, Optional)

#### **Field Group 4: Business Metrics** (8 fields)

25. **revenue_generated** (Number, Optional)
26. **customers_served** (Number, Optional)
27. **time_saved_hours** (Number, Optional)
28. **cost_savings** (Number, Optional)
29. **business_value** (Select, Optional) - Options: High, Medium, Low
30. **use_cases** (Textarea, Optional)
31. **target_industries** (Textarea, Optional)
32. **tags** (Textarea, Optional)

#### **Field Group 5: Documentation** (8 fields)

33. **setup_guide** (Textarea, Optional)
34. **configuration_steps** (Textarea, Optional)
35. **troubleshooting_guide** (Textarea, Optional)
36. **screenshot_urls** (Textarea, Optional)
37. **demo_video_url** (URL, Optional)
38. **documentation_url** (URL, Optional)
39. **changelog** (Textarea, Optional)
40. **known_issues** (Textarea, Optional)

#### **Field Group 6: Marketplace** (9 fields - Optional)

41. **marketplace_status** (Select, Optional) - Options: draft, pending_review, published, archived
42. **marketplace_price_diy** (Number, Optional)
43. **marketplace_price_install** (Number, Optional)
44. **marketplace_category** (Select, Optional) - Options: Lead Generation, Customer Support, E-commerce, Marketing, Sales, Operations
45. **marketplace_slug** (Text, Optional)
46. **marketplace_description** (Textarea, Optional)
47. **marketplace_features** (Textarea, Optional)
48. **marketplace_sales_count** (Number, Optional)
49. **marketplace_revenue** (Number, Optional)

### **Step 4: Organize Fields into Groups**

In Boost.space UI, organize fields into field groups:
- Core Information
- Technical Details
- Execution Metrics
- Business Metrics
- Documentation
- Marketplace

---

## ✅ **VALIDATION**

After creating the module and fields, run the validation script:

```bash
node scripts/boost-space/create-and-validate-module.cjs
```

This will:
1. ✅ Check if module exists
2. ✅ Validate module is accessible
3. ✅ Create a test record to validate all fields
4. ✅ Report any missing or incorrect fields

---

## 🚀 **QUICK START (Minimum Fields)**

If you want to start with just the essentials, create these **6 required fields** first:

1. `name` (Text, Required)
2. `description` (Textarea, Required)
3. `category` (Select, Required)
4. `status` (Select, Required)
5. `workflow_id` (Text, Required)
6. `n8n_instance` (Select, Required)

You can add the remaining 43 optional fields later.

---

## 📝 **NEXT STEPS**

After module creation and validation:

1. ✅ Create first test workflow record
2. ✅ Set up automation to sync workflows from n8n
3. ✅ Migrate existing 73 workflows from Space 45 Notes

---

**Last Updated**: November 27, 2025
