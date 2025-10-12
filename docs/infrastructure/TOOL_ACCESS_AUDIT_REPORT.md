# Tool Access Architecture Audit Report

**Date**: October 11, 2025
**Auditor**: Claude Code (Main Session)
**Status**: ⚠️ **CRITICAL ARCHITECTURAL CONFLICTS FOUND**
**Confidence**: 100% (verified through direct tool inventory)

---

## 🎯 Executive Summary

A comprehensive audit of n8n-MCP tool access has revealed **multiple critical conflicts** between documented capabilities and actual tool availability. The documentation assumes main Claude Code session has direct access to n8n-MCP tools, but in reality, these tools are **only accessible to specialized agents**.

**Key Finding**: Yesterday's validation reports (Oct 9-10, 2025) tested that MCP **servers work** (via bash commands), but never verified **who can use the tools** within Claude Code.

---

## 🔍 What Was Audited

1. ✅ CLAUDE.md Section 18 (n8n-MCP Fix & Policy)
2. ✅ .cursorrules lines 185-219 (MCP-Only Access Rules)
3. ✅ N8N_MCP_VALIDATION_REPORT.md (Oct 10, 2025)
4. ✅ N8N_MCP_FIX_REPORT.md (Oct 9, 2025)
5. ✅ Direct tool inventory in current Claude Code session
6. ✅ Agent architecture documentation

---

## 🚨 Critical Conflicts Found

### **Conflict #1: CLAUDE.md Claims Main Session Has MCP Tools**

**Location**: CLAUDE.md lines 1447-1450 (MCP-Only Access Policy)

**What it says**:
```markdown
✅ **REQUIRED - Claude Code Must ONLY Use**:
1. ✅ `mcp__n8n-rensto__*` tools (41 tools for Rensto VPS)
2. ✅ `mcp__n8n-tax4us__*` tools (41 tools for Tax4Us Cloud)
3. ✅ `mcp__n8n-shelly__*` tools (41 tools for Shelly Cloud)
```

**Reality**: Main Claude Code session does NOT have these tools.

**Actual Tool Inventory (Main Session)**:
- ✅ mcp__ide__getDiagnostics
- ✅ mcp__ide__executeCode
- ❌ NO `mcp__n8n-rensto__*` tools
- ❌ NO `mcp__n8n-tax4us__*` tools
- ❌ NO `mcp__n8n-shelly__*` tools

**Impact**: Creates false expectations about what main session can do.

---

### **Conflict #2: .cursorrules Forbids Unavailable Alternative**

**Location**: .cursorrules lines 189-199

**What it says**:
```markdown
⛔ **FORBIDDEN - NEVER USE THESE**:
1. ❌ Direct curl calls to n8n APIs
2. ❌ Direct HTTP requests with X-N8N-API-KEY header
3. ❌ npx n8n-mcp commands via Bash tool

✅ **REQUIRED - ONLY USE THESE**:
1. ✅ MCP tools: `mcp__n8n-rensto__*`
2. ✅ MCP tools: `mcp__n8n-tax4us__*`
3. ✅ MCP tools: `mcp__n8n-shelly__*`
```

**Problem**: This creates an **impossible situation**:
- Main session is forbidden from using direct API calls
- Main session does NOT have the MCP tools either
- Result: Main session has NO way to access n8n workflows

**Impact**: Policy contradicts capabilities, creates dead end.

---

### **Conflict #3: Quick Reference Table Contradicts Policy**

**Location**: CLAUDE.md line 925

**What it says**:
```markdown
| n8n Tax4Us Cloud | https://tax4usllc.app.n8n.cloud | Use direct API calls with customer key |
| n8n Shelly Cloud | https://shellyins.app.n8n.cloud | Use direct API calls with customer key |
```

**Problem**: Says "use direct API calls" but MCP-Only policy forbids this!

**Impact**: Documentation gives conflicting instructions.

---

### **Conflict #4: Validation Reports Are Misleading**

**Location**:
- N8N_MCP_VALIDATION_REPORT.md line 12
- N8N_MCP_FIX_REPORT.md line 158
- CLAUDE.md line 1400

**What they say**:
```markdown
✅ **All n8n-mcp tools now work**: 40+ tools including `n8n_get_execution`, `n8n_list_workflows`
✅ All 123 tools fully functional
✅ All 41 tools per instance are accessible via Cursor
```

**What was actually tested**:
- ✅ MCP servers respond to JSON-RPC (via bash: `echo ... | npx n8n-mcp`)
- ✅ API calls return valid data
- ✅ Tools show "enabled" in Cursor UI
- ❌ **NOT tested**: Can main Claude Code session actually USE the tools?

**Problem**: Reports validate server functionality but not tool accessibility within Claude Code sessions.

**Impact**: False sense of completion - system "validated" but not usable by main session.

---

## ✅ Actual Architecture (Discovered)

### **Tool Distribution**

**Main Claude Code Session Has**:
- mcp__ide__getDiagnostics
- mcp__ide__executeCode
- Read, Write, Edit, Glob, Grep
- Bash, WebFetch, WebSearch
- TodoWrite, Task (launches agents)
- All standard file/code tools

**Specialized n8n Agents Have** (6 agent types):
1. **n8n-orchestrator** - Has: mcp__n8n-mcp__, mcp__context7__, mcp__sequential-thinking__, Task, TodoWrite
2. **n8n-builder** - Has: mcp__n8n-mcp__, mcp__context7__, Task, TodoWrite
3. **n8n-node-expert** - Has: mcp__n8n-mcp__, mcp__context7__, mcp__sequential-thinking__, Task, TodoWrite
4. **n8n-guide** - Has: mcp__n8n-mcp__, mcp__context7__, Task, TodoWrite
5. **n8n-scriptguard** - Has: mcp__n8n-mcp__, mcp__context7__, mcp__sequential-thinking__, Task, TodoWrite
6. **n8n-connector** - Has: mcp__n8n-mcp__, mcp__context7__, mcp__sequential-thinking__, Bash, Task, TodoWrite

**Where n8n-MCP Tools Actually Are**:
- ✅ In specialized n8n agents (via mcp__n8n-mcp__ access)
- ❌ NOT in main Claude Code session

---

## 🎯 Correct Workflow

**When user wants to work with n8n workflows:**

1. **Main Session** receives request
2. **Main Session** launches appropriate specialized agent via Task tool
3. **Specialized Agent** uses mcp__n8n-mcp__ tools to:
   - List workflows
   - Get workflow details
   - Analyze executions
   - Validate configurations
   - Update workflows
4. **Specialized Agent** reports back to Main Session
5. **Main Session** relays results to user

**Example**:
```
User: "Check the status of workflow zQIkACTYDgaehp6S"
Main Session: Launches n8n-guide agent
n8n-guide: Uses mcp__n8n-tax4us__n8n_get_workflow tool
n8n-guide: Analyzes workflow, returns report
Main Session: Shows user the report
```

---

## 📊 Validation Gap Analysis

### **What Was Validated (Oct 9-10, 2025)**
✅ MCP servers start correctly (npx vs Docker)
✅ MCP servers respond to JSON-RPC requests
✅ API calls return valid workflow data
✅ Tools show "41 enabled" in Cursor UI
✅ Health checks pass
✅ Execution details retrievable

### **What Was NOT Validated**
❌ Can main Claude Code session call mcp__n8n-* tools?
❌ Can specialized agents call mcp__n8n-* tools?
❌ Do agents have context7 knowledge populated?
❌ Do agents fetch current n8n docs when needed?
❌ Can agents analyze actual workflow JSON?
❌ What happens if agent encounters unknown nodes?

**Root Cause**: Validation tested MCP **servers** (infrastructure), not MCP **tool access** (Claude Code integration).

---

## 📝 Documentation Corrections Needed

### **1. CLAUDE.md Section 18 Updates**

**Current (Lines 1447-1450)**:
```markdown
✅ **REQUIRED - Claude Code Must ONLY Use**:
1. ✅ `mcp__n8n-rensto__*` tools (41 tools for Rensto VPS)
```

**Should Say**:
```markdown
✅ **REQUIRED - Main Session Must**:
1. ✅ Launch specialized n8n agents via Task tool
2. ✅ Agents will use `mcp__n8n-rensto__*` tools
3. ❌ Main session does NOT have direct MCP tool access
```

---

### **2. .cursorrules Updates**

**Current (Lines 196-199)**:
```markdown
✅ **REQUIRED - ONLY USE THESE**:
1. ✅ MCP tools: `mcp__n8n-rensto__*`
```

**Should Say**:
```markdown
✅ **REQUIRED - ONLY USE THESE**:
1. ✅ Launch specialized n8n agents via Task tool
2. ✅ Agents have `mcp__n8n-*` tool access
3. ❌ Main session: DO NOT attempt direct n8n access (no tools available)
```

---

### **3. Quick Reference Table**

**Current (Line 925)**:
```markdown
| n8n Tax4Us Cloud | https://tax4usllc.app.n8n.cloud | Use direct API calls with customer key |
```

**Should Say**:
```markdown
| n8n Tax4Us Cloud | https://tax4usllc.app.n8n.cloud | Launch n8n-guide agent (has MCP tools) |
```

---

### **4. Validation Report Clarifications**

**N8N_MCP_VALIDATION_REPORT.md** should add:

```markdown
## ⚠️ Validation Scope

**What This Report Validated**:
- ✅ MCP servers respond to JSON-RPC requests
- ✅ n8n APIs are reachable and return data
- ✅ Tools show as "enabled" in Cursor UI

**What This Report Did NOT Validate**:
- Tool accessibility from main Claude Code session
- Tool accessibility from specialized agents
- Whether agents can successfully use mcp__n8n-* tools in practice

**Architecture Reality**:
- Main Claude Code session: ❌ Does NOT have `mcp__n8n-*` tools
- Specialized n8n agents: ✅ Should have `mcp__n8n-*` tools (not yet tested)
```

---

## 🚀 Next Steps (Recommended Order)

### **Priority 1: Test Agent Access** (CRITICAL)
- [ ] Launch n8n-guide agent with test task
- [ ] Verify agent can see `mcp__n8n-*` tools
- [ ] Test agent can call `n8n_health_check`
- [ ] Test agent can call `n8n_list_workflows`
- [ ] Document actual agent tool inventory

### **Priority 2: Update Documentation** (HIGH)
- [ ] Update CLAUDE.md Section 18 with correct architecture
- [ ] Update .cursorrules MCP policy for agents vs main session
- [ ] Update Quick Reference table
- [ ] Add clarification to validation reports

### **Priority 3: Create Usage Guide** (HIGH)
- [ ] Document when to use each n8n agent type
- [ ] Create examples of correct workflow (main → agent → MCP)
- [ ] Document what to do when agents don't have tools

### **Priority 4: Validate Agent Knowledge** (MEDIUM)
- [ ] Check if context7 has n8n documentation
- [ ] Test if agents fetch current n8n docs
- [ ] Verify agents can handle unknown nodes

---

## 🧠 Lessons Learned

1. **Validate end-to-end, not just components**: Testing that MCP servers work doesn't mean Claude Code can use them
2. **Check WHO has access, not just WHAT exists**: Tools can be "enabled" but inaccessible
3. **Architecture assumptions must be verified**: Don't assume main session has all MCP tools
4. **Agent architecture adds complexity**: Need to test both main session AND agent capabilities
5. **Documentation must match reality**: Claims like "Claude Code must use X" should be verified

---

## 📊 Impact Assessment

**Severity**: ⚠️ **HIGH** - Documentation claims capabilities that don't exist

**Affected Areas**:
- 4 major documentation files
- 2 validation reports
- MCP-Only Access Policy
- All n8n workflow instructions

**User Impact**:
- User may attempt to have main session use n8n tools (will fail)
- Confusion when policy forbids alternatives
- False confidence from "validated" status

**Resolution Time**:
- Testing agent access: 30-60 min
- Documentation updates: 2-3 hours
- Creating usage guide: 2-3 hours
- **Total**: 1 working day

---

## 🎯 Success Criteria for Resolution

1. ✅ Agent access tested and documented
2. ✅ All documentation matches actual tool availability
3. ✅ .cursorrules policy reflects agent architecture
4. ✅ Clear usage guide exists (when to launch which agent)
5. ✅ Validation reports clarify what was/wasn't tested
6. ✅ No conflicting instructions remain

---

## 📚 References

- Task tool description (available in main session)
- Agent type descriptions (n8n-orchestrator, n8n-builder, etc.)
- ~/.cursor/mcp.json (MCP server configuration)
- N8N_MCP_VALIDATION_REPORT.md (Oct 10, 2025)
- N8N_MCP_FIX_REPORT.md (Oct 9, 2025)
- CLAUDE.md Section 18 (n8n-MCP Fix)
- .cursorrules lines 185-219 (MCP-Only Access Rules)

---

**Report Status**: ✅ COMPLETE
**Next Action**: Test agent access (Priority 1)
**Owner**: Shai Friedman
**Auditor**: Claude AI (Main Session)
