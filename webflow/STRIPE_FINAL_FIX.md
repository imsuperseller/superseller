# 🔧 Final Stripe Configuration Fixes

**Date**: November 2, 2025  
**Status**: ⚠️ **TWO ISSUES FOUND**

---

## ❌ **ISSUE 1: Webhook URL Path Wrong**

**Current Webhook URL in Stripe**: `https://api.rensto.com/stripe/webhook`  
**Actual API Route**: `/api/stripe/webhook`  
**Correct URL**: `https://api.rensto.com/api/stripe/webhook` ✅

**Fix**: Update Stripe webhook endpoint URL to include `/api/`

---

## ❌ **ISSUE 2: Publishable Key Mismatch**

**Current**:
- `STRIPE_SECRET_KEY`: `sk_test_...` (TEST) ✅
- `STRIPE_PUBLISHABLE_KEY`: `pk_live_...` (LIVE) ❌

**Problem**: Frontend (publishable) and backend (secret) must be same mode!

**Fix**: Update `STRIPE_PUBLISHABLE_KEY` to test key (`pk_test_...`)

---

## ✅ **COMPLETE FIX STEPS**

### **Step 1: Get Test Publishable Key**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Make sure TEST MODE is enabled
3. Copy **Publishable key** (starts with `pk_test_...`)

### **Step 2: Update Vercel Environment Variables**

**Option A: Via Dashboard**
1. Go to: https://vercel.com/shais-projects-f9b9e359/rensto-main-website/settings/environment-variables
2. Find: `STRIPE_PUBLISHABLE_KEY`
3. Update to: `pk_test_...` (your test publishable key)
4. Apply to: Production, Preview, Development
5. Save

**Option B: Via CLI** (I can do this if you provide `pk_test_...`)

### **Step 3: Update Stripe Webhook URL**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click webhook: `we_1SF5qCDE8rt1dEs1SbZCqETE`
3. Click **"Update endpoint"**
4. Change URL from:
   - `https://api.rensto.com/stripe/webhook` ❌
   - To: `https://api.rensto.com/api/stripe/webhook` ✅
5. **Note**: If URL changes, Stripe generates NEW signing secret
6. Copy new signing secret if changed
7. Update Vercel `STRIPE_WEBHOOK_SECRET` if changed

### **Step 4: Verify Events**

Make sure webhook listens to:
- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded` (optional)

### **Step 5: Redeploy**

After updates:
```bash
cd apps/web/rensto-site
vercel --prod
```

---

## ✅ **AFTER FIXES**

Both issues resolved:
- ✅ Secret key: `sk_test_...`
- ✅ Publishable key: `pk_test_...`
- ✅ Webhook URL: `https://api.rensto.com/api/stripe/webhook`
- ✅ Events: `checkout.session.completed`

Then checkout will work! ✅

---

**Priority**: HIGH - Marketplace checkout blocked until both fixes applied

