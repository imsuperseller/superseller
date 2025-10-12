# MCP Conflict Cleanup Archive - October 11, 2025

**Date Archived**: October 11, 2025
**Reason**: Conflicting documentation from failed MCP fix attempts
**Investigation Report**: `/docs/infrastructure/N8N_WORKFLOW_CREATION_CONFLICTS_REPORT.md`

---

## Why These Documents Were Archived

A comprehensive investigation revealed **6 separate MCP fix attempts** between January and October 2025, each claiming success but none validating that tools were actually accessible to Claude Code sessions or agents.

**Root Cause**: All fixes validated that MCP servers responded to JSON-RPC calls (infrastructure testing) but never tested whether Claude Code could actually use the tools (integration testing).

**Result**: Multiple conflicting "authoritative" documents with incompatible guidance.

---

## Archived Documents

### 1. N8N_SINGLE_SOURCE_OF_TRUTH.md
**Date**: January 26, 2025
**Claimed Authority**: "THE ONLY PLACE TO GO FOR ALL n8n CREATION PROCESS"
**Problem**: Contains invalid MCP configuration using `docker exec` (not how MCP servers work)
**Invalid Config**:
```json
{
  "n8n-mcp": {
    "command": "docker",
    "args": ["exec", "n8n_rensto", "n8n", "execute", "workflow"]
  }
}
```
**Why Archived**: Configuration is fundamentally broken, would prevent MCP setup if followed

---

### 2. N8N_DOCUMENTATION_CLEANUP.md
**Date**: January 26, 2025
**Claimed Authority**: "SINGLE SOURCE OF TRUTH CONFIRMED"
**Problem**: Reinforces false authority of N8N_SINGLE_SOURCE_OF_TRUTH.md
**Why Archived**: Validates a document with invalid configuration

---

### 3. MCP_INVESTIGATION_REPORT.md
**Date**: October 9, 2025, 12:15 AM
**Conclusion**: "Use direct API calls (already working perfectly)"
**Recommendation**: "Continue with Direct API (Current Approach) ✅ RECOMMENDED"
**Problem**: Contradicts .cursorrules policy added later that FORBIDS direct API calls
**Why Archived**: Recommends approach that later policy explicitly forbids

---

### 4. MCP_CLEANUP_COMPLETED.md
**Date**: October 9, 2025, 12:24 AM
**Approach**: Remove all MCP servers except n8n-mcp (reduce from 14 to 1)
**Status**: "CLEANUP COMPLETE ✅"
**Problem**: Never tested if tools appeared after Cursor restart (incomplete validation)
**Why Archived**: Claimed completion without testing integration

---

### 5. n8n-multi-instance-manager/ (directory)
**Date**: October 8-9, 2025
**Status**: Already archived as "n8n-multi-instance-manager-FAILED-2025-10-09"
**Approach**: Instance switching system with MCP configuration updates
**Problem**: Never tested if tools were accessible after switching
**Why Failed**: System could update configs but couldn't verify tool access
**Note**: Already in `/infra/archive/`, documenting here for completeness

---

## What Replaced These Documents

**Current Authority**:
- **CLAUDE.md Section 18** - Updated October 11, 2025 to reflect actual tool accessibility
- **WORKFLOW_CREATION_GUIDE.md** - Created October 11, 2025 with correct architecture
- **TOOL_ACCESS_AUDIT_REPORT.md** - Created October 11, 2025 documenting reality
- **N8N_WORKFLOW_CREATION_CONFLICTS_REPORT.md** - Full investigation findings

---

## Lessons Learned

1. **Validate Integration, Not Just Infrastructure**
   - Testing that MCP servers run ≠ testing that tools are callable
   - Always test end-to-end from user's perspective

2. **One Source of Truth**
   - Only CLAUDE.md can claim "single source of truth" status
   - All other docs are reference material only

3. **Don't Document Before Validating**
   - Each "fix" created documentation claiming success before testing
   - Led to cascade of false confidence

4. **Archive Conflicting Docs**
   - When new approach succeeds, archive old conflicting docs
   - Don't leave multiple "authoritative" sources

5. **Test What Matters**
   - Infrastructure tests: "Does server respond?" ✅
   - Integration tests: "Can users use it?" ❌ (was never tested)
   - Integration tests are what matters

---

## Current Status (October 11, 2025)

**Tool Accessibility**:
- Main Claude Code session: 0 `mcp__n8n-*` tools ❌
- Specialized n8n agents: 0 tools ❌
- MCP servers: Running and responding ✅
- Gap: Tools exist but aren't accessible to sessions/agents

**Working Methods** (Interim):
- Manual workflow import via n8n UI ✅
- Node.js scripts (fix-workflow.cjs pattern) ✅
- Direct API calls (with explicit approval) ⚠️

**Blocked Methods**:
- MCP tools (main session) ❌
- Specialized agents ❌
- Multi-instance switching ❌

---

## If You're Reading This Later

If MCP tool access has been fixed and you're wondering why these documents were archived:

**They weren't wrong in isolation** - each represented a genuine attempt to solve the problem. They were archived because:

1. **They conflict with each other** (7 different methods documented)
2. **They claim authority incorrectly** (competing "single source of truth" claims)
3. **They recommend forbidden approaches** (some say "use API", rules say "never use API")
4. **They contain invalid configurations** (Docker exec approach)
5. **They claim completion prematurely** (validated infrastructure, not integration)

The correct approach is now documented in CLAUDE.md (the actual single source of truth) and specialized subdomain documentation.

---

**Archive Created By**: Claude Code (Main Session)
**Investigation Duration**: 3 hours
**Files Analyzed**: 150+ documents
**Conflicts Found**: 11 critical
**Fix Attempts Found**: 6 (spanning 9 months)
