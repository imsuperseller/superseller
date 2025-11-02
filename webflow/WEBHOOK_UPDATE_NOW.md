# ✅ Update Webhook Using Stripe API Directly

**Quick script to add `checkout.session.completed` event**

---

## 🚀 **RUN THIS NOW**

```bash
cd /Users/shaifriedman/New\ Rensto/rensto
STRIPE_SECRET_KEY='sk_test_YOUR_TEST_KEY_HERE' node scripts/update-stripe-webhook.js
```

**Replace** `sk_test_YOUR_TEST_KEY_HERE` with your actual test API key.

---

## 📋 **WHAT IT DOES**

1. ✅ Fetches current webhook: `we_1SF5qCDE8rt1dEs1SbZCqETE`
2. ✅ Adds `checkout.session.completed` to events list
3. ✅ Keeps existing `payment_intent.succeeded` event
4. ✅ Updates webhook via Stripe API
5. ✅ Shows updated configuration

---

## ⚠️ **IF SIGNING SECRET CHANGES**

If the script shows signing secret changed:
- Copy the new `whsec_...` value
- Update Vercel: `STRIPE_WEBHOOK_SECRET` environment variable
- Redeploy or wait for auto-deploy

---

**Ready to run!** Just need your `sk_test_...` key! 🚀

