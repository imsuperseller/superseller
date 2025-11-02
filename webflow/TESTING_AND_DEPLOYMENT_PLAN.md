# 🧪 Marketplace System - Testing & Deployment Plan

**Date**: November 2, 2025  
**Status**: Ready for Testing Phase  
**Purpose**: Comprehensive guide for testing and deploying the Marketplace purchase automation system

---

## 📋 **TABLE OF CONTENTS**

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Testing Strategy Overview](#testing-strategy-overview)
3. [Phase 1: Local Testing](#phase-1-local-testing)
4. [Phase 2: Vercel Preview Testing](#phase-2-vercel-preview-testing)
5. [Phase 3: Production Deployment](#phase-3-production-deployment)
6. [Phase 4: Post-Deployment Verification](#phase-4-post-deployment-verification)
7. [Rollback Plan](#rollback-plan)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## ✅ **PRE-DEPLOYMENT CHECKLIST**

### **Environment Variables Setup** (Vercel Dashboard)

**Required Variables**:

| Variable | Status | Location | Purpose |
|----------|--------|----------|---------|
| `AIRTABLE_API_KEY` | ⏳ **Verify** | Vercel → Settings → Environment Variables | Airtable API access |
| `TIDYCAL_API_KEY` | ⏳ **Set** | Vercel → Settings → Environment Variables | TidyCal JWT token (currently hardcoded) |
| `STRIPE_SECRET_KEY` | ✅ **Verify** | Vercel → Settings → Environment Variables | Stripe API access |
| `STRIPE_WEBHOOK_SECRET` | ✅ **Verify** | Vercel → Settings → Environment Variables | Webhook signature validation |

**Action Items**:
- [ ] Navigate to Vercel Dashboard → `rensto-site` project → Settings → Environment Variables
- [ ] Verify `AIRTABLE_API_KEY` is set for Production, Preview, Development
- [ ] Add `TIDYCAL_API_KEY` = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...` (full token from code)
- [ ] Verify `STRIPE_SECRET_KEY` is set
- [ ] Verify `STRIPE_WEBHOOK_SECRET` is set

**Note**: After setting `TIDYCAL_API_KEY` in Vercel, we should remove the hardcoded token from the code.

### **Code Prerequisites**

- [ ] **All 3 API endpoints exist**:
  - ✅ `apps/web/rensto-site/src/app/api/marketplace/downloads/route.ts`
  - ✅ `apps/web/rensto-site/src/app/api/marketplace/download/[token]/route.ts`
  - ✅ `apps/web/rensto-site/src/app/api/installation/booking/route.ts`
- [ ] **n8n workflows active**:
  - ✅ STRIPE-MARKETPLACE-001 (ID: `FOWZV3tTy5Pv84HP`)
  - ✅ STRIPE-INSTALL-001 (ID: `QdalBg1LUY0xpwPR`)
- [ ] **Airtable tables ready**:
  - ✅ Marketplace Products (8 products populated)
  - ✅ Marketplace Purchases (table structure verified)

### **External Services Verification**

- [ ] **Stripe Test Mode**: Access https://dashboard.stripe.com/test/webhooks
- [ ] **TidyCal API**: Verify JWT token is valid (check expiry)
- [ ] **Airtable API**: Verify PAT has correct permissions
- [ ] **GitHub**: Verify workflow JSON files exist in repository

---

## 🎯 **TESTING STRATEGY OVERVIEW**

### **Testing Phases**

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: Local Testing (Development Environment)           │
│  • API endpoint unit tests                                   │
│  • Direct API calls with test data                          │
│  • Verify error handling                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: Vercel Preview Testing (Preview Environment)     │
│  • Deploy to Vercel Preview                                  │
│  • Test with Stripe test mode                                │
│  • Verify end-to-end flow                                    │
│  • Test n8n workflow integration                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: Production Deployment (Production Environment)    │
│  • Deploy to api.rensto.com                                  │
│  • Configure Stripe webhook URL                              │
│  • Smoke tests                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 4: Post-Deployment Verification                      │
│  • End-to-end purchase flow                                  │
│  • Monitor logs and errors                                   │
│  • Verify Airtable records                                  │
└─────────────────────────────────────────────────────────────┘
```

### **Testing Tools**

- **Manual Testing**: Stripe test cards, Postman/curl, Browser DevTools
- **Automation**: Vercel logs, n8n execution logs, Airtable record inspection
- **Monitoring**: Vercel Analytics, n8n execution history, Airtable activity logs

---

## 🔬 **PHASE 1: LOCAL TESTING**

### **1.1 API Endpoint Unit Tests**

**Test Environment**: Local development (`npm run dev`)

#### **Test 1: Download Link Generation API**

```bash
# Start local dev server
cd apps/web/rensto-site
npm run dev

# Test endpoint (replace with actual values)
curl -X POST http://localhost:3000/api/marketplace/downloads \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "email-persona-system",
    "customerEmail": "test@example.com",
    "sessionId": "cs_test_123",
    "purchaseRecordId": "recTEST123"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "downloadLink": "https://api.rensto.com/api/marketplace/download/{token}",
  "downloadUrl": "...",
  "url": "...",
  "expiresAt": "2025-11-09T...",
  "workflowFileUrl": "https://raw.githubusercontent.com/...",
  "product": {
    "name": "...",
    "workflowId": "email-persona-system",
    "sourceFile": "..."
  }
}
```

**Verification Checklist**:
- [ ] API returns 200 status
- [ ] Response contains `downloadLink`
- [ ] Token format is valid (base64url)
- [ ] Airtable purchase record updated
- [ ] Expiry date is 7 days from now

**Test Cases**:
- [ ] **Valid Request**: All fields provided, product exists
- [ ] **Missing Fields**: Test without `templateId`, `customerEmail`, `purchaseRecordId`
- [ ] **Invalid Product**: Test with non-existent `templateId`
- [ ] **Invalid Purchase Record**: Test with non-existent `purchaseRecordId`

#### **Test 2: Download Token Handler API**

```bash
# Get token from Test 1 response, then:
curl http://localhost:3000/api/marketplace/download/{token}
```

**Expected Behavior**:
- [ ] Redirects (302) to GitHub raw file URL
- [ ] Updates download count in Airtable
- [ ] Sets last downloaded timestamp

**Test Cases**:
- [ ] **Valid Token**: Token decodes correctly, purchase record exists, not expired
- [ ] **Invalid Token**: Malformed token (should return 400)
- [ ] **Expired Token**: Token older than 7 days (should return 403)
- [ ] **Non-existent Purchase**: Purchase record ID doesn't exist (should return 404)

#### **Test 3: Installation Booking API**

```bash
curl -X POST http://localhost:3000/api/installation/booking \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "test@example.com",
    "workflowName": "Email Persona System",
    "productId": "email-persona-system",
    "projectId": "recPROJECT123",
    "purchaseRecordId": "recPURCHASE123"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "tidycalLink": "https://tidycal.com/shai/installation",
  "bookingUrl": "...",
  "url": "...",
  "serviceId": "...",
  "serviceName": "...",
  "message": "TidyCal booking link generated successfully"
}
```

**Verification Checklist**:
- [ ] API returns 200 status
- [ ] Response contains `tidycalLink`
- [ ] TidyCal API calls succeed (GET /me, GET /booking-types)
- [ ] Airtable purchase record updated
- [ ] Status set to "📅 Installation Booked"

**Test Cases**:
- [ ] **Valid Request**: All fields provided
- [ ] **Missing Fields**: Test without required fields
- [ ] **TidyCal API Failure**: Temporarily break TidyCal API (should return fallback URL)
- [ ] **No Booking Types**: TidyCal returns empty booking types (should use fallback)

### **1.2 Airtable Integration Tests**

**Manual Verification** (Airtable UI):
- [ ] Open Airtable base: Operations & Automation (`app6saCaH88uK3kCO`)
- [ ] Check Marketplace Products table has 8 products
- [ ] Verify Marketplace Purchases table structure:
  - Download Link field (URL)
  - Download Link Expiry (Date)
  - TidyCal Booking Link (URL)
  - Status (Single select)
  - Download Count (Number)
  - Last Downloaded (Date)
  - Access Granted (Checkbox)

### **1.3 Error Handling Tests**

**Test Error Scenarios**:
- [ ] **Airtable API Failure**: Temporarily break Airtable connection
- [ ] **Invalid Airtable Base ID**: Use wrong base ID
- [ ] **Invalid Table ID**: Use wrong table ID
- [ ] **Network Timeout**: Simulate slow network
- [ ] **Malformed JSON**: Send invalid JSON in request body

---

## 🚀 **PHASE 2: VERCEL PREVIEW TESTING**

### **2.1 Deploy to Vercel Preview**

```bash
# Deploy to preview environment
cd apps/web/rensto-site
vercel --prod=false
```

**Deployment Checklist**:
- [ ] Build succeeds without errors
- [ ] All environment variables loaded
- [ ] Preview URL accessible (e.g., `rensto-site-abc123.vercel.app`)
- [ ] API endpoints respond (not 404)

### **2.2 Stripe Test Mode Integration**

#### **Test Template Purchase Flow**

**Step 1: Create Stripe Test Checkout**

```bash
# Use Stripe CLI or Dashboard to create test checkout
curl -X POST https://api.stripe.com/v1/checkout/sessions \
  -u sk_test_... \
  -d "mode=payment" \
  -d "success_url=https://rensto.com/success" \
  -d "cancel_url=https://rensto.com/cancel" \
  -d "line_items[0][price_data][currency]=usd" \
  -d "line_items[0][price_data][product_data][name]=Test Template" \
  -d "line_items[0][price_data][unit_amount]=2900" \
  -d "metadata[flowType]=marketplace-template" \
  -d "metadata[productId]=email-persona-system" \
  -d "metadata[tier]=standard"
```

**Or use Stripe Dashboard**:
1. Go to https://dashboard.stripe.com/test/checkout
2. Create checkout session with metadata:
   - `flowType`: `marketplace-template`
   - `productId`: `email-persona-system`
   - `tier`: `standard`

**Step 2: Complete Payment with Test Card**
- **Card**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

**Step 3: Monitor Webhook Delivery**

1. **Check Stripe Dashboard**:
   - Go to https://dashboard.stripe.com/test/webhooks
   - Verify webhook event `checkout.session.completed` was sent
   - Check webhook response (should be 200)

2. **Check Vercel Logs**:
   ```bash
   vercel logs --follow
   ```
   - Look for: "Stripe webhook received"
   - Look for: "Triggering n8n workflow"
   - No errors in logs

3. **Check n8n Execution**:
   - Go to http://173.254.201.134:5678/executions
   - Find STRIPE-MARKETPLACE-001 execution
   - Verify all nodes executed successfully (green checkmarks)
   - Check execution data:
     - Customer created/found in Airtable
     - Marketplace Purchase record created
     - Download link generated
     - Purchase status updated

4. **Verify Airtable Records**:
   - Open Airtable: Operations & Automation → Marketplace Purchases
   - Find purchase record created in last 5 minutes
   - Verify fields:
     - Product linked correctly
     - Download Link populated
     - Expiry date = 7 days from now
     - Status = "📥 Download Link Sent"
     - Access Granted = true

**Step 4: Test Download Link**

1. **Copy Download Link** from Airtable purchase record
2. **Open in Browser** or use curl:
   ```bash
   curl -L "https://api.rensto.com/api/marketplace/download/{token}"
   ```
3. **Expected Behavior**:
   - Redirects to GitHub raw file URL
   - File downloads (JSON workflow file)
   - Download count increments in Airtable
   - Last Downloaded timestamp updated

#### **Test Installation Purchase Flow**

**Step 1: Create Stripe Test Checkout for Installation**

Stripe Dashboard metadata:
- `flowType`: `marketplace-install`
- `productId`: `email-persona-system`
- `tier`: `standard`

**Step 2-3**: Same as Template Purchase (complete payment, monitor webhook)

**Step 4: Verify Installation Booking**

1. **Check n8n Execution** (STRIPE-INSTALL-001):
   - Verify Project record created in Airtable
   - Verify Marketplace Purchase record created
   - Verify TidyCal booking link generated
   - Verify purchase status = "📅 Installation Booked"

2. **Verify Airtable Records**:
   - Marketplace Purchase → TidyCal Booking Link populated
   - Installation Booked = true
   - Access Granted = true

3. **Test TidyCal Booking Link**:
   - Open link in browser
   - Verify TidyCal calendar page loads
   - Verify booking type is "Installation" or similar

### **2.3 Error Handling in Preview**

**Test Error Scenarios**:
- [ ] **Invalid Product ID**: Use non-existent `productId` in Stripe metadata
- [ ] **Missing Metadata**: Create checkout without `flowType` metadata
- [ ] **n8n Workflow Failure**: Temporarily disable workflow (should see error in logs)
- [ ] **Airtable API Failure**: Test with invalid Airtable credentials

---

## 🌐 **PHASE 3: PRODUCTION DEPLOYMENT**

### **3.1 Final Pre-Deployment Checks**

- [ ] **Code Review**: All code committed and pushed to `main` branch
- [ ] **Environment Variables**: All variables set in Vercel Production environment
- [ ] **Remove Hardcoded Token**: Update `installation/booking/route.ts` to use `process.env.TIDYCAL_API_KEY` only
- [ ] **n8n Workflows**: Verify workflows are active and webhooks are accessible
- [ ] **Stripe Webhook URL**: Verify webhook endpoint is `https://api.rensto.com/api/stripe/webhook`

### **3.2 Deploy to Production**

```bash
# Deploy to production
cd apps/web/rensto-site
vercel --prod
```

**Deployment Verification**:
- [ ] Build succeeds
- [ ] Deployment completes without errors
- [ ] API endpoints accessible at `https://api.rensto.com/api/...`
- [ ] Check Vercel deployment logs for errors

### **3.3 Configure Stripe Webhook**

**In Stripe Dashboard** (https://dashboard.stripe.com/webhooks):

1. **Create/Update Webhook**:
   - **URL**: `https://api.rensto.com/api/stripe/webhook`
   - **Events**: `checkout.session.completed`
   - **Description**: "Marketplace Purchase Automation"

2. **Copy Webhook Secret**:
   - Click webhook → Reveal signing secret
   - Update `STRIPE_WEBHOOK_SECRET` in Vercel if changed

3. **Test Webhook**:
   - Send test event: `checkout.session.completed`
   - Verify response is 200
   - Check Vercel logs for successful processing

### **3.4 Smoke Tests**

**Quick Health Checks**:

```bash
# Test 1: Health check (optional health endpoint)
curl https://api.rensto.com/api/stripe/webhook -X OPTIONS

# Test 2: Verify endpoints exist (should return 405 Method Not Allowed or proper response)
curl https://api.rensto.com/api/marketplace/downloads -X GET
curl https://api.rensto.com/api/installation/booking -X GET

# Test 3: Verify correct error responses
curl -X POST https://api.rensto.com/api/marketplace/downloads \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 400 Bad Request with error message
```

---

## 🔍 **PHASE 4: POST-DEPLOYMENT VERIFICATION**

### **4.1 End-to-End Purchase Flow Test**

**Real Test Purchase** (Stripe Test Mode):

1. **Template Purchase**:
   - [ ] Go to https://rensto.com/marketplace (or test page)
   - [ ] Click "Buy Now" on a template
   - [ ] Complete Stripe checkout with test card
   - [ ] Verify webhook received
   - [ ] Verify n8n workflow executed
   - [ ] Verify Airtable records created
   - [ ] Verify download link works

2. **Installation Purchase**:
   - [ ] Click "Book Installation" on a template
   - [ ] Complete Stripe checkout
   - [ ] Verify workflow executed
   - [ ] Verify TidyCal booking link generated
   - [ ] Verify booking link works

### **4.2 Monitoring & Logging**

**Vercel Logs**:
```bash
vercel logs --follow --prod
```

**What to Monitor**:
- [ ] API endpoint response times (<500ms for downloads, <2s for booking)
- [ ] Error rates (should be 0% for valid requests)
- [ ] Webhook processing time
- [ ] Airtable API call success rate

**n8n Execution Monitoring**:
- [ ] Go to http://173.254.201.134:5678/executions
- [ ] Filter by STRIPE-MARKETPLACE-001 and STRIPE-INSTALL-001
- [ ] Verify recent executions succeeded
- [ ] Check for any error nodes

**Airtable Activity Log**:
- [ ] Open Airtable base → Activity log
- [ ] Verify records created/updated correctly
- [ ] Check for any API errors

### **4.3 Performance Verification**

**Response Time Targets**:
- Download Link Generation: <500ms
- Download Token Handler: <200ms (redirect)
- Installation Booking: <2s (2 external API calls)

**Load Testing** (Optional):
- Test with 10 concurrent requests
- Verify no rate limiting issues
- Check Vercel function timeout limits

---

## 🔄 **ROLLBACK PLAN**

### **If Critical Issues Detected**

**Immediate Actions**:

1. **Disable Stripe Webhook**:
   - Stripe Dashboard → Webhooks → Disable webhook
   - This stops new purchase processing

2. **Revert Deployment**:
   ```bash
   # Rollback to previous deployment
   vercel rollback
   ```

3. **Manual Processing**:
   - Check Stripe Dashboard for unprocessed purchases
   - Manually create Airtable records if needed
   - Send download/booking links manually

4. **Fix and Redeploy**:
   - Fix issues in code
   - Test locally
   - Redeploy to preview
   - Test again
   - Deploy to production

---

## 📊 **MONITORING & MAINTENANCE**

### **Daily Monitoring** (First Week)

- [ ] Check Vercel logs for errors
- [ ] Check n8n execution success rate
- [ ] Verify Airtable records created correctly
- [ ] Monitor download link usage
- [ ] Check TidyCal booking link clicks

### **Weekly Maintenance**

- [ ] Review error logs
- [ ] Check expired download links (clean up if needed)
- [ ] Verify Airtable data integrity
- [ ] Review performance metrics

### **Monthly Reviews**

- [ ] Analyze purchase patterns
- [ ] Review API response times
- [ ] Check for optimization opportunities
- [ ] Update documentation if needed

---

## 📝 **TESTING CHECKLIST SUMMARY**

### **Pre-Deployment** ✅
- [ ] Environment variables set in Vercel
- [ ] Code committed and pushed
- [ ] n8n workflows active
- [ ] Airtable tables ready

### **Local Testing** ✅
- [ ] API endpoints unit tested
- [ ] Error handling verified
- [ ] Airtable integration works

### **Preview Testing** ✅
- [ ] Deployed to Vercel Preview
- [ ] Stripe test checkout works
- [ ] Webhook processing verified
- [ ] n8n workflow execution verified
- [ ] Download links functional
- [ ] Installation booking works

### **Production Deployment** ✅
- [ ] Deployed to Production
- [ ] Stripe webhook configured
- [ ] Smoke tests pass
- [ ] End-to-end flow verified

### **Post-Deployment** ✅
- [ ] Monitoring set up
- [ ] Logs reviewed
- [ ] Performance verified
- [ ] Documentation updated

---

## 🎯 **SUCCESS CRITERIA**

**System is Production-Ready When**:
- ✅ All 3 API endpoints respond correctly
- ✅ Stripe webhook processing works
- ✅ n8n workflows execute without errors
- ✅ Airtable records created/updated correctly
- ✅ Download links work and redirect to GitHub
- ✅ TidyCal booking links generated correctly
- ✅ Error handling works for invalid inputs
- ✅ No critical errors in logs
- ✅ Response times meet targets

---

**Status**: 📋 **READY FOR TESTING**

*This document should be updated as testing progresses and issues are discovered/resolved.*

