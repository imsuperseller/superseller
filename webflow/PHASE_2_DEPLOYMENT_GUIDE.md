# 🚀 Phase 2: Vercel Preview Deployment Guide

**Date**: November 2, 2025  
**Status**: ⏸️ **READY TO START**  
**Purpose**: Deploy Marketplace API endpoints to Vercel Preview for end-to-end testing

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **1. Environment Variables Setup** ⚠️ **REQUIRED**

Before deploying, ensure these environment variables are set in Vercel:

| Variable | Status | Required For | Value Source |
|----------|--------|--------------|--------------|
| `AIRTABLE_API_KEY` | ⏳ **SET** | Airtable API access | `pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9` |
| `TIDYCAL_API_KEY` | ⏳ **SET** | TidyCal booking links | Hardcoded token (or env var) |
| `STRIPE_SECRET_KEY` | ✅ **VERIFY** | Stripe checkout/webhooks | Vercel Dashboard |
| `STRIPE_WEBHOOK_SECRET` | ✅ **VERIFY** | Webhook signature validation | Vercel Dashboard |

**Action**: Go to Vercel Dashboard → Project Settings → Environment Variables

### **2. Code Verification**

- [x] API endpoints created
- [x] All 3 endpoints tested locally (functional)
- [x] Code committed to git
- [ ] Verify no build errors

### **3. Vercel Project Setup**

- [ ] Verify project is linked (or link new project)
- [ ] Check deployment settings
- [ ] Verify build command: `npm run build`
- [ ] Verify install command: `npm install --legacy-peer-deps`

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Navigate to Project Directory**

```bash
cd /Users/shaifriedman/New\ Rensto/rensto/apps/web/rensto-site
```

### **Step 2: Check Vercel Login**

```bash
vercel whoami
```

If not logged in:
```bash
vercel login
```

### **Step 3: Link Project (if not already linked)**

```bash
vercel link
```

Follow prompts:
- **Set up and develop**: Yes
- **Which scope**: Your Vercel account
- **Link to existing project**: Yes (if project exists) OR Create new project

### **Step 4: Set Environment Variables**

**Option A: Via Vercel CLI** (recommended for testing):
```bash
vercel env add AIRTABLE_API_KEY
# When prompted, enter: pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9
# Select environments: Production, Preview, Development

vercel env add TIDYCAL_API_KEY
# Enter TidyCal JWT token
# Select environments: Production, Preview, Development
```

**Option B: Via Vercel Dashboard**:
1. Go to https://vercel.com/dashboard
2. Select project (or create new)
3. Settings → Environment Variables
4. Add each variable for Production, Preview, Development

### **Step 5: Deploy to Preview**

```bash
vercel --prod=false
```

This creates a preview deployment (not production).

**Expected Output**:
```
🔍  Inspect: https://vercel.com/your-account/rensto-site/abc123
✅  Production: https://rensto-site-abc123.vercel.app
```

**Note**: The preview URL will be different from production URL.

---

## ✅ **POST-DEPLOYMENT VERIFICATION**

### **1. Check Deployment Status**

Go to Vercel Dashboard → Deployments → Latest deployment

Verify:
- [ ] Build succeeded (green checkmark)
- [ ] No build errors
- [ ] Environment variables loaded (check build logs)

### **2. Test API Endpoints**

**Test Download Link Generation**:
```bash
curl -X POST https://rensto-site-abc123.vercel.app/api/marketplace/downloads \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "email-persona-system",
    "customerEmail": "test@rensto.com",
    "sessionId": "cs_test_preview_123",
    "purchaseRecordId": "recPREVIEW123"
  }'
```

**Expected**: 200 OK with download link

**Test Installation Booking**:
```bash
curl -X POST https://rensto-site-abc123.vercel.app/api/installation/booking \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "test@rensto.com",
    "workflowName": "Test Workflow",
    "productId": "email-persona-system",
    "projectId": "recPROJECT123",
    "purchaseRecordId": "recPURCHASE123"
  }'
```

**Expected**: 200 OK with TidyCal booking link

**Test Download Token Handler** (use token from first test):
```bash
curl -L "https://rensto-site-abc123.vercel.app/api/marketplace/download/{token}"
```

**Expected**: Redirects to GitHub raw file

### **3. Verify Environment Variables**

Check build logs in Vercel Dashboard:
- [ ] No warnings about missing env vars
- [ ] API calls succeed (not 401/403 errors)

### **4. Test Error Handling**

**Missing Fields**:
```bash
curl -X POST https://rensto-site-abc123.vercel.app/api/marketplace/downloads \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected**: 400 Bad Request with error message

**Invalid Product**:
```bash
curl -X POST https://rensto-site-abc123.vercel.app/api/marketplace/downloads \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "non-existent-product",
    "customerEmail": "test@test.com",
    "sessionId": "cs_test",
    "purchaseRecordId": "rec123"
  }'
```

**Expected**: 404 Not Found

---

## 🔄 **TESTING STRIPE INTEGRATION**

### **Update Stripe Webhook URL**

1. **Get Preview Deployment URL**:
   - From Vercel Dashboard → Deployments → Latest
   - Copy preview URL (e.g., `rensto-site-abc123.vercel.app`)

2. **Update Stripe Webhook**:
   - Go to https://dashboard.stripe.com/test/webhooks
   - Find existing webhook OR create new
   - Update URL to: `https://rensto-site-abc123.vercel.app/api/stripe/webhook`
   - Save webhook secret (update `STRIPE_WEBHOOK_SECRET` if changed)

### **Test Stripe Checkout (Template Purchase)**

**Option A: Via Stripe Dashboard**:
1. Go to https://dashboard.stripe.com/test/checkout
2. Create checkout session with:
   - **Metadata**:
     - `flowType`: `marketplace-template`
     - `productId`: `email-persona-system`
     - `tier`: `standard`
   - **Amount**: $29.00 (or any test amount)
3. Complete payment with test card: `4242 4242 4242 4242`

**Option B: Via API** (using Stripe API):
```bash
curl https://api.stripe.com/v1/checkout/sessions \
  -u sk_test_YOUR_KEY: \
  -d "mode=payment" \
  -d "success_url=https://rensto.com/success" \
  -d "cancel_url=https://rensto.com/cancel" \
  -d "line_items[0][price_data][currency]=usd" \
  -d "line_items[0][price_data][product_data][name]=Test Template" \
  -d "line_items[0][price_data][unit_amount]=2900" \
  -d "metadata[flowType]=marketplace-template" \
  -d "metadata[productId]=email-persona-system"
```

### **Monitor Webhook Delivery**

1. **Stripe Dashboard**:
   - Go to https://dashboard.stripe.com/test/webhooks
   - Click on webhook event
   - Verify status is "Succeeded"
   - Check request/response

2. **Vercel Logs**:
   ```bash
   vercel logs --follow
   ```
   - Watch for: "Stripe webhook received"
   - Watch for: "Triggering n8n workflow"
   - Check for errors

3. **n8n Execution**:
   - Go to http://173.254.201.134:5678/executions
   - Find STRIPE-MARKETPLACE-001 execution
   - Verify all nodes executed successfully

4. **Airtable Verification**:
   - Open Operations & Automation base
   - Check Marketplace Purchases table
   - Verify new purchase record created
   - Verify download link populated

---

## 🧪 **COMPLETE TEST CHECKLIST**

### **Template Purchase Flow** ✅

- [ ] Stripe checkout session created
- [ ] Payment completed with test card
- [ ] Webhook received by Vercel
- [ ] Webhook triggers n8n workflow
- [ ] Customer record created/updated in Airtable
- [ ] Marketplace Purchase record created
- [ ] Download link generated
- [ ] Download link works (redirects to GitHub)
- [ ] Purchase status updated correctly

### **Installation Purchase Flow** ✅

- [ ] Stripe checkout session created
- [ ] Payment completed
- [ ] Webhook triggers STRIPE-INSTALL-001
- [ ] Project record created in Airtable
- [ ] Marketplace Purchase record created
- [ ] TidyCal booking link generated
- [ ] Booking link opens TidyCal calendar
- [ ] Purchase status updated to "📅 Installation Booked"

### **Error Handling** ✅

- [ ] Missing fields return 400
- [ ] Invalid product returns 404
- [ ] Non-existent purchase record handled gracefully
- [ ] TidyCal API failure returns fallback URL

---

## 📊 **SUCCESS CRITERIA**

Phase 2 is complete when:
- ✅ All API endpoints accessible on preview URL
- ✅ All endpoints return correct responses
- ✅ Template purchase flow works end-to-end
- ✅ Installation purchase flow works end-to-end
- ✅ Airtable records created correctly
- ✅ Download links work
- ✅ TidyCal booking links generated
- ✅ Error handling works correctly
- ✅ No critical errors in logs

---

## 🐛 **TROUBLESHOOTING**

### **Build Fails**

**Error**: Tailwind CSS PostCSS error
- **Solution**: Vercel handles build correctly (different from local)
- **Action**: Check build logs, usually resolves automatically

**Error**: Missing dependencies
- **Solution**: Ensure `package.json` has all dependencies
- **Action**: Check build logs for missing packages

### **401 Unauthorized Errors**

**Cause**: Missing or invalid environment variables
- **Solution**: Verify env vars in Vercel Dashboard
- **Action**: Re-add environment variables, redeploy

### **Webhook Not Received**

**Cause**: Webhook URL incorrect
- **Solution**: Verify webhook URL points to preview deployment
- **Action**: Update Stripe webhook URL, test again

### **n8n Workflow Not Triggering**

**Cause**: Webhook URL not accessible or n8n down
- **Solution**: Verify n8n instance is running
- **Action**: Check http://173.254.201.134:5678/executions

---

## 📝 **NEXT STEPS AFTER PHASE 2**

Once Phase 2 testing passes:
1. ✅ Document results in `PHASE_2_TEST_RESULTS.md`
2. ✅ Proceed to Phase 3: Production Deployment
3. ✅ Update Stripe webhook to production URL
4. ✅ Deploy to production
5. ✅ Run smoke tests

---

**Status**: ⏸️ **READY FOR DEPLOYMENT**

*Follow steps above to deploy and test in Vercel Preview environment.*

