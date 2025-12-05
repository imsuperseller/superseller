# Workflow Generator Approach - Summary

**Date**: November 25, 2025  
**Status**: ✅ **APPROACH DECIDED**

---

## 🎯 DECISION: n8n Workflow Using MCP Tools

**Approach**: Build an **n8n workflow** that uses **MCP HTTP endpoint** to generate workflows automatically.

**Why This Approach**:
- ✅ No local file management needed
- ✅ Uses n8n's native MCP HTTP endpoint (1.122.0+)
- ✅ All logic in one place (n8n workflow)
- ✅ Can be triggered from AI consultation workflow
- ✅ Direct integration with n8n instance

---

## 📊 ARCHITECTURE

```
AI Voice Consultation Workflow
  ↓ (Execute Workflow)
Workflow Generator n8n Workflow
  ├─ Get Base Template (MCP: n8n_get_workflow)
  ├─ Customize Workflow (Code Node)
  ├─ Validate (MCP: n8n_validate_workflow)
  ├─ Create Workflow (MCP: n8n_create_workflow)
  ├─ Test (MCP: n8n_trigger_webhook_workflow)
  └─ Notify & Log
```

---

## 🔧 IMPLEMENTATION

**Workflow Name**: `INT-WORKFLOW-GENERATOR-001: Automated Workflow Generator`

**Key Nodes**:
1. **Execute Workflow Trigger** - Receives customer data
2. **Extract Customer Data** - Code node to parse data
3. **Get Base Template** - HTTP Request → MCP HTTP endpoint
4. **Customize Workflow** - Code node (logic from node-customizer.js)
5. **Validate Workflow** - HTTP Request → MCP HTTP endpoint
6. **Create Workflow** - HTTP Request → MCP HTTP endpoint
7. **Test Workflow** - HTTP Request → MCP HTTP endpoint
8. **Notify** - Send notification
9. **Log to Boost.space** - Record generation (Space 53: Operations)

**⚠️ NOTE**: HTTP endpoint returns 404. Use npx MCP tools directly instead. See `docs/infrastructure/MCP_CONFIGURATION.md`

**MCP Tools Used**:
- `n8n_get_workflow` - Export base template
- `n8n_validate_workflow` - Validate before creating
- `n8n_create_workflow` - Create new workflow
- `n8n_trigger_webhook_workflow` - Test workflow

---

## 📋 NEXT STEPS

1. ✅ Design workflow architecture (see `WORKFLOW_GENERATOR_WORKFLOW_DESIGN.md`)
2. ⏳ Create workflow in n8n
3. ⏳ Test MCP HTTP endpoint calls
4. ⏳ Port customization logic to Code node
5. ⏳ Connect to AI consultation workflow
6. ⏳ Test end-to-end

---

## 📝 NOTES

- **Node.js scripts** in `scripts/n8n-workflow-generator/` are kept for reference
- **Customization logic** will be ported from `node-customizer.js` to n8n Code node
- **No local template files needed** - use MCP `n8n_get_workflow` on-demand
- **Base template workflow ID**: `eQSCUFw91oXLxtvn` (Rensto Support Agent)

---

**Status**: Ready to implement  
**Estimated Time**: 4-6 hours  
**Priority**: High

