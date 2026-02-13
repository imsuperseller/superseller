# Legacy data / configs

Reference and legacy configs. **Current stack:** see **CLAUDE.md** (PostgreSQL + Redis, Aitable.ai in use, Antigravity, n8n backup, Stripe). Treat everything here as legacy unless a doc says otherwise.

## Grouping (for consolidation)

| Group | Files | Purpose |
|-------|-------|---------|
| **sync** | sync-config.json, sync-configuration.json | Notion ↔ Airtable sync. sync-config = high-level (tokens, DB IDs); sync-configuration = field mapping, bidirectional. Both legacy (Airtable.com retired). |
| **notion** | notion-implementation-guide, notion-modern-structure, notion-rgid-system, notion-setup-guide, notion-sync-config, notion-templates | Notion configs. One canonical per purpose or consolidate to notion-config/ when ready. |
| **webflow** | webflow.json, webflow-extension-config.json | Webflow (retired). Consolidate to webflow/ when ready. |
| **Other** | lightrag-*, initial-knowledge-graph, developer_settings, etc. | Per-file. See CLAUDE.md. |
