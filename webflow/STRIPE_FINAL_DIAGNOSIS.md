# 🔴 FINAL DIAGNOSIS: Stripe "apiKey is not set" - Account-Level Issue

**Date**: November 3, 2025  
**Error**: `CheckoutInitError: apiKey is not set` (persistent after all fixes)  
**Status**: ⚠️ **REQUIRES STRIPE SUPPORT INTERVENTION**

---

## ✅ **WHAT WE'VE VERIFIED**

1. ✅ **Account is enabled**: Charges, payouts, details submitted
2. ✅ **Keys match**: Secret key and publishable key both from account `acct_1R4wsKDE8rt1dEs1`
3. ✅ **Sessions created successfully**: All return valid `cs_live_...` IDs
4. ✅ **Customer attached**: Always created/retrieved and attached
5. ✅ **Price objects used**: Not inline `price_data`
6. ✅ **Minimal config**: Only required fields (no optional fields)
7. ✅ **API version**: `2023-10-16` (matching working implementation)
8. ✅ **Failing webhook deleted**: No 404s causing account issues
9. ✅ **Code matches working pattern**: 100% identical to marketplace app

---

## 🔴 **THE PROBLEM**

**Stripe's hosted checkout page** (`checkout.stripe.com`) **cannot find the publishable key** when initializing.

**What this means**:
- Stripe should automatically embed the publishable key from the account that created the session
- For hosted checkout, this is automatic based on the secret key used
- Since sessions are created successfully, the secret key is valid
- But checkout initialization fails because publishable key can't be found

**This is NOT a code issue** - all server-side configuration is correct.

---

## 🎯 **ROOT CAUSE**

**Most Likely**: Account-level configuration issue after DNS migration:
1. Stripe's internal systems may not associate the publishable key with hosted checkout for this account
2. Account may need re-verification after domain change
3. Publishable key state may be invalid (even though it exists in dashboard)

**Less Likely**: 
- Stripe internal bug preventing publishable key embedding
- Account restriction not visible in dashboard

---

## ✅ **REQUIRED ACTION: Contact Stripe Support**

### **Support Request Template**

**Subject**: Hosted Checkout `CheckoutInitError: apiKey is not set` - Account `acct_1R4wsKDE8rt1dEs1`

**Message**:
```
Hello Stripe Support,

I'm experiencing an issue where Stripe's hosted checkout page fails to initialize with the error:

CheckoutInitError: apiKey is not set

Details:
- Account ID: acct_1R4wsKDE8rt1dEs1
- Account Type: standard
- Country: US
- Charges Enabled: Yes
- Payouts Enabled: Yes

Issue:
- Checkout sessions are created successfully via API (return valid cs_live_... IDs)
- Secret key is valid and active (sk_live_51R4wsKDE8rt1dEs1...)
- Publishable key exists and is active (pk_live_51R4wsKDE8rt1dEs1...)
- Both keys match account (share prefix 51R4wsKDE8rt1dEs1)
- But when redirecting to checkout.stripe.com, the checkout page fails to initialize

Error occurs on:
- https://checkout.stripe.com/c/pay/cs_live_[session-id]

Example failing session:
- cs_live_a1rVq6J70wF0k9Xwinuq39MCHyJXFHvufRt2hds3Ww3u9lXeFhXfJhk9uA

What I've tried:
- Verified account is enabled and active
- Verified both API keys are valid and match account
- Simplified checkout session config to absolute minimal (only required fields)
- Deleted failing webhook endpoints
- Matched API version with working implementation
- Verified customer is always attached to sessions
- Verified all URLs are valid and reachable

The issue started after a DNS migration from Webflow to Vercel, but the Stripe account and keys were not changed.

Could you please investigate why Stripe's hosted checkout cannot find the publishable key during initialization?

Thank you!
```

---

## 📋 **ALTERNATIVE: Try Publishable Key Regeneration**

Before contacting support, you could try:

1. Go to: https://dashboard.stripe.com/apikeys
2. **Rotate Publishable Key**:
   - Click "⋯" next to "Publishable key"
   - Select "Rotate key"
   - Copy the NEW publishable key
3. **Update Vercel** with new publishable key (even though server-side doesn't use it, having it correct may help)
4. **Test** with fresh checkout session

**Note**: This is a long shot, but rotating the key might reset its internal state.

---

**Status**: ⚠️ **ALL CODE FIXES EXHAUSTED - STRIPE SUPPORT REQUIRED**

