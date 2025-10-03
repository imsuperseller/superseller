# 🎯 **MANUAL NOTION FIELDS GUIDE**

## **📋 EXACT FIELDS TO ADD TO EACH NOTION DATABASE**

Based on your existing Airtable data and sync configuration, here are the **exact fields** you need to manually add to each Notion database:

---

## **📊 DATABASE 1: Rensto Business References**
**Database ID**: `6f3c687f-91b4-46fc-a54e-193b0951d1a5`

### **Fields to Add (12 total):**

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| **Name** | Title | *(Already exists - default)* |
| **Type** | Select | Options: `Onboarding`, `Architecture`, `Strategy`, `Process`, `Template` |
| **Description** | Text | Long text field |
| **Status** | Select | Options: `Active`, `Inactive`, `Draft`, `Archived` |
| **Priority** | Select | Options: `Low`, `Medium`, `High`, `Critical` |
| **Platform** | Select | Options: `N8N`, `Make.com`, `Airtable`, `Notion`, `Webflow`, `Other` |
| **RGID** | Text | Single line text |
| **AI Integration Status** | Select | Options: `Not Integrated`, `Partially Integrated`, `Fully Integrated` |
| **Automation Level** | Select | Options: `Manual`, `Semi-Automated`, `Fully Automated` |
| **Last Updated** | Date | Date field |
| **Created By** | Text | Single line text |
| **Airtable Sync** | Select | Options: `Synced`, `Pending`, `Error`, `Not Synced` |
| **Sync Status** | Select | Options: `Up to Date`, `Out of Sync`, `Error` |

---

## **📊 DATABASE 2: Rensto Customer Management**
**Database ID**: `7840ad47-64dc-4e8a-982c-cb3a0dcc3a14`

### **Fields to Add (12 total):**

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| **Name** | Title | *(Already exists - default)* |
| **Company Name** | Text | Single line text |
| **Contact Email** | Email | Email field |
| **Phone Number** | Phone | Phone number field |
| **Industry** | Select | Options: `Technology`, `Healthcare`, `Finance`, `Education`, `Retail`, `Manufacturing`, `Other` |
| **Customer Status** | Select | Options: `Active`, `Inactive`, `Prospect`, `Churned` |
| **Subscription Plan** | Select | Options: `Basic`, `Professional`, `Enterprise`, `Custom` |
| **Monthly Revenue** | Number | Number field (currency) |
| **Onboarding Date** | Date | Date field |
| **Last Contact Date** | Date | Date field |
| **Customer Success Manager** | Text | Single line text |
| **Notes** | Text | Long text field |
| **RGID** | Text | Single line text |

---

## **📊 DATABASE 3: Rensto Project Tracking**
**Database ID**: `2123596d-d33c-40bb-91d9-3d2983dbfb23`

### **Fields to Add (13 total):**

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| **Name** | Title | *(Already exists - default)* |
| **Project Name** | Text | Single line text |
| **Customer** | Text | Single line text |
| **Project Type** | Select | Options: `Website Development`, `Mobile App`, `System Integration`, `Consulting`, `Maintenance`, `Other` |
| **Status** | Select | Options: `Planning`, `In Progress`, `Review`, `Completed`, `On Hold`, `Cancelled` |
| **Priority** | Select | Options: `Low`, `Medium`, `High`, `Critical` |
| **Start Date** | Date | Date field |
| **Due Date** | Date | Date field |
| **Budget** | Number | Number field (currency) |
| **Progress** | Number | Number field (percentage) |
| **Project Manager** | Text | Single line text |
| **Team Members** | Text | Long text field |
| **Description** | Text | Long text field |
| **RGID** | Text | Single line text |

---

## **🚀 STEP-BY-STEP INSTRUCTIONS**

### **For Each Database:**

1. **Open Notion** and navigate to the database
2. **Click the "+" button** next to the existing "Name" field
3. **Add each field** from the table above with the exact name and type
4. **For Select fields**: Add the exact options listed
5. **Save the database** after adding all fields

### **Field Type Mapping:**
- **Text** = Single line text in Notion
- **Long Text** = Multi-line text in Notion  
- **Select** = Select field with the specified options
- **Number** = Number field in Notion
- **Date** = Date field in Notion
- **Email** = Email field in Notion
- **Phone** = Phone number field in Notion

---

## **✅ VERIFICATION**

After adding all fields, run this command to verify:

```bash
node scripts/check-notion-database-fields.js
```

This will show you all the fields that exist in each database.

---

## **🔄 NEXT STEP**

Once all fields are added, run the full bidirectional sync:

```bash
node scripts/working-bidirectional-sync.js
```

This will populate all the fields with real data from your Airtable bases!

---

## **📞 SUPPORT**

If you encounter any issues:
1. Check that field names match exactly (case-sensitive)
2. Ensure select options are added correctly
3. Verify field types are set properly
4. Run the verification script to confirm

**Total Fields to Add**: 37 fields across 3 databases
**Estimated Time**: 15-20 minutes
**Result**: Full bidirectional sync with rich data from Airtable! 🎉
