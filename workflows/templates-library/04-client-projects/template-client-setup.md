# 📁 CLIENT PROJECT TEMPLATE SETUP

**Purpose**: Standard structure for new client projects
**Last Updated**: December 2025

---

## 🏗️ DIRECTORY STRUCTURE

For each new client, create this structure:

```
workflows/04-client-projects/[client-name]/
├── README.md                    # Client-specific documentation
├── config.json                  # Client configuration
├── 00-utilities/                # Utility workflow copies
│   ├── util_error_handler.json
│   ├── util_cost_calculator.json
│   └── util_human_approval.json
├── 01-growth-engine/            # Sales & outreach workflows
│   ├── func_enrich_company.json
│   ├── func_scrape_linkedin_profile.json
│   ├── func_generate_icebreaker.json
│   ├── func_check_email_validity.json
│   ├── func_send_smart_email.json
│   └── agent_sales_orchestrator.json
├── 02-content-factory/          # Marketing workflows
│   ├── func_transcribe_video.json
│   ├── func_repurpose_content.json
│   ├── func_image_generator.json
│   ├── func_auto_post_social.json
│   ├── func_seo_checker.json
│   └── agent_content_manager.json
├── 03-operations-brain/         # Support workflows
│   ├── func_rag_search_internal.json
│   ├── func_classify_ticket.json
│   ├── func_voice_synthesizer.json
│   ├── func_calendar_check.json
│   ├── func_pdf_parser.json
│   └── agent_support_triaging.json
└── test-data/                   # Test data files
    ├── valid-inputs.json
    ├── invalid-inputs.json
    └── edge-cases.json
```

---

## 📝 CLIENT README TEMPLATE

Create `README.md` for each client:

```markdown
# [CLIENT NAME] - n8n Workflows

**Client ID**: `client-XXX`
**Project ID**: `project-XXX`
**Created**: [Date]
**Last Updated**: [Date]

---

## 📋 PROJECT OVERVIEW

[Brief description of client project]

---

## 🔧 CONFIGURATION

See `config.json` for:
- API credentials
- Webhook URLs
- Integration settings

---

## 📦 WORKFLOWS

### Utilities
- `util_error_handler` - Error handling
- `util_cost_calculator` - Cost tracking
- `util_human_approval` - Human approval

### Growth Engine
[List of sales workflows]

### Content Factory
[List of marketing workflows]

### Operations Brain
[List of support workflows]

---

## 🚀 DEPLOYMENT

1. Import all workflows into n8n
2. Configure credentials
3. Set environment variables
4. Test in Draft mode
5. Publish when ready

---

## 📊 MONITORING

- Error logs: [Link]
- Cost tracking: [Link]
- Execution stats: [Link]

---

## 🔗 RELATED DOCUMENTATION

- [Client-specific docs]
- [Integration guides]
```

---

## ⚙️ CONFIG.JSON TEMPLATE

Create `config.json` for each client:

```json
{
  "clientId": "client-XXX",
  "clientName": "[Client Name]",
  "projectId": "project-XXX",
  "n8nInstance": "http://n8n.rensto.com",
  "created": "2025-12-06",
  "lastUpdated": "2025-12-06",
  "integrations": {
    "slack": {
      "webhookUrl": "https://hooks.slack.com/services/...",
      "channel": "#client-name"
    },
    "airtable": {
      "baseId": "appXXXXX",
      "apiKey": "patXXXXX"
    },
    "openai": {
      "apiKey": "sk-...",
      "model": "gpt-4o"
    },
    "anthropic": {
      "apiKey": "sk-ant-...",
      "model": "claude-3-5-sonnet"
    },
    "googleSheets": {
      "spreadsheetId": "...",
      "sheetName": "Cost Log"
    }
  },
  "settings": {
    "errorHandler": {
      "enabled": true,
      "slackChannel": "#alerts"
    },
    "costTracking": {
      "enabled": true,
      "logTo": "googleSheets"
    },
    "humanApproval": {
      "enabled": true,
      "timeout": 86400
    }
  }
}
```

---

## 🚀 QUICK SETUP GUIDE

### Step 1: Create Directory

```bash
mkdir -p workflows/04-client-projects/[client-name]/{00-utilities,01-growth-engine,02-content-factory,03-operations-brain,test-data}
```

### Step 2: Copy Templates

Copy needed templates from `templates-library/` to client directory.

### Step 3: Create Config

Create `config.json` with client-specific settings.

### Step 4: Create README

Create `README.md` with client documentation.

### Step 5: Import to n8n

1. Import all workflows
2. Rename with client prefix (e.g., `acme-func_enrich_company`)
3. Configure credentials
4. Test in Draft mode
5. Publish when ready

---

## 📊 BEST PRACTICES

1. **Always prefix workflows** with client name
2. **Document customizations** in README
3. **Keep config.json** in version control (without secrets)
4. **Store secrets** in n8n credentials manager
5. **Test thoroughly** before publishing
6. **Monitor** first executions closely

---

## 🔒 SECURITY

- **Never commit** API keys to Git
- **Use** n8n credentials manager
- **Store** secrets in environment variables
- **Rotate** keys regularly
- **Audit** access logs

---

**Next**: See `../IMPLEMENTATION_GUIDE.md` for detailed usage instructions.
