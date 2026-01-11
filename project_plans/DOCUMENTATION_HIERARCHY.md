# 📚 RENSTO DOCUMENTATION HIERARCHY

**Last Updated**: October 5, 2025
**Purpose**: Define the single source of truth and prevent documentation conflicts

---

## 🎯 HIERARCHY (READ IN THIS ORDER)

### **1. CLAUDE.md** (MASTER - Single Source of Truth)
**Priority**: **HIGHEST**
**Location**: `/Users/shaifriedman/New Rensto/rensto/CLAUDE.md`
**Purpose**: Complete business, technical, and operational knowledge
**Contains**:
- Business model and revenue streams
- Complete architecture (data, infrastructure, services)
- Active systems (n8n, Airtable, Notion, etc.)
- Service offerings (Marketplace, Subscriptions, Custom, etc.)
- Tech stack and integrations
- Implementation status and critical gaps

**When to Read**: Before EVERY major change or architectural decision
**Authority Level**: ⭐⭐⭐⭐⭐ (ABSOLUTE)

---

### **2. .cursorrules** (Project Rules)
**Priority**: **HIGH**
**Location**: `/Users/shaifriedman/New Rensto/rensto/.cursorrules`
**Purpose**: Mandatory rules for AI assistants and developers
**Contains**:
- Architecture rules (domain routing, subdomain separation)
- Deployment rules
- DNS change protocols
- Quick decision trees
- "Before every session" checklist

**When to Read**: Start of every session
**Authority Level**: ⭐⭐⭐⭐ (MANDATORY)

---

### **3. .cursor/rules.md** (Cursor-Specific Rules)
**Priority**: **HIGH**
**Location**: `/Users/shaifriedman/New Rensto/rensto/.cursor/rules.md`
**Purpose**: Code-level rules, BMAD methodology, brand guidelines
**Contains**:
- Code structure principles (no duplicates, reuse > extend)
- BMAD methodology integration
- Brand guidelines (colors, design)
- Security and performance rules
- Idempotency requirements

**When to Read**: When writing code
**Authority Level**: ⭐⭐⭐⭐ (MANDATORY FOR CODE)

---

### **4. Subdomain Documentation**
**Priority**: **MEDIUM**
**Location**: Various `/docs/` subdirectories
**Purpose**: Specific implementation details

**Architecture Docs**:
- `/docs/RENSTO_WEBFLOW_VERCEL_ARCHITECTURE.md` - Detailed subdomain architecture
- `/docs/infrastructure/` - Infrastructure-specific docs

**Business Docs**:
- `/docs/business/` - Business model details, BMAD plans

**Product Docs**:
- `/docs/products/` - Product-specific documentation

**Archive**:
- `/docs/archive/{year-month}/` - Historical documentation

**When to Read**: When implementing specific features
**Authority Level**: ⭐⭐⭐ (REFERENCE)

---

### **5. Temporary Implementation Guides**
**Priority**: **LOW (Temporary)**
**Location**: `/tmp/` directory
**Purpose**: Short-term execution plans
**Contains**:
- `STRIPE_INTEGRATION_CORRECT_PLAN.md` - Current execution plan
- `PHASE_*_*.md` - Phase implementation guides
- Other temporary guides

**When to Read**: During active implementation
**Authority Level**: ⭐⭐ (EXECUTION GUIDE)
**Lifecycle**: Delete or archive after completion

---

## 🔀 CONFLICT RESOLUTION RULES

### **When Documents Conflict**:

1. **CLAUDE.md overrides everything**
   - If CLAUDE.md says one thing and another doc says different → CLAUDE.md wins
   - Exception: None

2. **.cursorrules overrides code-level docs**
   - If .cursorrules says "never do X" but an old doc says "do X" → .cursorrules wins
   - Update old doc or archive it

3. **.cursor/rules.md applies to code structure**
   - BMAD methodology, code principles, brand guidelines are authoritative
   - If conflicts with implementation guide → .cursor/rules.md wins

4. **Temporary docs expire**
   - `/tmp/*.md` files are valid ONLY during active implementation
   - After completion → archive or delete
   - Never reference `/tmp/` docs in permanent documentation

---

## 📝 UPDATE PROTOCOL

### **When to Update Each Document**:

**CLAUDE.md** (Major Changes Only):
- New service offering launched
- Architecture change (new subdomain, data storage change)
- New integration activated (MCP server, API)
- Business model pivot
- Critical gaps closed

**Update Process**:
1. Read entire CLAUDE.md first
2. Make changes to relevant section only
3. Update "Last Updated" date at top
4. Commit with clear message: `📝 docs: Update CLAUDE.md - [what changed]`

---

**.cursorrules** (Rule Additions):
- New architectural pattern discovered
- Common mistake needs prevention
- New decision tree needed

**Update Process**:
1. Add rule to appropriate section
2. Keep rules concise and actionable
3. Use ⛔ for "never do" and ✅ for "always do"

---

**.cursor/rules.md** (Code Standards):
- New code pattern established
- BMAD project completed
- Brand guideline update
- Security requirement added

**Update Process**:
1. Add to appropriate numbered section
2. Reference related BMAD project if applicable

---

**Subdomain Docs** (Implementation Details):
- Feature implementation complete
- New integration documented
- Architecture decision recorded

**Update Process**:
1. Create new doc in appropriate `/docs/` subdirectory
2. Use descriptive filename: `{FEATURE}_IMPLEMENTATION.md`
3. Reference in CLAUDE.md if architecturally significant

---

## 🗂️ DOCUMENT LIFECYCLE

### **Creation**:
1. **Temporary** → Create in `/tmp/` for active implementation
2. **Permanent** → Create in `/docs/{category}/`
3. **Master** → Update CLAUDE.md only for major changes

### **Maintenance**:
- **Weekly**: Review `/tmp/` and archive completed guides
- **Monthly**: Review `/docs/` for outdated information
- **Quarterly**: Full CLAUDE.md review and update

### **Archival**:
- **Outdated docs** → Move to `/docs/archive/{year-month}/`
- **Completed temp docs** → Move to `/docs/archive/{year-month}/` or delete
- **Never delete**: CLAUDE.md, .cursorrules, .cursor/rules.md

---

## 🔍 QUICK REFERENCE: "WHERE DO I FIND...?"

| Question | Document | Section |
|----------|----------|---------|
| What's the subdomain architecture? | CLAUDE.md | Section 14: Tech Stack → Infrastructure |
| Can I point rensto.com to Vercel? | .cursorrules | Architecture Rules (Answer: NO) |
| What are the BMAD phases? | .cursor/rules.md | Section: BMAD Methodology Integration |
| How do I deploy Stripe integration? | /tmp/STRIPE_INTEGRATION_CORRECT_PLAN.md | Step-by-step guide |
| What n8n workflows are active? | CLAUDE.md | Section 4: Active Systems → n8n Workflows |
| What are the brand colors? | .cursor/rules.md | Section: Rensto Brand Guidelines |
| Where are API routes deployed? | .cursorrules | Architecture Rules → api.rensto.com |
| What's the revenue model? | CLAUDE.md | Section 1: Business Overview → Revenue Streams |
| How do I structure code? | .cursor/rules.md | Core Principles (1-10) |
| What's the data storage hierarchy? | CLAUDE.md | Section 3: Data Storage Strategy |

---

## 🚨 CONFLICTS TO WATCH FOR

### **Common Conflict Scenarios**:

**1. Old docs reference wrong architecture**
- **Issue**: Old markdown says "deploy to rensto.com"
- **Resolution**: CLAUDE.md overrides → archive old doc
- **Action**: Move to `/docs/archive/{date}/` with note

**2. Temporary guide contradicts permanent rule**
- **Issue**: `/tmp/PHASE_1_*.md` says point rensto.com to Vercel
- **Resolution**: .cursorrules overrides → rewrite temp guide
- **Action**: Delete incorrect temp guide, create correct one

**3. Code rules vs business requirements**
- **Issue**: .cursor/rules.md says "no MongoDB", CLAUDE.md says "MongoDB for >50K records"
- **Resolution**: CLAUDE.md overrides (business need)
- **Action**: Update .cursor/rules.md to clarify exception

**4. Multiple sources claim authority**
- **Issue**: 3 docs all claim to be "source of truth"
- **Resolution**: CLAUDE.md is THE source of truth
- **Action**: Remove "source of truth" claims from others

---

## ✅ QUALITY CHECKLIST

Before creating/updating ANY documentation:

- [ ] Have I read CLAUDE.md relevant sections?
- [ ] Does this conflict with .cursorrules?
- [ ] Does this conflict with .cursor/rules.md?
- [ ] Is this temporary or permanent?
- [ ] Where should this document live?
- [ ] Do I need to update CLAUDE.md after this?
- [ ] Is there an existing doc I should update instead?
- [ ] Should the old doc be archived?

---

## 🎯 SUMMARY: THE GOLDEN RULE

> **When in doubt, CLAUDE.md is the single source of truth.**
>
> Everything else is either:
> - Rules to follow (.cursorrules, .cursor/rules.md)
> - Details to implement (/docs/)
> - Temporary execution plans (/tmp/)

**If documents conflict → CLAUDE.md wins.**

---

*This hierarchy ensures consistency and prevents documentation drift.*
