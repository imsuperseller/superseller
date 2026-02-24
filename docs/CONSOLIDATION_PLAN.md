# Documentation Consolidation Plan
## Problem Statement
Information sprawl causing:
- AI agents asking redundant questions
- Contradictions between sources
- Unclear authority hierarchy
- Operational inefficiency

## Canonical Architecture (Post-Consolidation)

### Tier 1: Operational Truth (Codebase)
**Location**: `/docs/` (Git-tracked, version-controlled)
**Authority**: Highest - overrides everything else
**Contents**:
1. **INFRA_SSOT.md** - All infrastructure (servers, DBs, APIs, credentials paths)
2. **PRODUCT_BIBLE.md** - Product specs, pricing, features, SaaS logic
3. **DATA_DICTIONARY.md** - Schema truth, Prisma/Drizzle sync rules
4. **API_CONTRACTS.md** - Route inventory, types, auth patterns
5. **BUSINESS_COVERAGE_INDEX.md** - Master router to all topics

### Tier 2: Methodology & Specs (NotebookLM)
**Location**: NotebookLM (5811a372 - B.L.A.S.T., 0baf5f36 - TourReel, etc.)
**Authority**: Reference only - does NOT override codebase
**Contents**:
- B.L.A.S.T. methodology
- Agent behavior philosophy
- Product design rationale
- Historical decisions (why, not what)

### Tier 3: Router (CLAUDE.md)
**Location**: `/CLAUDE.md` (root)
**Authority**: Navigation hub - points to Tier 1
**Contents**:
- Quick reference table
- "For X, see Y" routing
- NO duplicated content (DRY principle)

### Tier 4: Skills (Execution)
**Location**: `/.claude/skills/`
**Authority**: Task-specific - references Tier 1
**Contents**:
- Executable workflows
- Command sequences
- References to INFRA_SSOT, PRODUCT_BIBLE (not duplicates)

## Consolidation Actions

### Phase 1: Audit (Immediate)
- [ ] Inventory all contradictions between docs/, notebooks, skills/
- [ ] Flag duplicate content across tiers
- [ ] Identify missing SoTs (e.g., n8n workflows, MCP configs)

### Phase 2: Migrate (Week 1)
- [ ] Move all operational data from notebooks → codebase docs/
- [ ] Update CLAUDE.md to route to consolidated sources
- [ ] Archive or delete redundant files (GAPS.md, old audits)
- [ ] Update skills to reference Tier 1 docs (not inline duplication)

### Phase 3: Sync Protocol (Week 2)
- [ ] Create `tools/doc-sentinel.ts` - drift detector (like schema-sentinel)
- [ ] Run daily: Check for contradictions between:
  - INFRA_SSOT vs actual server configs
  - PRODUCT_BIBLE vs Stripe/DB pricing
  - DATA_DICTIONARY vs Prisma/Drizzle schemas
- [ ] Alert on conflicts

### Phase 4: Maintenance (Ongoing)
- [ ] Every deployment: Update relevant SoT docs
- [ ] Every product change: Update PRODUCT_BIBLE first, then code
- [ ] Monthly audit: Run doc-sentinel, resolve drift

## Authority Precedence (When Sources Conflict)
1. **Deployed code** - What's actually running
2. **Tier 1 docs** (INFRA_SSOT, PRODUCT_BIBLE, etc.)
3. **Tier 2 notebooks** (methodology, philosophy)
4. **Tier 3 router** (CLAUDE.md)
5. **Tier 4 skills** (workflows)

## Enforcement Rules
- **No duplicate content** - Each fact lives in ONE place
- **DRY for docs** - Router points, doesn't duplicate
- **Codebase wins** - When docs conflict with deployed reality, deploy wins (then fix docs)
- **Update or delete** - Stale docs get purged or updated, never left to mislead

## Success Metrics
- AI agent asks <3 questions per new task (down from 10+)
- Zero contradictions between Tier 1 docs and deployed systems
- New team members onboard in <1 hour (read CLAUDE.md → follow links)
- Doc-sentinel passes clean (0 drift warnings)

---
**Next Steps**:
1. Run Phase 1 audit
2. Create migration checklist
3. Build doc-sentinel
4. Merge residue (findings.md, progress.md)
