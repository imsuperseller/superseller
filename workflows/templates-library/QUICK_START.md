# ⚡ QUICK START GUIDE

**Purpose**: Get started with templated workflows in 5 minutes
**Last Updated**: December 2025

---

## 🎯 FOR NEW CLIENT PROJECTS

### Step 1: Review Available Templates (2 min)

Read `CATALOG.md` to see what templates are available.

### Step 2: Import Utilities (3 min)

1. Import `00-utility-belt/util_error_handler.json`
2. Import `00-utility-belt/util_cost_calculator.json`
3. Import `00-utility-belt/util_human_approval.json`
4. Configure environment variables (see `00-utility-belt/README.md`)

### Step 3: Import Needed Templates (5 min)

Copy templates you need from:
- `01-growth-engine/` - Sales & outreach
- `02-content-factory/` - Marketing
- `03-operations-brain/` - Support

### Step 4: Configure & Test (10 min)

1. Set API credentials
2. Configure webhooks
3. Test in Draft mode
4. Publish when ready

**Total Time**: ~20 minutes

---

## 🔧 FOR EXISTING PROJECTS

### Adding Error Handling

1. Import `util_error_handler.json`
2. Add Error Trigger node to your workflow
3. Connect Error Trigger to `util_error_handler`
4. Configure Slack webhook
5. Publish

### Adding Cost Tracking

1. Import `util_cost_calculator.json`
2. After each LLM node, add HTTP Request node
3. Call `util_cost_calculator` webhook with token data
4. Configure Google Sheets or Airtable
5. Publish

### Adding Human Approval

1. Import `util_human_approval.json`
2. Before critical actions, call `util_human_approval`
3. Wait for approval response
4. Continue if approved, stop if rejected
5. Publish

---

## 📚 DOCUMENTATION MAP

| Need | Document |
|------|----------|
| **What templates exist?** | `CATALOG.md` |
| **How to use templates?** | `IMPLEMENTATION_GUIDE.md` |
| **Version updates?** | `VERSION_MANAGEMENT.md` |
| **Client setup?** | `04-client-projects/template-client-setup.md` |
| **Utility details?** | `00-utility-belt/README.md` |

---

## 🚨 COMMON ISSUES

**Workflow not executing?**
- Check if it's Published (not just Saved)
- Verify credentials are set
- Check environment variables

**Sub-workflow not found?**
- Ensure sub-workflow is Published
- Check workflow name is correct
- Verify both in same n8n instance

**Cost tracking not working?**
- Check `util_cost_calculator` is Published
- Verify Google Sheets/Airtable credentials
- Check input format matches expected

---

## 🎓 EXAMPLE: Sales Automation Setup

**Goal**: Set up sales automation for new client

**Steps**:
1. Import utilities (3 min)
2. Import `func_enrich_company` (1 min)
3. Import `func_scrape_linkedin_profile` (1 min)
4. Import `func_generate_icebreaker` (1 min)
5. Import `func_check_email_validity` (1 min)
6. Import `func_send_smart_email` (1 min)
7. Create `agent_sales_orchestrator` (5 min)
8. Configure all credentials (5 min)
9. Test (5 min)
10. Publish (1 min)

**Total**: ~24 minutes

---

## 📞 NEED HELP?

- **Detailed Guide**: See `IMPLEMENTATION_GUIDE.md`
- **Template Details**: See `CATALOG.md`
- **Version Info**: See `VERSION_MANAGEMENT.md`

---

**Ready to start?** Begin with `CATALOG.md` to see available templates!
