# 🔧 Scripts Directory

This directory contains all automation and management scripts organized by function.

## 📁 Directory Structure

### 🚀 deployment/
- `deploy-redis.sh` - Unified Redis deployment (simple, enhanced, cluster)
- `deploy-portal.sh` - Unified portal deployment (static, Next.js, unified)
- `portal-generator.sh` - Customer portal generator system
- `portal-template.sh` - Unified customer portal template

### 🔄 management/
- `workflow-management.sh` - Unified workflow management (create, activate, delete, test)
- `workflow-cleanup.sh` - Clean up workflow artifacts
- `import-workflow.sh` - Import individual workflows
- `import-workflows.sh` - Import multiple workflows

### 🧪 testing/
- `test-suite.sh` - Unified test suite (health, integration, performance)
- `integration-tests.sh` - Integration testing suite
- `test-webhooks.js` - Webhook testing utilities

### 🛠️ maintenance/
- `system-backup.sh` - System backup and restore
- `docs-consolidator.sh` - Documentation consolidation

### ⚙️ setup/
- `setup-mcp.sh` - MCP server setup
- `start-mcp.sh` - MCP server startup

## 🚀 Usage

```bash
# Deploy Redis
./scripts/deployment/deploy-redis.sh enhanced

# Deploy portal
./scripts/deployment/deploy-portal.sh static "Acme Corp" "saas" "modern"

# Run tests
./scripts/testing/test-suite.sh all

# Manage workflows
./scripts/management/workflow-management.sh create "My Workflow" webhook
```

## 📊 Script Statistics

- **Total Scripts**: 15
- **Deployment Scripts**: 4
- **Management Scripts**: 4
- **Testing Scripts**: 3
- **Maintenance Scripts**: 2
- **Setup Scripts**: 2

## 🔧 Maintenance

- All scripts follow consistent naming conventions
- Scripts are organized by function
- Each script includes usage documentation
- Scripts are tested and validated
