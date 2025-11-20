# 🔄 Stripe From Scratch Setup Guide

**Date**: November 3, 2025  
**Status**: 📋 **SETUP IN PROGRESS**

---

## 📋 **SETUP CHECKLIST**

### **Step 1: Stripe API Keys** ✅ **YOU PROVIDED**

**STRIPE_SECRET_KEY=sk_live_...[REDACTED]`
**Publishable Key**: `pk_live_51R4wsKDE8rt1dEs1nOQSpNPYjYybJYSInhcQR1UGkZ1Ru90UWvV5oKbt53JG0yk9Qo1fWWGxxghE2wyzuVpyoe8t00DXz5m37o`

---

### **Step 2: Add Stripe Keys to Vercel**

**Project**: `rensto-site`  
**Link**: https://vercel.com/shais-projects-f9b9e359/rensto-site/settings/environment-variables

**Add these environment variables** (via Vercel Dashboard):

1. **`STRIPE_SECRET_KEY`**
   - Click: **"Add New"** → **"Environment Variable"**
   - **Key**: `STRIPE_SECRET_KEY`
   - **Value**: `sk_live_...[REDACTED]`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click: **"Save"**

2. **`STRIPE_WEBHOOK_SECRET`** (will add after webhook is created in Step 3)
   - **Key**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: (leave empty for now, we'll get this from Stripe Dashboard)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - **Note**: Add this variable structure now, but wait to paste the actual secret until after creating the webhook

**Important**: Do NOT add `STRIPE_PUBLISHABLE_KEY` to server-side - we don't use it for hosted checkout (only needed for client-side Stripe.js, which we don't use).

---

### **Step 3: Create Stripe Webhook**

**In Stripe Dashboard**:
1. Go to: https://dashboard.stripe.com/webhooks
2. Click: **"Add endpoint"**
3. **Endpoint URL**: `https://rensto.com/api/stripe/webhook`
   - **OR**: `https://api.rensto.com/api/stripe/webhook` (if api.rensto.com is your API subdomain)
4. **Description**: "Rensto Checkout Handler"
5. **Events to listen to**:
   - ✅ `checkout.session.completed` (REQUIRED)
   - ✅ `payment_intent.succeeded` (optional but recommended)
6. Click: **"Add endpoint"**
7. **Copy the signing secret**: `whsec_...` (starts with `whsec_`)
8. **Add to Vercel** as `STRIPE_WEBHOOK_SECRET`

---

### **Step 4: Verify Webhook Route Exists**

**Route Location**: `apps/web/rensto-site/src/app/api/stripe/webhook/route.ts`
**Expected URL**: `https://rensto.com/api/stripe/webhook`

✅ This route exists and handles:
- Webhook signature verification
- `checkout.session.completed` events
- Triggers n8n workflows based on `flowType` metadata

---

### **Step 5: Deploy and Test**

After adding environment variables:

1. **Force Redeploy** in Vercel:
   - Go to: https://vercel.com/shais-projects-f9b9e359/rensto-site/deployments
   - Click latest deployment → **"Redeploy"**

2. **Test Checkout**:
   ```bash
   curl -X POST https://rensto.com/api/stripe/checkout \
     -H "Content-Type: application/json" \
     -d '{
       "flowType": "marketplace-template",
       "productId": "test-from-scratch",
       "tier": "simple"
     }'
   ```

3. **Verify Webhook**:
   - Go to: https://dashboard.stripe.com/webhooks
   - Click your webhook endpoint
   - Check: Recent events should show `checkout.session.completed` events
   - Status: Should be ✅ (no errors)

---

## 🔍 **VERIFICATION CHECKLIST**

After setup, verify:

- ✅ `STRIPE_SECRET_KEY` in Vercel (all environments)
- ✅ `STRIPE_WEBHOOK_SECRET` in Vercel (all environments)
- ✅ Webhook endpoint in Stripe Dashboard: `https://rensto.com/api/stripe/webhook`
- ✅ Webhook listening to `checkout.session.completed`
- ✅ Webhook status: Active (no errors)
- ✅ Test checkout session creates successfully
- ✅ Test checkout page loads (no `apiKey is not set` error)

---

## 🚨 **IF CHECKOUT STILL FAILS**

If `apiKey is not set` error persists after clean setup:

1. **Verify Account Status**:
   - Go to: https://dashboard.stripe.com/settings/account
   - Check: No warnings, charges/payouts enabled

2. **Regenerate Publishable Key** (in Stripe Dashboard):
   - Go to: https://dashboard.stripe.com/apikeys
   - Rotate publishable key
   - This may reset internal state

3. **Contact Stripe Support**:
   - Account: `acct_1R4wsKDE8rt1dEs1`
   - Issue: Hosted checkout `apiKey is not set` after fresh setup

---

**Status**: ⏸️ **WAITING FOR VERCEL ENV VARS AND WEBHOOK SETUP**

