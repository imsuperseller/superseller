# Typeform Webhook Verification - Accurate Instructions (November 16, 2025)

## ✅ Programmatic Verification (Recommended)

**Script Created**: `scripts/verify-typeform-webhooks.js`

Run this to check webhook configuration programmatically:
```bash
node scripts/verify-typeform-webhooks.js
```

This will:
- Check all 3 forms for existing webhooks
- Verify webhook URLs match expected n8n paths
- Check if webhooks are enabled
- Report any mismatches or missing webhooks

---

## 📋 Manual Verification (If Script Doesn't Work)

### **Step 1: Access Typeform Admin**

1. Go to: **https://admin.typeform.com**
2. Login with your Typeform account

### **Step 2: Navigate to Each Form**

For each form, follow these steps:

#### **Form 1: Ready Solutions Industry Quiz**

1. **Find the form**:
   - Search for form ID: `jqrAhQHW`
   - OR search for title: "Find Your Perfect Industry Automation Package"
   - Click on the form to open it

2. **Go to Webhooks**:
   - Click on **"Connect"** tab (left sidebar)
   - Click on **"Webhooks"** section

3. **Verify Webhook**:
   - **Expected URL**: `http://173.254.201.134:5678/webhook/typeform-ready-solutions-quiz`
   - Check if webhook exists with this exact URL
   - Verify webhook is **enabled** (toggle should be ON/green)
   - If webhook doesn't exist, click **"Add webhook"** and enter the URL above

4. **Test Webhook** (Optional):
   - Click **"View deliveries"** to see webhook history
   - Click **"Send test request"** to test the webhook
   - Check n8n executions: `http://173.254.201.134:5678/executions`

#### **Form 2: Marketplace Template Request**

1. **Find the form**:
   - Search for form ID: `ydoAn3hv`
   - OR search for title: "Don't See the Template You Need?"
   - Click on the form to open it

2. **Go to Webhooks**:
   - Click on **"Connect"** tab (left sidebar)
   - Click on **"Webhooks"** section

3. **Verify Webhook**:
   - **Expected URL**: `http://173.254.201.134:5678/webhook/typeform-template-request`
   - Check if webhook exists with this exact URL
   - Verify webhook is **enabled** (toggle should be ON/green)
   - If webhook doesn't exist, click **"Add webhook"** and enter the URL above

4. **Test Webhook** (Optional):
   - Click **"View deliveries"** to see webhook history
   - Click **"Send test request"** to test the webhook

#### **Form 3: Readiness Scorecard**

1. **Find the form**:
   - Search for form ID: `TBij585m`
   - OR search for title: "Is Your Business Ready for Custom Automation?"
   - Click on the form to open it

2. **Go to Webhooks**:
   - Click on **"Connect"** tab (left sidebar)
   - Click on **"Webhooks"** section

3. **Verify Webhook**:
   - **Expected URL**: `http://173.254.201.134:5678/webhook/typeform-readiness-scorecard`
   - Check if webhook exists with this exact URL
   - Verify webhook is **enabled** (toggle should be ON/green)
   - If webhook doesn't exist, click **"Add webhook"** and enter the URL above

4. **Test Webhook** (Optional):
   - Click **"View deliveries"** to see webhook history
   - Click **"Send test request"** to test the webhook

---

## 🔧 Creating/Updating Webhooks

If a webhook doesn't exist or has the wrong URL:

1. **In Typeform Admin**:
   - Go to Form → Connect → Webhooks
   - Click **"Add webhook"** (or edit existing)
   - Enter the webhook URL (see table below)
   - **Enable** the webhook (toggle ON)
   - **Save**

2. **Webhook Settings**:
   - **HTTP Method**: POST (default)
   - **Events**: Form submitted (all responses) - default
   - **Secret**: Optional (not required for n8n)

---

## 📊 Expected Configuration

| Form ID | Form Name | Expected Webhook URL | n8n Workflow |
|---------|-----------|---------------------|--------------|
| `jqrAhQHW` | Ready Solutions Quiz | `http://173.254.201.134:5678/webhook/typeform-ready-solutions-quiz` | `TYPEFORM-READY-SOLUTIONS-QUIZ-001` |
| `ydoAn3hv` | Template Request | `http://173.254.201.134:5678/webhook/typeform-template-request` | `TYPEFORM-TEMPLATE-REQUEST-001` |
| `TBij585m` | Readiness Scorecard | `http://173.254.201.134:5678/webhook/typeform-readiness-scorecard` | `TYPEFORM-READINESS-SCORECARD-001` |

---

## ✅ Verification Checklist

After verification, you should have:

- [ ] Form `jqrAhQHW` has webhook with correct URL
- [ ] Form `jqrAhQHW` webhook is **enabled**
- [ ] Form `ydoAn3hv` has webhook with correct URL
- [ ] Form `ydoAn3hv` webhook is **enabled**
- [ ] Form `TBij585m` has webhook with correct URL
- [ ] Form `TBij585m` webhook is **enabled**

---

## 🧪 Testing After Verification

1. **Submit Test Forms**:
   - Go to each form's public URL
   - Fill out with test data
   - Submit

2. **Check n8n Executions**:
   - Go to: `http://173.254.201.134:5678/executions`
   - Look for new executions (should appear within seconds)
   - Verify all nodes executed successfully

3. **Verify Data Created**:
   - **Boost.space**: Check Space 53 → Contacts
   - **Email**: Check Outlook inbox
   - **Slack**: Check #sales or #template-requests channels

---

## 🚨 Common Issues

### **Issue 1: Webhook Not Found**
**Symptom**: No webhooks listed in Typeform  
**Fix**: Click "Add webhook" and enter the correct URL

### **Issue 2: Webhook Disabled**
**Symptom**: Webhook exists but toggle is OFF  
**Fix**: Enable the webhook toggle in Typeform admin

### **Issue 3: Wrong URL**
**Symptom**: Webhook URL doesn't match expected path  
**Fix**: Edit webhook and update URL to match expected path exactly

### **Issue 4: Webhook Not Receiving Data**
**Symptom**: Form submissions don't trigger n8n workflows  
**Fix**: 
- Check webhook is enabled
- Verify URL is correct (no typos)
- Check n8n workflow is active
- Test with "Send test request" button

---

**Last Updated**: November 16, 2025  
**Source**: Typeform API documentation + current Typeform admin interface

