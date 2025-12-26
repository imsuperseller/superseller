# 🚀 TEMPLATE IMPLEMENTATION GUIDE

**Last Updated**: December 2025
**Purpose**: Step-by-step guide for using templated workflows in client projects

---

## 📖 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Client Project Setup](#client-project-setup)
3. [Using Templates](#using-templates)
4. [Customization Guidelines](#customization-guidelines)
5. [Version Management](#version-management)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 QUICK START

### For New Client Projects

1. **Read** this guide
2. **Review** `CATALOG.md` for available templates
3. **Import** utility workflows first (`00-utility-belt/`)
4. **Import** category templates as needed
5. **Customize** for client-specific requirements
6. **Test** in Draft mode
7. **Publish** when ready

---

## 🏗️ CLIENT PROJECT SETUP

### Step 1: Create Client Project Structure

For each new client, create this structure:

```
workflows/04-client-projects/[client-name]/
├── README.md (client-specific documentation)
├── 00-utilities/ (copies of utility workflows)
├── 01-growth-engine/ (sales templates)
├── 02-content-factory/ (marketing templates)
├── 03-operations-brain/ (support templates)
└── config.json (client configuration)
```

### Step 2: Import Utility Workflows

**Always start with utilities**:

1. Import `util_error_handler.json`
2. Import `util_cost_calculator.json`
3. Import `util_human_approval.json`
4. Configure environment variables (see `00-utility-belt/README.md`)

### Step 3: Configure Client Settings

Create `config.json`:

```json
{
  "clientId": "client-123",
  "clientName": "Acme Corp",
  "projectId": "project-456",
  "n8nInstance": "http://n8n.rensto.com",
  "integrations": {
    "slack": {
      "webhookUrl": "https://hooks.slack.com/..."
    },
    "airtable": {
      "baseId": "appXXXXX"
    },
    "openai": {
      "apiKey": "sk-..."
    }
  }
}
```

---

## 📦 USING TEMPLATES

### Method 1: Direct Import (Recommended)

1. **Copy** template JSON file
2. **Import** into n8n
3. **Rename** workflow (add client prefix)
4. **Configure** credentials and settings
5. **Test** in Draft mode
6. **Publish** when ready

**Example**:
```
Original: func_enrich_company.json
Client Copy: acme-func_enrich_company.json
```

### Method 2: Sub-Workflow Reference

For templates that will be used by multiple workflows:

1. **Import** template once
2. **Publish** it (not just Save)
3. **Reference** it from other workflows using Sub-Workflow node

**Benefits**:
- Single source of truth
- Updates propagate automatically
- Easier maintenance

### Method 3: AI Agent Orchestration

For complex workflows:

1. **Import** all needed `func_*` templates
2. **Publish** them
3. **Create** new `agent_*` workflow
4. **Use** AI Agent node to call functions
5. **Configure** agent instructions

**Example Agent Instructions**:
```
You are a sales automation agent. When given a company name:
1. Call func_enrich_company to get company data
2. Call func_scrape_linkedin_profile to get CEO info
3. Call func_generate_icebreaker to create personalized message
4. Call func_check_email_validity to validate email
5. Call func_send_smart_email to send message

Return the result of the email send operation.
```

---

## 🎨 CUSTOMIZATION GUIDELINES

### Standardized Input Format

**Always use this format** for sub-workflow inputs:

```json
{
  "action": "function_name",
  "payload": {
    // Function-specific data
  },
  "metadata": {
    "clientId": "client-123",
    "projectId": "project-456",
    "workflowId": "workflow-789",
    "source": "agent-name"
  }
}
```

### Why This Format?

1. **AI Agent Compatible**: AI Tool nodes work best with single JSON objects
2. **Consistent**: All templates use the same structure
3. **Extensible**: Easy to add metadata without breaking changes

### Customization Checklist

When customizing a template:

- [ ] Keep input format standardized
- [ ] Update client-specific settings (API keys, webhooks)
- [ ] Add client branding (if needed)
- [ ] Test with client data
- [ ] Document customizations in `README.md`
- [ ] Update error messages for client context

### What NOT to Customize

**Don't change**:
- Core function logic (unless fixing bugs)
- Input/output format (breaks compatibility)
- Error handling structure (use `util_error_handler`)
- Cost tracking structure (use `util_cost_calculator`)

**Do change**:
- API credentials
- Client-specific data mappings
- Business logic (if needed)
- Output formatting (for client needs)

---

## 🔄 VERSION MANAGEMENT

### n8n v2.0.1 Features

**Publish vs. Save**:
- **Save (Draft)**: For testing, not used by other workflows
- **Publish**: Production version, used by other workflows

**Best Practice**:
1. Make changes in Draft mode
2. Test thoroughly
3. Publish when ready
4. All referencing workflows automatically use new version

### Node Version Updates

**Before Starting New Projects**:

1. **Check** `05-version-updates/node-version-tracker.json`
2. **Review** `05-version-updates/n8n-v2.0.1-migration.md`
3. **Update** templates if new node versions available
4. **Test** updated templates
5. **Publish** updated versions

**Update Procedure** (see `VERSION_MANAGEMENT.md`):

1. **Phase 1**: Review new n8n version features
2. **Phase 2**: Test templates in Draft mode
3. **Phase 3**: Update node versions if needed
4. **Phase 4**: Publish updated templates
5. **Phase 5**: Update documentation

---

## 🧪 TESTING WORKFLOWS

### Testing Checklist

Before publishing any workflow:

- [ ] **Input Validation**: Test with valid and invalid inputs
- [ ] **Error Handling**: Trigger errors, verify `util_error_handler` works
- [ ] **Cost Tracking**: Verify `util_cost_calculator` logs correctly
- [ ] **Human Approval**: Test approval flow (if applicable)
- [ ] **Integration**: Test all external API calls
- [ ] **Performance**: Check execution time and costs

### Testing Tools

1. **n8n Test Mode**: Use "Execute Workflow" button
2. **Manual Webhooks**: Use Postman/curl to test webhooks
3. **Error Simulation**: Intentionally break things to test error handling

### Test Data

Create test data files:

```
workflows/04-client-projects/[client-name]/test-data/
├── valid-inputs.json
├── invalid-inputs.json
└── edge-cases.json
```

---

## 🔧 TROUBLESHOOTING

### Common Issues

**Issue**: Workflow not executing
- **Check**: Is workflow Published (not just Saved)?
- **Check**: Are credentials configured?
- **Check**: Are environment variables set?

**Issue**: Sub-workflow not found
- **Check**: Is sub-workflow Published?
- **Check**: Is workflow name correct?
- **Check**: Are both workflows in same n8n instance?

**Issue**: Cost tracking not working
- **Check**: Is `util_cost_calculator` Published?
- **Check**: Are Google Sheets/Airtable credentials set?
- **Check**: Is input format correct?

**Issue**: Error handler not receiving errors
- **Check**: Is Error Trigger connected?
- **Check**: Is `util_error_handler` Published?
- **Check**: Are Slack webhook URLs configured?

### Debug Mode

Enable debug logging:

1. Add Code node with:
```javascript
console.log('Debug:', JSON.stringify($input.all(), null, 2));
```

2. Check n8n execution logs
3. Check browser console (if using webhook)

---

## 📊 MONITORING & MAINTENANCE

### Weekly Tasks

- [ ] Review error logs (`util_error_handler` outputs)
- [ ] Check cost tracking (`util_cost_calculator` outputs)
- [ ] Review workflow execution times
- [ ] Check for failed executions

### Monthly Tasks

- [ ] Update pricing in `util_cost_calculator` (if changed)
- [ ] Review and archive old test workflows
- [ ] Update documentation
- [ ] Check for n8n version updates

### Quarterly Tasks

- [ ] Review all client workflows for optimization
- [ ] Update templates with new best practices
- [ ] Archive unused workflows
- [ ] Update this guide

---

## 📚 ADDITIONAL RESOURCES

- **Catalog**: `CATALOG.md` - Complete template inventory
- **Version Management**: `VERSION_MANAGEMENT.md` - Update procedures
- **Utility Belt**: `00-utility-belt/README.md` - Infrastructure workflows
- **n8n Documentation**: https://docs.n8n.io

---

## 🎓 EXAMPLE: Complete Client Setup

### Scenario: New Client "Acme Corp" Needs Sales Automation

**Step 1**: Create project structure
```
workflows/04-client-projects/acme-corp/
```

**Step 2**: Import utilities
- `util_error_handler` → `acme-util_error_handler`
- `util_cost_calculator` → `acme-util_cost_calculator`
- `util_human_approval` → `acme-util_human_approval`

**Step 3**: Import sales templates
- `func_enrich_company` → `acme-func_enrich_company`
- `func_scrape_linkedin_profile` → `acme-func_scrape_linkedin_profile`
- `func_generate_icebreaker` → `acme-func_generate_icebreaker`
- `func_check_email_validity` → `acme-func_check_email_validity`
- `func_send_smart_email` → `acme-func_send_smart_email`

**Step 4**: Create agent workflow
- `acme-agent_sales_orchestrator` (new workflow)
- Uses AI Agent node to call all `func_*` workflows

**Step 5**: Configure
- Set API keys
- Set webhook URLs
- Set client ID in all workflows

**Step 6**: Test
- Test each `func_*` workflow individually
- Test agent workflow end-to-end
- Verify error handling
- Verify cost tracking

**Step 7**: Publish
- Publish all workflows
- Activate agent workflow
- Monitor first executions

---

**Questions?** See `CATALOG.md` for template details or create an issue.
