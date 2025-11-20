# 🔴 CRITICAL: Stripe Fixes Required

**Date**: November 3, 2025  
**Root Cause Found**: Failing webhook + account association

---

## ❌ **CRITICAL ISSUES IDENTIFIED**

### **Issue 1: Failing Webhook (100% Error Rate)**
- **URL**: `https://api.rensto.com/webhooks/stripe`
- **Status**: 404 (route doesn't exist or not deployed)
- **Impact**: 100% error rate - Stripe keeps retrying and failing
- **Action**: **DELETE THIS WEBHOOK** in Stripe Dashboard

### **Issue 2: Account Association**
- **Account-specific URL format**: `https://dashboard.stripe.com/acct_1R4wsKDE8rt1dEs1/apikeys`
- **Fix Applied**: Added `stripe_account_id` to session metadata
- **Code Updated**: ✅ Added account ID to checkout session metadata

---

## ✅ **FIXES APPLIED**

### **1. Added Account Metadata to Checkout Sessions**
**File**: `apps/web/rensto-site/src/app/api/stripe/checkout/route.ts`

**Change**: Added account ID to session metadata to ensure proper account association:
```typescript
sessionConfig.metadata.stripe_account_id = 'acct_1R4wsKDE8rt1dEs1';
```

**Why**: The account-specific Stripe Dashboard URL suggests we need explicit account association for checkout sessions.

### **2. Removed Unnecessary Publishable Key from Server-Side**
- ✅ Removed `STRIPE_PUBLISHABLE_KEY` from Vercel env vars
- Server-side only needs `STRIPE_SECRET_KEY`
- Publishable key is only for client-side Stripe.js

---

## 🚨 **REQUIRED ACTION: Delete Failing Webhook**

### **In Stripe Dashboard**:

1. Go to: https://dashboard.stripe.com/webhooks
2. Find: `https://api.rensto.com/webhooks/stripe` (100% error rate)
3. Click **"Delete"** or **"Remove endpoint"**
4. Confirm deletion

**Why**: This failing webhook is likely causing Stripe to:
- Flag the account
- Block checkout initialization
- Prevent publishable key embedding

---

## 🧪 **TEST AFTER FIXES**

**After deleting the failing webhook**, test checkout:

```bash
curl -X POST https://rensto.com/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "flowType": "marketplace-template",
    "productId": "after-webhook-cleanup",
    "tier": "simple"
  }'
```

**Open the checkout URL** from response and verify:
- ✅ No `apiKey is not set` error
- ✅ Payment form loads correctly

---

## 📋 **WEBHOOK CONFIGURATION (After Cleanup)**

**Should only have**:
- ✅ `https://api.rensto.com/api/stripe/webhook` (0% error)

**Events**:
- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded` (optional)

---

**Status**: ✅ **CODE UPDATED - AWAITING WEBHOOK DELETION**

