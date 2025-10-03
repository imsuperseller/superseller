# 🚀 WEBHOOK MASTER CONTROL SYSTEM

**Date**: 2025-09-21  
**Status**: 🟢 **ACTIVE & MONITORED**  
**Purpose**: Single source of truth for all webhook management, monitoring, and troubleshooting

---

## 🎯 **SYSTEM OVERVIEW**

This is the **ONLY** webhook documentation file you need. All other webhook-related MD files are deprecated and should be referenced through this master system.

### **Core Principles:**
1. **Single Source of Truth**: All webhook info in one place
2. **Proactive Monitoring**: Prevent issues before they happen
3. **Automated Recovery**: Self-healing webhook system
4. **Comprehensive Testing**: Every webhook tested before deployment

---

## 📊 **ACTIVE WEBHOOKS STATUS**

### **Production Webhooks**
| Webhook Name | URL | Status | Last Test | Event Types | Owner |
|--------------|-----|--------|-----------|-------------|-------|
| **svix-insurance-analysis** | `https://shellyins.app.n8n.cloud/webhook/svix-insurance-analysis` | 🟢 **ACTIVE** | 2025-09-21 | `HarbDataLoaded`, `harb.uploaded`, `document.uploaded` | Shelly |
| **lead-enrichment-saas** | `http://173.254.201.134:5678/webhook/lead-enrichment-saas` | 🟡 **TESTING** | 2025-01-16 | `lead.created`, `lead.updated` | SaaS System |

### **Test Webhooks**
| Webhook Name | URL | Status | Purpose |
|--------------|-----|--------|---------|
| **svix-test** | `https://shellyins.app.n8n.cloud/webhook-test/svix-insurance-analysis` | 🟡 **TEST MODE** | Testing & Development (requires manual activation) |

---

## 🔧 **WEBHOOK CONFIGURATION STANDARDS**

### **Required Webhook Node Configuration**
```json
{
  "name": "Webhook Node Name",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1,
  "position": [x, y],
  "parameters": {
    "path": "descriptive-webhook-name",
    "httpMethod": "POST",
    "responseMode": "responseNode",
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
}
```

### **Required Event Filter Configuration**
```json
{
  "name": "⚡ Event Type Filter",
  "type": "n8n-nodes-base.if",
  "typeVersion": 2.2,
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "strict"
      },
      "conditions": [
        {
          "id": "event-type-check",
          "leftValue": "={{ $json.body.eventType }}",
          "rightValue": "EXPECTED_EVENT_TYPE",
          "operator": {
            "type": "string",
            "operation": "equals"
          }
        }
      ],
      "combinator": "and"
    }
  }
}
```

### **Required Data Processor Configuration**
```javascript
// Handle multiple data structures
const data = $input.first().json;
const webhookData = data.body?.data || data.body || data;

// Validate required fields
const requiredFields = ['field1', 'field2', 'field3'];
const missingFields = requiredFields.filter(field => !webhookData[field]);

if (missingFields.length > 0) {
  throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
}

// Return processed data
return [{ json: webhookData }];
```

---

## 🚨 **WEBHOOK HEALTH MONITORING**

### **Automated Health Check Script**
```bash
#!/bin/bash
# webhook-health-monitor.sh

WEBHOOKS=(
  "https://shellyins.app.n8n.cloud/webhook/svix-insurance-analysis:HarbDataLoaded"
  "http://173.254.201.134:5678/webhook/lead-enrichment-saas:lead.created"
)

for webhook in "${WEBHOOKS[@]}"; do
  IFS=':' read -r url event_type <<< "$webhook"
  
  echo "🔍 Testing $url..."
  
  response=$(curl -s -w "%{http_code}" -X POST "$url" \
    -H "Content-Type: application/json" \
    -d "{\"eventType\": \"$event_type\", \"test\": true, \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}")
  
  http_code="${response: -3}"
  response_body="${response%???}"
  
  if [ "$http_code" = "200" ]; then
    echo "✅ $url - HEALTHY (HTTP $http_code)"
  else
    echo "❌ $url - UNHEALTHY (HTTP $http_code)"
    echo "Response: $response_body"
    
    # Send alert
    echo "🚨 WEBHOOK ALERT: $url is down!" | tee -a /var/log/webhook-alerts.log
  fi
done
```

### **Health Check Schedule**
```bash
# Add to crontab for monitoring
# Every 5 minutes
*/5 * * * * /path/to/webhook-health-monitor.sh

# Every hour - detailed report
0 * * * * /path/to/webhook-health-monitor.sh > /var/log/webhook-health-$(date +\%Y\%m\%d\%H).log
```

---

## 🔍 **TROUBLESHOOTING MATRIX**

### **Issue: 404 "Not Registered"**
| Cause | Solution | Command |
|-------|----------|---------|
| Workflow inactive | Activate workflow | `mcp_n8n-mcp_n8n_update_partial_workflow --id "ID" --operations '[{"type": "enableNode", "nodeId": "webhook-id"}]'` |
| Test mode | Execute workflow | Click "Execute workflow" in n8n interface |
| Path conflict | Deactivate conflicting workflow | `mcp_n8n-mcp_n8n_update_partial_workflow --id "CONFLICT_ID" --operations '[{"type": "disableNode", "nodeId": "webhook-id"}]'` |
| Server issue | Restart n8n | `sudo systemctl restart n8n` |

### **Issue: Data Validation Errors**
| Cause | Solution | Code |
|-------|----------|------|
| Field mismatch | Map fields | `const data = $input.first().json.body || $input.first().json;` |
| Missing fields | Add validation | `if (!data.requiredField) throw new Error('Missing requiredField');` |
| Wrong data type | Type conversion | `const num = parseInt(data.stringNumber) || 0;` |

### **Issue: CORS Errors**
| Cause | Solution | Configuration |
|-------|----------|---------------|
| Missing headers | Add CORS headers | See webhook node configuration above |
| OPTIONS not handled | Handle OPTIONS | `if ($input.first().json.method === 'OPTIONS') return [{json: {success: true}}];` |

---

## 🧪 **TESTING PROTOCOL**

### **Pre-Deployment Testing**
1. **Unit Test**: Test webhook node with minimal data
2. **Integration Test**: Test full workflow with real data
3. **Load Test**: Test with multiple concurrent requests
4. **Error Test**: Test with invalid/missing data

### **Test Commands**
```bash
# Basic test
curl -X POST WEBHOOK_URL -H "Content-Type: application/json" -d '{"test": true}'

# Full data test
curl -X POST WEBHOOK_URL -H "Content-Type: application/json" -d '{
  "eventType": "EXPECTED_EVENT",
  "data": {
    "field1": "value1",
    "field2": "value2"
  }
}'

# Error test
curl -X POST WEBHOOK_URL -H "Content-Type: application/json" -d '{"incomplete": "data"}'
```

---

## 📋 **DEPLOYMENT CHECKLIST**

### **Before Creating New Webhook**
- [ ] Check for existing webhook with same path
- [ ] Verify event types are correct
- [ ] Test webhook node configuration
- [ ] Add proper CORS headers
- [ ] Configure event type filter
- [ ] Add data validation
- [ ] Test with sample data

### **After Creating Webhook**
- [ ] Activate workflow
- [ ] Test webhook endpoint
- [ ] Verify event processing
- [ ] Add to health monitoring
- [ ] Update this documentation
- [ ] Test error handling

### **Before Production Use**
- [ ] Run full test suite
- [ ] Verify all integrations work
- [ ] Check error handling
- [ ] Monitor for 24 hours
- [ ] Update monitoring scripts

---

## 🗂️ **DEPRECATED FILES**

The following files are now **DEPRECATED** and should not be used:

### **Archived Files:**
All webhook documentation has been consolidated into this master system. The following files have been archived and should not be referenced:

- ❌ `docs/archive/webhook-deprecated/WEBHOOK_ISSUES_AND_SOLUTIONS_DATABASE.md` - Archived
- ❌ `docs/archive/webhook-deprecated/SVIX_WEBHOOK_CONFIGURATION.md` - Archived  
- ❌ `docs/archive/webhook-deprecated/WEBHOOK_ISSUES_SUMMARY_JAN_16_2025.md` - Archived
- ❌ `docs/archive/webhook-deprecated/N8N_WEBHOOK_TROUBLESHOOTING_GUIDE.md` - Archived

**Note**: All information from these files has been merged into this master control system. Do not reference the archived files.

---

## 🚀 **AUTOMATED WEBHOOK MANAGEMENT**

### **Webhook Creation Script**
```bash
#!/bin/bash
# create-webhook.sh

WEBHOOK_NAME=$1
EVENT_TYPE=$2
WORKFLOW_ID=$3

if [ -z "$WEBHOOK_NAME" ] || [ -z "$EVENT_TYPE" ] || [ -z "$WORKFLOW_ID" ]; then
  echo "Usage: $0 <webhook-name> <event-type> <workflow-id>"
  exit 1
fi

echo "🚀 Creating webhook: $WEBHOOK_NAME"
echo "📡 Event type: $EVENT_TYPE"
echo "🔄 Workflow ID: $WORKFLOW_ID"

# Create webhook node configuration
cat > /tmp/webhook-config.json << EOF
{
  "name": "Webhook - $WEBHOOK_NAME",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1,
  "position": [100, 200],
  "parameters": {
    "path": "$WEBHOOK_NAME",
    "httpMethod": "POST",
    "responseMode": "responseNode",
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
}
EOF

# Create event filter configuration
cat > /tmp/event-filter-config.json << EOF
{
  "name": "⚡ Event Type Filter",
  "type": "n8n-nodes-base.if",
  "typeVersion": 2.2,
  "position": [300, 200],
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "strict"
      },
      "conditions": [
        {
          "id": "event-type-check",
          "leftValue": "={{ \$json.body.eventType }}",
          "rightValue": "$EVENT_TYPE",
          "operator": {
            "type": "string",
            "operation": "equals"
          }
        }
      ],
      "combinator": "and"
    }
  }
}
EOF

echo "✅ Webhook configuration created"
echo "📝 Next steps:"
echo "1. Add webhook node to workflow $WORKFLOW_ID"
echo "2. Add event filter node"
echo "3. Connect nodes"
echo "4. Test webhook"
echo "5. Add to health monitoring"
```

### **Webhook Testing Script**
```bash
#!/bin/bash
# test-webhook.sh

WEBHOOK_URL=$1
EVENT_TYPE=$2

if [ -z "$WEBHOOK_URL" ] || [ -z "$EVENT_TYPE" ]; then
  echo "Usage: $0 <webhook-url> <event-type>"
  exit 1
fi

echo "🧪 Testing webhook: $WEBHOOK_URL"
echo "📡 Event type: $EVENT_TYPE"

# Test data
TEST_DATA='{
  "eventType": "'$EVENT_TYPE'",
  "data": {
    "test": true,
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "source": "automated-test"
  }
}'

echo "📤 Sending test data..."
response=$(curl -s -w "%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

http_code="${response: -3}"
response_body="${response%???}"

echo "📥 Response (HTTP $http_code):"
echo "$response_body"

if [ "$http_code" = "200" ]; then
  echo "✅ Webhook test PASSED"
  exit 0
else
  echo "❌ Webhook test FAILED"
  exit 1
fi
```

---

## 📊 **MONITORING DASHBOARD**

### **Real-time Status**
```bash
# Check all webhook statuses
echo "🔍 WEBHOOK STATUS DASHBOARD"
echo "=========================="
echo ""

# Check Shelly webhook
echo "📡 Shelly Insurance Webhook:"
curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s\n" \
  -X POST https://shellyins.app.n8n.cloud/webhook/svix-insurance-analysis \
  -H "Content-Type: application/json" \
  -d '{"eventType": "HarbDataLoaded", "test": true}'

# Check SaaS webhook
echo "📡 SaaS Lead Enrichment Webhook:"
curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s\n" \
  -X POST http://173.254.201.134:5678/webhook/lead-enrichment-saas \
  -H "Content-Type: application/json" \
  -d '{"eventType": "lead.created", "test": true}'

echo ""
echo "📊 Last 24h webhook calls:"
grep "$(date +%Y-%m-%d)" /var/log/webhook-health-*.log | wc -l
```

---

## 🎯 **SUCCESS METRICS**

### **Webhook Health KPIs**
- **Uptime**: > 99.9%
- **Response Time**: < 2 seconds
- **Error Rate**: < 0.1%
- **Test Coverage**: 100%

### **Monthly Review**
- Review all webhook performance
- Update documentation
- Test disaster recovery
- Optimize slow webhooks

---

## 🚨 **EMERGENCY PROCEDURES**

### **Webhook Down - Immediate Response**
1. **Check Status**: Run health check script
2. **Identify Issue**: Check troubleshooting matrix
3. **Apply Fix**: Use appropriate solution
4. **Test**: Verify webhook is working
5. **Monitor**: Watch for 1 hour
6. **Document**: Update this file with issue details

### **Multiple Webhooks Down**
1. **Check n8n Server**: `sudo systemctl status n8n`
2. **Restart n8n**: `sudo systemctl restart n8n`
3. **Wait 2 minutes**: Let services start
4. **Test All Webhooks**: Run full health check
5. **Escalate**: If still down, contact infrastructure team

---

**Status**: 🟢 **ACTIVE & MONITORED**  
**Last Updated**: 2025-09-21  
**Next Review**: 2025-10-21  
**Maintainer**: AI Assistant

---

## 📞 **SUPPORT CONTACTS**

- **n8n Issues**: Check n8n logs first, then contact infrastructure
- **Webhook Configuration**: Reference this document
- **Emergency**: Use emergency procedures above

**Remember**: This is your single source of truth for all webhook management. Keep it updated and use it for all webhook operations.
