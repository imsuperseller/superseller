# 📁 File Organization Guide

## Overview
This document describes the standardized file organization structure for the Rensto codebase.

## Directory Structure

### 📚 docs/
- **ai-agents/**: AI agent documentation
- **technical/**: Technical documentation
- **business/**: Business documentation
- **deployment/**: Deployment guides
- **troubleshooting/**: Troubleshooting guides

### 🔧 scripts/
- **agents/**: AI agent scripts
- **deployment/**: Deployment scripts
- **maintenance/**: Maintenance scripts
- **testing/**: Testing scripts
- **management/**: Management scripts

### 💾 data/
- **customers/**: Customer data
- **system/**: System data
- **backups/**: Backup files
- **exports/**: Export files
- **archived-files/**: Archived files

### 🔄 workflows/
- **templates/**: Workflow templates
- **agents/**: Agent workflows
- **integrations/**: Integration workflows

### 🏗️ infra/
- **mcp-servers/**: MCP server configurations
- **n8n-workflows/**: n8n workflow configurations
- **systemd/**: System service configurations

## File Naming Conventions

### Scripts
- Use kebab-case: `deploy-to-production.js`
- Include purpose in name: `customer-success-agent.js`
- Add version suffix if needed: `backup-v2.js`

### Documentation
- Use Title Case: `AI Agent Ecosystem.md`
- Include category prefix: `technical/API Reference.md`
- Use descriptive names: `Customer Onboarding Guide.md`

### Configuration
- Use standard names: `package.json`, `tsconfig.json`
- Include environment suffix: `.env.production`
- Use descriptive names for custom configs

## Best Practices

1. **Single Source of Truth**: Each topic should have one authoritative file
2. **Clear Organization**: Group related files in appropriate directories
3. **Descriptive Names**: Use names that clearly indicate purpose
4. **Consistent Structure**: Follow established patterns
5. **Documentation**: Keep documentation up to date

## Migration Notes

- Old files are archived in `data/archived-files/`
- Duplicate files have been resolved
- Configuration conflicts have been addressed
- Documentation has been updated to reflect new structure

Last Updated: 2025-08-18T21:06:47.019Z
