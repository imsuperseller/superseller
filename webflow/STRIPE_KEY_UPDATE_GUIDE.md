# 🔑 Stripe API Key Update Guide

**Date**: November 2, 2025  
**Status**: ⚠️ **ACTION REQUIRED**

---

## 📋 **CURRENT SITUATION**

**You provided**: LIVE Stripe keys
- API Key: `sk_live_...` ✅ (starts with `sk_live_`)
- Webhook Secret: `whsec_...` ✅

**Problem**: 
- Live keys = Real payments only
- Test cards (`4242 4242 4242 4242`) **WON'T WORK** with live keys
- For testing, we need **TEST keys** (`sk_test_...`)

---

## ✅ **OPTION 1: USE TEST MODE (Recommended for Testing)**

### **Get Test Keys**:

1. Go to: https://dashboard.stripe.com/test/apikeys
2. **Verify**: Toggle in top-right shows "Test mode" (not "Live mode")
3. Copy **Secret key** (starts with `sk_test_...`)
4. Copy **Webhook signing secret** (starts with `whsec_...`)

### **Update Vercel**:

1. Go to: https://vercel.com/dashboard
2. Project: `rensto-main-website` → Settings → Environment Variables
3. Update `STRIPE_SECRET_KEY` = `sk_test_...` (your test key)
4. Update `STRIPE_WEBHOOK_SECRET` = `whsec_...` (your test webhook secret)
5. Apply to: Production, Preview, Development
6. Redeploy: `vercel --prod`

**Then**: Test cards will work! ✅

---

## ⚠️ **OPTION 2: USE LIVE MODE (Production)**

**If you want to use LIVE keys you provided**:

✅ **Can do**:
- Real payments with real credit cards
- Production-ready checkout

❌ **Cannot do**:
- Use test cards (`4242 4242 4242 4242`)
- Test without real money transactions

**To use live keys**:
1. Update Vercel environment variables with your live keys
2. Test with a **real credit card** (small amount, e.g., $0.50 if possible)
3. Or use Stripe's test mode switching

---

## 🎯 **RECOMMENDATION**

**For testing phase**: Use **TEST keys**
- Safe to test
- No real charges
- Test cards work
- Can test end-to-end flow

**For production**: Use **LIVE keys** (you provided)
- Real transactions
- Real customers
- Real payments

---

## 📋 **QUICK DECISION TREE**

**Question**: "Do you want to test with test cards?"

- **Yes** → Get TEST keys from Stripe → Update Vercel → Test with `4242 4242 4242 4242`
- **No** → Use LIVE keys → Test with real card → Real payment happens

---

**Next Action**: Choose test mode (recommended) or proceed with live mode

