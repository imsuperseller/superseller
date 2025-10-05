# 🎯 CUSTOMER N8N MANAGEMENT SYSTEM - Complete Plan

**Date**: October 5, 2025
**Purpose**: Generic, modular, automated system for managing customer n8n instances
**Status**: Planning Phase
**Customers**: Tax4Us, Shelly Mizrahi (+ all future customers)

---

## 📊 SYSTEM OVERVIEW

### **What This System Does**

When a customer buys Ready Solutions, Custom Solutions, or Subscriptions, we often deploy workflows in their n8n instance. This system:

1. **Monitors** their workflows (health, status, errors)
2. **Tracks** usage (executions, credits, performance)
3. **Alerts** us when something breaks (proactive support)
4. **Reports** monthly metrics (usage, ROI, recommendations)
5. **Displays** everything in admin.rensto.com (at-a-glance health)
6. **Exposes** read-only view to customer portal (transparency)

**Result**: Proactive customer success, reduced churn, scalable support

---

## 🏗️ ARCHITECTURE

```
┌────────────────────────────────────────────────────────┐
│  CUSTOMER N8N INSTANCES (Tax4Us, Shelly, etc.)        │
│  - tax4us.n8n.cloud (12 workflows)                     │
│  - shelly.n8n.cloud (8 workflows)                      │
└────────────────────────────────────────────────────────┘
                         ↓ API (every 15 min)
┌────────────────────────────────────────────────────────┐
│  INT-SYNC-003: Customer n8n Health Monitor            │
│  - Fetch all customer workflows                        │
│  - Check status, executions, errors                    │
│  - Update Airtable                                     │
│  - Trigger alerts if errors detected                   │
└────────────────────────────────────────────────────────┘
                         ↓ Sync data
┌────────────────────────────────────────────────────────┐
│  AIRTABLE: Customer n8n Data                          │
│  - Customer n8n Instances (2 records)                  │
│  - Customer Workflows (20 records)                     │
│  - Customer Workflow Executions (log)                  │
└────────────────────────────────────────────────────────┘
                         ↓ Display
┌────────────────────────────────────────────────────────┐
│  ADMIN.RENSTO.COM: Customer Management                │
│  - Dashboard: Customer health overview                 │
│  - Customer List: n8n connection status                │
│  - Customer Detail: Workflows, metrics, actions        │
└────────────────────────────────────────────────────────┘
                         ↓ Read-only view
┌────────────────────────────────────────────────────────┐
│  PORTAL.RENSTO.COM: Customer Portal                   │
│  - Your Workflows (status, executions)                 │
│  - Usage Metrics (monthly report)                      │
│  - Support Tickets                                     │
└────────────────────────────────────────────────────────┘
```

---

## 📦 AIRTABLE STRUCTURE

### **New Table 1: "Customer n8n Instances"**

**Location**: Core Business Operations base (app4nJpP1ytGukXQT)

**Fields**:
| Field | Type | Description |
|-------|------|-------------|
| Customer | Link to Customers | Which customer owns this instance |
| n8n URL | URL | Their n8n instance URL |
| n8n Type | Single Select | Cloud / Self-hosted / Rensto-managed |
| API Key | Long Text | Encrypted API key |
| Connection Status | Single Select | ✅ Connected / ❌ Failed / ⏳ Pending Setup |
| Last Health Check | Date/Time | When we last synced |
| Total Workflows | Number | Total workflow count |
| Active Workflows | Number | Currently active |
| Inactive Workflows | Number | Currently inactive |
| Error Count | Number | Workflows with errors |
| Last Error Date | Date/Time | Most recent error |
| Service Type | Link to Services | Which service(s) they purchased |
| Monthly Execution Limit | Number | Contracted execution limit |
| Current Month Executions | Number | Executions this month |
| Overage Alert | Checkbox | Alert if over limit |
| Auto-Sync Enabled | Checkbox | Enable/disable monitoring |

**Initial Records**:
- Tax4Us (tax4us.n8n.cloud, Cloud, credentials from n8n creds table)
- Shelly Mizrahi (shelly.n8n.cloud, Cloud, credentials from n8n creds table)

---

### **New Table 2: "Customer Workflows"**

**Location**: Core Business Operations base (app4nJpP1ytGukXQT)

**Fields**:
| Field | Type | Description |
|-------|------|-------------|
| Customer | Link to Customers | Which customer |
| n8n Instance | Link to Customer n8n Instances | Which n8n instance |
| Workflow ID | Single Line Text | n8n workflow ID |
| Workflow Name | Single Line Text | Workflow name |
| Status | Single Select | ✅ Active / ❌ Inactive / ⚠️ Error |
| Last Execution | Date/Time | Last successful execution |
| Execution Count (Month) | Number | Executions this month |
| Error Count (Month) | Number | Errors this month |
| Last Error | Long Text | Most recent error message |
| Last Error Date | Date/Time | When error occurred |
| Tags | Multiple Select | Tags from n8n |
| Service Type | Link to Services | Which service this workflow belongs to |
| Created Date | Date | When workflow was created |
| Updated Date | Date | Last modified |
| Auto-Restart | Checkbox | Auto-restart if fails |
| Alert on Error | Checkbox | Alert admin if error |

**Initial Records**:
- 12 workflows from Tax4Us n8n instance
- 8 workflows from Shelly n8n instance

---

### **New Table 3: "Customer Workflow Executions" (Optional)**

**Location**: Core Business Operations base (app4nJpP1ytGukXQT)

**Purpose**: Log execution history for analytics

**Fields**:
| Field | Type | Description |
|-------|------|-------------|
| Customer Workflow | Link to Customer Workflows | Which workflow |
| Execution ID | Single Line Text | n8n execution ID |
| Status | Single Select | Success / Failed / Running |
| Started At | Date/Time | Execution start |
| Finished At | Date/Time | Execution end |
| Duration (seconds) | Number | How long it ran |
| Error | Long Text | Error message if failed |
| Nodes Executed | Number | How many nodes ran |

**Usage**: Historical data, analytics, billing

---

## 🔄 N8N WORKFLOWS

### **INT-SYNC-003: Customer n8n Health Monitor**

**Purpose**: Sync customer n8n workflow data every 15 minutes

**Trigger**: Schedule (every 15 minutes)

**Flow**:
```
1. Get All Customer n8n Instances from Airtable
   ↓ Filter: Auto-Sync Enabled = true
2. For Each Instance:
   ↓
3. Fetch All Workflows (n8n API)
   ↓ GET https://{customer}.n8n.cloud/api/v1/workflows
4. Fetch Execution History (last 24 hours)
   ↓ GET https://{customer}.n8n.cloud/api/v1/executions
5. Transform Data
   ↓ Calculate: active count, error count, execution count
6. Update Airtable "Customer Workflows" table
   ↓ Upsert by Workflow ID
7. Update Airtable "Customer n8n Instances" table
   ↓ Update totals, last check time
8. Check for Errors
   ↓ If error count > 0
9. Trigger INT-ALERT-001: Customer Workflow Error Alert
```

**Output**: Up-to-date customer workflow data in Airtable

---

### **INT-ALERT-001: Customer Workflow Error Alert**

**Purpose**: Alert admin when customer workflow fails

**Trigger**: Webhook (called by INT-SYNC-003)

**Flow**:
```
1. Receive Error Data
   ↓ Customer, workflow name, error message, timestamp
2. Check Alert History
   ↓ Don't spam (max 1 alert per hour per workflow)
3. Create Support Ticket in Airtable
   ↓ Table: Customer Support Tickets
   ↓ Priority: High, Type: Workflow Error
4. Send Slack Notification (if Slack connected)
   ↓ Message: "⚠️ {Customer} workflow '{workflow}' failed: {error}"
5. Send Email to Admin
   ↓ To: admin@rensto.com
   ↓ Subject: "Customer Workflow Alert: {customer}"
6. Log Alert in Airtable
```

**Output**: Admin notified, support ticket created, can fix proactively

---

### **INT-REPORT-001: Monthly Customer Usage Reports**

**Purpose**: Generate monthly usage report for each customer

**Trigger**: Schedule (1st of month, 9 AM)

**Flow**:
```
1. Get All Customers with n8n Instances
   ↓
2. For Each Customer:
   ↓
3. Calculate Monthly Metrics
   ↓ Total executions, error rate, most used workflows
4. Generate Report (AI summary)
   ↓ OpenAI: "Generate customer-friendly report..."
5. Create PDF Report
   ↓
6. Upload to Customer Portal
   ↓ Store in Airtable Attachments
7. Send Email to Customer
   ↓ Subject: "Your Monthly Automation Report - {month}"
8. Log Report Sent
```

**Output**: Professional monthly reports, customer transparency

---

## 🖥️ ADMIN.RENSTO.COM UPDATES

### **New Section: "Customer n8n Instances"**

**Location**: Sidebar → Customers → n8n Instances

**Main View** (Table):
```
┌─────────────────────────────────────────────────────────────────┐
│ Customer n8n Instances                            [+ Add New]    │
├─────────────┬────────────┬────────┬───────────┬────────┬────────┤
│ Customer    │ n8n URL    │ Status │ Workflows │ Errors │ Actions│
├─────────────┼────────────┼────────┼───────────┼────────┼────────┤
│ Tax4Us      │ tax4us...  │ ✅     │ 12 (11A)  │ 0      │ [View] │
│ Shelly C.   │ shelly...  │ ⚠️     │ 8 (7A)    │ 1      │ [View] │
└─────────────┴────────────┴────────┴───────────┴────────┴────────┘

Legend: A = Active workflows
Status: ✅ Connected, ⚠️ Has Errors, ❌ Connection Failed
```

**Actions**:
- View: Open customer detail page
- Test Connection: Verify API key works
- Sync Now: Trigger immediate sync
- Edit: Update credentials/settings

---

### **Customer Detail Page**

**URL**: `/admin/customers/{customer-id}/n8n`

**Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Tax4Us - n8n Instance                                           │
│ tax4us.n8n.cloud                   Last checked: 5 minutes ago  │
├─────────────────────────────────────────────────────────────────┤
│ OVERVIEW                                                        │
│ ┌──────────┬──────────┬──────────┬──────────┐                  │
│ │ Total    │ Active   │ Inactive │ Errors   │                  │
│ │ 12       │ 11       │ 1        │ 0        │                  │
│ └──────────┴──────────┴──────────┴──────────┘                  │
│                                                                 │
│ WORKFLOWS                                        [Refresh Now]  │
│ ┌───────────────────────┬────────┬────────────┬───────────┐    │
│ │ Name                  │ Status │ Last Run   │ Exec/mo   │    │
│ ├───────────────────────┼────────┼────────────┼───────────┤    │
│ │ TAX-LEAD-001: Lead... │ ✅     │ 10 min ago │ 1,234     │    │
│ │ TAX-CRM-001: Client...│ ✅     │ 1 hour ago │ 456       │    │
│ │ TAX-EMAIL-001: Email..│ ⚠️     │ 2 days ago │ 89 (2 err)│    │
│ │ ...                   │        │            │           │    │
│ └───────────────────────┴────────┴────────────┴───────────┘    │
│                                                                 │
│ RECENT ERRORS (Last 7 Days)                                    │
│ • TAX-EMAIL-001 failed 2 times: "Gmail connection timeout"     │
│   Last occurred: Oct 3, 2025 2:34 PM                           │
│                                                                 │
│ USAGE THIS MONTH                                                │
│ Executions: 1,779 / 5,000 (35.6%)                              │
│ [████████░░░░░░░░░░░░░░] 35.6%                                 │
│                                                                 │
│ QUICK ACTIONS                                                   │
│ [View in n8n] [Sync Now] [Generate Report] [Contact Customer] │
└─────────────────────────────────────────────────────────────────┘
```

**Features**:
- Real-time workflow status
- Click workflow → Open in customer's n8n (new tab)
- Error history with timestamps
- Usage tracking against limits
- Quick actions (sync, report, contact)

---

### **Dashboard Widget** (Main Admin Dashboard)

**Location**: Main Dashboard → Customer Health section

**Widget**:
```
┌─────────────────────────────────────────────┐
│ 🔌 Customer n8n Health                      │
├─────────────────────────────────────────────┤
│ Customers Monitored: 2                      │
│ Total Workflows: 20 (18 active)             │
│ ⚠️ Errors Detected: 1                       │
│                                             │
│ Recent Issues:                              │
│ • Shelly - Email Workflow failed (5m ago)   │
│                                             │
│ [View All Instances]                        │
└─────────────────────────────────────────────┘
```

---

## 🌐 CUSTOMER PORTAL UPDATES

### **New Section: "Your Workflows"**

**Location**: portal.rensto.com/{customer-slug}/workflows

**Customer View** (Read-Only):
```
┌─────────────────────────────────────────────────────────────────┐
│ Your Automation Workflows                                       │
│ Powered by n8n                          Last updated: 5 min ago │
├─────────────────────────────────────────────────────────────────┤
│ OVERVIEW                                                        │
│ ┌──────────┬──────────┬──────────┬──────────┐                  │
│ │ Total    │ Active   │ This Mo  │ Success  │                  │
│ │ 12       │ 11       │ 1,779    │ 99.2%    │                  │
│ └──────────┴──────────┴──────────┴──────────┘                  │
│                                                                 │
│ YOUR WORKFLOWS                                                  │
│ ┌───────────────────────┬────────┬────────────┬───────────┐    │
│ │ Name                  │ Status │ Last Run   │ Runs/mo   │    │
│ ├───────────────────────┼────────┼────────────┼───────────┤    │
│ │ Lead Generation       │ ✅     │ 10 min ago │ 1,234     │    │
│ │ CRM Sync              │ ✅     │ 1 hour ago │ 456       │    │
│ │ Email Campaigns       │ ⚠️     │ 2 days ago │ 89        │    │
│ │ ...                   │        │            │           │    │
│ └───────────────────────┴────────┴────────────┴───────────┘    │
│                                                                 │
│ 💡 Your workflows have saved approximately 127 hours this      │
│    month, equivalent to $5,080 in labor costs.                 │
│                                                                 │
│ Need help? [Contact Support]                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Features**:
- Customer sees their workflows (transparency)
- ROI calculation (hours saved, cost saved)
- Status visibility (if something's broken, they know)
- Support integration (can create ticket from here)

---

## 🎯 MODULAR & DYNAMIC DESIGN

### **Service-Agnostic**

Doesn't matter if customer bought:
- Ready Solutions (industry package)
- Custom Solutions (bespoke project)
- Subscriptions (ongoing service)

**System works the same**:
1. Store their n8n credentials in Airtable
2. Sync their workflows every 15 minutes
3. Display in admin dashboard
4. Expose to customer portal
5. Alert on errors
6. Generate monthly reports

---

### **Dynamic Features**

**Per-Customer Toggles**:
- `Auto-Sync Enabled`: Turn monitoring on/off
- `Alert on Error`: Enable/disable error alerts
- `Monthly Reports`: Send monthly reports or not
- `Portal Access`: Give customer portal access or not

**Per-Workflow Toggles**:
- `Auto-Restart`: Auto-restart workflow if it fails
- `Alert on Error`: Alert admin if this specific workflow fails
- `Critical`: Flag high-priority workflows (alert faster)

**Scalable**:
- Currently: 2 customers (Tax4Us, Shelly)
- Future: 100+ customers
- System scales automatically (no code changes needed)
- Just add new records to Airtable

---

## 📈 BUSINESS VALUE

### **For Rensto**

1. **Proactive Support**
   - Catch issues before customer notices
   - Reduce support tickets
   - Improve customer satisfaction

2. **Scalable Operations**
   - Monitor 100+ customers with 0 manual work
   - Automated alerts and reports
   - No need to hire support team

3. **Professional Image**
   - Real-time monitoring dashboard
   - Monthly usage reports
   - Transparent customer portal

4. **Data-Driven Decisions**
   - Which workflows are most valuable?
   - What error patterns exist?
   - How to optimize pricing?

5. **Retention**
   - Customers see value (monthly reports)
   - Fewer issues (proactive fixes)
   - Professional experience

---

### **For Customers**

1. **Peace of Mind**
   - "Rensto is watching my automations"
   - Proactive issue detection
   - Less downtime

2. **Transparency**
   - See workflow status anytime
   - Monthly usage reports
   - ROI calculations

3. **Faster Support**
   - Rensto can see their workflows
   - Debug faster
   - Remote fixes

4. **Professional Experience**
   - Dedicated portal
   - Automated reports
   - Feels like enterprise service

---

## 🚀 EXECUTION PLAN

### **Phase 1: Foundation** (2-3 days)

**Tasks**:
1. Create Airtable tables:
   - "Customer n8n Instances"
   - "Customer Workflows"
2. Manually add Tax4Us and Shelly credentials
3. Build INT-SYNC-003: Customer n8n Health Monitor
4. Test sync for both customers
5. Verify data accuracy

**Deliverable**: Working sync, data in Airtable

---

### **Phase 2: Admin Dashboard** (2-3 days)

**Tasks**:
1. Add "n8n Instances" section to admin.rensto.com
2. Build customer list view (table)
3. Build customer detail page (workflows, metrics)
4. Add dashboard widget (customer health overview)
5. Test with real data

**Deliverable**: Admin can view customer workflows

---

### **Phase 3: Automation & Alerts** (2-3 days)

**Tasks**:
1. Build INT-ALERT-001: Customer Workflow Error Alert
2. Test error detection and alerting
3. Build INT-REPORT-001: Monthly Customer Reports
4. Generate sample report for Tax4Us
5. Set up email delivery

**Deliverable**: Proactive alerts, automated reports

---

### **Phase 4: Customer Portal** (2-3 days)

**Tasks**:
1. Add "Your Workflows" section to customer portal
2. Build workflow list view (read-only)
3. Add ROI calculations
4. Test with Tax4Us and Shelly
5. Get customer feedback

**Deliverable**: Customers can see their workflows

---

### **Total Timeline**: 8-12 days

---

## 📍 WHERE THIS FITS IN PRIORITIES

### **Current Priority List** (from CLAUDE.md):

1. **Priority 1**: Revenue Collection (Stripe) - CRITICAL
2. **Priority 2**: Business Model (subscriptions, Typeforms) - HIGH
3. **Priority 3**: Admin Dashboard - HIGH
4. **Priority 4**: Data Sync - HIGH
5. **Priority 5**: Mobile Optimization - MEDIUM
6. **Priority 6**: Financial Tracking - MEDIUM
7. **Priority 7**: Voice AI & eSignatures - MEDIUM

### **Where Customer n8n Management Fits**:

**As Part of Priority 3** (Admin Dashboard):
- Customer management is core admin functionality
- Workflow monitoring enhances dashboard value
- Professional admin experience

**As Part of Priority 4** (Data Sync):
- Syncing customer n8n data to Airtable
- Automated data flow
- Real-time updates

**New Priority: Customer Success** (HIGH):
- Proactive support reduces churn
- Scalable operations (monitor 100+ customers)
- Professional customer experience

---

### **Recommended Execution Order**:

**Week 1**: Stripe payment flows (Priority 1)
**Week 2**: Typeforms + Subscriptions (Priority 2)
**Week 3**: **Customer n8n Management (Phases 1-2)** ← HERE
**Week 4**: **Customer n8n Management (Phases 3-4)** + Admin Dashboard redesign
**Week 5**: Data sync workflows (Priority 4)
**Week 6**: Mobile optimization (Priority 5)

---

## 💡 QUICK START (Day 1)

**Immediate Next Steps**:

1. **Create Airtable Tables** (30 min)
   - Add "Customer n8n Instances" table
   - Add "Customer Workflows" table
   - Add initial fields

2. **Add Customer Data** (15 min)
   - Tax4Us record (n8n credentials)
   - Shelly Mizrahi record (n8n credentials)

3. **Build Basic Sync** (2-3 hours)
   - Create INT-SYNC-003 workflow
   - Fetch workflows from both customers
   - Update Airtable

4. **Test & Verify** (1 hour)
   - Run sync manually
   - Check Airtable data
   - Verify accuracy

**End of Day 1**: Have working sync, customer data in Airtable

---

## 🎯 SUCCESS METRICS

**After Full Implementation**:

- ✅ 2 customers monitored (Tax4Us, Shelly)
- ✅ 20 workflows tracked
- ✅ Sync every 15 minutes (automated)
- ✅ Error alerts working (proactive support)
- ✅ Monthly reports sent (customer transparency)
- ✅ Admin dashboard showing health (at-a-glance view)
- ✅ Customer portal showing workflows (transparency)
- ✅ 0 manual work required (fully automated)

**Future State** (100 customers):
- 100 customers monitored
- 500+ workflows tracked
- 0 additional manual work (scales automatically)
- Professional enterprise-grade service

---

## 📝 NOTES

**Security**:
- Encrypt n8n API keys in Airtable (use Airtable encryption extension)
- Use environment variables in n8n workflows (don't hardcode)
- Limit API key permissions (read-only when possible)

**Scalability**:
- System designed for 100+ customers
- No code changes needed to add customers
- Just add Airtable records + credentials

**Flexibility**:
- Per-customer toggles (sync on/off, alerts, reports)
- Per-workflow settings (auto-restart, critical flag)
- Service-agnostic (works for any service type)

---

**Ready to implement?** Start with Phase 1 (Foundation) after completing Stripe payment flows.
