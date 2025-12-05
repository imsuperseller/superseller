# n8n Workflow Creation Guide
## The CORRECT and ONLY Method for Working with n8n Workflows

**Last Updated**: October 11, 2025
**Status**: ✅ VERIFIED ARCHITECTURE
**Audience**: Claude Code (Main Session), Future Developers

---

## 🎯 Core Principle

**Main Claude Code session DOES NOT have direct access to n8n-MCP tools.**

All n8n workflow operations MUST go through specialized agents that have the proper tool access.

---

## 📋 Quick Decision Tree

### "I need to work with an n8n workflow. What do I do?"

```
┌─────────────────────────────────────────────────────┐
│ STEP 1: What kind of n8n work do you need?         │
└─────────────────────────────────────────────────────┘
                        ↓
         ┌──────────────┴──────────────┐
         │                              │
    Investigate/                   Build/Create
    Analyze Existing              New Workflow
    Workflow?                     ?
         │                              │
         ↓                              ↓
┌─────────────────┐           ┌──────────────────┐
│ Launch:         │           │ Launch:          │
│ n8n-guide       │           │ n8n-builder      │
│                 │           │                  │
│ OR              │           │ OR               │
│ n8n-orchestrator│           │ n8n-orchestrator │
└─────────────────┘           └──────────────────┘
```

### Decision Matrix

| Task | Agent to Launch | Why |
|------|----------------|-----|
| **Investigate workflow issue** | n8n-guide | Has MCP tools + documentation access |
| **Analyze execution errors** | n8n-guide | Can fetch execution details + recommend fixes |
| **Validate workflow structure** | n8n-node-expert | 525+ node knowledge + MCP tools |
| **Build new workflow** | n8n-builder | Code generation + templates + MCP tools |
| **Optimize existing workflow** | n8n-scriptguard | JavaScript validation + MCP tools |
| **Fix connection issues** | n8n-connector | Authentication + API troubleshooting + MCP tools |
| **Complex multi-workflow project** | n8n-orchestrator | Coordinates other agents + MCP tools |

---

## 🚫 NEVER Do This (Main Session)

### ❌ Attempt #1: Try to Use MCP Tools Directly
```
Main Session: "Let me check this workflow"
Main Session: Attempts to use `mcp__n8n-tax4us__n8n_get_workflow`
Result: ❌ FAILS - Tool not found
```

**Why This Fails**: Main session doesn't have `mcp__n8n-*` tools.

---

### ❌ Attempt #2: Try to Use Direct API Calls
```
Main Session: "I'll just curl the n8n API"
Main Session: Bash("curl https://tax4usllc.app.n8n.cloud/api/v1/workflows ...")
Result: ❌ BLOCKED by .cursorrules policy
```

**Why This Fails**: MCP-Only Access Policy forbids direct API calls.

---

### ❌ Attempt #3: Try to Use npx n8n-mcp via Bash
```
Main Session: "I'll run npx n8n-mcp via bash"
Main Session: Bash("npx n8n-mcp n8n_list_workflows")
Result: ❌ BLOCKED by .cursorrules policy
```

**Why This Fails**: Policy forbids bypassing MCP tools via command line.

---

## ✅ ALWAYS Do This (Correct Method)

### ✅ Step 1: Identify the Right Agent

**Quick Reference**:
- Simple investigation → **n8n-guide**
- Complex coordination → **n8n-orchestrator**
- New workflow build → **n8n-builder**
- Node expertise needed → **n8n-node-expert**
- JavaScript issues → **n8n-scriptguard**
- Auth/connection problems → **n8n-connector**

---

### ✅ Step 2: Launch the Agent via Task Tool

**Template**:
```
Main Session uses Task tool:
{
  "subagent_type": "n8n-guide",
  "description": "Analyze Tax4Us workflow",
  "prompt": "Analyze workflow zQIkACTYDgaehp6S in Tax4Us Cloud instance.

             1. Fetch the current workflow JSON from n8n-tax4us instance
             2. Identify what nodes are being used
             3. Check recent execution history
             4. If you encounter unknown nodes, fetch docs from docs.n8n.io
             5. Report on workflow health and any issues found"
}
```

---

### ✅ Step 3: Agent Does the Work

**What the Agent Has**:
- ✅ `mcp__n8n-mcp__*` tools (can access all 3 n8n instances)
- ✅ `mcp__context7__*` tools (knowledge retrieval)
- ✅ `mcp__sequential-thinking__*` tools (complex reasoning)
- ✅ WebFetch/WebSearch (can fetch current n8n docs)
- ✅ Read (can read workflow JSON files if provided)

**What the Agent Does**:
1. Uses `mcp__n8n-tax4us__n8n_get_workflow` to fetch workflow
2. Analyzes the JSON structure
3. If needed, uses `mcp__n8n-tax4us__n8n_list_executions` to check history
4. If needed, uses WebFetch to get current node documentation
5. Compiles findings into a report
6. Returns report to main session

---

### ✅ Step 4: Main Session Relays Results

**What Main Session Does**:
- Receives agent's final report
- Summarizes key findings for user
- Asks user if further action needed
- If yes, launches another agent task or same agent with new instructions

---

## 📖 Detailed Examples

### Example 1: Investigate Why Workflow Failed

**User Request**:
> "Check why workflow zQIkACTYDgaehp6S failed on Tax4Us"

**Main Session Response**:
```
I'll launch the n8n-guide agent to investigate this for you.
```

**Main Session Action**:
```javascript
Task({
  subagent_type: "n8n-guide",
  description: "Investigate Tax4Us workflow failure",
  prompt: `Investigate workflow zQIkACTYDgaehp6S on Tax4Us Cloud instance (https://tax4usllc.app.n8n.cloud).

1. First, fetch the workflow details using n8n_get_workflow
2. Check recent executions using n8n_list_executions (last 5)
3. For any failed executions, get full details using n8n_get_execution
4. Analyze what nodes failed and why
5. If you encounter nodes you're unfamiliar with, fetch their documentation from docs.n8n.io
6. Provide a clear report with:
   - What failed
   - Which node(s) caused the failure
   - Why it failed (error messages, configuration issues, etc.)
   - Recommended fixes

Use the actual workflow configuration as your source of truth.`
})
```

**Agent Response** (returned to main session):
```
## Workflow Investigation Report

**Workflow**: Blog Master - AI Content Pipeline (zQIkACTYDgaehp6S)
**Status**: Active
**Last Execution**: Oct 10, 2025 03:46 AM - SUCCESS (but content rejected)

### What Happened
The workflow executed successfully but the content was REJECTED at the IF node.

### Root Cause
- The record had Status: "Rejected" and shouldDraft: false
- IF node correctly filtered it out
- This is expected behavior, not a failure

### Node Analysis
- Boost.space Trigger: ✅ Working (via HTTP Request node)
- IF: Should Process?: ✅ Working (correctly rejected invalid content)
- Slack: Notify Rejection: ✅ Working

### Recommendation
This is not a failure. The workflow is correctly rejecting invalid test records.
If you want to process content, ensure records have Status: "Draft" and shouldDraft: true.
```

**Main Session to User**:
```
The n8n-guide agent has completed the investigation. The workflow is working correctly -
it's rejecting test records as designed. Here's the full report:
[shows report above]
```

---

### Example 2: Build New Workflow

**User Request**:
> "Create a workflow that sends daily email summaries of new Boost.space records"

**Main Session Response**:
```
I'll launch the n8n-builder agent to create this workflow.
```

**Main Session Action**:
```javascript
Task({
  subagent_type: "n8n-builder",
  description: "Build daily email summary workflow",
  prompt: `Build a new n8n workflow for the Rensto VPS instance (http://173.254.201.134:5678) that:

1. Triggers daily at 9am
2. Queries Boost.space for records created in last 24 hours
3. Formats data into an email
4. Sends email summary

Steps:
1. First, use n8n_list_workflows to see what similar workflows exist
2. Design the workflow structure (which nodes to use)
3. Use n8n_create_workflow to build it
4. Use n8n_validate_workflow to check for errors
5. Provide the workflow ID and activation instructions

If you're unsure about specific nodes, fetch documentation from docs.n8n.io.

Return:
- Workflow ID
- Full JSON configuration
- Activation command
- Testing instructions`
})
```

---

### Example 3: Fix Complex Multi-Workflow Issue

**User Request**:
> "Tax4Us has 4 workflows that need to work together but some are failing. Can you fix them?"

**Main Session Response**:
```
This requires coordinating analysis across multiple workflows. I'll launch the n8n-orchestrator agent.
```

**Main Session Action**:
```javascript
Task({
  subagent_type: "n8n-orchestrator",
  description: "Fix Tax4Us multi-workflow system",
  prompt: `You are coordinating a fix for Tax4Us Cloud's 4-workflow system:

1. Blog Master (zQIkACTYDgaehp6S)
2. WordPress Pages (3HrunP4OmMNNdNq7)
3. Social Media (GpFjZNtkwh1prsLT)
4. Podcast Pipeline (GGDoM591l7Pg2fST)

Your task:
1. Fetch all 4 workflows using n8n_get_workflow
2. Map dependencies between them (what triggers what)
3. Check recent executions for each using n8n_list_executions
4. Identify failures and their root causes
5. Prioritize fixes (which workflow to fix first based on dependencies)
6. For each fix needed:
   - Validate workflow structure
   - Check if nodes are up-to-date
   - Recommend specific changes
7. Create a deployment plan (order to activate fixes)

Provide:
- Dependency map
- List of issues found (prioritized)
- Detailed fix recommendations
- Deployment order
- Testing strategy`
})
```

---

## 🧪 Agent Testing Protocol

**Before relying on agents, they should be tested**:

### Test 1: Verify Agent Has Tools
```javascript
Task({
  subagent_type: "n8n-guide",
  description: "Test n8n-guide tool access",
  prompt: "List all tools you have access to. Specifically, do you see:
  - mcp__n8n-rensto__* tools?
  - mcp__n8n-tax4us__* tools?
  - mcp__n8n-shelly__* tools?
  - mcp__context7__* tools?

  Report exactly what tools you can see."
})
```

### Test 2: Verify Agent Can Call MCP Tools
```javascript
Task({
  subagent_type: "n8n-guide",
  description: "Test MCP tool functionality",
  prompt: "Test that your n8n-MCP tools work:
  1. Call mcp__n8n-tax4us__n8n_health_check
  2. Call mcp__n8n-tax4us__n8n_list_workflows (limit 3)
  3. Report what you received from each call

  If any call fails, explain exactly what error you got."
})
```

### Test 3: Verify Agent Can Analyze Workflow
```javascript
Task({
  subagent_type: "n8n-guide",
  description: "Test workflow analysis",
  prompt: "Analyze workflow zQIkACTYDgaehp6S in Tax4Us Cloud:
  1. Fetch the workflow JSON
  2. List all nodes used
  3. Describe what the workflow does
  4. Check if there are any obvious issues

  Use the actual workflow data from n8n, not assumptions."
})
```

---

## 📊 Agent vs Main Session Capabilities

| Capability | Main Session | n8n Agents |
|-----------|--------------|------------|
| **n8n-MCP Tools** | ❌ NO | ✅ YES (all 3 instances) |
| **context7 Knowledge** | ❌ NO | ✅ YES |
| **Sequential Thinking** | ❌ NO | ✅ YES (some agents) |
| **WebFetch/WebSearch** | ✅ YES | ✅ YES |
| **Read/Write/Edit Files** | ✅ YES | ❌ NO (agents can't modify files) |
| **Launch Other Agents** | ✅ YES (via Task) | ✅ YES (some agents) |
| **Bash Commands** | ✅ YES | ✅ YES (n8n-connector only) |
| **TodoWrite** | ✅ YES | ✅ YES |

**Key Takeaway**: Main session handles file operations and coordination. Agents handle n8n operations.

---

## 🚨 Common Mistakes & Solutions

### Mistake 1: "I'll just use curl since MCP tools aren't working"

**Why It's Wrong**: .cursorrules policy explicitly forbids this to prevent shortcuts when tools have issues.

**Correct Approach**: Launch an agent and have THEM use MCP tools. If agent reports MCP tools don't work, THEN investigate the MCP configuration.

---

### Mistake 2: "I'll read the workflow JSON file and analyze it myself"

**Why It's Incomplete**: Local JSON file might be outdated. Agent can fetch CURRENT state from live n8n instance.

**Correct Approach**: Launch agent to fetch live workflow, then analyze. If you have a local file, provide it to the agent for comparison.

---

### Mistake 3: "I'll launch agent without clear instructions"

**Why It Fails**: Agent needs specific task with exact steps and expected output.

**Correct Approach**: Write detailed prompt with:
- Which n8n instance to use
- Exact workflow ID (if known)
- Step-by-step instructions
- What to do if unknown nodes encountered
- What format to return results in

---

## 📚 Additional Resources

- **Agent Descriptions**: See Task tool documentation for full agent capabilities
- **MCP Tool List**: See N8N_MCP_VALIDATION_REPORT.md for complete tool inventory
- **n8n Documentation**: https://docs.n8n.io (agents can fetch this)
- **CLAUDE.md Section 4**: Current n8n workflow inventory
- **.cursor/rules/tax4us-agents.mdc**: Tax4Us-specific workflow context

---

## 🎯 Success Checklist

Before declaring "workflow work complete":

- [ ] Used agents (not main session) for all n8n operations
- [ ] Agent fetched CURRENT workflow state from live instance
- [ ] Agent validated workflow structure
- [ ] Agent checked recent execution history
- [ ] If issues found, agent recommended specific fixes
- [ ] Tested fixes in inactive copy first (if applicable)
- [ ] Documented changes in appropriate location
- [ ] Updated CLAUDE.md if workflow inventory changed

---

## 🔄 When This Guide Should Be Updated

Update this guide when:
- Agent tool access changes (new agents added, tools modified)
- MCP server configuration changes
- New n8n instances added
- Agent capabilities expand
- Common usage patterns emerge

---

**Remember**: Main session = coordinator. Agents = doers. Always use the right tool for the job.

**Last Updated**: October 11, 2025
**Status**: ✅ Verified Architecture
**Next Review**: When agent testing completes (Priority 1)
