# 🚨 CRITICAL: Checkout "Page Not Found" - Root Cause

**Date**: November 2, 2025  
**Status**: ⚠️ **PUBLISHABLE KEY MISMATCH**

---

## ❌ **ROOT CAUSE IDENTIFIED**

**The Issue**: Key mode mismatch between frontend and backend

**Current State**:
- ✅ `STRIPE_SECRET_KEY`: `sk_test_...` (TEST mode) 
- ❌ `STRIPE_PUBLISHABLE_KEY`: `pk_live_...` (LIVE mode)

**Why This Breaks Checkout**:
- Backend creates test checkout session (`cs_test_...`) ✅
- But frontend/Stripe checkout page uses LIVE publishable key ❌
- Stripe detects mismatch and rejects = "Page not found" error

---

## ✅ **IMMEDIATE FIX**

### **Get Test Publishable Key**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. **Verify**: TEST MODE toggle is ON (top-right)
3. Find **"Publishable key"** (starts with `pk_test_...`)
4. Copy it

### **Update Vercel**

**Provide the `pk_test_...` key and I'll update it via CLI**, or:

**Manual**:
1. Vercel Dashboard → Settings → Environment Variables
2. Find: `STRIPE_PUBLISHABLE_KEY`
3. Update to: `pk_test_...` (your test key)
4. Apply to: Production, Preview, Development
5. Save & Redeploy

---

## 📋 **ALSO CHECK: Webhook URL**

**Current**: `https://api.rensto.com/stripe/webhook`  
**Route exists at**: `/api/stripe/webhook`

**According to docs**: Webhook should be at `api.rensto.com/stripe/webhook` (without `/api/`)

**If webhook URL is wrong**, Stripe webhooks won't deliver. But this is secondary - **publishable key is the blocker**.

---

## ✅ **AFTER PUBLISHABLE KEY FIX**

Both keys will be in TEST mode:
- ✅ `STRIPE_SECRET_KEY`: `sk_test_...`
- ✅ `STRIPE_PUBLISHABLE_KEY`: `pk_test_...`

Then checkout will work! ✅

---

**Priority**: **CRITICAL** - Marketplace checkout completely blocked until publishable key updated

