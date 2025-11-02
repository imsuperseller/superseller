# 🔍 Stripe Checkout 500 Error Investigation

**Date**: October 30, 2025
**Status**: 🧪 **INVESTIGATING**

---

## 🔍 **Error Details**

**API Endpoint**: `POST /api/stripe/checkout`
**Request**: `{ flowType: 'subscription', tier: 'starter', subscriptionType: 'lead-gen' }`
**Response**: `500 "Failed to create checkout session"`

---

## 📋 **Checklist**

### **1. Vercel Function Logs** ⏳
- [ ] Check Vercel deployment logs for actual Stripe error message
- [ ] Identify specific Stripe API error code/message

### **2. Stripe Account Verification** ⏳
- [ ] Verify Stripe account has recurring subscriptions enabled
- [ ] Check Stripe account capabilities via API
- [ ] Verify STRIPE_SECRET_KEY is correct and has proper permissions

### **3. API Route Analysis** ✅
- [x] Code structure looks correct (lines 115-138)
- [x] Uses `recurring: { interval: 'month' }` in price_data
- [x] Sets `mode: 'subscription'` for subscription flow
- [ ] Check if Stripe API version supports this format

### **4. CDN Update** ⏳
- [ ] Wait for Vercel rebuild (currently 843 bytes - old version)
- [ ] Verify new version deployed (>1200 bytes expected)
- [ ] Test full end-to-end flow

---

## 🔧 **Possible Root Causes**

1. **Stripe Account Configuration**
   - Recurring subscriptions not enabled
   - Missing required account information
   - Account in test mode but using live keys (or vice versa)

2. **API Version Mismatch**
   - Stripe SDK version incompatibility
   - price_data.recurring format not supported in current API version

3. **Environment Variables**
   - STRIPE_SECRET_KEY missing or incorrect
   - Wrong environment (test vs live)

4. **Stripe API Error**
   - Rate limiting
   - Invalid price_data structure
   - Account restrictions

---

**Next**: Check Vercel logs and test API directly with curl to get detailed error.

