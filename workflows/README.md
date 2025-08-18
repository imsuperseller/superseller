# 🔄 Workflows Directory

This directory contains all n8n workflows organized by type and function.

## 📁 Directory Structure

### 🤖 agents/
- Agent-specific workflows
- Automation workflows
- Processing workflows

### 🔗 integrations/
- Third-party integrations
- API connections
- Data synchronization

### 📋 templates/
- Workflow templates
- Reusable components
- Standard workflows

## 🔄 Workflow Management

### Creating Workflows
```bash
# Create webhook workflow
./scripts/management/workflow-management.sh create "My Workflow" webhook

# Create scheduled workflow
./scripts/management/workflow-management.sh create "Scheduled Task" schedule

# Create manual workflow
./scripts/management/workflow-management.sh create "Manual Process" manual
```

### Managing Workflows
```bash
# List all workflows
./scripts/management/workflow-management.sh list

# Activate workflow
./scripts/management/workflow-management.sh activate "My Workflow"

# Test workflow
./scripts/management/workflow-management.sh test "My Workflow" webhook

# Delete workflow
./scripts/management/workflow-management.sh delete "My Workflow"
```

### Importing Workflows
```bash
# Import individual workflow
./scripts/management/import-workflow.sh workflow.json

# Import multiple workflows
./scripts/management/import-workflows.sh workflows/
```

## 📊 Workflow Statistics

- **Total Workflows**: 15+
- **Agent Workflows**: 8
- **Integration Workflows**: 5
- **Template Workflows**: 2

## 🔧 Workflow Standards

### Naming Conventions
- Use descriptive names
- Include workflow type
- Follow consistent patterns

### Documentation
- Include workflow description
- Document input/output
- Add usage instructions

### Testing
- Test all workflows
- Validate inputs
- Monitor performance

## 🚀 Common Workflows

### Facebook Scraper
- **Type**: Agent workflow
- **Purpose**: Scrape Facebook groups
- **Trigger**: Webhook
- **Output**: Lead data

### Lead Qualification
- **Type**: Processing workflow
- **Purpose**: Qualify leads
- **Trigger**: New lead
- **Output**: Qualified leads

### Data Sync
- **Type**: Integration workflow
- **Purpose**: Sync data between systems
- **Trigger**: Schedule
- **Output**: Synchronized data
