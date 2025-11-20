# 🔍 Stripe Environment Variable Conflict Audit

**Date**: November 3, 2025  
**Issue**: `CheckoutInitError: apiKey is not set` persists despite all fixes  
**Root Cause Hypothesis**: Environment variable conflicts or account key mismatches

---

## ✅ **CURRENT STATE**

### **Vercel Projects Using Stripe**:
1. **rensto-site** (rensto.com)
   - `STRIPE_SECRET_KEY`: ✅ Present (Production only)
   - `STRIPE_PUBLISHABLE_KEY`: ❌ **REMOVED** (not needed server-side)
   - `STRIPE_WEBHOOK_SECRET`: ✅ Present

2. **api-rensto-site** (api.rensto.com)
   - **NEEDS AUDIT**: Check if has different/conflicting Stripe keys

### **Local Environment**:
- `.env.local` has **TEST keys**:
  - `STRIPE_SECRET_KEY=sk_test_...`
  - `STRIPE_PUBLISHABLE_KEY=pk_test_...`
- Production uses **LIVE keys**
- **No conflict** (local vs production are intentionally different)

---

## 🔍 **FINDINGS**

### **1. Server-Side Doesn't Use Publishable Key** ✅
- Code only uses `STRIPE_SECRET_KEY` for session creation
- Removed `STRIPE_PUBLISHABLE_KEY` from Vercel (correct - not needed)
- Publishable key is only for client-side Stripe.js initialization

### **2. Account Verification** ✅
- Secret key: `sk_live_51R4wsKDE8rt1dEs1...`
- Account ID: `acct_1R4wsKDE8rt1dEs1`
- **Match**: ✅ Both share prefix `51R4wsKDE8rt1dEs1`

### **3. Session Creation** ✅
- Sessions create successfully
- Customer always attached
- Price objects used
- All configuration correct

### **4. Checkout URL Formats** ⚠️
- `rensto.com/api/stripe/checkout` → Creates `/c/pay/` URLs
- `api.rensto.com/api/stripe/checkout` → Creates `/g/pay/` URLs
- **Different formats** suggest different Stripe API versions or account contexts

---

## 🎯 **HYPOTHESIS: Account Key Mismatch**

**Theory**: The secret key might be creating sessions, but Stripe's checkout page can't associate the publishable key because:

1. **Multiple Stripe accounts exist** and keys are mixed
2. **Secret key belongs to different account** than expected
3. **Publishable key was rotated** but checkout sessions still reference old key
4. **Account-level setting** prevents publishable key embedding

---

## ✅ **ACTION: Recreate Stripe Keys from Scratch**

### **Option 1: Rotate API Keys in Stripe Dashboard**

1. Go to: https://dashboard.stripe.com/apikeys
2. **Rotate Secret Key**:
   - Click overflow menu (⋯) next to "Secret key"
   - Select "Rotate key"
   - Choose "Now" for expiration
   - **COPY THE NEW KEY** (you can only see it once!)
   - Update Vercel `STRIPE_SECRET_KEY` with new key
   - Redeploy

3. **Rotate Publishable Key** (for client-side):
   - Same process for "Publishable key"
   - Update client-side code if using Stripe.js

### **Option 2: Delete and Recreate Keys**

1. **Delete existing keys** in Stripe Dashboard
2. **Create new keys**
3. **Update Vercel env vars**
4. **Redeploy**

### **Option 3: Check for Multiple Accounts**

1. Go to: https://dashboard.stripe.com/settings/account
2. Check if there are multiple Stripe accounts
3. Verify which account the secret key belongs to
4. Ensure all keys belong to the same account

---

## 🧪 **TEST AFTER KEY ROTATION**

After rotating keys:

1. **Update Vercel**:
   ```bash
   vercel env rm STRIPE_SECRET_KEY production --yes
   vercel env add STRIPE_SECRET_KEY production
   # Paste new secret key
   ```

2. **Redeploy**:
   ```bash
   vercel --prod
   ```

3. **Test checkout**:
   ```bash
   curl -X POST https://rensto.com/api/stripe/checkout \
     -H "Content-Type: application/json" \
     -d '{"flowType":"marketplace-template","productId":"test-key-rotation","tier":"simple"}'
   ```

4. **Open checkout URL** and verify no `apiKey is not set` error

---

**Status**: ⏸️ **AWAITING KEY ROTATION IN STRIPE DASHBOARD**

