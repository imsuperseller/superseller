# Antigravity Comprehensive n8n Instructions

**Last Updated**: December 25, 2025
**Purpose**: Technical reference and operational guidelines for Antigravity when working with n8n in the SuperSeller AI ecosystem.

---

## 🏗️ SYSTEM ARCHITECTURE & ACCESS

### **Primary n8n Instance (SuperSeller AI VPS)**
- **URL**: `http://n8n.superseller.agency` (or `http://172.245.56.50:5678`)
- **Version**: Community Edition v1.122.5
- **Access Policy**: **MCP-ONLY**. Do not use direct API calls or `curl` commands. Use `mcp__n8n-mcp-docs__*` or similar tools once configured.

### **Managed instances**
- **Tax4Us Cloud**: `https://tax4usllc.app.n8n.cloud`
- **Shelly Cloud**: `https://shellyins.app.n8n.cloud`
- **Access**: Strictly via MCP tools or Node.js proxy scripts if tools are unavailable.

---

## 📁 DATA HIERARCHY (BMAD Standards)

1. **OPERATIONAL (Primary)**: **n8n Data Tables**
   - Store all real-time transaction data, logs, and incoming lead info here.
2. **SECONDARY**: **Airtable**
   - Store dashboards, manual configurations, and synthesized reports.
   - n8n should sync to Airtable every 15 minutes.
3. **TERTIARY**: **Notion**
   - High-level documentation and strategy only. Sync daily from n8n.

---

## 🏷️ NAMING & TAGGING CONVENTION

All workflows must follow the format: `{TYPE}-{FUNCTION}-{VERSION}`
- `INT-`: Internal Operations (e.g., `INT-SYNC-001`)
- `SUB-`: Subscriptions (e.g., `SUB-LEAD-003`)
- `MKT-`: Marketing
- `DEV-`: Development / Testing
- `EXT-`: External Client Work

---

## 🛠️ TOOL UTILIZATION GUIDELINES

Whenever n8n is involved in a task, follow these steps:
1.  **Research First**: Use `fetch_n8n_mcp_documentation` from the `n8n-mcp-docs` server to understand the current tool capabilities and workflow structures.
2.  **Check Local Docs**: Review `docs/n8n/` for specific workflow logic or audit reports.
3.  **Validate JSON**: When creating or updating workflows, always validate the JSON structure against the `n8n-mcp` documentation.
4.  **Security First**: Ensure all credentials remain in the `.env` or n8n credentials manager; never hardcode them in workflows.

---

## 🚨 CRITICAL RULES
- **No Direct API**: Never use `X-N8N-API-KEY` in direct HTTP requests from the terminal.
- **Vercel Integration**: Ensure n8n webhooks are correctly targeted by Vercel API routes in `apps/web/superseller-site/src/app/api/webhooks/`.
- **Error Handling**: Every workflow should have an Error Trigger node connected to `INT-TECH-ERR-HANDLER`.

---

**Follow these instructions meticulously to ensure stability and architectural integrity.**
