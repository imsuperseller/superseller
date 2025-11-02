# 🔧 Fix: Stripe Publishable Key Mismatch

**Issue**: "Page not found" error even with test checkout sessions  
**Root Cause**: Publishable key is LIVE but secret key is TEST (mismatch!)

---

## ❌ **PROBLEM IDENTIFIED**

**Current Configuration**:
- ✅ `STRIPE_SECRET_KEY`: `sk_test_...` (TEST mode)
- ❌ `STRIPE_PUBLISHABLE_KEY`: `pk_live_...` (LIVE mode)

**Result**: 
- Backend creates test checkout sessions (`cs_test_...`) ✅
- But frontend/checkout uses live publishable key ❌
- Stripe rejects the mismatch = "Page not found" error

---

## ✅ **SOLUTION: Get Test Publishable Key**

### **Step 1: Get Test Publishable Key from Stripe**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. **Verify**: You're in **TEST MODE** (toggle in top-right)
3. Find **"Publishable key"** (starts with `pk_test_...`)
4. Copy it

### **Step 2: Update Vercel**

You have two options:

#### **Option A: Update via Vercel Dashboard**
1. Go to: https://vercel.com/shais-projects-f9b9e359/rensto-main-website/settings/environment-variables
2. Find: `STRIPE_PUBLISHABLE_KEY`
3. **Update value** to: Your `pk_test_...` key
4. Apply to: Production, Preview, Development
5. Save

#### **Option B: I'll Update via CLI** (if you provide the key)

Provide the `pk_test_...` key and I'll update it via Vercel CLI.

---

## ✅ **AFTER UPDATE**

Both keys will match:
- ✅ `STRIPE_SECRET_KEY`: `sk_test_...`
- ✅ `STRIPE_PUBLISHABLE_KEY`: `pk_test_...`

Then checkout will work! ✅

---

**Next**: Get `pk_test_...` from Stripe Dashboard and update Vercel

