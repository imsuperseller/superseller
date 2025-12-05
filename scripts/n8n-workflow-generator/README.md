# n8n Workflow Generator

Automated workflow generation system for creating n8n WhatsApp agent workflows from templates.

## Overview

This system generates complete n8n workflows from base templates and customer configurations, eliminating manual workflow creation.

## Architecture

```
┌─────────────────┐
│ Template Loader │ → Loads base templates
└─────────────────┘
         ↓
┌─────────────────┐
│ Node Customizer │ → Customizes nodes based on config
└─────────────────┘
         ↓
┌─────────────────┐
│ Workflow        │ → Assembles complete workflow
│ Assembler       │
└─────────────────┘
         ↓
┌─────────────────┐
│ Workflow        │ → Validates structure
│ Validator       │
└─────────────────┘
```

## Components

### 1. `workflow-template-loader.js`
Loads and manages base workflow templates.

**Usage:**
```bash
node workflow-template-loader.js list
node workflow-template-loader.js load base-whatsapp-agent
```

### 2. `node-customizer.js`
Customizes individual nodes based on customer configuration.

**Supported node types:**
- Code nodes (Smart Message Router, Context Enricher, etc.)
- Langchain Agent nodes (Shai AI Sales Agent)
- Tool Code nodes (Search Knowledge Base)
- Set nodes
- WAHA nodes

### 3. `workflow-assembler.js`
Assembles complete workflow from template and customizations.

**Features:**
- Deep clones template
- Customizes all nodes
- Generates unique IDs
- Updates connections
- Validates structure

### 4. `workflow-validator.js`
Validates workflow structure and node configurations.

**Validates:**
- Required fields
- Node structure
- Connections
- Credentials
- Duplicate IDs/names

### 5. `generate-workflow.js`
Main entry point for workflow generation.

**Usage:**
```bash
# Generate workflow
node generate-workflow.js generate base-whatsapp-agent customer-config.json

# List templates
node generate-workflow.js list-templates
```

## Customer Configuration Format

```json
{
  "customerName": "Tax4US",
  "workflowName": "Tax4US WhatsApp Agent",
  "workflowDescription": "WhatsApp agent for Tax4US customer support",
  
  "agentName": "Tax4US Support Agent",
  "agentPersonality": "professional",
  "agentPurpose": "Help Tax4US customers with tax-related questions",
  "agentSystemMessage": "Custom system message...",
  "language": "English",
  
  "storeName": "fileSearchStores/tax4us-knowledge-base-xyz123",
  "knowledgeBaseDescription": "Search the Tax4US knowledge base...",
  
  "wahaSession": "tax4us",
  "wahaCredentialsId": "cred-id-here",
  
  "notificationPhone": "1234567890@s.whatsapp.net",
  
  "credentials": {
    "openAiApi": "cred-id-here",
    "wahaApi": "cred-id-here",
    "elevenLabsApi": "cred-id-here"
  }
}
```

## Example Usage

```javascript
const WorkflowGenerator = require('./generate-workflow');

const generator = new WorkflowGenerator();

const customerConfig = {
  customerName: 'Tax4US',
  workflowName: 'Tax4US WhatsApp Agent',
  agentName: 'Tax4US Support Agent',
  agentPersonality: 'professional',
  agentPurpose: 'Help Tax4US customers',
  storeName: 'fileSearchStores/tax4us-knowledge-base-xyz123',
  language: 'English'
};

const result = generator.generate('base-whatsapp-agent', customerConfig);

if (result.validation.valid) {
  generator.saveWorkflow(result.workflow, 'output/tax4us-workflow.json');
  console.log('✅ Workflow generated successfully!');
} else {
  console.error('❌ Validation failed:', result.validation.errors);
}
```

## Next Steps

1. **Save base template**: Export the Rensto Support Agent workflow and save it as a template
2. **Test generation**: Generate a test workflow with sample config
3. **Integrate with n8n MCP**: Add functionality to create workflows directly in n8n
4. **Add more templates**: Create templates for different workflow types
5. **Enhance customizers**: Add more customization options

## Files

- `workflow-template-loader.js` - Template loading and management
- `node-customizer.js` - Node customization logic
- `workflow-assembler.js` - Workflow assembly
- `workflow-validator.js` - Validation
- `generate-workflow.js` - Main generator
- `templates/` - Template storage directory
- `generated-workflows/` - Output directory (created automatically)

## Status

✅ Core components built
⏳ Base template needs to be saved
⏳ Integration with n8n MCP pending
⏳ Testing pending
