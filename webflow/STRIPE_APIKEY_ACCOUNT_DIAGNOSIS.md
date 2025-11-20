# 🔴 CRITICAL: Stripe "apiKey is not set" - Account-Level Diagnosis

**Date**: November 3, 2025  
**Error**: `CheckoutInitError: apiKey is not set` (persistent)  
**Status**: ⚠️ **STRIPE ACCOUNT CONFIGURATION ISSUE**

---

## ✅ **WHAT WE'VE VERIFIED**

**Code Level** ✅ **ALL CORRECT**:
- ✅ Sessions created successfully (`cs_live_...`)
- ✅ Customer attached to sessions
- ✅ Price objects used (not price_data)
- ✅ Shipping & billing address collection enabled
- ✅ All URLs valid (homepage & /cancel exist)
- ✅ Configuration matches 100% working marketplace app

**Account Level** ⚠️ **ISSUE HERE**:
- ✅ Account enabled (charges, payouts, details submitted)
- ✅ Account type: standard
- ✅ Country: US
- ❌ **Checkout page can't find publishable key**

---

## 🎯 **ROOT CAUSE**

**Stripe Hosted Checkout** (`checkout.stripe.com`) should automatically:
1. Extract publishable key from the account that created the session
2. Embed it in the checkout page context
3. Initialize checkout with that key

**What's Happening**:
- Step 1-2: ✅ Working (session created, redirects)
- Step 3: ❌ **Fails** - Can't find publishable key

**This means**: Stripe's checkout system can't access your account's publishable key context

---

## ✅ **SOLUTION STEPS**

### **Step 1: Verify Publishable Key in Stripe Dashboard**

1. Go to: https://dashboard.stripe.com/apikeys
2. **CRITICAL**: Make sure you're in **LIVE MODE** (not test mode)
3. Verify publishable key exists: `pk_live_51R4wsKDE8rt1dEs1...`
4. If key is missing or revoked:
   - Click "Reveal publishable key"
   - Copy the full key
   - Update Vercel `STRIPE_PUBLISHABLE_KEY` environment variable

### **Step 2: Check Account Restrictions**

1. Go to: https://dashboard.stripe.com/settings/account
2. Look for:
   - ⚠️ Yellow warning banners
   - ⚠️ "Complete your account setup" messages
   - ⚠️ Account restrictions or limitations
   - ⚠️ Verification pending items

### **Step 3: Check Domain Verification (After DNS Migration)**

1. Go to: https://dashboard.stripe.com/settings/branding
2. Check "Checkout branding" section
3. Verify domain: `rensto.com` (if custom domain is set)
4. If domain changed after migration, may need re-verification

### **Step 4: Regenerate Publishable Key (If Needed)**

**Only if Step 1 shows issues**:
1. Go to: https://dashboard.stripe.com/apikeys
2. Click "Reveal publishable key"
3. Copy new key (if regenerated)
4. Update Vercel environment variable

### **Step 5: Contact Stripe Support (If Still Fails)**

**If Steps 1-4 don't resolve**:
- Account ID: `acct_1R4wsKDE8rt1dEs1`
- Error: `CheckoutInitError: apiKey is not set`
- Sessions created successfully but checkout fails
- All code/config verified correct

---

## 📋 **VERCEL ENVIRONMENT VARIABLE CHECK**

**Current State**:
- `STRIPE_PUBLISHABLE_KEY`: ✅ Exists in Vercel (encrypted)
- Last updated: 6 hours ago

**Verify Match**:
1. Get publishable key from Stripe Dashboard
2. Compare with Vercel environment variable
3. Must match exactly (including any trailing characters)

---

## ✅ **NEXT ACTIONS**

1. ✅ Check Stripe Dashboard > API keys (verify publishable key exists)
2. ✅ Check Stripe Dashboard > Settings > Account (look for restrictions)
3. ✅ Verify Vercel `STRIPE_PUBLISHABLE_KEY` matches Stripe Dashboard
4. ⚠️ If still failing: Contact Stripe Support with account details above

---

**Status**: ⚠️ **AWAITING USER VERIFICATION OF STRIPE DASHBOARD SETTINGS**

