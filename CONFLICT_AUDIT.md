# Conflict Audit — Executable Checklist

**Purpose**: Run this checklist when asked "do you have conflicts?" or when sources disagree. Execute each check — don't guess.

**Authority Precedence** (from brain.md):
1. brain.md → 2. CLAUDE.md → 3. INFRA_SSOT / PRODUCT_BIBLE → 4. METHODOLOGY.md → 5. agent-behavior.md → 6. ARCHITECTURE.md → 7. NotebookLM → 8. .cursorrules

---

## Quick Checks

### 1. Product Status Alignment
```
Compare: CLAUDE.md §5 vs PRODUCT_STATUS.md vs PRODUCT_BIBLE.md §2
Action: All three must list the same products with consistent status labels.
```

### 2. Infrastructure Facts
```
Compare: INFRA_SSOT.md §1 (service status) vs actual health checks
Action: curl each health endpoint. Update status if changed.
Health checks:
  - curl -s https://rensto.com/api/health
  - curl -s http://172.245.56.50:3002/api/health
  - curl -s http://172.245.56.50:11434/api/tags
  - curl -s http://172.245.56.50:8082/health
  - curl -s http://172.245.56.50:5678/healthz
```

### 3. Env Var Naming
```
Compare: Code env vars vs INFRA_SSOT.md §2 vs skill docs
Action: Grep for env var names, verify they match docs.
Known split (by design): WAHA_URL (Studio), WAHA_BASE_URL (rensto-site), config.shared.wahaUrl (FB Bot)
```

### 4. Deploy Model
```
Compare: DECISIONS.md §2 vs VERCEL_PROJECT_MAP.md vs CLAUDE.md §6
Action: Current reality in VERCEL_PROJECT_MAP.md wins. DECISIONS §2 is aspirational.
```

### 5. n8n Role
```
Compare: DECISIONS.md §9 vs actual n8n workflow executions
Action: n8n is backup for NEW automation. Existing production workflows (FB Bot lead pipeline) still run on n8n.
```

### 6. Schema Drift
```
Run: npx tsx tools/schema-sentinel.ts
Action: Fix any type mismatches between Prisma and Drizzle.
```

### 7. NotebookLM vs Codebase
```
Query: NotebookLM 5811a372 for current methodology
Compare: Response vs METHODOLOGY.md
Action: Higher tier wins per authority precedence.
```

### 8. Skill File References
```
Check: Each .claude/skills/*/SKILL.md references files that exist
Action: Glob each referenced path. Remove stale references.
```

---

## When to Run

- User asks "do you have conflicts?"
- After major refactors or migrations
- When resuming work after long break
- When two docs give different answers

## Resolution

1. Identify which doc has higher authority (see precedence above)
2. Update lower-authority doc to match
3. Log the fix in findings.md
4. If genuinely ambiguous, ask the user

---

*Last audit: Feb 24, 2026. Next: run checks above.*
