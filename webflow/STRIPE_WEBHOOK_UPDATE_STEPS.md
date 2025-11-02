# 🔧 Stripe Webhook Update - Step by Step Guide

**Based on**: [Stripe Webhook Quickstart](https://docs.stripe.com/webhooks/quickstart)  
**Date**: November 2, 2025

---

## 🎯 **OBJECTIVE**

Update existing webhook `we_1SF5qCDE8rt1dEs1SbZCqETE` to listen to `checkout.session.completed` event.

---

## 📋 **STEP-BY-STEP INSTRUCTIONS**

### **Step 1: Navigate to Webhooks**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. **IMPORTANT**: Make sure you're in **TEST MODE** (toggle in top-right)
3. You should see your webhook: `we_1SF5qCDE8rt1dEs1SbZCqETE`

### **Step 2: Update Existing Webhook**

1. **Click** on the webhook endpoint: `https://api.rensto.com/stripe/webhook`
2. This opens the webhook details page
3. Look for **"Events to send"** section
4. Click **"Edit"** or **"Add events"** button

### **Step 3: Add Required Event**

**Current Events**:
- ✅ `payment_intent.succeeded` (keep this)

**Add This Event**:
- ✅ **Select**: `checkout.session.completed`

**How to Add**:
1. Click **"+ Add events"** or **"Select events"**
2. Search for: `checkout.session.completed`
3. **Check the box** next to it
4. Click **"Add events"** or **"Update"**

### **Step 4: Verify Events List**

**Final Events List Should Show**:
- ✅ `checkout.session.completed` (NEW - REQUIRED)
- ✅ `payment_intent.succeeded` (existing - optional but fine to keep)

### **Step 5: Save Changes**

1. Click **"Update endpoint"** or **"Save"** button
2. Wait for confirmation message

---

## ✅ **VERIFICATION**

### **Verify Webhook Configuration**:

After updating, the webhook should show:
- **URL**: `https://api.rensto.com/stripe/webhook`
- **Events**: 
  - ✅ `checkout.session.completed`
  - ✅ `payment_intent.succeeded`
- **Signing secret**: `whsec_RGYzuYIi97YDf4KIA1InPXDakJU8CMUL` (should remain the same)

### **Test Webhook**:

1. Go to webhook details page
2. Scroll to **"Recent events"** section
3. Click **"Send test webhook"** button
4. Select event: `checkout.session.completed`
5. Click **"Send test webhook"**
6. Verify: Status shows **"Succeeded"** ✅

---

## 🔍 **IF URL NEEDS UPDATING**

**If webhook URL is wrong** (should be `/api/stripe/webhook` not `/stripe/webhook`):

### **Option A: Update URL** (Recommended if current doesn't work)

1. On webhook details page, click **"Update endpoint"**
2. Change **Endpoint URL** from:
   - Current: `https://api.rensto.com/stripe/webhook`
   - To: `https://api.rensto.com/api/stripe/webhook`
3. **Note**: If you change URL, Stripe will generate a NEW signing secret
4. Copy the new signing secret
5. Update Vercel environment variable `STRIPE_WEBHOOK_SECRET`

### **Option B: Create New Webhook** (If update fails)

1. Click **"Add endpoint"**
2. **Endpoint URL**: `https://api.rensto.com/api/stripe/webhook`
3. **Description**: "Rensto Marketplace Checkout Handler"
4. **Events**: Select `checkout.session.completed` (and optionally `payment_intent.succeeded`)
5. Click **"Add endpoint"**
6. Copy new signing secret: `whsec_...`
7. Update Vercel environment variable

---

## 📝 **AFTER UPDATE CHECKLIST**

- [ ] Webhook shows `checkout.session.completed` in events list
- [ ] Test webhook sends successfully
- [ ] Signing secret noted (same or new)
- [ ] Vercel `STRIPE_WEBHOOK_SECRET` matches (if changed)
- [ ] Ready to test actual checkout

---

## 🧪 **NEXT: TEST CHECKOUT**

After webhook is updated:

1. Create checkout session (we already have test script)
2. Complete payment with test card `4242 4242 4242 4242`
3. Check Stripe Dashboard → Webhooks → Recent events
4. Should see `checkout.session.completed` event ✅
5. Check Vercel logs for webhook received
6. Verify n8n workflow executes

---

**Reference**: [Stripe Webhook Quickstart](https://docs.stripe.com/webhooks/quickstart)

**Status**: ⏸️ **AWAITING WEBHOOK UPDATE IN STRIPE DASHBOARD**

