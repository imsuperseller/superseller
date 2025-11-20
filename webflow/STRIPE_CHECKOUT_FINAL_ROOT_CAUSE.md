# 🔴 FINAL ROOT CAUSE: Stripe Checkout "apiKey is not set"

**Date**: November 3, 2025  
**Error**: `CheckoutInitError: apiKey is not set` (persistent for hours)  
**Status**: ⚠️ **REQUIRES MANUAL STRIPE DASHBOARD VERIFICATION**

---

## ✅ **WHAT WE'VE CONFIRMED**

1. ✅ Sessions created successfully (`cs_live_...`)
2. ✅ Customer always attached to sessions
3. ✅ Price objects used (not inline price_data)
4. ✅ Account enabled (charges, payouts, details submitted)
5. ✅ Account ID matches secret key: `acct_1R4wsKDE8rt1dEs1`
6. ✅ Code configuration matches working marketplace app 100%

---

## 🔴 **THE REAL PROBLEM**

**Stripe Hosted Checkout** (`checkout.stripe.com`) can't find the publishable key when initializing the checkout page.

**This is NOT a code issue** - all server-side session creation works perfectly.

**This IS likely**:
- Publishable key mismatch (wrong key in Vercel env vars)
- Publishable key revoked/missing in Stripe account
- Account-level setting blocking publishable key embedding

---

## ✅ **REQUIRED ACTION: Manual Stripe Dashboard Check**

### **Step 1: Verify Publishable Key Exists and Matches**

**Exact Link**: https://dashboard.stripe.com/apikeys

**Steps**:
1. **Click the link above** (opens Stripe Dashboard API Keys page)
2. **CRITICAL**: Make sure you're in **LIVE MODE** (toggle in top-right corner must show "Live mode")
3. Scroll to **"Publishable key"** section (should be visible, starts with `pk_live_...`)
4. **Copy the FULL publishable key** (starts with `pk_live_51R4wsKDE8rt1dEs1...`)
5. **Verify it matches**: The key MUST start with `pk_live_51R4wsKDE8rt1dEs1` (matches your account ID `acct_1R4wsKDE8rt1dEs1`)
6. **If key is missing/revoked**: Click "Reveal publishable key" or "Create new key"

### **Step 2: Compare with Vercel Environment Variable**

**Vercel Dashboard Link**: https://vercel.com/shais-projects-f9b9e359/rensto-site/settings/environment-variables

**Steps**:
1. **Click the link above** (opens Vercel project settings)
2. Find `STRIPE_PUBLISHABLE_KEY` in the list
3. **Click to reveal** (decrypt) the value
4. **Compare with Stripe Dashboard key**:
   - They MUST match EXACTLY
   - Both MUST start with `pk_live_51R4wsKDE8rt1dEs1`
   - No extra spaces or newlines

**If they don't match**:
- Copy the key from Stripe Dashboard
- Update Vercel env var
- Redeploy: `vercel --prod` from `apps/web/rensto-site` directory

### **Step 3: Check Account Restrictions**

**Exact Link**: https://dashboard.stripe.com/settings/account

**Steps**:
1. **Click the link above**
2. Look for:
   - ⚠️ Yellow/red warning banners at the top
   - ⚠️ "Complete account setup" or "Action required" messages
   - ⚠️ Any account restrictions or limitations sections
3. If warnings exist → Address them first (complete any pending verifications)

### **Step 4: Check Integration Settings**

**Exact Link**: https://dashboard.stripe.com/settings/integration

**Steps**:
1. **Click the link above**
2. Look for any settings related to:
   - Custom integrations
   - Card data collection
   - Checkout settings
3. Verify there are no restrictions blocking checkout initialization

---

## 🎯 **WHY THIS IS THE ONLY PATH FORWARD**

All code-level fixes have been exhausted:
- ✅ Customer attachment (done)
- ✅ Price objects (done)
- ✅ API version matching (done)
- ✅ Minimal config (done)
- ✅ Success/cancel URLs (fixed)

**The error persists**, which means:
- ❌ NOT a code issue
- ✅ Account-level configuration issue
- ✅ Requires manual verification in Stripe Dashboard

---

## 📋 **TEST AFTER FIXING**

**After updating publishable key in Vercel**, create a new test session:

```bash
curl -X POST https://rensto.com/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "flowType": "marketplace-template",
    "productId": "test-publishable-key-fix",
    "tier": "simple"
  }'
```

**Then test the checkout URL** from the response. If it still fails with `apiKey is not set`, contact Stripe Support.

---

## 📞 **STRIPE SUPPORT (If Still Fails)**

**Support Link**: https://dashboard.stripe.com/support

**Information to provide**:
- Account ID: `acct_1R4wsKDE8rt1dEs1`
- Error: `CheckoutInitError: apiKey is not set` on hosted checkout page
- Sessions create successfully, but checkout page can't initialize
- Example session ID: `cs_live_b1oytwQyjBaBVufglKilKrFPQ1J0ErHDTnxIcAglTQOsdSoMKMSb6E4BIW`
- Timeline: Started after DNS migration from Webflow to Vercel

---

**Status**: ⏸️ **WAITING FOR MANUAL STRIPE DASHBOARD VERIFICATION**

**Critical Links**:
- API Keys: https://dashboard.stripe.com/apikeys
- Account Settings: https://dashboard.stripe.com/settings/account
- Integration Settings: https://dashboard.stripe.com/settings/integration
- Vercel Env Vars: https://vercel.com/shais-projects-f9b9e359/rensto-site/settings/environment-variables
