# 👥 Customer & Project Data

**Purpose:** Centralized storage for all customer data, workflows, documentation, and project files.

**Current Size:** ~1.0M (4 active customers, 2 prospects)

**Last Audit:** October 5, 2025

---

## 📂 Directory Structure

```
Customers/
├── prospects/              # Prospective customers (not yet active)
│   ├── nir-sheinbein/     # Prospect workflows and documentation
│   └── GarageTec/         # Voice agent project inquiry
├── projects/               # Cross-customer project resources
│   └── PROJECT_SUPER_PROMPT_DATABASE.md  # Reusable workflow patterns
└── [Active Customers]      # Production customer accounts
    ├── wonder.care/       # 508K - Healthcare appointment automation
    ├── ben-ginati/        # 340K - Tax4Us content automation (18 workflows)
    ├── m.l.i home improvement/  # 92K
    └── local-il/          # 16K - LinkedIn lead generation
```

---

## 🏗️ Customer Folder Structure (Standard)

### **Recommended Structure for Each Customer:**

```
customer-name/
├── 01-documentation/       # Project docs, requirements, specifications
│   ├── README.md          # Customer overview
│   ├── requirements.md    # Project requirements
│   └── architecture.md    # System architecture
├── 02-workflows/           # n8n workflows, Make.com scenarios
│   ├── workflow-name.json # n8n workflow exports
│   └── scenario-*.json    # Make.com blueprint exports
├── 03-infrastructure/      # Scripts, automation, utilities
│   ├── setup.sh           # Deployment scripts
│   └── utilities/         # Helper scripts
├── 04-live-systems/        # Production configs (SENSITIVE)
│   ├── credentials.json   # ❌ NOT tracked in git
│   └── config.yml         # Environment configs
└── 05-archives/            # Deprecated files, old versions
    └── old-workflows/     # Replaced workflows
```

**Note**: Not all customers follow this exact structure. Some have simpler needs.

---

## 👤 Current Customers

### **Active Customers** (4)

#### **1. wonder.care/** (508K)
- **Industry**: Healthcare
- **Services**: Appointment automation, patient processing
- **Files**: 13 (workflows, Python scripts, Make.com scenarios)
- **Key Workflows**:
  - Healthcare Appointment Processor (Optimized)
  - Duplicate detection and removal scripts
- **Status**: ✅ Active
- **Airtable**: Should sync to "Rensto Client Operations" base

#### **2. ben-ginati/ (Tax4Us)** (340K)
- **Industry**: Tax services, financial education
- **Services**: Content automation, WordPress integration, social media management
- **Files**: 22 workflows + agents
- **Key Workflows**:
  - Tax4Us Content Orchestration Agent
  - Tax4Us Podcast Agent
  - Tax4Us Social Media Agent
  - WordPress automation (multiple versions)
- **Status**: ✅ Active
- **Notes**: Largest customer by workflow count (18+ workflows)
- **Airtable**: Should sync to "Rensto Client Operations" base

#### **3. m.l.i home improvement/** (92K)
- **Industry**: Home improvement services
- **Services**: TBD (document needed)
- **Status**: ⚠️ Needs documentation
- **Action**: Create README.md in customer folder

#### **4. local-il/** (16K)
- **Industry**: Local business services
- **Services**: LinkedIn lead generation
- **Files**: linkedin_links.txt
- **Status**: ⚠️ Minimal - needs expansion or archival decision
- **Action**: Determine if active or should be moved to prospects/

### **Prospects** (2)

#### **1. prospects/nir-sheinbein/**
- **Files**: project.txt
- **Status**: Prospective customer
- **Action**: Review project.txt, determine conversion status

#### **2. prospects/GarageTec/**
- **Files**: voice agent.txt
- **Status**: Voice agent project inquiry
- **Action**: Review inquiry, follow up if still relevant

---

## 🔐 Security & Data Management

### **What Gets Tracked in Git**

✅ **SAFE to commit:**
- Workflow JSON files (n8n, Make.com exports)
- Documentation (README, requirements, architecture)
- Scripts and utilities (non-sensitive)
- Customer folder structure

❌ **NEVER commit:**
- API keys or credentials
- Customer passwords or access tokens
- Personal customer information (PII)
- Database exports with real customer data
- Production environment variables
- Any file matching: `*credentials*.json`, `*.env`, `*.key`, `*.pem`

### **Data Protection Guidelines**

1. **Customer Data is Confidential**: Never share customer data outside of Rensto team
2. **Use .env Files**: Store customer-specific secrets in `.env` files (gitignored)
3. **Anonymize Examples**: When creating documentation, use placeholder data
4. **Backup Regularly**: Customer workflows should be backed up to Airtable/Notion
5. **Access Control**: Only authorized team members should access customer folders

### **Recommended .gitignore Patterns for Customer Data:**

```gitignore
# Customer-specific secrets
Customers/*/04-live-systems/*.env
Customers/*/04-live-systems/*credentials*.json
Customers/*/.env
Customers/*/secrets/
Customers/*/private/

# Customer PII
Customers/*/customer-data.json
Customers/*/contacts.csv
```

---

## 🔄 Integration with Other Systems

### **Airtable Sync** (Should be automated)

**Target Base**: "Rensto Client Operations" (appQijHhqqP4z6wGe)

**Tables to Sync**:
- **Customers** (5 records) ← Sync from filesystem
- **Projects** (4 records) ← Sync from filesystem
- **Tasks** (8 records) ← Manual management
- **Leads** (14 records) ← Prospect data

**Sync Strategy**:
- **Frequency**: Every 15 minutes (via n8n workflow INT-SYNC-001 - not yet built)
- **Direction**: Bidirectional (filesystem ↔ Airtable)
- **Conflict Resolution**: Airtable is source of truth for customer metadata, filesystem for workflows

### **Notion Sync** (Should be automated)

**Target Database**: "Customer Management" (7840ad47-64dc-4e8a-982c-cb3a0dcc3a14)

**Records**: 5 customers

**Sync Strategy**:
- **Frequency**: Daily (via n8n workflow INT-SYNC-002 - not yet built)
- **Direction**: Airtable → Notion (documentation only)
- **Purpose**: High-level customer tracking for team collaboration

### **Admin Dashboard** (admin.rensto.com)

**Current State**: ⚠️ Outdated (last updated Aug 2024)

**Should Display**:
- List of all active customers (linked to their folders)
- Customer project status
- Recent workflow updates
- Customer portal links
- Revenue per customer

**Action**: Update admin dashboard to show real customer data from Airtable

---

## 📋 Adding a New Customer

### **Step-by-Step Process:**

1. **Create Customer Folder**:
   ```bash
   cd Customers/
   mkdir "customer-name"
   cd customer-name/
   ```

2. **Set Up Standard Structure**:
   ```bash
   mkdir 01-documentation 02-workflows 03-infrastructure 04-live-systems 05-archives
   ```

3. **Create Customer README**:
   ```bash
   cat > 01-documentation/README.md <<EOF
   # Customer Name

   **Industry**: [Industry]
   **Services**: [Services provided]
   **Start Date**: [Date]
   **Status**: Active

   ## Overview
   [Brief description]

   ## Key Workflows
   - Workflow 1: [Description]
   - Workflow 2: [Description]

   ## Contact
   - Name: [Contact name]
   - Email: [Email]
   EOF
   ```

4. **Add to Airtable**:
   - Open "Rensto Client Operations" base
   - Add new record to "Customers" table
   - Fill in: Name, Industry, Services, Start Date, Status

5. **Add to Notion** (optional):
   - Add to "Customer Management" database
   - Link to Airtable record

6. **Set Up n8n Workflows**:
   - Create workflows on production instance (173.254.201.134:5678)
   - Export and save to `02-workflows/` directory
   - Follow naming convention: `customer-workflow-name.json`

7. **Document in CLAUDE.md**:
   - Add customer to active customers list
   - Update customer count

---

## 🗂️ Converting Prospect to Customer

**When a prospect becomes an active customer:**

1. **Move folder**:
   ```bash
   mv prospects/prospect-name/ ./customer-name/
   ```

2. **Set up standard structure** (see "Adding a New Customer" above)

3. **Update Airtable**: Change status from "Prospect" to "Active Customer"

4. **Update Notion**: Move from prospects section to active customers

---

## 🗑️ Archiving Old Customers

**When a customer relationship ends:**

1. **DO NOT delete customer folder** - Archive it instead

2. **Move to archives**:
   ```bash
   mv Customers/customer-name/ archives/customers/customer-name-YYYY-MM-DD/
   ```

3. **Update Airtable**: Change status to "Archived" with end date

4. **Update Notion**: Add "Archived" tag

5. **Backup workflows**: Ensure all workflows are exported and saved

6. **Document in CLAUDE.md**: Move from active to archived list

---

## 📊 Customer Data Audit Score

**Criteria Met**: 8/17 (47%) - ⚠️ **FAIR** (needs improvement)

**Improvements Needed**:
- [ ] Create README.md for each customer folder
- [ ] Build INT-SYNC-001 (filesystem → Airtable sync)
- [ ] Build INT-SYNC-002 (Airtable → Notion sync)
- [ ] Update admin dashboard to display customer data
- [ ] Add customer data security patterns to .gitignore
- [ ] Standardize folder naming (remove spaces: "m.l.i home improvement" → "mli-home-improvement")
- [ ] Document local-il customer or move to prospects/
- [ ] Follow up with prospects (nir-sheinbein, GarageTec)

---

## 🧹 Cleanup History

### **Phase 1 Consolidation (October 5, 2025)**:
- ✅ Consolidated from 3 locations: `/Leads/` → `/Customers/prospects/`
- ✅ Consolidated from 3 locations: `/Projects/` → `/Customers/projects/`
- ✅ Created single `/Customers/` directory for all customer data

### **Phase 2 Audit #6 (October 5, 2025)**:
- ❌ Deleted 3 empty directories: `projects/completed/`, `projects/active/`, `projects/archived/`
- ✅ Created comprehensive `Customers/README.md` with standards and security guidelines
- ✅ Documented 4 active customers and 2 prospects
- ✅ Added data protection guidelines

**Result**: Cleaner structure, documented standards, security guidelines in place

---

## ⚠️ Known Issues

### **Issue 1: No Automated Sync to Airtable/Notion**
**Impact**: Customer data manually managed, prone to inconsistencies
**Solution**: Build INT-SYNC-001 and INT-SYNC-002 workflows

### **Issue 2: Inconsistent Folder Naming**
**Example**: "m.l.i home improvement" has spaces
**Solution**: Use kebab-case: "mli-home-improvement"
**Action**: Rename during next customer folder reorganization

### **Issue 3: No Customer Portal Integration**
**Impact**: Customers can't view their project status
**Solution**: Build customer portal at portal.rensto.com

### **Issue 4: local-il/ Status Unclear**
**Impact**: Unclear if active customer or prospect
**Solution**: Review with team, move to prospects/ if not active

---

## 🔗 Related Documentation

- **CLAUDE.md**: Master documentation with customer count and overview
- **Airtable**: "Rensto Client Operations" base (appQijHhqqP4z6wGe)
- **Notion**: "Customer Management" database (7840ad47-64dc-4e8a-982c-cb3a0dcc3a14)
- **Admin Dashboard**: https://admin.rensto.com (needs update)
- **Project Patterns**: `Customers/projects/PROJECT_SUPER_PROMPT_DATABASE.md`

---

## 📞 Questions?

**For new customer onboarding**: Follow the "Adding a New Customer" process above
**For customer data questions**: Check Airtable "Rensto Client Operations" base
**For workflow patterns**: See `projects/PROJECT_SUPER_PROMPT_DATABASE.md`
**For security concerns**: Follow "Security & Data Management" guidelines above

---

**Last Updated:** October 5, 2025
**Next Audit:** January 2026 (quarterly)
**Maintained By:** Rensto Team
**Customer Count**: 4 active, 2 prospects
