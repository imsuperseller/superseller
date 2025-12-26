# 📥 EXTRACTED PATTERNS

**Purpose**: Raw workflow exports from production n8n instance
**Policy**: READ-ONLY extraction - production workflows are never modified

---

## ⚠️ IMPORTANT

This folder contains **raw exports** from production workflows.
- These are **reference materials** only
- Do NOT import these back to production
- Use them to create **new templates** in the parent folders

---

## 📂 Structure

```
extracted-patterns/
├── growth-engine/      # Sales & outreach workflow exports
├── content-factory/    # Marketing workflow exports
└── operations-brain/   # Support workflow exports
```

---

## 🔄 Extraction Process

1. Use `n8n_get_workflow(id="...", mode="full")` (READ-ONLY)
2. Save JSON to appropriate subfolder
3. Create `extraction-notes.md` with analysis
4. Use patterns to create templates in `01-*/`, `02-*/`, `03-*/`

---

## 🛡️ Safety Rules

- ✅ READ workflows via MCP
- ✅ SAVE to local files
- ✅ ANALYZE patterns
- ❌ NEVER modify production
- ❌ NEVER delete production
- ❌ NEVER import raw exports back

---

**See**: `../PRODUCTION_WORKFLOW_EXTRACTION_STRATEGY.md` for full policy
