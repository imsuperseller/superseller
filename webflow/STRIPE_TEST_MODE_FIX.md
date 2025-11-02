# 🔧 Fix: Stripe Checkout "Page Not Found" Error

**Issue**: Checkout session shows `cs_live_...` but test cards don't work  
**Root Cause**: Vercel is using LIVE Stripe keys, but we need TEST keys for testing

---

## ❌ **PROBLEM**

**Current State**:
- Vercel environment: Using LIVE keys (`sk_live_...`)
- Checkout sessions: Created in LIVE mode (`cs_live_...`)
- Test cards: Only work in TEST mode
- Result: "Page not found" error when using test cards

---

## ✅ **SOLUTION: Update Vercel to Test Mode**

### **Step 1: Get Test API Key**

You already have a restricted test key: `rk_test_51R4wsKDE8rt1dEs1hETkWcs26O4JowJ0z1SYq4R9ggElhJYMh2iHfydaFm5CZlaOgHFrcdlaMNzLG2woV564tksc00emf2yFPo`

**However**: Restricted keys may not work for checkout session creation. You might need a full test secret key.

**Get Full Test Secret Key**:
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **TEST MODE** (toggle in top-right)
3. Find **"Secret key"** (starts with `sk_test_...`)
4. Click **"Reveal test key"**
5. Copy the full key

### **Step 2: Update Vercel Environment Variables**

1. Go to: https://vercel.com/dashboard
2. Project: `rensto-main-website` → Settings → Environment Variables
3. Find: `STRIPE_SECRET_KEY`
4. **Update value** to: Your `sk_test_...` key (NOT the restricted `rk_test_...` key)
5. **Apply to**: Production, Preview, Development
6. **Save**

**Keep**: `STRIPE_WEBHOOK_SECRET` = `whsec_RGYzuYIi97YDf4KIA1InPXDakJU8CMUL` (this is already a test webhook secret)

### **Step 3: Redeploy or Wait**

- Vercel will auto-deploy on env var change, OR
- Run: `vercel --prod` to force redeploy

### **Step 4: Verify Test Mode**

After update, create new checkout:
```bash
curl -X POST https://rensto-main-website.vercel.app/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"flowType":"marketplace-template","productId":"email-persona-system","tier":"simple"}'
```

**Expected**: Session ID should start with `cs_test_...` (not `cs_live_...`)

Then test cards will work! ✅

---

## 🎯 **QUICK FIX CHECKLIST**

- [ ] Get full test secret key (`sk_test_...`) from Stripe Dashboard
- [ ] Update Vercel `STRIPE_SECRET_KEY` to test key
- [ ] Verify `STRIPE_WEBHOOK_SECRET` is test webhook secret
- [ ] Redeploy Vercel
- [ ] Create fresh checkout session
- [ ] Verify session ID starts with `cs_test_`
- [ ] Test with card `4242 4242 4242 4242`

---

**Once Vercel uses test keys, checkout will work with test cards!** ✅

