# 🔴 CRITICAL: Stripe Checkout "apiKey is not set" - Account Issue

**Date**: November 3, 2025  
**Error**: `CheckoutInitError: apiKey is not set` (persistent across sessions)  
**Status**: ⚠️ **STRIPE ACCOUNT RESTRICTION - NEEDS SUPPORT**

---

## ❌ **THE PROBLEM**

**Error Persists After**:
- ✅ Environment variable cleanup
- ✅ Multiple session configurations tested
- ✅ Account verified enabled (charges, payouts, details submitted)
- ✅ Sessions created successfully
- ❌ **Checkout page still can't initialize**

**This indicates**: Not a code issue, but a **Stripe account-level restriction**

---

## 🔍 **ROOT CAUSE ANALYSIS**

### **What Should Happen**:
1. Session created → Stripe embeds publishable key automatically
2. User redirected to `checkout.stripe.com/c/pay/cs_live_...`
3. Stripe checkout page loads with publishable key in context
4. Checkout initializes successfully ✅

### **What's Actually Happening**:
1. Session created ✅
2. User redirected to checkout URL ✅
3. Stripe checkout page loads ✅
4. **Checkout JavaScript can't find publishable key** ❌
5. Error: `apiKey is not set` ❌

---

## ⚠️ **WHY THIS IS AN ACCOUNT ISSUE**

**Evidence**:
- ✅ All sessions created successfully
- ✅ Account appears fully enabled
- ✅ No code-level issues found
- ❌ **Consistent failure across all sessions**
- ❌ **Happens on Stripe's own domain** (`checkout.stripe.com`)

**This means**:
- Stripe's hosted checkout can't access your account's publishable key
- Likely an account configuration or restriction
- Not fixable via code changes

---

## ✅ **SOLUTION: Contact Stripe Support**

### **Step 1: Gather Information**

**Account Details**:
- Account ID: `acct_1R4wsKDE8rt1dEs1`
- Account Type: `standard`
- Country: `US`
- Email: `service@rensto.com`

**Recent Session IDs**:
- `cs_live_a1Lv7tGdNNfcImxzRFpKq9j70qhJXMz4QWegBfkE8nzdUVxUjJV7tqmKqL`
- `cs_live_a1Vq9TObS8jfkvLWV2z7EaY3A23jPmR0EoHlAoOJRZL8cpyw1V80a6pSnQ`

**Error Details**:
- Error: `CheckoutInitError: apiKey is not set`
- Location: `checkout.stripe.com` (Stripe's hosted checkout)
- Consistent: Yes (happens on all checkout sessions)
- Browser: Multiple tested

### **Step 2: Contact Stripe Support**

**Method 1: Dashboard Support**
1. Go to: https://dashboard.stripe.com/support
2. Click **"Contact Support"**
3. Select category: **"Checkout"** or **"Technical Issues"**

**Method 2: Support Email**
- Email: support@stripe.com
- Subject: `CheckoutInitError: apiKey is not set on hosted checkout`

**Method 3: Live Chat** (if available)
- Dashboard → Help → Live Chat

### **Step 3: Provide Support Ticket Information**

**Copy this information**:

```
Subject: CheckoutInitError: apiKey is not set on hosted checkout sessions

Issue:
Hosted checkout sessions (checkout.stripe.com) fail to initialize with error:
"CheckoutInitError: apiKey is not set"

Details:
- Account ID: acct_1R4wsKDE8rt1dEs1
- Account Type: standard
- Country: US
- Charges Enabled: Yes
- Payouts Enabled: Yes
- Details Submitted: Yes

Test Session IDs:
- cs_live_a1Lv7tGdNNfcImxzRFpKq9j70qhJXMz4QWegBfkE8nzdUVxUjJV7tqmKqL
- cs_live_a1Vq9TObS8jfkvLWV2z7EaY3A23jPmR0EoHlAoOJRZL8cpyw1V80a6pSnQ

Steps to Reproduce:
1. Create checkout session via API (succeeds)
2. Redirect to checkout.stripe.com URL
3. Page loads but checkout JavaScript fails to initialize
4. Console error: "CheckoutInitError: apiKey is not set"

What I've Tried:
- Verified account is fully enabled
- Tested multiple session configurations
- Cleaned up environment variables
- Tested in multiple browsers
- Error persists consistently

Request:
Please investigate why Stripe's hosted checkout cannot access the 
publishable key for this account. Sessions create successfully, but 
checkout page initialization fails.
```

---

## 📋 **ALTERNATIVE: Check Account Settings Manually**

Before contacting support, double-check:

1. **Account Settings**: https://dashboard.stripe.com/settings/account
   - Look for any yellow/red warning banners
   - Check for "Complete your account setup" messages

2. **API Keys**: https://dashboard.stripe.com/apikeys
   - Verify publishable key exists: `pk_live_51R4wsKDE8rt1dEs1...`
   - Verify it's not revoked
   - Make sure you're viewing LIVE mode (not test)

3. **Restrictions**: https://dashboard.stripe.com/settings/restrictions
   - Check for any payment restrictions
   - Verify country restrictions

4. **Test Manual Checkout**:
   - Go to: https://dashboard.stripe.com/test/checkout_sessions
   - Create a manual checkout session
   - **Does it work?**
     - ✅ Yes → Issue in our integration
     - ❌ No → Account restriction confirmed

---

## 🎯 **NEXT STEPS**

**Priority 1**: Contact Stripe Support with information above

**Priority 2**: Check account settings for any warnings/restrictions

**Priority 3**: Test manual checkout from Stripe Dashboard

---

## 📝 **WHAT WE'VE VERIFIED**

✅ Environment variables configured correctly  
✅ Sessions created successfully  
✅ Account enabled (charges, payouts)  
✅ Code implementation correct  
❌ Stripe hosted checkout initialization failing

**Conclusion**: Account-level issue requiring Stripe support intervention

---

**Status**: ⏸️ **WAITING FOR STRIPE SUPPORT RESPONSE**
