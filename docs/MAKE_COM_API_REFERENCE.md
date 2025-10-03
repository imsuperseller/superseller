# Make.com API Reference - Correct Implementation

## ✅ **CORRECT API ENDPOINTS & SYNTAX**

### **Base Configuration:**
```json
{
  "baseUrl": "https://us2.make.com",
  "apiKey": "8b8f13b7-8bda-43cb-ba4c-b582243cf5b9",
  "organizationId": 4994164,
  "teamId": 1300459
}
```

### **Authentication:**
```bash
Authorization: Token 8b8f13b7-8bda-43cb-ba4c-b582243cf5b9
Content-Type: application/json
```

## 📋 **SCENARIO ENDPOINTS**

### **List Scenarios:**
```bash
GET https://us2.make.com/api/v2/scenarios?teamId=1300459
```

### **Get Specific Scenario:**
```bash
GET https://us2.make.com/api/v2/scenarios/{scenarioId}?teamId=1300459
```

### **Create Scenario:**
```bash
POST https://us2.make.com/api/v2/scenarios?teamId=1300459
Body: {
  "name": "Scenario Name",
  "description": "Description",
  "scheduling": "{\"type\": \"immediately\"}"
}
```

### **Update Scenario:**
```bash
PATCH https://us2.make.com/api/v2/scenarios/{scenarioId}?teamId=1300459
Body: {
  "name": "Updated Name",
  "description": "Updated Description"
}
```

### **Delete Scenario:**
```bash
DELETE https://us2.make.com/api/v2/scenarios/{scenarioId}?teamId=1300459
```

### **Activate Scenario:**
```bash
PATCH https://us2.make.com/api/v2/scenarios/{scenarioId}?teamId=1300459
Body: {
  "scheduling": "{\"type\": \"immediately\"}"
}
```

### **Deactivate Scenario:**
```bash
PATCH https://us2.make.com/api/v2/scenarios/{scenarioId}?teamId=1300459
Body: {
  "scheduling": "{\"type\": \"on-demand\"}"
}
```

### **Execute Scenario:**
```bash
POST https://us2.make.com/api/v2/scenarios/{scenarioId}/executions?teamId=1300459
Body: {
  "input": {}
}
```

## 🚫 **COMMON MISTAKES TO AVOID**

### **❌ Wrong Endpoint Format:**
```bash
# WRONG - Don't use this format
/api/v2/scenarios?teamId=${teamId}&scenarioId=${scenarioId}

# CORRECT - Use this format
/api/v2/scenarios/${scenarioId}?teamId=${teamId}
```

### **❌ Wrong Activation Method:**
```bash
# WRONG - isActive field doesn't work
{"isActive": true}

# CORRECT - Use scheduling field
{"scheduling": "{\"type\": \"immediately\"}"}
```

### **❌ Wrong Parameter Names:**
```bash
# WRONG - updates parameter
updateScenario({scenarioId, updates})

# CORRECT - blueprint parameter  
updateScenario({scenarioId, blueprint})
```

## ✅ **WORKING EXAMPLES**

### **Test Activation:**
```bash
curl -X PATCH "https://us2.make.com/api/v2/scenarios/2983190?teamId=1300459" \
  -H "Authorization: Token 8b8f13b7-8bda-43cb-ba4c-b582243cf5b9" \
  -H "Content-Type: application/json" \
  -d '{"scheduling": "{\"type\": \"immediately\"}"}'
```

### **Test Update:**
```bash
curl -X PATCH "https://us2.make.com/api/v2/scenarios/2983190?teamId=1300459" \
  -H "Authorization: Token 8b8f13b7-8bda-43cb-ba4c-b582243cf5b9" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Scenario Name"}'
```

### **Test List:**
```bash
curl -X GET "https://us2.make.com/api/v2/scenarios?teamId=1300459" \
  -H "Authorization: Token 8b8f13b7-8bda-43cb-ba4c-b582243cf5b9" \
  -H "Content-Type: application/json"
```

## 🎯 **KEY LEARNINGS**

1. **Endpoint Structure**: Always use `/api/v2/scenarios/{scenarioId}?teamId={teamId}`
2. **Activation**: Use `scheduling` field with JSON string, not `isActive`
3. **Parameters**: Use `blueprint` parameter for updates, not `updates`
4. **Authentication**: Token-based auth works perfectly
5. **Team ID**: Always include `teamId=1300459` in query parameters

## 📊 **CURRENT WORKING SCENARIOS**

- ✅ **2983190** - Surense Data Fetcher - Fixed, active, immediately
- ✅ **2983200** - Surense Action Processor, active, immediately  
- ✅ **3022209** - Integration Webhooks, active, on-demand
- ⚠️ **2919298** - Upload to n8n, invalid, needs fixing

---

**Last Updated**: September 19, 2025  
**Status**: ✅ **ALL ENDPOINTS WORKING**  
**MCP Server**: 25 tools operational
