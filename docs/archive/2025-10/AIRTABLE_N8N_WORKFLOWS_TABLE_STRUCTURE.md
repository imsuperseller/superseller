# 📊 AIRTABLE N8N WORKFLOWS TABLE STRUCTURE

**Date**: October 3, 2025
**Base ID**: app6saCaH88uK3kCO
**Table Name**: `n8n Workflows`
**Purpose**: Track all n8n workflows with business model alignment

---

## 🏗️ TABLE STRUCTURE

### Table: `n8n Workflows`

| Field Name | Field Type | Options/Description |
|------------|------------|---------------------|
| **Workflow Name** | Single line text | Full workflow name with naming convention |
| **Workflow ID** | Single line text | n8n workflow ID (from URL) |
| **Business Model** | Single select | `Marketplace`, `Ready Solution`, `Custom Solution`, `Subscription`, `Internal` |
| **Category** | Single select | `Email Automation`, `Lead Generation`, `Content Marketing`, `Financial Ops`, `Customer Management`, `Technical Integration`, `Monitoring`, `Support`, `Business Process` |
| **Status** | Single select | `Production`, `Testing`, `Development`, `Deprecated` |
| **Priority** | Single select | `Critical`, `High`, `Medium`, `Low` |
| **Tags** | Multiple selects | All tag options from naming system |
| **Description** | Long text | Detailed workflow description |
| **Price Point** | Currency (USD) | Revenue per customer/month |
| **Revenue Model** | Single line text | One-time, Monthly, Annual, etc. |
| **Node Count** | Number | Number of nodes in workflow |
| **Last Updated** | Date time | Last modification date |
| **Active** | Checkbox | Is workflow active? |
| **n8n URL** | URL | Direct link to workflow |
| **Source** | Single line text | Customer source (Shelly, Ben, Tax4Us, Rensto, New) |
| **Version** | Single line text | v1, v1.1, v2, etc. |
| **Phase** | Single select | `Phase 1`, `Phase 2`, `Phase 3`, `Phase 4`, `Phase 5`, `Phase 6` |
| **Target Audience** | Long text | Who is this for? |
| **Features** | Long text | Key features bullet points |
| **Requirements** | Long text | Prerequisites and requirements |

---

## 🏷️ TAG OPTIONS (for Multiple Selects field)

### Business Model Tags
- `marketplace`
- `ready-solution`
- `custom-solution`
- `subscription`
- `internal`

### Functional Tags
- `email-automation`
- `lead-generation`
- `content-marketing`
- `financial-ops`
- `customer-management`
- `technical-integration`
- `monitoring`
- `support`
- `business-process`

### Status Tags
- `production`
- `testing`
- `development`
- `deprecated`
- `template`

### Priority Tags
- `critical`
- `high-priority`
- `medium-priority`
- `low-priority`

### Industry Tags (for Ready Solutions)
- `real-estate`
- `legal`
- `dental`
- `hvac`
- `insurance`
- `generic`

---

## 📋 VIEWS TO CREATE

### 1. **By Business Model** (Group by Business Model)
Shows workflows organized by revenue stream

### 2. **By Priority** (Group by Priority, Sort by Status)
Shows what needs attention first

### 3. **Active Production** (Filter: Status = Production, Active = true)
Shows all live workflows

### 4. **Development Pipeline** (Filter: Status = Development, Sort by Phase)
Shows workflows in progress

### 5. **Revenue Tracking** (Group by Business Model, Sum Price Point)
Shows revenue potential by category

### 6. **Phase Implementation** (Group by Phase, Sort by Priority)
Shows implementation roadmap

---

## 🔄 AUTOMATED WORKFLOWS TO CREATE

### 1. **Workflow Status Sync**
- Trigger: When n8n workflow updated
- Action: Update Airtable record

### 2. **New Workflow Creation**
- Trigger: New n8n workflow created
- Action: Create Airtable record with defaults

### 3. **Revenue Calculation**
- Trigger: When Price Point changes
- Action: Recalculate total revenue projections

### 4. **Phase Progress Tracking**
- Trigger: When Status changes to Production
- Action: Update phase completion metrics

---

## 📝 MANUAL SETUP STEPS

1. **Go to Airtable base**: https://airtable.com/app6saCaH88uK3kCO

2. **Create new table**:
   - Click "Add or import" → "Create empty table"
   - Name: "n8n Workflows"

3. **Add fields** (in order):
   ```
   1. Workflow Name (Single line text) - rename "Name" field
   2. Workflow ID (Single line text)
   3. Business Model (Single select) - add 5 options
   4. Category (Single select) - add 9 options
   5. Status (Single select) - add 4 options
   6. Priority (Single select) - add 4 options
   7. Tags (Multiple selects) - add all tag options
   8. Description (Long text)
   9. Price Point (Currency)
   10. Revenue Model (Single line text)
   11. Node Count (Number)
   12. Last Updated (Date time)
   13. Active (Checkbox)
   14. n8n URL (URL)
   15. Source (Single line text)
   16. Version (Single line text)
   17. Phase (Single select) - add 6 options
   18. Target Audience (Long text)
   19. Features (Long text)
   20. Requirements (Long text)
   ```

4. **Create views**:
   - Add the 6 views listed above
   - Configure filters, groups, and sorts

5. **Set up permissions**:
   - Editor access for Rensto team
   - Read-only for contractors

---

## 📊 SAMPLE RECORDS

### Record 1: INT-LEAD-001
```
Workflow Name: INT-LEAD-001: Lead Machine Orchestrator v2
Workflow ID: x7GwugG3fzdpuC4f
Business Model: Internal
Category: Lead Generation
Status: Production
Priority: Critical
Tags: internal, lead-generation, critical, production
Description: Internal lead generation + outreach coordination. Upgraded from Cold Outreach Machine.
Price Point: $0 (internal)
Revenue Model: Cost Savings
Node Count: 15
Active: ✓
n8n URL: http://173.254.201.134:5678/workflow/x7GwugG3fzdpuC4f
Source: Rensto
Version: v2
Phase: Phase 1
```

### Record 2: SUB-LEAD-001 (to be created)
```
Workflow Name: SUB-LEAD-001: Israeli Professional Lead Generator v1
Workflow ID: (to be assigned)
Business Model: Subscription
Category: Lead Generation
Status: Development
Priority: High
Tags: subscription, lead-generation, high-priority, development
Description: Daily LinkedIn scraping → enrichment → delivery. Subscription service for B2B companies targeting Israeli market.
Price Point: $297-$997/month
Revenue Model: Monthly Subscription (tiered)
Node Count: (TBD)
Active: ☐
n8n URL: (TBD)
Source: New
Version: v1
Phase: Phase 2
Target Audience: B2B companies targeting Israeli market
Features: - Daily LinkedIn scraping\n- Israeli professional filtering\n- Lead enrichment with SerpAPI\n- Automated delivery via email
Requirements: - Apify API\n- LinkedIn credentials\n- SerpAPI key
```

---

## 🔗 INTEGRATION WITH N8N

### Webhook for Status Updates
Create an n8n workflow that:
1. Listens for workflow status changes
2. Updates corresponding Airtable record
3. Logs changes in Slack

### Webhook for New Workflows
Create an n8n workflow that:
1. Detects new workflow creation
2. Creates Airtable record with defaults
3. Notifies team in Slack

---

## 🎯 SUCCESS METRICS

Track in Airtable:
- **Total Workflows**: Count of all records
- **Active Production**: Filter count
- **Revenue Potential**: Sum of Price Points by Business Model
- **Development Progress**: % of workflows in each phase
- **Priority Distribution**: Count by priority level

---

## 📞 USAGE

After setup, use the script to auto-populate:
```bash
cd /Users/shaifriedman/New\ Rensto/rensto
export N8N_API_KEY="your-n8n-api-key"
export AIRTABLE_PAT="your-airtable-pat"
node scripts/implement-n8n-workflow-organization.js
```

This will:
1. Audit all n8n workflows
2. Create/update Airtable records
3. Rename and tag workflows
4. Generate comprehensive report

---

*This table structure enables complete tracking, organization, and business intelligence for all n8n workflows across the Rensto platform.*
