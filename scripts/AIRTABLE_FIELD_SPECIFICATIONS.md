# 📋 AIRTABLE FIELD SPECIFICATIONS QUICK REFERENCE

## **🏢 BUSINESS REFERENCES TABLE (13 fields)**

| # | Field Name | Type | Options/Format |
|---|------------|------|----------------|
| 1 | **Name** | Single line text | Primary field |
| 2 | **Type** | Single select | Business Reference, Technical Reference, Process Reference |
| 3 | **Description** | Long text | - |
| 4 | **Status** | Single select | Active, Inactive, In Progress, Completed |
| 5 | **Priority** | Single select | Low, Medium, High, Critical |
| 6 | **Platform** | Single line text | - |
| 7 | **RGID** | Single line text | - |
| 8 | **Created By** | Single line text | - |
| 9 | **Last Updated** | Date | MM/DD/YYYY |
| 10 | **AI Integration Status** | Single select | Not Started, In Progress, Advanced, Integrated |
| 11 | **Airtable Sync** | Checkbox | - |
| 12 | **Automation Level** | Single select | Manual, Basic, Advanced, Fully Automated |
| 13 | **Sync Status** | Single line text | - |

## **👥 CUSTOMER MANAGEMENT TABLE (13 fields)**

| # | Field Name | Type | Options/Format |
|---|------------|------|----------------|
| 1 | **Name** | Single line text | Primary field |
| 2 | **Company Name** | Single line text | - |
| 3 | **Contact Email** | Email | - |
| 4 | **Phone Number** | Phone number | - |
| 5 | **Industry** | Single select | Technology, Healthcare, Finance, Education, Retail, Manufacturing, Other |
| 6 | **Customer Status** | Single select | Active, Inactive, Prospect, Churned |
| 7 | **Subscription Plan** | Single select | Basic, Professional, Enterprise, Custom |
| 8 | **Monthly Revenue** | Number | Currency ($) |
| 9 | **Onboarding Date** | Date | MM/DD/YYYY |
| 10 | **Last Contact Date** | Date | MM/DD/YYYY |
| 11 | **Customer Success Manager** | Single line text | - |
| 12 | **Notes** | Long text | - |
| 13 | **RGID** | Single line text | - |

## **📊 PROJECT TRACKING TABLE (14 fields)**

| # | Field Name | Type | Options/Format |
|---|------------|------|----------------|
| 1 | **Name** | Single line text | Primary field |
| 2 | **Project Name** | Single line text | - |
| 3 | **Customer** | Single line text | - |
| 4 | **Project Type** | Single select | Website Development, Mobile App, System Integration, Consulting, Maintenance, Other |
| 5 | **Status** | Single select | Planning, In Progress, Review, Completed, On Hold, Cancelled |
| 6 | **Priority** | Single select | Low, Medium, High, Critical |
| 7 | **Start Date** | Date | MM/DD/YYYY |
| 8 | **Due Date** | Date | MM/DD/YYYY |
| 9 | **Budget** | Number | Currency ($) |
| 10 | **Progress** | Number | Percent |
| 11 | **Project Manager** | Single line text | - |
| 12 | **Team Members** | Single line text | - |
| 13 | **Description** | Long text | - |
| 14 | **RGID** | Single line text | - |

## **🎨 SELECT OPTION COLORS**

### **Business References**
- **Type**: Business Reference (Blue), Technical Reference (Green), Process Reference (Orange)
- **Status**: Active (Green), Inactive (Gray), In Progress (Yellow), Completed (Blue)
- **Priority**: Low (Green), Medium (Yellow), High (Orange), Critical (Red)
- **AI Integration Status**: Not Started (Gray), In Progress (Yellow), Advanced (Blue), Integrated (Green)
- **Automation Level**: Manual (Gray), Basic (Blue), Advanced (Orange), Fully Automated (Green)

### **Customer Management**
- **Industry**: Technology (Blue), Healthcare (Green), Finance (Purple), Education (Orange), Retail (Pink), Manufacturing (Gray), Other (Yellow)
- **Customer Status**: Active (Green), Inactive (Gray), Prospect (Blue), Churned (Red)
- **Subscription Plan**: Basic (Blue), Professional (Green), Enterprise (Purple), Custom (Orange)

### **Project Tracking**
- **Project Type**: Website Development (Blue), Mobile App (Green), System Integration (Purple), Consulting (Orange), Maintenance (Gray), Other (Yellow)
- **Status**: Planning (Gray), In Progress (Blue), Review (Yellow), Completed (Green), On Hold (Orange), Cancelled (Red)
- **Priority**: Low (Green), Medium (Yellow), High (Orange), Critical (Red)

## **🔑 KEY FIELDS FOR SYNC**

### **Required for All Tables**
- **Name** (Primary field)
- **RGID** (Unique identifier for sync)

### **Business References Key Fields**
- Type, Status, Priority, Platform, AI Integration Status

### **Customer Management Key Fields**
- Company Name, Contact Email, Industry, Customer Status, Monthly Revenue

### **Project Tracking Key Fields**
- Project Name, Customer, Project Type, Status, Budget, Progress

## **📝 CREATION ORDER**

1. **Create base**: "Rensto Business Management"
2. **Rename Table 1**: "Business References"
3. **Add all 13 fields** to Business References
4. **Create Table 2**: "Customer Management"
5. **Add all 13 fields** to Customer Management
6. **Create Table 3**: "Project Tracking"
7. **Add all 14 fields** to Project Tracking
8. **Get Base ID** from API documentation
9. **Get Table IDs** from API documentation
10. **Generate API Key** from account settings

## **⚡ QUICK COPY-PASTE FIELDS**

### **Business References Fields** (copy these names exactly):
```
Name, Type, Description, Status, Priority, Platform, RGID, Created By, Last Updated, AI Integration Status, Airtable Sync, Automation Level, Sync Status
```

### **Customer Management Fields** (copy these names exactly):
```
Name, Company Name, Contact Email, Phone Number, Industry, Customer Status, Subscription Plan, Monthly Revenue, Onboarding Date, Last Contact Date, Customer Success Manager, Notes, RGID
```

### **Project Tracking Fields** (copy these names exactly):
```
Name, Project Name, Customer, Project Type, Status, Priority, Start Date, Due Date, Budget, Progress, Project Manager, Team Members, Description, RGID
```

## **🎯 SUCCESS CRITERIA**

✅ **Base created** with name "Rensto Business Management"  
✅ **3 tables created** with exact names  
✅ **All fields added** with correct types  
✅ **Select options configured** with proper colors  
✅ **Base ID obtained** from API docs  
✅ **Table IDs obtained** from API docs  
✅ **API Key generated** and saved  
✅ **Environment variables set**  
✅ **Sync script tested** successfully  

**Total Fields: 40 fields across 3 tables**
