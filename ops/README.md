# ⚙️ Operations Specifications

**Purpose:** Operational specifications, validation gates, and executable documentation for SuperSeller AI infrastructure and applications.

**Current Size:** ~20K (2 active files)

**Last Updated:** September 25, 2025

**Last Audit:** October 5, 2025

---

## 📂 File Structure

```
ops/
├── spec.md     4.0K - Executable specifications (web app, workflows, infrastructure)
└── gates.sh    4.2K - Validation script (BMAD methodology gates)
```

---

## 📄 Specification Files

### **spec.md** (4.0K)

**Purpose**: Comprehensive executable specifications for SuperSeller AI platform components

**Sections**:

#### **1. Web Application Spec**

**Component Graph**:
```
App Layout
├── Header (logo, nav, CTA)
├── Pages (Home, Offers, Process, Contact, Legal)
├── Footer (links, social)
└── Analytics (Rollbar stub)
```

**Design Tokens**:
- Background: #0B1318
- Card: #111827
- Text: #E5E7EB
- Muted: #94A3B8
- Accent1: #2F6A92 (blue)
- Accent2: #FF6536 (orange)
- Border: rgba(255,255,255,0.08)
- Radius: 1rem
- Shadow: 0 10px 30px rgba(0,0,0,0.25)

**GSAP Animations**:
- Fade-up: power3.out, 0.9s, stagger 0.08s
- Parallax: subtle on scroll
- Logo glow: CSS animation

**E2E Test Steps** (6 steps):
1. Navigate to home → verify hero renders
2. Check all CTAs → verify env vars used
3. Navigate each page → verify content loads
4. Test contact form → verify validation
5. Check SEO meta → verify OG tags present
6. Run Lighthouse → verify score ≥95

**Status**: ⚠️ Partially implemented - Some specs apply to current superseller.agency site

---

#### **2. n8n Workflow Specs**

**Documented Workflows** (5 total):

| Workflow | Trigger | Purpose | Status |
|----------|---------|---------|--------|
| **Leads Daily Follow-ups** | Cron 08:00 CT | Active leads with next_action_at ≤ now | ⚠️ May exist |
| **Projects In Progress Digest** | Cron 09:00 CT | In-progress projects digest | ⚠️ May exist |
| **Finance Unpaid Invoices** | Cron 09:15 CT | Overdue invoice alerts | ⚠️ May exist |
| **Assets Renewals < 30d** | Cron 07:45 CT | Asset renewal reminders | ⚠️ May exist |
| **Contact Intake (Stub)** | Webhook /contact | New lead processing | ❌ Stub only |

**Workflow Details**:

**Leads Daily Follow-ups**:
- Nodes: Cron Trigger, Airtable Get (view "🔥 Active"), Filter, Slack Send, Email Fallback
- Target: shai@superseller.agency
- Channel: #alerts

**Projects In Progress Digest**:
- Nodes: Cron Trigger, Airtable Get (view "🔨 In Progress"), Sort by last_updated, Format HTML, Slack + Email
- Daily digest sent to team

**Finance Unpaid Invoices**:
- Nodes: Cron Trigger, Airtable Get (view "📄 Unpaid"), Calculate days overdue, Format urgency levels, Slack notify
- Mentions relevant team members

**Assets Renewals < 30d**:
- Nodes: Cron Trigger, Airtable Get (view "Renewals < 30d"), Enrich with owner/criticality/cost, Sort by renewal date, Slack digest
- Proactive renewal management

**Contact Intake (Stub)**:
- Nodes: Webhook Trigger, Normalize fields, Dedupe by email, Airtable Create, Slack Notify
- Status: Not yet implemented

**Verification Needed**: Check which workflows exist in production n8n (http://172.245.56.50:5678)

---

#### **3. Infrastructure Spec**

**Docker Services**:

```yaml
postgres:15-alpine:
  - Port: internal only
  - Volume: ./data/postgres
  - Env: POSTGRES_DB=n8n

n8n:latest:
  - Port: internal only
  - Volume: ./data/n8n
  - Requires: N8N_ENCRYPTION_KEY

# MongoDB: Running on RackNerd server at 172.245.56.50:27017
# No local MongoDB container needed
```

**Cloudflare Tunnel**:

```yaml
ingress:
  - hostname: n8n.superseller.agency
    service: http://n8n:5678
  - service: http_status:404
```

**Status**: ✅ Cloudflare tunnel implemented (configs in /configs/cloudflare-tunnel/)

**Backup Process** (5 steps):
1. Export n8n workflows → JSON
2. Export n8n credentials → encrypted
3. pg_dump postgres → SQL
4. mongodump from RackNerd → BSON
5. tar.gz all → timestamped, rclone sync → Icedrive

**Status**: ⚠️ Backup process needs verification

---

#### **4. Acceptance Gates**

**Required Checks**:
- Format check: `npm run format:check`
- Lint check: `npm run lint`
- Type check: `npm run typecheck`
- Unit tests: `npm test -- --coverage`
- E2E tests: `npm run test:e2e`
- Build check: `npm run build`
- Security scan: `npm audit --audit-level=high`

**Coverage Thresholds**:
- Statements: 85%
- Branches: 80%
- Functions: 85%
- Lines: 85%

**Performance Metrics**:
- Lighthouse Performance: ≥95
- Lighthouse Accessibility: ≥95
- Lighthouse Best Practices: ≥95
- Lighthouse SEO: 100

**Status**: ⚠️ Not all checks automated for current codebase

---

#### **5. Validation Rules**

**Environment Variables**:
- All NEXT_PUBLIC_* vars optional with fallbacks
- N8N_ENCRYPTION_KEY required (64 chars)
- POSTGRES_PASSWORD strong (≥16 chars)
- No secrets in repository

**Security Requirements**:
- No exposed ports in docker-compose
- HTTPS only via Cloudflare
- Basic auth on n8n interface
- Encrypted credential storage
- CSP headers configured

**Data Consistency**:
- Timezone: America/Chicago everywhere
- Email: shai@superseller.agency as default
- Airtable views: exact emoji names
- Workflow names: kebab-case

**Status**: ✅ Security requirements generally followed

---

#### **6. Testing Matrix**

| Component | Unit | Integration | E2E |
|-----------|------|-------------|-----|
| Web Pages | ✓ | ✓ | ✓ |
| API Routes | ✓ | ✓ | - |
| Components | ✓ | - | ✓ |
| Workflows | - | ✓ | ✓ |
| Backup | - | ✓ | - |

**Status**: ⚠️ Testing coverage varies by component

---

### **gates.sh** (4.2K)

**Purpose**: Executable validation script for "Unified Working Methodology" (BMAD gates)

**Usage**:
```bash
cd /Users/shaifriedman/New\ SuperSeller AI/superseller
./ops/gates.sh
```

**Exit Codes**:
- 0 = All gates pass
- 1+ = Number of failed gates

**Validation Gates** (10 total):

| Gate # | Name | Checks | Status |
|--------|------|--------|--------|
| 1 | Repository Structure | ops/plan.md, spec.md, task.yaml, README.md, SECURITY.md, CONTEXT.md, CHANGELOG.md | ⚠️ Some files missing |
| 2 | Documentation | infra/RENSTO-OPERATIONS-GUIDE.md, docs/DNS_AND_TUNNEL.md, docs/AIRTABLE_VIEWS.md, etc. | ⚠️ Some files missing |
| 3 | Infrastructure Files | infra/docker-compose.yml, .env.example, backup.sh, cloudflared/config.yml, systemd files | ⚠️ Path mismatches |
| 4 | CI/CD Configuration | .github/workflows/ci-cd.yml, issue templates | ⚠️ CI/CD not set up |
| 5 | Web Application | package.json, next.config.ts, tailwind.config.ts, tsconfig.json | ⚠️ Skipped (warns) |
| 6 | Docker Services | Docker validation | ⚠️ Skipped (warns) |
| 7 | Security Checks | Security validation | ⚠️ Skipped (dev mode) |
| 8 | Environment Variables | Environment examples | ⚠️ Skipped (warns) |
| 9 | Backup Script | Backup script validation | ⚠️ Skipped (warns) |
| 10 | Taskfile | Taskfile.yml | ⚠️ Taskfile doesn't exist |

**Current Behavior**:
- Many gates are skipped with warnings ("verified manually")
- Script expects specific file paths that may not match current structure
- References "Unified Working Methodology" which may be outdated terminology

**Issues**:
- ⚠️ File paths in gates.sh don't match current codebase structure
- ⚠️ Many gates skipped instead of actually validating
- ⚠️ References files that don't exist (ops/plan.md, ops/checklist.md, CONTEXT.md, SECURITY.md)

**Action Required**:
- [ ] Update file paths to match current structure
- [ ] Enable skipped gates or remove them
- [ ] Add gates for current business model (5 service types, Stripe integration, etc.)
- [ ] Update to reference CLAUDE.md instead of CONTEXT.md

**Success Output**:
```
✅ INFRASTRUCTURE COMPLETE - READY FOR BUSINESS APPLICATIONS

Next steps:
1. 🏗️  Build Admin Dashboard (Priority 1)
2. 🏗️  Build Customer Portal (Priority 2)
3. 🏗️  Enhance Website Features (Priority 3)
4. 🚀 Deploy Business Applications

Status: 8/18 major tasks completed
Phase: Infrastructure → Business Applications
```

**Note**: Success message references "8/18 major tasks completed" which may be outdated

---

## 📦 Archived Files

### **task.yaml** (Archived Oct 5, 2025)

**Original Location**: `ops/task.yaml`
**New Location**: `archives/ops-tasks-2024/task.yaml`

**Reason**: Task dated January 6, 2024 (deadline: Jan 10, 2024) - almost 2 years old

**Task Details**:
- Task ID: 20240106-initial-setup
- Title: "Initialize SuperSeller AI production infrastructure and marketing site"
- Owner: shai
- Sprint: current (in 2024)
- 8 acceptance criteria
- References stories: STORY-001 through STORY-004
- Done definition: All acceptance criteria green, CHANGELOG updated, docs complete

**Status**: ✅ Archived - Task completed long ago

---

## 🎯 Implementation Status

### **What's Implemented**:
- ✅ Cloudflare tunnel (n8n.superseller.agency)
- ✅ n8n production instance (http://172.245.56.50:5678)
- ✅ Security requirements (no exposed ports, HTTPS, encrypted credentials)
- ✅ Data consistency (timezone, naming conventions)
- ✅ Some design tokens applied to superseller.agency

### **What's Partially Implemented**:
- ⚠️ n8n workflows (some specs may match existing workflows)
- ⚠️ Backup process (needs verification)
- ⚠️ Testing gates (some checks manual, not automated)
- ⚠️ E2E tests (not comprehensive)

### **What's Not Implemented**:
- ❌ Contact intake workflow (stub only)
- ❌ Automated acceptance gates (most gates skipped)
- ❌ CI/CD pipeline (.github/workflows/)
- ❌ Coverage thresholds enforcement
- ❌ Taskfile.yml

---

## 🔧 Usage Instructions

### **Running Validation Gates**

```bash
# From repository root
./ops/gates.sh

# Expected output: Many warnings, some gates pass
# Exit code: 0 if all gates pass, N if N gates fail
```

### **Updating Specifications**

```bash
# Edit spec.md
nano ops/spec.md

# Add new workflow specs, update infrastructure, modify validation rules
# Save changes and commit
```

### **Checking Implementation Status**

**For n8n Workflows**:
1. Navigate to http://172.245.56.50:5678
2. Go to Workflows tab
3. Search for workflow names in spec.md
4. Verify: leads-daily-followups, projects-digest, finance-unpaid-invoices, assets-renewals

**For Infrastructure**:
1. Check `/configs/docker/docker-compose.yml` for Docker services
2. Check `/configs/cloudflare-tunnel/` for tunnel config
3. Verify n8n.superseller.agency resolves and loads

**For Backup Process**:
1. Check if backup scripts exist in `/infra/` or `/scripts/`
2. Verify rclone configuration
3. Test backup execution

---

## ⚠️ Known Issues

### **Issue 1: gates.sh File Path Mismatches**
**Problem**: Script references files at paths that don't match current structure
- Expected: `ops/plan.md`, `ops/checklist.md`, `infra/docker-compose.yml`
- Actual: Different structure after consolidation
**Solution**: Update gates.sh file paths to match current codebase
**Status**: ⚠️ **ACTION REQUIRED**

### **Issue 2: Most Gates Skipped**
**Problem**: Many gates show "verified manually" warnings instead of actual validation
**Impact**: Script doesn't provide real validation value
**Solution**: Either implement skipped gates or remove them
**Status**: ⚠️ **ACTION REQUIRED**

### **Issue 3: Outdated Terminology**
**Problem**: References "Unified Working Methodology" and old task structure
**Solution**: Update to reference BMAD methodology and current task management
**Status**: ⚠️ Low priority

### **Issue 4: Workflow Implementation Status Unknown**
**Problem**: spec.md documents 5 workflows but unclear which are implemented
**Solution**: Audit n8n production instance against specs
**Status**: ⚠️ **VERIFICATION NEEDED**

---

## 📊 Operations Audit Score

**Criteria Met**: 8/17 (47%) - ⚠️ **FAIR**

**Improvements Made** (Oct 5, 2025):
- ✅ Archived outdated task.yaml (Jan 2024 deadline)
- ✅ Created comprehensive README.md
- ✅ Documented implementation status for all specs
- ✅ Identified file path mismatches in gates.sh

**Remaining Issues**:
- [ ] Update gates.sh file paths to match current structure
- [ ] Enable or remove skipped validation gates
- [ ] Verify which n8n workflow specs are implemented
- [ ] Update terminology (Unified Working Methodology → BMAD)
- [ ] Integrate with admin dashboard
- [ ] Add gates for current business model

**Audit Score**: 8/17 (47%) - ⚠️ **FAIR** (not improved - needs gate updates)

---

## 🔗 Related Documentation

- **CLAUDE.md**: Master documentation with current business model and BMAD methodology
- **/configs/**: Configuration files referenced in spec.md
- **/infra/**: Infrastructure setup files
- **/docs/**: General documentation (some files referenced in gates.sh)
- **n8n Production**: http://172.245.56.50:5678 (workflow implementation)

---

## 📞 Questions?

**For executable specs**: Check `spec.md` for detailed component specifications
**For validation gates**: Run `./ops/gates.sh` and review output
**For workflow specs**: See spec.md section "n8n Workflow Specs"
**For infrastructure specs**: See spec.md section "Infrastructure Spec"

---

**Last Updated:** October 5, 2025
**Next Review:** When gates.sh needs updating or new specs added
**Maintained By:** SuperSeller AI Team
**Active Files**: 2 (spec.md, gates.sh)
**Archived Files**: 1 (task.yaml → archives/ops-tasks-2024/)
