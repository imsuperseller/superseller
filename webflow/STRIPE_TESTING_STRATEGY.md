# 🧪 Stripe Testing Strategy - Local vs Production

**Date**: November 3, 2025  
**Status**: ⚠️ **REQUIRES LIVE MODE TESTING**

---

## ❌ **WHY LOCAL TESTING IS INSUFFICIENT**

### **The Issue We're Fixing**:
- ❌ **LIVE keys fail**: `CheckoutInitError: apiKey is not set` with LIVE Stripe keys
- ✅ **TEST keys work**: Success summary showed checkout worked with TEST keys
- **Root Cause**: The problem only appears with **LIVE mode**, not TEST mode

### **Local vs Production Differences**:

| Environment | Stripe Keys | Can Catch LIVE Issue? |
|------------|-------------|----------------------|
| **Local** | Usually TEST keys (`.env.local`) | ❌ **NO** - Won't reproduce LIVE issue |
| **Vercel Preview** | Can use LIVE keys | ✅ **YES** - If configured with LIVE keys |
| **Vercel Production** | Uses LIVE keys | ✅ **YES** - Real production environment |

---

## ✅ **REQUIRED TESTING APPROACH**

### **Step 1: Deploy to Vercel First** ⚠️ **CRITICAL**

**Why**: Local testing uses different environment variables and won't reproduce the LIVE mode issue.

**Actions**:
1. ✅ Code changes already made (frontend calls `api.rensto.com`)
2. ⏳ **Deploy to Vercel Production** (or Preview with LIVE keys)
3. ⏳ **Verify Vercel has LIVE Stripe keys**:
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...` (LIVE webhook)

### **Step 2: Test with LIVE Mode** ✅ **ESSENTIAL**

**Test URL**: After deployment, test actual checkout:
```
https://rensto.com/marketplace
https://rensto.com/subscriptions
https://rensto.com/solutions
```

**Expected Flow**:
1. Click checkout button
2. Frontend calls: `https://api.rensto.com/api/stripe/checkout` ✅
3. API creates session with LIVE key (`sk_live_...`)
4. Returns checkout URL: `https://checkout.stripe.com/c/pay/cs_live_...`
5. **Checkout page should load** without "apiKey is not set" error ✅

### **Step 3: Verify Session Details**

**Check**:
- Session created via `api.rensto.com` ✅
- Session uses LIVE mode (`cs_live_...`) ✅
- Checkout URL loads correctly ✅
- Payment form displays ✅

---

## 🚨 **CRITICAL: LIVE MODE ONLY**

**Why TEST mode won't catch the issue**:
- ✅ TEST keys worked in success summary
- ❌ LIVE keys show "apiKey is not set" error
- **The bug is LIVE-mode specific**

**Solution**:
- ❌ Don't test locally (likely uses TEST keys)
- ✅ Deploy to Vercel Production (uses LIVE keys)
- ✅ Test actual checkout flow on production site

---

## 📋 **TESTING CHECKLIST**

### **Before Testing**:
- [ ] ✅ Frontend code updated (calls `api.rensto.com`)
- [ ] ⏳ Deployed to Vercel Production
- [ ] ⏳ Verify Vercel Production has LIVE Stripe keys
- [ ] ⏳ Verify Vercel Production has LIVE webhook secret

### **During Testing**:
- [ ] Test Marketplace checkout (`/marketplace`)
- [ ] Test Subscriptions checkout (`/subscriptions`)
- [ ] Test Solutions checkout (`/solutions`)
- [ ] Check browser console for errors
- [ ] Verify checkout page loads (no "apiKey is not set")
- [ ] Verify payment form displays

### **Success Criteria**:
- ✅ Checkout session created successfully
- ✅ Redirect to `checkout.stripe.com` works
- ✅ Checkout page loads completely
- ✅ Payment form is visible and functional
- ✅ No "apiKey is not set" error in console

---

## 🔍 **IF TESTING LOCALLY (NOT RECOMMENDED)**

**If you must test locally**:

1. **Use LIVE keys in `.env.local`**:
   ```
   STRIPE_SECRET_KEY=sk_live_51R4wsKDE8rt1dEs1...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

2. **Run production build locally**:
   ```bash
   npm run build
   npm start
   ```

3. **Test checkout**:
   - Navigate to `http://localhost:3000/marketplace`
   - Click checkout button
   - Should call `api.rensto.com` (not localhost)

**Limitations**:
- ❌ Won't test actual Vercel deployment
- ❌ Won't test actual DNS/domain routing
- ❌ May have CORS or network differences
- ⚠️ **Still need Vercel production test**

---

## ✅ **RECOMMENDED APPROACH**

1. **Deploy to Vercel Production** (or Preview with LIVE keys)
2. **Test on actual production site** (`rensto.com`)
3. **Verify checkout works** with LIVE Stripe keys
4. **If it works**: ✅ **READY**
5. **If it fails**: Investigate further (account-level issue)

---

**Status**: ✅ **LIVE MODE WORKING** - Checkout API operational with LIVE Stripe keys

## ✅ **SUCCESS** (Nov 3, 2025)

**API Test Result**:
```json
{
  "success": true,
  "sessionId": "cs_live_b1UcEknrROpjBvfP2azBLnT3WUFxC5W972BcoNLCYPQN1rVE3XRr84lee5",
  "url": "https://checkout.stripe.com/c/pay/cs_live_...",
  "metadata": {"flowType":"marketplace-template","productId":"test","tier":"simple","price":29}
}
```

**✅ Verified**:
- ✅ `api.rensto.com/api/stripe/checkout` working
- ✅ LIVE Stripe keys configured (`cs_live_` session IDs)
- ✅ Checkout session creation successful
- ✅ Ready for production checkout testing

**Projects Configured**:
1. ✅ `rensto-site` (prj_AKC4gUSm2EWNj3RR8Cou4cILHYxp) - Frontend deployed
2. ✅ `api-rensto-site` (prj_6clXiiccb3SFA2Ve0442x4pDJSb7) - API deployed with LIVE keys

**Environment Variables**:
- ✅ `STRIPE_SECRET_KEY` = LIVE key (Production, Preview, Development)
- ✅ `STRIPE_WEBHOOK_SECRET` = `whsec_qPeQw6uGc9hiLeqfUNI2PWNyKwRoRkIy` (Production, Preview, Development)

**Next Step**: ✅ **READY FOR LIVE CHECKOUT TESTING**

