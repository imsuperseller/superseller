# 🔑 Stripe Test Key Setup - Restricted API Key Guide

**Date**: November 2, 2025  
**Purpose**: Create restricted test key with minimal permissions for marketplace checkout

---

## 🎯 **STEP 1: NAVIGATE TO TEST MODE**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. **IMPORTANT**: Make sure toggle in top-right shows **"Test mode"** (not "Live mode")
3. Click: **"Create restricted key"** (or use existing test secret key)

---

## 📋 **STEP 2: CONFIGURE RESTRICTED KEY**

### **Key Name**: 
```
Rensto Marketplace Test (Restricted)
```

### **Required Permissions** (Minimal Set):

#### **Core** ✅
- ✅ **Checkout Sessions** - `Write` (to create checkout sessions)
- ✅ **Payment Intents** - `Read` (to view payment status)
- ✅ **Customers** - `Read` and `Write` (to create/update customers)
- ✅ **Charges** - `Read` (to view payment charges)

#### **All webhook** ✅
- ✅ **Webhook Endpoints** - `Read` and `Write` (to receive webhook events)

#### **Events** ✅
- ✅ **Events** - `Read` (to receive webhook events)

---

## 🔧 **STEP 3: PERMISSION BREAKDOWN**

### **Why Each Permission**:

| Permission | Why Needed |
|------------|-----------|
| **Checkout Sessions (Write)** | Create Stripe checkout sessions when user clicks "Buy" |
| **Payment Intents (Read)** | Verify payment status after checkout |
| **Customers (Read/Write)** | Create/update customer records in Stripe |
| **Charges (Read)** | View payment charges and amounts |
| **Webhook Endpoints (Read/Write)** | Receive webhook events from Stripe |
| **Events (Read)** | Process webhook events (checkout.session.completed, etc.) |

---

## ✅ **STEP 4: COPY KEYS**

After creating the restricted key:

1. **Copy Secret Key**: 
   - Starts with `sk_test_...`
   - Click "Reveal test key" if needed
   - Save this securely

2. **Get Webhook Secret**:
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Find your webhook endpoint (or create one)
   - Click on webhook → "Reveal" next to "Signing secret"
   - Copy the value (starts with `whsec_...`)

---

## 🔒 **SECURITY NOTES**

**Restricted Keys are Safer**:
- ✅ Only grant permissions needed
- ✅ Can revoke specific permissions if compromised
- ✅ Better for testing/development

**Full Secret Keys**:
- ⚠️ All permissions
- ⚠️ Use only if restricted keys don't work
- ⚠️ More risky if leaked

---

## 📝 **QUICK CHECKLIST**

- [ ] In **TEST mode** (not Live mode)
- [ ] Created restricted key with name
- [ ] Granted: Checkout Sessions (Write)
- [ ] Granted: Payment Intents (Read)
- [ ] Granted: Customers (Read/Write)
- [ ] Granted: Charges (Read)
- [ ] Granted: Webhook Endpoints (Read/Write)
- [ ] Granted: Events (Read)
- [ ] Copied Secret Key (`sk_test_...`)
- [ ] Got Webhook Secret (`whsec_...`)

---

## 🚀 **STEP 5: UPDATE VERCEL**

Once you have the keys:

1. Go to: https://vercel.com/dashboard
2. Project: `rensto-main-website` → Settings → Environment Variables
3. Update `STRIPE_SECRET_KEY` = `sk_test_...` (your restricted test key)
4. Update `STRIPE_WEBHOOK_SECRET` = `whsec_...` (your test webhook secret)
5. Apply to: Production, Preview, Development
6. Redeploy or wait for auto-deploy

---

## ✅ **VERIFICATION**

After updating Vercel, create a test checkout:

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

Then test with card: `4242 4242 4242 4242` ✅

---

**Status**: ⏸️ **AWAITING KEY CREATION**

