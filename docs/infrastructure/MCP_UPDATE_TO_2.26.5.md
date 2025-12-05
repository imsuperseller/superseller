# MCP Update to Version 2.26.5

**Date**: November 28, 2025  
**Action Required**: Update `~/.cursor/mcp.json` to use version 2.26.5

---

## ⚠️ HISTORICAL NOTE

**Status**: ⚠️ **OUTDATED** - This document references Docker configuration, but the current working solution uses **npx mode** (see `docs/infrastructure/MCP_CONFIGURATION.md`).

**Current Configuration** (npx mode):
- Uses `npx -y n8n-mcp` which automatically gets the latest version (currently 2.26.5)
- No Docker image tags needed
- No manual version updates required

**If using npx mode**: Version updates automatically when you restart Cursor (npx fetches latest)

---

## Version 2.26.5 Improvements

**Fixed in `cleanWorkflowForUpdate()`**:
- ✅ `versionCounter` - Now filtered
- ✅ `description` - Now filtered
- ⚠️ `activeVersion` - Still missing
- ⚠️ `activeVersionId` - Still missing
- ⚠️ `webhookId` - Still missing

**Note**: Version 2.26.5 has partial fix but still missing 3 fields. May need additional fix or newer version.

---

## After Update

1. Restart Cursor to load new MCP server
2. Test `n8n_update_partial_workflow` tool
3. If still fails, check if `activeVersion`, `activeVersionId`, `webhookId` need to be added

---

**Last Updated**: November 28, 2025

