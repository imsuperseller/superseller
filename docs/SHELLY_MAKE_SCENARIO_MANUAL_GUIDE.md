# 🎯 SHELLY'S MAKE.COM SCENARIO - MANUAL CREATION GUIDE

## 📋 OVERVIEW

Since the MCP endpoint is experiencing connectivity issues, we'll create Shelly's scenario manually in the Make.com web interface.

## 🔗 ACCESS

- **Make.com URL**: https://us2.make.com
- **Organization ID**: 4994164
- **Family Data**: 039426341, 301033270

## 📝 SCENARIO DETAILS

### **Name**: Shelly Family Research & Profile Generator
### **Description**: AI-powered family research and insurance profile generation for Shaifriedman family

## 🔧 STEP-BY-STEP INSTRUCTIONS

### 1. 🔐 Login to Make.com
- Navigate to https://us2.make.com
- Login with your credentials

### 2. ➕ Create New Scenario
- Click "Create a new scenario"
- Or click the "+" button

### 3. 📝 Configure Scenario
- **Name**: `Shelly Family Research & Profile Generator`
- **Description**: `AI-powered family research and insurance profile generation for Shaifriedman family`

### 4. 🔧 Add Manual Trigger Module
- Click "Add a module"
- Search for "Manual"
- Select "Manual trigger"
- Configure input fields:
  - `client_id` (text, required)
  - `family_member_ids` (text, required) 
  - `research_depth` (select: basic, comprehensive, deep)

### 5. 🤖 Add OpenAI Research Agent
- Click "Add a module"
- Search for "OpenAI"
- Select "OpenAI"
- Configure to research family members using the input data

### 6. 📄 Add OpenAI Document Generator
- Click "Add a module"
- Search for "OpenAI"
- Select "OpenAI"
- Configure to generate insurance profile document

### 7. 🏢 Add Surense Lead Creator
- Click "Add a module"
- Search for "Surense"
- Select "Surense"
- Configure to create lead with family data

### 8. 📎 Add Surense Document Upload
- Click "Add a module"
- Search for "Surense"
- Select "Surense"
- Configure to upload generated document

### 9. 💾 Save Scenario
- Click "Save" button
- Ensure scenario is set to "On demand" scheduling

### 10. 🧪 Test Scenario
Use this test data:
```json
{
  "client_id": "SHELLY_FAMILY_001",
  "family_member_ids": "039426341,301033270",
  "research_depth": "comprehensive"
}
```

## ✅ SUCCESS CRITERIA

- Scenario created and saved
- All modules connected properly
- Test execution successful
- Scenario available via MCP (once connectivity is restored)

## 🔄 NEXT STEPS

Once the scenario is created manually:
1. It will be available via MCP tools
2. Can be executed programmatically
3. Will work with the family data: 039426341, 301033270

## 📊 EXPECTED OUTPUT

The scenario should:
1. Research family members (039426341, 301033270)
2. Generate insurance profile document
3. Create Surense lead
4. Upload document to Surense

---
*Created: 2025-01-27*
*Family Data: 039426341, 301033270*
*Organization: 4994164*
