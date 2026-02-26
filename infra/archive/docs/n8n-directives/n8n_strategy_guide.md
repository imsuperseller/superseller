# Directive: n8n Strategy & Architecture

**Purpose**: Guide high-level architecture decisions, AI integration, and platform configuration for n8n 2.x environments.

**Last Updated**: February 2026  
**Current Version**: n8n 2.4.6

---

## 1. Architectural Patterns

### Modular Design
- **Sub-workflows**: Use `Execute Workflow` node for reusable logic.
- **Structure**:
  - **Sequential**: A → B → C (dependent steps)
  - **Parallel**: A → [B, C] → Merge (independent steps)
  - **Router**: Gatekeeper workflow routes to specialized sub-workflows.
- **Size Limit**: Aim for 5-10 nodes per workflow for readability.

### Queue Mode
- **When to Enable**: >50 concurrent workflows or high traffic spikes.
- **Mechanism**: Uses Redis + Worker processes. Scalable to ~220 executions/sec.
- **Binary Data**: In queue mode, `N8N_DEFAULT_BINARY_DATA_MODE=database` is default.

---

## 2. AI Integration (Agentic Workflows)

### AI Agent Node
- **Role**: Acts as a "Tools Agent" by default (since v1.82.0).
- **Configuration**:
  - **Model**: Chat Model (GPT-4o, Claude 3.5/4, Gemini 1.5/2.0, Ollama for self-hosted)
  - **Memory**: Postgres/Redis Chat Memory for persistence (Simple Memory is ephemeral)
  - **Tools**: Connect n8n workflow tools, MCP servers, or built-in tools

### RAG Architecture
- **Ingestion**: Source → Splitter → Embedding → Vector Store (Insert).
- **Retrieval**: Chat Trigger → QA Chain → Vector Retriever → Response.

### Token Optimization
- Route simple queries to cheaper models (GPT-4o-mini, Claude Haiku)
- Use Structured Output Parser with JSON schemas for consistent outputs
- Cache normalized inputs to avoid redundant API calls

---

## 3. n8n 2.x Environment (Current)

### Active Security Defaults
These are **already enforced** in 2.4.6:

| Setting | Default Behavior | Override |
|---------|------------------|----------|
| **Task Runners** | Code nodes run in isolated environments | `N8N_RUNNERS_ENABLED=false` (not recommended) |
| **Env Var Access** | Blocked from Code nodes | `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` or use GlobalSettings pattern |
| **Binary Data Mode** | `filesystem` (regular) / `database` (queue) | `N8N_DEFAULT_BINARY_DATA_MODE` |
| **ExecuteCommand Node** | Disabled by default | Update `NODES_EXCLUDE` to re-enable |
| **LocalFileTrigger Node** | Disabled by default | Update `NODES_EXCLUDE` to re-enable |

### Publish Workflow Paradigm
- **Save** = Preserves edits locally (does NOT push to production)
- **Publish** = Explicitly pushes changes live
- Always verify Publish status before expecting production changes

### Removed Features in 2.x
- `--tunnel` CLI option → Use ngrok, Cloudflare Tunnel, or localtunnel
- `N8N_CONFIG_FILES` → Use `.env` directly
- `QUEUE_WORKER_MAX_STALLED_COUNT` → Implement custom retry logic if needed
- MySQL/MariaDB support → PostgreSQL or SQLite only
- In-memory binary data mode → Use filesystem/database/s3

---

## 4. MCP Integration

### Built-in Nodes
- **MCP Server Trigger** (`n8n-nodes-langchain.mcptrigger`): Exposes workflows as MCP tools
- **MCP Client Tool** (`n8n-nodes-langchain.toolmcp`): Connects to external MCP servers

### Current MCP Setup
Using `universal-aggregator` MCP server with:
- `n8n_*` tools for workflow management
- `n8n-skills` remote MCP for best practices
- Single `superseller` instance (172.245.56.50)

### Best Practices
- **Tool Design**: Design for outcomes ("Onboard User") not utilities ("Write DB Row")
- **Tagging**: Tag workflows with "mcp" to expose selectively
- **Authentication**: Use OAuth or Access Tokens at instance level

---

## 5. Async Polling Patterns

For external APIs with long-running tasks (Kie.ai, Runway, etc.):

### TaskId Preservation
```javascript
// Use direct node reference (persists across loop iterations)
$("SubmitTask").first().json.data.taskId

// NOT $json.taskId (changes each iteration)
```

### Status Checking
```javascript
const SUCCESS_STATUSES = [4, 'completed', 'succeeded', 'done', 'success', 1, true];
const status = $json.status || $json.data?.state;
const isSuccess = SUCCESS_STATUSES.includes(status);
```

### Result Extraction
```javascript
// Many APIs return nested stringified JSON
const parsed = JSON.parse($json.data.resultJson);
const url = parsed.resultUrls?.[0];
```

---

## 6. Staying Current

### Resources
- **Changelog**: https://docs.n8n.io/release-notes/
- **Breaking Changes**: https://docs.n8n.io/2-0-breaking-changes/
- **GitHub Releases**: https://github.com/n8n-io/n8n/releases
- **Community Forum**: https://community.n8n.io/

### Update Strategy
- Pin to specific versions in production (`n8n:2.4.6`)
- Test updates in staging environment first
- Monitor community feedback for 48-72h after new releases
- Check Migration Report (Settings → Migration Report) before major upgrades
