# 🔧 Stripe Webhook Endpoint Update Required

**Date**: November 2, 2025  
**Status**: ⚠️ **NEEDS UPDATE**

---

## 📋 **CURRENT WEBHOOK CONFIGURATION**

**Existing Webhook**:
- **URL**: `https://api.rensto.com/stripe/webhook`
- **Signing Secret**: `whsec_RGYzuYIi97YDf4KIA1InPXDakJU8CMUL`
- **Listening to**: Only `payment_intent.succeeded` ❌
- **API Version**: `2025-02-24.acacia`

---

## ❌ **PROBLEMS IDENTIFIED**

### **1. Missing Critical Event**
**Current**: Only listening to `payment_intent.succeeded`  
**Needed**: `checkout.session.completed` ✅

**Why**: Our marketplace checkout flow uses `checkout.session.completed` to trigger n8n workflows, not `payment_intent.succeeded`.

### **2. URL Path Mismatch**
**Current**: `https://api.rensto.com/stripe/webhook`  
**Code expects**: `https://api.rensto.com/api/stripe/webhook`

**Check**: Need to verify which path is correct based on our Next.js API routes.

---

## ✅ **REQUIRED UPDATES**

### **Option A: Update Existing Webhook** (Recommended)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on webhook: `we_1SF5qCDE8rt1dEs1SbZCqETE`
3. Click: **"Update"** or **"Edit"**
4. **Add Event**: `checkout.session.completed` ✅
5. **Keep**: `payment_intent.succeeded` (optional, but doesn't hurt)
6. **Save**

### **Option B: Create New Webhook** (If update fails)

1. Click: **"Add endpoint"**
2. **Endpoint URL**: `https://api.rensto.com/api/stripe/webhook`
3. **Description**: "Rensto Marketplace Checkout Handler"
4. **Select events**:
   - ✅ `checkout.session.completed` (REQUIRED)
   - ✅ `payment_intent.succeeded` (optional)
5. **Create endpoint**
6. **Copy new signing secret**: `whsec_...`

---

## 🔍 **VERIFY CORRECT URL PATH**

Our code is at: `apps/web/rensto-site/src/app/api/stripe/webhook/route.ts`

**This creates route**: `/api/stripe/webhook`

**So webhook URL should be**:
- ✅ `https://api.rensto.com/api/stripe/webhook` (if api.rensto.com points to Vercel)
- OR `https://rensto-main-website.vercel.app/api/stripe/webhook` (Vercel preview)

**Current webhook URL**: `https://api.rensto.com/stripe/webhook` (missing `/api/`)

---

## ✅ **ACTION ITEMS**

1. **Verify API route**: Check if `https://api.rensto.com/stripe/webhook` works OR if we need `/api/stripe/webhook`
2. **Update webhook events**: Add `checkout.session.completed`
3. **Update signing secret** in Vercel if creating new webhook:
   - Environment Variable: `STRIPE_WEBHOOK_SECRET`
   - Value: New `whsec_...` (or keep existing if updating)

---

## 🧪 **TEST AFTER UPDATE**

1. Complete a test checkout
2. Check Stripe Dashboard → Webhooks → Recent events
3. Verify `checkout.session.completed` event appears
4. Check Vercel logs for webhook received
5. Verify n8n workflow executes

---

**Status**: ⏸️ **AWAITING WEBHOOK UPDATE**

