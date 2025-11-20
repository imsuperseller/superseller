# 🔴 CRITICAL: Stripe Checkout - Domain Verification After DNS Migration

**Date**: November 3, 2025  
**Error**: `CheckoutInitError: apiKey is not set` (persistent)  
**Root Cause Hypothesis**: Domain verification issue after DNS migration

---

## 🎯 **THE REAL PROBLEM**

**What Changed**:
- Before: Domain pointed to Webflow
- After: Domain migrated to Vercel (DNS changed)

**Stripe Behavior**:
- Stripe may cache domain-to-account associations
- After DNS migration, Stripe may need domain re-verification
- Checkout page may not associate publishable key if domain not verified

---

## ✅ **VERIFICATION STEPS**

### **Step 1: Check Stripe Domain Settings**

1. Go to: https://dashboard.stripe.com/settings/branding
2. Look for: "Checkout branding" or "Domain verification"
3. Check if `rensto.com` is listed and verified
4. If not listed or unverified: Add/verify domain

### **Step 2: Check Stripe Account Settings**

1. Go to: https://dashboard.stripe.com/settings/account
2. Look for: Domain restrictions or verification warnings
3. Check: Any yellow banners about domain verification

### **Step 3: Test with Stripe Dashboard**

1. Go to: https://dashboard.stripe.com/test/checkout_sessions
2. Create a test session manually
3. If test session works but API doesn't: Domain association issue

---

## 🔧 **IF DOMAIN NOT VERIFIED**

**Option 1: Re-verify Domain in Stripe**
1. Stripe Dashboard > Settings > Branding
2. Add `rensto.com` as verified domain
3. Follow verification steps (DNS TXT record or file upload)

**Option 2: Check for Domain Restrictions**
1. Stripe Dashboard > Settings > Security
2. Check "Allowed domains" or similar restrictions
3. Ensure `rensto.com` is allowed

---

**Status**: ⚠️ **AWAITING USER VERIFICATION OF STRIPE DOMAIN SETTINGS**
