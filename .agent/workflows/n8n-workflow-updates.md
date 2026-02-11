---
description: How to update n8n workflows via MCP with verification
---

# n8n Workflow Updates - RALPH-Style Verification Loop

When updating n8n workflows, follow this verification protocol:

## 1. Pre-Update
- Get current workflow state via `n8n_get_workflow`
- Identify the specific node(s) to modify
- Understand the expected input/output format

## 2. Apply Update
- Use `n8n_update_workflow` with the correct payload
- Verify update timestamp in response

## 3. Verify (DO NOT SKIP)
- Execute a test run via `n8n_execute_workflow` if possible
- Check for API errors in the response
- If errors occur, iterate - DO NOT declare success

## 4. Completion Criteria
Only mark complete when:
- [ ] Update applied successfully
- [ ] No API errors in response
- [ ] Test execution passes (if applicable)
- [ ] At least 2 verification loops completed

## Key Principle
> Do NOT declare "Done! ✅" prematurely. If an error occurs, iterate until actually fixed.
