# n8n MCP Tools - Complete Usage Guide

**Last Updated**: November 18, 2025  
**Purpose**: Hardcoded reference for all 44 n8n/Context7 MCP tools available in this project  
**Status**: ✅ All tools documented with usage examples

---

## 📊 TOOL INVENTORY

**Total Available**: 40+ tools
- **n8n MCP Tools**: 38 tools (from czlonkowski/n8n-mcp v2.22.19)
  - Documentation tools: 22 (search_nodes, get_node_info, validate_workflow, etc.)
  - Management tools: 16 (n8n_create_workflow, n8n_update_workflow, etc.)
  - Note: Previous count of 41 was incorrect - actual count is 38 as confirmed by n8n_diagnostic
- **Context7 MCP Tools**: 2 tools (from @upstash/context7-mcp v1.0.29)

**Currently Used**: 10 tools  
**Not Utilized**: 30+ tools

**Last Updated**: November 19, 2025
**n8n-mcp Version**: 2.22.19 (latest, updated Nov 19, 2025)
**Context7-mcp Version**: 1.0.29 (latest, configured via npx)

---

## 🔧 TOOLS BY CATEGORY

### **1. System & Diagnostics (4 tools)**

#### ✅ `n8n_diagnostic` - **USED**
**Purpose**: Comprehensive diagnostic with environment-aware debugging  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_diagnostic({verbose: true})
```
**Returns**: API connectivity, version info, tool availability, performance metrics, troubleshooting tips  
**When to Use**: 
- Initial setup verification
- Debugging connection issues
- Performance monitoring

#### ✅ `n8n_health_check` - **USED**
**Purpose**: Check n8n instance health and API connectivity  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_health_check()
```
**Returns**: Status, version, available features  
**When to Use**: Quick health check before operations

#### ✅ `n8n_list_available_tools` - **USED**
**Purpose**: List all available n8n management tools  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_list_available_tools()
```
**Returns**: Categorized list of all tools with descriptions

#### ❌ `tools_documentation` - **NOT USED**
**Purpose**: Meta-documentation tool - get docs for any MCP tool  
**Usage**:
```javascript
mcp_n8n-rensto_tools_documentation({topic: "tool_name", depth: "full"})
```
**When to Use**: Discover tool capabilities, get detailed documentation  
**Example**: `tools_documentation({topic: "ai_agents_guide", depth: "full"})`

---

### **2. Discovery & Node Research (8 tools)**

#### ❌ `search_nodes` - **NOT USED**
**Purpose**: Text search across 525 nodes with examples  
**Usage**:
```javascript
mcp_n8n-rensto_search_nodes({
  query: "webhook",
  includeExamples: true,  // Get real-world configs from templates
  limit: 20,
  mode: "OR"  // OR, AND, or FUZZY
})
```
**Returns**: Most relevant nodes first, with working examples from templates  
**When to Use**: 
- Finding nodes by functionality
- Getting real-world configuration examples
- Discovering node capabilities

**Example**: Search for "AI agent" nodes with examples

#### ❌ `list_nodes` - **NOT USED**
**Purpose**: List all 525 n8n nodes with filtering  
**Usage**:
```javascript
mcp_n8n-rensto_list_nodes({
  category: "trigger",  // trigger, transform, output, input, AI
  package: "n8n-nodes-base",  // or "@n8n/n8n-nodes-langchain"
  limit: 200,  // Use 200+ to get all nodes
  isAITool: true  // Filter AI-capable nodes only
})
```
**Returns**: Filtered list of nodes  
**When to Use**: 
- Browse all available nodes
- Filter by category (104 triggers, 263 AI nodes)
- Find nodes in specific packages

#### ❌ `list_ai_tools` - **NOT USED**
**Purpose**: List 263 AI-optimized nodes  
**Usage**:
```javascript
mcp_n8n-rensto_list_ai_tools()
```
**Returns**: All AI-capable nodes  
**When to Use**: Building AI agent workflows

#### ❌ `get_node_essentials` - **NOT USED** ⭐ **RECOMMENDED**
**Purpose**: Get essential properties only (95% smaller than full info)  
**Usage**:
```javascript
mcp_n8n-rensto_get_node_essentials({
  nodeType: "nodes-base.httpRequest",
  includeExamples: true  // Get top 3 template configs
})
```
**Returns**: 10-20 most commonly-used properties (5KB vs 100KB+)  
**When to Use**: 
- **ALWAYS use this first** instead of get_node_info
- Need common properties only
- Want real-world examples

**Example**: Get HTTP Request essentials with examples

#### ❌ `get_node_info` - **NOT USED**
**Purpose**: Get complete node schema (100KB+ response)  
**Usage**:
```javascript
mcp_n8n-rensto_get_node_info({
  nodeType: "nodes-base.httpRequest"
})
```
**Returns**: ALL 200+ properties for complex nodes  
**When to Use**: 
- Need advanced properties not in essentials
- Complex node configuration
- **Only use if get_node_essentials doesn't have what you need**

#### ❌ `get_node_documentation` - **NOT USED**
**Purpose**: Get readable docs with examples/auth/patterns  
**Usage**:
```javascript
mcp_n8n-rensto_get_node_documentation({
  nodeType: "nodes-base.slack"
})
```
**Returns**: Human-readable documentation (87% coverage)  
**When to Use**: Understanding node usage patterns, authentication setup

#### ❌ `search_node_properties` - **NOT USED**
**Purpose**: Find specific properties in a node without downloading all 200+  
**Usage**:
```javascript
mcp_n8n-rensto_search_node_properties({
  nodeType: "nodes-base.httpRequest",
  query: "auth",  // or "header", "body", "json"
  maxResults: 20
})
```
**Returns**: Property paths and descriptions  
**When to Use**: Looking for specific fields (auth, headers, etc.)

#### ❌ `get_node_as_tool_info` - **NOT USED**
**Purpose**: How to use ANY node as AI tool  
**Usage**:
```javascript
mcp_n8n-rensto_get_node_as_tool_info({
  nodeType: "nodes-base.slack"
})
```
**Returns**: Requirements, use cases, examples for AI tool integration  
**When to Use**: Building AI agents that need to use nodes as tools

---

### **3. Validation & Configuration (5 tools)**

#### ✅ `n8n_validate_workflow` - **USED**
**Purpose**: Full workflow validation from n8n instance  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_validate_workflow({
  id: "workflow-id",
  options: {
    validateNodes: true,
    validateConnections: true,
    validateExpressions: true,
    profile: "runtime"  // minimal, runtime, ai-friendly, strict
  }
})
```
**Returns**: Errors, warnings, fixes  
**When to Use**: 
- **ALWAYS validate before deploying**
- After workflow updates
- Debugging workflow issues

#### ❌ `validate_node_minimal` - **NOT USED**
**Purpose**: Fast check for missing required fields only  
**Usage**:
```javascript
mcp_n8n-rensto_validate_node_minimal({
  nodeType: "nodes-base.webhook",
  config: {}  // Empty config to check required fields
})
```
**Returns**: List of missing required fields  
**When to Use**: Quick validation during node configuration

#### ❌ `validate_node_operation` - **NOT USED** ⭐ **RECOMMENDED**
**Purpose**: Validate node config with operation awareness  
**Usage**:
```javascript
mcp_n8n-rensto_validate_node_operation({
  nodeType: "nodes-base.slack",
  config: {
    resource: "channel",
    operation: "create"
  },
  profile: "ai-friendly"  // minimal, runtime, ai-friendly, strict
})
```
**Returns**: Specific errors with automated fix suggestions  
**When to Use**: 
- **Before updating nodes**
- Validating node configurations
- Getting fix suggestions

#### ❌ `validate_workflow_connections` - **NOT USED**
**Purpose**: Check workflow connections only (fast structure validation)  
**Usage**:
```javascript
mcp_n8n-rensto_validate_workflow_connections({
  workflow: {
    nodes: [...],
    connections: {...}
  }
})
```
**Returns**: Connection errors, cycles, trigger issues  
**When to Use**: Fast validation of workflow structure

#### ❌ `validate_workflow_expressions` - **NOT USED**
**Purpose**: Validate n8n expressions syntax  
**Usage**:
```javascript
mcp_n8n-rensto_validate_workflow_expressions({
  workflow: {
    nodes: [...],
    connections: {...}
  }
})
```
**Returns**: Expression errors with locations  
**When to Use**: Debugging expression syntax errors

#### ❌ `get_property_dependencies` - **NOT USED**
**Purpose**: Show property dependencies and visibility rules  
**Usage**:
```javascript
mcp_n8n-rensto_get_property_dependencies({
  nodeType: "nodes-base.httpRequest",
  config: {sendBody: true}  // Optional: test visibility impact
})
```
**Returns**: Which fields appear when, visibility rules  
**When to Use**: Understanding conditional field visibility

---

### **4. Templates & Examples (6 tools)**

#### ❌ `list_tasks` - **NOT USED**
**Purpose**: List task templates by category  
**Usage**:
```javascript
mcp_n8n-rensto_list_tasks({
  category: "HTTP/API"  // HTTP/API, Webhooks, Database, AI, Data Processing, Communication
})
```
**Returns**: Curated task templates  
**When to Use**: Finding templates for specific tasks

#### ❌ `list_node_templates` - **NOT USED**
**Purpose**: Find 399 community workflows using specific nodes  
**Usage**:
```javascript
mcp_n8n-rensto_list_node_templates({
  nodeTypes: ["n8n-nodes-base.httpRequest", "n8n-nodes-base.openAi"],
  limit: 10
})
```
**Returns**: Templates using those nodes  
**When to Use**: Finding real-world examples of node combinations

#### ❌ `get_template` - **NOT USED**
**Purpose**: Get complete workflow JSON by ID (ready to import)  
**Usage**:
```javascript
mcp_n8n-rensto_get_template({
  templateId: 12345,
  mode: "full"  // nodes_only, structure, or full
})
```
**Returns**: Complete workflow JSON  
**When to Use**: Importing templates, studying workflow structure

#### ❌ `search_templates` - **NOT USED**
**Purpose**: Search templates by name/description keywords  
**Usage**:
```javascript
mcp_n8n-rensto_search_templates({
  query: "chatbot",
  limit: 20,
  fields: ["id", "name", "description"]  // Optional: limit response size
})
```
**Returns**: Matching templates  
**When to Use**: Finding templates by functionality

#### ❌ `search_templates_by_metadata` - **NOT USED**
**Purpose**: Search using AI-generated metadata filters  
**Usage**:
```javascript
mcp_n8n-rensto_search_templates_by_metadata({
  category: "automation",
  complexity: "simple",  // simple, medium, complex
  maxSetupMinutes: 30,
  requiredService: "openai",
  targetAudience: "developers"
})
```
**Returns**: Templates with rich metadata  
**When to Use**: Smart template discovery beyond text search

#### ❌ `get_templates_for_task` - **NOT USED**
**Purpose**: Curated templates by task type  
**Usage**:
```javascript
mcp_n8n-rensto_get_templates_for_task({
  task: "ai_automation",  // ai_automation, data_sync, webhook_processing, etc.
  limit: 10
})
```
**Returns**: Popular templates for that task  
**When to Use**: Quick access to task-specific templates

---

### **5. Workflow Management (10 tools)**

#### ✅ `n8n_get_workflow` - **USED**
**Purpose**: Get complete workflow by ID  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_get_workflow({id: "workflow-id"})
```

#### ✅ `n8n_get_workflow_structure` - **USED**
**Purpose**: Get simplified structure (nodes + connections only)  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_get_workflow_structure({id: "workflow-id"})
```

#### ✅ `n8n_update_partial_workflow` - **USED**
**Purpose**: Update workflow incrementally with diff operations  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_update_partial_workflow({
  id: "workflow-id",
  operations: [
    {type: "updateNode", nodeId: "...", updates: {...}},
    {type: "addConnection", source: "...", target: "..."}
  ]
})
```

#### ✅ `n8n_list_executions` - **USED**
**Purpose**: List executions with filters  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_list_executions({
  workflowId: "workflow-id",
  limit: 10,
  status: "success"  // success, error, waiting
})
```

#### ✅ `n8n_get_execution` - **USED**
**Purpose**: Get execution details with smart filtering  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_get_execution({
  id: "execution-id",
  mode: "summary"  // preview, summary, filtered, or full
})
```

#### ✅ `n8n_list_workflows` - **USED**
**Purpose**: List workflows (minimal metadata)  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_list_workflows({
  limit: 100,
  active: true,
  tags: ["tag-name"]
})
```

#### ❌ `n8n_create_workflow` - **NOT USED**
**Purpose**: Create new workflows  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_create_workflow({
  name: "Workflow Name",
  nodes: [...],
  connections: {...},
  settings: {...}  // Optional
})
```
**Returns**: Workflow with ID (created inactive)  
**When to Use**: Creating workflows programmatically

#### ❌ `n8n_get_workflow_details` - **NOT USED**
**Purpose**: Get detailed workflow info with stats  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_get_workflow_details({id: "workflow-id"})
```
**Returns**: More info than get_workflow (metadata, version, execution stats)  
**When to Use**: Need execution statistics, version history

#### ❌ `n8n_get_workflow_minimal` - **NOT USED**
**Purpose**: Get minimal info (ID, name, active, tags) - fastest  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_get_workflow_minimal({id: "workflow-id"})
```
**When to Use**: Fast listings, checking active status

#### ❌ `n8n_update_full_workflow` - **NOT USED**
**Purpose**: Full workflow update (requires complete nodes/connections)  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_update_full_workflow({
  id: "workflow-id",
  nodes: [...],  // Complete array
  connections: {...}  // Complete object
})
```
**When to Use**: Major workflow restructures (use partial for incremental)

#### ❌ `n8n_delete_workflow` - **NOT USED**
**Purpose**: Permanently delete workflow  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_delete_workflow({id: "workflow-id"})
```
**Warning**: Cannot be undone!

#### ❌ `n8n_autofix_workflow` - **NOT USED** ⭐ **RECOMMENDED**
**Purpose**: Automatically fix common workflow errors  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: false,  // Preview mode (default)
  fixTypes: ["expression-format", "typeversion-correction"],
  confidenceThreshold: "medium"
})
```
**Returns**: Preview of fixes or applies them  
**When to Use**: 
- **After validation errors**
- Auto-fix common issues
- Expression format corrections

#### ❌ `n8n_workflow_versions` - **NOT USED**
**Purpose**: Manage workflow version history  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_workflow_versions({
  mode: "list",  // list, get, rollback, delete, prune, truncate
  workflowId: "workflow-id",
  limit: 10
})
```
**When to Use**: Version management, rollback, cleanup

#### ❌ `n8n_trigger_webhook_workflow` - **NOT USED**
**Purpose**: Trigger workflow via webhook  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_trigger_webhook_workflow({
  webhookUrl: "https://n8n.example.com/webhook/abc",
  httpMethod: "POST",
  data: {...},
  waitForResponse: true
})
```
**When to Use**: Testing webhook workflows programmatically

#### ❌ `n8n_delete_execution` - **NOT USED**
**Purpose**: Delete execution records  
**Usage**:
```javascript
mcp_n8n-rensto_n8n_delete_execution({id: "execution-id"})
```

---

### **6. Guides (3 tools)**

#### ❌ `ai_agents_guide` - **NOT USED**
**Purpose**: Comprehensive AI Agent workflow guide  
**Usage**:
```javascript
mcp_n8n-rensto_tools_documentation({
  topic: "ai_agents_guide",
  depth: "full"
})
```
**Returns**: Architecture, connections, tools, validation, best practices  
**When to Use**: Building AI agent workflows

#### ❌ `javascript_code_node_guide` - **NOT USED**
**Purpose**: JavaScript patterns for Code nodes  
**Usage**:
```javascript
mcp_n8n-rensto_tools_documentation({
  topic: "javascript_code_node_guide",
  depth: "full"
})
```
**Returns**: n8n variables, error handling, patterns  
**When to Use**: Writing Code node JavaScript

#### ❌ `python_code_node_guide` - **NOT USED**
**Purpose**: Python patterns for Code nodes  
**Usage**:
```javascript
mcp_n8n-rensto_tools_documentation({
  topic: "python_code_node_guide",
  depth: "full"
})
```
**When to Use**: Writing Code node Python

---

### **7. Context7 MCP Tools (2 tools)**

**Package**: `@upstash/context7-mcp@1.0.29` (latest)  
**Status**: ✅ Configured via npx in `~/.cursor/mcp.json`  
**Purpose**: Documentation lookup and research for AI agents

#### ❌ `mcp_context7_resolve-library-id` - **NOT USED**
**Purpose**: Resolve package name to Context7 library ID  
**Usage**:
```javascript
mcp_context7_resolve-library-id({
  libraryName: "next.js"
})
```
**Returns**: Matching libraries with IDs  
**When to Use**: Before getting library docs  
**Example**: Find library ID for "react" or "typescript"

#### ❌ `mcp_context7_get-library-docs` - **NOT USED**
**Purpose**: Get up-to-date library documentation  
**Usage**:
```javascript
mcp_context7_get-library-docs({
  context7CompatibleLibraryID: "/vercel/next.js",
  topic: "routing",  // Optional: focus on specific topic
  page: 1  // Pagination
})
```
**When to Use**: 
- Researching library APIs
- Getting latest docs for frameworks
- Finding implementation examples
- Understanding library features

**Integration**: Works with n8n workflows for enhanced AI capabilities

---

## 🎯 RECOMMENDED WORKFLOW FOR DEBUGGING

### **Standard Debugging Workflow**:

1. **Start with diagnostics**:
   ```javascript
   n8n_diagnostic({verbose: true})
   n8n_health_check()
   ```

2. **Get execution details**:
   ```javascript
   n8n_get_execution({id: "execution-id", mode: "summary"})
   ```

3. **Validate workflow**:
   ```javascript
   n8n_validate_workflow({id: "workflow-id", options: {...}})
   ```

4. **Auto-fix if needed**:
   ```javascript
   n8n_autofix_workflow({id: "workflow-id", applyFixes: false})
   ```

5. **Search for node examples**:
   ```javascript
   search_nodes({query: "node-name", includeExamples: true})
   ```

6. **Get node essentials**:
   ```javascript
   get_node_essentials({nodeType: "nodes-base.nodeName", includeExamples: true})
   ```

7. **Validate node before update**:
   ```javascript
   validate_node_operation({nodeType: "...", config: {...}, profile: "runtime"})
   ```

---

## 📝 CURRENT WORKFLOW ISSUE DEBUGGING

**Problem**: WAHA Trigger outputs message data in output[3], but connections are only from main[0] and main[1] (empty arrays).

**Solution Applied**: Updated Filter Message Events code to handle all input items and skip empty arrays. The code now processes items from all connected ports and filters out empty ones.

**Next Step**: Test with another voice message to verify the filter now receives and processes the message from output[3].

---

## 🔍 TOOLS USED IN THIS SESSION

1. ✅ `n8n_diagnostic` - System diagnostics
2. ✅ `n8n_validate_workflow` - Workflow validation
3. ✅ `n8n_get_execution` - Execution analysis
4. ✅ `n8n_get_workflow` - Workflow inspection
5. ✅ `n8n_get_workflow_structure` - Connection verification
6. ✅ `n8n_update_partial_workflow` - Incremental updates
7. ✅ `n8n_list_executions` - Execution listing
8. ✅ `n8n_list_available_tools` - Tool discovery

**Tools NOT Used (Should Have)**:
- ❌ `validate_node_operation` - Should validate before updating
- ❌ `n8n_autofix_workflow` - Should auto-fix validation errors
- ❌ `get_node_essentials` - Should get node info efficiently
- ❌ `search_nodes` - Should find node examples

---

## 🚀 QUICK REFERENCE

### **Before Every Workflow Update**:
1. `n8n_validate_workflow` - Check for errors
2. `validate_node_operation` - Validate node configs
3. `n8n_autofix_workflow` - Auto-fix common issues

### **When Debugging**:
1. `n8n_get_execution` - Get execution details
2. `n8n_diagnostic` - System health check
3. `search_nodes` - Find node examples
4. `get_node_essentials` - Get node properties

### **When Building New Workflows**:
1. `search_templates` - Find similar workflows
2. `get_template` - Import template
3. `list_ai_tools` - Find AI nodes
4. `tools_documentation({topic: "ai_agents_guide"})` - AI agent guide

---

**This document should be referenced before every n8n workflow operation to ensure all available tools are utilized effectively.**

