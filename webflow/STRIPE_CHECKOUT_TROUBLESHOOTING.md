# 🔧 Stripe Checkout Troubleshooting

**Issue**: "The page you were looking for could not be found" error on Stripe checkout

**Date**: November 2, 2025

---

## 🐛 **PROBLEM IDENTIFIED**

The checkout session might be:
1. **Expired** - Stripe checkout sessions expire after 24 hours
2. **Already completed** - Session was already used
3. **Invalid success URL** - Redirect URL doesn't exist

---

## ✅ **SOLUTION 1: CREATE FRESH CHECKOUT SESSION**

**Fresh checkout session just created**:

```bash
cd apps/web/rensto-site
node scripts/test-stripe-integration.js
```

**Or create manually**:
```bash
curl -X POST https://rensto-main-website.vercel.app/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "flowType": "marketplace-template",
    "productId": "email-persona-system",
    "tier": "simple",
    "customerEmail": "test-'$(date +%s)'@rensto.com"
  }'
```

---

## ✅ **SOLUTION 2: VERIFY STRIPE ACCOUNT MODE**

**Possible Issue**: Test vs Live mode mismatch

**Check**:
1. Go to: https://dashboard.stripe.com/test/settings
2. Verify: You're in **Test Mode** (toggle in top right)
3. Check: API keys are test keys (`sk_test_...` not `sk_live_...`)

**If using Live Mode**:
- Use live API keys
- Use real card numbers (not test cards)
- Or switch back to Test Mode

---

## ✅ **SOLUTION 3: FIX SUCCESS URL**

**Current Success URL**: `https://rensto.com/success?type=marketplace&product={productId}`

**Issue**: This page might not exist on rensto.com

**Options**:

### **Option A: Use Simple Redirect (Recommended for Testing)**

Update `apps/web/rensto-site/src/app/api/stripe/checkout/route.ts`:

```typescript
successUrl = `https://rensto.com/?payment=success&type=marketplace&product=${productId}`;
```

### **Option B: Create Success Page**

Create a success page at `/success` on rensto.com (Webflow)

### **Option C: Use API Redirect Handler**

Create redirect handler at `api.rensto.com/payment/success` that shows success message

---

## 🧪 **TESTING CHECKLIST**

- [ ] Create fresh checkout session
- [ ] Verify Stripe account is in Test Mode
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete payment within 5 minutes of session creation
- [ ] Check webhook delivery after payment
- [ ] Verify n8n workflow execution
- [ ] Check Airtable records

---

## 📋 **CURRENT WORKING CHECKOUT URL**

**Session ID**: `cs_live_a1zmGawZTPe4awtF64qq8YFyQhhz7BYO0lmVQaBbL24AVvfkLYTdNlQLX7`

**URL**: 
```
https://checkout.stripe.com/c/pay/cs_live_a1zmGawZTPe4awtF64qq8YFyQhhz7BYO0lmVQaBbL24AVvfkLYTdNlQLX7
```

**Test Card**: `4242 4242 4242 4242` (Exp: 12/34, CVC: 123)

---

## 🔍 **DEBUGGING STEPS**

1. **Check Session Status**:
   ```bash
   # Use Stripe CLI or Dashboard
   stripe checkout sessions retrieve cs_live_a1zmGawZTPe4awtF64qq8YFyQhhz7BYO0lmVQaBbL24AVvfkLYTdNlQLX7
   ```

2. **Check Vercel Logs**:
   ```bash
   cd apps/web/rensto-site
   vercel logs --follow
   ```

3. **Verify Environment Variables**:
   - `STRIPE_SECRET_KEY` - Should be set in Vercel
   - `STRIPE_WEBHOOK_SECRET` - Should be set in Vercel
   - Verify keys are test keys if in test mode

---

**Status**: ⏸️ **AWAITING USER TO TRY FRESH CHECKOUT URL**

