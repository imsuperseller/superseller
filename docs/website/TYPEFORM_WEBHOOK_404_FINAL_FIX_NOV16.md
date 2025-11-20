# Typeform Webhook 404 Error - Final Fix (November 16, 2025)

## 🔍 Root Cause Identified

The Typeform Trigger node generates a **dynamic webhook ID** stored in workflow `staticData`. When the workflow is updated, this ID can change, causing webhook registration to fail.

**Current Issue**:
- Workflow `KXVJUtRiwozkKBmO` has webhookId: `n8n-mjxvf0njku` (changed from `n8n-ss6lfgypek`)
- Typeform still has the old webhook registered
- n8n expects webhooks at: `{workflow-id}/{node-name}/webhook`
- The Typeform Trigger node should auto-register, but it's not working

## ✅ Solution

**Manual webhook registration** using the current webhook ID from workflow staticData.

### **Step 1: Get Current Webhook IDs**

Check workflow staticData for each workflow:
```bash
# Use n8n MCP to get workflow details
# Look for: staticData.node:Typeform Trigger.webhookId
```

**Current Webhook IDs** (as of Nov 16, 2025):
- `jqrAhQHW` (Ready Solutions Quiz): `n8n-mjxvf0njku`
- `ydoAn3hv` (Template Request): `n8n-ifsdodhorz`
- `TBij585m` (Readiness Scorecard): `n8n-ipnv8bn6pl`

### **Step 2: Register Webhooks**

Run the registration script:
```bash
node scripts/register-typeform-webhook-manual.js
```

This script will:
1. List existing webhooks for each form
2. Update existing webhooks or create new ones
3. Use the correct webhook ID from workflow staticData
4. Point to: `https://n8n.rensto.com/webhook/{workflow-id}/typeform trigger/webhook`

### **Step 3: Verify**

1. **Check Typeform Admin**:
   - Go to: https://admin.typeform.com/form/{formId}/connect#/section/webhooks
   - Verify webhook URL matches: `https://n8n.rensto.com/webhook/{workflow-id}/typeform trigger/webhook`
   - Verify webhook is **ENABLED**

2. **Test Webhook**:
   - Click "Send test request" in Typeform admin
   - Should return **200 OK** (not 404)

3. **Check n8n Executions**:
   - Go to: https://n8n.rensto.com/executions
   - Should see execution triggered by Typeform webhook

## 🔧 Manual Registration (if script fails)

**Form 1: Ready Solutions Quiz**
```bash
curl -X PUT "https://api.typeform.com/forms/jqrAhQHW/webhooks/n8n-mjxvf0njku" \
  -H "Authorization: Bearer tfp_...[REDACTED]" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://n8n.rensto.com/webhook/KXVJUtRiwozkKBmO/typeform trigger/webhook","enabled":true}'
```

**Form 2: Template Request**
```bash
curl -X PUT "https://api.typeform.com/forms/ydoAn3hv/webhooks/n8n-ifsdodhorz" \
  -H "Authorization: Bearer tfp_...[REDACTED]" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://n8n.rensto.com/webhook/1NgUtwNhG19JoVCX/typeform trigger/webhook","enabled":true}'
```

**Form 3: Readiness Scorecard**
```bash
curl -X PUT "https://api.typeform.com/forms/TBij585m/webhooks/n8n-ipnv8bn6pl" \
  -H "Authorization: Bearer tfp_...[REDACTED]" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://n8n.rensto.com/webhook/NgqR5LtBhhaFQ8j0/typeform trigger/webhook","enabled":true}'
```

## 📊 Expected Results

After registration:
- ✅ Typeform test requests return **200 OK**
- ✅ n8n executions appear in execution history
- ✅ Boost.space contacts created in Space 53
- ✅ Emails sent via Outlook
- ✅ Slack notifications sent (for urgent leads)

## ⚠️ Important Notes

1. **Webhook IDs Change**: When workflows are updated, the Typeform Trigger node may generate a new webhook ID. Always check `staticData` before registering.

2. **Public URL Required**: Webhooks must use `https://n8n.rensto.com` (not `http://173.254.201.134:5678`) because Typeform can't reach internal IPs.

3. **URL Format**: The path format is: `{workflow-id}/{node-name}/webhook` where node-name is lowercase with spaces (e.g., "typeform trigger").

4. **Auto-Registration**: The Typeform Trigger node should auto-register webhooks when workflows are activated, but this feature appears to be unreliable. Manual registration is more reliable.

## 🔄 Future Improvements

1. **Automated Webhook Sync**: Create a script that:
   - Fetches webhook IDs from workflow staticData
   - Compares with Typeform registered webhooks
   - Auto-updates mismatched webhooks

2. **Monitoring**: Set up alerts for:
   - 404 errors from Typeform webhooks
   - Missing webhook registrations
   - Workflow activation failures

3. **Documentation**: Keep webhook IDs in a central location (e.g., Airtable or Boost.space) for easy reference.

