# 🔗 Webhook Issues and Solutions Database

## Overview
This document serves as a comprehensive database of webhook-related issues encountered in the Rensto project and their solutions. It follows the same systematic approach as the Make MCP documentation to prevent repeated troubleshooting of the same issues.

## 🚨 Current Active Issues

### Issue #1: Svix Webhook Not Responding (404 Error)
**Status**: 🔴 ACTIVE  
**Date**: 2025-09-21  
**Workflow ID**: `bsl6l4JqVQvarPR1`  
**Webhook URL**: `https://shellyins.app.n8n.cloud/webhook/svix-insurance-analysis`

**Problem**: 
- Webhook returns 404 "The requested webhook POST svix-insurance-analysis is not registered"
- Workflow shows as active in n8n interface
- Event type filter correctly configured for `HarbDataLoaded`

**Root Cause Analysis**:
1. **Event Type Mismatch**: Svix was sending `HarbDataLoaded` but workflow was filtering for `harb.uploaded`
2. **Workflow Activation**: Despite showing as active, webhook registration may be delayed or require manual intervention
3. **n8n Instance Issues**: Possible Cloudflare or n8n infrastructure delays

**Solutions Applied**:
✅ Updated event filter to handle `HarbDataLoaded` events  
✅ Updated documentation to reflect correct event types  
✅ Verified workflow configuration is correct  

**Manual Steps Required**:
1. **Check n8n Interface**: Go to `https://shellyins.app.n8n.cloud` and verify workflow is actually active
2. **Manual Activation**: Toggle the workflow off and on again in the n8n interface ✅ **COMPLETED**
3. **Check Webhook Node**: Ensure the webhook trigger node is properly configured
4. **Test in n8n**: Use the "Test" button in the webhook node to verify it's working
5. **Check n8n Instance**: Verify the n8n instance is running properly
6. **Check Cloudflare**: Verify there are no CDN caching issues

**Svix Configuration Required**:
- Update Svix endpoint to only subscribe to: `HarbDataLoaded`, `harb.uploaded`, `document.uploaded`
- Remove irrelevant event types like `lead.created`, `lead.updated`

### Issue #2: Webhook Registration Delay After Activation
**Status**: ✅ RESOLVED  
**Date**: 2025-09-21  
**Workflow ID**: `bsl6l4JqVQvarPR1`

**Problem**: 
- Workflow shows as active and "waiting for trigger event"
- Both production and test webhook URLs return 404
- Webhook node is properly configured
- Manual activation completed but webhook still not responding
- Error: "The requested webhook 'POST svix-insurance-analysis' is not registered"

**Root Cause**: 
The webhook was in **test mode** and required manual execution from the n8n interface before it could receive external webhook calls.

**Solution**: 
1. User manually clicked "Execute workflow" button in n8n interface
2. Workflow activated and webhook became available for test calls
3. Test webhook sent successfully with 200 OK response
4. Workflow now fully functional and ready for production use

**Code Reference**:
```bash
curl -X POST https://shellyins.app.n8n.cloud/webhook-test/svix-insurance-analysis \
  -H "Content-Type: application/json" \
  -d '{"eventType": "HarbDataLoaded", "data": {...}}'
# Response: 200 OK
```

---

## 📚 Resolved Issues Archive

### Issue #3: Event Type Filter Configuration
**Status**: ✅ RESOLVED  
**Date**: 2025-09-21  
**Workflow ID**: `bsl6l4JqVQvarPR1`

**Problem**: Event filter was looking for `harb.uploaded` but Svix was sending `HarbDataLoaded`

**Solution**: Updated the "⚡ Event Type Filter" node to check for `eventType: "HarbDataLoaded"`

**Code Fix**:
```json
{
  "leftValue": "={{ $json.body.eventType }}",
  "rightValue": "HarbDataLoaded",
  "operator": {
    "type": "string",
    "operation": "equals"
  }
}
```

### Issue #4: Data Structure Handling
**Status**: ✅ RESOLVED  
**Date**: 2025-09-21  
**Workflow ID**: `bsl6l4JqVQvarPR1`

**Problem**: Data processor couldn't handle different webhook data structures

**Solution**: Updated data processor to handle both `webhookData.body.data` and `webhookData.body` structures

**Code Fix**:
```javascript
const leadData = webhookData.body.data || webhookData.body || {};
```

---

## 🔧 Common Webhook Patterns and Solutions

### Pattern 1: Event Type Mismatch
**Symptoms**: Workflow receives webhook but doesn't process data
**Solution**: Always verify the exact event type being sent vs. what the filter expects
**Prevention**: Document event types in both Svix and n8n configurations

### Pattern 2: Webhook Registration Delays
**Symptoms**: 404 errors despite active workflow
**Solution**: Wait 2-5 minutes after activation, then manually toggle workflow
**Prevention**: Test webhooks immediately after deployment

### Pattern 3: Data Structure Variations
**Symptoms**: Data processor fails or processes empty data
**Solution**: Use fallback patterns: `data.field || data.body.field || defaultValue`
**Prevention**: Test with actual webhook payloads, not mock data

### Pattern 4: Authentication Issues
**Symptoms**: 401/403 errors
**Solution**: Verify API credentials in n8n credential store
**Prevention**: Use n8n credential management, not hardcoded keys

---

## 📋 Webhook Testing Checklist

### Before Deployment:
- [ ] Verify event types match between source and n8n
- [ ] Test webhook with actual payload structure
- [ ] Confirm all required credentials are configured
- [ ] Check webhook URL is accessible

### After Deployment:
- [ ] Activate workflow in n8n interface
- [ ] Test webhook endpoint with curl or Postman
- [ ] Verify data flows through all nodes
- [ ] Check error handling and logging

### Troubleshooting Steps:
1. **Check Workflow Status**: Verify active in n8n interface
2. **Test Webhook Node**: Use built-in test functionality
3. **Verify Event Types**: Match source system with n8n filter
4. **Check Data Structure**: Ensure processor handles actual payload
5. **Review Logs**: Check n8n execution logs for errors
6. **Manual Toggle**: Turn workflow off/on to refresh registration

---

## 🎯 Best Practices

### Configuration Management:
- Always document event types in both systems
- Use consistent naming conventions
- Keep webhook URLs in version control
- Document required credentials

### Error Handling:
- Implement proper error responses
- Log all webhook attempts
- Use try-catch blocks in data processors
- Provide meaningful error messages

### Testing:
- Test with real data, not mocks
- Verify all node connections
- Check data transformations
- Validate output formats

### Monitoring:
- Set up webhook monitoring
- Track success/failure rates
- Monitor response times
- Alert on failures

---

## 🔄 Maintenance Schedule

### Weekly:
- Review webhook success rates
- Check for new error patterns
- Update documentation as needed

### Monthly:
- Audit all webhook configurations
- Review and update credentials
- Test all webhook endpoints
- Update this database with new issues

### Quarterly:
- Review webhook architecture
- Optimize performance
- Update security configurations
- Archive resolved issues

---

## 📞 Emergency Contacts

### n8n Issues:
- **Instance**: `https://shellyins.app.n8n.cloud`
- **Admin**: Shelly Mizrahi (shellypensia@gmail.com)
- **Project**: `fhSqYYcHLCMQZMmw`

### Svix Issues:
- **Dashboard**: Check Svix console for endpoint status
- **Documentation**: Refer to Svix webhook documentation
- **Support**: Contact Svix support if needed

### Infrastructure:
- **Cloudflare**: Check for CDN issues
- **RackNerd**: Verify VPS status
- **DNS**: Confirm domain resolution

---

## 📝 Change Log

### 2025-09-21:
- Created initial webhook issues database
- Documented current Svix webhook issue
- Added troubleshooting patterns
- Established maintenance procedures

---

*This database should be updated whenever new webhook issues are encountered or resolved. Follow the same systematic approach used for Make MCP documentation.*
