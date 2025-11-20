# 🔴 CRITICAL: Stripe "apiKey is not set" Error

**Date**: November 3, 2025  
**Error**: `CheckoutInitError: apiKey is not set`  
**Status**: ⚠️ **STRIPE ACCOUNT CONFIGURATION ISSUE**

---

## ❌ **THE ERROR**

**Console Error**:
```
CheckoutInitError: apiKey is not set
    at J (cs_live_a1Vq9TObS8jf...)
```

**What This Means**:
- Stripe hosted checkout page loads
- JavaScript tries to initialize Stripe checkout
- Can't find publishable key in session context
- Result: "Page not found" error

---

## 🔍 **ROOT CAUSE**

**For Stripe Hosted Checkout** (`checkout.stripe.com`):
- Stripe should **automatically embed** publishable key in session
- The key comes from the **account** that created the session
- If checkout can't find it → Account-level issue

**This is NOT a code issue**:
- ✅ Sessions created successfully (`cs_live_...`)
- ✅ Account is enabled (charges, payouts, details submitted)
- ❌ But checkout page can't initialize

---

## ✅ **SOLUTION: Verify Account Configuration**

### **Step 1: Check Stripe Account Settings**

Go to: https://dashboard.stripe.com/settings/account

**Look for**:
- ⚠️ Account warnings/restrictions
- ⚠️ "Complete your account setup" messages
- ⚠️ Missing business information
- ⚠️ Verification pending

### **Step 2: Check API Keys Configuration**

Go to: https://dashboard.stripe.com/apikeys

**Verify**:
- ✅ You're in **LIVE MODE** (not test mode)
- ✅ Publishable key exists: `pk_live_51R4wsKDE8rt1dEs1...`
- ✅ Secret key exists: `sk_live_51R4wsKDE8rt1dEs1...`
- ✅ Both keys are **active** (not revoked)

### **Step 3: Check Account Requirements**

Go to: https://dashboard.stripe.com/settings/onboarding

**Verify**:
- ✅ Business information complete
- ✅ Bank account connected
- ✅ Identity verification complete
- ✅ Tax information provided

### **Step 4: Test with Stripe Dashboard Checkout**

1. Go to: https://dashboard.stripe.com/test/checkout_sessions
2. Click **"Create checkout session"** (manual test)
3. Fill in:
   - Product name: "Test"
   - Price: $29.00
   - Success URL: `https://rensto.com/`
   - Cancel URL: `https://rensto.com/`
4. **Does this checkout work?**
   - ✅ **Yes** → Account is fine, issue is in our code/config
   - ❌ **No** → Account has restrictions, contact Stripe support

---

## 🔧 **ALTERNATIVE: Try Creating Session with Explicit Account**

If account looks fine but checkout still fails, we might need to:

1. **Explicitly set account** when creating session (for multi-account setups)
2. **Use different checkout mode** (embedded vs hosted)
3. **Contact Stripe Support** with session ID

---

## 📋 **IMMEDIATE ACTIONS**

1. **Test manual checkout** from Stripe Dashboard (see Step 4 above)
2. **Check account for warnings** in Settings
3. **Verify API keys are active** (not revoked)
4. **Contact Stripe Support** if account looks fine but checkout fails

---

## 🎯 **NEXT STEPS**

**If manual checkout works**:
- Issue is in our session configuration
- Need to compare working vs non-working sessions

**If manual checkout fails**:
- Account has restrictions
- Contact Stripe support with:
  - Account ID: `acct_1R4wsKDE8rt1dEs1`
  - Session ID: `cs_live_a1Vq9TObS8jfkvLWV2z7EaY3A23jPmR0EoHlAoOJRZL8cpyw1V80a6pSnQ`
  - Error: "apiKey is not set" on hosted checkout

---

**Status**: ⏸️ **WAITING FOR STRIPE ACCOUNT VERIFICATION**

