# Rensto Comprehensive Business Data Architecture for Airtable

## Overview
This document outlines a complete business data architecture for Rensto using Airtable's latest features including linked records, rollup fields, automation, and advanced views.

## Base Structure (5 Bases)

### 1. **Core Business Operations** (`rensto-core`)
**Purpose**: Central hub for all business operations and relationships

#### Tables:
- **Companies** (Master company database)
- **Contacts** (All people - customers, vendors, team members)
- **Projects** (All client and internal projects)
- **Tasks** (Task management across all projects)
- **Time Tracking** (Time entries and billable hours)
- **Documents** (File management and document tracking)

### 2. **Financial Management** (`rensto-finance`)
**Purpose**: Complete financial tracking and reporting

#### Tables:
- **Invoices** (All invoices and billing)
- **Payments** (Payment tracking and reconciliation)
- **Expenses** (Business expense tracking)
- **Revenue** (Revenue tracking and forecasting)
- **Budgets** (Budget planning and tracking)
- **Tax Records** (Tax-related documentation)

### 3. **Marketing & Sales** (`rensto-marketing`)
**Purpose**: Lead generation, sales pipeline, and marketing activities

#### Tables:
- **Leads** (Lead generation and qualification)
- **Opportunities** (Sales pipeline and deals)
- **Campaigns** (Marketing campaigns and tracking)
- **Content** (Content creation and management)
- **Social Media** (Social media posts and engagement)
- **Analytics** (Marketing and sales metrics)

### 4. **Operations & Automation** (`rensto-operations`)
**Purpose**: Internal operations, automation workflows, and system management

#### Tables:
- **Workflows** (n8n workflow management)
- **Automations** (Airtable automation tracking)
- **Integrations** (Third-party integrations)
- **System Logs** (System activity and error logs)
- **Maintenance** (System maintenance schedules)
- **Backups** (Backup tracking and verification)

### 5. **Customer Success** (`rensto-customers`)
**Purpose**: Customer relationship management and success tracking

#### Tables:
- **Customers** (Customer profiles and relationships)
- **Support Tickets** (Customer support tracking)
- **Onboarding** (Customer onboarding process)
- **Success Metrics** (Customer success KPIs)
- **Feedback** (Customer feedback and surveys)
- **Retention** (Customer retention tracking)

## Detailed Table Specifications

### Base 1: Core Business Operations (`rensto-core`)

#### **Companies Table**
```
Fields:
- Name (Single line text) - Primary
- Company Type (Single select: Client, Vendor, Partner, Internal)
- Industry (Single line text)
- Website (URL)
- Phone (Phone number)
- Address (Long text)
- Tax ID (Single line text)
- Founded Date (Date)
- Employee Count (Number)
- Annual Revenue (Currency)
- Status (Single select: Active, Inactive, Prospect)
- Notes (Long text)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Contacts Table**
```
Fields:
- Name (Single line text) - Primary
- Company (Linked record to Companies)
- Email (Email)
- Phone (Phone number)
- Role (Single line text)
- Department (Single line text)
- Contact Type (Single select: Customer, Vendor, Team Member, Partner)
- Status (Single select: Active, Inactive, Lead)
- LinkedIn (URL)
- Twitter (URL)
- Birthday (Date)
- Notes (Long text)
- Created Date (Date)
- Last Contact (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Projects Table**
```
Fields:
- Project Name (Single line text) - Primary
- Company (Linked record to Companies)
- Project Manager (Linked record to Contacts)
- Project Type (Single select: Client Project, Internal, R&D, Maintenance)
- Status (Single select: Planning, In Progress, On Hold, Completed, Cancelled)
- Priority (Single select: Low, Medium, High, Critical)
- Start Date (Date)
- End Date (Date)
- Budget (Currency)
- Actual Cost (Currency) - Rollup from Expenses
- Revenue (Currency) - Rollup from Invoices
- Profit Margin (Formula: Revenue - Actual Cost)
- Description (Long text)
- Requirements (Long text)
- Deliverables (Long text)
- Risk Assessment (Long text)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Tasks Table**
```
Fields:
- Task Name (Single line text) - Primary
- Project (Linked record to Projects)
- Assigned To (Linked record to Contacts)
- Created By (Linked record to Contacts)
- Task Type (Single select: Development, Design, Content, Testing, Deployment, Maintenance)
- Status (Single select: To Do, In Progress, Review, Done, Cancelled)
- Priority (Single select: Low, Medium, High, Critical)
- Due Date (Date)
- Estimated Hours (Number)
- Actual Hours (Number) - Rollup from Time Tracking
- Description (Long text)
- Acceptance Criteria (Long text)
- Dependencies (Multiple select from Tasks)
- Attachments (Multiple attachments)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Time Tracking Table**
```
Fields:
- Entry Name (Single line text) - Primary
- Project (Linked record to Projects)
- Task (Linked record to Tasks)
- Person (Linked record to Contacts)
- Date (Date)
- Start Time (Date time)
- End Time (Date time)
- Duration (Number) - Formula: End Time - Start Time
- Billable Hours (Number)
- Rate (Currency)
- Total Amount (Currency) - Formula: Billable Hours * Rate
- Description (Long text)
- Category (Single select: Development, Design, Meeting, Research, Support)
- Approved (Checkbox)
- Approved By (Linked record to Contacts)
- Created Date (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Documents Table**
```
Fields:
- Document Name (Single line text) - Primary
- Project (Linked record to Projects)
- Company (Linked record to Companies)
- Document Type (Single select: Contract, Proposal, Invoice, Report, Manual, Code)
- Status (Single select: Draft, Review, Approved, Published, Archived)
- File (Attachment)
- File Size (Number)
- File Type (Single line text)
- Version (Single line text)
- Created By (Linked record to Contacts)
- Created Date (Date)
- Last Modified (Date)
- Expiry Date (Date)
- Description (Long text)
- Tags (Multiple select)
- Custom Fields (JSON)
```

### Base 2: Financial Management (`rensto-finance`)

#### **Invoices Table**
```
Fields:
- Invoice Number (Single line text) - Primary
- Company (Linked record to Companies)
- Project (Linked record to Projects)
- Contact (Linked record to Contacts)
- Invoice Type (Single select: Standard, Recurring, Credit, Debit)
- Status (Single select: Draft, Sent, Paid, Overdue, Cancelled)
- Issue Date (Date)
- Due Date (Date)
- Payment Terms (Single line text)
- Subtotal (Currency)
- Tax Rate (Number)
- Tax Amount (Currency)
- Total Amount (Currency)
- Amount Paid (Currency)
- Balance Due (Currency)
- Payment Method (Single select: Credit Card, Bank Transfer, Check, Cash)
- Payment Date (Date)
- Notes (Long text)
- Attachments (Multiple attachments)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Payments Table**
```
Fields:
- Payment ID (Single line text) - Primary
- Invoice (Linked record to Invoices)
- Company (Linked record to Companies)
- Payment Method (Single select: Credit Card, Bank Transfer, Check, Cash)
- Payment Date (Date)
- Amount (Currency)
- Reference Number (Single line text)
- Status (Single select: Pending, Completed, Failed, Refunded)
- Notes (Long text)
- Created Date (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Expenses Table**
```
Fields:
- Expense Name (Single line text) - Primary
- Project (Linked record to Projects)
- Category (Single select: Travel, Office, Software, Hardware, Marketing, Legal)
- Amount (Currency)
- Currency (Single select: USD, EUR, ILS)
- Expense Date (Date)
- Receipt (Attachment)
- Vendor (Single line text)
- Description (Long text)
- Approved (Checkbox)
- Approved By (Linked record to Contacts)
- Reimbursed (Checkbox)
- Reimbursement Date (Date)
- Created Date (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Revenue Table**
```
Fields:
- Revenue ID (Single line text) - Primary
- Company (Linked record to Companies)
- Project (Linked record to Projects)
- Revenue Type (Single select: Project Revenue, Recurring, One-time, Commission)
- Amount (Currency)
- Currency (Single select: USD, EUR, ILS)
- Revenue Date (Date)
- Invoice (Linked record to Invoices)
- Description (Long text)
- Created Date (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Budgets Table**
```
Fields:
- Budget Name (Single line text) - Primary
- Project (Linked record to Projects)
- Budget Type (Single select: Project, Department, Company, Annual)
- Period Start (Date)
- Period End (Date)
- Planned Amount (Currency)
- Actual Amount (Currency) - Rollup from Expenses
- Variance (Currency) - Formula: Planned Amount - Actual Amount
- Variance Percentage (Number) - Formula: (Variance / Planned Amount) * 100
- Status (Single select: On Track, Over Budget, Under Budget)
- Notes (Long text)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Tax Records Table**
```
Fields:
- Tax Record ID (Single line text) - Primary
- Company (Linked record to Companies)
- Tax Type (Single select: Income Tax, VAT, Sales Tax, Property Tax)
- Tax Period (Single line text)
- Due Date (Date)
- Amount (Currency)
- Amount Paid (Currency)
- Status (Single select: Pending, Paid, Overdue)
- Filing Date (Date)
- Reference Number (Single line text)
- Notes (Long text)
- Attachments (Multiple attachments)
- Created Date (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

### Base 3: Marketing & Sales (`rensto-marketing`)

#### **Leads Table**
```
Fields:
- Lead Name (Single line text) - Primary
- Company (Single line text)
- Contact Person (Single line text)
- Email (Email)
- Phone (Phone number)
- Source (Single select: Website, Social Media, Referral, Cold Call, Event)
- Status (Single select: New, Contacted, Qualified, Unqualified, Converted)
- Priority (Single select: Low, Medium, High, Critical)
- Estimated Value (Currency)
- Industry (Single line text)
- Notes (Long text)
- Assigned To (Linked record to Contacts)
- Created Date (Date)
- Last Contact (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Opportunities Table**
```
Fields:
- Opportunity Name (Single line text) - Primary
- Company (Linked record to Companies)
- Contact (Linked record to Contacts)
- Lead (Linked record to Leads)
- Stage (Single select: Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost)
- Probability (Number)
- Expected Value (Currency)
- Expected Close Date (Date)
- Actual Close Date (Date)
- Won Amount (Currency)
- Lost Reason (Single line text)
- Description (Long text)
- Assigned To (Linked record to Contacts)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Campaigns Table**
```
Fields:
- Campaign Name (Single line text) - Primary
- Campaign Type (Single select: Email, Social Media, Content, Event, Paid Ads)
- Status (Single select: Planning, Active, Paused, Completed)
- Start Date (Date)
- End Date (Date)
- Budget (Currency)
- Actual Spend (Currency)
- Target Audience (Long text)
- Goals (Long text)
- Results (Long text)
- ROI (Number)
- Created By (Linked record to Contacts)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Content Table**
```
Fields:
- Content Title (Single line text) - Primary
- Content Type (Single select: Blog Post, Video, Podcast, Whitepaper, Case Study)
- Status (Single select: Draft, Review, Published, Archived)
- Author (Linked record to Contacts)
- Campaign (Linked record to Campaigns)
- Publish Date (Date)
- URL (URL)
- Description (Long text)
- Keywords (Multiple select)
- Performance Metrics (JSON)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Social Media Table**
```
Fields:
- Post Title (Single line text) - Primary
- Platform (Single select: LinkedIn, Twitter, Facebook, Instagram, YouTube)
- Content Type (Single select: Text, Image, Video, Link, Poll)
- Status (Single select: Draft, Scheduled, Published, Archived)
- Scheduled Date (Date time)
- Published Date (Date time)
- Content (Long text)
- URL (URL)
- Engagement Metrics (JSON)
- Campaign (Linked record to Campaigns)
- Created By (Linked record to Contacts)
- Created Date (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Analytics Table**
```
Fields:
- Metric Name (Single line text) - Primary
- Metric Type (Single select: Traffic, Conversion, Revenue, Engagement, Performance)
- Period (Single select: Daily, Weekly, Monthly, Quarterly, Yearly)
- Date (Date)
- Value (Number)
- Target (Number)
- Variance (Number) - Formula: Value - Target
- Variance Percentage (Number) - Formula: (Variance / Target) * 100
- Source (Single line text)
- Notes (Long text)
- Created Date (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

### Base 4: Operations & Automation (`rensto-operations`)

#### **Workflows Table**
```
Fields:
- Workflow Name (Single line text) - Primary
- Workflow Type (Single select: n8n, Airtable, Zapier, Custom)
- Status (Single select: Active, Inactive, Development, Testing)
- Trigger (Single line text)
- Actions (Long text)
- Schedule (Single line text)
- Last Run (Date time)
- Next Run (Date time)
- Success Rate (Number)
- Error Count (Number)
- Performance Metrics (JSON)
- Documentation (Long text)
- Created By (Linked record to Contacts)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Automations Table**
```
Fields:
- Automation Name (Single line text) - Primary
- Platform (Single select: Airtable, n8n, Zapier, Custom)
- Type (Single select: Trigger, Action, Scheduled)
- Status (Single select: Active, Inactive, Error)
- Trigger Conditions (Long text)
- Actions (Long text)
- Schedule (Single line text)
- Last Run (Date time)
- Next Run (Date time)
- Success Count (Number)
- Error Count (Number)
- Performance Metrics (JSON)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Integrations Table**
```
Fields:
- Integration Name (Single line text) - Primary
- Status (Single select: Active, Inactive, Development, Testing)
- API Key (Single line text) - Encrypted
- Endpoint URL (URL)
- Authentication Method (Single select: API Key, OAuth, Basic Auth)
- Last Sync (Date time)
- Sync Frequency (Single line text)
- Error Count (Number)
- Performance Metrics (JSON)
- Documentation (Long text)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **System Logs Table**
```
Fields:
- Log ID (Single line text) - Primary
- Log Level (Single select: Info, Warning, Error, Critical)
- Message (Long text)
- Details (JSON)
- Timestamp (Date time)
- User (Linked record to Contacts)
- IP Address (Single line text)
- User Agent (Long text)
- Resolved (Checkbox)
- Resolution Notes (Long text)
- Created Date (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Maintenance Table**
```
Fields:
- Maintenance ID (Single line text) - Primary
- Maintenance Type (Single select: Scheduled, Emergency, Update, Backup)
- Status (Single select: Scheduled, In Progress, Completed, Cancelled)
- Scheduled Date (Date time)
- Start Time (Date time)
- End Time (Date time)
- Duration (Number) - Formula: End Time - Start Time
- Description (Long text)
- Actions Taken (Long text)
- Issues Found (Long text)
- Assigned To (Linked record to Contacts)
- Created Date (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Backups Table**
```
Fields:
- Backup ID (Single line text) - Primary
- Backup Type (Single select: Full, Incremental, Differential)
- Status (Single select: Scheduled, In Progress, Completed, Failed)
- Backup Date (Date time)
- File Size (Number)
- Location (Single line text)
- Retention Period (Number)
- Expiry Date (Date)
- Verification Status (Single select: Pending, Verified, Failed)
- Notes (Long text)
- Created Date (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

### Base 5: Customer Success (`rensto-customers`)

#### **Customers Table**
```
Fields:
- Customer Name (Single line text) - Primary
- Company (Linked record to Companies)
- Contact Person (Linked record to Contacts)
- Customer Type (Single select: Individual, Small Business, Enterprise)
- Status (Single select: Active, Inactive, Churned, Prospect)
- Onboarding Status (Single select: Not Started, In Progress, Completed)
- Subscription Plan (Single line text)
- Monthly Recurring Revenue (Currency)
- Total Revenue (Currency)
- Customer Since (Date)
- Last Activity (Date)
- Notes (Long text)
- Success Manager (Linked record to Contacts)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Support Tickets Table**
```
Fields:
- Ticket ID (Single line text) - Primary
- Customer (Linked record to Customers)
- Contact (Linked record to Contacts)
- Project (Linked record to Projects)
- Priority (Single select: Low, Medium, High, Critical)
- Status (Single select: Open, In Progress, Waiting for Customer, Resolved, Closed)
- Category (Single select: Technical, Billing, Feature Request, Bug Report)
- Subject (Single line text)
- Description (Long text)
- Assigned To (Linked record to Contacts)
- Created Date (Date)
- Updated Date (Date)
- Resolved Date (Date)
- Resolution Time (Number) - Formula: Resolved Date - Created Date
- Customer Satisfaction (Number)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Onboarding Table**
```
Fields:
- Onboarding ID (Single line text) - Primary
- Customer (Linked record to Customers)
- Onboarding Manager (Linked record to Contacts)
- Status (Single select: Not Started, In Progress, Completed, On Hold)
- Start Date (Date)
- Completion Date (Date)
- Duration (Number) - Formula: Completion Date - Start Date
- Milestones (JSON)
- Completed Milestones (JSON)
- Next Steps (Long text)
- Notes (Long text)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Success Metrics Table**
```
Fields:
- Metric ID (Single line text) - Primary
- Customer (Linked record to Customers)
- Metric Type (Single select: Usage, Engagement, Satisfaction, Revenue)
- Metric Name (Single line text)
- Value (Number)
- Target (Number)
- Variance (Number) - Formula: Value - Target
- Period (Single select: Daily, Weekly, Monthly, Quarterly)
- Date (Date)
- Notes (Long text)
- Created Date (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Feedback Table**
```
Fields:
- Feedback ID (Single line text) - Primary
- Customer (Linked record to Customers)
- Contact (Linked record to Contacts)
- Feedback Type (Single select: Survey, Interview, Review, Support)
- Rating (Number)
- Category (Single select: Product, Service, Support, Overall)
- Feedback (Long text)
- Action Items (Long text)
- Status (Single select: New, In Review, Actioned, Closed)
- Assigned To (Linked record to Contacts)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

#### **Retention Table**
```
Fields:
- Retention ID (Single line text) - Primary
- Customer (Linked record to Customers)
- Retention Type (Single select: Monthly, Quarterly, Annual)
- Period Start (Date)
- Period End (Date)
- Status (Single select: Retained, Churned, At Risk)
- Churn Reason (Single line text)
- Retention Score (Number)
- Risk Factors (JSON)
- Intervention Actions (Long text)
- Success Manager (Linked record to Contacts)
- Created Date (Date)
- Last Updated (Date)
- Tags (Multiple select)
- Custom Fields (JSON)
```

## Key Features to Implement

### 1. **Linked Records**
- Cross-base relationships using Airtable's linked record fields
- Rollup fields for calculated values across related records
- Lookup fields for displaying related information

### 2. **Automation**
- Automated workflows for common business processes
- Trigger-based actions for status changes
- Scheduled automations for recurring tasks

### 3. **Advanced Views**
- Kanban boards for project and task management
- Calendar views for time tracking and scheduling
- Gallery views for document and content management
- Form views for data entry

### 4. **Reporting & Analytics**
- Dashboard views with key metrics
- Pivot tables for financial analysis
- Charts and graphs for visualization
- Export capabilities for external reporting

### 5. **Security & Permissions**
- Role-based access control
- Field-level permissions
- Audit trails for sensitive data
- Data encryption for API keys

## Implementation Plan

### Phase 1: Core Structure
1. Create all 5 bases with basic table structures
2. Set up primary fields and basic field types
3. Establish naming conventions and standards

### Phase 2: Advanced Features
1. Add linked record fields for relationships
2. Implement rollup and lookup fields
3. Create calculated fields and formulas

### Phase 3: Automation & Integration
1. Set up Airtable automations
2. Configure MCP server integration
3. Implement workflow triggers

### Phase 4: Data Migration
1. Migrate existing business data
2. Set up data validation rules
3. Create backup and recovery procedures

### Phase 5: Optimization
1. Performance tuning and optimization
2. User training and documentation
3. Ongoing maintenance and updates

This comprehensive architecture provides a solid foundation for all Rensto business operations while leveraging Airtable's most powerful features for scalability and efficiency.


> **📚 MCP Reference**: For current MCP server status and configurations, see [MCP_SERVERS_AUTHORITATIVE.md](./MCP_SERVERS_AUTHORITATIVE.md)