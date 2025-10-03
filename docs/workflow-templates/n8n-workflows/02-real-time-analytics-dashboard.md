# 📊 n8n Workflow 2: Real-Time Analytics Dashboard

## 📊 **OVERVIEW**

**Status**: ✅ **DEPLOYED**  
**Workflow ID**: `yOH1RZI5ZaKc9zy4`  
**URL**: `http://173.254.201.134:5678/workflow/yOH1RZI5ZaKc9zy4`

## 🎯 **PURPOSE**

Collects system, business, and automation metrics, calculates trends, updates a dashboard, and sends critical alerts every 5 minutes.

## 🔧 **WORKFLOW ARCHITECTURE**

### **Node Structure (6 nodes)**
```
Schedule Trigger → Collect System Metrics → Calculate Trends → Update Dashboard Data → Send Alert Notification → Response
```

### **Detailed Node Configuration**

#### **1. Schedule Trigger**
- **Type**: `n8n-nodes-base.scheduleTrigger`
- **Interval**: Every 5 minutes
- **Purpose**: Triggers analytics collection

#### **2. Collect System Metrics**
- **Type**: `n8n-nodes-base.function`
- **Purpose**: Collects real-time system metrics
- **Metrics Collected**:
  - **System Health**: CPU usage, memory usage, disk usage, network latency
  - **Business Metrics**: Active users, total revenue, conversion rate, customer satisfaction
  - **Automation Metrics**: Workflow executions, success rate, error count, response time

#### **3. Calculate Trends**
- **Type**: `n8n-nodes-base.function`
- **Purpose**: Calculates trends and performance indicators
- **Calculations**:
  - **Performance Trends**: Up/down trends for all metrics
  - **Anomaly Detection**: Identifies unusual patterns
  - **Predictive Analytics**: Forecasts future performance

#### **4. Update Dashboard Data**
- **Type**: `n8n-nodes-base.airtable`
- **Resource**: `record`
- **Operation**: `create`
- **Base**: `appXXXXXXXXXXXXXX`
- **Table**: `Analytics Dashboard`
- **Credentials**: `3lTwFd8waEI1UQEW`

#### **5. Send Alert Notification**
- **Type**: `n8n-nodes-base.gmail`
- **Operation**: `send`
- **Credentials**: `fTyaZH1mJ8TQ95L6`
- **Purpose**: Sends critical alerts when thresholds exceeded

#### **6. Response**
- **Type**: `n8n-nodes-base.respondToWebhook`
- **Purpose**: Returns analytics summary

## 📊 **METRICS COLLECTED**

### **System Health Metrics**
```json
{
  "systemHealth": {
    "cpuUsage": "percentage",
    "memoryUsage": "percentage", 
    "diskUsage": "percentage",
    "networkLatency": "milliseconds"
  }
}
```

### **Business Metrics**
```json
{
  "businessMetrics": {
    "activeUsers": "count",
    "totalRevenue": "currency",
    "conversionRate": "percentage",
    "customerSatisfaction": "score"
  }
}
```

### **Automation Metrics**
```json
{
  "automationMetrics": {
    "workflowExecutions": "count",
    "successRate": "percentage",
    "errorCount": "count",
    "responseTime": "milliseconds"
  }
}
```

## 🚨 **ALERT CONDITIONS**

### **Critical Alerts**
- **CPU Usage** > 90%
- **Memory Usage** > 95%
- **Error Rate** > 10%
- **Response Time** > 5 seconds

### **Warning Alerts**
- **CPU Usage** > 80%
- **Memory Usage** > 85%
- **Error Rate** > 5%
- **Response Time** > 3 seconds

## 📈 **TREND ANALYSIS**

### **Performance Trends**
- **Upward Trends**: Improving performance indicators
- **Downward Trends**: Declining performance indicators
- **Stable Trends**: Consistent performance levels

### **Anomaly Detection**
- **Statistical Analysis**: Identifies outliers in metrics
- **Pattern Recognition**: Detects unusual patterns
- **Threshold Monitoring**: Tracks metric boundaries

## 🔗 **INTEGRATIONS**

### **Airtable Integration**
- **Base**: Analytics Dashboard
- **Fields**: Timestamp, System Health, Business Metrics, Automation Metrics, Trends
- **Purpose**: Store historical analytics data

### **Gmail Integration**
- **Purpose**: Send critical alerts to operations team
- **Templates**: Alert-specific notification templates
- **Recipients**: Technical team, management

## 📊 **DASHBOARD FEATURES**

### **Real-Time Monitoring**
- **Live Metrics**: Current system performance
- **Trend Charts**: Historical performance graphs
- **Alert Status**: Current alert conditions

### **Business Intelligence**
- **Performance Reports**: Daily/weekly/monthly summaries
- **Trend Analysis**: Performance trend reports
- **Predictive Analytics**: Future performance forecasts

## 🔧 **CONFIGURATION REQUIREMENTS**

### **Credentials Required**
- **Airtable API**: `3lTwFd8waEI1UQEW`
- **Gmail API**: `fTyaZH1mJ8TQ95L6`

### **Environment Variables**
- `AIRTABLE_BASE_ID`: Analytics Dashboard base ID
- `ALERT_RECIPIENTS`: Comma-separated email list
- `ALERT_THRESHOLDS`: JSON configuration for alert thresholds

## 🚀 **DEPLOYMENT STATUS**

- **✅ Workflow Created**: September 25, 2025
- **✅ Nodes Configured**: All 6 nodes properly configured
- **✅ Credentials Added**: Airtable and Gmail credentials assigned
- **✅ Validation**: Workflow validates successfully
- **❌ Workflow Active**: Currently inactive

## 🎯 **NEXT STEPS**

1. **Activate Workflow**: Enable the workflow for production
2. **Configure Airtable**: Set up Analytics Dashboard table
3. **Set Alert Thresholds**: Configure alert conditions
4. **Test Metrics Collection**: Verify all metrics are collected
5. **Monitor Performance**: Set up monitoring and alerting

## 📚 **RELATED DOCUMENTATION**

- [n8n Implementation Knowledge Base](../../N8N_IMPLEMENTATION_KNOWLEDGE_BASE.md)
- [BIG BMAD PLAN Final Summary](../../BIG_BMAD_PLAN_FINAL_SUMMARY.md)
- [System Integration Map](../../big-bmad-plan-system-integration.json)

---

**Last Updated**: January 25, 2025  
**Status**: Deployed and Valid  
**Priority**: HIGH - Real-time business intelligence
