# Directive: n8n Governance & Standards (Rensto)

**Purpose**: Define the operational standards, naming conventions, and access policies for the Rensto n8n ecosystem.

**Last Updated**: February 2026  
**Target Version**: n8n 2.4.6

> [!NOTE]
> **Antigravity is primary** automation. n8n is backup/reference. Use n8n when Antigravity cannot do the task.

---

## 1. System Architecture & Access

### Primary Instance (Rensto VPS)
- **URL**: `https://n8n.rensto.com` (Cloudflare proxied)
- **Direct**: `http://172.245.56.50:5678` (internal only)
- **Version**: Community Edition v2.4.6
- **Host**: Racknerd VPS (172.245.56.50)
- **Access Policy**: **MCP-ONLY**. Use `universal-aggregator` MCP tools. Avoid direct API calls.

### Deprecated Instances (DO NOT USE)
- ~~Tax4Us Cloud~~ - Removed
- ~~Shelly Cloud~~ - Removed
- ~~Wondercare~~ - Offline

---

## 2. Naming & Tagging Conventions

All workflows must follow the format: `{TYPE}-{FUNCTION}-{VERSION}`

| Prefix | Type | Example |
|:-------|:-----|:--------|
| `INT-` | Internal Operations | `INT-SYNC-001` |
| `SUB-` | Subscriptions/Products | `SUB-VIDEO-MERGE-011` |
| `MKT-` | Marketing | `MKT-POST-010` |
| `DEV-` | Development/Testing | `DEV-TEST-001` |
| `EXT-` | External Client Work | `EXT-CLIENT-Alpha` |

### MCP Exposure Tagging
- Tag workflows with `mcp` to expose them to AI agents
- Tag with `mcp-readonly` for query-only access
- Untagged workflows are NOT exposed via MCP

---

## 3. Data Hierarchy (BMAD Standards)

1. **OPERATIONAL (Primary): n8n Data Tables**
   - Source of truth for real-time transactions, logs, and incoming leads.
2. **SECONDARY: Airtable**
   - Dashboards and manual config. Syncs from n8n every 15 mins.
3. **TERTIARY: Notion**
   - Documentation and strategy. Syncs daily.

---

## 4. Critical Rules

### Security (n8n 2.x)
- Never hardcode credentials. Use n8n Credential Manager.
- **Env Vars Blocked**: Code nodes cannot access `process.env` by default.
- Use GlobalSettings pattern or n8n credentials instead.
- **Task Runners**: Code nodes run in isolated environments (default in 2.x).

### Integration
- **Webhooks**: Must use HTTPS (`https://n8n.rensto.com/webhook/...`)
- **Error Handling**: Every production workflow MUST have Error Trigger node.
- **Webhook Security**: Use Header Auth or Bearer minimum. Never "None" in production.

### Development (n8n 2.x)
- **Publish Workflow**: Save ≠ Publish. Always click **Publish** to push changes live.
- **Tunnel Removed**: Use ngrok or Cloudflare Tunnel for local webhook testing.
- **Validate JSON**: Ensure payloads match node requirements.

### Async Patterns
- **Polling Loops**: Use direct node references `$("NodeName").first().json` for taskId preservation.
- **StaticData**: Scope by execution ID to prevent cross-execution pollution.
- **Status Checks**: Handle multiple success formats (`"success"`, `4`, `true`, `"completed"`).

---

## 5. Environment Configuration (2.x)

Required environment variables for Rensto VPS:

```bash
# Core
N8N_HOST=n8n.rensto.com
N8N_PORT=5678
N8N_PROTOCOL=https

# Security (2.x defaults)
N8N_RUNNERS_ENABLED=true
N8N_BLOCK_ENV_ACCESS_IN_NODE=true

# Binary Data
N8N_DEFAULT_BINARY_DATA_MODE=filesystem

# Execution
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=168
EXECUTIONS_TIMEOUT=3600

# Database
DB_TYPE=postgresdb
```

---

## 6. Monitoring & Maintenance

### Health Checks
- Monitor execution success rate via Insights dashboard
- Review error executions weekly
- Check Docker container health: `docker ps | grep n8n`

### Backup Strategy
- Export critical workflows as JSON monthly
- Database backups handled at VPS level (Racknerd)
- Credentials are encrypted; back up `N8N_ENCRYPTION_KEY`

### Version Management
- Pin production to specific version (`n8n:2.4.6`)
- Test upgrades on `DEV-` workflows first
- Check https://docs.n8n.io/release-notes/ before upgrading
- Review https://docs.n8n.io/2-0-breaking-changes/ for v2.x changes
