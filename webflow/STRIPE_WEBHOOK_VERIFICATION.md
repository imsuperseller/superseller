# ✅ Stripe Webhook Verification Checklist

**After updating webhook in Stripe Dashboard**

---

## 🔍 **QUICK VERIFICATION**

### **1. Check Webhook Configuration**

Go to: https://dashboard.stripe.com/test/webhooks

**Verify**:
- ✅ Webhook URL: `https://api.rensto.com/stripe/webhook` (or `/api/stripe/webhook` if updated)
- ✅ Status: **Enabled** (green)
- ✅ Events list includes: `checkout.session.completed` ✅ **REQUIRED**

### **2. Test Webhook Delivery**

1. On webhook page, click **"Send test webhook"**
2. Select: `checkout.session.completed`
3. Click **"Send test webhook"**
4. Check: Status = **"Succeeded"** (200 OK)

**If fails**:
- Check webhook URL is correct
- Check Vercel deployment is live
- Check Vercel logs for errors

### **3. Verify Signing Secret**

**Current**: `whsec_RGYzuYIi97YDf4KIA1InPXDakJU8CMUL`

**Check Vercel**:
1. Go to: https://vercel.com/dashboard
2. Project: `rensto-main-website` → Settings → Environment Variables
3. Verify: `STRIPE_WEBHOOK_SECRET` = `whsec_RGYzuYIi97YDf4KIA1InPXDakJU8CMUL`

**If signing secret changed** (after URL update):
- Copy new secret from Stripe
- Update Vercel environment variable
- Redeploy or wait for auto-deploy

---

## ✅ **ALL GOOD WHEN**

- [x] Webhook shows `checkout.session.completed` in events
- [x] Test webhook sends successfully (200 OK)
- [x] Signing secret matches Vercel
- [x] Ready for real checkout test

---

**Next**: Test actual checkout with test card!

