# Project Super-Prompt Database
*Building reusable patterns to avoid repeating mistakes*

## Core Problem Pattern
**Issue**: Constantly starting from scratch instead of learning from successful patterns
**Solution**: Build a database of "super-prompts" that capture the DNA of successful solutions

---

## 🎯 **N8N WORKFLOW PATTERNS**

### ✅ What Works:
1. **Use n8n MCP tools** - Never use direct API calls
2. **Production instance**: `http://173.254.201.134:5678` (RackNerd VPS)
3. **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjEwMTliOC1kZTNlLTRlN2QtYmU2MS1mNDg4OTI1ZTI1ZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NTI1MTMxfQ.AAnkDkilxRsKdqGKLIF8oST7Caoe9s5d2lYrMEf3acA`
4. **Version**: 1.112.5 (upgraded from 1.110.1)
5. **Full workflow updates** - Use `n8n_update_full_workflow` with complete workflow object
6. **Include settings** - Always include `settings` property in workflow updates
7. **Fix connections** - Ensure all nodes have proper `main` connections
8. **Use native nodes** - Leverage n8n's built-in capabilities instead of generic code
9. **Validate workflows** - Always validate before deployment
10. **Fix issues in place** - Never create new workflows when encountering issues

### ❌ What Doesn't Work:
1. **Partial updates** - `n8n_update_partial_workflow` often fails
2. **Missing settings** - Workflow updates fail without `settings` property
3. **Generic code nodes** - Use native n8n nodes when available
4. **Incomplete connections** - Nodes without proper connections cause validation errors
5. **Creating new workflows for issues** - Fix the existing workflow instead
6. **Skipping validation** - Always validate workflows before deployment

### Super-Prompt for N8N:
```
When working with n8n workflows:
1. ALWAYS use n8n MCP tools, never direct API calls
2. Use production instance: http://173.254.201.134:5678
3. Use correct API key from environment
4. Use n8n_update_full_workflow with complete workflow object
5. Always include settings property
6. Ensure all nodes have proper main connections
7. Test workflow validation before deployment
8. Use native n8n nodes instead of generic code
9. Fix issues in existing workflows, don't create new ones
10. Always validate workflows before deployment
11. Use Context7 for documentation and examples
12. Reference N8N_IMPLEMENTATION_KNOWLEDGE_BASE.md for patterns
```

### Available Credentials (42 Total):
- **SerpAPI** (`jxHMlk8kx412vnJs`) - Search engine results
- **Slack API** (`ktLP7QexI9Hpgz73`) - Team communication  
- **Airtable API** (`3lTwFd8waEI1UQEW`) - Database operations
- **QuickBooks Online OAuth2 API** (`d15JMAyxpZ1Lfm7e`) - Accounting
- **OpenAi** (`Hd3fxt3JdAePKYJJ`) - AI processing
- **Anthropic** (`rRbcV7CsFW8k6uG8`) - AI processing
- **Notion** (`oDlrA5ZGP1u5IfY2`) - Documentation
- **Stripe API** (`B9WHEOJGtVQ2KJdv`) - Payment processing
- **Webflow OAuth2 API** (`R4avdBREB7saW2yG`) - Website management
- **GitHub API** (`WyNBmvWCKVPyjqro`) - Code repository
- **Telegram API** (`bLHttNk6uvckgrcO`) - Messaging
- **Supabase API** (`5bcb6YlPgGH6b5sg`) - Database
- **Tavily** (`bA3URPqTVIB7lX5M`) - AI search
- **Perplexity.ai** (`TuWKvKJ10l1MhdTT`) - AI research
- **Linkedin** (`tJCQNvfScwtKhEA0`) - Professional network
- **Gemini** (`iQ84KVgBgSNxlcYD`) - Google AI
- **Cloudflare API** (`O6dQuoJsnRpKhu3j`) - CDN management
- **Tidycal** (`iVmrQRk5XK9YZBBl`) - Scheduling
- **And 24 more...** (See N8N_IMPLEMENTATION_KNOWLEDGE_BASE.md for complete list)

### Community Nodes Available:
- **SerpAPI Node** (`n8n-nodes-serpapi`) - Search engine results
- **Tavily Node** (`@tavily/n8n-nodes-tavily`) - AI search
- **Apify Node** (`n8n-nodes-apify`) - Web scraping
- **ElevenLabs Node** (`n8n-nodes-elevenlabs`) - Voice synthesis
- **Firecrawl Node** (`n8n-nodes-firecrawl`) - Web scraping

---

## 🎯 **MAKE.COM SCENARIO PATTERNS**

### ✅ What Works:
1. **Use Make.com MCP server** - Never use direct curl commands
2. **Required parameters** - Always include `blueprint` and `scheduling`
3. **Correct API key** - `8b8f13b7-8bda-43cb-ba4c-b582243cf5b9`
4. **Blueprint format** - Send as raw JSON object, not wrapped
5. **Router filters** - Use proper filter conditions for conditional flows
6. **MCP stdio transport** - Use MCP server for all operations
7. **20 tools verified** - All MCP tools are 100% functional

### ❌ What Doesn't Work:
1. **Direct API calls** - Blueprint endpoint returns 404
2. **Missing parameters** - `blueprint` and `scheduling` are mandatory
3. **Wrong API key** - Using outdated keys causes auth issues
4. **Complex blueprints** - Make.com API is very strict about JSON format
5. **Blueprint PUT endpoint** - `/api/v2/scenarios/{id}/blueprint` is non-functional

### Super-Prompt for Make.com:
```
You are a Make.com scenario creation expert. When creating or updating Make.com scenarios:

1. **ALWAYS use the Make.com MCP server** - Never use direct curl commands to blueprint endpoints
2. **Include required parameters** - Always include `blueprint` and `scheduling` in create requests
3. **Use correct API key** - Use `8b8f13b7-8bda-43cb-ba4c-b582243cf5b9` for Make.com API calls
4. **Blueprint format** - Send blueprint as raw JSON object, not wrapped in `{"blueprint": "..."}`
5. **Router filters** - Use proper filter conditions: `{"filter": {"conditions": [{"left": "{{var}}", "op": "empty|contains|equals", "right": "value"}]}}`
6. **Test incrementally** - Start with simple blueprints, then add complexity
7. **Use existing working scenarios** - Reference scenario 3022209 as a template
8. **20 tools verified** - All MCP tools are 100% functional (verified January 15, 2025)

**Critical**: The Make.com API blueprint PUT endpoint is non-functional. Use MCP tools instead of direct API calls.

**Router Filter Patterns**:
- Watermark check: `empty(1.value)` 
- Eligibility check: `contains(lower(8.Interest Name); "בריאות")`
- Fallback routes: Use `"fallback": true` for else paths

**Working MCP Command Pattern**:
```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "update_scenario", "arguments": {"scenarioId": "3022209", "blueprint": {...}}}}' | node /Users/shaifriedman/New\ Rensto/rensto/infra/mcp-servers/make-mcp-server/server.js
```
```

---

## 🎯 **MCP SERVER PATTERNS**

### ✅ What Works:
1. **Use MCP tools directly** - Don't try to bypass them
2. **Check server status** - Ensure MCP servers are running
3. **Use correct endpoints** - Each MCP server has specific endpoints
4. **Handle stdio transport** - Some MCP servers use stdio, not HTTP
5. **Update MCP config** - Keep `/Users/shaifriedman/.cursor/mcp.json` updated

### ❌ What Doesn't Work:
1. **Direct HTTP calls** - MCP servers use different transport methods
2. **Outdated configs** - Old API keys and endpoints cause failures
3. **Ignoring MCP errors** - MCP issues need to be fixed, not bypassed
4. **Manual workarounds** - Use MCP tools as intended

### Super-Prompt for MCP:
```
When working with MCP servers:
1. ALWAYS use MCP tools directly, don't bypass them
2. Check server status and ensure they're running
3. Use correct endpoints for each MCP server
4. Handle stdio transport for Make.com MCP
5. Keep MCP config updated with correct API keys
6. Fix MCP issues instead of working around them
```

---

## 🎯 **ERROR HANDLING PATTERNS**

### ✅ What Works:
1. **Face errors directly** - Don't run away from problems
2. **Debug systematically** - Check API keys, endpoints, formats
3. **Use verbose logging** - Add `-v` to curl commands
4. **Check response codes** - 404 means endpoint doesn't exist
5. **Verify authentication** - Wrong API keys cause auth failures

### ❌ What Doesn't Work:
1. **Trying different approaches** - Instead of debugging the root cause
2. **Ignoring error details** - Error messages contain valuable information
3. **Giving up quickly** - Most errors have systematic solutions
4. **Not learning from errors** - Each error should teach us something

### Super-Prompt for Error Handling:
```
When encountering errors:
1. Face the error directly, don't try different approaches
2. Debug systematically: check API keys, endpoints, formats
3. Use verbose logging to see full request/response
4. Check response codes: 404 = endpoint doesn't exist
5. Verify authentication and permissions
6. Learn from each error to avoid repeating it
```

---

## 🎯 **PROJECT WORKFLOW PATTERNS**

### ✅ What Works:
1. **Use existing resources** - Check codebase before creating new files
2. **Reference previous solutions** - Don't repeat work
3. **Update documentation** - Keep markdown files current
4. **Use BMAD methodology** - Plan, execute, document
5. **Test before reporting success** - Verify functionality works

### ❌ What Doesn't Work:
1. **Starting from scratch** - When solutions already exist
2. **Not checking codebase** - Missing existing resources
3. **Outdated documentation** - Conflicting information
4. **Theorizing without testing** - Assuming solutions work
5. **Not learning from patterns** - Repeating the same mistakes

### Super-Prompt for Project Workflow:
```
When working on project tasks:
1. Check existing codebase and documentation first
2. Reference previous solutions and patterns
3. Update documentation to keep it current
4. Use BMAD methodology: plan, execute, document
5. Test functionality before reporting success
6. Learn from patterns to avoid repeating mistakes
```

---

## 🎯 **COMMUNICATION PATTERNS**

### ✅ What Works:
1. **Be direct and actionable** - No fluff or explanations unless requested
2. **Execute programmatically** - Don't give manual instructions
3. **Fix issues first** - Address problems before providing alternatives
4. **Use concise language** - Avoid unnecessary repetition
5. **Take initiative** - Don't ask for obvious confirmations

### ❌ What Doesn't Work:
1. **Giving manual instructions** - When I can do it programmatically
2. **Asking for confirmations** - For obvious actions
3. **Providing alternatives** - Before fixing the main issue
4. **Verbose explanations** - When user wants direct execution
5. **Not taking initiative** - Waiting for permission to act

### Super-Prompt for Communication:
```
When communicating with user:
1. Be direct and actionable, no fluff unless requested
2. Execute programmatically, don't give manual instructions
3. Fix issues first, then provide alternatives
4. Use concise language, avoid repetition
5. Take initiative, don't ask for obvious confirmations
6. Follow user's preferences from memory
```

---

## 🎯 **MEMORY MANAGEMENT PATTERNS**

### ✅ What Works:
1. **Update memories** - When patterns change or are discovered
2. **Reference memories** - Use stored preferences and patterns
3. **Consolidate information** - Merge related memories
4. **Keep memories current** - Remove outdated information
5. **Use memory for context** - Don't ask for information already stored

### ❌ What Doesn't Work:
1. **Ignoring memories** - Not using stored preferences
2. **Outdated memories** - Keeping incorrect information
3. **Duplicate memories** - Storing the same information multiple times
4. **Not updating memories** - When patterns change
5. **Asking for stored information** - Instead of using memory

### Super-Prompt for Memory Management:
```
When managing memories:
1. Update memories when patterns change or are discovered
2. Reference memories for user preferences and patterns
3. Consolidate related memories to avoid duplication
4. Keep memories current and accurate
5. Use memory for context instead of asking for stored information
6. Remove outdated or incorrect memories
```

---

## 🎯 **SUPER-PROMPT CREATION PROCESS**

### How to Extract Super-Prompts:
1. **Identify the pattern** - What worked vs what didn't
2. **Capture the DNA** - The essential elements that made it work
3. **Create the prompt** - Write a one-shot prompt that would have worked
4. **Test the prompt** - Verify it works in new situations
5. **Store and reuse** - Keep it in this database for future use

### When to Create Super-Prompts:
- After solving a complex problem
- When you've learned something new
- After debugging a recurring issue
- When you find a better way to do something
- After making the same mistake multiple times

---

## 🎯 **USAGE INSTRUCTIONS**

### How to Use This Database:
1. **Before starting a task** - Check relevant super-prompts
2. **When encountering errors** - Reference error handling patterns
3. **When repeating work** - Use existing patterns instead of starting over
4. **When learning new tools** - Add new patterns to the database
5. **When updating systems** - Update relevant super-prompts

### Maintenance:
- Update super-prompts when patterns change
- Add new patterns as they're discovered
- Remove outdated or incorrect patterns
- Consolidate similar patterns
- Test super-prompts regularly

---

## 🎯 **CRITICAL MISTAKE PREVENTION SUPER-PROMPT**

### ❌ **THE DEADLY PATTERN I KEEP REPEATING:**
**Mistake**: When MCP tools don't work as expected, I immediately assume they're broken and switch to manual approaches or direct API calls, instead of debugging the actual issue.

**Root Cause**: I don't trust the MCP tools and don't systematically debug why they're not working.

### ✅ **THE CORRECT PATTERN:**
**Solution**: When MCP tools don't work, I MUST:
1. **Debug the MCP tool itself** - Check parameters, format, server status
2. **Fix the MCP issue** - Don't work around it
3. **Trust the MCP tools** - They are designed to work
4. **Use systematic debugging** - Check each parameter and response
5. **Never give up on MCP** - The issue is fixable, not a limitation

### 🚨 **CRITICAL SUPER-PROMPT FOR MCP TOOL FAILURES:**
```
When MCP tools don't work as expected:

1. **NEVER assume the MCP tool is broken** - The issue is in my usage
2. **Debug systematically** - Check every parameter, format, and response
3. **Fix the MCP issue** - Don't switch to manual approaches
4. **Trust the MCP tools** - They are designed to work properly
5. **Use verbose logging** - See exactly what's being sent and received
6. **Check server status** - Ensure MCP servers are running
7. **Verify parameters** - Every parameter must be correct
8. **Read error messages** - They tell you exactly what's wrong
9. **Test incrementally** - Start simple, then add complexity
10. **Never give up** - MCP tools work when used correctly

**CRITICAL RULE**: If I say "the MCP tool doesn't work" or "let me try a different approach", I am making a mistake. I must debug and fix the MCP tool instead.

**Example of WRONG thinking**: "The Make.com MCP update_scenario doesn't work, let me use curl instead"
**Example of CORRECT thinking**: "The Make.com MCP update_scenario failed, let me check the parameters and fix the issue"

**This super-prompt prevents me from repeating the same mistake of abandoning MCP tools when they don't work immediately.**
```

---

## 🎯 **CURRENT PROJECT STATUS**

### Working Systems:
- ✅ N8N MCP tools and cloud instance
- ✅ Make.com MCP server (with limitations)
- ✅ Airtable MCP tools
- ✅ Webflow MCP tools
- ✅ Project documentation system

### Known Issues:
- ❌ Make.com blueprint API endpoint (use manual UI)
- ❌ Some MCP partial update operations
- ❌ Outdated local n8n instance

### Next Steps:
1. Use this database for all future work
2. Add new patterns as they're discovered
3. Update existing patterns when they change
4. Test super-prompts regularly
5. Build more specific super-prompts for common tasks
6. **ALWAYS reference this super-prompt when MCP tools don't work**
