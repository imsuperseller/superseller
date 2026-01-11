# 🔧 Live Systems & Operational Scripts

**Purpose:** Production operational scripts, admin tools, customer portal implementations, and live system configurations.

**Current Size:** ~2.6M (4 subdirectories)

**Last Audit:** October 5, 2025

---

## 📂 Directory Structure

```
live-systems/
├── admin-scripts/           1.4M - Admin operational scripts
├── customer-portal/         652K - Customer portal implementation
├── hyperise-replacement/    328K - Custom Hyperise replacement API
└── n8n-system/              264K - n8n workflows and integrations
```

---

## 📁 Subdirectories

### **admin-scripts/** (1.4M)

**Purpose**: Operational scripts for admin tasks, server management, and system maintenance

**Key Scripts**:
- `quickbooks-re-authentication.js` - QuickBooks OAuth token refresh
- `quickbooks-simple-auth.js` - Simplified QuickBooks authentication
- `refresh-quickbooks-token.js` - Token refresh automation
- `secure-ai-agent.js` - AI agent security implementation
- `wait-for-massive-scraping.js` - Scraping job monitoring

**Config Subdirectory** (`admin-scripts/config/`):
- `docker/docker-compose.yml` - Docker configurations
- `mcp/cursor-config.json` - MCP server configurations
- `editor/.editorconfig` - Editor settings
- `editor/.prettierrc` - Code formatting rules
- `project-package.json` - Project dependencies

**Status**: ✅ Active - Used for operational tasks

**Usage**:
```bash
cd live-systems/admin-scripts
node quickbooks-re-authentication.js
```

---

### **customer-portal/** (652K)

**Purpose**: Customer portal implementation scripts and customer-facing features

**Key Scripts**:

**Portal Core**:
- `intelligent-onboarding-agent.js` - AI-powered customer onboarding
- `admin-dashboard-implementation.js` - Admin dashboard features
- `comprehensive-business-visualization.js` - Business metrics visualization

**Integration Scripts**:
- `activate-quickbooks-integration.js` - QuickBooks integration
- `implement-quickbooks-realtime-integration.js` - Real-time QuickBooks sync
- `implement-payment-integration.js` - Stripe payment integration

**Automation Scripts**:
- `implement-automated-onboarding.js` - Onboarding automation
- `implement-agent-deployment-automation.js` - Agent deployment
- `billing-automation.js` - Billing workflow automation
- `marketing-automation.js` - Marketing campaigns

**Analytics & Monitoring**:
- `churn-prediction.js` - Customer churn prediction
- `health-scoring.js` - Customer health scoring
- `feedback-analysis.js` - Feedback analysis
- `data-protection.js` - Data protection compliance

**Infrastructure**:
- `integrate-rensto-components.js` - Component integration
- `validate-infrastructure.js` - Infrastructure validation
- `audit-admin-dashboard.js` - Dashboard audit
- `database-capacity-analysis.js` - Database capacity planning
- `execute-priority-actions.js` - Priority task execution

**Testing & Development**:
- `generate-massive-mock-data.js` - Mock data generation
- `test-lightrag-integration.js` - LightRAG testing
- `setup-lightrag-github-integration.js` - GitHub integration
- `phase1-completion-summary.js` - Phase 1 status

**Status**: ⚠️ Mixed - Some active, some experimental

**Usage**:
```bash
cd live-systems/customer-portal
node intelligent-onboarding-agent.js
```

---

### **hyperise-replacement/** (328K)

**Purpose**: Custom Hyperise replacement API for personalized landing pages and analytics

**Business Context**:
- Hyperise costs $50-200/month
- This replacement is fully built but NOT deployed
- Potential monthly savings: $50-200

**Tech Stack**:
- Express.js API server
- PostgreSQL database
- Redis caching
- Sharp for image processing
- OpenAI integration
- JWT authentication

**Structure**:
- `src/` - Source code
  - `server.js` - Main server
  - `routes/shortLinks.js` - Short link management
  - `middleware/auth.js` - Authentication
  - `middleware/errorHandler.js` - Error handling
  - `database/connection.js` - DB connection
  - `utils/logger.js` - Logging utilities
- `database/` - Database schema and migrations
  - `schema.sql` - PostgreSQL schema
- `Dockerfile` - Docker configuration
- `docker-compose.yml` - Docker Compose setup
- `package.json` - Dependencies

**Features**:
- Short link generation and tracking
- Personalized landing pages
- Analytics and reporting
- n8n/Make.com integration
- Customer CRM integration
- QR code generation
- Image personalization

**Deployment Status**: ❌ **NOT DEPLOYED**

**Deployment Requirements**:
1. PostgreSQL database setup
2. Redis instance
3. Environment variables configuration
4. Docker deployment or VPS setup
5. DNS configuration for short links

**Deployment Instructions**:
```bash
cd live-systems/hyperise-replacement

# 1. Configure environment
cp env.example .env
# Edit .env with real credentials

# 2. Deploy with Docker
docker-compose up -d

# 3. Run migrations
npm run migrate

# 4. Start server
npm start
```

**Priority**: **MEDIUM** - Deploy to save $50-200/month in Hyperise fees

---

### **n8n-system/** (264K)

**Purpose**: n8n workflow exports and system integrations

**Workflows** (`n8n-system/workflows/`):
- `leads-daily-followups.json` - Daily lead follow-up automation
- `projects-digest.json` - Project status digest
- `contact-intake.json` - Contact form processing
- `facebook-group-scraper.json` - Facebook group scraping
- `facebook-group-scraper-clean.json` - Cleaned version
- `finance-unpaid-invoices.json` - Invoice reminders
- `assets-renewals.json` - Asset renewal tracking
- `Smart_AI_Blog_Writing_System_for_Gumroad_Download_041225.json` - AI blog system

**Integration Files**:
- `shadcn-ui-integration-demo.js` - Shadcn UI demo
- `start-infrastructure-consolidation.js` - Infrastructure consolidation script

**Status**: ✅ Active - Production workflows

**Usage**: Import workflows into n8n at http://172.245.56.50:5678

---

## 🗑️ Cleanup History

### **Phase 2 Audit #10 (October 5, 2025)**:

**Deleted**:
- ❌ 4 empty directories:
  - `hyperise-replacement/uploads/`
  - `hyperise-replacement/logs/`
  - `admin-scripts/config/n8n/`
  - `admin-scripts/config/editor/.cursor/`

**Moved**:
- ✅ 9 customer-specific scripts → `/Customers/ortal/03-infrastructure/`:
  - `serve-real-ortal-data.js`
  - `fix-ortal-delivery-issues.js`
  - `serve-ortal-reports.js`
  - `serve-5548-ortal-leads.js`
  - `proper-ortal-server.js`
  - `serve-ortal-real-reports.js`
  - `real-facebook-scraping-ortal.js`
  - `create-ortal-deliverables.js`
  - `massive-facebook-scraping.js`

**Documented**:
- ✅ Created comprehensive `live-systems/README.md`
- ✅ Documented all subdirectories and key files
- ✅ Identified hyperise-replacement as built but not deployed

**Result**:
- Audit score: 47% → 76% (improved 29 points)
- Structure: Clean organization, customer files moved to proper location
- Documentation: Comprehensive README with deployment instructions

---

## 📊 Live Systems Audit Score

**Criteria Met**: 13/17 (76%) - ✅ **GOOD** (improved from 47%)

**Improvements Made**:
- ✅ Removed empty directories
- ✅ Moved customer-specific scripts to proper location
- ✅ Comprehensive documentation of all components
- ✅ Clear deployment status for each system

**Remaining Issues**:
- [ ] Deploy hyperise-replacement to save $50-200/month
- [ ] Verify which customer-portal scripts are active vs experimental
- [ ] Integrate with admin dashboard
- [ ] Document script dependencies

---

## 🔧 Common Tasks

### **Deploy Hyperise Replacement**

**Priority**: MEDIUM - Saves $50-200/month

```bash
cd live-systems/hyperise-replacement

# 1. Setup environment
cp env.example .env
nano .env  # Add credentials

# 2. Deploy with Docker
docker-compose up -d

# 3. Verify deployment
curl http://localhost:3000/health

# 4. Configure DNS
# Point short link domain to server IP
```

### **Run Admin Scripts**

```bash
cd live-systems/admin-scripts

# QuickBooks authentication
node quickbooks-re-authentication.js

# AI agent security
node secure-ai-agent.js
```

### **Import n8n Workflows**

1. Navigate to http://172.245.56.50:5678
2. Go to Workflows → Import
3. Select workflow JSON from `n8n-system/workflows/`
4. Configure credentials and connections
5. Activate workflow

---

## ⚠️ Known Issues

### **Issue 1: Hyperise Replacement Not Deployed**
**Impact**: Paying $50-200/month for Hyperise when replacement is ready
**Solution**: Deploy hyperise-replacement/ to VPS or Docker
**Status**: ⚠️ **ACTION REQUIRED**

### **Issue 2: Customer Portal Scripts Status Unclear**
**Impact**: Unknown which scripts are production vs experimental
**Solution**: Audit each script, tag with status
**Status**: ⚠️ Documentation needed

### **Issue 3: No Integration with Admin Dashboard**
**Impact**: Scripts run manually, not visible in dashboard
**Solution**: Add script execution UI to admin.rensto.com
**Status**: ⚠️ Low priority

---

## 🔗 Related Documentation

- **CLAUDE.md**: Master documentation mentioning live-systems/
- **admin.rensto.com**: Admin dashboard (needs script integration)
- **n8n Production**: http://172.245.56.50:5678
- **Customers/ortal/**: Ortal customer scripts (moved from here)

---

## 📞 Questions?

**For operational scripts**: Check `admin-scripts/` subdirectory
**For customer portal**: Check `customer-portal/` subdirectory
**For hyperise deployment**: See deployment instructions above
**For n8n workflows**: Import from `n8n-system/workflows/`

---

**Last Updated:** October 5, 2025
**Next Audit:** January 2026 (quarterly)
**Maintained By:** Rensto Team
**Subdirectories**: 4 (admin-scripts, customer-portal, hyperise-replacement, n8n-system)
