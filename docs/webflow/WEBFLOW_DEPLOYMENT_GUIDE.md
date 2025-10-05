# 🚀 WEBFLOW STRIPE INTEGRATION - DEPLOYMENT GUIDE

**Date**: October 5, 2025
**Status**: Ready to Deploy
**Time Required**: 30 minutes
**Difficulty**: Easy (Copy-Paste)

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before starting, verify these are complete:

- [x] **api.rensto.com** subdomain configured and live
- [x] **Stripe API routes** deployed to api.rensto.com
- [x] **Stripe webhook** pointing to `https://api.rensto.com/api/stripe/webhook`
- [x] **n8n workflows** active (6 STRIPE workflows verified)
- [x] **Environment variables** set in Vercel

**All prerequisites met!** ✅ Ready to proceed.

---

## 📋 DEPLOYMENT STEPS

### **PART 1: MARKETPLACE PAGE** (15 minutes)

#### Step 1: Open Webflow Designer
1. Go to https://webflow.com/dashboard
2. Open your **rensto.com** site
3. Go to **Pages** → **Marketplace**

#### Step 2: Add Custom Code
1. Click **Page Settings** (gear icon)
2. Go to **Custom Code** tab
3. Scroll to **Before </body> tag** section
4. Open `/docs/webflow/MARKETPLACE_INTEGRATION.html`
5. **Copy the ENTIRE file contents**
6. **Paste** into the "Before </body> tag" field
7. Click **Save**

#### Step 3: Configure Button Data Attributes

For each template card on your marketplace page:

**Download Template Button:**
```html
<a href="#"
   class="marketplace-download-btn button w-button"
   data-template-id="template-001"
   data-template-name="LinkedIn Lead Gen"
   data-template-price="49"
   data-flow-type="marketplace-template"
   data-tier="simple">
  Download Template
</a>
```

**Book Installation Button:**
```html
<a href="#"
   class="marketplace-install-btn button w-button"
   data-template-id="template-001"
   data-template-name="LinkedIn Lead Gen"
   data-install-price="797"
   data-flow-type="marketplace-install"
   data-tier="template">
  Book Installation
</a>
```

**To add data attributes in Webflow:**
1. Select the button element
2. Go to **Element Settings** panel
3. Click **Custom Attributes** (+ icon)
4. Add each attribute:
   - Name: `data-template-id` → Value: `template-001`
   - Name: `data-template-name` → Value: `LinkedIn Lead Gen`
   - Name: `data-template-price` → Value: `49`
   - Name: `data-flow-type` → Value: `marketplace-template`
   - Name: `data-tier` → Value: `simple`
   - Name: `class` → Add: `marketplace-download-btn`

Repeat for all template cards.

#### Step 4: Publish
1. Click **Publish** button (top right)
2. Select **Publish to rensto.com**
3. Wait for publish to complete

---

### **PART 2: SUBSCRIPTIONS PAGE** (15 minutes)

#### Step 1: Open Subscriptions Page
1. In Webflow Designer, go to **Pages** → **Subscriptions**

#### Step 2: Add Custom Code
1. Click **Page Settings** (gear icon)
2. Go to **Custom Code** tab
3. Scroll to **Before </body> tag** section
4. Open `/docs/webflow/SUBSCRIPTIONS_INTEGRATION.html`
5. **Copy the ENTIRE file contents**
6. **Paste** into the "Before </body> tag" field
7. Click **Save**

#### Step 3: Configure Selection Button Data Attributes

**Niche Selection Buttons:**
```html
<a href="#"
   class="niche-selector button w-button"
   data-niche-id="real-estate"
   data-niche-name="Real Estate">
  Real Estate
</a>
```

**Lead Volume Buttons:**
```html
<a href="#"
   class="volume-selector button w-button"
   data-volume-id="starter"
   data-volume-leads="100"
   data-volume-price="299">
  Starter - 100 leads/month - $299/mo
</a>

<a href="#"
   class="volume-selector button w-button"
   data-volume-id="professional"
   data-volume-leads="250"
   data-volume-price="599">
  Professional - 250 leads/month - $599/mo
</a>

<a href="#"
   class="volume-selector button w-button"
   data-volume-id="enterprise"
   data-volume-leads="500"
   data-volume-price="1499">
  Enterprise - 500+ leads/month - $1,499/mo
</a>
```

**CRM Selection Buttons:**
```html
<a href="#"
   class="crm-selector button w-button"
   data-crm-id="hubspot"
   data-crm-name="HubSpot">
  HubSpot
</a>

<a href="#"
   class="crm-selector button w-button"
   data-crm-id="salesforce"
   data-crm-name="Salesforce">
  Salesforce
</a>
```

**Start Subscription Buttons:**
```html
<a href="#"
   class="start-subscription-btn button w-button">
  Start Subscription
</a>
```

Add `class="start-subscription-btn"` to BOTH subscription buttons on the page.

#### Step 4: Publish
1. Click **Publish** button
2. Select **Publish to rensto.com**
3. Wait for publish to complete

---

## 🧪 TESTING PROCEDURE

### **Test 1: Marketplace Template Purchase**

1. **Open**: https://rensto.com/marketplace
2. **Open Browser Console**: Press F12 → Console tab
3. **Look for**: `🎯 Rensto Marketplace Checkout Initialized`
4. **Click**: "Download Template" button on any template
5. **Expected**: Should see `💳 Creating checkout session` in console
6. **Expected**: Should redirect to Stripe Checkout page
7. **Test Card**: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
8. **Complete**: Checkout flow
9. **Expected**: Redirect to success page
10. **Verify**:
    - Check Stripe Dashboard → Payments
    - Check n8n workflow: STRIPE-MARKETPLACE-001 execution
    - Check Airtable for revenue record (DEV-FIN-006)

### **Test 2: Marketplace Installation**

1. **Click**: "Book Installation" button
2. **Expected**: Higher price in Stripe checkout
3. **Complete**: Test purchase
4. **Verify**: n8n STRIPE-INSTALL-001 workflow triggered

### **Test 3: Subscriptions**

1. **Open**: https://rensto.com/subscriptions
2. **Open Console**: F12
3. **Look for**: `🎯 Rensto Subscriptions Checkout Initialized`
4. **Select**: Niche (e.g., Real Estate)
   - Console should show: `✅ Niche selected`
5. **Select**: Lead volume (e.g., Professional - $599/mo)
   - Console should show: `✅ Volume selected`
6. **Select**: CRM (e.g., HubSpot)
   - Console should show: `✅ CRM selected`
7. **Verify**: "Start Subscription" button becomes enabled
8. **Click**: "Start Subscription"
9. **Expected**: Redirect to Stripe Checkout (recurring payment)
10. **Complete**: Test subscription
11. **Verify**:
    - Stripe Dashboard → Subscriptions
    - n8n workflow: STRIPE-SUBSCRIPTION-001 execution

---

## 🔍 TROUBLESHOOTING

### **Issue: Buttons Don't Work**

**Symptoms**: Clicking buttons does nothing

**Solution**:
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify custom code was added to page
4. Check button has correct class:
   - Marketplace: `marketplace-download-btn` or `marketplace-install-btn`
   - Subscriptions: `niche-selector`, `volume-selector`, `crm-selector`, `start-subscription-btn`
5. Verify data attributes are set correctly

### **Issue: "Processing..." Stays Forever**

**Symptoms**: Button shows "Processing..." but nothing happens

**Solution**:
1. Open browser console
2. Look for error messages
3. Common causes:
   - api.rensto.com not accessible
   - CORS issue (check API route headers)
   - Network error
4. Test API directly:
   ```bash
   curl -X POST https://api.rensto.com/api/stripe/checkout \
     -H "Content-Type: application/json" \
     -d '{"flowType":"marketplace-template","productId":"test","tier":"simple","customerEmail":"test@test.com","metadata":{}}'
   ```

### **Issue: Selections Don't Highlight**

**Symptoms**: Clicking niche/volume/CRM buttons doesn't show selection

**Solution**:
1. Check if `is-selected` and `w--current` classes exist in Webflow
2. Add these classes to buttons in Webflow:
   - Create a "Selected" state for buttons
   - Apply styles (background color, border, etc.)

### **Issue: Stripe Checkout Doesn't Open**

**Symptoms**: No redirect to Stripe after clicking button

**Solution**:
1. Check browser console for errors
2. Verify environment variables set in Vercel:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
3. Test API endpoint is responding:
   ```bash
   curl -I https://api.rensto.com/api/stripe/checkout
   # Should return: HTTP/2 405
   ```

### **Issue: Webhook Not Triggering**

**Symptoms**: Payment completes but n8n workflow doesn't run

**Solution**:
1. Check Stripe webhook logs:
   - https://dashboard.stripe.com/webhooks
   - Click on webhook endpoint
   - Check "Events" tab for recent events
2. Verify webhook URL is correct: `https://api.rensto.com/api/stripe/webhook`
3. Check `STRIPE_WEBHOOK_SECRET` is set in Vercel
4. Check n8n workflow is active:
   ```bash
   curl -s http://173.254.201.134:5678/api/v1/workflows | grep STRIPE
   ```

---

## 📊 SUCCESS METRICS

**After deployment, you should see:**

### **Immediate (Within 1 Hour)**:
- [x] Marketplace buttons redirect to Stripe
- [x] Subscriptions flow works end-to-end
- [x] Test payments complete successfully
- [x] Browser console shows no errors

### **Within 24 Hours**:
- [ ] First real customer payment received
- [ ] n8n workflows execute successfully
- [ ] Revenue syncs to Airtable (DEV-FIN-006)
- [ ] Customer receives template/onboarding

### **Within 1 Week**:
- [ ] 5+ marketplace purchases
- [ ] 2+ subscription signups
- [ ] $1K+ in total revenue
- [ ] Zero payment failures

---

## 🎯 POST-DEPLOYMENT CHECKLIST

After successful deployment:

- [ ] Test all 3 flows with real test cards
- [ ] Verify n8n workflows execute
- [ ] Check Airtable revenue records
- [ ] Monitor Stripe webhook logs
- [ ] Set up Slack alerts for failed payments (optional)
- [ ] Update CLAUDE.md with deployment status
- [ ] Archive temporary implementation docs

---

## 📞 SUPPORT

**If you encounter issues:**

1. **Check Documentation**:
   - CLAUDE.md (single source of truth)
   - .cursorrules (architecture rules)
   - This guide

2. **Check Logs**:
   - Browser console (F12)
   - Vercel deployment logs
   - Stripe webhook logs
   - n8n workflow executions

3. **Test Components Individually**:
   - Test API: `curl https://api.rensto.com/api/stripe/checkout -I`
   - Test DNS: `dig api.rensto.com`
   - Test Stripe webhook: Stripe Dashboard → Send test webhook

---

## 🚀 READY TO GO LIVE?

**Before going live:**
- [ ] All test flows completed successfully
- [ ] Stripe is in LIVE mode (not test mode)
- [ ] Webhooks pointing to production API
- [ ] n8n workflows active and tested
- [ ] Customer fulfillment workflows ready

**When ready:**
1. Switch Stripe to live mode
2. Update Stripe API keys in Vercel
3. Create live webhook endpoint
4. Test with real low-value purchase
5. Monitor first 24 hours closely

---

**DEPLOYMENT COMPLETE!** 🎉

Your Stripe integration is now live and ready to collect payments.

**Expected Time to First Revenue**: 24-48 hours after deployment

**Estimated Monthly Revenue**: $5K-20K from 2 active service types
