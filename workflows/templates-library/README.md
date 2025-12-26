# 🧩 N8N TEMPLATED WORKFLOW LIBRARY - SOA Architecture

**Last Updated**: December 2025
**Status**: ✅ Active Development
**Purpose**: Reusable workflow templates organized as microservices for client projects

---

## 🏗️ ARCHITECTURE: "The Agent & The Toolbox"

This system follows a **Service-Oriented Architecture (SOA)** where workflows are treated as **microservices**:

- **The Brain (Parent)**: AI Agent workflows that decide what to do
- **The Tools (Children)**: Small, focused workflows that do one thing perfectly

### Core Principles

1. **Standardized Inputs**: All sub-workflows accept a single JSON object
2. **Publish vs. Save**: Use n8n v2.0.1 "Publish" feature for production workflows
3. **Caching First**: Check cache before expensive API calls
4. **Error Handling**: Every workflow connects to `util_error_handler`
5. **Cost Tracking**: All LLM calls tracked via `util_cost_calculator`

---

## 📂 DIRECTORY STRUCTURE

```
workflows/templates-library/
├── README.md (this file)
├── CATALOG.md (master catalog of all templates)
├── VERSION_MANAGEMENT.md (node version tracking & updates)
├── IMPLEMENTATION_GUIDE.md (how to use templates)
│
├── 00-utility-belt/          # Infrastructure workflows (use in EVERY project)
│   ├── util_error_handler.json
│   ├── util_cost_calculator.json
│   ├── util_human_approval.json
│   └── README.md
│
├── 01-growth-engine/          # Sales & Outreach templates
│   ├── func_enrich_company.json
│   ├── func_scrape_linkedin_profile.json
│   ├── func_generate_icebreaker.json
│   ├── func_check_email_validity.json
│   ├── func_send_smart_email.json
│   ├── agent_sales_orchestrator.json (example parent)
│   └── README.md
│
├── 02-content-factory/        # Marketing & Content templates
│   ├── func_transcribe_video.json
│   ├── func_repurpose_content.json
│   ├── func_image_generator.json
│   ├── func_auto_post_social.json
│   ├── func_seo_checker.json
│   ├── agent_content_manager.json (example parent)
│   └── README.md
│
├── 03-operations-brain/       # Admin & Support templates
│   ├── func_rag_search_internal.json
│   ├── func_classify_ticket.json
│   ├── func_voice_synthesizer.json
│   ├── func_calendar_check.json
│   ├── func_pdf_parser.json
│   ├── agent_support_triaging.json (example parent)
│   └── README.md
│
├── 04-client-projects/        # Client-specific implementations
│   ├── template-client-setup.md
│   └── examples/
│       └── [client-name]/
│
└── 05-version-updates/        # Node version tracking & migration guides
    ├── n8n-v2.0.1-migration.md
    ├── node-version-tracker.json
    └── update-procedures.md
```

---

## 🎯 QUICK START

**New to this system?** Start with `QUICK_START.md` (5-minute guide)

### For New Client Projects

1. **Read** `QUICK_START.md` (5 min)
2. **Review** `CATALOG.md` for available templates
3. **Copy** needed templates from categories
4. **Customize** for client-specific needs
5. **Connect** to utility workflows (error handler, cost calculator)
6. **Publish** in n8n v2.0.1 (not just Save)

### For Workflow Updates

1. **Check** `VERSION_MANAGEMENT.md` for node version updates
2. **Review** `05-version-updates/` for migration guides
3. **Test** in Draft mode before Publishing
4. **Update** documentation

---

## 📋 TEMPLATE NAMING CONVENTION

All templates follow this pattern:

```
[type]_[function]_[optional-version].json
```

**Types**:
- `func_` - Function/sub-workflow (does one thing)
- `agent_` - AI Agent (orchestrates multiple functions)
- `util_` - Utility (infrastructure, used everywhere)

**Examples**:
- `func_enrich_company.json` - Enriches company data
- `agent_sales_orchestrator.json` - Sales automation agent
- `util_error_handler.json` - Error handling utility

---

## 🔄 VERSION MANAGEMENT

### n8n Version Tracking

- **Current**: n8n v2.0.1 (Community Edition)
- **Location**: `05-version-updates/n8n-v2.0.1-migration.md`
- **Node Versions**: Tracked in `05-version-updates/node-version-tracker.json`

### Update Procedure

1. **Phase 1**: Review new n8n version features
2. **Phase 2**: Test templates in Draft mode
3. **Phase 3**: Update node versions if needed
4. **Phase 4**: Publish updated templates
5. **Phase 5**: Update documentation

**See**: `VERSION_MANAGEMENT.md` for detailed procedures

---

## 🚀 BEST PRACTICES

### 1. Standardized Input Format

**❌ Bad**:
```json
{
  "email": "user@example.com",
  "subject": "Hello",
  "date": "2025-12-06"
}
```

**✅ Good**:
```json
{
  "action": "send_email",
  "payload": {
    "to": "user@example.com",
    "subject": "Hello",
    "body": "..."
  },
  "metadata": {
    "campaignId": "campaign-123",
    "source": "sales-agent"
  }
}
```

### 2. Caching Strategy

Always check cache before expensive operations:

```javascript
// Pseudo-code pattern
if (cache.exists(domain)) {
  return cache.get(domain); // $0.00 cost
} else {
  data = expensiveAPI.call(domain); // $0.05 cost
  cache.set(domain, data);
  return data;
}
```

### 3. Error Handling

Every workflow should have:
- Error Trigger → `util_error_handler`
- Proper error messages
- Retry logic where appropriate

### 4. Cost Tracking

All LLM nodes should:
- Track token usage
- Log to `util_cost_calculator`
- Include client/project ID for billing

---

## 📊 TEMPLATE STATUS

| Category | Templates | Status | Last Updated |
|----------|-----------|--------|--------------|
| Utility Belt | 3 | ✅ Complete | Dec 2025 |
| Growth Engine | 5 + 1 agent | 🚧 In Progress | Dec 2025 |
| Content Factory | 5 + 1 agent | 🚧 In Progress | Dec 2025 |
| Operations Brain | 5 + 1 agent | 🚧 In Progress | Dec 2025 |

---

## 🔗 RELATED DOCUMENTATION

- **n8n Workflow Naming**: `/docs/n8n/N8N_WORKFLOW_NAMING_AND_TAGGING_SYSTEM.md`
- **Boost.space Storage**: `/docs/n8n/BOOST_SPACE_WORKFLOW_STORAGE_GUIDE.md`
- **BMAD Process**: `/docs/BMAD_PROCESS_SPECIFIC.md`

---

## 📝 CONTRIBUTING

When adding new templates:

1. Follow naming convention
2. Use standardized input format
3. Include error handling
4. Add cost tracking
5. Document in `CATALOG.md`
6. Test before committing

---

**Questions?** See `IMPLEMENTATION_GUIDE.md` for detailed usage instructions.
