# 🔗 Svix Webhook Configuration Guide

## ✅ Current Status

**Status**: 🟢 **FULLY FUNCTIONAL**  
**Last Updated**: 2025-09-21  
**Webhook URL**: `https://shellyins.app.n8n.cloud/webhook/svix-insurance-analysis`

### ✅ All Issues Resolved:
- **Test Mode Issue**: ✅ Resolved - Workflow manually executed and activated
- **Event Type Configuration**: ✅ Resolved - Correctly configured for `HarbDataLoaded`
- **Webhook Registration**: ✅ Resolved - Webhook responding with 200 OK
- **Data Processing**: ✅ Resolved - Workflow processing test data successfully

### 🔧 Final Configuration Steps:
1. **Svix Endpoint**: Configure to only subscribe to: `harb.uploaded`, `document.uploaded`
2. **Production Mode**: Workflow is now active and ready for production use
3. **Event Types**: Note that `HarbDataLoaded` is not available in Svix choices, so use `harb.uploaded`

### 📚 Documentation:
- See `WEBHOOK_ISSUES_AND_SOLUTIONS_DATABASE.md` for complete troubleshooting history

---

## 📋 **Webhook Details**

**Webhook URL**: `https://shellyins.app.n8n.cloud/webhook/svix-insurance-analysis`  
**Signing Secret**: `whsec_/lebQ0l5L5Grpc3HtPodTvFizubPwjAo`  
**HTTP Method**: POST  
**Content-Type**: application/json  

## ⚙️ **Svix Dashboard Configuration**

### **Step 1: Create New Webhook Endpoint**
1. Log into your Svix dashboard
2. Navigate to "Webhooks" section
3. Click "Create Endpoint"
4. Enter the following details:

```
Name: Insurance Analysis Webhook
URL: https://shellyins.app.n8n.cloud/webhook/svix-insurance-analysis
Description: Automated insurance analysis for new leads
```

### **Step 2: Configure Event Types**
Enable the following event types:
- ✅ `HarbDataLoaded` (Primary event for insurance analysis)
- ✅ `harb.uploaded` (Alternative event type for Har Habituah files)
- ✅ `document.uploaded` (Optional for document events)

**Important**: The n8n workflow is now configured to handle `HarbDataLoaded` events. Make sure your Svix endpoint is configured to send this specific event type.

### **Step 3: Set Security Settings**
- **Signing Secret**: `whsec_/lebQ0l5L5Grpc3HtPodTvFizubPwjAo`
- **Verification**: Enable webhook signature verification
- **Retry Policy**: Configure retry attempts (recommended: 3-5 retries)

### **Step 4: Test Configuration**
Use the test payload below to verify the webhook is working:

```json
{
  "eventType": "HarbDataLoaded",
  "date": "2025-09-21T15:43:09.766541877Z",
  "tenantId": "a803b2eb-8be7-4edd-b2e0-4d3a0ffb008d",
  "authUserId": "fbf9cfba-6aa1-443d-af3f-66a41a33f148",
  "agencyId": "13ceb0ef-d3e8-467e-b636-7adbd9bc0c2f",
  "customerId": "6f09f00c-57f8-415b-a7d3-895031533c0a",
  "firstName": "אלינור",
  "lastName": "בן מויאל",
  "hbValidityDate": "2025-09-21"
}
```

## 🧪 **Testing Commands**

### **Quick Health Check**
```bash
curl -X POST https://shellyins.app.n8n.cloud/webhook/svix-insurance-analysis \
  -H "Content-Type: application/json" \
  -d '{"eventType": "HarbDataLoaded", "data": {"test": true}}'
```

**Note**: The workflow is now configured to process `HarbDataLoaded` events. If you're still getting 404 errors, the workflow may need to be manually activated in the n8n interface.

### **Test with Sample Lead Data**
```bash
curl -X POST https://shellyins.app.n8n.cloud/webhook/svix-insurance-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "type": "lead.created",
    "data": {
      "leadId": "test-lead-'$(date +%s)'",
      "fullName": "שרה לוי",
      "age": 35,
      "city": "ירושלים",
      "email": "sarah@example.com",
      "phoneNumber1": "052-9876543",
      "monthlyIncome": 25000,
      "childCount": 3,
      "street": "רחוב יפו 100",
      "profession": "רופאה"
    }
  }'
```

## 📊 **Expected Response**

**Success Response**:
- **HTTP Status**: 200 OK
- **Response Time**: < 2 seconds
- **Response Body**: Empty (204 No Content)

**Error Response**:
- **HTTP Status**: 4xx or 5xx
- **Response Body**: Error details
- **Action**: Check n8n workflow logs

## 🔍 **Monitoring & Troubleshooting**

### **Check Webhook Status**
1. Go to Svix dashboard
2. Navigate to your webhook endpoint
3. Check "Delivery Attempts" tab
4. Review success/failure rates

### **Common Issues & Solutions**

**Issue**: Webhook returns 500 error
- **Solution**: Check n8n workflow logs for API key issues
- **Check**: Google Gemini credentials, APITemplate.io API key

**Issue**: Webhook times out
- **Solution**: Check n8n workflow performance
- **Check**: API response times, network connectivity

**Issue**: No response from webhook
- **Solution**: Verify webhook URL is correct
- **Check**: n8n workflow is active and running

## 📈 **Performance Metrics**

### **Target Performance**
- **Response Time**: < 2 seconds
- **Success Rate**: > 95%
- **Uptime**: > 99.9%

### **Monitoring Checklist**
- [ ] Daily webhook delivery success rate
- [ ] Average response time
- [ ] Error rate and types
- [ ] Retry attempts and failures

## 🚀 **Production Deployment**

### **Pre-Deployment Checklist**
- [ ] Webhook endpoint configured in Svix
- [ ] Signing secret added and verified
- [ ] Event types enabled
- [ ] Test payload successful
- [ ] Monitoring alerts configured

### **Go-Live Steps**
1. **Enable webhook** in Svix dashboard
2. **Test with real lead data** from Surense
3. **Monitor first 10 deliveries** closely
4. **Verify PDFs appear** in Surense lead records
5. **Check AI analysis quality**

## 📞 **Support Resources**

- **n8n Workflow**: https://shellyins.app.n8n.cloud/workflow/4gXdoMnharZSaMIT
- **Webhook URL**: https://shellyins.app.n8n.cloud/webhook/svix-insurance-analysis
- **Test Script**: `./test_svix_webhook.sh`
- **Monitor Script**: `./monitor_workflow.sh`

---

**Status**: ✅ **Ready for Production Configuration**

**Last Updated**: January 16, 2025
