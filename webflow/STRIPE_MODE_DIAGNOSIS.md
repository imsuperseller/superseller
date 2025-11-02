# 🔍 Stripe Mode Diagnosis

**Issue**: Checkout sessions showing "page not found" error  
**Date**: November 2, 2025  
**Status**: 🔍 **INVESTIGATING**

---

## 🐛 **OBSERVED BEHAVIOR**

**Session IDs created**: All start with `cs_live_...`
- `cs_live_a1zmGawZTPe4awtF64qq8YFyQhhz7BYO0lmVQaBbL24AVvfkLYTdNlQLX7`
- `cs_live_a1Y84IJi2FtUuP5or4ftIo7wFj8mI0asVZeg14KVPhAO95pUUgA3YPU3Xz`

**Problem**: `cs_live_` prefix indicates **LIVE MODE**, but:
- Test cards (`4242 4242 4242 4242`) only work in **TEST MODE**
- Live mode requires real credit cards
- This mismatch causes checkout to fail

---

## 🔍 **ROOT CAUSE ANALYSIS**

### **Possible Causes**:

1. **API Key Mismatch**:
   - Using `sk_live_...` key (live mode)
   - Should use `sk_test_...` key (test mode)

2. **Environment Variable Issue**:
   - `STRIPE_SECRET_KEY` in Vercel might be live key
   - Need to verify which key is configured

3. **Stripe Account Configuration**:
   - Account might default to live mode
   - Need to explicitly set test mode

---

## ✅ **SOLUTION STEPS**

### **Step 1: Verify Stripe Keys in Vercel**

1. Go to: https://vercel.com/dashboard
2. Navigate to: Project → Settings → Environment Variables
3. Check: `STRIPE_SECRET_KEY` value
4. Verify: Should start with `sk_test_` (not `sk_live_`)

### **Step 2: Get Test Keys from Stripe**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **TEST MODE** (toggle in top right)
3. Copy: **Secret key** (starts with `sk_test_`)
4. Update: Vercel environment variable

### **Step 3: Redeploy After Key Update**

```bash
cd apps/web/rensto-site
vercel --prod
```

---

## 🧪 **VERIFICATION**

After updating to test keys, create new checkout session:

```bash
curl -X POST https://rensto-main-website.vercel.app/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "flowType": "marketplace-template",
    "productId": "email-persona-system",
    "tier": "simple"
  }'
```

**Expected**: Session ID should start with `cs_test_...` (not `cs_live_...`)

---

## 📋 **CHECKLIST**

- [ ] Verify Stripe Dashboard is in **TEST MODE**
- [ ] Check `STRIPE_SECRET_KEY` starts with `sk_test_`
- [ ] Update Vercel environment variable if needed
- [ ] Redeploy to Vercel
- [ ] Create fresh checkout session
- [ ] Verify session ID starts with `cs_test_`
- [ ] Test with card `4242 4242 4242 4242`

---

**Next Action**: Verify and update Stripe API keys in Vercel

