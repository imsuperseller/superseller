# 🔒 SAFE PRODUCTION WORKFLOW EXTRACTION STRATEGY

**Created**: December 2025
**Status**: ✅ Active Policy
**Purpose**: Extract patterns from production workflows WITHOUT risking them

---

## ⚠️ GOLDEN RULES

### 1. **READ-ONLY APPROACH**
- ✅ **READ** existing workflows via n8n MCP tools
- ✅ **EXPORT** workflow JSON to local files
- ✅ **COPY** patterns and structures
- ❌ **NEVER** modify production workflows
- ❌ **NEVER** delete production workflows
- ❌ **NEVER** deactivate active workflows

### 2. **EXTRACTION, NOT MODIFICATION**
We **extract patterns** from existing workflows and create **NEW templates** from them.
The original workflows remain completely untouched.

### 3. **LOCAL-FIRST DEVELOPMENT**
- All template development happens in `/workflows/templates-library/`
- Templates are JSON files stored in Git
- Production workflows are only READ, never WRITTEN

---

## 📋 EXISTING WORKFLOW INVENTORY

### Production Instance: n8n.rensto.com (172.245.56.50:5678)
**Total Workflows**: 100+ (first page)
**Active Workflows**: ~25-30

### High-Value Workflows for Template Extraction

#### 🎯 Growth Engine (Sales & Outreach) - Extract from:

| Workflow | ID | Status | Extract For |
|----------|-----|--------|-------------|
| SUB-LEAD-006: Cold Outreach Lead Machine v2 | `0Ss043Wge5zasNWy` | ✅ Active | `func_enrich_company`, `func_send_smart_email` |
| SUB-LEAD-001: Israeli Professional Lead Generator v1 | `THgM79EtvserVMKV` | Inactive | `func_scrape_linkedin_profile` |
| DEV-LEAD-001: Israeli LinkedIn Leads v1 | `9lTWZUMP8Rp2Bt98` | ✅ Active | LinkedIn scraping patterns |
| SUB-LEAD-003: Local Lead Finder & Email Sender v1 | `OqbtExgLG3t8VJz8` | Inactive | Local lead generation |
| SUB-LEAD-007: Best Amusement Games Lead Gen v1 | `WsgveTBcE0Sul907` | ✅ Active | Industry-specific patterns |

#### 📺 Content Factory (Marketing) - Extract from:

| Workflow | ID | Status | Extract For |
|----------|-----|--------|-------------|
| Chase \| AI Guides Youtuber Cloner | `5pMi01SwffYB6KeX` | ✅ Active | `func_transcribe_video`, `func_repurpose_content` |
| MKT-CONTENT-001: AI Landing Page Generator v1 | `6zJDmAgRKpu0qdXJ` | ✅ Active | Content generation patterns |
| MKT-TEMPLATE-001: Sora 2 Automation Template v1 | `C56KDpSOgzIwf42S` | Inactive | Video automation |
| # Automated Social Media Video Posting | `CydsTsbkaL5xQkIJ` | Inactive | `func_auto_post_social` |
| TAX4US - WF: Blog Master - AI Content Pipeline | `GRlA3iuB7A8y8xFJ` | Inactive | Full content pipeline |
| Daily WordPress Content Review and Auto-Publishing | `9PHPlSvFNfMY4L6w` | Inactive | Content review patterns |

#### 🧠 Operations Brain (Admin & Support) - Extract from:

| Workflow | ID | Status | Extract For |
|----------|-----|--------|-------------|
| SALES-WHATSAPP-001: Rensto Voice Agent (Shai AI) | `eQSCUFw91oXLxtvn` | ✅ Active | `func_voice_synthesizer`, `func_classify_ticket` |
| Inbound Voice Agent | `1ORV3KSLVRwqUbY0` | Inactive | Voice AI patterns |
| INT-INFRA-009: Calendar Agent (Dom) v1 | `5Fl9WUjYTpodcloJ` | ✅ Active | `func_calendar_check` |
| PDF and Text File Upload to Google Gemini | `7cY8QD8CikWXy8Gk` | Inactive | `func_pdf_parser` |
| INT-INFRA-001: Server Monitoring Agent (Terry) v1 | `7ArwzAJhIUlpOEZh` | ✅ Active | Monitoring patterns |
| WhatsApp Group Polling - Approval Handler | `GKwumIALkYjN6HMf` | ✅ Active | `util_human_approval` patterns |

#### 🔧 Utility Patterns - Extract from:

| Workflow | ID | Status | Extract For |
|----------|-----|--------|-------------|
| DEV-FIN-006: Stripe Revenue Sync v1 | `AdgeSyjBQS7brUBb` | ✅ Active | Payment/financial patterns |
| INT-TECH-005: n8n-Airtable-Notion Integration v1 | `Uu6JdNAsz7cr14XF` | ✅ Active | Data sync patterns |
| INT-CUSTOMER-002: Customer-Project Data Sync v1 | `DANuAnhFiehSvMiV` | ✅ Active | Customer data patterns |
| STRIPE-MARKETPLACE-001: Template Purchase Handler | `FOWZV3tTy5Pv84HP` | ✅ Active | Stripe integration |

---

## 🔄 EXTRACTION PROCESS

### Step 1: Export Workflow (READ-ONLY)

Use n8n MCP to get workflow details:

```bash
# This READS the workflow, does NOT modify it
n8n_get_workflow(id="WORKFLOW_ID", mode="full")
```

**Output**: Complete workflow JSON saved to local file.

### Step 2: Analyze Patterns

Review the exported JSON for:
- Node configurations
- Connection patterns
- Error handling approaches
- API integration methods
- Data transformation logic

### Step 3: Extract Components

Identify reusable components:
- HTTP Request configurations
- Code node logic
- AI Agent prompts
- Credential patterns (sanitized)

### Step 4: Create New Template

Create **new template** in `templates-library/`:
- Remove client-specific data
- Generalize API calls
- Add standardized input/output format
- Add documentation
- **Original workflow remains untouched**

### Step 5: Document Lineage

Track where template came from:
```json
{
  "template": "func_enrich_company.json",
  "derived_from": ["0Ss043Wge5zasNWy", "THgM79EtvserVMKV"],
  "extraction_date": "2025-12-10",
  "notes": "Combined patterns from SUB-LEAD-006 and SUB-LEAD-001"
}
```

---

## 🛡️ SAFETY CHECKLIST

Before any extraction:

- [ ] **Confirm READ-ONLY intent** - No modifications planned
- [ ] **Use n8n_get_workflow** - Read-only MCP tool
- [ ] **Save to local file** - Not back to n8n
- [ ] **Don't deactivate** - Leave workflow state unchanged
- [ ] **Document source** - Track where pattern came from

---

## 📁 LOCAL FILE STRUCTURE

All extracted patterns go here:

```
workflows/templates-library/
├── extracted-patterns/           # Raw exports from production
│   ├── growth-engine/
│   │   ├── SUB-LEAD-006_export.json
│   │   ├── SUB-LEAD-001_export.json
│   │   └── extraction-notes.md
│   ├── content-factory/
│   │   ├── chase-youtuber_export.json
│   │   └── extraction-notes.md
│   └── operations-brain/
│       ├── voice-agent_export.json
│       └── extraction-notes.md
├── 01-growth-engine/            # Final templates (generalized)
├── 02-content-factory/          # Final templates (generalized)
└── 03-operations-brain/         # Final templates (generalized)
```

---

## 🔍 WHAT WE EXTRACT

### ✅ Safe to Extract:
- Node configurations (generalized)
- Connection patterns
- Code logic (sanitized)
- AI prompts (generalized)
- Data transformation patterns
- Error handling patterns

### ❌ Never Include in Templates:
- API keys or credentials
- Client-specific data
- Personal information
- Production webhook URLs
- Client names/IDs (unless example)

---

## 📊 EXTRACTION PRIORITY

### Phase 1: Utility Patterns (This Week)
1. ~~Error handling from any workflow~~ ✅ Done (created from scratch)
2. ~~Cost tracking patterns~~ ✅ Done (created from scratch)
3. ~~Human approval from WhatsApp Approval Handler~~ ✅ Done (created from scratch)

### Phase 2: Growth Engine (Next)
1. Company enrichment from SUB-LEAD-006
2. LinkedIn scraping from SUB-LEAD-001
3. Email validation patterns
4. Smart email sending

### Phase 3: Content Factory (After)
1. Video transcription from Chase workflow
2. Content repurposing patterns
3. Social media posting

### Phase 4: Operations Brain (Final)
1. Voice synthesis from SALES-WHATSAPP-001
2. Calendar integration from INT-INFRA-009
3. PDF parsing from Gemini workflows

---

## 🚨 EMERGENCY PROCEDURES

### If Accidentally Modified a Workflow:
1. **Don't panic** - n8n has version history
2. **Check execution history** - Verify no bad executions
3. **Restore from backup** if needed
4. **Document incident** in this file

### If Workflow Stops Working:
1. **Check if we touched it** - Review MCP logs
2. **This system is READ-ONLY** - Likely unrelated
3. **Check n8n server status**
4. **Review recent changes** in n8n UI

---

## 📝 EXTRACTION LOG

Track all extractions here:

| Date | Workflow | ID | Extracted To | Status |
|------|----------|-----|--------------|--------|
| 2025-12-10 | (none yet) | - | - | ⏳ Pending |

---

## 🎯 SUMMARY

**Our approach**:
1. **READ** existing workflows via MCP (safe)
2. **EXPORT** to local JSON files (safe)
3. **ANALYZE** patterns and structures (safe)
4. **CREATE** new templates from patterns (safe)
5. **STORE** templates in Git (safe)
6. **NEVER MODIFY** production workflows (policy)

**Production workflows remain 100% untouched.**

---

**Next**: Start Phase 2 extraction from Growth Engine workflows
