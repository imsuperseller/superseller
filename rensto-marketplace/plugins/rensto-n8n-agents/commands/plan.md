# Plan Command

## Purpose
Plan and design n8n workflows for Rensto automation needs.

## Usage
```
/plan [workflow-type] [customer] [requirements]
```

## Parameters
- **workflow-type**: Type of workflow (lead-gen, content, integration, etc.)
- **customer**: Customer name or "internal" for Rensto workflows
- **requirements**: Specific requirements and constraints

## Examples
```
/plan lead-gen tax4us "LinkedIn scraping with Airtable storage"
/plan content internal "AI blog post generation with WordPress publishing"
/plan integration shelly "Stripe webhook to Slack notifications"
```

## Process
1. **Requirements Analysis**: Understand the automation needs
2. **Architecture Design**: Create workflow blueprint
3. **Node Selection**: Choose optimal n8n nodes
4. **Connection Planning**: Design data flow between nodes
5. **Error Handling**: Plan comprehensive error handling
6. **Testing Strategy**: Define validation approach

## Output
- **Workflow Blueprint**: Visual representation of the workflow
- **Node Configuration**: Detailed settings for each node
- **Implementation Plan**: Step-by-step build instructions
- **Testing Strategy**: How to validate the workflow
- **Documentation**: Maintenance and troubleshooting guide
