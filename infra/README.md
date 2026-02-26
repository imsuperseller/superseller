# 🏗️ Infrastructure

**Purpose:** Infrastructure code, MCP servers, system configurations, and deployment tools.

**Current Size:** ~330M (260M node_modules, 70M source code)

**Last Audit:** February 2026 | **Workflow JSONs:** Canonical production workflow: **`unified_marketplace_master_production.json`** at infra root. Generated/exported JSONs: **`workflow-artifacts/`** (gitignored). **n8n scripts:** **`n8n-scripts/`** (canonical push/validate); one-off scripts in `n8n-scripts/archive/`.

---

## 📂 Directory Structure

```
infra/
├── mcp-servers/             284M - Model Context Protocol servers (22 servers)
├── logging-database/         39M - PostgreSQL logging system for workflows
├── mcp-reference/           6.7M - Reference MCP implementations
├── n8n-client-delivery/      60K - Workflow templates for customer delivery
├── saas-frontend/            60K - Lead enrichment SaaS prototype (Next.js)
├── systemd/                  12K - systemd service configurations
├── design-tools/             12K - Design automation workflows
├── video-merge/              60K - FFmpeg video merge microservice (Express)
├── waha/                     4K  - WhatsApp automation (Docker; devlikeapro/waha-plus)
├── execute-optimization-phase4-5.sh - Optimization script
├── .env.example              - Environment variable template
├── .n8n-auth.env             - n8n authentication config
└── rclone.conf.example       - rclone backup configuration
```

---

## 🔌 MCP Servers (284M)

**Purpose**: Model Context Protocol servers for tool integration with Claude/Cursor

**Configuration**: Active servers configured in `~/.cursor/mcp.json`

### **Active MCP Servers** (12 configured; context7 removed)

#### **Local Servers** (6 in infra/mcp-servers/)

| Server | Size | Location | Purpose |
|--------|------|----------|---------|
| **webflow-mcp-server** | 48M | infra/mcp-servers/webflow-mcp-server/ | Webflow CMS (⚠️ Webflow retired; legacy only) |
| **make-mcp-server** | 31M | infra/mcp-servers/make-mcp-server/ | Make.com workflow automation |
| **typeform-mcp-server** | 22M | infra/mcp-servers/typeform-mcp-server/ | Typeform forms & responses |
| **quickbooks-online-mcp-server** | Node.js | infra/mcp-servers/quickbooks-online-mcp-server/ | QuickBooks Online (canonical). quickbooks-mcp-server = legacy Java, disabled. |
| **tidycal-mcp-server** | 7.4M | infra/mcp-servers/tidycal-mcp-server/ | TidyCal scheduling |

**Total Local**: ~132M (includes node_modules)

#### **NPX/Docker Servers** (7 external)

| Server | Type | Purpose |
|--------|------|---------|
| **n8n-mcp** | Docker | n8n workflow automation (63 tools) |
| **airtable-mcp** | NPX | Airtable.com operations (⚠️ Airtable.com retired; Aitable.ai in use for dashboards) |
| **notion** | NPX | Notion workspace management |
| **stripe** | Docker | Stripe payment processing |
| **supabase** | NPX | Supabase database operations |
| ~~context7~~ | ~~NPX~~ | Removed |
| **shadcn** | NPX | Shadcn UI component library |

### **Development/Prototype Servers** (Not in config)

| Server | Size | Status | Notes |
|--------|------|--------|-------|
| airtable-mcp-server | 130M | ⚠️ Prototype | NPX version used instead |
| notion-mcp-server | 22M | ⚠️ Prototype | NPX version used instead |
| airtable-mcp-server-local | 616K | ⚠️ Dev | Local development version |
| email-communication-mcp | 32K | 🚧 WIP | Email automation MCP (not active) |
| financial-billing-mcp | 32K | 🚧 WIP | Billing automation MCP (not active) |
| analytics-reporting-mcp | 32K | 🚧 WIP | Analytics MCP (not active) |
| stripe-mcp-server | 52K | ⚠️ Prototype | Docker version used instead |
| superseller-mcp-template | 28K | 📦 Template | Template for new MCP servers |
| mongodb-mcp-server | 4K | 🚧 WIP | MongoDB integration (skeleton) |
| github-mcp-server | 4K | 🚧 WIP | GitHub integration (skeleton) |
| vercel-mcp-server | 4K | 🚧 WIP | Vercel deployment (skeleton) |

### **MCP Server Management**

**Adding a New MCP Server**:
1. Create directory in `infra/mcp-servers/your-server-name/`
2. Implement MCP protocol (see `superseller-mcp-template/` for template)
3. Add to `~/.cursor/mcp.json`:
   ```json
   "your-server": {
     "command": "node",
     "args": ["/path/to/your-server/server.js"],
     "env": {
       "API_KEY": "your-api-key"
     }
   }
   ```
4. Restart Cursor/Claude Code

**Testing MCP Servers**:
```bash
# Test n8n-mcp
docker run -i --rm -e N8N_API_URL=http://172.245.56.50:5678 -e N8N_API_KEY=... ghcr.io/czlonkowski/n8n-mcp:latest

# Test local MCP server
node infra/mcp-servers/your-server/server.js
```

**Removing Unused Servers**:
- Keep in `infra/mcp-servers/` if they may be used in future
- Archive to `archives/infra-mcp-servers-YYYY-MM/` if obsolete
- Prototype servers (airtable-mcp-server, notion-mcp-server) can be archived if not needed

---

## 📊 Logging Database (39M)

**Purpose**: Centralized PostgreSQL logging system for SuperSeller AI production workflows

**Location**: `infra/logging-database/`

**Components**:
- `schema.sql` - Database schema
- `config.js` - Database configuration
- `middleware.js` - Express middleware for logging
- `error-*.js` - Error handling, categorization, notification, recovery
- `test-error-handling.js` - Test suite

**Tech Stack**:
- PostgreSQL database
- Node.js + Express middleware
- Integrated with n8n workflows

**Setup**:
```bash
cd infra/logging-database
npm install
node setup.js              # Initialize database
npm run migrate            # Run migrations
npm test                   # Test error handling
```

**Status**: ⚠️ **Needs verification** - Check if currently used in production

---

## 🌐 SaaS Frontend (60K)

**Purpose**: Lead enrichment SaaS platform prototype (Next.js)

**Location**: `infra/saas-frontend/`

**Full Name**: "superseller-lead-enrichment-saas"

**Tech Stack**:
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + Radix UI
- Stripe integration
- React Hook Form + Zod validation
- Zustand state management

**Status**: ⚠️ **Prototype** - Not deployed, may be superseded by apps/web/superseller-site/

**Action**: Consider archiving if not actively developed

**Setup** (if reviving):
```bash
cd infra/saas-frontend
npm install
npm run dev              # http://localhost:3000
```

---

## 📦 n8n Client Delivery (60K)

**Purpose**: Workflow templates for customer delivery

**Location**: `infra/n8n-client-delivery/`

**Contents**:
- `workflow-templates/` - Reusable workflow templates for customers
- Deployment configurations
- Measurement tools
- Onboarding flows

**Usage**: When delivering n8n workflows to customers, use templates from this directory

**Related**: See also `/Customers/{customer}/02-workflows/` for customer-specific workflows

---

## 📖 MCP Reference (6.7M)

**Purpose**: Reference implementations and examples

**Location**: `infra/mcp-reference/`

**Contents**:
- `cloudflare/` - Cloudflare MCP server reference implementation (6.7M)

**Usage**: Reference when building new MCP servers

---

## ⚙️ System Configuration

### **systemd/** (12K)

**Purpose**: systemd service configurations for secure tunneling (Cloudflared).

**Contents**:
- `cloudflared.service` - Main Cloudflare Tunnel
- `cloudflared-n8n-oauth2.service` - OAuth2 Tunnel for n8n
- Used on RackNerd VPS (172.245.56.50)

**Usage**:
```bash
# On VPS
sudo cp infra/systemd/cloudflared.service /etc/systemd/system/
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```
*(Note: n8n, Postgres, and Redis are managed via Docker-compose at /opt/ on the server, not via systemd in this directory).*

### **design-tools/** (12K)

**Purpose**: Design automation workflows

**Contents**:
- `design-to-automation-workflow.json` - Workflow for design automation

### **video-merge/** (60K)

**Purpose**: FFmpeg-based video merge microservice (Express + fluent-ffmpeg)

**Contents**:
- `server.js` - Express API for merging videos
- `docker-compose.yml`, `Dockerfile` - Container setup
- Uses: n8n workflows, KIE/TourReel-style video pipelines

**Status**: ⚠️ Verify if in active use

### **waha/** (4K)

**Purpose**: WhatsApp automation via WAHA (devlikeapro/waha-plus)

**Contents**:
- `docker-compose.yml` - NOWEB engine; uses n8n_n8n-network
- Session persistence in `./sessions`; dashboard/swagger enabled

**Usage**: `docker-compose -f infra/waha/docker-compose.yml up -d`

### **execute-optimization-phase4-5.sh** (12K)

**Purpose**: Optimization script (Phase 4-5)

**Status**: ⚠️ Legacy script - May be outdated

### **.env.example**

**Purpose**: Template for environment variables

**Usage**:
```bash
cp infra/.env.example infra/.env
# Edit .env with real values
```

### **.n8n-auth.env**

**Purpose**: n8n authentication configuration

**Status**: ✅ Active - Used for n8n authentication

### **rclone.conf.example**

**Purpose**: rclone configuration template for backups

**Usage**:
```bash
cp infra/rclone.conf.example ~/.config/rclone/rclone.conf
# Edit with real credentials
rclone sync /data remote:backup
```

---

## 🗑️ Cleanup History

### **Phase 2 Audit #9 (October 5, 2025)**:

**Deleted**:
- ❌ 2 empty directories: `mcp-servers/mcp-use-server/`, `mcp-servers/ui-component-library-mcp/`

**Documented**:
- ✅ Identified 13 active MCP servers (6 local, 7 NPX/Docker)
- ✅ Classified 11 prototype/development MCP servers
- ✅ Documented all subdirectories and their status
- ✅ Created comprehensive `infra/README.md`

**Result**:
- Audit score: 41% → 76% (improved 35 points)
- Structure: Clear organization with status labels
- Size: ~330M (260M node_modules - properly gitignored)

---

## 📊 Infrastructure Audit Score

**Criteria Met**: 13/17 (76%) - ✅ **GOOD** (improved from 41%)

**Improvements Made**:
- ✅ Removed empty directories
- ✅ Comprehensive documentation of all components
- ✅ Clear status labels (Active, Prototype, WIP, Template)
- ✅ MCP server inventory with sizes and purposes

**Remaining Issues**:
- [ ] Verify logging-database is in active use
- [ ] Decision on saas-frontend (archive or activate?)
- [ ] Archive prototype MCP servers if not needed
- [ ] Add health check automation for MCP servers

---

## 🔧 Common Tasks

### **Add New MCP Server**

See "MCP Server Management" section above

### **Update MCP Server**

```bash
cd infra/mcp-servers/your-server/
git pull              # If using git
npm install           # Update dependencies
# Restart Cursor/Claude Code
```

### **Deploy to VPS**

```bash
# Copy systemd services
scp infra/systemd/*.service root@172.245.56.50:/etc/systemd/system/

# SSH into VPS
ssh root@172.245.56.50
sudo systemctl daemon-reload
sudo systemctl enable your-service
sudo systemctl start your-service
```

### **Backup Configuration**

```bash
# Using rclone
rclone sync infra/ remote:superseller-infra-backup/
```

---

## ⚠️ Known Issues

### **Issue 1: Large airtable-mcp-server (130M) not used**
**Impact**: Takes up space but NPX version is used instead
**Solution**: Archive to `archives/infra-mcp-servers-2025-10/` if not needed
**Status**: ⚠️ Decision needed

### **Issue 2: saas-frontend status unclear**
**Impact**: 60K of code that may be obsolete
**Solution**: Archive if superseded by apps/web/superseller-site/
**Status**: ⚠️ Decision needed

### **Issue 3: logging-database usage unknown**
**Impact**: 39M of code that may not be in use
**Solution**: Verify if connected to production workflows
**Status**: ⚠️ Verification needed

---

## 🔗 Related Documentation

- **MCP Configuration**: `~/.cursor/mcp.json` - Active MCP server configurations
- **CLAUDE.md**: Master documentation mentioning infra/
- **docs/mcp/**: MCP server documentation (60K)
- **docs/infrastructure/**: Infrastructure setup guides (16K)

---

## 📞 Questions?

**For MCP servers**: Check `~/.cursor/mcp.json` for active configurations
**For VPS access**: SSH to root@172.245.56.50
**For adding new infrastructure**: Follow patterns in existing subdirectories

---

**Last Updated:** February 2026
**Next Audit:** April 2026 (quarterly)
**Maintained By:** SuperSeller AI Team
**Active MCP Servers**: 12 (context7 removed; universal-aggregator + notebooklm in Cursor)
**Size**: ~330M (260M node_modules, 70M source code)
