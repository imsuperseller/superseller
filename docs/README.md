# 📚 Documentation

**Purpose:** Comprehensive technical and business documentation for the Rensto platform.

**Current Size:** ~1.0M (71 markdown files across 15 subdirectories)

**Last Audit:** October 5, 2025

---

## 📂 Directory Structure

```
docs/
├── business/        268K - Business model, roadmaps, competitive analysis
├── n8n/             224K - n8n workflow documentation and implementation guides
├── workflows/       144K - Workflow patterns, templates, and best practices
├── webflow/          96K - Webflow CMS implementation and deployment guides
├── legal-pages/      64K - Legal page documentation and compliance
├── mcp/              60K - Model Context Protocol (MCP) server documentation
├── products/         32K - Product catalog and specifications
├── ai-agents/        32K - AI agent configurations and patterns
├── technical/        28K - Technical specifications and architecture
├── deployment/       20K - Deployment guides and procedures
├── infrastructure/   16K - Infrastructure setup and management
├── RUNBOOKS/         12K - Operational runbooks and procedures
├── integrations/      8K - Third-party integration guides
├── security/          8K - Security policies and incident response
└── architecture/      4K - System architecture documentation
```

---

## 📋 Directory Guide

### **business/** (268K - Business Documentation)

**Purpose**: Business strategy, planning, and implementation documents

**Key Documents**:
- `RENSTO_BUSINESS_ROADMAP_2025.md` - Annual roadmap
- `BUSINESS_MODEL_CANVAS.md` - Business model framework
- `COMPETITIVE_ANALYSIS_2025.md` - Market analysis
- `IMPLEMENTATION_AUDIT_2025.md` - Implementation status
- `BMAD_IMPLEMENTATION_PLAN.md` - BMAD methodology application
- Webflow implementation guides (pricing pages, business model integration)

**When to use**: Business strategy, planning, market analysis, implementation planning

### **n8n/** (224K - n8n Workflow Engine)

**Purpose**: n8n workflow automation documentation

**Key Documents**:
- `N8N_SINGLE_SOURCE_OF_TRUTH.md` - n8n system overview
- `N8N_WORKFLOW_CLEANUP_PLAN.md` - Workflow organization strategy
- `N8N_COMPREHENSIVE_AUDIT_PLAN.md` - Audit procedures
- `N8N_ACTION_ITEMS.md` - Implementation tasks
- `WORKFLOW_NAMING_CONVENTION_AUDIT.md` - Naming standards
- Node update plans (Airtable, QuickBooks)

**When to use**: n8n workflow development, debugging, system management

### **workflows/** (144K - Workflow Patterns)

**Purpose**: Workflow templates, patterns, and best practices

**Key Documents**:
- Workflow templates for various use cases
- Integration patterns
- Best practices for workflow design

**When to use**: Building new workflows, workflow optimization

### **webflow/** (96K - Webflow CMS)

**Purpose**: Webflow website implementation and CMS management

**Key Documents**:
- Webflow DevLink setup
- CMS collection structures
- Niche page deployment guides
- Component library documentation

**When to use**: Website updates, CMS management, page deployment

### **legal-pages/** (64K - Legal & Compliance)

**Purpose**: Legal page documentation and compliance requirements

**Key Documents**:
- Privacy policy documentation
- Terms of service
- Legal page deployment procedures

**When to use**: Legal updates, compliance reviews

### **mcp/** (60K - Model Context Protocol)

**Purpose**: MCP server documentation and configuration

**Key Documents**:
- MCP server setup guides (17+ servers)
- Configuration documentation
- Integration patterns

**When to use**: Setting up MCP servers, integrating new tools

### **products/** (32K - Product Catalog)

**Purpose**: Product specifications and catalog management

**Key Documents**:
- Product definitions
- Feature specifications
- Pricing strategies

**When to use**: Product updates, catalog management

### **ai-agents/** (32K - AI Agent Configurations)

**Purpose**: AI agent patterns and configurations

**Key Documents**:
- Agent design patterns
- Configuration templates
- Use case documentation

**When to use**: Implementing AI agents, agent optimization

### **technical/** (28K - Technical Specifications)

**Purpose**: Technical architecture and specifications

**Key Documents**:
- API specifications
- Database schemas
- Integration protocols

**When to use**: Technical implementation, API development

### **deployment/** (20K - Deployment Procedures)

**Purpose**: Deployment guides and procedures

**Key Documents**:
- Deployment checklists
- Environment setup
- Release procedures

**When to use**: Deploying new features, environment setup

### **infrastructure/** (16K - Infrastructure Management)

**Purpose**: Infrastructure setup and management documentation

**Key Documents**:
- `README.md` - Infrastructure overview
- VPS setup guides
- Service configuration

**When to use**: Infrastructure updates, service management

### **RUNBOOKS/** (12K - Operational Procedures)

**Purpose**: Step-by-step operational procedures

**Key Documents**:
- Incident response procedures
- Troubleshooting guides
- Maintenance procedures

**When to use**: Operations, troubleshooting, incident response

### **integrations/** (8K - Third-Party Integrations)

**Purpose**: Integration guides for external services

**Key Documents**:
- Integration setup guides
- API documentation references
- Authentication procedures

**When to use**: Setting up new integrations, troubleshooting connections

### **security/** (8K - Security Documentation)

**Purpose**: Security policies and procedures

**Key Documents**:
- Security incident response
- Access control policies
- Vulnerability management

**When to use**: Security reviews, incident response, policy updates

### **architecture/** (4K - System Architecture)

**Purpose**: High-level system architecture documentation

**Key Documents**:
- System architecture diagrams
- Data flow documentation
- Service dependencies

**When to use**: Understanding system design, planning major changes

---

## 🗂️ Documentation Standards

### **When to Add to docs/**

**Use docs/ for**:
- Technical implementation guides
- Business strategy documents
- Workflow patterns and templates
- Integration documentation
- Operational runbooks

**DO NOT use docs/ for**:
- Master system overview → Use `/CLAUDE.md`
- Quick reference → Use `/README.md`
- Temporary notes → Use `/data/temp/`
- Completion reports → Use `/data/reports/`
- Customer-specific docs → Use `/Customers/{customer}/`

### **File Naming Convention**

Use UPPERCASE with underscores for major docs:
```
✅ N8N_WORKFLOW_CLEANUP_PLAN.md
✅ RENSTO_BUSINESS_ROADMAP_2025.md
✅ IMPLEMENTATION_AUDIT_2025.md

❌ n8n-workflow-cleanup-plan.md
❌ renstoBusiness Roadmap2025.md
❌ implementation audit.md
```

Use lowercase with hyphens for supporting docs:
```
✅ setup-guide.md
✅ api-reference.md
✅ troubleshooting-guide.md
```

### **Document Structure**

Every major document should include:
```markdown
# Document Title

**Purpose**: Brief description
**Last Updated**: Date
**Status**: Draft | Review | Approved | Archived

---

## Table of Contents
(for longer docs)

## Overview
...

## Implementation
...

## References
- Link to related docs
- External resources
```

---

## 📊 Cleanup History

### **Phase 1 Consolidation (October 5, 2025)**:
- ✅ Reduced from 413 to 71 markdown files (83% reduction)
- ✅ Archived 342 docs to `archives/docs/`
- ✅ Organized into 16 subdirectories (now 15)

### **Phase 2 Audit #8 (October 5, 2025)**:
- ❌ Deleted 1 empty directory: `api/`
- ✅ Moved `infrastructure-readme.md` → `infrastructure/README.md`
- ✅ Created comprehensive `docs/README.md`

**Result**:
- Audit score: 71% → 82% (improved 11 points)
- Structure: 15 clear topical subdirectories
- Size: ~1.0M (well-organized, relevant content)

---

## 🔄 Documentation vs CLAUDE.md

### **When to use docs/**
- Detailed implementation guides
- Technical specifications
- Workflow patterns and templates
- Business strategy deep-dives
- Operational procedures

### **When to use CLAUDE.md**
- System overview and status
- Quick reference information
- Business model summary
- Integration points overview
- Immediate action items

**Rule of thumb**:
- **CLAUDE.md** = "What and Where" (navigation, overview)
- **docs/** = "How and Why" (implementation, details)

---

## 🔍 Finding Documentation

### **By Topic**:
- **n8n workflows** → `docs/n8n/`
- **Business strategy** → `docs/business/`
- **Webflow/Website** → `docs/webflow/`
- **Integrations** → `docs/integrations/` or `docs/mcp/`
- **Security** → `docs/security/`
- **Operations** → `docs/RUNBOOKS/`

### **By Type**:
- **Implementation guides** → `docs/deployment/` or topical subdirectory
- **Technical specs** → `docs/technical/` or `docs/architecture/`
- **Runbooks** → `docs/RUNBOOKS/`
- **Product info** → `docs/products/`

### **Search Command**:
```bash
# Search all docs for a term
grep -r "search term" docs/

# Find files by name
find docs/ -name "*filename*"

# List recent docs
find docs/ -type f -mtime -30
```

---

## ⚠️ Known Issues

### **Issue 1: Some docs may be outdated**
**Impact**: Information may not reflect current state
**Solution**: Review and update major docs quarterly
**Status**: ⚠️ Ongoing maintenance needed

### **Issue 2: No automatic doc generation**
**Impact**: Manual documentation maintenance
**Solution**: Consider tools like TypeDoc, JSDoc for code docs
**Status**: ⚠️ Low priority

### **Issue 3: Inconsistent naming conventions**
**Impact**: Some files use different naming styles
**Solution**: Standardize during next major doc review
**Status**: ⚠️ Acceptable for now

---

## 📊 Documentation Audit Score

**Criteria Met**: 14/17 (82%) - ✅ **GOOD** (improved from 71%)

**Improvements Made**:
- ✅ Comprehensive organization (15 topical directories)
- ✅ Clear directory guide (this README)
- ✅ Documentation standards defined
- ✅ No empty directories
- ✅ All files in proper locations

**Remaining Issues**:
- [ ] Quarterly doc review process (not yet scheduled)
- [ ] Some docs may need updates for current business model
- [ ] No automated doc generation

---

## 🗓️ Maintenance Schedule

**Monthly**:
- Review recent changes and update relevant docs

**Quarterly**:
- Full documentation audit
- Archive outdated docs
- Update major strategy/roadmap docs

**Yearly**:
- Major documentation overhaul
- Archive old year's planning docs
- Create new year's strategic docs

**Next Review**: January 2026 (quarterly)

---

## 📞 Questions?

**For adding new docs**: Follow the file naming conventions and add to appropriate subdirectory
**For finding docs**: Use the directory guide above or search commands
**For doc standards**: See "Documentation Standards" section above

---

**Last Updated:** October 5, 2025
**Next Audit:** January 2026 (quarterly)
**Maintained By:** Rensto Team
**File Count**: 71 markdown files (down from 413)
