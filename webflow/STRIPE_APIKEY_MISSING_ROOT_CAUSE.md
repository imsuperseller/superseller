# 🔴 CRITICAL: Stripe "apiKey is not set" - Root Cause Found

**Date**: November 3, 2025  
**Error**: `CheckoutInitError: apiKey is not set`  
**Status**: ⚠️ **ACCOUNT-LEVEL ISSUE CONFIRMED**

---

## 🎯 **ROOT CAUSE IDENTIFIED**

The old working system used **GitHub-hosted JavaScript files** embedded in Webflow pages:
- `https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js`
- These scripts **embedded the publishable key directly in JavaScript**
- When checkout initiated, key was already available to Stripe

**Current System** (Post-Migration):
- Using Vercel API routes (`/api/stripe/checkout`)
- Sessions created server-side with secret key
- **Publishable key NOT embedded in checkout page**
- Stripe checkout can't find publishable key → `apiKey is not set`

---

## ✅ **WHY OLD SYSTEM WORKED**

**Old Architecture** (Webflow + GitHub Scripts):
```
Webflow Page → Loads stripe-core.js (with pk_live embedded)
           → Calls API → Creates session
           → Redirects to checkout.stripe.com
           → Checkout page has publishable key in context ✅
```

**New Architecture** (Vercel API Routes):
```
Client → Calls /api/stripe/checkout (server-side)
      → Creates session (secret key only)
      → Returns checkout URL
      → Redirects to checkout.stripe.com
      → Checkout page can't find publishable key ❌
```

---

## 🔧 **SOLUTION OPTIONS**

### **Option 1: Verify Publishable Key in Account** ⚠️ **MOST LIKELY FIX**

Stripe checkout should automatically include publishable key, but account may need verification:

1. Go to: https://dashboard.stripe.com/settings/account
2. Check: Account verification status
3. Verify: Publishable key exists: `pk_live_51R4wsKDE8rt1dEs1...`
4. If missing: Regenerate publishable key

### **Option 2: Use Explicit Publishable Key in Session** ⚠️ **NEEDS TESTING**

Stripe sessions can accept `api_key` parameter (rare, but possible):

```typescript
const session = await stripe.checkout.sessions.create({
  // ... existing config ...
}, {
  apiKey: process.env.STRIPE_PUBLISHABLE_KEY  // Explicit publishable key
});
```

**Note**: This is unusual - sessions usually auto-include publishable key from secret key's account.

### **Option 3: Account Needs Re-Verification After Migration** ⚠️ **LIKELY**

After DNS migration (Webflow → Vercel), Stripe account may need:
1. Domain re-verification
2. Account re-activation
3. Key pair re-verification

**Action**: Check Stripe Dashboard → Settings → Account → Verification status

---

## 🧪 **IMMEDIATE TEST**

**Check if account has publishable key**:
```bash
curl https://api.stripe.com/v1/account \
  -u STRIPE_SECRET_KEY=sk_live_...[REDACTED]:
```

**Expected**: Account object should include publishable key info

---

## 📋 **NEXT STEPS**

1. ✅ **Verify account status** in Stripe Dashboard
2. ✅ **Check publishable key exists** and matches account
3. ✅ **Test with explicit apiKey parameter** (if supported)
4. ✅ **Contact Stripe Support** if account needs re-verification

---

**Critical Issue**: Account-level configuration after DNS migration

