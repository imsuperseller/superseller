# ✅ Stripe Webhook Configuration - Action Items

**Date**: November 2, 2025  
**Status**: ⚠️ **NEEDS UPDATE**

---

## 📋 **WHAT YOU FOUND**

**Existing Webhook**:
- ✅ URL: `https://api.rensto.com/stripe/webhook`
- ✅ Signing Secret: `whsec_RGYzuYIi97YDf4KIA1InPXDakJU8CMUL`
- ❌ **Events**: Only `payment_intent.succeeded` (MISSING critical event!)
- ✅ API Version: `2025-02-24.acacia`

---

## ❌ **PROBLEM 1: MISSING CRITICAL EVENT**

**Current**: Only listening to `payment_intent.succeeded`  
**Needed**: `checkout.session.completed` ✅ **REQUIRED**

**Why**: Our marketplace checkout flow uses `checkout.session.completed` to:
1. Extract metadata (flowType, productId, tier)
2. Trigger n8n workflows
3. Create Airtable records

**`payment_intent.succeeded` alone won't work** because it doesn't have the checkout session metadata we need.

---

## ⚠️ **PROBLEM 2: URL PATH UNCERTAINTY**

**Webhook URL**: `https://api.rensto.com/stripe/webhook`  
**Our Code Route**: `/api/stripe/webhook/route.ts`

**Question**: Does `api.rensto.com/stripe/webhook` work, or do we need `/api/stripe/webhook`?

**Check**: The route file is at `src/app/api/stripe/webhook/route.ts` which creates route `/api/stripe/webhook`

**So it should be**: `https://api.rensto.com/api/stripe/webhook` (with `/api/`)

---

## ✅ **FIX STEPS**

### **Step 1: Update Webhook Events** (CRITICAL)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on webhook: `we_1SF5qCDE8rt1dEs1SbZCqETE`
3. Click: **"Update"** or **"Edit"**
4. **Events to listen to**:
   - ✅ **ADD**: `checkout.session.completed` (REQUIRED!)
   - ✅ **KEEP**: `payment_intent.succeeded` (optional, but fine to keep)
5. **Save** or **Update endpoint**

### **Step 2: Verify/Update URL** (If needed)

**Test current URL**:
```bash
curl https://api.rensto.com/stripe/webhook
```

**If 404**, update webhook URL to:
```
https://api.rensto.com/api/stripe/webhook
```

### **Step 3: Update Vercel Environment Variable**

**If signing secret changed** (unlikely, but check):
- Environment Variable: `STRIPE_WEBHOOK_SECRET`
- Value: `whsec_RGYzuYIi97YDf4KIA1InPXDakJU8CMUL` (or new one if webhook was recreated)
- Apply to: Production, Preview, Development

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] Webhook listening to `checkout.session.completed` ✅
- [ ] Webhook URL is correct (works when tested)
- [ ] Signing secret matches Vercel env var
- [ ] Test checkout creates `checkout.session.completed` event
- [ ] Webhook delivers successfully (check Stripe Dashboard)
- [ ] n8n workflow triggers (check n8n executions)

---

## 🧪 **AFTER UPDATE - TEST**

1. Create test checkout session
2. Complete payment with test card
3. Check Stripe Dashboard → Webhooks → Recent events
4. Should see: `checkout.session.completed` event ✅
5. Check Vercel logs for webhook received
6. Check n8n executions (workflow should trigger)

---

**Priority**: **HIGH** - Marketplace checkout won't work without `checkout.session.completed` event!

