# n8n v2.x Compatibility Guide

## Purpose
Navigate breaking changes in n8n 2.0+ including Task Runners, disabled nodes, environment variable access, Python changes, and configuration requirements.

## Activates On
- n8n 2.0, v2 changes, breaking changes, upgrade n8n
- task runner, ExecuteCommand disabled, env access blocked
- Python Code node, Pyodide removed, binary data mode

---

## Core Concept: n8n 2.0 Security Hardening

n8n 2.0 introduced significant security improvements that change how workflows execute:

| Feature | v1.x Behavior | v2.x Behavior |
|---------|---------------|---------------|
| Code Node Execution | In main process | Task Runners (isolated) |
| Environment Variables | Accessible in Code | Blocked by default |
| ExecuteCommand Node | Enabled | Disabled by default |
| Python Code Node | Pyodide (browser-based) | Native Python (external runner) |
| Binary Data | In-memory option | Filesystem/Database/S3 only |
| OAuth Callbacks | No auth required | Auth required by default |

Reference: [n8n v2.0 Breaking Changes](https://docs.n8n.io/2-0-breaking-changes/)

---

## Pattern #1: Task Runners Configuration

Task Runners isolate Code node execution for security. They're enabled by default in v2.0+.

### Check Current Mode
```bash
docker exec n8n_container printenv | grep N8N_RUNNERS
```

### Configuration Options

**Internal Mode (Default)** - Runs inside n8n process:
```yaml
environment:
  - N8N_RUNNERS_ENABLED=true
  - N8N_RUNNERS_MODE=internal
```

**External Mode (Production)** - Separate container for isolation:
```yaml
# docker-compose.yml
services:
  n8n:
    image: n8nio/n8n:latest
    environment:
      - N8N_RUNNERS_ENABLED=true
      - N8N_RUNNERS_MODE=external
      - N8N_RUNNERS_SERVER_ENABLED=false
    
  task-runner:
    image: n8nio/runners:latest  # Separate image in v2.0!
    environment:
      - N8N_RUNNERS_SERVER_URL=http://n8n:5679
```

### Common Issues

**Issue**: Code nodes timeout or fail silently
```javascript
// Check if task runner is working
// In Code node:
return [{ json: { taskRunnerTest: "success", timestamp: Date.now() } }];
```

**Issue**: Task runner container missing
```bash
# v2.0 removed task runner from n8nio/n8n image
# Must use separate image for external mode:
docker pull n8nio/runners:latest
```

---

## Pattern #2: Environment Variable Access

n8n 2.0 blocks `process.env` access in Code nodes by default.

### Old Way (Blocked in v2.0)
```javascript
// ❌ BLOCKED - throws error or returns undefined
const apiKey = process.env.MY_API_KEY;
const secret = process.env.MY_SECRET;
```

### New Way: Use Direct Node References
```javascript
// ✅ RECOMMENDED - GlobalSettings pattern
// Create a Code node at workflow start with your config
const settings = $("GlobalSettings").first().json;
const apiKey = settings.API_KEY;
const baseUrl = settings.BASE_URL;
```

### New Way: Use n8n Credentials
```javascript
// ✅ BEST - Use HTTP Header Auth credential
// Configure in HTTP Request node:
// Authentication: Generic Credential Type
// Generic Auth Type: Header Auth
// Then reference: {{ $credentials.headerAuth.value }}
```

### Enable Env Access (Not Recommended)
```yaml
# Only if absolutely necessary:
environment:
  - N8N_BLOCK_ENV_ACCESS_IN_NODE=false  # Default is true in v2.0
```

### Migration Pattern
```javascript
// Before (v1.x)
const config = {
  apiKey: process.env.API_KEY,
  baseUrl: process.env.BASE_URL
};

// After (v2.x) - GlobalSettings Code node
const config = {
  apiKey: "your-api-key-here",  // Or from n8n credential
  baseUrl: "https://api.example.com"
};
return [{ json: config }];

// Access anywhere:
const config = $("GlobalSettings").first().json;
```

---

## Pattern #3: Disabled Nodes

ExecuteCommand and LocalFileTrigger are disabled by default for security.

### Check Disabled Nodes
```bash
docker exec n8n_container printenv | grep NODES_EXCLUDE
```

### Enable Specific Nodes
```yaml
environment:
  # Enable all nodes (security risk!)
  - NODES_EXCLUDE=[]
  
  # Or enable specific nodes only
  - NODES_EXCLUDE=["n8n-nodes-base.localFileTrigger"]
  # This enables ExecuteCommand but keeps LocalFileTrigger disabled
```

### Alternatives to ExecuteCommand

**For shell commands** - Use HTTP Request to a local API:
```javascript
// Create a simple API endpoint on your server
// Then call it via HTTP Request node
URL: http://localhost:8080/execute
Method: POST
Body: { "command": "your-command" }
```

**For file operations** - Use ReadWriteFile node:
```javascript
// Limited to ~/.n8n-files directory by default
// Or set N8N_RESTRICT_FILE_ACCESS_TO=/your/path
```

---

## Pattern #4: Python Code Node Changes

Pyodide-based Python was removed. Native Python requires external task runners.

### v1.x Python (Removed)
```python
# ❌ No longer works - Pyodide removed
items = _input.all()
result = []
for item in items:
    result.append({"json": item["json"]})
return result
```

### v2.x Python Requirements
1. Task Runners in external mode
2. Native Python installed in runner container
3. Different syntax for data access

```python
# ✅ v2.x Python (with external task runner)
# Note: Built-in variables like _input changed
items = items  # Direct access to items array
result = []
for item in items:
    result.append({"json": {"processed": True}})
return result
```

### Recommendation: Use JavaScript
```javascript
// JavaScript is fully supported without external runners
// 95% of Python use cases can be done in JavaScript
const items = $input.all();
return items.map(item => ({
  json: { ...item.json, processed: true }
}));
```

---

## Pattern #5: Binary Data Mode

In-memory binary data mode was removed for stability.

### Available Modes (v2.0+)
```yaml
environment:
  # Filesystem (default for regular mode)
  - N8N_DEFAULT_BINARY_DATA_MODE=filesystem
  
  # Database (default for queue mode)
  - N8N_DEFAULT_BINARY_DATA_MODE=database
  
  # S3 (for distributed setups)
  - N8N_DEFAULT_BINARY_DATA_MODE=s3
  - N8N_EXTERNAL_STORAGE_S3_HOST=your-s3-endpoint
  - N8N_EXTERNAL_STORAGE_S3_BUCKET=your-bucket
```

### Impact
- Workflows with large binary data now write to disk
- Ensure sufficient disk space
- Consider S3 for distributed/scaled deployments

---

## Pattern #6: OAuth Callback Authentication

OAuth callbacks now require n8n user authentication by default.

### Check Current Setting
```bash
docker exec n8n_container printenv | grep N8N_SKIP_AUTH_ON_OAUTH_CALLBACK
# Empty or not set = authentication required (v2.0 default)
```

### If OAuth Fails After Upgrade
```yaml
# Test with auth disabled first:
environment:
  - N8N_SKIP_AUTH_ON_OAUTH_CALLBACK=true  # Only for testing!

# Then fix your OAuth flow to work with auth enabled
```

### Best Practice
Keep authentication enabled and ensure:
1. OAuth redirect URL is correct
2. User is logged into n8n when authorizing
3. Cookies/session are not blocked

---

## Pattern #7: Configuration File Permissions

n8n enforces strict file permissions (0600) on config files.

### Check Permissions
```bash
ls -la ~/.n8n/
# Should show: -rw------- for config files
```

### Fix Permissions
```bash
chmod 600 ~/.n8n/config
chmod 600 ~/.n8n/.env
```

### Disable Check (Not Recommended)
```yaml
environment:
  - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=false
```

---

## Docker Compose Template (v2.x Compatible)

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      # Core settings
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.yourdomain.com/
      - GENERIC_TIMEZONE=America/Chicago
      
      # v2.x Task Runner settings
      - N8N_RUNNERS_ENABLED=true
      - N8N_RUNNERS_MODE=internal  # or external for production
      
      # v2.x Security settings (defaults shown)
      - N8N_BLOCK_ENV_ACCESS_IN_NODE=true
      # - NODES_EXCLUDE=[]  # Uncomment to enable all nodes
      
      # v2.x Binary data
      - N8N_DEFAULT_BINARY_DATA_MODE=filesystem
      
      # v2.x OAuth
      - N8N_SKIP_AUTH_ON_OAUTH_CALLBACK=false
      
      # Database
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      
      # Execution settings
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=168
      - EXECUTIONS_TIMEOUT=3600
      
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - n8n-network

  # Only needed for external task runner mode
  # task-runner:
  #   image: n8nio/runners:latest
  #   environment:
  #     - N8N_RUNNERS_SERVER_URL=http://n8n:5679
  #   networks:
  #     - n8n-network

volumes:
  n8n_data:

networks:
  n8n-network:
```

---

## Migration Checklist

Before upgrading to v2.x:

- [ ] **Task Runners**: Test with `N8N_RUNNERS_ENABLED=true`
- [ ] **Env Access**: Replace `process.env` with GlobalSettings pattern
- [ ] **Disabled Nodes**: Check if ExecuteCommand/LocalFileTrigger used
- [ ] **Python Nodes**: Convert to JavaScript or set up external runner
- [ ] **Binary Data**: Ensure disk space for filesystem mode
- [ ] **OAuth**: Test OAuth flows with auth enabled
- [ ] **File Permissions**: Check config file permissions
- [ ] **Database**: Migrate from MySQL/MariaDB if used (dropped in v2.0)

---

## Quick Fixes

| Problem | Solution |
|---------|----------|
| `process.env undefined` | Use GlobalSettings node pattern |
| Code node timeout | Check task runner config |
| ExecuteCommand not found | Set `NODES_EXCLUDE=[]` |
| Python Code fails | Use JavaScript or external runner |
| OAuth redirect fails | Check `N8N_SKIP_AUTH_ON_OAUTH_CALLBACK` |
| Binary data errors | Set `N8N_DEFAULT_BINARY_DATA_MODE=filesystem` |
| Permission denied | `chmod 600` on config files |

---

## Evaluation Scenarios

```json
{
  "id": "v2-001",
  "query": "My Code node can't access environment variables after upgrading",
  "expected_behavior": [
    "Explains N8N_BLOCK_ENV_ACCESS_IN_NODE=true default",
    "Shows GlobalSettings pattern alternative",
    "Recommends using n8n credentials"
  ]
}
```

```json
{
  "id": "v2-002",
  "query": "ExecuteCommand node is missing from my n8n",
  "expected_behavior": [
    "Explains disabled by default in v2.0",
    "Shows NODES_EXCLUDE configuration",
    "Suggests HTTP Request alternative"
  ]
}
```

```json
{
  "id": "v2-003",
  "query": "How do I set up task runners for production?",
  "expected_behavior": [
    "Explains internal vs external mode",
    "Shows n8nio/runners Docker image requirement",
    "Provides docker-compose example"
  ]
}
```
