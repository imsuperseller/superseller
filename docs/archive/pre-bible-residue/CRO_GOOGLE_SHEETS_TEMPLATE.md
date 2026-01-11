# 📊 CRO Insights Robot - Google Sheets Config Template

**Purpose**: Client configuration sheet for the Monthly CRO Insights Robot workflow  
**Created**: December 11, 2025  
**Status**: ✅ Ready to use

---

## 📋 SHEET STRUCTURE

### **Sheet Name**: `CRO Clients`

### **Columns** (A through K):

| Column | Field Name | Type | Required | Description | Example |
|--------|------------|------|----------|-------------|---------|
| **A** | `client_name` | Text | ✅ Yes | Client/company name | Iolite Ventures |
| **B** | `website_url` | URL | ✅ Yes | Client's website URL | https://ioliteventures.co |
| **C** | `clarity_project_id` | Text | ⚠️ Optional | Microsoft Clarity project ID | abc123xyz |
| **D** | `clarity_api_key` | Text | ⚠️ Optional | Clarity API key (if available) | (stored in N8N credentials) |
| **E** | `ga4_property_id` | Number | ✅ Yes | GA4 Property ID (numeric) | 412345678 |
| **F** | `ga4_credentials_ref` | Text | ✅ Yes | N8N credential name for GA4 | Google Service Account - GA4 |
| **G** | `primary_conversion_event` | Text | ✅ Yes | Main conversion event name | lead_submit |
| **H** | `email_recipients` | Text | ✅ Yes | Comma-separated email addresses | david@ioliteventures.co,kelly@ioliteventures.co |
| **I** | `slack_channel_id` | Text | ⚠️ Optional | Slack channel ID for notifications | C01234567 |
| **J** | `report_doc_id` | Text | ❌ Optional | Notion page ID (if updating same doc) | (leave empty for new docs) |
| **K** | `active` | Boolean | ✅ Yes | Whether to process this client | TRUE |

---

## 📝 DETAILED FIELD DESCRIPTIONS

### **A. client_name** (Required)
- **Purpose**: Human-readable client name
- **Format**: Plain text
- **Example**: `Iolite Ventures`
- **Notes**: Used in report titles and notifications

### **B. website_url** (Required)
- **Purpose**: Client's website URL
- **Format**: Full URL with https://
- **Example**: `https://ioliteventures.co`
- **Notes**: Used for Clarity dashboard links and context in AI prompts

### **C. clarity_project_id** (Optional)
- **Purpose**: Microsoft Clarity project identifier
- **Format**: Alphanumeric string
- **Example**: `abc123xyz`
- **Notes**: 
  - Used to generate Clarity dashboard links
  - If empty, Clarity section will be skipped
  - Find in Clarity dashboard URL: `https://clarity.microsoft.com/projects/{project_id}`

### **D. clarity_api_key** (Optional)
- **Purpose**: Clarity API key (if/when API becomes available)
- **Format**: API key string
- **Example**: `(leave empty - stored in N8N credentials)`
- **Notes**: 
  - Currently not used (Clarity has no public API)
  - Store in N8N credentials, reference by name
  - Column can be left empty for now

### **E. ga4_property_id** (Required)
- **Purpose**: Google Analytics 4 Property ID
- **Format**: Numeric string (8-10 digits)
- **Example**: `412345678`
- **Notes**: 
  - Find in GA4: Admin → Property Settings → Property ID
  - Must be numeric (no "G-" prefix)
  - Service account must have access to this property

### **F. ga4_credentials_ref** (Required)
- **Purpose**: Reference to N8N credential name for GA4 access
- **Format**: Credential name as stored in N8N
- **Example**: `Google Service Account - GA4`
- **Notes**: 
  - Must match exact credential name in N8N
  - Credential should contain Google Service Account JSON
  - Service account email must have GA4 property access

### **G. primary_conversion_event** (Required)
- **Purpose**: Main conversion event to track
- **Format**: Event name as configured in GA4
- **Examples**: 
  - `lead_submit`
  - `purchase`
  - `form_submission`
  - `contact_form_complete`
- **Notes**: 
  - Must match exact event name in GA4
  - Used to calculate conversion rates
  - Should be a "key event" in GA4

### **H. email_recipients** (Required)
- **Purpose**: Email addresses to receive monthly reports
- **Format**: Comma-separated list
- **Example**: `david@ioliteventures.co,kelly@ioliteventures.co`
- **Notes**: 
  - Multiple recipients separated by commas
  - No spaces around commas
  - All recipients get the same email

### **I. slack_channel_id** (Optional)
- **Purpose**: Slack channel for notifications
- **Format**: Slack channel ID (starts with "C")
- **Example**: `C01234567`
- **Notes**: 
  - Find channel ID: Right-click channel → View channel details → Channel ID
  - If empty, Slack notification is skipped
  - Bot must be added to channel

### **J. report_doc_id** (Optional)
- **Purpose**: Notion page ID if updating same doc monthly
- **Format**: Notion page ID (32-char alphanumeric)
- **Example**: `(leave empty for new docs each month)`
- **Notes**: 
  - If empty, creates new Notion page each month
  - If provided, updates existing page
  - Find page ID in Notion page URL

### **K. active** (Required)
- **Purpose**: Whether to process this client
- **Format**: Boolean (TRUE/FALSE)
- **Example**: `TRUE`
- **Notes**: 
  - Only rows with `TRUE` are processed
  - Set to `FALSE` to temporarily disable a client
  - Useful for testing or pausing clients

---

## 📊 EXAMPLE DATA

### **Row 1: Header**
```
client_name | website_url | clarity_project_id | clarity_api_key | ga4_property_id | ga4_credentials_ref | primary_conversion_event | email_recipients | slack_channel_id | report_doc_id | active
```

### **Row 2: Iolite Ventures**
```
Iolite Ventures | https://ioliteventures.co | abc123xyz | (N8N: Clarity API Key) | 412345678 | Google Service Account - GA4 | lead_submit | david@ioliteventures.co,kelly@ioliteventures.co | C01234567 | | TRUE
```

### **Row 3: Example Client 2**
```
Example Client | https://example.com | xyz789abc | (N8N: Clarity API Key) | 987654321 | Google Service Account - GA4 | purchase | client@example.com | C09876543 | | TRUE
```

---

## 🚀 SETUP INSTRUCTIONS

### **Step 1: Create Google Sheet**

1. Go to: https://sheets.google.com
2. Create new spreadsheet
3. Name it: `CRO Clients Configuration`
4. Rename Sheet1 to: `CRO Clients`

### **Step 2: Add Headers**

1. In Row 1, add column headers (A through K):
   ```
   A1: client_name
   B1: website_url
   C1: clarity_project_id
   D1: clarity_api_key
   E1: ga4_property_id
   F1: ga4_credentials_ref
   G1: primary_conversion_event
   H1: email_recipients
   I1: slack_channel_id
   J1: report_doc_id
   K1: active
   ```

2. Format Row 1 as **Header** (bold, background color)

### **Step 3: Add Client Data**

1. Start from Row 2
2. Add Iolite Ventures data (see example above)
3. Fill in all required fields (A, B, E, F, G, H, K)
4. Leave optional fields empty if not needed

### **Step 4: Set Up Data Validation**

**For Column K (active)**:
1. Select column K (excluding header)
2. Data → Data validation
3. Criteria: `List of items`
4. Items: `TRUE,FALSE`
5. Save

**For Column E (ga4_property_id)**:
1. Select column E (excluding header)
2. Data → Data validation
3. Criteria: `Number`
4. Save

### **Step 5: Share with n8n**

1. Click "Share" button
2. Add service account email (from GA4 credentials)
3. Permission: **Viewer**
4. Copy Sheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
   ```

### **Step 6: Configure n8n Workflow**

1. In n8n workflow, add Google Sheets node
2. Operation: `Read`
3. Document ID: `{SHEET_ID}` (from Step 5)
4. Sheet Name: `CRO Clients`
5. Range: `A2:K100` (skip header row)

---

## 📋 CSV TEMPLATE

For easy import, use this CSV format:

```csv
client_name,website_url,clarity_project_id,clarity_api_key,ga4_property_id,ga4_credentials_ref,primary_conversion_event,email_recipients,slack_channel_id,report_doc_id,active
Iolite Ventures,https://ioliteventures.co,abc123xyz,,412345678,Google Service Account - GA4,lead_submit,david@ioliteventures.co,kelly@ioliteventures.co,C01234567,,TRUE
```

**To import**:
1. Create new Google Sheet
2. File → Import → Upload
3. Select CSV file
4. Import location: `Replace spreadsheet`
5. Import

---

## 🔍 HOW TO FIND REQUIRED VALUES

### **Microsoft Clarity Project ID**
1. Go to: https://clarity.microsoft.com
2. Select project
3. Look at URL: `https://clarity.microsoft.com/projects/{project_id}/...`
4. Copy `{project_id}`

### **GA4 Property ID**
1. Go to: https://analytics.google.com
2. Select property
3. Admin (gear icon) → Property Settings
4. Copy "Property ID" (numeric, 8-10 digits)

### **GA4 Conversion Event Name**
1. In GA4, go to: Admin → Events
2. Find your key conversion event
3. Copy exact event name (case-sensitive)
4. Common names: `purchase`, `lead_submit`, `form_submission`, `contact_form_complete`

### **Slack Channel ID**
1. Open Slack desktop app
2. Right-click channel name
3. "View channel details"
4. Scroll down → "Channel ID"
5. Copy ID (starts with "C")

### **Notion Page ID**
1. Open Notion page
2. Click "Share" → "Copy link"
3. URL format: `https://notion.so/{workspace}/{page_id}`
4. Copy `{page_id}` (32-char alphanumeric)

---

## ⚠️ IMPORTANT NOTES

### **Security**
- ❌ **Never** store API keys directly in Google Sheets
- ✅ Store API keys in N8N credentials, reference by name
- ✅ Use service account for Google Sheets access (not personal account)
- ✅ Limit sheet sharing to necessary accounts only

### **Data Validation**
- ✅ Always validate `ga4_property_id` is numeric
- ✅ Check `email_recipients` format (comma-separated, valid emails)
- ✅ Ensure `active` column is TRUE/FALSE only
- ✅ Verify `primary_conversion_event` matches GA4 exactly

### **Testing**
- ✅ Add test client with `active = FALSE` for testing
- ✅ Use test GA4 property ID for development
- ✅ Verify all required fields are filled before activating

### **Maintenance**
- ✅ Review sheet monthly for accuracy
- ✅ Update `active` status for paused clients
- ✅ Remove old clients (or set `active = FALSE`)
- ✅ Keep email recipients list current

---

## 🔄 WORKFLOW INTEGRATION

The n8n workflow will:
1. Read this sheet on the 1st of each month
2. Filter rows where `active = TRUE`
3. Loop through each client
4. Use column values to:
   - Pull Clarity data (if `clarity_project_id` provided)
   - Pull GA4 data (using `ga4_property_id` and `ga4_credentials_ref`)
   - Track conversions (using `primary_conversion_event`)
   - Send reports (to `email_recipients` and `slack_channel_id`)
   - Create/update Notion pages (using `report_doc_id` if provided)

---

## 📝 TEMPLATE FILE

See `CRO_Clients_Template.csv` in this directory for a ready-to-import CSV file.

---

**Questions?** Refer to `/docs/workflows/CRO_INSIGHTS_ROBOT_PLAN.md` for full workflow details.
