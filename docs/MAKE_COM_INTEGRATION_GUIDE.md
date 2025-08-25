# 🎯 MAKE.COM INTEGRATION GUIDE - DEFINITIVE

## 📋 OVERVIEW

This is the **ONLY** way to integrate with Make.com in the Rensto system. All other approaches are deprecated.

## 🔑 CREDENTIALS & PERMISSIONS

### **API Key** (`7cca707a-9429-4997-8ba9-fc67fc7e4b29`)
- **Purpose**: Direct Make.com API calls for scenario management
- **Permissions**: Full access including `scenarios:read`, `scenarios:run`, `scenarios:write`
- **Usage**: Create, read, update, delete, and execute scenarios programmatically

### **MCP Token** (`a88300ab-4048-4376-a396-0006d0c637c7`)
- **Purpose**: Make Cloud MCP Server for AI agent interactions
- **Permissions**: `mcp:use`
- **Usage**: AI agents can create and manage scenarios through natural language

## 🏗️ ARCHITECTURE

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Rensto App    │───▶│  Make.com API    │───▶│  Make.com       │
│                 │    │  (Direct Calls)  │    │  Scenarios      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
         │
         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Agents     │───▶│  Make Cloud MCP  │───▶│  Make.com       │
│                 │    │  Server          │    │  (via MCP)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 IMPLEMENTATION

### **1. Scenario Upload (Manual)**
Upload the scenario file to Make.com web interface:

**File**: `data/customers/shelly-mizrahi/shelly-family-research-scenario-final.json`

**Steps**:
1. Go to https://us2.make.com
2. Login to your account
3. Create new scenario
4. Import the JSON file
5. Save and activate

### **2. Scenario Execution (API)**
Use the API key for programmatic execution:

```javascript
// ✅ CORRECT: Use API key for execution
const response = await axios.post('https://us2.make.com/api/v2/scenarios/{scenarioId}/executions', {
  input: {
    client_id: 'SHELLY_FAMILY_001',
    family_member_ids: '039426341,301033270',
    research_depth: 'comprehensive'
  }
}, {
  headers: {
    'Authorization': `Token 7cca707a-9429-4997-8ba9-fc67fc7e4b29`,
    'Content-Type': 'application/json'
  }
});
```

### **3. MCP Integration**
Use the MCP token for AI agent interactions:

```javascript
// ✅ CORRECT: Use MCP token for MCP server
const mcpUrl = 'https://us2.make.com/mcp/api/v1/u/a88300ab-4048-4376-a396-0006d0c637c7/sse';
```

## 📝 SCENARIO WORKFLOW

### **Step 1: Upload Scenario (Manual)**
1. Download `data/customers/shelly-mizrahi/shelly-family-research-scenario-final.json`
2. Go to https://us2.make.com
3. Create new scenario
4. Import the JSON file
5. Configure connections (OpenAI, Surense)
6. Save and activate

### **Step 2: Execute Scenario (API)**
```javascript
const executionData = {
  input: {
    client_id: 'SHELLY_FAMILY_001',
    family_member_ids: '039426341,301033270',
    research_depth: 'comprehensive'
  }
};
```

### **Step 3: Monitor Results**
```javascript
// Check execution status
const response = await axios.get('https://us2.make.com/api/v2/executions/{executionId}', {
  headers: {
    'Authorization': `Token 7cca707a-9429-4997-8ba9-fc67fc7e4b29`
  }
});
```

## 🎯 SHELLY'S SPECIFIC IMPLEMENTATION

### **Family Data**
- **Client ID**: `SHELLY_FAMILY_001`
- **Family Members**: `039426341,301033270`
- **Research Depth**: `comprehensive`

### **Scenario Modules**
1. **Manual Trigger** - Input family data
2. **OpenAI Research Agent** - Research family members
3. **OpenAI Document Generator** - Create Hebrew profile
4. **Surense Lead Creator** - Create lead in Surense
5. **Surense Document Upload** - Upload profile document
6. **Customer Portal Webhook** - Update portal

## 🔧 CLEANUP REQUIRED

### **Files to Delete**
- All old Make.com integration files
- Conflicting MCP server implementations
- Outdated documentation

### **Files to Keep**
- This guide (MAKE_COM_INTEGRATION_GUIDE.md)
- Clean API implementation
- Clean MCP implementation

## ✅ SUCCESS CRITERIA

1. ✅ Scenario created via API with correct format
2. ✅ Scenario executed with family data (039426341, 301033270)
3. ✅ Surense integration working
4. ✅ Customer portal updated
5. ✅ No authentication errors
6. ✅ Clean, documented codebase

---
*Last Updated: 2025-01-27*
*API Key: 7cca707a-9429-4997-8ba9-fc67fc7e4b29*
*MCP Token: a88300ab-4048-4376-a396-0006d0c637c7*
*Organization: 4994164*
