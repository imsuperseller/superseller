# Airtable Business Data Setup Guide

## Overview
This guide will help you set up the Rensto business data structure in Airtable manually, since the API doesn't support programmatic table creation.

## Available Bases
- **משאבים** (appqY1p53ge7UqxUO) - create access
- **המאגר** (appLOvzN5ap47GJl0) - create access
- **Groceries copy** (app3eCU24yxD5OWwm) - create access
- **דילי מילי** (app2uZ1yhtokf8DXc) - create access
- **דילי מילי חדש** (appjL0rSZZ6c8AWKo) - create access
- **Apartment Hunting** (appxj059MvIaQ9W4c) - create access
- **STR Property Management** (apptXBaizvTfPoRr8) - create access
- **OpenAI** (app9jCd6uBvFZgjum) - create access
- **Untitled Base** (appFP57Ai15nl2GVN) - create access
- **Property Management** (appNZ028VPO5OZhYP) - create access
- **Guest Management** (appRKz4U1GAYCI9Jn) - create access
- **Financial Management** (appHM4DFQDfut9eT2) - create access
- **Marketing Management** (appiUgbdT3xsBox6h) - create access
- **The Northern Collection** (appFjirN9LwRPuog8) - create access
- **Automations** (appvTgU5KZXwHZUqC) - create access
- **Content Management** (appiGpAQkZDMMojx8) - create access
- **Dubai Research** (appAXXB9aj92HjmEY) - create access
- **Content Generation** (appSoTojCS6c22O7f) - create access
- **Performance Metrics** (apppyFfqxuE5RwmjO) - create access
- **Echos of October** (appqTkx67X6HvZ4yo) - create access
- **SuperSeller - the Agency** (appLvQoOMb2XnTaG5) - create access
- **Untitled Base** (appgOyus2jQWBp4wN) - create access
- **Smith's Solar CRM** (appyFgN23VopoM2LD) - create access
- **Midjourney** (appKJ4Y4FuB60KiYc) - create access
- **Sales Optimization Conversations** (appZIJrbZzGzNKHx9) - create access
- **The House** (appVXRmmyGbFwf7vF) - create access
- **Moving? Yard Sale** (appg5acL4SRegdSBT) - create access
- **RELOCATION** (appfweSTFDGaLimbM) - create access
- **SGD Springs Inventory and Sales** (app8zfyqB81WILWmY) - create access
- **01-01-24 to 06-31-24 sale report  shai** (appQkPB3poOPQji00) - create access
- **Smart Devices Integration** (appOWrsYoXqWsXFI1) - create access
- **ChimneyEase Operations Tracker** (appGEHUSBsNMPHOXI) - create access
- **ChimneyEase Blog Management** (appWNUW1BMttgWZHK) - create access
- **Imported Base** (appyBvLsqltWNSbvX) - create access
- **Avishag's Real Estate Assistant App** (appRR5ruBiN0hphFg) - create access
- **AI Super Agent System** (appeV2B2t3JS6N3Y9) - create access
- **Amazon Wholesale Sourcing** (appUScWNrYQG1Btjv) - create access
- **IsraeliDaily Pipline** (apprDdIg4xFdgCJvE) - create access
- **Rensto Manage** (appWxram633ChhzyY) - create access
- **Avishag DFW Funnel** (appNAo9Ga8xbFzWW1) - create access
- **TNK Figures** (appkCVW1p1kMG3zM5) - create access
- **Real Estate Scraped Addresses** (app7BZRcnLGu2tXjD) - create access
- **Automation Scenarios Project Management** (appN6c8XWSKLNWzWh) - create access
- **Demos** (appiBL42f7GAn64x6) - create access
- **🎓 Shiran Lesson Management** (appZaOEZFVTZR7y1H) - create access
- **ניהול מדיה חברתית אוהדי ליברפול ישראל ⚽** (appx8De4R4xA7MULu) - create access
- **שלי מזרחי** (appW6kZdAXdRfTApA) - create access
- **Rensto** (appQijHhqqP4z6wGe) - create access
- **EagleTorque** (appSgjo19ui5dVb96) - create access
- **אוטומציה חשבוניות הוצאות** (app2NMzKhYFKV8K72) - read access
- **Automatic Task Template** (app51GkdMDKdcf5Xy) - read access
- **Groceries** (app6yerTruQJkDPSS) - read access
- **הוצאות** (appwVbiaiUNfkldBF) - create access

## Recommended Base
Use the **Rensto** base (appQijHhqqP4z6wGe) for the business data structure.

## Setup Steps

### Step 1: Create Business Tables

#### 1.1 Customers Table
Create a new table called "Customers" with the following fields:
- **Name** (Single line text)
- **Email** (Email)
- **Phone** (Phone number)
- **Company** (Single line text)
- **Status** (Single select: Active, Inactive, Prospect, Lead)
- **Notes** (Long text)
- **Created Date** (Date)

#### 1.2 Projects Table
Create a new table called "Projects" with the following fields:
- **Project Name** (Single line text)
- **Customer** (Single line text)
- **Status** (Single select: Planning, In Progress, Completed, On Hold)
- **Start Date** (Date)
- **End Date** (Date)
- **Budget** (Currency)
- **Description** (Long text)
- **Priority** (Single select: Low, Medium, High, Critical)

#### 1.3 Invoices Table
Create a new table called "Invoices" with the following fields:
- **Invoice Number** (Single line text)
- **Customer** (Single line text)
- **Project** (Single line text)
- **Amount** (Currency)
- **Status** (Single select: Draft, Sent, Paid, Overdue)
- **Issue Date** (Date)
- **Due Date** (Date)
- **Notes** (Long text)

#### 1.4 Tasks Table
Create a new table called "Tasks" with the following fields:
- **Task Name** (Single line text)
- **Project** (Single line text)
- **Assigned To** (Single line text)
- **Status** (Single select: To Do, In Progress, Review, Done)
- **Priority** (Single select: Low, Medium, High, Critical)
- **Due Date** (Date)
- **Description** (Long text)

### Step 2: Set Up Views

Create the following views for better organization:

#### Customers Views
- **All Customers** (no filter)
- **Active Customers** (filter: Status = Active)

#### Projects Views
- **All Projects** (no filter)
- **Active Projects** (filter: Status = In Progress)

#### Invoices Views
- **All Invoices** (no filter)
- **Unpaid Invoices** (filter: Status = Sent)

#### Tasks Views
- **All Tasks** (no filter)
- **My Tasks** (filter: Assigned To = Current User)

### Step 3: Create Relationships

Set up linked record fields to connect tables:
- Projects.Customer → Customers.Name
- Invoices.Customer → Customers.Name
- Invoices.Project → Projects.Project Name
- Tasks.Project → Projects.Project Name

## Sample Data

### Customers
```json
[
  {
    "Name": "Ben Ginati",
    "Email": "ben@ginati.com",
    "Phone": "+1-555-0123",
    "Company": "Ginati Enterprises",
    "Status": "Active",
    "Notes": "Podcast and content creation client",
    "Created Date": "2025-01-15"
  },
  {
    "Name": "Shelly Mizrahi",
    "Email": "shelly@mizrahi.com",
    "Phone": "+1-555-0456",
    "Company": "Mizrahi Insurance",
    "Status": "Active",
    "Notes": "Insurance business automation client",
    "Created Date": "2025-02-20"
  }
]
```

### Projects
```json
[
  {
    "Project Name": "Ben Ginati Podcast Automation",
    "Customer": "Ben Ginati",
    "Status": "In Progress",
    "Start Date": "2025-01-15",
    "End Date": "2025-06-30",
    "Budget": 15000,
    "Description": "Automated podcast content creation and distribution system",
    "Priority": "High"
  },
  {
    "Project Name": "Shelly Mizrahi Insurance CRM",
    "Customer": "Shelly Mizrahi",
    "Status": "Planning",
    "Start Date": "2025-02-20",
    "End Date": "2025-08-31",
    "Budget": 25000,
    "Description": "Customer relationship management system for insurance business",
    "Priority": "Medium"
  }
]
```

### Invoices
```json
[
  {
    "Invoice Number": "INV-2025-001",
    "Customer": "Ben Ginati",
    "Project": "Ben Ginati Podcast Automation",
    "Amount": 5000,
    "Status": "Paid",
    "Issue Date": "2025-01-15",
    "Due Date": "2025-02-15",
    "Notes": "Initial setup and configuration"
  },
  {
    "Invoice Number": "INV-2025-002",
    "Customer": "Shelly Mizrahi",
    "Project": "Shelly Mizrahi Insurance CRM",
    "Amount": 7500,
    "Status": "Sent",
    "Issue Date": "2025-02-20",
    "Due Date": "2025-03-20",
    "Notes": "Project planning and requirements analysis"
  }
]
```

### Tasks
```json
[
  {
    "Task Name": "Set up podcast automation workflow",
    "Project": "Ben Ginati Podcast Automation",
    "Assigned To": "Development Team",
    "Status": "In Progress",
    "Priority": "High",
    "Due Date": "2025-02-15",
    "Description": "Configure n8n workflows for automated podcast content creation"
  },
  {
    "Task Name": "Design CRM interface",
    "Project": "Shelly Mizrahi Insurance CRM",
    "Assigned To": "Design Team",
    "Status": "To Do",
    "Priority": "Medium",
    "Due Date": "2025-03-15",
    "Description": "Create user interface mockups for the insurance CRM system"
  }
]
```

## Next Steps

1. Follow the setup steps above to create the table structure
2. Import the sample data to populate your tables
3. Set up automation workflows using the Airtable MCP server
4. Configure integrations with other business systems

## Airtable MCP Server

The Airtable MCP server is deployed and available at:
- **Webhook URL**: http://173.254.201.134:5679/webhook/mcp
- **Health Check**: http://173.254.201.134:5679/health

Use this server to automate data operations and integrate with other systems.

## Support

If you need help with the setup, refer to the Airtable documentation or contact the development team.


> **📚 MCP Reference**: For current MCP server status and configurations, see [MCP_SERVERS_AUTHORITATIVE.md](./MCP_SERVERS_AUTHORITATIVE.md)