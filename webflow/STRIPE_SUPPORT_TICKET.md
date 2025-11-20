# 🎫 Stripe Support Ticket - CheckoutInitError: apiKey is not set

**Date**: November 3, 2025  
**Priority**: HIGH - Production checkout completely blocked

---

## 🔴 **ISSUE SUMMARY**

Hosted Stripe Checkout sessions (`checkout.stripe.com`) fail to initialize with error:
```
CheckoutInitError: apiKey is not set
```

**Impact**: All 5 payment flows are blocked - no customers can complete purchases.

---

## ✅ **WHAT WE'VE VERIFIED**

### **Account Details**
- **Account ID**: `acct_1R4wsKDE8rt1dEs1`
- **Account Type**: `standard`
- **Country**: `US`
- **Email**: `service@rensto.com`
- **Charges Enabled**: `true`
- **Payouts Enabled**: `true`
- **Details Submitted**: `true`

### **API Keys**
- **Secret Key**: `sk_live_51R4wsKDE8rt1dEs1...` ✅ Active
- **Publishable Key**: `pk_live_51R4wsKDE8rt1dEs1nOQSpNPYjYybJYSInhcQR1UGkZ1Ru90UWvV5oKbt53JG0yk9Qo1fWWgxxghE2wyzuVpyoe8t00DXz5m37o` ✅ Verified in Dashboard
- **Key Match**: Both keys share prefix `51R4wsKDE8rt1dEs1` matching account ID ✅

### **Session Creation**
- ✅ Sessions created successfully via API
- ✅ Sessions return valid checkout URLs
- ✅ Session status: `open`
- ✅ Customer attached to sessions
- ✅ Price objects used (not inline price_data)
- ✅ All required parameters present

### **Code Configuration**
- ✅ Stripe API version: `2023-10-16`
- ✅ Customer always attached to sessions
- ✅ Success/cancel URLs valid and reachable
- ✅ Configuration matches 100% working implementation

---

## ❌ **THE PROBLEM**

### **Error Sequence**
1. Session created successfully → `cs_live_...` ID returned ✅
2. Redirect to `checkout.stripe.com/c/pay/cs_live_...` ✅
3. Stripe checkout page loads ✅
4. **JavaScript tries to initialize checkout** ❌
5. **Error**: `CheckoutInitError: apiKey is not set` ❌
6. Result: "Something went wrong" / checkout page fails

### **What This Means**
- Stripe's hosted checkout page can't find the publishable key when initializing
- For hosted checkout, Stripe should automatically embed publishable key from the account that created the session
- **This is happening on Stripe's own domain** (`checkout.stripe.com`), not our code

---

## 🔍 **ROOT CAUSE ANALYSIS**

### **This Worked Before**
- Prior to DNS migration (Webflow → Vercel), checkout worked successfully
- Same account, same API keys
- After migration, issue started

### **What Changed**
- DNS migration: `rensto.com` moved from Webflow to Vercel
- Hosting changed: Static site → Next.js application
- API endpoint changed: `api.rensto.com` → `rensto.com/api/stripe/checkout`

### **What Didn't Change**
- Stripe account remains the same
- API keys remain the same (verified)
- Session creation logic matches working implementation

---

## 🧪 **TEST SESSIONS**

### **Latest Test Session**
- **Session ID**: `cs_live_b1MdzBrgESNWxYGgiiY1s5eFP7lcKMvwCyeeTF7A21eFNE5HsvlrBQ5cVJ`
- **Created**: November 3, 2025
- **Status**: `open`
- **Customer**: Attached (`cus_...`)
- **URL**: `https://checkout.stripe.com/c/pay/cs_live_b1MdzBrgESNWxYGgiiY1s5eFP7lcKMvwCyeeTF7A21eFNE5HsvlrBQ5cVJ`
- **Error**: `CheckoutInitError: apiKey is not set`

### **Previous Test Sessions** (all show same error)
- `cs_live_b1oytwQyjBaBVufglKilKrFPQ1J0ErHDTnxIcAglTQOsdSoMKMSb6E4BIW`
- `cs_live_b1XH7uuAvLPQjAfbUEhe8ExNJLb8rcMFpdcP8x9wtgEfA6NN4rEWiQ4J6V`
- `cs_live_a1yDVU5IMYJMROjNPhEQ9hpTQp30nyz49YAjLnMJHtxBgY9HjSEgfAqTyl`

---

## 📋 **WHAT WE'VE TRIED**

1. ✅ Verified publishable key exists and matches account
2. ✅ Updated publishable key in Vercel environment variables
3. ✅ Verified account is fully enabled (charges, payouts, details submitted)
4. ✅ Ensured customer always attached to sessions
5. ✅ Changed from inline `price_data` to Stripe Price objects
6. ✅ Matched Stripe API version (`2023-10-16`)
7. ✅ Simplified session configuration to minimal required fields
8. ✅ Verified success/cancel URLs are valid and reachable
9. ✅ Tested in multiple browsers
10. ✅ Checked for account restrictions (none found)

**All code-level fixes exhausted. Issue persists, indicating account-level configuration problem.**

---

## ❓ **QUESTIONS FOR STRIPE SUPPORT**

1. Why is Stripe's hosted checkout page unable to access the publishable key for this account?
2. Is there an account-level setting preventing publishable key embedding in checkout sessions?
3. Did DNS migration trigger any account-level restrictions that need to be reset?
4. Are there any hidden account restrictions not visible in Dashboard?
5. Is this related to account verification status that appears complete but may have pending items?

---

## 🎯 **REQUESTED ACTION**

Please investigate why Stripe's hosted checkout (`checkout.stripe.com`) cannot access the publishable key for account `acct_1R4wsKDE8rt1dEs1` when initializing checkout pages.

**Expected Behavior**: 
- Session created → Stripe automatically embeds publishable key → Checkout initializes ✅

**Actual Behavior**:
- Session created ✅ → Stripe cannot access publishable key ❌ → Checkout fails ❌

---

## 📞 **CONTACT INFORMATION**

- **Account Email**: `service@rensto.com`
- **Account ID**: `acct_1R4wsKDE8rt1dEs1`
- **Business Name**: Rensto
- **Timeline**: Issue started after DNS migration (late October 2025)

---

## 🔗 **RELEVANT LINKS**

- **Stripe Dashboard**: https://dashboard.stripe.com/
- **API Keys**: https://dashboard.stripe.com/apikeys
- **Account Settings**: https://dashboard.stripe.com/settings/account
- **Support**: https://dashboard.stripe.com/support

---

**Status**: ⚠️ **BLOCKER - Production checkout completely non-functional**

