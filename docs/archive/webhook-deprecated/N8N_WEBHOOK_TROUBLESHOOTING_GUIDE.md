# 🚨 N8N WEBHOOK TROUBLESHOOTING GUIDE

**Date**: January 16, 2025  
**Status**: ✅ **COMPREHENSIVE WEBHOOK ISSUES & SOLUTIONS DOCUMENTED**

## 🎯 **OVERVIEW**

This guide documents all webhook issues encountered in the Rensto project and their solutions. It serves as the single source of truth for webhook troubleshooting.

---

## 🔍 **COMMON WEBHOOK ISSUES & SOLUTIONS**

### **Issue 1: Webhook Returns 404 "Not Registered"**

**Symptoms:**
```json
{
  "code": 404,
  "message": "The requested webhook \"POST webhook-name\" is not registered.",
  "hint": "The workflow must be active for a production URL to run successfully."
}
```

**Root Causes:**
1. **Workflow Not Active**: Workflow shows as active in API but webhook not registered
2. **Webhook Path Conflict**: Multiple workflows using same webhook path
3. **Server Registration Issue**: n8n server not properly registering webhooks
4. **API Key Issues**: Incorrect or expired API keys

**Solutions:**

#### **Solution 1A: Check Workflow Status**
```bash
# List all workflows
mcp_n8n-mcp_n8n_list_workflows

# Get specific workflow details
mcp_n8n-mcp_n8n_get_workflow --id "WORKFLOW_ID"

# Verify workflow is active
# Look for "active": true in response
```

#### **Solution 1B: Resolve Webhook Path Conflicts**
```bash
# Check for conflicting workflows
mcp_n8n-mcp_n8n_list_workflows --limit 50

# Deactivate conflicting workflow
mcp_n8n-mcp_n8n_update_partial_workflow \
  --id "CONFLICTING_WORKFLOW_ID" \
  --operations '[{"type": "disableNode", "nodeId": "webhook-node-id"}]'

# Activate correct workflow
mcp_n8n-mcp_n8n_update_partial_workflow \
  --id "CORRECT_WORKFLOW_ID" \
  --operations '[{"type": "enableNode", "nodeId": "webhook-node-id"}]'
```

#### **Solution 1C: Force Webhook Registration**
```bash
# Update workflow to force webhook re-registration
mcp_n8n-mcp_n8n_update_full_workflow \
  --id "WORKFLOW_ID" \
  --name "Workflow Name" \
  --nodes "WORKFLOW_NODES" \
  --connections "WORKFLOW_CONNECTIONS" \
  --settings "WORKFLOW_SETTINGS"
```

#### **Solution 1D: Test Webhook Directly**
```bash
# Test webhook endpoint
curl -X POST http://173.254.201.134:5678/webhook/webhook-name \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Expected success response:
# {"success": true, "message": "Webhook processed"}
```

---

### **Issue 2: Webhook Execution Fails**

**Symptoms:**
- Webhook receives request but workflow execution fails
- Workflow shows as "finished: false"
- No data processed in subsequent nodes

**Root Causes:**
1. **Node Configuration Errors**: Incorrect node parameters
2. **Data Validation Failures**: Missing required fields
3. **API Credential Issues**: Expired or incorrect credentials
4. **Node Dependencies**: Missing or incorrect node connections

**Solutions:**

#### **Solution 2A: Check Workflow Executions**
```bash
# List recent executions
mcp_n8n-mcp_n8n_list_executions --workflowId "WORKFLOW_ID" --limit 10

# Get execution details
mcp_n8n-mcp_n8n_get_execution --id "EXECUTION_ID" --includeData true

# Look for error messages in execution data
```

#### **Solution 2B: Validate Node Configuration**
```bash
# Get workflow structure
mcp_n8n-mcp_n8n_get_workflow_structure --id "WORKFLOW_ID"

# Check node parameters and connections
# Verify all required fields are present
# Ensure node connections are correct
```

#### **Solution 2C: Test Individual Nodes**
```bash
# Test webhook node with minimal data
curl -X POST http://173.254.201.134:5678/webhook/webhook-name \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "businessDescription": "Test business",
    "targetLeads": "test leads"
  }'
```

---

### **Issue 3: Webhook Data Validation Errors**

**Symptoms:**
- Workflow fails at validation node
- Error: "Missing required fields"
- Data not reaching subsequent nodes

**Root Causes:**
1. **Field Name Mismatches**: Frontend sends different field names than expected
2. **Data Type Issues**: Wrong data types (string vs number)
3. **Missing Required Fields**: Frontend not sending all required data
4. **Nested Data Structure**: Data nested in unexpected structure

**Solutions:**

#### **Solution 3A: Fix Field Mappings**
```javascript
// In validation node, map frontend fields to expected fields
const webhookData = $input.first().json.body || $input.first().json;

const mappedData = {
  firstName: webhookData.firstName || webhookData.first_name,
  lastName: webhookData.lastName || webhookData.last_name,
  email: webhookData.email,
  businessDescription: webhookData.businessDescription || webhookData.business_description,
  targetLeads: webhookData.targetLeads || webhookData.target_leads,
  // Add other field mappings as needed
};
```

#### **Solution 3B: Add Data Validation**
```javascript
// Comprehensive validation with helpful error messages
const requiredFields = ['firstName', 'lastName', 'email', 'businessDescription', 'targetLeads'];
const missingFields = [];

for (const field of requiredFields) {
  if (!webhookData[field]) {
    missingFields.push(field);
  }
}

if (missingFields.length > 0) {
  throw new Error(`Missing required fields: ${missingFields.join(', ')}. Received data: ${JSON.stringify(webhookData)}`);
}
```

#### **Solution 3C: Handle Nested Data**
```javascript
// Handle different data structures
const data = $input.first().json;

// Check if data is nested in body
const webhookData = data.body || data;

// Check if data is nested in request
const requestData = data.request || data;

// Use the appropriate data source
const finalData = webhookData || requestData || data;
```

---

### **Issue 4: Webhook CORS Issues**

**Symptoms:**
- Browser shows CORS errors
- Frontend cannot make requests to webhook
- "Access-Control-Allow-Origin" errors

**Solutions:**

#### **Solution 4A: Configure CORS Headers**
```javascript
// In webhook node options, add CORS headers
{
  "options": {
    "responseHeaders": {
      "entries": [
        {
          "name": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "name": "Access-Control-Allow-Methods",
          "value": "POST, OPTIONS"
        },
        {
          "name": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  }
}
```

#### **Solution 4B: Handle OPTIONS Requests**
```javascript
// Add OPTIONS request handling in webhook node
if ($input.first().json.method === 'OPTIONS') {
  return [{
    json: {
      success: true,
      message: 'CORS preflight successful'
    }
  }];
}
```

---

### **Issue 5: Webhook Timeout Issues**

**Symptoms:**
- Webhook requests timeout
- Long-running workflows fail
- Frontend shows timeout errors

**Solutions:**

#### **Solution 5A: Optimize Workflow Performance**
```javascript
// Use efficient data processing
const leads = $input.first().json.leads || [];
const processedLeads = leads.slice(0, 100); // Limit processing

// Use batch processing for large datasets
const batchSize = 10;
const batches = [];
for (let i = 0; i < processedLeads.length; i += batchSize) {
  batches.push(processedLeads.slice(i, i + batchSize));
}
```

#### **Solution 5B: Add Progress Updates**
```javascript
// Send progress updates for long-running processes
const progress = {
  status: 'processing',
  progress: 50,
  message: 'Processing leads...',
  timestamp: new Date().toISOString()
};

// Return progress update
return [{ json: progress }];
```

---

## 🔧 **WEBHOOK TESTING PROCEDURES**

### **Step 1: Basic Webhook Test**
```bash
# Test webhook endpoint
curl -X POST http://173.254.201.134:5678/webhook/webhook-name \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### **Step 2: Full Data Test**
```bash
# Test with complete data structure
curl -X POST http://173.254.201.134:5678/webhook/webhook-name \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "businessDescription": "Test business",
    "targetLeads": "test leads",
    "leadCount": 5,
    "price": 0,
    "isTrial": true,
    "tier": "trial"
  }'
```

### **Step 3: Error Handling Test**
```bash
# Test with missing required fields
curl -X POST http://173.254.201.134:5678/webhook/webhook-name \
  -H "Content-Type: application/json" \
  -d '{"incomplete": "data"}'
```

### **Step 4: CORS Test**
```bash
# Test CORS preflight
curl -X OPTIONS http://173.254.201.134:5678/webhook/webhook-name \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

---

## 🚨 **EMERGENCY WEBHOOK RECOVERY**

### **When All Webhooks Fail:**

#### **Step 1: Check n8n Server Status**
```bash
# Check n8n health
mcp_n8n-mcp_n8n_health_check

# Expected response:
# {"status": "ok", "apiUrl": "http://173.254.201.134:5678"}
```

#### **Step 2: Restart n8n Server**
```bash
# SSH to server
ssh user@173.254.201.134

# Restart n8n service
sudo systemctl restart n8n

# Check service status
sudo systemctl status n8n
```

#### **Step 3: Recreate Critical Webhooks**
```bash
# Create new workflow with webhook
mcp_n8n-mcp_n8n_create_workflow \
  --name "Emergency Webhook" \
  --nodes "WEBHOOK_NODES" \
  --connections "WEBHOOK_CONNECTIONS"

# Activate immediately
mcp_n8n-mcp_n8n_update_partial_workflow \
  --id "NEW_WORKFLOW_ID" \
  --operations '[{"type": "enableNode", "nodeId": "webhook-node-id"}]'
```

---

## 📊 **WEBHOOK MONITORING**

### **Health Check Script**
```bash
#!/bin/bash
# webhook-health-check.sh

WEBHOOK_URL="http://173.254.201.134:5678/webhook/webhook-name"
TEST_DATA='{"test": "health_check", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'

echo "🔍 Testing webhook health..."
response=$(curl -s -w "%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

http_code="${response: -3}"
response_body="${response%???}"

if [ "$http_code" = "200" ]; then
  echo "✅ Webhook healthy (HTTP $http_code)"
  echo "Response: $response_body"
else
  echo "❌ Webhook unhealthy (HTTP $http_code)"
  echo "Response: $response_body"
  exit 1
fi
```

### **Automated Monitoring**
```bash
# Add to crontab for regular health checks
# */5 * * * * /path/to/webhook-health-check.sh
```

---

## 🎯 **BEST PRACTICES**

### **Webhook Design**
1. **Use Descriptive Paths**: `/webhook/lead-enrichment-saas` not `/webhook/webhook1`
2. **Validate Input Early**: Check required fields in first node
3. **Handle Errors Gracefully**: Return meaningful error messages
4. **Use Consistent Data Structure**: Standardize field names and types
5. **Add Logging**: Log all webhook requests and responses

### **Security**
1. **Validate All Input**: Never trust webhook data
2. **Use HTTPS**: Always use secure connections
3. **Implement Rate Limiting**: Prevent abuse
4. **Add Authentication**: Use API keys or tokens when possible
5. **Sanitize Data**: Clean input before processing

### **Performance**
1. **Optimize Node Count**: Minimize unnecessary nodes
2. **Use Efficient Data Processing**: Process data in batches
3. **Add Timeouts**: Set reasonable timeout limits
4. **Monitor Resource Usage**: Track memory and CPU usage
5. **Cache Results**: Cache frequently accessed data

---

## 📚 **REFERENCE MATERIALS**

### **n8n Webhook Documentation**
- [n8n Webhook Node](https://docs.n8n.io/integrations/builtin/cluster-nodes/n8n-nodes-base.webhook/)
- [n8n Workflow Execution](https://docs.n8n.io/workflows/executing-workflows/)
- [n8n Error Handling](https://docs.n8n.io/workflows/error-handling/)

### **Related Documentation**
- `MCP_SINGLE_SOURCE_OF_TRUTH.md` - MCP server configuration
- `N8N_WORKFLOW_CREATION_TUTORIAL_COMPLETE.md` - Workflow creation guide
- `COMPREHENSIVE_SYSTEM_STATUS_REPORT.md` - System status overview

---

**Status**: ✅ **COMPLETE** - All webhook issues and solutions documented

**Last Updated**: January 16, 2025  
**Next Review**: February 16, 2025
