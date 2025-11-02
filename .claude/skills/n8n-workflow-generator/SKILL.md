---
name: n8n-workflow-generator
description: Generate complete n8n workflow JSON from natural language requirements. Use when creating workflows programmatically, converting process descriptions to automation, or building workflow templates.
allowed-tools: [Read, Write, Bash]
---

# n8n Workflow Generator

## Overview
Transforms natural language descriptions, written procedures, and process documentation into executable n8n workflows with proper node selection, configuration, and error handling.

## Quick Start
Describe the workflow in plain language:
"Create a workflow that: 1) Triggers daily at 9 AM, 2) Fetches unprocessed orders from PostgreSQL, 3) For each order sends a confirmation email, 4) Updates order status to 'sent'"

## Workflow Generation Process

### 1. Parse Requirements
Extract workflow steps from description:
- Identify trigger type (schedule, webhook, manual)
- List data sources and destinations
- Note transformation requirements
- Identify conditional logic
- Determine error handling needs

### 2. Select Appropriate Nodes
Map requirements to n8n nodes:
- Schedule Trigger → Cron node
- Database queries → Postgres/MySQL/MongoDB nodes
- HTTP requests → HTTP Request node
- Data transformation → Code/Function nodes
- Conditionals → IF/Switch nodes
- Loops → Loop Over Items/Split In Batches
- Email → Email Send node
- File operations → Read/Write Binary Data

### 3. Generate Workflow Structure
Create workflow JSON with proper node configuration, connections, and parameters.

### 4. Add Error Handling
Implement resilience:
- Try-Catch blocks with Error Trigger nodes
- Retry logic for flaky APIs
- Notification on failures
- Fallback paths
- Logging for debugging

## Common Workflow Patterns

### Data Sync Pattern
```
Trigger → Source → Transform → Destination → Notification
```

### API Integration Pattern
```
Webhook → Validate → API Call → Transform → Store → Response
```

### Batch Processing Pattern
```
Schedule → Fetch Batch → Split Items → Process Each → Merge → Update Status
```

### Conditional Processing Pattern
```
Trigger → IF Condition → [True Branch, False Branch] → Merge → Continue
```

## Node Selection Guide

### Triggers
- **Schedule**: `n8n-nodes-base.scheduleTrigger` - Daily, weekly, custom cron
- **Webhook**: `n8n-nodes-base.webhook` - HTTP endpoints
- **Manual**: `n8n-nodes-base.manualTrigger` - Manual execution

### Data Sources
- **Database**: `n8n-nodes-base.postgres`, `n8n-nodes-base.mysql`
- **APIs**: `n8n-nodes-base.httpRequest`
- **Files**: `n8n-nodes-base.readBinaryData`
- **Email**: `n8n-nodes-base.emailReadImap`

### Data Processing
- **Transform**: `n8n-nodes-base.code` - Custom JavaScript
- **Filter**: `n8n-nodes-base.if` - Conditional logic
- **Loop**: `n8n-nodes-base.splitInBatches` - Process items
- **Merge**: `n8n-nodes-base.merge` - Combine data

### Data Destinations
- **Database**: `n8n-nodes-base.postgres`, `n8n-nodes-base.mysql`
- **APIs**: `n8n-nodes-base.httpRequest`
- **Email**: `n8n-nodes-base.emailSend`
- **Files**: `n8n-nodes-base.writeBinaryData`

## Error Handling Patterns

### Retry Logic
```json
{
  "name": "HTTP Request with Retry",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "retry": {
      "enabled": true,
      "maxAttempts": 3,
      "waitBetweenAttempts": 1000
    }
  }
}
```

### Error Notification
```json
{
  "name": "Error Handler",
  "type": "n8n-nodes-base.slack",
  "parameters": {
    "text": "Workflow failed: {{ $json.error }}"
  }
}
```

## Validation Checklist
- [ ] Valid JSON syntax
- [ ] All node types exist in n8n
- [ ] Required parameters configured
- [ ] Connections properly defined
- [ ] Credentials referenced correctly
- [ ] No circular dependencies
- [ ] Error handling included
- [ ] Workflow importable to n8n instance
