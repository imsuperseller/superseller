# Make MCP Server Technical Instructions

## 📋 COMPLETE MCP SERVER INTEGRATION FOR SHELLY'S FAMILY RESEARCH WORKFLOW

*Generated from Make MCP Server on 2025-08-21T20:09:59.234Z*

---

## **🔗 MCP SERVER CONFIGURATION**

### **MCP Server URL:**
```
https://us2.make.com/mcp/api/v1/u/7cca707a-9429-4997-8ba9-fc67fc7e4b29/sse
```

### **MCP Configuration:**
```json
{
  "mcpServers": {
    "make": {
      "url": "https://us2.make.com/mcp/api/v1/u/7cca707a-9429-4997-8ba9-fc67fc7e4b29/sse"
    }
  }
}
```

---

## **📊 AVAILABLE SCENARIOS**

### **Found 1 scenarios:**


#### **Shelly Family Research & Profile Generator**
- **ID:** shelly-family-research
- **Description:** AI-powered family research and insurance profile generation
- **Scheduling:** On demand
- **Status:** active


---

## **🔧 SCENARIO CREATION VIA MCP**

### **Step 1: Create Shelly's Family Research Scenario**
```javascript
// Using MCP tools
await mcp.make.create_scenario({
  name: "Shelly Family Research & Profile Generator",
  description: "AI-powered family research and insurance profile generation",
  scheduling: "On demand",
  modules: [
    {
      name: "Manual Trigger",
      type: "trigger",
      config: {
        inputFields: [
          { name: "client_id", type: "text", required: true },
          { name: "family_member_ids", type: "text", required: true },
          { name: "research_depth", type: "select", options: ["basic", "comprehensive", "deep"] }
        ]
      }
    }
  ]
});
```

### **Step 2: Execute Scenario via MCP**
```javascript
// Execute family research
await mcp.make.execute_scenario({
  scenarioId: "shelly-family-research",
  input: {
    client_id: "CLIENT123",
    family_member_ids: "MEMBER1,MEMBER2,MEMBER3",
    research_depth: "comprehensive"
  }
});
```

### **Step 3: Monitor Execution**
```javascript
// Check execution status
await mcp.make.get_execution_status({
  executionId: "execution_id_from_step_2"
});
```

---

## **🎯 MCP TOOLS FOR SHELLY**

### **Available MCP Tools:**
1. **list_scenarios** - List all available scenarios
2. **get_scenario** - Get specific scenario details
3. **create_scenario** - Create new scenario
4. **execute_scenario** - Execute scenario with input
5. **get_execution_status** - Check execution status
6. **update_scenario** - Update existing scenario
7. **delete_scenario** - Delete scenario

### **Shelly's Custom Tools:**
1. **create_shelly_family_research** - Create family research scenario
2. **execute_family_research** - Execute family research workflow
3. **get_family_profile** - Get generated family profile
4. **upload_to_surense** - Upload profile to Surense

---

## **🚀 IMMEDIATE USAGE**

### **Create Shelly's Workflow:**
```javascript
// Create the complete family research workflow
await mcp.make.create_shelly_family_research({
  name: "Shelly Family Research & Profile Generator",
  description: "AI-powered family research and insurance profile generation",
  modules: [
    "Manual Trigger",
    "OpenAI Research Agent", 
    "OpenAI Document Generator",
    "Surense Lead Creator",
    "Surense Document Upload",
    "Customer Portal Webhook"
  ]
});
```

### **Execute Family Research:**
```javascript
// Execute with test data
await mcp.make.execute_family_research({
  client_id: "TEST123",
  family_member_ids: "MEMBER1,MEMBER2,MEMBER3",
  research_depth: "comprehensive"
});
```

---

## **📊 API ENDPOINTS**

### **Scenarios:**
- **GET** `/api/v2/scenarios` - List all scenarios
- **GET** `/api/v2/scenarios/{id}` - Get scenario details
- **POST** `/api/v2/scenarios` - Create new scenario
- **PUT** `/api/v2/scenarios/{id}` - Update scenario
- **DELETE** `/api/v2/scenarios/{id}` - Delete scenario

### **Executions:**
- **POST** `/api/v2/scenarios/{id}/executions` - Execute scenario
- **GET** `/api/v2/scenarios/{id}/executions/{executionId}` - Get execution status

### **MCP:**
- **SSE** `/mcp/api/v1/u/{token}/sse` - MCP Server endpoint

---

## **🔐 AUTHENTICATION**

### **API Key:**
```
7cca707a-9429-4997-8ba9-fc67fc7e4b29
```

### **Permissions:**
- admin:read
- admin:write
- agents:read
- agents:write
- ai-agents:read
- ai-agents:write
- analytics:read
- analytics:write
- apps:read
- apps:write
- connections:read
- connections:write
- credential-requests:read
- credential-requests:write
- custom-property-structures:read
- custom-property-structures:write
- datastores:read
- datastores:write
- devices:read
- devices:write
- dlqs:read
- dlqs:write
- functions:read
- functions:write
- hitl:read
- hitl:write
- hooks:read
- hooks:write
- imt-forms:read
- instances:read
- instances:write
- keys:read
- keys:write
- notifications:read
- notifications:write
- organizations:read
- organizations:write
- organization-variables:read
- organization-variables:write
- portal:read
- portal:write
- scenarios:read
- scenarios:run
- scenarios:write
- sdk-apps:read
- sdk-apps:write
- system:read
- system:write
- teams:read
- teams:write
- team-variables:read
- team-variables:write
- templates:read
- templates:write
- udts:read
- udts:write
- user:read
- user:write

---

## **📋 NEXT STEPS**

1. **Configure MCP Client** with the provided configuration
2. **Test MCP Connection** using the tools
3. **Create Shelly's Scenario** via MCP
4. **Execute Test Run** with sample data
5. **Monitor Results** and optimize
6. **Deploy to Production** for Shelly

---

*Generated from Make MCP Server integration with full API access*
