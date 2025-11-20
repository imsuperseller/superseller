# 🚨 Stripe Webhook Cleanup Required

**Date**: November 3, 2025  
**Critical Issue**: Webhook endpoint with 100% error rate

---

## ❌ **PROBLEM FOUND**

**Stripe Dashboard → Webhooks** shows:
1. ✅ `https://api.rensto.com/api/stripe/webhook` - 0% error (10 events)
2. ✅ `https://api.rensto.com/api/stripe/webhook` - 0% error (6 events) 
3. ❌ `https://api.rensto.com/webhooks/stripe` - **100% error rate** (7 events)

**The failing webhook** (`/webhooks/stripe`) is likely:
- Obsolete route that no longer exists
- Causing Stripe to retry and fail
- Potentially interfering with checkout initialization

---

## ✅ **ACTION REQUIRED**

### **Step 1: Remove Failing Webhook in Stripe Dashboard**

1. Go to: https://dashboard.stripe.com/webhooks
2. Find: `https://api.rensto.com/webhooks/stripe` (100% error rate)
3. Click **"Delete"** or **"Remove endpoint"**
4. Confirm deletion

### **Step 2: Verify Active Webhooks**

**Should only have**:
- ✅ `https://api.rensto.com/api/stripe/webhook` (0% error)

**If duplicate exists**, keep one and delete the other.

---

## 🎯 **WHY THIS MATTERS**

Stripe webhooks that consistently fail can:
- Trigger account-level rate limiting
- Cause Stripe to flag the account
- Interfere with checkout session initialization
- Block publishable key embedding in checkout pages

**Removing the failing webhook should help resolve the `apiKey is not set` error.**

---

**Status**: ⏸️ **AWAITING WEBHOOK DELETION IN STRIPE DASHBOARD**

